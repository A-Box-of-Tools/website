# Images to PDF — JPG to PDF converter

Put your pictures into one document.

> Combine JPG, PNG or WebP images into one PDF, free and entirely in your browser. Photos go in without being re-encoded, and nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/images-to-pdf/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your images are **never uploaded**. There is no server.

The document is written in memory on this machine, a page at a time, by code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to turn images into a PDF

1. **Choose your images.** Drop a folder onto the picker, or select the files by hand. They are read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Put the pages in order, and turn any that need it.** One image becomes one page, in the order shown. Drag a tile by its handle to move it, or use the arrows; the rotate buttons turn a page a quarter at a time, which is what a sideways scan usually needs.
3. **Choose a page size.** "Fit the page to each image" makes every page exactly its picture, with nothing cropped and no white bands. The named sizes — A4, Letter, Legal and the rest — place each picture on a fixed page instead, with a margin if you want one.
4. **Create the PDF and download it.** The document is written on your own machine, so how long it takes depends on your hardware rather than on a queue. The finished file is handed straight to your browser's downloads.

## The longer version

[How to combine images into one PDF](https://abox.tools/guides/combine-images-into-a-pdf/): Turn photos or scans into a single PDF: page size, order and rotation, why a JPEG need not lose any quality on the way in, and what a PDF tells the person you send it to.

## Also in the box

- [Document Scanner](https://abox.tools/document-scanner/): Photograph the page. Get back something that looks scanned.
- [Extract Audio from Video](https://abox.tools/extract-audio-from-video/): Drop a video in and take the sound out of it. The picture is never decoded, and nothing is uploaded.
- [Audio Trimmer](https://abox.tools/trim-audio/): Mark the parts worth keeping as it plays. Get them back as one file, cut where you said.
- [Audio Editor](https://abox.tools/edit-audio/): Play it backwards, change the speed, lift a quiet recording — all of it here, on your machine.

## Questions

### Are my images uploaded anywhere?

No. Your images are read and the PDF is written by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unlike some of the other tools here, this one has no optional network feature at all.

### Does converting to PDF lose quality?

Not for a JPEG, on the default setting. PDF can carry JPEG data directly, so a photograph is copied into the document byte for byte: it is never decoded and never compressed again, and the picture in the PDF is the picture in the file. Other formats have to be re-encoded, because PDF has no filter for them — unless you choose the lossless setting, which stores them exactly at the cost of a larger file.

### Which image formats can I use?

Any still image your browser can decode, which in practice means JPG, PNG, WebP, GIF, AVIF and, on Apple devices, HEIC. There is no separate list to keep up to date here, because the decoding is the browser's job rather than ours.

### Can I choose the page size and the order of the pages?

Yes. Pages can be A4, Letter, Legal, A3, A5, Tabloid, a size you type in, or exactly the size of each picture. Drag the tiles to reorder them, sort them by name or date, rotate any of them a quarter turn, and set a margin in millimetres.

### How many images can I put in one PDF?

There is no limit built into the tool. The practical ceiling is your own machine's memory, because the finished document is assembled there before you download it. A few hundred phone photos at full resolution is the first thing to feel it; shrinking the longest side, in the settings, moves that ceiling a long way.

### Does the PDF contain my file names or a timestamp?

No, unless you ask for one. The document information block is left empty except for the name of this tool: no file names, no machine name, no user name, and no creation date unless you tick the box for it. That is deliberate — a PDF is a thing people send to other people.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your images away to be made into a document would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your images have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. This tool adds nothing to that list: it has no network feature of its own, not even an optional one. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **The PDF is written here.** A PDF is a list of objects and a table of where each one starts, and `src/shared/pdf-page-writer.js` writes both. No library is fetched, nothing is rendered on a server, and the finished file is handed straight to a download from memory.
- **The document is told nothing about you.** Most tools stamp a PDF with a timestamp and the name of the program that made it. This one writes a title, an author and a date only if you type them in; the file names of your pictures never appear in the document, and neither does anything about your machine.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your images: not a file, not a thumbnail, not a name, a size, or a count. Every line that reads, decodes or writes a picture is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your images. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your pictures away to be made into a document would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, and `src/shared/pdf-page-writer.js` and `src/document.js` for the whole of the file-writing, which never touches the network.
