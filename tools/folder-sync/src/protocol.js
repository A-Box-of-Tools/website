import { CODE_PATTERN as ROOM_CODE_PATTERN } from './shared/room-names.js';
import { validAdmissionToken } from './shared/peer-admission.js';

// A sync invitation must never join another tool's identically named room.
export const TOOL = 'folder-sync';
export const PROTOCOL = 'folder-sync-v1';
export const CHANNEL = 'folder-sync-control';
// One lane per sync run and direction. A frame still in flight from a
// cancelled run dies with its lane instead of landing in the next run's file.
export const FILES = 'folder-sync-files:';
export const CODE_PATTERN = /^sync-[a-z2-7]{16}$/;
export const LANE_PATTERN = /^folder-sync-files:[a-f0-9]{32}$/;
export const MODES = ['both', 'send', 'receive'];
// Control frames carry listings in parts of 32 KiB of UTF-8, so a frame
// longer than this is not one this page sent.
const MAX_CONTROL = 65536;

export function makeCode(random = globalThis.crypto) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
  const bytes = random.getRandomValues(new Uint8Array(16));
  return `sync-${Array.from(bytes, (byte) => alphabet[byte & 31]).join('')}`;
}

export function makeRunId(random = globalThis.crypto) {
  return Array.from(random.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function parseCode(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  let code = value.trim();
  if (/^https?:\/\//i.test(code)) {
    try { code = new URL(code).hash.slice(1); } catch { return null; }
  }
  code = code.replace(/^#/, '').toLowerCase();
  return ROOM_CODE_PATTERN.test(code) && CODE_PATTERN.test(code) ? code : null;
}

export function inviteLink(href, code) {
  if (typeof code !== 'string' || !CODE_PATTERN.test(code)) throw new Error('code.invalid');
  const url = new URL(href);
  url.search = '';
  url.hash = code;
  return url.href;
}

const count = (value) => Number.isSafeInteger(value) && value >= 0;
const generation = (value) => Number.isSafeInteger(value) && value >= 1;
const generations = (value) => Array.isArray(value) && value.length === 2 && value.every(generation);
const run = (value) => typeof value === 'string' && /^[a-f0-9]{32}$/.test(value);
const part = (value) => Array.isArray(value);
const done = (value) => typeof value === 'boolean';
const REFUSALS = new Set(['busy', 'stale', 'permission', 'invalid']);

// The shape of every frame. What a part's rows may contain is listing.js's
// to decide, row by row, before anything is kept.
const SHAPES = {
  hello: () => true,
  request: (m) => typeof m.note === 'string' && m.note.length <= 80,
  approved: () => true,
  'approval-ack': () => true,
  denied: () => true,
  busy: () => true,
  ended: () => true,
  folder: (m) => typeof m.name === 'string' && m.name.length <= 255 && MODES.includes(m.mode)
    && (m.into === 'folder' || m.into === 'zip') && count(m.files) && count(m.bytes),
  list: (m) => generation(m.gen) && part(m.part) && done(m.done),
  rescan: () => true,
  'hash-request': (m) => generations(m.gens) && part(m.part) && done(m.done),
  hashes: (m) => generations(m.gens) && part(m.part) && done(m.done),
  sync: (m) => run(m.id) && generations(m.gens) && part(m.part) && done(m.done),
  'sync-ok': (m) => run(m.id),
  'sync-no': (m) => run(m.id) && REFUSALS.has(m.reason),
  'sync-cancel': (m) => run(m.id),
  'sync-done': (m) => run(m.id) && count(m.received) && count(m.failed),
};

export const SESSION_TYPES = new Set(['hello', 'request', 'approved', 'approval-ack', 'denied', 'busy', 'ended']);

export function controlMessage(text) {
  if (typeof text !== 'string' || text.length > MAX_CONTROL) return null;
  let value;
  try { value = JSON.parse(text); } catch { return null; }
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.protocol !== PROTOCOL) return null;
  if (typeof value.type !== 'string' || !Object.hasOwn(SHAPES, value.type) || !SHAPES[value.type](value)) return null;
  if (value.token !== undefined && (!['request', 'approved'].includes(value.type) || !validAdmissionToken(value.token))) return null;
  return value;
}
