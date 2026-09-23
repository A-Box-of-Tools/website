# Hash & checksum — MD5, SHA-1, SHA-256, SHA-512

Check a download against the number the publisher printed, without sending it to anyone.

> Work out the MD5, SHA-1, SHA-256, SHA-384 or SHA-512 of any file and compare it with the checksum the download page published. The file is read in your browser and never uploaded, at any size.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/hash-checksum/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your files are **never uploaded**. There is no server.

A checksum is arithmetic over the bytes of your file, and it is done here, in this page, on your own processor. The file is read off your disk four megabytes at a time and each piece is thrown away as soon as it has been counted, so nothing is ever assembled anywhere — not in memory, and certainly not on a server. There is no server on the other end of this page to send a file to even if anything here wanted to.

- ✗ No upload
- ✗ No size limit
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to check a download against its checksum

1. **Choose the file.** Drop it onto the picker, or select it by hand. It is read straight off your disk in pieces; nothing is sent anywhere while you do it, and there is no size at which the page gives up.
2. **Let it read.** MD5 and SHA-256 are worked out by default, in a single pass. The bar shows how far through the file it is and how fast that is going — a large disk image takes about as long as copying it would, because it is the same amount of reading.
3. **Paste what it should be.** Whatever the download page gave you, in whatever shape: bare hex, a line of `sha256sum` output, a whole `SHA256SUMS` file, or the `integrity` attribute off a script tag. Which algorithm it is follows from how long it is, and the right box ticks itself.
4. **Read the answer, not the colour.** The page says in a sentence whether this is the file that checksum describes. A match means the bytes are identical to the ones the publisher measured. A mismatch means they are not, and the download should be fetched again before it is opened.
5. **Take the checksums if you need them.** Copy one, copy all of them, or save them as a small text file in the tagged form the command-line tools write, so the algorithm travels with the number.

## The longer version

