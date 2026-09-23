# XML Formatter — lay it out, squeeze it flat, or turn it into JSON

XML laid out to read or squeezed to ship, and converted to JSON both ways. Nothing is pasted into anyone else's server.

> Format, indent and minify XML, and convert XML to JSON or JSON to XML. The parser runs in your browser - nothing is uploaded, so a feed, an invoice or a config file never leaves your machine.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/xml-formatter/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your XML and JSON are **never uploaded**. There is no server.

Formatting and converting are arithmetic over a string, done here, in this page. The parser is hand-written and in `src/shared/parse-xml.js`, and there is nothing else. This tool has no network feature of any kind — nothing to fetch, nothing to send — which matters here more than the word “XML” suggests: what arrives in this format is usually an invoice, a bank statement, a health record or a SOAP payload with somebody's credentials in the header.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to format XML without uploading it

1. **Pick the job.** Two tabs, one box: *Format* lays XML out or squeezes it flat; *Convert* turns it into JSON, or JSON back into XML. The XML you just laid out is the XML you convert, without pasting it twice.
2. **Paste it in, or drop the file.** Anything you can select and copy works, and an `.xml`, `.svg`, `.rss` or `.xsd` file dropped on the picker is read by your own browser and put in the box — there is no upload step to leave out.
3. **Choose the indentation, or squeeze it flat.** Two spaces, four, or a tab. Squeezing it flat is the same document with every space that was only there for reading taken out, and the result says how many bytes that saved.
4. **Read the error where the error is.** A parser that fails here says *which tag* was never closed and on which line and column, rather than “error on line 1”, which is what a browser says about a document it read all at once.
5. **Take the result.** Copy it, or download it as a file, named for the format it came out in.

## Also in the box

- [Text Diff](https://abox.tools/text-diff/): Two texts in, every difference marked, line by line and word by word. Nothing is pasted into anyone else's server.
- [Base64 Encoder & Decoder](https://abox.tools/base64/): Base64, percent-encoding, HTML entities, hex and backslash escapes, both ways. Nothing is pasted into anyone else's server.
- [Share Text & Files](https://abox.tools/share-text/): The share lives in this open tab. Readers fetch it directly from your browser, encrypted, and closing the tab ends it - nothing is stored on any server.
- [QR & Barcode Generator](https://abox.tools/qr-barcode/): Type it, and it becomes a code. Nothing is sent to make one.

## Questions

### Is my XML uploaded anywhere?

No. The parser and the printer on this page are functions that run in your own browser, on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That matters more for XML than the format's reputation suggests: what arrives in it is usually an invoice, a bank statement, a health record, or a SOAP request with credentials in the header.

### Does it resolve external entities?

No, and there is nothing to switch off. External entity resolution is how an XML parser is talked into reading files off the machine running it — the attack usually written XXE — and `src/shared/parse-xml.js` is a hand-written reader with no entity resolution in it at all. Your text is never handed to the browser's own `DOMParser` either. A `DOCTYPE` is carried through without ever being acted on.

### What does converting XML to JSON lose?

The order of mixed content, comments, and the difference between an attribute and a child element — the last of which is softened rather than erased, because an attribute becomes a member whose name starts with `@`. An element's own text becomes `#text` when it has to sit beside something else, and repeated children become an array. Every value stays a string: XML has no types, and deciding that `8080` was a number would be inventing information.

### What does converting JSON to XML lose?

The difference between an empty object, an empty array and an empty string, all of which become an empty element, and the type of every value, because XML has no types. An array becomes a repeated element, which is the only shape that reads back, and a key that an element name cannot hold has its awkward characters replaced rather than being emitted as a document no parser will read.

### Can it format an SVG, an RSS feed or a POM file?

Yes. All three are XML, and this reads XML rather than any particular dialect of it. An SVG laid out this way is easier to hand-edit; an RSS or Atom feed is usually shipped squeezed flat and is unreadable until something opens it out. Nothing about the layout changes what the document means.

### Does reindenting XML change what it means?

For a document whose elements hold other elements, no. Where it can matter is text: whitespace inside an element that holds words is part of that text, so an element holding nothing but text is left on one line rather than being opened out. `CDATA` sections are copied through exactly as they were.

### Why not just use the browser's own XML parser?

Because of what it says when the document is broken. `DOMParser` hands back an error document whose wording is different in every browser and often amounts to “error on line 1”. A hand-written reader can say which tag was never closed, and where it was opened, which is the thing you actually needed to know. Not resolving external entities is the other reason.

### How big a file can it handle?

There is no limit set here, because there is no server paying for one. The practical ceiling is your own machine: a few megabytes of XML is fine, and the page waits for a pause in your typing before it re-formats a very long document rather than fighting you for the keyboard.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no limit on how much you paste. The site carries advertising, which is what pays for it; the ads are not given anything about your text.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your XML away to be formatted would stop the moment you unplugged.

## How the privacy claim is verifiable

- **What you paste has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that a pasted invoice could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The parser and the printer are functions in this page that take a string and return a string.
- **No external entities are resolved, ever.** A `DOCTYPE` with an external entity in it is how an XML parser is talked into reading a file off the machine that parsed it, and it is the oldest hole in the format. `src/shared/parse-xml.js` is a hand-written reader that has no entity resolution in it at all — not disabled, absent — and this page never hands your text to the browser's own `DOMParser`.
- **Every value out of XML is a string.** `<port>8080</port>` says nothing about whether that is a number, so the JSON says `"8080"`. Deciding for you would be inventing information that then travels on as though it had been in the file.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed a character of your text. Every line that reads, parses or writes it is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/parse-xml.js` for the parser that tells you which tag was never closed, and `src/convert.js` for why every value comes out of XML as a string rather than being guessed at.
