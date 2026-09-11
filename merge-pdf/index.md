# Merge PDF — split and reorder pages too

Pages moved around without a round trip to a server.

> Combine PDFs, split one into several, and drag pages into the order you want — all inside your own browser. Nothing is uploaded, there is no account, and the finished file is opened again and counted before it is offered to you.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/merge-pdf/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your documents are **never uploaded**. There is no server.

Every document you choose is opened, taken apart and written back out in memory on this machine, by code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to merge, split or reorder a PDF

1. **Choose your PDFs.** Drop them on the picker or select them by hand, and add more later — each file's pages go on the end of the running order, which is what makes merging two folders apart possible. They are read straight off your disk by the browser.
2. **Put the pages in the order you want.** Drag a page by its handle, or nudge it with the arrows. Turn one that was scanned sideways, take one out, or type `1-3, 8, 12-` in the box to keep, remove or turn a run of them at once. The numbers renumber as you go, so what you see is always what the finished file will be.
3. **Say whether it comes out as one document or several.** One is the usual answer. The rest are ways of cutting: every so many pages, at page numbers you name, one file per page, or back into the files the pages came from. More than one file is handed over as a single ZIP, so it is one save rather than fifty.
4. **Build it, and read the line that says it was checked.** When the documents are written, each one is opened again by the same reader on this page and its pages counted. If that disagrees with what you asked for, the run is reported as failed and no download is offered.

## The longer version

[How to merge, split and reorder PDF pages](https://abox.tools/guides/merge-and-split-pdf-files/): Combine PDFs, cut one into several, and move pages around: what survives the reshuffle, what no tool can carry across, and why none of it needs uploading your documents anywhere.

## Also in the box

- [PDF Compressor](https://abox.tools/compress-pdf/): Shrink a document without sending it anywhere.
- [PDF Unlocker](https://abox.tools/unlock-pdf/): Most locked PDFs need no password at all. This one says which kind you have before it touches it.
- [PDF Redactor](https://abox.tools/redact-pdf/): The letters are deleted from the file, and the file is searched afterwards to prove it.
- [PDF to CSV](https://abox.tools/pdf-to-csv/): Finds every table in a PDF and turns it into rows a spreadsheet can open.

## Questions

### Are my PDFs uploaded anywhere?

No. They are read, copied and written by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. This tool has no optional network feature at all.

### How many files can I merge, and how big can they be?

There is no limit written into the tool. The limit is your own machine: the documents are held in memory while they are worked on, so a laptop will merge a few hundred megabytes without complaint and will struggle somewhere above that. Nothing is charged, throttled, watermarked or queued, because there is nobody on the other end to do any of those things.

### Does merging or splitting lose any quality?

No. Nothing on a page is re-encoded, re-rendered or re-compressed. The content stream of each page and every font, image and vector drawing it refers to is copied across byte for byte, so text stays selectable and searchable and a photograph is the same photograph. The only things that change are the order of the pages and the structure around them.

### What happens to bookmarks and links?

Both are rebuilt rather than dropped. A bookmark whose page is still in the output points at wherever that page has moved to; one whose page you removed is taken out, unless it has surviving entries under it, in which case it stays as a heading. Merging several files puts each file's bookmarks under a heading named after it. Links between pages are followed the same way, including the named destinations that Word and LaTeX write, and a link whose target did not come along is left with nothing behind it rather than sending the reader somewhere wrong. Links to web addresses are kept as they are.

### What is not carried across?

Four things, and the tool says so on the results rather than in the small print. The tagged-reading-order tree that screen readers use, page labels (the "iii, iv, 1, 2" numbering), embedded file attachments, and any action that is neither "go to a page" nor "open a web address" - document JavaScript among them. The first two describe an order that no longer exists once pages have moved; the last is not something you asked to carry into a new file. If a document's tagging matters to you, keep the original as well.

### Do filled-in forms survive?

Yes. Form fields and what has been typed into them come across with their pages, and the new document is registered as a form so readers treat it as one. One thing to know when merging: two fields with the same name are one field as far as any reader is concerned, so if you merge two copies of the same form, filling a box on one page will fill it on the other. The tool notices that case and says so.

### Can it open a password-protected PDF?

No, and that is deliberate. An encrypted document is refused with a message saying so, even when the password is blank — which is how a lot of scanners and copiers save. Taking the protection off a file is a different job from moving its pages, and a tool that did it silently would be doing something you did not ask for.

### Why are there no page previews?

Because drawing a page means a full PDF renderer — fonts, shading, transparency groups, blend modes — which is a megabyte or more of engine to fetch and run for a set of thumbnails. What the tiles show instead is what reordering actually runs on: the page number, the shape and size of the paper, the rotation it will be written with, and which file it came out of. A landscape scan in a stack of portrait ones is still obvious at a glance.

### Will the finished file open everywhere?

Yes. The output is written as PDF 1.5 or the highest version any of the files you gave it needed, and 1.5 is understood by every reader shipped since 2003. The tool also proves the point on your own machine: it opens each finished file again and counts its pages by walking the page tree before offering it to you.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no file size limit beyond what your own machine's memory allows. The site carries advertising, which is what pays for it; the ads are not given anything about your documents.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your documents away to be merged would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your documents have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. This tool adds nothing to that list: it has no network feature of its own, not even an optional one. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **Merging is the job most worth not uploading.** The documents people put together are the ones that came from somewhere: a contract and its signature page, a passport scan and a bank statement, a medical letter and a claim form. An online merger has all of them, in one place, already collated. This one has a page in your browser and no other half.
- **The whole format is in this repository.** A PDF is a list of objects and a table of where each one starts. `src/objects.js` reads that syntax, `src/reader.js` follows the table, `src/assemble.js` copies pages between documents and `src/writer.js` writes the result. None of the four imports anything that can make a request. No library is fetched and nothing is rendered on a server.
- **Encrypted files are turned away rather than opened.** A PDF with a password on it is refused, including the kind that scanners produce with an empty password and that would technically open. Taking a document's protection off is a different job from moving its pages around, and doing it quietly would be a surprising thing for a tool to do on your behalf.
- **The finished file says nothing about where it was made.** No producer line, no creation date, no name for the tool. Nor does it carry the XMP packet or the private blocks a layout application leaves behind — those belong to the document that used to exist, not the one you just built. Anything in the pages themselves is copied exactly: this tool moves pages, it does not rewrite what is on them.
- **Actions that are not "go to a page" are not copied.** A PDF can carry instructions that run when it opens: play this, submit this form to that address, run this JavaScript. Pages that come through this tool keep their links to other pages and to web addresses, and lose the rest. Reordering somebody's pages is no reason to carry their document's scripting into your new file.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your documents: not a file, not a page, not a name, a size, or a page count. Every line that reads, copies or writes a PDF is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your documents. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your documents away to be merged would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, and `src/assemble.js` for the whole of the copying — how a page is lifted out of one document and put in another, and what is deliberately left behind. It cannot reach the network, and neither can the reader or the writer beside it.
