# Measuring whether a tool did a job

[← README](../README.md)

Page visits say which pages were opened. `tool_complete` says that a tool
reached a useful result, once per page load. Keeping those separate makes a
search arrival distinguishable from somebody getting the thing they came for,
without reporting anything about their files or work.

`tool_view` identifies a tool-page arrival with the same fixed slug. A small
image/video pilot also reports fixed journey stages, and marked workflow links
report the two authored pages involved. These explain where visits stop while
keeping the completion signal and its collection boundary unchanged.

## The event's boundary

`templates/analytics.js` exposes `window.aboxToolComplete()`. It accepts no
arguments and reads the tool's fixed slug from the generated page. Its only
tool-specific event parameter is `tool_slug`; `send_to` selects the site's
Analytics property. Google's normal visit, campaign, session and device
context still applies; this is a limit on the custom tool data, not a claim
that Analytics receives no other metadata.

The bootstrap supplies a static page title and canonical page address. It
retains only standard campaign attribution fields (`utm_source`,
`utm_medium`, `utm_campaign`, `utm_id`, `utm_content`, `utm_term`, `gclid`,
`dclid`, `gbraid` and `wbraid`); arbitrary query parameters and fragments are
excluded. A referrer is reduced to its origin, with an absent referrer kept
absent. Room keys, search text and other values in a live address therefore do
not become default event context. Campaign labels are still sent, so do not
put private data into those labels.

GA4 Enhanced Measurement is disabled for this stream. Do not enable automatic
download, form or site-search events as an alternative: those can add file or
entered-value details outside the completion event's boundary.

Call it at a verified useful outcome:

- after a requested download has its output ready and is handed to the
  browser's download mechanism;
- after a clipboard write succeeds;
- after a viewer or inspector displays a usable result from a successful
  analysis;
- after a successful local carry-on handoff, native share or usable direct
  communication connection. A handoff confirms that this step succeeded,
  rather than proving what a receiving application or person does next.

Page load, picking a file, pressing a button before work succeeds, failed or
cancelled work, and an empty result are not completion. An exporter does not
count merely because its preview appeared. The event does not prove that the
operating system saved a download, or that a visitor was satisfied.

The helper deduplicates calls for that page load. A second download, copy or
analysis does not add another event; reloading the page starts a new visit to
the tool. There is no persistent completion record and no retry store. A
blocked counter or a missing helper must leave the tool usable, including its
local processing offline. The caller therefore uses
`window.aboxToolComplete?.()` without making the result depend on Analytics.

No caller passes file or output data. In particular, never add a filename,
file contents, entered text, count, size, dimension, format, setting, action
type or error to this event. The fixed slug is enough to compare tools; a new
parameter would change the privacy disclosure as well as the code.

`tool_feedback` is separate and optional. It records the fixed tool slug, a
fixed up/down answer and a fixed reason only when somebody chooses an answer.
Neither event contains a free-text field.

## The image/video journey pilot

`window.aboxToolJourney(step)` accepts only `input`, `start`, `ready`,
`problem` or `cancel`. It maps those values to the following event names; it
never forwards the argument as a parameter. Like completion, each event sends
only `tool_slug` and `send_to` and can be queued once per page load. Extra
arguments and values outside that fixed list are ignored. A failed queue does
not consume the one opportunity to send a stage.

| Event | What the caller has verified |
|---|---|
| `tool_input` | The visitor supplied input to the workflow. Validation can still reject it. |
| `tool_start` | Processing the visitor's input has actually begun. Automatic processing counts too. |
| `tool_ready` | A usable preview, prepared result or analysis is available. |
| `tool_problem` | The workflow reached a failure branch. No error or reason is sent. |
| `tool_cancel` | The visitor explicitly stopped work that had started. |

The helper exists only on `images-to-video`, `stack-images`, `gif-analyzer`
and `split-gif`. Other tools still send `tool_view` and their existing
completion events; missing pilot stages on those tools are not abandonment.
Call the helper as `window.aboxToolJourney?.('start')` so the same local work
succeeds with an old, absent or blocked counter.

Example files and generated demonstrations do not count as visitor input or
successful use. Callers keep that distinction in local control flow without
sending it to Analytics. A reset, a changed setting, a file-picker dismissal
or a rerender is not by itself a cancellation, processing start or new result.

`tool_ready` and `tool_complete` answer different questions on exporters: a
preview may be useful before a visitor asks to save it, while completion keeps
its existing requirement of a successful output handoff. A viewer's usable
analysis can satisfy both events at the same point. Neither requires a new
button, and no click is treated as proof that work succeeded.

These are visit milestones, not individual-job measurements. A visitor can
fail, retry, succeed and use the same page again, with each stage still sent
at most once. There are no operation identifiers, persistent journey records,
timings or input/output details to join those actions into jobs.

## Selected workflow links

`workflow_link` sends only `source_page`, `target_page` and `send_to` when a
visitor activates a marked link. Both page identifiers are fixed source slugs,
shared across languages: for example, `guides/turn-images-into-a-video` and
`images-to-video`. The source and the generated guide/related destinations
come from inert metadata in the page templates. An explicit registry in
`templates/analytics.js` also allows the cross-links in this image/video
workflow. A new marked destination must belong to one of those lists.

