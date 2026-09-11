# SVG to Image — rasterize a vector to PNG, JPEG or WebP at any size

Name the size. A vector has none of its own to lose.

> Convert an SVG to a PNG, JPEG or WebP at any size, in your browser. Say the width, a multiple, or a box; get @2x and @3x copies as well. Transparency kept, nothing uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/svg-to-image/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your SVG files are **never uploaded**. There is no server.

The drawing is rasterised by the same engine that just put it on your screen. Your file is read off your disk, its root tag is rewritten to the size you asked for by a hundred lines in `src/svg.js` that you can read, and it is drawn onto a canvas your browser already ships. This tool has no network feature of any kind — nothing to fetch, nothing to send — and there is no server on the other end of this page to send a logo to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to convert an SVG to a PNG without uploading it

1. **Choose the SVG.** Drop one onto the picker, or pick a folder of them and convert the lot in one go. The file is read straight off your disk by the browser; nothing is sent anywhere while you do it. Each row says what size the file thinks it is — and says so differently when that size came from its `viewBox`, or was assumed because the file declares none.
2. **Say how big.** A multiple of the file's own size is the quickest answer and the right one for a batch: every drawing is scaled from its own starting point, so a set of icons stays in proportion. Otherwise name a width, a height, the longest side, or a box with both sides given. There is no penalty for a large number here the way there is with a photograph — the drawing is redrawn at that size, not stretched to it.
3. **Add the high-DPI copies if you need them.** A phone and a Retina laptop draw two or three device pixels for every CSS pixel, so a 200 pixel logo needs a 400 or 600 pixel file behind it. Ask for `@2x` and `@3x` and they come out named the way Xcode, Android's tooling and CSS `image-set()` all expect, and each one is exactly twice or three times the first rather than separately rounded.
4. **Pick the format and decide about transparency.** PNG unless you have a reason: it is lossless, it keeps transparency, and flat colour compresses well in it. JPEG has no transparency at all, so a background colour is painted in whether you pick one or not — without it every transparent pixel comes out black. WebP does both and makes a smaller file, at the cost of software old enough not to read it.
5. **Look at the preview before you download.** It is drawn by the same code that writes the file, from your file, on your machine. Two things change when a drawing becomes pixels and both show up here: a hairline that was half a pixel wide goes grey, and any text is drawn in a font this computer has rather than one fetched from the web.
6. **Take the files.** One download per file, or the whole batch as a single zip. Names follow the SVG they came from, with `@2x` and `@3x` on the copies, and two files that would have had the same name are numbered instead of one quietly replacing the other.

## The longer version

