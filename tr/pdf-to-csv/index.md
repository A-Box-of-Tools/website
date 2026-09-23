# PDF to CSV — every table in it, bank statements included

Finds every table in a PDF and turns it into rows a spreadsheet can open.

> Turn the tables in a PDF into a CSV: bank and card statements, invoices, price lists, reports. Every table on every page is found from where its text sits, and a running balance is checked row by row where there is one. Nothing is uploaded.

Bu sayfa, tamamen tarayıcınızda çalışan etkileşimli bir araçtır: https://abox.tools/tr/pdf-to-csv/. Ona verdiğiniz hiçbir şey yüklenmez. Aşağıda, sayfanın bu araç hakkında sözcüklerle söylediği her şey yer alır; kullanmak için adresi açın.

## documents **asla yüklenmez**. Sunucu yoktur.

The PDF you choose is opened and read in memory on this machine, by code served from this address, and the CSV is written the same way. Nothing here can make an upload, and there is no server on the other end of this page to receive one. Whatever the tables hold - an account number, a balance, a list of payees, a client's prices - stays in the tab.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to turn the tables in a PDF into a CSV

1. **Choose the PDF.** One at a time. It is read straight off your disk by the browser — every page of it, before anything is decided, because whether a document writes 1.240,00 or 1,240.00 and which way round its dates go are facts about the document rather than about any one page.
2. **Look at the tables it found.** Every table on every page, each with its own columns and its own headings where the page printed any. A table that runs across two sections or two pages under the same headings is one table, and the headings are not repeated in the middle of it. A cell that wrapped onto a second line is folded back into its row. Totals, subtotals and labels come through as the rows they are on the page.
3. **Pick one, or take them all.** When there is more than one table, the control above them chooses which goes into the CSV — all of them, one after another, or just the one you came for. If a table carries a running balance, the line above the tables says whether every row added up. Dates that carry their year come out as YYYY-MM-DD and amounts as plain signed numbers; a date with no year is left exactly as it was printed, because the year it belongs to would be a guess.
4. **Take the CSV.** It is written to RFC 4180 — proper quoting, CRLF line endings — as UTF-8 with a byte order mark, so Excel opens it with the currency symbols intact instead of turning them into letters. With all the tables in one file, each keeps its own heading row and an empty line comes between them. Nothing was uploaded to produce it.

## Uzun sürüm

