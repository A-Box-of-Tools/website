# QR & Barcode Generator

*Type it, and it becomes a code. Nothing is sent to make one.*  ·  lives at `/qr-barcode/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The eleventh tool, and the first one here with no file input at all. Everything
else on this site starts by asking for something off your disk; this one starts
with a text box, and the whole job is arithmetic over the string in it.

That makes the promise this site is built on unusually easy to keep — there is
no file to upload, so there is nothing to be tempted by — and unusually worth
making. The single most common thing people put in a QR code is the password to
their Wi-Fi.

---

## What a QR code is, in the order this code does it

Six steps, and each one needs the answer to the last:

```
"HTTPS://ABOX.TOOLS/"
  ->  pick a mode          alphanumeric: two characters in eleven bits
  ->  pick a version       the smallest square the bits fit in at this level
  ->  write the bitstream  4-bit mode, the count, the payload, padding
  ->  add error correction Reed-Solomon over GF(256), per block, interleaved
  ->  place the modules    function patterns, then the specification's zigzag
  ->  mask it              eight candidates, scored, lowest wins
```

`src/qr-encode.js` is the first four and `src/qr.js` is the last two, with the
field arithmetic in `src/gf256.js` and the specification's tables in
`src/qr-tables.js`.

The awkward join is between steps two and three: the header carries the
character count in a field whose *width* depends on the version, and the version
depends on how many bits the whole thing takes — including that field. It is not
circular, but it does mean the length has to be recomputed for each version
tried, which is what `bitLength` is for.

## The two tables that had to be written down, and how they are checked

Almost everything about a QR code follows from a formula. The size of a symbol
is `4v + 17`. The number of codewords it holds is the square, minus the corners,
minus the timing lines, minus the alignment grid, over eight. Where the
alignment patterns go is a spacing rule with exactly one exception in forty
versions. All of that is written as arithmetic in `src/qr-tables.js`, because a
formula can be read and checked and a column of forty numbers can only be
trusted.

Two things do not follow from anything: how many error-correction codewords each
block gets, and how many blocks there are, for each of the 40 versions at each of
the 4 levels. Those were chosen by a committee, and they are the one place here
where a single mistyped digit would produce codes that are subtly, silently
wrong — a symbol that scans on the phone you tested with and fails on the one at
the till.

So they are checked against something outside this repository. The published
capacity table — the "version 10 at level M holds 213 bytes" figures that every
QR reference prints — is derived from *both* tables at once, so
`tests/js/qr.test.js` works nineteen of those figures back out of the code. Get
either table wrong at any version and the byte capacity moves.

## Reed-Solomon, and why the codewords are shuffled

`src/gf256.js` is a hundred lines: bytes, added with XOR, multiplied modulo
`x^8 + x^4 + x^3 + x^2 + 1`. Every block of data gets a remainder computed
against a generator polynomial, and a reader uses that remainder to rebuild
whatever it could not see — up to half as many codewords as there are checks.

The interleaving in `interleave()` is the part that makes it work in practice.
The blocks' codewords are spread across the symbol rather than sitting together,
so a coffee ring that destroys one region of the picture takes a few codewords
from *each* block instead of every codeword from one. A few from each is what
Reed-Solomon can repair; all of one is what it cannot.

The specification prints a worked example — `01234567` at version 1, level M —
and gives both halves of the answer. The test asserts all twenty-six codewords.

## The mask, which is the part that surprises people

The data in a finished symbol is not the data. It is the data XORed with one of
eight fixed patterns, and which one is recorded in the format bits.

That is not obfuscation. A scanner is looking for a picture, and some strings
happen to draw a bad picture: a large blank region it cannot measure, or an
accidental 1:1:3:1:1 run that looks exactly like the finder patterns it uses to
locate the symbol. So the encoder draws all eight, scores each against the
specification's four penalty rules, and keeps the lowest. `penalty()` is those
four rules in their published order.

## What is deliberately not in the QR half

- **Kanji mode.** It packs Shift-JIS into 13 bits a character, which is smaller
  than the 24 bits UTF-8 spends on the same character in byte mode. It is also a
  second character encoding to carry around, and byte mode holds the same text
  correctly today. Worth adding when somebody is generating dense Japanese
  codes; not worth it before.
- **ECI, and mixed-mode segments.** An ECI header declares the character set
  explicitly, and splitting a string into segments so that a run of digits can
  use numeric mode inside an otherwise-byte message can shave a version off a
  long code. Both are real optimisations and both change what a marginal reader
  does with the result. The single-mode, no-ECI form is what every phone in the
  world reads.
- **Reading a code.** Decoding means finding a symbol in a photograph,
  correcting for perspective, and repairing damage — a larger job than drawing
  one, and a different one. It belongs here eventually. It is not this tool.

## The barcodes

`src/barcode.js` and `src/code128.js`. Same idea in every case — a table of
patterns, a check digit, and a quiet zone — and the interesting question is
which tables are worth writing out.

**Code 39's is not, and neither is ITF's.** They were generated by a rule that
still works: two of the five bars are wide, the positions are worth 1, 2, 4 and
7, and the pair that adds to eleven stands for zero. Forty of Code 39's
forty-four characters are one of those ten bar patterns with one of four spaces
widened; the last four are the only characters with three wide spaces and no
wide bar at all. Twenty-five lines generate the whole alphabet, and the test
checks fourteen rows of it against patterns transcribed by hand — two routes to
the same table, which is the only reason agreeing means anything.

**Code 128's is.** Its 107 patterns follow no rule, so they are transcribed. The
risk with a transcribed table is not that it fails loudly but that one row is
subtly wrong and the barcode scans perfectly as the wrong character, so the
tests lean on the two structural properties the symbology was designed around:
every symbol is exactly eleven modules across, and every symbol has an even
number of dark ones. That parity rule is what a scanner itself uses to tell a
misread from a read.

The switching between Code 128's three alphabets is the other half of that file.
Code C holds two digits in the space one character takes anywhere else, so a
long number is worth changing sets for and a short one is not; the rule used is
six digits anywhere, or four at either end. The tests read the values back out
of the bars and check the string that comes out, which is what makes the
switching testable at all.

### The check digit is verified, not corrected

Type twelve digits into EAN-13 and the thirteenth is worked out for you. Type
thirteen and the last one is *checked*, and a wrong one is refused with the
digit it should have been.

Refusing is the point. A mistyped digit quietly corrected is a label that scans
as somebody else's product, and the person who typed it has no way to find out.

## Why the finished string is shown on the page

There is no such thing as "a Wi-Fi QR code". There are QR codes holding a string
in a format that phones recognise, and `src/payload.js` is the list of those
formats. The page shows the finished string in an expandable panel under the
form, because when a phone does not act on a code, that string is the only thing
worth looking at.

It is also where the escaping shows up. A Wi-Fi password with a semicolon in it,
written out plainly, ends the field early and the phone tries to join a network
by the wrong name. Every value that goes into one of these formats is escaped
for the format it is going into.

## Nothing here redirects

A code made on this page contains what you typed. That sounds too obvious to
write down until you look at what the free generators do: hand back a code
containing a link to *their* server, which redirects to yours. Every scan is
counted by them, the destination can be changed after the fact, and the code
stops working the day the free tier expires or the domain lapses — by which
point it is printed on ten thousand menus.

## SVG first, and one renderer

`src/render.js` draws an SVG. The PNG is that same SVG painted onto a canvas at
its own size — not a second renderer that might disagree with the preview, which
is the failure mode of every tool that has two.

Two details that both come from the same fact, that a scanner reads edges:

- **The PNG is drawn at a whole number of pixels per module.** Ask for 512
  pixels for a code that is 33 modules across including its margin and you get
  495, because 33 does not divide 512 and a module landing on a half pixel comes
  out grey. The page says so rather than quietly rounding.
- **The SVG is the one to keep.** It is the squares as instructions, so it
  prints sharp at a business card or a billboard.

Rasterizing needs the SVG to reach the browser as an image, which it does as a
blob URL — the only reason this tool's `img-src` needs `blob:`. The markup has no
external reference of any kind, so nothing is fetched, the canvas is not
tainted, and `toBlob` gives back the bytes.

## The tests

`tests/js/qr.test.js` and `tests/js/barcode.test.js`, and the interesting half of
both is a reader. Checking an encoder against itself proves nothing, so every
symbol the tests make is decoded the way a scanner would: read the format
information out of the modules, undo the mask it names, walk the data out in the
zigzag, undo the interleaving, read the header. The readers are written from the
published tables rather than imported from the tool, so they are able to
disagree with it.

```bash
node --test "tests/js/qr.test.js" "tests/js/barcode.test.js"
```

Every QR level, every mode, and versions 1 through 40 go round that loop. So
does every barcode symbology, in both directions.
