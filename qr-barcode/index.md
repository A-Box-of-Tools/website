# QR & Barcode — make a QR code or a barcode, offline

Type it, and it becomes a code. Nothing is sent to make one.

> Make a QR code for a link, a Wi-Fi network or a contact card, or an EAN-13, UPC-A, Code 128 or Code 39 barcode. Download as SVG or PNG. It all happens in your browser.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/qr-barcode/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your codes and the text in them are **never uploaded**. There is no server.

A QR code is arithmetic over a string: there is no file to send and no service to ask. Every step — picking the mode, choosing the version, the Reed-Solomon error correction, the mask, the bars of a barcode and the check digit under it — happens in about a thousand lines of JavaScript in this page that you can read. This tool has no network feature of any kind, which matters more here than on most pages: the thing being encoded is often a Wi-Fi password.

- ✗ No upload
- ✗ No account
- ✗ No expiry
- ✓ Works offline
- ✓ Open source

## How to make a QR code without uploading anything

1. **Pick the kind of code.** A QR code holds anything and is what a phone camera looks for, so it is the answer unless somebody has told you otherwise. A barcode holds a number, and which one you need is decided by whoever is going to scan it — a shop wants an EAN-13 or a UPC-A, a shipping carton an ITF-14, and anything internal is usually Code 128.
2. **Say what goes in it.** A link is the common case, and the boxes above it build the other formats phones know: a Wi-Fi network that offers to join itself, a contact card that offers to be saved, an email, a text message, a phone number, a place on a map. Whichever you pick, the finished string is shown on the page — that is all a QR code ever holds.
3. **Choose how much damage it may take.** The four levels put more or less error correction in, and more correction means a bigger, denser code. L is enough for a screen, M for ordinary paper, and H for something that will be handled, printed small, or stuck on a window in the sun. A code on a menu that gets wiped down every day is worth Q or H.
4. **Set the size, the margin and the colours.** The margin is part of the code: four modules of quiet space around it is what the specification asks for, and trimming it is the single most common reason a printed code will not scan. Dark on light, with real contrast — a scanner reads the difference between the two, so pale grey on white will not do, and light on dark fails outright on a good many readers.
5. **Check it with the phone you have.** Before you print a thousand of them, scan the one on your screen. That takes ten seconds and catches the whole category of mistakes a preview cannot: a Wi-Fi password with a character that needed escaping, a link that was missing its `https://`, a barcode number a digit short.
6. **Take the SVG.** It is the code as instructions rather than as pixels, so it prints at any size without going soft, and a soft edge is exactly what a scanner cannot resolve. Take the PNG as well if whatever you are pasting into will not accept an SVG; it is drawn at a whole number of pixels per module, so it has no blurred edges either.

## The longer version

