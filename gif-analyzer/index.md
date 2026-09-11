# GIF Analyzer — what is actually inside a GIF

Frames, delays, palettes, and where every byte went.

> Take a GIF apart in your browser: every frame with its delay and disposal, the colour tables, the loop count, and a byte-by-byte breakdown of where the file size went. Nothing is uploaded.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/gif-analyzer/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your GIFs are **never uploaded**. There is no server.

The file is opened and taken apart by your own browser: the block structure, the LZW decompression and every frame drawn on this page are done on this machine. There is no server on the other end of this page to send a file to even if anything here wanted to.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to analyze a GIF

1. **Choose a GIF.** Drop it onto the picker, or select it by hand. It is read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Read the summary first.** The canvas size, the frame count, how long the animation says it runs and how long it actually plays. Those last two differ more often than people expect, and the reason is in the next section.
3. **Look at what stands out.** Every line there is measured from your file: delays no browser will honour, a missing loop block, colour tables nothing refers to, metadata that is bigger than some of the frames. Nothing is a guess about what you meant to make.
4. **See where the bytes went.** Every byte of the file is in exactly one row, and the rows add up to the file. If most of it is not in "compressed pixels", the rest of the table says where it is instead.
5. **Go through the frames.** Each one shows its delay, its rectangle, its disposal method and its size. Switch between "the canvas after each frame" and "only what each frame stores" — the second is how you see whether the file is optimised, because a well-made GIF stores tiny rectangles and a badly made one stores the whole picture every time.
6. **Take the report if you need it.** The whole analysis as plain text, to paste into a message or keep beside the file. It is built in the page from what is already on your screen.

## The longer version

[What is actually inside a GIF](https://abox.tools/guides/whats-inside-a-gif/): Frames, delays, disposal methods and colour tables explained, why browsers refuse the fastest delays, and how to work out where a GIF's file size really went.

## Also in the box

- [Images to Video](https://abox.tools/images-to-video/): Turn a folder of images into a video.
- [Video Cutter](https://abox.tools/trim-video/): Mark the parts worth keeping as it plays. Get them back as one video.
- [Video Cropper](https://abox.tools/crop-video/): Cut a clip down to the part that matters.
- [Video Reverser](https://abox.tools/reverse-video/): Last frame first, sound and all.

## Questions

### Is my GIF uploaded anywhere?

No. The file is read, decompressed and drawn by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the network and it still analyses GIFs.

### Why does my GIF play slower than the delays say?

Because every browser refuses to honour a delay under two hundredths of a second and holds the frame for a tenth instead. The rule was written into Netscape in 1996, for the spinning globes and under-construction signs of the time, and has been copied into every browser since; nothing has ever removed it. \
\
So a GIF whose frames all say 0.01s does not play at 100 frames a second. It plays at 10, which is five to ten times slower than whatever made it intended. This page shows both numbers — what the file says and what it will actually do — and marks the frames it affects. The fix, in whatever made the file, is to write 0.02 rather than 0.01.

### What does “disposal” mean?

What to leave on the screen when a frame's time is up, and it is the field that decides whether an animation looks right or smears. \
\
**Leave it in place** means the next frame paints over this one, which is what you want when frames are opaque and cover each other. **Clear back to the background** wipes the frame's rectangle first, which is what transparency needs — without it the see-through parts of the next frame show the previous one underneath. **Restore what was underneath** puts back whatever was there before this frame drew, which is how a small moving object over a still background is stored. And **unspecified** means the file did not say, and every viewer treats it as "leave it in place".

### Why is my GIF so large?

The "Where the bytes went" table answers that for your particular file rather than in general, and there are only a few possible answers. \
\
If nearly all of it is **compressed pixels**, the file is simply a lot of picture: GIF stores every frame as whole pixels, with no motion compensation and no quality dial, so the size is roughly the area times the frame count. Fewer frames, a smaller size or fewer colours are the only levers. \
\
If a large slice is **colour tables**, the file is writing a palette per frame at 768 bytes each. If a large slice is **metadata**, an editor left an XMP packet behind and it can be removed without touching the picture. And if the frames all cover the whole canvas, the encoder never worked out which part actually changed — which on anything filmed or recorded is most of the file.

### What is the difference between the two frame views?

**The canvas after each frame** is what a viewer shows at that moment: this frame drawn on top of whatever the frames before it left behind. **Only what each frame stores** is the rectangle the file actually holds for that frame, on its own, with nothing underneath. \
\
The second is the interesting one. A GIF may store a frame as only the part of the picture that changed, which is why a screen recording of a mostly-still window can be small. If every frame in your file is the full canvas, nothing did that work — and you cannot tell by watching the animation, only by looking at what is stored.

### It says my file has a comment or XMP in it. What is that?

Text that rides along with the picture and that no viewer draws. A comment block is usually the name of whatever wrote the file. An XMP packet is the XML an image editor writes to record what it did, and it can carry the edit history, the software version and sometimes the author's name. \
\
This page prints both out in full, because the interesting question about metadata is what it says rather than that it exists. It is shown to you and to nobody else: nothing in this repository reads any of it out to anyone.

### Can it open a broken GIF?

It tries, and it tells you where it gave up. A file that ends mid-block, has a byte where a block marker should be, or carries a frame whose compressed data runs out early will still show everything that was readable before that point, with the problem named at the top. That is the case an analyzer is most wanted for, so throwing the whole file away over one bad byte would be the wrong behaviour.

### Does it change my file?

No. This tool only reads. There is no output file, no re-encode and no button here that writes a GIF — the only thing you can download is a plain-text copy of the analysis. Your original is untouched on your disk, which is also the honest answer to what happens if you close the tab.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in and no trial. There is no limit on file size beyond your own machine's memory. The site carries advertising, which is what pays for it; the ads are not given anything about your file.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your GIF away to be analysed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your GIF has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were. This used to read `connect-src 'none'`, which was absolute; adding advertising cost that, and saying so is part of the deal.
- **The reader is four files in this repository.** Nothing here uses the browser's own GIF decoder to work out what is in the file, because that decoder will not say where a byte went. So the format is read out by hand: `src/gif.js` walks the blocks, `src/lzw.js` expands the pixels, `src/frames.js` stacks them, and `src/budget.js` adds the parts back up and checks they come to the size of the file.
- **Comments and metadata are shown to you, and to nobody else.** A GIF can carry a comment block, an XMP packet describing an edit, or a colour profile, and this page prints all of them out. They are put on the screen in front of you and go nowhere else: there is no analytics event in this repository that carries any of it, and the page could not send one if there were.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your file: not the file, not a thumbnail, not a name, a size, a frame count or a comment. Every line that reads, decompresses or draws a GIF is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your files. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and every part of this page still works. That is the simplest proof of all: a tool that sent your GIF away to be analysed would stop the moment you unplugged.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/gif.js` for the block reader that walks the file, `src/lzw.js` for the decompressor, and `src/budget.js` for the byte accounting — none of which has a line that could reach the network.
