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
see the note in that file. Both run in CI on every push and
every pull request that changes something they could have an opinion about,
and the build will not publish if either fails. A change confined to the
repository's own prose — the READMEs, `docs/`, `CLAUDE.md`, `.claude/` — skips
them; the comment on the `test` job in `.github/workflows/build.yml` says how
that is decided and why it errs towards running them.

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

Two files are neither a round trip nor a refusal, and they are the most
carefully tested here, for the same reason: both are arithmetic whose mistakes
do not throw.

The video trimmer's `ranges.js` turns seconds into ticks on two different
clocks, and its answers decide where a lossless cut actually begins — which is
at the keyframe in front of the mark, not at the mark. Getting that wrong
desynchronises the sound.

The video reverser's `timeline.js` decides which frame comes out when, and in
which groups the file has to be decoded to get them. Getting that wrong gives
you a video that plays backwards and is a frame too long, or one whose frames
are reversed in the wrong groups — neither of which is an error anything could
raise.

One file in `tests/js/` is not about a tool at all. `lang.test.js` covers
`shared/lang.js`, the script that decides which language a first-time visitor is
served, and it runs the real file with a hand-built window in front of it — the
hreflang links, the browser's language list and the stored choice are all values
in the DOM, so faking them is how the question gets asked. That is a fake worth
the trouble, unlike the ones ruled out above, because the thing being tested is
a decision rather than a browser API: a mistake in it sends somebody to the
wrong language, or sends a crawler out of the page it was asked to index, and
neither raises anything.

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
