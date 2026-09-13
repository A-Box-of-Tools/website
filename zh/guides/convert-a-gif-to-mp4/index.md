# How to convert a GIF to MP4, and why it gets so much smaller

A GIF that was refused for its size is not a GIF that needs to be smaller. It needs to be a video, which is what every platform turns it into anyway. Here is why the MP4 is a tenth of the size and looks better, what changes on the way, and how to do it without first uploading the file that was too big.

[打开GIF 转 MP4](https://abox.tools/zh/gif-to-mp4/): 每一帧都带着 GIF 给它的延时，变成 MP4 里的 H.264。在你的机器上转，文件从不上传。

最后更新 13 September 2026

## The short answer

Open the [GIF to MP4](https://abox.tools/zh/gif-to-mp4/) converter, drop the GIF in, and press the button. Every frame is encoded with the delay the GIF gave it, the result is opened again to count the frames and check the length, and it plays under the download, looping, so you can see the join. Nothing is uploaded. The MP4 is usually a tenth of the size.

The rest of this is about why that is not a loss, and about the two things that do change on the way.

## Why the MP4 is a tenth of the size

A GIF stores each frame as a complete picture, with at most 256 colours, and has no idea what the frame before it looked like. A video codec stores what changed between frames, at full colour, and H.264 has had thirty years of practice at that. The same animation comes out at a tenth of the size, often much less, and looks better, because it is no longer limited to 256 colours and no longer dithered to hide that it was.

That is why every social platform, chat app and content system either refuses a large GIF or quietly converts it to an MP4 on upload, and why, when something says “GIF too big”, the MP4 is what it wanted all along. A tiny GIF, or one that barely moves, can come out larger as a video; the tool says so when that happens rather than pretending.

## The thing most converters get wrong: the timing

A GIF has no frame rate. Each frame carries its own delay, and the delays vary: a slideshow holds a picture for two seconds and then flicks through ten, a reaction GIF freezes on the punchline. A converter that picks a frame rate — and most do, because a video has one — resamples the GIF on to it, doubling some frames and dropping others, and the slideshow comes out jerky or the freeze comes out short.

The [converter here](https://abox.tools/zh/gif-to-mp4/) keeps every delay. Each frame of the GIF becomes one frame of video that lasts exactly as long as the GIF said, and the MP4's own timing table is the GIF's delay table. The one liberty it takes is the one every browser takes: a delay under two hundredths of a second is played as ten, because that is what browsers have done since the nineties and a video that honoured the stored number would run ten times faster than the GIF ever played. The finished file is then opened again and has to have one frame per GIF frame and play for as long as the GIF does.

## Two things a video cannot do that a GIF can

**Loop by itself.** A GIF carries an instruction to loop; an MP4 carries no such thing, and whether the video loops is up to whatever plays it. Most feeds and chat apps loop a short video, a desktop player usually plays it once, and a web page loops it only if told to. The tool's preview loops so you can see the join, and the result line says whether the GIF was set to loop.

**Show through.** A GIF can be transparent in places; a video is a solid rectangle. Where the GIF let the page show through, a colour has to go, and the tool asks which — only for a GIF that has such places, with white as the default because that is what most pages are. If the GIF is going on a dark background, pick the dark colour before you convert.

## Why the upload is the strange part

Every online GIF converter asks for the file first. The whole thing goes up on your connection — the 30 MB that was too big to send — so that 3 MB can come back, before any question of who keeps the GIF and for how long. It is strange because the encoder that does the work is already inside your browser, the same one it uses for video calls, and reading a GIF is a few hundred lines of code.

The [converter here](https://abox.tools/zh/gif-to-mp4/) uses that encoder and nothing else. The GIF is read from your disk, decoded, drawn frame by frame, encoded and written again into memory; the page's own security policy names every address it may contact, and none of them is this site's. Unplug from the network and it keeps working, which is the simplest proof there is.

## Check it before you send it

The tool opens its own result again, with the same reader it uses on any MP4, and holds it to two things: as many frames as the GIF had, and the length the GIF plays for. It then plays the result from memory, looping. Watch one loop — the join and the freeze are where a converter's timing goes wrong — and then save it. Keep the GIF too, if it is the only copy; the video is a different file, not a smaller one.
