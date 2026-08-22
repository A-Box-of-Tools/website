/**
 * The encoders: Base64, percent-encoding, HTML entities, hex and backslash
 * escapes, each of them both ways.
 *
 * All six are arithmetic over a string. There is nothing here that could need
 * a server even in principle, which is why the "paste it into a website"
 * version of this job is the one worth being annoyed about: an access token
 * pasted into somebody else's Base64 decoder is an access token you have given
 * away, and it never had to leave the machine to be decoded.
 *
 * Base64 is written out rather than handed to `btoa`, for two reasons. `btoa`
 * throws on any character above U+00FF, so every caller has to encode to bytes
 * first anyway; and `atob` accepts input it should refuse - wrong padding,
 * characters outside the alphabet - and returns something plausible instead of
 * saying that what it was given was not Base64. Being told is the point.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const URL_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const utf8 = {
  encode: (text) => new TextEncoder().encode(text),
  // fatal, so that "decode this Base64" answers "those bytes are not text"
  // rather than handing back a string full of replacement characters.
  decode: (bytes) => new TextDecoder('utf-8', { fatal: true }).decode(bytes),
};

/** Thrown when the input is not what the codec was told it was. */
export class CodecError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CodecError';
  }
}

/* ------------------------------------------------------------------ base64 */

export function bytesToBase64(bytes, { urlSafe = false, pad = !urlSafe } = {}) {
  const table = urlSafe ? URL_ALPHABET : ALPHABET;
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const b = bytes[i + 1];
    const c = bytes[i + 2];
    out += table[a >> 2];
    out += table[((a & 0x03) << 4) | ((b ?? 0) >> 4)];
    out += b === undefined ? (pad ? '=' : '') : table[((b & 0x0f) << 2) | ((c ?? 0) >> 6)];
    out += c === undefined ? (pad ? '=' : '') : table[c & 0x3f];
  }
  return out;
}

export function base64ToBytes(text) {
  // Line breaks are allowed in: Base64 arrives wrapped at 64 or 76 characters
  // from every mail and certificate tool there is.
  const cleaned = text.replace(/[\s\r\n]+/g, '');
  const body = cleaned.replace(/=+$/, '');
  const padding = cleaned.length - body.length;
  if (padding > 2) throw new CodecError('That has more than two padding characters on the end.');
  if (padding && cleaned.length % 4 !== 0) {
    throw new CodecError('That is padded, but its length is not a multiple of four.');
  }
  if (body.length % 4 === 1) {
    throw new CodecError('That is one character too long or three too short to be Base64.');
  }

  const bytes = new Uint8Array(Math.floor((body.length * 6) / 8));
  let held = 0;
  let bits = 0;
  let out = 0;
  for (const ch of body) {
    let value = ALPHABET.indexOf(ch);
    if (value < 0) value = URL_ALPHABET.indexOf(ch);
    if (value < 0) {
      throw new CodecError(`"${ch}" is not a character Base64 uses.`);
    }
    // Masked to sixteen bits because that is all that is ever read back out:
    // at most six new bits on top of the seven that can still be waiting.
    held = ((held << 6) | value) & 0xffff;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes[out] = (held >> bits) & 0xff;
      out += 1;
    }
  }
  return bytes;
}

/* -------------------------------------------------------------------- html */

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  copy: '©', reg: '®', trade: '™', hellip: '…',
  mdash: '—', ndash: '–', lsquo: '‘', rsquo: '’',
  ldquo: '“', rdquo: '”', bull: '•', middot: '·',
  deg: '°', plusmn: '±', times: '×', divide: '÷',
  euro: '€', pound: '£', yen: '¥', cent: '¢',
  sect: '§', para: '¶', dagger: '†', laquo: '«',
  raquo: '»', frac12: '½', frac14: '¼', frac34: '¾',
  larr: '←', rarr: '→', harr: '↔', crarr: '↵',
  infin: '∞', ne: '≠', le: '≤', ge: '≥',
};

/**
 * The five characters that have to be escaped, and nothing else.
 *
 * Escaping every accented letter as well is the other common behaviour and it
 * is a worse default: it triples the size of a page of French for no gain, on
 * documents that have said `<meta charset="utf-8">` since about 2005.
 */
export function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

export function unescapeHtml(text) {
  return text.replace(/&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, body) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X'
        ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return whole;
      return String.fromCodePoint(code);
    }
    return NAMED[body] ?? whole;
  });
}

/* --------------------------------------------------------------------- hex */

export function bytesToHex(bytes, { spaced = false } = {}) {
  const parts = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
  return spaced ? parts.join(' ') : parts.join('');
}

export function hexToBytes(text) {
  // Whatever separator it arrived with - spaces, line breaks, `0x`, `\x` - is
  // dropped, because every hex dump uses a different one.
  const cleaned = text.replace(/0x|\\x|[\s,:;-]+/gi, '');
  if (cleaned === '') return new Uint8Array(0);
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    const bad = cleaned.match(/[^0-9a-fA-F]/)[0];
    throw new CodecError(`"${bad}" is not a hex digit.`);
  }
  if (cleaned.length % 2) throw new CodecError('That is an odd number of hex digits.');
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/* ------------------------------------------------------- backslash escapes */

