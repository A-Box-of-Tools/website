# How to stack photographs to reduce noise, or remove people

A burst of frames holds more information than any one of them. Averaging them cancels the noise; taking the middle value of each pixel deletes anything that was only there some of the time. Which one you want depends entirely on what moved.

[Open the Image Stacker](https://abox.tools/stack-images/): Twenty frames into one, without twenty uploads or a RAW converter.

Last updated 26 August 2026

## The short answer

Open the [Image Stacker](https://abox.tools/stack-images/), drop the whole burst in, and pick the method by what you are trying to get rid of:

- **Noise**, and nothing moved — average.
- **Noise**, and something moved — sigma clipping.
- **People, cars, an aeroplane** — median.
- **A dark sky you want as star trails** — lighten.
- **A macro shot with almost no depth of field** — focus stacking.

Leave the alignment on if the camera was in your hands and turn it off if it was on a tripod. RAW files can go straight in; there is no need to develop them first.

Everything below is why those five lines are what they are.

## Why a burst holds more than one frame does

A photograph taken in poor light is the picture plus noise, and the noise is different every time. That last part is what makes stacking work. Take the same shot sixteen times and the picture is identical in all sixteen while the noise is not, so averaging them leaves the picture and cancels most of the noise.

The improvement is the square root of the number of frames. Four frames halve the noise. Sixteen quarter it. A hundred cut it by ten. That is a brutal curve to be on — going from sixteen frames to sixty-four buys you the same improvement again, for four times the shooting — and it is why almost every practical stack is somewhere between eight and thirty frames.

There is a second, quieter gain. Averaging sixteen eight-bit frames gives a result with finer gradations than any one of them had, because the noise that made each frame round differently is exactly what lets the average land between the levels. Stacking a noisy set does not only remove noise; it recovers tone that a single frame quantised away.

## The question that picks the method

Not “what do I want to keep” but **what was different between the frames**. Everything else follows.

### Nothing moved: average

The plain mean. It is the most effective noise reduction available on a set where the only difference between frames is noise, and it is the most easily ruined: one frame with a bird in it puts a faint bird across the whole stack, because a mean has no opinion about a value that disagrees with the others. It just includes it.

### Something crossed the frame: median

Line up a dozen photographs of a busy square and look at one pixel. In most of them it is pavement; in one or two it is somebody's coat. Sort those twelve values and take the middle one and you get pavement, because the coat was never in the majority.

Do that for every pixel and the square comes out empty. This is the trick behind every “remove tourists from your holiday photo” article, and it needs nothing more clever than a burst and patience. The one thing it demands is that **no part of the scene is occupied more than half the time**. A person standing still for eight of your twelve frames is the majority at those pixels, and the median will keep them.

### Both: sigma clipping

The median throws away most of the information to get its robustness — eleven of your twelve values are discarded at each pixel, so it reduces noise far less than an average of the same set would.

Sigma clipping is the compromise, and it is usually the right default for any real-world set. It looks at each pixel across all the frames, works out what it usually is and how much it varies, and then averages only the values that agree with that. A car that crossed one frame is excluded from those pixels; every other frame still counts everywhere. You get the median's immunity to things that moved and most of the average's noise reduction.

The threshold is in standard deviations, and two is the usual starting point. Lower rejects more, and starts rejecting real detail along with the car.

### Only the bright things matter: lighten

Keep the brightest value each pixel ever had. Photograph the night sky as two hundred thirty-second exposures and lighten them together, and each star draws its own arc across the result — a star trail, assembled from short exposures that never individually blew out. The same method assembles a firework from the frames of its own explosion, and a light painting from a walk around a dark room with a torch.

Its opposite, darken, is the quiet one of the pair: a pixel only stays bright if it was bright in *every* frame, so reflections in a window, passing headlights and raindrops lit by a flash all disappear.

### The subject is deeper than the focus: focus stacking

A macro shot at f/8 has perhaps a millimetre in focus, which is not enough for an insect. The answer is to take twenty frames along the focus ring and keep, from each, only the part that was sharp in it. The tool measures how much each pixel differs from its neighbours — large on an edge, near zero on a blur — and takes the winner.

This one wants a tripod more than any of the others, because moving the focus ring by hand moves the camera, and a frame taken from slightly further away is not the same picture at a different focus.

![The mode list - average, median, brightest, darkest - with a plan underneath giving the output size, the memory needed, and how much of each file has to be read.](https://abox.tools/screens/stack-photos-to-reduce-noise/plan.webp)

The mode is the question this section is about. The plan under it is the tool saying what the run will cost before it starts.

## Aligning the frames

Stacking is per-pixel arithmetic, so it assumes that a given pixel is the same part of the scene in every frame. Hand-held, it is not: a burst drifts by tens of pixels, and averaging that produces a blur rather than a clean picture. That is the single most common reason a first attempt at stacking disappoints.

So the frames are measured against one of their number and moved back into place first, to a fraction of a pixel. Three settings:

- **Shift only** is right for almost everything hand-held. It corrects the drift and the wobble.
- **Shift, rotation and scale** for a set where you were also turning slightly, or where a zoom crept. It costs one more measurement per frame and nothing at all when the frames turn out to be straight.
- **None** for a locked-off tripod or an intervalometer sequence, where the frames are already aligned and measuring them is wasted time.

What no alignment can fix is a subject that moved rather than a camera that moved, and it cannot fix a photograph taken from a step to the left either. Moving sideways changes how much the near things shift relative to the far ones, and no single correction describes both at once. Turning on the spot is fine; walking is not.

![The result: the stacked image, with a note giving how far each frame had to be moved to line up with the first.](https://abox.tools/screens/stack-photos-to-reduce-noise/result.webp)

The alignment figures are worth reading. A handheld burst moves by a few pixels a frame, and that is what the aligner is quietly undoing.

## Where RAW files fit in

You can drop CR2, CR3, NEF, ARW, DNG, RAF, RW2, ORF and the rest straight in, and it is worth being exact about what happens to them, because it is not what a RAW converter does.

Every RAW file already contains a **full-size JPEG that the camera rendered when it took the shot**. It is what the back of the camera shows you and what your operating system draws as the thumbnail. The stacker finds that picture and uses it. It does not decode the sensor data.

Two consequences, one good and one worth knowing:

- **It is fast.** Finding the preview means reading a few kilobytes of directory and then one slice, so a 60 MB frame opens about as quickly as a JPEG. Twenty of them open in the time a RAW converter would spend on one. The page shows you how little of your files it actually read.
- **It is the camera's rendering, not yours.** Eight bits a channel, with the white balance and picture style the camera was set to — not the twelve or fourteen bits of linear sensor data you would get from a converter.

For noise reduction, star trails, removing passers-by and focus stacking, that trade is almost always worth taking: the previews are full resolution and they are what you would have got as a JPEG anyway. If you are pushing shadows hard, or stacking for astrophotography where the last bit of dynamic range is the whole point, develop the frames in a RAW converter first and stack the TIFFs or JPEGs it gives you. Those go in the same way.

## What it costs to run

Worth knowing because it is the difference between a stack that takes eight seconds and one that takes two minutes.

Six of the seven methods only ever need to remember one thing. A running maximum does not care about the frames it has already seen, and neither does a running total, so those methods read each frame exactly once and use the same memory for a hundred frames as for two.

The median cannot work that way, because you cannot know the middle value of a set until you have all of it. Twenty 24-megapixel frames is about 1.4 GB of pixels held at once, which no browser will give you, so the picture gets cut into horizontal bands and stacked a band at a time — correct, and slower, because the frames are read again for each band.

The tool works all of this out before you press the button and tells you: how large the result will be, roughly how much memory it needs, and how many times your frames will be decoded. If it says the run will be banded, dropping the working resolution one step cuts the memory by four and almost always turns it back into a single pass — and if you are stacking to remove noise, half resolution was already going to look cleaner than full.

## Shooting for it

Most of the quality of a stack is decided before any software sees it.

- **Shoot more frames than you think you need.** The square root curve is unforgiving at the low end and merciful at the high end: going from four to nine frames is a bigger visible change than going from twenty to forty.
- **Do not change the exposure between frames.** Stacking assumes the frames are of the same scene at the same brightness. Lock the exposure, or the tool will be averaging two different pictures.
- **For removing people, wait between frames.** A burst taken in two seconds catches the same person in the same place in every frame, and the median keeps them. Ten frames a few seconds apart works far better than fifty in a burst.
- **For star trails, keep the gaps short.** Lighten draws exactly what the frames recorded, so a pause between exposures becomes a visible dash in every trail.

## None of this leaves your machine

A stack of twenty RAW frames is around a gigabyte of photographs, which is a lot to hand to a website in order to have an average taken of it. The [Image Stacker](https://abox.tools/stack-images/) reads the files off your own disk and does the arithmetic in your own browser. There is no upload step, no account and no queue, and you can check that claim the way you would check anybody's: open your browser's network panel while it runs, or simply unplug from the internet and stack them anyway.

The related question — how to tell, for any tool, whether handing it a file was necessary — is [its own guide](https://abox.tools/guides/is-it-safe-to-upload-files/).
