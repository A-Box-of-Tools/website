# Stitch Tables

Bring two tables together by a shared value, a pattern, a manual pairing or their row order. Everything stays in your browser.

> Join two CSV or pasted spreadsheet tables by matching values or patterns, pair rows manually, stack rows or merge side by side. Preview and export CSV or TSV in your browser. Nothing is uploaded for processing.

Esta é uma ferramenta interativa de navegador em https://abox.tools/pt/stitch-tables/. Os arquivos são processados no dispositivo que executa esse navegador. Compartilhamento deliberado e funções opcionais de rede são explicados na página. A seguir está sua explicação escrita; abra o endereço para usá-la.

## Seus tables são **processados no navegador**. Sem envio para processamento.

A customer list and an order export can reveal more together than either one alone. This tool reads, matches and writes both tables in this browser: no processing service receives a file, a heading, a cell or a match key. The parser and row operations are in `src/shared/table-data.js`, served with the page. Matching uses the rule you choose, and the preview shows the result before you copy or download it.

- ✗ No processing upload
- ✗ No account
- ✓ CSV & TSV
- ✓ Works offline
- ✓ Open source

## How to stitch two tables together

1. **Add table A and table B.** Paste CSV or tab-separated cells copied from a spreadsheet, or choose or drop a text file for each side. Check the delimiter and automatic heading guess. Without a clear heading row, all rows are kept and column names are suggested from value patterns. You can choose the heading-row setting manually. Values stay as text, so an identifier such as 00123 keeps its leading zeroes.
2. **Choose how the rows meet.** Match rows by columns and an exact value or extraction pattern, pair individual rows manually, or use Simple merge to add rows, columns, or both. The combined direction matches a selected key, retains every unmatched row, and combines shared fields when their values agree or one is empty. Conflicting fields keep separate A/B columns. For matching and manual pairing, choose whether to keep every row, all of table A, or only paired rows.
3. **Review the matches and the preview.** Blank keys do not match. Repeated automatic keys produce every matching combination, so check the duplicate count and result size. Manual pairing lets you choose a particular B row for an A row. The preview is limited; the result count describes the full export.
4. **Copy or download the joined table.** Choose CSV or TSV and check formula protection. Protection adds an apostrophe to cells that a spreadsheet might treat as a formula; turn it off only when you want the original text exported unchanged. Copy and Download use the current prepared result.

## A versão longa

[How to stitch two tables without losing the rows that do not match](https://abox.tools/pt/guides/stitch-two-tables/): Choose a match key, pair rows manually, stack records or merge columns by row order. How to keep unmatched rows, check duplicate matches and export without losing identifiers.

## Perguntas

### Can I use tables copied from Excel or Google Sheets?

Yes. Copy a rectangular range and paste it into a table box; spreadsheet cells usually arrive separated by tabs. You can also save a sheet as CSV UTF-8 or TSV and choose or drop that file. This tool reads delimited text, not an XLSX workbook, its formulas, cell styles or multiple sheets.

### What if my table has no header row?

Automatic detection keeps the first row as data unless it looks like headings. Headerless columns receive suggested names such as Email, Date, ID, Number or Text based on up to 50 rows. Repeated suggested names become Email 1, Email 2 and so on. Guesses do not change cell values. Review the notice and choose First row is headings or No heading row if needed; ambiguous all-text tables cannot always be distinguished automatically. Stacking still aligns headerless tables by column position.

### What kinds of pattern matching are available?

Compare the whole value, take its first run of digits, keep letters and digits while removing punctuation and spacing, or take text before or after the first separator you supply. For example, the first-number rule extracts 001 from both invoice-001 and paid/001. The extracted text is a comparison key; source cells remain unchanged. These are fixed extraction rules, not fuzzy matching or arbitrary regular expressions.

### What happens to blank keys, duplicates and unmatched rows?

Blank keys and values from which the chosen pattern extracts nothing remain unmatched. If a key appears twice in table A and three times in table B, matching produces six joined rows. All rows from both tables retains unpaired rows with empty cells for the missing side; All rows from table A omits B-only rows; Matching pairs only omits every unpaired row. Manual pairing is one-to-one.

### Can I merge more rows, more columns, or both?

Yes. Add rows stacks B below A and aligns headed columns, keeping extra columns; without headings it aligns by position. Add columns places tables side by side and retains the longer table's rows. Add rows and columns matches records by your chosen key and keeps unmatched records from both sides. Shared headings combine equal values or fill exactly empty cells. If a shared field has any conflicting nonempty values, its full A/B columns remain separate. Headerless fields stay separate because inferred names do not establish that they mean the same thing.

### How large can the tables be?

Each source is limited to 2,097,152 text characters, 5,000 data rows, 100 columns and 100,000 data cells. Selected files are also limited to 2 MiB. The stitched result is limited to 20,000 rows, 500,000 cells and 16 MiB of text. These bounds keep the browser responsive and stop duplicate keys from expanding into an unexpectedly large result. A preview shows part of the result; export includes every prepared row.

### Does export change my values?

Cells remain text without number or date conversion. Quoting and delimiters may change when written. Formula protection is enabled by default and prefixes potentially active spreadsheet cells with an apostrophe, while a cell holding only a number, such as -12.50, stays as it is; turn it off for unchanged-text export. Your spreadsheet may still infer dates or numbers when opening CSV, so import columns as text when preserving identifiers matters.

### Are either of my tables uploaded?

The table-processing code does not upload source files, pasted cells, match keys or results. It runs in this browser and works offline after the page is loaded. Copy intentionally places the result on your clipboard, and Download saves a file through your browser.

## Como dá para conferir a promessa de privacidade

- **Both tables are processed in this browser.** The processing code reads selected files or pasted text on your device, creates match keys locally and builds the result in memory. It does not upload the tables for processing. You can inspect the source and compare it with browser requests, or complete the job while disconnected.
- **A pattern is applied locally.** The rules extract part of a value or remove punctuation before comparing keys. There is no remote lookup, AI service or third-party spreadsheet parser. Original cell contents are preserved in the result; only comparison keys are transformed.
- **The result leaves the page when you choose an export.** Copy writes the prepared CSV or TSV to your clipboard. Download gives your browser a local file. The table-processing code does not store either source or the result on a server. Keep the original files if you need to repeat or check the work later.
- **The site frame explains its own requests.** The page's advertising, measurement and feedback features are described separately in the site's privacy information and live network panel. The table-processing code does not hand them source files, cells, filenames or match keys.

**Confira você mesmo.** Nada do que está acima precisa ser aceito na fé. Esta página é gerada a partir dos modelos e da configuração do repositório por um script de compilação que você pode ler e rodar por conta própria, e o resultado vai para a branch `dist`. Ou seja, dá para comparar o que é servido com o que uma compilação das fontes produz: https://github.com/A-Box-of-Tools/website

Os primeiros arquivos que valem a leitura são `config/site.toml` para a Content-Security-Policy and `src/shared/table-data.js` for quoted-field parsing, key extraction, duplicate matches, manual pairs and output bounds, then `src/main.js` for the preview and local copy and download actions.
