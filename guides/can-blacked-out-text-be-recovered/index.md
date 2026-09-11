# Can blacked-out text be recovered?

Uncomfortably often, yes — with the text selection tool, not a laboratory. Most black rectangles are drawn *over* the words and saved beside them, and the words ride along underneath. This page is the catalogue of the ways that happens, and what removal has to mean instead.

Last updated 26 August 2026

## The short answer

Uncomfortably often, yes. Not by forensics — by selecting the blacked-out area and pressing copy. Most of the tools people reach for when something needs hiding draw a rectangle *over* the content and save it *beside* the content, and everything underneath rides along in the file, patiently, until somebody looks.

This is not a rare mistake made by careless people. It has published names from court filings, unredacted numbers from government reports, and — in one mass release of case documents in December 2025 — blacked-out names that were readable within hours. The people who made those mistakes had lawyers and process. What they did not have is the distinction this page is about: the difference between covering something and removing it.

## The rectangle that is an object

In a PDF reader, a word processor, a slide deck or a layered image editor, a drawn black box is not paint. It is an *object* — a shape with a position, a size and a colour, stored in the file as its own thing, in front of text that is still entirely present. The document does not say “this word is gone”; it says “this word is here, and a rectangle is in front of it”.

Everything follows from that. Select the area and copy, and the clipboard receives the text, because copying reads the text layer and ignores the decoration in front of it. Open the file in an editor and the rectangle can simply be moved aside. Export it to another format and the layers may be flattened in a different order. The box looks identical to a real redaction on screen, which is exactly why the mistake survives review: the eye checks the page, and the page looks right.

PDFs add a quieter variant. A PDF may declare that a run of glyphs “spells” something other than what is drawn — an accessibility feature called `/ActualText` — and copying reads the declaration rather than the ink. A document can therefore leak a word that is not even visibly on the page.

## The blur that is arithmetic

Pixelation feels safer than it is. A mosaic is a grid of averages, and an average is a *measurement* of what was underneath — small and lossy, but a measurement all the same. For text in a known font at a predictable size, that has been enough to read it back: take every plausible string, render each one, pixelate it the same way, and keep the candidate whose mosaic matches. Nothing about that requires a laboratory; it is a loop and a comparison.

Blur is worse in principle. A blur is a convolution — each output pixel a weighted average of its neighbours — and convolutions can be run backwards well enough, often enough, that deconvolution is a standard tool in photography rather than an exotic attack. Both effects also share a failure that has nothing to do with mathematics: they advertise that something is hidden and roughly how long it is, which for a six-character password is already a hint.

A flat fill has none of these properties. One colour, edge to edge, carries no measurement of anything. That is why it is the default in the [Image Redactor](https://abox.tools/redact-image/) here, why that tool's pixelate and blur options say on their own labels what they do not promise, and why its strength control reports a number rather than an adjective.

## The copies a file keeps of its own past

The third family of failures has nothing to do with the covering at all. Files remember, in ways nothing on screen shows:

- **A photo's metadata often includes a thumbnail** of the image as it was before editing. Crop your address out of a picture, and the EXIF block may still hold a miniature of the uncropped original. The [EXIF Viewer & Remover](https://abox.tools/exif-editor/) shows that block and takes it out; there is [a guide to it](https://abox.tools/guides/remove-exif-and-gps-data/).
- **Some editors save in place without truncating.** A famous 2023 pair of bugs — in a phone's screenshot markup tool and a desktop snipping tool — left the bytes of the original image in the file after cropping, so the “cropped away” part could be reconstructed from the leftovers.
- **PDFs can carry their own history.** A PDF edited with incremental saves appends changes to the end of the file and leaves the earlier version intact inside it, deletions included.

The common thread: what a viewer displays and what a file contains are different questions, and redaction that has only been checked by looking has only answered the first one.

## What removal actually takes

A real redaction changes the data, not the view, and it can be checked the same way it can fail: by asking the file, not the screen.

For a picture, that means the pixels under the box stop existing before any file is written. The [Image Redactor](https://abox.tools/redact-image/) does exactly that — the covered values are overwritten in memory and only then handed to the encoder, so the output contains black pixels where the content used to be, not black ink in front of it. The step-by-step version is in [the image redaction guide](https://abox.tools/guides/redact-an-image/).

For a PDF, it means the glyphs are deleted from the instructions that draw the page, along with the hidden carriers — `/ActualText` declarations, bookmarks, comments, form fields. The [PDF Redactor](https://abox.tools/redact-pdf/) does that, and then does the thing that matters most: it reopens its own output and searches it for the removed words, and **if anything survived, there is no download**. The walkthrough is in [the PDF redaction guide](https://abox.tools/guides/redact-a-pdf/).

And whichever tool you use, anywhere, the acceptance test is yours to run: select over the redacted area and copy; search the file for the removed word; open it in a different viewer. If the content was removed, nothing can find it — and if a tool is doing this in your browser without your file leaving the machine, that claim, too, is one you can check rather than trust: [the guide on uploading](https://abox.tools/guides/is-it-safe-to-upload-files/) shows how. Redaction is the one job where the file is sensitive by definition, which makes it the last job that should transit somebody else's server.
