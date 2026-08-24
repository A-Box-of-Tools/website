# Licence

[← README](../README.md)

Two of them, split by what a thing is rather than by which folder it is in.

| | | |
|---|---|---|
| The code | [MIT](../LICENSE) | the build, `templates/`, `shared/`, every tool's `src/`, `styles.css` and `body.html`, the root scripts, and every README |
| The writing | [CC BY 4.0](../LICENSE-CONTENT) | the guides and legal pages under `pages/`, the taglines, descriptions, how-to steps, privacy panels and FAQ answers in `tools/*/tool.toml` and `config/site.toml`, and every translation of those under `locales/` |
| `tools/heic-to-jpg/vendor/` | its own | libheif, which nobody here wrote — see [A vendored engine](adding-a-tool.md#a-vendored-engine) |
| the wordlists in `tools/password-generator/src/wordlist.js` | [CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/) | the EFF's diceware lists, bundled unchanged and credited in that file and in [its tool's README](../tools/password-generator/README.md) |

Some files hold both kinds — a `tool.toml` is configuration and FAQ answers in
one — so the licence follows the kind and not the file. That seam is a little
fuzzy on purpose; drawing it by path would have meant splitting files that have
no reason to be split.

The split is not ceremony. By volume this repository is about as much a writing
project as a software one — roughly 89,000 words of English prose across the
guides and the tool pages, and another 268,000 in translation, against some
64,000 lines of JavaScript. MIT talks about "the Software" throughout and is a
poor fit for the first half; CC BY is built for exactly it, and is the wrong
tool for the second half for reasons Creative Commons themselves set out.

**The code half is meant to be taken.** A public repository with no licence is
all rights reserved by default, so anything careful — a person, or an assistant
reading it on their behalf — has to assume it may not copy, and goes and writes
its own EXIF parser again. Every module under `tools/*/src/` has no imports to
install and is already run outside a browser by `node --test`: the EXIF and TIFF
parsers, the JPEG, PNG and WebP container walks, the PDF object reader and
rewriter, the three MP4 writers, the GIF LZW codec, the QR encoder and the ZIP
writer. Keep the MIT notice with one and the whole condition is met.

**The writing half asks to be credited.** CC BY wants the creator named, a link
to the licence, and — the clause most often missed — a note that you changed it,
if you did. [LICENSE-CONTENT](../LICENSE-CONTENT) carries the official text and an
attribution line that satisfies it.

