# Public catalogue MCP App

This is an optional discovery service, separate from the static site and the
rendezvous Worker. It lets an agent find a real browser tool and lets a person
browse those results inside an MCP Apps host. It does not process files.

The development endpoint is `https://mcp-dev.abox.tools/mcp`. The
configuration in this folder only declares that development service. A future
production endpoint at `https://mcp.abox.tools/mcp` needs a separate deployment
decision and configuration; it is not available merely because this folder
exists. No site discovery file advertises either endpoint yet.

## What crosses the network

An MCP client sends short public task or format keywords, a catalogue language
and a result limit to this Worker. The response contains public names,
descriptions and canonical tool links. The service has no file argument,
upload endpoint, account, credential, arbitrary URL fetch, processing module,
database or Durable Object. The application's code writes no request-body or
query logs. Worker observability is disabled for this service; Cloudflare and
the MCP host still handle request and connection metadata.

The app view contains the generated public catalogue. Typing and changing its
language filter that embedded data locally, without a tool call or network
request. A click asks the host to open the selected public tool address. File
selection and processing happen on that tool's ordinary page, on the device
running its browser. The host provider remains a separate trust boundary.

This differs from the site's existing WebMCP `find_browser_tools`, whose
initial search also runs entirely in the open hub page. The MCP service's
description explicitly says its initial public keywords are sent to a server.
Neither interface accepts private files or authorizes their disclosure.

## Build from the same public catalogue

Build the complete site first, from the repository root:

```powershell
python build.py --out _plain --clean --no-minify
```

Then, from this folder:

```powershell
npm ci
npm run build
```

Only this service has npm dependencies and a lockfile. The static site's root
package and build remain dependency-free. The SDK versions are pinned:
`@modelcontextprotocol/server`, `client` and `core` 2.4.0, and
`@modelcontextprotocol/ext-apps` 2.0.3. The lockfile also fixes their resolved
dependency graph. Wrangler is pinned to 4.152.0.

`prepare.py` reads maintained languages from `config/site.toml`, excluding
frozen translations. For each built hub it reads the actual `CollectionPage`
and its `ItemList` of `WebApplication` entries. English must contain the source
catalogue; each translation must contain exactly its rendered card URLs.
Translations can publish different tool counts. Every URL must be canonical
HTTPS on `abox.tools`, without credentials, query strings or fragments.

To choose a different complete build directory:

```powershell
python prepare.py --site-dir ../../_plain
npm run build:ui
npx wrangler deploy --dry-run --outdir build/worker
```

Preparation writes only ignored `generated/catalogue.json`. The UI build
bundles the Apps SDK, UI code, CSS and that catalogue into a self-contained
HTML resource, then creates an imported module for the Worker. Wrangler's
dry run writes ignored deployment output. No whole-site asset directory is
bound or uploaded, and the Worker fetches no runtime catalogue URL.

The resource uses `ui://abox/catalogue.html` with
`text/html;profile=mcp-app`. The tool links it through `_meta.ui.resourceUri`;
`resources/read` returns the actual HTML plus resource-level UI metadata.
The declared network, external-resource and nested-frame domain lists are
empty. The ordinary site remains protected against framing.

Protocol identity is generated from the existing site version tag plus the
actual source commit and a dirty-worktree marker. The app and MCP server use
that same generated identity; this private package has no release counter to
maintain. Rebuild after committing to obtain a clean, exact source receipt.
Normal preparation reads Git without changing its configuration and selects
the highest numeric site tag, so CI must fetch the version tags. A caller
that has already verified the source can supply that metadata explicitly,
including on a managed worktree where Git declines ownership:

```powershell
npm run build -- --revision <actual-40-character-commit> --tag <existing-site-tag> --dirty
```

Use `--clean-source` instead of `--dirty` only after verifying that the source
is committed and clean. All three identity options are required together;
they do not change Git trust or filesystem permissions.

The catalogue text follows each published language; the dedicated wrapper and
privacy explanation are currently English. Explicit conversion queries are
matched conservatively against format pairs in a tool's public name. This
can omit a capable tool whose name does not describe that conversion; it is
not a statement that the site cannot do the job. Broader task keywords and
the ordinary website remain available.

## Protocol and boundaries

The server uses the official SDK's `createMcpHandler` with JSON response mode.
It creates a fresh server for each request and holds no protocol session.
Current MCP 2026-07-28 clients and the SDK's default stateless compatibility
for 2025-era clients share `/mcp`. Unsupported GET and DELETE requests return
405. Native and server clients can omit `Origin`; browser origins must match
the explicit allowlist. Host validation runs before protocol dispatch.

The single public tool, `find_browser_tools`, requires `query` with at most
200 Unicode code points. `limit` is an integer from 1 to 20, default 10;
`locale` selects one of the generated catalogues, default English. Unknown
arguments are rejected. Empty keywords list tools. The response has a typed
`locale`, `total`, `hasMore` and `tools` structure, plus useful text and links
for hosts without Apps support.

