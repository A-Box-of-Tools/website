# Time‑Lapse Maker — speed a long video up

An hour of footage, in twenty seconds.

> Turn a long video into a time-lapse: 10x, 60x or any speed you type. Runs in your browser, so nothing is uploaded, there is no watermark, and it works offline.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/timelapse-video/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

Every frame is chosen, decoded and encoded again by your own browser, on your own hardware. Nothing here can fetch or send anything — there is no network feature in this tool at all — and there is no server on the other end of this page to send a video to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Any speed you type
- ✓ Works offline

## How to make a time-lapse from a video

1. **Choose a video.** Drop an MP4, MOV, M4V or WebM onto the picker, or select one by hand. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Say how much faster.** Press one of the speeds, or type your own. If you would rather say how long the result should be — “make this fit in twenty seconds” — type that instead and the speed follows.
3. **Check the interval.** The line under the speed says what the tool is really about to do: one frame every so many seconds of the original. That is the number a photographer would set on a camera, and it is the one worth sanity-checking before you start.
4. **Make it and download.** The work happens on your own hardware, so how long it takes depends on your machine rather than on a queue. The finished video is handed straight to your browser's downloads.

## The longer version

[How to turn a long video into a timelapse](https://abox.tools/guides/turn-a-long-video-into-a-timelapse/): An hour of footage into a watchable minute: how to choose the speed, why saying the finished length beats doing arithmetic, and when the result should become a GIF.

## Also in the box

- [Video Frame Grabber](https://abox.tools/grab-frame/): A full-quality still from any point.
- [Video to GIF](https://abox.tools/video-to-gif/): Pick the section, the size, and the frame rate.
- [GIF Maker](https://abox.tools/gif-maker/): Turn a set of pictures into one animation.
- [GIF Splitter](https://abox.tools/split-gif/): Every frame out as its own PNG.

## Questions

### Is my video uploaded anywhere?

No. It is read, decoded, sampled and encoded by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the internet and make a time-lapse anyway if you would rather check than be told.

### What does the speed actually mean?

The ratio between what went in and what comes out. At 60× an hour of footage becomes a minute, whatever frame rate you play it back at. Underneath, the tool takes one frame every *speed ÷ frame rate* seconds — 60× at 30 frames a second is one frame every two seconds — and the page shows you that interval before you start, because it is the number that says what is really happening.

### Which video formats can I speed up?

MP4, M4V and MOV are read directly, whatever is inside them: H.264, HEVC, AV1 or VP9, as long as your browser can decode that codec. Anything else your browser can play — WebM most obviously — is read by seeking the browser's own player to each instant instead, which works on every format it plays. A file the browser can neither read nor play, which in practice means AVI, WMV, FLV and most MKVs, is refused with a message saying so rather than failing halfway through. What comes out is always an MP4.

### Why does the time-lapse have no sound?

Because there is nothing worth keeping. Sound played thirty times too fast is not speech or music, it is a chirp; and the alternative — keeping the sound at its original speed under a picture that has raced ahead of it — would be a different clip from the one you asked for. So the track is dropped, which is also most of the reason an hour of video comes out as a few megabytes. If you want the audio on its own, the [Audio Editor](https://abox.tools/edit-audio/) will save it.

### Is it quicker than converting the whole video?

Much, and that is the point of reading the file directly. A frame can only be decoded by starting from the keyframe in front of it, but nothing says the frames in between have to be kept — so a 60× time-lapse of an hour decodes a few thousand frames out of a hundred thousand rather than all of them. The summary says exactly how many it will read before you press the button.

### Does it lose quality?

The frames it keeps are encoded a second time, which costs a little; that cannot be avoided, because the finished clip shows them at times nothing in the original file was coded for. What this tool does spend more on than the other video tools here is the bitrate, deliberately. Two frames two seconds apart have far less in common than two frames a thirtieth of a second apart, so a codec has less to reuse, and a figure tuned for ordinary footage would come out blocky.

### Is there a limit on the size or length of the video?

There is no limit built into the tool, and the file is not read into memory all at once — it is read in short runs around each instant, and only those. The practical ceiling is the finished time-lapse, which is assembled in memory before you download it, and a time-lapse is short by definition: the summary shows roughly how large it will be before you start.

### Can I speed up only part of a clip?

Not here. This tool takes the whole thing from the first frame to the last. Cut the section you want first with the [Video Cutter](https://abox.tools/trim-video/) — which does it without re-encoding a frame — and speed up what comes out of that.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your video.

## How the privacy claim is verifiable

- **Your videos have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** This tool has no network feature at all: no address to paste, nothing to download, no engine fetched on first use. Every byte that touches your video came from this origin when the page loaded.
- **The decoding and encoding are local.** The frames go through WebCodecs in your own browser, or through the same playback engine that would show you the clip anyway. The finished file is built in memory on this machine and handed straight to a download.
- **Most of the file is never even read.** A time-lapse needs one frame every few seconds, so the tool reads the short run of the file around each of those and skips the rest. That is a speed decision rather than a privacy one, and it is worth knowing anyway: even locally, most of your video is never opened.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size or a length. Every line that reads, decodes, samples or encodes is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your video.
- **It works offline.** Disconnect from the network and everything on this page still works. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/plan.js` for the arithmetic that decides which instant each frame comes from, and `src/decode.js` for the loop that reads only the parts of the file those instants need. None of them imports anything that can make a request.
