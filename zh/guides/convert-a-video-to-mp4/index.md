# How to convert a video to the MP4 that uploads

A file that was refused as “not MP4” has one of three things wrong with it, and only one of them costs anything to fix. Here is what the refusal means, what each kind of file needs, and how to get the file everything takes without first uploading the one that was refused.

[打开MP4 转换](https://abox.tools/zh/convert-to-mp4/): 不管从录屏、压制还是相机里出来的是什么，都变成 MP4 里的 H.264 和 AAC。能复制的原样复制，非改不可的才重新编码。

最后更新 12 September 2026

## The short answer

Open the [MP4 Converter](https://abox.tools/zh/convert-to-mp4/), drop the file in, and read the two sentences it writes: one for the picture, one for the sound. Each says either that the track is already what an MP4 wants and will be copied across untouched, or what it is and what it will be encoded again as. Press the button, and the file is written again on your machine as H.264 and AAC in an MP4, then opened again to check it is still as long as it was. Nothing is uploaded.

The rest of this is about why the file was refused in the first place, because “it needs to be MP4” hides three different problems, and only one of them costs anything to fix.

## Three things have to be right, not one

A video file is a container holding two streams: a picture, encoded with one codec, and a sound, encoded with another. “MP4” names only the container. What an upload form, a chat app or a mail client actually wants when it says MP4 is the whole set that every device plays without argument: the MP4 container, H.264 for the picture, and AAC for the sound. Get any one of the three wrong and something, somewhere, refuses the file — and the refusal names the container, because that is the part people can see.

So a file can be refused for being the wrong container with the right codecs inside, or the right container with the wrong codecs inside, or wrong all the way through. The fix is different for each, and the difference is whether anything has to be re-encoded.

## The files people actually arrive with

**A screen recording from a browser** is a WebM: VP8 or VP9 picture, Opus sound. Wrong on all three counts, from an uploader's point of view, and both tracks have to be encoded again. The picture is decoded and re-encoded as H.264; the sound is decoded and re-encoded as AAC. It is the most common file brought to a converter, and the one where the conversion costs the most, because nothing in it can be kept.

**A ripped or downloaded MKV** is very often the right codecs in the wrong container: H.264 picture and AAC sound, in a Matroska file. That conversion loses nothing. The frames and the packets are copied across, byte for byte, into an MP4 — the picture is not decoded at all — and the result is indistinguishable from the original in everything but its container. An MKV with HEVC inside is the other case: the picture has to be re-encoded, the sound is usually AAC and is copied.

**An iPhone MOV** is the right sound in nearly the right container with, since 2017, the wrong picture: HEVC, which is smaller than H.264 and refused by more things. The picture is re-encoded, the AAC is copied, and the container changes from MOV to MP4, which are the same design under two names. An older phone's MOV, or a camera's with H.264 inside, is only the container, and is a copy.

**An MP4 that was refused anyway** usually has HEVC, VP9 or AV1 inside — the container was right and the picture was not — and the picture is re-encoded. Occasionally it is a fragmented MP4, the kind a streaming recorder writes, which some editors will not open; writing it again as a plain MP4 with the index at the front fixes that without touching a frame.

## Why a copy loses nothing and a re-encode loses a little

H.264 frames in an MKV and H.264 frames in an MP4 are the same bytes. Moving them is like moving a file between folders: the container around them changes, and the picture is exactly what it was. The same is true of AAC. A converter that decodes and re-encodes such a file anyway — and many do, because it is simpler to write one path than two — costs you a generation of quality for nothing.

A picture that is not H.264 has to be decoded to pixels and encoded again, and every encode loses something, however good the encoder. How much is decided by the bitrate the new encode is allowed, and the right bitrate depends on what the old one spent: a VP9 file at two megabits a second needs about three in H.264 to look the same, because VP9 packs tighter. The tool starts from what the source spent, scales it by how the two codecs compare, and holds the result between a floor and a ceiling per pixel — so a file that was starved is not kept starved, and one that was lavish is not copied into a file the size of the original. It says the bitrate it chose before it starts.

The tool never re-encodes what it can copy, and never copies a picture codec other than H.264 into the result even though the MP4 container would hold it. HEVC in an MP4 opens in fewer places than the HEVC in the MKV you started with; a conversion that produced that would have made the problem worse.

## What about the sound?

Opus, Vorbis, MP3 and FLAC cannot go into an MP4 that everything plays, so they are decoded and encoded again as AAC at 160 kbit/s, which is more than a microphone or a game ever gave. Sound in more than two channels is folded to stereo, the way every player with two speakers does silently. Sound the browser cannot decode at all — the raw PCM some cameras write, mostly — is named and left out, and the picture still converts; tick the box to leave the sound out on purpose for a clip that is going somewhere it will play silent anyway.

## Why the upload is the strange part

Every online converter asks for the file first. The whole thing goes up on your connection — a gigabyte of screen recording, a ripped film — so that a different file can come back down, and the upload is usually longer than the conversion it pays for, before any question of who keeps the file and for how long. It is strange because the codecs that do the work are already inside your browser: every browser that plays video can decode it, and every recent one can encode H.264 and AAC. There is nothing a server adds to the job except distance.

The [MP4 Converter](https://abox.tools/zh/convert-to-mp4/) uses those codecs and nothing else. The file is read from your disk in pieces, taken apart, copied or re-encoded on your machine, and written again into memory; the page's own security policy names every address it may contact, and none of them is this site's. Unplug from the network and it keeps working, which is the simplest proof there is.

## Check it before you send it

A converter can produce a file that is an MP4 and still wrong: a second short, the sound track present but empty, the picture encoded as something other than what was promised. The tool opens its own result again, with the same reader it reads your file with, and holds it to three things: the length it was, H.264, and carrying the sound it said it would. It then plays the result from memory under the download. Watch the last second and listen, then save it. Keep the original either way; a re-encoded picture is one generation further from the camera, and the original is the only copy that is not.
