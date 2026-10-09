# Receipt & Invoice Extractor

*Photos to reviewed fields, cropped attachments and totals for an email.*
Lives at `/receipt-invoice-extractor/`.

This is an OCR tool followed by a review step. The suggested merchant, date,
reference, currency and total are convenient starting points, not verified
accounting data. Each document's fields and crop must be explicitly confirmed
before entering the totals, and every remaining document must be confirmed
before email or sharing.
That is why the original photo and raw OCR text remain available beside
the editable fields.

## Processing and limits

The browser decodes JPEG, PNG, WebP and AVIF files locally. A batch holds at most 20
images, each no larger than 20 MB. OCR reads the selected crop in a separate
working copy: small crops are enlarged by up to three times and surrounded by
a narrow white border, with both kept inside a 2400-pixel longest-edge limit.
This gives small lettering more pixels for the engine without changing the
original or enlarging the email attachment. It cannot recover lettering that
is already blurred or missing. A sideways image can be rotated and read again;
the OCR adapter keeps that chosen orientation instead of letting automatic
deskew turn a receipt's columns sideways. Clear document edges produce a
suggested crop. When a long receipt fills the picture vertically, a fallback
can remove the side background from two consistent paper edges while retaining
the entire height, including the barcode and date below it. If neither method
finds reliable edges, the full image is kept. On a long colored receipt, matching
paper color just beyond a detected short edge retains that whole end of the
picture. This protects a heading or final line when an internal barcode was
mistaken for the paper boundary, at the cost of possibly keeping extra background.
Neutral paper and square pictures retain the existing detection behavior. The visitor
reviews and adjusts the crop to keep the whole document and remove the
surrounding background. Changing the crop or rotation clears confirmation.
One image represents one document; there is no grouping of invoice pages.
Photos with the exact same filename and byte size receive a possible-duplicate
warning on every matching document. The warning updates when a photo is added
or removed, but never removes a record, changes its confirmation or excludes it
from totals. Different photographs can have the same name and size, and a
renamed or resized duplicate is not detected: compare the pictures before
confirming them. No image bytes or OCR text are compared for this advisory.
Prepared attachment names already carry the stable record number, so repeated
camera names stay distinct in individual downloads, the report, email and ZIP.
A collection of receipt templates is not split
into separate documents: the visitor needs a picture or crop of each one.

AVIF files use the browser's existing decoder. A recognized filename extension
admits a picture when the operating system has supplied no useful MIME type;
successful decoding still decides whether the bytes can be read. Inputs that
cannot be decoded need converting to JPEG or PNG first. Outgoing attachments
remain cropped JPEG copies, regardless of the input format.

Tesseract and its English printed-text language data are vendored under
`vendor/`, with their licences. The build copies that folder unchanged and puts
every file in the tool's service-worker precache. There is no CDN dependency and
no photograph is uploaded for recognition. Offline use depends on the page and
its OCR assets having finished caching first.

The executable assets occupy about 8 MB on disk, about 4.5 MB compressed. The
worker is Tesseract.js 6.0.1; the non-SIMD LSTM WebAssembly core is
Tesseract.js-core 6.0.0, and the English printed-text model is
`@tesseract.js-data/eng` 1.0.0 (`4.0.0_best_int`). All three are Apache 2.0
licensed. [The vendor README](vendor/README.md) records the original files,
pinned archive URLs, exact byte counts, SHA-256 hashes and bundled notices.

`src/ocr.js` starts `vendor/ocr-worker.js` as a blob worker inheriting the page's
CSP. The unmodified `worker.min.js` and `tesseract-core-lstm.js` load as local
scripts. `wasm-data.js` wraps the unchanged binary bytes in base64, and
`eng-data.js` does the same for the compressed model. The adapter explicitly
supplies `wasmBinary` and hands the language loader model bytes, so neither
asset goes through a runtime fetch. This costs larger source files but recognition has no runtime network step. The tool grants `worker-src 'self' blob:` and
`script-src 'wasm-unsafe-eval'` for this local engine.

