# Image to ICO — favicon, Windows and macOS icon maker

One picture in. Every size a browser, Windows or a Mac asks for, out.

> Convert a PNG, JPEG or SVG into a real multi-size .ico or a macOS .icns in your browser. Favicon, Windows app icon, Mac app icon, plus the Apple and Android files a site needs. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/image-to-ico/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your images are **never uploaded**. There is no server.

The scaling and the icon files themselves are both made in your own browser. The picture is drawn by the canvas your browser already ships with, and each container — the Windows `.ico`, the macOS `.icns` — is assembled from those pixels by a couple of hundred lines in `src/ico.js` and `src/icns.js` that you can read. This tool has no network feature of any kind — nothing to fetch, nothing to send — and there is no server on the other end of this page to send a logo to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to make an .ico file without uploading anything

1. **Choose the picture.** Drop a PNG, JPEG, WebP or SVG onto the picker, or pick several and convert them in one go. Square is easiest, and anything from 256 pixels up has enough detail for every size. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Pick the files you need.** Windows and a browser read `.ico`; a Mac reads `.icns` and will not look at the other one. Tick either, or both if the thing you are making ships on both. A website wants the extra Apple, Android and tile images as well, and that is the third box.
3. **Say what the icon is for.** A website favicon is 16, 32 and 48 pixels; a Windows application wants 256 as well; an application that has to look right on a high-DPI laptop wants the in-between sizes Windows asks for at 125% and 150% scaling. Pick the one that matches the job, or tick the sizes yourself. Every size on the list says what asks for it. The `.icns` has no such choice: Apple names exactly ten slots and all ten go in.
4. **Deal with the shape and the background.** An icon is square and most logos are not. Pad it out and the whole picture is kept with space above and below; crop and the middle is taken; stretch and it is squashed. Transparency is kept as transparency unless you pick a colour to sit behind it.
5. **Look at the 16 pixel one before you download.** That is the size the icon will be seen at most often, and it is where thin strokes and small lettering disappear. Every square in the preview is drawn at its real size from your own file. If the smallest one is a smudge, the fix is a simpler drawing, not a different setting.
6. **Take the files.** One .ico with every size inside it, named `favicon.ico` when that is what you asked for, because that is the address browsers look for. One .icns beside it if you ticked that, ready to go into a Mac application bundle. Tick the website set as well and you also get the Apple, Android and Windows tile images, the manifest, and the block of HTML to paste into your page. Anything more than a single file comes down as one zip.

## The longer version

