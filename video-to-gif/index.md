# Video to GIF — convert a video to a GIF

Pick the section, the size, and the frame rate.

> Turn part of an MP4, MOV or WebM into an animated GIF. Choose the section, the width and the frame rate; the frames are read and the GIF is written in your browser. Nothing uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/video-to-gif/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

Every frame is read, resized, quantized and written by your own browser, on your own hardware. Nothing here can fetch or send anything — there is no network feature in this tool at all — and there is no server on the other end of this page to send a video to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Any length
- ✓ Works offline

## How to turn a video into a GIF

1. **Choose a video.** Drop an MP4, MOV, M4V or WebM onto the picker, or select one by hand. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Mark the section.** Play the clip and press `I` where it should start and `O` where it should end, or drag the grips on the bar. A GIF is a few seconds long — this is the setting that decides whether the file is small or enormous, far more than the other two.
3. **Choose the width and the frame rate.** 480 pixels wide and 12 frames a second suits most things a GIF is for. Halving the width quarters the pixels; twelve frames a second reads as motion without paying for the ones nobody sees.
4. **Make it, and download.** The frames are read, one palette of 256 colours is chosen for the whole animation, and each frame is written as only the part of the picture that changed. It plays on the page when it is done, which is the same file the download gives you.

## The longer version

[How to turn a video into a GIF](https://abox.tools/guides/turn-a-video-into-a-gif/): Which section, which width and which frame rate to choose, why a GIF of a video is ten times the size of the video, and when to use one at all.

## Also in the box

- [GIF Maker](https://abox.tools/gif-maker/): Turn a set of pictures into one animation.
- [GIF Splitter](https://abox.tools/split-gif/): Every frame out as its own PNG.
- [GIF Analyzer](https://abox.tools/gif-analyzer/): Frames, delays, palettes, and where every byte went.
- [Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.

## Questions

### Is my video uploaded anywhere?

No. It is read, sampled and converted by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the internet and make a GIF anyway if you would rather check than be told.

### Which video formats can I convert?

MP4, M4V and MOV are read directly, whatever is inside them: H.264, HEVC, AV1 or VP9, as long as your browser can decode that codec. Anything else your browser can play — WebM most obviously — is read by seeking the player to each instant instead, which is slower and slightly less exact about which frame lands where. A file the browser can neither read nor play, which in practice means AVI, WMV, FLV and most MKVs, is refused with a message saying so rather than failing halfway through.

### Why is my GIF so big?

Because GIF is a format from 1987 that stores whole pictures rather than motion. There is no way to make one of a five-second clip that is as small as the five-second MP4 it came from — a GIF of a video is routinely ten times the size of the video. The three settings that actually decide it are, in order: how long the section is, how wide the picture is, and how many frames a second. Halving the width quarters the pixels, and it is pixels that cost.

### Why only 256 colours?

That is the format: a GIF carries one table of at most 256 colours and stores each pixel as a number into it. This tool chooses those 256 by counting the colours in every frame of your section and splitting them into 256 groups — median cut, the standard method — so the palette fits your clip rather than being a fixed set of colours. Where a colour is missing, dithering mixes the two nearest ones so a gradient stays a gradient instead of becoming stripes.

### What does the dithering setting do?

It trades a little noise for a lot of banding. With it on, a sky that would otherwise become four flat bands stays a gradient, at the cost of a faint texture and a larger file. With it off the picture is flatter and the file smaller, which suits screen recordings, line art and anything already made of flat colour. The dither used here is ordered rather than the error-diffusion kind, so an unchanged background stays perfectly still between frames instead of shimmering.

### Is there a limit on the length or the size?

The section is what is limited, and by memory rather than by a rule: every frame of it is held at once while the palette is chosen, so the page works out what your settings would cost and says so before you start. It refuses rather than letting the tab run out of memory and vanish. A shorter section, a smaller width or a lower frame rate all bring it down.

### Does it keep the sound?

A GIF cannot carry sound. There is no version of the format that has audio, which is the main reason the web mostly replaced GIFs with silent looping video. If the sound matters, keep the video — the [Video Cutter](https://abox.tools/trim-video/) will cut a section out of it without re-encoding a frame.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your video.

## How the privacy claim is verifiable

- **Your videos have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** This tool has no network feature at all: no address to paste, nothing to download, no engine fetched on first use. Every byte that touches your video came from this origin when the page loaded.
- **The decoding is local.** The frames go through WebCodecs in your own browser, or through the same playback engine that would show you the clip anyway. Which one was used is written at the top of the page, because it changes how the frames are chosen and you should be able to see that.
- **The GIF is written here, in code you can read.** The palette, the dithering and the LZW compression are about six hundred lines in this tool's own folder. There is no encoder service, no library fetched at run time, and no place in any of it that a picture could be sent.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size, a length, or the section you marked. Every line that reads, samples, quantizes or encodes is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your video.
- **It works offline.** Disconnect from the network and everything on this page still works. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/frames.js` for the two ways the frames are read out of a video, `src/quantize.js` for the palette, and `src/gif.js` for the file itself, LZW and all. None of them imports anything that can make a request.
