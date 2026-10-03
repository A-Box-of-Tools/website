# Image Stacker — combine a burst, RAW files included

Twenty frames into one, without twenty uploads or a RAW converter.

> Combine a burst of photographs into one: average them to kill noise, take the median to remove people from a scene, lighten for star trails, or focus stack a macro shot. Reads CR2, NEF, ARW, DNG, RAF and CR3 by pulling out the camera's own preview. Runs entirely in your browser.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/stack-images/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your photographs are **never uploaded**. There is no server.

Every frame is opened, decoded, aligned, combined and written by your own browser, on your own machine. A stack of twenty 60 MB RAW files is about a gigabyte of photographs, and not one byte of it moves: the tool has no network feature of any kind, and the files are read straight off your disk by a worker that has nowhere to send anything.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Reads RAW
- ✓ Works offline
- ✓ Open source

## How to stack a set of photographs in your browser

1. **Choose the frames.** A burst, a bracketed set, an intervalometer sequence, or a folder of RAW files. Each one is opened as it arrives and the row tells you what came out of it — for a RAW file, the camera, the size of the preview found inside, and how little of the file had to be read to find it.
2. **Pick the method that matches what you are trying to lose.** Noise: average, or sigma-clip if anything moved. People, cars or a passing aeroplane: median. A dark sky you want turned into star trails: lighten. A macro shot taken along the focus ring: focus stacking. The note under the menu says what each one does to your particular number of frames.
3. **Decide whether the frames need aligning.** Hand-held: yes, shift only. Hand-held and you were also turning: shift, rotation and scale. Locked-off tripod or an intervalometer: no, and it will be quicker. Every frame is measured against the one marked as the reference, which is the first one until you say otherwise: “use as reference” moves the mark and leaves the list in the order you put it in.
4. **Read the four figures, then press the button.** Before anything runs, the page says how large the result will be, roughly how much memory it will take, how many times the frames will be decoded and how much of your files was read. If the set will not fit in memory in one piece it says so, and says which working resolution would fix it.

## The longer version