[How to make a QR code that still scans on somebody else's phone](https://abox.tools/guides/make-a-qr-code/): Which error-correction level to pick, why the white margin around a QR code is part of the code, how big to print it, and what a free generator's 'dynamic' code costs you later.

## Also in the box

- [QR & Barcode Reader](https://abox.tools/qr-barcode-reader/): Point it at a code, or drop a picture of one. It is read here, and nowhere else.
- [Hash & Checksum](https://abox.tools/hash-checksum/): Check a download against the number the publisher printed, without sending it to anyone.
- [Password & Passphrase Generator](https://abox.tools/password-generator/): Made here, by your own browser, and never sent anywhere. Nothing is stored and there is no history.
- [JSON Formatter](https://abox.tools/json-formatter/): JSON, XML, HTML, CSS and YAML, formatted or converted. Nothing is pasted into anyone else's server.

## Questions

### Is anything I type sent anywhere?

No. A QR code is arithmetic over a string, and that arithmetic runs in your own browser on your own machine. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That is worth more here than on most pages, because the thing people most often put in a QR code is the password to their Wi-Fi.

### Do these codes expire, or stop working later?

No, and they cannot. What you type is what the code holds, so scanning it gives back exactly that string forever. The codes that expire are the ones with somebody else's address inside them: a "dynamic" QR code holds a link to the generator's server, which redirects to yours, which means they can count every scan, change where it goes, or switch it off when a trial ends. Nothing here redirects through anything.

### Is it free, and can I use it commercially?

It is free, there is no account, no watermark and no limit on how many you make, and you can put the result on a product, a poster or a shopfront. QR Code is a registered trademark of Denso Wave, who have stated they will not exercise it against people using the codes — the specification is published as ISO/IEC 18004 and is free to implement, which is what this page does. The site carries advertising, which is what pays for it.

### Which error correction level should I pick?

M unless you have a reason. L makes the smallest code and is fine on a screen; M survives ordinary handling; Q and H are for a code that will be printed small, laminated, stuck on a window, or partly covered by a logo. Each step up puts more check data in, which needs a bigger symbol at the same amount of text — going from L to H roughly doubles the number of modules for the same string.

### How much can a QR code hold?

At the largest size, 177 modules square, up to 7,089 digits, 4,296 capital letters and digits, or 2,953 bytes of anything else — and that is at the weakest error correction; at the strongest it is about a third of those. Practically, the limit is not the format but the scanner: past a few hundred characters the modules get so small that an ordinary phone camera cannot resolve them at arm's length. A long code is usually a sign that a short link belongs in it instead.

### Why is my code bigger when I write the link in lower case?

Because a QR code has a mode for capitals and digits that packs two characters into eleven bits, and no such mode for lower case, which costs eight bits each. A URL written `HTTPS://EXAMPLE.COM/PAGE` can be a third smaller than the same URL in lower case. The scheme and the host are case-insensitive, so shouting them changes nothing except the size; the path after the host is not, so leave that alone.

### Can it read a QR code as well as make one?

Not this page, but the one next door does: [the reader](https://abox.tools/qr-barcode-reader/) takes a photograph, a screenshot or your camera and gives back the string. It is a considerably larger job than drawing one — finding the symbol in a picture, correcting for the angle it was taken at and repairing the damage are three problems this page does not have — which is why it is a tool of its own rather than a button here. It runs on the same terms as everything else: nothing uploaded, and no camera frame kept.

### What is the margin for, and can I make it smaller?

The white space around a QR code is part of the code. A reader uses it to find where the symbol ends, and the specification asks for four modules on every side; a barcode wants about ten. You can set it to zero here and the picture will look tidier, and a good many scanners will then fail to see it at all — especially against a busy background. If space is the problem, make the code smaller rather than trimming its margin.

### Which barcode do I need?

Whichever the person scanning it asks for. EAN-13 is the retail barcode outside North America and UPC-A is the North American one — both need a number issued to you by GS1, because the number identifies your company, not just the product. EAN-8 is the short version for small packages. ITF-14 goes on the shipping carton. Code 128 and Code 39 hold text as well as digits and need no registration at all, which makes them the right answer for anything internal: assets, shelves, job sheets.

### What is a check digit, and why did the tool add one?

It is the last digit of a retail barcode, worked out from the ones before it, so that a scanner can tell a misread from a read. EAN-13 wants twelve digits and computes the thirteenth; UPC-A wants eleven and computes the twelfth. Type the short number and this page adds it. Type the full number and it checks the one you gave — and refuses, rather than silently correcting it, because a wrong digit quietly fixed is a label that scans as somebody else's product.

### Can I put a logo in the middle of a QR code?

Not here, but the reason it works elsewhere is worth knowing: the error correction is what makes it possible. At level H roughly 30% of the modules can be destroyed and the code still read, so a logo covering rather less than that in the centre — where no finder pattern sits — is repairable damage. Put the code through your image editor at level H, keep the logo under about a fifth of the area, and test it with a real phone rather than trusting it.

### Why is the SVG better than the PNG?

Because a code is edges, and a PNG has a fixed number of pixels to make them out of. Enlarge one and every edge softens; a soft edge is precisely what a scanner has trouble with, and a printer at 1200 dpi given a 512 pixel PNG is being asked to invent the difference. An SVG is the squares as instructions, so it prints sharp at a business card or a billboard. The PNG here is drawn at a whole number of pixels per module, which is the best a PNG can do.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your text away to have a code drawn would stop the moment you unplugged.

## How the privacy claim is verifiable

- **There is nowhere for what you type to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that a Wi-Fi password could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The code is built from the string by arithmetic and drawn as an SVG, in this page, on your machine.
- **The code does not point at us.** What you type is what the code holds. Several free generators hand back a code containing a link to their own site, which then redirects to yours — so every scan is counted by them, and the code stops working the day they stop paying for the domain or decide the free tier has expired. Nothing here shortens, redirects or tracks: the string shown on the page is the string in the picture.
- **The PNG is made from the SVG that is on screen.** The download is not a second rendering that might disagree with the preview. The same markup is handed to the browser and painted onto a canvas, which is also why it can be done without contacting anything: there is no font to fetch and no image to load inside it.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed anything you type. Every line that turns a string into a code is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/qr-encode.js` and `src/qr.js` for the QR code itself — the modes, the version, the blocks in one, and the patterns, the mask and the format bits in the other — `src/gf256.js` for the error correction, and `src/barcode.js` for the striped ones.
