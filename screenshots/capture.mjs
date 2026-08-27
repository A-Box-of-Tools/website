/**
 * Screenshots for the guides.
 *
 * A guide explains which setting to move and what it costs. A picture of that
 * setting is worth a paragraph, and the only honest way to get one is to drive
 * the real tool: every image under pages/guides/<guide>/screens/ was taken by
 * loading the built page, handing it a file, and photographing what the tool
 * did with it. Nothing here is mocked up, so a screenshot cannot promise a
 * control the tool has not got.
 *
 * It needs a build to photograph and serves its own: dist/ comes off a server
 * in this process, and a headless Edge is driven over the DevTools protocol -
 * the same browser og-image.ps1 already leans on, for the same reason, that it
 * ships with Windows and there is nothing to install. No dependency and no
 * lockfile, which is the rule everywhere else here and worth keeping in a dev
 * script too.
 *
 *   node screenshots/capture.mjs                  every guide that has a recipe
 *   node screenshots/capture.mjs resize-an-image  one guide
 *
 * A recipe is one file per guide under screenshots/recipes/, and its `run`
 * bodies execute IN THE PAGE rather than here - they are serialised and
 * evaluated, so they may use only what the browser has plus the helpers in
 * inpage.js.
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.dirname(HERE);
const DIST = path.join(ROOT, 'dist');
const GUIDES = path.join(ROOT, 'pages', 'guides');

// What the prose column is, doubled. A guide is 68ch wide - about 600px - and
// is read on a screen with two device pixels for each of them. Capturing at
// twice the size and letting the page scale it back down is the difference
// between a legible label and a smeared one.
const SCALE = 2;

// The window the tools are photographed in. Wide enough that none of them folds
// into its narrow layout - that is a different set of screenshots, and not the
// ones a reader at a desk wants - and tall enough that a result panel is on
// screen without scrolling.
const WIDTH = 860;
const HEIGHT = 1000;

const QUALITY = 82;

// ---------------------------------------------------------------------------
// The browser

const BROWSERS = [
  `${process.env['ProgramFiles(x86)']}\\Microsoft\\Edge\\Application\\msedge.exe`,
  `${process.env.ProgramFiles}\\Microsoft\\Edge\\Application\\msedge.exe`,
  `${process.env['ProgramFiles(x86)']}\\Google\\Chrome\\Application\\chrome.exe`,
  `${process.env.ProgramFiles}\\Google\\Chrome\\Application\\chrome.exe`,
];

function findBrowser() {
  const found = BROWSERS.find((exe) => exe && existsSync(exe));
  if (!found) throw new Error('No Edge or Chrome to take the screenshots with.');
  return found;
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

// A recipe drives a real tool and can wait for something that is never going to
// happen - a button that was renamed, a decode that fails in this browser. With
// no limit that is a run which never ends and says nothing about why.
const PATIENCE = 120000;

const trace = (line) => {
  if (process.env.SHOT_TRACE) console.log(`    · ${line}`);
};

async function within(ms, what, work) {
  let timer;
  try {
    return await Promise.race([
      work,
      new Promise((_, fail) => {
        timer = setTimeout(() => fail(new Error(`gave up waiting: ${what}`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Wait for the DevTools endpoint to answer, which is how we know it is up. */
async function browserSocket(port) {
  for (let tries = 0; tries < 100; tries += 1) {
    try {
      const answer = await fetch(`http://127.0.0.1:${port}/json/version`);
      const info = await answer.json();
      if (info.webSocketDebuggerUrl) return info.webSocketDebuggerUrl;
    } catch {
      // Not listening yet.
    }
    await sleep(100);
  }
  throw new Error('The browser never opened its DevTools port.');
}

// ---------------------------------------------------------------------------
// The DevTools protocol, in as little code as it takes
//
// One socket, one id counter, one map of replies still owed. Node has had a
// WebSocket client built in since 22, so this is the whole client.

