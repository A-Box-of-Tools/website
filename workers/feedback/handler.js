const MAX_BYTES = 16384;
const FIELDS = { message: 4000, page: 512, environment: 500, reply_to: 254, company: 100, sender_type: 11 };
const ORIGINS = new Set(['https://feedback.abox.tools', 'https://abox.tools']);
const HEADERS = {
  'Cache-Control': 'no-store',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-Robots-Tag': 'noindex, nofollow',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

function escaped(text) {
  return String(text).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

async function readBody(request) {
  if (Number(request.headers.get('Content-Length')) > MAX_BYTES) throw 413;
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) {
        await reader.cancel();
        throw 413;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw 400; }
}

function fieldsFrom(raw, json) {
  let fields;
  try {
    if (json) fields = JSON.parse(raw);
    else {
      const entries = [...new URLSearchParams(raw)];
      if (new Set(entries.map(([key]) => key)).size !== entries.length) throw 400;
      fields = Object.fromEntries(entries);
    }
  } catch { throw 400; }
  if (!fields || typeof fields !== 'object' || Array.isArray(fields)) throw 400;
  const values = Object.fromEntries(Object.keys(FIELDS)
    .filter(key => typeof fields[key] === 'string').map(key => [key, fields[key]]));
  const invalid = () => { throw { status: 400, values }; };
  const clean = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!Object.hasOwn(FIELDS, key) || typeof value !== 'string'
        || value.length > FIELDS[key] || /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)) invalid();
    clean[key] = value.trim().replace(/\r\n?/g, '\n');
  }
  if (!clean.message || clean.company) invalid();
  if (clean.reply_to && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(clean.reply_to)) invalid();
  if (clean.sender_type !== undefined && !['person', 'agent', 'unspecified'].includes(clean.sender_type)) invalid();
  if (!json && !['person', 'agent'].includes(clean.sender_type)) invalid();
  clean.sender_type ||= 'unspecified';
  return clean;
}

function normalized(text) {
  return text.normalize('NFKC').trim().replace(/\s+/gu, ' ').toLowerCase();
}

function pageIdentity(page = '') {
  try {
    const url = new URL(page);
    url.search = '';
    url.hash = '';
    url.pathname = url.pathname.replace(/\/index\.html$/, '/');
    return normalized(url.href);
  } catch { return normalized(page); }
}

