/** The bounds a peer must meet before its bytes can become a download. */

const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const fileId = (value) => typeof value === 'string' && value.length > 0 && value.length <= 128;
const fileSize = (value, maxSize) => Number.isSafeInteger(value) && value >= 0 && value <= maxSize;
const limit = (value) => Number.isSafeInteger(value) && value >= 0;
const MAX_PARTS = 16384;

// The remote list is a claim rather than a File object. Keep both the work
// spent reading it and the sizes offered for download inside this page's cap.
export function cleanFileList(list, maxSize) {
  if (!Array.isArray(list) || !limit(maxSize)) return [];
  const files = [];
  const ids = new Set();
  for (const entry of list.slice(0, 256)) {
    if (!object(entry) || !fileId(entry.id) || ids.has(entry.id)) continue;
    if (typeof entry.name !== 'string' || entry.name.length > 255 || !fileSize(entry.size, maxSize)) continue;
    ids.add(entry.id);
    files.push({ id: entry.id, name: entry.name, size: entry.size });
  }
  return files;
}

function receiver(rx, maxSize) {
  return object(rx) && limit(maxSize) && fileId(rx.id) && fileSize(rx.size, maxSize)
    && Array.isArray(rx.parts) && Number.isSafeInteger(rx.got) && rx.got >= 0 && rx.got <= rx.size;
}

// A begin marker cannot replace the size the reader agreed to receive. An
// untrusted peer could otherwise turn a small request into an unbounded Blob.
export function beginFile(rx, msg, maxSize) {
  if (!receiver(rx, maxSize) || rx.begun === true || rx.got !== 0 || rx.parts.length !== 0) return false;
  if (!object(msg) || msg.id !== rx.id || msg.size !== rx.size) return false;
  if (typeof msg.mime !== 'string' || msg.mime.length > 255) return false;
  rx.mime = msg.mime;
  rx.begun = true;
  return true;
}

export function appendFileChunk(rx, buf, maxSize) {
  if (!receiver(rx, maxSize) || rx.begun !== true || !(buf instanceof ArrayBuffer)) return false;
  // Empty chunks spend no byte budget but still allocate an entry, so a peer
  // could otherwise grow the parts array without ever reaching the size cap.
  if (buf.byteLength === 0) return false;
  // A byte cap alone still permits millions of one-byte ArrayBuffers. Honest
  // transfers use at most 3,200 chunks for 200 MiB, leaving ample room here.
  if (rx.parts.length >= MAX_PARTS) return false;
  const next = rx.got + buf.byteLength;
  if (next > rx.size || next > maxSize) return false;
  rx.parts.push(buf);
  rx.got = next;
  return true;
}

// Ordered delivery alone does not prove completion: the sender still chooses
// its markers. Download only the requested file, with every declared byte.
export function finishFile(rx, msg) {
  if (!object(rx) || rx.begun !== true || !object(msg) || !fileId(rx.id) || msg.id !== rx.id) return false;
  if (!Number.isSafeInteger(rx.size) || rx.size < 0 || rx.got !== rx.size || !Array.isArray(rx.parts)) return false;
  rx.begun = false;
  return true;
}
