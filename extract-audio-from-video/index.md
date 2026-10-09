# Extract Audio from Video — the sound on its own, as a WAV

Drop a video in and take the sound out of it. The picture is never decoded, and nothing is uploaded.

> Get the sound out of an MP4, MOV or WebM and save it as a WAV. The video never leaves your machine and its picture is never decoded - the whole job runs in your own browser.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/extract-audio-from-video/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

The browser’s own decoder reads only the audio track. WAV output is written locally as 16-bit PCM or 32-bit float. There is no MP3 encoder, upload step or network feature in this tool.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to extract the audio from a video without uploading it

1. **Drop the video in.** An MP4, MOV, M4V or WebM, from a phone, a camera, a screen recorder or a download. It is read by your own browser; there is no upload step to leave out.
2. **Read what it found.** The length, the number of channels and the sample rate, straight out of the file. If the file did not declare its rate the page says so, rather than quietly resampling and claiming nothing was touched.
3. **Choose the format and channels.** 16-bit PCM is the compatible default. Choose 32-bit float to preserve decoded samples without rounding or clipping. Leave channels unchanged for that preservation; mono averages them and halves stereo audio data.
4. **Play it before you save it.** The player is the file that is about to be downloaded, not the video — so if it sounds right, the download is right.
5. **Take it, or carry it on.** Download the WAV, or send it straight to the trimmer or the editor without saving it first.

## Also in the box

- [Audio Trimmer](https://abox.tools/trim-audio/): Mark the parts worth keeping as it plays. Get them back as one file, cut where you said.
- [Audio Editor](https://abox.tools/edit-audio/): Play it backwards, change the speed, lift a quiet recording — all of it here, on your machine.
- [PDF Merger & Splitter](https://abox.tools/merge-pdf/): Pages moved around without a round trip to a server.
- [PDF Compressor](https://abox.tools/compress-pdf/): Shrink a document without sending it anywhere.

## Questions

### Is my video uploaded anywhere?

No. The decoding and the writing both happen in your own browser, on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. Unplug from the internet and take the sound out anyway if you would rather check than be told.

### Can it give me an MP3?

This page writes WAV rather than MP3. MP3 output needs an encoder this tool does not ship. Choose compatible 16-bit PCM or 32-bit float; neither requires an upload. WAV is larger because its audio is uncompressed, and another editor can compress it afterwards.

### Is the picture ever looked at?

No, and there is nothing here that could look at it. The browser's decoder is handed the file and asked for its audio track; the video track is never decoded, never drawn and never reaches this page's code at all. There is no video decoder in `src/` to run. The file that comes out holds sound and nothing else.

### It says no sound could be read, but the video plays fine.

Then the video almost certainly has no audio track. A screen recording made without a microphone selected is silent, and so is a clip exported by an editor with the sound left muted — both play perfectly, because there is a picture to play. The message names this first because it is the likelier of the two causes; the other is a format this browser will not read. Open the file in a player and look for a volume control that does nothing: that is the quickest way to tell which you have.

### Which video formats can I open?

Whatever your browser decodes, which in practice means MP4, M4V, MOV and WebM, and every audio format besides. What is left out is the same short list as everywhere else on this site: AVI, WMV, and most MKVs. A file your browser will not read is refused with a message saying so, rather than failing halfway through.

### Does it lose any quality?

16-bit PCM rounds decoded samples and clamps values beyond full scale. Choose 32-bit float and leave channels unchanged to preserve the decoder’s samples, including values beyond full scale. Mono averages channels. Float does not undo losses already present in the video. The file’s own sample rate is used when detected; otherwise the page discloses the assumed rate.

### Why is the WAV so much bigger than the video?

WAV audio is uncompressed. At 44.1 kHz, 16-bit stereo is about ten megabytes a minute. Float doubles the sample data; mono halves stereo sample data. The output size is shown before the file is finished.

### How long a video can it handle?

The input is read and decoded into memory, and the full WAV is assembled there too. Long recordings can exceed available memory; WAV output beyond its 4 GB format limit is refused before sample bytes are written. Cancel retires a pending read or stops cooperative mixing and writing. Native browser decoding may continue until it returns, but its cancelled result is discarded.

### Can I cut it down or make it louder?

Yes, but not here — this page does one job. When there is a result there is a row of links beside the download that carries it straight into the [audio trimmer](https://abox.tools/trim-audio/) or the [audio editor](https://abox.tools/edit-audio/) without saving it first, and without either of them uploading it either.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no limit on how many videos you open. The site carries advertising, which is what pays for it; the ads are not given anything about your file.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your video away to be processed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your video has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that a file could be collected at, and nothing in the code that would send it if there were.
- **The picture is never decoded at all.** Only the audio track is asked for. The frames are not read, not decoded, not drawn and not looked at — there is no code on this page that could — and the file that comes out holds sound and nothing else. That is not a promise about restraint: `decodeAudioData` is handed the bytes and returns sound, and there is no video decoder in `src/` to run.
- **The decoder is the one already in your browser.** Nothing is shipped here to read your format and nothing is asked of anything outside this page to read it either. Which files work is therefore whatever your browser already plays.
- **The WAV format makes its precision explicit.** 16-bit PCM rounds and clamps decoded samples for compatibility. 32-bit float preserves them when channels stay unchanged. Mono averages the channels. Both formats are written on this machine without uploading anything.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your video: not a file, not a sample, not a name, a size or a length.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/audio-decode.js` for the one decoder there is and why the picture is never asked for, and `src/shared/samplerate.js` for the header sniffing that stops your recording being quietly resampled.
