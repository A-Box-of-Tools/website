# PDF Redactor

Take words out of a PDF, rather than drawing a black rectangle over them.

The distinction is the entire tool. In almost every program that offers to
redact a page — a PDF reader, a word processor, a design tool — the rectangle is
an object with a position, saved *beside* the text rather than into it. The
text underneath is untouched, and selecting the area and pressing copy hands it
back. That failure has published court filings, intelligence reports, and, in
December 2025, blacked-out names in a mass release of Department of Justice
documents that were readable within hours of publication.

Here there is no rectangle with anything under it. The glyphs are deleted from
the instructions that draw the page, the finished file is opened again by this
tool's own reader and searched, and the count of what survived is on the results
line. If anything did, there is no download.

## What happens to a file

```
    file  ->  PdfDocument.open  ->  readPage per page  ->  the text, and every
                                          |               glyph behind it
                                          v
    somebody ticks words  ->  planEdits  ->  splice the content streams
                                          ->  scrub bookmarks, comments, fields
                                          ->  drop /Info, XMP, attachments
                                          v
                                   writeDocument
                                          v
                              verify: open it again, read
                              every page, search for the words
                                          v
                                     download
```

Nothing is uploaded and nothing is fetched. The object grammar, the reader, the
filters and the writer are the shared `pdf-*` parts the [merger](../merge-pdf/)
and the [compressor](../compress-pdf/) ship too, copied in at `src/shared/` by
the build; everything else here is new, because neither of those two ever had
to open a page's drawing instructions.

## Finding a word

A PDF does not store text. It stores instructions to draw glyphs:

    BT /F1 12 Tf 72 700 Td (Dear Mr Smith) Tj ET

and the bytes in that string are indices into a font, not letters. The same
sentence in a subsetted font is `(\003\020\021\005)`. So before anything can be
searched, two questions have to be answered for every byte, and both are
answered by the font dictionary rather than by the string: **which character is
this**, and **how far does the pen move afterwards**.

[`src/fonts.js`](src/fonts.js) answers them, from a `/ToUnicode` map where the
document provides one, from the encoding tables in
[`src/base14.js`](src/base14.js) where it does not, and from
`/Widths`, `/W` or those same tables for the metrics.
[`src/text.js`](src/text.js) then walks the page with a very small piece of a
renderer — the transformation matrix, the text matrix, and the eight parameters
of the text state — and produces, for each page:

- the text as a reader would copy it, in reading order;
- for every character of that text, the glyph that drew it: which stream, which
  operator, which byte of which string, how wide it is, and the four corners of
  the mark it makes on the paper.

The second half is what makes this a redaction tool rather than a text
extractor. Finding "Smith" is not the job; knowing that those five characters
are bytes 8 to 13 of the second string in the fourth `TJ` on page 3 is the job.

That walk follows the text into the three places it hides:

| Where | Why it matters |
|---|---|
| Form XObjects | letterheads, stamps, watermarks and every filled-in form field are one; a walker that read only the page's own stream would report those pages empty |
| Annotation appearance streams | what somebody typed into a form is drawn from here, and is in `/V` as well |
| `/ActualText` and `/Alt` | a document may declare that some glyphs "spell" something else, and a reader copies **that** — so it is what the panel shows and what gets removed |

## Taking it out

[`src/edit.js`](src/edit.js). Cutting the bytes is the easy half:

    (Dear Mr Smith) Tj      ->      [<44656172204d7220>] TJ

The hard half is that everything after those bytes has now moved. Text is drawn
by advancing a pen, so deleting five glyphs pulls the rest of the line five
glyphs to the left — columns stop lining up, a total slides under a different
heading. So the exact advance of what was removed is measured and put back as a
kern:

    [<44656172204d7220> -2556] TJ

A number in a `TJ` array moves the pen by `-n/1000` of the font size without
drawing anything, so the width that came out of the font metrics goes straight
back in. The horizontal scale cancels, because it multiplies both sides.

**Why not set the text matrix instead.** `Tm` would place what follows
absolutely, which sounds safer and is not: `Tm` also sets the *line* matrix, so
the next `Td` or `T*` in the stream — the next line of the paragraph — would be
measured from a position this tool chose rather than the one the document chose.
A kern moves the pen and touches nothing else, which is the property that makes
it safe to splice into somebody else's page.

Every form of the four text-showing operators comes out as `TJ`, because `TJ`
is the only one that can carry the kern. The ones that do something else as
well keep it as the explicit operator they are shorthand for:

| Was | Becomes |
|---|---|
| `(x) Tj` | `[…] TJ` |
| `(x) '` | `T* […] TJ` |
| `aw ac (x) "` | `aw Tw ac Tc T* […] TJ` |

**The rest of the page is spliced, not rewritten.** Each operator carries the
byte range it occupied, and only the ranges that showed a removed word are
replaced. Every other instruction, every number, every path and every inline
image is copied byte for byte, which is what lets the page claim that nothing
else was touched.

## The black box

Drawn afterwards, over a gap that is already empty, and only because a reader
should be able to see that something was removed. It is appended to the page's
content stream as a four-point path rather than a rectangle, because the text it
covers may be at an angle and `re` can only draw a box that lines up with the
page.

The overlay opens with as many `Q`s as the page left `q`s outstanding. A page
whose content ends inside a saved state has left a transformation — and possibly
a clipping path — in force, and a clipping path is quite capable of throwing
away a rectangle drawn after it.

