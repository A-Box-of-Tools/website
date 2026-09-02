# Audio Editor

*Play it backwards, change the speed, lift a quiet recording — all of it here, on your machine.*  ·  lives at `/edit-audio/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The ninth tool, and the first one here that is about sound. It plays a
recording backwards, changes how fast it plays — with or without moving the
pitch — and sets how loud it is. Drop a video on it and you get the sound out
of it, with the picture never decoded at all.

---

## Why the file that comes out is a WAV

Because no browser ships an encoder that could write anything else, and the
alternative is sending the recording to a server that has one. That is the
trade this site does not make, so the format follows from the promise rather
than the other way round:

```
decodeAudioData  ->  Float32 per channel  ->  arithmetic  ->  header + samples
```

There is no encoder anywhere in that line. `src/shared/wav.js` is a header builder and
an interleaver, and the only lossy step in the whole tool is rounding a float to
sixteen bits at the very end — which the page offers to skip, by writing 32-bit
float instead.

It costs size: about ten megabytes a minute in stereo, against one for an MP3.
That is said on the page, next to the estimate, rather than discovered in the
downloads folder. When an FFmpeg build is vendored for the reasons in
[What needs a vendored engine](../../docs/what-can-be-built-here.md#what-needs-a-vendored-engine), `libmp3lame`
turns this into a real choice; until then, offering "MP3" would mean either
uploading or lying.

## The bug that is not in this tool, and the file that keeps it out

`decodeAudioData` does not hand back the samples in the file. It hands them
back **resampled to the sample rate of the context it was called on** — that is
what the specification says, and it is what browsers do. On a machine whose
audio hardware runs at 48 kHz, the obvious two lines

```js
const context = new AudioContext();
const audio = await context.decodeAudioData(bytes);   // 44.1 kHz file -> 48 kHz
```

quietly resample every 44.1 kHz recording in existence, invent one sample in
every nine, and hand the result to a page that then writes it out claiming
nothing was touched. Every "audio editor" that does this is wrong in a way
nobody can hear and everybody would object to if it were written down.

The fix needs the rate **before** the decode, so `src/shared/samplerate.js` reads it
out of the header and decodes on an `OfflineAudioContext` created at that rate,
which resamples nothing:

| Format | Where the rate is |
|---|---|
| WAV | the `fmt ` chunk, four bytes in |
| FLAC | twenty bits, eighty bits into STREAMINFO — it ends mid-byte |
| Ogg | the Vorbis identification header; Opus is 48 kHz by definition |
| WebM, MKV | EBML: Segment → Tracks → the first audio TrackEntry → Audio |
| MP4, M4A, MOV | the audio track's `stsd` entry, as a 16.16 fixed number |
| AIFF | an eighty-bit extended float in `COMM`, which no JS number type has |
| MP3, AAC | the frame header itself, after skipping any ID3 tag |

A format not on that list returns null, the decode falls back to 48 kHz, and
the page says so in as many words — because the honest failure is "this was
resampled on the way in", not silence.

**The interesting failure was the last row.** A raw MP3 has no header to find,
only frames, so the fallback scans for a frame sync — and eleven bits of sync
will eventually turn up inside anything. A WebM recorded by `MediaRecorder`
fell straight through to that scanner, which found something shaped like an
AAC header inside compressed Opus and reported 64 kHz for a file that is
48 kHz, `guessedRate: false`, i.e. reported as read from the file. It was found
by running the real thing in a browser rather than by a unit test, which is
exactly the class of bug the note in `tests/README.md` is about. Three things
came out of it: EBML is parsed properly, every field of a candidate frame
header has to make sense before it is believed, and the scan only looks at the
start of the file, where a raw stream keeps its first frame.

## Two ways to change the speed, and why both are here

| | **Keep the pitch** | **Let it move** |
|---|---|---|
| File | `src/stretch.js` | `src/speed.js` |
| Method | WSOLA | windowed-sinc resampling |
| 2× does | half as long, same voice | half as long, an octave up |
| Wanted for | a lecture, a podcast, a rehearsal | a tape effect, a chipmunk, a slowed sample |
| Costs | a little smearing on transients | nothing audible |

**Keeping the pitch** means cutting the recording into overlapping windows about
46 ms long and laying them back down closer together or further apart. The
whole difficulty is *where* to cut: two windows whose waves are out of step
partly cancel where they cross, which is the hollow, flanging sound that gives
cheap time-stretching away. So each window may slide about 6 ms either side of
where the arithmetic puts it, and the position taken is the one whose overlap
best matches the natural continuation of the window already laid down.

Searching every offset at full resolution is 22 million multiply-adds per second
of output, which is a four-second wait on a three-minute track. Searching a
signal averaged down by four and then refining over the few samples between the
coarse steps finds the same offset for about a tenth of the arithmetic. The
windows are added up into the output and then divided by how much window was
actually laid down, which is what keeps the first and last fiftieth of a second
at full level instead of fading in and out.

**Letting the pitch move** is a resample, and the obvious implementation is the
one that sounds bad. Reading every other sample to play something twice as fast
folds everything above a quarter of the sampling rate back down into the
audible band as a metallic ring, and nothing removes it afterwards. So the
samples are read through a windowed sinc kernel whose cutoff moves with the
speed — band-limit first, decimate second. Measured on a 15 kHz tone at 4×,
that is 4.5 × 10⁻⁶ of full scale where the naive version leaves a clearly
audible tone.

The kernel is tabulated once at module load, because the alternative is a
`Math.sin` per tap per output sample and a four-minute track has 600 million of
those.

## Reversing and the level, which are exact

Both are claimed on the page to be perfectly reversible, and both are:

- **Reversing** writes the samples out in the other order. Reverse twice and the
  file is the one that went in, sample for sample. It is also the one edit here
  that needs no decisions at all.
- **The level** multiplies every sample by one number. Up 6 dB and back down
  6 dB lands on the samples that went in. Nothing is clamped on the way — a
  sample pushed past full scale stays past it, so a 32-bit float export carries
  it out intact and it can be pulled back down in an editor.

What the page adds is the warning. Digital audio has a hard ceiling, and a
16-bit WAV has to flatten anything above it, which is what distortion sounds
like. So the summary says where the loudest moment will land *before* the
button is pressed, and the result line afterwards says how many samples went
over. "As loud as it will go" is peak normalisation — the one form of "make it
louder" that cannot clip, because it works out the room left and uses exactly
that much.

The three edits run in one order, and it is not a preference:

```
reverse  ->  speed  ->  level
```

Reversing first means the stretcher's windows are chosen on the samples that
will actually be heard. The level goes last because it is the only step whose
result can be measured against full scale, and measuring it before a resample
would report a peak the file will not have.

## Video in, audio out

The same job as opening an MP3, and for a reason worth stating: only the audio
track is ever asked for. There is no `VideoDecoder` on this page, no canvas, and
no code that could look at a frame — the browser's own demuxer hands over the
sound and the picture is never decoded. It is also how to save the audio from a
clip without editing it at all: leave every setting alone and press the button.

## Limitations

- **Memory, not length.** The whole recording is decoded into the page at once
  and the WAV is assembled in memory before the download, so an hour of stereo
  wants something under a gigabyte to work in. A WAV over 4 GB is refused
  outright rather than written, because the format's own size field cannot
  describe one.
- **Nothing is trimmed here.** Marking a section and keeping it is the next
  audio tool, not a setting on this one.
- **Peak normalisation, not loudness.** Matching two tracks by how loud they
  *sound* is LUFS, and it involves deciding on the listener's behalf which parts
  to squash. This tool only ever multiplies.
- **A speed past 4× or under 0.25×** is not offered. The stretcher can do it;
  what comes out stops being a speed change and starts being an effect.
- **The formats are the browser's.** AVI, WMA and most MKVs are refused with a
  message rather than failing halfway through, which is the same line every
  other tool here draws.

## Testing it

`tests/js/audio-*.test.js`, run by `node --test` with everything else. The WAV
writer is a round trip — write the file, read the header and the samples back,
check they are what went in, including the two clamping limits. The sample-rate
sniffer gets a hand-written fixture per format and a refusal per way of being
wrong. The two speed paths are measured rather than inspected: a Goertzel filter
asks what frequency is actually in the output, which is how "2× resampled puts
the tone an octave up" and "2× stretched leaves it exactly where it was" are
checked rather than asserted.

What the tests cannot cover is `decodeAudioData`, which needs a browser. That
half was run in one — modules imported into a page, a WAV built in the page and
a WebM recorded by `MediaRecorder` fed through the whole pipeline, and the
result decoded again by the browser to confirm the file is real: 2 s at 1.5×
comes back as 1.3333 s, reversed so the quiet half is first, normalised to
exactly −1 dBFS, with the tone still at 440 Hz and nothing at 660. That is also
the run that caught the WebM sample-rate bug above.
