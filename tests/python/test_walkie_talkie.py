"""Keep the LAN helper's room lifecycle and HTTP boundaries executable in CI."""

from email.message import Message
from http.client import HTTPConnection
import importlib.util
import io
from pathlib import Path
import tempfile
import threading
from types import SimpleNamespace
import unittest
from unittest import mock
import uuid
from contextlib import redirect_stderr
import json


ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location(
    "walkie_talkie_helper", ROOT / "tools/walkie-talkie/local/helper.py")
helper = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(helper)


def new_id():
    return str(uuid.uuid4())


def description(kind, connection=None):
    return {"type": kind, "connection": connection or new_id(),
            "sdp": "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n"}


class RoomLifecycle(unittest.TestCase):
    def setUp(self):
        self.now = 100
        self.clock = mock.patch.object(helper.time, "monotonic", side_effect=lambda: self.now)
        self.clock.start()
        self.addCleanup(self.clock.stop)
        self.state = helper.State(ROOT, 8765)
        self.start()
        self.listener_id = new_id()
        self.join(self.listener_id)

    def start(self):
        return self.state.call("/api/host/start", "host", {})

    def join(self, listener_id):
        return self.state.call("/api/listener/join", "listener", {"id": listener_id})

    def signal(self, role, value):
        return self.state.call("/api/signal", role, {
            "id": self.listener_id, "generation": self.state.generation, "payload": value})

    def listen(self, ack=0, generation=None):
        return self.state.call("/api/listener/poll", "listener", {
            "id": self.listener_id, "ack": ack,
            "generation": self.state.generation if generation is None else generation})

    def host_poll(self, ack=0, generation=None):
        return self.state.call("/api/host/poll", "host", {
            "generation": self.state.generation if generation is None else generation,
            "ack": ack, "talking": False})

    def assert_problem(self, error, action):
        with self.assertRaises(helper.Problem) as caught:
            action()
        self.assertEqual(caught.exception.error, error)

    def test_delivery_survives_lost_poll_response_and_duplicate_join(self):
        offer = description("offer")
        self.signal("host", offer)
        first = self.listen()["messages"]
        self.assertEqual(first[0]["payload"], offer)
        self.join(self.listener_id)
        self.assertEqual(self.listen()["messages"], first)
        self.assertEqual(self.listen(first[0]["seq"])["messages"], [])
        self.assert_problem("invalid", lambda: self.listen(first[0]["seq"] + 1))

    def test_restart_preserves_invitation_and_does_not_alias_old_ack(self):
        tokens = self.state.host_token, self.state.listen_token
        old_generation = self.state.generation
        self.signal("host", description("offer"))
        old_listener_seq = self.listen()["messages"][0]["seq"]
        self.signal("listener", description("answer"))
        old_host_seq = self.host_poll()["messages"][0]["seq"]
        self.start()
        self.assertEqual((self.state.host_token, self.state.listen_token), tokens)
        self.assertGreater(self.state.generation, old_generation)
        self.assert_problem("stale", lambda: self.signal("host", description("offer")))
        self.join(self.listener_id)
        self.signal("host", description("offer"))
        self.signal("listener", description("answer"))
        # A receiver that wakes after a restart must learn the generation first.
        stale = self.listen(2**40, old_generation)
        self.assertEqual(stale["generation"], self.state.generation)
        self.assertEqual(stale["messages"], [])
        current = self.listen()["messages"]
        self.assertGreater(current[0]["seq"], old_listener_seq)
        self.assert_problem("stale", lambda: self.host_poll(2**40, old_generation))
        self.assertGreater(self.host_poll()["messages"][0]["seq"], old_host_seq)

    def test_temporary_loss_and_deliberate_end_have_distinct_states(self):
        generation = self.state.generation
        self.now += helper.HOST_TIMEOUT + 1
        lost = self.listen()
        self.assertFalse(lost["online"])
        self.assertFalse(lost["ended"])
        recovered = self.host_poll()
        self.assertTrue(recovered["online"])
        self.assertEqual(recovered["generation"], generation)
        self.state.call("/api/host/end", "host", {"generation": generation})
        ended = self.listen()
        self.assertFalse(ended["online"])
        self.assertTrue(ended["ended"])
        self.assert_problem("ended", lambda: self.join(new_id()))
        self.assertTrue(self.start()["online"])

    def test_stale_host_cannot_end_a_replacement(self):
        old = self.state.generation
        self.start()
        self.assert_problem("stale", lambda: self.state.call(
            "/api/host/end", "host", {"generation": old}))
        self.assertTrue(self.state.snapshot()["online"])

    def test_capacity_and_expiry_release_old_connections(self):
        for _ in range(helper.MAX_LISTENERS - 1):
            self.join(new_id())
        self.assert_problem("full", lambda: self.join(new_id()))
        self.signal("listener", description("answer"))
        self.now += helper.LISTENER_TTL + 1
        host = self.host_poll()
        self.assertEqual(host["listeners"], [])
        self.assertEqual(host["messages"], [])
        self.assert_problem("unknown", self.listen)
        self.assertTrue(self.join(new_id())["online"])

    def test_leave_discards_pending_messages_and_is_idempotent(self):
        self.signal("listener", description("answer"))
        for _ in range(2):
            self.state.call("/api/listener/leave", "listener", {"id": self.listener_id})
        self.assertEqual(self.host_poll()["messages"], [])
        self.assert_problem("unknown", self.listen)

    def test_queue_limits_fail_explicitly_instead_of_losing_messages(self):
        with mock.patch.object(helper, "MAX_QUEUE", 2):
            self.signal("host", description("offer"))
            self.signal("host", description("offer"))
            self.assert_problem("busy", lambda: self.signal("host", description("offer")))
            pending = self.listen()["messages"]
            self.assertEqual(len(pending), 2)
            self.listen(pending[0]["seq"])
            self.signal("host", description("offer"))
            self.assertEqual(len(self.listen(pending[0]["seq"])["messages"]), 2)

    def test_role_and_connection_validation_prevent_wrong_direction_signals(self):
        self.assert_problem("unauthorized", lambda: self.state.call(
            "/api/host/start", "listener", {}))
        self.assert_problem("unauthorized", lambda: self.state.call(
            "/api/listener/join", "host", {"id": new_id()}))
        self.assert_problem("invalid", lambda: self.signal("listener", description("offer")))
        self.assert_problem("invalid", lambda: self.signal("host", description("answer")))
        bad = description("offer")
        bad["connection"] = "another browser"
        self.assert_problem("invalid", lambda: self.signal("host", bad))
        candidate = {"type": "candidate", "connection": new_id(), "candidate": {
            "candidate": "candidate:1 1 UDP 2122260223 peer.local 12345 typ host",
            "sdpMid": "0", "sdpMLineIndex": True}}
        self.assert_problem("invalid", lambda: self.signal("listener", candidate))
        candidate["candidate"]["sdpMLineIndex"] = 0
        self.signal("listener", candidate)
        self.assertEqual(self.host_poll()["messages"][0]["payload"], candidate)


