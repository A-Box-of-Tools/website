# Convert to MP4 — WebM, MKV and MOV into the file that uploads

Whatever came off the screen recorder, the ripper or the camera, as H.264 and AAC in an MP4. Copied where it can be, re-encoded only where it must.

> Turn a WebM, MKV, MOV or any MP4 into an MP4 with H.264 and AAC, the file every phone, browser and upload form takes. H.264 and AAC are copied across untouched; anything else is re-encoded on your machine. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/convert-to-mp4/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your videos are **never uploaded**. There is no server.

The video you choose is read, taken apart, and written again as an MP4 in memory on this machine, by your own browser's codecs and code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one. A gigabyte never goes up to come back as a different gigabyte.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to convert a video to MP4

1. **Choose the video.** One file at a time: WebM, MKV, MOV, M4V or MP4. It is read straight off your disk by the browser, and the page says what it is: how long, how big, what frame size, and what container it came in.
2. **Read the two sentences.** One for the picture, one for the sound. Each says either that the track is already what an MP4 wants and will be copied across untouched, or what it is and what it will be encoded again as. There is nothing to set; the file decides. If the sound is something the browser cannot read, or you would rather the clip went silent, tick the box to leave it out.
3. **Convert it, and read the line that says it was checked.** What is copied is copied; what is encoded again is encoded again, frame by frame, with a bar that says where it is. Then the finished file is opened again here and has to be the length it was, H.264, and carrying the sound it promised. It plays from memory under the download, so you can see it survived.

## The longer version

