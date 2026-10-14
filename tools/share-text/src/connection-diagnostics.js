/** Keep useful connection evidence without retaining the negotiation or content. */
const STAGES = new Set([
  'opening', 'server-open', 'room-ready', 'offer-sent', 'offer-received',
  'answer-sent', 'answer-accepted', 'channel-open', 'waiting-approval',
  'approval-requested', 'approved', 'sharing', 'received',
  'transfer-started', 'transfer-complete', 'transfer-failed',
]);
const REASONS = new Set([
  'stopped', 'peer-left', 'ended', 'timeout', 'delivery-timeout',
  'signaling-error', 'socket-error', 'socket-closed', 'ice-failed',
  'channel-error', 'denied', 'mode-mismatch', 'unsupported',
]);
const COUNTERS = [
  'offerSent', 'offerReceived', 'answerSent', 'answerAccepted',
  'candidatesSent', 'candidatesReceived', 'candidatesAccepted', 'candidatesFiltered',
];
const OPERATIONS = new Set([
  'websocket', 'signaling', 'offer', 'answer', 'candidate', 'local-description',
  'remote-description', 'create-offer', 'create-answer', 'set-local-description',
  'set-remote-description', 'add-candidate', 'send-signal', 'get-stats', 'channel',
]);
const ERROR_NAMES = new Set([
  'AbortError', 'DataError', 'Error', 'InvalidAccessError', 'InvalidModificationError',
  'InvalidStateError', 'NetworkError', 'NotAllowedError', 'NotFoundError',
  'NotReadableError', 'NotSupportedError', 'OperationError', 'RangeError',
  'RTCError', 'SecurityError', 'SyntaxError', 'TimeoutError', 'TypeError', 'UnknownError',
]);
const STATES = {
  gathering: new Set(['new', 'gathering', 'complete']),
  ice: new Set(['new', 'checking', 'connected', 'completed', 'disconnected', 'failed', 'closed']),
  connection: new Set(['new', 'connecting', 'connected', 'disconnected', 'failed', 'closed']),
  signaling: new Set(['stable', 'have-local-offer', 'have-remote-offer', 'have-local-pranswer', 'have-remote-pranswer', 'closed']),
  sctp: new Set(['new', 'connecting', 'connected', 'closed']),
  dtls: new Set(['new', 'connecting', 'connected', 'closed', 'failed']),
  channel: new Set(['connecting', 'open', 'closing', 'closed']),
};
const TYPES = new Set(['host', 'srflx', 'prflx', 'relay']);
const PROTOCOLS = new Set(['udp', 'tcp']);
const RESULTS = new Set(['received', 'accepted', 'filtered', 'sent', 'rejected']);
const PAIRS = new Set(['frozen', 'waiting', 'in-progress', 'failed', 'succeeded', 'cancelled']);
const STUN = ['requestsSent', 'responsesReceived', 'requestsReceived', 'responsesSent', 'consentRequestsSent'];
const MAX_ATTEMPTS = 12;
const MAX_EVENTS = 64;
const MAX_ERRORS = 16;
const MAX_COUNT = Number.MAX_SAFE_INTEGER;
const read = (object, key) => { try { return object?.[key]; } catch { return undefined; } };
const allowed = (value, values) => values.has(value) ? value : 'unknown';
const state = (value, values) => value == null ? null : allowed(value, values);
const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0
  ? Math.min(MAX_COUNT, Math.round(value)) : null;
const clone = value => JSON.parse(JSON.stringify(value));
const increment = (record, key) => { record[key] = Math.min(MAX_COUNT, (record[key] || 0) + 1); };