The primary OCR pass keeps the selected upright orientation and uses page
segmentation mode 6 on the enlarged, bordered crop. A missing amount or date,
or weak overall or critical-line confidence, triggers at most one body recovery
pass. That copy normalizes the paper's local brightness and uses Sauvola
adaptive thresholding with upright block segmentation (mode 6), keeping
amounts beside their labels. It can help with uneven light, but it cannot
restore absent pixels. Recovery fills a missing amount, date, reference or
currency only when its average text confidence is at least 60. Merchant
suggestions use their leading line's confidence separately. Unresolved
disagreements in amounts, dates, references or currencies leave the affected
fields blank with a review warning. Printed currency in the primary reading is
retained over a weaker address-based recovery suggestion. A recognized receipt
or invoice date is retained over an appended card-payment date; a sufficiently
confident receipt date from recovery can replace that weaker payment-date
fallback. Equivalent unambiguous calendar dates do not conflict solely because
their printed formats differ. A total already ambiguous
inside the primary reading is not settled by the recovery pass. Both complete
body readings remain available: the primary text is editable, and the second
is a separate read-only comparison. The original photo and attachment never
receive the contrast adjustments.

Merchant suggestions normally require a leading line confidence of at least
60; the separately bounded inverted-logo pass allows 55. Garbled header text
does not automatically fill the name. A missing reliable merchant,
or an unresolved dollar or yen symbol, can trigger one closer reading of the
top 22 percent of the upright crop. This normalized copy aims for 1000 pixels
wide within the 2400-pixel longest-edge budget. Its text appears in a separate
read-only store-name-and-address comparison. It can fill a missing merchant
or suggest currency from the issuer address, with the final body date used for
historical safeguards. Printed or conflicting body currency evidence takes
priority; amounts, dates and references never come from this header reading.

If the body and closer header readings still offer no reliable merchant and a
bounded filled dark header is found, `src/ocr.js` reads a separate locally
inverted crop to help with light lettering in a logo. If block recognition has
no usable name, sparse text segmentation can ignore its decorative frame.
That logo pass supplies only a merchant hint. The original and conditional
recovery body readings supply the date, reference, amount and printed currency.
Every pass can still be wrong, so its suggestions require the same human review.

The parser infers fields from OCR text rather than knowing the issuer's layout.
It excludes labels for subtotals, discounts, cash tendered and change when
looking for a final total. OCR can still miss a label, misread punctuation or
mistake one digit for another. Merchant and reference fields remain blank when
the text offers no reliable candidate; a stylized logo or an unlabelled number
is not enough evidence to fill them.
It does not extract line items, prove the arithmetic on the document, or decide
whether an invoice was paid. Dates stay as printed: a recognized 24/09/2018
does not automatically fill the separate ISO conversion date. A pound sign
suggests GBP, while a dollar sign alone is insufficient to distinguish USD,
CAD and AUD. A printed currency associated with the final total takes priority.
When the currency remains unknown, a bounded store or supplier address can
suggest it from a clear country name or a distinctive postcode with its region.
The form shows the printed address line beside that suggestion. This inference
uses only recognized document text; it makes no location request and does not
use the visitor's location. A city name alone, a customer or delivery address,
or a bank address does not identify the store's currency. Unresolved conflicting evidence
keeps the field blank. Historical currency changes are handled conservatively
rather than assigning today's currency to an older receipt. Every suggested
currency still needs the visitor's review.

## What enters the report

