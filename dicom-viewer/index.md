# DICOM Viewer — open a .dcm scan in your browser

CT, MR, X-ray and ultrasound, with the window, the header and the measurements.

> Open CT, MR, X-ray and ultrasound scans in your browser. Window and level, scroll a whole series, measure in millimetres, read every DICOM tag, and see exactly what in the file identifies the patient. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/dicom-viewer/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your scans are **never uploaded**. There is no server.

The scan is opened and decoded by your own browser: the header, the pixels, the window, the measurements. There is no server on the other end of this page to send protected health information to even if anything here wanted to, and nothing about the file - not the patient's name, not the study, not the filename - is read out to anyone.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to open a DICOM file

1. **Choose the files.** One `.dcm` file, or the whole folder off the disc — a CT or an MR is one file per slice, and dropping all of them at once is what puts the series back together. Files are read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Pick the series.** A study usually holds several: the scout, then each acquisition. Each one is stacked in the order the scanner took it in, worked out from where each slice sits in the patient rather than from the numbering, which is not always in the same direction.
3. **Set the window.** This is the control that makes a scan readable, and the one an image editor does not have. Drag across the picture to widen the window and up or down to move its centre, or pick one of the named windows — lung, bone, brain, soft tissue — on a CT, where the units are the same on every scanner in the world.
4. **Scroll the stack.** The slider under the picture moves through the slices, and the arrow keys do the same thing once you have clicked on the picture. A multi-frame file — an ultrasound loop, an angiogram — plays with the button beside it.
5. **Measure something.** Switch to Measure and drag a line. Where the file says how far apart its pixels are, the answer is in millimetres and takes account of pixels that are not square; where the file does not say, the answer is in pixels and says so rather than inventing a scale.
6. **Read the header.** Every element in the file, with its number, what the standard calls it and what it holds, searchable. Above it, the list of what in this particular file identifies the patient — which is a great deal more than the name.
7. **Take what you need.** The frame on screen as a PNG, with the window you set and nothing burned into it, or the whole header as plain text. Both are built in the page from what is already there.

## The longer version

