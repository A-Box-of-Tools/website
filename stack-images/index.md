# Image Stacker

Average a steady burst, take the median for a clear background, or lighten a night-sky sequence.

> Stack photos to reduce noise, remove moving people or make star trails. Align frames and save PNG or JPEG in your browser. RAW files use embedded JPEG previews.

This is an interactive browser tool at https://abox.tools/stack-images/. Files are processed on the device running that browser. Any deliberate sharing or optional network feature is described on the page. What follows is its written explanation; open the address to use it.

## Your photographs are **processed in your browser**. No processing upload.

Every frame is opened, decoded, aligned, combined and written by your own browser, on your own machine. A stack of twenty 60 MB RAW files is about a gigabyte of photographs, and not one byte of it moves: the tool has no network feature of any kind, and the files are read straight off your disk by a worker that processes them locally without a file upload.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Reads RAW
- ✓ Works offline
- ✓ Open source

## How to stack a set of photographs in your browser

1. **Choose the frames.** A burst, an intervalometer sequence, or a folder of RAW files with usable JPEG previews. Wait for the files to finish opening. Each row tells you what came out of it — for a RAW file, the camera and the actual size of the embedded preview. Files that could not be opened are listed so you can check what was left out.
2. **Pick the method that matches what you are trying to lose.** Noise: average, or sigma-clip to reject values that differ from the rest. People, cars or a passing aeroplane: median, provided they cover any given part of the scene in fewer than half the frames. A dark sky you want turned into star trails: lighten. A macro shot taken along the focus ring: focus stacking. The note under the menu explains the method and its limits.
3. **Decide whether the frames need aligning.** Start with Auto: it measures shift, rotation and scale, then corrects perspective when reliable regions across the image agree. It is useful for wide-field stars. Shift only does less measurement work for a steady burst. Choose None when frames already line up, or for star trails that should preserve the sky's motion. A fixed tripod does not keep stars aligned. Every frame is measured against the one marked as the reference, which is the first one until you say otherwise: “use as reference” moves the mark and leaves the list in the order you put it in.
4. **Read the four figures, then press the button.** Before anything runs, the page shows the planned result size, estimated working memory, planned stacking decodes and bytes read during inspection. Browser internals and garbage collection can add memory beyond the modeled buffers; the figures are a plan, not a guarantee of the browser's total use. If the stack needs bands, the page suggests a smaller working resolution. After the run, compare the reference with the result at actual pixel size and check the alignment details before downloading. Use the carry-on links beside the download to resize or compress the finished picture without choosing the file again.

## The longer version

