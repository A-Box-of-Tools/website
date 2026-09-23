# Image to SVG — trace a logo, a stencil or a silhouette into curves

One shape, one outline. Point at whatever should not be there.

> Trace a black and white image into a real SVG outline, in your browser. Logos, stencils, signatures, line art and silhouettes become curves you can scale to any size. Click to drop anything the trace got wrong. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/image-to-svg/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your pictures are **never uploaded**. There is no server.

The picture is read off your disk by your own browser, turned into one bit per pixel by `src/mask.js`, walked around by `src/contour.js` and fitted with curves by `src/fit.js` — about six hundred lines you can read, with no engine behind them and nothing downloaded to run them. This tool has no network feature of any kind: nothing to fetch, nothing to send, and no server on the other end of this page to send a drawing to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to trace an image into an SVG without uploading it

1. **Choose the picture.** A logo, a stencil, a signature, a stamp, a scanned drawing, a silhouette. Anything with a clear shape in it traces well; a photograph of a room does not, and there is a plain warning further down rather than a surprise at the end. The file is read straight off your disk and nothing is sent anywhere while you do it.
2. **Say what the shape is.** A drawing on paper divides by **light and dark**, and the level is worked out for you. A photograph of one object does not — a dark red figure on dark grey stone is dark on dark, and no brightness separates them. That one wants **the subject**, which learns what the background is from a band round the edge of the picture and keeps whatever is not it.
3. **Look at the red line, not at the settings.** The outline is drawn over the pixels it came from, because that is the only place the question can be settled: an outline is right or wrong relative to those pixels and nothing else. Drag either picture to move both, and roll the wheel to zoom in far enough to see what the line is actually doing.
4. **Click away whatever should not be there.** A speck, a staple, a stamp, a caption, a shadow. A click takes the whole patch of that colour rather than one pixel, so you are pointing at a shape; click it again to put it back. Clicking an enclosed piece of background fills it in instead, which is how a hole that should not be a hole gets closed.
5. **Adjust the smoothing only if it needs it.** *Detail* is how far the line may stray from the pixels while being simplified, and it is worked out per shape unless you say otherwise. *Corner sharpness* decides how far the outline must turn before that turn is kept as a corner rather than rounded away. Most pictures need neither touched.
6. **Take the SVG.** One file, one `<path>`, no fill rule to worry about: the outlines are wound one way and the holes the other, which is what makes a shape with forty holes in it a single element. It opens in Illustrator, Inkscape, Figma, a browser, and a cutting machine.

## The longer version

[How to trace an image into an SVG](https://abox.tools/guides/trace-an-image-into-an-svg/): Turn a logo, a stencil, a signature or a silhouette into a real vector outline in your browser. Which pictures trace well, which never will, and how to fix the parts the tracer gets wrong.

## Also in the box

- [Height Comparison Chart](https://abox.tools/compare-heights/): Type the heights, take the picture. Nothing is sent to draw it.
- [Business Profile Preview](https://abox.tools/business-profile-preview/): Type it, and it becomes the card Google would draw. Nothing is sent to draw it.
- [Image Compressor](https://abox.tools/compress-image/): Name the size. It works out the rest.
- [Image Resizer](https://abox.tools/resize-image/): Say the size. Draw the box. Pick the format.

## Questions

### Is my picture uploaded anywhere?

No. The file is read by your own browser on your own hardware, traced by a few hundred lines of JavaScript served from this origin, and handed back as a download. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### Will this turn my photograph into an SVG?

Not usefully, and the page will say so rather than let you find out after downloading. Tracing turns every patch of similar colour into its own shape, so a photograph comes back as thousands of overlapping blobs and a file many times larger than the JPEG, which opens slowly and does not look like the photograph. What traces well is a picture with a *shape* in it: a logo, a stencil, a signature, line art, a silhouette. For a photograph of one object, *the subject* setting will cut it out as a single silhouette, which is a different and genuinely useful thing.

### What is the difference between the two ways of finding the shape?

What question they ask. **Light and dark** asks whether each pixel is darker than one level, which is exactly right for ink on paper and useless when the subject and the background are equally dark. **The subject** asks what the background is — it learns that from a band round the edge of the picture, measures every pixel against it, and keeps the largest thing that is not it. That works on a photograph of one object on a plain-ish background, and fails on a picture cropped so tightly that the subject runs off three sides, since the edges it learns from are then the subject. You can point at the background yourself instead when that happens.

### Why does the traced shape have holes, or lose thin parts?

Because the picture did, once it became one bit per pixel. Turn on *what the tracer was given* to see it: below about twelve pixels a letter's bowl has already filled in and its stems have already merged, and no amount of tracing recovers a hole that is not there. The fixes are upstream — move the threshold, or start from a larger scan. In *the subject* mode, *close gaps up to* seals small holes and *fill it in solid* closes every hole the background cannot reach from the edge of the picture.

### Can I fix the parts it got wrong?

Yes, and that is most of what the third step is for. Click anything that should not be in the drawing and it goes; click it again and it comes back. A click takes the whole patch of that colour, so one click removes a whole speck or a whole stamp rather than a pixel. Clicking an enclosed piece of background fills it in. Corrections are kept separately from the threshold, so moving the slider afterwards does not throw them away.

### How big will the SVG be?

For a shape, smaller than the picture: a traced silhouette is usually one to five kilobytes, and a logo a few more. The page tells you exactly, beside the download. For a photograph it will be enormous, which is the clearest sign that it is the wrong tool for that file — and the page stops drawing and says so past about a thousand separate shapes.

### Does it trace in colour?

No. This makes one shape in one colour, which is the case that comes out looking like a drawing rather than like a bad photocopy. Colour tracing means quantising to a few colours and tracing each one as its own layer, and the result disappoints most of the people who ask for it. If you need colour, trace the shape here and fill it in your drawing program.

### What can I do with the SVG afterwards?

Scale it to any size without it going soft, recolour it with one attribute, animate it, print it, or send it to a cutting machine or a laser. It is a single `<path>` with no fill rule to get wrong, so Illustrator, Inkscape, Figma, a browser and most CNC software all read it the same way.

### Is there a limit on the size of the picture?

Your machine's, not ours. An A4 page scanned at 300 dpi — about nine megapixels — traces in a fraction of a second. Larger pictures work; they just take longer, and the work happens on your own processor rather than a queue somewhere.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the number or the size of the files either, because there is no server paying for them — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your files.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your picture away to be traced would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your picture has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The whole tool is arithmetic over the pixels of one picture: a threshold, a walk round the edge of what it found, and some curve fitting.
- **There is no engine to download.** Tracing is usually somebody else's program, and on the web that means several megabytes of compiled code arriving before the first click. There is none here. The whole thing is a few hundred lines of ordinary JavaScript served from this origin, which is also why the page works the moment it opens rather than after a wait.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your picture. Every line that reads it, thresholds it or traces it is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/mask.js` for how a picture becomes one bit per pixel, `src/contour.js` for the walk around the edge of the shape, `src/fit.js` for how a staircase becomes curves, and `src/subject.js` for how the background is worked out when there is no light and dark to divide by.
