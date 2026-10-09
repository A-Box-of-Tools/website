import test from 'node:test';
import assert from 'node:assert/strict';
import { cursorKey, Viewport } from '../../tools/image-to-svg/src/view.js';

function node(tag = 'DIV') {
  const handlers = new Map();
  return { tagName: tag, style: {}, children: [], clientWidth: 100, clientHeight: 80,
    classList: { add() {}, remove() {} }, setAttribute() {}, setPointerCapture() {},
    append(...nodes) { this.children.push(...nodes); }, replaceChildren(...nodes) { this.children = nodes; },
    addEventListener(name, callback) { handlers.set(name, callback); },
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 80 }),
    emit(name, options = {}) {
      if (name === 'focus') document.activeElement = this;
      if (name === 'blur' && document.activeElement === this) document.activeElement = null;
      const event = { target: this, preventDefault() { this.prevented = true; }, ...options };
      handlers.get(name)?.(event);
      return event;
    } };
}
function build(t) {
  const previous = globalThis.document;
  globalThis.document = { createElement: tag => node(tag.toUpperCase()) };
  t.after(() => { if (previous === undefined) delete globalThis.document; else globalThis.document = previous; });
  const hosts = [node(), node()], picks = [], cursors = [];
  const view = new Viewport({ hosts, onHover() {}, onView() {},
    onPick: p => picks.push([...p]), onCursor: p => cursors.push(p && [...p]) });
  view.setSize(400, 300);
  view.setZoom(2);
  view.apply();
  return { hosts, picks, cursors, view };
}

test('cursor arrows and accelerated arrows clamp source pixels and Home centres the image', () => {
  const size = { w: 20, h: 10 };
  assert.deepEqual(cursorKey([0, 0], size, { key: 'ArrowLeft' }), { point: [0, 0], pick: false });
  assert.deepEqual(cursorKey([15, 8], size, { key: 'ArrowRight', shiftKey: true }), { point: [19, 8], pick: false });
  assert.deepEqual(cursorKey([15, 8], size, { key: 'ArrowUp', shiftKey: true }), { point: [15, 0], pick: false });
  assert.deepEqual(cursorKey([0, 0], size, { key: 'Home' }), { point: [9, 4], pick: false });
});

test('composition and browser modifiers never activate a region or steal native keys', () => {
  for (const options of [{ isComposing: true }, { ctrlKey: true }, { altKey: true }, { metaKey: true }]) {
    assert.equal(cursorKey([1, 2], { w: 10, h: 10 }, { key: 'Enter', ...options }), null);
  }
  assert.equal(cursorKey([1, 2], { w: 10, h: 10 }, { key: 'Tab' }), null);
  for (const key of ['Enter', ' ']) assert.deepEqual(cursorKey([1, 2], { w: 10, h: 10 }, { key }), { point: [1, 2], pick: true });
});

test('both hosts share the same source cursor, follow magnified pixels and pick that exact point', (t) => {
  const { hosts, view, picks } = build(t);
  hosts[0].emit('focus');
  assert.deepEqual(view.cursor, [25, 20]);
  assert.equal(hosts[0].emit('keydown', { key: 'Home' }).prevented, true);
  assert.deepEqual(view.cursor, [199, 149]);
  const x = (view.cursor[0] + 0.5) * view.zoom + view.offset.x;
  const y = (view.cursor[1] + 0.5) * view.zoom + view.offset.y;
  assert.ok(x >= 0 && x <= 100 && y >= 0 && y <= 80);
  hosts[0].emit('blur');
  hosts[1].emit('focus');
  hosts[1].emit('keydown', { key: 'Enter' });
  hosts[1].emit('keydown', { key: ' ' });
  assert.deepEqual(picks, [[199, 149], [199, 149]]);
});

test('replacement and Clear retire dragging and cursor picking without turning a pan into a pick', (t) => {
  const { hosts, view, picks } = build(t);
  hosts[0].emit('pointerdown', { pointerId: 1, clientX: 50, clientY: 40 });
  hosts[0].emit('pointermove', { pointerId: 1, clientX: 70, clientY: 40 });
  hosts[0].emit('pointerup', { pointerId: 1, clientX: 70, clientY: 40 });
  assert.deepEqual(picks, []);
  hosts[0].emit('pointerdown', { pointerId: 2, clientX: 50, clientY: 40 });
  view.setSize(80, 60);
  hosts[0].emit('pointerup', { pointerId: 2, clientX: 50, clientY: 40 });
  assert.deepEqual(picks, []);
  hosts[0].emit('focus');
  view.clear();
  hosts[0].emit('keydown', { key: 'Enter' });
  assert.deepEqual(picks, []);
  assert.deepEqual(hosts.map(h => h.tabIndex), [-1, -1]);
  assert.equal(view.cursor, null);
});

test('a focused replacement resets the shared cursor to the new source and keeps activation available', (t) => {
  const { hosts, view, picks } = build(t);
  hosts[0].emit('focus');
  hosts[0].emit('keydown', { key: 'ArrowRight', shiftKey: true });
  view.setSize(80, 60);
  view.apply();
  assert.deepEqual(view.cursor, [39, 29]);
  hosts[0].emit('keydown', { key: 'Enter' });
  assert.deepEqual(picks, [[39, 29]]);
});
