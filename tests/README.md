# Tests

Everything in this repository is written by hand, and these are the tests for
it. Two suites, because there are two languages, and neither needs anything
installed:

| Suite | Covers | Runner |
|---|---|---|
| `tests/python/` | `build.py` and `buildlib/` — the site generator | `unittest`, standard library |
| `tests/js/` | `tools/*/src/` and `shared/js/` — what the browser runs | `node --test`, built in since Node 18 |

There is no test framework to install and no lockfile, which is the same
bargain the rest of the repository makes: if you have to fetch a tree of
dependencies before you can check what a claim means, the claim is not really
checkable.

## Running them

```bash
python -m unittest discover -t . -s tests/python
```

```bash
node --test "tests/js/*.test.js"
```

`npm test` runs the second one, and is the only thing `package.json` is for —
see the note in that file. Both run in CI on every push and every pull request,
and the build will not publish if either fails.

To run one file, or one test:

```bash
python -m unittest tests.python.test_cssmin -v
```

```bash
node --test --test-name-pattern="stco" "tests/js/*.test.js"
```

## What is tested, and what is not

The line is drawn at the browser. A function that computes something — a CRC, a
page layout, a set of MP4 boxes, the bytes of a stripped JPEG — is tested here.
A function that needs a `<canvas>`, a `VideoEncoder` or a `DecompressionStream`
attached to a real document is not, because faking those well enough to be
worth the trouble means testing the fake.

That leaves the parsers and the writers, which is where this project's risk
actually is: they are hand-written, they are the reason the tools can promise
that nothing is uploaded, and a mistake in one of them silently corrupts
somebody's file rather than throwing an error. So `tests/js/` is mostly round
trips — read a file, write it back, and check that what came out is what went
in, byte for byte, with only the metadata gone.

The one thing that is neither a round trip nor a refusal is the video
trimmer's `ranges.js`, and it is the most carefully tested file here. It turns
seconds into ticks on two different clocks, and its answers decide where a
lossless cut actually begins — which is at the keyframe in front of the mark,
not at the mark. Getting that wrong does not throw; it desynchronises the
sound.

On the Python side the same reasoning points at the minifiers. `buildlib/`
already refuses to write output whose tokens moved; `tests/python/` checks the
refusals fire, and checks every stylesheet and every module in the repository
still minifies to a fixed point.

`tests/python/test_build.py` ends with a whole build into a temporary
directory. That is not a unit test and it earns its place anyway: it is the
only thing that would notice a page that stopped being written at all.

## Fixtures

`tests/js/helpers.js` builds the smallest JPEG, PNG, WebP and TIFF blocks the
parsers will accept. They are built rather than checked in as binary files, so
a reader can see exactly what is in each one — and the two TIFF blocks are
written out byte by byte with a comment on every field, because a fixture whose
contents you have to take on trust cannot pin down a parser.

`tests/js/pdf-fixtures.js` does the same for PDFs, and has one extra job. The
compress-pdf tool opens files other programs made, and its reader has three
ways in: a classic cross-reference table, a cross-reference stream, and — when
neither survives checking — scanning the whole file for `N 0 obj`. A fixture
with a wrong xref table would silently exercise the third path and never touch
the first, so `buildPdf` computes real byte offsets, and the damaged variants
each break exactly one thing.

## Adding a tool

Nothing needs registering. The Python build test globs `tools/*/tool.toml`, so
a new tool is built and checked the moment it exists. Its JavaScript is a new
`tests/js/<tool>-*.test.js`; the glob picks that up too.