The report lists every document with its fields, amount and review status,
along with the overall count, checked count and count still needing review.
Only confirmed amounts enter original totals grouped by currency and the
converted grand total in the final email currency. Copy and CSV
download remain available during review so unfinished work can be saved; the
CSV marks confirmation explicitly. Email and file sharing wait until every
remaining document has a valid amount, a three-letter currency code and explicit
confirmation of the fields and crop. Amounts support at most two decimal
places. Common currency codes are offered in a selector, with a custom option
for another three-letter code. Every record shares one final email currency,
shown on every document and in the report. Until the visitor chooses a final
currency, it follows the most common valid document currency, with ties settled
by the first occurrence in current document order. Each document has one vote;
unknown or incomplete currency codes have none. Reading, correcting or removing
documents updates this default. A manual final-currency choice is kept until
Use default currency restores that behavior. A changed default clears rates
and confirmations just like a manual change. Each document has its own rate: a
manual decimal with an optional date, or an explicitly requested historical rate for its checked
conversion date. Same-currency records use one. Each converted amount rounds
to two decimal places before the grand total sums those values, using integer
arithmetic rather than floating-point accumulation. A missing or invalid rate
blocks confirmation and email. Changing the original or final currency or
date clears a prior rate and confirmation; stale responses cannot reinstate it.
Photographing one receipt twice produces two records unless the visitor removes
one. Confirmation means that the visitor reviewed the fields and the full
document remains inside the crop, not that the engine proved them correct.

The batch and edits live in memory. Reloading or closing the tab clears them;
there is no document history or server-side storage. A copy or download remains
wherever the visitor saves it.

## Attachment copies and email

The tool renders each reviewed crop as a JPEG with a maximum longest edge of
1600 pixels, without enlarging a smaller crop, aiming for about 350 KB per
image. That size is a target rather
than a guarantee: text must remain readable, and the actual output size is
shown for review. Canvas encoding creates a new picture rather than copying
the original photo's metadata. The original file remains unchanged and is
never used as an outgoing attachment. These JPEG copies must finish preparing
before email, email-file download or attachment-package download is enabled.

On browsers supporting file sharing, Email with images passes the prepared
JPEGs and text report to the device's share sheet. The visitor chooses their
email app, recipient and send action there. Share-sheet recipients cannot be
preselected by the page. An app may accept the pictures without the report, so
the visitor still checks the message before sending it.

The suggested subject includes the document count and, once every document is
checked, the converted grand total with its final currency. It follows batch
changes until the visitor edits the subject, after which their wording is kept.
The subject is passed to the share sheet and written into the email file; the
visitor checks how their email app uses it.

The explicit email-file download builds a local `.eml` message containing the
full report and every prepared JPEG as a MIME attachment. The optional
recipient field applies to this file. When native file sharing is unavailable,
the email action offers the same file. `X-Unsent: 1` asks compatible email apps
to open it as a draft; other apps may open it as a received message that needs
forwarding or resending. There is no universal browser API that opens a compose
window with attachments, and the page does not claim to have one.

A ZIP download contains the same JPEG copies and CSV for email apps that cannot
use the `.eml` file. Extract it, attach the images and CSV, and copy the report
into a new message. Image processing and manual conversion are local. Online rate lookup is the
optional network step described below. Files leave this tool only when the
visitor hands them to another app. The page does not send email or observe its eventual delivery.

All visitor-facing phrases live in `body.html` or `tool.toml`, so the JavaScript
can be copied unchanged into translated pages. This tool has no roadmap entry
to remove. Its guide is `extract-receipts-and-invoices`; the guide's `tool` key
creates both directions of their link.

## Optional historical exchange rates

`src/fx.js` contacts only `https://api.frankfurter.dev/v2/rate/<base>/<quote>`
with `date=YYYY-MM-DD`, after the document's Get historical rate button is
pressed. [Frankfurter's API documentation](https://frankfurter.dev/) describes
the reference rates and historical endpoint. Requests omit credentials and
referrers and send no photographs, filenames, text, amounts or email addresses.
The service sees the currency pair, date and client IP address. Its origin is
the one additional `connect-src` allowance and is named in the trust panel.

The actual observation date returned by the service is shown and exported;
a latest rate is never substituted for a failed historical request. Dates
outside a pair's coverage, unavailable service or unsupported custom codes
leave manual entry available. Reference rates may differ from actual bank or
card rates. Online mode needs a connection; OCR and manual conversion retain
offline support. Rates are kept only in the open tab.
