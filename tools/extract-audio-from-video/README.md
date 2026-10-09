# Extract Audio from Video

*The sound on its own, as a WAV — on your own machine.*  ·  lives at `/extract-audio-from-video/`  ·  [all tools](../)  ·  [how the site is built](../../README.md)

This job already shipped. Dropping a video on [`edit-audio`](../edit-audio/)
and pressing the button with every setting left alone has always saved the
sound out of it, and that page answers "Can I get the audio out of a video?"
in its FAQ. `ROADMAP.md` even says so out loud, under *Mute a video*: half of
that card was a promise to build something that existed.

What it did not do was answer anybody who **searched** for it. The page is
called Audio Editor, its address says `edit-audio`, and the whole job appears
as a by-the-way clause at the end of a tagline about reversing tracks.
"Extract audio from video" is a bigger phrase than anything else the audio
pages do, and it had no address.

So this is that job, on a page with one thing on it.

## Why the file is a WAV, and why the address does not say MP3

`video to mp3` is the larger phrase again, and this tool cannot honestly answer
it.

No browser ships an MP3 encoder. The only route to one is sending the video to
a server that has it, which is the single thing this site exists not to do.
`ROADMAP.md` is explicit that MP3 out waits on a vendored `libmp3lame` — 1.4 MB
for the job you need, rather than 25–30 MB of FFmpeg for every job you do not —
and `edit-audio` has answered *"Why does it save a WAV rather than an MP3?"* in
public for as long as it has existed.

An address promising a file the page cannot produce would be the first
dishonest URL on the site, and it would be dishonest about the exact thing the
site is for. So the address says what happens.

If `libmp3lame` is ever vendored, **this** is the page that gains the option,
and the address still reads true: extracting is what it does, and MP3 would
only be the format it wrote.

## How it works

`decodeAudioData` — the browser's own decoder, the same code path that plays a
file in a `<video>` element — is handed the bytes and hands back sound. The
video track is never asked for, never decoded, never drawn. That is not
restraint: there is no video decoder in `src/` to run.

The shared WAV primitives write either PCM16 or IEEE Float32. PCM16 rounds and
clamps decoded samples; Float32 preserves them when channels remain unchanged,
including values beyond full scale. Neither restores losses already present in
the source. Mono averages channels before writing either format.

## The sample-rate trap

`decodeAudioData` resamples to the context's rate, so a naive implementation
silently rewrites every sample and still claims nothing was touched.
`src/shared/samplerate.js` sniffs the rate out of the file's own header first and the
decode happens on an `OfflineAudioContext` at *that* rate. Where a file
declares nothing, the page says which rate it assumed rather than staying
quiet.

**Anything that adds a new input format has to add a sniffer branch too.**

## The modules are shared parts

The decoder, the sample-rate sniffer and the WAV writer are
`shared/js/audio-decode.js`, `samplerate.js` and `wav.js`, asked for in
`tool.toml` and copied into this tool at `src/shared/` by the build — the same
three `edit-audio` and `trim-audio` ship. They were byte-for-byte copies in all
three tools until the JavaScript tests could follow a `./shared/` import
(`tests/js/resolve-shared.mjs`).

That matters more than usual here. The WebM-through-the-MP3-frame-scanner bug
that once reported 64 kHz for a 48 kHz Opus file lived in `samplerate.js`; a
repair to it is a repair all three tools want, and it lands in all three now.

## Mono averages, it does not drop a channel

Taking the left channel loses whatever was only in the right, which on a
recording made with two microphones is half the room. Averaging can cancel
where the two are out of phase, which is rarer and quieter than losing a
speaker.

## Automatic output with cancellation

The compatible default remains 16-bit PCM. Choosing channels or depth retires
and releases the previous result, then starts a new writer automatically. A
cancelled or failed write offers **Create WAV again**, so keeping the current
source does not require choosing it twice. The player always uses the exact
WAV offered by Download.

Each replacement first discards decoded source state, its facts and the old
result/player/download URL. A load generation owns the native read, including
errors and picker cleanup. Browser decoding itself cannot be interrupted;
Cancel retires its result immediately, and any later completion is ignored.
Every writer has a separate controller and exact source/choice ownership, so
old progress, failures and completion cannot alter a newer load or setting.
Cancel stays outside the inert output card while reading, and settings remain
editable during writing so changing them starts the newer plan.

`shared/js/wav-async.js` opts into bounded 8192-frame packing, sharing the same
header and packing primitives as the unchanged synchronous WAV API. The
extractor alone asks for it and `cooperative-work.js`; other audio tools keep
their synchronous writer. Mixing uses the same Float32 accumulation order as
the existing mix, in bounded runs. Checkpoints yield actual timer turns after
an eight-millisecond budget, rather than starving browser input with resolved
promises. Both writers refuse the exact header-inclusive RIFF overflow before
allocating output samples; the estimate includes Float32’s larger header.

The input, decoded channels, mono plane when requested and output still require
memory. Blob construction and native decoding are not cooperative operations;
Cancel cannot interrupt those browser calls halfway through. Cancellation
retires ownership and discards their results rather than promising immediate
release of memory the browser still owns.

## Verification

CI coverage checks complete sync/async PCM16 and Float32 byte parity across
packing boundaries, independent sample/header readback, exact RIFF limits
without allocating giant buffers, mono accumulation/source preservation and
actual timer cancellation without late progress or a partial result. The
local loop is the scoped build and a built browser page; suites run in CI.

Browser checks cover actual MP4 extraction, precision readback, replacement
success/error ordering, settings during pending work, cancellation/retry,
released download URLs, translated controls and narrow layout. The sample-rate
and channel choices remain visible in the output facts.

## What only a browser catches

Decoding, `OfflineAudioContext`, the blob the player is handed and the
`phrase()` lookups are all invisible to both test suites. Serve `dist/` and
drop a real video in.

This page does permit `fetch()` of a `blob:` URL — `connect-src` carries
`blob:` so the carry-on row can read the result back before parking it for the
next tool — so an exported file can be read back in the page's own console.
That is the one place this tool's policy differs from a tool with no handoff
row, and it is worth knowing before concluding that a `blob:` fetch failing
somewhere else on the site is a bug.
