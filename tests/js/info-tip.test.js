/**
 * shared/js/info-tip.js - what an information mark does for a mouse, a finger and
 * a keyboard, and where its bubble lands.
 *
 * Every listener is the document's, so the fixture is a document, a window and
 * the few elements the module asks questions of. The events are the ones a browser
 * would send for each gesture, with the two details the behaviour turns on:
 * `pointerType`, and `relatedTarget` for where the pointer came from or went to.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { watchInfoTips } from '../../shared/js/info-tip.js';

class Surface {
  listeners = new Map();
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  emit(type, fields = {}) {
    const event = { type, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...fields };
    for (const listener of this.listeners.get(type) ?? []) listener(event);
    return event;
  }
}

class Element {
  dataset = {};
  style = {};
  focusVisible = false;
  constructor(kind, parent = null) {
    this.kind = kind;
    this.parentElement = parent;
  }
  contains(other) {
    for (let at = other; at; at = at.parentElement) if (at === this) return true;
    return false;
  }
  matches(selector) {
    if (selector.endsWith(':focus-visible')) return this.kind === 'mark' && this.focusVisible;
    return this.kind === (selector.endsWith('summary') ? 'mark' : 'tip');
  }
  closest(selector) {
    for (let at = this; at; at = at.parentElement) if (at.matches(selector)) return at;
    return null;
  }
}

/** A window, a page in it, and `count` marks whose bubbles land where `box` says. */
function fixture({ count = 1, width = 1000, height = 800, direction = 'ltr', box = {} } = {}) {
  const document = new Surface();
  const window = new Surface();
  document.documentElement = { clientWidth: width };
  window.innerHeight = height;
  window.getComputedStyle = () => ({ direction });
  const page = new Element('page');
  const elsewhere = new Element('button', page);
  const tips = Array.from({ length: count }, () => {
    const tip = new Element('tip', page);
    tip.open = false;
    const mark = new Element('mark', tip);
    const note = new Element('note', tip);
    tip.querySelector = () => note;
    // The stylesheet's two places for a bubble: under the mark, or over it.
    note.getBoundingClientRect = () => {
      const { left = 100, right = 400, below = [500, 600], above = [300, 400] } = box;
      const [top, bottom] = tip.dataset.placement === 'above' ? above : below;
      return { left, right, top, bottom };
    };
    return { tip, mark, note };
  });
  watchInfoTips(document, window);
  return {
    document, window, page, elsewhere, tips,
    hover: ({ mark }, from = page) => document.emit('pointerover', { pointerType: 'mouse', target: mark, relatedTarget: from }),
    leave: ({ mark }, to = page) => document.emit('pointerout', { pointerType: 'mouse', target: mark, relatedTarget: to }),
    click: ({ mark }) => document.emit('click', { target: mark }),
    press: target => document.emit('pointerdown', { target }),
    focus: target => document.emit('focusin', { target }),
    key: key => document.emit('keydown', { key, target: page }),
  };
}

const clock = t => t.mock.timers.enable({ apis: ['setTimeout'] });

test('a mouse on the mark shows the bubble, and leaving takes it back after a moment', t => {
  clock(t);
  const f = fixture();
  const [one] = f.tips;
  f.hover(one);
  assert.equal(one.tip.open, true);
  f.leave(one);
  t.mock.timers.tick(149);
  assert.equal(one.tip.open, true, 'a gap beside the bubble must not close it at once');
  t.mock.timers.tick(1);
  assert.equal(one.tip.open, false);
});

test('coming back within the moment keeps it open', t => {
  clock(t);
  const f = fixture();
  const [one] = f.tips;
  f.hover(one);
  f.leave(one);
  t.mock.timers.tick(100);
  f.hover(one);
  t.mock.timers.tick(500);
  assert.equal(one.tip.open, true);
});

test('moving from the mark onto the words is not leaving', t => {
  clock(t);
  const f = fixture();
  const [one] = f.tips;
  f.hover(one);
  f.leave(one, one.note);
  f.document.emit('pointerover', { pointerType: 'mouse', target: one.note, relatedTarget: one.mark });
  t.mock.timers.tick(500);
  assert.equal(one.tip.open, true);
});

