# Time-Lapse Maker

`/timelapse-video/` — turn a long video into a short one by keeping one frame
every so often and writing them back at a normal frame rate.

Everything happens in the browser. The file is read off the disk, decoded by
WebCodecs (or by the browser's own player), re-encoded as H.264 and muxed into
an MP4 in memory. Nothing is uploaded, and there is no network feature in this
tool at all.

## What a time-lapse actually is

Two numbers, and one of them is a consequence of the other:

- **the speed** — the ratio between what went in and what comes out. An hour at
  60× is a minute.
- **the frame rate** — how smooth the result looks. It does *not* change how
  fast the clip is.

Between them they fix the third and most useful number, the one a photographer
would actually set on a camera:

```
interval = speed / frame rate
```

60× at 30 fps is one frame every two seconds. The page shows that line under the
speed, because "one frame every two seconds" says what the tool is about to do
far better than "60×" does.

The whole conversion is that and nothing else: take frames at `i × interval`
seconds, write them `1 / fps` apart. Nothing is dropped from a decoded stream,
nothing is resampled, and no frame is ever blended with another. That is why
`plan.js` — where those sums live — is the file worth reading first, and the one
with the tests.

## Why it is fast

The obvious way to build this is to decode every frame and throw most of them
away. This does not do that.

A frame can only be decoded by starting at the keyframe in front of it and
working forwards, but nothing says the frames in between have to be *kept*. So
`decodeRuns` in `plan.js` turns the list of wanted instants into a list of
sample ranges: for each instant, the run from its keyframe up to it. An hour of
30 fps footage at 60× is about 1,800 instants out of 108,000 frames, and in a
file with a keyframe every second that is around 1,800 frames decoded rather
than all of them. The summary on the page says exactly how many before you press
the button.

Runs that touch are merged. Without that a 2× time-lapse — where the instants
are two frames apart — would ask for one run per instant and restart the decoder
hundreds of times over a file it is reading straight through anyway. With it,
the dense case falls back to one run per keyframe, which is as few as there can
be, and the optimisation costs nothing.

The other half of the saving is the reordering allowance. Every other video tool
here reads half a second past the frame it wants, because a file with B-frames
stores a frame shown later before one shown sooner. Here that allowance would be
most of the cost — fifteen extra frames per instant against the one the instant
needs — so `reorderSlack` measures the real figure off the sample table instead.
For every phone recording, every screen capture and everything WebCodecs writes
the answer is zero, and each run is a single frame. The measured value is capped
at half a second so that one corrupt timestamp cannot undo the whole thing.

The decoder is never reset between runs, which is what keeps the pipeline full
across a run that is only two frames long. Feeding it a file with holes in it
looks alarming and is not: every run begins at a keyframe, and a keyframe is by
definition a picture that depends on nothing before it.

## The two paths

| | `decode.js` | `playback.js` |
|---|---|---|
| Reads with | `demux.js` + `VideoDecoder` | the `<video>` element |
| Accepts | MP4, M4V, MOV — H.264, HEVC, AV1, VP9 | anything the browser plays |
| Exact about which frame is which instant | yes | no: the browser decides where a seek lands |
| Skips the parts it does not need | yes, explicitly | in effect: a seek decodes one GOP |

Both end at `encode.js`, which is where the frames become an MP4. That split is
deliberate — the interesting half of this tool is choosing the instants, and it
should not be written twice.

The playback path is the fallback and is closer in speed to the direct one than
it is in any other video tool here, because a seek costs a decode from the
keyframe in front of it and that is work the direct path also does. What it
gives up is exactness, not throughput.

Both need `VideoEncoder`. There is no MediaRecorder path: recording means
playing, and you cannot play an hour of video to make twenty seconds of output
in less than an hour.

## Why there is no sound

Dropped, deliberately. Audio at 60× is a chirp, and audio left at its original
speed under a picture that has raced ahead of it is a different clip from the
one that was asked for. Neither is worth writing, so `mp4.js` here is the
video-only muxer rather than the one the cropping tool uses.

Dropping it is also most of the reason an hour of video comes out as a few
megabytes. If the sound is what somebody wanted, `/edit-audio/` will save it.

## The quality figures are higher than the other video tools'

`chooseBitrate` in `plan.js` spends 0.08 / 0.15 / 0.3 bits per pixel per frame,
against the cropping tool's 0.05 / 0.1 / 0.2, and it has no "never more than the
original spent" ceiling.

Both differences are the same fact. A codec saves most of its bits by describing
a frame as small changes to the one before it, and in a time-lapse the one
before it is two seconds — or two minutes — earlier: the clouds have moved, the
light has changed, the traffic is somewhere else. There is far less to reuse, so
a figure tuned for ordinary footage comes out blocky. And the source's own
bitrate is not a ceiling worth applying, because the source spread those bits
over sixty times as many frames.

## The files

| File | What it is |
|---|---|
| `plan.js` | the arithmetic: instants, sizes, bitrates, and which runs to decode. Pure, and tested in `tests/js/timelapse-plan.test.js` |
| `decode.js` | the direct path: `demux` → runs → `VideoDecoder` → canvas |
| `playback.js` | the fallback: seek the `<video>` element to each instant |
| `encode.js` | canvas → `VideoEncoder` → `Mp4Muxer`; shared by both paths |
| `draw.js` | one frame onto the output canvas, the right way up |
| `demux.js` | the MP4 reader. A copy — see below |
| `mp4.js` | the muxer. A copy — see below |
| `support.js` | what this browser will decode and encode |
| `main.js` | the page: wiring, the summary, the progress bar |

## The two copied modules

`demux.js` is the same reader `/crop-video/`, `/grab-frame/` and `/video-to-gif/`
carry, and `mp4.js` is the same muxer `/images-to-video/` carries. Neither is
shared through `shared/js/`, because a shared module is copied into a tool at
build time and a source file importing one cannot be loaded outside a build —
which is exactly what the JavaScript tests do.

`tests/python/test_duplicates.py` declares both copies and fails if they drift
apart. Fix one and it will tell you about the others.

## Rotation

A phone films in landscape and writes a rotation into the file rather than
turning the pixels. `drawScaled` applies that turn on the way through the
canvas, so the output carries no rotation of its own — by then there is nothing
left to turn. The playback path passes 0, because the `<video>` element has
already done it.

Get this wrong and a phone clip comes out on its side, which is exactly what it
looks like when a converter has skipped it.

## What it deliberately does not do

- **No section.** The whole clip, first frame to last. Cut it first with
  `/trim-video/`, which does that without re-encoding anything.
- **No frame blending.** Every output frame is one source frame, unaltered.
  Blending would need every frame decoded, which is the cost this tool exists to
  avoid, and it makes moving traffic smear rather than step.
- **No slow motion.** Speeds below 1.1× are not a time-lapse, and doing them
  properly means inventing frames that were never filmed.
