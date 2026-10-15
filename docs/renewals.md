# Secrets and service renewals

An expired deployment token can stop previews or QA while the live site keeps
answering. A domain or service expiry can stop the site itself. During website
maintenance, before deployment, and when adding or changing a dependency, check
renewals as well as whether the site works today.

## What to check

Start with the dependencies documented here, then include any others the
current workflows and configuration actually use:

| Item | Where it is used and documented |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Preview uploads and cleanup in this repository; [Cloudflare setup](../cloudflare/README.md#setting-it-up-once). `CLOUDFLARE_ACCOUNT_ID` is an identifier, not an expiring token. |
| `QA_DISPATCH_TOKEN` | Dispatching checks in `A-Box-of-Tools/qa`; [the workflow's setup comment](../.github/workflows/qa-on-deploy.yml). |
| `WEBSITE_STATUS_TOKEN` | Stored in the QA repository, reporting results to the website repository; [Cloudflare setup](../cloudflare/README.md#setting-it-up-once). |
| `TURN_KEY_ID` and `TURN_KEY_TOKEN` | The rendezvous worker's relay credentials; [the relay's two secrets](../workers/rendezvous/README.md#the-relays-two-secrets). |
| Domain registration, TLS certificates, hosting and service plans | `abox.tools`, its active subdomains, GitHub Pages, Cloudflare Pages, Workers and TURN; [deployment](deploying.md) and [Cloudflare configuration](../cloudflare/README.md). Include trials, subscriptions and billing deadlines where they apply. |

Read expiry, renewal status and permission metadata from the provider or an
existing authorized record. Secret presence, a successful request, a secret's
update timestamp, and an account identifier do not establish its expiry date.
Do not read or print secret values to discover dates. Do not assume a named
service has a paid plan or an expiry merely because it appears in this list.

Keep only non-secret renewal metadata in the existing maintenance record:
item and owner, provider, verified expiry or renewal deadline, source and check
date, automatic renewal status, authorized renewal method and next check.
Distinguish a confirmed expiry, a verified non-expiring item and an unknown
date. If the metadata is unavailable, report the coverage gap once with the
access or action needed; never invent a date or claim the check passed.

## Renew within existing authorization

Use a provider's required lead time or renewal window. Otherwise, treat the
next 30 days as the warning window; use an earlier deadline when the renewal
process needs more time. Already expired items need immediate attention.

Carry forward the user's authorization for routine renewal and do not ask for
the same permission again. Renew automatically when that authorization, the
required account permissions and a supported renewal method are available.
Access alone does not authorize broader privileges, a new purchase, changed
contract terms or spending beyond an approved amount. Tool-enforced approvals
still apply.

For provider-managed renewals, check renewal status and failure signals rather
than warning merely because the current certificate or term ends soon. An
enabled automatic renewal setting alone is not proof of a completed renewal.
If the provider's renewal window has not opened, record the next check early
enough to recover before expiry.

When a token must be replaced, update every affected consumer through the
authorized secret store, verify the replacement's validity and the affected
service or workflow, then retire the old token. Preserve a usable rollback
until verification succeeds. Do not trigger a production release to test a
credential; the `dev` to `main` release still requires its own authorization.

Keep successful, verified renewals quiet. A failed attempt is unresolved;
try reasonable recovery within the same scope and alert if the user's
permission or action is still required to prevent expiry or restore service.

## Alert only when the user needs to act

Alert before the applicable deadline when renewal needs the user's permission
or action. Include the item, verified expiry date and time zone, likely impact,
what blocked automatic renewal, and the precise action or permission needed.
Use the relevant provider or settings link when available. Never include a
secret value or a URL containing a credential.

Avoid repeated unchanged warnings. Alert again when urgency, the deadline or
the required action changes, and stop expiry alerts after verified resolution.
Use the current chat or an already authorized notification destination.

These are checks performed when the skill runs. A skill update does not create
background monitoring. For explicitly requested recurring checks, reuse an
existing suitable maintenance schedule or create the requested schedule, and
keep it quiet unless an unresolved issue needs the user's action. Choose its
next run before the earliest renewal or warning deadline.
