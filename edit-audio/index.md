# Audio Editor — reverse, speed up or amplify a track

Play it backwards, change the speed, lift a quiet recording — all of it here, on your machine.

> Play a track backwards, speed it up or slow it down, and make a quiet recording louder. Takes the sound out of a video too. Runs in your browser: nothing uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/edit-audio/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your recordings are **never uploaded**. There is no server.

Your file is read, edited and written by your own browser, on your own hardware. Nothing here can fetch or send anything — there is no network feature in this tool at all — and there is no server on the other end of this page to send a recording to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Video in, audio out
- ✓ Works offline

## How to edit an audio file

1. **Choose a file.** Drop an MP3, WAV, FLAC, M4A, Ogg or Opus file onto the picker — or a video, if what you want is the sound out of it. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Turn it around, if that is what you came for.** One checkbox. The samples are written out last one first, which is exactly reversible: do it twice and you have the file you started with, sample for sample.
3. **Set the speed.** Drag the slider, type a multiple, or press one of the presets. Then choose what happens to the pitch: hold it where it is, which is what you want for a lecture at 1.5×, or let it move with the speed, which is what a tape does and what makes a voice go up or down.
4. **Set the level.** Either name a change in decibels, or ask for the recording to be brought up until its loudest moment sits just under the ceiling. The page says where that moment will land before you press anything, and warns you if the setting you chose would push it past full scale.
5. **Save it.** The work happens on your own hardware, so how long it takes depends on your machine rather than on a queue. What comes out is a WAV — the samples themselves, with a header in front — played back on the page first, and then handed straight to your browser's downloads.

## The longer version

[How to clean up a voice memo before sending it](https://abox.tools/guides/clean-up-a-voice-memo/): Cut the dead air and the false starts, then bring the level up to full scale. Two browser tools in a row, in the order that keeps the quality, and the recording never leaves your machine.

## Also in the box

- [PDF Merger & Splitter](https://abox.tools/merge-pdf/): Pages moved around without a round trip to a server.
- [PDF Compressor](https://abox.tools/compress-pdf/): Shrink a document without sending it anywhere.
- [PDF Unlocker](https://abox.tools/unlock-pdf/): Most locked PDFs need no password at all. This one says which kind you have before it touches it.
- [PDF Redactor](https://abox.tools/redact-pdf/): The letters are deleted from the file, and the file is searched afterwards to prove it.

## Questions

### Is my audio uploaded anywhere?

No. It is read, edited and written by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the internet and reverse a track anyway if you would rather check than be told.

### Can I get the audio out of a video?

Yes, and that is the same job here as opening an MP3. Drop an MP4, MOV or WebM in and only its audio track is decoded: the picture is never read, and what comes out is a sound file with no video in it. If that is the whole of what you want — the sound, unchanged — then [Extract Audio from Video](https://abox.tools/extract-audio-from-video/) is the same job on a page with nothing else on it. Come back here when the sound needs changing as well.

### Does changing the speed change the pitch?

Only if you ask it to. "Keep the pitch" cuts the recording into overlapping windows about fifty milliseconds long and lays them back down closer together or further apart, choosing each position so the waves line up where they cross — a voice stays the same voice at 1.5×. "Let it move" resamples instead, which is what playing a tape faster does: two times the speed is exactly one octave up.

### Why does it save a WAV rather than an MP3?

Because no browser ships an MP3 encoder, and this tool refuses to send your recording to a server that has one. A WAV needs no encoder at all — it is the samples with a forty-four-byte header in front — so it is both the honest option and the only one that cannot cost quality. It is larger: about ten megabytes a minute in stereo. Every player, phone and editor opens one, and anything that wants an MP3 can make one from it.

### Which formats can I open?

Whatever your browser decodes, which in practice means MP3, WAV, FLAC, M4A and AAC, Ogg Vorbis and Opus, and the audio inside MP4, M4V, MOV and WebM video. What is left out is the same short list as everywhere else: AVI, WMA, and most MKVs. A file this browser will not read is refused with a message saying so, rather than failing halfway through.

### Will making it louder distort it?

Only if you take it past full scale, and the page tells you before you do. Digital audio has a hard ceiling: a sample cannot be louder than full scale, so anything above it is flattened against the ceiling, which is what distortion sounds like. "As loud as it will go" is the setting that cannot do that — it works out how much room the recording has left and uses exactly that much. Everything below the ceiling is multiplication and nothing else: turn it up 6 dB and back down 6 dB and the samples are where they started.

### Does reversing or retiming lose quality?

Reversing does not: the same samples come out in the other order, which is exact. Changing the speed moves every sample, so it is arithmetic rather than a copy — the resampler filters properly on the way, so speeding up does not fold high notes back down as a metallic ring, and the stretcher's windows are placed where the waves line up rather than wherever the arithmetic landed. Neither path re-encodes anything, because there is no encoder here to re-encode with.

### Is there a limit on the length of the file?

There is no limit built into the tool. The practical ceiling is memory: the whole recording is decoded into this page at once, and a WAV is assembled in memory before you download it, so an hour of stereo needs something under a gigabyte to work in. A four-gigabyte WAV is refused outright, because the format's own size field cannot describe one.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your recording.

## How the privacy claim is verifiable

- **Your recordings have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** This tool has no network feature at all: no address to paste, nothing to download, no engine fetched on first use. Every byte that touches your audio came from this origin when the page loaded.
- **The decoder is the one already in your browser.** The file is handed to `decodeAudioData`, the same code that plays a track in an `<audio>` element. Nothing is shipped here to read your format, and nothing is asked of anything outside this page to read it either.
- **A video's picture is never decoded at all.** When you drop a video in, only its audio track is asked for. The frames are not read, not decoded, not drawn and not looked at — there is no code on this page that could, and the file that comes out holds sound and nothing else.
- **The samples are written down, not encoded again.** A WAV is the samples this page computed with a header in front of them. There is no encoder in the loop making decisions about your recording, and nothing that could be described as an upload for one to happen on.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your recording: not a file, not a sample, not a name, a size, a length, or how loud it was. Every line that reads, edits and writes is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your file.
- **It works offline.** Disconnect from the network and everything on this page still works. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/audio-decode.js` for the twenty lines that hand your file to the browser's own decoder, `src/stretch.js` for the time-stretcher, `src/speed.js` for the resampler, and `src/shared/wav.js` for the header that goes in front of the samples. None of them imports anything that can make a request.
