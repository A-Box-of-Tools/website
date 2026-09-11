# How to turn a folder of images into a video

A slideshow is a simple thing to make and an easy one to render twice, because two of the settings do not mean what they sound like. This is what each of them controls and what to choose.

[Open the Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.

Last updated 26 August 2026

## The short answer

Open [Images to Video](https://abox.tools/images-to-video/), drop the pictures in, put them in order, set how long each one is held, and create the video. You get an MP4 with H.264 video, which plays on essentially anything.

The two settings that most often need a second pass are the duration and the resolution, and they are worth understanding before the first render rather than after it.

## Frame rate and duration are not the same thing

This is the confusion that costs people a re-render.

**Duration** is how long each picture stays on screen. It is the setting you actually care about. Three seconds is a comfortable default for a slideshow somebody is watching; one to two seconds feels brisk; anything over five drags unless there is narration over it.

**Frame rate** is how many times a second the video repeats that picture. It changes nothing about what the slideshow looks like — a still image held for three seconds looks identical at 24 frames per second and at 60 — and it changes the file size and the encoding time quite a lot.

So for a plain slideshow, pick a low frame rate. 24 or 30 is plenty. The reason to go higher is if there is motion in the video: a pan or zoom across each photo, or a cross-fade between them, where a low frame rate shows as visible stepping.

![The resolution and frame-rate settings, with a summary counting the images, the total duration, the frame count and the estimated size.](https://abox.tools/screens/turn-images-into-a-video/summary.webp)

Frame rate and duration are different things, and the summary is where that becomes obvious: changing one moves the frame count, not the length.

## Resolution, and pictures of the wrong shape

A video has one frame size for its whole length. Your photographs almost certainly do not all share one, so something has to happen to the ones that do not fit — and that something is the choice worth making deliberately.

Start by picking the resolution from where the video is going:

- **⁦1920×1080⁩** for anything general. Universally supported, plays everywhere, and is what most people mean by HD.
- **⁦1080×1920⁩** — the same numbers the other way round — for a phone-first destination: stories, reels, shorts.
- **⁦3840×2160⁩** only if the pictures genuinely have that much detail and the destination will show it. It is four times the pixels, four times the encoding time, and roughly four times the file.

Then decide what happens to the mismatches. Fitting each picture inside the frame keeps all of it and leaves bars at the sides — safe, and the right answer when the pictures matter more than the presentation. Filling the frame and cropping the overflow looks better and will cut the top off some of them. Mixing portrait and landscape photographs in one video is the case where there is no good answer; deciding in advance which way you would rather be wrong saves a re-render.

## Order, and the file-name trap

As with any batch job, file names sort in a way that is not the way you counted. `photo2.jpg` comes after `photo10.jpg` in an alphabetical sort, because the comparison is character by character.

Sorting by date taken is usually right for photographs of an event, since you took them in the order they happened. Dragging the tiles is right for anything where the story is not chronological. Check before you render: the video is the one artefact where fixing the order means doing the whole job again.

![Six images listed in the order they will play, each with a duration field, above a row that sets every duration at once.](https://abox.tools/screens/turn-images-into-a-video/order.webp)

The order is the list, and the list is draggable. It is taken from the order you added them, which is not the order the file names imply.

## There is no soundtrack, and that is not a small thing

The MP4 this tool writes has a single video track and no audio track at all. If your slideshow needs music or narration, you will need a video editor for that step.

It is worth knowing why, rather than just that: adding audio means decoding a music file, encoding it to AAC, and interleaving it with the video in the container. All three are real work, and doing them badly produces a file that drifts out of sync as it plays. It is on the list rather than half-done.

A practical note if you do add music afterwards: pick the track first and set the per-picture duration so the slideshow comes out close to the length of the song. Trimming the music to fit the video always sounds worse than fitting the video to the music.

## What comes out, and what to do if it will not play

MP4 with H.264 is the target, and it is the most widely playable combination there is. In a browser without WebCodecs the tool falls back to recording WebM instead — the same footage in a container that fewer editors and social platforms accept.

If you end up with a WebM and something refuses it, the fix is a browser that supports WebCodecs rather than a conversion: current versions of Chrome, Edge and Safari all do. Re-rendering is better than converting, because converting means another generation of lossy encoding.

There is no limit built into the tool on how many pictures you can use. The ceiling is your own machine's memory, because the finished video is assembled there before you download it — a long 4K slideshow is the first thing to feel it.

## Making the file smaller

If the result is too large for wherever it is going, in order of what actually helps:

**Drop the frame rate.** For a still slideshow this costs nothing visible and is the largest single saving available.

**Drop the resolution.** 1080p instead of 4K is a quarter of the pixels, and on a phone screen nobody will know.

**Shorten it.** Three seconds a picture instead of five is 40% off the length and 40% off the file, and usually a better slideshow.

Shrinking the source photographs first does not help much. The video is encoded at the resolution you chose regardless, so a 4000-pixel photo and a 2000-pixel one produce almost the same number of bytes in a 1080p video. It does make the encoding quicker, and it moves that memory ceiling.

## Why this does not need a server, with one exception stated

Encoding video used to be the clearest case for uploading: browsers could not do it, and a machine with FFmpeg could. WebCodecs changed that by exposing the hardware encoder that is already in your machine, which is the same one your phone uses to record video in real time. Compositing the frames is a canvas. Neither step needs anything but your own hardware.

One exception on this particular tool, stated rather than buried: the optional “add from a web address” feature fetches an image from an address you paste in, and the server at that address sees your IP and what you asked for. That is inherent to the feature rather than a flaw in it, and it is the only network step anywhere in the tool. Do not use it and nothing leaves your machine at all.

[Is it safe to upload files to online converters?](https://abox.tools/guides/is-it-safe-to-upload-files/) sets out four checks that will tell you the same thing about any tool, including this one.
