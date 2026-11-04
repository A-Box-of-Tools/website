// Sockets that have opened and not yet proved anything: a voice room's handshake
// and a private directory's first frame. Their own file because the directory
// and the voice rooms both ask, and the voice rooms already import the directory.
import { requestNetwork } from "../shared/address.js";

const MAX_PENDING = 4;
const MAX_PENDING_ROOM = 32;

// Which address opened a socket that has not spoken yet, for this room or
// directory only and only until it does. The digest keeps the address itself out
// of the attachment and the salt keeps one visitor from being recognisable across
// them.
export async function pendingSource(request, salt) {
  const text = `abox.tools/pending-source/v1\n${salt}\n${requestNetwork(request, "unknown")}`;
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)));
  return [...digest].map((n) => n.toString(16).padStart(2, "0")).join("");
}

// Each address has its own allowance of sockets waiting to speak. At the room's cap
// the longest-waiting socket closes rather than the newcomer being refused, so a
// host's reconnect gets through. A client authenticates within a round trip and is
// never that socket.
export function admitPending(pending, source, evict) {
  if (pending.filter((ws) => ws.deserializeAttachment().source === source).length >= MAX_PENDING) return false;
  if (pending.length >= MAX_PENDING_ROOM) {
    evict(pending.reduce((oldest, ws) => (ws.deserializeAttachment().deadline < oldest.deserializeAttachment().deadline ? ws : oldest)));
  }
  return true;
}
