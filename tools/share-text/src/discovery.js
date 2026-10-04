/** A listing socket never opens a peer connection or asks for content. */

import { CODE_PATTERN } from './names.js';

export function cleanShares(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const result = [];
  for (const entry of list.slice(0, 64)) {
    if (entry?.local !== true || typeof entry.code !== 'string' || !CODE_PATTERN.test(entry.code) || seen.has(entry.code)) continue;
    seen.add(entry.code);
    result.push({ code: entry.code, local: true });
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

  function stopTimers() {
    cancel(deadline);
    cancel(publicationDeadline);
    cancelEvery(pulse);
  }

  function sendPublication() {
    if (socket?.readyState !== 1) return;
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

  function connect() {
    if (closed) return;
    cancel(retry);
    stopTimers();
    handlers.status('connecting');
    let ws;
    try { ws = new Socket(url); }
    catch { unavailable(); return; }
    socket = ws;
    deadline = later(() => {
      if (socket === ws) ws.close();
    }, 8000);
    ws.onopen = () => {
      if (socket !== ws || closed) { ws.close(); return; }
      pulse = every(() => { if (socket === ws) send('ping'); }, 30000);
      if (desired !== null) sendPublication();
    };
    ws.onmessage = (event) => {
      if (socket !== ws || closed || event.data === 'pong' || typeof event.data !== 'string' || event.data.length > 16384) return;
      let message;
      try { message = JSON.parse(event.data); } catch { return; }
      if (message?.type !== 'shares' || !Array.isArray(message.list)) return;
      cancel(deadline);
      const shares = cleanShares(message.list);
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
    publish(code, lease) {
      if (closed || typeof code !== 'string' || !CODE_PATTERN.test(code) || typeof lease !== 'string' || !/^[a-z0-9-]{16,128}$/i.test(lease)) return false;
      desired = { code, lease };
      if (socket?.readyState === 1) sendPublication();
      else handlers.publication?.('not-published');
      return true;
    },
    unpublish() {
      desired = null;
      listed = false;
      cancel(publicationDeadline);
      handlers.publication?.(null);
      send({ publish: null });
    },
    refresh() {
      if (closed) return;
      if (socket?.readyState === 1) send({ refresh: true });
      else if (socket?.readyState !== 0) connect();
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