[How to stack photographs to reduce noise, or remove people](https://abox.tools/guides/stack-photos-to-reduce-noise/): Stacking combines a burst of frames into one picture. Which method to use depends on what you are trying to lose: noise, passers-by, or the shallow depth of field on a macro shot. How each one works, what it costs, and how RAW files fit in.

## Also in the box

- [Image Redactor](https://abox.tools/redact-image/): What you cover is deleted from the file, not covered up in it.
- [EXIF Viewer & Remover](https://abox.tools/exif-editor/): See what a photo says about you. Then take it out.
- [DICOM Viewer](https://abox.tools/dicom-viewer/): CT, MR, X-ray and ultrasound, with the window, the header and the measurements.
- [Image to ICO](https://abox.tools/image-to-ico/): One picture in. Every size a browser, Windows or a Mac asks for, out.

## Questions

### Are my photographs uploaded anywhere?

No. Every frame is opened, decoded, aligned, stacked and written by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. Load the page once, unplug from the internet, and it still works. That matters more here than on most tools simply because of the volume: a stack of twenty RAW frames is about a gigabyte, and uploading a gigabyte of photographs to have an average taken of them is the thing this tool exists to avoid.

### Which RAW formats can it read, and how?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL and a few more — which is most of what cameras write. What it reads out of them is the full-size JPEG preview the camera itself rendered when it took the shot: the picture on the back of the camera, and the one your operating system draws as the thumbnail. It is found by walking the file's directory structure, which costs a few reads of a few kilobytes each, and then taking one slice. **It is not a demosaic of the sensor data.** The result carries the camera's white balance and picture style at eight bits a channel, rather than the twelve or fourteen bits of linear sensor data a RAW converter would give you.

### Then why not decode the sensor data properly?

Because it would mean vendoring LibRaw or dcraw — a second engine of tens of megabytes, for one family of formats, most of which is per-vendor compression schemes. That trade is argued out in `docs/what-can-be-built-here.md` in this site's source, where camera RAW has been on the ruled-out list since before this tool existed. What changed is not the answer to that question but the discovery that stacking does not need it: the previews are full resolution, they are what the camera would have given you as a JPEG anyway, and reading them is roughly a hundred times faster than demosaicing would be. If you want the sensor data, develop the frames in a RAW converter first and stack the TIFFs or JPEGs it produces — this tool will take those too.

### How many frames can it handle, and how large?

Six of the seven methods stream: they hold one accumulator and read each frame exactly once, so a hundred frames costs the same memory as two and the only thing that grows is the time. The median is the exception, because the middle value of a set is not knowable until you have all of it, so it holds every frame at once — twenty 24-megapixel frames is about 1.4 GB, which no browser will give you. When that happens the picture is cut into horizontal bands and stacked a band at a time, which costs re-reading the frames for each band. The page works all of this out before you press the button and shows you the number, so a slow run is never a surprise.

### What does aligning the frames actually do?

It finds how far each frame moved relative to the reference frame and moves it back, to a fraction of a pixel. The method is phase correlation: the shift between two pictures shows up as a phase difference between their spectra, so one Fourier transform each finds a two-hundred-pixel offset as cheaply as a two-pixel one. The second setting also recovers rotation and scale, by the same trick applied to the spectrum in log-polar coordinates. All of it is global — one shift, one angle, one scale for the whole frame — so it corrects a camera that moved and cannot correct a subject that moved, or a photograph taken from a step to the left. One visible consequence: a frame moved twenty pixels left no longer reaches the right-hand edge, so the result is trimmed to the part every frame covers. That is why an aligned stack comes back very slightly smaller than the frames that went into it, and it is the only alternative to a dark border made of the frames that were not there.

### Which method should I use?

**Average** for noise, on a set where nothing moved: it cuts random noise by roughly the square root of the number of frames. **Median** to remove things that were only there some of the time — the classic use is photographing a busy square a dozen times and getting it empty. **Sigma clipping** when you want both: it learns what each pixel usually is and averages only the values that agree, so it has the median's immunity to a passing car and the average's noise reduction. **Lighten** for star trails, fireworks and light painting. **Darken** to remove anything bright that moved. **Add** to simulate one long exposure. **Focus stacking** for a macro shot taken along the focus ring.

### Why is my result eight bits when my RAW files are fourteen?

Because what is being stacked is the camera's own preview, which is a JPEG. It is worth saying that stacking recovers some of what that costs: averaging sixteen eight-bit frames gives a result with genuinely finer gradations than any one of them had, because the noise that made each frame's rounding differ is exactly what lets the average land between the levels. The arithmetic here is done in floating point and rounded once at the very end, so none of that is thrown away in the middle. It is still not the same as stacking linear sensor data, and this tool does not pretend otherwise.

### Can I stack frames of different sizes, or from different cameras?

Yes, though it is usually a mistake and worth checking you meant it. The result is the size of the largest frame, and every other frame is scaled to fit and centred inside it. Mixing cameras also mixes colour rendering, so an average of the two is an average of two different interpretations of the same light. Where it genuinely helps is a set shot at two resolutions, or a RAW file and a JPEG of the same frame.

### It says the run will be banded. What does that mean?

That the working memory the method needs is more than the tool is willing to allocate in one go, so the picture will be cut into horizontal strips and stacked a strip at a time. It still produces exactly the same result; it just reads the frames again for each strip, so it takes longer, and the page tells you how many decodes that will be. Dropping the working resolution one step cuts the memory by four, which almost always turns a banded run into a single pass — the note says which setting would do it.

### Why does this tool use a Worker when none of the others do?

Because it is the only one whose work is measured in minutes. Every other tool here does something that takes a second or two, where moving the work off the main thread would be ceremony. Stacking twenty large frames is solid arithmetic over hundreds of megabytes, and on the main thread that means a frozen page: no progress bar moving, a Cancel button that does not answer, and eventually a browser offering to kill the tab. The Worker is a second thread in this same browser, running a file from this same folder, under this same policy. It is not a server and it is not a network feature.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no watermark. There is no limit on how many frames you stack or how large they are either, because there is no server paying for it — the work happens on your own machine and the only ceiling is your own memory. The site carries advertising, which is what pays for it; the ads are not given anything about your photographs.

## How the privacy claim is verifiable

- **Your photographs have nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your files could be collected at, and nothing in the code that would send them if there were — no `fetch`, no `XMLHttpRequest`, no `sendBeacon`, in `src/` or in the worker.
- **The RAW files are read, not uploaded — and barely read.** A camera RAW file already contains a full-size JPEG that the camera rendered when it took the shot. This tool finds it by walking a few directory entries and then asking for one slice, which on a 60 MB file is usually under a hundred kilobytes. The page shows you that figure against the size of your files while you work. The sensor data is never read at all.
- **The work happens in a Worker on this machine, not on a server.** This is the only tool here that uses one, because stacking is minutes of arithmetic rather than seconds and a frozen page cannot show progress or be cancelled. A Worker is a second thread in this same browser — see `src/worker.js`. It is handed the files themselves, which is free, because a file handle is not the bytes; and it has exactly the same Content-Security-Policy as the page, which is to say nowhere to send them.
- **Nothing about the set is reported anywhere.** How many frames you stacked, what camera wrote them, how far each one had moved, which method you chose and how long it took are held in this page's memory until you close it. There is no custom analytics event in this repository that carries any of it, and the one question this site asks after a download sends a thumb up or down and the name of the tool, nothing else.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. The worker and every module it loads are cached by this page's own service worker, so an installed copy stacks RAW files with the network unplugged.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/raw.js` for how a RAW file is opened by reading kilobytes rather than megabytes, `src/stack.js` for the arithmetic of each method, and `src/plan.js` for where the memory and decode figures shown on the page come from — they are that file's answers, not estimates.
