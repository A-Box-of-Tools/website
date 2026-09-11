# GIF Splitter — every frame as its own PNG

Every frame out as its own PNG.

> Split an animated GIF into its frames and save each one as a PNG, free and entirely in your browser. Keeps the transparency and the timing. Nothing is uploaded, and it works offline.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/split-gif/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your GIFs are **never uploaded**. There is no server.

The GIF is read, decompressed and drawn by your own browser, and every PNG is encoded in memory on this machine. There is no server on the other end of this page to send an animation to even if anything here wanted to.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to split a GIF into frames

1. **Choose the GIF.** Drop it onto the picker, or select it by hand. It is read straight off your disk by the browser, and the page tells you what it found: the size, the frame count, how long it plays and how many times it repeats.
2. **Decide what each PNG should hold.** **The frame as it appears** is what almost everybody wants: the whole picture at that moment of the animation. **Only the pixels that frame stores** is the patch the file actually carries, at its own size and in its own place, which is how a GIF stays small and is not what the animation looks like.
3. **Decide what happens to the transparency.** PNG keeps it, which is the honest default. Fill it with a colour instead if the frames are headed somewhere that ignores transparency and would otherwise turn it black.
4. **Pick the frames you want.** All of them by default. "Keep every second frame" thins a long recording out, and the tick boxes on the grid override it — the numbering never changes, so frame 42 is called frame 42 however few of its neighbours you kept.
5. **Download them.** One frame at a time from the grid, or all of them as a single ZIP so there is one save prompt instead of hundreds. The ZIP can carry a `frames.txt` listing how long each frame was held, which is the one thing a folder of PNGs cannot say on its own.

## The longer version

[How to split a GIF into frames](https://abox.tools/guides/split-a-gif-into-frames/): Get every frame of an animated GIF as a PNG: why some frames are only a small patch of the picture, what happens to the transparency, and how to keep the timing so you can put it back together.

## Also in the box

- [GIF Analyzer](https://abox.tools/gif-analyzer/): Frames, delays, palettes, and where every byte went.
- [Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.
- [Video Cutter](https://abox.tools/trim-video/): Mark the parts worth keeping as it plays. Get them back as one video.
- [Video Cropper](https://abox.tools/crop-video/): Cut a clip down to the part that matters.

## Questions

### Is my GIF uploaded anywhere?

No. The file is read, decompressed and drawn by your own browser on your own hardware, and every PNG is encoded here in memory. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the network and it still splits GIFs.

### Why does one frame look like a small piece of the picture?

Because that is what the file holds. A GIF is a first picture followed by patches: each later frame stores only the rectangle that changed, and everything else on screen is what the frames before it left there. A talking head against a still wall therefore stores a face per frame rather than a picture per frame, which is the whole reason the format is not enormous. \
\
You are seeing that because "Only the pixels that frame stores" is selected. Switch to "The frame as it appears" and every PNG is the whole picture as the animation looks at that moment.

### Does it keep the transparency?

Yes. GIF transparency is a single bit — a pixel is either painted or invisible, with nothing in between — and PNG stores exactly that, so the frames come out with their transparent areas intact. If you would rather have a solid background, set "Transparent areas" to fill with a colour; that is written into the PNG and cannot be undone afterwards.

### Why are the frame delays not the numbers I expected?

A GIF stores each delay in hundredths of a second, and browsers have clamped anything under two of them to a tenth of a second since the 1990s — a rule written for the spinning globes of the time and never removed. So a frame whose file says 0.01s is played at 0.10s everywhere. This tool shows the delay as it is really played, and says what the file stores next to it when the two differ.

### Can I put the frames back together again?

Yes, with the [GIF Maker](https://abox.tools/gif-maker/) on this site or with anything else that takes a folder of images. That is what the `frames.txt` in the ZIP is for: splitting an animation throws away the timing, because a PNG has nowhere to record how long it was held, so the list carries each frame's delay and position out with it.

### What formats can the frames be saved in?

PNG, and deliberately only PNG. A GIF frame is at most 256 colours with one bit of transparency; PNG stores that exactly and losslessly, while JPEG would throw the transparency away, invent colours the frame never had, and usually make a *larger* file out of flat artwork. If you need JPEGs, convert the PNGs afterwards with the [Image Resizer](https://abox.tools/resize-image/).

### Is there a limit on how many frames it will read?

There is no fixed limit. The practical ceiling is your own machine's memory: a GIF expands to about one byte per pixel per frame while it is being read, so a small file can be a very large amount of memory, and this page stops reading rather than letting the tab die. If that happens it says so and hands back the frames it did get.

### Will it open a damaged GIF?

Usually. Truncated downloads, a missing end marker and a last frame that stops mid-stream are all common, and a reader that refuses them is useless for exactly the files people most want taken apart. Whatever frames are complete come back, with a note saying what was wrong. Only a file that is not a GIF at all is refused outright.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in and no trial. There is no watermark on the frames either. The site carries advertising, which is what pays for it; the ads are not given anything about your files.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your animation away to be processed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your GIF has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were. This used to read `connect-src 'none'`, which was absolute; adding advertising cost that, and saying so is part of the deal.
- **The GIF reader is two files in this repository.** A browser will play a GIF but will not hand you its parts, so the format is read out here: `src/gif.js` is the container and the LZW decompressor, `src/compose.js` is the disposal rules that decide what each frame looks like once the ones before it are underneath. Nothing is fetched to open a file, and there is no engine downloaded on first use.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your animation: not a file, not a frame, not a name, a size, or a count. Every line that reads, decompresses, draws or encodes a picture is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your files. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and every part of this page still works. That is the simplest proof of all: a tool that sent your animation away to be taken apart would stop the moment you unplugged.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/gif.js` for the reader that decompresses the frames, and `src/compose.js` for the rules that lay them on top of each other — neither of which has a line that could reach the network.
