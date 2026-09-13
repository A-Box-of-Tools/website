# ID Photo Maker — passport and visa photos to spec

Pick the country. It applies that country's rule, exactly.

> Make a passport or visa photo to your country's published rule: exact mm and DPI, a live head-height and eye-line overlay, a background check, a printable 4x6 sheet, and a file squeezed to the portal's KB limit. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/id-photo/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your photos are **never uploaded**. There is no server.

The cropping, the measuring, the background reading and the printing all run in your own browser, on your own hardware, using the JPEG encoder it already ships with. This tool has no network feature of any kind — nothing to fetch, nothing to send — and there is no server on the other end of this page to send a photograph of your face to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to make a passport photo that is not sent back

1. **Choose the photograph.** A phone picture against a plain wall, in daylight, taken from about a metre and a half away. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Pick the country and the document.** The panel then shows that rule's print size, head-height band, eye line, background colour and upload limits — along with the authority each figure came from and the date it was read. Nothing on that list is guessed at, and anything you were sent that is not on it goes in under “Anywhere else”.
3. **Check the four dots on your face.** Crown, chin, and each pupil — those four points are the whole of what the rule measures. They are placed by measuring the picture itself, and the line under them says which of the four that managed and which it had to work out; drag any that landed wrong, or switch to *I’ll place them* and do all four yourself. Then press *Fit the box* and the crop lands where that country wants it.
4. **Read the four checks, and the background.** Head height, eye line, centring and tilt, each measured from the box as it stands and each saying which way to drag if it is out. The background is read from the top and the sides of the crop and compared with the colour the rule asks for — unevenness, which is what actually gets photos rejected, is measured separately from colour.
5. **Take the three files.** The print, at the exact millimetres with the resolution written into the file so a shop prints it at the right size. The sheet, with as many copies as a ⁦4 × 6⁩ holds and cut marks in the gaps. And the upload, at the pixel size the portal demands and inside the KB band it enforces at both ends.

## The longer version

