# The file nothing will open, except the thing you are reading this in

A picture saved from a website arrives as `.avif` and your photo viewer refuses it — while the browser displays it without complaint. That gap is the whole story, and it is also why this conversion never needs to leave your machine.

[Open the AVIF to JPG](https://abox.tools/avif-to-jpg/): The format websites save now, in the one everything has always taken.

Last updated 17 September 2026

## The short answer

Open the [AVIF to JPG converter](https://abox.tools/avif-to-jpg/), drop the files in, and press “Convert”. Leave the quality slider at 92. You get JPEGs back, one download button each, or a zip if there are several.

Nothing is uploaded, and there is nothing to download first either. The decoder is already in the browser you are reading this in — which is the part most worth understanding, so it has a section of its own below.

## What AVIF is, and why you have one

AVIF is a still picture stored the way a modern video frame is stored: a single keyframe of **AV1**, the video codec, wrapped in the same box container an MP4 uses. That sounds like an odd way to build an image format and it turns out to work extremely well — AV1 has had far more engineering poured into it than any still-image codec ever got, because video is where the money is.

The result is a format that is dramatically smaller than a JPEG at the same visible quality. Often three to five times smaller. So websites started serving it, and when you save a picture from one, what lands on your disk is whatever the site was serving. You did not choose AVIF.

And then nothing on your computer will open it:

- Windows needs an extension from the Store before Photos will show one;
- a great deal of desktop editing software still refuses it outright;
- upload forms that check extensions have mostly never heard of it;
- printers, e-readers and camera software are years behind.

## Your browser reads it. That is the whole trick

Open the file you cannot open in a browser tab — drag it onto the window — and it displays perfectly. Chrome and Firefox have decoded AVIF since 2021, Safari since 2023.

That is not a curiosity; it is the reason this conversion needs no server. A converter has to do two things: read an AVIF and write a JPEG. Your browser already does both. The [tool here](https://abox.tools/avif-to-jpg/) is that decoder with a save button attached — it opens the file the way the browser already can, draws it, and asks for a JPEG back.

So when a converter asks you to upload an AVIF, it is running its own copy of software you already own, and holding your picture while it does.

## The comparison that explains which converters need a server

AVIF has a near-twin: **HEIC**, the format an iPhone saves in. They are almost the same design — the same box container, a still frame of a video codec inside, HEVC instead of AV1. And the software situation is exactly reversed.

|  | HEIC | AVIF |
| --- | --- | --- |
| Browsers that decode it | Safari only | all of them |
| Browsers that encode it | none | none |
| So a converter must ship | a decoder, about 1.4 MB | nothing at all |

This is why our [HEIC converter](https://abox.tools/heic-to-jpg/) downloads a codec on first use and spends most of its page explaining that, and why this one downloads nothing and says so. Same company, same promise, different honest answer — because the formats genuinely differ.

It also gives you a question to ask of any converter: *does my browser already do this?* If it does, an upload is a choice the site made, not a requirement of the job.

## The JPG will be several times bigger

Expect it, and do not read it as a failure. A picture that is 40 KB as an AVIF can easily be 200 KB as a JPEG of the same visible quality — the example on the tool's own page comes out around five times larger, and the result line tells you so rather than hiding it.

The reason is the same as everywhere else on this subject: AVIF is one of the best still-image codecs in existence and JPEG is one of the oldest. You are trading bytes for compatibility. That is exactly the right trade when the thing at the other end will not take an AVIF, and it is still a trade.

If the size matters afterwards, the [Image Compressor](https://abox.tools/compress-image/) takes a JPEG down to a figure you name, and the tool offers it on the row under your result.

## What a JPEG cannot carry over

Two things, and neither affects most pictures:

**Transparency.** AVIF can have a see-through background and a JPEG cannot, so something has to go underneath. The tool asks which colour and defaults to white, and only asks when a file on your list really has transparency in it. Most AVIFs saved off web pages are photographs with nothing see-through in them, so the question usually never comes up. If you need the transparency kept, convert to PNG or WebP instead with the [Image Compressor](https://abox.tools/compress-image/), which reads AVIF and writes both.

**HDR and deep colour.** AVIF can store ten or twelve bits a channel and describe highlights brighter than an ordinary screen shows. A JPEG is eight bits with no notion of HDR at all, so a picture using any of that arrives flattened to ordinary range. Almost nothing saved from a normal web page uses it, and if yours does not — which is very likely — this costs you nothing.

## Going the other way is a different problem

There is no JPG-to-AVIF tool here, and the reason is worth stating because it is the same fact from the other side: **no browser will write an AVIF**. Ask a browser canvas for one and it quietly hands back a PNG with the wrong label on it.

So any page claiming to make AVIFs in your browser is either mistaken or is sending your picture to a server to be encoded there. Doing it properly without a server means building the encoder, which is real work and sits on [the roadmap](https://abox.tools/roadmap/) rather than being pretended at.

## The metadata does not come along

The picture is decoded and redrawn, so it arrives as pixels and nothing else: EXIF, GPS, colour profiles and XMP are left behind. For a picture saved off a web page there is usually nothing there to begin with.

If you want to see what a file carries before deciding, the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) does that without re-compressing anything, and [does converting a photo remove its metadata](https://abox.tools/guides/does-converting-a-photo-remove-its-metadata/) is the longer answer.