[How to make a favicon that still reads at sixteen pixels](https://abox.tools/guides/make-a-favicon/): Which sizes a favicon.ico actually needs, which extra files iPhones, Android and a Mac ask for, and why a logo that works on a poster disappears at sixteen pixels.

## Also in the box

- [Image to Data URI](https://abox.tools/image-to-data-uri/): The whole picture as one line of text. Paste it straight into CSS or HTML.
- [SVG to Image](https://abox.tools/svg-to-image/): Name the size. A vector has none of its own to lose.
- [Image to SVG](https://abox.tools/image-to-svg/): One shape, one outline. Point at whatever should not be there.
- [Height Comparison Chart](https://abox.tools/compare-heights/): Type the heights, take the picture. Nothing is sent to draw it.

## Questions

### Is my image uploaded anywhere?

No. The picture is decoded and scaled by your own browser on your own hardware, and the .ico is assembled from those pixels by code served from this page. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site.

### What sizes should a favicon.ico contain?

16, 32 and 48. That is not a preference: 16 is what a browser draws in a tab, 32 is what Windows uses for a desktop shortcut and what several browsers use for a bookmark, and 48 is the size Google reads a site icon at. Anything larger belongs in a PNG beside the .ico rather than inside it — which is what the website set here produces.

### What sizes does a Windows application icon need?

16, 32, 48 and 256, which is what Visual Studio's own default app.ico holds. 16 is the title bar and the small Explorer view, 32 the desktop and the taskbar, 48 Explorer's medium icons, and 256 the Start menu and the extra-large view. On a high-DPI display Windows also asks for 20, 24, 40, 64 and 96, and resamples them from the nearest size it has if they are not there — the "every scale" preset puts them in.

### Why is the file bigger than the picture I started with?

Because an .ico is not one picture, it is several, and the small ones are stored uncompressed so that anything can read them. A 32x32 entry is exactly 4,264 bytes whatever is in it, and a 256x256 uncompressed entry is 264 KB — which is why sizes above 64 are stored as PNG by default. Choosing "PNG for every size" makes the smallest file there is; choosing uncompressed for every size makes the most compatible one.

### What is the difference between the PNG and uncompressed entries?

Only how the pixels are stored inside the .ico. An uncompressed entry is the original Windows arrangement — a bitmap header, the pixels upside down, and a one-bit transparency mask — and every version of Windows ever released can read it. A PNG entry is a whole PNG file tucked inside the icon, which is three to ten times smaller at the large sizes but was only understood from Windows Vista onwards. The default uses each where it wins: uncompressed up to 64 pixels, PNG above.

### Can it make an icon larger than 256 pixels?

No, and nothing can. The format stores each side in a single byte, and 0 is spoken for — it means 256. That is the ceiling, so an .ico containing a 512 pixel image is not a bigger icon, it is a broken one. If you need 512, you need a PNG, which is what the website set includes for Android and for a web app's splash screen.

### Does it keep transparency?

Yes, in both kinds of entry, and it also writes the old one-bit mask beside the alpha channel so that software too old to read the alpha still cuts the icon out instead of drawing a black box. The one file that is deliberately made opaque is the Apple touch icon in the website set: iOS composites that onto its own tile and turns transparency into black, so it is flattened onto your background colour, white by default.

### My logo is a wide wordmark. What happens to it?

Something has to, because an icon is square. Padding keeps the whole thing and makes it small — a wordmark padded into a 16 pixel square is about three pixels tall and unreadable. Cropping to the middle usually works better: take the symbol out of the lockup and use that, the way almost every brand does for its favicon. The preview shows you which one survives before you download anything.

### What is in the website set, and do I need all of it?

Seven PNGs, a web app manifest, a browserconfig.xml and a block of HTML to paste. You need them because an .ico covers browsers and Windows and nothing else: an iPhone home screen reads a 180 pixel PNG by a name of its own, Android and every install prompt read the manifest, and a tile pinned to the Start menu reads the XML. None of those will look inside an .ico. Everything is generated here, on your machine, and the zip has a note in it saying what each file is for.

### Can it make a macOS icon as well?

Yes — tick *macOS icon* and you get an `.icns` beside the `.ico`, or instead of it. It is a different container for the same idea, and neither system will read the other's: Windows wants .ico and a Mac application bundle wants .icns. The sizes are not a choice there, because Apple publishes exactly ten slots — 16, 32, 64, 128, 256, 512 and 1024 pixels, with three of those appearing twice as the Retina version of the size below. All ten go in, drawn from seven renders, which is why an .icns is the larger file.

### How do I use the .icns file?

For an application, it goes in the bundle at `YourApp.app/Contents/Resources/` and is named in `Info.plist` under `CFBundleIconFile`; every Mac packaging tool has a field for it. For anything else, select the file in Finder, press Command-C, then Get Info on the folder or disk image you want to change, click the small icon at the top left and press Command-V.

### Is the .icns the same as what iconutil makes?

The same ten slots with the same four-letter types, and PNG in each one, which is what `iconutil` produces from a `.iconset` folder. One deliberate difference: Apple's tool also writes a `TOC` element, an index of the types and lengths that follow. It is an optimisation rather than part of the format — a reader without one walks the elements end to end and arrives at the same answer — and a wrong index is worse than no index, so it is left out.

### Can I convert several pictures at once?

Yes. Every picture on the list becomes its own .ico with the same settings, and the batch comes down as one zip with a folder per picture — otherwise two of them would both be called favicon.ico and one would overwrite the other. Every output you ticked is made for every picture. Click any row to put that picture in the preview.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on the number or the size of the files either, because there is no server paying for them — the work happens on your own machine. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your logo away to be converted would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your logo has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The scaling is a `drawImage` onto a canvas; each icon is a header written in front of those pixels by `src/ico.js` or `src/icns.js`, in this page.
- **The file is described from its own bytes.** The list of sizes shown beside a finished icon is not the list of sizes you asked for. It is read back out of the file that was just written, by `readIcoDirectory` or `readIcnsElements`, so if a writer ever disagreed with the settings the page would say so rather than you finding out when Windows drew nothing and macOS drew a blank sheet of paper.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your picture. Every line that reads, scales or writes a file is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/ico.js` and `src/icns.js` for the two icon formats — the directory, the entries and the mask in one, Apple's ten named slots in the other — and `src/sizes.js` for where every size on the page comes from.
