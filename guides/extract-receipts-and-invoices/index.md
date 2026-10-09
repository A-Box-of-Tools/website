# Extract receipt and invoice details from photos

A pile of receipts becomes useful when every document has a readable amount and the report tells you how many were counted. OCR can save the typing, but your check of the picture is what makes the result ready to send. Here is what to check, how to keep the full document in a smaller attachment, what the totals mean and how to carry the images and report into your own email app.

[Open the Receipt & Invoice Extractor](https://abox.tools/receipt-invoice-extractor/): Read the photos, check the fields and crops, then email compressed images with each amount and the totals.

Last updated 4 October 2026

## Start with one document per photo

Photograph the entire receipt or invoice, with the print upright and in focus. Fill the frame, use even light and keep your shadow off the page. Check that the merchant's name and the final total are both visible. Faded thermal printing and glare can hide a digit that no amount of software can recover from the picture.

Add JPEG, PNG, WebP or AVIF files, up to 20 in a batch and 20 MB per file. Each image becomes one document. A two-page invoice needs care: this tool does not join pages into one invoice, so adding both as independent documents could count the same amount twice. Use the page containing the identifying details and final amount, and attach the other page yourself when you send it.

A picture of several receipts or a collection of receipt templates is not split automatically. Use a separate picture or crop of each document. Text from several receipts in one image can produce a mixed suggestion that belongs to none of them.

The included OCR model reads English printed text. Handwriting and other scripts are outside that model's supported job. If your phone produces HEIC files, export JPEG copies or convert them with [HEIC to JPG](https://abox.tools/heic-to-jpg/) before adding them.

## Read the suggestions against the picture

Run OCR, then inspect each document's photo, suggested fields and raw recognised text. Rotate a sideways photo and read it again. Adjust the crop to contain one complete document and reread it when necessary. The tool enlarges small crops by up to three times and adds a narrow white border for OCR, keeping this working copy within 2400 pixels on its longest side. A larger working copy can help the engine, but it cannot recover detail already lost to blur. The original image and outgoing attachment are not enlarged for OCR.

A weak first reading or a missing amount or date can trigger one second reading with local contrast adjustment to help separate the print from the paper. Open Text read from this picture to compare the two readings with the photo. Unresolved disagreements about amounts, dates, references or currencies can leave fields blank for your review. Printed currency is preferred over an address-based guess; a recognized receipt or invoice date is preferred over a date in an appended card-payment record. Correct the editable text before using it to fill the fields, or enter the fields directly. The second reading is shown separately for comparison, and neither reading can guarantee that a blurred or faded digit is correct.

A missing store name or an unresolved dollar or yen currency can also trigger a closer reading of the store heading. Its text is shown below the body readings for comparison and supplies only store-name and address-based currency suggestions. Check those suggestions against the picture too.

Check these five fields before confirming a document:

- **Merchant.** The business or supplier named on the document. A stylized logo may be unreadable to the English text model; enter the name yourself if the field stays blank.
- **Date.** The date as printed. An invoice may print an issue date and a due date; a numeric date such as 03/04 can be ambiguous. The separate conversion date needs your check and selection.
- **Reference.** The receipt or invoice number, if one is printed. A card number or telephone number is not a document reference. The field can stay blank when there is no reliable candidate.
- **Currency.** Choose a common currency code such as USD, CAD or EUR, or choose Custom and type another three-letter code. A printed currency associated with the final total takes priority. A pound sign suggests GBP; a dollar sign alone cannot distinguish USD, CAD, AUD or another dollar currency. Clear country or distinctive postcode and region evidence in the store's own address can supply a fallback suggestion, with the printed address line shown for comparison. A city alone or a customer, delivery or bank address is insufficient. Review any suggestion against the receipt; a currency is required before confirming.
- **Total.** The document's final amount. The parser avoids discount and tendered-total labels, but OCR may miss them. Check that the suggestion has not picked a subtotal, discount, tax, cash tendered, change or outstanding balance.

Correct a field directly when it is wrong. OCR saves typing; it can still mistake a 3 for an 8 or lose a decimal separator. Pressing confirm records that you checked the document. It does not prove the invoice's arithmetic, and the tool does not extract its line items. Amounts support up to two decimal places.

## Keep the whole document inside the crop

The tool suggests a crop when it finds reliable document edges. A long receipt filling the picture can have its side background removed while keeping the full height, so a date below the barcode stays visible. On a long colored receipt, matching paper color beyond a detected edge can retain that whole end, protecting a heading or final line while keeping some extra background. If the edges are uncertain, it keeps the full image. Compare the crop with the original photograph and adjust it to remove the background while keeping every document edge and all its text. A suggested crop can be wrong, especially on a dark receipt, a patterned surface or a photograph with several sheets.

The outgoing attachment is a new JPEG copy, at most 1600 pixels on its longest side, without enlarging a smaller crop. Compression aims for about 350 KB per picture; the actual size is shown because that target is not guaranteed. Inspect the prepared preview and make sure the small print and total remain readable. Your original photo stays unchanged and is not attached to the email.

Confirm the document only after checking both its fields and crop. Changing a field, crop or rotation clears that confirmation so a changed picture cannot quietly leave with an earlier check.

## Choose the email currency and each document's rate

The final email currency defaults to the most common document currency. If counts are tied, the first one encountered wins. A manual final-currency choice stays selected; Use default currency restores the automatic choice.

Keep the currency printed on the document as its original currency. Choose one final email currency, using a common code or Custom. The same final currency appears on every document; changing it updates the batch and clears rates and checks made for the previous currency.

Enter a manual rate for each document in the direction shown, such as “1 CAD = 0.70 USD”. Documents already in the final currency use a rate of one. A date is optional for a manual rate. For an online rate, check the receipt's date in the conversion-date field, choose Online, and press Get historical rate. A printed date such as 03/04 is ambiguous, so the lookup uses the explicit date you selected. Even an unambiguous printed date such as 24/09/2018 remains in its printed form; select 24 September 2018 in the conversion-date field yourself.

The optional lookup uses [Frankfurter reference rates](https://frankfurter.dev/). Only the currency pair and selected date go to api.frankfurter.dev; pictures, amounts, filenames, OCR text and email addresses do not. The service can see your request and IP address. Check the actual observation date returned, which can precede the receipt date when no rate was published. Reference rates can differ from your bank or card charge. If the pair or date is unavailable, enter a manual rate. No current rate is silently used in place of a missing historical one.

Check the original amount, rate and converted value before confirming. The email and CSV keep those details so the total can be traced to each document. Changing a currency or date requires another rate and check.

## What the document count and totals tell you

The report lists each document's details and amount, with the document count and how many are checked or still need review. Only checked amounts enter the original currency totals and the converted grand total. Choose one final email currency for the whole batch; every document shows that same currency. Each converted document value rounds to two decimal places before those values are added, so the grand total matches the individual values printed in the email.

Compare the count with your stack of originals. A missing photo leaves out an expense, and a duplicate counts it twice. There is no automatic duplicate detector. Remove anything you do not want counted, and save or copy the report before closing the tab: the batch is held in memory, without a saved document history. During review, copied reports and CSV files can contain unfinished rows, marked as needing review. Email and attachment downloads open only when every remaining document has been checked and its JPEG copy is ready.

## Email the report with its compressed images

The suggested subject includes the document count, then adds the grand total in the final currency once every document is checked. Edit the subject to use your own wording; your edits are kept when the batch changes.

Use Email with images after checking every document. Where your browser supports sharing files, it opens the device's share sheet with the prepared JPEG copies and report. Choose your email app there. The report includes each document's value, the document count and the totals for the original currencies plus one converted grand total. Review the subject, recipient, body and every attachment in the email app, then send the message yourself.

Share sheets and email apps differ. An app may accept the pictures without the report, and the page cannot select a recipient there. Copy the report into the message if needed. The page cannot send the message or tell whether the app eventually delivered it.

## Download an email file or attach the copies yourself

Download email file creates an `.eml` message containing the full report and every prepared JPEG attachment. The optional recipient you enter on the page applies to this file. When browser file sharing is unavailable, the email button downloads the same file. Open it in your email app and check that every attachment is present before sending.

Some email apps open the file as a draft; others display it as a received message that needs Forward or Resend. There is no browser feature that guarantees an attachment-filled compose window in every email app. If your app cannot use the file, download the ZIP package, extract it and attach its JPEG copies and CSV to a new message. Copy the report into the message body. Keep the original photos separately if the recipient may need the full-resolution documents later.

## Where the information goes

Reading and editing happen in this browser. The OCR engine and English data ship with the page, and no photograph or extracted field is uploaded for OCR. Manual conversion stays local. Historical online rates are the optional network step described above. Wait for the page's Offline line to say ready before disconnecting; the cached tool can then read photos, build the report, prepare JPEG copies and save CSV, an email file or a ZIP without a connection.

Email and sharing are an intentional next step. Those buttons hand the report or files to the app you choose, and that app controls their later delivery. An email app may keep a draft while offline and send it once connected. Check its recipient and attachments as you would with any other message containing receipts or invoices.
