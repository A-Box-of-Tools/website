# Measuring whether a tool did a job

[← README](../README.md)

Page visits say which pages were opened. `tool_complete` says that a tool
reached a useful result, once per page load. Keeping those separate makes a
search arrival distinguishable from somebody getting the thing they came for,
without reporting anything about their files or work.

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

## Reading the reports

Use `tool_complete` event counts alongside page views for the same tool pages,
time period and traffic segment. Register `tool_slug` as an event-scoped
custom dimension in the site's GA4 property to group the completion and
feedback events by tool. Event collection can begin before that report
dimension is available; defining it does not fill earlier reports back in.

The ratio is a directional measure of useful results per page view. It is not
a count of saved files, unique people or all successful work: blockers and
offline use are absent, reloads can count again, and one page can produce many
useful results while sending one completion. Compare changes over time and
traffic sources before treating a small difference as a product problem.

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

Also block Analytics and use the ready offline cache: local work must still
finish. Inspect the event arguments and request payload when testing live;
neither files nor details of the input or output belong there. Update the
English Privacy page, hub guarantee and six maintained translations whenever
the collection boundary changes. Frozen translation archives are independent
deployments and are not rewritten by this change.
