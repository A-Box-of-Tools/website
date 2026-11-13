/**
 * A request to join, and what the host is told about it when the popup is not
 * on a screen anybody is looking at.
 *
 * Every case here was a silence before there was anything to test. A request
 * that arrived while the page was in the background added a row to a list:
 * the tab kept its title, nothing made a sound, and coming back opened
 * nothing. The module that changed that touches a document, a panel, a
 * checkbox and a chime, and takes all four as arguments, so it runs here with
 * plain objects standing in for each and a clock that is a number.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequestSignal, KNOCK } from '../../shared/js/peer-request-signal.js';
import { createApprovalPrompt } from '../../shared/js/peer-approval-ui.js';

const STORE = 'abox.pairing-request-sound.v1';
const NOTICED = 'paired-requests-noticed';

/** Something that can be listened to, and made to speak. */
class Surface {
  listeners = new Map();

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(listener);
  }

  emit(type) {
    for (const listener of [...(this.listeners.get(type) ?? [])]) listener({ type });
  }
}

/**
 * A host's page: a title, a list with a heading, the switch for the sound and
 * a chime that counts what it was asked.
 */
function page({ sound = true, stored = null, refuseStorage = false, heading = 'Join requests' } = {}) {
  const window = new Surface();
  const document = new Surface();
  document.title = 'Voice Oncall';
  document.hidden = false;
  document.defaultView = window;

  const classes = new Set();
  const panel = {
    hidden: false,
    ownerDocument: document,
    offsetWidth: 0,
    scrolls: [],
    querySelector: () => (heading === null ? null : { textContent: `\n  ${heading}\n` }),
    scrollIntoView(options) { this.scrolls.push(options); },
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
    },
  };

  const option = { hidden: true };
  const toggle = new Surface();
  toggle.checked = true;
  toggle.closest = () => option;
  const chime = {
    arms: 0, plays: 0, releases: 0,
    arm() { this.arms += 1; },
    play() { this.plays += 1; return true; },
    release() { this.releases += 1; },
  };

  const kept = new Map(stored === null ? [] : [[STORE, stored]]);
  const storage = () => {
    if (refuseStorage) throw new Error('storage is refused here');
    return {
      getItem: (key) => kept.get(key) ?? null,
      setItem: (key, value) => kept.set(key, value),
      removeItem: (key) => kept.delete(key),
    };
  };

  const timers = [];
  let clock = 0;
  const signal = createRequestSignal({
    panel,
    document,
    storage,
    sound: sound ? { chime, toggle } : null,
    now: () => clock,
    later: (callback, wait) => { timers.push({ callback, wait }); return timers.length; },
    cancel: () => {},
  });

  return {
    signal, document, window, panel, classes, option, toggle, chime, kept, timers,
    wait(ms) { clock += ms; },
    hide() { document.hidden = true; document.emit('visibilitychange'); },
    comeBack() { document.hidden = false; document.emit('visibilitychange'); },
  };
}

/* ------------------------------------------------------------- the title */

test('a waiting request is counted in the tab\'s title, in the list\'s own words', () => {
  const { signal, document } = page();
  signal.update(['a']);
  assert.equal(document.title, '(1) Join requests — Voice Oncall');
  signal.update(['a', 'b']);
  assert.equal(document.title, '(2) Join requests — Voice Oncall');
  signal.update(['b']);
  assert.equal(document.title, '(1) Join requests — Voice Oncall');
});

test('the page gets its own title back when nothing is waiting, however that happened', () => {
  const decided = page();
  decided.signal.update(['a']);
  decided.signal.update([]);
  assert.equal(decided.document.title, 'Voice Oncall');

  const ended = page();
  ended.signal.update(['a', 'b']);
  ended.signal.clear();
  assert.equal(ended.document.title, 'Voice Oncall');
});

test('the words are the heading\'s, so a translated page counts in its own language', () => {
  const { signal, document } = page({ heading: 'Beitrittsanfragen' });
  signal.update(['a']);
  assert.equal(document.title, '(1) Beitrittsanfragen — Voice Oncall');
});

test('a list with no heading still counts', () => {
  const { signal, document } = page({ heading: null });
  signal.update(['a']);
  assert.equal(document.title, '(1) Voice Oncall');
});

test('a title something else set while a request waited is not replaced by an old one', () => {
  const { signal, document } = page();
  signal.update(['a']);
  document.title = 'Renamed by the page';
  signal.update(['a', 'b']);
  assert.equal(document.title, '(2) Join requests — Renamed by the page', 'the count moves to the new title');
  document.title = 'Renamed again';
  signal.update([]);
  assert.equal(document.title, 'Renamed again', 'and nothing stale is put back');
});

test('a page kept for the Back button is stored without the count, and counts again when it returns', () => {
  const { signal, document, window } = page();
  signal.update(['a']);
  window.emit('pagehide');
  assert.equal(document.title, 'Voice Oncall');
  window.emit('pageshow');
  assert.equal(document.title, '(1) Join requests — Voice Oncall');
});

/* ------------------------------------------------------------ on return */

