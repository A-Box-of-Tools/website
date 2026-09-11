# GIF Maker — images into an animated GIF

Turn a set of pictures into one animation.

> Turn JPG, PNG or WebP images into an animated GIF, free and entirely in your browser. Set the order, the speed and the size. Nothing is uploaded, and it works offline.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/gif-maker/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your images are **never uploaded**. There is no server.

Every frame is drawn, quantized and compressed by your own browser, and the finished GIF is assembled in memory on this machine. There is no server on the other end of this page to send a picture to even if anything here wanted to.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to make a GIF from images

1. **Choose your images.** Drop a folder onto the picker, or select the files by hand. They are read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Put them in the order they should play.** Drag by the handle, or use the arrows. "Sort by name" counts the way you would expect, so `frame_2` lands before `frame_10`.
3. **Set how long each frame is held.** Half a second each is a slideshow; a twentieth is animation. Give every frame the same hold time at once, or set one of them apart to linger.
4. **Pick a size, and how the colours are chosen.** A GIF grows with its area and its frame count and there is no quality slider to bring it back down, so the size is the setting that matters most. 256 colours per frame is the best-looking default; one shared palette is smaller and steadier.
5. **Make the GIF and download it.** It is built on your own hardware, so how long it takes depends on your machine rather than on a queue. The finished animation plays on the page before you save it.

## The longer version

[How to make an animated GIF from images](https://abox.tools/guides/make-a-gif-from-images/): Turn a set of pictures into one animated GIF: how fast a GIF can really play, what the palette setting changes, and the three things that actually make the file smaller.

## Also in the box

- [GIF Splitter](https://abox.tools/split-gif/): Every frame out as its own PNG.
- [GIF Analyzer](https://abox.tools/gif-analyzer/): Frames, delays, palettes, and where every byte went.
- [Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.
- [Video Cutter](https://abox.tools/trim-video/): Mark the parts worth keeping as it plays. Get them back as one video.

## Questions

### Are my images uploaded anywhere?

No. Your images are read, drawn, quantized and compressed by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the network and it still makes GIFs.

### Which image formats can I use?

Any still image format your browser can decode, which in practice means JPG, PNG, WebP, GIF, AVIF and, on Apple devices, HEIC. There is no separate list to keep up to date here, because the decoding is the browser's job rather than ours.

### Why is my GIF so large?

Because a GIF stores every frame as whole pixels. There is no motion compensation, nothing is stored as "the same as last time but shifted", and there is no quality dial: the size is roughly the area times the number of frames, and only three things bring it down. \
\
Make it smaller — halving the size quarters the file. Use fewer frames, or hold each one for longer. Drop to 64 or 32 colours, and turn dithering off, which costs less than it sounds like on flat artwork and a great deal on photographs. If it still will not fit, the honest answer is that the thing you are making is a video, and an MP4 of it will be perhaps a tenth of the size.

### How fast can a GIF play?

Not as fast as the number suggests. The format stores each frame's delay in hundredths of a second, and browsers have clamped anything under two of them to a tenth of a second since the 1990s — a rule written for the spinning globes of the time and never removed. So a delay of 0.01s does not play at 100 frames a second; it plays at 10. This tool will not offer you anything under 0.02s for that reason, and 0.05s (20 frames a second) is about as fast as it is worth asking for.

### What does the palette setting change?

A GIF frame holds at most 256 colours, and something has to choose them. \
\
**Best colours for each frame** picks 256 for every picture separately, which looks sharpest and is the right answer for a set of unrelated photographs. **One palette for the whole GIF** builds a single table from every frame at once. It makes a smaller file, and it stops the flicker you get when the palette lurches between frames of the same scene — so it is what to reach for when the frames are a sequence rather than a collection.

### Can I keep a transparent background?

Yes, if your images have one: switch "Transparency" to "Keep transparent areas". One thing to know before you do. GIF transparency is a single bit — a pixel is either invisible or fully painted, with nothing in between — so anti-aliased edges, soft shadows and anything faded get a hard edge instead. If your animation is going onto a background you know the colour of, flattening it onto that colour will look better.

### Is there a limit on how many images I can use?

There is no limit built into the tool. The practical ceiling is your own machine's memory and your patience with the file that comes out: the pictures are read one at a time, so a hundred frames is fine, but a hundred frames at 640 px is also a very large GIF. See "Why is my GIF so large?" above.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in and no trial. There is no watermark on the output either. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your images away to be processed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your images have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were. This used to read `connect-src 'none'`, which was absolute; adding advertising cost that, and saying so is part of the deal.
- **The encoder is four files in this repository.** A GIF needs a colour quantizer and an LZW compressor, and the browser ships neither — so both are written out here, in `src/quantize.js` and `src/lzw.js`, with the container in `src/gif.js`. Nothing is fetched to make one, and there is no engine downloaded on first use.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your images: not a file, not a thumbnail, not a name, a size, or a count. Every line that reads, decodes, draws or compresses an image is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your images. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and every part of this page still works. That is the simplest proof of all: a tool that sent your pictures away to be turned into a GIF would stop the moment you unplugged.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/quantize.js` for the palette every frame is reduced to, and `src/lzw.js` and `src/gif.js` for the compressor and the file it goes into — none of which has a line that could reach the network.
