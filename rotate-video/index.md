# Rotate Video — for the clip that was filmed sideways

A quarter turn, a half turn, the other way. Written into the file's header, so not one frame is decoded and nothing is lost.

> Turn a sideways or upside-down video a quarter or half turn in your browser. The turn is written into the file's header, so no frame is re-encoded and nothing is lost; or bake it into the picture for old players. MP4, MOV, WebM and MKV in, MP4 out. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/rotate-video/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

The video you choose is read, given a new header and written again in memory on this machine, by code served from this address; if you ask for the turn to be baked in, your own browser's codecs do the drawing. Nothing here can make an upload, and there is no server on the other end of this page to receive one. A gigabyte never goes up to come back turned.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to rotate a video

1. **Choose the video.** One file at a time: MP4, MOV, M4V, WebM or MKV. It is read straight off your disk by the browser, and the page says what it is and which way up it is shown at the moment.
2. **Pick the turn, and look at the preview.** A quarter turn right, a quarter turn left, or upside down. The first frame is drawn turned as chosen through the same arithmetic the file will carry, so what you see is what a player will do. Tick “bake” only if a player has shown you the clip sideways; leave the sound out if you would rather the clip went silent.
3. **Rotate it, and read the line that says it was checked.** The header is written and every frame copied across, which takes seconds; a bake takes as long as an encode, with a bar that says where it is. Then the finished file is opened again here and has to be the length it was, shown the way you asked, and carrying its sound. It plays from memory under the download, so you can see it the right way up.

## The longer version

[How to rotate a video without losing quality](https://abox.tools/guides/rotate-a-video/): Why a phone clip plays sideways, what the nine numbers in its header do, why most rotators re-encode for nothing, when to bake the turn in instead, and how to turn a video in your browser without uploading it.

## Also in the box

- [Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.
- [Video Cutter](https://abox.tools/trim-video/): Mark the parts worth keeping as it plays. Get them back as one video.
- [Video Cropper](https://abox.tools/crop-video/): Cut a clip down to the part that matters.
- [Video Reverser](https://abox.tools/reverse-video/): Last frame first, sound and all.

## Questions

### Does rotating lose quality?

No, not the ordinary way. The turn is written into the file's header and every frame is copied across byte for byte, so the picture is exactly what it was and the file is almost exactly the size it was. Only “bake it in” re-encodes, and the page says so before you tick it. A rotator that re-encodes by default — most online ones — is doing a re-encode for a job that needed nine numbers.

### Why does the file still look sideways in one player?

Because that player ignores the display matrix. Every phone, browser, modern player and editor honours it; a few old desktop players do not, and show the frames as stored. Tick “bake the turn into the picture” and the frames themselves are turned and encoded again as H.264, which every player shows the same way at the cost of a generation of quality.

### Which way is a quarter turn right?

Clockwise, the way the top of the picture would move if you turned your phone to the right. The preview shows the first frame turned as chosen, so pick the button that makes it look right and press the big one.

### Which files does it read?

MP4, MOV and M4V with any picture inside, because a turn written into the header does not care what the frames are. WebM and MKV, where H.264 frames are copied and anything else is baked in, since an MP4 header can be built round nothing else. AAC sound is copied; Opus, Vorbis, MP3 and FLAC are encoded again as AAC; sound the browser cannot decode is named and left out. The result is always an MP4.

### How long does it take?

Seconds, for the ordinary turn: the file is read once for its layout and once more as the browser writes the result out, and a gigabyte goes at the speed of your disk. Baking the turn in takes as long as your machine takes to encode the clip — with a hardware encoder, most laptops and every recent phone, faster than the clip is long; without one, slower.

### Are my videos uploaded anywhere?

No. The file is read, given a new header and written again by your own browser on your own hardware, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The simplest way to satisfy yourself is to unplug from the network and use the page anyway. On a tool for files this size, that is also the fastest way: the upload is longer than the whole job.

### Does it work on a phone?

Yes. The ordinary turn decodes nothing, so a phone does it as fast as a laptop; the finished file is held in memory until you save it, which is the only limit, and a phone will hold a few hundred megabytes of result without complaint. Baking in is an encode, and a phone's own hardware encoder is quick at it.

### Is there a size limit, and does it cost anything?

The file is read from your disk in pieces, so a file larger than your memory is fine going in; the finished file is held in memory until you download it, and an MP4 written here cannot be over 4 GB. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your videos.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your video away to be turned would stop the moment you unplugged.

## How the privacy claim is verifiable

- **A turn is nine numbers in the header, and the page changes only those.** A phone that films sideways does not turn its pixels. It stores the frames as the sensor saw them and writes a quarter turn into the track header — a display matrix of nine numbers — which every player applies on the way to the screen. So a video that shows sideways needs a different matrix, not a different picture. This page writes the matrix for the turn you chose and copies every frame and every packet across exactly as they were, without decoding one. That is why a gigabyte takes seconds, why the picture is bit for bit what it was, and why the file comes out almost exactly the size it went in.
- **The upload is the slow part, and it is the part that does not happen.** Every online rotator asks for the whole file first: the gigabyte goes up on your connection so that a turned gigabyte can come back, and the upload is usually longer than the work it pays for, before any question of who keeps the file. Most of them then re-encode it, which costs a generation of quality for a job that needed nine numbers. This page reads the file with code served from this address and writes the new one in memory, so the only bytes that move are from your disk to your memory and back. The page's `Content-Security-Policy` names every address it may contact — not one of them belongs to this site — and it works with the network unplugged.
- **Who honours the header, and what to do about the few who do not.** Every phone, every browser, every modern player and every editor applies the display matrix; it is how phone footage has been shown the right way up since 2010. A few old desktop players ignore it and show the stored frames, sideways. For them, and for a clip that is going somewhere you cannot check, the page offers to bake the turn in: every frame is drawn turned on to a canvas and encoded again as H.264. That costs a generation of quality and takes as long as an encode, so it is the second choice and is named as one.
- **The result is opened again and checked.** A rotator that wrote the wrong matrix, or the right one at the wrong size, would still produce a file that opens. So the finished file is opened again here, by the same reader that reads what you bring, and has to be the length it was, shown the way you asked at the size that implies, and carrying the sound it was meant to. It plays from memory under the download, so you can see it the right way up before you save it.
- **Which files it reads, and what it writes.** MP4, MOV and M4V with any picture inside — H.264, HEVC, VP9 or AV1 — since a turn written into the header does not care what the frames are; and WebM and MKV, where the frames are copied if they are H.264 and baked in otherwise, because an MP4 header can be built round nothing else. AAC sound is copied; Opus, Vorbis, MP3 or FLAC is encoded again as AAC; a sound the browser cannot decode is named and left out. The result is always an MP4, because it is the one container everything plays.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size, a length, or which way you turned it. Every line that reads, turns or writes a video is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your videos. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your video away to be turned would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/plan.js` for the nine numbers a turn comes to, `src/rotate.js` for the copy and the writing, and `src/shared/copy-tracks.js` for how a frame is carried across without being read. None of them can reach the network, and neither can the readers or the writer beside them.
