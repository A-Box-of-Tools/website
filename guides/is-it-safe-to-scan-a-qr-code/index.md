# Is it safe to scan a QR code?

The scan itself is. A QR code is a piece of text, and pointing a camera at it does nothing but read that text. Everything that can go wrong happens one tap later, when something opens what was read — and that tap is yours to withhold.

Last updated 26 August 2026

## The short answer

Scanning is safe. A QR code is a short piece of text drawn as squares, and pointing a camera at it does exactly one thing: it reads that text back. The reading cannot install anything, cannot visit anything, and cannot touch anything on your phone, for the same reason that looking at a written address does not take you there.

The danger begins one step later, when something *opens* what was read — and the whole trick of every QR scam is to make that step happen before you have seen where you are going. The text inside the code is an address nobody can read with their eyes, and most phones answer it with a single eager tap. Keep the reading and the opening apart, and the scam has nothing left to work with.

## What a QR code actually is

Underneath the squares there is nothing but a string of characters — a few thousand at the outside, usually far fewer. A web address, a Wi-Fi network name and password, a contact card, a line of plain text. The format was designed in 1994 to track car parts through a Toyota factory, and it contains no instructions of any kind. A QR code cannot “contain a virus” any more than a signpost can.

What it can contain is a piece of text that *asks* your phone to do something: open this address, join this network, add this contact. Every one of those is a request, not a command. The code proposes; whatever scanned it decides. A scanner that shows you the text and waits is entirely safe. A scanner that acts on the text by itself has given the decision to whoever printed the code — and that is the entire difference between a safe scan and a dangerous one.

It is fair to add one footnote: the program doing the decoding can have bugs, like any program that parses input, and there have been such bugs in scanners over the years. But that risk belongs to the scanner, not to the code, and it is not the thing the scams rely on. The scams rely on the tap.

## The sticker trick

The scam common enough to have earned a name — quishing — is almost embarrassingly simple: print a code of your own, stick it over a real one, and wait. On a parking meter, where the fake leads to a payment page that looks like the council's. On a restaurant table, over the menu. On a parcel card through the door, beside the words “we missed you”.

Notice what makes it work. It is not technical sophistication — there is none. It is that a QR code is the one kind of address a person cannot read before following. A crooked web address written in letters gives itself away to anyone who looks at it; the same address drawn as squares looks exactly like an honest one. By the time you can see where the code went, you are already there, on a page built to look like the one you expected, asking for your card number.

The defence is not to stop scanning. It is to look at the address *between* the scan and the visit, which costs about two seconds and defeats the trick completely.

## Three ways an address lies

Two seconds of looking is enough, but only if you know what to look at. There are three honest-looking shapes a crooked address takes, and they are worth knowing by sight.

### 1. The name before the @

A web address may carry a username, written before an `@` sign: everything up to the `@` is decoration, and the real destination starts after it. `yourbank.com@evil.example` does not go to your bank. It goes to `evil.example`, carrying “yourbank.com” as a meaningless login name. The eye reads the start of an address; the browser reads the end.

### 2. Letters that are not the letters they look like

Alphabets overlap. A Cyrillic `а` is drawn exactly like a Latin `a`, and an address written with one is a different address that looks identical on screen. The trick has a name — a homograph attack — and it is why a destination can be a letter-perfect match for the one you trust and still be somewhere else.

### 3. The honest first hop

The address in the code can be genuinely respectable — a link shortener, a marketing redirect, a search engine's own click-tracking — and merely *forward* you somewhere that is not. The first address checks out; the destination is decided by a server after you have already set off. A shortened address in a printed code is not proof of anything wrong, but it does mean the address you can check is not the address you will arrive at.

## How to scan one safely

The rule is one sentence: **read first, open second, and never let one gesture do both.** In practice:

- Use a scanner that shows you the decoded text and stops. Most phone cameras show the destination in a small banner before opening it — read the banner rather than tapping it by reflex, and read the *end* of the address, not the start.
- Be most suspicious where the stakes are highest and the surface is public: anything that ends in a payment, on anything that lives outdoors. A parking meter's code deserves more thought than a museum label's.
- A code that leads straight to a login or card-details page is the moment to stop and type the address you already know instead. The legitimate version of that page is never more than a few keystrokes away.
- Wi-Fi and contact-card codes deserve the same pause: one asks your phone to remember a network, the other to store a person. Both are fine to accept knowingly and neither should happen silently.

## How the reader here behaves

This site has a [QR & barcode reader](https://abox.tools/qr-barcode-reader/), and it is built on the rule this page has been arguing for: **it never opens anything.** The decoded text is printed in full, the host the address would actually reach is pulled out onto its own line, and the three disguises above are checked for and named when they appear. Opening the link is a separate button, pressed after reading — or never.

The reading itself happens on your own machine. The picture you scan is decoded in your browser and is not sent anywhere, so a code you are suspicious of can be examined without anyone — including this site — learning what it said; the page keeps working with the wi-fi switched off, which is the easiest way to check that claim. And a payload that is outright hostile, like a `javascript:` address that would run code in the opener, is refused a link entirely and named for what it is.

The other half exists too: a [QR code generator](https://abox.tools/qr-barcode/) that draws codes on your own machine, and a companion guide on [making a code and proving it scans](https://abox.tools/guides/make-a-qr-code-and-prove-it-scans/) before it goes to print. And if the question behind your question was the broader one — what handing anything to a website actually does — that has [a page of its own](https://abox.tools/guides/is-it-safe-to-upload-files/).
