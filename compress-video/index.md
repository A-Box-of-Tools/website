# Compress Video — down to a size that will actually send

Say how big it may be. The tool works out the rest, and measures the result before you get it.

> Shrink a video to under 8, 16, 25 or any number of megabytes, in your browser. Say the size; the tool picks the frame size and bitrate, encodes it, and measures the result. Nothing is uploaded, and the sound is copied through untouched.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/compress-video/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

The video you choose is decoded, drawn smaller, encoded again and written back out in memory on this machine, by your own browser's codecs and code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one. A gigabyte never goes up to come back small.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to compress a video to a size that will send

1. **Choose the video.** One clip at a time, MP4 or MOV. It is read straight off your disk by the browser, and the page says what it is: how long, how big, what frame size, and what it spends per second.
2. **Say how big it may be.** Type a number of megabytes, or press the limit you were given — 8, 16, 25, 50, 100 — or half or a quarter of what the file is. The line underneath says what that buys: the frame size and bitrate the clip's length and sound leave room for, and what the result should come out at. Leave the sound out if you would rather all of the number went to the picture.
3. **Overrule the frame size if you want to.** The number picks a rung of the ladder on its own. Pick one yourself when you know better — a screen recording that must stay readable at 1080p, a clip that only needs to be watched on a phone — and the bitrate is spread over that instead. A rung is a ceiling: the picture is never made larger than it came.
4. **Compress it, and read the line that says it was measured.** The picture is decoded, drawn smaller and encoded again, frame by frame, with a bar that says where it is. Then the finished file is measured against the number and opened again here to check its length; if it came out over, it is encoded once more, tighter, and the page says so. The result plays from memory under the download, so you can see it survived.

## The longer version

