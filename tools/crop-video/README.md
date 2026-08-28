# Video Cropper

*Cut a clip down to the part that matters.*  ·  lives at `/crop-video/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The fourth tool. It cuts a clip down to a rectangle you drag over it, keeps the
timing and the sound, and never uploads a byte of it.

---

## Two paths, and why there are two

A cropper is only as useful as the list of files it will accept, and there is no
single browser API that both opens everything and does the job properly. So
there are two paths, and the tool picks the better one it can use for the file
in front of it.

| | **Exact** | **Recording** |
|---|---|---|
| Accepts | MP4, M4V, MOV, in any codec `VideoDecoder` will open | anything the browser will *play* |
| How | demux → `VideoDecoder` → crop on a canvas → `VideoEncoder` → MP4 | play it, draw each frame cropped, `MediaRecorder` the canvas |
| Speed | as fast as the machine goes | real time; a four-minute clip takes four minutes |
| Timing | the original frame times, to the tick, variable frame rates included | approximate; driven by playback |
| Sound | copied across sample by sample, never decoded | captured from playback and re-encoded |
| Out | MP4 (H.264) | WebM, or MP4 on Safari |

The exact path is the one to want, and the recording path is why the tool has no
"unsupported format" dead end for anything the browser itself can open. The page
says which one it is using and why, in those words, rather than quietly being
five times slower on some files than others.

**The fallback is chosen by the reader failing, not by the extension.** Every
file goes to `src/demux.js` first; if it comes back with an `UnsupportedFile`,
the reason on it is what the page prints — "this is not an MP4 or MOV file",
"the video track is encrypted", "this browser will not decode
`hvc1.2.4.L120.B0` directly". A tool that says *which* thing it could not do is
worth a good deal more than one that says "unsupported file".

## What "most formats" actually means

| Container | What happens |
|---|---|
| MP4, M4V, MOV | read directly, both layouts — the plain one and the fragmented one a browser's own recorder writes |
| WebM | played and recorded, because there is no Matroska reader here |
| MKV, AVI, WMV, FLV | only if the browser plays them, which mostly it does not. Refused with a message |

Inside an MP4 the codec matters more than the container:

| Codec | Read by |
|---|---|
| H.264 (`avc1`, `avc3`) | everywhere WebCodecs exists |
| HEVC (`hvc1`, `hev1`) | wherever the machine's own decoder will take it — which is what makes iPhone footage work without Safari |
| AV1 (`av01`), VP9 (`vp09`) | recent Chrome, Edge and Firefox |

Output is always H.264 in an MP4, or VP9/VP8 in a WebM on the recording path.
Those are what plays everywhere, and this tool changes the shape of a video
rather than its format — converting is a different job and will be a different
tool.

## The reader

`src/demux.js` walks an ISO base media file and hands back a flat list of
samples: where each one is in the file, how big it is, when it is shown, and
whether it is a keyframe. Written by hand, like the muxer it sits beside,
because the build assembles pages and never touches `src/`.

Three things in it are worth knowing:

- **It reads both layouts.** A plain MP4 keeps one table at the front saying
  where every sample is. A fragmented one — what `MediaRecorder`, and a great
  deal of camera and streaming software, writes — keeps a small table in front
  of each fragment instead, with the defaults in `trex` back in the header.
  Supporting only the first would have sent a large share of ordinary files down
  the slow path, and the second is about a hundred lines.
- **The file is never read into memory whole.** `FileWindow` reads a few
  megabytes around whatever sample is being asked for, and the samples are asked
  for in file order, so a two-gigabyte clip costs one window at a time. This is
  the one kind of file on this site that would not have fitted otherwise.
- **A file it cannot read is a fallback, not a failure.** Every refusal carries a
  reason in plain words, and the app prints it.

## The audio survives, exactly

Cropping does not change how long a clip is or when anything in it happens, so
the sound that arrived can be written straight back out. On the exact path the
audio samples are copied across untouched, and so is the `stsd` sample entry
that describes them — read out of the source file as bytes, written back as
bytes. Nothing in this repository parses `esds`, understands AAC, or turns a
sample back into sound. It cannot: there is no code that could.

That is worth stating plainly because "keeps the audio" usually means "decodes
and re-encodes the audio", which costs quality on every pass. Here it costs
nothing, and it works for whatever was in the file, not only for the formats
somebody remembered to handle.

`src/mp4.js` grew the two-track support this needs:

- one video track and, optionally, one audio track;
- samples interleaved into chunks of about a second, so a player does not have
  to hold the whole video to reach the start of the sound;
- an **edit list** on any track that does not start with the others. Tracks do
  not always begin together, the sample tables have no way to say so, and
  leaving that gap out is exactly how a crop ends up half a second out of sync
  with itself;
- `moov` before `mdat`, so the file plays without seeking to the end;
- 32-bit offsets, which caps output at 4 GB with a clear error past it.

## Rotation, which is where a cropper usually goes wrong

A phone films in landscape and writes a rotation into the file rather than
turning the pixels. Every player turns the picture on the way to the screen, so
what you see is portrait and what the decoder hands over is landscape.

Get this wrong and the crop box lands on a rotated copy of what the user was
looking at, which is the worst kind of bug: it produces a plausible video of the
wrong part of the picture. So:

- the rotation is read off the track's display matrix;
- the frame is turned in `src/draw.js` before anything is measured against it,
  so the crop box, the preview and the encoder all work in the same coordinates
   — the ones you can see;
- the output carries no rotation of its own, because by then there is nothing
  left to turn.

There is a check for this in `src/main.js` as well: if the demuxer and the
`<video>` element disagree about the shape of the picture, one of them is
applying a rotation the other is not, and rather than guess, the exact path
stands down and the recording path — which is what you are looking at — takes
over.

## Lining up the crop

The box is state in the video's own pixels: "1080 × 1080 starting 420 across",
not "38% of the way in". It is *drawn* in percentages of the preview, which is
what lets the window be resized, the phone be turned, or the preview swap
between a playing video and a decoded still without the rectangle moving.

- Drag inside it to move, any of eight handles to resize, and the anchor —
  the corner opposite the one being dragged — is what stays still.
- Lock it to a shape (1:1, 4:5, 9:16, 16:9, 4:3, 3:2, the source's own, or
  free) and it stops when it runs into the edge of the picture rather than
  sliding along it. **Typing an exact box releases the lock**, and the buttons
  say so, rather than the page going on claiming a lock the box no longer keeps.
- Arrow keys nudge it a pixel; <kbd>Alt</kbd> and the arrows resize it.
- Width and height only ever come out even, because H.264 has no way to store a
  frame with an odd number of pixels on a side. Rounding after the fact would
  mean the numbers on the page were not the numbers used.

**When the browser will not play the file at all** — an HEVC clip in a browser
with no licence for one — the preview is a frame decoded by WebCodecs and drawn
on a canvas instead, and the page says so. The crop is unaffected either way.

## Choosing the frame to line it up against

A crop is decided against one moment of the clip, and the first frame is rarely
that moment: the subject walks into shot, the camera settles, the title card
ends. So under the picture there is a transport — a frame back, play and pause,
a frame on, and a slider through the clip — and whatever it lands on is what
the box is drawn over.

The player's **own controls are gone**, and that is the point rather than a side
effect. A native control bar sits inside the picture, across the bottom of the
very rectangle being dragged: it covers the box's lower handles, takes clicks
meant for the box, and offers a fullscreen button that pulls the video out of
the stage the box is positioned against. Playback belongs under the picture, not
over it.

The slider is counted in milliseconds and **stepped by one frame**, so the arrow
keys move it exactly as the buttons beside it do. The step is the clip's average
frame rate, not its frame table — close enough to line a box up with, and not
what the encoder is told; the crop itself is still applied to every frame the
file holds.

On the decoded-still path the same three controls do the same three things, only
each move decodes a fresh frame rather than seeking a player. Requests collapse
instead of queueing — a drag asks for a hundred frames and only the last one is
worth having — and a decode that takes more than a moment says so over the
picture, because what needs explaining is why the picture has not changed yet.

## What it spends on the picture

The picture has to be encoded again: a cropped frame is a different picture, and
there is no way to store it without writing the pixels out afresh. Only the
sound survives untouched.

So the question is how many bits to spend, and there are two ceilings, the lower
of which wins:

1. the usual bits-per-pixel figure for the chosen quality, and
2. **what the source itself spent on the same area** — its own bitrate, scaled
   by how much of the frame was kept, with a little headroom.

The second is the interesting one. Most clips people crop are already
compressed; a phone video that arrived at 2 Mbit/s does not become better by
leaving at 6, it just becomes larger. The headroom above the source figure is
what covers the loss of a second pass: 0.8× on "smaller file", 1.25× on
"balanced", 2× on "best quality".

## Limitations

- **The picture is re-encoded.** Unavoidable, as above. The sound is not.
- **It crops and nothing else.** No resizing, no rotating. The clip that comes
  out is exactly as long as the one that went in; trimming is
  [its own tool](../trim-video/) now, at `/trim-video/`.
- **Edit lists on the way in are ignored.** A file that says "start playing 40
  milliseconds in" is read from the first sample instead. Honouring one properly
  means honouring all of them, including the ones that reorder a track.
- **Encrypted tracks are refused**, with that as the reason. Nothing here can
  decrypt them and a garbled result would be worse than an honest refusal.
- **The recording path needs the tab in front.** Browsers stop painting a hidden
  tab, and canvas capture stops with it. The tool notices, keeps going off a
  timer rather than producing a one-frame video, and says afterwards that some
  frames may be uneven.
- **The finished file is assembled in memory** before you download it, even
  though the source is not. A very long 4K crop is bounded by that.
- **AVI, WMV, FLV and most MKVs** are not readable here and not playable in most
  browsers. That is the FFmpeg question in
  [What can be built here](../../docs/what-can-be-built-here.md#what-needs-a-vendored-engine), not a gap that a few
  more lines would close.

## Testing it

There is no test runner in this repository, so the checks used while writing
this are not checked in. What they covered, if it needs doing again — all of it
run in the browser against files generated in the page, so nothing had to be
committed as a fixture:

- an MP4 written by `src/mp4.js` from `VideoEncoder` output, played back by the
  browser, then read again by `src/demux.js`: 45 samples in, 45 out, keyframes
  and frame times intact;
- a crop of a known picture, decoded again and sampled pixel by pixel, to prove
  the rectangle that comes out is the rectangle that was drawn — including after
  the `tkhd` matrix was patched to 90°, where the numbers only line up if the
  rotation is applied before the crop and not after;
- a fragmented MP4 with AAC sound, recorded by the browser's own
  `MediaRecorder`: 60 video samples and 114 audio samples in, the same counts
  out, at the same channel count and sample rate;
- the same file with its audio shifted half a second later, which must produce
  an `elst` and a file half a second longer — and must not when the tracks start
  together;
- the recording path on a WebM whose colour changes a second in, checked by
  seeking the result and reading a pixel at 0.3 s and at 1.6 s;
- the interface end to end: a file fed to the picker, the ratio buttons, an odd
  width typed in by hand, a crop larger than the frame, cancelling mid-export
  and cropping again afterwards, and a text file dropped in to be refused.
