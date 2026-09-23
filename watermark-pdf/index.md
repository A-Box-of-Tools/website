# Watermark PDF — stamp every page with who it is for

A scan that says where it went is a scan that cannot quietly go somewhere else.

> Put a watermark on every page of a PDF in your browser: who it is for, a date, a name, at any angle and opacity, in any language. Nothing is uploaded, the pages themselves are not touched, and the result is checked before you download it.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/watermark-pdf/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your documents are **never uploaded**. There is no server.

The document you choose is opened, stamped and written back out in memory on this machine, by code served from this address. The words on the stamp are drawn by your own browser. Nothing here can make an upload, and there is no server on the other end of this page to receive one.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to put a watermark on a PDF

1. **Choose the PDF.** One document at a time. It is read straight off your disk by the browser and opened here. A document that needs a password is turned away with a link to the unlocker; everything else, scans included, is accepted as it is.
2. **Type the words.** Who the copy is for, and when: "For Acme Bank only · 12 September 2026" is the shape that does the job. Any language, any script — the words are drawn by your own browser, so whatever you can type, the stamp can say.
3. **Set how it sits, and watch the preview.** Size, whether it runs along the page's diagonal or lies flat, whether it appears once in the middle or repeats across the page, how faint it is, its colour, and whether every page gets it or only the first. The preview is a blank page the shape of your first page with the stamp placed exactly where the file will put it.
4. **Stamp it, and read the line that says it was checked.** The picture is added to the document once and each page gains the instruction that draws it. Then the finished file is opened again here, and every page has to come back carrying the stamp with the same page count as the original — or you get no download and a message saying so.

## The longer version

