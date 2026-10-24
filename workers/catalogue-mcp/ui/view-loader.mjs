import { decodeUtf8Data } from './view-data.mjs';

// The build fixes these values in the pinned bootstrap, independently of the
// inert data attributes, before a browser can turn the data into a module.
const expectedBytes = __APP_MODULE_BYTES__;
const expectedSha256 = __APP_MODULE_SHA256__;
let finished = false;
let timer;

function cleanUp() {
  clearTimeout(timer);
  window.removeEventListener('error', onScriptError);
  window.removeEventListener('securitypolicyviolation', onPolicyViolation);
}

function fail() {
  if (finished) return;
  finished = true;
  cleanUp();
  for (const control of document.querySelectorAll('input, select, button')) control.disabled = true;
  document.getElementById('loading-module').hidden = true;
  document.getElementById('loading-catalogue').hidden = true;
  document.getElementById('connecting').hidden = true;
  document.getElementById('module-failed').hidden = false;
}

function onScriptError(event) {
  if (!event.filename || event.filename === document.URL) fail();
}

function onPolicyViolation(event) {
  // A library may probe eval, catch its rejection and use its interpreter.
  // Only rejection of this inline module means the App could not be loaded.
  if (event.blockedURI === 'inline' && event.effectiveDirective.startsWith('script-src')) fail();
}

async function start() {
  try {
    if (typeof globalThis.crypto?.subtle?.digest !== 'function') throw new TypeError('Native SHA-256 is unavailable');
    const data = document.getElementById('app-module-data');
    if (data.dataset.encoding !== 'gzip-base64' || Number(data.dataset.bytes) !== expectedBytes
        || data.dataset.sha256 !== expectedSha256) throw new TypeError('Unexpected App build metadata');
    const source = await decodeUtf8Data(data.textContent, expectedBytes);
    const bytes = new TextEncoder().encode(source);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    const sha256 = btoa(String.fromCharCode(...new Uint8Array(digest)));
    if (bytes.byteLength !== expectedBytes || sha256 !== expectedSha256) throw new TypeError('App build integrity mismatch');
    const module = document.createElement('script');
    module.type = 'module';
    module.textContent = source;
    module.onerror = fail;
    module.onload = () => {
      if (finished) return;
      finished = true;
      cleanUp();
      document.getElementById('loading-module').hidden = true;
    };
    window.addEventListener('error', onScriptError);
    window.addEventListener('securitypolicyviolation', onPolicyViolation);
    timer = setTimeout(() => {
      if (document.body.dataset.appModuleStarted === 'true') {
        clearTimeout(timer);
      } else fail();
    }, 10000);
    document.body.append(module);
  } catch {
    // Hosts may impose Trusted Types or stricter script policies. Keep their
    // restrictions and the ordinary public-site fallback instead of bypassing them.
    fail();
  }
}

await start();
