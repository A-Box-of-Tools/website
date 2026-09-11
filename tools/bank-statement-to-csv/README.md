# PDF to CSV

Finds every table in a PDF and turns it into a CSV, in the browser, and checks
a statement's running balance where one is printed.

It lives at `/bank-statement-to-csv/` because that is what it was first: a
bank statement converter. The first real statement put through it had two
transactions, five other tables — an account summary, a rewards table, payment
details, interest rates, a column of small print — and printed its dates with
no year. The converter only kept lines that started with a dated transaction,
so it found nothing at all. It was rebuilt to find tables wherever they are
and to keep every row of them; a statement is still the document most people
bring, and still the only one whose rows can be proved.

## The problem this tool actually solves

There is no table in a PDF. There is a stream of instructions that place text
at positions on a page, and the columns you see are the places where several
lines agree a cell starts or ends. So converting a PDF is not reading a table —
it is inferring one, and every stage of that inference can be wrong on a layout
nobody has seen before.

## How a page becomes tables

The reading is all in `shared/js/`, shared with the redactor: `pdf-text.js`
hands back every page's text in reading order, and for each character the glyph
that drew it and where on the paper it landed. Nothing in this folder parses a
PDF. What is here is everything that happens after the words are located.

| Module | What it decides |
|---|---|
| `layout.js` | a page's lines as pieces, and the page split into regions |
| `tables.js` | which lines make a table, where its columns are, and which cell each piece lands in |
| `rows.js` | a table's headings and rows, and the cells that ran onto a second line |
| `values.js` | what a date and an amount mean in this particular document |
| `check.js` | whether a running balance adds up |
| `csv.js` | the file at the end |
| `main.js` | the wiring |

### Regions first, told apart by their baselines

A page is rarely one thing. A statement runs its transactions down the left and
a column of small print down the right, and the two share baselines by
accident, so the reader hands a line of each back as one line. `layout.js`
splits the page first, at a vertical strip nearly every line leaves empty, with
lines of its own on both sides, and — the test that took a wrong answer to find
— crossed by hardly any single line.

The first version picked the *widest* such strip, which was the gap before the
amount column: the small print sat right of every gutter in the table, so every
gutter had lines wholly on both sides, and the page was cut between
descriptions and their amounts. What separates the two is what crosses them,
and it was measured on that statement: all 38 lines lying on one side had a
baseline spread of exactly 0.00, because a row's cells are laid out together,
while the small print sat beside a row by accident, 0.66 to 5 points off. So a
line whose halves sit on different baselines counts as two lines, and the edge
between regions is the strip no row crosses.

That exact-baseline test is used only to find regions. Rows keep the reader's
own, more forgiving grouping, so a row whose cells were set in slightly
different sizes does not fall apart.

### Blocks, then tables

`tables.js` walks each region top to bottom and cuts it into blocks at anything
that ends a table:

- **a heading** — a line of one piece set clearly larger than the region's usual
  size. Size alone was not enough: one statement set its rows in both seven and
  nine points. A heading is larger *and* a single phrase; a larger line with
  several cells is a row, like a bold total. And "usual" is the region's, not
  the document's — a summary page in ten points and transactions in seven gave a
  document median at which a twelve-point heading passed for body text;
- **empty paper** — more than a few line heights, or once a block has a rhythm,
  half as much again as its usual spacing;
- **a line whose pieces stop lining up** with the ones above — judged only once
  two structured lines exist, because the first is often a heading whose words
  stand wherever they fit.

A block with two or more lines of structure is a table. Then consecutive blocks
with the same columns — matched one to one and in order — are joined, which is
what puts "Payments received" and "Purchases" back into one table and carries a
table from one page to the next.

### Columns from alignment, not from empty paper

The first version found one set of columns for the whole document from the
strips nothing was printed in. That fails whenever headings and totals cross
the gutters, which on a card statement is always.

