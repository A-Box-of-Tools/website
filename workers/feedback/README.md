# Anonymous feedback

`https://feedback.abox.tools/` is an explicit message to the maintainer. People
can submit its ordinary HTML form and agents can send JSON to `/feedback`.
Neither path requires an account, email address, token or CAPTCHA.

This is separate from the static tools and the public catalogue. Tool input
does not enter this service. Nothing is fetched from a submitted page address,
there are no attachments, and there is no public report listing.
The submitted text is sent through Cloudflare to the existing verified contact
inbox. The page explains that transfer before submission. A reply address is
optional and is included only in the message body.

## Submit a report

Send `POST /feedback` with `Content-Type: application/json`:

```json
{
  "sender_type": "agent",
  "message": "Describe the task, expected result and actual result, or an idea.",
  "page": "https://abox.tools/compress-image/",
  "environment": "Agent/client, browser and relevant limitations"
}
```

JSON clients should declare `sender_type` as `person` or `agent`. Missing
declarations from older clients are labelled `Unspecified`; unknown values are
rejected. The HTML form requires a choice with no preselected answer. The email
subject and body identify the declaration as self-declared, alongside the
server-observed format (`JSON` or `Form submission`). A form submission is not
evidence of a person, and a JSON request is not evidence of an agent.

Only `message` is required by older JSON clients. Optional `reply_to` can provide an email address.
Message, page, environment and reply limits are 4,000, 512, 500 and 254 UTF-16
code units. The complete UTF-8 request is limited to 16 KiB, including streamed
bodies without Content-Length. Unknown fields and non-string values are
rejected. The HTML form submits URL-encoded text and a hidden empty `company`
field; multipart bodies and file attachments are not accepted.

`201` with `ok: true` and a receipt confirms provider acceptance, not inbox
arrival or reading. `200` with `duplicate: true` returns an already accepted
receipt without sending again. `202` with `ok: false` means the first attempt
is pending. An attempt still pending after two minutes becomes unconfirmed.
`503` with a receipt means delivery or durable confirmation is unconfirmed;
the service will not automatically send that report again within its 24-hour
reservation. Keep its receipt and contact the maintainer rather than blindly
resubmitting. `400`, `413` and `415` identify invalid input. `429` includes the
actual `Retry-After` in seconds; it can be much longer than a minute.

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

Both fast rate bindings are required for a submission. Namespace 1005 allows three
requests per source address per minute; namespace 1006 allows thirty requests
per minute per platform location with a shared service key. These are not a
worldwide atomic quota. They are separate from rendezvous and catalogue budgets.

The stable `FeedbackGate` Durable Object named `feedback-mail-budget` provides
the hard email-attempt budget across locations and deployments:

- Twenty attempts in any rolling 24 hours across the whole service.
- Three attempts per network in rolling 24 hours, with a ten-minute cooldown.
- The same normalized message and page reserve only one attempt for 24 hours.
  Page query strings/fragments, sender labels, format, environment and reply
  address do not create a new report. Different pages remain distinct.

Network budgets are shared by people behind the same NAT or VPN; they are not
verified identities. The conservative global cap bounds inbox noise even when
a sender changes networks, but a malicious sender can exhaust it and temporarily
deny legitimate submissions. These are abuse controls, not a claim of spam-proof
identity verification. Agents should batch related observations and stop after
an accepted or duplicate receipt.

One short storage transaction reserves the receipt and counts the attempt
before any email call. Sending happens outside the transaction, since a storage
transaction can be retried. A second transaction records provider acceptance
before returning 201. Failed or unconfirmed attempts still count and are not
automatically resent. Concurrent and repeated submissions reuse the original
reservation, including after a Worker restart.

The source address is used as a platform rate-limit key and to derive a keyed
HMAC network identifier. A separate HMAC identifies normalized message/page
pairs. The SQLite-backed object stores only keyed identifiers, attempt times,
receipts and status, never message text, page addresses, reply addresses,
environment strings or raw IP addresses. Report records expire after 24 hours;
network records expire after 24 hours of inactivity. An hourly alarm removes
expired records and old timestamps. Cloudflare may retain underlying service
backups under its own policies. Actual feedback remains in the email inbox.

The source address is never included in email. Application observability is disabled; code does not log
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
workers/catalogue-mcp/node_modules/.bin/wrangler.cmd secret put FEEDBACK_HASH_KEY --config workers/feedback/wrangler.toml
workers/catalogue-mcp/node_modules/.bin/wrangler.cmd deploy --config workers/feedback/wrangler.toml
```

Set `FEEDBACK_TO` to the existing verified destination behind the public
contact address. Do not commit a private destination or credentials. This
service sends only to that destination. `FEEDBACK_HASH_KEY` needs at least 32
random bytes and must stay stable across ordinary deployments. Rotating it
changes network and duplicate identifiers; it does not clear the global budget.
Keep the object class and singleton name stable too. The first deployment of
the `feedback-gate` migration creates its SQLite namespace; no extra package
dependency or public administration endpoint is introduced.

Cloudflare Email Routing must already
be enabled for `abox.tools`; sending to verified destinations is supported
without onboarding a general-purpose outbound mail service.

Use Wrangler's dry run before deployment. Verify the live form and a harmless
JSON submission, then check the existing mailbox for its exact receipt. Verify
invalid and oversized requests and rate-limit responses too. A successful HTTP
response alone establishes only provider acceptance. Keep diagnostic harnesses
and evidence in
[etoolbox-lab](https://github.com/A-Box-of-Tools/etoolbox-lab); permanent boundary
checks belong in `tests/js/agent-feedback.test.js` and
`tests/js/feedback-gate.test.js` here and are run by CI. Those checks exercise
concurrent reservations, transaction retries, rolling limits, failed sends,
deduplication, declaration labels and metadata expiry. Do not send twenty live
emails just to exercise the global budget.

The pinned Wrangler's local runtime currently supports compatibility dates only
through `2026-10-26`. Local development can explicitly select that date with
`wrangler dev --local --compatibility-date 2026-10-26`; leave the production
compatibility date in the config unchanged. Local email is simulated. Live
verification still needs the actual production deployment and inbox receipt.

Publishing this service does not publish the static site's links. Those reach
`dev` through an ordinary pull request; releasing `dev` to `main` remains a
separate, explicitly authorized decision.
