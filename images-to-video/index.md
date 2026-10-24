# Images to Video

Make an MP4 from a render sequence, timelapse photos or a slideshow.

> Convert an image sequence to MP4 in your browser. Use one frame per image for renders and timelapses, or seconds per photo for a slideshow. No upload or account.

This is an interactive browser tool at https://abox.tools/images-to-video/. Files are processed on the device running that browser. Any deliberate sharing or optional network feature is described on the page. What follows is its written explanation; open the address to use it.

## Your images are **processed in your browser**. No processing upload.

Every frame is encoded by your own browser and the video is built in memory on this machine. The encoder never touches the network, and there is no server on the other end of this page to send an image to even if it did.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to convert an image sequence or slideshow to MP4

1. **Choose your images.** Drop a folder onto the picker, or select the files by hand. They are read straight off your disk by the browser; nothing is sent anywhere while you do it.
2. **Choose frames for a sequence, or seconds for a slideshow.** Use Sort by name for numbered render frames and check the first and last tiles. Keep one frame per image for a render sequence or photo timelapse; match the frame rate to your source. For a slideshow, switch to seconds, enter a hold such as three, and press Apply to all. Drag to reorder or override an individual image's hold.
3. **Pick a resolution and frame rate.** Choose 1080p for a first export, or use the destination's square or vertical shape. Match highest resolution takes the widest width and tallest height across the images. Fit inside keeps the whole picture; Fill frame crops the edges. Check the duration and output-size summary before encoding.
4. **Create the video and download it.** Encoding runs on your own hardware, so how long it takes depends on your machine rather than on a queue. The finished MP4 is handed straight to your browser's downloads.

## The longer version

[Turn an image sequence or photo slideshow into MP4](https://abox.tools/guides/turn-images-into-a-video/): Turn numbered render frames or timelapse photos into MP4, or make a photo slideshow. Choose frame holds or seconds, check order, and avoid cropped or mistimed output.

## Also in the box

- [Video Cutter](https://abox.tools/trim-video/): Mark the parts worth keeping as it plays. Get them back as one video.
- [Video Cropper](https://abox.tools/crop-video/): Cut a clip down to the part that matters.
- [Video Reverser](https://abox.tools/reverse-video/): Last frame first, sound and all.
- [Time-Lapse Maker](https://abox.tools/timelapse-video/): An hour of footage, in twenty seconds.

## Questions

### Are my images uploaded anywhere?

No. Your images are read, composited and encoded by your own browser on your own hardware. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The one exception is the optional "add from a web address" feature, which fetches an image you paste in, and that server sees your IP address.

### Which image formats can I use?

Any still image format your browser can decode, which in practice means JPG, PNG, WebP, GIF, AVIF and, on Apple devices, HEIC. There is no separate list to keep up to date here, because the decoding is the browser's job rather than ours.

### What video format does it produce?

MP4 with H.264 video is the preferred output. The fallback records in real time, usually as WebM, which fewer editors accept. Keep the tab visible during fallback recording; timing is approximate and images can be skipped if decoding falls behind. Use the MP4 encoder for exact numbered sequences when your browser supports it.

### Can I use this for a Blender or After Effects render sequence?

Yes — a numbered render sequence is exactly what this is for. Add the frames your renderer wrote, leave the hold time at one frame each, and set the frame rate to match the render. "Sort by name" counts the way you would expect, so `frame_2` lands before `frame_10` rather than after it. \
\
One thing worth knowing before you start: H.264 has no alpha channel, so transparency is flattened onto the backdrop colour rather than carried through. If you need to keep the alpha, composite the frames in your editor instead.

### Can I make a timelapse from photos?

Yes, and it is the same job as a render sequence: hold each photo for a single frame and pick a frame rate. At 30 fps every thirty photos becomes one second of video; at 12 fps those same photos run for two and a half seconds. \
\
"Sort by date" uses the files' modification dates, which may change when photographs are copied or edited. Check the order when filenames have restarted at 0001. Photos of different sizes are fine — "Match highest resolution" starts with the widest width and tallest height, then limits the longest edge to 7680 pixels and rounds to even dimensions. Check the output-size summary; very large originals can still be scaled down.

### Is there a limit on how many images, or how long the video can be?

There is no fixed image-count limit, but MP4 exports must stay below 4 GiB (about 4.3 GB). The finished video is assembled in memory before download, so your device can run out of memory well before that cap. The browser's encoder also limits output dimensions. If a large export fails, reduce resolution, shorten the sequence or split it into parts.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your images.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your images away to be processed would stop the moment you unplugged.

### Can I add music or a soundtrack?

Not yet. The tool produces video only: the MP4 it writes has a single video track and no audio track. Add a soundtrack afterwards in a video editor if you need one.

## How the privacy claim is verifiable

- **Processing happens in this browser.** This tool processes input and results inside your browser. Its processing code does not upload them for processing. Content-Security-Policy restricts permitted resources and connection destinations, but allowed hosts can still receive requests: the policy does not inspect payloads and alone cannot prove that nothing is sent. Compare the source with the requests for the operation you use, or complete that local operation while disconnected.
- **Encoding is local.** WebCodecs runs in your browser and the finished file is handed straight to a download. There is no server side to this app.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your images: not a file, not a thumbnail, not a name, a size, or a count. Every line that reads, decodes, composites or encodes an image is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your images. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **One deliberate exception.** If you use "Add from a web address", that server is contacted to fetch the image and will see your IP address. Only images you paste in are ever fetched, and only inbound: `img-src` is opened, `connect-src` is not. The counter below lists every outside origin contacted.
- **It works offline.** Disconnect from the network and everything except web-address loading still functions. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, and `src/encoder.js` for the encoding loop that never touches the network.