[How to convert an SVG to a PNG at the right size](https://abox.tools/guides/convert-an-svg-to-png/): A vector has no pixel size of its own, so the number is yours to choose. Where that number comes from for a screen, an app icon and a printer, and what changes when a drawing becomes pixels.

## Also in the box

- [Image to SVG](https://abox.tools/image-to-svg/): One shape, one outline. Point at whatever should not be there.
- [Height Comparison Chart](https://abox.tools/compare-heights/): Type the heights, take the picture. Nothing is sent to draw it.
- [Business Profile Preview](https://abox.tools/business-profile-preview/): Type it, and it becomes the card Google would draw. Nothing is sent to draw it.
- [Image Compressor](https://abox.tools/compress-image/): Name the size. It works out the rest.

## Questions

### Is my SVG uploaded anywhere?

No. The file is read by your own browser on your own hardware, drawn onto a canvas by the same engine that renders every other picture you see, and handed back as a download. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### What size should I rasterize an SVG at?

Whatever the thing reading it asks for, multiplied by the device pixel ratio of the screen it will be seen on. A logo that occupies 200 CSS pixels needs 400 for a Retina laptop and 600 for a recent phone, which is what the `@2x` and `@3x` copies here are. For an app icon or a store listing, the store names an exact number and that is the number. When nothing has told you, 1024 on the longest side is a useful default: large enough for almost any use and small enough to email.

### Does making it bigger lose quality?

No, and this is the one place where that answer is honestly no. A vector is instructions rather than pixels, so the browser draws the curves again at whatever size is asked for. 4000 pixels from a 24 pixel icon is exactly as sharp as 24 was. What you cannot do is go the other way: once it is a PNG it is pixels like anything else, so rasterize at the size you need rather than resizing the result later.

### My SVG has no width or height. What size do I get?

The `viewBox`, if there is one — its width and height are user units rather than pixels, but they are the only numbers in the file and a browser treats them as the drawing's natural size. If there is no viewBox either, the page says *assumed* beside the row and uses ⁦300 × 150⁩, which is what an `<img>` would have drawn it at. Either way you can name the size you want and the file is drawn at that.

### Why does the text look different in the PNG?

Because the font is not in the SVG. An SVG that draws text names a font and leaves the machine to find it, and a file that pulls one from Google Fonts with an `@import` gets nothing here: an SVG drawn through an `<img>` is not allowed to fetch anything, which is the same rule that stops it phoning home with your file. The fix is the one every designer already knows — convert the text to paths in the drawing program before exporting. Then it is geometry, and it looks the same everywhere.

### Can it convert several files at once?

Yes. Every SVG on the list is rendered with the same settings and the batch comes down as one zip. A multiple — “4× the size the file asks for” — is usually the right setting for a batch, because each drawing is scaled from its own size rather than all of them being forced to the same number of pixels. Click any row to put that one in the preview.

### Is there a size limit?

The browser's, not ours. A canvas gives up somewhere past 16,384 pixels on a side, and Safari on an iPhone or iPad stops at about 16.7 megapixels of area — ⁦4096 × 4096⁩. Above that the page warns you rather than handing back a blank image, which is what a browser does when it has run out: `toBlob` returns nothing at all, with no error to explain itself. Past 100 megapixels the tool refuses, because that is 400 MB of canvas before a byte has been encoded.

### What happens to transparency?

It is kept, in PNG and in WebP. JPEG has no alpha channel at all, so a colour is painted behind the whole picture whether you ask for one or not — without it, everything transparent would come out black, which looks like a bug rather than like JPEG. Picking a background colour with PNG is a perfectly ordinary thing to want too: it flattens the drawing onto that colour rather than leaving a hole.

### Can it read an SVG that contains a script or an external image?

It can read one, and it will draw exactly the parts a browser is willing to draw. An SVG loaded through an `<img>` is in *secure static mode*: scripts do not run, external references are not fetched, and animation does not play — the first frame is what you get. So a file with a remote `<image>` in it comes out with that part missing. That is the browser refusing on your behalf, and it is the reason this page can safely open a file it has never seen.

### What is the difference between this and the Image Resizer?

What the source is. The Image Resizer starts from pixels — a JPEG, a PNG — so making it bigger has to invent detail that was never there. This starts from a drawing, so there is nothing to invent and no upper limit worth worrying about. If what you have is an SVG, this is the one that gets you a sharp result; if what you have is a photograph, that is the one.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the number or the size of the files either, because there is no server paying for them — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your files.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your artwork away to be rendered would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your artwork has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The whole rasteriser is an `<img>` holding a blob of your own file, one `drawImage` onto a canvas, and one `canvas.toBlob`.
- **An SVG is a document, and this is the mode where it cannot act.** An SVG can carry a `<script>`, a remote `<image href="https://…">`, a stylesheet and a webfont. Drawn through an `<img>` it is in what the specification calls *secure static mode*: the script does not run and not one of those addresses is fetched. That is a guarantee of the browser's, not a promise of ours, and it is the reason this page can open a file it has never seen without the file being able to phone home.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your drawing. Every line that reads, sizes or draws a file is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/svg.js` for how a file's own size is read and how its root tag is rewritten, and `src/render.js` for the eight lines that do the rasterising — an <img>, a `drawImage` and a `toBlob`, with nothing in between.