[How to stack photos to reduce noise, remove people or make star trails](https://abox.tools/guides/stack-photos-to-reduce-noise/): Choose Average for a cleaner burst, Median for moving people, or Lighten for star trails. Prepare consistent frames, align, compare and save, with RAW preview limits explained.

## Also in the box

- [Image Redactor](https://abox.tools/redact-image/): What you cover is deleted from the file, not covered up in it.
- [EXIF Viewer & Remover](https://abox.tools/exif-editor/): See what a photo says about you. Then take it out.
- [DICOM Viewer](https://abox.tools/dicom-viewer/): CT, MR, X-ray and ultrasound, with the window, the header and the measurements.
- [Image to ICO](https://abox.tools/image-to-ico/): One picture in. Every size a browser, Windows or a Mac asks for, out.

## Questions

### Are my photographs uploaded anywhere?

No. Every frame is opened, decoded, aligned, stacked and written by your own browser on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. Load the page once, unplug from the internet, and it still works. That matters more here than on most tools simply because of the volume: a stack of twenty RAW frames is about a gigabyte, and uploading a gigabyte of photographs to have an average taken of them is the thing this tool exists to avoid.

### Which RAW formats can it read, and how?

CR2, CR3, NEF, NRW, ARW, SR2, SRF, DNG, ORF, RAF, RW2, PEF, SRW, 3FR, IIQ, DCR, KDC, MRW, MEF, RWL and related formats are supported when the file contains a usable JPEG preview. The tool walks the file's directories and uses the largest preview it can find, which may be smaller than the sensor image or absent altogether. **It does not decode the sensor data.** The pixels carry the camera's white balance and picture style at eight bits a channel. Check the dimensions shown in the row; the inspection-read count covers headers and directories, and decoding also reads the JPEG slice.

### Then why not decode the sensor data properly?

Sensor decoding would require a RAW engine such as LibRaw or dcraw, with its camera-specific compression schemes. Using an embedded JPEG keeps this tool small and uses the browser's own image decoder. It also means using the camera's rendering and whatever preview resolution the file contains. To choose your own RAW development settings, develop the frames first and export JPEG or PNG files to stack here.

### How many frames can it handle, and how large?

Six of the seven methods have accumulators whose size does not grow with the frame count. Average, lighten, darken, add and focus stacking need one stacking pass per band; sigma clipping needs two. Median holds every frame's values for the current band, so its memory grows with the frame count. Any method can be split into bands when its working buffers exceed the tool's budget, which means decoding the frames again for each band. The page estimates those buffers and shows the planned stacking decodes. Inspection and alignment add work, and browser codec and GPU internals can need memory beyond the estimate.

### What does aligning the frames actually do?

It finds how far each frame moved relative to the reference frame and moves it back, to a fraction of a pixel. The method is phase correlation: the shift between two pictures shows up as a phase difference between their spectra, so one Fourier transform each finds a two-hundred-pixel offset as cheaply as a two-pixel one. Rotation and scale are recovered by the same trick applied to the spectrum in log-polar coordinates. Auto also measures regions across the frame and corrects perspective when enough reliable measurements agree. This helps wide-field stars stay aligned near the edges as well as the centre. When that extra correction cannot be measured confidently, Auto keeps rotation and scale and reports the fallback in Alignment details. The correction applies to the whole frame; it cannot align an independently moving subject or every depth of a scene taken from a step to the left. One visible consequence: a frame moved twenty pixels left no longer reaches the right-hand edge, so the result is trimmed to the part every frame covers. That is why an aligned stack comes back very slightly smaller than the frames that went into it, and it is the only alternative to a dark border made of the frames that were not there.

### Which method should I use?

**Average** for noise, on a set where nothing moved: independent random noise falls by roughly the square root of the frame count. **Median** to remove things that cover a given part of the scene in fewer than half the frames. **Sigma clipping** averages values near their mean and rejects values outside the chosen threshold. It can retain moving objects in small sets or when they appear often, so median is the safer choice when removing them is the priority. **Lighten** for star trails, fireworks and light painting. **Darken** to remove bright things that moved. **Add** for additive blending of the decoded frames; this works on eight-bit image values, so it does not model a longer camera exposure. **Focus stacking** for a macro shot taken along the focus ring.

### Why is my result eight bits when my RAW files are fourteen?

The RAW input is the camera's JPEG preview, and the output is an eight-bit PNG or JPEG. Average and sigma clipping use wider accumulators and round at the end, which helps estimate a cleaner value from noisy frames without rounding each intermediate step. The saved image still has eight bits a channel; it does not gain the bit depth or dynamic range of linear sensor data.

### Can I stack frames of different sizes, or from different cameras?

Yes, though check that you meant to. The largest frame defines the working box; other frames are scaled to fit and centred. The saved result is cropped to the area the frames share, so different shapes or alignment can make it smaller than the planned box. Mixing cameras also mixes their colour rendering. Keep the exposure and framing consistent if you want a useful average, and use the reference comparison to inspect the result.

### It says the run will be banded. What does that mean?

That the working memory the method needs is more than the tool is willing to allocate in one go, so the picture will be cut into horizontal strips and stacked a strip at a time. It uses the same alignment geometry and stacking method; browser resampling can differ slightly at the last bit. It reads the frames again for each strip, so it takes longer, and the page tells you how many decodes that will be. Dropping the working resolution one step cuts the memory by four, which almost always turns a banded run into a single pass — the note says which setting would do it.

### Why does stacking run in a Worker?

Combining large frames can take minutes. A Worker handles the arithmetic while the page remains responsive enough to update progress and answer Cancel. It is another thread in this browser, running a local file under the page's policy. Your photographs stay on this device while it works.

### Is it free, and do I need an account?

It is free, with no account, sign-in, trial or watermark. There is no service quota on the number or size of frames. The practical limits are your device's memory, the browser's canvas and decoder limits, and the time the stack takes. The site carries advertising, which pays for it; the ads are not given anything about your photographs.

## How the privacy claim is verifiable

- **Processing happens in this browser.** This tool processes input and results inside your browser. Its processing code does not upload them for processing. Content-Security-Policy restricts permitted resources and connection destinations, but allowed hosts can still receive requests: the policy does not inspect payloads and alone cannot prove that nothing is sent. Compare the source with the requests for the operation you use, or complete that local operation while disconnected.
- **RAW previews are read on this machine.** Many camera RAW files contain a JPEG preview rendered by the camera. This tool finds the largest usable one by walking the file's directories and taking a slice. The inspection-read figure counts the headers and directories read to find and describe it; decoding reads the JPEG slice too. The sensor data is never decoded, and the row shows the preview's actual dimensions.
- **The work happens in a Worker on this machine, not on a server.** Stacking can take minutes, so a Worker handles the arithmetic while the page remains responsive and can show progress or cancel. It is another thread in this browser: see `src/worker.js`. File references are handed to it locally without uploading their bytes. The worker’s processing code reads and combines those files on this device; review that source rather than treating the page’s destination policy as proof of a worker’s data paths.
- **Journey events count fixed steps.** The site's journey events can count fixed steps such as adding input, starting a stack, a result becoming ready, a problem, cancellation or saving. They use the tool's name and fixed step labels; navigation events use fixed source and destination page names. They carry no photographs, filenames, camera details, frame counts, dimensions, chosen methods, settings, processing times or output content. The optional question after a download sends a thumb up or down and a fixed reason.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. The worker and every module it loads are cached by this page's own service worker, so an installed copy stacks RAW files with the network unplugged.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/raw.js` for how embedded RAW previews are found without decoding sensor data, `src/stack.js` for the arithmetic of each method, and `src/plan.js` for the estimated working memory and planned stacking decodes. Browser internals and garbage collection can add memory beyond the modeled buffers.
