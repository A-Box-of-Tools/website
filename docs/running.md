# Running it

[← README](../README.md)

The site is generated. The pages a browser is served are built from
`templates/`, `config/` and `tools/` by `build.py`, into `dist/`:

```bash
python build.py
```

Python 3.11 or newer, and nothing to install: the build uses only the standard
library. There is no lockfile and no dependency to fetch. The `package.json` at
the root declares one thing — that the `.js` files here are ES modules, which
is what they already were — so that `node --test` can import them; nothing
installs it and the build never reads it. There is no exception: the command
above is exactly what CI runs and exactly what gets deployed. What it does to
the output is described under
[What the build does to the output](layout.md#what-the-build-does-to-the-output).

To build and serve in one step:

```bash
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Then open <http://localhost:8080/>. `-Port 3000` picks a different port, and
`-NoBuild` serves `dist/` as it stands. Any static server works just as well
once the build has run (`npx serve dist`, `python -m http.server -d dist`,
nginx, Cloudflare Pages, Netlify…).

To check that the deployed site really is a build of these sources:

```bash
python build.py --check
```

That builds, then compares the result file by file with the `dist` branch —
the branch GitHub Pages serves. If they differ, the deployed site is not what
this repository says it is, and that is worth knowing.

`--check` needs nothing that the build itself does not, which is the point of
it. One command, no toolchain, no pinned version to match: if the comparison
needed something installed at exactly the right version, a reader who could not
get that far would have no way to check the claim at all.

The output is minified, so it is not pleasant reading, but it is still
*checkable*: the build is deterministic, so the same sources produce the same
bytes on any machine, and that is what makes the comparison above mean
something. Every generated file also keeps one banner comment naming the
repository and this command. To read the output instead of verifying it:

```bash
python build.py --no-minify
```

## Building one page while you work on it

A full build writes about twelve hundred pages, in every language the site has,
and takes a couple of minutes. While the change in hand is to one tool, most of
that is pages nobody is about to look at:

```bash
python build.py --only trim-video --locale en --quiet
```

`--only <slug>` narrows the build to one tool, `--locale <lang>` to one
language, and both are repeatable (`--only a --only b`). `--quiet` reports how
many pages were written instead of naming each one.

What is narrowed is only what gets **written**. Every tool and every language is
still loaded, and each page is still rendered knowing every other language it
exists in — so a page built this way is byte for byte the page a full build
produces, which is what makes it worth looking at. There is a test that holds
this to it.

What a scoped build is *not* is a site. The pages that list other pages — the
hub, the guides index, the roadmap, the 404, `sitemap.xml`, the feeds — are left
unwritten rather than written wrong, and the link check is skipped, because
every link to a page outside the scope would be reported broken and none of them
would be. The build says so when it finishes. `--check` refuses to run against
one at all.

So: scope it while you are working, and build the whole thing before you believe
anything about the site as a whole.

> **Do not open a page's `index.html` by double-clicking it.** Browsers block ES
> modules on `file://` URLs, so `main.js` never runs. The page still renders and the
> file picker still opens — that part is plain HTML — but choosing images does nothing.
> The app detects this and shows a red banner explaining it, but the failure is easy
> to hit, so it is worth knowing about.

## The tests

Both suites need nothing installed, for the same reason the build does not:

```bash
python -m unittest discover -t . -s tests/python
```

```bash
node --test "tests/js/*.test.js"
```

The first covers `build.py` and `buildlib/` — the template engine, the two
minifiers and their refusals, the config loading, and a whole build into a
temporary directory, including the 404 page and the root-absolute URLs it has
to carry. The second covers what the browser actually runs: the EXIF and TIFF
parsers, the three container formats, the PDF object grammar, reader and
rewriter, the three MP4 writers, the trimmer's keyframe arithmetic, the PDF
writer, the layout maths and the ZIP writer. Mostly round trips — read a file,
write it back, and check the picture came through byte for byte with only the
metadata gone.

Both run in CI on every push and every pull request, and nothing is published
if either fails. `tests/README.md` says what is covered and what deliberately
is not.

