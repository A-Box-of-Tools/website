/**
 * One page, one element, one PNG - the before/after shots a visible change owes
 * its pull request.
 *
 * screenshots/capture.mjs is the guides' harness and is recipe-driven: it knows
 * how to drive a tool through a job and writes into a guide's screens/ folder.
 * This is the other thing, the one CLAUDE.md asks for under "Conventions" and
 * does not say how to do - photograph an arbitrary built page, throw the file
 * away after it has been handed over. Same browser and the same protocol as the
 * harness, for the same reason: Edge ships with Windows and there is nothing to
 * install.
 *
 *   node shoot.mjs <url> <out.png> [selector] [width] [height]
 *
 * The selector defaults to `footer`; pass any CSS selector to crop to it, or
 * `body` for the whole page. Width and height default to a desktop window -
 * pass 390 844 for the narrow layout, which is where a sentence with two links
 * in it breaks first.
 *
 * A FRESH PROFILE AND A RANDOM PORT, EVERY RUN. Both matter. A headless Edge
 * left over from an earlier run holds the fixed port, the new launch quietly
 * attaches to the old one, and it answers with the page it already had - which
 * is how an "after" shot comes back showing the "before" and nobody can tell
 * from the image that it is wrong.
 */

import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [url, out, selector = 'footer', w = '1280', h = '900'] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node shoot.mjs <url> <out.png> [selector] [width] [height]');
  process.exit(2);
}
const width = Number(w);
const height = Number(h);

// Spelled out rather than built from %ProgramFiles%: those variables are not
// always exported into the shell an agent runs this from, and the failure - a
// path beginning "undefined\" - reads as if Edge were missing.
const EXE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((exe) => existsSync(exe));
if (!EXE) throw new Error('No Edge to take the screenshot with.');

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));
const port = 9000 + Math.floor(Math.random() * 900);
const profile = await mkdtemp(path.join(tmpdir(), 'shoot-'));

const edge = spawn(EXE, [
  '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars',
  `--window-size=${width},${height}`, 'about:blank',
], { stdio: 'ignore' });

let socketUrl;
for (let tries = 0; tries < 100 && !socketUrl; tries += 1) {
  try {
    const info = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json();
    socketUrl = info.webSocketDebuggerUrl;
  } catch {
    await sleep(100);
  }
}
if (!socketUrl) throw new Error('The browser never opened its DevTools port.');

// The whole DevTools client: one socket, one id counter, one map of replies
// still owed. Node has had a WebSocket built in since 22.
const socket = new WebSocket(socketUrl);
await new Promise((ready, failed) => {
  socket.addEventListener('open', ready, { once: true });
  socket.addEventListener('error', failed, { once: true });
});
let next = 1;
const owed = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (!message.id) return;
  const reply = owed.get(message.id);
  if (!reply) return;
  owed.delete(message.id);
  if (message.error) reply.reject(new Error(message.error.message));
  else reply.resolve(message.result);
});
const send = (method, params = {}, sessionId) => {
  const id = next++;
  socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  return new Promise((resolve, reject) => owed.set(id, { resolve, reject }));
};

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
// Two device pixels per CSS pixel, for the same reason capture.mjs does it: the
// difference between a legible label and a smeared one.
await send('Emulation.setDeviceMetricsOverride',
  { width, height, deviceScaleFactor: 2, mobile: width < 768 }, sessionId);
await send('Page.navigate', { url }, sessionId);
await sleep(2500);

// Everything past here can fail on a bad selector or a page that never
// arrived, and an exit that leaks the browser would leave a stray headless Edge
// behind - so the rest runs inside a finally that always closes it.
let measured;
try {
  measured = await send('Runtime.evaluate', {
  expression: `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error('no element matches ${selector}');
    el.scrollIntoView({ block: 'end' });
    const box = el.getBoundingClientRect();
    return JSON.stringify({
      x: 0,
      y: Math.max(0, box.top + window.scrollY - 16),
      width: document.documentElement.clientWidth,
      height: box.height + 32,
    });
  })()`,
    returnByValue: true,
  }, sessionId);
  // `.text` is only ever the word "Uncaught"; the sentence a reader needs is in
  // the exception itself, and a mistyped selector is the likeliest way to land
  // here.
  if (measured.exceptionDetails) {
    const details = measured.exceptionDetails;
    throw new Error(details.exception?.description ?? details.text);
  }

  const clip = { ...JSON.parse(measured.result.value), scale: 1 };
  const shot = await send('Page.captureScreenshot',
    { format: 'png', clip, captureBeyondViewport: true }, sessionId);
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(`${out}  ${clip.width}x${Math.round(clip.height)}`);
} finally {
  await shutDown();
}
process.exit(0);

/**
 * Edge is a tree, and `edge.kill()` fells only the trunk it can see. The
 * browser process re-parents itself away from the one Node spawned, so the
 * renderers, the GPU process and the crash handler all outlive the kill and
 * take the browser with them - nineteen live browsers after a morning of
 * shooting, holding their profiles open and a few gigabytes with them.
 *
 * `Browser.close` over the protocol is the version that actually works, because
 * the browser shuts its own children down on the way out. taskkill /T is the
 * fallback for a browser too wedged to answer.
 */
async function shutDown() {
  try {
    await Promise.race([send('Browser.close'), sleep(3000)]);
  } catch {
    // Already gone, or never answered - the fallback below settles it.
  }
  try { socket.close(); } catch { /* already closed */ }
  if (edge.pid) {
    spawn('taskkill', ['/PID', String(edge.pid), '/T', '/F'], { stdio: 'ignore' });
  }
  await sleep(400);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}