[How to watermark a PDF, and what the stamp is actually for](https://abox.tools/guides/watermark-a-pdf/): Why lenders and landlords ask for a scan to be stamped with their name, what the stamp does and does not prevent, how to do it in your browser without uploading the document, and what to write on it.

## Also in the box

- [PDF Redactor](https://abox.tools/redact-pdf/): The letters are deleted from the file, and the file is searched afterwards to prove it.
- [PDF to CSV](https://abox.tools/pdf-to-csv/): Finds every table in a PDF and turns it into rows a spreadsheet can open.
- [Images to PDF](https://abox.tools/images-to-pdf/): Put your pictures into one document.
- [Document Scanner](https://abox.tools/document-scanner/): Photograph the page. Get back something that looks scanned.

## Questions

### Can a watermark be removed?

Yes, by anybody with a PDF editor, and this page will not tell you otherwise. A watermark is not protection. What it does is make a copy say where it went: a scan stamped "for Acme Bank only" that turns up at a different lender carries the name of the place it leaked from, which is exactly why lenders, landlords and lawyers ask for one. If the document must not be read by the wrong person at all, that is a password, and the [PDF Protector](https://abox.tools/protect-pdf/) on this site puts one on.

### Can the watermark be in Chinese, Arabic or any other language?

Yes, in anything you can type. The words are drawn by your browser with the fonts on your own machine and placed on each page as a picture, so the stamp is not limited to the Latin alphabet the way text in a PDF is without an embedded font. The cost is that the words cannot be selected or searched for afterwards, which for a watermark is the right way round.

### Why can't I see my document in the preview?

Because this site has no PDF renderer, on purpose. Drawing a PDF page faithfully takes a font engine and a full graphics model — an engine the size of a browser's — and carrying one would change what every tool here is. So the preview shows the thing it can show honestly: a blank page the exact size and shape of your first page, with the stamp placed where the file will put it, computed by the same code that writes the file. Open the result in any reader to see the two together.

### Will the document look any different underneath the stamp?

No. The page's own drawing is not read, let alone changed: every instruction, every embedded font and every image is copied through exactly as it arrived, and the stamp is drawn over the top with the opacity you chose. Text stays selectable and searchable, scans stay at their original resolution, and nothing moves. The file grows by the size of one picture, shared by every page, which for a stamp of a few words is a few tens of kilobytes.

### Does it work on scanned documents and on pages that are turned sideways?

Yes to both. A scan is a page with a picture on it, and the stamp goes over the picture like anything else. A page saved sideways — the kind that shows landscape because it carries a rotation — is stamped the way it is shown: diagonal on the screen means diagonal on the screen, not diagonal to the paper the scanner thought it had.

### What happens to a signed document?

Its signature stops being valid, and there is no way round that. A signature covers the exact bytes of the file it was applied to, so any change at all — by any program — invalidates it. This tool writes a new file, notices when the original was signed, and says so on the results. Keep your original: it is still the signed one.

### Can I watermark a PDF that has a password?

Not directly, and not by typing the password here: this page does not ask for one. Take the password off first with the [PDF Unlocker](https://abox.tools/unlock-pdf/), in the same browser, then stamp the unlocked copy here, then put a password back on with the [PDF Protector](https://abox.tools/protect-pdf/) if you want one. A file that only carries restrictions — opens for everybody, refuses to print — is turned away the same way, because stamping it means rewriting it and rewriting it drops the restrictions.

### Are my documents or the words I type uploaded anywhere?

No. The file is read, stamped and written by your own browser on your own hardware, and the words are drawn by it too. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The simplest way to satisfy yourself is to unplug from the network and use the page anyway.

### How do I know every page really got the stamp?

Because the tool checks, on your machine, and shows you the result. When the file has been written it is handed back to the same reader the other PDF tools on this site use, and every page has to come back naming the stamp in its resources and ending with the instruction that draws it, with the same page count as the original. If any page does not, the run is reported as failed and nothing is offered for download.

### Is there a size limit, and does it cost anything?

There is no limit written into the tool. The limit is your own machine: the document is held in memory while it is worked on, so a laptop will take a few hundred megabytes without complaint and will struggle somewhere above that. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your documents.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your document away to be stamped would stop the moment you unplugged.

## How the privacy claim is verifiable

- **The document people watermark is the one they least want to upload.** A passport scan for a landlord. A statement for a mortgage broker. A contract draft that must not leak. The reason to stamp a document with who it is for is that it is about to leave your hands, and every online tool that offers to stamp it asks you to hand it to a stranger's server first — the very thing the stamp is meant to guard against. This page cannot do that. The file is read by your own browser, the words are drawn by your own browser, the stamped copy is written in memory, and the page's `Content-Security-Policy` names every address it may contact — not one of them belongs to this site. Unplug from the network and it keeps working.
- **A watermark says where a copy went. It does not stop a copy being made.** That is the honest size of what this does. "For Acme Bank only, 12 September 2026" across every page means a scan that turns up somewhere else carries the name of the place it leaked from, which is why banks, lawyers and landlords ask for it and why it is worth doing. It is not protection: anybody with a PDF editor can lift a watermark off again, and a page that told you otherwise would be selling something. If the document must not be read by the wrong person at all, put a password on it with the [PDF Protector](https://abox.tools/protect-pdf/) — the carry-on row under the result goes straight there.
- **The stamp is a picture, so it works in any language and any font.** A PDF can only draw text in a font it carries or in the fourteen every reader is assumed to have, and those fourteen are Latin. Rather than embed a font — megabytes, and an engine this site has chosen not to carry — the words are drawn once by your browser, with the fonts on your own machine, in whatever script you type, and placed on each page as a picture with its transparency in a soft mask. It is drawn at a resolution a printer will not notice. What that costs is that the words cannot be selected or searched for afterwards, which for a watermark is the right way round: it is there to be seen, not copied out.
- **The pages themselves are not read, re-rendered or reflowed.** What the tool adds is three small objects to the document — the picture, its mask and an opacity setting — and to each page two tiny drawing instructions, one before everything the page already draws and one after. The page's own content is not decoded, let alone changed: every drawing instruction, every embedded font and every image is written back out exactly as it arrived, so a scan stays at the resolution it was scanned at, text stays selectable and searchable, and nothing moves. The one thing that does change is what a rewrite always changes: older superseded copies of objects left behind by earlier edits are not carried over.
- **The preview is the placement, not a rendering of your document.** This site has no PDF renderer, deliberately, and it does not pretend to. What the preview shows is a blank page the exact size and shape of your first page with the stamp laid on it where the file will put it — computed by the same arithmetic that writes the file, so the two cannot disagree. Your own page's contents are not drawn, because drawing them would take an engine the size of a browser's, and a preview that guessed at them would be worse than none.
- **The finished file is opened again, here, before you are offered it.** Everything above is this tool marking its own homework until that happens. So the bytes that are about to become your download are handed to the same reader every PDF tool on this site uses, and every page has to come back naming the stamp in its resources and ending with the instruction that draws it, with the same number of pages as the original. A file that failed that would be reported as failed, with no download offered.
- **A digital signature cannot survive this, and the page says when there is one.** A signature covers the exact bytes of the file it was applied to, so any rewrite invalidates it — that is what a signature is for. This tool writes a new file, so the copy you get back is unsigned, and it says so on the results when it finds a signature to warn about. Your original is still the signed one.
- **A locked document is sent next door first.** A file that needs a password to open cannot be stamped without opening it, and this page does not ask for passwords. It turns such a file away with a link to the [PDF Unlocker](https://abox.tools/unlock-pdf/), which takes the protection off in the same browser; the unlocked copy comes back here for the stamp, and the [PDF Protector](https://abox.tools/protect-pdf/) puts a password back on afterwards.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your document: not a file, not a page, not a name, a size, a page count, or the words on the stamp. Every line that reads, stamps or writes a PDF is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your documents. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your document away to be stamped would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/stamp.js` for where the stamp goes on a page, `src/render.js` for how the words become a picture, and `src/apply.js` for the three objects that are added to the document and the two that are added to each page. None of them can reach the network, and neither can the reader or the writer beside them.
