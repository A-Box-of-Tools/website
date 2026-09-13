# Convert to MP4

[← All tools](../README.md) · [The tool](https://abox.tools/convert-to-mp4/)

Turns a WebM, an MKV, a MOV or an MP4 into the one file everything takes —
H.264 picture and AAC sound in a plain MP4 — in the browser, without the
file going anywhere. Each track is copied across untouched when it is
already what an MP4 wants, and decoded and encoded again when it is not;
the page says which before it starts, and opens the result again to check
it afterwards.

It is the roadmap's "Convert to MP4" line built as the line was worded —
"whatever came off the camera, as the file that will actually upload" —
because that is the job people arrive with. Nobody wants a different
container for its own sake; they want the file a form, a chat app or a
mail client stopped refusing.

## What "MP4" means here

One thing, deliberately: H.264 and AAC in an unfragmented MP4 with the
index at the front. The page never writes HEVC, VP9 or AV1 into the result
however good they are, and never copies a picture codec other than H.264
across even when the container would carry it. The reason is the whole
point of the tool: a file that opens in fewer places than the original is
not a conversion, and HEVC-in-MP4 or VP9-in-MP4 is exactly that on most of
the machines the file is going to. The FAQ says so in those words.

## The two readers

`shared/js/mp4-reader.js` reads MP4, MOV and M4V — the demuxer the video
tools have always shipped. `shared/js/mkv-reader.js` is new with this tool
and reads WebM and MKV, which are one format under two names, and hands
back the same shape: a video track and an audio track, each a list of
samples with an offset, a size, a decode time, a presentation time and a
keyframe flag, on a clock the track names. Everything downstream — the
re-encode loop, the copy, the writer — works from that list and never asks
which reader made it.

Three things about the Matroska reader are worth knowing before touching
it, and its header comment has the rest:

- **It walks the whole file.** There is no `moov`; the only index is the
  run of clusters, so every block header is read (never the frame) through
  the MP4 reader's eight-megabyte window. A gigabyte costs a gigabyte of
  disk reads, once.
- **Sizes may be unknown.** A recorder writes its Segment and Clusters
  before it knows how long they will be. Every screen recording made in a
  browser is such a file, and the reader ends an unknown-size cluster at the
  next top-level element and an unknown-size segment at the end of the file.
- **Decode times are worked out, not read.** A block carries only the time
  its frame is shown, and a file with B-frames stores frames in decode order,
  so `decodeTimes()` sorts the presentation times and shifts them back by the
  longest wait. The first decode time can be negative; `src/convert.js` turns
  that into the composition offsets and the edit list an MP4 uses to say the
  same thing, so the picture does not play a frame or two late against its
  sound.

`shared/js/mkv-writer.js` is the reader's mirror, and exists for two
reasons: the example button has to hand the page a WebM, and the page's own
policy forbids fetching one; and a reader is only as tested as the files it
has been shown. `tests/js/mkv-reader.test.js` pins the writer to the bytes
the specification says and then shows the reader every shape a real file
comes in — unknown sizes, laced blocks in all three encodings, BlockGroups
with and without a reference, B-frames out of order, AAC without its
configuration.

## The plan, before the button

`src/plan.js` is everything decided before a codec is opened, and is pure so
that it runs in Node and the page can speak it first:

- **`pictureJob`**: `copy` for H.264 in any spelling, `encode` for anything
  else.
- **`describeSound`**: one shape for the sound whichever reader found it —
  what a decoder would be told, whether the packets can be copied (only AAC
  can), and the sample entry to write them under. An MP4's `esds` is opened
  by `shared/js/aac.js`; a Matroska track's codec name was already turned
  into a string by the reader, and its AudioSpecificConfig is synthesised
  from the rate and channels when an old muxer left it out.
- **`soundJob`**: `none`, `copy`, `encode`, or `unknown` — the last being a
  sound the browser cannot name or decode, which the page turns into
  "leave the sound out", the one thing it can still do. A picture the
  browser cannot decode stops the conversion instead, because there is no
  MP4 without one.
- **`pictureBitrate`**: what a re-encode is asked for. It starts from what
  the source spent, scales it by how much tighter the source codec packs than
  H.264 (HEVC, VP9 and AV1 by 1.6; VP8 not at all), and holds the result
  between a floor and a ceiling per pixel per frame, so a starved source is
  not kept starved and a lavish one is not copied byte for byte into a file
  the size of the original.
- **`compositionShift`** and **`rescale`**, re-exported from
  `shared/js/copy-tracks.js`: the clock arithmetic a copy needs, tested by
  hand.

## The conversion

`src/convert.js` does the sound first - the copying itself, and the placing
of a track on the movie's clock, live in `shared/js/copy-tracks.js`, which
the rotator shares - — it is the short job, and a refusal
from the audio encoder is better met before minutes of picture have been
encoded — then the picture, then writes both with `shared/js/mp4-writer.js`.

- **Picture copied** (`copyPicture`, in the shared part): a `Blob` slice of the file for every
  frame, never read until the browser writes the result out, so a copy of a
  four-gigabyte MKV never holds four gigabytes. An MP4 source hands over its
  sample entry and display matrix whole, so what came in rotated goes out
  rotated; a Matroska source has neither, so the `avc1` entry is built round
  the `avcC` it carried and the frames are retimed on the conventional 90 kHz
  clock.
- **Picture encoded**: `shared/js/reencode-video.js`, the decode-draw-encode
  loop the compressor runs — moved to a shared part with this tool so that
  both call one copy. The frame is the source's display size, capped at 3840
  on the long edge because that is what H.264 encoders can be relied on to
  take.
- **Sound copied** (`copySound`, in the shared part): the AAC packets as they are, retimed on to
  the sample-rate clock when they came from a Matroska file.
- **Sound encoded** (`shared/js/reencode-sound.js`, shared with the rotator): streamed, packet by packet, from an
  `AudioDecoder` straight into an `AudioEncoder` inside the decoder's own
  callback, because an hour of screen recording decoded to floats is more
  than a tab should hold. More than two channels are folded to stereo — the
  mix every player does silently — since an MP4 that uploads is stereo and
  the AAC encoder in most browsers takes nothing wider.
- **Placing** (`place`, in the shared part): a track that starts later than the other on the
  file's clock gets an empty edit for the gap, and a copied picture whose
  first frame decoded is not its first frame shown gets an edit starting
  that far in. Neither is written when neither is needed, which is nearly
  always for the sound.

## The check

`verify()` in `src/main.js` opens the finished file again with the MP4
reader and holds it to three things: as long as the original (within a
quarter of a second or two per cent), H.264, and carrying a sound track
when one was promised. A converter that dropped the last second, or wrote
the sound entry without the sound, would still be an MP4; only reading the
result back can tell the difference. The result is then played from a
`blob:` URL under the download, which is what `media-src blob:` in the
tool's CSP table is for.

## The example

`src/example.js` builds an eight-second WebM in the page: the shared clip
painter's frames encoded as VP8, the shared soundtrack resampled to 48 kHz
and encoded as Opus, written by the Matroska writer with the two tracks
interleaved the way a recorder writes them. Both tracks then have to be
encoded again on the way through, which is the whole of what the page does,
shown once. VP8 rather than VP9 because every browser with a `VideoEncoder`
at all can write VP8 in software.

## Tests

`tests/js/mkv-reader.test.js` covers the reader and writer, as above.
`tests/js/convert-to-mp4.test.js` covers `plan.js` and `format.js`: which
track is copied, the bitrate arithmetic at its floor, ceiling and cap, the
frame cap, the composition shift, the sound description from both readers,
and the output name. The codecs are WebCodecs and are checked in a browser:
build the site, open the page, press "Try an example", and read the check
line.

## What it does not do

- Write anything but H.264 and AAC in MP4. See "What MP4 means here".
- Read AVI, WMV, FLV or MPEG-2, or the PCM sound some cameras write into a
  MOV; the page names what it met and, for the sound, leaves it out.
- Undo container-level compression or encryption in an MKV
  (`ContentEncodings`); such a track is refused by name.
- Write a file over 4 GB, which the writer's 32-bit offsets rule out and
  the page says so.
