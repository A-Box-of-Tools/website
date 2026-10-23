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
  origin = 'https://abox.tools', search = '', referrer = '', canonical = true,
  workflowSource = null, workflowTargets = [], workflowLinks = [] } = {}) {
  const sourceTag = workflowSource === null ? null : { content: workflowSource };
  const targetTags = workflowTargets.map((content) => ({ content }));
  const context = {
    URL, URLSearchParams,
    workflowSourceTag: sourceTag,
    workflowTargetTags: targetTags,
    navigator: { webdriver },
    location: { origin, search },
    document: {
      title: 'Images to Video',
      referrer,
      querySelector(selector) {
        if (selector === 'meta[name="abox-workflow-source"]') return sourceTag;
        assert.equal(selector, 'link[rel="canonical"]');
        return canonical ? { href: 'https://abox.tools/images-to-video/' } : null;
      },
      querySelectorAll(selector) {
        if (selector === 'meta[name="abox-workflow-target"]') return targetTags;
        assert.equal(selector, 'a[data-workflow-target]');
        return workflowLinks;
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
const events = (p, name) => commands(p).filter((args) => args[1] === name);
const completions = (p) => events(p, 'tool_complete');

function workflowLink(target) {
  let listener;
  return {
    target,
    get href() { throw new Error('A live URL is not measurement data'); },
    get textContent() { throw new Error('Link text may contain a private value'); },
    getAttribute(name) {
      assert.equal(name, 'data-workflow-target');
      return this.target;
    },
    addEventListener(type, callback) {
      assert.equal(type, 'click');
      listener = callback;
    },
    click(event = {}) { listener?.(event); },
  };
}

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

test('tool arrivals share a denominator while lifecycle hooks stay within the pilot', () => {
  for (const slug of ['images-to-video', 'stack-images', 'gif-analyzer', 'split-gif', 'heic-to-jpg']) {
    const p = page({ slug });
    assert.deepEqual(events(p, 'tool_view'), [['event', 'tool_view', {
      send_to: 'G-TEST', tool_slug: slug,
    }]]);
    assert.equal(typeof p.aboxToolJourney, slug === 'heic-to-jpg' ? 'undefined' : 'function');
  }
  assert.equal(events(page({ slug: null }), 'tool_view').length, 0);
});

test('journey accepts only fixed stages and static tool identity once per stage', () => {
  const p = page();
  for (const step of ['input', 'start', 'ready', 'problem', 'cancel']) {
    p.aboxToolJourney(step, { filename: 'private.png', count: 5 });
    p.aboxToolJourney(step);
    assert.deepEqual(events(p, `tool_${step}`), [['event', `tool_${step}`, {
      send_to: 'G-TEST', tool_slug: 'images-to-video',
    }]]);
  }
  const count = commands(p).length;
  for (const invalid of ['constructor', '__proto__', 'complete', 'private.png', '', null,
    1, ['start'], { toString() { throw new Error('Must not coerce a caller value'); } }]) {
    assert.doesNotThrow(() => p.aboxToolJourney(invalid));
  }
  assert.equal(commands(p).length, count);
  assert.equal(completions(p).length, 0);
  p.aboxToolComplete();
  assert.equal(completions(p).length, 1);
  const fresh = page();
  fresh.aboxToolJourney('ready');
  assert.equal(events(fresh, 'tool_ready').length, 1);
});

test('broken measurement does not consume a journey stage or prevent local work', () => {
  const p = page();
  const push = p.dataLayer.push;
  p.dataLayer.push = () => { throw new Error('tracking unavailable'); };
  assert.doesNotThrow(() => p.aboxToolJourney('start'));
  p.dataLayer.push = push;
  p.aboxToolJourney('start');
  p.aboxToolJourney('start');
  assert.equal(events(p, 'tool_start').length, 1);
});

test('workflow links capture only fixed page identities and ignore live URLs and text', () => {
  const link = workflowLink('stack-images');
  const p = page({
    workflowSource: 'guides/stack-photos-to-reduce-noise',
    workflowTargets: ['stack-images'], workflowLinks: [link],
  });
  p.workflowSourceTag.content = 'private-source.png';
  p.workflowTargetTags[0].content = 'private-target.png';
  link.target = 'private-file.png?text=secret';
  link.click();
  link.click();
  assert.deepEqual(events(p, 'workflow_link'), [['event', 'workflow_link', {
    send_to: 'G-TEST',
    source_page: 'guides/stack-photos-to-reduce-noise', target_page: 'stack-images',
  }]]);
});

test('workflow navigation requires a known destination and an unprevented selection', () => {
  const known = workflowLink('gif-to-mp4');
  const unknown = workflowLink('private-output');
  const invalid = workflowLink('../private.png');
  const self = workflowLink('images-to-video');
  const p = page({ workflowSource: 'images-to-video', workflowLinks: [known, unknown, invalid, self] });
  known.click({ defaultPrevented: true });
  unknown.click();
  invalid.click();
  self.click();
  assert.equal(events(p, 'workflow_link').length, 0);
  known.click();
  assert.equal(events(p, 'workflow_link').length, 1);
  const absent = workflowLink('gif-to-mp4');
  assert.equal(events(page({ workflowLinks: [absent] }), 'workflow_link').length, 0);
  absent.click();
});

test('workflow tracking failures never interfere with navigation or consume a selection', () => {
  const link = workflowLink('gif-maker');
  const p = page({ workflowSource: 'guides/turn-images-into-a-video', workflowLinks: [link] });
  const push = p.dataLayer.push;
  p.dataLayer.push = () => { throw new Error('tracking unavailable'); };
  assert.doesNotThrow(() => link.click());
  p.dataLayer.push = push;
  link.click();
  assert.equal(events(p, 'workflow_link').length, 1);
});
