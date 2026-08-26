/**
 * What the string in a code actually is, and what is worth saying about it.
 *
 * A QR code holds text and nothing else. Everything a phone appears to "do"
 * with one - joining a network, saving a contact, opening a map - comes from
 * conventions about how that text is written, and each of them is recognised by
 * looking at the first few characters. This file is that recognition, and it is
 * the mirror of `payload.js` in the generator next door: what that one
 * assembles out of a form, this one takes apart into one.
 *
 * The other half of the job matters more.
 *
 * A printed QR code is an address nobody can read. That is the whole basis of
 * the sticker over the code on a parking meter: the person scanning it has no
 * way to know where it goes until they are already there, and a reader that
 * quietly opens the link is part of that problem rather than a defence against
 * it. So nothing here is ever opened. The address is shown in full, the host it
 * will actually reach is called out on its own, and the handful of tricks that
 * make one address look like another are named where they appear.
 *
 * Nothing in this file fetches anything, which is a limit as well as a promise:
 * it cannot tell you where a shortened link ends up, and it says so rather than
 * guessing, because finding out would mean contacting a server.
 *
 * NO ENGLISH IN HERE
 *
 * Every label and every warning is a key, not a sentence. The words are in
 * body.html, which is translated per language; this file decides which of them
 * to show and what to put in the gaps. A module that returned "Network name"
 * would be English at every one of this page's addresses, because a tool's
 * JavaScript is the same file in every language - see the comment at the top of
 * templates/partials/feedback.html, which is the same argument.
 */

/** The schemes that get an "open" link. Everything else is shown as text only. */
const OPENABLE = new Set(['http:', 'https:', 'mailto:', 'tel:', 'sms:', 'geo:']);

/**
 * Link shorteners and QR redirect services, which are worth naming.
 *
 * Not because a short link is an attack - most are somebody's newsletter - but
 * because the address shown is not the address reached, and this page has no
 * way to find out which one it is. Saying so is more honest than presenting a
 * host as though it were the destination.
 */
const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'ow.ly', 'is.gd', 'buff.ly',
  'rebrand.ly', 'cutt.ly', 'shorturl.at', 'rb.gy', 'lnkd.in', 'qrco.de',
  'qrs.ly', 'linktr.ee', 'tiny.cc', 's.id',
]);

/** Split a `KEY:value;KEY:value;;` payload, honouring backslash escapes. */
function fields(body) {
  const out = new Map();
  let key = '';
  let value = '';
  let inKey = true;

  for (let i = 0; i < body.length; i += 1) {
    const character = body[i];
    if (character === '\\' && i + 1 < body.length) {
      value += body[i + 1];
      i += 1;
    } else if (character === ':' && inKey) {
      inKey = false;
    } else if (character === ';') {
      if (key) out.set(key.toUpperCase(), value);
      key = '';
      value = '';
      inKey = true;
    } else if (inKey) {
      key += character;
    } else {
      value += character;
    }
  }
  if (key) out.set(key.toUpperCase(), value);
  return out;
}

/** One line of a vCard, unfolded, with its parameters dropped. */
function vcard(text) {
  const out = new Map();
  // A vCard folds a long line by starting the continuation with a space.
  for (const line of text.replace(/\r?\n[ \t]/g, '').split(/\r?\n/)) {
    const split = line.indexOf(':');
    if (split < 0) continue;
    const name = line.slice(0, split).split(';')[0].toUpperCase();
    const value = line.slice(split + 1);
    if (!out.has(name) && value) out.set(name, value);
  }
  return out;
}

const row = (key, value, extra = {}) => ({ key, value, ...extra });

/**
 * Everything about a web address that somebody scanning a sticker cannot see.
 *
 * The tricks named here are the ones that work on people rather than on
 * software: a host that is not the host it looks like, a name written in a
 * script whose letters are shaped like Latin ones, and the credentials field,
 * which puts an arbitrary string in front of an `@` and hides the real host
 * behind it.
 */
