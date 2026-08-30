# XML Formatter

*Lay it out, squeeze it flat, or turn it into JSON — on your own machine.*  ·  lives at `/xml-formatter/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

Both of these jobs were already on the site, and neither could be found. XML
was an entry in [`json-formatter`](../json-formatter/)'s language menu and
"XML to JSON" an entry in its conversion menu — real, working, and invisible to
anybody searching for them, because a page whose address, heading and title all
say **JSON Formatter** does not answer "xml formatter". A tool is found at the
address that says what it does.

What stays on that page is the language menu it is named for, HTML and CSS
included. This one is XML and the JSON it converts to, and nothing else.

## What it does

- **Format** — lay XML out with two spaces, four, or a tab, or squeeze it flat
  and be told how many bytes that saved.
- **Convert** — XML to JSON, or JSON to XML, with what each direction costs
  written under the menu.

## No external entities, and nothing to switch off

`src/xml.js` is a hand-written reader. It has no entity resolution in it at
all — not disabled behind a flag, *absent* — and the page never hands your text
to the browser's `DOMParser`. A `DOCTYPE` carrying an external entity is copied
through without ever being acted on, and `&xxe;` comes out as the five
characters `&xxe;`:

```
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root><data>&xxe;</data></root>
```
→ `{ "root": { "data": "&xxe;" } }`

`unescapeXml` in `src/convert.js` expands the five entities XML defines and
numeric character references, and nothing else. That is the whole of it.

This is worth stating plainly because XXE is the oldest hole in the format and
because "paste your XML here" is exactly the shape of tool that has it.

## Every value out of XML is a string

`<port>8080</port>` says nothing about whether that is a number. The JSON says
`"8080"`. A converter that decided for you would be inventing information that
then travels on as though it had been in the file.

The rest of the mapping is the usual one: an attribute becomes a member whose
name starts with `@`, an element's own text becomes `#text` when it has to sit
beside something else, and repeated children become an array. Going the other
way an array becomes a repeated element, because that is the only shape that
reads back.

## The parsers are copies, on purpose

`src/xml.js`, `src/json.js` and `src/errors.js` are byte for byte
`json-formatter`'s, declared as groups in `tests/python/test_duplicates.py`,
which fails if they drift. They cannot simply be shared: `build.py` copies
`shared/js/` into a tool at `src/shared/` **at build time**, that path does not
exist in the source tree, and the JavaScript tests import these modules
straight off the disk. That is the trade the repository has already made five
times over for the MP4 reader.

`src/convert.js` is the deliberate exception and is declared as a singleton
with its reason: `json-formatter`'s copy carries the YAML pair as well, and
importing it here would pull six hundred lines of YAML parser into a tool that
never mentions YAML. Its two functions are lifted from that file unchanged all
the same, so the two copies still read side by side.

## Why not `DOMParser`

Because of what it says when the document is broken. `DOMParser` hands back an
error document whose wording differs in every browser and often amounts to
"error on line 1". A hand-written reader can say *which tag* was never closed
and where it was opened, which is the thing you actually needed. Not resolving
external entities is the other reason.

## What reindenting does and does not change

Whitespace inside an element that holds words is part of that text, so an
element holding nothing but text is left on one line rather than opened out.
`CDATA` sections are copied through exactly as they were. For a document whose
elements hold other elements, the layout carries no meaning at all.

## Tests

`tests/js/text-format.test.js` and `tests/js/text-convert.test.js` cover the
XML parser and the two conversions through `json-formatter`'s copies, which the
duplicate check holds identical to these. `tests/js/xml-formatter.test.js`
covers what is particular to this page: that the menu offers exactly the two
directions, and that a `DOCTYPE` with an external entity in it is returned as
text.
