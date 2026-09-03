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
| `response-headers.json` | The rules, in the exact shape Cloudflare's API expects. The source of truth |
| `apply-headers.ps1` | Sends that file to the API, then checks the live site really returns the headers |

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

Deliberately **not** set here: a full `Content-Security-Policy`. Each page ships
its own policy in a `<meta>` tag, and when two policies apply the browser enforces
both intersected — a broader policy at the edge would silently tighten every tool
page, and the failure would show up as a page that stops working with no obvious
connection back to this file. The edge policy carries `frame-ancestors` and
nothing else, on purpose.

Also not set here: `Strict-Transport-Security`. Cloudflare manages HSTS itself
under **SSL/TLS → Edge Certificates → HSTS Settings**; setting it from a transform
rule fights that control. Same for **Always Use HTTPS**.

## Things that will catch you out

- **Transform rules only run on proxied traffic.** If the DNS record for
  `abox.tools` is grey-cloud (DNS only), the rule exists and does nothing. The
  script's verify step says so when it finds headers missing.
- **The rule matches `"expression": "true"`** — every request to the zone. That is
  what the dashboard calls "All incoming requests".
- **Editing in the dashboard is fine, but temporary.** The next apply overwrites
  it. Change the JSON and re-run instead, so the change survives and gets reviewed.

## Previews, for a pull request

Production stays on GitHub Pages. A pull request, though, gets a build of its
own on **Cloudflare Pages** - a second, separate project, direct upload, no
git integration - at `https://pr-<number>.abox-preview.pages.dev/`, and the QA
suite is run against that before anything reaches `main`. See the `preview`
job in `.github/workflows/build.yml` for what it does and why.

Pages reads `_headers`, so a preview carries the same security headers as
production without the transform rule above; and Pages marks every deployment
that is not the project's production branch `noindex` by itself, so a preview
cannot be indexed. The site's own analytics switch themselves off away from
the production domain (`templates/analytics.js`), so a preview counts no
visits either.

### Setting it up, once

1. In the Cloudflare dashboard, **Workers & Pages → Create → Pages → Upload
   assets**. Name the project `abox-preview` and upload anything - the first
   deployment from the workflow replaces it. Leave the production branch as
   `main`: the workflow deploys to branches named `pr-<number>`, which is what
   makes each one a preview rather than the project's production.
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
