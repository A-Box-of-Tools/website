# Cloudflare configuration

The site is served by GitHub Pages, behind Cloudflare's proxy.

GitHub Pages cannot set response headers at all, so [`_headers`](../_headers) at
the repository root — which Cloudflare Pages and Netlify would read — is inert on
this deployment. The security headers are added at the edge by a Cloudflare
**response header transform rule** instead.

That rule could be clicked together in the dashboard in about a minute. The
reason it lives here instead: every other claim this site makes is checkable by
reading the repository, and headers configured in a dashboard are not. A reader
can see this file, compare it against what `curl -I` returns, and confirm the two
agree.

| File | What it is |
|---|---|
| `response-headers.json` | The header rules, in the exact shape Cloudflare's API expects. The source of truth |
| `apply-headers.ps1` | Sends that file to the API, then checks the live site really returns the headers |
| `redirects.py` | Works out a 301 for every address a tool used to answer at, from `[redirects]` in `config/site.toml` |
| `redirects.json` | What it wrote: the redirect rules, committed so they can be read and reviewed |
| `apply-redirects.ps1` | Sends that file to the API, then asks the live site for every old address |
| `check-crawlers.ps1` | Asks the live site for a page as each crawler, and says which the edge refused. No token, changes nothing |
| `cf-api.ps1` | What the scripts share: the API call, the zone lookup, and a request that does not follow redirects |

## Applying it

You need an API token — **Zone → Transform Rules → Edit**, scoped to the
`abox.tools` zone, plus **Zone → Zone → Read** if you want the script to find the
zone ID from the domain name rather than being handed it. Create it under *My
Profile → API Tokens* in the dashboard.

The token is a credential. Pass it through the environment; never commit it:

```powershell
$env:CLOUDFLARE_API_TOKEN = "..."
```

Then, in order:

```powershell
.\cloudflare\apply-headers.ps1 -Export
```

Prints the rules currently live in the zone. **Run this first.** The apply step
uses the ruleset *entrypoint* endpoint, which replaces every rule in the phase
with the contents of `response-headers.json` — so anything configured by hand in
the dashboard and not written down here disappears the first time the script
runs. Compare, fold anything missing into the JSON, then continue.

```powershell
.\cloudflare\apply-headers.ps1
```

Applies the file and verifies the result. `-DryRun` prints what would be sent
without sending it; `-VerifyOnly` skips the write and just reports what the live
site returns, which needs no token at all.

## The headers, and why each one

| Header | Value | Why |
|---|---|---|
| `Content-Security-Policy` | `frame-ancestors 'none'` | Stops the site being framed. This is the one directive a `<meta>` tag cannot express, so it can only come from a header — the reason this rule exists at all |
| `X-Frame-Options` | `DENY` | The older spelling of the same thing, for browsers that predate `frame-ancestors` |
| `X-Content-Type-Options` | `nosniff` | Stops the browser second-guessing a declared content type |
| `Referrer-Policy` | `no-referrer` | Outgoing links do not carry which page you came from |
| `Permissions-Policy` | `camera=(self), microphone=(), geolocation=(), usb=(), payment=()` | Switches off capabilities no tool here uses, so a future mistake cannot quietly start using one. `camera=(self)` is the one exception: `/qr-barcode-reader/` reads a code from a live camera, and a page cannot ask for a capability its own site has switched off. `(self)` is this origin only — no embedded frame gets it, and nothing else moved |

A second rule, on `.md` addresses only, adds `X-Robots-Tag: noindex`. Every
tool and prose page has a Markdown twin beside it at `index.md` — see
"Every page as Markdown" in [docs/deploying.md](../docs/deploying.md) — and
the twin is the same words as the page, so a search engine must not be left
to pick the copy with no tool on it. The page's `<link rel="alternate">` says
which is the original; this header says the other one is not a page to list.
The script's verify step asks the site root, where this rule never fires, so
it lists the rule as "not checked" rather than missing; ask a twin directly
once one is deployed:

