# How to check a bank statement CSV before you trust it

A spreadsheet can look perfect and still contain a wrong amount or a missing transaction. Check it against the statement, using the printed balances to test the numbers and the original rows to check the rest.

Last updated 29 September 2026

## The short answer

A CSV that opens neatly in a spreadsheet can still contain a wrong amount, a missing transaction or a date read backwards. Compare it with the original statement: check the rows, dates and descriptions, then use the printed running balances to test the amounts.

Keep the PDF beside the converted file. A successful download tells you that a converter produced a file. These checks help establish whether that file says what the statement says.

## Before converting, look for an export

If your bank offers a CSV download for the period you need, start there. A direct export avoids reconstructing a table from words positioned on a PDF page. Check the account, date range and column meanings, but there is one fewer stage at which something can go wrong.

Sometimes the PDF is all you have: an older statement, a closed account, or a document somebody sent you. That is when conversion earns its place.

## Work through one small statement

This fictional current-account statement starts at **1,250.00**. Positive amounts add to the money held; negative amounts take it away. The last column is printed on the statement, not calculated in the spreadsheet afterwards.

Four fictional transactions, starting from a balance of 1,250.00

| Date | Description | Amount | Printed balance |
| --- | --- | --- | --- |
| 2026-08-03 | Salary payment | +800.00 | 2,050.00 |
| 2026-08-04 | Groceries | -43.20 | 2,006.80 |
| 2026-08-05 | Coffee | -6.80 | 2,000.00 |
| 2026-08-06 | Transfer | -125.00 | 1,875.00 |

Each row has a check: **previous balance + signed amount = new balance**. For the groceries, `2050.00 + (-43.20) = 2006.80`. For the coffee, `2006.80 + (-6.80) = 2000.00`.

Suppose the CSV reads the groceries as **-48.20**. Every cell is filled in, but `2050.00 + (-48.20) = 2001.80`. That disagrees with the printed balance by **5.00**, giving you a specific row to inspect against the PDF.

Keep the printed balances while checking. Replacing them with formulas based on the converted amounts makes the spreadsheet agree with itself, including any mistakes.

Check what a balance means before applying the signs. A credit card statement may show debt owed: purchases increase it and repayments reduce it. Do not assume its positive and negative amounts mean the same thing as this current-account example.

## Why the closing total is not enough

Comparing the opening balance plus all the amounts with the closing balance is useful, but errors can cancel. Read one payment as 5.00 too large and another as 5.00 too small, and the total still agrees.

Checking every available running balance gives you more comparisons. If a balance appears only at the end of a day, compare it with the previous printed balance plus all the intervening amounts.

Even that has limits. A missing pair of transactions of **-20.00 and +20.00** leaves the balance unchanged. A check across that gap can pass. Compare the row sequence with the original as well as checking the arithmetic.

A matching balance cannot establish that a date or payee was copied correctly, or authenticate the statement. It tests the relationship between the amounts and balances available for comparison.

## Check the dates before sorting anything

`03/04/2026` could mean 3 April or March 4. A date such as `18/04/2026` can settle the convention, but a short statement may contain no such clue. Check the statement period and the bank's presentation rather than accepting a guess.

Look again after opening the CSV: your spreadsheet can interpret dates differently from the converter. Keep the original order until the checks are finished. Sorting partly misread dates makes rows harder to compare and disrupts the running-balance sequence.

Dates printed without a year need the statement period checked too, especially across December and January. Check number conventions: `1,240.00` and `1.240,00` can describe the same amount, and the imported cells must preserve that value.

## Read the descriptions and separate the totals

A description wrapped onto a second line is still one transaction. Check that its continuation stayed with it. Pay particular attention at page breaks, where repeated headings and brought-forward balances can resemble extra rows.

A PDF can also contain account summaries, subtotals and payment details. Those belong in an extraction of the document, but should not be imported as additional transactions. Identify the transaction table and separate any summary rows before preparing an import.

Two payments with the same date, payee and amount can both be real. Compare their positions and references with the statement before removing either. A duplicated extraction and a repeated payment need different corrections.

## What the converter here checks

[PDF to CSV](https://abox.tools/pdf-to-csv/) finds tables from the text's alignment, joins wrapped cells, and preserves totals and section labels. Where it finds several tables, choose the one you need. It offers a date-order control for ambiguous dates and leaves dates without a year as printed.

When it recognises a running-balance chain, it reports whether the available comparisons agree. Check the amounts up to the first printed balance against the opening balance yourself, and any amounts after the last printed balance. A passing message only covers the comparisons it could make.

If no usable chain is recognised, there is no checking verdict. **Silence is not confirmation.** Neither a quiet result nor a passing balance check guarantees that the whole file is correct. The preview shows at most 25 rows per table; inspect the downloaded file for the rest.

Scanned pages need text recognition, which this tool does not provide. Conversion runs in your browser; the separate guide to [uploading a bank statement to a converter](https://abox.tools/guides/is-it-safe-to-upload-a-bank-statement/) covers that privacy question.

## Before importing the CSV elsewhere

Check the destination's import preview as carefully as the file. Choose the correct bank or credit card account, confirm the date format, and map the date, description and amount columns. These are separate choices from extracting the PDF: see [Intuit's CSV import guidance](https://quickbooks.intuit.com/learn-support/en-uk/help-article/bank-transactions/prepare-csv-file-bank-upload-quickbooks/L4BjLWckq_GB_en_GB) for one product's requirements.

- Confirm the account and statement period.
- Check dates, signs and number formats after opening the file.
- Compare transaction rows with the original, including page breaks.
- Check opening, running and closing balances where available.
- Investigate differences and repeated rows before changing them.
- Keep the original statement and a copy of the checked CSV.