class Devtools {
  constructor(socket) {
    this.socket = socket;
    this.next = 1;
    this.owed = new Map();
    this.waiting = new Map();
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const reply = this.owed.get(message.id);
        if (!reply) return;
        this.owed.delete(message.id);
        if (message.error) reply.reject(new Error(message.error.message));
        else reply.resolve(message.result);
        return;
      }
      const handlers = this.waiting.get(message.method) ?? [];
      this.waiting.set(message.method, []);
      for (const handler of handlers) handler(message.params);
    });
  }

  static async open(url) {
    const socket = new WebSocket(url);
    await new Promise((ready, failed) => {
      socket.addEventListener('open', ready, { once: true });
      socket.addEventListener('error', failed, { once: true });
    });
    return new Devtools(socket);
  }

  send(method, params = {}, sessionId) {
    const id = this.next++;
    const message = { id, method, params };
    if (sessionId) message.sessionId = sessionId;
    this.socket.send(JSON.stringify(message));
    return new Promise((resolve, reject) => {
      this.owed.set(id, { resolve, reject });
    });
  }

  once(method) {
    return new Promise((resolve) => {
      const handlers = this.waiting.get(method) ?? [];
      handlers.push(resolve);
      this.waiting.set(method, handlers);
    });
  }
}

// ---------------------------------------------------------------------------
// The site, served from this process
//
// The tools are ES modules and register service workers, so file:// is not an
// option - they need a real origin. Serving dist/ here rather than shelling out
// to serve.ps1 keeps the capture one command, and keeps it off whichever port
// the author happens to be reading the site on.

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

function serve(port) {
  const server = createServer(async (request, response) => {
    const asked = decodeURIComponent(new URL(request.url, 'http://x').pathname);
    let file = path.join(DIST, asked);
    if (asked.endsWith('/')) file = path.join(file, 'index.html');
    // A path that climbs out of dist/ is a bug in a recipe, not a request worth
    // answering.
    if (!file.startsWith(DIST)) {
      response.writeHead(403).end();
      return;
    }
    try {
      const body = await readFile(file);
      response.writeHead(200, {
        'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
      });
      response.end(body);
    } catch {
      response.writeHead(404, { 'content-type': 'text/plain' }).end('not here');
    }
  });
  return new Promise((ready) => {
    server.listen(port, '127.0.0.1', () => ready(server));
  });
}

// ---------------------------------------------------------------------------
// Taking one picture

async function evaluate(cdp, session, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression, awaitPromise: true, returnByValue: true,
  }, session);
  if (result.exceptionDetails) {
    const thrown = result.exceptionDetails.exception;
    throw new Error(thrown?.description ?? thrown?.value ?? 'the page threw');
  }
  return result.result.value;
}

async function capture(cdp, session, origin, recipe, shot, helpers) {
  // A shot may name its own tool. Most guides are about one, and say so once at
  // the top of the recipe; the ones about getting from one tool to the next are
  // about three, and a screenshot of a workflow that never leaves the first
  // page would be a screenshot of half of it.
  const target = shot.tool ?? recipe.tool;
  const loaded = cdp.once('Page.loadEventFired');
  trace(`opening /${target}/`);
  await cdp.send('Page.navigate', { url: `${origin}/${target}/` }, session);
  await within(30000, 'the page to load', loaded);

  // The helpers, then the recipe's own body, both in the page. `run` arrives
  // as source text: it was written in a module on this side and has never been
  // a function in the browser until now.
  trace('handing over the helpers');
  await evaluate(cdp, session, helpers);
  // A recipe may export `helpers`, and several do: two shots of the same tool
  // usually set it up the same way, and the setup is the half worth reading
  // once rather than twice. They are declared around the shot's own body rather
  // than sent over separately, so `run` closes over them exactly as it appears
  // to in the file it was written in.
  trace('running the recipe');
  const shared = [
    // Plain values a recipe wants on the other side: a sample document, a
    // string of JSON. Same reasoning as the helpers - what the tool is being
    // handed is worth reading at the top of the recipe rather than buried in
    // the middle of a shot.
    ...Object.entries(recipe.data ?? {})
      .map(([name, value]) => `const ${name} = ${JSON.stringify(value)};`),
    ...Object.entries(recipe.helpers ?? {})
      .map(([name, work]) => `const ${name} = ${work.toString()};`),
  ].join('\n');
  await within(PATIENCE, `${shot.name} to finish`, evaluate(cdp, session,
    `(async () => {\n${shared}\nreturn (${shot.run.toString()})(window.__shot);\n})()`));

  trace('measuring');
  const box = await evaluate(
    cdp, session, `window.__shot.box(${JSON.stringify(shot.clip)})`);
  const { data } = await cdp.send('Page.captureScreenshot', {
    format: 'webp',
    quality: QUALITY,
    clip: { ...box, scale: SCALE },
    captureBeyondViewport: true,
  }, session);

  const dir = path.join(GUIDES, recipe.guide, 'screens');
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(data, 'base64');
  await writeFile(path.join(dir, `${shot.name}.webp`), bytes);
  return {
    bytes: bytes.length,
    width: Math.round(box.width * SCALE),
    height: Math.round(box.height * SCALE),
  };
}

