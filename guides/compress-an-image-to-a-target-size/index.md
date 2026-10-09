# How to compress an image to an exact file size

Someone has told you a number — 100 KB, 500 KB, 2 MB — and your photo is nowhere near it. This is what that number costs, what to spend it on, and how to tell whether the result is still good enough to send.

[Open the Image Compressor](https://abox.tools/compress-image/): Name the size. It works out the rest.

Last updated 26 August 2026

## The short answer

Open the [Image Compressor](https://abox.tools/compress-image/), drop the photo in, type the number you were given, and press the button. It encodes the picture several times, keeps the best result that fits under your target, and tells you what that cost. For most photographs and most targets, the honest summary is that you will not be able to see the difference.

The rest of this page is for when that does not happen: when the result looks soft, when a PNG barely moves, or when you want to know what the tool is actually doing to your picture before you send it to somebody.

![The target card: a size of 200 kB entered, preset buttons for common limits, a format menu, and a note saying what the tool will try.](https://abox.tools/screens/compress-an-image-to-a-target-size/target.webp)

Say the number you were given. Everything below is the tool working towards it rather than you guessing at a quality slider.

## What a file size limit is really asking for

A JPEG or a WebP does not store your photograph. It stores a description of it, and the quality setting decides how detailed that description is allowed to be. Turn it down and the file gets smaller because the description gets vaguer: fine texture is averaged away, gradients get banded, and edges pick up a faint halo of blocks.

So a size limit is a budget for detail. The useful question is not “can I hit 500 KB” — you can always hit any number — but “how much of the picture do I have to give up to get there, and does it matter for what I am doing with it?”

Two rules of thumb. A photograph of a real scene — faces, foliage, fabric — hides compression well, because the eye has no perfectly flat area to notice damage in. A screenshot, a chart, a logo or anything with large flat colours and hard text edges shows it immediately, and should usually be a PNG or a WebP rather than a JPEG at all.

## Why there is no formula, and what to do about it

There is no way to calculate the quality setting that produces a 500 KB file. The relationship between the two depends entirely on what is in the picture: at the same setting, a photograph of a plain wall might come out at a tenth the size of a photograph of a forest. Any tool that offers you “quality: 60” and hopes is guessing on your behalf.

The only reliable method is to try. Encode the image, look at the size, adjust, encode again. Doing that by hand is tedious, which is why compressors ask for a quality number instead — it moves the tedium to you. Doing it automatically is roughly eight encodes, and eight encodes of a phone photo is a fraction of a second on any machine made this decade, which is why this site's tool asks for the size and does the searching itself.

Every size it reports is a real encoded file, not an estimate. That matters when a form has a hard limit: an estimate that is 2% optimistic is a rejected upload.

## Spend quality before you spend pixels

There are only two ways to make an image file smaller. You can describe the same picture less precisely, which is quality. Or you can describe fewer pixels, which is resizing. They are not equivalent, and the order matters.

Quality goes first, because the first 30% or so of quality reduction is genuinely invisible on a photograph — you are throwing away detail that the format was storing more carefully than any eye can check. Pixels go second, because once quality drops far enough that artefacts are visible, a smaller picture at a decent quality looks better than a full-size picture that has been ruined. Fewer good pixels beat more bad ones.

That is the whole strategy, and it is worth knowing even if you use a different tool: turn the quality down until it starts to look wrong, then make the picture smaller instead of turning it down further.

### When to resize on purpose

Sometimes the pixels were never needed. A 4000-pixel-wide photo displayed in a 600-pixel-wide column on a web page is carrying six times the detail anyone will see. If you know the picture's final home, resize to it first and the size problem often disappears without any quality being spent at all. The [Image Resizer](https://abox.tools/resize-image/) is the tool for that job, and [its own guide](https://abox.tools/guides/resize-an-image/) covers picking a size.

## Choosing a format

Three formats are worth knowing about, and browsers can write all three.

- **JPEG** is for photographs. It is lossy, it is understood by everything ever made, and for a picture of a real scene it is still an excellent choice. It cannot store transparency.
- **WebP** is for the same job, done better: roughly ⁦25–35⁩% smaller than JPEG at a quality you cannot tell apart, and it keeps transparency. Every current browser reads it. A few older desktop applications and some corporate upload forms still do not, which is the only real reason not to use it.
- **PNG** is lossless, which means it is exact and it is large. It is the right answer for screenshots, logos, line art, and anything with sharp edges or flat colour, and the wrong answer for a photograph.

If you have no constraint from whoever asked for the file, WebP will get you to a target with less visible damage than JPEG. If the file is going into something old, or into a system you cannot test, JPEG is the safe answer.

## Why your PNG will not get much smaller

This is the most common surprise, and it is not a bug in whatever tool you are using. PNG is a lossless format: it stores the exact pixels, and it has no quality dial to turn, because turning one would make it a different format. All a PNG compressor can do is pack the same pixels more cleverly, which is usually worth a few per cent.

So if you must have a much smaller file and it must stay a PNG, the only lever left is size — fewer pixels, or fewer colours. If it may stop being a PNG, the question is what is in it:

- **A photograph saved as a PNG.** Very common, usually by accident, and the easiest win on this page: converting it to JPEG or WebP will often make it five to ten times smaller with no visible change.
- **A screenshot or a diagram.** Convert to WebP, which is lossless as well when you ask it to be, and is generally smaller than PNG for the same pixels. Going to JPEG will make text edges fuzzy.
- **A logo with transparency.** WebP keeps the transparency; JPEG will fill it in with a solid colour, which is almost never what you wanted.

## How to tell whether the result is good enough

Looking at a thumbnail proves nothing — everything looks fine at thumbnail size. Two better checks:

**Look at it at full size, at the flattest thing in the frame.** Sky, skin, a painted wall. Compression damage shows up first in smooth gradients, as faint blocks or bands, long before it touches detailed areas.

**Read the measurement, if the tool gives you one.** The compressor here decodes its own result and compares it with the original, and reports SSIM: a number that compares local brightness, contrast and structure rather than counting changed pixels, which is much closer to what an eye objects to. Above roughly 0.98 the two pictures are hard to separate side by side. Below about 0.95, look before you send. It also reports PSNR, the traditional decibel figure, for anyone who prefers it.

Both are computed on your own machine and shown to you, which is the point of having them: it turns “minimal quality loss” from a claim into a number you can check.

![A result row showing the original at 1.4 MB and the compressed copy at 196 kB, with the quality that got there and a link to compare them.](https://abox.tools/screens/compress-an-image-to-a-target-size/results.webp)

What actually came out, beside what went in. The comparison link is how you find out whether the number cost you anything you can see.

## Three things worth knowing before you send the file

**Compressing strips the metadata.** Re-encoding means decoding the picture to pixels and encoding those pixels again, and a canvas full of pixels carries no tags — so the GPS position, the camera model, the timestamps and the rest are simply not written to the new file. Usually that is a bonus. If you wanted the tags gone but the picture untouched, that is a different job: the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) rewrites the container without re-compressing anything, and [its guide](https://abox.tools/guides/remove-exif-and-gps-data/) explains what is in there.

**Never compress the same file twice.** Each lossy encode throws away detail permanently, and encoding an already-compressed picture throws away more — including the artefacts from the first pass, which it faithfully preserves at the cost of real detail. Always go back to the original and compress once.

**Keep the original.** There is no way back from a lossy encode. Whatever you send, keep the file you started with somewhere.

## None of this needs an upload

Every browser has shipped a JPEG, PNG and WebP encoder for years — it is the same code that saves a picture out of a canvas. Compressing an image is one of the jobs that has no technical reason to involve a server at all, which is why the tool here does not have one: the picture is decoded, encoded and measured on your own machine, and there is no address in the page's `Content-Security-Policy` that belongs to this site for it to be sent to.

The simplest way to confirm that, here or anywhere else, is to load the page, disconnect from the internet, and compress something anyway. If it still works, nothing was being uploaded. [Is it safe to upload files to online converters?](https://abox.tools/guides/is-it-safe-to-upload-files/) sets out three more checks like it.
