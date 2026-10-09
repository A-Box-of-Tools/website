/** UI wiring and the two roles: the sharer's tab, and a reader's. */

import { phrase } from './shared/phrases.js';
import { wireHelpTooltip } from './shared/help-tooltip.js';
import { renderMarkdown } from './markdown.js';
import { CODE_PATTERN, formatSize, makeCode, normalize } from './names.js';
import { rtcConfig, makeShareUrl, isLocalLink, localDescription, allowedCandidate } from './network.js';
import { cleanFileList, beginFile, appendFileChunk, finishFile } from './receive-file.js';
import { watchDiscovery } from './discovery.js';
import { clipboardFeedback } from './shared/clipboard-feedback.js';
import { fileSender, FILE_CHANNEL } from './send-file.js';

// The one address this tool contacts, named in this page's
// Content-Security-Policy: the rendezvous that introduces the two browsers.
// It carries WebRTC negotiation and nothing else - the text and the files
// travel the direct channel it sets up. See workers/rendezvous/ in the
// repository for the whole of what runs there. A subdomain of the site rather
// than the worker's workers.dev name: that whole domain is blocked inside
// mainland China, and this one is not.
const RENDEZVOUS = 'wss://rendezvous.abox.tools';

// A direct connection is what this page is, and it is also what a minority of
// network pairs cannot make: a phone on a carrier's address-sharing network
// and a laptop behind a strict router have no path a STUN server can
// discover. For that case, and only after the direct attempt has failed, the
// reader may ask for a relay. The rendezvous mints a short-lived credential
// for Cloudflare's TURN service, the reader redials with it, and the relay
// forwards the DTLS-encrypted bytes it cannot read - the same ciphertext the
// direct path carries. It is the reader's choice, made on the reader's page,
// and the sharer's side of the exchange does not change: its bytes still go
// to that one reader and nowhere else, the way they would if the reader sat
// behind a VPN. The choice rides a reload so the redial is a fresh socket
// and a fresh peer connection rather than a renegotiation of a failed one.
const RELAY_FLAG = (code) => `share-text-relay:${code}`;
const RELAY_WAIT = 5000;

const wsUrl = (code, role, advertise = false) => `${RENDEZVOUS}/ws/${code}?role=${role}${advertise ? '&local=1&discover=1' : ''}`;
const shareUrl = (code) => makeShareUrl(location.href, code, isLocal);

const MAX_FILE = 200 * 1024 * 1024;
const MAX_FILES = 256;

const $ = (id) => document.getElementById(id);

const sizeUnits = {
  b: phrase('units.b'),
  kb: phrase('units.kb'),
  mb: phrase('units.mb'),
};
const fmtSize = (n) => formatSize(n, sizeUnits);

/* ------------------------------------------------------------- the sharer */

let sock = null;
let keepalive = 0;
let attempts = 0;
let suggestion = '';
let isPrivate = true;        // captured when sharing starts
let isLocal = isLocalLink(location.href);
let isDiscoverable = false;
let discovery = null;
let discoveryState = 'connecting';
let foundShares = [];
const withdrawing = new Set();
let announcementTimer = 0;
const peers = new Map();     // viewer id -> RTCPeerConnection
const channels = new Map();  // viewer id -> RTCDataChannel receiving the share
const pending = new Map();   // viewer id -> {dc, row} waiting to be let in
const attached = new Map();  // file id -> File, the sharer's selection
const sendQueue = new Map(); // viewer id -> its bounded file sender

const payload = () => JSON.stringify({ type: 'text', body: $('text').value, md: $('markdown').checked });

const STORE = 'share-text-draft';
const STORE_ONEOFF = 'share-text-oneoff';
const STORE_MD = 'share-text-md';

function persist() {
  try {
    if ($('oneoff').checked) localStorage.removeItem(STORE);
    else localStorage.setItem(STORE, $('text').value);
  } catch {} // storage can be unavailable; the page still works, it just forgets
}

function restore() {
  try {
    $('markdown').checked = localStorage.getItem(STORE_MD) === '1';
    $('oneoff').checked = localStorage.getItem(STORE_ONEOFF) === '1';
    if (!$('oneoff').checked) {
      const saved = localStorage.getItem(STORE);
      if (saved !== null) $('text').value = saved;
    }
  } catch {}
  updateEditor();
}

// There is no preview mode. With markdown on, the rendered result sits
// beside the editor (below it on a narrow screen) and re-renders on every
// keystroke; the toggle is the only control. An empty document keeps the
// whole width - the pane earns its half with the first keystroke.
function updateEditor() {
  const body = $('text').value;
  const on = $('markdown').checked && body.trim() !== '';
  $('live').hidden = !on;
  $('live').innerHTML = on ? renderMarkdown(body) : '';
}

function suggest() {
  suggestion = makeCode();
  $('code').value = suggestion;
}

function unlock() {
  linkCopy.invalidate();
  isDiscoverable = false;
  $('publish').hidden = false;
  setShareState();
  renderDiscovery();
  $('code').disabled = false;
  $('suggest').disabled = false;
  $('private').disabled = false;
  $('local').disabled = false;
  $('discoverable').disabled = !$('local').checked;
  $('discovery-share-status').textContent = '';
  $('stop').hidden = true;
  $('linkrow').hidden = true;
  $('requests').textContent = '';
  pending.clear();
}

function setShareState(key = '') {
  $('share-state').hidden = !key;
  $('share-state').textContent = key ? phrase(key) : '';
}

function setStatus(text, warn = false) {
  $('status').textContent = text;
  $('status').classList.toggle('warn', warn);
}

