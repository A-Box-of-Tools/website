# Redact PDF — the words come out, not a box over them

The letters are deleted from the file, and the file is searched afterwards to prove it.

> Take words out of a PDF instead of drawing a black rectangle over them. The letters are deleted from the page's own drawing instructions, the finished file is opened again and searched to prove they have gone, and nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/redact-pdf/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your documents are **never uploaded**. There is no server.

The document you choose is opened, read, edited and written back out in memory on this machine, by code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one. Neither the file nor the words you searched for leave the tab.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to redact a PDF so the words are really gone

1. **Choose the PDF.** One document at a time, on purpose: redaction is a job that has to be looked at page by page, and a tool that let you tick words in one file and quietly applied them to another is exactly how the wrong thing gets sent. It is read straight off your disk by the browser.
2. **Say what has to go.** Type the words — a name, an address, a reference — and every place they appear is listed with the line they sit on and a box to tick. The finders beside the box will look for email addresses, card numbers, IBANs, national insurance and social security numbers, and telephone numbers. Those are offered, never ticked for you: a pattern cannot tell a phone number from a reference.
3. **Read the page and pick words off it.** The panel shows the document's text as it is actually stored, in the order a reader would copy it. Click any word to take it out and click it again to keep it. Everything struck through is what will be gone — which makes this the review as well as the selection, and it is worth doing on every page before you press the button.
4. **Take them out, and read the line that says it was checked.** The letters are deleted, the gap they left is held open, a black box is drawn over it if you asked for one, and the same words are taken out of bookmarks, comments, form fields and the document's properties. Then the finished file is opened again here and searched. If a word you removed is still findable in it, you get no download and a message saying so.

## The longer version

