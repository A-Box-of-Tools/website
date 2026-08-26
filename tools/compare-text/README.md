# Text Diff

*Compare two texts, side by side — on your own machine.*  ·  lives at `/compare-text/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

This page, [`format-json`](../format-json/) and [`encode-text`](../encode-text/)
used to be one tool at `/text-tools/`, four jobs behind four tabs. The
comparison was the only tab with a second box, which made it the odd one out
in the shared layout as well as in the search results — so the split gave it
a page shaped for two texts and an address of its own. `src/diff.js` moved
here unchanged.

The things people compare are contracts, config files and unreleased code, in
pairs — pasting them into somebody else's diff checker is giving both versions
away at once. There is no such step here, and no code path that could add one.

---

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

## The view

One CSS grid for the whole comparison rather than a table per row, so the line
number columns line up down the whole page — which is the only reason to read
a diff side by side at all. Each row is `display: contents`, making its cells
the grid's children rather than a box of their own.

Long lines wrap rather than scrolling the view sideways: a diff that has to be
scrolled in two directions is one nobody reads, and a wrapped line is still
obviously one line, because it has a line number and its continuation does not.
A phone starts on the one-column view — side by side needs two columns of text
and a phone has room for about one — as a starting position rather than a
lock.

## What is deliberately not here

| Left out | Why |
|---|---|
| Comparing two files by bytes | A binary diff is a different job with a different output, and the answer people actually want — "are these identical?" — is a checksum, which is [`hash-checksum`](../hash-checksum/) |
| Three-way merge | It needs a common ancestor and a way to edit the result, which is an editor's job; the page would be pretending |
| Formatting before comparing | [`format-json`](../format-json/) is one tab away, and doing it silently here would mean the diff shown is not the diff of what was pasted |
| Applying the patch | `git apply` and `patch` exist, know about context drift, and have flags for when it does not apply cleanly |

## The files

```
body.html            the two boxes, the options, the diff view
styles.css           the two-pane layout and the diff grid
src/main.js          the wiring: two inputs, options, drawing the comparison
src/diff.js          Myers, the word diff, and the unified output
src/samples.js       the example behind "Try an example"
```

## The tests

```bash
node --test "tests/js/text-diff.test.js"
```

That the deletions rebuild the left-hand text and the insertions rebuild the
right-hand one, which is what "correct" means for a diff, plus the two
performance cases: 20,000 lines with one change, and two files with nothing in
common.

Nothing here needs a browser, because nothing here needs a canvas, a codec or a
file: it is all strings in and strings out, which is the same reason the whole
tool can promise that nothing leaves the machine.