function refreshCount() {
  if (!$('publish').hidden) return;
  const n = channels.size;
  const w = pending.size;
  if (n === 0 && w === 0) {
    setStatus(phrase(isLocal ? 'share.local-waiting' : 'share.waiting'));
    return;
  }
  const parts = [n === 1 ? phrase('share.reader-count.one') : phrase('share.reader-count.many', { n })];
  if (w > 0) parts.push(w === 1 ? phrase('share.knock-count.one') : phrase('share.knock-count.many', { n: w }));
  setStatus(`${parts.join(', ')}. ${phrase('share.closing-note')}`);
}

// Admission survives a reader's language switch: each admitted channel gets
// a token, and a knock that carries a valid one is let straight back in -
// so switching languages does not knock on the sharer's door twice. The
// tokens live only in this tab's memory and die with the share.
const admitTokens = new Set();

function admitViewer(id, dc) {
  channels.set(id, dc);
  const token = crypto.randomUUID();
  admitTokens.add(token);
  try {
    dc.send(JSON.stringify({ type: 'token', token }));
    dc.send(payload());
    dc.send(filesMsg());
  } catch {}
  refreshCount();
}

function addRequest(id, dc, note) {
  const row = document.createElement('div');
  row.className = 'request';
  const text = document.createElement('span');
  text.textContent = note === '' ? phrase('share.no-message') : `“${note}”`;
  const admit = document.createElement('button');
  admit.type = 'button';
  admit.textContent = phrase('share.admit');
  admit.onclick = () => {
    pending.delete(id);
    row.remove();
    admitViewer(id, dc);
  };
  const deny = document.createElement('button');
  deny.type = 'button';
  deny.className = 'ghost';
  deny.textContent = phrase('share.deny');
  deny.onclick = () => {
    pending.delete(id);
    row.remove();
    try { dc.send(JSON.stringify({ type: 'denied' })); } catch {}
    // Let the refusal arrive before the channel under it is torn down.
    setTimeout(() => { peers.get(id)?.close(); peers.delete(id); }, 250);
    refreshCount();
  };
  row.append(text, admit, deny);
  pending.set(id, { dc, row });
  // A carried admission token can belong to a previous share with this name.
  // Acknowledging the pending knock distinguishes a person's decision from
  // a peer channel that has stopped delivering its first response.
  try { dc.send(JSON.stringify({ type: 'asked' })); } catch {}
  $('requests').append(row);
  refreshCount();
}

function removeRequest(id) {
  const entry = pending.get(id);
  if (entry) { entry.row.remove(); pending.delete(id); }
}

function dropViewer(id) {
  if (peers.has(id)) { peers.get(id).close(); peers.delete(id); }
  channels.delete(id);
  sendQueue.get(id)?.close();
  sendQueue.delete(id);
  removeRequest(id);
  refreshCount();
}

function broadcast() {
  if ($('publish').hidden === false) return;
  for (const dc of channels.values()) { try { dc.send(payload()); } catch {} }
}

/* --------------------------------------------------------------- the files */

const filesMsg = () => JSON.stringify({
  type: 'files', fileChannels: true,
  list: [...attached].map(([id, f]) => ({ id, name: f.name, size: f.size })),
});

function broadcastFiles() {
  if ($('publish').hidden === false) return;
  for (const dc of channels.values()) { try { dc.send(filesMsg()); } catch {} }
}

function renderAttachlist() {
  const box = $('attachlist');
  box.textContent = '';
  for (const [id, f] of attached) {
    const row = document.createElement('div');
    row.className = 'filerow';
    const name = document.createElement('span');
    name.className = 'fname';
    name.textContent = f.name;
    const size = document.createElement('span');
    size.className = 'fsize';
    size.textContent = fmtSize(f.size);
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'ghost';
    del.textContent = phrase('share.remove-file');
    del.onclick = () => { attached.delete(id); renderAttachlist(); broadcastFiles(); };
    row.append(name, size, del);
    box.append(row);
  }
}

/* ----------------------------------------------------- local discovery */

function renderDiscovery() {
  const hosting = $('publish').hidden;
  $('discovery').hidden = hosting;
  const ownCode = hosting ? normalize($('code').value) : '';
  const shares = foundShares.filter((share) => share.code !== ownCode && !withdrawing.has(share.code));
  const list = $('discovery-list');
  list.textContent = '';
  for (const [index, share] of shares.entries()) {
    const row = document.createElement('div');
    row.className = 'discovery-row';
    const name = document.createElement('span');
    name.className = 'discovery-code';
    name.id = `discovery-code-${index}`;
    name.textContent = share.code;
    const open = document.createElement('a');
    open.className = 'discovery-open';
    open.href = makeShareUrl(location.href, share.code, true);
    // Opening a listed share must not end this tab's own share or draft.
    open.target = '_blank';
    open.rel = 'noopener';
    open.setAttribute('aria-describedby', name.id);
    open.textContent = phrase('discovery.open');
    row.append(name, open);
    list.append(row);
  }
  const state = discoveryState === 'ready' ? (shares.length ? 'ready' : 'empty') : discoveryState;
  $('discovery-status').textContent = phrase(`discovery.${state}`);
}

function startDiscovery() {
  discovery = watchDiscovery(`${RENDEZVOUS}/discover`, {
    list(shares) {
      // A snapshot already in flight can arrive after Stop. Keep its code
      // out of the list until the directory confirms that it is gone.
      for (const code of withdrawing) {
        if (!shares.some((share) => share.code === code)) withdrawing.delete(code);
      }
      foundShares = shares;
      renderDiscovery();
    },
    status(state) { discoveryState = state; renderDiscovery(); },
    publication(state) {
      $('discovery-share-status').textContent = state && isDiscoverable && $('publish').hidden
        ? phrase(`discovery.${state}`) : '';
    },
  });
  $('discovery-refresh').addEventListener('click', () => discovery.refresh());
}