[How to convert a video to the MP4 that uploads](https://abox.tools/guides/convert-a-video-to-mp4/): What an MP4 that uploads actually is, why a WebM, an MKV or an iPhone MOV gets refused, which conversions lose nothing and which cost a generation, and how to do it in your browser without uploading the file.

## Also in the box

- [Video Rotator](https://abox.tools/rotate-video/): A quarter turn, a half turn, the other way. Written into the file's header, so not one frame is decoded and nothing is lost.
- [Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.
- [Video Cutter](https://abox.tools/trim-video/): Mark the parts worth keeping as it plays. Get them back as one video.
- [Video Cropper](https://abox.tools/crop-video/): Cut a clip down to the part that matters.

## Questions

### Will the quality be worse?

Not for anything copied, and the page says what was. H.264 frames and AAC packets go across byte for byte, so an MKV with H.264 inside comes out as an MP4 with exactly the same picture. A track that had to be encoded again — VP9, VP8, AV1 or HEVC picture; Opus, Vorbis, MP3 or FLAC sound — is one generation further from the camera, at a bitrate chosen to match what the source spent, so that the loss is small rather than none. Keep your original either way.

### Why not keep HEVC or VP9 in the MP4? They are smaller.

Because the file would open in fewer places than the one you started with, and the point of converting was that it opens everywhere. HEVC in an MP4 needs a licence the machine may not have; VP9 or AV1 in an MP4 is refused by most upload forms and every mail client. H.264 and AAC are the one combination nothing refuses, so that is what the page writes, and it says the cost up front rather than hiding it.

### My WebM is a screen recording. Will the sound survive?

Yes. A browser records Opus, which an MP4 cannot carry, so it is decoded and encoded again as AAC at 160 kbit/s — more than a microphone ever needed. The picture, VP8 or VP9, is encoded again as H.264. Both happen on your machine, and the finished file is opened again here to check it is the length it was and still has its sound.

### Why does my MOV need converting at all? Isn't it already MP4?

Nearly. MOV and MP4 are the same design, and a MOV with H.264 and AAC inside is copied across in seconds without a frame re-encoded — what changes is the container, which is what a form that checks the extension was refusing. An iPhone MOV with HEVC inside is the other case: the picture is re-encoded as H.264, wherever the browser can decode HEVC, which is most machines but not all.

### Which files does it read?

WebM and MKV with VP8, VP9, AV1, H.264 or HEVC picture and Opus, Vorbis, AAC, MP3 or FLAC sound; MP4, MOV and M4V with H.264, HEVC, VP9 or AV1 picture and AAC sound. What the browser will not decode is named: a picture it cannot read stops the conversion, a sound it cannot read is left out and the picture still converts. AVI, WMV, FLV and MPEG-2 are not read here.

### How long does it take?

A copy takes about as long as reading the file twice: seconds for most clips. A re-encode takes as long as your machine takes to encode the picture — with a hardware encoder, most laptops and every recent phone, faster than the clip is long; without one, slower, and a long 4K clip is a long wait. The bar says which frame it is on, and cancelling stops it at once and writes nothing.

### Are my videos uploaded anywhere?

No. The file is read, decoded where it must be, encoded and written by your own browser on your own hardware, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The simplest way to satisfy yourself is to unplug from the network and use the page anyway. On a tool for files this size, that is also the fastest way: the upload is usually longer than the conversion.

### Does it work on a phone?

On a phone whose browser can decode and encode video, yes, and a phone's own hardware encoder is quick. What a phone lacks is memory: the finished file is held in memory until you save it, so a very long clip may be more than a phone can hold. Cut it first with the [Video Trimmer](https://abox.tools/trim-video/), or convert it on a laptop.

### Is there a size limit, and does it cost anything?

The file is read from your disk in pieces, so a file larger than your memory is fine going in; the finished file is held in memory until you download it, and an MP4 written here cannot be over 4 GB. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your videos.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your video away to be converted would stop the moment you unplugged.

## How the privacy claim is verifiable

- **The upload is the slow part, and it is the part that does not happen.** A video is the largest file most people ever try to move, and every online converter asks for the whole thing first: the gigabyte goes up on your connection so that a different gigabyte can come back, and the upload is usually longer than the conversion it pays for, before any question of who keeps the file. This page reads the file with code served from this address and writes the new one with the codecs already inside your browser, so the only bytes that move are from your disk to your memory and back. The page's `Content-Security-Policy` names every address it may contact — not one of them belongs to this site — and it works with the network unplugged.
- **What “MP4” means here, and why nothing else is written.** The file that uploads anywhere is H.264 picture and AAC sound in a plain MP4 container. That is what phones record, what every browser plays, and what chat apps, mail clients and upload forms accept without argument. A WebM, an MKV, or an MP4 with HEVC, VP9 or AV1 inside is refused by enough of them that people arrive here with one. So the page writes that and only that. It never copies a picture codec other than H.264 into the result however good it is, because a file that opens in fewer places than the original is not a conversion.
- **It copies what it can and re-encodes only what it must, and says which.** A conversion is not always a re-encode. H.264 frames in an MKV are the same bytes an MP4 wants, so they are copied across, frame for frame, and lose nothing; the same for AAC. VP9 or VP8 in a WebM, HEVC in an iPhone MOV, Opus or Vorbis for the sound: those are decoded and encoded again, and the result is one generation further from the camera. The page works out which of the two each track needs before you press anything and says so in two sentences, so that “convert” is never a word that hides a re-encode.
- **The result is opened again and checked.** A converter that dropped the last second, or wrote the sound track without the sound, would still produce an MP4. So the finished file is opened again here, by the same reader that reads what you upload, and has to be the length it was, H.264, and carrying the sound it was meant to. It plays from memory under the download, so you can see it survived before you save it.
- **What it costs on your machine, honestly.** A copy is fast: the file is read once for its layout and once more as it is written. A re-encode takes as long as your machine takes to encode the clip — with a hardware encoder, most laptops and every recent phone, faster than the clip is long; without one, slower, and a long 4K clip is a long wait. The file is read from disk in pieces, so a clip larger than your memory is fine going in, but the finished file is held in memory until you download it, which is where a laptop's limit is. Cancel is always live.
- **Which files it reads, and which it does not.** WebM and MKV, which are the same format under two names, with VP8, VP9, AV1, H.264 or HEVC inside and Opus, Vorbis, AAC, MP3 or FLAC for the sound; and MP4, MOV and M4V with H.264, HEVC, VP9 or AV1 inside and AAC for the sound. A picture the browser will not decode — HEVC on a machine without the licence, most often — is named and refused; a sound it will not decode is named and left out, and the picture still converts. AVI, WMV, FLV and MPEG-2 are not read here, and the page says so rather than failing vaguely.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your video: not a file, not a frame, not a name, a size, a length, or what it was converted from. Every line that reads, encodes or writes a video is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your videos. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your video away to be converted would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/plan.js` for which track is copied and which is encoded again, `src/convert.js` for the copy and the writing, and `src/shared/mkv-reader.js` for how a WebM or MKV is read. None of them can reach the network, and neither can the readers or the writer beside them.
