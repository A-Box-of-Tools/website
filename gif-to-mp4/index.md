# GIF to MP4 — the same animation at a tenth of the size

Every frame, with the delay the GIF gave it, as H.264 in an MP4. Converted on your machine; the file never goes up.

> Turn an animated GIF into an MP4 in your browser, at a fraction of the size. Every frame keeps the GIF's own timing; nothing is resampled. H.264 in an MP4, the file every platform takes. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/gif-to-mp4/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your GIFs are **never uploaded**. There is no server.

The GIF you choose is decoded, drawn frame by frame, encoded and written into an MP4 in memory on this machine, by your own browser's encoder and code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to convert a GIF to MP4

1. **Choose the GIF.** One at a time. It is read straight off your disk by the browser, and the page says what it is: how big, how many frames, how long it plays, and its size in pixels.
2. **Read what will be written.** One line: the size, the frames and their timing, the length, and the bitrate. There is nothing to set unless the GIF has transparent places, in which case a colour field appears for what goes there.
3. **Convert it, and read the line that says it was checked.** Every frame is drawn and encoded, with a bar that says where it is. Then the finished file is opened again here and has to play for as long as the GIF does with every frame present. It plays from memory under the download, looping, so you can see the join.

## The longer version

[How to convert a GIF to MP4, and why it gets so much smaller](https://abox.tools/guides/convert-a-gif-to-mp4/): Why an MP4 of the same animation is a tenth of the size of the GIF, what a video cannot do that a GIF can, why the frame timing is what most converters get wrong, and how to convert a GIF in your browser without uploading it.

## Also in the box

- [Video to GIF](https://abox.tools/video-to-gif/): Pick the section, the size, and the frame rate.
- [GIF Maker](https://abox.tools/gif-maker/): Turn a set of pictures into one animation.
- [GIF Splitter](https://abox.tools/split-gif/): Every frame out as its own PNG.
- [GIF Analyzer](https://abox.tools/gif-analyzer/): Frames, delays, palettes, and where every byte went.

## Questions

### Why is the MP4 so much smaller?

Because a GIF stores every frame as a picture with at most 256 colours and no memory of the frame before it, and a video codec stores only what changed. H.264 has had thirty years of practice at that. The same animation usually comes out at a tenth of the size, often less, and looks better, because it is no longer limited to 256 colours. A tiny or a very still GIF can come out larger; the page says so when it happens.

### Will the timing be the same?

Yes, frame for frame. A GIF has no frame rate, only a delay on each frame, and the video keeps every delay as it is: each frame of the GIF is one frame of video that lasts exactly as long. Nothing is resampled, doubled or dropped. The one liberty taken is the one every browser takes, playing a delay under two hundredths of a second as ten, so the video plays for as long as the GIF plays in a browser. The finished file is opened again to check both.

### Will it loop?

That is up to whatever plays it. A GIF carries its own instruction to loop; an MP4 carries no such thing, and the player decides. Most feeds and chat apps loop a short video, and the preview on this page loops so you can see the join. A video player on a desktop usually plays it once.

### What happens to the transparent parts?

They get a colour, because a video is a solid rectangle. For a GIF that has transparent places the page shows a colour field, white by default because that is what most pages are; for one that has none the field is not shown. The colour is drawn behind the frames before they are encoded, so it is part of the picture.

### Does it change the size of the picture?

Only by a pixel, and only when it has to. H.264 needs both edges even, so a GIF with an odd width or height gets one line of the background colour added; nothing is resampled. A GIF wider than 3840 pixels is drawn down to that, since that is what encoders can be relied on to take. The page says the size it will write before it starts.

### How long does it take?

A few seconds for an ordinary GIF on a machine with a hardware encoder, which is most laptops and every recent phone; longer without one. The GIF is decoded into memory first, and a very long one can be more than the page is willing to hold — it stops at half a gigabyte of frames and says so. The bar says which frame it is on, and cancelling stops it at once and writes nothing.

### Are my GIFs uploaded anywhere?

No. The GIF is read, decoded, encoded and written by your own browser on your own hardware, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The simplest way to satisfy yourself is to unplug from the network and use the page anyway.

### Does it work on a phone?

On a phone whose browser can encode video, yes, and a phone's own hardware encoder is quick. What a phone lacks is memory: the GIF's frames are decoded into memory first, so a very long one may be more than a phone can hold.

### Is there a size limit, and does it cost anything?

The page stops reading a GIF at half a gigabyte of decoded frames, which is a great many frames, and says so. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your GIFs.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your GIF away to be converted would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Why an MP4 is a tenth of the size, and why every platform prefers it.** A GIF stores each frame as a picture, with at most 256 colours and no idea what the frame before it looked like. A video codec stores what changed, at full colour, and H.264 has thirty years of practice at it; the same animation comes out at a tenth of the size, often less, and looks better. That is why every social platform, chat app and content system either refuses a large GIF or quietly turns it into an MP4 on upload — and why, when something says “GIF too big”, the MP4 is what it wanted all along.
- **The upload is the slow part, and it is the part that does not happen.** Every online converter asks for the file first: the 30 MB goes up on your connection so that 3 MB can come back, before any question of who keeps the file. This page reads the GIF with code served from this address and writes the MP4 with the encoder already inside your browser, so the only bytes that move are from your disk to your memory and back. The page's `Content-Security-Policy` names every address it may contact — not one of them belongs to this site — and it works with the network unplugged.
- **The timing is kept frame for frame, which most converters get wrong.** A GIF has no frame rate. Each frame says how long it stays, and the delays vary: a slideshow holds a picture for two seconds and then flicks through ten. A converter that picks a frame rate and resamples on to it doubles some frames and drops others, and the slideshow comes out jerky or short. Here each frame of the GIF is one frame of video whose duration is exactly its delay — the one liberty taken is the one every browser takes, playing a delay under two hundredths of a second as ten — and the finished file is opened again to count that every frame is there and that it plays for as long as the GIF does.
- **Two things a video cannot do that a GIF can, said up front.** A GIF can let what is under it show through; a video is a solid rectangle. Where the GIF is transparent, a colour has to go, and the page asks which — only for a GIF that has such places, with white as the default because that is what most pages are. And a GIF carries its own instruction to loop; an MP4 does not, and whether the video loops is up to whatever plays it. Most feeds and chat apps loop a short one. The preview here loops so you can see the join.
- **What it costs on your machine, honestly.** Encoding takes as long as your machine takes: with a hardware encoder — most laptops and every phone made in the last decade — a few seconds for an ordinary GIF; without one, longer. Every frame of the GIF is decoded into memory first, which is where the limit is: a GIF is a few megabytes that expand to one byte per pixel per frame, and the page stops reading at half a gigabyte of that and says so rather than crashing the tab. Cancel is always live.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your GIF: not a file, not a frame, not a name, a size or a length. Every line that reads, encodes or writes it is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your GIFs. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your GIF away to be converted would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/plan.js` for how the GIF's delays become the video's timing, `src/encode.js` for the drawing and the encode, and `src/shared/gif-decode.js` for the reader. None of them can reach the network, and neither can the writer beside them.
