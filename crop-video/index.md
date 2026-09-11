# Video Cropper — crop a video online

Cut a clip down to the part that matters.

> Crop an MP4, MOV or WebM to any shape - square, 9:16, or an exact pixel box. Runs in your browser: nothing uploaded, the sound is kept, works offline.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/crop-video/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

Every frame is decoded, cropped and encoded by your own browser, on your own hardware. Nothing here can fetch or send anything — there is no network feature in this tool at all — and there is no server on the other end of this page to send a video to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Keeps the sound
- ✓ Works offline

## How to crop a video

1. **Choose a video.** Drop an MP4, MOV, M4V or WebM onto the picker, or select one by hand. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Drag the box over the part you want to keep.** Drag inside it to move it and any corner to resize. Lock it to a shape first — 1:1 for a square post, 9:16 for a phone, 16:9 for a wide frame — or type an exact pixel box into the four fields underneath. Play the clip, or drag the slider under it, to pick the frame you line the box up against.
3. **Choose how much quality to spend.** The picture has to be encoded again, because a cropped frame is a different picture. "Balanced" keeps it close to what the file already spent on that area; "Best quality" spends more. The sound is kept unless you turn it off.
4. **Crop it and download.** The work happens on your own hardware, so how long it takes depends on your machine rather than on a queue. The finished video is handed straight to your browser's downloads.

## The longer version

[How to crop a video to a different shape](https://abox.tools/guides/crop-a-video/): Cut a clip down to a square, a 9:16 portrait, or an exact pixel box. Which ratio each platform wants, why cropping has to re-encode when trimming does not, and what that costs.

## Also in the box

- [Video Reverser](https://abox.tools/reverse-video/): Last frame first, sound and all.
- [Time-Lapse Maker](https://abox.tools/timelapse-video/): An hour of footage, in twenty seconds.
- [Video Frame Grabber](https://abox.tools/grab-frame/): A full-quality still from any point.
- [Video to GIF](https://abox.tools/video-to-gif/): Pick the section, the size, and the frame rate.

## Questions

### Is my video uploaded anywhere?

No. It is read, decoded, cropped and encoded by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the internet and crop a clip anyway if you would rather check than be told.

### Which video formats can I crop?

MP4, M4V and MOV are read directly, whatever is inside them: H.264, HEVC, AV1 or VP9, as long as your browser can decode that codec. Anything else your browser can play — WebM most obviously — is cropped by playing it and recording the result instead, which works but takes as long as the clip is long. A file the browser can neither read nor play, which in practice means AVI, WMV, FLV and most MKVs, is refused with a message saying so rather than failing halfway through.

### Is there a limit on the size or length of the video?

There is no limit built into the tool, and the file is not read into memory all at once — it is walked through a few megabytes at a time. The practical ceiling is the finished video, which is assembled in memory before you download it, and the time your machine takes to encode it.

### Does the sound survive?

On the MP4 path, exactly: the audio is copied across sample by sample without ever being decoded, so it is byte for byte what was in the file. On the recording path it is captured from playback and encoded again, which costs a little quality. Either way there is a checkbox to leave it out entirely.

### Does cropping lose quality?

The picture is encoded again, because a cropped frame is a different picture and there is no way to store it without writing the pixels out afresh. What the tool will not do is spend more than the original did on the same area, since re-encoding above that only makes the file bigger without making it look better.

### Can I trim the length as well?

Not here, but next door. This tool changes the shape of the picture and nothing else: the clip that comes out is exactly as long as the one that went in, with its timing and its sound intact. Trimming is a separate job and is a separate tool — the [Video Cutter](https://abox.tools/trim-video/) marks the parts of a clip worth keeping and saves them as one file, without re-encoding a frame.

### Why do the width and height move in steps of two?

H.264, the codec in an MP4, stores the picture in blocks and has no way to describe a frame with an odd number of pixels on a side. Rather than quietly rounding your crop after you set it, the box only ever offers even numbers in the first place.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your video.

## How the privacy claim is verifiable

- **Your videos have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** This tool has no network feature at all: no address to paste, nothing to download, no engine fetched on first use. Every byte that touches your video came from this origin when the page loaded.
- **The decoding and encoding are local.** The frames go through WebCodecs in your own browser, or through the same playback engine that would show you the clip anyway. The finished file is built in memory on this machine and handed straight to a download.
- **The sound is copied, not listened to.** On the MP4 path the audio samples are moved across without being decoded at all — nothing here ever turns them back into sound, and nothing could pass them anywhere if it did.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size, a length, or the shape you cropped it to. Every line that reads, decodes, crops or encodes is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your video.
- **It works offline.** Disconnect from the network and everything on this page still works. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/mp4-reader.js` for the reader that finds the frames in an MP4, and `src/transcode.js` for the loop that decodes, crops and encodes them. Neither imports anything that can make a request.