test('a request that arrived while the page was hidden marks the list when the host returns, once', () => {
  const { signal, panel, classes, timers, hide, comeBack } = page();
  hide();
  signal.update(['a']);
  assert.equal(classes.has(NOTICED), false, 'nothing is drawn on a page nobody can see');

  comeBack();
  assert.equal(classes.has(NOTICED), true);
  assert.deepEqual(panel.scrolls, [{ block: 'nearest', inline: 'nearest' }], 'brought into view, and no further than it takes');
  assert.equal(timers.length, 1);
  timers[0].callback();
  assert.equal(classes.has(NOTICED), false, 'the mark is taken off again');

  hide();
  comeBack();
  assert.equal(panel.scrolls.length, 1, 'the same request is not pointed at twice');
});

test('a request the host was there for is not pointed at later', () => {
  const { signal, panel, classes, hide, comeBack } = page();
  signal.update(['a']);
  hide();
  comeBack();
  assert.equal(classes.has(NOTICED), false);
  assert.equal(panel.scrolls.length, 0);
});

test('a request withdrawn before the host returned leaves nothing to point at', () => {
  const { signal, panel, hide, comeBack } = page();
  hide();
  signal.update(['a']);
  signal.update([]);
  comeBack();
  assert.equal(panel.scrolls.length, 0);
});

test('a list that is not on the page is not scrolled to', () => {
  const { signal, panel, classes, hide, comeBack } = page();
  hide();
  signal.update(['a']);
  panel.hidden = true;
  comeBack();
  assert.equal(panel.scrolls.length, 0);
  assert.equal(classes.has(NOTICED), false);
});

/* ------------------------------------------------------------- the sound */

test('a new request makes one sound, hidden page or not', () => {
  const seen = page();
  seen.signal.update(['a']);
  assert.equal(seen.chime.plays, 1);

  const away = page();
  away.hide();
  away.signal.update(['a']);
  assert.equal(away.chime.plays, 1, 'the page nobody is looking at is the one that needs it');
});

test('the sound is asked for again as it is played, in case the context was let go', () => {
  const { signal, chime } = page();
  signal.update(['a']);
  assert.deepEqual([chime.arms, chime.plays], [1, 1]);
});

test('requests that arrive together share one sound, and a later one has its own', () => {
  const { signal, chime, wait } = page();
  signal.update(['a']);
  wait(1500);
  signal.update(['a', 'b']);
  wait(1500);
  signal.update(['a', 'b', 'c']);
  assert.equal(chime.plays, 1, 'a class joining is one thing to its host');

  wait(4000);
  signal.update(['a', 'b', 'c', 'd']);
  assert.equal(chime.plays, 2);
});

test('a request that is withdrawn and sent again is not rung twice', () => {
  // A waiting page with a poor connection asks again every few seconds. The
  // title goes on counting it; the sound has already said so.
  const { signal, chime, document, wait } = page();
  signal.update(['a']);
  for (let again = 0; again < 5; again += 1) {
    wait(10_000);
    signal.update([]);
    wait(10_000);
    signal.update(['a']);
  }
  assert.equal(chime.plays, 1);
  assert.equal(document.title, '(1) Join requests — Voice Oncall');
});

test('a list redrawn with the same requests says nothing new', () => {
  const { signal, chime, wait } = page();
  signal.update(['a']);
  wait(10_000);
  signal.update(['a']);
  signal.update(['a']);
  assert.equal(chime.plays, 1);
});

test('the next session starts with nobody heard', () => {
  const { signal, chime, wait } = page();
  signal.host(true);
  signal.update(['a']);
  signal.clear();
  signal.host(false);

  wait(1000);
  signal.host(true);
  signal.update(['a']);
  assert.equal(chime.plays, 2, 'the same person asking a new host session is new, and is not held to the old gap');
});

test('a tool that hands over no chime stays silent and still counts', () => {
  const { signal, document, chime } = page({ sound: false });
  signal.update(['a']);
  signal.arm();
  signal.host(true);
  signal.host(false);
  assert.deepEqual([chime.arms, chime.plays, chime.releases], [0, 0, 0]);
  assert.equal(document.title, '(1) Join requests — Voice Oncall');
});

/* ------------------------------------------------------------ the switch */

test('the switch is on the page for as long as there is a session, and the audio device is let go after', () => {
  const { signal, option, chime } = page();
  assert.equal(option.hidden, true, 'the markup hides it, and nothing shows it before a session');

  signal.arm();
  assert.equal(chime.arms, 1, 'asked for inside the click that starts hosting');
  signal.host(true);
  assert.equal(option.hidden, false);
  signal.host(true);
  assert.equal(chime.releases, 0, 'saying so twice changes nothing');

  signal.host(false);
  assert.equal(option.hidden, true);
  assert.equal(chime.releases, 1);
});