test('a finger or a pen passing over the mark does nothing, because their click is coming', () => {
  const f = fixture();
  const [one] = f.tips;
  for (const pointerType of ['touch', 'pen']) {
    f.document.emit('pointerover', { pointerType, target: one.mark, relatedTarget: f.page });
    assert.equal(one.tip.open, false, pointerType);
  }
});

test('a click takes over from the browser, so the bubble is placed before it paints', () => {
  const f = fixture({ width: 300 });
  const [one] = f.tips;
  const event = f.click(one);
  assert.equal(event.defaultPrevented, true);
  assert.equal(one.tip.open, true);
  assert.equal(one.note.style.marginInlineStart, '-112px');
});

test('a click keeps it when the pointer leaves, and a second click closes it', t => {
  clock(t);
  const f = fixture();
  const [one] = f.tips;
  f.click(one);
  f.leave(one);
  t.mock.timers.tick(500);
  assert.equal(one.tip.open, true);
  f.click(one);
  assert.equal(one.tip.open, false);
});

test('the first click on a bubble the mouse already opened keeps it rather than closing it', t => {
  clock(t);
  const f = fixture();
  const [one] = f.tips;
  f.hover(one);
  f.click(one);
  assert.equal(one.tip.open, true);
  f.leave(one);
  t.mock.timers.tick(500);
  assert.equal(one.tip.open, true);
  f.click(one);
  assert.equal(one.tip.open, false);
});

test('a click anywhere else closes it, and a click on its own words does not', () => {
  const f = fixture();
  const [one] = f.tips;
  f.click(one);
  f.press(one.note);
  assert.equal(one.tip.open, true);
  f.press(f.elsewhere);
  assert.equal(one.tip.open, false);
});

test('pressing the words of a hover keeps it, because the drag may leave the bubble', t => {
  clock(t);
  const f = fixture();
  const [one] = f.tips;
  f.hover(one);
  f.press(one.note);
  f.leave(one);
  t.mock.timers.tick(500);
  assert.equal(one.tip.open, true);
});

test('pressing the mark itself leaves the deciding to its click', () => {
  const f = fixture();
  const [one] = f.tips;
  f.hover(one);
  f.press(one.mark);
  f.click(one);
  assert.equal(one.tip.open, true, 'the press must not have held it, or this click would close it');
});

test('the keyboard opens it on arrival, and a mouse focusing the mark does not', () => {
  const f = fixture();
  const [one] = f.tips;
  f.focus(one.mark);
  assert.equal(one.tip.open, false);
  one.mark.focusVisible = true;
  f.focus(one.mark);
  assert.equal(one.tip.open, true);
});

test('Enter on a mark the keyboard has opened closes it, and opens it again', () => {
  const f = fixture();
  const [one] = f.tips;
  one.mark.focusVisible = true;
  f.focus(one.mark);
  f.click(one);
  assert.equal(one.tip.open, false);
  f.click(one);
  assert.equal(one.tip.open, true);
});

test('focus moving on closes it, and focus going nowhere does not', () => {
  const f = fixture();
  const [one] = f.tips;
  f.click(one);
  f.document.emit('focusout', { target: one.mark, relatedTarget: null });
  assert.equal(one.tip.open, true, 'a click on the words, or the window losing focus');
  f.focus(one.note);
  assert.equal(one.tip.open, true, 'a link inside the bubble is still the same explanation');
  f.focus(f.elsewhere);
  assert.equal(one.tip.open, false);
});

test('Escape closes it and is spent, and is left alone when nothing is open', () => {
  const f = fixture();
  const [one] = f.tips;
  assert.equal(f.key('Escape').defaultPrevented, false, 'a dialog behind it still needs this');
  f.hover(one);
  assert.equal(f.key('Enter').defaultPrevented, false);
  assert.equal(one.tip.open, true);
  assert.equal(f.key('Escape').defaultPrevented, true);
  assert.equal(one.tip.open, false);
});

test('there is one at a time', () => {
  const f = fixture({ count: 2 });
  const [one, two] = f.tips;
  f.hover(one);
  f.hover(two);
  assert.deepEqual([one.tip.open, two.tip.open], [false, true]);
  f.click(one);
  assert.deepEqual([one.tip.open, two.tip.open], [true, false]);
});

