# DICOM Viewer

Opens a `.dcm` scan in the browser: the picture with a real window/level
control, a whole folder stacked back into its series, measurements in
millimetres, every tag in the header, and a list of exactly what in the file
identifies the patient. It writes nothing and changes nothing.

Live at [abox.tools/dicom-viewer/](https://abox.tools/dicom-viewer/).

## Why this tool is the sharpest version of the site's promise

Every other page here handles a holiday photograph or an invoice. This one
handles a file that is a person's medical record with a picture inside it. The
header of a scan carries the patient's name, date of birth and hospital number,
the accession number, the referring doctor, the institution, the scanner's
serial number, and a set of UIDs that are perfect keys back into the archive
that produced it. Uploading one to a viewer to look at it hands all of that to
whoever runs the viewer, and most of the browser-based viewers people find have
an upload box.

So the pixels never leave, and the page says what is in the file as well as
where it is not going. That second half is the part no other viewer does: the
"what identifies the patient" panel is built from PS3.15 table E.1-1, the
standard's own list of what has to go before a dataset can be called
de-identified. It exists because the mistake people make is not leaving the name
in — it is taking the name out and thinking that was the job.

The tool reads. It has no code that writes a DICOM file, and the FAQ says so
plainly, because a viewer that offered to anonymise would be making a promise
that needs a much higher bar than a viewer does. The anonymiser is a separate
tool on [the roadmap](../../ROADMAP.md).

## The files

| | |
|---|---|
| `src/reader.js` | a byte cursor that refuses to read past the end, in either byte order |
| `src/dicom.js` | PS3.10's wrapper and PS3.5's dataset: elements, sequences, fragments |
| `src/dictionary.js` | what the tags are called, and what VR they are in a file that did not say |
| `src/uids.js` | transfer syntaxes and SOP classes, and what can be done with each |
| `src/values.js` | bytes to values, and values to something a person can read |
| `src/pixels.js` | Pixel Data back into the numbers the scanner measured |
| `src/rle.js` | RLE Lossless, which is PackBits over byte planes |
| `src/jpeg-lossless.js` | JPEG Lossless, which no browser will decode |
| `src/window.js` | the modality, VOI and presentation transforms, in that order |
| `src/series.js` | a folder of files back into series, each in the patient's own order |
| `src/identity.js` | which tags name a person, and how directly |
| `src/format.js` | numbers as a person would say them |
| `src/report.js` | the whole header as plain text |
| `src/main.js` | the page |

Everything above `main.js` touches no DOM, which is what lets
`tests/js/dicom-*.test.js` build files with a DICOM *writer* and read them back
with this reader.

## The five things worth knowing

### The parser has to read the file before it knows how to read the file

A DICOM dataset's encoding — implicit or explicit VR, little or big endian,
compressed or not — is a value *inside* the file, in the File Meta group. That
group is always Explicit VR Little Endian because it has to be; everything after
it is in whatever it named. `parseFile` reads the wrapper and hands back where
the dataset starts and how to read it, and `parseDataset` does the walking.

The split is also what keeps the parser synchronous. One transfer syntax,
Deflated Explicit VR Little Endian, stores the dataset as a raw DEFLATE stream
that only the browser can inflate and only asynchronously, so `main.js` inflates
between the two calls and nothing in the parser has to be a promise.

### Nothing keeps a view into the file, because a view keeps the file

A parsed dataset holds *copies* of the values under 16 KB and only the offsets
of the ones above it. That is not a micro-optimisation. `Uint8Array.subarray`
returns a view, and a view keeps its entire backing `ArrayBuffer` alive — so a
dataset made of views into a slice is a dataset that holds the whole slice, and
three hundred of them is a study in memory. Copying the few kilobytes worth
showing and remembering where the half-megabyte of pixels sits is what lets
`main.js` drop a slice's bytes the moment it is off screen and read them off the
disk again when it comes back.

### The three transforms go in one order, and doing them in another looks fine

Stored value → modality transform (slope and intercept) → VOI transform (the
window) → presentation transform (MONOCHROME1's inversion). Applying the window
before the rescale produces a picture that is entirely plausible and whose
numbers mean nothing, and it is the commonest bug in a home-made viewer. The CT
presets in `window.js` are in Hounsfield units, which only exist on the far side
of the modality transform: a window of −600/1500 applied to raw stored values on
a scanner that writes an intercept of −1024 is a black rectangle.

`voi()` implements the linear form with the half-unit offsets the standard
actually specifies. They look like a rounding quirk and they are not — without
them every rendering here would sit half a grey level away from every other
viewer's, which nobody notices until they compare two screenshots.

### A stack is ordered by geometry, not by the numbering

Instance Number is the obvious sort key and it is wrong often enough to matter:
it is assigned by whatever wrote the files, is not required to run in the
direction the patient does, and repeats outright in a series assembled from two
reconstructions. `series.js` sorts on the dot product of each slice's Image
Position (Patient) with the normal to its own image plane — which is how far
along the stack it physically sits, in millimetres, in the patient's frame of
reference.

That also gives the slice spacing for free, which the file never states
directly, and it is what lets the page notice that the gaps are not all equal
and say a slice is missing. Instance Number stays as the fallback, because a
radiograph has no meaningful position and a scanned document has none at all.

### JPEG Lossless is here because the browser will not do it

Every browser has a JPEG decoder and none of them will touch this one. What they
implement is the DCT modes, which are lossy and eight bits deep; lossless JPEG
shares the markers and the Huffman coding and nothing else. It is what the
majority of the CT and MR studies on a hospital disc are compressed with, so a
viewer that leans on `createImageBitmap` opens a suspiciously small number of
real files — and would throw away the twelve bits of measurement even where it
worked.

`jpeg-lossless.js` is a predictor and a difference coder in about two hundred
and fifty lines of code. Baseline JPEG *is* left to the browser, because
writing a second DCT decoder to produce a worse picture more slowly would be a
strange way to spend as many again, and the page says out loud that those
pixels came back eight bits deep.

## What it will not open

JPEG 2000 (`.90`/`.91`), JPEG-LS (`.80`/`.81`), and the MPEG and HEVC syntaxes.
Each needs a codec that is megabytes of compiled library, and a page that
fetched one on demand would stop being a page that works offline.

A file in one of them is not refused: the header is read and shown in full and
the picture is replaced by a line naming the codec. That is deliberate. A viewer
that can only say "could not open" about a file whose entire header it can read
is answering a narrower question than the one it was asked.
