# Audio Trimmer — trim audio online

Mark the parts worth keeping as it plays. Get them back as one file, cut where you said.

> Play a recording and mark every part worth keeping as it goes past, then save those parts as one file. Sample-exact cuts, no clicks at the joins, nothing uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/trim-audio/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your recordings are **never uploaded**. There is no server.

Your recording is read, marked, cut and written by your own browser, on your own hardware. Nothing here can fetch or send anything — there is no network feature in this tool at all — and there is no server on the other end of this page to send a recording to even if there were.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ As many parts as you like
- ✓ Cuts exactly where you marked
- ✓ Works offline

## How to trim an audio file

1. **Choose a recording.** Drop an MP3, WAV, FLAC, M4A, Ogg or Opus file onto the picker — or a video, if what you want is a piece of its sound. It is read straight off your disk by the browser and drawn as a waveform; nothing is sent anywhere while you do it.
2. **Play it, and mark the parts you want.** Press `I` where a part should start and `O` where it should end. Do that as many times as you like — every pair becomes a row in the table underneath, and a band on the waveform. `U` takes the last one back, `Space` plays and pauses, the arrow keys jump five seconds, and holding `Shift` with one moves ten milliseconds. Slow the playback down if the moment is hard to catch.
3. **Fix up the marks.** Each row can be played back on its own, retimed by typing an exact time into it, moved up or down the order, or deleted. The two ends of the selected part can also be dragged along the waveform, which is the quickest way to put a mark on the silence rather than on the breath before it. The total at the top is what the finished recording will run to.
4. **Keep them, or cut them out.** Keeping is the usual way round: the finished recording is the parts you marked, joined in order. Cutting them out is the other job people want and rarely find — mark the ums, the phone ringing or the false starts, and what is left is joined up without them.
5. **Trim it, and download.** Every cut lands on the sample you marked; there is no rounding to a keyframe here, because sound has none. The one thing worth choosing is how much of a fade to put on each join — five milliseconds is enough to stop a click and far too short to hear as a fade. What comes out is a WAV, played back on the page first, and then handed straight to your browser's downloads.

## The longer version