$('local').addEventListener('change', () => {
  $('discoverable').disabled = !$('local').checked;
});
wireHelpTooltip($('discoverable-help'));
wireHelpTooltip($('tool-version-help'));

/* ------------------------------------------------- the sharer's connection */

function hostSocket(code, onOpen) {
  const ws = new WebSocket(wsUrl(code, 'host', isLocal && isDiscoverable));
  sock = ws;
  let pulse = 0;
  ws.onopen = () => {
    if (sock !== ws) { ws.close(1000); return; }
    pulse = setInterval(() => { if (ws.readyState === 1) ws.send('ping'); }, 30000);
    keepalive = pulse;
    setShareState('share.active');
    onOpen();
    if (isDiscoverable) {
      $('discovery-share-status').textContent = phrase('discovery.publishing');
      announcementTimer = setTimeout(() => {
        if (sock === ws && isDiscoverable) $('discovery-share-status').textContent = phrase('discovery.not-published');
      }, 8000);
    }
  };
  ws.onmessage = (e) => {
    if (sock !== ws) return;
    if (e.data === 'pong') return;
    const m = JSON.parse(e.data);
    if (m.type === 'host-ready' && isLocal && isDiscoverable && m.discovery?.code === code) {
      if (discovery?.publish(code, m.discovery.lease)) clearTimeout(announcementTimer);
      return;
    }
    if (m.type === 'leave') {
      // The reader's page never closes its rendezvous socket on purpose, so
      // a leave means the reader is gone. The peer channel's own close event
      // can lag an abrupt tab-close by half a minute; this does not.
      dropViewer(m.id);
      return;
    }
    if (m.type === 'signal') hostSignal(m.from, m.data);
  };
  ws.onclose = (e) => {
    // Stopping and starting can replace the socket before the old close
    // arrives. That close belongs to its own room and its own heartbeat.
    clearInterval(pulse);
    if (sock !== ws) return;
    clearTimeout(announcementTimer);
    discovery?.unpublish();
    if (e.code === 4409) {
      withdrawing.delete(code);
      // A collision on our own suggestion is bad luck, silently retried; a
      // collision on a name the user chose is theirs to resolve.
      if ($('code').value === suggestion && attempts < 3) { attempts += 1; suggest(); publish(); return; }
      unlock();
      setStatus(phrase('share.name-taken', { name: $('code').value }));
      return;
    }
    if (e.code === 1000 || $('publish').hidden === false) return;
    // Connected readers are unaffected - the peer channels do not run
    // through the server - but new ones cannot join until this recovers.
    setStatus(phrase('share.lost-rendezvous'), true);
    setTimeout(() => {
      if ($('publish').hidden && sock === ws) hostSocket(code, refreshCount);
    }, 5000);
  };
}

function publish() {
  const code = normalize($('code').value);
  if (code === '') {
    setStatus(phrase('share.name-first'));
    return;
  }
  $('code').value = code;
  $('code').disabled = true;
  $('suggest').disabled = true;
  isPrivate = $('private').checked;
  $('private').disabled = true;
  isLocal = $('local').checked;
  $('local').disabled = true;
  isDiscoverable = isLocal && $('discoverable').checked;
  $('discoverable').disabled = true;
  $('publish').hidden = true;
  setShareState('share.setting-up');
  renderDiscovery();
  setStatus('');
  try {
    hostSocket(code, () => {
      attempts = 0;
      linkCopy.invalidate();
      $('link').value = shareUrl(code);
      $('linkrow').hidden = false;
      $('stop').hidden = false;
      refreshCount();
    });
  } catch (error) {
    unlock();
    throw error;
  }
}

async function hostSignal(from, data) {
  if (!data || typeof data !== 'object') return;
  // The copied link carries the mode for convenience; the sharer enforces
  // it too, so removing its query cannot enable a relay on a local share.
  if ((data.local === true) !== isLocal) {
    if (sock.readyState === 1) sock.send(JSON.stringify({ to: from, data: { networkMode: isLocal ? 'local' : 'direct' } }));
    return;
  }
  if (data.candidate && !allowedCandidate(data.candidate, isLocal)) return;
  let pc = peers.get(from);
  if (!pc) {
    pc = new RTCPeerConnection(rtcConfig(isLocal));
    peers.set(from, pc);
    pc.onicecandidate = (e) => {
      if (e.candidate && allowedCandidate(e.candidate, isLocal) && sock.readyState === 1) sock.send(JSON.stringify({ to: from, data: { candidate: e.candidate, local: isLocal } }));
    };
    let mainChannel = null;
    pc.ondatachannel = (e) => {
      const dc = e.channel;
      if (dc.label !== 'share' || mainChannel || peers.get(from) !== pc) { dc.close(); return; }
      mainChannel = dc;
      const sender = fileSender({ peer: pc, control: dc, files: attached,
        admitted: () => channels.get(from) === dc && peers.get(from) === pc });
      sendQueue.set(from, sender);
      dc.binaryType = 'arraybuffer';
      let introduced = false;
      const introduce = () => {
        if (introduced || dc.readyState !== 'open') return;
        introduced = true;
        if (isPrivate) { dc.send(JSON.stringify({ type: 'private' })); refreshCount(); }
        else admitViewer(from, dc);
      };
      dc.onopen = introduce;
      dc.onmessage = (ev) => {
        if (typeof ev.data !== 'string') return;
        let m;
        try { m = JSON.parse(ev.data); } catch { return; }
        if (!m || typeof m !== 'object') return;
        // The reader announces that its message handler is installed. This
        // also covers engines that deliver datachannel already open, before
        // this side can attach an open listener.
        if (m.type === 'hello') {
          if (!introduced) introduce();
          else if (channels.has(from)) { dc.send(payload()); dc.send(filesMsg()); }
          else dc.send(JSON.stringify({ type: 'private' }));
          return;
        }
        if (m.type === 'get') { sender.request(m); return; }
        if (m.type === 'cancel-file') { sender.cancel(m.request); return; }
        if (m.type === 'knock' && isPrivate && !channels.has(from) && !pending.has(from)) {
          // A knock carrying a token this share issued is a reader who was
          // already let in and merely switched language - no second knock.
          if (typeof m.token === 'string' && admitTokens.has(m.token)) {
            admitViewer(from, dc);
            return;
          }
          addRequest(from, dc, String(m.note ?? '').slice(0, 200));
        }
      };
      dc.onclose = () => dropViewer(from);
      introduce();
    };
  }
  try {
    if (data.sdp) {
      await pc.setRemoteDescription(isLocal ? localDescription(data.sdp) : data.sdp);
      await pc.setLocalDescription(await pc.createAnswer());
      sock.send(JSON.stringify({ to: from, data: { sdp: pc.localDescription, local: isLocal } }));
    } else if (data.candidate) {
      await pc.addIceCandidate(data.candidate);
    }
  } catch {} // a viewer with broken signalling just never connects
}

