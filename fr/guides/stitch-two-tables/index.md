# How to stitch two tables without losing the rows that do not match

An order export and a customer list can share an identifier without using the same row order or spelling it the same way. Decide what makes two records belong together, keep the unmatched ones visible, and review the result before it becomes a new file.

[Ouvrir Stitch Tables](https://abox.tools/fr/stitch-tables/): Bring two tables together by a shared value, a pattern, a manual pairing or their row order. Everything stays in your browser.

Dernière mise à jour 27 October 2026

## Start with two rectangular tables

Paste a range copied from a spreadsheet into each box, or choose a CSV or TSV file for each side. Save the relevant sheet as CSV first if you have an XLSX file. Check the separator and heading-row option separately for A and B.

Use a copy of each original. Cells stay as text inside this tool, so `00123` is a different identifier from `123`. Dates and numbers are not calculated or reformatted. A short row receives empty cells; a row with more cells than its headings is reported so you can fix the source.

Headings are detected automatically. When there is no clear header row, every row stays as data and value patterns suggest names such as Email, Date, ID, Number or Text. Repeated names receive suffixes: Email 1, Email 2. Review the notice below each table and choose the heading-row setting manually when the guess is wrong. Plain-text columns can be ambiguous, and a suggested name does not change the values.

You can also compare two CSV files in [Text Diff](https://abox.tools/text-diff/) first, then choose Stitch these tables to carry both current sources here. The original becomes A and the changed version becomes B. The transfer stays in browser storage, is consumed once and expires after ten minutes.

## Choose more rows, more columns, or both

In Simple merge, Add rows stacks B below A and aligns headed columns, keeping fields found only in B. Add columns places B beside A by row position and keeps the longer table's rows. Add rows and columns matches records by a key and keeps every unmatched record from either table.

For example, A has id/name records 1/Ada and 2/Bo; B has id/email records 2/bo@example.com and 3/cy@example.com. The combined direction gives id/name/email with three records: 1, 2 and 3. The shared record 2 receives both its name and email.

Shared headings combine when values agree or one is exactly empty. When a field has conflicting nonempty values, its full A/B columns stay separate and the result reports it. Without source headings, fields stay separate; inferred names such as Text or Number cannot establish that two columns mean the same thing.

### Choose what one output row should mean

If you are adding a customer's address to each order, one output row should describe an order and its customer. Choose Match rows and select the customer-identifier column from each table. Different row orders do not matter because the key connects the records.

- **All rows from both tables** keeps pairs and every unpaired source row. Empty cells on one side help reveal a missing record.
- **All rows from table A** keeps all A rows and any B rows they match. B-only records are omitted.
- **Matching pairs only** exports pairs and omits every unpaired row.

Start with all rows when checking unfamiliar data. A match count alone cannot tell you that an unmatched order has disappeared from an inner join.

## Match a stable value, or extract one with a pattern

Whole cell value compares the selected cells. Trim ignores spaces around a key, and ignore case makes `ABC` and `abc` equal for matching. These options change the comparison while the original cell contents remain in the output.

The first-number rule extracts `001` from both `invoice-001` and `paid/001`. It does not match `paid/1`. Review real values first: in `2026-invoice-001`, the first number is `2026`.

Letters and numbers only removes punctuation and spacing. Before-separator and after-separator use the first occurrence of your literal separator. A missing separator or value with no required digits produces no key. Blank keys never match each other. The fixed rules do not guess similar names or run arbitrary regular expressions.

## Check repeated keys before trusting the row count

If A has two rows with key `001` and B has three, matching produces all six combinations. That preserves every possible pair, but it may be the wrong relationship for your job. The duplicate count is a reason to inspect the data.

Choose a more specific key, remove accidental duplicates in your source copy, or pair manually when only one combination is intended. Results above the output bounds are refused instead of silently dropping matches.

## Choose individual pairs when the connection needs judgement

Pair manually lets you choose a B row for an A row. Use it for a short list whose connection is clear to you but has no reliable shared value. Each row can be used once.

Leave a row unpaired when you cannot establish the connection. The retention choices still apply. Editing a source clears pairings because old row numbers may refer to different records.

## Use a simple merge when no matching rule is needed

**Stack rows** puts B below A. Headings align by trimmed text, so a column can move in B without putting values in the wrong field. A's column order stays first, followed by B-only columns. Repeated headings align by occurrence. With headings off in either source, columns align by position.

**Side by side** combines corresponding row positions and keeps every row from the longer table, padding the missing side with empty cells. Use it when the row order is known to correspond. Sorting one source independently can make every pair wrong while the result still looks tidy.

## Review the full counts and choose an export

The preview shows the first 100 rows and 20 columns. Check the full row count, duplicate count and unmatched counts. Each input allows 2,097,152 text characters, 5,000 data rows, 100 columns and 100,000 data cells. Selected files are also limited to 2 MiB. Output allows 20,000 rows, 500,000 cells and 16 MiB of text.

CSV is convenient for a saved file; TSV is convenient for spreadsheet pasting. Neither stores spreadsheet cell types. Import identifier columns as text in the receiving application when leading zeroes or date-like strings matter.

Formula protection is on by default and adds an apostrophe to cells that a spreadsheet might treat as a formula, while a cell holding only a number, such as -12.50, stays as it is. This changes exported text. Turn it off when you have reviewed the values and need original strings. Review the file in its receiving application before replacing a working dataset.

Both sources, keys and the result are processed in your browser. After the page loads, you can disconnect and complete the same operation offline. Copy puts the result on your clipboard, and Download saves a local file.
