#!/usr/bin/env python3
"""Serve the downloaded LAN voice bundle; retain signaling, never audio.

The room exists for this process's lifetime. Restarting the helper creates new
invitations. Reloading the host page starts a fresh generation in the same room.
"""

import argparse
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import ipaddress
import json
from pathlib import Path
import secrets
import socket
import threading
import time
from urllib.parse import unquote, urlsplit
import uuid

HOST_TIMEOUT = 6
LISTENER_TTL = 15
MAX_LISTENERS = 10
MAX_BODY = 64 * 1024
MAX_PAYLOAD = 32 * 1024
MAX_QUEUE = 128
MAX_QUEUE_BYTES = 256 * 1024
LAN_NETWORKS = tuple(ipaddress.ip_network(n) for n in (
    "10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "169.254.0.0/16"))
STATIC_FILES = {
    "index.html", "styles.css", "site.css", "icon-192.png", "icon-512.png",
    "icon.svg", "icon.png", "favicon.ico", "favicon.svg",
}
MIME = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
        ".js": "text/javascript; charset=utf-8", ".png": "image/png",
        ".svg": "image/svg+xml", ".ico": "image/vnd.microsoft.icon"}


class Problem(Exception):
    def __init__(self, error, status=400):
        self.error, self.status = error, status


def require(condition, error="invalid", status=400):
    if not condition:
        raise Problem(error, status)


def integer(value):
    return type(value) is int and 0 <= value <= 2**53 - 1


def identifier(value):
    require(isinstance(value, str) and len(value) == 36)
    try:
        require(str(uuid.UUID(value)) == value)
    except (ValueError, AttributeError):
        raise Problem("invalid") from None
    return value


def schema(body, fields):
    require(isinstance(body, dict) and set(body) == set(fields))


def lan_address(value):
    try:
        address = ipaddress.ip_address(value)
        return isinstance(address, ipaddress.IPv4Address) and any(
            address in network for network in LAN_NETWORKS)
    except ValueError:
        return False


def payload(value, role):
    require(isinstance(value, dict))
    kind = value.get("type")
    require(kind in (("offer", "candidate") if role == "host"
                     else ("answer", "candidate")))
    identifier(value.get("connection"))
    if kind in ("offer", "answer"):
        schema(value, ("type", "connection", "sdp"))
        require(isinstance(value["sdp"], str) and 0 < len(value["sdp"]) <= 30000)
    else:
        schema(value, ("type", "connection", "candidate"))
        candidate = value["candidate"]
        if candidate is not None:
            require(isinstance(candidate, dict) and "candidate" in candidate)
            require(set(candidate) <= {
                "candidate", "sdpMid", "sdpMLineIndex", "usernameFragment"})
            require(isinstance(candidate["candidate"], str)
                    and len(candidate["candidate"]) <= 4096)
            for name in ("sdpMid", "usernameFragment"):
                field = candidate.get(name)
                require(field is None or isinstance(field, str) and len(field) <= 256)
            field = candidate.get("sdpMLineIndex")
            require(field is None or integer(field) and field <= 255)
    require(len(json.dumps(value, ensure_ascii=False).encode("utf-8")) <= MAX_PAYLOAD)
    return value


class Queue:
    def __init__(self):
        self.sequence = 0
        self.items = deque()
        self.bytes = 0

    def clear(self):
        # Sequence numbers survive generations, so a late ack cannot alias new data.
        self.items.clear()
        self.bytes = 0

    def acknowledge(self, ack):
        require(integer(ack) and ack <= self.sequence)
        while self.items and self.items[0][0]["seq"] <= ack:
            self.bytes -= self.items.popleft()[1]

    def remove(self, listener_id):
        self.items = deque(pair for pair in self.items
                           if pair[0]["id"] != listener_id)
        self.bytes = sum(pair[1] for pair in self.items)

    def push(self, listener_id, signal):
        message = {"seq": self.sequence + 1, "id": listener_id, "payload": signal}
        size = len(json.dumps(message, ensure_ascii=False).encode("utf-8"))
        require(len(self.items) < MAX_QUEUE and self.bytes + size <= MAX_QUEUE_BYTES,
                "busy", 429)
        self.sequence += 1
        self.items.append((message, size))
        self.bytes += size

    def pending(self):
        return [pair[0] for pair in self.items]


class State:
    def __init__(self, root, port):
        self.root, self.port = root, port
        self.lock = threading.RLock()
        self.host_token, self.listen_token = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        self.addresses = ["127.0.0.1", "localhost"]
        self.generation = 0
        self.started = self.ended = self.talking = False
        self.heartbeat = 0
        self.listeners = {}
        self.host_queue = Queue()

    def prune(self, now):
        for listener_id, listener in list(self.listeners.items()):
            if now - listener["heartbeat"] > LISTENER_TTL:
                del self.listeners[listener_id]
                self.host_queue.remove(listener_id)

    def status(self, now):
        online = self.started and not self.ended and now - self.heartbeat <= HOST_TIMEOUT
        return {"generation": self.generation, "online": online,
                "ended": self.ended, "talking": online and self.talking}

    def snapshot(self):
        with self.lock:
            return self.status(time.monotonic())

    def current(self, value):
        require(integer(value))
        require(value == self.generation, "stale", 409)

    def available(self, now):
        require(not self.ended, "ended", 409)
        require(self.status(now)["online"], "offline", 409)

    def call(self, route, role, body):
        with self.lock:
            now = time.monotonic()
            self.prune(now)
            if route == "/api/config":
                result = self.status(now) | {"role": role}
                if role == "host":
                    result["urls"] = [f"http://{address}:{self.port}/#listen={self.listen_token}"
                                      for address in self.addresses
                                      if address not in ("127.0.0.1", "localhost")]
                return result
            if route.startswith("/api/host/"):
                require(role == "host", "unauthorized", 403)
            if route.startswith("/api/listener/"):
                require(role == "listener", "unauthorized", 403)
            if route == "/api/host/start":
                schema(body, ())
                self.generation += 1
                self.started, self.ended, self.talking = True, False, False
                self.heartbeat = now
                self.host_queue.clear()
                for listener in self.listeners.values():
                    listener["queue"].clear()
            elif route == "/api/host/poll":
                schema(body, ("generation", "ack", "talking"))
                self.current(body["generation"])
                require(type(body["talking"]) is bool)
                require(self.started and not self.ended, "ended" if self.ended else "offline", 409)
                self.host_queue.acknowledge(body["ack"])
                self.heartbeat, self.talking = now, body["talking"]
                return self.status(now) | {
                    "listeners": [key for key, value in self.listeners.items()
                                  if value["generation"] == self.generation],
                    "messages": self.host_queue.pending()}
            elif route == "/api/host/end":
                schema(body, ("generation",))
                self.current(body["generation"])
                self.ended, self.talking = True, False
                self.host_queue.clear()
                for listener in self.listeners.values():
                    listener["queue"].clear()
            elif route == "/api/listener/join":
                schema(body, ("id",))
                listener_id = identifier(body["id"])
                self.available(now)
                listener = self.listeners.get(listener_id)
                if listener is None:
                    require(len(self.listeners) < MAX_LISTENERS, "full", 409)
                    listener = {"queue": Queue(), "generation": self.generation}
                    self.listeners[listener_id] = listener
                elif listener["generation"] != self.generation:
                    listener["queue"].clear()
                    listener["generation"] = self.generation
                listener["heartbeat"] = now
                return self.status(now) | {"id": listener_id}
            elif route == "/api/listener/poll":
                schema(body, ("id", "ack", "generation"))
                listener_id = identifier(body["id"])
                require(integer(body["generation"]) and integer(body["ack"]))
                listener = self.listeners.get(listener_id)
                require(listener is not None, "unknown", 404)
                listener["heartbeat"] = now
                if body["generation"] != self.generation or listener["generation"] != self.generation:
                    return self.status(now) | {"messages": []}
                listener["queue"].acknowledge(body["ack"])
                return self.status(now) | {"messages": listener["queue"].pending()
                                          if self.status(now)["online"] else []}
            elif route == "/api/signal":
                schema(body, ("id", "generation", "payload"))
                listener_id = identifier(body["id"])
                self.current(body["generation"])
                self.available(now)
                listener = self.listeners.get(listener_id)
                require(listener is not None, "unknown", 404)
                require(listener["generation"] == self.generation, "stale", 409)
                signal = payload(body["payload"], role)
                queue = listener["queue"] if role == "host" else self.host_queue
                queue.push(listener_id, signal)
                if role == "listener":
                    listener["heartbeat"] = now
            elif route == "/api/listener/leave":
                schema(body, ("id",))
                listener_id = identifier(body["id"])
                self.listeners.pop(listener_id, None)
                self.host_queue.remove(listener_id)
            else:
                raise Problem("missing", 404)
            return self.status(now)


class Handler(BaseHTTPRequestHandler):
    server_version, sys_version = "LAN voice", ""

    def setup(self):
        super().setup()
        self.connection.settimeout(5)

    def log_message(self, *args):
        # Invitations are capabilities; ordinary request logs must never retain them.
        pass

    def guard(self):
        address = ipaddress.ip_address(self.client_address[0])
        require(address.is_loopback or lan_address(str(address)), "unauthorized", 403)
        hosts = self.headers.get_all("Host", [])
        require(len(hosts) == 1)
        host = self.authority(hosts[0])
        require(host[0] in self.server.state.addresses and host[1] == self.server.state.port)
        origins = self.headers.get_all("Origin", [])
        require(len(origins) <= 1, "unauthorized", 403)
        if origins:
            origin = urlsplit(origins[0])
            require(origin.scheme == "http" and not origin.path
                    and not origin.query and not origin.fragment, "unauthorized", 403)
            require(self.authority(origin.netloc) == host, "unauthorized", 403)
        require(self.path.startswith("/") and "\\" not in self.path)
        parsed = urlsplit(self.path)
        require(not parsed.scheme and not parsed.netloc and not parsed.fragment)
        path = unquote(parsed.path, errors="strict")
        require("%" not in path and "\\" not in path and "\x00" not in path)
        require(not any(part in (".", "..") for part in path.split("/")))
        if path.startswith("/api/"):
            require(not parsed.query)
        return path

    def authority(self, value):
        require(value and value.isascii() and value == value.strip() and "\\" not in value)
        parsed = urlsplit("//" + value)
        require(parsed.hostname and parsed.username is None and parsed.password is None
                and not parsed.path and not parsed.query and not parsed.fragment)
        return parsed.hostname, 80 if parsed.port is None else parsed.port

    def role(self):
        values = self.headers.get_all("Authorization", [])
        require(len(values) == 1, "unauthorized", 401)
        value = values[0]
        require(value.isascii() and value.startswith("Bearer ") and len(value) < 128,
                "unauthorized", 401)
        token, state = value[7:], self.server.state
        if secrets.compare_digest(token, state.host_token):
            require(ipaddress.ip_address(self.client_address[0]).is_loopback,
                    "unauthorized", 403)
            return "host"
        require(secrets.compare_digest(token, state.listen_token), "unauthorized", 401)
        return "listener"

    def body(self):
        require(not self.headers.get("Transfer-Encoding"))
        lengths = self.headers.get_all("Content-Length", [])
        require(len(lengths) == 1 and lengths[0].isascii() and lengths[0].isdigit())
        size = int(lengths[0])
        require(0 < size <= MAX_BODY, "invalid", 413 if size > MAX_BODY else 400)
        require(self.headers.get_content_type() == "application/json", "invalid", 415)
        raw = self.rfile.read(size)
        require(len(raw) == size)
        value = json.loads(raw.decode("utf-8"))
        require(isinstance(value, dict))
        return value

    def send(self, code, data, content_type="application/json; charset=utf-8"):
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Content-Security-Policy", "default-src 'self'; script-src 'self'; "
                         "style-src 'self'; connect-src 'self'; img-src 'self' data:; "
                         "media-src 'self' blob:; object-src 'none'; base-uri 'none'; "
                         "frame-ancestors 'none'")
        microphone = "(self)" if ipaddress.ip_address(self.client_address[0]).is_loopback else "()"
        self.send_header("Permissions-Policy", f"microphone={microphone}, camera=(), geolocation=()")
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(data)

    def reply(self, code, value):
        self.send(code, json.dumps(value, ensure_ascii=False, separators=(",", ":")).encode("utf-8"))

    def static(self, path):
        name = "index.html" if path == "/" else path[1:]
        parts = name.split("/")
        require(all(parts), "missing", 404)
        require(name in STATIC_FILES or parts[0] == "src" and name.endswith(".js"), "missing", 404)
        root, target = self.server.state.root, self.server.state.root
        require(not root.is_symlink()
                and not getattr(root, "is_junction", lambda: False)(), "missing", 404)
        for part in parts:
            target = target / part
            require(not target.is_symlink()
                    and not getattr(target, "is_junction", lambda: False)(), "missing", 404)
        require(target.resolve().is_relative_to(root.resolve()) and target.is_file(), "missing", 404)
        require(target.stat().st_size <= 2 * 1024 * 1024, "missing", 404)
        self.send(200, target.read_bytes(), MIME[target.suffix])

    def dispatch(self):
        try:
            path = self.guard()
            if self.command in ("GET", "HEAD"):
                if path == "/api/config":
                    self.reply(200, self.server.state.call(path, self.role(), {}))
                else:
                    self.static(path)
            elif self.command == "POST" and path.startswith("/api/"):
                role = self.role()
                self.reply(200, self.server.state.call(path, role, self.body()))
            else:
                raise Problem("invalid", 405)
        except Problem as problem:
            self.reply(problem.status, self.server.state.snapshot() | {"error": problem.error})
        except (ValueError, UnicodeError, OSError, RecursionError):
            self.reply(400, self.server.state.snapshot() | {"error": "invalid"})

    do_GET = do_HEAD = do_POST = do_OPTIONS = do_PUT = do_DELETE = do_PATCH = dispatch

    def send_error(self, code, message=None, explain=None):
        self.reply(code, {"error": "invalid"})