[How to take a passport photo that is not sent back](https://abox.tools/guides/make-a-passport-photo/): What a passport photo is actually measured on - head height, eye line, background - which country wants which numbers, and how to hit the pixel and KB limits an online form enforces.

## Also in the box

- [Image Stacker](https://abox.tools/stack-images/): Twenty frames into one, without twenty uploads or a RAW converter.
- [Image Redactor](https://abox.tools/redact-image/): What you cover is deleted from the file, not covered up in it.
- [EXIF Viewer & Remover](https://abox.tools/exif-editor/): See what a photo says about you. Then take it out.
- [DICOM Viewer](https://abox.tools/dicom-viewer/): CT, MR, X-ray and ultrasound, with the window, the header and the measurements.

## Questions

### Is my photo uploaded anywhere?

No. The picture is decoded, cropped, measured and written by your own browser on your own hardware, using the JPEG encoder the browser already ships with. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That is worth more here than on most tools: the file is a photograph of your face.

### Which countries are covered?

The specifications transcribed so far are the ICAO standard itself, the United States (passport and the Diversity Visa entry, which have different upload rules), the United Kingdom, the Schengen visa, Germany, Canada, Australia, India (passport, the ⁦35 × 45⁩ mm print, and the SSC/UPSC form photo and signature), China and Japan. Every entry names the authority it came from and the date it was read. Anything else goes in under “Anywhere else”, where every figure is yours to type — and since most of the world issues against the ICAO geometry, that entry starts on it.

### How does it find the crown, the chin and the eyes without a face model?

By using something a general face detector is not allowed to assume and this tool is: every one of these specifications demands the same scene — one person, facing the camera, against a plain evenly-lit wall. So the colour of the wall is read from the border of the picture, everything that is not that colour is the person, and the top of them is the crown, hair included. The pupils are found as the best pair of patches that are darker than their own surroundings, level with each other and either side of the middle of the head — a comparison that is local, so nothing in it depends on what colour a face is. The chin is the one that cannot be found this way, because a jaw against a neck is a soft edge with no colour change across it; it is worked out from the pupils, which sit a little below the middle of a head once the hair on top of it is counted, and then checked against the outline. All of it is arithmetic in `src/detect.js`: no weights, no inference runtime, nothing fetched, and the same arithmetic for every face put through it. That last part is the one that matters, because a shipped detector is wrong unevenly — worse on some faces than on others — and the people whose photographs already get rejected most often are the ones it would let down.

### How much should I trust the dots it places?

Enough to start from, not enough to skip looking at. Each of the four has a photograph it is wrong on: a patterned wall or a bookcase leaves no outline to find a head against, a head cropped at the top has no crown in the picture at all, and spectacles, a heavy fringe or closed eyes can put the pupils on the wrong feature. So the tool says out loud which of the four it measured and which it had to work out, refuses outright on a picture with no plain background in it rather than inventing an answer, and leaves every dot draggable. The crop is taken from where the dots end up, never from where they started. If you would rather place all four yourself, the switch above the picture says *I’ll place them*, and moving any dot by hand flips to that on its own — from that moment they are yours and nothing will move them again.

### What is the head height rule, and why does mine keep failing it?

Every one of these specifications states how much of the frame the head has to fill, measured from the bottom of the chin to the top of the head, hair included — usually 70 to 80 per cent, which for a 45 mm photo is 31.5 to 36 mm. The usual reason it fails is a selfie: an arm's length is about 60 cm, which distorts the face and puts the head too large in the frame. The usual second reason is the crown — it is the top of the hair, not the hairline, and marking the hairline makes every head come out too small.

### Why does the file have to be at least 20 KB, and how can it be padded?

Indian examination portals, the Chinese visa form and the UK passport upload all state a minimum file size as well as a maximum, because a file under it is usually a thumbnail somebody uploaded by mistake. A ⁦200 × 230⁩ photograph is 46,000 pixels, and at the best quality a browser will write it can still land at 15 KB, with no way to make it larger by compressing less. So the tool adds a JPEG comment segment full of spaces. That is part of the JPEG standard, every decoder skips it, and the picture is bit-for-bit the same picture — only the file is longer. The padding says exactly that, in English, inside the file.

### Does it check the background, and can it replace one?

It checks and will not replace. The colour is read from a band across the top of the crop and down each side, above the shoulders, and compared with the rule's colour in CIE Lab rather than in RGB — two greys forty RGB units apart are indistinguishable and forty units of blue is a different colour. Unevenness is measured separately, because a shadow on a white wall is what actually gets photographs rejected, and it is not a colour problem. Replacing a background means cutting a person out of a picture, which is a segmentation model, and a bad one eats hair. Standing a foot further from the wall fixes more of these than any filter would.

### What is the ⁦4 x 6⁩ sheet for?

A booth charges several pounds for six photographs. A photo counter prints a ⁦6 × 4⁩ for pennies and every one of them will do it. So the tool lays as many copies of your photo as the paper holds — eight, for a ⁦35 × 45⁩ on a ⁦6 × 4⁩ — with cut marks in the gaps and nothing printed over a picture. Nothing is scaled to fit: every copy is exactly the size the rule asks for, because a sheet that shrank them by two per cent to fit one more on would be eight photographs that are all the wrong size. Print it at 100 per cent; “fit to page” is what makes a sheet come out wrong.

### Why does the DPI matter if the pixels are the same?

Because a JPEG can say what size it is, and if it does not, whatever prints it guesses. The resolution lives in the JFIF header, and a browser canvas writes that header with the units field set to “this is an aspect ratio, not a resolution”. This tool rewrites those few bytes so the file says 300 dpi, which is what turns ⁦413 × 531⁩ pixels into a ⁦35 × 45⁩ mm photograph rather than an image of no particular size. Nothing is decoded to do it and no quality is spent.

### Can it do the signature file as well?

Yes — the SSC and UPSC forms want one at ⁦140 × 60⁩ pixels and between 10 and 20 KB, and it is on the list as its own specification. The face overlay is switched off for it, since a signature has no eye line, and what is checked instead is that the paper is light, that there is ink on it, and that the crop has not taken in a ruled line or the edge of the page. Reaching 10 KB is the hard part of that rule, not staying under 20.

### Will this guarantee my application is accepted?

No, and no tool honestly can. What it does is apply the published figures exactly and show you every measurement it made, so that the things a form measures automatically — pixel size, file size, format — are right, and the things a human examiner measures — head height, eye line, the background — are in front of you with numbers on them. The rules also change: every specification here says which authority it came from and when it was read, so you can check it against the form in front of you rather than trusting a table.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark printed across your face. There is no limit on how many photographs you make either, because there is no server paying for them. The site carries advertising, which is what pays for it; the ads are not given anything about your photograph.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working — the rulebook is a file served with the page, not a lookup. That is also the simplest way to prove nothing is being uploaded: a tool that sent your photograph away to be cropped would stop the moment you unplugged.

## How the privacy claim is verifiable

- **A photograph of your face never leaves this machine.** That matters more here than on most tools: the file this page handles is a picture of your face, and the thing you are about to do with it names the country whose document you are applying for. The `Content-Security-Policy` names every address this page may contact, and not one of them belongs to this site. There is no endpoint here your photograph could be collected at.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The rulebook is a table in `src/specs.js`, served with the page and cached with it — there is no country list to look up and nothing to check your photo against remotely.
- **The face is found without a face model.** There are no weights to download, no inference runtime and nothing fetched: the crown comes from the outline of your head against the wall behind it, the pupils from the patches of the face that are darker than what surrounds them. Nothing in it reads skin colour, which is the whole reason it is written that way — a model that is wrong is wrong unevenly, worse on some faces than on others. It is a starting position rather than a verdict: the page says which of the four points it could not measure, every dot stays draggable, and switching to *I’ll place them* turns it off entirely.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your photograph, your face, or which country's rule you picked. Every line that reads, crops, measures or writes a file is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/specs.js` for the rulebook — every country's published figures, with the authority and the date each one was read — `src/detect.js` for how the four points are found — an outline and two dark patches, with no model in it anywhere — `src/geometry.js` for the arithmetic that turns those four points into a crop, and `src/jpeg.js` for the two header edits that put the print resolution into the file and bring a too-small upload up to the size a form insists on.
