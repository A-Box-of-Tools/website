# Hash & Checksum

Works out the MD5, SHA-1, SHA-256, SHA-384 or SHA-512 of a file and compares it
against a value the visitor pastes in. It writes nothing and changes nothing.

Live at [abox.tools/hash-checksum/](https://abox.tools/hash-checksum/).

## Why `crypto.subtle.digest` is not used

Four of these five are already in the browser. `crypto.subtle.digest` does
SHA-1, SHA-256, SHA-384 and SHA-512 in native code, several times faster than
anything in this folder. It is not on the path a file takes through this tool,
and the reason is its signature:

```js
crypto.subtle.digest(algorithm, data)   // data: BufferSource. One buffer.
```

There is no incremental form. WebCrypto has never had one - the proposal for a
streaming digest has sat open for years - so the whole message has to be in
memory at once. Using it would mean `await file.arrayBuffer()` first, and the
largest file this tool could check would become the largest single buffer the
tab happens to be allowed. On a phone that is a few hundred megabytes. The file
people most want to check is a disk image.

Reading in chunks removes the ceiling completely: 4 MB and a few hundred bytes
of state, whether the file is four kilobytes or forty gigabytes. What it costs
is speed, and the measured cost on a current laptop is:

| | JavaScript, here | roughly |
|---|---|---|
| SHA-256 | 230 MB/s | a 700 MB image in about 3 seconds |
| SHA-1 | 124 MB/s | |
| MD5 | 103 MB/s | |
| SHA-512 | 82 MB/s | 64-bit words in 32-bit halves; see below |

The two ticked by default, MD5 and SHA-256, run together in one pass at around
70 MB/s. That is slower than native and it is not slow, and the trade buys a
tool that works on the file its user actually has.

MD5 was never on offer either way: `crypto.subtle` does not implement it, on the
sound grounds that nothing new should use it, and half the download pages on the
internet still print one.

## The files

| | |
|---|---|
| `src/blocks.js` | filling a block, counting the message, and the padding |
| `src/md5.js` | RFC 1321 |
| `src/sha1.js` | FIPS 180-4 |
| `src/sha256.js` | FIPS 180-4 |
| `src/sha512.js` | FIPS 180-4, SHA-512 and SHA-384 from one function |
| `src/hash.js` | the registry, and the loop that reads a file in pieces |
| `src/expected.js` | reading a pasted checksum, in any published shape |
| `src/format.js` | numbers as a person would say them |
| `src/main.js` | the page |

Everything except `main.js` touches no DOM and no browser API beyond `Blob`,
which is what lets `tests/js/hash-checksum.test.js` run all of it under
`node --test` against real `Blob`s and against `node:crypto`.

## The three things worth knowing

### The padding is written once, on purpose

All four algorithms end the same way: a `0x80` byte, then zeros, then the
message length in bits. What differs is that MD5 writes the length
little-endian, the SHA family big-endian, and SHA-512 gives it sixteen bytes
rather than eight. That is a small enough difference that writing the whole
thing out four times looks harmless, and it is not: the interesting case is a
message whose length lands in the last nine bytes of a block, where the length
field does not fit and the padding needs an extra block of its own. That is one
length in eight, so three of four copies could have it wrong and every short
test vector would still pass.

So `blocks.js` owns it, and each algorithm supplies only the block size, the
compression function, and how to write the length. The test file covers every
length from 0 to 200 bytes for exactly this reason.

### The constant tables are written out, never computed

MD5's table is defined as `floor(abs(sin(i + 1)) * 2^32)`, and it is tempting to
write that line instead of sixty-four hex numbers. `Math.sin` is not required to
give the same answer in every engine - the specification lets an implementation
pick its own approximation - so a digest derived that way would depend on the
browser. A checksum that depends on the browser is not a checksum. The same
argument applies to the SHA tables, which are fractional parts of roots of
primes.

### SHA-512 is 64-bit arithmetic in a language that has none

JavaScript numbers are doubles, so the bitwise operators work on 32 bits and
nothing wider. `BigInt` is exact and arbitrarily wide and allocates on every
operation, which in a loop running eighty times per 128 bytes is the difference
between seconds and minutes on a disk image. So each 64-bit word is carried as
two 32-bit halves and every rotation is written out in terms of them.

The rule for reading that code: rotating right by less than 32 mixes each half
with the other; rotating by 32 or more is the same thing with the halves swapped
first. That is why a rotation by 41 appears as a shift by 9 with `hi` and `lo`
the other way round.

## The comparison box, and why it takes anything

There is no single format for a published checksum. `expected.js` reads bare
hex, hex in groups of eight, `sha256sum` output, a whole `SHA256SUMS` file, the
BSD `SHA256 (file) = ...` form, a `SHA-256:` label, and a base64
`sha384-...` subresource-integrity value. Which algorithm a value is comes from
its length, because 32, 40, 64, 96 and 128 are all different - so nothing has to
be selected, and the box works before a file has been chosen.

A paste that carries filenames is narrowed to the lines naming the file that was
chosen. If none of them do but some other line matches the bytes, that is
reported as a match under a different name rather than as a failure: it is what
happens when a mirror renames a download.