Now a column is an edge several lines agree on — pieces that start at the same
place, or, for a column of amounts set flush right, end there. Lines vote with
one less than their number of pieces, so a totals line barely counts and a full
row counts most. In a block of three structured lines or fewer the fullest line
decides on its own, because a one-row table has nothing to agree with; in a
larger one it does not, because there it is more often the odd line out. A
column's extent is what its pieces agree on — the upper middle of their left
edges and the lower middle of their right — so one piece that ran into its
neighbour cannot stretch a column over the next. An edge whose pieces lie across
two surviving columns is a label, not a column.

### Where each piece goes

A piece is split between columns only where its own words sit inside different
columns *and* further apart than a space between words — "06" and "RB" at 0.9
of a letter apart, not "payments received" at 0.28. A word in no column at all
goes to the column on its left, because what overflows a cell overflows
rightwards: "DIRECT" drawn forty points past the rest of a payee's name, "CR"
set after an amount.

### Rows: every line of a table is one

`rows.js` keeps every line. Totals, subtotals and section labels come through
as the rows they are on the page; what is in a table is not this tool's to
judge. Four things are still worked out from the layout:

- **the headings** — the leading lines with no data in them, stacked into one
  where a heading is printed on two lines. Data means a number, a date, a
  percentage, or a run of three or more digits that is not a year, so a phone
  number or an account number starts the rows but "Total on May 15, 2025" and a
  column headed 2024 stay headings;
- **headings repeated** at the top of a later block — the longest run of lines
  saying the same as the first block's headings is dropped, and nothing after
  it, so a label printed under the repeated headings stays a row;
- **a cell that ran onto a second line** — a line of one text cell set close to
  a row is folded into whichever neighbour it sits nearer, the row above for a
  wrapped payee, the row below for a label wrapped above its value;
- **a column with no heading that is almost always empty**, in a table that has
  headings, is a stray piece of a neighbour and is folded into the nearer one —
  unless it is words and the nearer one is not.

A line that is only a page number is dropped wherever it lands.

### Conventions are decided per document, never per value

`1.240,00` and `1,240.00` are the same money. `03/04/2026` is two different
days. Neither can be settled one value at a time, so `values.js` settles each
once for the whole document from every value on every page, and then applies
it. One row somewhere with a day past the twelfth settles the date order for
all the rest; when no row has one, the page says so and offers a control.

A date printed without a year — how card statements print every date — is data
for telling headings from rows, and is never rewritten. The year it belongs to
would be a guess, and a converter has no business putting a guess in somebody's
spreadsheet.

## The check

Most statements carry a running balance, and a running balance is a proof: if
the balance on each row is the balance on the row above plus that row's amount,
the amounts were read correctly and no row was dropped or counted twice.

`check.js` finds the balance column with the same arithmetic — every money
column tried as the balance against every other as the amount, and the
debit-and-credit pair too — so nothing reads a heading and nothing depends on it
being in English. Recognising a balance column and judging it are two separate
thresholds: they were one, and a four-row statement with one misread amount
then had its balance column rejected outright, which read as "nothing to check"
instead of "look at row three".

Where no table has a balance the page says nothing about checking. Most tables
have none, and a line on every one of them saying so would be a line people
learn to skip.

## What is deliberately not here

- **No renderer.** Drawing a page needs a font engine and a full graphics model.
  It also means ruled lines are invisible to this tool, which is why columns
  come from alignment.
- **No OCR.** A scanned page has no text in it. That is reported as what it is,
  with the ways round it that involve no upload.
- **No decryption.** A password is refused, and the page points at
  `/unlock-pdf/` and at printing an unlocked copy locally.
- **No templates.** There is no list of banks or forms, and so no layout missing
  from it.
- **No inferred years.** See above.

## The example

`src/example.js` asks `shared/js/example-pdf.js` for the shared example
statement with `ledger: true` — signed amounts and a running balance, which no
other tool's example needs. An example without a balance column would
demonstrate this tool with its only claim about correctness switched off.

## Tests

`tests/js/bank-statement-*.test.js`. Most table tests build pages out of
positioned runs, because the geometry is the thing under test: a sidebar a
fraction of a point off the table's baselines, a heading repeated on page two, a
one-row table, a label wrapped above its value. The last two build a real PDF
with the layout of the statement that broke the first version — every word of
it invented — and read it through the same reader the page uses.