[How to trim audio without losing quality](https://abox.tools/guides/trim-an-audio-file/): Where an audio cut actually lands, why it can be exact when a video cut cannot, why a join sometimes clicks, and what a five-millisecond fade is really doing.

## Also in the box

- [Audio Editor](https://abox.tools/edit-audio/): Play it backwards, change the speed, lift a quiet recording — all of it here, on your machine.
- [PDF Merger & Splitter](https://abox.tools/merge-pdf/): Pages moved around without a round trip to a server.
- [PDF Compressor](https://abox.tools/compress-pdf/): Shrink a document without sending it anywhere.
- [PDF Unlocker](https://abox.tools/unlock-pdf/): Most locked PDFs need no password at all. This one says which kind you have before it touches it.

## Questions

### Is my audio uploaded anywhere?

No. It is read, marked, cut and written by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the internet and trim a recording anyway if you would rather check than be told.

### Can I keep several parts of the same recording?

That is what this is for. Press `I` and `O` as many times as you like while it plays; each pair becomes a row, and the finished file is every row joined in order with everything else gone. Most online trimmers give you one pair of handles and ask which single stretch to keep, which is fine for topping and tailing a jingle and no use at all for listening to an hour of interview once and keeping the six answers worth having.

### Does the cut land exactly where I marked it?

Yes, on every part, in every player. This is the one place where audio is simpler than video: a decoded recording is a run of numbers and each one stands on its own, so there is no equivalent of a keyframe to round back to and no reason for a cut to start early. The page shows the sample number the result begins at, which is the mark you made multiplied by the sample rate and rounded to the nearest whole sample.

### Why would a join click, and what is the fade for?

Because cutting from the middle of one word to the middle of another puts two unrelated waveforms next to each other, and a speaker asked to jump between them makes a click. It is not a fault in the cut — it is what a discontinuity sounds like. The fix is a fade of a few milliseconds either side of each join: long enough for the cone to get there, far too short to be heard as a fade. Five milliseconds is the default and can be turned off. A fade is only put on an edge that is actually a cut, so an edge at the very start or end of the recording is left exactly as it was.

### Can I cut the bad bits out instead?

Yes. Mark them, then choose "Cut them out": everything you did *not* mark is joined up instead, in order. The same list of marks answers both questions, so you can switch between them and see the length change without marking anything twice.

### Can I save my marks and come back to them?

Yes. "Save marks" writes a plain text file — one line a part, a start and an end separated by a comma — and "Load marks" reads one back. Two formats are offered, plain seconds and `HH:MM:SS.mmm`, and both are the layout the video cutter on this site writes, so a file made against the video can be dropped onto its audio and the other way round. Marking is careful work and nobody should have to do it twice.

### Which formats can I open?

Whatever your browser decodes, which in practice means MP3, WAV, FLAC, M4A and AAC, Ogg Vorbis and Opus, and the audio inside MP4, M4V, MOV and WebM video. What is left out is the same short list as everywhere else: AVI, WMA, and most MKVs. A file this browser will not read is refused with a message saying so, rather than failing halfway through.

### Why does it save a WAV rather than an MP3?

Because no browser ships an MP3 encoder, and this tool refuses to send your recording to a server that has one. A WAV needs no encoder at all — it is the samples with a short header in front — so it is both the honest option and the only one that cannot cost quality on the way out. It is larger: about ten megabytes a minute in stereo. Every player, phone and editor opens one, and anything that wants an MP3 can make one from it. Trimming an MP3 by copying its frames instead would keep the file small, but it would also move every cut to the nearest frame boundary, which is the rounding this tool exists not to do.

### Is there a limit on the length of the recording?

There is no limit built into the tool. The practical ceiling is memory: the whole recording is decoded into this page at once, and a WAV is assembled in memory before you download it, so an hour of stereo needs something under a gigabyte to work in. A four-gigabyte WAV is refused outright, because the format's own size field cannot describe one.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. The site carries advertising, which is what pays for it; the ads are not given anything about your recording.

## How the privacy claim is verifiable

- **Your recordings have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** This tool has no network feature at all: no address to paste, nothing to download, no engine fetched on first use. Every byte that touches your audio came from this origin when the page loaded.
- **The decoder is the one already in your browser.** The file is handed to `decodeAudioData`, the same code that plays a track in an `<audio>` element. Nothing is shipped here to read your format, and nothing is asked of anything outside this page to read it either.
- **A video's picture is never decoded at all.** When you drop a video in, only its audio track is asked for. The frames are not read, not decoded, not drawn and not looked at — there is no code on this page that could, and the file that comes out holds sound and nothing else.
- **The cut is a copy, in memory, on this machine.** Trimming is one `set` per part per channel: the samples you kept are moved into a new array in the order you put them in. The only samples multiplied by anything are the few hundred inside each fade, and the page says how many before you press the button.
- **The samples are written down, not encoded again.** A WAV is the samples this page holds with a header in front of them. There is no encoder in the loop making decisions about your recording, and nothing that could be described as an upload for one to happen on.
- **The marks file is made in the page.** Saving your marks writes a text file out of the numbers already on screen, straight to your downloads. Loading one reads it here. Neither goes near a network, and neither carries anything but times.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your recording: not a file, not a sample, not a name, a size, a length, or where you cut it. Every line that reads, cuts and writes is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your recording.
- **It works offline.** Disconnect from the network and everything on this page still works. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/segments.js` for the marks and the file they save to, `src/shared/audio-decode.js` for the twenty lines that hand your file to the browser's own decoder, `src/trim.js` for the arithmetic that turns a mark into a run of samples and the loop that copies them, and `src/shared/wav.js` for the header that goes in front of them. None of them imports anything that can make a request.
