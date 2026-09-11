# Video Cutter — cut a video online

Mark the parts worth keeping as it plays. Get them back as one video.

> Watch a video and mark every part worth keeping as it plays, then save those parts as one file. Runs in your browser: nothing uploaded, nothing re-encoded, works offline.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/trim-video/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

Your video is read, marked, cut and written by your own browser, on your own hardware. Nothing here can fetch or send anything — there is no network feature in this tool at all — and there is no server on the other end of this page to send a video to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ As many parts as you like
- ✓ No quality lost
- ✓ Works offline

## How to cut a video

1. **Choose a video.** Drop an MP4, MOV, M4V or WebM onto the picker. It is read straight off your disk by the browser; nothing is sent anywhere while you do it. Drop several and they are joined, in the order you put them in.
2. **Play it, and mark the parts you want.** Press `I` where a part should start and `O` where it should end. Do that as many times as you like — every pair becomes a row in the table underneath, and a band on the timeline. `U` takes the last one back, `Space` plays and pauses, and the arrow keys jump five seconds at a time. Slow the playback down if the moment is hard to catch.
3. **Fix up the marks.** Each row can be played back on its own, retimed by typing an exact time into it, moved up or down the order, or deleted. The two ends of the selected part can also be dragged along the timeline. The total at the top is what the finished video will run to.
4. **Keep them, or cut them out.** Keeping is the usual way round: the finished video is the parts you marked, joined in order. Cutting them out is the other job people want and rarely find — mark the adverts, the silences or the false starts, and what is left is joined up without them.
5. **Cut it, and download.** "Keep every byte" moves the frames across untouched: quick, and it cannot cost quality, but each part begins at the keyframe before your mark. "Cut exactly here" decodes and writes the picture again so every part starts on the frame you chose. The page says which one you are about to get, and what it costs, before you press the button.

## The longer version

[How to trim a video without re-encoding it](https://abox.tools/guides/trim-a-video/): Cutting a clip need not lose a single byte of quality. Why a cut sometimes lands earlier than you marked it, what a keyframe has to do with it, and when to accept a re-encode.

## Also in the box

- [Video Cropper](https://abox.tools/crop-video/): Cut a clip down to the part that matters.
- [Video Reverser](https://abox.tools/reverse-video/): Last frame first, sound and all.
- [Time-Lapse Maker](https://abox.tools/timelapse-video/): An hour of footage, in twenty seconds.
- [Video Frame Grabber](https://abox.tools/grab-frame/): A full-quality still from any point.

## Questions

### Is my video uploaded anywhere?

No. It is read, marked, cut and written by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the internet and cut a video anyway if you would rather check than be told.

### Can I keep several parts of the same video?

That is what this is for. Press `I` and `O` as many times as you like while it plays; each pair becomes a row, and the finished video is every row joined in order with everything else gone. Most online cutters give you one pair of handles and ask which single stretch to keep, which is fine for topping and tailing a clip and no use at all for watching an hour of footage once and keeping the six moments worth having.

### Does cutting lose quality?

Not on the normal path, and not in the way that matters. Cutting does not change what any frame looks like, so the frames are moved into the new file exactly as they were: the same bytes, the same encoder settings, the same everything. The only path here that re-encodes anything is the exact cut, and it says so on the button.

### Why does a part start earlier than I marked it?

Because of how video is stored, and only on players that ignore a standard part of the format. Most frames are kept as a description of how they differ from their neighbours, so they cannot be decoded without them; only a keyframe stands alone, and keyframes are typically one to ten seconds apart. A cut that copies frames therefore has to carry the run from the keyframe in front of your mark — and the file says *start playing at your mark*, which every mainstream player honours. If you need it exact in every player, choose "Cut exactly here", which re-encodes. The page tells you which case you are in, and by how much, before you export.

### Can I cut the adverts out instead?

Yes. Mark them, then choose "Cut them out": everything you did *not* mark is joined up instead, in order. The same list of marks answers both questions, so you can switch between them and see the length change without marking anything twice.

### Can I save my marks and come back to them?

Yes. "Save marks" writes a plain text file — one line a part, a start and an end separated by a comma — and "Load marks" reads one back. Two formats are offered, plain seconds and `HH:MM:SS.mmm`, and both keep to the layout other tools that work this way already use, so a file written here can be handed to one of those and a file written there can be dropped onto this page. Marking is careful work and nobody should have to do it twice.

### Which video formats can I cut?

MP4, M4V and MOV are read directly, whatever is inside them: H.264, HEVC, AV1 or VP9. Copying frames does not involve decoding them, so this path works even for a codec your browser has no decoder for at all. Anything else your browser can play — WebM most obviously — is cut by playing it and recording the result instead, which works, takes as long as the result is long, and can only keep one part. A file the browser can neither read nor play, which in practice means AVI, WMV, FLV and most MKVs, is refused with a message saying so rather than failing halfway through.

### Is there a limit on the size or length of the video?

There is no limit built into the tool, and on the copy path the file is barely read at all: the frames you keep are pointed at rather than loaded, so keeping four minutes out of a four-gigabyte recording costs about what writing those four minutes to disk costs. The exact cut walks the file a few megabytes at a time. Either way the practical ceiling is the finished file, which is assembled in memory before you download it.

### Does the sound survive?

On both MP4 paths it is copied across sample by sample without ever being decoded, so it is byte for byte what was in the file, and an edit mark keeps every part lined up with its picture to within a thousandth of a second. The one exception is joining separate videos whose sound is described differently — different sample rates, say — where there is no way to put both into one track without decoding them, and the page says so before it does. On the recording path it is captured from playback and encoded again. Either way there is a checkbox to leave it out entirely.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your video.

## How the privacy claim is verifiable

- **Your videos have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** This tool has no network feature at all: no address to paste, nothing to download, no engine fetched on first use. Every byte that touches your video came from this origin when the page loaded.
- **On the normal path, nothing is even decoded.** Cutting does not change what any frame looks like, so the encoded frames of the parts you marked are moved into the new file exactly as they were found. Each one is stored as a slice of the file on your disk — a note saying which bytes, not the bytes themselves — and your browser reads them for the first time as it writes the download. Nothing here ever turns your video back into a picture.
- **The marks file is made in the page.** Saving your marks writes a text file out of the numbers already on screen, straight to your downloads. Loading one reads it here. Neither goes near a network, and neither carries anything but times.
- **The sound is copied, not listened to.** On both MP4 paths the audio samples are moved across without being decoded at all — nothing here ever turns them back into sound, and nothing could pass them anywhere if it did.
- **Where frames are decoded, it happens here.** The exact cut, and the preview for a file this browser will not play, go through WebCodecs on your own machine. That is the same decoder that would show you the video anyway, running in the same place.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size, a length, or where you cut it. Every line that reads, cuts and writes is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your video.
- **It works offline.** Disconnect from the network and everything on this page still works. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/segments.js` for the marks and the file they save to, `src/shared/mp4-reader.js` for the reader that finds the frames in an MP4, `src/ranges.js` for the arithmetic that turns a mark into a run of samples, and `src/copy.js` for the loop that moves those samples into the new file. None of them imports anything that can make a request.
