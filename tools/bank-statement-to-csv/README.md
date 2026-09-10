# Bank Statement Converter

Turns a PDF bank statement into a CSV, in the browser, and then checks its own
answer against the running balance the statement printed.

## The problem this tool actually solves

There is no table in a PDF. There is a stream of instructions that place text
at positions on a page, and the columns you see are strips of paper nobody
printed in. So converting a statement is not reading a table — it is inferring
one, and every stage of that inference can be wrong on a layout nobody has seen
before.

That is the reason for the shape of this tool. The extraction is the easy half
and it is not what makes the tool trustworthy; the checking is.

## How a page becomes rows

The reading is all in `shared/js/`, shared with the redactor: `pdf-text.js`
hands back every page's text in reading order, and for each character the glyph
that drew it and where on the paper it landed. Nothing in this folder parses a
PDF. What is here is everything that happens after the words are located.

| Module | What it decides |
|---|---|
| `layout.js` | where the columns are, and which column each piece of text is in |
| `rows.js` | which lines are transactions, which are furniture, which are continuations |
| `values.js` | what a date and an amount mean in this particular document |
| `check.js` | whether any of the above was right |
| `csv.js` | the file at the end |
| `main.js` | the wiring |

### Columns, from the gaps rather than the content

`layout.js` projects every line of every page onto the horizontal axis and
looks for the strips that stay empty. Those are the gutters; what is between
them are the columns. It is the oldest trick in document analysis, and it works
here for a reason particular to statements: the columns are the document's
whole purpose, so whoever printed it kept them apart deliberately.

Two things stop the page's furniture from erasing the gutters underneath it.
Only lines set near the document's **median type size** are projected at all,
which removes a title twice the height of a row and a page number eight times
it — stronger evidence than anything positional, because a short title is still
a title. And a strip counts as a gutter when *nearly* every line leaves it
alone, not when every line does.

Columns are kept as the occupied spans rather than as cut lines, and a run of
text is assigned to the column it overlaps most. A cut down the middle of a
gutter would slice the ends off long descriptions, because the empty right-hand
half of a description column runs into the real gutter beside it.

### Rows, and the three kinds of line that are not one

`rows.js` puts the lines into three bins that are not transactions:

- **furniture** — headings repeated at the top of page four, `Page 2 of 7`.
  Found by repetition across pages, which no transaction has;
- **continuations** — a description too long for its column, wrapped with
  nothing beside it. Folded into the row above. This is the failure that makes
  most PDF-to-CSV output unusable: a converter treating every line as a row
  produces a half-empty row and a row missing half its description;
- **carried totals** — `Balance brought forward`. An amount but no date, so
  the date column is what tells them from a transaction. Dropped, not folded.

Which column is the date column is decided by counting, not by position — the
column that parses as a date most often. Nothing assumes the date is on the
left, because on plenty of statements it is not.

### Conventions are decided per document, never per value

`1.240,00` and `1,240.00` are the same money. `03/04/2026` is two different
days. Neither can be settled one value at a time, so `values.js` settles each
once for the whole document from every value on every page, and then applies
it. A statement is internally consistent even when the world is not: one row
somewhere in it with a day past the twelfth settles the date order for all the
rest.

When *no* row has one, nothing in the file could tell them apart. The page says
so and offers a control, rather than guessing silently.

## The check, which is the point

Most statements carry a running balance, and a running balance is a proof. If
the balance on each row is the balance on the row above plus that row's amount,
then the amounts were read correctly, the rows were separated correctly, and
none was dropped or counted twice — because any of those mistakes breaks the
chain at exactly the row where it happened.

`check.js` does that subtraction on every row. Two things about it are worth
knowing:

**It finds the balance column with the same arithmetic.** Every money column is
tried as the balance against every other as the amount, and the pairing that
satisfies the chain is the answer — including the debit-and-credit pair, where
the amount is the credit less the debit. So the classification and the proof
are one step, and a statement that passes has necessarily had its columns
identified correctly. Nothing reads a heading, which means nothing depends on
the heading being in English.

**A failure never suppresses the CSV.** A statement may print no balance, or
print one only at the end of each day, or carry one this cannot line up for a
reason that is nobody's fault. So the page reports "not checked" rather than
"wrong". Claiming the rows are wrong when they are merely unproven would train
people to ignore the line that matters.

Rows without a balance are carried rather than skipped: the chain is checked
against the sum of the amounts since the last balance printed, so a statement
with a daily balance still balances.

## What is deliberately not here

- **No renderer.** Same reason as everywhere else on this site: drawing a page
  needs a font engine and a full graphics model. It also means ruled lines are
  invisible to this tool, which is why the columns come from the gaps.
- **No OCR.** A scanned statement has no text in it. That is reported as what
  it is, with the ways round it that involve no upload — starting with asking
  the bank for the CSV it already has.
- **No decryption.** A password is refused, and the page shows the two ways to
  make an unlocked copy locally. Sending somebody to a website that strips the
  password would undo, in the sentence after the failure, the promise the rest
  of the page makes.
- **No per-bank templates.** There is no list of banks and so no bank missing
  from it.

## The example

`src/example.js` asks `shared/js/example-pdf.js` for the shared example
statement with `ledger: true` — signed amounts and a running balance, which no
other tool's example needs. An example without a balance column would
demonstrate this tool with its only claim about correctness switched off.

## Tests

`tests/js/bank-statement-*.test.js`. The layout and row tests build pages out
of positioned runs directly rather than out of PDFs: the geometry is the thing
under test, and writing it by hand is the only way to test a right-aligned
amount column, a wrapped description and a repeated heading without a corpus of
real statements — which could not be committed here anyway.
