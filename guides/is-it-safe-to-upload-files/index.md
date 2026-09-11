# Is it safe to upload files to online converters?

Usually the honest answer is “probably, but you cannot check.” This explains what uploading actually does with your file, why most tools still do it, and four tests that tell you whether the one in front of you has to.

Last updated 26 August 2026

## The short answer

For most files, most of the time, uploading is fine. Reputable converters delete what you send within a few hours and have no interest in your holiday photos.

The problem is not that they are lying. It is that **you have no way to tell whether they are**. Once a file leaves your machine, every promise about what happens next is a promise you are taking on trust: how long it is kept, who can reach it, whether it is copied to a backup that outlives the deletion timer, what happens to it if the company is sold or breached. None of that is visible from outside.

So the useful question is not “do I trust this site?” It is **“does this job need my file to leave at all?”** For a large and growing number of jobs the answer is no, and when the answer is no, the trust question stops being one you have to answer.

## What “upload” actually does

When a converter asks you to choose a file and then shows you a progress bar, your browser is copying the whole file, byte for byte, across the internet to a computer somebody else owns. That computer writes it to a disk, runs the conversion, writes the result to the same disk, and hands you a link.

At that moment your file exists in at least three places you did not choose: the server's disk, whatever logs recorded the request, and often a content delivery network that cached the result so the download is fast. A deletion policy has to reach all three. Most say they do. You cannot check any of them.

Worth knowing as well: the file is not the only thing that arrives. The filename goes with it, and so does everything inside the file that you cannot see. A photo straight off a phone typically carries the exact GPS coordinates where it was taken, the time, the camera's serial number, and sometimes an embedded thumbnail of the original image from before you cropped it. People who are careful about the picture are often not careful about that, because nothing on screen shows it to them.

## Why most tools upload anyway

Not because they want your files. Because for most of the web's life there was no alternative. A browser could not decode a video, re-encode an image at a chosen quality, or parse a file format; a server with FFmpeg and ImageMagick could. Uploading was not a business model, it was the only place the work could happen.

That stopped being true recently and quietly. Browsers now ship WebAssembly, which runs the same compiled codecs at close to native speed, WebCodecs, which exposes the hardware video encoder already in your machine, and a Canvas API that can decode and re-encode images directly. The work a server used to be needed for now runs on the device that already has the file.

Plenty of tools still upload, and there are honest reasons: an existing pipeline nobody wants to rewrite, a format with no browser-side decoder, a job genuinely too heavy for a phone. There is also a less honest reason, which is that a server is where accounts, quotas and paid tiers live. A tool that runs entirely in your browser is difficult to meter.

## Four checks you can run yourself

These work on any tool, including this one. None of them requires taking anybody's word for anything, and the first takes about ten seconds.

### 1. Pull the plug

Load the page, then turn off your wi-fi or unplug the cable, and try to use it. A tool that does its work in your browser carries on exactly as before. A tool that uploads stops immediately, because the thing doing the work is no longer reachable.

This is the strongest test there is, and the hardest to fake, because it cannot be answered with wording. Either the conversion completes with no network or it does not.

### 2. Watch the Network tab

Open your browser's developer tools, select Network, then use the tool. Every request the page makes is listed with its size. If your 4 MB photo was uploaded, there is a 4 MB request in that list. If the largest thing leaving the page is a few kilobytes of advertising, it was not.

Sort by size and look at the top. You do not need to understand the requests; you need to notice whether one of them is the size of your file.

### 3. Read the Content-Security-Policy

View the page source and look for `Content-Security-Policy`, near the top. It is a list of the addresses that page is permitted to contact, and it is enforced by your browser rather than by the site's good intentions — a request to anything not on the list is refused, whatever the code tries.

The directive that matters is `connect-src`, which governs where the page may send data. If it names an address belonging to the site you are on, the page can send your file there. If it names nothing, or only third parties like an ad network, it cannot.

A page with no Content-Security-Policy at all is not evidence of anything bad. It just means this particular check has nothing to tell you.

### 4. Read the code

Least convenient, most conclusive. If a tool publishes its source and serves it without a build step, the files your browser fetched are the files you can read. Search them for `fetch`, `XMLHttpRequest` and `sendBeacon` — the three ways a page can send anything — and see what they are given.

Most people will not do this. It still matters that it is possible, because a claim nobody is able to check is not really a claim.

## What “runs in your browser” does not mean

It is worth being precise, because the phrase gets used loosely and this site has to hold itself to the same standard it is proposing.

- **It does not mean no requests at all.** The page itself arrived over the network, and most free tools carry advertising or analytics that talk to somebody. The claim is about your *file*, not about traffic in general.
- **It does not hide your IP address.** Every site you visit sees it, this one included. Local processing is about the contents of your files, not about anonymity.
- **It does not survive a feature that fetches something.** A tool that lets you paste a web address has to contact that address, and that server learns your IP and what you asked for. That is inherent to the feature, not a flaw in it — but it is a real exception and a tool should say so plainly rather than round it off.
- **It is not the same as “we delete your files.”** The second sentence is about what a company chooses to do. The first is about what is technically possible. Only one of them is checkable.

## When uploading is genuinely fine

This is not an argument that every upload is a mistake. Send the file when the content is not sensitive and the job is easier that way; when the work really is too heavy for your device; when the format has no browser-side decoder; or when you are using a service you already have a relationship with and whose terms you have actually read.

Be more careful when the file contains something you would not post publicly: identity documents, medical scans, contracts, anything with an address or a face you did not intend to share, or a photo whose location data you have not looked at. For those, a tool you can check is worth preferring over a tool you have to trust — not because the trusted one is likely to betray you, but because with the checkable one the question does not arise.

## How this site answers those four checks

It would be a strange guide that told you to check and then asked to be exempt. So, in order:

- **Pull the plug.** Open any tool here, disconnect, and it keeps working. Each tool page has a live indicator that tells you whether you are currently online, so you can watch it change.
- **Network tab.** Convert something and read the list. Nothing carries your file, a thumbnail of it, its name, its size, or anything read out of it. There is no custom analytics event on this site that has any of that to send.
- **Content-Security-Policy.** It is at the top of every page's source. `connect-src` names Google's advertising and measurement endpoints and the donate button, and nothing else. **No address on that list belongs to this site**, because this site has no server — it is static files. There is nowhere for a file to be sent even if something tried.
- **Code.** Every line is [public](https://github.com/A-Box-of-Tools/website). The build strips comments and whitespace and nothing else, and you can run it yourself and compare the result against what is being served.

The exceptions, stated rather than buried: this site carries Google advertising and a visit counter, both of which talk to Google and neither of which is handed anything about your files; and the [Images to Video](https://abox.tools/images-to-video/) tool can fetch an image from an address you paste in, which means that server sees your IP. The [privacy page](https://abox.tools/privacy/) sets both out in full.

Every tool here works this way: an [image compressor](https://abox.tools/compress-image/) that hits a size you name, a [video cropper](https://abox.tools/crop-video/), an [EXIF viewer and remover](https://abox.tools/exif-editor/) for the hidden data described further up this page, [images to video](https://abox.tools/images-to-video/), and [images to PDF](https://abox.tools/images-to-pdf/). All free, no account, and none of them has anywhere to send your files.

![The panel on a tool page: a line saying the files never leave the browser, the facts behind it, and a live check reporting that the page has made no network requests.](https://abox.tools/screens/is-it-safe-to-upload-files/pledge.webp)

The last of the four checks, answered on the page rather than in a paragraph: the count is made by the page about itself, and you can make the same count in your own browser.