/**
 * The escapes a string literal in JavaScript, Java, C# or JSON uses. Every
 * character above ASCII goes out as \uXXXX, which is the point of asking:
 * the reason to want this is a file or a protocol that will not carry the
 * character itself.
 */
export function escapeUnicode(text) {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (ch === '\\') { out += '\\\\'; continue; }
    if (ch === '\n') { out += '\\n'; continue; }
    if (ch === '\r') { out += '\\r'; continue; }
    if (ch === '\t') { out += '\\t'; continue; }
    if (code < 0x20 || code === 0x7f) { out += `\\u${code.toString(16).padStart(4, '0')}`; continue; }
    if (code < 0x7f) { out += ch; continue; }
    // Above the basic plane a character is two UTF-16 units, and both have to
    // be written out for the escape to mean the same character.
    for (let i = 0; i < ch.length; i += 1) {
      out += `\\u${ch.charCodeAt(i).toString(16).padStart(4, '0')}`;
    }
  }
  return out;
}

export function unescapeUnicode(text) {
  let out = '';
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== '\\') { out += text[i]; continue; }
    const next = text[i + 1];
    const short = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v', '0': '\0', '\\': '\\', "'": "'", '"': '"', '/': '/' };
    if (next === 'u' && text[i + 2] === '{') {
      const end = text.indexOf('}', i + 3);
      const digits = end < 0 ? '' : text.slice(i + 3, end);
      if (!/^[0-9a-fA-F]{1,6}$/.test(digits)) throw new CodecError('\\u{...} needs hex digits in the braces.');
      out += String.fromCodePoint(parseInt(digits, 16));
      i = end;
      continue;
    }
    if (next === 'u' || next === 'x') {
      const width = next === 'u' ? 4 : 2;
      const digits = text.slice(i + 2, i + 2 + width);
      if (!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(digits)) {
        throw new CodecError(`\\${next} needs ${width} hex digits after it.`);
      }
      out += String.fromCharCode(parseInt(digits, 16));
      i += 1 + width;
      continue;
    }
    if (next !== undefined && next in short) { out += short[next]; i += 1; continue; }
    throw new CodecError(`\\${next ?? ''} is not an escape this reads.`);
  }
  return out;
}

/* ------------------------------------------------------------------ percent */

function decodePercent(text, whole) {
  try {
    return whole ? decodeURI(text) : decodeURIComponent(text);
  } catch {
    const bad = /%[0-9a-fA-F]{0,2}/.exec(text.replace(/%[0-9a-fA-F]{2}/g, ''));
    throw new CodecError(bad
      ? `"${bad[0]}" is not a complete percent escape.`
      : 'Those percent escapes are not valid UTF-8.');
  }
}

/* ---------------------------------------------------------------- the list */

/**
 * Every codec the page offers, in the order it offers them. One list, so the
 * <select> and the work behind it cannot disagree about what exists.
 */
export const CODECS = [
  {
    id: 'base64',
    name: 'Base64',
    note: 'Text to Base64 and back. Line breaks in the input are ignored, so a wrapped key pastes in as it is.',
    encode: (text) => bytesToBase64(utf8.encode(text)),
    decode: (text) => utf8.decode(base64ToBytes(text)),
  },
  {
    id: 'base64url',
    name: 'Base64, URL-safe',
    note: 'The same, with - and _ instead of + and /, and no padding. This is what a JWT and most tokens use.',
    encode: (text) => bytesToBase64(utf8.encode(text), { urlSafe: true }),
    decode: (text) => utf8.decode(base64ToBytes(text)),
  },
  {
    id: 'url',
    name: 'Web address, one value',
    note: 'Percent-encoding for a value going into a query string: everything a URL gives a meaning to is escaped.',
    encode: (text) => encodeURIComponent(text),
    decode: (text) => decodePercent(text, false),
  },
  {
    id: 'url-whole',
    name: 'Web address, whole URL',
    note: 'Percent-encoding that leaves the address itself working - the slashes, the ? and the & are kept.',
    encode: (text) => encodeURI(text),
    decode: (text) => decodePercent(text, true),
  },
  {
    id: 'html',
    name: 'HTML entities',
    note: 'The five characters that have to be escaped in markup. Decoding also reads numeric entities and the common named ones.',
    encode: escapeHtml,
    decode: unescapeHtml,
  },
  {
    id: 'hex',
    name: 'Hex bytes',
    note: 'The UTF-8 bytes of the text, in hex. Decoding ignores whatever separator the dump used.',
    encode: (text) => bytesToHex(utf8.encode(text), { spaced: true }),
    decode: (text) => utf8.decode(hexToBytes(text)),
  },
  {
    id: 'escapes',
    name: 'Backslash escapes',
    note: 'What a string literal in JavaScript, Java or JSON looks like: \\n, \\t and \\uXXXX for anything above ASCII.',
    encode: escapeUnicode,
    decode: unescapeUnicode,
  },
];

export const codecById = (id) => CODECS.find((codec) => codec.id === id) ?? CODECS[0];
