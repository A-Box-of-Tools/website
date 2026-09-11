# Compress PDF — make a PDF smaller

Shrink a document without sending it anywhere.

> Make a PDF smaller without uploading it. The file is read, recompressed and rewritten by your own browser, and the tool shows you where its size actually is before it touches anything.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/compress-pdf/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your documents are **never uploaded**. There is no server.

The document is opened, taken apart and written back out in memory on this machine, by code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to make a PDF smaller

1. **Choose a PDF.** Drop it on the picker or select it by hand. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Look at where the size is.** The breakdown is the point of the second step. If the bar is mostly images, this tool has something to work with. If it is mostly fonts and page content, it will say so, and the honest saving is a few per cent — better to know that before you spend a minute on it.
3. **Say how hard to squeeze.** The named settings are resolutions, not vague grades: 96 DPI for reading on a screen, 130 for emailing, 220 for something that still has to print. Each one is measured against how large the picture is actually drawn on the page, so a photo placed as a thumbnail is not treated like a full-page scan.
4. **Compress it, and check the line that says it was checked.** When the rewrite is done the finished file is opened again by the same reader on this page and its pages counted. If that disagrees with the original, the run is reported as failed and no download is offered.

## The longer version

[How to make a PDF smaller, and why some will not shrink](https://abox.tools/guides/make-a-pdf-smaller/): Where a PDF's size actually is, why a scan compresses 80% and a contract barely moves, what DPI means here, and what a compressor should never do to your document.

## Also in the box

- [PDF Unlocker](https://abox.tools/unlock-pdf/): Most locked PDFs need no password at all. This one says which kind you have before it touches it.
- [PDF Redactor](https://abox.tools/redact-pdf/): The letters are deleted from the file, and the file is searched afterwards to prove it.
- [PDF to CSV](https://abox.tools/pdf-to-csv/): Finds every table in a PDF and turns it into rows a spreadsheet can open.
- [Images to PDF](https://abox.tools/images-to-pdf/): Put your pictures into one document.

## Questions

### Is my PDF uploaded anywhere?

No. The file is read, recompressed and written by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. This tool has no optional network feature at all.

### How much smaller will my PDF get?

It depends entirely on what is in it, which is why the tool measures and shows you before it compresses anything. A scanned document is almost all photographs and commonly comes out ⁦60–90⁩% smaller. A contract or a thesis is text, vector drawing and embedded fonts, all of which were already compressed by whatever produced them; there the saving is usually a few per cent, from repacking the file and dropping what is no longer referenced. Any tool promising a fixed percentage without looking at your file is guessing.

### Does compressing a PDF lose quality?

The pictures in it are re-encoded, so yes, for those. Nothing else is touched: the text stays text, selectable and searchable, the fonts are kept whole, and the vector drawing is copied across exactly. The tool also refuses to make a picture worse for nothing — if a re-encode does not come out smaller than the original, the original bytes go back into the document untouched.

### What is DPI here, and why does it ask?

A PDF records how large each picture is drawn on the page, so the tool can work out its effective resolution: a 4000-pixel scan placed across eight inches of paper is carrying 500 pixels to the inch. Nothing on a screen and very little on paper can use that, so the pixels above the setting you choose are thrown away first — they cost quality nobody can see. That measurement is why a logo placed small is not treated the same as a full-page scan.

### Can it open a password-protected PDF?

No, and that is deliberate. An encrypted document is refused with a message saying so, even when the password is blank — which is how a lot of scanners and copiers save. Taking the protection off a file is a different job from compressing it, and a tool that did it silently would be doing something you did not ask for.

### Are there PDFs it cannot compress?

Some images inside them, yes. JPEG 2000, JBIG2 and fax-coded (CCITT) images have no decoder in any browser, so they are passed through untouched and reported as such — the last two are bilevel codecs and are usually near their smallest anyway. CMYK images are left alone too, because re-encoding them risks shifting the colours a printer would produce. Everything the tool skips is named on the results, with the reason.

### Will the compressed file still open everywhere?

Yes. The output is written as PDF 1.5, which every reader shipped since 2003 understands, and the tool proves the point on your own machine: it opens the finished file again and counts its pages before offering it to you. Forms, links, bookmarks, the accessibility structure and any embedded attachments are carried across; what is left behind is the material nothing in the document referred to any more.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no file size limit beyond what your own machine's memory allows. The site carries advertising, which is what pays for it; the ads are not given anything about your document.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your document away to be compressed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your document has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. This tool adds nothing to that list: it has no network feature of its own, not even an optional one. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **The whole format is in this repository.** A PDF is a list of objects and a table of where each one starts. `src/objects.js` reads that syntax, `src/reader.js` follows the table, `src/writer.js` writes a new one, and none of the three imports anything that can make a request. No library is fetched and nothing is rendered on a server.
- **Encrypted files are turned away rather than opened.** A PDF with a password on it is refused, including the kind that scanners produce with an empty password and that would technically open. Stripping a document's protection is a different job from making it smaller, and doing it quietly would be a surprising thing for a tool to do on your behalf.
- **It takes things out rather than putting them in.** The finished file carries no creation date, no producer line, and no name for the tool that made it. With the box ticked it also loses the XMP packet and the private blocks that layout applications leave behind — the same argument the EXIF tool makes, applied to a different container.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your document: not a file, not a page, not a name, a size, or a page count. Every line that reads, decodes or writes a PDF is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your document. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your document away to be compressed would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, and `src/reader.js` and `src/writer.js` for the whole of the reading and rewriting, neither of which can reach the network.
