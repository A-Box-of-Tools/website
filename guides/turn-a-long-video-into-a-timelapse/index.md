# How to turn a long video into a timelapse

An hour of sunset, a day of building work, a commute out the windscreen — footage worth having, at a speed nobody will sit through. The job is one decision about time and one about where it is going, and the whole of it runs in your browser, on a file that never leaves your machine.

[Open the Time-Lapse Maker](https://abox.tools/timelapse-video/): An hour of footage, in twenty seconds.

Last updated 26 August 2026

## The short answer

Open the [Timelapse Maker](https://abox.tools/timelapse-video/), drop the recording in, and either set a speed — anything from 1.1× to 1000× — or skip the arithmetic and say how long the result should be. Sixty seconds is a good default for anything headed to a feed. Pick a frame rate, scale it down if the original is 4K, and export.

If the destination only animates GIFs, take the exported clip through the [Video to GIF](https://abox.tools/video-to-gif/) converter afterwards — but read the last section first, because a timelapse is the most expensive thing a GIF can be asked to hold.

That trip is built in: after the export, a row under the download button offers to carry the result straight into the converter, and the clip arrives there already loaded.

## Say the length, not the speed

“How fast” is the wrong question, because the honest answer is a division you should not have to do: ninety minutes of footage into a minute of result is 90×, a day of building work into thirty seconds is nearer 3000× than anything a slider suggests. The tool takes the result length directly and works the factor out itself, which also means the answer survives you swapping in a longer recording.

What a speed factor is still good for is small numbers. Between 1.1× and 2× a video stays *watchable as video* - a lecture, a demonstration - and above roughly 8× it stops being fast playback and becomes a timelapse, where each output frame is a sample plucked from the flow of time and everything between samples is simply gone.

That sampling is also why the job is quick. The tool reads only the instants the output needs - at 100×, about one hundredth of the file - rather than decoding an hour to keep a minute.

![The speed card: a speed of twenty times, the resulting length, the interval between the frames that will be kept, and a frame rate.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/speed.webp)

Say the length you want and the speed follows, or the other way round. The interval is the number that says how much of the original is being skipped.

## Frame rate and size, briefly

- **Frame rate.** 30 frames a second reads as smooth motion for almost everything; 60 only earns its doubled size when the motion itself is the subject, and 24 gives clouds and crowds a pleasant film-like tick.
- **Size.** A timelapse is usually watched small. Scaling 4K down to 1080p quarters the pixels the encoder must describe, and on a phone screen nobody will ever know.

![The export card summary: the number of frames, the interval, the finished length, the estimated size, and how much of the file has to be read.](https://abox.tools/screens/turn-a-long-video-into-a-timelapse/summary.webp)

The last line is the one worth noticing: a time-lapse reads a fraction of the file, which is why this is quick on a clip that would take an hour to re-encode.

## When the timelapse wants to be a GIF

Mostly it does not. A timelapse is constant whole-frame change — the exact thing GIF compression is worst at — so even a short one lands in the tens of megabytes while the MP4 sits at a tenth of that, sharper. Post the video anywhere video plays.

When the destination truly only animates GIFs, cut the sequence to a loopable few seconds in the [converter's own timeline](https://abox.tools/video-to-gif/), keep the width modest, and let the frame rate fall to ⁦10–12⁩. The [partial-GIF guide](https://abox.tools/guides/make-a-gif-from-part-of-a-video/) is the long version of that budget.

## If you do this every week

The two steps live on two pages here on purpose — each page does one job, and each can prove on its own that nothing leaves your machine. But everything both pages run is open source: MIT-licensed, one folder per tool, dependency-free ES modules with a README that names each one.

If a camera on a tripod is part of your routine, point a coding agent at the [repository](https://github.com/A-Box-of-Tools/website) and ask it to compose the sampler and the GIF encoder into one page with your speed and size already set. The modules were written to be read, and lifting them is what the licence is for.