Requests must be JSON and are limited to 16 KiB, including streamed bodies.
JSON-RPC batch arrays are rejected before dispatch, so one request cannot
multiply the large app resource into many responses.
The development rate binding permits 60 requests per address per minute in
Cloudflare's rate-limiter model, using namespace 1004. It does not share the
rendezvous namespaces. Production would use its separately reserved namespace
1003. Protocol responses are not cached. This public service requires no token; no
OAuth issuer, protected resource or Bearer challenge is invented for it.

Cloudflare Free's CPU and request limits still apply. Check the Wrangler dry
run's compressed bundle size and exercise actual deployed calls before
advertising the endpoint. A successful local build alone proves neither live
availability nor an Ora score improvement.

The service also provides a small development landing page and a current
[SEP-2127 server card](https://modelcontextprotocol.io/seps/2127-mcp-server-cards)
at `/mcp/server-card`, linked from its own `/.well-known/ai-catalog.json`.
`/.well-known/mcp.json` is a compatibility alias for that same card, rather
than a claim that this location is required by the current specification.
Cards advertise identity and connection details; tools, resources and Apps
support are discovered through the real MCP runtime, not duplicated into a
static capabilities claim. Public discovery has read-only CORS, cache
validators and HEAD support. Protected-resource/OAuth discovery is absent
because this catalogue is public and requires no login.

## Use the real app locally

After building, start the Worker in one terminal:

```powershell
npm run dev
```

In another terminal in this folder:

```powershell
npm run preview
```

To exercise the already deployed development Worker instead, stop the preview
host and restart it with its fixed development selection:

```powershell
npm run preview -- --service dev
```

That mode connects only to `https://mcp-dev.abox.tools/mcp`. The default mode
connects only to the corresponding loopback `/mcp` on port 8787. The launcher
rejects other arguments; it accepts no arbitrary URL or page-query override.
Its CSP permits only the selected MCP endpoint, and both the page and console
show that endpoint. Development mode sends initial public keyword requests
off this computer; the app's subsequent filtering remains local. Neither
mode changes the deployed app resource, authentication or rate limiter.

The local-only host opens at `http://127.0.0.1:8788/`; no second server is
needed. At startup Node reads the generated public App HTML once and exposes
its SHA-256, UTF-8 byte count and exact inline-module hash through
`/view-receipt.json`. The browser uses the official MCP client to read the
selected service's actual UI resource and must verify both the complete HTML
and module source against that receipt before creating an iframe. A mismatch
blocks rendering and asks for the intended rebuild/deploy and preview restart.

The verified MCP resource is rendered as `srcdoc` with only a restrictive CSP
meta tag prepended. Its App script is not changed. The parent allows that
script's exact SHA-256 and the host's own script; it allows neither arbitrary
inline scripts nor eval. The child policy further denies network access,
external resources and nested frames. The iframe has `allow-scripts` only,
so it has an opaque origin and cannot access the host document. Official
`AppBridge` checks its specific Window and handles the actual `ui/initialize`
and tool result delivery directly. This is a local verification harness, not
a published general-purpose MCP host or an intermediary SandboxProxy test.
It also shows the real text fallback, and offers light/dark host context and
a 390-pixel app width. It exposes no preview host or sandbox route on the
deployed Worker. Verify initial results,
different language catalogues, local filtering, empty results, pagination and
opening a selected public tool. Inspect requests to confirm filtering makes
no additional MCP call. Parent host approval can still reject an open action.

The meaningful protocol, schema and boundary checks are in `tests/`. CI runs
them with `npm test`; agents do not run the suite locally. That suite is
separate from the site's Python and JavaScript suites.
CI also runs the small builder fixtures with
`python -m unittest discover -s tests -p "test_*.py"` from this folder.

## Development deployment

Existing Wrangler login or an appropriately scoped Cloudflare Worker token is
required. Credentials never belong in this folder. After review and a local
AppBridge check, the authorized operator runs:

```powershell
npm run deploy:dev
```

This deploys only `catalogue-mcp-dev`, its `mcp-dev.abox.tools` custom domain
and namespace 1004 rate binding. It does not touch GitHub Pages, production
MCP, rendezvous or the static site's release workflow. Confirm real protocol
calls and app rendering against development, including Free-plan CPU limits,
before adding truthful discovery links in a separately reviewed site change.

## References

- [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview)
- [Stable Apps specification](https://github.com/modelcontextprotocol/ext-apps/blob/main/specification/2026-01-26/apps.mdx)
- [Official Worker serving recipe](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/web-standard.md)
- [Stateless HTTP and legacy compatibility](https://github.com/modelcontextprotocol/typescript-sdk/blob/main/docs/serving/legacy-clients.md)
- [Authorization is optional](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
