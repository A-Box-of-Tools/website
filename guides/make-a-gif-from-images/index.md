# How to make an animated GIF from images

Making the GIF is the easy part. Getting one that is small enough to actually post is the part worth reading about, because a GIF has no quality slider and only three things move its size at all.

[Open the GIF Maker](https://abox.tools/gif-maker/): Turn a set of pictures into one animation.

Last updated 26 August 2026

## The short answer

Open [GIF Maker](https://abox.tools/gif-maker/), drop the pictures in, put them in the order they should play, set how long each frame is held, and make the GIF. It plays on the page before you save it.

Everything below is about the two things that go wrong afterwards: the file is far larger than expected, or the animation plays more slowly than the numbers said it would. Both have specific causes and neither is a fault in the tool.

## Why a GIF is so much larger than you expect

A 20-frame GIF at 640 pixels is routinely 8 to 15 MB. The same animation as an MP4 is a few hundred kilobytes. That is not a badly made GIF; that is what the format is.

Every other moving-picture format you have used stores *differences*. A video codec writes one full frame and then, for the frames after it, only what moved and where it moved to — which is why a video of a person talking in front of a still background costs almost nothing per frame. A GIF cannot do that. Every frame is stored as whole pixels, run through a lossless compressor, and that is the entire toolkit.

There is also no quality setting, because there is no lossy step to turn down. A JPEG at 60% quality is a real choice with a real slider behind it; a GIF has nothing equivalent. So the size is roughly **area × number of frames**, and the only way to move it is to move one of those two numbers.

## The three things that actually make it smaller

In the order they help:

**1. Make it smaller.** This is not one of several options, it is the option. Size is area, so halving the long edge quarters the file: 640 px down to 320 px turns 12 MB into about 3 MB. A GIF on a web page or in a chat window is being viewed at a few hundred pixels anyway. 480 px is the default in the tool for exactly this reason, and 320 px is a perfectly respectable answer.

**2. Use fewer frames.** Ten frames held for a fifth of a second each is the same two seconds of animation as twenty frames at a tenth, and half the file. Smoothness costs bytes in direct proportion, so spend it only where the motion needs it.

**3. Turn dithering off, and drop the colours.** This one is counter-intuitive. Dithering scatters a fine pattern of alternating pixels to fake the colours the palette does not have, and that pattern is *noise* — which is exactly what a lossless compressor cannot compress. On flat artwork, screenshots and line drawings, turning it off can take a third off the file and look better as well. On photographs it trades visible banding for the saving, so try both and look.

Dropping from 256 to 64 colours helps too, though less than people hope: it shortens the code words rather than removing any pixels.

If none of that gets it small enough, the honest answer is that what you are making is a video. [Turning the same images into an MP4](https://abox.tools/guides/turn-images-into-a-video/) will be perhaps a tenth of the size, and everywhere that accepts a GIF for anything other than an `<img>` tag — including every social network — converts it to a video on upload regardless.

## How fast a GIF can really play

The format stores each frame's delay in hundredths of a second, which suggests you could ask for 0.01s and get a hundred frames a second. You cannot.

Every browser clamps a delay under two hundredths of a second up to a tenth of a second. The rule dates from the 1990s, when pages were full of animations set to play as fast as possible and the machines of the day could not survive it, and it has outlived every reason it was introduced for. It has never been removed, and it applies to your GIF today.

So the practical range is:

- **0.02s** (50 frames a second) — the fastest a GIF is allowed to be, and faster than it usually needs.
- **0.05s** (20 frames a second) — smooth animation, and where to start if you are animating motion.
- **0.1s** (10 frames a second) — the classic GIF look. Half the frames, half the file, and it reads as deliberate.
- **0.5s and up** — a slideshow. Each picture is being looked at rather than animated.

Anything under 0.02s is not offered, because it is a number that would silently become 0.1s in every browser there is.

## The palette, and what it is actually choosing

A GIF frame holds at most 256 colours. A photograph has tens of thousands. Something has to pick 256 of them, and that choice is what the output looks like — more than any other setting.

The tool offers two ways to make it:

**Best colours for each frame** gives every picture its own 256. It looks sharpest, and it is right for a set of unrelated photographs, where each one wants a completely different set anyway.

**One palette for the whole GIF** builds a single table from every frame at once. Use it when the frames are a *sequence* — the same scene, a few moments apart. With a per-frame palette, any change in the picture changes which 256 colours get chosen, and the whole background shifts colour slightly at every frame. That shimmer is the thing that makes a homemade GIF look homemade. A shared palette removes it, and makes a smaller file into the bargain, because the table is written once rather than in every frame.

Fewer colours — 128, 64, 32 — is worth trying on anything flat. A logo animation with eight colours in it loses nothing at 32, and you can see the difference on a photograph immediately.

![The colour settings: a palette of 128 colours, a choice between one shared palette and one per frame, and dithering off, with a summary of frames, duration and estimated size.](https://abox.tools/screens/make-a-gif-from-images/colours.webp)

The palette is the setting with the largest effect on size, and the one most tools hide. The summary under it moves as you change them.

## Transparency is one bit, and that is the whole story

A GIF pixel is either fully painted or entirely invisible. There is nothing in between: no 50% shadow, no soft edge, no fade.

So if your source images have transparency, switching it on keeps the transparent areas transparent — but every anti-aliased edge, which is a gradient from the shape into nothing, gets cut at the halfway point into a hard, visibly jagged one. Round shapes and text suffer most.

If you know what colour the GIF will sit on, flattening it onto that colour will look better every time. Keep the transparency only when the background it lands on is genuinely unknown — and if the answer is "it needs a soft edge on any background", the format for that is animated PNG or WebP, not GIF.

## Order, timing, and getting the loop to sit right

A few things that are quicker to know than to discover:

**Sort by name counts properly.** A render or export sequence sorts the way you meant, so `frame_2` lands before `frame_10` rather than after it. Sort by date puts a camera roll back into the order it was shot, which is what you want when the filenames have restarted at 0001.

**Give the last frame longer.** A loop with every frame the same length reads as relentless. Holding the final frame for half a second or so gives the eye somewhere to rest and makes the whole thing look intentional. Each frame has its own hold time for this.

**A loop should not jump.** The last frame is followed immediately by the first, so if those two are very different the loop snaps. Either make them similar, or lean into the cut by holding the last frame.

**Play once means play once.** Some tools write a loop count of one, which decoders have never fully agreed about — a few play it twice. Choosing "Play once" here writes no loop information at all, which every decoder ever built treats the same way.

![Five frames listed in order, each with its own delay field, above a row that sets every delay at once.](https://abox.tools/screens/make-a-gif-from-images/frames.webp)

Order and timing, both editable per frame. Setting them all at once is the row above, which is what anybody with more than three frames wants.

## Why this does not need a server

Making a GIF is two jobs the browser does not offer: choosing the palette, and compressing the pixels with LZW. Neither one is large. They are perhaps four hundred lines between them, they are written out in the repository, and they run on your own machine like everything else here — which is why the page keeps working with the network unplugged.

The reason so many GIF makers upload is not that the job is hard. It is that a server is where the advertising and the accounts are. Nothing about turning a set of photographs into an animation requires your photographs to leave the room they are in.

[Is it safe to upload files to online converters?](https://abox.tools/guides/is-it-safe-to-upload-files/) sets out four checks that will tell you the same thing about any tool, including this one.
