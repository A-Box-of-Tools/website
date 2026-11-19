/**
 * What crosses the control channel about a folder: one row per file, sent in
 * parts. A peer's rows are claims about somebody else's disk, so every one is
 * checked here before it can name a file this page will write or read.
 */
import { validPath } from './paths.js';

// Comparing two folders means holding both listings, and a listing is a few
// megabytes at this size. A folder past it is refused rather than half-read.
export const MAX_FILES = 50000;
// Control frames travel as UTF-8. Measuring in bytes keeps a part of Chinese
// or Japanese names as far under the frame cap as a part of English ones.
export const PART_BYTES = 32 * 1024;
const encoder = new TextEncoder();
// The year 275760, the furthest Date can represent.
const MAX_TIME = 8.64e15;

export function splitParts(rows, limit = PART_BYTES) {
  const parts = [];
  let part = [], bytes = 2;
  for (const row of rows) {
    const size = encoder.encode(JSON.stringify(row)).length + 1;
    if (part.length && bytes + size > limit) {
      parts.push(part);
      part = [];
      bytes = 2;
    }
    part.push(row);
    bytes += size;
  }
  // An empty folder still sends one part, so the far side hears it is done.
  parts.push(part);
  return parts;
}

export function listRows(entries) {
  return [...entries.values()].map((entry) => [entry.key, entry.size, entry.mtime]);
}

const size = (value) => Number.isSafeInteger(value) && value >= 0;
const time = (value) => Number.isSafeInteger(value) && value >= 0 && value <= MAX_TIME;

/** [path, size, modified] rows into `into`. One bad or repeated row refuses the whole part. */
export function readListRows(part, into, limit = MAX_FILES) {
  if (!Array.isArray(part)) return false;
  for (const row of part) {
    if (!Array.isArray(row) || row.length !== 3 || !validPath(row[0]) || !size(row[1]) || !time(row[2])) return false;
    if (into.has(row[0]) || into.size >= limit) return false;
    into.set(row[0], { key: row[0], path: row[0], size: row[1], mtime: row[2] });
  }
  return true;
}

/** Paths a peer asks this side to fingerprint. */
export function readKeyRows(part, into, limit = MAX_FILES) {
  if (!Array.isArray(part)) return false;
  for (const key of part) {
    if (!validPath(key) || into.has(key) || into.size >= limit) return false;
    into.add(key);
  }
  return true;
}

/** [path, fingerprint] rows; null is a file the peer could not read. */
export function readHashRows(part, into, limit = MAX_FILES) {
  if (!Array.isArray(part)) return false;
  for (const row of part) {
    if (!Array.isArray(row) || row.length !== 2 || !validPath(row[0])
        || !(row[1] === null || (typeof row[1] === 'string' && /^[a-f0-9]{64}$/.test(row[1])))) return false;
    if (into.has(row[0]) || into.size >= limit) return false;
    into.set(row[0], row[1]);
  }
  return true;
}

/** [path, destination] rows of a sync, the destination being the side that receives. */
export function readActionRows(part, into, limit = MAX_FILES) {
  if (!Array.isArray(part)) return false;
  for (const row of part) {
    if (!Array.isArray(row) || row.length !== 2 || !validPath(row[0]) || (row[1] !== 'host' && row[1] !== 'guest')) return false;
    if (into.has(row[0]) || into.size >= limit) return false;
    into.set(row[0], row[1]);
  }
  return true;
}
