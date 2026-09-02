# JSON Formatter

*Lay it out, minify it, or convert it — on your own machine.*  ·  lives at `/json-formatter/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

This page, [`text-diff`](../text-diff/) and [`base64`](../base64/) used to be
one tool at `/text-tools/`, four jobs behind four tabs. The split gave each
job an address of its own; what stayed here is the half the tabs were really
about — laying out JSON, XML, HTML, CSS and YAML, and converting JSON to YAML
or XML and back.

The English address then moved a second time, from `/format-json/` to
`/json-formatter/`. The split had named it for what the page does; the phrase
people type is the other way round, and the ten locales that write their own
slug had built theirs that way from the start. Both old addresses redirect,
and `/text-tools/` points straight here rather than through the one in
between; see `[redirects]` in `config/site.toml`.

Everything it does is arithmetic over a string, and it is the tool where the
promise this site makes matters most and is easiest to check. The things people
paste into an online formatter are access tokens, session cookies, customer
records and unreleased code, and every one of those sites is a site they have
handed them to. There is no such step here, and no code path that could add
one.

---

## Why Format and Convert stayed together

Because they share an input and they share their code. The JSON you have just
laid out is the JSON you want as YAML, and a conversion is one parser and one
printer, both of which the formatter already owns. Splitting these two would
have been two copies of `json.js` — which is the same reason the encoders and
the comparison *could* leave: `encode.js` and `diff.js` never touched the
parsers at all.

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

`src/shared/parse-json.js` reads into a small tree instead, keeps every number as the text it
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

One shape, defined at the top of `src/shared/parse-json.js`, and every parser here produces
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
| `shared/parse-json.js` | JSON | Order, number text, duplicate keys and string tokens are all preserved. Sorting keys is opt-in, and sorts the way a person reads them: `item2` before `item10`, using the browser's own collator |
| `shared/parse-xml.js` | XML and HTML | Two modes, because they are two languages. XML is strict and an unclosed tag is an error; HTML has void elements, raw-text elements, and the small well-known table of which tag closes which — without it, `<li>a<li>b` nests |
| `css.js` | CSS | A block parser, not a property parser, so `@layer`, `@container` and nesting it has never heard of pass through instead of failing. A custom property's value is copied untouched; nothing is reordered, merged or re-spelled |
| `shared/parse-yaml.js` | YAML 1.2 | Anchors, aliases, tags and second documents are refused **by name** rather than guessed at. `yes` and `no` are strings |

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

## What is deliberately not here

| Left out | Why |
|---|---|
| Formatting JavaScript, TypeScript, Python, SQL | Laying out a programming language means parsing it properly, and a formatter that gets it nearly right produces code that looks fine and does something else. That is Prettier, it is a megabyte of parser, and it belongs in an editor |
| Minifying JavaScript | Same reason, and this repository already has the cautious half of it in `buildlib/minify.py`, which refuses to move a line break because that is where semicolons get inserted |
| CSV and JSON, both ways | It is the next tool along on the roadmap — "Data: CSV and JSON conversion, cleaning, inspection" — and it wants a page with a table on it rather than a text box |
| Comparing two texts | [`text-diff`](../text-diff/), since the split |
| Base64 and the other encodings | [`base64`](../base64/), since the split |

## The files

```
body.html            the two tabs, the box, the result
styles.css           the tab strip and the boxes
src/main.js          the wiring: tabs, options, counts
src/format.js        which language this is, and one door to the four formatters
src/shared/parse-json.js    the JSON parser and printer, and the shared tree (a shared part)
src/shared/parse-xml.js     XML and HTML, in one parser with two rulebooks (a shared part)
src/css.js           the block parser
src/shared/parse-yaml.js    YAML 1.2, in the half of it a converter needs (a shared part)
src/convert.js       the four conversions, and what each one costs
src/shared/parse-errors.js  the error the four parsers throw, with a line and column (a shared part)
src/samples.js       the examples behind "Try an example"
```

## The tests

```bash
node --test "tests/js/text-format.test.js" "tests/js/text-convert.test.js"
```

Most of what is in them are round trips and refusals rather than comparisons
against expected output:

- `text-format.test.js` — that formatting changes the layout and nothing else,
  that every formatter is idempotent, and that each parser refuses what it
  should and says which line the problem is on.
- `text-convert.test.js` — JSON to YAML and back is the same document, and what
  the two lossy directions lose, written down as assertions.

Nothing here needs a browser, because nothing here needs a canvas, a codec or a
file: it is all strings in and strings out, which is the same reason the whole
tool can promise that nothing leaves the machine.
