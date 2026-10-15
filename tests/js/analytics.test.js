/** The measurement boundary may know the page and tool, never their inputs. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const SOURCE = readFileSync(new URL('../../templates/analytics.js', import.meta.url), 'utf8')
  .replaceAll('{{ site.analytics_id }}', 'G-TEST')
  .replaceAll('{{ site.domain }}', 'https://abox.tools/')
  .replaceAll('{{ site.adsense_client }}', 'ca-pub-test')
  .replaceAll('{{ words.plural }}', 'files')
  .replaceAll('{{ words.analytics_extra }}', '');

function page({ slug = 'images-to-video', webdriver = true,
  origin = 'https://abox.tools', search = '', referrer = '', canonical = true } = {}) {
  const context = {
    URL, URLSearchParams,
    navigator: { webdriver },
    location: { origin, search },
    document: {
      title: 'Images to Video',
      referrer,
      querySelector(selector) {
        assert.equal(selector, 'link[rel="canonical"]');
        return canonical ? { href: 'https://abox.tools/images-to-video/' } : null;
      },
      getElementById(id) {
        assert.equal(id, 'feedback');
        return slug === null ? null : { getAttribute: () => slug };
      },
      createElement: () => ({}),
      head: { appendChild() {} },
    },
  };
  context.window = context;
  runInNewContext(SOURCE, context);
  return context;
}

const commands = (p) => Array.from(p.dataLayer,
  (args) => JSON.parse(JSON.stringify([...args])));
const completions = (p) => commands(p).filter((args) => args[1] === 'tool_complete');

test('a page view is not a successful tool use', () => {
  const p = page();
  assert.equal(completions(p).length, 0);
  assert.equal(commands(p).filter((args) => args[0] === 'config').length, 1);
});

test('only static tool identity crosses the completion interface, once per page', () => {
  const p = page();
  p.document.title = 'private-result.png';
  p.aboxToolComplete({ filename: 'private-result.png', text: 'secret', count: 12 });
  p.aboxToolComplete();
  assert.deepEqual(completions(p), [['event', 'tool_complete', {
    send_to: 'G-TEST', tool_slug: 'images-to-video',
  }]]);
});

test('page context drops arbitrary query fields, invitation secrets and referrer paths', () => {
  const p = page({
    search: '?filename=private.png&text=secret&utm_source=reddit&utm_medium=cpc'
      + '&utm_campaign=video&gclid=click-id',
    referrer: 'https://chatgpt.com/c/private-conversation?text=secret#private',
  });
  const config = commands(p).find((args) => args[0] === 'config')[2];
  assert.deepEqual(config, {
    page_location: 'https://abox.tools/images-to-video/?utm_source=reddit&utm_medium=cpc'
      + '&utm_campaign=video&gclid=click-id',
    page_title: 'Images to Video',
    page_referrer: 'https://chatgpt.com/',
  });
});

test('empty or non-web referrers do not invent a source', () => {
  for (const referrer of ['', 'file:///private/document.pdf', 'not a URL']) {
    const p = page({ referrer });
    assert.equal(commands(p).find((args) => args[0] === 'config')[2].page_referrer, '');
  }
});

test('missing pages use a fixed error address rather than inflating the homepage', () => {
  const p = page({ canonical: false, slug: null });
  assert.equal(commands(p).find((args) => args[0] === 'config')[2].page_location,
    'https://abox.tools/404.html');
});

test('prose pages and invalid tool identities have no completion hook', () => {
  for (const slug of [null, '', '../private.png', 'files?name=secret']) {
    assert.equal(page({ slug }).aboxToolComplete, undefined);
  }
});

test('broken measurement cannot break a tool or consume the one-shot completion', () => {
  const p = page();
  const push = p.dataLayer.push;
  p.dataLayer.push = () => { throw new Error('tracking unavailable'); };
  assert.doesNotThrow(() => p.aboxToolComplete());
  p.dataLayer.push = push;
  p.aboxToolComplete();
  assert.equal(completions(p).length, 1);
});

test('automation and preview visits remain disabled for Analytics', () => {
  assert.equal(page()['ga-disable-G-TEST'], true);
  assert.equal(page({ webdriver: false, origin: 'http://localhost:8197' })['ga-disable-G-TEST'], true);
  assert.equal(page({ webdriver: false })['ga-disable-G-TEST'], undefined);
});
