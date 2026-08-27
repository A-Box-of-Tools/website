# A Box of Tools

The source for **[abox.tools](https://abox.tools/)** — a small collection of
single-purpose web tools that do all of their work **in the browser**. No server,
no upload, no account.

The selling proposition is not "we promise not to look at your files", it is
"there is no code path that could send them anywhere". Everything below is
written to keep that true.

Most of these tools are also small enough to read in one sitting, and that is
worth keeping wherever it is free. It is not the promise, though. Where the
browser cannot do a job on its own, a vendored engine that runs on the
visitor's own machine beats not shipping the tool at all — see
[What can be built here](docs/what-can-be-built-here.md).

---

## The tools

Each lives in its own folder under [`tools/`](tools/), with its own README
explaining what it does and why it does it that way. The index there is
generated from the tool configs, so neither the list nor its count can fall
behind what actually exists.

The hub page lists them by category. It, and every tool page, is generated —
see [Layout](docs/layout.md).

Every page loads Google's ad and measurement scripts, which is why the
Content-Security-Policy in each page names Google origins rather than being the
flat `default-src 'none'` it started as. Neither script is given anything about
a user's files: no file, thumbnail, filename, size, or count is read out to
them, and there is no custom event anywhere in this repository that would carry
one. The claims on the pages were rewritten to match when the scripts went in;
if they ever come out, tighten the policies and put the stronger wording back.

---

## Running it

```bash
python build.py                                   # a readable build into dist/
powershell -ExecutionPolicy Bypass -File serve.ps1 # build, then serve it at localhost:8080
python -m unittest discover -t . -s tests/python   # the generator's tests
node --test "tests/js/*.test.js"                   # the browser code's tests
```

Python 3.11 or newer, Node 18 or newer, nothing to install for either — no
lockfile, no dependency to fetch. Both test suites run in CI on every push and
every pull request, and nothing is published if either fails.

See [Running it](docs/running.md) for `--check` (does the deployed site match
these sources) and the double-click failure that is worth knowing about before
it surprises you.

---

## Documentation

Past this point, [`docs/`](docs/) has the rest — one file per subject, so
finding the part you need does not mean scrolling through the parts you don't:

| | |
|---|---|
| [Layout](docs/layout.md) | the source tree, installing a page as an app, and what the build does to the output |
| [Adding a tool](docs/adding-a-tool.md) | the checklist, the parts a tool can share, a vendored engine, and adding from a web address |
| [The prose pages](docs/prose-pages.md) | `pages/`, the legal pages, About and Contact, and what Privacy does and does not claim |
| [The guides](docs/guides.md) | the longer answer behind each tool, why tool pages link to each other, and the feedback panel |
| [Languages](docs/languages.md) | what a locale is and is not, half-translated pages, and adding a language |
| [Deploying](docs/deploying.md) | GitHub Pages behind Cloudflare, cache lifetimes, the 404 page, and `/llms.txt` |
| [What can be built here](docs/what-can-be-built-here.md) | the test a new tool has to pass, what needs a vendored engine, and what was ruled out |
| [Licence](docs/licence.md) | MIT for the code, CC BY 4.0 for the words, and why it is split that way |

None of these replace a tool's own documentation. What a tool does and why it
does it that way lives beside its code, at `tools/<slug>/README.md` — see
[Where a tool's documentation lives](docs/adding-a-tool.md#where-a-tools-documentation-lives).