```powershell
curl -sI https://abox.tools/compress-image/index.md | findstr /i x-robots-tag
```

Deliberately **not** set here: a full `Content-Security-Policy`. Each page ships
its own policy in a `<meta>` tag, and when two policies apply the browser enforces
both intersected — a broader policy at the edge would silently tighten every tool
page, and the failure would show up as a page that stops working with no obvious
connection back to this file. The edge policy carries `frame-ancestors` and
nothing else, on purpose.

Also not set here: `Strict-Transport-Security`. Cloudflare manages HSTS itself
under **SSL/TLS → Edge Certificates → HSTS Settings**; setting it from a transform
rule fights that control. Same for **Always Use HTTPS**.

## Addresses that moved

A renamed tool leaves a stub at its old address: a meta refresh, a canonical
and `noindex`, because GitHub Pages cannot answer 301. That moves a reader and
drops a ranking. Cloudflare can answer 301 before the request reaches the stub,
and `redirects.json` is the list of those answers.

It is **generated, and then committed**. `[redirects]` and each language's
`[slugs]` already say where every old address goes, so a list kept by hand
would be a third copy; and it is committed for the reason the headers are -
what reaches Cloudflare should be a file anybody can read. After moving a slug:

```powershell
python cloudflare/redirects.py
```

`tests/python/test_cloudflare.py` fails until that has been run and the result
committed, and `tests/python/test_build.py` checks that every address a rule
names is a stub the build really wrote, pointing where the rule points.

Applying it is the headers' routine with a different token permission -
**Zone → Single Redirect → Edit**:

```powershell
.\cloudflare\apply-redirects.ps1 -Export
.\cloudflare\apply-redirects.ps1
```

`-Export` first, for the same reason: the apply **replaces every Redirect Rule
in the zone**, so one made in the dashboard disappears. `-VerifyOnly` needs no
token and asks the live site for every old address; before the first apply
every line reads "still the stub".

The Free plan allows ten of these rules, which is why addresses are grouped by
destination and why **German is left to its stubs**: English and Chinese fill
eight, and German would need four more. It costs German nothing it had - its
addresses never moved, so the old English slugs under `/de/` were never pages
anybody linked to. The top of `redirects.py` has the whole argument, and
`BUDGET` there is the one number to change on a larger plan. The twelve frozen
languages keep their stubs too; they are `noindex`, so there is no ranking for
a 301 to carry.

## Which crawlers get in

```powershell
.\cloudflare\check-crawlers.ps1
```

`robots.txt` says everything here is meant to be found, and `/llms.txt` is
written to language models. Neither decides who gets in: Cloudflare's **AI bot
policies** - one switch called *Block AI bots* until 15 September 2026 - answer
403 by user agent before `robots.txt` is read, block by default on a zone made
since mid-2025, and live in the dashboard where nothing in this repository can
set them or see them. They refused GPTBot,
ClaudeBot and CCBot - Common Crawl, which most models are trained on - for
nobody knows how long, until somebody thought to ask as one of them.

So the script asks, as seventeen of them, and `apply-headers.ps1` runs it at
the end of every verify. A 403 is conclusive, because the real crawler sends
the same user agent into the same rule. A 200 is not - Cloudflare can still
challenge a crawler on its address, which an impostor cannot reproduce - so
**Security → Events** in the dashboard remains the only record of what the real
ones were given.

The setting is **Security → Settings → Configure AI bot policies**, and it takes
an action for each of three kinds of bot: *Search*, *Agent* and *Training*. The
script's "answers" is the first two and its "learns" is the third, and what was
found blocked was exactly Training. One crawler can also be blocked by itself
from **AI Crawl Control → Security → Crawlers**, which works by writing a WAF
custom rule, so a crawler refused while its kind is allowed is there or under
**Security → Security rules**. Whether to let all of them in is a decision; the
script only reports against what the site has published, which is all of them.