class Server(ThreadingHTTPServer):
    daemon_threads = True
    block_on_close = False

    def handle_error(self, request, client_address):
        pass


def discover():
    # Hostname lookup avoids using a public service to guess the LAN interface.
    try:
        return sorted({item[4][0] for item in socket.getaddrinfo(
            socket.gethostname(), None, socket.AF_INET, socket.SOCK_STREAM)
                       if lan_address(item[4][0])})
    except OSError:
        return []


def main():
    parser = argparse.ArgumentParser(description="Run the downloaded LAN walkie-talkie bundle.")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--address", help="Select one private IPv4 interface when discovery is ambiguous.")
    args = parser.parse_args()
    if not 1 <= args.port <= 65535:
        parser.error("--port must be between 1 and 65535")
    if args.address and not lan_address(args.address):
        parser.error("--address must be a private LAN IPv4 address")
    servers, running = [], []
    state = State(Path(__file__).absolute().parent, args.port)
    try:
        for address in ["127.0.0.1"] + ([args.address] if args.address else discover()):
            try:
                server = Server((address, args.port), Handler)
            except OSError:
                if address == "127.0.0.1" or args.address:
                    raise
                continue
            server.state = state
            servers.append(server)
            if address != "127.0.0.1":
                state.addresses.append(address)
        print("Open this private host invitation on this computer:")
        print(f"http://localhost:{args.port}/#host={state.host_token}")
        if len(state.addresses) == 2:
            print("No LAN interface was found. Restart with --address and this computer's private IPv4 address.")
        print("Keep this window open. Press Ctrl+C to stop. Restarting creates a new invitation.")
        for server in servers:
            threading.Thread(target=server.serve_forever, daemon=True).start()
            running.append(server)
        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        return 0
    except OSError:
        print("The local address or port could not be opened. Choose another --port or --address.")
        return 1
    finally:
        for server in running:
            server.shutdown()
        for server in servers:
            server.server_close()


if __name__ == "__main__":
    raise SystemExit(main())
