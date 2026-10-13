# What 20 online converters do with your file

We handed the same 542 KB image to twenty free online converters and measured request-body sizes that left the browser. Nineteen of them sent it to a server. Thirteen sent it before we pressed a single button, and every result file we went looking for afterwards was still sitting on a public address.

Last updated 12 October 2026

## The short answer

On 17 September 2026 we handed the same file to twenty free online converters and recorded request-body sizes through the hooks described below. **Nineteen of the twenty uploaded it.** One did not.

That much is roughly what anybody would have guessed. The three things that were not obvious are these: **thirteen of the nineteen sent the file the moment it was chosen**, before the Convert button was pressed and before there was any way to change your mind; **every finished file we went looking for afterwards was still readable at a plain web address**, with no cookie, no login and no session of any kind; and **two of them put the name of the file into that address**.

None of this is evidence that anybody is behaving badly. Uploading is how most of these tools have always worked, the retention policies are mostly short and mostly specific, and a converter that keeps your file for two hours on an address nobody has guessed is not a scandal. It is evidence of something duller and more useful: that the gap between “*this site says it deletes my file*” and “*I can see what happened to my file*” is much wider than it looks, and that it can be measured in an afternoon.

## How this was measured

The method is deliberately dull and repeatable, because the point of the page is the numbers rather than the opinion attached to them.

### The file

A 450 × 350 PNG filled with random pixels, about 542 KB, named `abox-probe-9471.png`. Random noise because it is difficult to compress. A payload near its size is a useful clue, but the request body must still be inspected to establish what was sent. A distinctive filename because it makes the file findable in a URL later, which turned out to matter.

### The measurement

Before the file was handed over, the following request APIs were instrumented with a version that records the size of what it was given and then does the normal thing: `fetch`, `XMLHttpRequest`, `navigator.sendBeacon`, `WebSocket.send`, and — this one matters — `HTMLFormElement.submit`. Then the file was put into the page's own file input, the page was left alone for ten seconds, and the recording was read back.

The form hook is not an afterthought. Several of the twenty upload by plain HTML form post rather than by script, which is invisible to the `fetch` and `XMLHttpRequest` hooks everybody reaches for first. One of them, PicResize, shows the image locally from a `blob:` address while it does it, which looks exactly like a tool that works in your browser until you catch the form on its way out.

### The check afterwards

Where a site handed back a link to the finished file, that link was fetched again from a plain command line — a different program, no cookies, no session, nothing carried over from the browser at all. A file that comes back under those conditions is readable by anyone who has the address.

Twenty is twenty sites we could drive, not the twenty largest. Nine more were tried and could not be measured, and they are listed further down rather than quietly dropped, because a tool that resisted automation is not a tool that passed a test.

## The table

The byte counts below are the request-body measurements reported on 17 September 2026, with missing counts left missing. The last column preserves the policy summaries reported that day. Its links point to current reference pages checked on 12 October 2026; they are not archived proof of the earlier wording.

