# Video Reverser

*Last frame first, sound and all.*  ·  lives at `/reverse-video/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

Plays a clip backwards: the picture, and the sound with it. The frames come out
in the other order with their own durations intact, the file that comes out is
exactly as long as the one that went in, and none of it leaves the machine.

---

## Why this is not the easy one

Every other video tool here reads a file forwards. This one has to read it
backwards, and a video file is close to the worst possible shape for that.

- **A frame is not a picture.** Only a keyframe can be decoded on its own;
  everything after it says what changed since the frames around it. So "give me
  the last frame" is not a request a decoder can answer. The group it belongs
  to has to be decoded from its keyframe forward first.
- **Frames are not stored in the order they are shown.** A file with B-frames
  stores a frame before the ones it is displayed after, so the order to reverse
  is the order of the presentation times, not the order of the list.
- **Decoded frames are enormous.** A 1080p frame is about 3 MB once it is
  pixels, a 4K one about 12 MB. Decoding a clip into a list and walking the
  list backwards — the obvious implementation, and the one most examples show —
  works for five seconds of video and runs the browser out of memory on
  anything longer.

So the file is walked group by group from the end. For each group: decode it
from its keyframe forward, hold the frames that come back, then hand them to
the encoder last one first, each with the timestamp `src/timeline.js` worked
out for it. Nothing is ever held but one group.

A group longer than the memory budget is split into runs and decoded once per
run, dropping the frames outside the run being collected as they arrive. That
is the only wasted work in the tool, it is bounded by the length of one group,
and it is what stops a 4K clip from being a file this tool opens and then dies
on. The budget is in `windowLimit()`: about 384 MB of decoded frames, which is
250 frames at 1080p and 20 at 4K.

## Two paths, and why there are two

| | **Exact** | **Playback** |
|---|---|---|
| Accepts | MP4, M4V, MOV, in any codec `VideoDecoder` will open | anything the browser will *play* |
| How | demux → `VideoDecoder`, group by group from the end → `VideoEncoder` → MP4 | seek to each frame in turn from the end, draw it, `VideoEncoder` → MP4 |
| Speed | as fast as the machine goes | a seek a frame, so several times slower |
| Timing | the original frame times, to the tick, uneven rates included | a fixed rate, measured off a second of the clip or assumed to be 30 |
| Sound | the audio track decoded, reversed, re-encoded | the whole file handed to the browser's reader, then the same |
| Out | MP4 (H.264) | MP4 (H.264) |

**The fallback is chosen by the reader failing, not by the extension.** Every
file goes to `src/demux.js` first; if it comes back with an `UnsupportedFile`,
the reason on it is what the page prints — "this is not an MP4 or MOV file",
"the video track is encrypted", "this browser will not decode
`hvc1.2.4.L120.B0` directly". A tool that says *which* thing it could not do is
worth a good deal more than one that says "unsupported file".

Both paths encode, and that is the one thing this tool cannot do without. There
is no `MediaRecorder` fallback the way there is in [`/crop-video/`](../crop-video/),
because a recorder writes frames in the order they are painted and in real
time, which is neither what a reversal needs nor what it could honestly
promise. A browser with no `VideoEncoder` is told so on an empty page, before
anybody chooses a file and waits.

## The sound, which is the part that cannot be carried across

`/crop-video/` and `/trim-video/` move the audio samples without ever decoding
them, and say so proudly: neither job changes *when* anything happens, so the
packets that arrived are written straight back out and "keep the sound" costs
nothing at all.

Reversing changes when everything happens, so there is nothing to carry. An
audio packet is a few tens of milliseconds of sound coded against the packet
before it; writing the packets out back to front does not play a track
backwards, it plays forty-six-millisecond pieces forwards in the wrong order,
which sounds like a fault. The only honest way to do it is to decode the whole
track, turn the samples round, and encode it again — so that is what
`src/audio.js` does, and the page says so rather than implying the sound came
through untouched.

Two consequences worth knowing:

- **The track is held whole.** Reversing needs the last sample before it can
  write the first, so the sound cannot be streamed the way the picture is.
  Stereo 48 kHz costs about 23 MB a minute as 32-bit float, which is the one
  real ceiling on how long a clip this tool will take.
- **AAC in, AAC out.** The re-encode is at 160 kbit/s. A browser that will not
  encode AAC — which is a real thing, and Firefox has been one — gets a video
  with no sound and a message saying exactly that, rather than a silent clip
  and no explanation.

The descriptor reading and writing (`esds`, `AudioSpecificConfig`, the `mp4a`
sample entry) are the ones written for the join in `/trim-video/`, which met
the same wall from the other side.

## Rotation

A phone films in landscape and writes a rotation into the file rather than
turning the pixels. Every player turns the picture on the way to the screen, so
what you see is portrait and what the decoder hands over is landscape.

Every frame here goes through a canvas anyway, so the turn is applied on the
way through, once, in `src/draw.js` — and the file that comes out carries no
rotation of its own, because by then there is nothing left to turn. If the
demuxer and the `<video>` element disagree about the shape of the picture, one
of them is applying a rotation the other is not; rather than guess, the exact
path stands down and the playback path — which shows you what the player
shows — takes over.

## What it spends on the picture

The picture has to be encoded again: the frames come out in an order nothing in
the original file was coded for. So the question is how many bits to spend, and
there are two ceilings, the lower of which wins:

1. the usual bits-per-pixel figure for the chosen quality, and
2. **what the source itself spent** — its own bitrate, with a little headroom:
   0.8× on "smaller file", 1.25× on "balanced", 2× on "best quality".

The second is the one that matters. A reversed clip holds exactly the same
pictures as the clip that arrived, so there is nothing new for extra bits to
describe; a phone video that arrived at 2 Mbit/s does not become better by
leaving at 6, it just becomes larger.

## Limitations

- **The picture is re-encoded, and so is the sound.** Both unavoidable, as
  above. This is the one tool here where neither half survives untouched, and
  the page does not pretend otherwise.
- **It reverses the whole clip.** No range, no partial reversal, no boomerang.
  Cut first with [the Video Cutter](../trim-video/), which does it without
  re-encoding a frame, and reverse what comes out.
- **The frame rate is guessed on the playback path.** The file's own frame
  times are not visible from outside the demuxer, so the clip is sampled at a
  fixed rate — measured off a second of playback where
  `requestVideoFrameCallback` exists, assumed to be 30 where it does not. A
  clip whose rate wandered comes out even. The page says which of the two it
  used.
- **AAC encoder delay moves.** The silence an AAC encoder puts in front of a
  track ends up at the end of the reversed one: a few tens of milliseconds, and
  only on the exact path.
- **Edit lists on the way in are ignored**, as they are in the other two video
  tools.
- **Encrypted tracks are refused**, with that as the reason.
- **The finished file is assembled in memory** before you download it, even
  though the source is not.
- **AVI, WMV, FLV and most MKVs** are not readable here and not playable in
  most browsers. That is the FFmpeg question in
  [What can be built here](../../README.md#what-needs-a-vendored-ffmpeg), not a
  gap a few more lines would close.

## The files

| | |
|---|---|
| `src/timeline.js` | the arithmetic: display order, reversed times, where the groups are, how many frames may be held. No browser needed, so it is the part with tests |
| `src/reverse.js` | the exact path: the backwards walk, the encoder, and the writing |
| `src/playback.js` | the fallback: measuring the frame rate, then a seek a frame |
| `src/audio.js` | decoding a track, turning it round, encoding it again, and the `esds` at both ends |
| `src/demux.js` | the MP4/MOV reader, copied from `/trim-video/` |
| `src/mp4.js` | the writer, copied from `/trim-video/` |
| `src/draw.js` | one frame onto a canvas, the right way up |
| `src/support.js` | what this browser will decode and encode |
| `src/main.js` | the page |

`tests/js/reverse-video.test.js` covers `timeline.js` and the sample reversal in
`audio.js`: a reversed timeline that is the same length as the one it came
from, frame times that come back in the other order, an uneven frame rate
carried across, groups found at the right frames, windows that cover a group
exactly once each, and a two-channel buffer that comes back identical after
being reversed twice.

What tests cannot cover here is the part that needs a browser: that the frames
a real decoder hands back, in a real file with B-frames, come out in the order
this arithmetic says they should. That was checked by hand — a clip counted
into numbered seconds, reversed, and watched — and it is the check to repeat
after touching `reverse.js`.
