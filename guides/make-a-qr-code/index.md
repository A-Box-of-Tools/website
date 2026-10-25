# How to make a QR code that still scans on somebody else's phone

Making a QR code takes a second. Making one that works on a wet menu, a bus shelter, or a phone held at arm's length in bad light takes four decisions, and all four are made before you print anything. Here is what each one does.

[Open the QR & Barcode Generator](https://abox.tools/qr-barcode/): Type it, and it becomes a code. Nothing is sent to make one.

Last updated 13 October 2026

## The short answer

Open the [QR & Barcode Generator](https://abox.tools/qr-barcode/), paste your link, leave the level at **M** and the margin at **4**, and download the SVG. Start with a short-link code around two or three centimetres across for a hand-held card, dark on light, then test the final print at its intended distance. Its density, surface and the phone matter more than a universal minimum size.

That covers nearly every case. The rest of this page is what to do when it is not one of them: a code that has to survive being handled, a code with a logo on it, a code going on something small, and the one decision that is easy to get wrong in a way you only find out about a year later.

## Guest access, contact cards and equipment labels

For a guest network, choose *Wi-Fi network*, enter its exact name, security type and password, then inspect the encoded string. Leave M and a margin of four modules for an ordinary indoor card, export the SVG, and test that the printed card joins the intended network. Anyone who can read the code can recover its password; changing that password means making a new code. For a business card, choose *Contact card* and test that a phone saves the intended name, email and phone number.

A useful label on a printer or shared appliance points to its manual or setup instructions. Choose *Text or a link*, use a short, stable HTTPS address you control, and print the equipment name beside it. Q or H is worth trying where labels get dirty. Keep the four-module border and [test the final mounted label](https://abox.tools/guides/make-a-qr-code-and-prove-it-scans/), including opening the instructions on a phone. The web page still needs a connection to load.

## What is actually in a QR code

A string. That is the whole of it. Scanning a QR code hands the phone a piece of text, and everything else — opening a page, joining a network, offering to save a contact — is the phone recognising the shape of that text and offering to act on it.

So there is no such thing as a "Wi-Fi QR code" as a kind of code. There is a QR code holding `WIFI:T:WPA;S:My Network;P:the password;;`, which a compatible phone recognises as network details. Test the phones that will use it. The generator shows you the finished string for exactly this reason: when a code does not do what you expected, the string is the only thing worth looking at.

It also means a QR code cannot be changed after it is printed, does not itself make a network request, and its encoded text does not expire. A linked page can move or disappear, and a network password can change; the printed code will still hold the old string.

![A finished QR code with its facts underneath: the symbology, the version, the error-correction level, and the number of characters it holds.](https://abox.tools/screens/make-a-qr-code/result.webp)

What is in the code, said in the terms the rest of this guide uses. The version grows with the content, which is why the two settings below matter.

## Decision one: the error-correction level

A QR code carries a set of check codewords alongside the data, computed so that a reader can rebuild what it could not see. That is why a code with a corner torn off still scans. How many of those codewords there are is the level, and there are four:

- **L** — about 7% of total codewords.
- **M** — about 15%.
- **Q** — about 25%.
- **H** — about 30%.

[DENSO defines these percentages against total codewords](https://www.qrcode.com/en/about/error_correction.html), not arbitrary modules or image area. Damage to detection patterns can stop a scan before data correction even begins. More correction also costs space: the same payload generally needs a denser or larger symbol.

**L** is for a screen: a code in a slide, an email, a web page. Nothing is going to damage it and every extra module makes it harder to read at a distance.

**M** is the default and the right answer for most printing. Paper that will be handled a bit, a flyer, a business card.

**Q and H** are for codes that will be abused: a menu wiped down daily, a sticker on a machine in a workshop, a label on a crate, a code in a window that gets direct sun. H is also what makes a logo in the middle possible — see below.

![The QR options: an error-correction level menu set to medium, and a quiet-zone setting of four modules.](https://abox.tools/screens/make-a-qr-code/options.webp)

Both of these are about the code surviving the real world - a fold, a logo, a bad print - and both are set before it is drawn.

## Decision two: the margin, which is part of the code

The white space around a QR code is not padding, and it is not a design choice. A reader uses it to find where the symbol ends. The specification asks for four modules of quiet space on every side, and a code trimmed to its edge is the single most common reason a printed code fails.

This is worth being blunt about because trimming is such a natural thing to do. The code looks like it has too much white around it, so it gets cropped in the layout, or dropped onto a coloured panel that runs right up to the squares, or placed on a photograph. Each of those removes the boundary the reader was going to use.

If the code looks too big with its margin, make the code smaller. Do not take the margin off.

## Decision three: how big to print it

Size depends on how many modules the payload needs, how sharply they print, and the distance and camera used to read them. A short URL can make a simpler symbol than a long tracking address. Around two or three centimetres across is a starting proof for a hand-held card, not a guarantee or a minimum in the QR specification. A poster read from across a room needs a larger proof tested from that distance.

[DENSO's sizing example](https://www.qrcode.com/en/howto/code.html/index.html) calculates symbol size from the version and printed module size, then adds four clear modules on every side. Keep that border in the final layout. If a dense code struggles, shorten the payload or give it more space rather than cropping the border.

Print from the **SVG**: its edges scale with the layout. When the layout only accepts PNG, use enough pixels for the final size and avoid enlarging a small export. Then scan the actual printed proof; neither format can guarantee a particular printer or phone will read it.

## Colour, contrast, and the two mistakes

A reader measures the difference between the dark modules and the light ones, so contrast is the whole of it. Two things go wrong regularly:

**Light code on a dark background.** It looks striking, and a good many readers refuse it outright: they are looking for dark-on-light and do not try the inversion. Some do. You will not know which ones your customers have.

**Not enough difference.** Mid-grey on white, or two brand colours of similar weight, can measure fine on screen and fail on paper once ink spread and a phone's automatic exposure are involved. If you are colouring a code, keep the dark part genuinely dark.

Matt beats gloss for anything that will be scanned under a light, and both beat printing onto a photograph. Transparent backgrounds are useful for putting a code onto a coloured panel — but check what actually ends up behind it, because a transparent code on a dark panel is the first mistake above with extra steps.

## A logo in the middle

A small logo can work, but the generator does not place one for you. If you add it in a layout editor, use H and keep the finder and alignment patterns clear. There is no guaranteed safe fraction of image area: [DENSO defines restoration against total codewords](https://www.qrcode.com/en/about/error_correction.html), not arbitrary squares. Placement, density and print quality all matter. Test the final printed design on several phones, and reduce or remove the logo if it makes scanning unreliable.

## The decision people regret: static or "dynamic"

Search for a QR generator and most of the results want you to make an account, because they are selling *dynamic* codes. A dynamic code does not contain your link. It contains a short link to the generator's own server, which redirects to yours.

What that buys you is real: you can change where the code points after it is printed, and you get a count of every scan. For a campaign with a six-figure print run, that is worth paying for.

What it costs is also real, and is worth knowing before rather than after:

- **The code stops working when they stop working.** If the service closes, the domain lapses, or the free tier expires, every code you printed goes dead — and by then they are on ten thousand menus.
- **Every scan is somebody else's data.** The redirect sees the IP address, the time, and the device of every person who scans your code.
- **The link is theirs, not yours.** Anyone scanning it sees an unfamiliar domain flash past, which is exactly what people are being told to be suspicious of.

The middle way costs nothing: put a static QR code around a short URL *on your own domain*, and redirect that yourself. You keep the ability to change the destination, you keep the analytics, and nothing about the code depends on a company you have never met still existing next year.

The [generator here](https://abox.tools/qr-barcode/) only makes static codes, and it has no account to make. What you type is what the code holds.

## Before you print a thousand of them

Scan the code. Not the one on your screen — the printed proof, in the place it is going, with a phone that is not the one you made it on. That takes a minute and catches the entire category of problems this page is about: a margin the layout ate, a link missing its `https://`, a colour that measured differently on paper, a code printed at a size that works on a desk and not on a wall.

And check what happens after the scan. A code that opens a page which is unreadable on a phone is a code that failed, even though it scanned.

## None of this requires uploading anything

A QR code is arithmetic over a string. There is no file to send and nothing a server can do that a browser cannot, which is why the [tool here](https://abox.tools/qr-barcode/) does all of it on your own machine and works with the network unplugged.

That matters more than it sounds, because of what people put in QR codes. The most common use for the Wi-Fi format is a network's actual password, typed into a web page. It is worth knowing whether that page had anywhere to send it.