[How to redact a PDF so the text is really gone](https://abox.tools/guides/redact-a-pdf/): A black box drawn in a PDF reader usually leaves the words underneath it, and copy-and-paste gets them straight back. What a real redaction removes, the four places a word hides outside the page, and how to check a file before you send it.

## Also in the box

- [PDF to CSV](https://abox.tools/pdf-to-csv/): Finds every table in a PDF and turns it into rows a spreadsheet can open.
- [Images to PDF](https://abox.tools/images-to-pdf/): Put your pictures into one document.
- [Document Scanner](https://abox.tools/document-scanner/): Photograph the page. Get back something that looks scanned.
- [Extract Audio from Video](https://abox.tools/extract-audio-from-video/): Drop a video in and take the sound out of it. The picture is never decoded, and nothing is uploaded.

## Questions

### How is this different from drawing a black box in a PDF reader?

A rectangle drawn in a reader is an annotation: an object with a position, saved beside the page. The text under it is untouched. Anybody who selects that area and presses copy, or opens the file in a different program, or runs any text extractor over it, gets the words back. Some readers offer a "redact" command that does apply the removal properly — and several offer only the drawing. This tool has no rectangle to move aside: the letters are cut out of the page's drawing instructions, and the black box, if you leave it switched on, is drawn afterwards over a gap that is already empty.

### How do I know the words are really gone?

Because the tool checks, on your machine, and shows you the count. When the file has been written it is opened again by the same reader on this page, every page is read, every bookmark, comment, form field and property is collected, and each word you removed is searched for. The results line says how many there were and how many are left. If the answer is not what it should be, the run fails and nothing is offered for download. You can also check it yourself afterwards in any reader: press Ctrl+F and look for the word.

### Does the rest of the page move when a word is removed?

No. Text is drawn by advancing a pen across the page, so deleting five letters would ordinarily pull the rest of the line five letters to the left. The exact width of what was removed is measured from the font's own metrics and put back as a spacing instruction, which moves the pen without drawing anything. Columns stay lined up and totals stay under their headings.

### Can it redact a scanned document?

Not the picture, and it says so rather than pretending. A scan is a photograph of a page: the words are pixels and there is no text to remove. What a scan often does carry is an invisible text layer that the scanner's OCR wrote over the picture so the page can be searched — this tool finds that layer, removes what you choose from it, and tells you on the page that the picture is unchanged. So a search and a copy stop finding the word, and a person looking at the page still reads it. For a picture, the [image redactor](https://abox.tools/redact-image/) overwrites the pixels themselves.

### What about the parts of a document that are not on a page?

They are handled, because they are where a redaction usually leaks. The same words are taken out of bookmarks, comments and sticky notes, what has been typed into form fields, the text a screen reader is given, and the replacement text a reader copies *instead of* the letters on the page — that last one exists so ligatures and hyphenated words copy properly, and it can hold a whole sentence. The document properties and the XMP packet are removed outright. Attachments and anything that runs when the file opens are dropped, because neither can be searched for the words you are removing.

### Are my documents uploaded anywhere?

No. The file is read, edited and written by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. What you type into the search box is compared against text in this tab's memory and goes nowhere either.

### Why can I not drag a box over the page like other tools?

Because drawing a page means a full PDF renderer — fonts, shading, transparency, blend modes — which is a megabyte or more of engine to fetch and run, and this site ships none. That turns out to suit the job: dragging a rectangle selects an *area of paper*, and an area of paper is not the same thing as the text under it, which is how the black-box failure starts. What you get instead is the document's text, in reading order, with every word clickable. It is also the only view that can tell you the thing a picture of the page cannot: whether the words in front of you are text at all.

### Will the finished file open everywhere?

Yes. The output is written as PDF 1.5 or the highest version the file you gave it needed, and 1.5 is understood by every reader shipped since 2003. Nothing on the page is re-encoded: the fonts, pictures and vector drawing come through byte for byte, so what is left of the text stays selectable and searchable exactly as it was.

### Can it open a password-protected PDF?

No, and that is deliberate. An encrypted document is refused with a message saying so, even when the password is blank — which is how a lot of scanners and copiers save. Taking the protection off a file is a different job from taking words out of it, and a tool that did it silently would be doing something you did not ask for.

### Is there a size limit, and does it cost anything?

There is no limit written into the tool. The limit is your own machine: the document is held in memory while it is worked on, so a laptop will take a few hundred megabytes without complaint and will struggle somewhere above that. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your documents.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your document away to be redacted would stop the moment you unplugged.

## How the privacy claim is verifiable

- **A black rectangle is not a redaction, and this does not draw one over anything.** In almost every program that offers to redact a page — a PDF reader, a word processor, a design tool — the rectangle is an object saved beside the text rather than into it. The text is still there, in the same file, in the same place, and selecting the area and pressing copy hands it back. That failure has published court filings, intelligence reports and, in December 2025, blacked-out names in a mass release of Department of Justice documents that were readable within hours. This tool deletes the letters from the instructions that draw the page. There is no rectangle with anything underneath it, because there is nothing underneath.
- **The finished file is opened again and searched, here, before you are offered it.** Every claim above is this tool marking its own homework until that happens. So the bytes that are about to become your download are handed back to the same reader as though a stranger had sent them, every page is read again, every bookmark, comment, form field and document property is collected, and the words you removed are searched for. The count is on the results. If anything survived, the run is reported as failed and there is no download.
- **The words never leave the tab, and neither does the search.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. This tool adds nothing to that list: it has no network feature of its own, not even an optional one. What you type into the search box is a string compared against text in this tab's memory, and there is nowhere for either of them to go.
- **Redaction is the job least survivable as an upload.** What people redact is the reason it must not be uploaded. A witness statement, a medical letter, a bank statement going to a landlord, a contract with one client's name in it going to another. Handing that to a stranger's server to have the private part removed means the private part arrives first, intact, and it is the version they keep. This page has no other half.
- **What is left is copied through untouched.** The only bytes that change on a page are the text-showing instructions the removed letters were part of. Every other instruction, and every font, picture and line the page refers to, is copied exactly as it arrived — nothing is re-rendered, re-encoded or reflowed. The width of what was taken out is measured and put back as a spacing instruction, so the rest of the line stays where the document put it.
- **It cannot take words out of a photograph, and it says which pages those are.** A scanned page is a picture. The words on it are pixels, not text, and nothing here can touch them. If the scan carries the invisible searchable layer a scanner's OCR produces, this tool will remove that layer — which is what a search and a copy would have found — and it says plainly on the page that the picture still shows the words. Covering that picture is a different job; the [image redactor](https://abox.tools/redact-image/) is the tool that overwrites pixels.
- **The document stops saying where it came from.** The properties and the XMP packet go on every run: no producer line, no creation date, no author, no title, and none of the private blocks a layout application leaves behind. A file whose pages have had a name taken out of them and whose properties still read `Smith settlement draft 3.docx` has not been redacted, and that is not something to leave to a checkbox.
- **Encrypted files are turned away rather than opened.** A PDF with a password on it is refused, including the kind that scanners produce with an empty password and that would technically open. Taking a document's protection off is a different job from taking words out of it, and doing it quietly would be a surprising thing for a tool to do on your behalf.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your document: not a file, not a page, not a name, a size, a page count, or a word you searched for. Every line that reads, edits or writes a PDF is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your documents. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your document away to be redacted would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/pdf-text.js` for how every word on a page is found and located, and `src/edit.js` for the deletion itself — what is cut out of the page's instructions and what is put back so the rest of the line does not move. None of them can reach the network, and neither can the reader or the writer beside them.