The bootstrap captures these identities when the page loads. It does not read
a link's live address, query, fragment or text. A later change to the link's
attributes cannot supply a measurement value. Unmarked links, unknown
destinations, links to the current page and prevented activations send nothing.
Each destination can be recorded once on that page load, without delaying or
preventing navigation. A selection does not prove that the destination loaded
or that work on it succeeded.

## Reading the reports

Use `tool_complete` event counts alongside `tool_view` for the same tool,
time period and traffic segment. Register `tool_slug` as an event-scoped
custom dimension in the site's GA4 property to group the tool events. Register
`source_page` and `target_page` the same way for workflow links; do not register
visitor identifiers or duplicate Google's existing page/device dimensions.
Collection can begin before a dimension is available, but defining it does not
fill earlier custom-dimension reports back in. Allow 24–48 hours after setup
and collection before expecting ordinary reports to show the new dimensions.
See [Google's custom-dimension instructions](https://support.google.com/analytics/answer/14239696).

The completion/view ratio is a directional measure of useful results per tool
page load. It is not
a count of saved files, unique people or all successful work: blockers and
offline use are absent, reloads can count again, and one page can produce many
useful results while sending one completion. Compare changes over time and
traffic sources before treating a small difference as a product problem.

For each pilot, create a closed funnel with `tool_view`, `tool_input`,
`tool_start`, `tool_ready` and `tool_complete` as the ordered steps, all
filtered to that tool's slug. Allow indirect progression because normal
intervening events do not mean the visitor abandoned work. A problem or
cancellation is a branch to inspect separately, never a mandatory funnel step.
GA4 funnels count users, so label the chosen date range and step time limits;
do not call their percentages per-job or same-session completion rates.
[Google's funnel documentation](https://support.google.com/analytics/answer/9327974?hl=en)
explains their inclusion rules and elapsed-time setting.

Read these visit milestones alongside the funnel:

| Comparison | What to investigate when it worsens |
|---|---|
| Input/view | Whether entry copy, supported inputs and the picker explain how to begin. |
| Ready/start | Processing compatibility, performance and recovery. |
| Complete/ready | Whether the output action is clear and the result is useful. |
| Problem visits | Browser/device patterns and which workflow needs a closer manual check. |
| Cancel visits | Whether waiting or unclear progress makes visitors stop. |
| Workflow selections by source/target | Whether guides and related links lead visitors to the intended next tool. |

Show event counts and denominators. The ratios describe the pages reaching
each milestone, and are not matched job failure or cancellation rates: a
problem can precede a processing start, and a visitor can recover on the same
page. Built-in session source/medium, device category and browser provide
useful breakdowns without adding custom fields. At this site's traffic level,
use consistent 28-day periods and resist ranking tiny segments.

Create a backward path ending at `tool_complete` and a forward path starting
at a guide page to discover useful routes and repeated loops. Paths can span
sessions and their nodes can count events or users; neither is proof of a
single-session conversion rate. The sanitized referrer deliberately contains
no previous page path, so use page-path nodes and the explicit `workflow_link`
identities to inspect internal navigation. See
[Google's path documentation](https://support.google.com/analytics/answer/9317498?hl=en).

Record the deployment date when comparing the new stages: dates before their
instrumentation are unmeasured, not failed journeys. Keep only `tool_complete`
as the successful-use key event; marking arrivals, input and processing stages
as key events would make starting work look like completing it.

Keep page views and successful-use events separate. The helper emits once per
page load; a GA4 key event configured to count once per session can show fewer
key events than `tool_complete` events when someone uses several pages. Use
event counts when checking the helper's once-per-page behavior. Marking an
event as a key event changes reporting; it does not add tool details or
improve the precision of the signal. The implementation does not change
consent behavior.

## Checking a change

Build and serve the page. Automated browsers, local builds and preview origins
are disabled as production visits by the existing Analytics bootstrap, so
check the queued event locally rather than expecting a hit in production
reports. Exercise one successful outcome and verify a single `tool_complete`
call with the static slug. Repeat the action, then try an invalid input or
cancelled action: none should add another completion. Reload to check that a
fresh page can count once.

On each pilot, exercise a visitor-file workflow through its actual input,
processing, result and output callbacks. Verify one event for each reached
stage and no completion for a preview alone on an exporter. Try an invalid
file, an explicit cancellation where supported, repeated work and the example
flow: none may invent extra completions or sample-based journey stages.
Activate a marked guide/related link and inspect only the fixed page IDs;
unknown or prevented links must send no workflow event.

Also block Analytics and use the ready offline cache: local work must still
finish. Inspect the event arguments and request payload when testing live;
neither files nor details of the input or output belong there. Update the
English Privacy page, hub guarantee and six maintained translations whenever
the collection boundary changes. Frozen translation archives are independent
deployments and are not rewritten by this change.

When validating the deployed counter, use GA4 Realtime or DebugView to inspect
the received events and parameters. Enable debug mode only for that test
session rather than adding it for every visitor. Local/preview suppression must
remain in place. See
[Google's implementation checks](https://developers.google.com/analytics/devguides/collection/ga4/troubleshoot).