// ---------------------------------------------------------------------------

async function main() {
  const only = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  if (!existsSync(DIST)) {
    throw new Error('dist/ is not there. Run `python build.py` first.');
  }

  const guides = (await readdir(path.join(HERE, 'recipes')))
    .filter((name) => name.endsWith('.mjs'))
    .map((name) => name.replace(/\.mjs$/, ''))
    .filter((name) => !only.length || only.includes(name))
    .sort();
  if (!guides.length) throw new Error('No recipe matched.');

  const helpers = await readFile(path.join(HERE, 'inpage.js'), 'utf8');
  const port = 8200 + (process.pid % 300);
  const server = await serve(port);
  const origin = `http://127.0.0.1:${port}`;
  const profile = path.join(tmpdir(), `abox-shots-${process.pid}`);
  const debugPort = port + 1000;

  const browser = spawn(findBrowser(), [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--no-first-run', '--no-default-browser-check',
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${debugPort}`,
    // The tools decode video and audio, and a headless browser without this
    // will not start a media element on its own.
    '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ], { stdio: 'ignore' });

  let failures = 0;
  let cdp;
  try {
    cdp = await Devtools.open(await browserSocket(debugPort));
    const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await cdp.send(
      'Target.attachToTarget', { targetId, flatten: true });
    await cdp.send('Page.enable', {}, sessionId);
    await cdp.send('Runtime.enable', {}, sessionId);
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false,
    }, sessionId);
    // Light, because that is what site.css is before a reader's own setting
    // moves it, and a headless browser defaults to the other one.
    await cdp.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'light' }],
    }, sessionId);

    for (const guide of guides) {
      const recipe = await import(`./recipes/${guide}.mjs`);
      for (const shot of recipe.shots) {
        try {
          const made = await capture(
            cdp, sessionId, origin, { ...recipe, guide }, shot, helpers);
          const kb = (made.bytes / 1024).toFixed(0);
          console.log(`  ${guide}/${shot.name}  ${made.width}x${made.height}  ${kb}kB`);
        } catch (error) {
          failures += 1;
          console.log(`  ${guide}/${shot.name}  FAILED: ${error.message}`);
        }
      }
    }
  } finally {
    // Ask the browser to go rather than killing the process we started. A
    // headless Edge is a dozen processes and only one of them is ours, so
    // kill() leaves the renderers, the GPU process and the network service
    // running - they hold the profile open, and enough runs of that eats the
    // machine. kill() stays as the answer for a browser too wedged to be asked.
    await cdp?.send('Browser.close').catch(() => {});
    await sleep(300);
    browser.kill();
    server.close();
    await rm(profile, { recursive: true, force: true }).catch(() => {});
  }
  if (failures) process.exitCode = 1;
}

await main();
