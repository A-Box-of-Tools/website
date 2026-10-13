# Search and AI-answer visibility

[← README](../README.md)

The site should be easy to retrieve, understand and cite accurately. The work
starts with indexable HTML, useful answers and verifiable sources. No schema,
Markdown file or crawler allowance promises inclusion in an AI answer.
[Google's guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
uses the same search fundamentals for its AI features; it does not require a
special AI schema or text file.

## What the October 2026 audit changed

Tool instructions and FAQs now belong to the page's single `main`, so an edit
to them participates in IndexNow change detection. The Markdown controls and
related-tool navigation are marked `data-indexnow-ignore`: their shared copy
must not announce every tool. Feedback and handoff scripts remain outside the
landmark. `tests/python/test_geo.py` checks both a real FAQ correction and
unrelated frame changes against the actual content reader.

The published application entity has a stable `#app` ID and refers to the
publisher's root `#publisher` identity. Plain-text schema fields decode the
same authored entities that a visitor reads. Guide Article images come from
the measured screenshots actually referenced in that language's body; a
missing screenshot is never replaced by a fabricated image or rating.

Photo requirement pages link the official reference recorded in the same
rulebook the tool uses. A link added to an existing citation does not certify
the rule again. `checked` changes only when the source was actually rechecked
or the requirement corrected. Preferred dimensions and export settings are
labelled as guidance rather than mandatory submission bounds. An inaccessible
source keeps its historical date and says that the recheck is incomplete.

Privacy descriptions distinguish local file processing from chosen image
imports, rate lookups, app handoffs and peer connections. Capability claims
state supported modes and limitations. The original converter comparison has
a labelled JSON/CSV transcription and a repeatable method; unavailable request
logs and historical policy snapshots are explicitly acknowledged.

The audit deliberately preserves the locale offering policy, frozen archive
pages, roadmap `noindex`, Markdown response `noindex` and existing crawler
permissions. Search-facing explanations belong to the maintained languages.

## A repeatable visibility baseline

Use `docs/geo-prompts.csv` as a fixed question set. Record a first run after the
release and repeat under the same conditions after the new pages have been
crawled. Keep account exports and performance baselines outside the versioned
source: this public document describes the method rather than publishing
private account reports. Account citation totals and repeated assistant-prompt
samples are separate measurements, with different coverage and denominators.

For each question, record the date, platform, displayed model or mode, language,
region and whether web retrieval was enabled. Start a fresh conversation for
each question and keep the wording unchanged. Preserve the answer and actual
source links. Record whether abox.tools is cited, the destination URL, whether
the answer describes its limits correctly, and whether the recommendation
answers the question. An uncited brand mention and a linked citation are
different observations. Repeat samples before interpreting a change; answers
vary even with the same prompt.

For search, export Search Console query/page impressions and clicks over
comparable periods, segmented by language and page kind. Search Console groups
Google AI-feature traffic with the applicable search reporting rather than
providing a universal AI citation metric. In the existing analytics account,
inspect source/medium and landing pages for known assistant referrers; missing
referrers and privacy controls mean those counts are incomplete. Track the
existing download and fixed feedback events alongside arrivals to see whether
visitors complete a useful task. Do not add filenames or document contents to
analytics to make this measurement easier.

## Checks for future changes

- Keep one canonical URL, one `main`, valid structured data and reciprocal
  offered-language alternates. A full clean build checks generated links;
  browser inspection checks the rendered workflow and narrow layouts.
- Put direct answers and relevant limitations near the instructions. Reuse
  the same metadata for HTML, FAQ schema and Markdown rather than maintaining
  three versions of a claim.
- Link the exact primary source supporting a technical or submission rule.
  Review changing requirements when they are touched; do not imply that a
  routine link fix reverified an entire rulebook.
- Keep intentional network disclosures specific to the actual implementation.
  A CSP allowlist or resource-size counter alone does not prove that content
  cannot leave the browser.
- Let CI run the repository suites. Follow `docs/deploying.md`: changes land
  in `dev`; a separate, explicitly requested release publishes them to `main`.

Crawler identity and permissions are separate from visibility measurement.
[OpenAI's crawler documentation](https://developers.openai.com/api/docs/bots)
distinguishes search crawling from training crawling. A successful request
using a crawler's user-agent string is not evidence that the production bot's
IP ranges can reach the site.
