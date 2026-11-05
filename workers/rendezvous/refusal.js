// A socket turned away at the door. A refused handshake reaches the browser as a bare
// error with nothing attached, so a refusal completes the upgrade and then closes with
// a 4xxx code the page can read.
//
// The object decides and the stateless front of the Worker takes the socket, because
// which side holds it decides when the page hears. A socket an object accepted with
// acceptWebSocket keeps its connection after both ends have sent Close, until that
// object next goes idle about ten seconds later, and nothing the object can call
// shortens that. Chromium holds a page's close event until the connection ends or two
// seconds pass, so a dead link would read as a slow one. Here the connection ends as
// soon as the page answers. An object still holds only the sockets it has admitted.
const HEADER = "x-rendezvous-refusal";

// What an object answers in place of a socket. It only ever reaches the front of this
// Worker, which replaces it. `frame` is sent before the close for a page that reads one.
export function refusal(code, reason, frame) {
  return new Response(null, { status: 204, headers: { [HEADER]: JSON.stringify({ code, reason, frame }) } });
}

// Every answer from an object comes back through here, and anything but a refusal
// passes untouched.
export function completeRefusal(answer) {
  const refused = answer.headers.get(HEADER);
  if (refused === null) return answer;
  const { code, reason, frame } = JSON.parse(refused);
  const { 0: client, 1: server } = new WebSocketPair();
  server.accept();
  if (frame !== undefined) server.send(JSON.stringify(frame));
  server.close(code, reason);
  return new Response(null, { status: 101, webSocket: client });
}
