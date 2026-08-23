/**
 * shared/feedback.js - the one question a tool page asks, and how rarely.
 *
 * Run the way tests/js/lang.test.js runs its subject, and for the same reason:
 * the file is a frame script rather than a module, so there is nothing to
 * import. The source is read off disk and evaluated with a hand-built window
 * and document in front of it.
 *
 * The stub is the point. Every decision this file makes - whether to ask at
 * all, what one press sends, how long an answer buys - is a function of what is
 * in localStorage, which element was clicked, and which button was pressed
 * after that. All three are values in a DOM, so faking the DOM is how the
 * question gets asked. Two things in particular are worth checking here and
 * nowhere else:
 *
 *   - that ONE answer sends exactly ONE event, however it is finished. A "no"
 *     followed by a reason, a "no" followed by closing the panel, and a "no"
 *     followed by the tab going away are three routes to the same answer, and
 *     an implementation that sent the verdict early would count two of them
 *     twice. A browser would not tell you; a counter in Google Analytics would,
 *     six weeks later.
 *   - that nothing but the answer is in the event. That is the promise the
 *     panel prints on itself, and it is one assertion.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE = readFileSync(
  fileURLToPath(new URL('../../shared/feedback.js', import.meta.url)),
  'utf8',
);

const DAY = 86400000;

/** A storage that behaves like localStorage, or one that refuses to. */
function storage(refuse = false) {
  const held = new Map();
  return {
    held,
    getItem(key) {
      if (refuse) throw new Error('storage is disabled');
      return held.has(key) ? held.get(key) : null;
    },
    setItem(key, value) {
      if (refuse) throw new Error('storage is disabled');
      held.set(key, String(value));
    },
  };
}

/**
 * One element.
 *
 * `selectors` is the set of selector strings this element answers to, and
 * closest() walks up matching against exactly the strings the source passes -
 * so a test fails if the source starts asking for something the markup does not
 * offer, which is the failure this stub exists to catch.
 */
function el(selectors = [], attrs = {}) {
  const node = {
    selectors: new Set(selectors),
    attrs,
    children: [],
    parentNode: null,
    hidden: false,
    getAttribute: (name) => (name in attrs ? attrs[name] : null),
    closest(query) {
      const wanted = query.split(',').map((part) => part.trim());
      let at = node;
      while (at) {
        if (wanted.some((part) => at.selectors.has(part))) return at;
        at = at.parentNode;
      }
      return null;
    },
    querySelector(query) {
      for (const child of node.children) {
        if (child.selectors.has(query.trim())) return child;
        const deeper = child.querySelector(query);
        if (deeper) return deeper;
      }
      return null;
    },
    contains(other) {
      let at = other;
      while (at) {
        if (at === node) return true;
        at = at.parentNode;
      }
      return false;
    },
    insertAdjacentElement(where, other) {
      node.inserted = { where, other };
      other.parentNode = node.parentNode;
    },
    append(child) {
      child.parentNode = node;
      node.children.push(child);
      return child;
    },
  };
  return node;
}

/**
 * The panel as templates/partials/feedback.html renders it, and a page with a
 * download link in a step section.
 *
 * `stored` is what localStorage holds for this tool before the page loads,
 * which is how the "ask once" rules are put on trial.
 */
