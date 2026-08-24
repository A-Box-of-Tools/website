# PDF Merger & Splitter

*Pages moved around without a round trip to a server.*  ·  lives at `/merge-pdf/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

Merging, splitting and reordering are one tool because they are one operation:
choose some pages from some documents, put them in an order, and decide how many
files they come out as. Merging is "all the pages, one file". Splitting is "all
the pages, several files". Reordering is the same list with the order changed.
Building three tools out of that would have meant three copies of the part that
is actually difficult, which is copying a page from one document into another
without breaking it.

---

## Why copying a page is not copying a dictionary

A page in a PDF is a dictionary, and the naive version of this tool copies it
into a new file and stops. The result opens. It is also wrong in ways nobody
notices until the document is somewhere else:

- **A page inherits.** Its size, its crop, its rotation and its resources may be
  written on any node above it in the page tree. Copy the leaf on its own and
  the page has no `/MediaBox`, so every reader falls back to US Letter, and no
  `/Resources`, so the fonts and images it draws with are gone. `src/pages.js`
  carries those four down the tree during the walk and `src/assemble.js` writes
  them onto the copy explicitly — the new parent is a flat node shared by pages
  from several documents and cannot carry any of them.
- **A page is the top of a graph.** `/Contents` is a stream; `/Resources` names
  fonts, which name descriptors, which name embedded font files; an image may
  carry a soft mask and a colour space that is itself an object. All of it has
  to come across, exactly once each, however many pages point at the same font.
- **The graph does not stop at the page.** Annotations point back at their page.
  Links point at *other* pages. A form field points up at a tree that points
  back down at widgets on pages that may not be in the output at all. Following
  references without a rule drags an entire 400-page report in behind the one
  page somebody asked for.

The rule that makes it terminate is one line of `Copier.ref`: **a reference to a
page is never followed.** It is looked up in the table of pages that were
selected and becomes either the new page or `null`. Everything else is copied
once and cached, per source document, so a font shared by three hundred pages is
copied once and a page copied twice shares it.

Nothing is shared *between* source documents. Two files that both embed
Helvetica each bring their own copy, because deciding that two objects are "the
same" means comparing whole subgraphs, and getting that wrong means a page drawn
with somebody else's font. The cost is a few kilobytes per file; the alternative
is a class of bug that only shows up on someone else's screen.

The copy walk is a queue rather than recursion. Fonts are three deep, but the
field tree of a long government form is hundreds, and that is not what the
JavaScript stack is for.

## Destinations, and why they are resolved rather than copied

A link or a bookmark says where it goes in one of three ways: an explicit array
starting with the page, a name looked up in the catalogue's `/Dests`, or a name
looked up in the `/Names /Dests` tree. Word writes a named destination for every
heading. So does LaTeX. So does anything that builds a table of contents.

Neither table can be carried across. Half the names would point at pages that
are not in the output, and two merged documents each arrive with their own
`section.1`. So `src/dests.js` reads both tables per source document and every
destination is resolved *there*, against the document it came from, down to the
page it means. What is written out is an explicit array. A link whose page did
not come along keeps its rectangle and loses its action, which is the honest
outcome — better a link that does nothing than one that goes somewhere wrong —
and the number of them is reported on the results.

The rest of the destination array comes across untouched. The coordinates in an
`/XYZ` destination were measured against the page, not against the document, so
they still mean the same point on the same paper.

## Bookmarks are rebuilt, not preserved

The outline is the part a page-shuffling tool cannot copy and should not drop.
It cannot be copied because its entries point at pages, half of which may be
gone, and because the tree is doubly linked — `/First`, `/Last`, `/Next`,
`/Prev`, `/Parent`, `/Count` — so removing one entry means unstitching it from
four neighbours. Dropping it is what most tools do, and it is why a merged
report opens with an empty bookmarks panel.

`src/outline.js` reads the tree into ordinary JavaScript objects, prunes it
against the pages that survived, and writes a new one from scratch:

- an entry whose page is still in the output points at wherever that page now is;
- an entry whose page is gone but which still has surviving children stays, as a
  heading with nothing behind it — a chapter title is still where the chapter is;
- an entry with neither goes.

Merging several documents nests each one's outline under a heading named after
the file, and a file with no bookmarks of its own still gets its heading,
pointing at its first page, so every source is reachable from the panel.

Everything is written closed (`/Count` negative on any item with children), so a
merge of four files opens showing four lines rather than four hundred. Titles go
out as UTF-16 with a byte order mark, which is the only PDF text encoding that
can hold a bookmark titled in Greek or Japanese.

## Forms

A form is not the widgets on the page. The widget is the box you click in; the
*field* — the thing with a name and a value — is a dictionary above it, and the
catalogue has to list every field in `/AcroForm /Fields` or no reader treats the
document as a form at all. So every copied widget is walked up its `/Parent`
chain to the root field, and those roots are what the new `/AcroForm` gets.
`/DR`, `/DA`, `/Q`, `/NeedAppearances` and `/SigFlags` come from the source
documents that had them, first of each key winning.

One case is reported rather than solved: **two fields with the same name are one
field to a reader.** Merge two copies of the same form and typing in a box on
page 1 fills the same box on page 9. That is right when it is the same form
twice and wrong when two different forms both call a box "Name", and there is no
way from inside the file to tell which. The tool detects the collision and says
so on the results.

Signatures are a different matter. Any signature over a page that has moved is
already broken by the move — that is what a signature is for — so nothing here
tries to keep one valid.

## What is deliberately left behind

Named on the results screen every run, not buried here:

| Left behind | Why |
|---|---|
| The structure tree (`/StructTreeRoot`, `/StructParents`) | It describes a reading order for the document that no longer exists. Rebuilding it against a reshuffle is a larger job than the rest of this tool put together, and a *wrong* tagging tree is worse for a screen reader than none |
| Page labels (`/PageLabels`) | "iii, iv, 1, 2" is a statement about a sequence that has just been changed |
| Embedded attachments (`/Names /EmbeddedFiles`) | Attached to the document, not to any page, so there is no page to carry them |
| Article threads (`/B`) | One bead of a chain running through a document the page is leaving |
| Actions that are neither "go to a page" nor "open a web address" | Launch a file, submit this form somewhere, play this, run this JavaScript. Reordering somebody's pages is no reason to carry their document's scripting into your new file |
| `/Metadata`, `/PieceInfo`, `/LastModified`, and the whole document information dictionary | The same argument [EXIF Viewer & Remover](../exif-editor/) makes, in a container people send to strangers rather more often than they send a JPEG. The output carries no producer line, no dates and no name for the tool that made it |

Everything on the page itself is copied byte for byte. Nothing is re-encoded,
re-rendered or recompressed: text stays selectable, a photograph is the same
photograph, and a page that was 40 KB of vector drawing is still 40 KB of vector
drawing. This tool moves pages; [PDF Compressor](../compress-pdf/) is the one
that makes them smaller.

## Splitting, and the names that come out

`src/plan.js` holds the two small languages people type — `1-3, 8, 12-` for a
range and a list of page numbers for where to cut — and turns the running order
into groups. The parser is strict on purpose: anything it could not understand
is handed back as itself and the action refuses to run, because a range box that
silently ignores what it did not parse is how somebody deletes forty pages they
meant to keep.

Five ways out: one document; every *n* pages; at page numbers you name; one file
per page; or back into the files the pages came from. More than one file goes
into a ZIP, stored rather than deflated, because a PDF is already compressed —
`src/zip.js` and `src/crc32.js` are the same two files six other tools here
carry. Fifty downloads is fifty save prompts, which is where people give up and
go back to the site that wanted the upload.

## The check at the end

Every finished file is handed straight back to `src/reader.js`, parsed as though
a stranger had sent it, and its pages counted by walking the tree rather than by
reading `/Count`. If the number is not the number asked for, the run is reported
as failed and **no download is offered**.

Page count is the number worth checking because it depends on the whole chain
having survived: the catalogue, the page tree, the object streams, the
cross-reference stream and every reference between them. It is not a proof of
correctness and is not described as one. It is the difference between a bug
caught here and a bug caught by whoever the document was sent to.

## What is shared with the PDF Compressor, and why it is copied

`src/objects.js`, `src/filters.js`, `src/reader.js` and `src/writer.js` are
byte-for-byte copies of the same four files in [PDF
Compressor](../compress-pdf/), the way `crc32.js` and `zip.js` are copies across
seven tools here. Each tool folder in `dist/` is complete on its own, cached by
its own service worker and working offline with nothing fetched from a
neighbour, and that is worth more than the duplication costs. If those four ever
have to change, they change in both places, and the JavaScript tests cover both
copies.

The writer took no changes at all to be used for this. It asks a document for
four things — `objects`, `trailer`, `getObject`, `resolve` — so `Build` in
`src/assemble.js` provides exactly those, and a document assembled here is
written by the same code that rewrites a compressed one. It packs the small
objects into object streams and deflates them, which is why a merge is usually a
little smaller than the sum of its inputs even though nothing on any page was
touched.

## Why there are no page thumbnails

Drawing a page means a renderer: fonts, shading, transparency groups, blend
modes, the lot. That is a megabyte or more of engine to fetch and run, on a page
whose whole argument is that it fetches nothing. What the tiles show instead is
what reordering actually runs on — the page number, the shape and size of the
paper drawn at its real aspect ratio, the rotation it will be written with, and
which file it came from. The landscape scan in a stack of portrait ones is still
obvious at a glance.

If that ever changes it will be because a renderer got small enough to vendor
under the rules in [What can be built here](../../docs/what-can-be-built-here.md),
not because the thumbnails were worth an upload.

## Limitations

- **Encrypted documents are refused**, empty password included.
- **No tagging, no page labels, no attachments** in the output. Named above and
  on the results.
- **Nothing is re-paginated.** Pages keep their own size, so merging A4 and
  Letter gives a document with both in it. That is what the source files say,
  and quietly scaling somebody's pages onto one paper size would be a different
  and much more surprising tool.
- **Everything is in memory** — every source document, plus each output while it
  is written and again while it is checked. A few hundred megabytes is where a
  browser tab starts to feel it.
- **Optional content (layers) comes across as it is**, because it lives on the
  page's own resources; the catalogue-level `/OCProperties` that says which
  layers start visible does not, so a document built entirely around layer
  visibility is not this tool's best subject.
- **No page-level cropping or rotation of content**, only the `/Rotate` a reader
  applies. Trimming margins is a different tool and is on the roadmap.

## Testing it

`tests/js/merge-pdf-*.test.js`, run with `node --test "tests/js/*.test.js"` from
the repository root. They build small documents by hand — a page tree with
inherited attributes, an outline, a link with a named destination — merge, split
and reorder them, and read the results back with the same reader the page uses:

- pages come out in the order asked for, with inherited `/MediaBox` and
  `/Resources` written onto each copy;
- a page selected out of a document brings its content stream and its fonts and
  leaves the other pages behind — the object count is checked, not just the
  page count;
- a link to a page that survived points at its new position, and one to a page
  that did not comes out with no action;
- a named destination is resolved through both tables;
- bookmarks whose pages are gone are pruned, ones with surviving children become
  headings, and the rebuilt tree's `/First`, `/Last`, `/Next` and `/Prev` chain
  is walked to make sure every entry is reachable;
- the range parser accepts what the page says it accepts and refuses the rest;
- splitting produces the right number of files with the right pages in each.
