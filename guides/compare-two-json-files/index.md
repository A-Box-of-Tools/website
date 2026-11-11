# How to compare two JSON files

Diff two JSON files as they come and most of what lights up is nothing: indentation, line wrapping, keys in a different order. The fix is not a cleverer diff — it is putting both files through the same formatter first, so that the only differences left are real ones. Both steps run in your browser, which is where config files with secrets in them belong.

[Open the Text Diff](https://abox.tools/text-diff/): Two texts in, every difference marked, line by line and word by word. Nothing is pasted into anyone else's server.

Last updated 13 October 2026

## The short answer

1. Open the [JSON Formatter](https://abox.tools/json-formatter/), paste the first file, set the indentation to two spaces, and tick *Sort the keys of every object*. Copy the result.
2. Open the [Text Diff](https://abox.tools/text-diff/) and paste it into the left-hand box.
3. Do the same with the second file, into the right-hand box.

The result is much easier to read: a value that changed, a key that appeared, an entry that went. The formatting differences and the reordered keys that would have drowned an ordinary diff are gone, because both sides were spelled the same way before the comparison started.

Neither page has any network feature at all — worth knowing, since the JSON people compare is so often config files with credentials still inside.

## Configuration changes and API regressions

To compare staging with production, keep the originals and format a copy of each with two spaces and sorted object keys. Put staging on the left and production on the right, leave Ignore case and Ignore whitespace off, and review endpoints, feature flags and limits. Spaces inside a string and the case of a key can be meaningful. Download the patch only after confirming which environment is on which side.

The same recipe checks an API response before and after a change. Use the same request inputs, and account for timestamps or generated IDs separately. Arrays keep their order: a reordered list still differs, as it should for an ordered JSON sequence. Equivalent number spellings such as `1` and `1.0`, or differently escaped strings, can also differ here. This is a comparison of formatted text, not a schema check or a test of every JSON value's equivalence. [The JSON standard](https://www.rfc-editor.org/rfc/rfc8259.html#section-1) distinguishes unordered objects from ordered arrays.

## Why a raw JSON diff is mostly noise

JSON does not care about whitespace, and it does not give key order a meaning. The same document can be one line or four hundred, keys in the order they were typed or the order some library emitted them — and tools rewrite both freely. One side minified, one side pretty; one side saved by hand, the other by a serialiser that sorts alphabetically: a line diff sees two unrelated files.

The two worst cases make the point. A **minified** file is one line, so a diff against it is one giant changed line — true and useless. And two files with the **same content in a different order** diff as everything-changed, when the honest answer is “nothing”.

![The comparison options: a side-by-side or inline view, a switch for showing only the lines that changed, and switches for ignoring whitespace, case and blank lines.](https://abox.tools/screens/compare-two-json-files/options.webp)

Use the ignore switches carefully: they affect the view, while the downloaded patch keeps every input difference, including line endings.

## What the formatter's canonical form fixes

Running both files through the same formatter with the same settings is what a diff needs: one spelling per document.

- **Same indentation** puts each key on its own line, so the diff works line by line, and its word-level marks can point at the one value that changed inside a line.
- **Sorted keys** puts both sides in the same order, so order stops being a difference. The sort is by how keys read, not by code points — `item2` before `item10` — and it is applied identically to both sides.
- **Nothing else moves.** This formatter keeps numbers as the digits you wrote and keeps duplicate keys rather than resolving them — so canonicalising cannot itself invent a difference. The [formatter guide](https://abox.tools/guides/format-json-without-uploading-it/) explains why that is rarer than it should be.

One honest caveat: sorted output is the document with its keys moved. If a downstream tool cares about key order — few do, but they exist — treat the sorted copies as the things being compared, not as replacements for the originals.

## Reading the result, and taking it with you

The diff marks removed lines on the left, added lines on the right, and highlights the words that changed inside a changed line — on a canonical form, that is typically the single value that moved from `false` to `true`. The unchanged middle folds to a count, so a two-thousand-line config with three edits reads as three short passages.

The download is a unified `.patch` — the format code review understands. It describes the canonical forms, which is usually what a review wants anyway: the change, without the reformatting.

The same format-then-compare approach can make YAML or XML easier to review, but their whitespace and conversion rules differ from JSON's. Keep the original language when layout is all you need to change. The diff's ignore switches affect its view; the patch compares the actual input strings. Here those inputs are your formatted copies, so that patch is not a patch against the untouched originals.

![Two versions of a JSON configuration side by side, with changed lines marked: a version number, a retry count, an added feature flag and an added region.](https://abox.tools/screens/compare-two-json-files/diff.webp)

Four real differences, and nothing else reported. Reading it is the easy half; the work was done by the settings above it.

## If you do this every week

Format twice, paste twice — the steps live on two pages because each page does one job, and each can prove on its own that nothing you pasted went anywhere. But both are open source: MIT-licensed, dependency-free ES modules — the formatter's parser keeps key order and digits, the diff is Myers' algorithm — each with a README that explains it.

If this is part of your day, point a coding agent at the [repository](https://github.com/A-Box-of-Tools/website) and ask it for a two-box page that canonicalises as it compares — `parseJson`, `printJson` and `compareText` are three imports away. The modules were written to be read, and lifting them is what the licence is for.