[How to check a download against its checksum](https://abox.tools/guides/verify-a-file-checksum/): How to check an MD5 or SHA-256 checksum on Windows, macOS and Linux or in your browser, what a match actually proves, and the mistake that makes the whole exercise pointless.

## Also in the box

- [Password & Passphrase Generator](https://abox.tools/password-generator/): Made here, by your own browser, and never sent anywhere. Nothing is stored and there is no history.
- [JSON Formatter](https://abox.tools/json-formatter/): JSON, XML, HTML, CSS and YAML, formatted or converted. Nothing is pasted into anyone else's server.
- [YAML to JSON Converter](https://abox.tools/yaml-to-json/): Both directions, and it says what each one costs. Nothing is pasted into anyone else's server.
- [XML Formatter](https://abox.tools/xml-formatter/): XML laid out to read or squeezed to ship, and converted to JSON both ways. Nothing is pasted into anyone else's server.

## Questions

### Is my file uploaded anywhere?

No. It is read off your disk by your own browser and hashed on your own processor, four megabytes at a time. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. Unplug from the network and it still works.

### Is there a size limit?

No. The file is never held whole: it is read in pieces and each piece is counted and dropped, so a forty-gigabyte disk image uses the same few megabytes of memory as a text file. What it costs is time, and the page tells you how much as it goes. \
\
This is the reason the algorithms are written out here rather than handed to the browser's own `crypto.subtle.digest`, which would be faster. That call takes the whole message in one buffer and there is no way to feed it a file in pieces, so using it would have put the largest file you can check at the mercy of how much memory this tab happens to be allowed. On a phone that is a few hundred megabytes, and the file people most want to check is a disk image.

### The checksum matched. What has that actually proved?

That the bytes on your disk are the bytes somebody measured when they wrote that number down. Nothing more, and it is worth being precise about the limits. \
\
It proves the download was not truncated, corrupted by a bad disk, or swapped for something else in transit. It does **not** prove the file is safe, because a publisher can measure malware just as accurately as anything else. And it proves very little if the checksum came from the same page, over the same connection, as the file: anybody able to change one was able to change the other. A checksum is worth most when it reaches you by a different route — a signed `SHA256SUMS` file, a distribution's release announcement, a second mirror, or a package manager that already knows it.

### It did not match. What now?

Download it again first, from the same place. An interrupted or resumed transfer is far and away the most common cause, and a second copy usually settles it. \
\
If the second copy gives the same wrong answer, check you are comparing against the right line: release pages list several files, and the checksum for the ARM build will never match the x86 one. Then check the version number. If all of that is right and it still does not match, do not open the file. Fetch it from a different mirror and compare the two checksums with each other.

### Which one should I use?

Whichever the publisher printed. The point of the exercise is to compare against their number, and you cannot choose theirs for them. \
\
If you are producing a checksum rather than checking one, use SHA-256. MD5 and SHA-1 are both broken in the sense that matters: two different files with the same digest can be constructed deliberately, in hours on MD5 and at moderate expense on SHA-1. That does not make them useless against accidents — a truncated download will not collide with the original by chance — but it does mean neither can tell you that nobody meddled. SHA-384 and SHA-512 are fine and no better in practice; they are here because some projects publish them.

### Why is MD5 here at all if it is broken?

Because it is still what is printed. Mirrors, firmware downloads, university software pages and a great many vendor sites published an MD5 twenty years ago and have not revisited the page since, and a tool that refused to compute one would be refusing to answer the question its visitors actually arrived with. \
\
What it can do instead is say what the answer is worth, which is what the note beside the checkbox does. An MD5 that matches still rules out a corrupted download. It does not rule out a deliberate one.

### What formats can I paste into the comparison box?

All of the usual ones, and it works out which is which by itself. \
\
Bare hex, with or without spaces in it. A line of `md5sum` or `sha256sum` output, with the filename after it. A whole `SHA256SUMS` file with forty lines, in which case the line naming your file is the one used. The BSD form, `SHA256 (disk.iso) = …`. A label in front, as in `SHA-256: …`. And a subresource-integrity attribute, `sha384-…`, which is base64 rather than hex and is decoded before it is compared. \
\
Which algorithm it is comes from how long it is: 32 hex characters is an MD5, 40 a SHA-1, 64 a SHA-256, 96 a SHA-384 and 128 a SHA-512. No two are the same length, so there is nothing to choose and nothing to get wrong.

### Will it give the same answer as sha256sum or certutil?

Yes, byte for byte. These are exact specifications with published test vectors, and every algorithm here is checked against those vectors and against the operating system's own implementation on every build. \
\
The only difference you will see is presentation. Windows' `certutil -hashfile` prints in upper case and puts spaces in; this page prints lower case, which is what almost every publisher uses. The comparison ignores both, so a checksum copied out of certutil matches a lower-case one pasted here.

### Can I check two files against each other?

Yes, with one extra step: check the first, copy its checksum, then choose the second and paste that checksum into the box. If the two files are identical the page will say so. \
\
That is worth knowing for the case checksums are quietly best at — deciding whether the copy on the backup drive is really the same file as the one on the laptop, when both claim the same size and the same date.

### Does it change my file?

No. This tool only reads. There is no output file, no re-encode and nothing written back — the only thing you can download is a small text file listing the checksums. Your original is untouched on your disk, which is also the honest answer to what happens if you close the tab.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in and no trial. There is no limit on file size and no limit on how many files you check. The site carries advertising, which is what pays for it; the ads are not given anything about your file.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your file away to be hashed would stop the moment you unplugged.

## How the privacy claim is verifiable

- **Your file has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that your file could be collected at, and nothing in the code that would send it if there were. This used to read `connect-src 'none'`, which was absolute; adding advertising cost that, and saying so is part of the deal.
- **The file is never held whole, at any size.** It is read four megabytes at a time and each piece is counted into the running state and dropped. So the memory this page uses is the same for a forty-gigabyte disk image as for a text file, and there is no size at which it gives up. That is also why the browser's own `crypto.subtle.digest` is not used: it wants the whole file in memory at once, which is exactly the ceiling this tool exists not to have.
- **Five algorithms, five files in this repository.** `src/md5.js`, `src/sha1.js`, `src/sha256.js` and `src/sha512.js` are the published specifications written out, about sixty lines each, with the constant tables spelled out rather than computed so that nothing about the answer can depend on your browser. Every one of them is checked against the official test vectors and against the operating system's own implementation before it ships.
- **The checksum you paste in is not sent anywhere either.** It is compared here, in the page, against the digest computed here. Nothing about the comparison — not the value, not whether it matched, not the name of the file — is read out to anybody. That matters more than it might sound: a checksum plus a filename tells whoever collects it exactly which build of which piece of software you just downloaded.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your file: not the file, not its name, its size, or any of the digests. Every line that reads or hashes a byte is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your files. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and every part of this page still works. That is the simplest proof of all: a tool that sent your file away to be hashed would stop the moment you unplugged.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/md5.js`, `src/sha1.js`, `src/sha256.js` and `src/sha512.js` for the four compression functions, `src/blocks.js` for the padding they share, and `src/hash.js` for the loop that reads your file in pieces — none of which has a line that could reach the network.
