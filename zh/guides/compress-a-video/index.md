# How to compress a video to a size that will send

A clip that will not send has one problem: it is over a number. Here is where the megabytes go, what giving them up costs, and how to get under the number without first uploading the thing that was too big to upload.

[打开视频压缩](https://abox.tools/zh/compress-video/): 说一个它最多能有多大。剩下的工具来算，做完先量一遍再交给你。

最后更新 12 September 2026

## The short answer

Open the [Video Compressor](https://abox.tools/zh/compress-video/), drop the clip in, and press the limit you were given — 8 MB, 16, 25, 50, 100 — or type any number. The line under the box says what that buys: the frame size and bitrate the clip's length leaves room for. Press the button, and the clip is encoded on your machine, measured against the number, and opened again to check it is still as long as it was. Nothing is uploaded.

The rest of this is about what you have just traded, because “compress” means something free for a zip file and nothing of the kind for a video.

## Where the megabytes go

A video file is almost entirely its picture. A minute of 1080p from a phone is somewhere between 60 and 150 MB, of which the sound is about one; the rest is thirty pictures a second, each described by what changed since the last. So the size of a video is, near enough, one number: how many bits per second the picture was allowed — the *bitrate* — multiplied by how long it runs.

That is why a size limit turns straight into a bitrate. Take the number you must stay under, subtract the sound (which is copied as it is) and a little for the container, and divide what is left by the length of the clip. A 25 MB limit on a two-minute clip leaves the picture about 1.6 megabits a second. That is the whole budget, and everything else follows from it.

## Why the frame gets smaller before the picture gets worse

A bitrate only means something relative to how many pixels it has to paint. 1.6 megabits a second spread over 1080p — two million pixels, thirty times a second — gives each pixel almost nothing, and the encoder does what encoders do with almost nothing: it smears. Edges go soft, flat areas turn to blocks, and motion turns to soup. The same 1.6 megabits over 720p is a perfectly watchable picture, and over 480p a good one.

So the tool steps the frame size down a ladder — 1080p, 720p, 480p, 360p — until each frame gets enough bits to look like a picture, and it does this before it starts and says so. A smaller clear picture is better than a larger smeared one, on any screen, and it is what every service that accepts uploads does to your video silently. The tool never goes the other way: a clip is never made larger than it came.

You can overrule it. A screen recording whose text must stay readable may need to keep 1080p and accept a softer picture; a clip that will only ever be watched on a phone can drop to 480p and spend the bits on motion instead.

## What is lost, and how to lose less of it

A compressed video is a re-encoded video. The picture is decoded, drawn smaller, and written again at the new bitrate, one generation further from the camera than the file you started with. The sound is not touched: its samples are copied into the new file exactly as they were. How much the picture loses is decided by the number: a clip made half its size has lost little, and a 900 MB clip made 25 MB has lost most of its bits and will look like it.

- **Ask for the number you need, not a smaller one.** If the limit is 25 MB, 25 MB is the right answer; 8 MB throws away two-thirds of the picture for nothing.
- **Cut first.** Length is the other half of the multiplication. Ten seconds you did not need are ten seconds of bitrate every remaining second could have had. The [Video Trimmer](https://abox.tools/zh/guides/trim-a-video/) cuts without re-encoding, so do that before this.
- **Drop the sound if it does not matter.** A minute of stereo is about a megabyte. On a short clip with a tight limit, that megabyte is often the difference between a picture and a smear.
- **Keep the original.** A file that has been compressed cannot be uncompressed. Compress a copy, send the copy, keep the one from the camera.

## Why the upload is the strange part

Consider what an online compressor asks you to do: upload the file that was too big to upload. The 900 MB goes up on your connection so that 25 MB can come back, and on most home connections that upload takes longer than the encoding it pays for. Then there is the question every other guide on this site asks — what they keep, for how long, and who can see it — which for a video of your children or your living room is not an idle one.

None of it needs to happen. Every browser made in the last few years carries the same video codecs a phone does, and [the tool here](https://abox.tools/zh/compress-video/) uses them: the clip is read from your disk in pieces, decoded, drawn smaller and encoded again by your own machine, and the finished file is held in memory until you save it. The page's own policy names every address it may contact and none of them is this site's, and it keeps working with the network unplugged. If you would rather prove that than take our word for it, that is the test: disconnect, and compress it anyway.

There is a more general version of this argument in [is it safe to upload files](https://abox.tools/zh/guides/is-it-safe-to-upload-files/).

## What the tool checks before it hands the file over

An encoder lands near the bitrate it is asked for rather than on it, so the file is asked for a little under the number and then measured. If it came out over, the bitrate is worked out again from how far it missed and the clip is encoded once more; the page says when that happened. Then the finished file is opened again, on your machine, and has to be the length it was. A compressor that dropped the last second or the sound would still produce a smaller file, and only reading the result back can tell the difference. The result plays under the download, so you can look before you send.

## What it writes, and what it reads

It writes MP4 with H.264 video, because that is the one combination every phone, browser, chat app and email client plays — which is the point of a file that has to send. It does not write WebM, HEVC or AV1: smaller for the same quality, and not something half of the people you would send it to could open. It reads MP4 and MOV, which is what phones, cameras and screen recorders write, with whatever codec is inside as long as your browser will decode it; an iPhone HEVC clip opens on most machines. WebM, MKV and AVI are not read yet, and the page says so when it meets one.
