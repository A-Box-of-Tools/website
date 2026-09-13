# What's inside a DICOM file?

More than the scan. A DICOM file is a medical record with a picture inside it: your name, birth date and hospital number travel in the same file as the pixels — which matters most at the exact moment you are handed a CD and go looking for a viewer.

Last updated 26 August 2026

## The short answer

A DICOM file — the `.dcm` on the CD a hospital hands you — is not an image format the way JPEG is. It is a medical record format with an image inside. Before the pixels begin, the file carries a header of hundreds of tags, and among them, routinely: the patient's full name, date of birth, sex, and hospital number; the date, time and description of the study; the referring physician; the institution and the scanner, down to its serial number; and a set of unique identifiers that act as keys back into the archive that produced it.

None of that shows when the image is on screen, which is exactly how it gets forgotten. The scan is the record. Handle the file like the document it is, not like the picture it contains.

## Why this file gets uploaded so casually

Here is the trap in practice. A patient is handed a disc or a download after an examination, tries to open it, and finds that nothing on the machine will — DICOM is not a format ordinary software speaks. So they search “open dcm file online”, and most of what they find is an upload box. Moments later a complete identified medical record — name, birth date, hospital numbers, diagnosis-shaped study descriptions and all — is on a server run by whoever ranked well that day.

Notice the shape: it is the ID-photo problem again — a sensitive file, a moment of friction, and a search engine — but with a file that is sensitive in the second degree. A passport leaks who you are; a scan leaks who you are *and what was being looked into*. The general argument about what an upload does has [its own page](https://abox.tools/guides/is-it-safe-to-upload-files/); this is the file for which that argument needs no seasoning at all.

Opening the file locally is the whole cure, and it is what the [DICOM viewer](https://abox.tools/dicom-viewer/) here is for: the scan, a real window/level control, a folder stacked back into its series, measurements in millimetres, and every header tag readable — with nothing leaving your machine. The walkthrough is in [the guide to opening one](https://abox.tools/guides/open-a-dicom-file/).

## “I removed the name” is not de-identification

The next mistake is subtler and better-intentioned: sharing a scan — with a second-opinion service, a researcher, a forum — after deleting the obvious tag. The standard itself is blunt about how insufficient that is. DICOM's own de-identification profile lists the tags that must be dealt with before a dataset may be called de-identified, and it runs to *hundreds* of entries, because identity hides in more places than the name field:

- **Direct identifiers beyond the name** — birth date, patient ID, accession number, the physician and institution names.
- **Keys** — the unique identifiers stamped into every file, which do not say who you are but say exactly *which record you are* to any system that has seen the original.
- **Quasi-identifiers** — study date and time, scanner model and serial, body part, patient age: individually vague, jointly narrow.
- **The pixels themselves** — ultrasound and some other modalities burn the patient's name straight into the image, where no tag editing can reach it. (For an exported picture, that is a job for [pixel-level redaction](https://abox.tools/redact-image/), not a metadata tool.)

This is why the viewer here has a panel that lists exactly what in your file identifies the patient, and how directly — built from the standard's own list. And it is why the viewer only *reads*: it has no code that writes a DICOM file, because “anonymised” is a promise that needs a far higher bar than a viewer clears, and a tool that half-keeps it would be worse than one that never makes it.

## Handling a scan like the record it is

The habits fall out of everything above:

- **Look at it locally.** A viewer that works with the wi-fi off — this one does — has proven where the work happens. The disc's own bundled viewer, if it runs on your machine, is also fine.
- **Share through medical channels when the content is the point.** Sending a study to another hospital is a solved problem with accountable infrastructure behind it; a personal email with a `.zip` of `.dcm` files is a copy of your record in mail servers, indefinitely.
- **If you must share a file, know what is in it first.** Read the header and the identity panel, so whatever you pass on is a decision rather than a surprise — and treat “properly de-identified” as a service your imaging provider owes you on request, not a checkbox you improvise.
- **Remember the disc outlives the errand.** The copy in the downloads folder and the CD in the drawer are complete records too, the same as the ID scan nobody remembers deleting.

None of this says never share a scan — second opinions are what the copies are for. It says: the file is a document about you, so the two questions to keep asking are the ones this whole group of guides keeps arriving at — who is being handed it, and did that handover need to happen at all.