function browserInfo(value) {
  const ua = typeof value === 'string' ? value.slice(0, 2048) : '';
  const patterns = [
    ['Edge', /\bEdg(?:A|iOS)?\/(\d{1,4}(?:\.\d{1,6}){0,3})/],
    ['Opera', /\bOPR\/(\d{1,4}(?:\.\d{1,6}){0,3})/],
    ['Firefox', /\b(?:Firefox|FxiOS)\/(\d{1,4}(?:\.\d{1,6}){0,3})/],
    ['Chrome', /\b(?:Chrome|CriOS|Chromium)\/(\d{1,4}(?:\.\d{1,6}){0,3})/],
    ['Safari', /\bVersion\/(\d{1,4}(?:\.\d{1,6}){0,3}).*\bSafari\//],
  ];
  let family = 'unknown';
  let version = 'unknown';
  for (const [name, pattern] of patterns) {
    const match = pattern.exec(ua);
    if (match) { family = name; version = match[1]; break; }
  }
  const platform = /iPhone|iPad|iPod|Macintosh.*Mobile/i.test(ua) ? 'iOS'
    : /Android/i.test(ua) ? 'Android' : /Windows/i.test(ua) ? 'Windows'
      : /Macintosh|Mac OS X/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'unknown';
  return { family, version, platform };
}

function candidateSummary(withResults = false) {
  const value = { count: 0, types: {}, addressForms: {}, protocols: {} };
  if (withResults) value.results = {};
  return value;
}

function addressForm(value) {
  if (typeof value !== 'string' || !value) return 'hidden';
  if (/\.local\.?$/i.test(value)) return 'mdns';
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value) && value.split('.').every(part => Number(part) <= 255)) return 'ipv4';
  if (value.includes(':') && /^[a-f\d:.%]+$/i.test(value)) return 'ipv6';
  return 'other';
}

function summarizeCandidate(summary, candidate, result) {
  const raw = typeof candidate === 'string' ? candidate : read(candidate, 'candidate');
  const parts = typeof raw === 'string' && raw.length <= 4096 ? raw.trim().split(/\s+/) : [];
  const index = parts.indexOf('typ');
  const type = read(candidate, 'candidateType') ?? read(candidate, 'type');
  const protocol = read(candidate, 'protocol');
  summary.count = Math.min(MAX_COUNT, summary.count + 1);
  increment(summary.types, TYPES.has(type) ? type : allowed(index < 0 ? undefined : parts[index + 1], TYPES));
  increment(summary.protocols, PROTOCOLS.has(protocol) ? protocol : allowed(parts[2]?.toLowerCase(), PROTOCOLS));
  increment(summary.addressForms, addressForm(read(candidate, 'address') ?? read(candidate, 'ip') ?? parts[4]));
  if (summary.results) increment(summary.results, allowed(result, RESULTS));
}

function emptyStats() {
  return {
    available: false, elapsedMs: null,
    localCandidates: candidateSummary(), remoteCandidates: candidateSummary(),
    pairCount: 0, pairStates: {}, nominatedPairs: 0,
    stun: Object.fromEntries(STUN.map(key => [key, null])), dtlsStates: {},
    dataChannels: { count: 0, states: {}, messagesSent: null, messagesReceived: null },
  };
}

function addNullable(record, key, value) {
  const safe = number(value);
  if (safe !== null) record[key] = Math.min(MAX_COUNT, (record[key] ?? 0) + safe);
}

function summarizeStats(report, elapsedMs) {
  const stats = emptyStats();
  stats.available = true;
  stats.elapsedMs = elapsedMs;
  report.forEach(row => {
    switch (read(row, 'type')) {
      case 'local-candidate': summarizeCandidate(stats.localCandidates, row); break;
      case 'remote-candidate': summarizeCandidate(stats.remoteCandidates, row); break;
      case 'candidate-pair':
        stats.pairCount += 1;
        increment(stats.pairStates, allowed(read(row, 'state'), PAIRS));
        if (read(row, 'nominated') === true) stats.nominatedPairs += 1;
        for (const key of STUN) addNullable(stats.stun, key, read(row, key));
        break;
      case 'transport': {
        const value = state(read(row, 'dtlsState'), STATES.dtls);
        if (value !== null) increment(stats.dtlsStates, value);
        break;
      }
      case 'data-channel':
        stats.dataChannels.count += 1;
        increment(stats.dataChannels.states, allowed(read(row, 'state'), STATES.channel));
        addNullable(stats.dataChannels, 'messagesSent', read(row, 'messagesSent'));
        addNullable(stats.dataChannels, 'messagesReceived', read(row, 'messagesReceived'));
        break;
      default: break;
    }
  });
  return stats;
}

