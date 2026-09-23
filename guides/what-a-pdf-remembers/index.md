# What a PDF remembers

More than its pages. A PDF routinely carries the name of its author, the software that made it, the file it was before it was a PDF — and, if it was edited a certain common way, every earlier version of itself, deletions included. None of it shows on screen.

Last updated 26 August 2026

## The short answer

A PDF is not a picture of its pages. It is a container, and the pages are only the part of the cargo that gets displayed. Around them the format has room for a document information block, a second XML copy of the same, comments, form data, attached files, and — through one very common way of saving edits — complete earlier versions of the document, stacked underneath the current one.

None of this is a flaw. Every item was designed for a reasonable job, and inside one organisation most of it is harmless or useful. The problem is the boundary crossing: the moment a PDF leaves — to a counterparty, a mailing list, a public docket — everything it remembers goes with it, and what it remembers is not shown on any page. People check what a document says and send what the file contains, and those are different things.

## The name tag: /Info and the XMP packet

Every PDF may carry a document information dictionary — author, title, creation and modification dates, and the names of the programs that created and produced it. Most carry a second, richer copy of the same facts as embedded XML, called XMP. Neither is displayed with the pages; both are one properties-panel away.

The values are filled in automatically, which is what makes them leaky. *Author* is typically the account name the operating system was installed with — a real, full name, on documents people believed were anonymous: job applications, reviews, complaints, bids. *Title* is routinely the filename of the document the PDF was exported from, so `Draft-v7-legal-concerns.docx` survives inside the polished PDF that replaced it. The producer line dates the software; the dates contradict cover stories. Whole research papers have been written on what institutional PDFs admit in this block.

## The undelete: incremental saves

The sharpest item in the container is the one the format is proudest of. PDF supports *incremental updates*: instead of rewriting the file, an editor may append its changes to the end and leave everything before them untouched. The viewer reads the file from the back and shows the newest version; the older versions are still there, byte for byte, in the same file.

Append-only saving is fast and crash-safe, and it means a document edited this way contains its own history. Text that was “deleted” is not gone; it is superseded, and recovering it is a matter of reading the file as it was before the last append. A black rectangle drawn over a name in an editor that saves incrementally produces a file that contains the name *twice* — once under the rectangle, once in the history — which compounds the failure described in [the redaction guide](https://abox.tools/guides/can-blacked-out-text-be-recovered/).

The remedy is a full rewrite: open the file, keep what the current version actually uses, write a new file with no past. That is what the [PDF compressor](https://abox.tools/compress-pdf/) here does by construction — a rewrite cannot help but abandon the history, and the tool counts the superseded material it left behind in its size breakdown, which is also the easiest way to discover your file had a history at all.

## The cargo hold: comments, fields, attachments, layers

The rest of the memory is more ordinary, and leaks anyway:

- **Comments and annotations** — the review conversation, riding along with the reviewed document, visible to whoever thinks to look.
- **Form fields** keep their filled-in values as data even where a flattened page no longer displays them.
- **Attachments**: a PDF can embed whole files, of any type, and readers surface them in a side panel most people have never opened. The spreadsheet behind the chart is sometimes attached to the chart.
- **Optional content layers** can hold page content that is switched off rather than removed — present in full, displayed never.

Each of these is data the pages do not show, in a file people judge by its pages.

## Sending a PDF without its memory

The pattern in all of it: what survives is decided by how the file was written, so the fix is to put the file through something that writes forgetfully, on your own machine — a document's history is exactly the thing not to upload to a stranger's server, a point [argued in full here](https://abox.tools/guides/is-it-safe-to-upload-files/). Three tools on this site write PDFs, and all three were built to leave the memory out:

- The [PDF merger & splitter](https://abox.tools/merge-pdf/) writes output with **no information dictionary at all** - no author, no dates, no line naming the software. What it copies from your originals is what their pages use, not their baggage. There is [a guide](https://abox.tools/guides/merge-and-split-pdf-files/).
- The [PDF compressor](https://abox.tools/compress-pdf/) rewrites the file completely — superseded history abandoned, XMP packet and private application data not kept — and itemises what it removed. Also [with a guide](https://abox.tools/guides/make-a-pdf-smaller/).
- The [PDF redactor](https://abox.tools/redact-pdf/), for when the memory is the point: it scrubs the information block, the XMP packet, bookmarks, comments, field values and attachments on every run, alongside the redaction itself — [its guide](https://abox.tools/guides/redact-a-pdf/) walks through it.

And the acceptance test mirrors the leak: judge the file, not the pages. Open the properties panel and read what is left; search the raw file for a word you removed; look at the compressor's breakdown of what your document was carrying. A PDF with no memory has nothing to confess, no matter who reads it.
