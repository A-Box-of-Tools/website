# Video Frame Grabber — save a frame from a video

A full-quality still from any point.

> Save any frame of an MP4, MOV or WebM as a full-size PNG or JPEG. Step frame by frame, or take one every few seconds. Runs in your browser: nothing uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/grab-frame/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

The frames are found, decoded and drawn by your own browser, on your own hardware. Nothing here can fetch or send anything — there is no network feature in this tool at all — and there is no server on the other end of this page to send a video to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Full resolution
- ✓ Works offline

## How to grab a frame from a video

1. **Choose a video.** Drop an MP4, MOV, M4V or WebM onto the picker, or select one by hand. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Find the moment.** Play it and stop where you want, or drag the slider — on an MP4 the slider moves one frame per step, so there is no rounding between what you see and what you save. The arrow keys step a frame at a time, and hold `Shift` for ten.
3. **Pick a format.** PNG stores the frame exactly as it decoded, which is what "full quality" means here. JPEG and WebP are smaller and are a second compression on top of the video's own, which is fine for a preview and not for anything that gets edited afterwards.
4. **Grab it, or grab a series.** One frame goes straight to your downloads. "Every N seconds" walks the clip once and takes a still at each mark — useful for contact sheets and thumbnails — and they come out as one ZIP rather than a hundred save prompts.

## The longer version

[How to save a frame from a video as a picture](https://abox.tools/guides/grab-a-frame-from-a-video/): Get a still out of a clip at its real resolution: why a screenshot of a paused player is not the same picture, which format to save it in, and how to land on the exact frame you meant.

## Also in the box

- [Video to GIF](https://abox.tools/video-to-gif/): Pick the section, the size, and the frame rate.
- [GIF Maker](https://abox.tools/gif-maker/): Turn a set of pictures into one animation.
- [GIF Splitter](https://abox.tools/split-gif/): Every frame out as its own PNG.
- [GIF Analyzer](https://abox.tools/gif-analyzer/): Frames, delays, palettes, and where every byte went.

## Questions

### Is my video uploaded anywhere?

No. It is read and decoded by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the internet and grab a frame anyway if you would rather check than be told.

### What does "full quality" actually mean?

Two things. The still is saved at the video's own resolution, not at the size of the preview on the page — a 4K clip gives a ⁦3840 x 2160⁩ picture. And with PNG chosen, the frame is stored exactly as it came out of the decoder, so the file holds the picture the video holds, with no second round of compression on top of it. A screenshot of a player window gives you neither: it is the size of the window, taken after the player has scaled and colour-managed it.

### Which video formats can I take a frame from?

MP4, M4V and MOV are read directly, whatever is inside them: H.264, HEVC, AV1 or VP9, as long as your browser can decode that codec. That is the exact path, where the tool addresses individual frames. Anything else your browser can play — WebM most obviously — is handled by seeking the player and drawing what it shows, which still saves a full-size picture but lands on the frame the player picked rather than the one you asked for. A file the browser can neither read nor play, which in practice means AVI, WMV, FLV and most MKVs, is refused with a message saying so.

### Can I step one frame at a time?

On an MP4, yes, exactly: the tool reads the file's own list of frames, so the arrow keys move between the pictures that are actually in it — including on a clip whose frame rate wanders, where a fixed step of a thirtieth of a second would drift. On the playback path there is no such list, so a step is a nudge of about a frame and the page says so.

### Why is my portrait phone video the right way up here?

Because the rotation was applied on purpose. A phone films in landscape and writes a quarter turn into the file rather than turning the pixels, so the frame a decoder hands over is on its side and every player turns it on the way to your screen. A tool that skips that step saves a plausible picture of the right moment, sideways. This one reads the turn off the track and applies it before anything is drawn.

### Is there a limit on the size or length of the video?

There is no limit built into the tool, and the file is not read into memory all at once — it is walked a few megabytes at a time, which is why a long clip opens as quickly as a short one. The stills you take are held in the page until you download them, so a few hundred 4K PNGs is the practical ceiling rather than the video itself.

### Can I resize or crop the still afterwards?

Not here, but next door. This tool saves the frame as it is; changing its size or its shape is a separate job with its own decisions in it, and the [Image Resizer](https://abox.tools/resize-image/) does both, also without uploading anything. Making the file smaller without changing the picture is the [Image Compressor](https://abox.tools/compress-image/).

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your video.

## How the privacy claim is verifiable

- **Your videos have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** This tool has no network feature at all: no address to paste, nothing to download, no engine fetched on first use. Every byte that touches your video came from this origin when the page loaded.
- **The decoding is local.** The frames go through WebCodecs in your own browser, or through the same playback engine that would show you the clip anyway. The picture is drawn onto a canvas on this machine and handed straight to a download.
- **The file is read a few megabytes at a time.** A video is the one kind of file here that will not reliably fit in memory, so it is never loaded whole. The reader takes a window around whatever frame you asked for — which is also why a two-gigabyte clip opens as quickly as a small one.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size, a length, or the moment you stopped on. Every line that reads, decodes or draws is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your video.
- **It works offline.** Disconnect from the network and everything on this page still works. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/mp4-reader.js` for the reader that finds the frames in an MP4, and `src/frames.js` for the part that decodes the one you asked for. Neither imports anything that can make a request.
