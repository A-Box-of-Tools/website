/**
 * Turning the bytes of a file into a data: URI.
 *
 * There are two encodings here, because there are two kinds of image file and
 * they want different ones.
 *
 * Base64 is the one everybody knows, and for a PNG or a JPEG it is the only
 * option: the bytes are not text, and a URL can only carry text. It costs a
 * third: three bytes go in, four characters come out.
 *
 * An SVG is text already, and putting text through base64 is the wrong trade
 * twice over. It pays the same third for nothing, and it turns a stylesheet
 * you could read into a wall of letters. Percent-encoding the few characters a
 * URL genuinely cannot carry leaves the markup legible and, on a typical icon,
 * shorter than base64 by a quarter.
 *
 * Nothing here decodes a picture or re-encodes one. The bytes that came off the
 * disk are the bytes that go into the URI, which is the reason this tool can
 * say the result is the same image rather than a copy of it.
 */

/**
 * Base64, in chunks.
 *
 * `btoa` takes a string, and the usual way to build that string is
 * `String.fromCharCode(...bytes)` - which passes one argument per byte and
 * overflows the call stack somewhere around a hundred thousand of them. A
 * photo is several million. 32 KB at a time is well inside every engine's
 * argument limit and turns the whole thing into a handful of passes.
 *
 * @param {Uint8Array} bytes
 * @returns {string} base64, unwrapped and unpadded-with-newlines
 */
export function base64(bytes) {
  const CHUNK = 0x8000;
  let binary = '';
  for (let at = 0; at < bytes.length; at += CHUNK) {
    binary += String.fromCharCode.apply(null, bytes.subarray(at, at + CHUNK));
  }
  return btoa(binary);
}

/** The reverse, for the tests: a URI that does not decode to the file it came
 *  from is the one failure this tool could have that nobody would notice. */
export function fromBase64(text) {
  const binary = atob(text);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

/**
 * The characters an SVG cannot keep, and why each one has to go:
 *
 *   %  starts an escape, so it has to escape itself before anything else can
 *   #  starts a fragment - a browser would drop everything after it
 *   <  is not legal in a URL, and would close the attribute in HTML besides
 *   >  is not legal in a URL either
 *   "  would close the quotes this tool always writes around the result
 *
 * Spaces are deliberately not on the list. An SVG is mostly spaces - between
 * every attribute and every number in a path - and `%20` would cost three
 * characters for each of them. They are legal inside a quoted URL, which is
 * why every shape this tool writes quotes the URI rather than leaving it bare.
 */
const MUST_ESCAPE = /["#%<>]/;

/**
 * Percent-encode an SVG for a data: URI, and nothing more than that.
 *
 * The markup is not minified, reordered or tidied. Whitespace inside a
 * <text> element is content, and an SVG that has been "optimised" on the way
 * into a stylesheet is an SVG that renders differently from the file on disk -
 * which is exactly the kind of surprise a tool at this end of the job should
 * not be producing. Line breaks are escaped rather than removed, so the
 * original comes back out of `decodeURIComponent` byte for byte.
 *
 * @param {string} text the SVG source, as UTF-8 text
 * @returns {string} safe to drop inside double quotes anywhere
 */
export function encodeSvg(text) {
  let out = '';
  // Iterated by code point rather than by code unit: an emoji inside a <text>
  // element is a surrogate pair, and encoding half of one produces a URI that
  // decodes to a replacement character.
  for (const ch of stripBom(text)) {
    const code = ch.codePointAt(0);
    // Below 0x20 is a control character (line breaks among them), above 0x7e
    // is DEL or anything non-ASCII, which has to become its UTF-8 bytes.
    out += (code < 0x20 || code > 0x7e || MUST_ESCAPE.test(ch))
      ? encodeURIComponent(ch)
      : ch;
  }
  return out;
}

/** A byte-order mark is invisible, legal, and enough to stop some parsers
 *  recognising the root element. It carries no information here. */
function stripBom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

/**
 * `data:image/svg+xml,...` - with no `;charset=utf-8`.
 *
 * The parameter is legal and pure cost: every non-ASCII character is already
 * percent-encoded as UTF-8 bytes above, which is what a data URI is read as
 * when nothing says otherwise.
 */
export function svgDataUri(text) {
  return `data:image/svg+xml,${encodeSvg(text)}`;
}

/** `data:image/png;base64,...` and the rest. */
export function base64DataUri(bytes, mime) {
  return `data:${mime};base64,${base64(bytes)}`;
}
