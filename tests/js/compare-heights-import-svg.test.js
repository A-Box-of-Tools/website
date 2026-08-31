/**
 * tools/compare-heights/src/import-svg.js - what survives an uploaded SVG.
 *
 * This is the one module in the tool where being wrong is not a cosmetic
 * problem. An SVG is a program, and the result of this one is BOTH inserted
 * into the visitor's own page and downloaded and sent to other people. So the
 * tests below are mostly a list of things that must not come out the other
 * side, written one per line so that a future reader can see the policy
 * without reading the implementation.
 *
 * The rule the module is built on is that nothing is inspected for danger:
 * a new tree is built out of a whitelist, so an attribute is dropped because
 * it was not asked for rather than because somebody recognised it. These tests
 * check that rule holds rather than checking a list of known attacks - the
 * known attacks are here too, but they are the examples, not the point.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ALLOWED, LIMITS, importSvg, serialise, toPath,
} from '../../tools/compare-heights/src/import-svg.js';

/** A node, the shape main.js hands over after the browser has parsed the file. */
const node = (tag, attrs = {}, children = []) => ({ tag, attrs, children });
const svg = (...children) => node('svg', { viewBox: '0 0 10 10' }, children);
const out = (tree) => importSvg(tree).markup ?? '';

/* --------------------------------------------------------- what gets through */

test('a path keeps its geometry', () => {
  const result = importSvg(svg(node('path', { d: 'M0 0L10 10Z' })));
  assert.equal(result.shapes, 1);
  assert.match(result.markup, /<path d="M0 0L10 10Z"\/>/);
});

test('every shape becomes a path, so what ships is one kind of element', () => {
  const markup = out(svg(
    node('rect', { x: '1', y: '2', width: '4', height: '6' }),
    node('circle', { cx: '5', cy: '5', r: '3' }),
    node('ellipse', { cx: '5', cy: '5', rx: '3', ry: '2' }),
    node('polygon', { points: '0,0 4,0 4,4' }),
    node('polyline', { points: '0,0 4,4' }),
    node('line', { x1: '0', y1: '0', x2: '4', y2: '4' }),
  ));
  assert.equal((markup.match(/<path /g) ?? []).length, 6);
  assert.ok(!/<rect|<circle|<ellipse|<polygon|<polyline|<line/.test(markup));
});

test('a rounded rectangle keeps its corners', () => {
  // Squaring them off would be the tool quietly editing somebody's drawing.
  const d = toPath('rect', { x: '0', y: '0', width: '10', height: '10', rx: '2' });
  assert.match(d, /A2 2 /);
  assert.equal(toPath('rect', { x: '0', y: '0', width: '10', height: '10' }),
               'M0 0h10v10h-10Z');
});

test('a shape with no size is not a shape', () => {
  assert.equal(toPath('rect', { width: '0', height: '5' }), null);
  assert.equal(toPath('circle', { r: '0' }), null);
  assert.equal(toPath('ellipse', { rx: '4', ry: '0' }), null);
  assert.equal(toPath('polygon', { points: '' }), null);
});

test('nesting and transforms survive, because that is where the shape is', () => {
  const markup = out(svg(node('g', { transform: 'translate(3 4) scale(2)' },
                               [node('path', { d: 'M0 0h1v1Z' })])));
  assert.match(markup, /<g transform="translate\(3 4\) scale\(2\)">/);
  assert.match(markup, /<path d="M0 0h1v1Z"\/>/);
});

test('fill-rule survives, so a shape with holes keeps them', () => {
  assert.match(out(svg(node('path', { d: 'M0 0h9v9Z', 'fill-rule': 'evenodd' }))),
               /fill-rule="evenodd"/);
  // And a made-up value does not.
  assert.ok(!out(svg(node('path', { d: 'M0 0h9v9Z', 'fill-rule': 'url(#x)' })))
    .includes('fill-rule'));
});

/* ------------------------------------------------------ what does not get out */

test('nothing executable survives', () => {
  for (const bad of [
    node('script', {}, []),
    node('foreignObject', {}, [node('path', { d: 'M0 0h9v9Z' })]),
    node('a', { href: 'https://example.com' }, [node('path', { d: 'M0 0h9v9Z' })]),
    node('style', {}, []),
    node('animate', {}, []),
    node('set', {}, []),
  ]) {
    const markup = out(svg(bad, node('path', { d: 'M1 1h2v2Z' })));
    // `<` and the name, not the bare name: `a` is a letter in `path`.
    assert.ok(!markup.includes(`<${bad.tag}`), `${bad.tag} survived`);
    assert.match(markup, /M1 1h2v2Z/, 'and the real shape beside it still did');
  }
});

