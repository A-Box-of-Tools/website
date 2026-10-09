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

`src/shared/parse-xml.js` is a hand-written reader. It has no entity resolution in it at
all — not disabled behind a flag, *absent* — and the page never hands your text
to the browser's `DOMParser`. A `DOCTYPE` carrying an external entity is copied
through without ever being acted on, and `&xxe;` comes out as the five
characters `&xxe;`:

```
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<root><data>&xxe;</data></root>
```
→ `{ "root": { "data": "&xxe;" } }`

`unescapeXml` in `src/shared/parse-xml.js` expands the five entities XML defines
and valid numeric character references, and nothing else. Invalid references
are rejected at their source location before either conversion or formatting;
XML 1.1 character ranges are used only when that version is declared.

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
reads back. The mapping still loses comments and the interleaved order of
mixed text and child elements; the note beside the conversion menu says so.
Text itself keeps its leading/trailing spaces and CDATA content. Whitespace
used only between child elements is omitted unless `xml:space="preserve"`
applies, including by inheritance; `xml:space="default"` resets that behavior.

## The parsers are shared parts, and only the ones this page reads

The XML parser, the JSON parser and the error they throw are
`shared/js/parse-xml.js`, `parse-json.js` and `parse-errors.js`, asked for in
`tool.toml` and copied into this tool at `src/shared/` by the build — the same
files `json-formatter` ships. They were byte-for-byte copies until the
JavaScript tests could follow a `./shared/` import
(`tests/js/resolve-shared.mjs`); a fix to the XML reader lands on both pages
now. `parse-yaml` is deliberately not asked for: this page never mentions YAML,
and `tests/js/xml-formatter.test.js` fails if it ever ships the six hundred
lines of parser for it.

`src/convert.js` stays this tool's own, declared as a singleton in
`tests/python/test_duplicates.py` with its reason: `json-formatter`'s copy
carries the YAML pair as well. Its two functions are lifted from that file
unchanged all the same, so the two copies still read side by side.

## Why not `DOMParser`

Because of what it says when the document is broken. `DOMParser` hands back an
error document whose wording differs in every browser and often amounts to
"error on line 1". A hand-written reader can say *which tag* was never closed
and where it was opened, which is the thing you actually needed. Not resolving
external entities is the other reason.

## What reindenting does and does not change

XML text is preserved exactly, including its leading/trailing and repeated
spaces. Text-only and mixed-content elements stay together so indentation
cannot insert characters between their nodes; CDATA is copied unchanged.
`xml:space="preserve"` also keeps whitespace between child elements, and the
setting is inherited until an explicit `xml:space="default"` overrides it.
Otherwise whitespace between child elements is treated as layout, as before;
this is an application choice, not a claim that a DTD has proved it ignorable.

XML needs one outer element. Text or CDATA outside it and a second root are
rejected instead of letting conversion silently keep only the first. Comments
and processing instructions remain allowed in the prolog and epilog; an XML
declaration must be first and a DOCTYPE can appear only once, before the root.
DOCTYPE internal subsets remain literal text, never instructions to resolve
an entity or contact another file.

## Tests

`tests/js/text-format.test.js` and `tests/js/text-convert.test.js` cover the
shared XML parser and the two conversions through `json-formatter`'s
`convert.js`, which carries the same two functions. `tests/js/xml-formatter.test.js`
covers what is particular to this page: that the menu offers exactly the two
directions, and that a `DOCTYPE` with an external entity in it is returned as
text.

## Edited input and result actions

The editable boxes carry `data-language-text`: the language switch saves their
current contents instead of replaying the file they were imported from. A
cleared box therefore stays clear, and edits are not overwritten by an
asynchronous file read after navigation. Copy and Download are invalidated as
soon as typing starts, before the debounced calculation runs; a pending
clipboard write may only update feedback for the result it actually copied.

File reads on this page use the shared `text-import` owner. Typing, Clear and
an example retire a pending read immediately; a newer file choice replaces it.
The old read may still finish in the browser, but its text and errors cannot
replace the current editor or clear a newer import's reading label.
