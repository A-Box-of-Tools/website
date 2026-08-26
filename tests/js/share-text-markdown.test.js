/**
 * tools/share-text/src/markdown.js - the renderer that runs on remote text.
 *
 * The page claims that shared text cannot become script on a reader's
 * machine, whoever wrote it. That claim is these tests: raw HTML arrives as
 * escaped text, a javascript: link stays inert, and a quote in a URL cannot
 * break out of its attribute. The ordinary rendering is pinned too, because
 * a renderer that quietly dropped a heading would misrepresent what the
 * sharer wrote.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { renderMarkdown } from '../../tools/share-text/src/markdown.js';

test('the everyday dialect renders', () => {
  assert.equal(renderMarkdown('## Title'), '<h2>Title</h2>');
  assert.equal(
    renderMarkdown('**bold** and *it* and `code`'),
    '<p><strong>bold</strong> and <em>it</em> and <code>code</code></p>',
  );
  assert.equal(
    renderMarkdown('- a\n- b\n\n1. one\n2. two'),
    '<ul><li>a</li><li>b</li></ul><ol><li>one</li><li>two</li></ol>',
  );
  assert.equal(renderMarkdown('> wise words'), '<blockquote>wise words</blockquote>');
  assert.equal(renderMarkdown('---'), '<hr>');
});

test('line breaks inside a paragraph are kept as typed', () => {
  assert.equal(renderMarkdown('one\ntwo'), '<p>one<br>two</p>');
});

test('a fenced block keeps its contents verbatim, escaped', () => {
  assert.equal(
    renderMarkdown('```\n<script>x</script>\n```'),
    '<pre><code>&lt;script&gt;x&lt;/script&gt;</code></pre>',
  );
});

test('an unclosed fence swallows the rest rather than leaking it as markup', () => {
  assert.equal(
    renderMarkdown('```\n# not a heading'),
    '<pre><code># not a heading</code></pre>',
  );
});

test('links open safely, and only for schemes that cannot run script', () => {
  assert.equal(
    renderMarkdown('[site](https://example.com)'),
    '<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">site</a></p>',
  );
  // The dangerous scheme is not linked at all - it stays visible text, so
  // the reader can see exactly what the sharer tried.
  assert.equal(
    renderMarkdown('[bad](javascript:alert(1))'),
    '<p>[bad](javascript:alert(1))</p>',
  );
});

test('raw HTML in shared text arrives as text', () => {
  assert.equal(
    renderMarkdown('<img src=x onerror=alert(1)>'),
    '<p>&lt;img src=x onerror=alert(1)&gt;</p>',
  );
});

test('a quote in a URL cannot break out of the href attribute', () => {
  const out = renderMarkdown('[t](https://x.y/"onmouseover="alert(1))');
  assert.ok(out.includes('href="https://x.y/&quot;onmouseover=&quot;alert(1"'));
  assert.ok(!out.includes('onmouseover="alert'));
});

test('every emitted tag is from the fixed set', () => {
  const kitchen = [
    '# h', '## h', '### h', 'text **b** *i* `c` [l](https://x.y)',
    '> q', '- li', '1. li', '---', '```', 'code', '```',
  ].join('\n');
  const tags = [...renderMarkdown(kitchen).matchAll(/<\/?([a-z0-9]+)[ >]/g)]
    .map((m) => m[1]);
  const allowed = new Set([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'code',
    'pre', 'blockquote', 'ul', 'ol', 'li', 'hr', 'a',
  ]);
  for (const tag of tags) assert.ok(allowed.has(tag), `unexpected <${tag}>`);
});
