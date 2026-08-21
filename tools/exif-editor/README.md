# EXIF Viewer & Remover

*See what a photo says about you. Then take it out.*  ·  lives at `/exif-editor/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The second tool. It reads the metadata inside a photo, lets you change or delete
any of it, and removes all of it in one click.

---

## What "remove" means here, and why it does not cost quality

The obvious way to strip a photo in a browser is to draw it on a canvas and call
`toBlob`. That does remove every tag — canvases carry no metadata — but it also
**decodes and re-compresses the picture**, so a JPEG comes back visibly worse and
several times the size or several times smaller, depending on the quality the
browser picked. For a tool whose whole job is "take the metadata out and change
nothing else", that is the wrong trade.

So nothing here is decoded. All three formats keep their metadata in the
container *around* the compressed picture:

| Format | Where the metadata is | What is copied untouched |
|---|---|---|
| JPEG | `APPn` segments and `COM`, all of them before the scan | everything from the `SOS` marker to the end |
| PNG | `tEXt`, `zTXt`, `iTXt`, `eXIf`, `tIME` chunks | `IDAT`, and every chunk not on that list |
| WebP | `EXIF`, `XMP `, `ICCP` chunks in a `VP8X`-headed file | the `VP8`/`VP8L` bitstream |

Removing metadata is therefore a list edit: parse the container into its parts,
drop the ones you do not want, write the list back. The result decodes to exactly
the same pixels as the original, and a stripped JPEG is byte-for-byte identical
to its source from the `SOS` marker onwards.

---

## The plan language

`src/container.js` puts one door in front of the three formats. Each of them
reports the same shape — `exif`, `xmp`, `iptc`, `icc`, `comments`, `text`,
`extras`, `notes` — and accepts the same kind of instruction, called a *plan*:

- a key **left out** means leave that block alone,
- **`null`** means remove it,
- **anything else** replaces it.

"Remove everything" is one object literal. The three container modules
(`src/jpeg.js`, `src/png.js`, `src/webp.js`) know nothing about each other and
nothing about EXIF; `src/tiff.js` knows nothing about any of them.

---

## Reading and writing EXIF

EXIF is a whole TIFF file embedded in the photo: a byte-order mark, then
directories of 12-byte entries, with any value longer than four bytes stored as
an offset to somewhere else in the block. That indirection is why writing has to
be a rebuild rather than a patch — change the length of one string and every
offset after it moves.

The rule `src/tiff.js` is built on: **a tag nobody edited is written back byte
for byte from the bytes it was read as.** Only edited tags are re-encoded. Values
this tool does not understand — and there are always some — survive exactly as
the camera wrote them.

A few details that are easy to get wrong and are handled deliberately:

- **Sub-directory pointers and the thumbnail's location are never copied.** They
  are offsets into the old block, so they are dropped on read and recomputed on
  write. Keeping them would be keeping a lie.
- **The `XP*` tags hold UTF-16**, declared as a plain byte array. Trimming their
  terminating NUL byte by byte eats half of the last character, so whole code
  units are trimmed instead.
- **`UserComment` has an eight-byte character-set header.** Anything that ignores
  it prints the header, which is where the stray "ASCII" in front of so many
  comments comes from.
- **A malformed file cannot hang the page.** Visited directory offsets are
  remembered, so a photo whose IFDs point at each other in a loop is read once
  and stopped.

---

## What is kept, and why it is said out loud

"Remove all" that quietly keeps things is a broken promise, so the two things
kept by default are named on the button's own line, and the sentence under the
checkboxes changes with them.

- **The orientation tag**, because phones store a photo the way the sensor saw it
  and add one tag saying which way up it goes. Remove it and some viewers show
  the photo sideways. When this is kept, a *new* EXIF block is written holding
  that one tag and nothing else — the original block is still thrown away whole,
  so nothing this tool failed to parse can survive inside it. A photo that was
  already the right way up gets no EXIF block at all.
- **The colour profile**, because it says nothing about you and dropping it can
  visibly shift the colours of a wide-gamut photo.

Both can be turned off, and the summary line then says the file will carry no
metadata of any kind.

Two blocks are kept unconditionally and reported as kept rather than silently:
the JFIF header, and the Adobe `APP14` colour marker — removing the latter turns
some CMYK and YCCK JPEGs inside out.

---

## Limitations

- **Maker notes may not survive an edit.** A maker note is undocumented
  manufacturer data that often contains offsets into the original EXIF block.
  Rewriting the block moves it, so the manufacturer's own software may no longer
  read it. Removing everything is unaffected — this only applies to saving edits.
  The page says so, in those words.
- **HEIC, AVIF and bare TIFF are recognised and refused**, each with its own
  reason rather than a generic "unsupported". HEIC and AVIF are box formats of
  nested atoms and need a different parser; in a TIFF the metadata and the pixels
  are addressed by the same offsets, which makes it a different job.
- **A JPEG segment holds 65,533 bytes.** Writing back an EXIF block larger than
  that fails with a message naming the thumbnail and the maker note, which are
  what makes a block that big.
- **PNG text chunks are edited as a set**, because that is how the plan expresses
  them. If a compressed one will not unpack, the set is shown read-only rather
  than offering an edit that would quietly drop it. It can still be removed.
- **Writing extended XMP is not supported.** XMP too large for one segment is
  read (both halves are shown) but only ever removed, never rewritten.
- **Everything is held in memory.** A folder of large photos is bounded by the
  machine, as with the other tool.

---

## Testing it

There is no test runner in this repository, so the checks that
were used while writing this are not checked in. What they covered, if it needs
doing again: a JPEG and a PNG built by hand with known tag values, asserting the
parsed values match; the EXIF block round-tripping through
`serializeExif` → `parseExif` unchanged; stripped output still decoding, and its
JPEG scan being byte-identical to the original's; a WebP produced by
`canvas.toBlob`, given an EXIF block, read back, and decoded again.