/* -------------------------------------------------- the sharer's controls */

let debounce = 0;
$('text').addEventListener('input', () => {
  // The rendering is on the fly; only storage and the network are debounced.
  updateEditor();
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    persist();
    broadcast();
  }, 250);
});

$('markdown').addEventListener('change', () => {
  try { localStorage.setItem(STORE_MD, $('markdown').checked ? '1' : '0'); } catch {}
  updateEditor();
  broadcast();
});

$('oneoff').addEventListener('change', () => {
  try { localStorage.setItem(STORE_ONEOFF, $('oneoff').checked ? '1' : '0'); } catch {}
  persist();
});

// Typing belongs in the editor; a click on the rendered half (links aside)
// puts the cursor back there.
$('live').addEventListener('click', (e) => {
  if (e.target.closest('a')) return;
  $('text').focus();
});

$('attach').addEventListener('click', () => $('fileinput').click());
$('fileinput').addEventListener('change', () => {
  for (const f of $('fileinput').files) {
    if (f.size > MAX_FILE) {
      setStatus(phrase('share.file-too-big', { name: f.name }));
      continue;
    }
    if (attached.size >= MAX_FILES) {
      setStatus(phrase('share.too-many-files'));
      break;
    }
    attached.set(crypto.randomUUID(), f);
  }
  $('fileinput').value = '';
  renderAttachlist();
  broadcastFiles();
});

