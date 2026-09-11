# About abox.tools

One person, in Ontario, building the tools they kept needing and kept not trusting. Everything here runs on your own machine, the code is public, and this page is where the reasons behind both are written down.

Last updated 27 August 2026

## What this is

abox.tools is a collection of small utilities that do one job each — resize a photo, trim a video, merge two PDFs, read what is actually inside a QR code. There are 44 of them, and a [library of guides](https://abox.tools/guides/) explaining the jobs they are for.

The unusual part is not what they do. It is where they do it. Every one of them runs entirely inside your web browser, on your own hardware, using the decoders and encoders your browser already ships with. Nothing you open is transmitted anywhere. There is no server behind these pages to transmit it to: the whole site is static files, and the tools are plain JavaScript modules served alongside them.

That is the product. Everything else on this page is about why it is worth building that way, and who is doing it.

## Who makes it

One person, working alone, in Ontario, Canada. This is not a company. There is no team, no investor, no parent organisation, and no plan to be acquired by one. Correspondence goes to [hi@abox.tools](mailto:hi@abox.tools) and reaches the person who wrote the code; the [Contact page](https://abox.tools/contact/) sets out what that is and is not good for.

The site is deliberately published without a personal byline. It is a small project rather than a personal brand, and the thing that ought to be trusted here is not a name attached to a page — it is [the code](https://github.com/A-Box-of-Tools/website), which anyone can read, and the behaviour of the pages themselves, which anyone can check in about thirty seconds with DevTools open. Those two are verifiable. A byline is not.

## Why it is built this way

The ordinary way to build these tools is to upload the file, do the work on a server, and send the result back. It is easier, it works on any device, and it is what almost every “free online converter” does.

It also means handing a stranger your file. That is a small thing for a meme and a serious thing for a passport scan, a medical image, a contract with a signature on it, or a photograph with your home address in its metadata. Once the file is on someone else’s machine, what happens to it is a matter of their policy and their competence, and you have no way to audit either. The privacy policy of a site like that is a promise. It is not a constraint.

Browsers got good enough to make the promise unnecessary. They can decode and encode JPEG, PNG and WebP; they can demux and decode video; they can hash a file, read a QR code, and write a PDF. If the work can happen on your own machine, then “will they keep my file?” stops being a question about anybody’s intentions and becomes a question about what the code can physically do — which you can answer for yourself.

That is the whole argument, and there is a guide that makes it properly: [is it safe to upload files to a website?](https://abox.tools/guides/is-it-safe-to-upload-files/)

## How to check, rather than trust

Every claim above is meant to be tested. Four ways, in ascending order of effort:

- **Unplug the internet.** Load any tool page, disconnect, and use it anyway. It keeps working, because there was never a network step in it. A tool that sent your file away to be processed would stop.
- **Watch the network.** Open DevTools, go to the Network tab, and process a file. Not one request carries your file, a thumbnail of it, its name, or a byte of its contents. What you will see is the page, its scripts, the advertising and the visit counter.
- **Read the policy the page enforces on itself.** Every page carries a `Content-Security-Policy` naming every address it is allowed to contact, and not one of them belongs to this site. Even a mistake in the code could not send a file somewhere, because the browser would refuse the connection.
- **Read the code.** It is [all public](https://github.com/A-Box-of-Tools/website), with no build step and no bundler: what is in the repository is byte for byte what your browser runs. Each tool has a README explaining how it works, and each tool page names the particular files worth reading first.

There is exactly one deliberate exception to “no network”, and it is stated on its own page at length: [Share Text](https://abox.tools/share-text/) moves text between two of your own devices, which cannot be done without one. It opens a single connection to a relay that stores nothing and is only ever told that two browsers would like to be introduced.

## How the tools are built and checked

A tool ships when it works on real files, not when it works on the file it was written against. In practice that means each one is driven by hand in a browser on awkward inputs — the video with no keyframe where you want to cut, the HEIC from a phone that writes a slightly wrong container, the PDF with a subset font in it — because those are what people actually have, and they are what a test written by the same person who wrote the bug will not find.

Underneath that there is an automated suite covering both halves: the generator that builds the site, and the modules the browser runs. It runs on every change, and nothing is published past a failure. Where the same piece of work appears in more than one tool — several of them read MP4 files — a test asserts that the copies still agree, so a fix to one cannot quietly leave the others wrong.

The guides are written the same way. Their screenshots are captured from the built site by a script rather than drawn or mocked up, so a picture in a guide is a picture of the page as it actually is today.

## How this is paid for

Advertising, and donations from people who find the tools useful. That is the entire business model, and it is worth being precise about what it does and does not involve.

**There is nothing to buy.** No account, no sign-up, no free tier with a paid one above it, no watermark to remove, no file-size cap, no daily limit, and no feature held back. What is on the site is the whole thing.

**Your files are not part of the deal.** The advertising is Google’s and the visit counting is Google Analytics, and neither is given anything about what you open, what you make, what it was called, or how big it was — because neither script is ever handed it, and the page’s security policy would refuse to send it if either tried. Exactly what those two do collect, and how to switch each off, is set out on the [Privacy page](https://abox.tools/privacy/). Every tool keeps working with both of them blocked.

**The tools are not written for the advertising.** No tool here exists because a keyword was worth money, and none has been made slower, more fiddly, or more page-hungry to sell more impressions. What gets built next is argued out in the open, in [ROADMAP.md](https://github.com/A-Box-of-Tools/website/blob/main/ROADMAP.md), a paragraph per idea — including the reasons several obvious-looking ones have been turned down.

## Languages

The site is published in fifteen languages. Each is a real translation rather than a machine pass left where it landed: the tool names, the explanations, the guides and the addresses themselves are all translated, and a page is listed in a language only once that language has actually been written. A language still being worked on stays readable but is kept out of the sitemap and the language switcher, so nobody is invited to a page that is half in English.

Correspondence is answered in English, which is the one honest thing to say about a project this size.

## What this site will not do

- Ask you to create an account, or for your email address.
- Upload, store, inspect or retain a file you open with it.
- Put a watermark on a result, or hold a feature back for a paid tier.
- Add a network step to a tool that does not need one.
- Claim something on a tool page that the code in the repository does not do.

If you find any of those happening, that is a bug and a broken promise at the same time, and it is worth telling me about. The [Contact page](https://abox.tools/contact/) is the fastest way.