| Converter | Did the file leave? | Bytes measured | Where it went | Policy says it is kept |
| --- | --- | --- | --- | --- |
| Squoosh | No | 0 | — | [nothing to keep](https://github.com/GoogleChromeLabs/squoosh/blob/dev/README.md) |
| TinyPNG | Yes, on select | 542,566 | `tinypng.com/backend/opt/store` | [48 hours](https://tinypng.com/terms) |
| iLoveIMG | Yes, on select | 542,816 | `api9.iloveimg.com/v1/upload` | [2 hours](https://www.iloveimg.com/help/terms) |
| iLovePDF | Yes, on select | 542,801 | `api4.ilovepdf.com/v1/upload` | [2 hours](https://www.ilovepdf.com/help/privacy) |
| Sejda | Yes, on select | 542,537 | `sejda.com/api/files/upload` | [after processing; shared links 7 days](https://www.sejda.com/privacy) |
| PDF24 | Yes, on select | 542,531 | `filetools24.pdf24.org/client.php` | [“usually” 1 hour](https://www.pdf24.org/en/privacy-policy) |
| PDF Candy | Yes, on select | 542,522 | `s35.api.pdfcandy.com/uploadcbc/…` | [2 hours](https://pdfcandy.com/help.html) |
| jpg2pdf.com | Yes, on select | 542,570 | `jpg2pdf.com/api/upload` | [1 hour, stated in Terms](https://jpg2pdf.com/terms) |
| Img2Go | Yes, on select | 542,589 | `www21.img2go.com/v2/dl/web7/…` | [72 hours](https://www.img2go.com/privacy) |
| Online-Convert | Yes, on select | 542,423 | `www8.online-convert.com/v2/dl/web7/…` | [72 hours](https://www.online-convert.com/privacy) |
| PDF2Go | Yes, on select | 542,542 | `www15.pdf2go.com/v2/dl/web7/…` | [72 hours](https://www.pdf2go.com/privacy) |
| Compress2Go | Yes, on select | 542,492 | `www6.compress2go.com/v2/dl/web7/…` | [72 hours](https://www.compress2go.com/privacy) |
| PicResize | Yes, on select | 542,568 | `picresize.com/en/edit`, form post | [20 minutes](https://picresize.com/en/privacypolicy) |
| ResizePixel | Yes, on select | form post | `resizepixel.com/` | [within 1 hour](https://www.resizepixel.com/en/privacy) |
| CloudConvert | Yes, on convert | 543,218 | `eu-central.storage.cloudconvert.com/…` | [24 hours](https://cloudconvert.com/privacy) |
| Convertio | Yes, on convert | not captured | `convertio.co/process/…` | [24 hours](https://convertio.co/privacy/) |
| Ezgif | Yes, on convert | 542,483 | `ezgif.com/optimize`, form post | [1 hour after last use](https://ezgif.com/privacy) |
| Aconvert | Yes, on convert | form post | `aconvert.com/results.php` | [2 hours](https://www.aconvert.com/privacy.html) |
| Online2PDF | Yes, on convert | 547,330 | `online2pdf.com/conversion/frame` | [“immediately”](https://online2pdf.com/privacy) |
| IMGonline | Yes, on convert | 542,633 | `imgonline.com.ua/eng/…-result.php` | no policy found |

Twenty converters, one 542 KB file, 17 September 2026. “On select” means the upload began when the file was chosen; “on convert” means it waited for the button. Convertio's upload navigated the page away before the byte count could be read, so its size is reported as not captured rather than guessed.

## The observations and their limits

The published table is available as [JSON with provenance and limitations](https://abox.tools/data/converter-observations-2026-09-17.json) and [CSV rows](https://abox.tools/data/converter-observations-2026-09-17.csv). These files transcribe this article; they are not a new test. Counting the table gives thirteen selection-time uploads, correcting the eleven previously stated in the text.

The original request logs, browser version, exact random fixture and historical policy snapshots were not retained with the article. The figures therefore remain reported observations rather than a raw dataset that a reader can independently verify. The hooks do not cover every transfer path: form navigation, other frames, workers and WebRTC require separate inspection. A zero in this table means no upload was recorded by this test, rather than proof that no transfer is possible.

To repeat the comparison, create a fresh synthetic file, record its exact bytes and SHA-256, and use a fresh browser profile. Save a Network capture with request bodies and navigation preserved; inspect selection and conversion separately. Record the browser version, URL, time, action, destination, body size and whether the body contains the fixture. Redact credentials and private result links before sharing a capture. Preserve the policy text with its URL and date, and record unfinished tests separately.

A file URL returning without a session establishes access for someone holding that URL at that time. Check again after the stated retention interval before claiming deletion failed. Neither that check nor a network capture establishes what remains in a service’s internal logs or backups.

## Thirteen of them upload before you press anything

This was the result we did not expect to be so lopsided. On thirteen of the nineteen, the file was already on its way to a server while the page was still showing a Convert button that had not been clicked.

On iLoveIMG the page sat there reading *Compress IMAGES*, waiting to be told to start, and 542,816 bytes had already gone to `api9.iloveimg.com`. The same on iLovePDF, PDF24, PDF Candy, Sejda, TinyPNG, jpg2pdf and the four sites in the platform section below.

There is a perfectly good engineering reason for it: uploading while the person is still reading the options makes the conversion feel instant when they finally commit. It is a real improvement to the thing it is trying to improve. But it quietly removes a step most people believe they have. Choosing a file feels like opening it; pressing Convert feels like sending it. On thirteen of these twenty those are the same moment, and it is the earlier one that counts.

The practical consequence is small and exact: on those thirteen, noticing that you picked the wrong file — the unredacted draft, the payslip, the photo you meant to crop first — is something you can only do after it has gone.

## The finished file sits on a public address

Four of the sites hand back an ordinary link to the converted file. We fetched all four again from a command line, with no cookies and no session — a different program entirely, sharing nothing with the browser that did the conversion. All four returned the file.

- **Ezgif** — `s1.ezgif.com/tmp/…` returned 542,483 bytes: our probe, to the byte.
- **Aconvert** — `s6.aconvert.com/convert/…` returned a 474,856-byte PDF.
- **ResizePixel** — `resizepixel.com/Image/…` returned 432,111 bytes.
- **IMGonline** — `srv2.imgonline.com.ua/result_img/…` returned a 128,179-byte JPEG.

The tested addresses contained hard-to-guess components. Anyone holding one could fetch that result at the time of the check. Such a link can leak through browser history, screenshots or messages, and through referrers where the page’s policy permits it. HTTPS hides its path from an ordinary network intermediary; the referrer policy determines what a later website receives. The observation is about those four links, not every download method a converter offers.

Aconvert, to its credit, says so on the results page itself: that the files are not kept more than two hours, and not to link to them from other websites. That is the right warning, on the right page, at the right moment. It is also the only one of the four that gives it.

## The filename travels too

People think of a file as its contents. A converter receives rather more than that, and two of these twenty put the extra part somewhere easy to see.

PDF Candy uploaded ours to an address ending `/uploadcbc/1789652849416-abox-probe-9471.png` — a timestamp and then the original filename, in the address itself. ResizePixel served the preview back from `/Image/<id>/Preview/abox-probe-9471.png`, likewise.

Ours was called `abox-probe-9471.png` and gave away nothing. Real files are called `passport-scan.jpg`, `contract-signed-final.pdf`, `scan-12wk.png`. A filename is often the most descriptive single line of metadata a document has, and the address is the part of a request that gets logged, cached and retained the longest, usually by more parties than the file itself.

The same is true of what is inside the file and never shown on screen. A photo straight off a phone normally carries the coordinates where it was taken, the time, the camera's serial number and sometimes a thumbnail of the picture as it was *before* you cropped it. Whatever the converter did with the image, it received all of that.

## Four names, one platform

Img2Go, Online-Convert, PDF2Go and Compress2Go look like four independent services. Our file went to four different hostnames — `www21.img2go.com`, `www8.online-convert.com`, `www15.pdf2go.com` and `www6.compress2go.com` — and every one of them received it at the same path:

```
/v2/dl/web7/upload-file/<uuid>
```

Identical endpoint, identical upload behaviour, identical policy wording, identical stated retention of 72 hours. They are four front doors onto one platform, which their policies do disclose to a reader who gets that far.

This is not a criticism — running several branded sites on one backend is ordinary and efficient. It is worth knowing for one reason: if you respond to a converter you distrust by going to a different converter, you may not have gone anywhere. “I will use a different site” is only a precaution if the different site is a different site.

A smaller version of the same point: CloudConvert sent our file to `eu-central.storage.cloudconvert.com`. The hostname tells you which region it landed in, which is more than most of the twenty tell you anywhere.

## What the policies say, and what that is worth

The retention promises are mostly short, mostly specific, and mostly better than the reputation of this corner of the web would suggest. They run from Online2PDF deleting immediately after the conversion and PicResize's twenty minutes, through the two hours of iLovePDF, iLoveIMG, PDF Candy and Aconvert, to the 72 hours of the four-site platform above.

Two of the twenty are worth naming for the opposite reason. **jpg2pdf.com** has no privacy policy at the usual address: the only legal link on its front page is `/terms`, and the promise lives inside it — one hour, in a document headed “Terms and Privacy”. That is a fine promise in an odd place. For **IMGonline** we could not find a privacy policy at all: no link on its English front page, nothing at the two conventional addresses, and nothing on the tool page about storage or deletion — while its finished files are, as above, fetchable by anyone holding the link.

But the number of hours is not the whole question. **A public result link still returning the file after the stated retention interval can reveal missed deletion.** A link that expires cannot prove that every internal copy was removed. You cannot see whether deletion reached the backup, the log, the error report that captured the request body, or the content delivery network that cached the result. You cannot see what becomes of those copies if the company is sold or breached. A retention policy states an intention about systems you cannot inspect; honest and dishonest promises can use the same words.

That is the whole argument for preferring a tool that cannot send the file at all. Not that the companies above are lying. That with a tool which never uploads there is nothing to lie about, and nothing you have to take anybody's word for.

## The one that did not upload

Squoosh, Google's image compressor, took the file, showed it, compressed it, and had **no file upload recorded by this test**. Zero reported upload bytes, by the same measurement that caught 542,566 leaving TinyPNG a minute earlier.

It matters that it is in the table, because it is the control. It shows the measurement can come back negative, so the nineteen positives are not an artefact of a method that was always going to find something. And it shows the job is doable in a browser — the same work, the same formats, no server — which is the quiet answer to the assumption underneath most of this page, that a converter has to upload because converting is hard.

It does not have to. Most of these tools upload because they were built when it did, and because a server is where accounts, quotas and paid tiers live. A tool that runs entirely in your browser is difficult to meter.

## What we could not measure

Nine more sites were attempted and are not in the table: FreeConvert, Smallpdf, Zamzar, Optimizilla, Photopea, media.io, Bulk Resize Photos, png2jpg.com and SimpleImageResizer.

In eight cases the reason is ours rather than theirs: their upload controls respond only to a real click, and would not accept a file placed into them by a script. Nothing was uploaded, so there was nothing to measure. **That is not a result and must not be read as one** — in particular it is not evidence that any of those eight keeps your file on your machine. It means the test did not run.

SimpleImageResizer is the more interesting failure, and worth recording because it is the trap this method sets for itself. Its form carries a file input but is declared `enctype="application/x-www-form-urlencoded"`, and a browser handed that combination sends *the filename only*, not the bytes. A naive measurement — ours, at first — totals up the form's contents and reports a confident 1,085,210-byte upload that never happened. We dropped the row rather than publish it. Anyone repeating this work should check the `enctype` before believing a form.

## Check any of it yourself

The original traces are unavailable, so the historical table cannot be verified from raw requests. The method above supports a fresh comparison. The quickest version needs no tooling at all:

- **Pull the plug.** Load the tool, turn off your wi-fi, then use it. Work that happens in your browser carries on. Work that happens on a server stops. Nothing about this test can be answered with wording.
- **Watch the Network tab.** Open developer tools, select Network, sort by size, and use the tool. Inspect request payloads, not just the transferred-size column, which often describes responses. A thumbnail, chunked upload or encoded file can have a different size. Look *before* you press Convert as well as after — that is the whole finding of the section above.
- **Read the `connect-src`.** In the page source, the `Content-Security-Policy` lists the addresses that page is permitted to contact, and your browser enforces it whatever the code tries. If it names an address belonging to the site you are on, the page can send your file there.

The longer version of all three, and why a fourth one is worth the trouble, is in [is it safe to upload files to online converters?](https://abox.tools/guides/is-it-safe-to-upload-files/)

## How this site answers the same question

This site’s source is separate evidence from the historical converter measurements above. The current implementation makes the following claims, which you can check with the [four-check method](https://abox.tools/guides/is-it-safe-to-upload-files/) on the feature you intend to use.

- **Offline.** Local processing works with loaded assets and a ready cache. Image URL retrieval, online rates and browser introductions require their respective connections.
- **Requests.** The processing code does not upload selected files. Platform page visits and optional fixed feedback votes are separate. Rate requests contain a currency pair and date, and intentional peer features send content to the chosen browser. **Policy.** Most tools inherit platform destinations. Receipt extraction adds Frankfurter; Share Text & Files and Remote Camera add the rendezvous. The policy constrains destinations and does not prove every payload.
- **Retention.** abox.tools does not receive files for processing, so it has no server copy to delete from that operation. Local browser records, seven-day rendezvous connection logs and content retained by a sharing or email recipient are separate data paths described in the Privacy page.
- **Source.** The [source is public](https://github.com/A-Box-of-Tools/website). Build it and compare generated output. Shared modules and bundled engines are available alongside the first-party code.

The [Privacy page](https://abox.tools/privacy/) gives the full boundaries: [image URL imports](https://abox.tools/images-to-video/), optional [receipt exchange rates and app handoffs](https://abox.tools/receipt-invoice-extractor/), [browser-to-browser sharing](https://abox.tools/share-text/) and [remote camera viewing](https://abox.tools/remote-camera/), plus ads, Analytics and fixed feedback. A deliberate transfer is distinct from uploading a file for processing.

For local file processing, examples include [compressing toward a target size](https://abox.tools/compress-image/), [cropping a video](https://abox.tools/crop-video/), [removing EXIF and GPS](https://abox.tools/exif-editor/) and [making a PDF from images](https://abox.tools/images-to-pdf/). Check supported formats and the downloaded result. These jobs need no processing upload or account.

## Using these numbers

The measurements on this page are free to quote, cite and re-run. If you are writing about this, the useful shape is: twenty free online converters, measured 17 September 2026; nineteen uploaded the file; thirteen of those sent it before the Convert button was pressed; and four of four finished files were retrievable from a public address with no session of any kind.

A link back to this page is appreciated and not required. If you repeat the method and get a different answer — sites change, and this is a snapshot of one afternoon — we would rather hear about it than not. The [contact page](https://abox.tools/contact/) reaches us, and a correction with a byte count attached will be published here.
