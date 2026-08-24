/**
 * The words, out of the markup.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/phrases.js and the
 * build copies it to <tool>/src/shared/phrases.js. Unlike the other shared
 * parts it is not opt-in and is not listed in any tool.toml: every tool page
 * has sentences that JavaScript puts on it, so every tool page needs this. See
 * js_parts() in buildlib/site.py.
 *
 * WHY THE WORDS ARE NOT IN THE JAVASCRIPT
 *
 * Nothing under shared/js/ or tools/<slug>/src/ is translated. The build copies
 * both byte for byte into all eleven languages, so a sentence written in a
 * module is that sentence in English at ten of the eleven addresses the page
 * has. That is how a German reader whose browser refused the service worker
 * came to be told about it in English, on a page that was otherwise entirely
 * in German, in twenty-nine tools at once.
 *
 * The answer is not to translate the JavaScript. It is to stop the JavaScript
 * being where the words live. HTML already goes through the locale machinery -
 * body.html is translated per language, and so is every string in [ui] - so a
 * sentence held in the markup is a sentence a translator can already reach,
 * with no new file format and nothing new for the build to learn.
 *
 * WHERE A PHRASE COMES FROM
 *
 * Two blocks of hidden <span data-phrase="..."> elements, looked up in this
 * order:
 *
 *   #phrases        the tool's own, in tools/<slug>/body.html, translated in
 *                   locales/<lang>/tools/<slug>.html
 *   #frame-phrases  the frame's, in templates/tool.html, filled in from
 *                   [ui.tool] in config/site.toml and translated in
 *                   locales/<lang>/locale.toml
 *
 * The tool's own wins, which is what lets one tool say something sharper than
 * the frame's version of the same thing without every other tool having to
 * care: heic-to-jpg's "offline" line mentions that the decoder is cached too,
 * because on that tool that is the interesting part.
 *
 * This started as a private function in qr-barcode-reader/src/main.js, which
 * needed it for forty-odd sentences of its own. It is here because the other
 * twenty-eight tools need it for the frame's seven.
 */

/**
 * One phrase, with its blanks filled in.
 *
 * The whitespace is collapsed because the source is indented markup: a phrase
 * written across three lines of body.html is one sentence, not a sentence with
 * two newlines and six spaces in the middle of it.
 *
 * That collapse is why a Japanese or Chinese phrase has to stay on ONE line of
 * markup. Those languages put no space between words, so a line break in the
 * middle of one arrives here as a space in the middle of a sentence - and
 * nothing downstream can tell it from a space somebody meant. The ja and zh
 * translations of qr-barcode-reader already keep every phrase on one line for
 * this reason. Korean wraps freely, because Korean has spaces to wrap at.
 *
 * A key that resolves to nothing comes back as the key. That is deliberate and
 * is not a fallback to English - there is no English here to fall back to. A
 * bare `offline.ready` on screen says "this page is built wrong" plainly
 * enough, and, unlike a throw, it cannot be the thing that breaks the window's
 * own error handler, which is one of the callers.
 *
 * @param {string} key  the `data-phrase` to find
 * @param {Record<string, string|number>} [values]  what to put in the blanks
 * @returns {string}
 */
export function phrase(key, values = {}) {
  const found = document.querySelector(`#phrases [data-phrase="${key}"]`)
    ?? document.querySelector(`#frame-phrases [data-phrase="${key}"]`);
  const text = (found?.textContent ?? key).replace(/\s+/g, ' ').trim();

  // Single braces, because the strings in [ui.tool] pass through the build's
  // own {{ ... }} templating on the way to the page. A placeholder the build
  // recognised too would be one a translator could fill in correctly and have
  // silently rendered away before this file ever saw it.
  //
  // A blank with no value keeps its braces: a translation naming something the
  // caller does not pass is a mistake worth seeing rather than one worth
  // hiding behind a gap in a sentence.
  return text.replace(/\{(\w+)\}/g, (whole, name) => (
    name in values ? String(values[name]) : whole));
}
