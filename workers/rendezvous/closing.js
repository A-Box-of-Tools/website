// A page that closes its socket first then waits for a Close frame back, and the runtime
// does not send one for a socket accepted with acceptWebSocket. Unanswered, the connection
// stays up until the object next goes idle about ten seconds later, and the page's close
// event then reports an unclean 1006. The answer carries no code: a page that sent none
// arrives here as 1005 and a lost one as 1006, neither of which can be sent, and a page's
// own close is the one close nothing reads the code of. When the object closed first this
// does nothing, because the runtime ignores a second close.
export function answerClose(ws) {
  try { ws.close(); } catch {}
}
