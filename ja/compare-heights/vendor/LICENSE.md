# The four drawn figures

*The objects a visitor can add for scale are drawn too, and they are in*
*[`objects/`](objects/LICENSE.md), which explains why their licences are*
*allowed to be a little wider than the four people's.*

The man, the woman, the boy and the girl on this tool's charts are not drawn
here. They are artwork by other people, in the public domain, and the four
files in this folder are those files as they were published — so anybody can
diff them against the originals and get nothing back.

| File | Drawn by | Source | Licence |
|---|---|---|---|
| `man-standing-silhouette.svg` | pitr | [Commons: Man standing silhouette.svg](https://commons.wikimedia.org/wiki/File:Man_standing_silhouette.svg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `woman-short-hair-and-jeans.svg` | Madeleine Price Ball | [Commons: Silhouette of Woman with Short Hair and Jeans.svg](https://commons.wikimedia.org/wiki/File:Silhouette_of_Woman_with_Short_Hair_and_Jeans.svg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `boy-outline-nih-bioart-59.svg` | Ryan Kissinger, courtesy of NIAID — NIH BioArt 59 | [Commons: Boy Outline (NIH BioArt 59).svg](https://commons.wikimedia.org/wiki/File:Boy_Outline_(NIH_BioArt_59).svg) | Public domain |
| `girl-silhouette-black.svg` | OpenClipart-Vectors | [Commons: Girl silhouette black.svg](https://commons.wikimedia.org/wiki/File:Girl_silhouette_black.svg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |

None of those licences asks for anything: no attribution, no notice, no
share-alike. This file exists because the artwork deserves the credit, not
because a licence demands it.

## Why public domain and not merely free

The artwork ends up inside a picture the visitor downloads and puts in a
report, and the tool's page promises they may use that picture for anything
with no strings. Under a CC BY licence — which is what every well-drawn free
icon family uses — that promise would stop being true, because the attribution
would travel into their chart. CC0 and public domain attach nothing to
anything. That is why these four, which took a search, rather than the sets
that were sitting there.

The objects in [`objects/`](objects/LICENSE.md) are held to the same *test* and
land in a slightly different place. MIT and Apache-2.0 ask for a notice to
travel with the icon set — which that folder carries — and ask nothing of a
picture drawn with it. CC BY asks something of the picture. The line is drawn
between those two, not between "public domain" and "everything else", and it
had to move because a person is one drawing and the objects are twenty: below
the level of a silhouetted human being, the public domain simply does not have
a fridge in it.

## The two changes, and why each was made

**The boy's line endings.** The file arrived with one CRLF. Every text file in
this repository is LF — `.gitattributes` says so and git would have converted
it on the way in regardless — so it is stored with a newline. Nothing else in
the file was touched, and the digest recorded in `../src/traced.js` is of the
bytes as they ship here.

**The man is smoothed before he is drawn.** His original is a photograph traced
by hand: forty-six thousand characters of path, an edge that visibly shakes
wherever the photo had a shadow, and fifteen specks of stray ink that are not
part of the man. At the size a height chart draws him that reads as a bad scan.
So the *shipped* figure is a smoothed copy — the file here is still untouched.

That smoothing is not a thing somebody did once in an editor.
[`scripts/smooth-outline.mjs`](../../../scripts/smooth-outline.mjs) walks the
outline at even spacing, averages the wobble out and lays a spline back through
it, and
[`tests/js/compare-heights-traced.test.js`](../../../tests/js/compare-heights-traced.test.js)
runs that over this folder on every test run and fails if the result is not
exactly what `../src/traced.js` ships. To regenerate it by hand:

```bash
node scripts/smooth-figure.mjs tools/compare-heights/vendor/man-standing-silhouette.svg
```

## What the tool actually ships

The page does not fetch these files — a chart is one self-contained SVG, so the
path data has to be inside it. `../src/traced.js` carries that data, along with
the bounding box each figure was measured at and the transform that puts it in
the unit box every figure in `../src/figures.js` lives in.

There is nobody smaller than the boy and the girl because there is nothing to
put here: below school age the public domain runs out. A toddler built from a
table of body proportions stood here for a while and was the only figure on the
chart nobody had drawn; it looked it, and it is gone.
