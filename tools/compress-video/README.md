# Compress a video

[← All tools](../README.md) · [The tool](https://abox.tools/compress-video/)

Brings a video under a number of megabytes, in the browser, without the video
going anywhere: the picture decoded, drawn smaller and encoded again with
H.264 at the bitrate the number allows; the sound copied through untouched;
the result measured and reopened before it is offered.

It is the roadmap's "Resize" line built the way the line was worded — "down
to a size that will actually send" — because that is the job people arrive
with. Nobody wants a smaller video; they want a video under the limit a chat
app, an email or a form put on them, with as little lost as the limit allows.

## The number is the point

`src/plan.js` is the whole of what the page decides before the encoder
starts, and it is pure arithmetic so that it can be tested in Node and shown
on the page before a frame is decoded:

1. **The budget.** Target bytes, minus the sound (copied as it is, so it
   costs what it costs), minus what the container spends on its tables,
   spread over the length of the clip, times a safety margin — an encoder
   lands near a bitrate rather than on it, and 25.4 MB when 25 was the point
   is a file that still will not send.
2. **The ladder.** A bitrate is worth something only relative to the pixels
   it paints, so the frame is stepped down a ladder of the sizes people know
   (3840, 2560, 1920, 1280, 960, 854, 640, 480 on the long edge) until each
   frame gets at least `BPP_FLOOR` bits per pixel, and never up. The floor is
   a judgement — where H.264 on real footage stops looking like footage — and
   it is one named number so that it can be argued with. The visitor can
   overrule the rung; the rung is still a ceiling.
3. **The refusals.** A target the sound alone would not fit, or one under
   which nothing watchable fits, is refused with the least target that would
   work, so the page can say what to change rather than only "no".
4. **The retune.** If the measured file is over the number, the bitrate is
   scaled by how far it missed (and a little more), and the clip is encoded
   once more. Two passes are always enough; a third would be chasing the
   encoder's rounding.

## What is in `src/`

| File | What it does |
|---|---|
| `main.js` | the page: loading, the number and its live estimate, the run, the measure-and-retune loop, the check afterwards |
| `plan.js` | the number to a frame size and a bitrate; pure, tested in Node |
| `encode.js` | the whole clip through `VideoDecoder`, a canvas and `VideoEncoder`, and the sound copied round it |
| `format.js` | bitrates, frame names and the file name as words |
| `example.js` | asks `shared/js/example-video-sound.js` for an eight-second clip with sound |

Everything else is shared: the demuxer six tools use, the writer that puts a
re-encoded picture beside a copied sound track, the codec probes, the wait
that keeps a feed loop behind the codecs, and the frame canvas.

## The encode path, and the two rules it keeps

`encode.js` is the trimmer's exact path with the cuts taken out. Every video
sample in file order (which is decode order) goes into a `VideoDecoder`; every
frame it hands back is drawn on to one canvas of the output size — turned the
way the file asks, so a phone's portrait clip comes out portrait with no
rotation left in the file — and handed to a `VideoEncoder` configured for
H.264 at the planned bitrate, `bitrateMode: 'constant'`, a keyframe every two
seconds. Chunks are kept until the end and written with durations worked out
from the gap to the next. The sound is sliced out of the source file sample by
sample and written into the new one with the same clock.

Two rules from the tools before this one:

- **A decoded frame is drawn and closed inside the decoder's callback, never
  held.** The decoder hands out surfaces from a small pool and stops dead
  while the page holds them. The reverser learned this the hard way.
- **The feed loop waits for both codecs to drain below a small queue, and
  gives up with a phrase key after thirty seconds without progress**, so a
  browser whose encoder never answers gets a sentence rather than a page that
  says "Preparing…" for ever.

## What it writes

MP4 with H.264, always, and the sound track as it came. The site ruled out
promising WebM some time ago (`ROADMAP.md`, "…or WebM"): writing it through
WebCodecs is not dependable outside Chromium, and MP4 is the format a file
that has to send needs anyway.

## The check afterwards

The finished bytes are demuxed again and held to two things: the length is
within two per cent (or a quarter of a second) of the original, and the size
is under the number. A file that failed the first hides the download; one that
passed the first but not the second — the encoder would not go lower at that
frame size — is offered with the check line saying so, since it is still the
smallest file this frame size can make and the page names what to change.
The result plays from memory under the download.

## How this is tested

`tests/js/compress-video.test.js` pins the arithmetic: the budget against a
hand calculation, the two refusals and the least target they name, the ladder
at rich, modest and starved bitrates, the visitor's rung honoured and capped,
even-number frames that keep their shape, the estimate under the target, the
retune, and the words. The encoder is WebCodecs and is checked in a browser,
where the example clip (960×540, eight seconds, with sound, about 2 MB) is
brought to a quarter of its size and the result read back: right length,
under the number, sound track present, playable.

## What it cannot do

- **Read WebM, MKV or AVI.** The demuxer is MP4/MOV; the page says so.
- **Write anything but H.264 in MP4.** By design; see above.
- **Encode on a browser without `VideoEncoder`.** Chrome, Edge and Safari
  have it; Firefox from 130. The page says which.
- **Keep the picture unchanged.** A compressed video is a re-encoded one, and
  the page says so in the pledge, the results and the FAQ.
