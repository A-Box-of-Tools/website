# How to make a video thumbnail from the exact right frame

The difference between a thumbnail and a screenshot is about a quarter of a second — the frame where the eyes are open and the ball is still in the air. Getting that frame, at the platform's size, under the platform's byte limit, is a three-step chain that runs entirely in your browser.

Last updated 13 October 2026

## The short answer

1. **Get the frame.** Open the [Frame Grabber](https://abox.tools/grab-frame/), drop the video in, and step through the file's own frame list to the exact instant. Save it as PNG — the lossless copy, so nothing is decided yet.
2. **Frame the frame.** Take the PNG to the [Image Resizer](https://abox.tools/resize-image/): crop to the platform's shape and choose dimensions that suit the source and destination. YouTube currently recommends 16:9 for videos and 9:16 for Shorts; the details below distinguish the two.
3. **Hit the ceiling.** Finish in the [Image Compressor](https://abox.tools/compress-image/) with the platform's current limit as the target, with some room below it. Choose JPEG for a photographic YouTube thumbnail; do not leave format on Auto when the destination requires JPG or PNG.

Nothing in the chain uploads anything — worth having when the video is unpublished, and the thumbnail is being made precisely because the video is not public yet.

## A cover people can read at its real size

For a video upload, choose a frame that tells the viewer what they will see: the finished object, the speaker looking up or the moment before the action. Keep any caption in the source clear at a small preview size. These tools capture, crop and compress; adding a title or other artwork needs an image editor between the PNG capture and the final compression.

For a website video, the same still can be the poster image shown before playback. Match the player's shape and displayed size, then check that the result still explains the clip on a phone. A presentation cover is another useful destination: test it in the actual slide layout rather than assuming the full-size PNG is the view the audience gets.

## Why stepping beats pausing

Pausing a player and screenshotting it loses twice. The pause lands where the player put it — the nearest place it could stop, not the frame you meant — and the screenshot is a picture of the player: its resolution, its overlay, its colour handling, not the file's.

The grabber walks the file's own frame list instead, one frame at a time in either direction, and hands you the decoded frame itself at the video's full resolution. A quarter-second of searching either side of the moment is usually where the thumbnail lives — the frame *between* the two obvious ones, where the motion reads but nothing is blurred.

Save the grab as PNG even when the final thumbnail will be JPEG. The PNG preserves the drawn still without another lossy encode; each later compression decision then happens once, at the end, inside a byte budget — rather than twice, compounding.

![A still from a video with the timecode visible, alongside step and scrub controls and the exact time it was taken from.](https://abox.tools/screens/make-a-video-thumbnail/frame.webp)

Stepping to the frame, rather than pausing and screenshotting it. The section above says what the difference actually is.

## The platform arithmetic

Crop before you compress, for the same reason the [photo guide](https://abox.tools/guides/get-photos-ready-for-the-web/) gives: pixels are the budget. A 16:9 crop reduced to ⁦1280×720⁩ is one useful small export, not the current YouTube recommendation. Its [thumbnail instructions](https://support.google.com/youtube/answer/72431?hl=en) now recommend ⁦3840×2160⁩ for videos and ⁦2160×3840⁩ for Shorts, with JPG or PNG as examples of accepted formats. Desktop uploads allow up to 50 MB; mobile video thumbnails must stay under 2 MB. Check the instructions for the upload route you use, and avoid enlarging a small still merely to reach a recommended number. Custom uploads require a verified account; custom Shorts uploads currently use YouTube Studio on a computer.

The resizer's crop box locks to 16:9 or 9:16, so the shape is a drag rather than a calculation. Text and faces want to sit inside the middle two-thirds, because feeds round the corners and overlay durations on the bottom right.

![The resizer with a width of 1280 and a height of 720 entered, and a summary of what the still will come out as.](https://abox.tools/screens/make-a-video-thumbnail/size.webp)

A 1280 by 720 example export. Choose dimensions from the current destination requirements and the detail your source actually holds.

## A contact sheet, when you cannot find the moment

When the right instant is somewhere in ten minutes of footage, the grabber's other mode saves one still every N seconds and hands the lot over as a ZIP. Skim the stills like a contact sheet, note the time of the nearest one, and step from there. It is faster than scrubbing, and it leaves a folder of candidates for the day the platform asks for a different shape.

## If you do this every week

The steps live on three pages here on purpose — each page does one job, and each can prove on its own that nothing leaves your machine. But every step is open source: MIT-licensed, one folder per tool, dependency-free ES modules with READMEs that explain the decoder, the resampler and the byte-target search.

If thumbnails are a weekly deliverable, point a coding agent at the [repository](https://github.com/A-Box-of-Tools/website) and ask it for a one-page version: step, crop to your platform's preset, compress to its ceiling, one button. The modules were written to be read, and lifting them is what the licence is for.
