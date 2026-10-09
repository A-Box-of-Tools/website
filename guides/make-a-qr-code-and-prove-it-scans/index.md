# How to make a QR code and prove it scans

The expensive QR mistake is not making the code — it is finding out at the venue that the posters scan into a typo. Generating and verifying are two tools here, and running the second before the print run costs one minute and catches almost everything the print run would have shipped.

[Open the QR & Barcode Reader](https://abox.tools/qr-barcode-reader/): Point it at a code, or drop a picture of one. It is read here, and nowhere else.

Last updated 26 August 2026

## The short answer

1. **Make it.** Open the [QR & Barcode Generator](https://abox.tools/qr-barcode/), pick the job — a link, a Wi-Fi network, a contact card — and check the exact string the code will hold, which the page shows rather than hides. Export the SVG for print, the PNG for screens.
2. **Print one.** At the real size, on the real paper, before the run of two hundred.
3. **Prove it.** Photograph the test print with a phone — at an angle, in the venue's light — and drop the photo on the [QR & Barcode Reader](https://abox.tools/qr-barcode-reader/). It shows the decoded payload and, for a link, the host it really reaches. If that matches what you meant, the run is safe.

Both tools run in your browser and send nothing anywhere — which for a Wi-Fi code means the password in it was never typed into someone's website.

![The QR generator with a URL entered, showing the finished code and the facts about it: its version, its error-correction level and how much room is left.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/made.webp)

The code, made.

## What the verification actually catches

- **The typo.** The most common failure is not the code — it is the URL inside it. Reading it back is the only check that tests what is actually encoded rather than what you meant to paste.
- **The size and the distance.** A code scanned across a room needs bigger modules than one on a business card. Photographing the test print from where readers will stand is the honest test; the generator's error-correction levels say out loud what each one costs in density.
- **The colours.** Codes printed light on dark scan, but low-contrast brand palettes often do not. The reader copes with more than most phones — so if *it* struggles with the photo, the lobby's oldest phone has no chance.
- **The crease and the glare.** Reed–Solomon correction means a partly covered code still reads — up to the level you chose. A poster destined for weather deserves the higher level and the slightly denser code it costs.

![The reader, having been given that same picture: it reports the URL the code contains, the symbology, and where in the image it was found.](https://abox.tools/screens/make-a-qr-code-and-prove-it-scans/read.webp)

And the same picture read back by a different tool, which is the only test that catches a code that came out wrong. The reader shows what it found, and does not open it.

## The same reader, for codes that are not yours

Verification is also the safe way to open a QR code somebody else printed. The reader shows the whole address and the host it really reaches *before anything opens*, and it names the tricks that disguise a link — a username in front of the @, a lookalike alphabet, a redirect. A parking meter sticker deserves that inspection; so does a conference lanyard. Nothing is opened on your behalf, and nothing you scan is sent anywhere.

## If you do this every week

Making and checking live on two pages on purpose — each does one job, and each can prove on its own that nothing leaves your machine. But both are open source: MIT-licensed, dependency-free ES modules — the generator's encoder and the reader's Reed–Solomon decoder each with a README that explains it.

If codes ship from your desk weekly, point a coding agent at the [repository](https://github.com/A-Box-of-Tools/website) and ask it for a page that generates and immediately round-trips the rendered code through the decoder — a self-test on every export. The modules were written to be read, and lifting them is what the licence is for.