function run({ stored = null, gtag = true, refuseStorage = false, tool = 'compress-pdf' } = {}) {
  const local = storage(refuseStorage);
  if (stored && !refuseStorage) local.held.set(`abox-feedback-${tool}`, stored);

  // Hidden where the partial renders it hidden: the panel itself, the reasons
  // behind the thumb down, and the thank-you. Which of them is on screen is
  // most of what the assertions below read.
  const panel = el(['#feedback'], { 'data-tool': tool });
  panel.hidden = true;
  const ask = panel.append(el(['.feedback-ask']));
  const why = panel.append(el(['.feedback-why']));
  why.hidden = true;
  const thanks = panel.append(el(['.feedback-thanks']));
  thanks.hidden = true;
  const note = panel.append(el(['.feedback-note']));
  const up = ask.append(el(['[data-verdict]'], { 'data-verdict': 'up' }));
  const down = ask.append(el(['[data-verdict]'], { 'data-verdict': 'down' }));
  const close = ask.append(el(['.feedback-close']));
  const chips = {};
  for (const reason of ['wrong', 'failed', 'slow', 'confusing']) {
    chips[reason] = why.append(el(['[data-reason]'], { 'data-reason': reason }));
  }

  // The page the panel is asking about: a step section holding the download.
  const section = el(['section']);
  const main = el(['main']);
  main.append(section);
  const link = section.append(el(['a[download][href]']));
  const button = section.append(el(['button[id^="download"]']));
  const marked = section.append(el(['[data-download]']));
  const unrelated = section.append(el(['.cancel']));

  const sent = [];
  const timers = [];
  const on = { document: new Map(), panel: new Map(), window: new Map() };

  panel.addEventListener = (type, fn) => on.panel.set(type, fn);

  const document = {
    getElementById: (id) => (id === 'feedback' ? panel : null),
    addEventListener: (type, fn) => on.document.set(type, fn),
  };

  const window = {
    localStorage: local,
    addEventListener: (type, fn) => on.window.set(type, fn),
    setTimeout: (fn) => timers.push(fn),
  };
  // The queue, not a function - which is the whole point, and was once the
  // bug. A stub that offered `window.gtag` passed while the deployed build,
  // where that global has been renamed away, sent nothing at all. So the stub
  // now offers exactly what a real page offers: an array called dataLayer.
  if (gtag) {
    window.dataLayer = {
      push: (args) => sent.push(Array.from(args)),
    };
  }

  // eslint-disable-next-line no-new-func
  new Function('window', 'document', SOURCE)(window, document);

  /** Every timer that is due, in the order it was set. */
  const tick = () => {
    while (timers.length) timers.shift()();
  };

  const click = (target, where = 'document') => {
    const fn = on[where].get('click');
    if (fn) fn({ target });
  };

  return {
    panel, ask, why, thanks, note, section, link, button, marked, unrelated,
    up, down, close, chips, sent, timers, tick, click,
    listening: on.document.has('click'),
    pagehide: () => {
      const fn = on.window.get('pagehide');
      if (fn) fn();
    },
    press: (target) => click(target, 'panel'),
    stored: () => local.held.get(`abox-feedback-${tool}`) || null,
  };
}

/** A stored state, written this many days ago. */
const aged = (state, days) => `${state}.${Date.now() - days * DAY}`;

/* ------------------------------------------------------- what counts as one */

test('a download link asks the question', () => {
  const page = run();
  page.click(page.link);
  assert.equal(page.panel.hidden, true, 'not before the delay is up');
  page.tick();
  assert.equal(page.panel.hidden, false);
});

test('a button named download asks it too', () => {
  const page = run();
  page.click(page.button);
  page.tick();
  assert.equal(page.panel.hidden, false);
});

test('so does a save button that opted in with data-download', () => {
  // exif-editor's "Save this photo", which saves a file and is named nothing
  // like "download". The attribute is how it says so.
  const page = run();
  page.click(page.marked);
  page.tick();
  assert.equal(page.panel.hidden, false);
});

test('any other button on the page does not', () => {
  const page = run();
  page.click(page.unrelated);
  page.tick();
  assert.equal(page.panel.hidden, true);
});

test('a disabled trigger does not', () => {
  const page = run();
  page.button.disabled = true;
  page.click(page.button);
  page.tick();
  assert.equal(page.panel.hidden, true);
});

test('two downloads still only ask once', () => {
  const page = run();
  page.click(page.link);
  page.click(page.button);
  assert.equal(page.timers.length, 1);
});

test('it moves next to the step the download was in', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  assert.deepEqual(page.section.inserted, { where: 'afterend', other: page.panel });
});

/* --------------------------------------------------------- what is sent */

test('a thumb up sends one event, and only the answer', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.up);

  assert.equal(page.sent.length, 1);
  const [type, name, params] = page.sent[0];
  assert.equal(type, 'event');
  assert.equal(name, 'tool_feedback');
  // The whole payload, asserted whole rather than key by key: this is the
  // promise the panel prints on itself, and a field added by accident should
  // fail here rather than reach anybody's browser.
  assert.deepEqual(params, {
    tool_slug: 'compress-pdf', verdict: 'up', reason: 'none',
  });
});

test('a thumb down sends nothing until it is finished', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.down);

  assert.equal(page.sent.length, 0);
  assert.equal(page.ask.hidden, true);
  assert.equal(page.why.hidden, false, 'the reasons are offered instead');
});