## Everywhere else the word lives

[`src/strings.js`](src/strings.js). A word can be gone from every content stream
and still be sitting in four other places a reader will show, search or copy:
`/Info` and the XMP packet, a bookmark, a form field's `/V`, a comment. All of
them are scrubbed with the same function that scrubs the page, so the two cannot
disagree about what "removed" means.

Only a named list of keys is touched, not every string in the file. Most strings
in a PDF are not text — they are dates, identifiers, hashes, the bytes of a
CMap — and rewriting one because it happened to contain the letters being
removed would corrupt something for no gain.

Two of those are not optional, whatever the page's checkboxes say:

- **`/Info` and the XMP packet** go on every run. A file whose pages have had a
  name taken out and whose properties still read `Smith settlement draft 3.docx`
  has not been redacted, and that is not a decision worth leaving to a checkbox.
- **The replacement text written into a page** goes with the glyphs it stands
  for. It is the page saying the word, not somewhere else keeping a copy, so it
  is not part of "the rest of the document" that a checkbox can spare.

Attachments and anything that runs when the file opens are dropped too, and that
one *is* a checkbox: neither can be searched for the words being removed, and
neither is needed to read a document, but a whole file inside this one may be
something the reader put there on purpose.

## The check

[`src/verify.js`](src/verify.js), and it is the argument for trusting any of the
above. Everything before it is this tool's own code reporting on its own work.
So the bytes that are about to become a download are handed back to the reader
as though a stranger had sent them, every page is walked again by the same
extractor, every text string in the object graph is collected, and each removed
word is searched for.

The comparison is against a count rather than against zero, because somebody may
remove one "Smith" of twelve: the finished file must hold at most what it
started with less what was taken out. When every occurrence was ticked — the
ordinary case — that number is zero, and the tool can say the strongest thing
there is to say about a document: this word is not in it.

A failure here is reported as a failure. No download is offered.

## The tables in base14.js

Fourteen fonts have metrics and encodings that are part of the specification
rather than part of the file, which is why an invoice out of fpdf or jsPDF is
four kilobytes and carries no widths at all. Those are exactly the files that
have to be got right without help — a bank statement, a payslip, a booking
confirmation — so the metrics are typed out.

A wrong number in there does not cost the redaction. The glyphs are removed
either way and the check at the end proves it. What it costs is position: the
kern that holds a line together is computed from those widths, so an error of
ten per cent moves the rest of the line by a point or two and draws a black box
that much too short. Untidy, not unsafe, which is the right way round for a
table copied out of a thirty-year-old specification.

## What it cannot do

Said here, and said on the page itself, because a redaction tool that overstates
what it did is worse than no tool at all.

**A scan.** A photograph of a page has no text on it; the words are pixels and
nothing here can touch them. What a scan often carries is an invisible text
layer that the scanner's OCR wrote over the picture so the page can be searched.
This tool finds that layer, removes what you choose from it, and says on the
results that the picture is unchanged — so a search and a copy stop finding the
word and a person looking at the page still reads it. Overwriting the pixels is
the [image redactor's](../redact-image/) job on a different kind of file.

**A font that cannot be read back to characters.** A symbolic font with no
`/ToUnicode` map keeps its encoding inside the font program, which this tool
does not parse. Those glyphs are counted and reported rather than guessed at: a
tool that mapped an unknown glyph to a plausible letter would be inviting
somebody to search for a name, see no matches, and conclude the document is
clean.

**A block that appears on more than one page.** A letterhead or a watermark is
usually one form XObject drawn by every page. Editing it edits all of them,
which is more than was ticked — and safe in the only direction that matters,
because it removes more rather than less. It is reported rather than prevented:
copying the block would mean rewriting whichever resource dictionary refers to
it, and those are shared too, so the rewrite has the same problem one level up.

**Text set at an angle**, in the reading-order panel only. It is sorted as
though it were level, so it will look wrong in the list; it is removed just as
exactly, because removal works off the glyph and never off the ordering.

**An encrypted document**, which is refused with a message saying so — even the
empty-password kind that scanners produce. Taking a document's protection off is
a different job from taking words out of it.

## The files

| File | What it is |
|---|---|
| `src/content.js` | the content-stream grammar: operators, operands, inline images, and the splicing |
| `src/base14.js` | the encodings and metrics a PDF is allowed to leave out |
| `src/fonts.js` | one font dictionary: bytes to characters, and characters to widths |
| `src/text.js` | the page walk; every glyph, where it is and which bytes drew it |
| `src/matches.js` | searching, the patterns, and the arithmetic behind two of them |
| `src/edit.js` | the removal, the kern that replaces it, and the black box |
| `src/strings.js` | the text that is not on any page |
| `src/redact.js` | applying a plan to the document and writing it out |
| `src/verify.js` | opening the finished file and looking for the words again |
| `src/main.js` | the page: the search, the match list, the text panel, the result |
| `src/shared/pdf-{reader,writer,objects,filters}.js` | the PDF itself — the shared parts, copied in by the build |

Tests are in [`tests/js/`](../../tests/js/): `redact-pdf-content`,
`redact-pdf-fonts`, `redact-pdf-text`, `redact-pdf-matches` and
`redact-pdf-edit`. The last of those is the one that matters — it writes whole
documents, opens them again, and searches them.