## Things that will catch you out

- **Transform rules only run on proxied traffic.** If the DNS record for
  `abox.tools` is grey-cloud (DNS only), the rule exists and does nothing. The
  script's verify step says so when it finds headers missing.
- **The rule matches `"expression": "true"`** — every request to the zone. That is
  what the dashboard calls "All incoming requests".
- **Editing in the dashboard is fine, but temporary.** The next apply overwrites
  it. Change the JSON and re-run instead, so the change survives and gets reviewed.

## Previews, for a pull request and for `dev`

Production stays on GitHub Pages. Everything upstream of it gets a build of its
own on **Cloudflare Pages** - a second, separate project, direct upload, no
git integration:

| What | Address | Is the QA suite run against it |
|---|---|---|
| a pull request | `https://pr-<number>.abox-preview.pages.dev/` | yes, and the result is the `qa/preview` check on the pull request |
| the `dev` branch, as it stands | `https://dev.abox-preview.pages.dev/` | no |
| `dev` after one merge, kept | `https://dev-pr-<number>.abox-preview.pages.dev/` | no |

The third of those is the second address every merge into `dev` writes, named
after the pull request that caused the merge. The stable address has the fault
that comes with being stable - the next merge replaces it, so the state
somebody was looking at an hour ago is gone and there is nothing left to
compare against. These accumulate on purpose: they are the bundle's visual
history, and finding which merge changed something is opening the two either
side of it.

The pull request previews are the gate: the suite runs against one before the
change reaches `dev`, and against the `dev` -> `main` pull request before the
bundle reaches production. `dev`'s own address is not a gate but a place to
look - one stable URL that always holds everything merged since the last
release, which neither `main` nor any single pull request shows. See the
`preview` job in `.github/workflows/build.yml` for what it does and why, and
[docs/deploying.md](../docs/deploying.md) for why `dev` is there at all.

Pages reads `_headers`, so a preview carries the same security headers as
production without the transform rule above; and Pages marks every deployment
that is not the project's production branch `noindex` by itself, so a preview
cannot be indexed. The site's own analytics switch themselves off away from
the production domain (`templates/analytics.js`), so a preview counts no
visits either.

### Setting it up, once

1. In the Cloudflare dashboard, **Workers & Pages → Create application**, then
   the **Pages** tab rather than Workers, then **Upload assets**. Name the
   project `abox-preview` and upload anything - the first deployment from the
   workflow replaces it. Leave the production branch as `main`, and note that
   the workflow never deploys to it: it deploys to `pr-<number>` and to `dev`,
   and a branch that is not the project's production branch is what makes a
   deployment a preview - noindex, and at an alias of its own rather than at
   the project's bare address.

   The same from a terminal, with no placeholder to upload, once the token
   below exists:

   ```bash
   npx wrangler@3 pages project create abox-preview --production-branch main
   ```

   The Pages tab is easy to miss: the dashboard leads with the Workers flow,
   and a git-connected Worker is not what this wants - it would build the
   site on Cloudflare's side and refuse the workflow's direct uploads.
2. Create an API token under *My Profile → API Tokens* with
   **Account → Cloudflare Pages → Edit**, scoped to this account.
3. In the website repository's settings, add two secrets:
   `CLOUDFLARE_API_TOKEN` (the token) and `CLOUDFLARE_ACCOUNT_ID` (from the
   dashboard's account home, right-hand column). A different project name goes
   in a repository variable `CLOUDFLARE_PAGES_PROJECT`; without one the
   workflow assumes `abox-preview`.
4. In the QA repository's settings, add `WEBSITE_STATUS_TOKEN`: a fine-grained
   token for this repository with **Commit statuses: write**. It is what lets
   a QA run against a preview show up as a check on the pull request.

Until the secrets exist the `preview` job says so and skips, and pull
requests stay green; nothing else changes.