test('a reason finishes it, as one event carrying that reason', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.down);
  page.press(page.chips.slow);

  assert.equal(page.sent.length, 1);
  assert.deepEqual(page.sent[0][2], {
    tool_slug: 'compress-pdf', verdict: 'down', reason: 'slow',
  });
});

test('closing on the reasons is still a no, sent once', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.down);
  page.press(page.close);

  assert.equal(page.sent.length, 1);
  assert.deepEqual(page.sent[0][2], {
    tool_slug: 'compress-pdf', verdict: 'down', reason: 'none',
  });
});

test('a tab going away with a no chosen sends it, and sends it once', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.down);
  page.pagehide();
  page.pagehide();

  assert.equal(page.sent.length, 1);
  assert.equal(page.sent[0][2].verdict, 'down');
});

test('a reason already sent is not sent again when the tab goes', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.down);
  page.press(page.chips.wrong);
  page.pagehide();

  assert.equal(page.sent.length, 1);
});

test('closing without pressing either button sends nothing', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.close);

  assert.equal(page.sent.length, 0);
});

test('a blocked measurement script is not an error, and still thanks them', () => {
  // No dataLayer at all, which is what a page whose measurement script never
  // loaded actually looks like.
  const page = run({ gtag: false });
  page.click(page.link);
  page.tick();
  page.press(page.up);

  assert.equal(page.thanks.hidden, false);
  // And it is remembered, so a browser that blocks measurement is asked once
  // rather than on every download it ever makes.
  assert.match(page.stored(), /^a\.\d+$/);
});

/* ------------------------------------------------------- how rarely it asks */

test('an answer is remembered', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.up);
  assert.match(page.stored(), /^a\.\d+$/);
});

test('a first dismissal is remembered as one', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.close);
  assert.match(page.stored(), /^d1\.\d+$/);
});

test('a second dismissal is remembered as the last one', () => {
  const page = run({ stored: aged('d1', 40) });
  page.click(page.link);
  page.tick();
  page.press(page.close);
  assert.match(page.stored(), /^d2\.\d+$/);
});

test('closing after a no counts as an answer, not as a refusal', () => {
  const page = run();
  page.click(page.link);
  page.tick();
  page.press(page.down);
  page.press(page.close);
  assert.match(page.stored(), /^a\.\d+$/);
});

test('a recent answer is not asked about again', () => {
  const page = run({ stored: aged('a', 30) });
  assert.equal(page.listening, false, 'it does not even watch for a download');
});

test('an answer from six months ago is asked again', () => {
  const page = run({ stored: aged('a', 200) });
  page.click(page.link);
  page.tick();
  assert.equal(page.panel.hidden, false);
});

test('a dismissal buys a month, and not a year', () => {
  assert.equal(run({ stored: aged('d1', 10) }).listening, false);

  const later = run({ stored: aged('d1', 40) });
  later.click(later.link);
  later.tick();
  assert.equal(later.panel.hidden, false);
});

test('a second dismissal buys a year', () => {
  assert.equal(run({ stored: aged('d2', 300) }).listening, false);

  const later = run({ stored: aged('d2', 400) });
  later.click(later.link);
  later.tick();
  assert.equal(later.panel.hidden, false);
});

test('a timestamp from the future is treated as no answer at all', () => {
  // A clock that has been moved backwards would otherwise silence this tool
  // until the date the stored value claims, which could be years.
  const page = run({ stored: `a.${Date.now() + 400 * DAY}` });
  page.click(page.link);
  page.tick();
  assert.equal(page.panel.hidden, false);
});

test('a value that is not one of ours is ignored', () => {
  const page = run({ stored: 'yes please' });
  page.click(page.link);
  page.tick();
  assert.equal(page.panel.hidden, false);
});

test('storage that throws asks, and answering does not break', () => {
  const page = run({ refuseStorage: true });
  page.click(page.link);
  page.tick();
  page.press(page.up);
  assert.equal(page.sent.length, 1);
  assert.equal(page.thanks.hidden, false);
});

test('a page with no panel does nothing at all', () => {
  // Every page that is not a tool page. The script is only included on tool
  // pages today, and this is what stops that being load-bearing.
  const timers = [];
  const window = { localStorage: storage(), addEventListener: () => {}, setTimeout: (fn) => timers.push(fn) };
  const document = { getElementById: () => null, addEventListener: () => { throw new Error('listened anyway'); } };
  // eslint-disable-next-line no-new-func
  new Function('window', 'document', SOURCE)(window, document);
  assert.equal(timers.length, 0);
});