async function keyedHash(secret, text) {
  const bytes = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', bytes.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const digest = await crypto.subtle.sign('HMAC', key, bytes.encode(text));
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

export function createFeedbackHandler(page) {
  return async function feedback(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const local = ['localhost', '127.0.0.1'].includes(url.hostname);
    const allowedOrigin = origin && (ORIGINS.has(origin) || (local && origin === url.origin));
    const type = request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
    // The site's no-referrer edge policy makes ordinary form navigations send
    // Origin: null. Fetch Metadata still distinguishes our form from a foreign one.
    const ownForm = origin === 'null' && type === 'application/x-www-form-urlencoded'
      && request.headers.get('Sec-Fetch-Site') === 'same-origin';
    const headers = { ...HEADERS };
    if (allowedOrigin) {
      headers['Access-Control-Allow-Origin'] = origin;
      headers.Vary = 'Origin';
    }
    const json = type === 'application/json';
    function reply(status, message, values = {}, detail = {}) {
      const body = json
        ? JSON.stringify({ ok: status === 201 || (status === 200 && detail.duplicate === true), message, ...detail })
        : page.replace(/\{\{(notice|message|page|environment|reply_to|person_checked|agent_checked)\}\}/g, (_, key) => {
          if (key === 'notice') return message ? `<div class="notice" role="status">${escaped(message)}</div>` : '';
          if (key.endsWith('_checked')) return values.sender_type === key.split('_')[0] ? ' checked' : '';
          return escaped(values[key] || '');
        });
      return new Response(request.method === 'HEAD' ? null : body, {
        status,
        headers: {
          ...headers,
          'Content-Type': json ? 'application/json; charset=utf-8' : 'text/html; charset=utf-8',
          ...(status === 429 ? { 'Retry-After': String(detail.retry_after || 60) } : {}),
          ...(status === 405 ? { Allow: 'GET, HEAD, POST, OPTIONS' } : {}),
        },
      });
    }
    if (url.hostname !== 'feedback.abox.tools' && !local) return reply(403, 'This host is not supported.');
    if (origin && !allowedOrigin && !ownForm) return reply(403, 'Open feedback.abox.tools to send feedback.');
    if (!['/', '/feedback'].includes(url.pathname)) return reply(404, 'This page was not found.');
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        ...headers,
        'Access-Control-Allow-Methods': 'POST, GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } });
    }
    if (['GET', 'HEAD'].includes(request.method)) return reply(200, '');
    if (request.method !== 'POST') return reply(405, 'Use the form or send a JSON POST.');
    if (!json && type !== 'application/x-www-form-urlencoded') return reply(415, 'Send JSON or use the form. Attachments are not accepted.');

    // A missing limiter must not turn a deployment mistake into an open mail relay.
    try {
      if (!env.FEEDBACK_HASH_KEY || !env.FEEDBACK_GATE?.get || !env.FEEDBACK_GATE?.idFromName
          || !env.FEEDBACK_RATE_LIMIT?.limit || !env.FEEDBACK_GLOBAL_LIMIT?.limit) throw new Error();
      const perAddress = await env.FEEDBACK_RATE_LIMIT.limit({
        key: request.headers.get('CF-Connecting-IP') || 'unknown',
      });
      if (!perAddress.success) return reply(429, 'Too many requests. Please wait a minute and try again.');
      const global = await env.FEEDBACK_GLOBAL_LIMIT.limit({ key: 'feedback' });
      if (!global.success) return reply(429, 'Too many requests. Please wait a minute and try again.');
    } catch { return reply(503, 'Feedback is temporarily unavailable. Please try later or email hi@abox.tools.'); }

    let fields;
    try { fields = fieldsFrom(await readBody(request), json); }
    catch (error) {
      return reply(error === 413 ? 413 : 400, error === 413
        ? 'The request is too large. Keep the message under 4,000 characters and the whole request under 16 KiB.'
        : 'Enter a message of up to 4,000 characters, choose who is sending, and check the optional fields.', error?.values);
    }
    let delivery;
    let status;
    try {
      const client = await keyedHash(env.FEEDBACK_HASH_KEY, `network\0${request.headers.get('CF-Connecting-IP') || 'unknown'}`);
      // Changing a sender label, transport or reply address cannot create a new report.
      const fingerprint = await keyedHash(env.FEEDBACK_HASH_KEY, `report\0${JSON.stringify([pageIdentity(fields.page), normalized(fields.message)])}`);
      const gate = env.FEEDBACK_GATE.get(env.FEEDBACK_GATE.idFromName('feedback-mail-budget'));
      const response = await gate.fetch(new Request('https://feedback.internal/deliver', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, client, fingerprint, channel: json ? 'JSON' : 'Form submission' }),
      }));
      delivery = await response.json();
      status = response.status;
    } catch { return reply(503, 'Feedback is temporarily unavailable. Please email hi@abox.tools instead of submitting repeatedly.', fields); }
    const receipt = delivery.receipt;
    if (status === 201 && delivery.state === 'accepted' && receipt) {
      return reply(201, `Thank you. Your feedback was accepted for email delivery. Receipt: ${receipt}`, {}, { receipt, duplicate: false });
    }
    if (status === 200 && delivery.state === 'accepted' && delivery.duplicate && receipt) {
      return reply(200, `This report was already accepted. No new email was sent. Receipt: ${receipt}`, {}, { receipt, duplicate: true });
    }
    if (status === 202 && delivery.state === 'pending' && receipt) {
      return reply(202, `This report is still being checked. No additional email was sent. Keep the receipt instead of submitting again: ${receipt}`, {}, { receipt });
    }
    if (status === 429 && Number.isInteger(delivery.retry_after) && delivery.retry_after > 0) {
      const minutes = Math.ceil(delivery.retry_after / 60);
      const wait = minutes < 60 ? `${minutes} minutes` : `${Math.ceil(minutes / 60)} hours`;
      return reply(429, `The sending limit has been reached. Please wait about ${wait} before sending another report.`, fields, { retry_after: delivery.retry_after });
    }
    return reply(503, `Delivery could not be confirmed. This report will not be sent again automatically. Email hi@abox.tools with this receipt: ${receipt || '(unavailable)'}`, fields, receipt ? { receipt } : {});
  };
}