function aboutUrl(text) {
  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }

  const host = url.hostname;
  const warnings = [];

  if (url.username || url.password) {
    warnings.push({ key: 'warn.userinfo', values: { host } });
  }

  if (host.startsWith('xn--') || host.includes('.xn--')) {
    warnings.push({ key: 'warn.punycode', values: { host } });
  } else if (/[^ -~]/.test(host)) {
    warnings.push({ key: 'warn.unicode-host', values: { host } });
  }

  if (url.protocol === 'http:') warnings.push({ key: 'warn.plain-http', values: {} });

  if (SHORTENERS.has(host.toLowerCase().replace(/^www\./, ''))) {
    warnings.push({ key: 'warn.shortener', values: { host } });
  }

  const rows = [row('field.host', host, { emphasis: true })];
  if (url.port) rows.push(row('field.port', url.port));
  rows.push(row('field.path', `${url.pathname}${url.search}${url.hash}`));

  return {
    kind: 'url',
    kindKey: url.protocol === 'https:' ? 'kind.url' : 'kind.url-plain',
    rows,
    warnings,
    link: { href: url.href, host },
  };
}

/** Wi-Fi credentials, in the format phones offer to join a network from. */
function aboutWifi(text) {
  const map = fields(text.slice(5));
  const security = (map.get('T') || 'nopass').toUpperCase();
  const named = { WPA: 'WPA/WPA2', WPA2: 'WPA2', WPA3: 'WPA3', WEP: 'WEP' }[security];

  const rows = [row('field.ssid', map.get('S') ?? '', { emphasis: true })];
  rows.push(named
    ? row('field.security', named)
    : row('field.security', '', { phrase: 'value.open-network' }));
  if (map.get('P')) rows.push(row('field.password', map.get('P'), { secret: true }));
  if (map.get('H') === 'true') rows.push(row('field.hidden', '', { phrase: 'value.yes' }));

  return {
    kind: 'wifi',
    kindKey: 'kind.wifi',
    rows,
    warnings: [{ key: 'warn.wifi-secret', values: {} }],
    link: null,
  };
}

/** A contact card, in either of the two formats a code carries one in. */
function aboutContact(text) {
  const isVcard = /^BEGIN:VCARD/i.test(text);
  const rows = [];

  if (isVcard) {
    const card = vcard(text);
    const name = card.get('FN')
      ?? (card.get('N') ?? '').split(';').filter(Boolean).reverse().join(' ');
    if (name.trim()) rows.push(row('field.name', name.trim(), { emphasis: true }));
    for (const [tag, key] of [['ORG', 'field.org'], ['TITLE', 'field.title'],
      ['TEL', 'field.phone'], ['EMAIL', 'field.email'], ['URL', 'field.web'],
      ['ADR', 'field.address']]) {
      const value = card.get(tag);
      if (value) rows.push(row(key, value.replace(/;+/g, ' ').trim()));
    }
  } else {
    const map = fields(text.slice(7));
    const name = (map.get('N') ?? '').split(',').reverse().join(' ').trim();
    if (name) rows.push(row('field.name', name, { emphasis: true }));
    for (const [tag, key] of [['ORG', 'field.org'], ['TEL', 'field.phone'],
      ['EMAIL', 'field.email'], ['URL', 'field.web'], ['ADR', 'field.address'],
      ['NOTE', 'field.note']]) {
      const value = map.get(tag);
      if (value) rows.push(row(key, value));
    }
  }

  return {
    kind: 'contact',
    kindKey: isVcard ? 'kind.vcard' : 'kind.mecard',
    rows,
    warnings: [],
    link: null,
  };
}

/** An email, written either as a link or in the older message format. */
function aboutEmail(text) {
  if (/^MATMSG:/i.test(text)) {
    const map = fields(text.slice(7));
    const to = map.get('TO') ?? '';
    return {
      kind: 'email',
      kindKey: 'kind.email',
      rows: [
        row('field.to', to, { emphasis: true }),
        row('field.subject', map.get('SUB') ?? ''),
        row('field.message', map.get('BODY') ?? ''),
      ].filter((entry) => entry.value),
      warnings: [],
      link: to ? { href: `mailto:${to}`, host: to } : null,
    };
  }

  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  const to = decodeURIComponent(url.pathname);
  const rows = [row('field.to', to, { emphasis: true })];
  for (const [name, key] of [['subject', 'field.subject'], ['body', 'field.message']]) {
    const value = url.searchParams.get(name);
    if (value) rows.push(row(key, value));
  }
  return {
    kind: 'email',
    kindKey: 'kind.email',
    rows,
    warnings: [],
    link: { href: url.href, host: to },
  };
}