export function createDiagnostics({ version, userAgent, now = () => performance.now(), changed = () => {} } = {}) {
  const toolVersion = typeof version === 'string' && /^[a-f\d]{10}$/i.test(version) ? version.toLowerCase() : 'unknown';
  const browser = browserInfo(userAgent);
  version = undefined;
  userAgent = undefined;
  const attempts = [];
  let nextAttempt = 0;
  let attemptsDropped = 0;
  const notify = () => { try { changed(); } catch { /* Sharing never depends on diagnostics. */ } };
  const clock = () => { try { const value = now(); return Number.isFinite(value) ? value : 0; } catch { return 0; } };

  function begin(role, mode) {
    const started = clock();
    let peer = null;
    let dataChannel = null;
    let finished = false;
    let opened = false;
    let frozenElapsed = null;
    let epoch = 0;
    let timer = null;
    let inFlight = null;
    const listeners = [];
    const transports = new WeakSet();
    const data = {
      attempt: ++nextAttempt,
      role: ['host', 'sharer'].includes(role) ? 'sharer' : ['viewer', 'receiver'].includes(role) ? 'receiver' : 'unknown',
      mode: ['local', 'internet', 'relay'].includes(mode) ? mode : 'unknown',
      stage: 'opening', outcome: null, finished: false,
      socket: { state: 'connecting', closeCode: null },
      milestonesMs: {}, timeline: [], omittedEvents: 0,
      states: Object.fromEntries(Object.keys(STATES).map(key => [key, null])),
      signaling: Object.fromEntries(COUNTERS.map(key => [key, 0])),
      candidates: { local: candidateSummary(true), remote: candidateSummary(true) },
      stats: emptyStats(), candidateErrors: {}, errors: [], omittedErrors: 0,
    };
    const elapsed = () => frozenElapsed ?? Math.max(0, Math.round(clock() - started));
    function event(kind, value) {
      if (data.timeline.length === MAX_EVENTS) { data.timeline.shift(); data.omittedEvents += 1; }
      data.timeline.push({ elapsedMs: elapsed(), kind, state: value });
    }
    function readStates() {
      if (!peer) return;
      const sctp = read(peer, 'sctp');
      for (const transport of [sctp, read(sctp, 'transport')]) {
        if (transport && typeof transport === 'object' && !transports.has(transport)) {
          transports.add(transport);
          listen(transport, 'statechange', onState);
        }
      }
      const values = {
        gathering: read(peer, 'iceGatheringState'), ice: read(peer, 'iceConnectionState'),
        connection: read(peer, 'connectionState'), signaling: read(peer, 'signalingState'),
        sctp: read(sctp, 'state'), dtls: read(read(sctp, 'transport'), 'state'),
        channel: read(dataChannel, 'readyState'),
      };
      for (const key of Object.keys(STATES)) {
        const value = state(values[key], STATES[key]);
        if (value !== data.states[key]) { data.states[key] = value; event(key, value); }
      }
    }
    function stopTimer() { clearTimeout(timer); timer = null; }
    const shouldPoll = () => !finished && peer && !opened && typeof read(peer, 'getStats') === 'function'
      && !['failed', 'closed'].includes(data.states.connection) && !['failed', 'closed'].includes(data.states.ice);
    function schedule() {
      if (timer !== null || !shouldPoll()) return;
      timer = setTimeout(() => { timer = null; void sample(); }, 1000);
      timer?.unref?.();
    }
    function error(operation, failure) {
      if (finished) return false;
      if (data.errors.length === MAX_ERRORS) { data.errors.shift(); data.omittedErrors += 1; }
      data.errors.push({ elapsedMs: elapsed(), operation: allowed(operation, OPERATIONS), code: allowed(read(failure, 'name'), ERROR_NAMES) });
      notify();
      return true;
    }
    function sample() {
      if (finished || !peer || typeof read(peer, 'getStats') !== 'function') return Promise.resolve();
      if (inFlight) return inFlight;
      stopTimer();
      const target = peer;
      const token = epoch;
      const current = () => !finished && epoch === token && peer === target;
      const task = Promise.resolve().then(() => current() ? target.getStats() : null).then(report => {
        if (!current() || report === null) return;
        data.stats = summarizeStats(report, elapsed());
        readStates(); notify();
      }).catch(failure => { if (current()) error('get-stats', failure); }).finally(() => {
        if (inFlight === task) inFlight = null;
        schedule();
      });
      inFlight = task;
      return task;
    }
    function listen(target, type, handler) {
      if (typeof read(target, 'addEventListener') !== 'function') return;
      target.addEventListener(type, handler);
      listeners.push(() => { try { target.removeEventListener(type, handler); } catch {} });
    }
    function mark(value) {
      if (finished || !STAGES.has(value)) return false;
      if (data.stage === value && data.milestonesMs[value] !== undefined) return false;
      data.stage = value;
      data.milestonesMs[value] ??= elapsed();
      event('stage', value);
      if (value === 'channel-open') { opened = true; stopTimer(); void sample(); }
      notify();
      return true;
    }
    function onState() {
      if (finished) return;
      readStates();
      if (shouldPoll()) schedule(); else stopTimer();
      notify();
    }
    function attach(value) {
      if (finished || !value || (peer && peer !== value)) return false;
      if (peer === value) return true;
      peer = value;
      epoch += 1;
      for (const type of ['icegatheringstatechange', 'iceconnectionstatechange', 'connectionstatechange', 'signalingstatechange']) listen(peer, type, onState);
      listen(peer, 'icecandidateerror', failure => {
        if (finished) return;
        const code = read(failure, 'errorCode');
        increment(data.candidateErrors, Number.isInteger(code) && code >= 300 && code <= 799 ? code : 'unknown');
        notify();
      });
      readStates(); void sample(); notify();
      return true;
    }
    function channel(value) {
      if (finished || !value || (dataChannel && dataChannel !== value)) return false;
      if (dataChannel === value) return true;
      dataChannel = value;
      const open = () => { if (!finished) { readStates(); mark('channel-open'); } };
      listen(value, 'open', open);
      listen(value, 'closing', onState);
      listen(value, 'close', onState);
      listen(value, 'error', failure => error('channel', read(failure, 'error')));
      readStates();
      if (read(value, 'readyState') === 'open') open(); else notify();
      return true;
    }
    function candidate(direction, value, result = 'received') {
      if (finished || !['local', 'remote'].includes(direction)) return false;
      summarizeCandidate(data.candidates[direction], value, result); notify(); return true;
    }
    function count(key) {
      if (finished || !COUNTERS.includes(key)) return false;
      data.signaling[key] = Math.min(MAX_COUNT, data.signaling[key] + 1); notify(); return true;
    }
    function socket(value, closeCode) {
      if (finished) return false;
      data.socket.state = ['connecting', 'open', 'closed'].includes(value) ? value : 'unknown';
      if (Number.isInteger(closeCode) && closeCode >= 1000 && closeCode <= 4999) data.socket.closeCode = closeCode;
      event('socket', data.socket.state); notify(); return true;
    }
    function finish(reason) {
      if (finished) return false;
      readStates(); frozenElapsed = elapsed(); finished = true; data.finished = true;
      data.outcome = allowed(reason, REASONS);
      epoch += 1; stopTimer();
      for (const cleanup of listeners) cleanup();
      listeners.length = 0; peer = null; dataChannel = null; inFlight = null;
      notify(); return true;
    }
    const snapshot = () => clone({ ...data, elapsedMs: elapsed() });
    if (attempts.length === MAX_ATTEMPTS) {
      const removed = attempts.shift(); removed.finish('ended'); attemptsDropped += 1;
    }
    attempts.push({ finish, snapshot });
    mark('opening');
    return { attach, channel, mark, candidate, count, error, socket, finish, sample };
  }
  return { begin, report: () => ({ schema: 1, toolVersion, browser: clone(browser), attemptsDropped, attempts: attempts.map(attempt => attempt.snapshot()) }) };
}
