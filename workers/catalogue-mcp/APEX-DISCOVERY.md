# Apex discovery redirects

Production keeps `mcp.abox.tools` as its custom domain and adds two ordinary
Worker routes on the existing proxied `abox.tools` hostname. They match only
`/.well-known/agent-card.json` and `/.well-known/mcp/server-card.json`, without
wildcards. Other website paths continue to the existing GitHub Pages origin.
Cloudflare's exact route matching does not include URLs with query strings.

After host validation and the required rate limiter, the Worker redirects
GET and HEAD requests on those two apex paths to the fixed production card
addresses on `mcp.abox.tools`. It does not forward the request URL or query,
fetch an origin, or serve MCP on the apex. The destination Worker remains the
single source of card contents and generated versions; no static card copy
is maintained by the website build.

These routes use the existing Workers Free allowance, separately from the
zone's Single Redirect rules. Redirect requests consume Worker invocations
and the service's existing rate budget; following the redirect makes another
request to the canonical service. No billing plan change is required.

Deploy through the production Wrangler configuration after verifying the
Worker's route permission for the zone. Do not attach an apex custom domain
or replace these exact paths with a wildcard. Development has neither the
apex routes nor the apex hostname in its allowlist.

See Cloudflare's [route matching rules](https://developers.cloudflare.com/workers/configuration/routing/routes/)
and [Workers limits](https://developers.cloudflare.com/workers/platform/limits/).
