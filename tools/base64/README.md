# Base64 Encoder & Decoder

*Base64, URLs, entities, hex and escapes — both ways, on your own machine.*  ·  lives at `/base64/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

This page, [`json-formatter`](../json-formatter/) and [`text-diff`](../text-diff/)
used to be one tool at `/text-tools/`, four jobs behind four tabs. The
encoders were the tab people arrived at from a search for "base64 decode" —
a search the combined page's address never answered — so the split gave them
an address of their own. `src/encode.js` moved here unchanged, and it is the
whole tool: six codecs, each of them both ways, and not a line that could
need a server even in principle.

The address the split gave it, `/encode-text/`, did not answer that search
either — it did not contain the word "base64" anywhere, while every locale
that writes its own slug had put the word in. It is `/base64/` now. The page
still does five other encodings and the heading still says so; the address is
named for the one nobody searches for by any other word. The old address
redirects.

That matters more here than almost anywhere on the site. The thing people
paste into an online Base64 decoder is a token, and an access token pasted
into somebody else's decoder is an access token given away — it never had to
leave the machine to be decoded.

---

## The encoders

Base64 is written out rather than handed to `btoa`, for two reasons:

- `btoa` throws on any character above U+00FF, so every caller has to encode to
  UTF-8 bytes first anyway — at which point the remaining part is twenty lines.
- `atob` accepts input it should refuse. Wrong padding, characters outside the
  alphabet: it returns something plausible instead of saying that what it was
  given was not Base64. Being told is the whole point of pasting something into
  a decoder.

It is checked against the test vectors in RFC 4648 rather than against its own
decoder, which is the rule `tests/js/crc32.test.js` already follows: a codec
that agrees with itself and with nothing else will disagree with everybody the
first time it matters.

Both alphabets decode — a JWT written with `-` and `_` reads as easily as a
certificate written with `+` and `/` — and line breaks in the input are
ignored, because Base64 arrives wrapped at 64 or 76 characters from every mail
and certificate tool there is.

The others are percent-encoding (a single value, and a whole URL, which are
different jobs), HTML entities — the five that have to be escaped and not the
accented letters, which have been fine since every page started saying UTF-8 —
hex bytes, and the backslash escapes a string literal uses.

## One list, one menu

`CODECS` at the bottom of `src/encode.js` is every codec the page offers, in
the order it offers them, each with its `encode`, its `decode` and the note
the page shows under the menu. `main.js` fills the `<select>` from that list,
so a codec that exists is on the menu and one that does not cannot be.

Decoding failures are a `CodecError` with a sentence in it — `"$" is not a
character Base64 uses`, `That is padded, but its length is not a multiple of
four` — and the one failure the codecs cannot phrase themselves, Base64 that
decodes to bytes that are not UTF-8 text, is caught in `main.js` and reworded:
a fatal `TextDecoder` throws a `TypeError` whose message says nothing useful
to somebody who pasted the wrong thing into the box.

## What is deliberately not here

| Left out | Why |
|---|---|
| Verifying a JWT signature | Reading one is Base64, which is here. *Verifying* one needs the key, and a page that asks for your signing key is a page you should be suspicious of |
| Encrypting anything | Base64 is a spelling, not a secret, and the page's FAQ says so. Encryption is a different promise and deserves a page that takes it seriously |
| Base64 of a binary file | The box is a text box; a file's bytes deserve a download, not a million-character string in a textarea. It is a plausible later addition |
| Hashes and checksums | [`hash-checksum`](../hash-checksum/) — a `SubtleCrypto` call rather than a codec |

## The files

```
body.html            the codec menu, the direction, the box, the result
styles.css           the option grid and the boxes
src/main.js          the wiring: menu, direction, counts
src/encode.js        Base64, percent, entities, hex, escapes - both ways
src/samples.js       the example behind "Try an example"
```

## The tests

```bash
node --test "tests/js/text-encode.test.js"
```

The RFC 4648 vectors, both Base64 alphabets, and every codec round-tripping
the same awkward string — plus the refusals: what each decoder says to input
that is not what it claims to be.

Nothing here needs a browser, because nothing here needs a canvas, a codec or a
file: it is all strings in and strings out, which is the same reason the whole
tool can promise that nothing leaves the machine.
