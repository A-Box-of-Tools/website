# Receipt & Invoice Extractor — photos to a report you review

Read the photos, check the fields and crops, then email compressed images with each amount and the totals.

> Read receipt and invoice photos locally, review crops and amounts, then convert each document into one email currency using manual or historical online rates. Email compressed images, individual values and a grand total.

Photos are read locally. Optional historical-rate requests send only currencies and the chosen date to Frankfurter. Email and sharing are explicit handoffs to an app the visitor chooses.

## Your photos are **read on this device**. Online rates are optional. You choose what to email or share.

The photographs are decoded and read on this device. The OCR engine and English language data come with the page, and no photograph or extracted field is uploaded for OCR. Manual exchange rates, copying the report and downloads are local too. Only pressing Get historical rate contacts [Frankfurter](https://frankfurter.dev/) with the two currency codes and the chosen date. That service sees the request and your IP address, but receives no image, amount, OCR text, filename or email address. Email and sharing are your next step: pressing those buttons hands the report, or the files you choose to share, to an app on your device. You choose the recipient, review what goes with it, and send it yourself.

- ✗ No processing upload
- ✗ No account
- ✓ Offline OCR
- ✓ Check every document
- ✓ Send through your own app

## How to extract receipt and invoice details from photos

1. **Choose clear photos.** Add up to 20 JPEG, PNG, WebP or AVIF pictures, each at most 20 MB. Use one receipt or invoice per picture. English printed text is the supported OCR language. Photograph the whole document in even light, with the text upright and sharp.
2. **Read, crop and compare.** Run OCR, then inspect each photo beside its suggested fields and raw text. Rotate a sideways image and read it again if needed. Adjust the crop so all document edges and text remain inside it, then reread that crop. Correct the merchant, date, reference, currency and total. A merchant or reference can stay blank when it cannot be read reliably. In particular, distinguish the final total from a subtotal, discount, cash tendered, change, tax amount or remaining balance.
3. **Confirm each document.** Check the fields, crop and conversion. Choose the currency printed on the document, then one final email currency shared by every document. Enter each exchange rate manually, or choose Online and press Get historical rate after checking the receipt date. The direction is shown as one unit of the document currency in the final currency. Same-currency documents use a rate of one. Only confirmed converted amounts enter the grand total. Remove duplicate photos before counting a receipt twice.
4. **Take the report into your app.** Check the prepared JPEG previews and sizes. Use Email with images to choose your email app where supported, or download the email file with the report and JPEG attachments. Review and send the message yourself. If your app cannot open the email file, download and extract the ZIP, then attach its images and CSV in a new message.

## The longer version

[Extract receipt and invoice details from photos](https://abox.tools/guides/extract-receipts-and-invoices/): How to check receipt OCR and crops, choose one email currency and manual or historical rates, then email compressed images with each converted value, the document count and a grand total.

## Also in the box

- [Images to PDF](https://abox.tools/images-to-pdf/): Put your pictures into one document.
- [Document Scanner](https://abox.tools/document-scanner/): Photograph the page. Get back something that looks scanned.
- [Extract Audio from Video](https://abox.tools/extract-audio-from-video/): Drop a video in and take the sound out of it. The picture is never decoded, and nothing is uploaded.
- [Audio Trimmer](https://abox.tools/trim-audio/): Mark the parts worth keeping as it plays. Get them back as one file, cut where you said.

## Questions

### Will it read every receipt or invoice correctly?

No. OCR can mistake a digit or miss faint printing, tiny text or a stylized business logo. The parser avoids discount and tendered-total labels, but it cannot use a label OCR did not read. Merchant and reference fields can stay blank when there is no reliable candidate. A missing store name or an unresolved dollar or yen currency can also trigger a closer reading of the store heading. That reading is shown separately and supplies only the store name and address-based currency suggestions. A weak reading or a missing amount or date can trigger one second reading with local contrast adjustment to help separate the print from the paper. Both full-document readings are available for comparison. Unresolved disagreements about amounts, dates, references or currencies can leave fields blank for you to fill. Printed currency takes priority over an address-based guess, and a recognized receipt or invoice date takes priority over a date in an appended card-payment record. This can improve a suggestion, but cannot recover detail lost to blur or guarantee a correct result. Compare every suggestion with the photo and confirm each document yourself before exporting it. This tool does not extract line items or prove that an invoice's arithmetic is correct.

### Can one picture contain several receipts?

Use one receipt or invoice per picture. The tool treats each image as one document and does not split a receipt collection or template sheet. Add a separate picture or crop for each document, with its identifying details and final amount visible. Otherwise text from different receipts can be mixed into one suggestion.

### How are dates and currency symbols interpreted?

The document date stays as printed. For an online exchange rate, check it and choose the date in the separate conversion-date field; a date such as 24/09/2018 is not automatically converted there. A pound sign suggests GBP. A dollar sign alone can mean USD, CAD, AUD or another dollar currency. A printed currency associated with the final total takes priority. If the currency is still unclear, a recognized country or distinctive postcode and region in the store's own address can suggest it. The printed address line appears beside that suggestion. A city alone or a customer, delivery or bank address is insufficient; unresolved ambiguous or conflicting evidence leaves the currency blank. No location lookup is made. Check every suggested code against the document.

### Which files and languages can it read?

JPEG, PNG, WebP and AVIF photographs, up to 20 in a batch and 20 MB per file. The included OCR model reads English printed text. Other scripts, handwriting, PDFs and HEIC files are not supported inputs here. For an iPhone HEIC photo, first make a JPEG with the device's photo app or the HEIC converter on this site.

### What do the count and totals mean?

Each photo counts as one document. Every document shows its original amount and its converted value in the same final email currency. The grand total adds the checked converted values, each rounded to two decimal places, and the report also keeps the original currency totals. Email and attachment downloads require every document to be checked. Duplicate photos count twice unless you remove one.

### Does the email button send anything automatically?

No. Where supported, it offers the report and compressed JPEG copies through the device's share sheet; choose your email app there. Otherwise it downloads an email file containing the report and attachments. The suggested subject includes the document count and, once every document is checked, the grand total in the final currency. Editing the subject keeps your chosen wording. Review the recipient, contents and attachments, then send it yourself. The page cannot tell whether your email app accepted them or whether you eventually sent the message.

### Are the cropped images attached to the email file?

Yes. The downloaded `.eml` file contains the report and every prepared JPEG as an attachment. Compatible apps open it as a draft; others may open it as a message that needs Forward or Resend. Your original photos are unchanged and are not attached. The ZIP download contains the same JPEGs and CSV if you need to attach them manually. No browser can guarantee that every email app will accept a draft file or a share-sheet handoff.

### How is the default email currency chosen?

Each document with a valid currency code has one vote. The most common code becomes the final email currency; ties use the first occurrence in the current document order. Missing or incomplete codes are ignored. Reading, correcting or removing documents updates the default. Choosing a final currency manually keeps your choice. Use default currency restores the automatic choice. A changed final currency clears previous exchange rates and confirmations.

### Can I choose a currency that is not in the list?

Yes. Choose Custom and enter a three-letter code for the document or final email currency. Changing the final currency updates every document and clears their prior rates and checks. Online coverage depends on the currency pair and date. If no historical rate is available, enter a rate manually; no latest rate is substituted.

### Are my photos uploaded for OCR?

No. Tesseract reads them inside your browser using the English data that ships with the page. Copying and downloading are local actions. Choosing email or device sharing intentionally passes the selected information to another app, which handles any later delivery.

### Why can a very detailed photo still give a poor result?

Glare, blur, folds and a distant page can hide letters even in a large image. OCR enlarges small crops by up to three times and adds a narrow white border, keeping the working copy within 2400 pixels on its longest side. This can help the engine read small lettering, but cannot restore detail missing from the photo. Fill the frame with one document, keep the print sharp and evenly lit, and rotate a sideways page before reading it again. The original and email attachment are not enlarged for OCR.

### Does it work offline?

Reading, editing, cropping, manual conversion, counting, JPEG preparation and downloads work after the page and OCR assets have been cached. Online historical-rate lookup needs a connection; a rate already fetched remains available in the open tab. Opening a draft can work offline, but delivering email normally requires your app's connection.

### How do historical rates use the receipt date?

Check the receipt's printed date and enter it in the conversion date field. Ambiguous dates are not guessed. Choose Online and press Get historical rate. The result names its actual observation date, which may be earlier than the requested date when no rate was published. Compare it before confirming. You can instead enter a separate manual rate for every document. The email records the rate, source and date used for each converted value.

## How the privacy claim is verifiable

- **The OCR happens on your device.** A photograph contains pixels rather than text, so reading it needs an OCR engine. This page carries Tesseract and English language data with it instead of handing the photograph to a server. The browser reads your chosen files in memory. Neither the photos nor their extracted fields are stored by this site. The engine and data are about 8 MB before delivery compression, cached with the tool. Their versions, source files and [licences are listed alongside them](https://abox.tools/receipt-invoice-extractor/vendor/README.md).
- **A suggested amount still needs your eyes.** A faded digit, a reflection or a subtotal near the bottom can produce a convincing wrong answer. Compare the merchant, date, reference, currency and total with the picture, correct them, and check that the whole document remains inside its crop. Only confirmed documents enter the totals, and every remaining document must be confirmed before email or attachment download opens. Changing a field, crop or rotation requires another check. A copied report or CSV can include unfinished rows, marked as needing review. Confirmation records your review; it is not an independent proof of the document's arithmetic.
- **Email is a handoff you control.** Where file sharing is supported, Email with images opens the device's share sheet with compressed JPEG copies and the report. Choose your email app and review the recipient, body and attachments there. Otherwise, download the email file containing the report and every JPEG attachment. Compatible apps open it as a draft; others may need Forward or Resend. Nothing is sent by this page. Your email app and provider handle delivery under their own settings.
- **Outgoing pictures are cropped, compressed copies.** Adjust each crop to keep the entire receipt or invoice. The page makes a suggested crop when it finds clear document edges; otherwise it keeps the full image. On a long colored receipt, matching paper color beyond a detected edge can retain the whole end of the picture, keeping its heading or final text with some extra background. Review and adjust that suggestion. It makes JPEG copies up to 1600 pixels on their longest side and aims for about 350 KB per image. Check their previews and reported sizes before sending; the size target is not guaranteed. Your original photos are unchanged and are not attached. If your email app cannot use the email file, download the ZIP, extract it and attach its JPEG copies and CSV yourself.
- **Online exchange rates are optional.** Manual rates keep the whole preparation process offline. Selecting Online does not send a request by itself: press Get historical rate for that document. This sends only the source currency, final currency and chosen date to api.frankfurter.dev, with no credentials or referrer. Frankfurter can see your IP address and request. The returned rate and observation date appear beside the document and in the report. These are reference rates and may differ from a bank or card charge. If the service cannot supply a rate, use a manual rate; the page never silently uses today's rate.
- **The report belongs to this tab until you take it away.** There is no account or document history here. Keep the page open while reviewing, and copy the report or save the CSV before leaving. Closing or reloading the page loses the in-memory batch. A report you copy, download or hand to another app remains wherever you put it.
- **What the page's other scripts are given.** The site's ad, measurement and donate-button scripts load as on the other tools. They are not handed photographs, OCR text, filenames, merchant names, amounts or document counts. The code that reads the photos and builds the report is served from this site and listed in the repository.
- **Reading works offline; delivery depends on the app.** Wait for the page's Offline line to say it is ready, then disconnect and read another photo. The cached OCR engine, review form, totals, copying, JPEG preparation, manual conversion and downloads still work. Online rate lookup requires a connection. Your email app may save a draft while offline; actually sending it requires whatever connection that app uses.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/ocr.js` for the local OCR wrapper, `src/main.js` for review and the email/share handoffs, `src/attachments.js` for JPEG copies, `src/email.js` for the email file, `src/fx.js` for conversion and optional historical-rate requests, and `vendor/` for the engine and its licences. The report and attachments are assembled in the tab; the visitor chooses an email app or downloads an email file, and sends it themselves.