test('a passing mouse does not take over from a bubble somebody asked for', () => {
  const f = fixture({ count: 2 });
  const [one, two] = f.tips;
  f.click(one);
  f.hover(two);
  assert.deepEqual([one.tip.open, two.tip.open], [true, false]);
  one.mark.focusVisible = true;
  f.focus(one.mark);
  f.hover(two);
  assert.deepEqual([one.tip.open, two.tip.open], [true, false], 'scrolling can bring a mark under a resting pointer');
});

test('a bubble that would run off the far side of the window is brought back', () => {
  const f = fixture({ width: 1000, box: { left: 800, right: 1200 } });
  const [one] = f.tips;
  f.hover(one);
  assert.equal(one.note.style.marginInlineStart, '-212px');
});

test('right to left, the far side is the left', () => {
  const f = fixture({ direction: 'rtl', box: { left: -50, right: 300 } });
  const [one] = f.tips;
  f.hover(one);
  assert.equal(one.note.style.marginInlineStart, '-62px');
});

test('a bubble with room stays where the stylesheet put it', () => {
  const f = fixture({ box: { left: 100, right: 988 } });
  const [one] = f.tips;
  f.hover(one);
  assert.equal(one.note.style.marginInlineStart, '');
  assert.equal(one.tip.dataset.placement, undefined);
});

test('with no room below it turns above the mark', () => {
  const f = fixture({ height: 600 });
  const [one] = f.tips;
  f.hover(one);
  assert.equal(one.tip.dataset.placement, 'above');
});

test('with room neither way it stays below, where it can be scrolled to', () => {
  const f = fixture({ height: 600, box: { above: [-40, 60] } });
  const [one] = f.tips;
  f.hover(one);
  assert.equal(one.tip.dataset.placement, undefined);
});

test('each opening measures afresh, so an old correction is not taken for room', () => {
  const f = fixture({ width: 300 });
  const [one] = f.tips;
  one.tip.dataset.placement = 'above';
  one.note.style.marginInlineStart = '-500px';
  f.document.documentElement.clientWidth = 1000;
  f.hover(one);
  assert.equal(one.tip.dataset.placement, undefined);
  assert.equal(one.note.style.marginInlineStart, '');
});

test('turning the phone moves an open bubble, and a closed one is left alone', () => {
  const f = fixture();
  const [one] = f.tips;
  f.window.emit('resize');
  assert.equal(one.note.style.marginInlineStart, undefined);
  f.hover(one);
  f.document.documentElement.clientWidth = 300;
  f.window.emit('resize');
  assert.equal(one.note.style.marginInlineStart, '-112px');
});

test('a mark added after the page loaded works with nothing to call', () => {
  const f = fixture();
  const later = new Element('tip', f.page);
  later.open = false;
  const mark = new Element('mark', later);
  later.querySelector = () => null;
  f.click({ mark });
  assert.equal(later.open, true);
});

test('find-in-page opening a closed mark gets it placed and counted as the open one', () => {
  const f = fixture({ count: 2, width: 300 });
  const [one, two] = f.tips;
  f.hover(one);
  two.tip.open = true;
  f.document.emit('toggle', { target: two.tip });
  assert.equal(one.tip.open, false);
  assert.equal(two.note.style.marginInlineStart, '-112px');
  two.tip.open = false;
  f.document.emit('toggle', { target: two.tip });
  f.hover(one);
  assert.equal(one.tip.open, true, 'closed from outside, it no longer holds the place');
});

test('its own toggles change nothing, and other details are none of its business', () => {
  const f = fixture();
  const [one] = f.tips;
  f.click(one);
  f.document.emit('toggle', { target: one.tip });
  assert.equal(one.tip.open, true);
  f.leave(one);
  f.document.emit('toggle', { target: new Element('fold', f.page) });
  f.document.emit('toggle', { target: f.document });
  assert.equal(one.tip.open, true);
});

test('events from the page itself rather than an element are ignored', () => {
  const f = fixture();
  for (const type of ['click', 'pointerover', 'focusin', 'toggle']) {
    assert.doesNotThrow(() => f.document.emit(type, { pointerType: 'mouse', target: f.document }));
  }
});
