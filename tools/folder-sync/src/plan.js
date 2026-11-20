/**
 * Two listings in, one list of differences out. Nothing here reads a file or
 * touches the page: the same inputs give the same plan on either device, and
 * the tests can hold it to that.
 *
 * Without a record of the last sync there is no way to tell a file deleted
 * here from a file created there, so nothing is ever deleted. A file missing
 * from one side is copied to it, and the visitor can skip it instead.
 */
import { foldPath } from './paths.js';

export const KINDS = ['only-here', 'only-there', 'newer-here', 'newer-there', 'conflict', 'case'];

/** What each side's mode allows to move: this side's sends need the peer to accept them. */
export function permissions(localMode, remoteMode) {
  return {
    send: localMode !== 'receive' && remoteMode !== 'send',
    receive: localMode !== 'send' && remoteMode !== 'receive',
  };
}

/** Files both sides hold at one size under two dates. Only their bytes can say whether they differ. */
export function needsCheck(local, remote, same = () => false) {
  const keys = [];
  for (const [key, mine] of local) {
    const theirs = remote.get(key);
    if (theirs && theirs.size === mine.size && theirs.mtime !== mine.mtime && !same(key, mine, theirs)) keys.push(key);
  }
  return keys;
}

/**
 * Names that a case-insensitive disk would take for another name in play:
 * README.md here against Readme.md there, or two of them on one Linux side.
 * Copying either would overwrite the other on Windows or a Mac, so these are
 * left alone and shown, whichever side the disk that would collide is on.
 */
export function caseClashes(local, remote) {
  const folds = new Map();
  for (const key of [...local.keys(), ...remote.keys()]) {
    const fold = foldPath(key);
    const names = folds.get(fold);
    if (names) names.add(key);
    else folds.set(fold, new Set([key]));
  }
  const clash = new Set();
  for (const names of folds.values()) {
    if (names.size > 1) for (const key of names) clash.add(key);
  }
  return clash;
}

function allowedActions(kind, can) {
  if (kind === 'case') return ['skip'];
  const actions = [];
  if (can.send && kind !== 'only-there') actions.push('send');
  if (can.receive && kind !== 'only-here') actions.push('receive');
  actions.push('skip');
  return actions;
}

function defaultAction(kind, can) {
  if ((kind === 'only-here' || kind === 'newer-here') && can.send) return 'send';
  if ((kind === 'only-there' || kind === 'newer-there') && can.receive) return 'receive';
  // Changed on both sides at the same moment, or a name that collides: no
  // rule can say which copy the visitor wants, so neither is chosen for them.
  return 'skip';
}

/**
 * The differences, or `pending` with the keys still waiting for fingerprints.
 * `hashes` maps a key to `{ local, remote }`; `same` says whether a pair of
 * entries is already known to hold the same bytes.
 */
export function comparePlan({ local, remote, localMode, remoteMode, hashes = new Map(), same = () => false }) {
  const can = permissions(localMode, remoteMode);
  const clash = caseClashes(local, remote);
  const rows = [];
  const pending = [];
  let identical = 0;
  for (const key of new Set([...local.keys(), ...remote.keys()])) {
    const mine = local.get(key) ?? null;
    const theirs = remote.get(key) ?? null;
    let kind;
    if (mine && theirs) {
      if (mine.size === theirs.size && (mine.mtime === theirs.mtime || same(key, mine, theirs))) { identical += 1; continue; }
      if (mine.size === theirs.size) {
        const pair = hashes.get(key);
        if (pair?.local === undefined || pair?.remote === undefined) { pending.push(key); continue; }
        if (pair.local !== null && pair.local === pair.remote) { identical += 1; continue; }
      }
      kind = mine.mtime > theirs.mtime ? 'newer-here' : mine.mtime < theirs.mtime ? 'newer-there' : 'conflict';
    } else kind = mine ? 'only-here' : 'only-there';
    if (clash.has(key)) kind = 'case';
    rows.push({ key, kind, here: mine, there: theirs, allowed: allowedActions(kind, can), action: defaultAction(kind, can) });
  }
  rows.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { rows, pending, identical, can };
}

export function chosen(row, overrides = new Map()) {
  const pick = overrides.get(row.key);
  return pick && row.allowed.includes(pick) ? pick : row.action;
}

export function summarize(plan, overrides = new Map()) {
  const totals = { send: 0, sendBytes: 0, receive: 0, receiveBytes: 0, skip: 0, identical: plan.identical };
  for (const row of plan.rows) {
    const action = chosen(row, overrides);
    if (action === 'send') { totals.send += 1; totals.sendBytes += row.here.size; }
    else if (action === 'receive') { totals.receive += 1; totals.receiveBytes += row.there.size; }
    else totals.skip += 1;
  }
  return totals;
}

/** The rows that move, as [key, destination] with the destination named by role. */
export function planActions(plan, overrides, role) {
  const peer = role === 'host' ? 'guest' : 'host';
  const actions = [];
  for (const row of plan.rows) {
    const action = chosen(row, overrides);
    if (action === 'send') actions.push([row.key, peer]);
    else if (action === 'receive') actions.push([row.key, role]);
  }
  return actions;
}

/**
 * The side that did not press Sync checks what it was asked to do against
 * its own listing and its own mode, whatever the other side's plan said. One
 * action it would not have allowed refuses the run: a peer that sends one is
 * not following this protocol, and doing the rest would be guessing.
 */
export function acceptActions({ actions, local, remote, role, localMode, remoteMode }) {
  const can = permissions(localMode, remoteMode);
  const clash = caseClashes(local, remote);
  const receive = [];
  const send = new Set();
  for (const [key, to] of actions) {
    if (clash.has(key)) return null;
    if (to === role) {
      const theirs = remote.get(key);
      if (!can.receive || !theirs) return null;
      receive.push(theirs);
    } else {
      if (!can.send || !local.has(key)) return null;
      send.add(key);
    }
  }
  return { receive, send };
}
