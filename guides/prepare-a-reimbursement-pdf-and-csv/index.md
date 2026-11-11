# Prepare a reimbursement PDF and CSV from receipt photos

A reimbursement request often needs readable receipts and a list of expenses. Start with one reviewed set of photos so the PDF and CSV describe the same documents in the same order.

Last updated 22 October 2026

## Make the evidence and the rows from the same records

A PDF gives the recipient receipts to read. A CSV gives them fields to check or open in a spreadsheet. Start in the [Receipt & Invoice Extractor](https://abox.tools/receipt-invoice-extractor/), review the records, then use its cleaned JPEG attachments in [Images to PDF](https://abox.tools/images-to-pdf/). Compress the PDF only if it needs to meet a smaller attachment limit.

This worked example uses three fictional receipts in Canadian dollars:

| Receipt, in record order | Confirmed total |
| --- | --- |
| 1. North Street Print | CAD 12.40 |
| 2. Market Car Park | CAD 8.00 |
| 3. Harbour Stationery | CAD 17.60 |

The expected total is CAD 38.00. Check the recipient's required fields and attachment formats first. This article assembles a matching pair of files; it does not decide whether an expense qualifies for payment.

## Start with one photo per document

Keep the originals and select copies in the [extractor](https://abox.tools/receipt-invoice-extractor/). It accepts browser-supported JPEG, PNG, WebP and AVIF, up to 20 images per batch and 20 MB per image. Recognition uses a local English printed-text model. Convert unsupported images first, and obtain a clearer photo when a date or amount is blurred beyond reading.

One image becomes one document record. Three pages of one invoice are not automatically grouped into one expense. Repeated totals across those pages can create several records for the same charge; this simple workflow assumes one complete receipt in each photo. The [extraction guide](https://abox.tools/guides/extract-receipts-and-invoices/) describes the tool's scope and review steps.

## Review fields and crops together

Recognition suggests values; compare them with the picture. Check the merchant, date, reference, total and currency. A subtotal, tax amount, cash tendered or change can look plausible without being the receipt's final amount. Do not invent a missing value to make a row look complete.

Keep the whole document inside the attachment crop, including the receipt number, final amount and relevant tax breakdown. Confirm the fields and crop only after reading them. A later crop or field change can clear confirmation, so review the status again before exporting.

For this example, choose CAD as the final currency and verify all three original currencies are CAD. Same-currency records use a rate of one; no online exchange-rate lookup is needed. With different currencies, follow the extraction guide's rate review rather than adding unlike amounts together.

Only confirmed records enter the totals. A correct-looking sum can still omit an unfinished receipt. Check three confirmed records and CAD 38.00 together. Duplicate warnings compare filename and size only: inspect the pictures, because renamed duplicates can escape a warning and different images can trigger one.

## Export matching rows and images

Download the reviewed CSV and prepared JPEG attachments, or the ZIP containing both. Extract the ZIP before selecting the images for the next tool. Attachment names include stable record numbers, while the CSV's filename column contains the original photo name. Save a copy of the text report too: it lists the original and prepared attachment names together. Use that mapping and the merchant, date and amount to match rows to images, especially when camera filenames repeat.

A CSV can be exported while review is unfinished. Open the actual download and inspect each record's status and fields; export alone does not mean everything was confirmed. For this example there should be three intended expense records, each with a matching image and the checked CAD amount from the table above. The CSV also ends with document count, checked count and grand total rows; those are summaries, not extra receipts. Exclude them when summing the expense rows yourself.

Save the pair as `workshop-expenses.csv` and a working folder of numbered receipt images. Keep the original photos separate. Opening the CSV in a spreadsheet can apply that program's date or number interpretation, so compare what it displays with the exported text and receipt before relying on an imported value.

## Build the PDF in record order

Choose the prepared JPEGs in [Images to PDF](https://abox.tools/images-to-pdf/). This is a download-and-select handoff; selecting the original camera photos again would discard the reviewed crops and break the connection with those attachments.

Arrange the images to match the CSV expense rows: printing, parking, then stationery. Check the report's filename mapping rather than trusting the file picker's sort order. Choose a page layout that keeps each receipt whole and readable, then save `workshop-receipts.pdf`. The [image-to-PDF guide](https://abox.tools/guides/combine-images-into-a-pdf/) explains page sizes and image quality.

![Images to PDF page layout controls for choosing the paper size and how an image fits on the page.](https://abox.tools/screens/prepare-a-reimbursement-pdf-and-csv/layout.webp)

Page layout controls. Keep long receipts whole and check their small print in the exported PDF, not only in the preview.

Open the downloaded PDF and read every page. Check orientation, complete edges, dates and small tax figures. This image-based PDF does not gain a searchable text layer merely because OCR was used to make the CSV.

## Compress only if the recipient's limit requires it

If the PDF fits, keep it. The extractor already prepares compressed JPEG attachments, so another pass may offer little benefit and make small print harder to read. Otherwise try a copy in the [PDF Compressor](https://abox.tools/compress-pdf/), compare sizes and reread every receipt. Compression cannot guarantee a particular saving. The [PDF compression guide](https://abox.tools/guides/make-a-pdf-smaller/) explains the tradeoffs.

## Check the pair you will submit

- The CSV has the three intended, confirmed expenses and correct currencies.
- Every receipt matches a record and appears in the corresponding PDF order.
- Every final PDF page retains the details supporting its amount.
- The confirmed CAD amounts add to CAD 38.00.
- The exact attachments meet the recipient's format and size requirements.

OCR and manual review in this example happen locally. An optional historical-rate lookup is a separate network action; sending the resulting files through email or another service is another. Keep originals for later questions. A matched PDF and CSV make review easier, but do not prove that recognition was correct or guarantee acceptance.