test('a host who turns the sound off is not rung at, and only that answer is kept', () => {
  const { signal, toggle, chime, kept } = page();
  signal.host(true);
  assert.equal(kept.size, 0, 'a host who never touches the box leaves nothing behind');

  toggle.checked = false;
  toggle.emit('change');
  assert.equal(kept.get(STORE), 'off');
  assert.equal(chime.releases, 1);
  signal.update(['a']);
  signal.arm();
  assert.deepEqual([chime.arms, chime.plays], [0, 0]);

  toggle.checked = true;
  toggle.emit('change');
  assert.equal(kept.size, 0, 'turning it back on forgets there was ever an answer');
  assert.equal(chime.arms, 1, 'ticking the box is a tap, which is when a sound may be asked for');
});

test('a request that arrived in silence is not rung when the sound comes back on', () => {
  const { signal, toggle, chime } = page();
  signal.host(true);
  toggle.checked = false;
  toggle.emit('change');
  signal.update(['a']);
  toggle.checked = true;
  toggle.emit('change');
  signal.update(['a']);
  assert.equal(chime.plays, 0);
  signal.update(['a', 'b']);
  assert.equal(chime.plays, 1, 'the next new one is');
});

test('the answer from the last visit is honoured, and a browser that refuses storage is survived', () => {
  const returning = page({ stored: 'off' });
  assert.equal(returning.toggle.checked, false);
  returning.signal.update(['a']);
  assert.equal(returning.chime.plays, 0);

  const refused = page({ refuseStorage: true });
  assert.equal(refused.toggle.checked, true, 'the box keeps the markup\'s answer');
  refused.toggle.checked = false;
  assert.doesNotThrow(() => refused.toggle.emit('change'));
  refused.signal.update(['a']);
  assert.equal(refused.chime.plays, 0, 'and the choice lasts as long as the page does');
});

test('a tap re-arms the sound while there is a session, and not before or after', () => {
  const { signal, document, chime } = page();
  document.emit('pointerdown');
  assert.equal(chime.arms, 0, 'no audio context is made on a page that is hosting nothing');

  signal.host(true);
  document.emit('pointerdown');
  assert.equal(chime.arms, 1, 'a context a phone call suspended comes back from any later tap');

  signal.host(false);
  document.emit('pointerdown');
  assert.equal(chime.arms, 1);
});

test('a knock falls, and is slower than a tap', () => {
  const [first, second] = KNOCK.notes;
  assert.equal(KNOCK.notes.length, 2);
  assert.ok(second.hertz < first.hertz, 'the notes for "that worked" rise; this one must not be taken for them');
  assert.ok(second.starts >= first.starts + first.lasts, 'one note after the other, not a chord');
  assert.ok(second.starts + second.lasts <= 0.6, 'and still over in about half a second');
  assert.ok(Array.isArray(KNOCK.buzz) && KNOCK.buzz.length === 3, 'a buzz, a pause and a longer buzz');
});

/* --------------------------------------------------- the popup's side of it */

/** As much of the request dialog as peer-approval-ui.js reaches for. */
function prompt({ hidden = false } = {}) {
  const button = () => ({ disabled: false, addEventListener() {}, focus() {} });
  const parts = {
    '[data-approval-name]': { textContent: '' },
    '[data-approval-approve]': button(),
    '[data-approval-deny]': button(),
    '[data-approval-later]': button(),
  };
  const dialog = {
    open: false,
    ownerDocument: { hidden, querySelector: () => null },
    querySelector: (selector) => parts[selector],
    addEventListener() {},
    showModal() { this.open = true; },
    close() { this.open = false; },
  };
  const told = [];
  const signal = { update: (ids) => told.push(ids), clear: () => told.push('clear') };
  return { dialog, told, popup: createApprovalPrompt({ dialog, signal, onApprove() {}, onDeny() {} }) };
}

test('the popup tells the signal what is waiting, including on the hidden page where it opens nothing itself', () => {
  const front = prompt();
  front.popup.update([{ id: 'a', name: 'Sam' }]);
  assert.equal(front.dialog.open, true);
  assert.deepEqual(front.told, [['a']]);

  const behind = prompt({ hidden: true });
  behind.popup.update([{ id: 'a', name: 'Sam' }, { id: 'b', name: 'Dana' }]);
  assert.equal(behind.dialog.open, false, 'a dialog still does not open behind the host\'s back');
  assert.deepEqual(behind.told, [['a', 'b']], 'which is why something else has to say so');
});

test('ending the session tells the signal nothing is waiting', () => {
  const { popup, told } = prompt();
  popup.update([{ id: 'a', name: 'Sam' }]);
  popup.clear();
  assert.deepEqual(told, [['a'], 'clear']);
});

test('a popup with no signal behaves as it always did', () => {
  const button = () => ({ disabled: false, addEventListener() {}, focus() {} });
  const parts = { '[data-approval-name]': { textContent: '' }, '[data-approval-approve]': button(), '[data-approval-deny]': button(), '[data-approval-later]': button() };
  const dialog = {
    open: false,
    ownerDocument: { hidden: false, querySelector: () => null },
    querySelector: (selector) => parts[selector],
    addEventListener() {},
    showModal() { this.open = true; },
    close() { this.open = false; },
  };
  const popup = createApprovalPrompt({ dialog, onApprove() {}, onDeny() {} });
  assert.doesNotThrow(() => { popup.update([{ id: 'a', name: 'Sam' }]); popup.clear(); });
});
