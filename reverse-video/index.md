# Video Reverser — play a video backwards

Last frame first, sound and all.

> Play an MP4, MOV or WebM backwards, with the sound reversed too. Runs in your browser: nothing is uploaded, there is no watermark, and it works offline.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/reverse-video/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

Every frame is decoded, turned round and encoded again by your own browser, on your own hardware. Nothing here can fetch or send anything — there is no network feature in this tool at all — and there is no server on the other end of this page to send a video to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Reverses the sound
- ✓ Works offline

## How to reverse a video

1. **Choose a video.** Drop an MP4, MOV, M4V or WebM onto the picker, or select one by hand. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Decide about the sound.** “Reverse the sound too” turns the track round sample by sample, which is what makes speech come out as speech played backwards rather than as silence. Turn it off for a silent clip, which is quicker.
3. **Choose how much quality to spend.** The picture has to be encoded again, because the frames come out in an order nothing in the file was coded for. “Balanced” keeps close to what the original spent; “Best quality” spends more.
4. **Reverse it and download.** The work happens on your own hardware, so how long it takes depends on your machine rather than on a queue. The finished video is handed straight to your browser's downloads.

## The longer version

[How to reverse a video](https://abox.tools/guides/reverse-a-video/): Play a clip backwards: what reversing does to the picture and the sound, why it cannot be done without re-encoding, why it is slower than trimming, and what to do first.

## Also in the box

- [Time-Lapse Maker](https://abox.tools/timelapse-video/): An hour of footage, in twenty seconds.
- [Video Frame Grabber](https://abox.tools/grab-frame/): A full-quality still from any point.
- [Video to GIF](https://abox.tools/video-to-gif/): Pick the section, the size, and the frame rate.
- [GIF Maker](https://abox.tools/gif-maker/): Turn a set of pictures into one animation.

## Questions

### Is my video uploaded anywhere?

No. It is read, decoded, reversed and encoded by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the internet and reverse a clip anyway if you would rather check than be told.

### Which video formats can I reverse?

MP4, M4V and MOV are read directly, whatever is inside them: H.264, HEVC, AV1 or VP9, as long as your browser can decode that codec. Anything else your browser can play — WebM most obviously — is reversed by stepping the browser's own player backwards through it instead, which works but is slower. A file the browser can neither read nor play, which in practice means AVI, WMV, FLV and most MKVs, is refused with a message saying so rather than failing halfway through. What comes out is always an MP4.

### Does the sound get reversed as well?

Yes, unless you turn it off. The whole track is decoded, the samples are put in the other order, and it is encoded again as AAC. There is no way to avoid that second encode: an audio packet is a few tens of milliseconds of sound coded against the packet before it, so writing the packets out back to front would play short pieces forwards in the wrong order — which sounds like a fault rather than like a reversal.

### Does reversing lose quality?

The picture is encoded a second time, which costs a little. It cannot be avoided here the way it can when trimming: a reversed clip shows its frames in an order nothing in the original file was coded for, so every frame has to be written afresh. What the tool will not do is spend more than the original did, since encoding above that only makes the file bigger without making it look better.

### Is there a limit on the size or length of the video?

There is no limit built into the tool, and the file is not read into memory all at once — it is walked group of frames by group of frames, backwards. The practical ceilings are the finished video, which is assembled in memory before you download it, and the sound, which has to be held whole because reversing needs the last sample before it can write the first.

### Why is it slower on some files than others?

Because there are two ways in. An MP4 or MOV is read by this tool directly and decoded a group of frames at a time, which is as fast as your machine goes. Anything else is reversed by asking the browser's own player for one moment of the clip after another, and each of those seeks makes the browser decode from the keyframe in front of it. The page says which of the two it is using, and why, before you start.

### Can I reverse only part of a clip?

Not here. This tool reverses the whole thing: the clip that comes out is exactly as long as the one that went in, with the last frame first. Cut the part you want first with the [Video Cutter](https://abox.tools/trim-video/) — which does it without re-encoding a frame — and reverse what comes out of that.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your video.

## How the privacy claim is verifiable

- **Your videos have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** This tool has no network feature at all: no address to paste, nothing to download, no engine fetched on first use. Every byte that touches your video came from this origin when the page loaded.
- **The decoding and encoding are local.** The frames go through WebCodecs in your own browser, or through the same playback engine that would show you the clip anyway. The finished file is built in memory on this machine and handed straight to a download.
- **The sound is turned round here too.** Reversing a track means decoding it, and that decoding is the browser's own, running on this machine. Nothing listens to it, nothing keeps it, and nothing could pass it anywhere: there is no code path here that sends a byte.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size or a length. Every line that reads, decodes, reverses or encodes is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your video.
- **It works offline.** Disconnect from the network and everything on this page still works. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/timeline.js` for the arithmetic that decides which frame comes out when, and `src/reverse.js` for the loop that walks the file backwards a group of frames at a time. None of them imports anything that can make a request.
