# How to turn a video into a GIF

A GIF is a format from 1987 that stores whole pictures rather than motion, so one made from a video is always big. This is which of the three settings to move when it is too big, and how much each one buys you.

[Open the Video to GIF](https://abox.tools/video-to-gif/): Pick the section, the size, and the frame rate.

Last updated 13 October 2026

## The short answer

Open the [Video to GIF converter](https://abox.tools/video-to-gif/), drop the clip in, mark the seconds you want, and start with a modest width and 12 frames a second. The desktop preference is 480 pixels; a phone may start at 240 to keep the estimated buffers within its budget. If the file comes out too big, take the width down before you touch anything else — it is the setting that pays twice.

The rest of this page is about why, because “my GIF is 14 MB” is the problem everybody actually has, and which knob to turn is not obvious.

## A short instruction or a repeatable bug

A three-second screen recording can show a menu action, a drag gesture or a bug more clearly than a paragraph. Mark just before the action and finish after the result is visible. Start at 12 frames a second, use enough width to read the important label, and turn dithering off for flat interface colours. View the export inside the intended issue, document or page rather than judging only its large preview.

For a reaction or a craft movement, the same approach works with less text and often a smaller width. The page may start at 240 pixels on a phone to keep the working buffers manageable. If the plan is over its memory budget, shorten the section or use the offered smaller width; the source decoder still needs memory too. GIF carries no audio, so keep a video when the spoken explanation matters.

## Why a GIF of a video is so enormous

A video codec stores *motion*. It writes one full picture every couple of seconds and then, for every frame in between, a description of how that picture moved: this block of pixels slid four to the left, this area got slightly darker. A five-second clip can be a few hundred kilobytes because most of it is instructions about a picture you already have.

GIF has none of that. It was finished in 1989, before any of it existed. Every frame is a picture, compressed on its own with a scheme designed for screenshots of a spreadsheet. There is no motion estimation anywhere in the format and no way to add one.

So the number to expect is **ten times the size of the video**, and no converter can talk you out of it. What a good one can do is not waste anything on top of that, and give you the three settings that actually decide it.

![The section card: a frame of video with a timecode on it, and a bar showing a four-second piece marked out of a twenty-second clip.](https://abox.tools/screens/turn-a-video-into-a-gif/section.webp)

The section first, because every setting below is multiplied by how many seconds you kept.

## The three settings, and what each one costs

Everything about a GIF's size comes down to how many pixels it contains, which is the length times the rate times the area of one frame.

- **The section — linear.** Twice as long is twice as many frames and about twice the file. This is the one most people already understand, and it is worth being ruthless about: a GIF that makes its point in three seconds is a better GIF as well as a smaller one.
- **The width — quadratic.** Halving the width halves the height with it, so it is a *quarter* of the pixels. Going from 640 to 320 does not save a bit less than half; it saves about three quarters. This is the setting nobody reaches for first and the one that pays best.
- **The frame rate — linear.** Ten frames a second is two thirds the size of fifteen. It is also the setting where the loss is most visible, because motion that is too slow reads as broken rather than as small.

A worked example. Six seconds of a phone clip at its own ⁦1080×1920⁩ and 30 fps is 180 frames of two million pixels: about 350 million pixels, which is not a GIF, it is a hostage situation. The same six seconds at 480 wide and 12 fps is 72 frames of 400,000 pixels — 30 million, about a twelfth — and it looks like what people mean by a GIF.

![The export card: a width of 480, a frame rate, a dithering choice, and a summary estimating the frames and the size.](https://abox.tools/screens/turn-a-video-into-a-gif/size.webp)

Three settings and an estimate that moves as you change them. Which one to spend first is what this section is about.

## Which frame rate to pick

Twelve is the default here and the right answer surprisingly often. It is the rate hand-drawn animation has used for a century: fast enough that the eye reads it as continuous movement, slow enough that you are not paying for frames nobody can see.

- **⁦5–8⁩** — a slideshow feel. Fine for a slow pan or a screen recording where nothing moves quickly.
- **⁦10–15⁩** — normal. Reads as motion. Almost every GIF worth making is in here.
- **⁦20–25⁩** — smooth, and roughly twice the size of 12 for a difference most viewers will not name. Worth it for fast motion, a sports clip, anything with a whip pan in it.

There is a hard ceiling you may as well know about: GIF stores how long each frame stays on screen in hundredths of a second, and every browser treats a delay under two hundredths as ten. So 50 frames a second is the real maximum, and a file asking for 100 will silently play at 10. A converter offering you 60 fps is either ignoring that or about to surprise you.

## 256 colours, and what dithering is for

The other half of the format's age: a GIF carries one table of at most 256 colours, and every pixel is a number pointing into it. A video frame has up to sixteen million. Almost all of that gets thrown away, and how it is thrown away is most of what a GIF looks like.

A good converter counts the colours in *your* clip and picks 256 that suit it, rather than using a fixed set. A shot of a forest gets 256 greens; a shot of a sunset gets 256 oranges. That is what the tool here does, across every frame of the section rather than only the first, so a colour that only appears at the end still gets a place.

**Dithering** is what happens where the colour you need is still missing. Instead of rounding a whole area to the nearest available colour — which turns a smooth sky into four flat bands with visible steps between them — it alternates the two nearest colours in a fine pattern, and from a normal viewing distance your eye mixes them into the one that is not there.

- **Leave it on** for anything photographic: skies, skin, gradients, shadows, film.
- **Turn it off** for flat colour: screen recordings, line art, logos, cartoons, anything with large areas of one shade. There is no gradient to protect, and the file is smaller and cleaner without it.

One detail worth knowing if you compare converters. The obvious way to dither — error diffusion, which most image editors use — makes each pixel's result depend on the pixels around it. In an animation that means a background that is not moving still dithers differently in every frame, so it visibly crawls, and every frame has to be stored in full because every pixel technically changed. The alternative, an ordered dither, depends only on where a pixel is, so a still background stays perfectly still. That is what this tool uses, and it is why its files are smaller as well as calmer.

## When not to make a GIF at all

Worth asking, because the honest answer is often “don't”. A silent, looping MP4 or WebM is around a tenth of the size of the same animation as a GIF, plays the same way, and is what every social platform converts your GIF into after you upload it anyway.

Keep the GIF where the destination genuinely needs one:

- somewhere that only accepts an image — a lot of chat, forum, wiki and email software;
- a README or documentation page, where a GIF plays inline and a video needs a player;
- a slide deck or a document that has to keep moving offline;
- an emoji, a sticker, a reaction — small enough that none of the size arithmetic above matters.

Where the sound matters, the question answers itself: GIF has never had audio and never will. Cut the video instead — the [Video Cutter](https://abox.tools/trim-video/) can copy a suitable section, or use its labelled exact method when the cut needs it.

## Getting under a size limit

Most of the reason anyone tunes a GIF is a limit at the far end. In rough order of how much they bite:

- **Email** — check the sending and receiving service's allowance for the combined message and attachments. Leave room for the rest of the message rather than treating a GIF target as a universal email limit.
- **Chat and forums** — check the current attachment and inline-preview limits for the particular account and app. They need not be the same limit.
- **A README or documentation page** — image hosting and editor-upload limits differ. Keep the GIF small enough to load comfortably on a phone, and test the rendered page.
- **Sticker and emoji slots** — often a few hundred kilobytes, which means a small width and a short section, not a lower frame rate.

The order to try, when you are over: shorten the section, then halve the width, then drop the rate, then turn dithering off. The first two are worth more than the last two put together.

## None of this needs an upload

Converting a video to a GIF is decoding, resizing, counting colours and compressing — four things a browser has been able to do on its own for years. The tool linked at the top does all of it on your machine: the file is read off your disk, the frames are decoded by your browser, and the GIF is assembled in memory and handed to your downloads.

That is worth caring about here more than usual. The clips people turn into GIFs are personal ones — a moment from a family video, a screen recording of something at work, a few seconds of a call. A converter that wants those uploaded is asking for a copy of them, and there is no technical reason left to say yes.