[How to compress a video to a size that will send](https://abox.tools/guides/compress-a-video/): What a size limit actually costs a video, where the megabytes go, why the frame size drops before the picture goes to mud, how to lose as little as the number allows, and how to do it in your browser without the upload.

## Also in the box

- [MP4 Converter](https://abox.tools/convert-to-mp4/): Whatever came off the screen recorder, the ripper or the camera, as H.264 and AAC in an MP4. Copied where it can be, re-encoded only where it must.
- [Video Rotator](https://abox.tools/rotate-video/): A quarter turn, a half turn, the other way. Written into the file's header, so not one frame is decoded and nothing is lost.
- [Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.
- [Video Cutter](https://abox.tools/trim-video/): Mark the parts worth keeping as it plays. Get them back as one video.

## Questions

### How small can a video get?

As small as the number you type, down to the point where nothing watchable fits — and the page tells you where that is. The sound is copied as it is, so it costs what it costs (about a megabyte a minute for ordinary stereo), and the picture needs a few hundred kilobits a second at the smallest frame size to be a picture at all. Leaving the sound out gives its share to the picture, which for a short clip with a tight limit is often the difference.

### Why did the frame size change?

Because a bitrate only means something relative to how many pixels it has to paint. Two megabits a second is generous at 720p and mud at 4K, so once the number has decided the bitrate, the frame is stepped down the ladder until each frame gets enough bits to look like a picture. A smaller clear picture beats a large smeared one, and it is what every service that compresses uploads does silently. Here it is said before it starts, and you can pick the rung yourself.

### Will the quality be worse?

Yes, by exactly as much as the number requires and no more. A compressed video is a re-encoded video: the picture is written again at a lower bitrate, one generation further from the camera. The sound is not touched. What you lose is decided by the number you typed — a 900 MB clip made 25 MB has lost most of its bits, and a clip made half its size has lost few — and the page says the bitrate and frame size it chose so that the trade is visible rather than hidden.

### What format does it write?

MP4 with H.264 video, and the sound track copied through as it was. That is the one combination every phone, browser, chat app and email client plays, which is what a file that has to send needs. It does not write WebM, HEVC or AV1: smaller for the same quality, and not something half of the people you would send it to could open.

### Which files does it read?

MP4 and MOV — what phones, cameras and screen recorders write — with H.264, HEVC, VP9 or AV1 inside, as long as your browser will decode them. An iPhone HEVC clip opens wherever the machine has a licence for HEVC, which is most machines. WebM, MKV and AVI are not read here yet; the page says so when it meets one rather than failing vaguely.

### How long does it take?

As long as your machine takes to encode the clip. With a hardware encoder — most laptops and every recent phone — it is faster than the clip is long; a minute of 1080p usually takes less than a minute. Without one it is slower, and a long 4K clip is a long wait either way. The bar says which frame it is on, and cancelling stops it at once and writes nothing.

### Why did it take two passes?

Because an encoder lands near the bitrate it is asked for rather than on it, and on a busy clip it can land over. The file is asked for a little under the number and measured; if it still came out over, the bitrate is worked out again from how far it missed and the clip is encoded once more. Two passes are always enough, and the page says when it took two.

### Are my videos uploaded anywhere?

No. The clip is read, decoded, encoded and written by your own browser on your own hardware, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The simplest way to satisfy yourself is to unplug from the network and use the page anyway. On a tool for files this size, that is also the fastest way: the upload is usually longer than the encoding.

### Does it work on a phone?

On a phone whose browser can encode video, yes, and a phone's own hardware encoder is quick. What a phone lacks is memory: the finished file is held in memory until you save it, so a very long clip may be more than a phone can hold. Cut it first with the [Video Trimmer](https://abox.tools/trim-video/), or compress it on a laptop.

### Is there a size limit, and does it cost anything?

There is no limit written into the tool. The clip is read from your disk in pieces, so a file larger than your memory is fine going in; the limit is the finished file, which is held in memory until you download it, and a laptop will take a few hundred megabytes of result without complaint. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your videos.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your video away to be compressed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **The upload is the slow part, and it is the part that does not happen.** A video is the largest file most people ever try to send, which is why it will not send. Every online compressor asks for the whole thing first — the 900 MB goes up on your connection so that 25 MB can come back — and that upload is usually longer than the encoding it pays for, before any question of who keeps the file. This page encodes with the codecs already inside your browser, on your own machine, so the only bytes that move are from your disk to your memory and back. The page's `Content-Security-Policy` names every address it may contact — not one of them belongs to this site — and it works with the network unplugged.
- **It starts from the number, because the number is the point.** A chat app allows 8 MB, or 25; an email 25; a form whatever it says. What you want is the file under that, with as little lost as the number allows. So the page asks for the number and works out the rest: the sound is copied as it is, the container takes a little, and what is left over the length of the clip is what the picture may spend. That bitrate is only worth something relative to how many pixels it has to paint, so the frame is stepped down a ladder of the sizes people know until each frame gets enough of it to look like a picture — and never up. The page says all of this before it starts, and you can overrule the frame size.
- **A compressed video is an encoded-again video, and the page says so.** “Compress” means something lossless for a zip file and nothing of the kind for a video. The picture is decoded, drawn smaller, and encoded again with H.264 at the bitrate the number allows, which leaves it one generation further from the camera than the file you started with. The sound is not: its samples are copied into the new file exactly as they were. The result is an MP4, because that is the one container every phone, browser and chat app plays, and this site has already ruled out promising a format half its visitors could not have made.
- **The result is measured, and tightened once if it missed.** An encoder lands near a bitrate rather than on it, so the file is asked for a little under the number and then measured. If it still came out over, the bitrate is worked out again from how far it missed and the clip is encoded a second time; two passes are always enough, and the page says when it took two. Then the finished file is opened again here and has to be the length it was: a compressor that dropped the last second, or the sound, would still be a smaller file, and only reading the result back can tell the difference.
- **What it costs on your machine, honestly.** Encoding takes as long as your machine takes. With a hardware encoder — most laptops and every phone made in the last decade — it is faster than the clip is long; without one it is slower, and a long 4K clip is a long wait either way. The whole file is read from your disk in pieces, so a clip larger than your memory is fine, but the finished file is held in memory until you download it, which is where a laptop's limit is. Cancel is always live.
- **Which files it reads, and which it does not.** MP4 and MOV — what phones, cameras and screen recorders write — with H.264, HEVC, VP9 or AV1 inside, whichever your browser will decode. An iPhone HEVC clip opens wherever the machine has a licence for it, which is most of them. WebM, MKV and AVI are not read here yet, and the page says so rather than failing vaguely.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size, a length, or the number you asked for. Every line that reads, encodes or writes a video is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your videos. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your video away to be compressed would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/plan.js` for how a number becomes a frame size and a bitrate, and `src/encode.js` for the decode, the drawing and the encode, and the sound copied round them. None of them can reach the network, and neither can the reader or the writer beside them.
