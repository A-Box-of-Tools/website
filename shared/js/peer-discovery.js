/** A listing socket never opens a peer connection or asks for content. */

import { CODE_PATTERN } from './room-names.js';
import { normalizeGroupCode, groupIdentifier, groupUrl } from './discovery-group.js';

export function cleanShares(list, tool = 'share-text', privateGroup = false) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const result = [];
  for (const entry of list.slice(0, 64)) {
    if (!(entry?.local === true || privateGroup && tool === 'share-text' && entry?.local === false)
        || typeof entry.code !== 'string' || !CODE_PATTERN.test(entry.code) || seen.has(entry.code)) continue;
    if (entry.transport !== undefined && entry.transport !== 'direct' && entry.transport !== 'relay') continue;
    const transport = entry.transport === 'relay' ? { transport: 'relay' } : {};
    if (tool === 'voice-oncall' || tool === 'walkie-talkie') {
      if (!/^[a-f0-9]{64}$/.test(entry.code) || typeof entry.name !== 'string'
          || entry.approval !== undefined && typeof entry.approval !== 'boolean'
          || !entry.name.trim() || entry.name.length > 80 || /[\u0000-\u001f\u007f-\u009f]/.test(entry.name)
          || (tool === 'voice-oncall' ? typeof entry.locked !== 'boolean'
            : typeof entry.listenKey !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(entry.listenKey))) continue;
      seen.add(entry.code);
      result.push({ code: entry.code, local: true, ...transport,
        ...(typeof entry.approval === 'boolean' ? { approval: entry.approval } : {}),
        name: entry.name.trim(), ...(tool === 'voice-oncall' ? { locked: entry.locked } : { listenKey: entry.listenKey }) });
    } else {
      seen.add(entry.code);
      result.push({ code: entry.code, local: entry.local, ...transport });
    }
  }
  return result;
}

export function watchDiscovery(url, handlers, timers = {}) {
  const Socket = timers.Socket ?? WebSocket;
  const later = timers.later ?? setTimeout;
  const cancel = timers.cancel ?? clearTimeout;
  const every = timers.every ?? setInterval;
  const cancelEvery = timers.cancelEvery ?? clearInterval;
  let socket = null;
  let closed = false;
  let retry = 0;
  let pulse = 0;
  let deadline = 0;
  let publicationDeadline = 0;
  let desired = null;
  let listed = false;
  const privateGroup = timers.group !== null && timers.group !== undefined;
  const group = privateGroup ? normalizeGroupCode(timers.group) : null;
  let groupId = null;
  let connecting = false;
  const tool = new URL(url).searchParams.get('tool') ?? 'share-text';
  let namespaceReady = tool === 'share-text' && !privateGroup;

  function stopTimers() {
    cancel(deadline);
    cancel(publicationDeadline);
    cancelEvery(pulse);
  }

  function sendPublication() {
    if (socket?.readyState !== 1 || !namespaceReady) return;
    cancel(publicationDeadline);
    if (desired !== null) {
      listed = false;
      handlers.publication?.('publishing');
      publicationDeadline = later(() => {
        if (!listed && desired !== null) handlers.publication?.('not-published');
      }, 8000);
    }
    send({ publish: desired });
  }

  function send(message) {
    if (socket?.readyState !== 1) return;
    try { socket.send(typeof message === 'string' ? message : JSON.stringify(message)); }
    catch { socket.close(); }
  }

  function unavailable() {
    socket = null;
    listed = false;
    stopTimers();
    handlers.list([]);
    handlers.status('unavailable');
    if (desired !== null) handlers.publication?.('not-published');
    retry = later(connect, 30000);
  }

  async function connect() {
    if (closed || connecting) return;
    connecting = true;
    cancel(retry);
    stopTimers();
    namespaceReady = tool === 'share-text' && !privateGroup;
    handlers.status('connecting');
    if (privateGroup) {
      try { groupId = group && await groupIdentifier(group); } catch { groupId = null; }
      if (closed) { connecting = false; return; }
      if (!groupId) {
        connecting = false;
        handlers.list([]);
        handlers.status('unavailable');
        return;
      }
    }
    let ws;
    try { ws = new Socket(privateGroup ? groupUrl(url, groupId) : url); }
    catch { connecting = false; unavailable(); return; }
    connecting = false;
    socket = ws;
    deadline = later(() => {
      if (socket === ws) ws.close();
    }, 8000);
    ws.onopen = () => {
      if (socket !== ws || closed) { ws.close(); return; }
      pulse = every(() => { if (socket === ws) send('ping'); }, 30000);
      if (privateGroup) send({ group });
      if (desired !== null) sendPublication();
    };
    ws.onmessage = (event) => {
      if (socket !== ws || closed || event.data === 'pong' || typeof event.data !== 'string' || event.data.length > 16384) return;
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message?.type !== 'shares' || !Array.isArray(message.list)) return;
      // Older Workers ignore unknown query fields. Their network list must
      // never become a private list or acknowledge a private publication.
      if (privateGroup && message.group !== groupId) return;
      if ((privateGroup || tool !== 'share-text') && message.tool !== tool) return;
      const newlyReady = !namespaceReady;
      namespaceReady = true;
      cancel(deadline);
      if (newlyReady && desired !== null) sendPublication();
      const shares = cleanShares(message.list, tool, privateGroup);
      handlers.list(shares);
      handlers.status('ready');
      if (desired !== null) {
        const present = shares.some((share) => share.code === desired.code);
        if (present || listed) {
          listed = present;
          cancel(publicationDeadline);
          handlers.publication?.(present ? 'published' : 'not-published');
        }
      }
    };
    ws.onclose = () => {
      if (socket !== ws || closed) return;
      unavailable();
    };
    ws.onerror = () => {};
  }

  connect();
  return {
    publish(code, lease, details = {}) {
      if (closed || typeof code !== 'string' || !CODE_PATTERN.test(code) || typeof lease !== 'string' || !/^[a-z0-9-]{16,128}$/i.test(lease)) return false;
      if (tool === 'walkie-talkie' && (typeof details.listenKey !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(details.listenKey))) return false;
      desired = { code, lease, ...(tool === 'walkie-talkie' ? { listenKey: details.listenKey } : {}) };
      if (socket?.readyState === 1) sendPublication();
      else handlers.publication?.('not-published');
      return true;
    },
    unpublish() {
      desired = null;
      listed = false;
      cancel(publicationDeadline);
      handlers.publication?.(null);
      if (namespaceReady) send({ publish: null });
    },
    refresh() {
      if (closed) return;
      if (socket?.readyState === 1 && namespaceReady) send({ refresh: true });
      else if (!socket || socket.readyState > 1) connect();
    },
    close() {
      closed = true;
      desired = null;
      stopTimers();
      cancel(retry);
      socket?.close();
      socket = null;
    },
  };
}