[How to open a DICOM file, and what is in one](https://abox.tools/guides/open-a-dicom-file/): What is on a hospital disc, why the files have no extension, how to open a .dcm scan in a browser, what window and level actually does, and what a scan carries about the patient besides the picture.

## Also in the box

- [Image to ICO](https://abox.tools/image-to-ico/): One picture in. Every size a browser, Windows or a Mac asks for, out.
- [Image to Data URI](https://abox.tools/image-to-data-uri/): The whole picture as one line of text. Paste it straight into CSS or HTML.
- [SVG to Image](https://abox.tools/svg-to-image/): Name the size. A vector has none of its own to lose.
- [Image to SVG](https://abox.tools/image-to-svg/): One shape, one outline. Point at whatever should not be there.

## Questions

### Is my scan uploaded anywhere?

No. The file is read, decoded and drawn by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the network and it still opens scans. \
\
That is worth more here than on any other page of this site. A DICOM file carries the patient's name, date of birth and hospital number in its header, so uploading one to a viewer means handing a stranger a medical record, not a picture.

### Which DICOM files can it open?

Uncompressed files in any of the three basic transfer syntaxes — implicit and explicit little endian, and the retired big-endian one — plus deflated, RLE Lossless, baseline JPEG, and JPEG Lossless, which is what the majority of CT and MR studies on a hospital disc are compressed with. \
\
It cannot decode JPEG 2000, JPEG-LS, or the MPEG and HEVC syntaxes used for video. Those need codecs that are megabytes of compiled library, and a page that downloaded one on demand would not be a page that works offline. A file in one of them still opens: the whole header is read and shown, and the picture is replaced by a line naming the codec, rather than by a broken-image icon that tells you nothing.

### What is “window and level”, and why do I need it?

A CT slice holds about four thousand distinct values and your screen shows two hundred and fifty-six greys. The window is the choice of which slice of that range gets all of them: everything below it is black, everything above it is white, and what is in between is spread across the greys. \
\
That is why the same file looks like a different scan under two settings, and why lung and bone cannot be seen at once. On a CT the numbers are Hounsfield units, which are defined absolutely — water is 0 and air is −1000 — so the named windows on this page are the same numbers a radiologist uses at a workstation. On an MR or an ultrasound there is no such scale, and the window that opens is the one the file itself asks for.

### Why does it say my measurement is in pixels?

Because that file does not say how big a pixel is. Pixel Spacing (0028,0030) is what carries that, in millimetres, and a great many ultrasound images, scanned documents and secondary captures simply do not have it. \
\
Where it is there, the measurement is in millimetres and each axis is measured with its own spacing, which matters on the images whose pixels are not square. Where it is not, the honest answer is a count of pixels, and this says so rather than picking a scale and presenting the result as a length.

### It opened my folder as several series. Why?

Because that is what is in it. A study is made of series — the scout view, then each acquisition or reconstruction — and every file says which one it belongs to in Series Instance UID (0020,000E). The dropdown is built from that rather than from the folder, which usually has all of them mixed together in one list of names. \
\
Within a series the slices are put in order by where each one sits in the patient, worked out from Image Position and Image Orientation. Instance Number is the obvious key and it is the fallback rather than the first choice: it is assigned by whatever wrote the files and does not have to run in the direction the patient does.

### What does the “what identifies the patient” list mean?

It is every field in your file that names the person the scan is of, or that narrows down who they could be, read off this file on your machine. The list comes from PS3.15 of the DICOM standard — the part that says what has to go before a dataset can be called de-identified. \
\
It is there because the thing people get wrong is not that a scan has a name in it. It is how much else it has: the birth date, the accession number, the referring physician, the institution, the scanner's serial number, and the study UIDs, which are perfect keys back into the archive that made the file. A scan that has had the name blanked out and nothing else is not anonymous. \
\
This tool only shows you. It writes nothing and changes nothing, so it cannot take any of it out.

### Can it anonymise a scan?

No, and it deliberately does not pretend to. This page reads; it has no code that writes a DICOM file. What it does is tell you exactly what is in yours, which is the part that is hard to find out and the part people are wrong about. \
\
A tool that takes the identifiers out is a separate job with a much higher bar — it has to rewrite the file without touching the pixels, replace the UIDs consistently across a whole study, and be right about the private elements some scanners hide a second copy of the name in. It is on the roadmap for this site rather than bolted onto a viewer.

### Can it open a file that has no .dcm extension, or a broken one?

Yes to both. The extension is not looked at: what is checked is the file itself. A dataset written without the usual 128-byte preamble — which is what a scan pulled straight off the network looks like — is read by working out its encoding from its first element, and the page says that is what it did. \
\
A file that ends part-way through is read as far as it goes. Everything before the damage is shown, with a note saying which byte it stopped at. That is the case a viewer is most wanted for, so throwing the whole file away over its last twelve bytes would be the wrong behaviour.

### Is this a diagnostic viewer?

No. It is not a medical device, it has not been through any regulatory assessment, and nothing here should be used to make a clinical decision. Your screen is not calibrated, the browser is not a validated rendering chain, and neither of those can be fixed from inside a web page. \
\
What it is good for is everything else people open a scan for: checking what is on a disc, pulling a slice for a teaching deck or a paper, reading a header, working out why another program refuses the file, and seeing what a scan is carrying about the person it is of.

### Does it change my file?

No. This tool only reads. There is no output file, no re-encode and no button here that writes a DICOM — what you can download is a PNG of the frame on screen and a plain-text copy of the header. Your original is untouched on your disk.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in and no trial. There is no limit on file size or on how many files you open beyond your own machine's memory. The site carries advertising, which is what pays for it; the ads are not given anything about your file.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your scan away to be rendered would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your scan has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were. This used to read `connect-src 'none'`, which was absolute; adding advertising cost that, and saying so is part of the deal.
- **This matters more here than on the other pages.** A DICOM file is not a picture with some metadata on it. It is a medical record with a picture in it: the patient's name, date of birth, hospital number, accession number, the referring doctor, the institution and the scanner's serial number are all fields in the header, and they travel with the file wherever it goes. Uploading one to a website to look at it means handing all of that to whoever runs the website. That is the thing this page exists not to do.
- **The reader is fourteen files in this repository.** Nothing here uses a library fetched from anywhere. `src/dicom.js` walks the file, `src/dictionary.js` knows what the tags are called, `src/pixels.js` turns the bytes back into measurements, `src/rle.js` and `src/jpeg-lossless.js` expand the two compressed forms this page can decode, and `src/window.js` maps what was measured onto the greys of your screen.
- **The identifiers are listed for you, and for nobody else.** The page prints out every field in your file that names or narrows down the person it is of, because that is a question somebody about to share a slice needs answered and no viewer answers it. It is put on the screen in front of you and goes nowhere else: there is no analytics event in this repository that carries any of it, and the page could not send one if there were.
- **It reads. It does not write.** There is no button here that changes your file, and no code that could. What you can take away is a PNG of the frame on screen and a text copy of the header, both built in the page from what is already on it. Your original is untouched on your disk, which is also the honest answer to what happens if you close the tab.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your file: not the pixels, not a thumbnail, not a name, a tag, a patient or a filename. Every line that parses, decodes or draws a scan is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your files. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and every part of this page still works. That is the simplest proof of all: a tool that sent your scan away to be rendered would stop the moment you unplugged.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/dicom.js` for the parser that walks the file, `src/pixels.js` for the pixel decoding, `src/jpeg-lossless.js` for the codec most hospital exports use, and `src/window.js` for the window and level — none of which has a line that could reach the network.
