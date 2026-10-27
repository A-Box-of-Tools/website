# Stitch Tables

*Two source tables, with the rule that connects them made explicit.* · lives at
`/stitch-tables/` · [all tools](../) · [how the site is built](../../README.md)

The input is delimited text: pasted spreadsheet cells, CSV, TSV, semicolon- or
pipe-delimited files. It is not an XLSX reader. Keeping that boundary makes a
table operation small enough to ship with the page and run offline without
uploading either source to a spreadsheet service.

## The three jobs

| Job | What decides the rows | What happens to columns |
|---|---|---|
| Match rows | Equal keys extracted from selected columns | Both sources are retained |
| Pair rows manually | Explicit one-to-one A/B pairs | Both sources are retained |
| Stack rows | A rows followed by B rows | Trimmed headings and occurrence align columns; B-only columns follow A's |
| Place side by side | Equal row positions | Both sources are retained; the shorter side is padded |

For matching and manual pairing, full output preserves every unpaired row,
left output preserves A's rows and drops B-only rows, and inner output keeps
only pairs. Full output is the default because an unexplained missing record is
harder to notice than an empty half-row. Stack aligns by position if either
input does not use a heading row.

## Comparison keys are not cell edits

`src/table-data.js` owns parsing, key extraction, joining and serialization
without a DOM dependency. Exact matching can trim surrounding whitespace and
ignore case through visible options. Built-in patterns select the first ASCII
digit run, remove punctuation and spaces while keeping letters and digits, or
select text before or after the first literal separator. Keys stay strings:
`001` and `1` remain different.

The key decides equality while output retains original cells. Empty keys and
failed extractions are unmatched. There is no fuzzy similarity score or
arbitrary regular expression to let run without a deadline on the main thread.

Repeated automatic keys produce every possible match. Two A rows and three B
rows with one key produce six result rows; choosing one silently loses data.
The page reports duplicate keys, and output limits stop the multiplication
before a large result can exhaust memory. Manual pairing is one-to-one instead.

## Parsing and bounds

The reader understands quoted delimiters, doubled quotes, quoted newlines,
UTF-8 BOMs and LF or CRLF input. Automatic delimiter detection considers comma,
tab, semicolon and pipe outside quoted cells; an explicit delimiter is available
for ambiguous sources. Cells remain strings, including leading zeroes, dates
and large numeric identifiers.

Short data rows are padded with empty cells. A row wider than its headings is
refused rather than losing cells or inventing a heading. Header-free input
derives its width from the data. Empty and repeated headings remain distinct by
position; stacked repeated headings align by occurrence instead of overwriting.

Each input allows 2,097,152 text characters, 5,000 data rows, 100 columns and
100,000 data cells. Selected files are also limited to 2 MiB. Output allows
20,000 rows and 500,000 data cells. These are local resource bounds, not a
service quota. The preview reports the full count, and serialization uses every
prepared row.

## Ownership of a prepared result

`src/main.js` owns source boxes, per-side file reads, column choices, manual
pairs and preview. Editing a source invalidates pairings and prepared output.
Malformed input or invalid settings cannot leave the last successful export
active. Pending file reads belong to a source revision so an earlier read
cannot replace a later paste or reset. Values use `textContent`, not markup.

Export writes CSV or TSV with quoting where needed. Visible formula protection
is enabled by default and prefixes potentially active spreadsheet cells with
an apostrophe. This changes exported text and is described beside the option.
Turning it off preserves source text. CSV carries no spreadsheet types, so the
receiving application can still infer numbers and dates.

The shared `download` part manages local Blob URLs; `clipboard-feedback`
attaches feedback to the value actually copied. Visitor-facing strings live in
`body.html` and are read through `phrase()`.

## Verification

`tests/js/stitch-tables.test.js` covers quoted and malformed input, string
preservation, automatic/manual joins, blank/duplicate keys, patterns, heading
alignment, unequal row counts, formula protection and bounds. CI runs tests.
The browser check exercises the built page's workflows, file input,
copy/download, invalidation and the narrow layout.
