# Audio Trimmer

*Mark the parts worth keeping as it plays. Get them back as one recording.*  ·  lives at `/trim-audio/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

The [video cutter](../trim-video/)'s shape, applied to sound. You listen to a
recording and mark every part worth keeping as it plays; it gives those parts
back as one file, cut on the sample you marked.

---

## The shape of it, which is the whole point

Most online audio trimmers give you one pair of handles and ask which single
stretch to keep. That is fine for topping and tailing a jingle and no use at all
for the job people actually sit down to do: listen to an hour of interview
**once**, mark the six answers worth having as they go past, and get those six
back as one file with the rest gone.

So a recording here holds a *list* of marks rather than a selection:

- **`i`** opens a part at the playhead. Pressing it again before you have closed
  that part moves the start rather than opening a second one — which is what you
  want when you meant to catch the run-up and pressed a beat too early.
- **`o`** closes the open part at the playhead.
- **`u`** takes the last one back. **Space** plays and pauses, the arrow keys
  jump five seconds, **Shift** with an arrow moves ten milliseconds, and the
  playback speed drops to half for a moment that is hard to catch.

Every closed pair becomes a row you can replay on its own, retime by typing an
exact time, reorder or delete, and a band drawn on the waveform that you can
drag by either end. The total of their lengths is what the finished recording
will run to.

The same list answers the opposite question. **Cut them out** inverts it: mark
the ums, the phone ringing or the false starts, and what is left is joined up
without them. `invertRanges` in `src/trim.js` is the whole of that, and it is
the same nine lines whether one part was marked or twenty.

## What this tool does *not* have to apologise for

The video cutter's page spends most of its words on one constraint: a video
frame is usually stored as a description of how it differs from its neighbours,
so a cut that copies frames has to begin at a keyframe, so it sometimes begins
earlier than you asked.

Sound has no equivalent. A decoded recording is a run of numbers and each one
stands entirely on its own, so a cut can land on any sample at all. There is no
rounding, no pre-roll, no edit mark that some players honour and others ignore,
and nothing for the summary line to warn about. `src/trim.js` turns a mark into
a sample index with one multiplication and one `Math.round`, and the page shows
the number.

That is worth stating in the code as clearly as on the page, because the
absence of a caveat is invisible: somebody reading this after the video tool
will be looking for the catch, and the honest thing is to say where it is
instead.

## The catch that does exist: joins click

Cutting from the middle of one word to the middle of another puts two unrelated
waveforms next to each other. The last sample of one piece and the first sample
of the next have no relationship, so the waveform can jump most of its range in
a single sample, and a speaker asked to make that jump makes a click.

It is not a fault in the cut. It is what a discontinuity sounds like, and it
happens with a perfectly exact cut of a perfectly clean recording.

The fix is a ramp to silence either side of every join — five milliseconds by
default, which is about 240 samples at 48 kHz. Long enough that the click is
gone completely; far too short to be heard as a fade. Twenty and fifty
milliseconds are offered for music, where the thing being interrupted is a
sustained note rather than a syllable.

`planSections` decides where the fades go, and the interesting half of it is
where they do **not**:

```js
fadeIn:  from > 0            ? Math.min(wanted, cap) : 0,
fadeOut: to   < totalFrames  ? Math.min(wanted, cap) : 0,
```

A fade belongs at a *join*. An edge that was already an edge — a part starting
at sample zero, or ending at the last sample of the file — had nothing removed
in front of or behind it, so fading it would be an edit nobody asked for. This
is what lets `isUntouched` be true, and lets the page say that trimming nothing
writes out every sample exactly as the decoder produced it.

`cap` is half the part, so the two fades can never reach past each other on a
part shorter than two fades.

## The marks are a file

Marking is careful work, and a closed tab should not cost it. **Save marks**
writes a plain text file — one line a part — and **Load marks** reads one back:

```
seconds,interview.mp3         HHMMSSmmm,interview.mp3
207.687,347.737               00:03:27.687,00:05:47.737
630.284,668.796               00:10:30.284,00:11:08.796
```

Both layouts are the ones the video cutter writes, deliberately: marks made
against a video can be dropped onto its extracted audio, and the other way
round. `src/segments.js` is the reader and the writer, and it is neither too
strict nor too clever — a file with no header at all is still a list of times, a
line that cannot be read is counted rather than fatal, and a part that starts
past the end of the recording you loaded is dropped with a message saying so.

**One rounding rule, in every place a time is written.** The instant is rounded
to milliseconds *once*, before it is taken apart into hours, minutes, seconds
and thousandths. Doing it the other way round — floor the seconds, round the
fraction — is the same arithmetic and a different answer: 3.9996 floors to 3
and rounds to 1000, and the two get written next to each other as
`00:00:03.1000`. That is four digits in a field that holds three, it reads back
as 3.1, and it is how a mark made at 3.9996 s comes home nine tenths of a
second early. `formatClock` in `src/segments.js`, `formatTime` in
`src/timeline.js` — which is what a row's time box is filled with, so an
unreadable label there moves the mark when the row is next edited — and
`formatDuration` all round first. So does the video cutter, because the file
above is shared and the two have to agree about the instant as well as the
layout.

## The waveform is not decoration

Marking sound by scrubbing is guesswork. Silence looks like silence, a cough
looks like a cough, and the four seconds of room tone before somebody starts
talking are visible immediately rather than having to be hunted for. It also
fixes the marks people habitually get slightly wrong: the start of a sentence
wants to sit in the silence *before* the breath, which is obvious in the picture
and nearly impossible to hit by ear.

An hour of stereo at 48 kHz is 340 million samples, so it is summarised once —
into 4096 columns, far more than any screen has — and every later drawing is a
cheap reduction of that summary. Resizing the window, turning a phone and
redrawing after an export all cost the same handful of milliseconds rather than
another pass over the samples. Peaks rather than averages on the way down, both
times: the average of a waveform is roughly zero everywhere, which draws a flat
grey line for every piece of music ever recorded.

The timeline is otherwise the video cutter's, with the keyframe ticks removed —
there are no keyframes to draw — and the track made twice as tall, because a
waveform squeezed into 46 pixels is a smudge.

## The playhead runs on frames, not on `timeupdate`

`timeupdate` fires about four times a second. That is fine for a scrubber and
useless for marking: the band being drawn with `i` would jump in quarter-second
steps, and the time `o` was pressed at could be a quarter of a second stale. A
`requestAnimationFrame` loop runs only while the recording is playing, so it
costs nothing at rest, and `pause` and `seeked` take one last reading so the
playhead lands where the sound actually stopped.

## Why what comes out is a WAV

There are two ways to trim compressed audio, and this tool takes the second one
on purpose.

Cutting the compressed data directly — moving whole encoded frames into a new
file without decoding them — keeps the file small and costs nothing. But an MP3
frame is about 26 ms long, so every cut is rounded to a frame boundary, which is
exactly the keyframe problem this tool is otherwise free of. It is also
format-specific: an MP3 reader trims no Opus files.

Decoding instead means nothing rounds, every format the browser can play works
identically, and the fades are possible at all — you cannot ramp a level you
have not decoded. The cost is that the samples have to be written back out, and
no browser ships an MP3 or AAC encoder that can be driven from here. A WAV needs
no encoder: it is the samples with a short header in front, so that step cannot
lose anything either.

What that costs the user is size — about 10 MB a minute in stereo — and the page
says so before the button is pressed.

## What is shared with the audio editor, and why it is copied

`src/decode.js`, `src/samplerate.js` and `src/wav.js` are byte for byte the
[audio editor](../edit-audio/)'s. That is the same arrangement `src/demux.js`
has across the three video tools: each tool folder in `dist/` is complete on its
own, cached by its own service worker, and readable without following an import
into a neighbour. Only `shared/js/` is genuinely shared, and only for things no
tool should own.

The one thing worth knowing about `decode.js` is documented in
`src/samplerate.js`: `decodeAudioData` resamples to whatever rate the context
was created at, so the rate is sniffed out of the file's own header first and
the context is created to match. A file whose format does not say is decoded at
48 kHz and the page states that it was assumed.

## Limitations

- **One file at a time.** The video cutter joins several videos; this does not.
  Joining recordings that disagree about sample rate or channel count means
  resampling one of them, which is a different job with its own trade-offs, and
  it is not in here.
- **The whole recording is decoded into memory.** An hour of stereo is about
  700 MB of Float32, and the finished WAV is assembled in memory as well. There
  is no streaming path.
- **A WAV cannot exceed 4 GB**, because the format's size field is 32 bits.
  `writeWav` refuses rather than writing a file that opens as noise elsewhere.
- **Formats the browser cannot decode are refused**, with a message saying so:
  in practice AVI, WMA and most MKVs.
- **The marks are sample-exact, not zero-crossing-snapped.** Snapping each mark
  to the nearest zero crossing is the other classic answer to the click, and it
  is not here: it moves your mark without telling you, and it does nothing at
  all for material with a DC offset or a fade already on it. The fade is the
  honest fix and it is the one on the page.

## Testing it

`tests/js/trim-audio.test.js` covers the two files that decide what comes out:

- **`src/trim.js`** — seconds to samples and back, the fade placement rule (and
  in particular that an edge at the boundary of the recording gets none), the
  half-part cap, `invertRanges` including overlapping and touching marks, and
  `cutChannels` producing the samples that went in, in order, with the ramps
  where the plan said.
- **`src/segments.js`** — the timestamps file in both formats, round-tripping,
  and the leniency: no header, unreadable lines, reversed times. The rounding
  rule above has its own test, at the fractions that expose it.
- **That the loop really hands the page back.** This is the one test here that
  is about scheduling rather than arithmetic, and it exists because the first
  version of that loop awaited a resolved promise. That queues a *microtask*,
  and microtasks run to exhaustion inside the task that queued them: the
  browser never gets in between, so the progress bar could not repaint and the
  Cancel button could not be pressed — the click had nowhere to be delivered
  until the trim was already over. A test that aborts from inside `onProgress`
  passes either way, which is why the test here aborts from a timer, the way a
  person's click arrives. `budgetMs` is an argument to `trim()` so that the
  test can set it to zero and not depend on how fast the machine is.

Run them with `node --test "tests/js/*.test.js"` from the repository root.
