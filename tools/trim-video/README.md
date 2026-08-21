# Video Trimmer & Joiner

*Keep the parts that matter, in the order you want them, without losing a single byte.*  ·  lives at `/trim-video/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The seventh tool. It cuts clips down to the sections you mark, takes sections
out of the middle of them, and puts several of them together into one file —
and on the normal path it does all of it without decoding a single frame.

---

## Why this one is not just the cropper with different arithmetic

A crop changes what every frame looks like, so every frame has to be written
again. That is unavoidable, and the cropper's page says so.

A trim changes nothing about any frame. The picture you keep is the picture that
was already there, already encoded, sitting in the file. So the honest
implementation is not "decode, cut, encode" — it is "work out which samples,
and write them back":

```
demux  ->  choose a run of samples  ->  write the tables  ->  Blob
```

No decoder is opened. No encoder is opened. `src/copy.js`, which is the whole of
the normal path, is under two hundred lines, and most of them are comments.

That has a consequence worth stating plainly, because it is the reason to use
this rather than a site that runs FFmpeg on a server: **there is no quality
setting on the default path, because there is nothing that could cost quality.**

It has a second consequence that is easy to miss. Copying frames does not
require being able to *decode* them, so this path works for codecs the browser
has no decoder for at all. A Chrome build with no HEVC licence will still trim
an iPhone clip losslessly; it simply cannot show you a preview of one.

## Three paths, and when each is used

| | **Copy** | **Exact** | **Recording** |
|---|---|---|---|
| Needs | the MP4 reader | the reader, plus WebCodecs | a browser that plays the file |
| Reads | MP4, M4V, MOV | the same | anything playable |
| Picture | untouched | re-encoded to H.264 | re-encoded, from playback |
| Sound | untouched | untouched, unless the clips disagree | re-encoded |
| Starts | at your mark, through an edit list | at your mark | at your mark |
| Speed | as fast as the file writes | faster than real time | real time |
| Sections | any number | any number | one |
| Clips | any number, if they agree | any number | one |

The page picks the leftmost one the files allow, and says which it picked. The
"if they agree" is the whole of what joining adds, and is spelled out below.

## The keyframe problem, and the edit list that solves it

Most frames in a video are stored as a description of how they differ from their
neighbours, so they cannot be decoded on their own. Only a keyframe can, and
keyframes are typically one to ten seconds apart. A cut that copies frames must
therefore begin at one.

The usual answers are both bad. Snapping the cut back to the keyframe gives you
seconds of footage you asked to lose. Snapping it forward loses footage you asked
to keep.

The format has a third answer, and it has had it since 2001. The `elst` box
names, for each section, a point in the media and how long to play from there.
So the tool writes the run of frames **from the keyframe**, which is the only run
that decodes, and then writes an edit list saying to start at your mark. The
extra frames are in the file, are needed to decode the ones after them, and are
never shown.

```
media:   [K····························]      frames from the keyframe
elst:          ^--------------------^         "start here, play this long"
```

The result is a cut that is exact, in every player that implements edit lists —
which is every mainstream one — with nothing re-encoded. What it costs is
honesty about the players that do not: the page names the pre-roll in seconds
before you export, and offers the exact path for anyone who would rather
re-encode the opening than carry it.

## Taking a section out of the middle

This is the job people actually want and rarely find, and it falls out of the
same machinery: the two ends of the clip become two sections, they are written
into one media timeline one after the other, and the edit list gets two entries
instead of one.

Everything downstream of `src/ranges.js` deals in a *list* of sections for that
reason alone. "Keep this" is one section; "cut this out" is the two either side
of it, minus any that a mark at the very start or end of the clip makes empty.

The recording path cannot do it, because a recording is made in one pass from
one playhead, and seeking mid-recording would leave a hole in the sound where
the seek was. The tool disables that combination and says why rather than
producing a clip with a gap in it.

## Joining, which is the same trick asking a second question

Trimming asks one thing of a file: *which samples*. Joining asks that and then a
harder one — **may these samples share a track at all?**

A track in an MP4 is described once, at the front: which codec, which profile,
which resolution, which parameter sets. Every sample in that track is decoded
against that one description. So two clips can share a track only if they share
it byte for byte, and where they do, joining costs exactly what trimming costs,
which is nothing: the frames of every clip are moved into the new file as they
are, one clip after another.

Where they do not, there is no honest way to avoid decoding, and `src/clips.js`
refuses rather than guesses. That refusal is the point of the file. Handing a
player the wrong sample entry does not raise an error — it shows a smear of
green blocks halfway through, which is far worse than a message saying *tall.mp4
is 120x240 and the first clip is 320x120*. The checks are strict on purpose: a
sample entry differing by one byte is a different SPS.

### The seam

Two files need not count time at the same rate — 30000 ticks a second and 90000
are both ordinary — so there is no shared tick to lay them out on. The seam is
measured in seconds and each clip is rescaled onto the output's clock as it is
written.

Durations are then taken from the times rather than rescaled one at a time,
because `stts` defines the timeline as a *sum of durations*: if the durations and
the decode times disagree, the times lose and the sound walks away from the
picture, one clip at a time. Taking each duration as the gap to the next sample
makes the two agree by construction, and the rounding of a seam lands in a single
sample instead of accumulating.

### Clips that are not the same shape

A joined file has one frame size for all of it, so a portrait clip in a landscape
join has to go somewhere. It goes in the middle, at the largest size that fits,
with the rest of the frame painted first — never stretched, because a face made
30% wider for the middle third of a video cannot be undone afterwards.

The painting is not decoration. One canvas is reused for every frame of every
clip, so a bar left unpainted is not black; it is whatever was drawn there last,
which is the previous clip. That bug shipped into a test run here and is the
reason `drawFitted` fills before it draws.

### The sound, when the clips disagree about it

Different sample rates, or channel counts, or encoder settings, cannot share one
audio track either — and unlike the picture there is no "fit it inside" to fall
back on. So `src/audio.js` does the one thing the rest of this tool never does:
opens the sound. `mp4a` wraps an `esds`, which wraps a chain of MPEG-4
descriptors, the innermost of which is the AudioSpecificConfig an AAC decoder
needs. Each clip's sound is decoded, resampled to a common rate through the
browser's own `OfflineAudioContext`, laid end to end, and encoded once — and a
clip with no sound at all contributes silence for exactly as long as its picture
runs, so nothing after it drifts.

That path is the exception the page is careful to name. Everywhere else, "keep
the sound" means the samples are moved without ever being turned back into
sound.

## Keeping the sound in step

The video clock and the audio clock are different clocks, and a trim is exactly
the operation that will expose any confusion between them.

Two rules keep it straight, and both are in `planRange` in `src/ranges.js`:

1. **Both tracks are cut from the same instant.** Not from your mark — from the
   keyframe the video has to start at. If the sound started at your mark while
   the picture started a second earlier, then any player ignoring the edit list
   would run them a second apart. Cutting both from the same instant means the
   file is in sync whether the edit list is honoured or not.
2. **Both tracks get an edit entry pointing at the same instant**, each
   expressed in its own timescale. That is what trims the shared pre-roll off
   the front, on both tracks, by the same amount.

The audio samples themselves are copied byte for byte on both MP4 paths. Nothing
in this repository decodes them, which is also why "keep the sound" costs
nothing at all — including on the exact path, where the picture *is* re-encoded
and the sound still is not.

## Rotation, which is where a trimmer usually goes wrong

A phone films in landscape and writes a rotation into `tkhd` rather than turning
the pixels. A trimmer that rebuilds the header and forgets that box hands back a
clip on its side, and it is the single most common bug in this class of tool.

The copy path does not rebuild that box so much as carry it: the 36 bytes of
display matrix and the two fixed-point sizes after it are read out of the source
`tkhd` and written into the new one unexamined. There is no code path that could
get the rotation wrong, because there is no code that interprets it.

The exact path cannot do that — its frames have been through a canvas and are
already upright — so it writes an identity matrix, which is correct for pixels
that need no turning.

## What the timeline draws, and why

- **Every keyframe, as a faint tick.** They are the only places the copy path can
  begin, so showing them beats explaining afterwards why a cut started early.
- **Marks that snap to frames.** A cut between two frames does not exist; it has
  to become one or the other, so it may as well become the one you were shown.
  The arrow keys step exactly one frame, taken from the frame table rather than
  from an assumed frame rate, so a clip shot at 23.976 steps correctly.
- **`i` and `o`**, because that is what every editor since the tape machines has
  used for setting an in point and an out point.

## Why the copy path barely reads the file

A sample is stored as `file.slice(offset, offset + size)` — a `Blob`, which is a
promise to read those bytes later, not the bytes. The finished MP4 is assembled
out of those promises, and the browser reads each range for the first time as it
writes the download.

So cutting one minute out of a four-gigabyte recording costs roughly what
writing that minute costs. Nothing else is read, and nothing is held in memory
but the tables.

## Limitations

- **A copy starts at a keyframe.** Discussed above. It is exact in any player
  that implements edit lists, and up to a keyframe interval early in one that
  does not. The page says which case you are in, in seconds, before you export.
- **Seeking near a join can be loose.** A file with two sections carries a
  two-entry edit list, and Chrome's *seeking* across the boundary lands within
  about a tenth of a second rather than exactly. Playback across the join is
  frame-exact; it is the scrubber that is approximate, and the file itself is
  correct — `elst`, `stts` and `stss` all check out when it is read back.
- **The exact path re-encodes the picture**, which the copy path never does.
  The sound is untouched either way, unless the clips being joined disagree
  about theirs.
- **A lossless join needs clips that already agree.** Same codec, same
  resolution, same rotation, byte-identical sample entry. Clips off one camera
  or one screen recorder normally do; clips from different places normally do
  not, and are re-encoded instead. The page names which clip disagrees and about
  what, rather than reporting a generic failure.
- **A join between clips whose sound differs re-encodes the sound**, because one
  track carries one description and there is no way to put two sample rates into
  it. That is the only path in this tool where the audio is decoded at all, and
  it needs a browser that will encode AAC — Chrome and Edge will; where one will
  not, the join is written without sound and says so.
- **Edit lists on the way *in* are ignored.** A source that says "start playing
  40 milliseconds in" is read from its first sample instead. Honouring one
  properly means honouring all of them, including the ones that reorder a track.
- **Encrypted tracks are refused**, with that as the reason.
- **The recording path keeps one section, and needs the tab in front.** Browsers
  stop painting a hidden tab and canvas capture stops with it. The tool notices,
  keeps going off a timer rather than producing a one-frame video, and says
  afterwards that some frames may be missing.
- **The finished file is assembled in memory** before you download it, even
  though the source is barely read at all.
- **AVI, WMV, FLV and most MKVs** are not readable here and not playable in most
  browsers. That is the FFmpeg question in
  [What can be built here](../../README.md#what-needs-a-vendored-ffmpeg).

## Testing it

There is no test runner in this repository, so the checks used while writing
this are not checked in. All of them ran in the browser against files generated
in the page, so nothing had to be committed as a fixture. What they covered, if
it needs doing again:

- a 90-frame, three-second H.264 MP4 written by `src/mp4.js` from `VideoEncoder`
  output, with keyframes at 0 s, 1 s and 2 s, played back by the browser to prove
  the muxer's output is a real file before anything was cut out of it;
- a copy of 0.5 s → 2.2 s from that clip: 66 samples written, `mdhd` reporting
  2.2 s of media, `elst` reporting `{media_time 0.5 s, duration 1.7 s}`, `tkhd`
  reporting 1.7 s — and the browser agreeing, at `video.duration === 1.7`;
- the *content* of that cut, checked by seeking the result and turning a pixel
  back into the frame number that painted it: the first frame shown is frame 15,
  not frame 0, which is the edit list being honoured rather than merely written;
- the same clip with 0.5 s → 2.2 s **removed**: 45 samples, a two-entry `elst` of
  `{0, 0.5 s}` and `{0.7 s, 0.8 s}`, sync samples at exactly the two section
  starts, and a 1.3 s result — then played through and sampled every 40 ms, which
  is where the join was confirmed frame-exact and the seek was found to be loose;
- a fragmented MP4 with AAC sound, recorded by the browser's own
  `MediaRecorder`, to cover the second container layout: 149 video samples and
  231 audio samples read, and a trim of it landing both tracks' `elst` entries on
  the same instant — 39000 ticks at a video timescale of 30000, 62400 at an audio
  timescale of 48000, both 1.3 s;
- the exact path over the same marks, which must produce the same length by a
  completely different route, and does;
- the recording path over a one-second section, which must seek to the start
  before it begins and stop at the end mark rather than at the end of the clip;
- the interface end to end: a file fed to the picker, times typed into the mark
  fields in both `1:07.5` and `67.5` form, the mode switched with the marks
  already set, and the "cut the section out" option correctly disabling the
  recording path.

Joining added a second round, and `tests/js/trim-video-join.test.js` holds the
part that can be checked without a browser — the refusals, the seam arithmetic,
and a round trip through the `mp4a`/`esds` writer and reader. What needed a real
browser, run against clips generated in the page:

- two clips off the same encoder joined by copying: 2.0 s out, the seam exactly
  at 1.0 s, and sampling pixels back to frame numbers shows both clips playing
  in full and in order;
- reordering the clips reordering the file, and a clip with nothing marked
  dropping out of the join rather than contributing nothing;
- a 320x120 clip joined with a 120x240 one, which must refuse to copy and say
  which clip disagrees and about what — then re-encode, with the tall clip
  fitted inside the wide frame. **This is where the letterbox bug was found**:
  the bars carried the previous clip's pixels, because the canvas was never
  cleared;
- a join between clips at 48 kHz and 44.1 kHz, which must decode both, resample,
  and write one 48 kHz AAC track — read back afterwards by this repository's own
  demuxer and parsed to a valid decoder configuration. **This is where the second
  bug was found**: the audio ranges were being planned only for the copy path, so
  the encoder was handed nothing and then blamed the browser for it;
- the single-clip trim, run again after all of the above, to prove a join of one
  is still just a trim.