$('save').addEventListener('click', () => {
  const name = `${normalize($('code').value) || 'shared-text'}.txt`;
  const url = URL.createObjectURL(new Blob([$('text').value], { type: 'text/plain' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});

// An empty share is allowed on purpose: open the room first, then write
// while the readers watch it arrive.
$('publish').addEventListener('click', publish);

$('stop').addEventListener('click', () => {
  clearTimeout(announcementTimer);
  const stoppedCode = normalize($('code').value);
  if (isDiscoverable) withdrawing.add(stoppedCode);
  discovery?.unpublish();
  isDiscoverable = false;
  foundShares = foundShares.filter((share) => share.code !== stoppedCode);
  sock?.close(1000);
  clearInterval(keepalive);
  for (const sender of sendQueue.values()) sender.close();
  for (const pc of peers.values()) pc.close();
  peers.clear(); channels.clear(); sendQueue.clear();
  unlock();
  setStatus(phrase('share.stopped'));
});

$('suggest').addEventListener('click', suggest);

const linkCopy = clipboardFeedback({
  read: () => ({ text: $('link').value, owner: sock }),
  current: value => value.owner === sock && value.text === $('link').value && !$('linkrow').hidden,
  write: text => navigator.clipboard.writeText(text),
  done: () => { $('copylink').textContent = phrase('copy.done'); },
  selected: () => {
    $('link').focus(); $('link').select();
    $('copylink').textContent = phrase('copy.select');
  },
  restore: () => { $('copylink').textContent = phrase('copy.link'); },
});
$('copylink').addEventListener('click', () => { void linkCopy.copy(); });
let textVersion = 0;
const textCopy = clipboardFeedback({
  read: () => ({ text: $('received').textContent, version: textVersion }),
  current: value => value.version === textVersion && value.text === $('received').textContent && !$('panel').hidden,
  write: text => navigator.clipboard.writeText(text),
  done: () => { $('copytext').textContent = phrase('copy.done'); },
  selected: () => {
    $('mode-src').click();
    const source = $('received'); source.tabIndex = -1; source.focus();
    const range = document.createRange(); range.selectNodeContents(source);
    const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
    $('copytext').textContent = phrase('copy.select');
  },
  restore: () => { $('copytext').textContent = phrase('copy.text'); },
});
function retireTextCopy() { textVersion += 1; textCopy.invalidate(); }
$('copytext').addEventListener('click', () => { void textCopy.copy(); });

/* -------------------------------------------------------------- the reader */

function fail(text) {
  if ($('received').hidden === false) return;
  $('consent').hidden = true;
  $('relayrow').hidden = true;
  $('retryrow').hidden = false;
  $('view-status').textContent = text;
}

let viewerLive = false;

function view(code) {
  $('share').hidden = true;
  $('view').hidden = false;
  const localMode = isLocalLink(location.href);
  $('local-note').hidden = !localMode;
  let retryLocal = localMode;

  // A language switch made while connected sets this flag on the way out.
  // It stands in for the consent the same reader gave moments ago on the
  // same share, so the gate is not shown twice for one session. The relay
  // button sets it too, along with its own flag: the reader has consented,
  // watched the direct attempt fail, and asked for the relay by name.
  let carried = false;
  let wantRelay = false;
  try {
    const stamp = Number(sessionStorage.getItem(`share-text-carry:${code}`) ?? 0);
    carried = Date.now() - stamp < 5 * 60 * 1000;
    sessionStorage.removeItem(`share-text-carry:${code}`);
    wantRelay = !localMode && carried && sessionStorage.getItem(RELAY_FLAG(code)) === '1';
    sessionStorage.removeItem(RELAY_FLAG(code));
  } catch {}

  const ws = new WebSocket(wsUrl(code, 'viewer'));
  let pc = null;
  let dcRef = null;
  let relay = null;      // the TURN entry the rendezvous minted, once asked for
  let relayReply = null; // resolves the ask, with the entry or null
  let got = false;
  let connected = false;
  let done = false;
  let introduced = false;
  let viewerKeepalive = 0;
  let lastBody = '';
  let asMd = false;
  let mdTouched = false;
  let rx = null; // Each selected file owns either a dedicated lane or the legacy lane.
  let fileChannels = false;
  let offered = new Map();
  let connectionTimer = 0;
  let deliveryTimer = 0;
  const clearDeadlines = () => {
    clearTimeout(connectionTimer);
    clearTimeout(deliveryTimer);
  };
  const stopAttempt = (key, offerRelay = false) => {
    if (done) return;
    done = true;
    viewerLive = false;
    clearDeadlines();
    clearInterval(viewerKeepalive);
    pc?.close();
    ws.close();
    $('knockrow').hidden = true;
    $('view-status').hidden = false;
    fail(phrase(key));
    $('relayrow').hidden = localMode || !offerRelay;
  };
  const awaitIntroduction = () => {
    clearTimeout(deliveryTimer);
    deliveryTimer = setTimeout(() => stopAttempt('view.no-content'), 20000);
  };

  // The raw source always sits in #received (the copy button reads it
  // there); the toggle only decides which of the two views is shown.
  function renderView() {
    $('received').textContent = lastBody;
    const empty = lastBody === '';
    $('panel').hidden = empty;
    $('received').hidden = empty || asMd;
    $('rendered').hidden = empty || !asMd;
    $('rendered').innerHTML = !empty && asMd ? renderMarkdown(lastBody) : '';
    $('mode-fmt').classList.toggle('active', asMd);
    $('mode-src').classList.toggle('active', !asMd);
  }

  $('mode-fmt').addEventListener('click', () => { mdTouched = true; asMd = true; renderView(); });
  $('mode-src').addEventListener('click', () => { mdTouched = true; asMd = false; renderView(); });

  function refreshFileButtons() {
    for (const button of $('filelist').querySelectorAll('button')) {
      button.disabled = done || (button.hasAttribute('data-file-download') && rx !== null);
    }
  }

  function retireFile(owner) {
    if (rx !== owner) return false;
    rx = null;
    clearTimeout(owner.timer);
    owner.parts = [];
    owner.cancel.hidden = true;
    if (owner.request) {
      try { dcRef?.send(JSON.stringify({ type: 'cancel-file', request: owner.request })); } catch {}
      owner.channel?.close();
    }
    refreshFileButtons();
    return true;
  }

  function waitingForFile(owner) {
    clearTimeout(owner.timer);
    owner.timer = setTimeout(() => { if (rx === owner) fileFailed(owner); }, 30000);
  }

  function legacyFileFailure(key) {
    // Older cached pages put untagged chunks on the text lane. That lane must
    // end before another file can be requested; a retry cannot safely reuse it.
    done = true;
    viewerLive = false;
    clearDeadlines();
    clearInterval(viewerKeepalive);
    lastBody = '';
    retireTextCopy();
    $('received').textContent = '';
    $('rendered').textContent = '';
    $('panel').hidden = true;
    pc?.close();
    ws.close(1000);
    for (const button of $('filelist').querySelectorAll('button')) button.disabled = true;
    $('view-status').hidden = false;
    $('view-status').textContent = phrase(key);
    $('retryrow').hidden = false;
  }

  function startFile(file, controls) {
    if (rx || done || dcRef?.readyState !== 'open' || !offered.has(file.id)) return;
    const owner = { ...file, ...controls, mime: '', parts: [], got: 0,
      request: fileChannels ? crypto.randomUUID() : null, channel: null, timer: null };
    rx = owner;
    owner.status.textContent = '';
    owner.btn.textContent = '0%';
    owner.cancel.hidden = false;
    refreshFileButtons();
    waitingForFile(owner);
    try { dcRef.send(JSON.stringify({ type: 'get', id: file.id,
      ...(owner.request ? { request: owner.request } : {}) })); }
    catch { fileFailed(owner); }
  }

  function renderFilelist(list, capability) {
    const files = cleanFileList(list, MAX_FILE);
    offered = new Map(files.map(file => [file.id, file]));
    fileChannels = capability === true;
    if (rx) {
      const file = offered.get(rx.id);
      if (!file || file.name !== rx.name || file.size !== rx.size) fileGone(rx);
    }
    const box = $('filelist');
    box.replaceChildren();
    for (const file of files) {
      if (rx?.id === file.id) { box.append(rx.row); continue; }
      const row = document.createElement('div'); row.className = 'filerow';
      const name = document.createElement('span'); name.className = 'fname'; name.textContent = file.name;
      name.id = `file-${crypto.randomUUID()}`;
      const size = document.createElement('span'); size.className = 'fsize'; size.textContent = fmtSize(file.size);
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ghost';
      btn.dataset.fileDownload = ''; btn.textContent = phrase('view.download');
      btn.setAttribute('aria-describedby', name.id);
      const cancel = document.createElement('button'); cancel.type = 'button'; cancel.className = 'ghost';
      cancel.textContent = phrase('view.file-cancel'); cancel.hidden = true;
      cancel.setAttribute('aria-describedby', name.id);
      const status = document.createElement('span'); status.className = 'file-status';
      status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
      btn.onclick = () => startFile(file, { row, btn, cancel, status });
      cancel.onclick = () => {
        const owner = rx;
        if (!owner || owner.row !== row) return;
        const modern = !!owner.request;
        retireFile(owner);
        owner.btn.textContent = phrase('view.file-retry');
        owner.status.textContent = phrase('view.file-cancelled');
        if (!modern) legacyFileFailure('view.file-legacy-cancel');
        else owner.btn.focus({ preventScroll: true });
      };
      row.append(name, size, btn, cancel, status); box.append(row);
    }
    refreshFileButtons();
  }

  function fileBegin(msg, owner = rx) {
    if (!owner || rx !== owner) return;
    if (!beginFile(owner, msg, MAX_FILE)) { fileFailed(owner); return; }
    waitingForFile(owner);
  }

  function fileChunk(buf, owner = rx) {
    if (!owner || rx !== owner) return;
    if (!appendFileChunk(owner, buf, MAX_FILE)) { fileFailed(owner); return; }
    waitingForFile(owner);
    if (owner.size > 0) owner.btn.textContent = `${Math.min(99, Math.floor((owner.got / owner.size) * 100))}%`;
  }

  function fileEnd(msg, owner = rx) {
    if (!owner || rx !== owner) return;
    if (!finishFile(owner, msg)) { fileFailed(owner); return; }
    let url;
    try {
      const blob = new Blob(owner.parts, { type: owner.mime });
      url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url;
      anchor.download = owner.name === '' ? 'shared-file' : owner.name; anchor.click();
    } catch {
      if (url) URL.revokeObjectURL(url);
      fileFailed(owner); return;
    }
    retireFile(owner);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    owner.btn.textContent = phrase('view.download');
    owner.status.textContent = '';
  }

  function fileGone(owner = rx) {
    if (!owner || rx !== owner) return;
    const modern = !!owner.request;
    retireFile(owner);
    owner.btn.textContent = phrase('view.file-gone'); owner.btn.disabled = true;
    // A roster can withdraw a captured old File while its untagged bytes are
    // still arriving. Abandoning that lane needs the same fence as Cancel.
    if (!modern) legacyFileFailure('view.file-legacy-failed');
  }

  function fileFailed(owner = rx) {
    if (!owner || rx !== owner) return;
    const modern = !!owner.request;
    retireFile(owner);
    owner.status.textContent = phrase('view.file-failed');
    owner.btn.textContent = phrase('view.file-retry');
    if (!modern) legacyFileFailure('view.file-legacy-failed');
  }

  function receiveFileChannel(channel) {
    const owner = rx;
    if (!owner?.request || done || channel.label !== FILE_CHANNEL + owner.request || owner.channel) {
      channel.close(); return;
    }
    owner.channel = channel; channel.binaryType = 'arraybuffer';
    channel.onmessage = event => {
      if (rx !== owner) return;
      if (typeof event.data !== 'string') { fileChunk(event.data, owner); return; }
      let message;
      try { message = JSON.parse(event.data); } catch { fileFailed(owner); return; }
      if (message?.type === 'file-begin') fileBegin(message, owner);
      else if (message?.type === 'file-end') fileEnd(message, owner);
      else if (message?.type === 'file-gone') fileGone(owner);
      else fileFailed(owner);
    };
    channel.onclose = () => { if (rx === owner) fileFailed(owner); };
    channel.onerror = () => { if (rx === owner) fileFailed(owner); };
    waitingForFile(owner);
  }

  const sharerGone = () => {
    if (done) return;
    done = true;
    viewerLive = false;
    clearDeadlines();
    clearInterval(viewerKeepalive);
    $('knockrow').hidden = true;
    if (rx) retireFile(rx);
    offered.clear();
    $('filelist').textContent = '';
    if (got) {
      // The share ends everywhere at once: what the sharer's tab stops
      // holding, this page stops showing.
      lastBody = '';
      retireTextCopy();
      $('received').textContent = '';
      $('rendered').textContent = '';
      $('panel').hidden = true;
      $('view-status').hidden = false;
      $('view-status').textContent = phrase('view.ended');
      $('retryrow').hidden = false;
      return;
    }
    fail(phrase('view.gone-early'));
  };

  $('send-knock').addEventListener('click', () => {
    const note = $('knock').value.trim().slice(0, 200);
    try { dcRef.send(JSON.stringify({ type: 'knock', note })); } catch { return; }
    $('knock').disabled = true;
    $('send-knock').disabled = true;
    $('view-status').textContent = phrase('view.asked');
  });
  $('knock').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('send-knock').click();
  });

  // Nothing peer-to-peer happens until the reader has read the warning and
  // chosen to connect - before this runs, the sharer has not learned that
  // this reader exists, let alone an address.
  async function dial() {
    if (pc !== null || ws.readyState !== 1) return;
    $('consent').hidden = true;
    $('view-status').textContent = phrase(localMode ? 'view.local-connecting' : relay ? 'view.relaying' : 'view.connecting');
    pc = new RTCPeerConnection(rtcConfig(localMode, relay));
    connectionTimer = setTimeout(() => {
      if (!connected) stopAttempt(localMode ? 'view.local-no-connect' : relay ? 'view.relay-failed' : 'view.no-connect', !localMode && !relay);
    }, 20000);
    pc.onicecandidate = (ev) => {
      if (ev.candidate && allowedCandidate(ev.candidate, localMode) && ws.readyState === 1) ws.send(JSON.stringify({ data: { candidate: ev.candidate, local: localMode } }));
    };
    // The slow path for noticing an abrupt disappearance: ICE consent
    // expiry flips the connection to failed after ~30s. The fast path is
    // the rendezvous close below.
    pc.onconnectionstatechange = () => {
      if (connected && (pc.connectionState === 'failed' || pc.connectionState === 'closed')) sharerGone();
    };
    // An attempt that never connects: ICE gives up on its own once every
    // candidate pair has been tried, and the timer below covers the case
    // where it never says so. A direct attempt that fails offers the relay;
    // a relayed one that fails has nothing left to offer.
    const giveUp = () => {
      if (got || connected || done) return;
      stopAttempt(localMode ? 'view.local-no-connect' : relay ? 'view.relay-failed' : 'view.no-connect', !localMode && !relay);
    };
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') giveUp();
    };
    pc.ondatachannel = event => receiveFileChannel(event.channel);
    const dc = pc.createDataChannel('share');
    dc.binaryType = 'arraybuffer';
    dcRef = dc;
    const opened = () => {
      if (connected || done) return;
      connected = true;
      viewerLive = true;
      clearTimeout(connectionTimer);
      if (!introduced) {
        $('view-status').textContent = phrase('view.waiting-content');
        awaitIntroduction();
      }
      dc.send(JSON.stringify({ type: 'hello' }));
    };
    dc.onopen = opened;
    dc.onmessage = (ev) => {
      if (done) return;
      if (typeof ev.data !== 'string') { if (!rx?.request) fileChunk(ev.data); return; }
      let msg;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (!msg || typeof msg !== 'object') return;
      if (msg.type === 'files') { renderFilelist(msg.list ?? [], msg.fileChannels); return; }
      if (msg.type === 'file-begin') { if (!rx?.request) fileBegin(msg); return; }
      if (msg.type === 'file-end') { if (!rx?.request) fileEnd(msg); return; }
      if (msg.type === 'file-gone') {
        if (rx?.id === msg.id && (!rx.request || msg.request === rx.request)) fileGone();
        return;
      }
      if (msg.type === 'file-failed') {
        if (rx?.id === msg.id && (!rx.request || msg.request === rx.request)) fileFailed();
        return;
      }
      if (msg.type === 'token') {
        try { sessionStorage.setItem(`share-text-token:${code}`, String(msg.token)); } catch {}
        return;
      }
      if (msg.type === 'private') {
        if (got) return;
        introduced = true;
        clearDeadlines();
        // A reader who was admitted and switched language knocks again with
        // the token the sharer issued, silently; anyone else knocks aloud.
        let token = null;
        try { token = carried ? sessionStorage.getItem(`share-text-token:${code}`) : null; } catch {}
        if (token !== null) {
          awaitIntroduction();
          dc.send(JSON.stringify({ type: 'knock', note: '', token }));
          return;
        }
        $('view-status').textContent = phrase('view.private');
        $('knockrow').hidden = false;
        $('knock').focus();
        return;
      }
      if (msg.type === 'asked') {
        introduced = true;
        clearDeadlines();
        $('view-status').textContent = phrase('view.asked');
        return;
      }
      if (msg.type === 'denied') {
        done = true;
        viewerLive = false;
        clearDeadlines();
        $('knockrow').hidden = true;
        $('view-status').textContent = phrase('view.denied');
        $('retryrow').hidden = false;
        return;
      }
      if (msg.type !== 'text' || done) return;
      got = true;
      introduced = true;
      clearDeadlines();
      retireTextCopy();
      lastBody = String(msg.body ?? '');
      // The sharer's markdown flag sets the default; a reader who has
      // touched the view toggle keeps their own choice through live updates.
      if (!mdTouched) asMd = msg.md === true;
      renderView();
      $('knockrow').hidden = true;
      // Once the panel is up, its toolbar carries the state; the status
      // line earns its place only while there is nothing to show.
      $('view-status').hidden = lastBody !== '';
      if (lastBody === '') $('view-status').textContent = phrase('view.empty');
    };
    dc.onclose = sharerGone;
    if (dc.readyState === 'open') opened();
    await pc.setLocalDescription(await pc.createOffer());
    if (done) return;
    ws.send(JSON.stringify({ data: { sdp: pc.localDescription, local: localMode } }));
  }

  // The credential is minted by the rendezvous, one per socket, and handed
  // back on the same socket; a rendezvous that has no relay to offer - or an
  // older one that does not know the question - leaves the ask unanswered,
  // and the wait below turns that silence into a sentence.
  function askRelay() {
    if (localMode) return Promise.resolve(null);
    return new Promise((resolve) => {
      relayReply = resolve;
      setTimeout(() => resolve(null), RELAY_WAIT);
      ws.send(JSON.stringify({ relay: true }));
    });
  }

  async function relayDial() {
    relay = await askRelay();
    relayReply = null;
    if (relay === null) { fail(phrase('view.relay-none')); return; }
    await dial();
  }

  $('connect').addEventListener('click', () => {
    dial().catch(() => stopAttempt('view.error'));
  });

  $('relay').addEventListener('click', () => {
    if (localMode) return;
    try {
      sessionStorage.setItem(`share-text-carry:${code}`, String(Date.now()));
      sessionStorage.setItem(RELAY_FLAG(code), '1');
    } catch {
      stopAttempt('view.error');
      return;
    }
    location.reload();
  });

  $('mode-retry').addEventListener('click', () => {
    location.href = makeShareUrl(location.href, code, retryLocal);
  });

  ws.onopen = () => { viewerKeepalive = setInterval(() => { if (ws.readyState === 1) ws.send('ping'); }, 30000); };

  ws.onmessage = async (e) => {
    if (e.data === 'pong') return;
    const m = JSON.parse(e.data);
    try {
      if (m.type === 'ready') {
        if (wantRelay) {
          $('consent').hidden = true;
          $('view-status').textContent = phrase('view.relaying');
          await relayDial();
        } else if (carried) {
          await dial();
        } else {
          $('view-status').textContent = phrase('view.someone');
          $('consent').hidden = false;
        }
      } else if (m.type === 'relay' && !localMode && relayReply !== null) {
        // Only a TURN entry with a credential is worth carrying; anything
        // else the rendezvous might send is not a relay.
        const entry = m.iceServers?.find?.((s) => typeof s?.username === 'string' && typeof s?.credential === 'string');
        relayReply(entry ?? null);
      } else if (m.type === 'signal' && pc && !done) {
        const mode = m.data.networkMode;
        if (mode === 'local' || mode === 'direct' || (localMode && m.data.sdp && m.data.local !== true)) {
          retryLocal = mode === 'local';
          stopAttempt(retryLocal ? 'view.mode-local' : 'view.mode-direct');
          $('mode-retryrow').hidden = false;
          return;
        }
        if (m.data.sdp) await pc.setRemoteDescription(localMode ? localDescription(m.data.sdp) : m.data.sdp);
        else if (m.data.candidate && allowedCandidate(m.data.candidate, localMode)) await pc.addIceCandidate(m.data.candidate);
      }
    } catch {
      if (!done && !got) stopAttempt('view.error');
    }
  };

  ws.onclose = (e) => {
    clearInterval(viewerKeepalive);
    // The server closes every reader with host-gone the instant the sharer
    // disconnects - long before the peer channel notices on its own.
    if (done) return;
    if (e.code === 4410) { sharerGone(); return; }
    if (got) return;
    if (e.code === 4404) stopAttempt('view.nobody');
    else if (e.code === 4429) stopAttempt('view.full');
    else if (!connected) stopAttempt('view.error');
  };
}

