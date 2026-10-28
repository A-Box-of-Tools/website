# Anonymous feedback

`https://feedback.abox.tools/` is an explicit message to the maintainer. People
can submit its ordinary HTML form and agents can send JSON to `/feedback`.
Neither path requires an account, email address, token or CAPTCHA.

This is separate from the static tools and the public catalogue. Tool input
does not enter this service. Nothing is fetched from a submitted page address,
there are no attachments, and there is no database or public report listing.
The submitted text is sent through Cloudflare to the existing verified contact
inbox. The page explains that transfer before submission. A reply address is
optional and is included only in the message body.

## Submit a report

Send `POST /feedback` with `Content-Type: application/json`:

```json
{
  "message": "Describe the task, expected result and actual result, or an idea.",
  "page": "https://abox.tools/compress-image/",
  "environment": "Agent/client, browser and relevant limitations"
}
```

Only `message` is required. Optional `reply_to` can provide an email address.
Message, page, environment and reply limits are 4,000, 512, 500 and 254 UTF-16
code units. The complete UTF-8 request is limited to 16 KiB, including streamed
bodies without Content-Length. Unknown fields and non-string values are
rejected. The HTML form submits URL-encoded text and a hidden empty `company`
field; multipart bodies and file attachments are not accepted.

`201` with `ok: true` and a receipt confirms acceptance by the email service,
not arrival or reading in the recipient's mailbox. `400`, `413` and `415`
identify invalid input. `429` includes `Retry-After: 60`. `503` means the
service or email delivery could not be confirmed; do not claim the report
arrived. Avoid blindly repeating a request whose response was lost.

Use a descriptive User-Agent, such as `abox-feedback-client/1.0`, with HTTP
clients. The zone's existing Browser Integrity Check rejects some generic
automated-client signatures before they reach the Worker (observed as 403 / code
1010 for Python's default urllib identifier). Curl and descriptive agent
identifiers were verified. No zone protection was changed for this service.

Browser submissions admit only the feedback origin and `https://abox.tools`.
The no-referrer edge policy gives ordinary form navigations a null Origin, so
URL-encoded posts with `Sec-Fetch-Site: same-origin` are also admitted without
granting null-Origin CORS. Cross-site null-Origin posts remain rejected.
Native clients may omit Origin. Loopback origins are allowed only on loopback
hosts for Wrangler's local preview. No cross-origin credentials are used.

## Abuse and privacy boundaries

Both rate bindings are required for a submission. Namespace 1005 allows three
requests per source address per minute; namespace 1006 allows thirty requests
per minute per platform location with a shared service key. These are not a
worldwide atomic quota. These
are separate from rendezvous and catalogue budgets. These limits reduce abuse;
they do not establish a verified identity. No sign-in or browser challenge is
used as a substitute for the agent interface.

The source address is used only as the platform rate-limit key and is never
included in email. Application observability is disabled; code does not log
messages or credentials. Cloudflare and email providers still handle traffic
and mail metadata. Reports remain in the maintainer's email inbox for handling
and follow-up, under the same arrangement as direct contact email.

The sender and subject are controlled by the service; the destination is an
operator-provided secret. No submitted field can choose another recipient or
add a mail header. The mail binding can deliver only to destinations already
verified in the Cloudflare account. All reflected form text is HTML-escaped.
The page has no scripts, tracking, cookies or external resources, and a strict
Content-Security-Policy. The same resource policy is in a meta tag because the
zone's existing response-header transform replaces CSP with its framing rule.
The framing restriction therefore remains in the edge header and the page
enforces the remaining restrictions itself. Responses are never cached.

## Deploy and verify

The static website's build does not deploy this service. The pinned Wrangler
already used by `workers/catalogue-mcp` can deploy it; no dependency is added
to the static site or this Worker. From the repository root, after installing
that service's pinned tooling:

```powershell
workers/catalogue-mcp/node_modules/.bin/wrangler.cmd secret put FEEDBACK_TO --config workers/feedback/wrangler.toml
workers/catalogue-mcp/node_modules/.bin/wrangler.cmd deploy --config workers/feedback/wrangler.toml
```

Set `FEEDBACK_TO` to the existing verified destination behind the public
contact address. Do not commit a private destination or credentials. This
service sends only to that destination. Cloudflare Email Routing must already
be enabled for `abox.tools`; sending to verified destinations is supported
without onboarding a general-purpose outbound mail service.

Use Wrangler's dry run before deployment. Verify the live form and a harmless
JSON submission, then check the existing mailbox for its exact receipt. Verify
invalid and oversized requests and rate-limit responses too. A successful HTTP
response alone establishes only provider acceptance. Keep diagnostic harnesses
and evidence in
[etoolbox-lab](https://github.com/A-Box-of-Tools/etoolbox-lab); permanent boundary
checks belong in `tests/js/agent-feedback.test.js` here and are run by CI.

Publishing this service does not publish the static site's links. Those reach
`dev` through an ordinary pull request; releasing `dev` to `main` remains a
separate, explicitly authorized decision.
