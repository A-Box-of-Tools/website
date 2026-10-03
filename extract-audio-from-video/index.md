# Extract Audio from Video — the sound on its own, as a WAV

Drop a video in and take the sound out of it. The picture is never decoded, and nothing is uploaded.

> Get the sound out of an MP4, MOV or WebM and save it as a WAV. The video never leaves your machine and its picture is never decoded - the whole job runs in your own browser.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/extract-audio-from-video/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

The decoder is the one already in your browser — the same code path that plays a file in a `<video>` element — and it is asked for the audio track and nothing else. Writing a WAV is putting a forty-four-byte header in front of the samples, in `src/shared/wav.js`. There is no encoder in the loop, no upload step, and no network feature of any kind on this page.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to extract the audio from a video without uploading it

1. **Drop the video in.** An MP4, MOV, M4V or WebM, from a phone, a camera, a screen recorder or a download. It is read by your own browser; there is no upload step to leave out.
2. **Read what it found.** The length, the number of channels and the sample rate, straight out of the file. If the file did not declare its rate the page says so, rather than quietly resampling and claiming nothing was touched.
3. **Choose mono, if you want it smaller.** Leaving the channels alone keeps the recording exactly as it was. Mixing down to mono halves the file and is what a transcriber or a voice recording wants; it averages the channels rather than throwing one away.
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

No, and it will not pretend to. No browser ships an MP3 encoder, and the only way to reach one is to send your video to a server that has it — which is the one thing this site exists not to do. What you get is a WAV: the samples with a forty-four-byte header in front, which needs no encoder at all and cannot cost any quality. It is larger, about ten megabytes a minute in stereo, and every player, phone and editor opens one. Anything that wants an MP3 can make one from it in a second.

### Is the picture ever looked at?

No, and there is nothing here that could look at it. The browser's decoder is handed the file and asked for its audio track; the video track is never decoded, never drawn and never reaches this page's code at all. There is no video decoder in `src/` to run. The file that comes out holds sound and nothing else.

### It says no sound could be read, but the video plays fine.

Then the video almost certainly has no audio track. A screen recording made without a microphone selected is silent, and so is a clip exported by an editor with the sound left muted — both play perfectly, because there is a picture to play. The message names this first because it is the likelier of the two causes; the other is a format this browser will not read. Open the file in a player and look for a volume control that does nothing: that is the quickest way to tell which you have.

### Which video formats can I open?

Whatever your browser decodes, which in practice means MP4, M4V, MOV and WebM, and every audio format besides. What is left out is the same short list as everywhere else on this site: AVI, WMV, and most MKVs. A file your browser will not read is refused with a message saying so, rather than failing halfway through.

### Does it lose any quality?

Nothing beyond what the video already did to its own audio when it was made. The samples the decoder hands back are written down as they are — there is no second encode, so there is no second generation of loss. The one thing to know is the sample rate: the file's own rate is read out of its header first and the decode is done at that rate, so your recording is not quietly resampled. If a file does not declare one, the page says which rate it assumed.

### Why is the WAV so much bigger than the video?

Because a WAV is not compressed and the video's audio track was. Sound at CD quality is about ten megabytes a minute in stereo, whatever it holds; the AAC track inside an MP4 is perhaps a tenth of that. Mixing down to mono halves it. This is the cost of not re-encoding, and it is paid once: whatever you open the file in next can compress it.

### How long a video can it handle?

There is no limit set here, because there is no server paying for one. The practical ceiling is your own machine's memory: the file is read in and the whole audio track is held as samples, so a very long recording on a small machine can run out of room. A few hours of video is ordinarily fine, and a phone will manage less than a laptop.

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
- **The samples are written down, not encoded again.** A WAV is the samples the decoder handed back with a header in front of them. There is no encoder in the loop making decisions about your recording, and nothing that could be described as an upload for one to happen on.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything about your video: not a file, not a sample, not a name, a size or a length.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/audio-decode.js` for the one decoder there is and why the picture is never asked for, and `src/shared/samplerate.js` for the header sniffing that stops your recording being quietly resampled.
