# ChatGPT directory submission preparation

This folder prepares a **draft**, not a submitted or approved integration. No
command here contacts OpenAI, creates a portal draft, verifies an identity,
submits a listing or publishes it. A package build does not establish that the
live service or app works in ChatGPT.

The public service finds browser tools. It neither accepts files nor processes
ChatGPT attachments. Its interactive view filters a bundled public catalogue
and asks the host to open a selected tool's ordinary website address. File
selection and processing happen on that website in the user's browser.

OpenAI's current guidelines require meaningful functionality beyond built-in
capabilities and standalone value. Reviewers may reject a catalogue/link
workflow as insufficient value or an advertising vehicle. The app itself has
no advertisements; selected website pages have advertising and analytics
described by the site's privacy policy. Preparing this package is not a
prediction of acceptance, directory placement or AI-answer visibility.

## Build an inspection ZIP

Use Python 3.11 or newer from the repository root. Supply the semantic version
from the existing site release tag being inspected, without its leading `v`:

```powershell
python integrations/chatgpt/build.py --version <existing-release-version>
```

The argument above is a command parameter, not a value to copy unchanged.
Nothing in this folder keeps another version counter. When the exact public
publisher name is known from the verified OpenAI developer identity, it can
be supplied with `--developer-name`. The builder does not verify that identity.
The site's existing About page says this is a personal project, not a company,
and deliberately carries no personal byline. Do not substitute a fabricated
company or silently assume that the product brand is a verified publisher.
The supplied version identifies this package's site release; it does not change
the live Worker's separately generated source/version identity.

The builder writes ignored `build/abox-tools-draft.zip` and
`build/readiness.json`. The ZIP contains only the portable manifests, the
existing 192- and 512-pixel site icons and their repository notices. It excludes
credentials, review evidence, the local app host, Worker code and dependencies.
It checks this package's field bounds, endpoint and file allowlist, PNG bounds,
ZIP integrity and exact packaged bytes. It is not a complete upstream JSON
Schema validator and does not replace the portal's current validation.

`plugin.json` supplies real product copy, public URLs and starter prompts.
`mcp.json` names the single production HTTPS endpoint and explicitly declares
no authentication. Do not add OAuth stubs, bearer headers, files or arbitrary
URL inputs to complete this submission. The app resource declares the existing
dedicated `https://mcp.abox.tools` origin; its network, external-resource and
nested-frame CSP lists remain empty. Verify that origin in the actual host.

The tracked manifest intentionally omits an unverified publisher name, version,
country decisions and unrecorded review evidence. Its portable source format
can be useful for inspection, but final public submission requires the missing
listing and owner details. `review-cases.json` contains **unexecuted proposals**:
five positive cases and three negative cases. They are excluded from the ZIP
so an upload cannot imply that they have been run. After actual execution,
record the results and use the verified cases and recording to complete the
portal or the documented `extensions.com.openai.review` fields.

## Work still required before submission

- Connect `https://mcp.abox.tools/mcp` in the owner's actual ChatGPT account
  using no authentication. Install the custom connection and exercise it in a
  new chat. Test desktop and mobile, initial results, local filtering, language,
  empty results, pagination, opening a selected public tool and useful text
  fallback. Include loading/integrity failure and rate-limit recovery. The local
  AppBridge proof does not replace these host tests.
- Run every review proposal and record what actually happened. Sensitive-data
  negative cases use synthetic wording only; never supply a real password or
  private document. Do not claim that a refused processing request converted a
  file. Produce an accessible demonstration recording and factual release notes.
- Confirm that the published privacy policy covers the remote catalogue's
  keywords, locale, result limit, provider/host metadata, purposes, recipients,
  retention and controls. Application logging being disabled does not prove
  that every provider retains nothing. Scope website Terms claims separately
  from the service's rate limit. Existing support is `https://abox.tools/contact/`
  and `hi@abox.tools`; no additional support operation is invented here.
- The owner must select the OpenAI organization and a global-data-residency
  project, complete individual or business verification for the public name,
  and have the required submission permissions. Decide supported countries
  and policy attestations; this package does not make those choices.
- In the portal, obtain the exact domain challenge and host only that token
  at its specified `/.well-known/openai-apps-challenge` address on the MCP host
  or eligible parent origin. Never commit a made-up challenge or replace a
  token another plugin uses. Complete the production tool scan and resolve
  actual findings before submitting.
- After review, approval and publication remain separate owner decisions.
  Directory submission, publishing, external outreach and directory edits are
  outside this package's commands.

The existing tool is read-only, non-destructive and confined to a fixed public
catalogue, without arbitrary network lookup. Current dedicated guidelines
permit `openWorldHint: false` for bounded catalogues. Retain a short factual
annotation rationale if the portal asks: the current error reference still
mentions justifications while the guidelines say they are no longer required.
Do not change actual behavior or invent manifest fields to resolve that docs
disagreement. Standard MCP Apps UI metadata is used; no nested page is embedded.

## References checked on 25 October 2026

OpenAI currently documents a ZIP-based plugin submission shared by ChatGPT and
Codex. Use the current portal and linked docs when preparing an actual upload;
the package layout is not the older public URL-only app form.

- [Package format and no-auth MCP configuration](https://developers.openai.com/plugins/build/plugins)
- [Submission flow, field limits, review materials and domain challenge](https://developers.openai.com/plugins/deploy/submission)
- [Publisher verification, permissions and remote server review](https://developers.openai.com/plugins/deploy/app-review)
- [Value, advertising, privacy, annotations and host testing requirements](https://developers.openai.com/plugins/plugin-guidelines)
- [UI resource domain and CSP metadata](https://developers.openai.com/plugins/reference#component-resource-_meta-fields)
- [Current submission error reference](https://developers.openai.com/plugins/deploy/submission-errors)
- [Connect the actual public server in ChatGPT](https://developers.openai.com/plugins/build/app-quickstart#connect-your-mcp-server-in-chatgpt)