test('no event handler survives, whatever it is called', () => {
  const handlers = ['onload', 'onclick', 'onmouseover', 'onbegin', 'onfocusin', 'oncanplay'];
  const markup = out(svg(node('path',
    Object.assign({ d: 'M0 0h9v9Z' }, Object.fromEntries(
      handlers.map((name) => [name, 'alert(1)']))))));
  for (const name of handlers) assert.ok(!markup.includes(name), `${name} survived`);
  assert.ok(!markup.includes('alert'));
});

test('nothing that could fetch survives', () => {
  // The sharpest one: the chart is downloaded and opened on other machines,
  // so a reference that lived would be somebody else's browser calling a
  // stranger's server, days later, from a file this page wrote.
  const markup = out(svg(
    node('image', { href: 'https://example.com/x.png', width: '9', height: '9' }),
    node('use', { href: '#other', 'xlink:href': 'other.svg#x' }),
    node('path', { d: 'M0 0h9v9Z', href: 'https://example.com', 'xlink:href': 'x' }),
  ));
  assert.ok(!markup.includes('href'), 'an href survived');
  assert.ok(!markup.includes('example.com'));
  assert.ok(!markup.includes('<image'));
  assert.ok(!markup.includes('<use'));
});

test('no styling survives, so nothing can import a stylesheet or a font', () => {
  const markup = out(svg(node('path', {
    d: 'M0 0h9v9Z',
    style: 'fill:url(https://example.com/x)',
    class: 'whatever',
    fill: 'url(#gradient)',
    filter: 'url(#f)',
    mask: 'url(#m)',
    'clip-path': 'url(#c)',
  })));
  assert.match(markup, /<path d="M0 0h9v9Z"\/>/);
  for (const gone of ['style', 'class', 'fill=', 'filter', 'mask', 'clip-path', 'url(']) {
    assert.ok(!markup.includes(gone), `${gone} survived`);
  }
});

test('an id does not survive, so nothing in the chart can be referenced', () => {
  assert.ok(!out(svg(node('path', { d: 'M0 0h9v9Z', id: 'x' }))).includes('id='));
});

test('a value that is not geometry is dropped even where the name is allowed', () => {
  // `transform` is on the whitelist and cannot hold a script - but a value
  // that reaches the page should have been read by something first.
  const markup = out(svg(node('g', { transform: 'translate(1 2)"><script>x</script><g x="' },
                              [node('path', { d: 'M0 0h9v9Z' })])));
  assert.ok(!markup.includes('script'));
  assert.ok(!markup.includes('transform'), 'the whole value went, not part of it');
});

test('a path whose d is not path data is dropped', () => {
  assert.equal(toPath('path', { d: 'M0 0 <script>' }), null);
  assert.equal(importSvg(svg(node('path', { d: 'javascript:alert(1)' }))).error, 'svg.noshapes');
});

test('the whitelist is the policy, and it holds no way out', () => {
  // If a name gets added to ALLOWED in future, this is the test that asks
  // whether it can carry a URL, a script or a selector.
  const names = new Set(Object.values(ALLOWED).flat());
  for (const name of names) {
    assert.ok(!/href|src|style|class|^id$|filter|mask|clip-path|^on/i.test(name),
              `${name} should not be on the whitelist`);
  }
  assert.ok(!Object.keys(ALLOWED).some((tag) => /script|foreign|image|use|style|a/.test(tag)
    && tag !== 'path'), 'no executable or fetching element is allowed');
});

/* ------------------------------------------------------------------ the edges */

test('a file with nothing drawable in it says so rather than drawing nothing', () => {
  assert.equal(importSvg(svg()).error, 'svg.noshapes');
  assert.equal(importSvg(svg(node('script', {}, []))).error, 'svg.noshapes');
  assert.equal(importSvg(null).error, 'svg.noshapes');
  assert.equal(importSvg(node('html', {}, [])).error, 'svg.noshapes');
});

test('an empty group does not survive its contents being thrown away', () => {
  const markup = out(svg(node('g', {}, [node('script', {}, [])]),
                         node('path', { d: 'M0 0h9v9Z' })));
  assert.equal((markup.match(/<g/g) ?? []).length, 1, 'only the root wrapper');
});

test('a file too big to be a shape is refused rather than drawn slowly', () => {
  const many = Array.from({ length: LIMITS.elements + 50 },
                          () => node('path', { d: 'M0 0h9v9Z' }));
  const result = importSvg(svg(...many));
  assert.ok(result.shapes <= LIMITS.elements, 'the element cap held');

  const huge = node('path', { d: `M0 0${'l1 1'.repeat(LIMITS.path)}Z` });
  assert.equal(importSvg(svg(huge)).error, 'svg.toobig');
});

test('what comes out is escaped, so it cannot end an attribute of ours', () => {
  assert.equal(serialise({ tag: 'path', attrs: { d: 'M0 0"><x' } }),
               '<path d="M0 0&quot;&gt;&lt;x"/>');
});
