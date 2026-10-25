# About abox.tools

One person, in Ontario, building the tools they kept needing and kept not trusting. Everything here runs on your own machine, the code is public, and this page is where the reasons behind both are written down.

Last updated 15 October 2026

## What this is

abox.tools is a collection of small utilities that do one job each — resize a photo, trim a video, merge two PDFs, read what is actually inside a QR code. There are 59 of them, and a [library of guides](https://abox.tools/guides/) explaining the jobs they are for.

Every tool processes files inside the browser running it, on that device's hardware. Most use native browser codecs; others include local JavaScript or WebAssembly engines, such as the HEIC decoder and receipt OCR. Files are not uploaded for processing. The site serves static pages and their code; intentional sharing and optional online features have separate boundaries explained below.

That is the product. Everything else on this page is about why it is worth building that way, and who is doing it.

## Who makes it

One person, working alone, in Ontario, Canada. This is not a company. There is no team, no investor, no parent organisation, and no plan to be acquired by one. Correspondence goes to [hi@abox.tools](mailto:hi@abox.tools) and reaches the person who wrote the code; the [Contact page](https://abox.tools/contact/) sets out what that is and is not good for.

The site is deliberately published without a personal byline. It is a small project rather than a personal brand, and the thing that ought to be trusted here is not a name attached to a page — it is [the code](https://github.com/A-Box-of-Tools/website), which anyone can read, and the behaviour of the pages themselves, which anyone can check in about thirty seconds with DevTools open. Those two are verifiable. A byline is not.

## Why it is built this way

Many online converters upload a file, process it on a server and return the result. Others can work locally. The useful distinction is where the work happens, and whether the job needs your file to leave the browser.

Server processing means handing the provider a copy of your file. For a passport scan, medical image, signed contract or photograph with location metadata, that is a decision worth checking. Published policies, security documentation, audits and observable behaviour can provide evidence. The webpage alone cannot show you every internal copy, backup or access after upload. A privacy policy describes the provider’s handling; it is not the same constraint as completing a local operation without a connection.

Browsers got good enough to make the promise unnecessary. They can decode and encode JPEG, PNG and WebP; they can demux and decode video; they can hash a file, read a QR code, and write a PDF. If the work can happen on your own machine, then “will they keep my file?” stops being a question about anybody’s intentions and becomes a question about what the code can physically do — which you can answer for yourself.

That is the whole argument, and there is a guide that makes it properly: [is it safe to upload files to a website?](https://abox.tools/guides/is-it-safe-to-upload-files/)

## How to check, rather than trust

Four checks give different kinds of evidence. Use them together, and check the feature you actually plan to use:

- **Disconnect for a local processing job.** Let the tool finish loading, wait for its offline indicator to say ready, then process a file from your device. Completion proves that operation ran locally while disconnected. It does not establish what a page might send after reconnection.
- **Inspect network requests.** Check URLs, request bodies and WebSocket messages, rather than relying on transfer size. Local processing does not send your files. Page assets, platform scripts, optional lookups and deliberate sharing are different traffic and are described on their pages.
- **Read the Content-Security-Policy.** It limits permitted resources and connection destinations. It does not inspect payloads, prevent data being sent to allowed hosts, or describe WebRTC peer traffic. Compare it with the source and observed behaviour.
- **Read the source and the built result.** The [repository](https://github.com/A-Box-of-Tools/website) contains the templates, modules, shared parts and bundled engines. The build generates the pages and minifies first-party code. Each tool names the files worth reading first; you can build the site and compare it with the published output.

The network features are intentional. [Images to Video](https://abox.tools/images-to-video/) can fetch an image URL. [Receipt & Invoice Extractor](https://abox.tools/receipt-invoice-extractor/) can request a currency pair and date from Frankfurter and hand a report to an email or sharing app you choose. [Share Text & Files](https://abox.tools/share-text/), [Share a Browser Tab](https://abox.tools/share-tab/), [Remote Camera](https://abox.tools/remote-camera/) and the live voice tools transfer content between browsers. These tools need internet for pairing. Their introduction services carry discovery where offered and connection metadata, never the shared content. Each tool explains its direct or optional relay path and the connections it needs; its page and the [Privacy page](https://abox.tools/privacy/) explain what each participant sees.

## How the tools are built and checked

A tool ships when it works on real files, not when it works on the file it was written against. In practice that means each one is driven by hand in a browser on awkward inputs — the video with no keyframe where you want to cut, the HEIC from a phone that writes a slightly wrong container, the PDF with a subset font in it — because those are what people actually have, and they are what a test written by the same person who wrote the bug will not find.

An automated suite covers the generator and the modules the browser runs. It runs in CI, and publication stops on a failure. Common parsers and writers, such as the MP4 reader, live in shared modules copied into each built tool. A duplicate-code check prevents separate copies from drifting apart.

The guides are written the same way. Their screenshots are captured from the built site by a script rather than drawn or mocked up, so a picture in a guide is a picture of the page as it actually is today.

## How this is paid for

Advertising, and donations from people who find the tools useful. That is the entire business model, and it is worth being precise about what it does and does not involve.

**There is nothing to buy.** No account, no paid tier, no watermark to remove and no feature held back for payment. Format support, browser memory and deliberate limits still matter; each tool explains them.

**Your files are not part of the deal.** Advertising and visit counting use Google services. Optional feedback sends the tool name, a fixed up or down answer and a fixed reason; it sends no file, filename, size or contents. The source does not pass file data to those services. Their permitted endpoints are still network destinations, so the security policy alone is not a guarantee about payloads. The [Privacy page](https://abox.tools/privacy/) describes collection and blocking. Local processing works with these scripts blocked.

**The tools are not written for the advertising.** No tool here exists because a keyword was worth money, and none has been made slower, more fiddly, or more page-hungry to sell more impressions. What gets built next is argued out in the open, in [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), a paragraph per idea — including the reasons several obvious-looking ones have been turned down.

## Languages

English, Simplified Chinese, German, Spanish, Brazilian Portuguese, French and Japanese are maintained here. Eight earlier translations remain readable as archived pages and do not receive current changes. Maintained pages are offered in the sitemap and language switcher only once translated; unfinished pages remain readable without being advertised as translations.

Correspondence is answered in English, which is the one honest thing to say about a project this size.

## What this site will not do

- Require an account or an email address to process a file.
- Receive or retain files on a server for processing.
- Put a watermark on a result, or hold a feature back for a paid tier.
- Add a network step to a tool that does not need one.
- Claim something on a tool page that the code in the repository does not do.

If you find any of those happening, that is a bug and a broken promise at the same time, and it is worth telling me about. The [Contact page](https://abox.tools/contact/) is the fastest way.