class HttpBoundaries(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name) / "bundle"
        self.root.mkdir()
        (self.root / "src").mkdir()
        (self.root / "index.html").write_bytes(b"<main>LAN voice</main>\n")
        (self.root / "site.css").write_bytes(b"body { color: black; }\n")
        (self.root / "helper.py").write_bytes(b"not a downloadable static asset\n")
        self.server = helper.Server(("127.0.0.1", 0), helper.Handler)
        self.port = self.server.server_address[1]
        self.server.state = helper.State(self.root, self.port)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.addCleanup(self.close_server)

    def close_server(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(5)

    def request(self, method, path, role="host", body=None, headers=None):
        fields = {}
        if role is not None:
            token = (self.server.state.host_token if role == "host" else
                     self.server.state.listen_token if role == "listener" else role)
            fields["Authorization"] = f"Bearer {token}"
        raw = None if body is None else json.dumps(body).encode("utf-8")
        if raw is not None:
            fields["Content-Type"] = "application/json"
        fields.update(headers or {})
        connection = HTTPConnection("127.0.0.1", self.port, timeout=5)
        try:
            connection.request(method, path, body=raw, headers=fields)
            response = connection.getresponse()
            data = response.read()
            if response.getheader("Content-Type", "").startswith("application/json"):
                data = json.loads(data)
            return response.status, data
        finally:
            connection.close()

    def test_auth_and_roles_are_enforced_by_actual_http_requests(self):
        for role in (None, "wrong token"):
            status, result = self.request("GET", "/api/config", role)
            self.assertEqual(status, 401)
            self.assertEqual(result["error"], "unauthorized")
        status, result = self.request("POST", "/api/host/start", "listener", {})
        self.assertEqual((status, result["error"]), (403, "unauthorized"))
        status, host = self.request("POST", "/api/host/start", body={})
        self.assertEqual(status, 200)
        listener_id = new_id()
        status, joined = self.request("POST", "/api/listener/join", "listener", {"id": listener_id})
        self.assertEqual(status, 200)
        self.assertEqual(joined["generation"], host["generation"])
        self.assertTrue(joined["online"])
        status, listeners = self.request("POST", "/api/host/poll", body={
            "generation": host["generation"], "ack": 0, "talking": False})
        self.assertEqual(listeners["listeners"], [listener_id])

    def test_config_exposes_listener_invitation_only_to_the_host(self):
        self.server.state.addresses.append("192.168.1.20")
        _, host = self.request("GET", "/api/config")
        _, listener = self.request("GET", "/api/config", "listener")
        self.assertEqual(host["role"], "host")
        self.assertEqual(host["urls"], [
            f"http://192.168.1.20:{self.port}/#listen={self.server.state.listen_token}"])
        self.assertNotIn("urls", listener)
        self.assertNotIn(self.server.state.host_token, json.dumps(host))
        for token in (self.server.state.host_token, self.server.state.listen_token):
            self.assertRegex(token, r"^[A-Za-z0-9_-]{43}$")

    def test_localhost_is_supported_and_foreign_hosts_origins_are_rejected(self):
        good = {"Host": f"localhost:{self.port}", "Origin": f"http://LOCALHOST:{self.port}"}
        self.assertEqual(self.request("GET", "/api/config", headers=good)[0], 200)
        self.assertEqual(self.request("GET", "/api/config", headers={
            "Host": f"attacker.example:{self.port}"})[0], 400)
        self.assertEqual(self.request("GET", "/api/config", headers={
            "Origin": f"http://localhost:{self.port}"})[0], 403)
        self.assertEqual(self.request("GET", "/api/config", headers={"Origin": "null"})[0], 403)

    def test_malformed_bodies_are_rejected_and_errors_include_current_generation(self):
        _, started = self.request("POST", "/api/host/start", body={})
        status, stale = self.request("POST", "/api/host/end", body={
            "generation": started["generation"] - 1})
        self.assertEqual((status, stale["error"]), (409, "stale"))
        self.assertEqual(stale["generation"], started["generation"])
        self.assertEqual(self.request("POST", "/api/host/start", body=[])[0], 400)
        self.assertEqual(self.request("POST", "/api/host/start", body={}, headers={
            "Content-Type": "text/plain"})[0], 415)

    def test_static_files_do_not_expose_helper_directories_or_traversal(self):
        self.assertEqual(self.request("GET", "/site.css", role=None),
                         (200, b"body { color: black; }\n"))
        for path in ("/helper.py", "/src/"):
            self.assertEqual(self.request("GET", path, role=None)[0], 404)
        for path in ("/../helper.py", "/src/%2e%2e/helper.py", "/src/%5chelper.py"):
            self.assertEqual(self.request("GET", path, role=None)[0], 400)

    def test_static_symlink_is_not_followed(self):
        outside = Path(self.directory.name) / "outside.js"
        outside.write_bytes(b"private\n")
        try:
            (self.root / "src/link.js").symlink_to(outside)
        except OSError:
            self.skipTest("This host does not permit creating symlinks.")
        self.assertEqual(self.request("GET", "/src/link.js", role=None)[0], 404)


class AddressBoundaries(unittest.TestCase):
    def handler(self, port=80, host="localhost", origin=None, address="127.0.0.1"):
        handler = object.__new__(helper.Handler)
        handler.headers = Message()
        handler.headers["Host"] = host
        if origin is not None:
            handler.headers["Origin"] = origin
        handler.server = SimpleNamespace(state=helper.State(ROOT, port))
        handler.client_address = (address, 12345)
        handler.path = "/api/config"
        return handler

    def test_default_http_port_and_authority_case_are_normalized(self):
        self.assertEqual(self.handler(origin="http://LOCALHOST:80").guard(), "/api/config")
        self.assertEqual(self.handler(host="localhost:80", origin="http://localhost").guard(), "/api/config")
        with self.assertRaises(helper.Problem):
            self.handler(host="localhost:0").guard()

    def test_public_clients_and_remote_host_capabilities_are_refused(self):
        with self.assertRaises(helper.Problem) as caught:
            self.handler(address="8.8.8.8").guard()
        self.assertEqual(caught.exception.status, 403)
        remote = self.handler(address="192.168.1.20")
        remote.headers["Authorization"] = f"Bearer {remote.server.state.host_token}"
        with self.assertRaises(helper.Problem) as caught:
            remote.role()
        self.assertEqual(caught.exception.status, 403)

    def test_public_bind_override_fails_before_a_server_is_created(self):
        with mock.patch("sys.argv", ["helper.py", "--address", "0.0.0.0"]), \
                mock.patch.object(helper, "Server") as server, redirect_stderr(io.StringIO()):
            with self.assertRaises(SystemExit) as caught:
                helper.main()
        self.assertEqual(caught.exception.code, 2)
        server.assert_not_called()


if __name__ == "__main__":
    unittest.main()