[Is it safe to upload a bank statement?](https://abox.tools/tr/guides/is-it-safe-to-upload-a-bank-statement/): A statement is every payee, every amount and your balance in one file. Here is what a converter receives, what the careful ones do with it, and how to tell whether the upload needed to happen at all.

## Sorular

### How does it find tables when the PDF has no table in it?

From where the text sits. A page is first split wherever a column of small print runs beside the main content — told apart from a column of the table by the fact that the table's cells share a baseline exactly, and the small print only ever sits beside them by accident. Then each part is walked from top to bottom and cut at headings and gaps into blocks, and the columns of each block are the places where several lines agree a cell starts or ends. Blocks with the same columns are joined back into one table. There is no per-bank or per-form template, so there is no layout it has not been taught.

### Does it only work on bank statements?

No. It started as a statement converter and was rebuilt to find every table in a document, because the first real statement put through it had two transactions and five other tables, and a tool that only wanted the transactions found nothing at all. Invoices, price lists, timetables, results and reports are tables the same way. What a statement adds is a running balance, and where one is there the tool checks every row against it.

### What happens to a description too long for its column?

It is folded back into its row, which is the failure that makes most PDF-to-CSV output unusable. A line with a single cell of words in it, set close to a row, is that row's cell continued — folded into the row below it rather than the one above when it sits nearer to that one, which is how a long label above its value is printed. A line with more than one cell, or with a number in it, is a row of its own.

### How can it possibly know whether it read my statement correctly?

Because most statements carry a running balance, and a running balance is a proof rather than a decoration. If the balance printed on every row really is the balance on the row above plus that row's amount, then the amounts were read correctly, the rows were separated correctly and none was dropped or counted twice — any of those mistakes breaks the chain at the row where it happened. The tool does that subtraction on every row and tells you the result. It also finds the balance column that way rather than by reading a heading, so a table that passes has necessarily had its columns identified correctly. A table without a balance cannot be checked this way, and the page does not pretend it was.

### My dates came out wrong. 03/04 is the fourth of March, not the third of April.

Change the control above the tables and everything is redone instantly. A numeric date is genuinely ambiguous, and the tool settles it from the document rather than from your location: if any date anywhere in it has a day past the twelfth, that one row settles the order for all of them, and the page says so. When every date falls on or before the twelfth there is nothing in the file that could tell them apart, so it says *that*, and picks day-first until you say otherwise. A date printed without a year, as card statements print them, is left exactly as it was written.

### Does it work on a scanned PDF?

No, and it says so rather than handing you an empty file. A scan is a photograph: the rows are pixels and there is no text to line up. The page then shows you what to do instead, and for a statement the first suggestion is the one most people overlook — nearly every online bank will give you the same statement as CSV, OFX or QIF directly, which needs no conversion and is more accurate than reading any picture could be.

### Can it open a password-protected PDF?

No, and that is deliberate. Banks lock a lot of statements, usually with a date of birth or the last digits of an account number. Taking that protection off is a different job from reading a table, so this tool refuses and points you at the ways to do it without the file leaving your machine. The best of them is the [PDF unlocker](https://abox.tools/tr/unlock-pdf/) on this site: it takes the password off in your own browser and changes nothing on the pages, so the text arrives here exactly where it was printed. Printing the document back to PDF from Chrome or Edge, or exporting it from Preview on a Mac, also works. Do not use any other website that offers to unlock it — that is an upload of the exact document this page exists to keep off the internet.

### Is my PDF uploaded anywhere?

No. The file is read and the CSV is written by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The simplest proof is to unplug from the internet and convert a PDF anyway.

### Why is there a strange character at the start of the CSV?

That is a byte order mark, and it is there on purpose. Excel on Windows reads a CSV without one using the system's legacy code page, so a table in pounds or euros arrives with the currency symbol replaced by a letter. The mark tells it the file is UTF-8. Every reader that matters skips it silently; a parser strict enough to show it will hand back a first column heading with an invisible character on the front, which is the cost of the trade.

### Is there a size limit, and does it cost anything?

There is no limit written into the tool. The limit is your own machine: the document is held in memory while it is read, which a laptop will do with several hundred pages without complaint. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your documents.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your document away to be converted would stop the moment you unplugged.

## Gizlilik iddiası nasıl doğrulanabilir

- **The PDFs people convert are the ones least survivable as an upload.** Nobody needs a converter for a table they could retype. The documents that come here are statements, invoices, payslips and reports: a list of everybody somebody paid and what was left afterwards, a client's prices, a company's numbers. Handing that to a stranger's server to have it turned into a spreadsheet means they have it, keep it, and are now a target worth attacking because of it. This page has no other half: there is nothing to send it to.
- **Where a table carries a running balance, every row is checked against it.** Finding a table in a PDF is inference, not reading — which lines belong together, where one column ends, whether a line is a new row or the rest of the one above. Any of that can be wrong on a layout nobody here has seen. A statement's running balance is a proof against that: the balance on each row has to be the one above it plus that row's amount, and a single misread digit, dropped row or duplicated row breaks the chain at exactly the row where it happened. The page says how many rows held. Most tables have no balance, and for those the page says nothing — the rows are what the pages say, and nothing here claims more.
- **The tables come from the paper, not from a template per bank or form.** There is no list of banks or layouts in this tool, and so no layout to be missing from. A page is split where a column of small print runs beside the main content, and each part is searched for runs of lines whose cells line up. That is why it works on a statement from a bank nobody has heard of or a report nobody has seen, and why it can fail on a table whose columns genuinely run into each other.
- **Passwords are not taken off here, and the page says where they can be.** A PDF with a password on it is refused rather than opened. Taking a document's protection off is a different job from reading its tables, and doing it quietly would be a surprising thing for a tool to do on your behalf. What the page does instead is name the routes that make an unlocked copy without the file leaving your machine: the [PDF unlocker](https://abox.tools/tr/unlock-pdf/) on this site, which takes the password off in your own browser and rewrites nothing on the page, or printing it back to PDF from a browser or Preview. And it still says, in as many words, not to hand the document to any other website that offers to unlock it — that is the upload this page exists to avoid.
- **It cannot read a photograph of a page, and does not pretend to.** A scan is a picture: the rows are pixels, and there is no text in the file to line up into columns. That is reported as what it is, with the ways round it that do not involve uploading anything — starting, for a statement, with the one most people have and do not think of, which is that the bank will almost certainly hand you the same statement as CSV directly. Reading letters out of a picture is OCR, and it is a different tool from this one.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your document: not a file, not a table, not a row, a number, a filename or a page count. Every line that reads a PDF or writes a CSV is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your documents. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your document away to be converted would stop.

**Kendiniz kontrol edin.** Yukarıdakilerin hiçbirine güvenmeniz gerekmez. Bu sayfa, depodaki şablonlardan ve yapılandırmadan, okuyup kendiniz çalıştırabileceğiniz bir derleme betiği tarafından üretilir ve sonuç `dist` dalına işlenir — yani sunulan şeyi kaynakların bir derlemesinin ürettiğiyle karşılaştırabilirsiniz: https://github.com/A-Box-of-Tools/website

Önce okunmaya değer dosyalar, Content-Security-Policy için `config/site.toml`, `src/layout.js` for how a page is split into regions without a single ruled line to go on, `src/tables.js` for how the tables and their columns are found, `src/rows.js` for how lines become rows, and `src/check.js` for the arithmetic that proves a statement. None of them can reach the network, and neither can the reader underneath them.
