# Is it safe to upload a photo of your ID?

Upload it to the government form it is meant for — that is what the document is for. The risk lives one step earlier: the converter or compressor you visit because the form said “under 300 KB, JPEG”, and that step is the one that never needs to happen.

Last updated 26 August 2026

## The short answer

Uploading your ID to the office that asked for it is normal and mostly unavoidable: a visa application, a bank's know-your-customer check, an exam registration. That upload is the point of the document, it travels to a party you can name, and there is usually no other way to apply.

The upload worth worrying about is a different one, and it happens one step earlier. The form says the photo must be 35 by 45 millimetres, or under 300 KB, or exactly 200 by 230 pixels — and your scan is none of those things. So, five minutes before a deadline, holding the most sensitive file you own, you search for “resize photo online” and hand your passport to the first result: a site you did not choose ten seconds ago and will never visit again. That is the step this page is about, and it is the step that never needs to happen.

## Why an ID is not like other files

Most files are embarrassing to leak. An identity document is *useful* to leak, which is a different and worse thing. One image carries, in a single rectangle, roughly everything a stranger needs to open an account in your name: full legal name, date and place of birth, document number, expiry date, a photograph of your face, and on many documents a machine-readable strip that repeats all of it in a format built to be parsed. Fraud guides call this a “fullz” when it is sold as a bundle; an ID scan is the bundle, pre-assembled.

It is also unusually hard to walk back. A leaked password is changed in a minute; a leaked card is reissued in a week. A date of birth is yours for life, and replacing a passport number means replacing the passport. That asymmetry is the whole argument for care: the cost of a leak is high and permanent, and the cost of avoiding one, it turns out, is nothing.

One more thing rides along uninvited. A photo taken with a phone carries EXIF metadata — typically the exact GPS coordinates of where it was taken, which for a document photographed on a kitchen table is your home address, appended to the one file that already holds your name and birthday. The general case of that problem has [a guide of its own](https://abox.tools/guides/remove-exif-and-gps-data/).

## The trap is the requirement, not the form

Notice the mechanics of the risky moment. The application form itself is usually the most accountable party in the whole story — a government portal or a regulated bank, with an address and an auditor. What pushes people somewhere worse is the form's *requirements*: a dimension in millimetres, a pixel count, a kilobyte ceiling, and sometimes a kilobyte floor. The document has to be transformed, the form will not do it, and the operating system's own tools do not speak millimetres or kilobytes.

So the detour happens under the worst possible conditions: in a hurry, with no time to evaluate anything, carrying the one file where the stakes are highest. A converter that would be a perfectly reasonable choice for a holiday photo inherits your passport instead. Nobody chooses that deliberately; the deadline chooses it for them.

The general question — what uploading to any converter actually does, and how to tell whether a tool uploads at all — has [a page of its own](https://abox.tools/guides/is-it-safe-to-upload-files/). The short version is that a checkable tool beats a trustworthy one, because with a checkable tool the trust question never comes up. For an ID, that preference stops being a nicety and becomes the whole point.

## Doing the whole job without the document leaving

Everything the requirement asks for can be done by your own browser, on your own machine, with nothing sent anywhere. This site has a tool for each shape the requirement takes:

- **“⁦35 × 45⁩ mm, head 70 to 80% of the frame”** — the [ID Photo Maker](https://abox.tools/id-photo/) holds each country's published rule: print size, head-height band, eye line, background, and the pixel and kilobyte limits its web forms enforce, including the floors. Pick the country and the document; it applies the rule exactly.
- **“a scan, not a photograph”** — the [Document Scanner](https://abox.tools/document-scanner/) finds the page's corners in a phone photo, straightens the perspective and evens the lighting, so a document photographed on a table comes out looking scanned.
- **“under 300 KB”** — the [Image Compressor](https://abox.tools/compress-image/) takes the limit as a number and finds the least compression that gets under it, rather than making you guess with a quality slider.
- **Sharing a copy with less than everything on it** — when a hotel or a landlord wants proof of identity but has no business keeping your document number, the [Image Redactor](https://abox.tools/redact-image/) overwrites the pixels themselves rather than drawing a box over them, and the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) takes out the metadata, location included.

Every one of these keeps working with the wi-fi switched off, which is not a feature so much as the proof: a page that cannot reach the network cannot send a passport anywhere. That test — and three more like it — are written up in [the guide on uploading](https://abox.tools/guides/is-it-safe-to-upload-files/), and they work on any site, this one included.

## For the upload you do have to make

The application itself still ends in an upload, so spend the care where it pays:

- Type the portal's address yourself or follow the link from official paper, rather than searching for it. Application portals are heavily impersonated, and an impersonation is most convincing to somebody in a hurry.
- Send documents through the form, not by email. Email is stored in more places than either sender or receiver can list, indefinitely.
- If a business asks for a full copy, it is fair to ask what for. In many countries you may cross out what a private party does not need — several governments explicitly recommend watermarking or annotating a copy with its purpose and date. The redactor above makes that a two-minute job.
- Keep the working copies off shared machines, and delete the leftovers: the oversized original in the downloads folder outlives the application by years, and it is the copy nobody remembers.

None of this is a reason not to apply for the passport. It is a reason to make the one upload that matters the only one that happens.
