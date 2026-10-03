# Base64 Encoder & Decoder — and URLs, HTML entities, hex and escapes

Base64, percent-encoding, HTML entities, hex and backslash escapes, both ways. Nothing is pasted into anyone else's server.

> Encode and decode Base64 in both alphabets, percent-encode URLs, escape HTML entities, and read hex and backslash escapes. It all runs in your browser - nothing is uploaded, so a token never leaves your machine.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/base64/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your text are **never uploaded**. There is no server.

Every encoding here is arithmetic over a string, done here, in this page. The codecs are hand-written and in `src/encode.js` — and there is nothing else. This tool has no network feature of any kind — nothing to fetch, nothing to send — which matters more here than almost anywhere: the thing people paste into an online Base64 decoder is a token, and pasting a token into somebody's website is handing it over.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to encode or decode Base64 without uploading it

1. **Pick the encoding.** Base64 in both alphabets, percent-encoding for a single value or a whole URL, the five HTML entities, hex bytes, and the backslash escapes a string literal uses. The note under the menu says what each one is for.
2. **Pick the direction.** *Encode* takes plain text and produces the encoded form; *Decode* takes the encoded form back to plain text. The result updates as you type, so switching direction is one click and no retyping.
3. **Paste it in, or drop the file.** Anything you can select and copy works. A file dropped on the picker is read by your own browser and put in the box — there is no upload step to leave out.
4. **Read the error if there is one.** A decoder that fails here says what it found — a character Base64 does not use, padding in the wrong place, bytes that are not text — rather than returning something plausible and wrong.
5. **Take the result.** Copy it, or download it as a text file. The counts under the box say how many bytes went in and how many came out.

## Also in the box

- [Share Text & Files](https://abox.tools/share-text/): The share lives in this open tab. Readers fetch it directly from your browser, encrypted, and closing the tab ends it - nothing is stored on any server.
- [QR & Barcode Generator](https://abox.tools/qr-barcode/): Type it, and it becomes a code. Nothing is sent to make one.
- [QR & Barcode Reader](https://abox.tools/qr-barcode-reader/): Point it at a code, or drop a picture of one. It is read here, and nowhere else.
- [Hash & Checksum](https://abox.tools/hash-checksum/): Check a download against the number the publisher printed, without sending it to anyone.

## Questions

### Is my text uploaded anywhere?

No. Every encoder and decoder on this page is a function that runs in your own browser, on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That is the reason to use it for an access token or a session cookie: pasting one of those into somebody else's decoder is giving it to them.

### Is Base64 here the same Base64 as everywhere else?

Yes — it is checked against the test vectors in RFC 4648 rather than against itself. Both alphabets decode, so a JWT written with `-` and `_` reads as easily as one written with `+` and `/`, and input wrapped at 64 characters is unwrapped for you. Encoding is by UTF-8 bytes, so an accented letter or an emoji survives the round trip.

### Is Base64 encryption?

No, and treating it as encryption is the classic mistake. Base64 is a spelling: the same bytes written in an alphabet that survives being put in a URL, an email or a JSON string. Anyone can read it back — this page does it in a millisecond — so it hides nothing and protects nothing. If what you have is secret, it needs actual encryption before it is encoded, not instead of it.

### Why did decoding fail?

Because what was pasted is not quite what the codec was told it was, and the error says which way: a character outside the Base64 alphabet, padding in the wrong place, a percent sign with no two hex digits after it, or bytes that decode from Base64 but are not UTF-8 text — which usually means the original was a file rather than a string. The browser's own `atob` would have returned something plausible instead; being told is the whole point of pasting something into a decoder.

### What is the difference between the two web-address encodings?

One value, or the whole address. Encoding *one value* escapes everything a URL gives a meaning to — slashes, question marks, ampersands — which is what you want for a single query-string parameter. Encoding a *whole URL* leaves the address working: the slashes and the `?` stay, and only the characters a URL cannot carry at all are escaped. Using the first on a whole address breaks the address; using the second on a value loses where the value ends.

### How big a file can it handle?

There is no limit set here, because there is no server paying for one. The practical ceiling is your own machine: a few megabytes of text is fine, and the page waits for a pause in your typing before it re-encodes a very long document rather than fighting you for the keyboard.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no limit on how much you paste. The site carries advertising, which is what pays for it; the ads are not given anything about your text.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your text away to be decoded would stop the moment you unplugged.

## How the privacy claim is verifiable

- **What you paste has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that a pasted token could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. Every encoder and every decoder is a function in this page that takes a string and returns a string.
- **The decoder tells you when something is wrong.** The browser's own `atob` accepts input it should refuse and returns something plausible. The Base64 here is written out by hand and checked against the test vectors in RFC 4648, and when what you pasted is not Base64 it says so, and says why. The tests in `tests/js/text-encode.test.js` check exactly that.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed a character of your text. Every line that reads, encodes or decodes it is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy and `src/encode.js` for the Base64 that is checked against the RFC 4648 test vectors rather than against itself, and that refuses bad input instead of returning something plausible the way `atob` does.
