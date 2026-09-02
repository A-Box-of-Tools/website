# YAML to JSON Converter

*Both directions, and it says what each one costs — on your own machine.*  ·  lives at `/yaml-to-json/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

This conversion was already on the site. It was a menu entry on the *Convert*
tab of [`json-formatter`](../json-formatter/), it worked, and nobody could find
it: "yaml to json" is the phrase people type, and a page whose address, heading
and title all say **JSON Formatter** cannot answer it. A tool is found at the
address that says what it does.

So this page is that conversion and only that conversion, both ways. Formatting
JSON, XML, HTML and CSS is still the formatter's job and is not duplicated
here; the two link to each other, and a reader who wants the other thing is one
click away.

## What it does

| Direction | What it costs |
|---|---|
| YAML → JSON | Comments, because JSON has nowhere to put one. Anchors, aliases and tags stop the conversion rather than being guessed at |
| JSON → YAML | Nothing. Every JSON document is already a YAML document |

Both of those sentences are on the page, under the menu, *before* anything is
pasted rather than after.

## The parsers are shared parts, and only the ones this page reads

The JSON parser, the YAML parser and the error they throw are
`shared/js/parse-json.js`, `parse-yaml.js` and `parse-errors.js`, asked for in
`tool.toml` and copied into this tool at `src/shared/` by the build — the same
files `json-formatter` ships. They were byte-for-byte copies until the
JavaScript tests could follow a `./shared/` import
(`tests/js/resolve-shared.mjs`); a fix to the YAML reader is a fix to both
pages now, rather than to whichever one somebody happened to open.
`parse-xml` is deliberately not asked for: this page never mentions XML, and
`tests/js/yaml-to-json.test.js` fails if it ever ships the three hundred lines
of parser for it.

`src/convert.js` is the deliberate exception and is declared as a singleton
with its reason. The formatter's copy carries the XML pair as well, and
importing it here would pull three hundred lines of XML parser into a tool that
never mentions XML.

## Two things the parsers get right that are easy to get wrong

- **YAML 1.2, not 1.1.** `no` is the string `"no"`, not `false`. That is the
  Norway bug, and PyYAML still defaults to the version that has it. Going the
  other way those words are written back *quoted*, even though this reader
  would not need the quotes — because whatever opens the file next may be a 1.1
  reader.
- **Key order and digits survive.** `src/shared/parse-json.js` is a hand-written parser
  rather than a call to `JSON.parse`, which reorders integer-like keys and
  rounds a twenty-digit id to the nearest double.

## The direction follows the file

A dropped `.json` switches the menu to *JSON to YAML*, and a `.yaml` or `.yml`
switches it back. Dropping a JSON file onto a page set to read YAML would
either fail or — worse — succeed, because a great deal of JSON is also valid
YAML, and the reader would get their file back looking untouched and wonder
what the tool was for.

## What is deliberately not here

- **A YAML formatter.** YAML has no squeezed form worth writing: the short one
  is flow style, which is unreadable, and unreadable is the opposite of the
  reason to keep a file in YAML. Laying YAML out is the formatter's job.
- **Multi-document files.** `---` separators mean more than one document, and
  JSON has no shape that says that; an array would be a claim the file never
  made. The reader says so and stops.
- **Any network step at all.** There is no `fetch`, no `XMLHttpRequest` and no
  `sendBeacon` in `src/`. A YAML file is usually a deployment config, which is
  usually full of hostnames, bucket names and occasionally a secret somebody
  meant to move.

## Tests

`tests/js/text-convert.test.js` covers the conversions themselves — it imports
`json-formatter`'s copy, which the duplicate check holds identical to this one.
`tests/js/yaml-to-json.test.js` covers what is particular to this page: that
the menu offers exactly the two directions, and that `.json` and `.yaml`
extensions pick the right one.
