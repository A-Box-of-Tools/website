# How to open a DICOM file, and what is in one

A hospital disc is a folder of files with no extensions and a viewer written for Windows XP. The files are DICOM, and there is nothing exotic about them: a scan is a header full of fields and a block of pixels. This is how to look at one, what the controls mean, and what else the file is carrying besides the picture.

[Open the DICOM Viewer](https://abox.tools/dicom-viewer/): CT, MR, X-ray and ultrasound, with the window, the header and the measurements.

Last updated 26 August 2026

## The short answer

Open the [DICOM Viewer](https://abox.tools/dicom-viewer/) and drag the whole folder of files onto it. They are read on your own machine, put back into the series they came from, and stacked in the order the scanner took them in. Nothing is uploaded, and nothing is written back to your files.

If you have been given a disc and are wondering which of the files to open: all of them, at once. A CT or an MR is not one file. It is one file per slice, and a chest study is three hundred of them.

## What is on a hospital disc

Usually four things, and only one of them matters.

- **A folder of scans**, often called `DICOM`, `IMAGES` or `ST0001`, holding files named `IM000001`, `I0000001` or a long dotted number. Frequently with no extension at all. These are the scan.
- **A file called `DICOMDIR`**. An index of the rest, written so that a viewer can list the studies on the disc without opening every file. You do not need it.
- **A viewer**, as a Windows executable, an autorun entry, or occasionally a Java applet. It was compiled for whatever was current when the disc was burned, which is why so many of them no longer run.
- **An HTML page or a PDF** with the hospital's logo on it, explaining how to start the viewer.

The scans do not need the viewer. The format is a published standard and the files are readable on their own; the executable on the disc is one program that could read them, not the only one.

## Why the files have no extension

Because DICOM does not need one. Every file carries its own marker: 128 bytes of nothing, then the four letters `DICM`, then a small block of fields describing how the rest of the file is written. A reader checks for those four letters rather than for a name ending in `.dcm`.

Which is also why renaming a file to `.dcm` changes nothing, and why a viewer that insists on the extension is being unnecessarily strict. Files written straight off a hospital network do not even have the 128 bytes and the marker — they are the bare data with nothing in front of it, and a reader has to work out how they are encoded from the first field. That is a normal file, not a broken one.

## Window and level, which is the control that matters

This is the one thing that makes a medical image different from a photograph, and the reason an image editor is no good for looking at one.

A CT slice holds about four thousand distinct values. Your screen shows two hundred and fifty-six greys. Something has to decide which four thousand map onto which two hundred and fifty-six, and that decision is the **window**: everything below it is black, everything above it is white, and the range in between is spread across the greys.

Move the window and the same file looks like a different scan. That is not a rendering artefact, it is the point. Lung and bone are both in the slice and cannot be seen at the same time: a window that shows the texture of inflated lung puts every bone at pure white, and one that shows the trabecular detail in a rib puts the whole lung at pure black.

On a CT the numbers are **Hounsfield units**, and they are defined absolutely rather than per-scanner: water is 0 and air is −1000, by definition, on every CT scanner in the world. That is why a viewer can offer named windows — lung, bone, brain, soft tissue — and have them mean the same thing on your file as on the workstation the scan was read at. The usual ones:

- **Soft tissue** — centre 40, width 400.
- **Lung** — centre −600, width 1500.
- **Bone** — centre 300, width 1500.
- **Brain** — centre 40, width 80. A narrow one, because grey and white matter differ by only a few units.

On an MR there is no such scale. The values depend on the sequence, the coil and the scanner, so there is nothing to name a preset after and the window to start from is whichever one the file itself asks for. Every scan carries a suggestion.

![The viewer: a greyscale scan slice with the window and level controls beside it, presets for common tissue ranges, and the study details in the corners.](https://abox.tools/screens/open-a-dicom-file/viewer.webp)

Window and level are the two controls that matter. A scan holds more shades than a screen can show, and these decide which of them you are looking at.

## Why the slices sometimes scroll the wrong way

A viewer has to decide what order to put the files in, and there are two things in the file it could use.

**Instance Number** is a counter. It is the obvious choice and it is assigned by whatever wrote the files, which does not have to number them in the direction the patient runs. A study reconstructed from the feet up and numbered from the head down scrolls backwards, and a series assembled from two reconstructions can repeat the numbers outright.

**Image Position (Patient)** is where the slice physically is, in millimetres, in a coordinate system fixed to the patient rather than to the scanner. Sorting on that is right whatever the numbering did, and it has a useful side effect: once the slices are in physical order, the gap between them is measurable, so a viewer can tell you the slices are 5 mm apart — and notice when one of them is missing, which the file never says.

## Measuring something

A scan is measured data, so a length on it is a real length — if the file says how far apart its pixels are. That is one field, Pixel Spacing, in millimetres, and it is present on essentially every CT and MR.

It is often missing on ultrasound images, on scanned documents and on screen captures saved as DICOM. Where it is missing there is no honest answer in millimetres, and a viewer that gives one anyway has invented a scale. A count of pixels is the correct answer to a question the file cannot answer.

Watch for pixels that are not square, too, which is normal outside CT. Measuring in pixels and multiplying by one spacing figure is right only where the two agree; each axis has to be measured with its own.

## What a scan carries besides the picture

This is the part people are wrong about, and the reason to be careful with these files.

A DICOM file is not a picture with some metadata attached. It is a medical record with a picture inside it. The header is a list of fields, and on a typical clinical scan it holds:

- the patient's name, hospital number, date of birth and sex;
- the accession number, which is the key to the request in the hospital's system;
- the referring doctor, the performing radiographer, the reporting radiologist;
- the institution, its address, and the department;
- the scanner's manufacturer, model and serial number;
- the date and time of the scan to the second;
- and a set of unique identifiers — study, series, instance — that are perfect keys back into the archive it came from.

Any file you were given carries all of that, and it travels with the file wherever the file goes. Deleting the name is not enough: a birth date, a postcode-sized institution and a scan time identify one person about as well as a name does, and the study UID identifies them exactly to anybody with access to the archive.

Some scanners also keep a second copy of the patient's name in a private field, which is a field whose meaning is published nowhere and which most anonymisers leave alone because they cannot know what is in it.

![A card listing what in the file identifies the patient: the name, the identifier, the date of birth and the study description.](https://abox.tools/screens/open-a-dicom-file/identity.webp)

What a scan carries besides the picture. This is the card that makes the case for not emailing one.

## Do not upload the scan to look at it

The usual way this problem gets solved is a search for “dicom viewer online” and an upload box. What has just happened is that a stranger has a copy of a medical record: the pixels, the name, the birth date, the hospital number, and the key back into the archive.

There is no reason for it. Reading a DICOM file is parsing a header and unpacking some integers, and a browser does that perfectly well, which is why the [viewer here](https://abox.tools/dicom-viewer/) has no network feature at all: no `fetch`, no `XMLHttpRequest`, nothing that could send a file even if something tried. Load the page once, disconnect from the internet, and it keeps opening scans.

[Is it safe to upload files to online converters?](https://abox.tools/guides/is-it-safe-to-upload-files/) sets out how to check that claim on this site or on any other. This is the file type where it is most worth checking.

## What a browser cannot do

Two things, and both are worth being plain about.

**It is not a diagnostic viewer.** Your screen is not calibrated, the browser is not a validated rendering chain, and no web page has been through a regulatory assessment. Reading a scan to make a clinical decision is a job for the workstation it was reported on. Looking at what is on the disc, pulling a slice for a teaching deck, reading a header, or working out why another program refuses the file are all perfectly good reasons to open one in a browser.

**Some compressed scans will not decode.** DICOM allows several compression schemes and browsers implement one of them. Plain files, run-length encoded ones, baseline JPEG and JPEG Lossless — which is what most hospital exports use — all open. JPEG 2000, JPEG-LS and the video formats need codecs that are megabytes of compiled library. Where the picture cannot be decoded the header is still entirely readable, which is usually the half you came for anyway.
