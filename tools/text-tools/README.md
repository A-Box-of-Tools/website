# Text & Code

*Format it, compare it, encode it, convert it — on your own machine.*  ·  lives at `/text-tools/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The seventeenth tool, and the second one here with no file in it — `qr-barcode`
got there first. Everything it
does is arithmetic over a string: laying out JSON, XML, HTML, CSS and YAML;
comparing two texts; Base64 and four other encodings; and converting JSON to
YAML or XML and back.

It is also the tool where the promise this site makes matters most, and the one
where it is easiest to check. The things people paste into an online formatter
are access tokens, session cookies, customer records and unreleased code, and
every one of those sites is a site they have handed them to. There is no such
step here, and no code path that could add one.

---

## Why this is one tool and not four

Because the four jobs share an input. The JSON you have just laid out is the
JSON you want to compare against the one from the other branch, which is the
JSON you then want as YAML — and the alternative arrangement is three pages and
two copy-pastes. The tabs share one box for exactly that reason.

They also share almost all of their code. `Compare` and `Format` both need to
know what a line is; `Convert` is one parser and one printer, both of which
`Format` already owns. Four pages would have been four copies of `json.js`.

## Why the JSON parser is hand-written

`JSON.parse` is right there, it is fast, and it is wrong for this job in two
ways that a formatter cannot live with.

**It reorders keys.** An object's integer-like keys come back first, in numeric
order, because that is what JavaScript objects do:

```js
Object.keys(JSON.parse('{"10":"a","2":"b","x":"c"}'))   // ['2', '10', 'x']
```

A tool that quietly rearranged somebody's `package.json` would be doing a
different job from the one it offered to do.

**It throws the numbers away.** `JSON.parse` produces doubles, so a twenty-digit
id loses its last three digits and `1e999` becomes `Infinity`, which
`JSON.stringify` then writes out as `null`. The number that came in is not the
number that goes out, and nothing on the page says so.

`src/json.js` reads into a small tree instead, keeps every number as the text it
was written as, keeps the order of the keys, keeps duplicate keys — the standard
does not say which one wins, so dropping one would be choosing for the reader —
and keeps each string's source token, so an escape stays an escape. It also
reports where it stopped, in the terms the page can show:

```
A raw control character in a string - write it as an escape (line 12, column 34)
```

rather than `Unexpected token } in JSON at position 4193`, which is a position
in a string nobody is looking at.

## The tree everything else speaks

One shape, defined at the top of `src/json.js`, and every parser here produces
it and every printer here consumes it:

```
{ t: 'map',  pairs: [{ key, keyRaw?, value }] }
{ t: 'seq',  items: [...] }
{ t: 'str',  value, raw? }
{ t: 'num',  raw }
{ t: 'bool', value }
{ t: 'null' }
```

That is why `convert.js` is a hundred lines rather than four converters: "JSON
to YAML" is `printYaml(parseJson(text))`, with nothing in between that knows
about both formats at once, so the two directions cannot disagree about what a
document said.

## The four formatters, and what each one refuses to do

| File | Reads | The decision worth knowing |
|---|---|---|
| `json.js` | JSON | Order, number text, duplicate keys and string tokens are all preserved. Sorting keys is opt-in, and sorts the way a person reads them: `item2` before `item10`, using the browser's own collator |
| `xml.js` | XML and HTML | Two modes, because they are two languages. XML is strict and an unclosed tag is an error; HTML has void elements, raw-text elements, and the small well-known table of which tag closes which — without it, `<li>a<li>b` nests |
| `css.js` | CSS | A block parser, not a property parser, so `@layer`, `@container` and nesting it has never heard of pass through instead of failing. A custom property's value is copied untouched; nothing is reordered, merged or re-spelled |
| `yaml.js` | YAML 1.2 | Anchors, aliases, tags and second documents are refused **by name** rather than guessed at. `yes` and `no` are strings |

The last two are borrowed decisions. `buildlib/cssmin.py` minifies this site's
own stylesheets and follows the same rule — a minifier that occasionally
changes a page is worth less than no minifier — and `--op: +` is a real
declaration, because a custom property's value is an unparsed token stream that
does not have to be valid anything until it is substituted somewhere.

The YAML one is the [Norway problem](https://en.wikipedia.org/wiki/YAML): in
YAML 1.1, `no` is a boolean, so the country code for Norway in a list of
countries silently becomes `false`. YAML 1.2 dropped that. So does this, which
is why converting a file with `no` in it produces `"no"` and not `false`.

It is asymmetric on purpose. `no` is *read* as a string, and *written* as
`'no'` — quoted, even though this reader would not need the quotes — because
the program that opens the file next may still be on 1.1, and PyYAML is.
Reading strictly and writing conservatively is the only combination that is
right whichever end you are at.

**Reindenting HTML is not free**, and the page says so. Whitespace between two
inline elements is a space between two words. Two things keep it in check:
`<pre>` and `<textarea>` are copied through exactly, and an element holding
nothing but text stays on the line it is on.

## The comparison

Myers' algorithm — the one `git diff` uses. Walk a grid whose axes are the two
texts, where a diagonal step is a line both sides have; the shortest path is the
smallest edit script. Smallest is what makes a diff readable: a line inserted in
the middle should show as one insertion, not as every line after it having
changed.

It is O(ND), which is fast when the two are similar and quadratic when they are
not. Three things keep the pathological case out of the page:

1. **The common prefix and suffix are trimmed first.** Two 20,000-line files
   differing in one place become a diff of two one-line files.
2. **The number of steps is capped**, because the walk keeps one row per step
   so the path can be retraced — about `8 × steps²` bytes, which is 32 MB at
   the ceiling set here.
3. **A floor on the answer is computed before the walk starts.** The best
   possible edit script keeps every line the two sides have in common, so
   `n + m - 2 × common` is a lower bound on the number of steps, and counting
   that is O(n + m). When the floor is already over the ceiling there is no
   point walking at all: two files with nothing in common go from being the
   most expensive case to the cheapest, and the answer is the same one the walk
   would have reached.

The same routine runs a second time inside each changed line, over words rather
than lines, which is what marks the word that changed instead of the paragraph
around it. Punctuation is its own token, so a changed argument in a line of code
shows up as one word.

What comes out is a unified diff — the `@@ -3,5 +3,5 @@` format that
`git apply`, `patch` and every review tool read. What is on screen is a view of
it, and only a view: the rows are collapsed to a count where nothing changed,
and past a few thousand rows the page stops drawing and points at the download,
because nobody reads the eight thousandth row of a diff.

## The encoders

Base64 is written out rather than handed to `btoa`, for two reasons:

- `btoa` throws on any character above U+00FF, so every caller has to encode to
  UTF-8 bytes first anyway — at which point the remaining part is twenty lines.
- `atob` accepts input it should refuse. Wrong padding, characters outside the
  alphabet: it returns something plausible instead of saying that what it was
  given was not Base64. Being told is the whole point of pasting something into
  a decoder.

It is checked against the test vectors in RFC 4648 rather than against its own
decoder, which is the rule `tests/js/crc32.test.js` already follows: a codec
that agrees with itself and with nothing else will disagree with everybody the
first time it matters.

The others are percent-encoding (a single value, and a whole URL, which are
different jobs), HTML entities — the five that have to be escaped and not the
accented letters, which have been fine since every page started saying UTF-8 —
hex bytes, and the backslash escapes a string literal uses.

## What is deliberately not here

| Left out | Why |
|---|---|
| Formatting JavaScript, TypeScript, Python, SQL | Laying out a programming language means parsing it properly, and a formatter that gets it nearly right produces code that looks fine and does something else. That is Prettier, it is a megabyte of parser, and it belongs in an editor |
| Minifying JavaScript | Same reason, and this repository already has the cautious half of it in `buildlib/minify.py`, which refuses to move a line break because that is where semicolons get inserted |
| CSV and JSON, both ways | It is the next tool along on the roadmap — "Data: CSV and JSON conversion, cleaning, inspection" — and it wants a page with a table on it rather than a text box |
| Verifying a JWT signature | Reading one is Base64, which is here. *Verifying* one needs the key, and a page that asks for your signing key is a page you should be suspicious of |
| Hashes and checksums | On the roadmap as "Privacy & security", and a `SubtleCrypto` call rather than a parser |

## The files

```
body.html            the four tabs, the boxes, the result
styles.css           the tab strip and the diff grid
src/main.js          the wiring: tabs, options, counts, drawing the comparison
src/format.js        which language this is, and one door to the four formatters
src/json.js          the JSON parser and printer, and the shared tree
src/xml.js           XML and HTML, in one parser with two rulebooks
src/css.js           the block parser
src/yaml.js          YAML 1.2, in the half of it a converter needs
src/convert.js       the four conversions, and what each one costs
src/encode.js        Base64, percent, entities, hex, escapes - both ways
src/diff.js          Myers, the word diff, and the unified output
src/samples.js       the examples behind "Try an example"
```

## The tests

```bash
node --test "tests/js/text-*.test.js"
```

Four files, and most of what is in them are round trips and refusals rather
than comparisons against expected output:

- `text-format.test.js` — that formatting changes the layout and nothing else,
  that every formatter is idempotent, and that each parser refuses what it
  should and says which line the problem is on.
- `text-convert.test.js` — JSON to YAML and back is the same document, and what
  the two lossy directions lose, written down as assertions.
- `text-encode.test.js` — the RFC 4648 vectors, both Base64 alphabets, and every
  codec round-tripping the same awkward string.
- `text-diff.test.js` — that the deletions rebuild the left-hand text and the
  insertions rebuild the right-hand one, which is what "correct" means for a
  diff, plus the two performance cases: 20,000 lines with one change, and two
  files with nothing in common.

Nothing here needs a browser, because nothing here needs a canvas, a codec or a
file: it is all strings in and strings out, which is the same reason the whole
tool can promise that nothing leaves the machine.