/** A phone number, a text message, or a place. */
function aboutSimple(text) {
  const lower = text.toLowerCase();

  if (lower.startsWith('tel:')) {
    const number = text.slice(4);
    return {
      kind: 'phone',
      kindKey: 'kind.phone',
      rows: [row('field.number', number, { emphasis: true })],
      warnings: [],
      link: { href: `tel:${number}`, host: number },
    };
  }

  if (lower.startsWith('smsto:') || lower.startsWith('sms:')) {
    const body = text.slice(text.indexOf(':') + 1);
    const split = body.indexOf(':');
    const number = split < 0 ? body : body.slice(0, split);
    const message = split < 0 ? '' : body.slice(split + 1);
    return {
      kind: 'sms',
      kindKey: 'kind.sms',
      rows: [
        row('field.to', number, { emphasis: true }),
        ...(message ? [row('field.message', message)] : []),
      ],
      warnings: [],
      link: { href: `sms:${number}`, host: number },
    };
  }

  if (lower.startsWith('geo:')) {
    const [coordinates] = text.slice(4).split('?');
    const [latitude, longitude] = coordinates.split(',');
    return {
      kind: 'place',
      kindKey: 'kind.place',
      rows: [
        row('field.latitude', latitude ?? '', { emphasis: true }),
        row('field.longitude', longitude ?? '', { emphasis: true }),
      ],
      warnings: [],
      link: { href: text, host: coordinates },
    };
  }

  return null;
}

/** A one-time-password seed, which is the most sensitive thing a code holds. */
function aboutOtp(text) {
  let url;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  return {
    kind: 'otp',
    kindKey: 'kind.otp',
    rows: [
      row('field.account', decodeURIComponent(url.pathname.replace(/^\/+/, '')),
          { emphasis: true }),
      row('field.issuer', url.searchParams.get('issuer') ?? ''),
      row('field.secret', url.searchParams.get('secret') ?? '', { secret: true }),
    ].filter((entry) => entry.value),
    warnings: [{ key: 'warn.otp-secret', values: {} }],
    link: null,
  };
}

/**
 * Describe what a decoded string is.
 *
 * Always answers. Plain text is a real result and, after a link, the commonest
 * one there is; dressing it up as a failure to recognise something would be
 * wrong.
 */
export function describe(text) {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  const found = lower.startsWith('wifi:') ? aboutWifi(trimmed)
    : lower.startsWith('begin:vcard') || lower.startsWith('mecard:') ? aboutContact(trimmed)
      : lower.startsWith('mailto:') || lower.startsWith('matmsg:') ? aboutEmail(trimmed)
        : lower.startsWith('otpauth://') ? aboutOtp(trimmed)
          : lower.startsWith('http://') || lower.startsWith('https://') ? aboutUrl(trimmed)
            : aboutSimple(trimmed);

  if (found) return { payload: found };

  // Something with a scheme this page will not open is still worth naming, so
  // that "this is a link, and we are not offering it to you" is visible rather
  // than silent.
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
  if (scheme && !OPENABLE.has(`${scheme[1].toLowerCase()}:`)) {
    return {
      payload: {
        kind: 'other-scheme',
        kindKey: 'kind.other-scheme',
        rows: [row('field.scheme', `${scheme[1].toLowerCase()}:`, { emphasis: true })],
        warnings: [{ key: 'warn.not-openable', values: {} }],
        link: null,
      },
    };
  }

  const digits = /^[0-9]+$/.test(trimmed);
  return {
    payload: {
      kind: digits ? 'number' : 'text',
      kindKey: digits ? 'kind.number' : 'kind.text',
      rows: [],
      warnings: [],
      link: null,
    },
  };
}
