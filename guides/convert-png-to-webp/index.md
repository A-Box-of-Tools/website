# The same picture, a third smaller, with the transparency intact

WebP's lossless mode keeps every pixel a PNG had and still comes out smaller. Its lossy mode takes a photograph to a tenth of the size. Which one you want depends entirely on what is in the picture, and this is how to tell.

[Open the PNG to WebP](https://abox.tools/png-to-webp/): The same picture, often a third off, with the see-through parts intact.

Last updated 17 September 2026

## The short answer

Open the [PNG to WebP converter](https://abox.tools/png-to-webp/), drop the files in, and choose one of two things:

- **Lossless** if the picture has text, flat colour or sharp edges in it — a screenshot, a diagram, a logo, a chart, anything drawn rather than photographed. Every solid pixel stays exactly as it was and the file still gets smaller.
- **Smaller** if it is a photograph. The saving is enormous and nobody can see the difference.

Nothing is uploaded either way. Your browser has written WebP since 2020, so the encoder is already on your machine.

## Why a PNG is so big in the first place

PNG is lossless: it throws nothing away, ever. To do that it looks for repetition — runs of identical pixels, rows that resemble the row above — and describes them compactly.

That works beautifully on the things PNG was designed for. A screenshot is mostly flat panels and repeated text; a logo is a handful of solid colours. Both compress enormously.

It works terribly on a photograph, where almost nothing repeats. Every patch of grass, every bit of sky gradient, every grain of sensor noise is slightly different from its neighbour, and PNG dutifully records all of it. A phone photo saved as a PNG is routinely ten times the size of the JPEG of the same picture — not because PNG is bad, but because you have asked a lossless format to store something nobody needs stored losslessly.

That is the whole reason the choice below has a right answer that depends on the picture.

## Lossless WebP: the straight swap

WebP has a lossless mode, and it is simply a better lossless compressor than PNG — newer, with more tricks. On the kind of picture PNG is good at, it typically takes another fifth to a third off, and it gives up nothing to do it.

This is the mode for anything with text or hard edges. Screenshots for documentation, UI mock-ups, diagrams, line art, logos, charts, pixel art. The result is the same picture, smaller, and there is no case against it except software that cannot read WebP.

It is also the mode where the word “lossless” deserves checking rather than trusting, and the tool checks it: a WebP stores its pixels in one of two chunks, and the converter reads the finished file back to see which one actually came out. If a browser ever stopped honouring the request, the row would say so rather than handing you a lossy file described as lossless. On every current browser it does honour it.

## Lossy WebP: for photographs

The other mode throws away detail you were unlikely to notice, the way JPEG does but considerably better. On a photograph it will commonly take a 2 MB PNG to under 200 KB, and you will not be able to tell which is which side by side.

The quality slider starts at 80, which is WebP's own default and is hard to fault on a photograph. Below about 60 it begins to show.

What this mode is *not* for is the flat-colour case above. Lossy compression works by smoothing, and smoothing is exactly wrong on text and hard edges — you get a faint halo around lettering that looks like a bad scan. If the picture has words in it, use lossless.

## The transparency survives either way

This is the usual worry and the answer is simple: WebP has a real alpha channel exactly as PNG does, so a logo with a see-through background arrives with a see-through background. There is no colour to choose and nothing gets flattened.

It is worth contrasting with the other direction. Converting a picture *to* a JPEG does destroy transparency, because JPEG has no alpha channel at all — there is a whole section about it in [converting WebP to JPG](https://abox.tools/guides/convert-webp-to-jpg/). WebP does not have that problem, which is one of the reasons it is the better target format when you have the choice.

One measured footnote, because the tool's page makes a precise claim and precise claims deserve their asterisks: a pixel that is *partly* transparent can have the colour stored underneath it shift very slightly. That is a property of moving a picture through a browser canvas at all — the canvas stores colour multiplied by transparency and cannot undo the multiplication exactly — rather than anything WebP does. It is invisible, because the pixels whose stored colour moves most are the ones showing least of it. Solid pixels come through bit for bit.

## Will a WebP actually open everywhere?

On the web, yes. Chrome, Edge, Firefox and Safari have all displayed WebP since 2020, so if the destination is a website there is no longer a fallback to arrange. That is the main reason to do this conversion at all: smaller pages, same picture.

Away from the browser it is patchier. Windows and macOS both preview them now, but some older desktop software, a number of upload forms and most e-readers still refuse one. If you are converting for something that will not take a WebP, you want the opposite tool — [WebP to JPG](https://abox.tools/webp-to-jpg/) — and its [guide](https://abox.tools/guides/convert-webp-to-jpg/).

## What does not come along

The pixels survive; the things stored around them do not. Converting through a canvas means any text chunks, ICC colour profile or XMP block in the PNG are left behind.

For most PNGs that is nothing of consequence — they rarely carry camera data, and a screenshot carries none. If you need to know what a file holds, the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) reads and writes it without re-compressing anything.

## Why there is no upload

Both halves of this job are already on your machine. Your browser decodes PNG, obviously, and it has encoded WebP since 2020 — which is the same browser capability that made websites able to serve WebP in the first place.

So a converter that sends your files to a server is running its own copy of software you already have, and holding your pictures while it does. The [tool here](https://abox.tools/png-to-webp/) does the work in the page, which is why it keeps working with the network unplugged — the simplest proof there is that nothing left. There is a general version of this argument in [is it safe to upload files](https://abox.tools/guides/is-it-safe-to-upload-files/).