$('retry').addEventListener('click', () => location.reload());

/* ----------------------------------------------------- the frame's panels */

$('privacy-toggle').addEventListener('click', () => {
  const panel = $('privacy-panel');
  const open = panel.hidden;
  panel.hidden = !open;
  $('privacy-toggle').setAttribute('aria-expanded', String(open));
});

// An error thrown after boot would otherwise only reach the console, leaving
// the page looking functional but doing nothing. Whichever half is showing
// carries the message.
function bootError(detail) {
  const target = $('share').hidden ? $('view-status') : $('status');
  target.hidden = false;
  target.classList.add('warn');
  target.textContent = phrase('error.broke', { detail });
}
window.addEventListener('error', (event) => bootError(event.message));
window.addEventListener('unhandledrejection', (event) => bootError(event.reason?.message ?? event.reason));

/* --------------------------------------------------------------- routing */

const code = location.hash.replace(/^#/, '').toLowerCase();
$('local').checked = isLocal;
if (CODE_PATTERN.test(code)) view(code);
else {
  $('discoverable').disabled = !isLocal;
  suggest();
  restore();
  startDiscovery();
}

// A share link pasted into an already-open page changes only the hash, and
// hash navigation never reloads the document on its own - so make it, or
// the page stays frozen on whatever the last share ended as.
addEventListener('hashchange', () => location.reload());

// The language switcher links to this page's siblings, and a fragment never
// survives a plain navigation - so a reader who switched language landed on
// the sharer's empty editor. Carry the share name across instead. Compared
// by pathname, because the head's alternate links carry the deployed
// domain and the switcher's anchors resolve against wherever the page is
// actually being served from.
const alternates = new Set(
  [...document.querySelectorAll('link[rel="alternate"][hreflang]')]
    .map((link) => new URL(link.href).pathname),
);
addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href]');
  if (!anchor || anchor.origin !== location.origin || !alternates.has(anchor.pathname)) return;
  // A sharer's tab is the server: navigating it anywhere ends the share,
  // and that deserves a question rather than a silent loss.
  if ($('share').hidden === false && $('publish').hidden) {
    if (!window.confirm(phrase('share.leave-warning'))) {
      event.preventDefault();
      return;
    }
  }
  if (location.hash === '') return;
  // A reader keeps their session across the switch: the flag stands in for
  // the consent they gave moments ago, and the admission token (if any)
  // lets them straight back into a private share.
  if (viewerLive) {
    try { sessionStorage.setItem(`share-text-carry:${code}`, String(Date.now())); } catch {}
  }
  anchor.href = makeShareUrl(anchor.href, code, isLocalLink(location.href));
}, true);

// Reached only if every step above ran without throwing.
document.getElementById('boot-warning')?.remove();
