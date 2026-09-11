# JSON Formatter — lay it out, minify it, or convert it

JSON, XML, HTML, CSS and YAML, formatted or converted. Nothing is pasted into anyone else's server.

> Format and minify JSON, XML, HTML, CSS and YAML, and convert JSON to YAML or XML and back. The parsers run in your browser - nothing is uploaded, so a token or a config file never leaves your machine.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/json-formatter/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your text and code are **never uploaded**. There is no server.

Formatting and converting are arithmetic over a string, done here, in this page. The parsers are hand-written and in `src/` — `shared/parse-json.js`, `shared/parse-xml.js`, `css.js`, `shared/parse-yaml.js` — and there is nothing else. This tool has no network feature of any kind — nothing to fetch, nothing to send — which matters more here than almost anywhere on this site: the things people paste into a formatter are access tokens, session cookies, customer records and unreleased code.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to format or convert JSON without uploading it

1. **Pick the job.** Two tabs, one box: *Format* lays out or squeezes JSON, XML, HTML, CSS and YAML; *Convert* turns JSON into YAML or XML and back. The text you just formatted is the text you convert, without pasting it twice.
2. **Paste it in, or drop the file.** Anything you can select and copy works. A file dropped on the picker is read by your own browser and put in the box — there is no upload step to leave out.
3. **Let it work out the language, or tell it.** The menu says what it read the text as, and correcting it is one click. A guess is only a starting point, which is why it is shown rather than applied silently.
4. **Choose the indentation, or squeeze it flat.** Two spaces, four, or a tab. Squeezing it flat is the same document with every space that was only there for reading taken out, and the result says how many bytes that saved.
5. **Read the error where the error is.** A parser that fails here says what it found and on which line and column, rather than "unexpected token at position 4193". That is usually enough to fix a config file without opening anything else.
6. **Take the result.** Copy it, or download it as a file, named for the language it came out in.

## The longer version

[How to format JSON without handing it to anybody](https://abox.tools/guides/format-json-without-uploading-it/): How to lay out, check and minify JSON in your own browser - what a formatter must never change about your file, how to read the error message, and why the site you paste it into matters.

## Also in the box

- [YAML to JSON Converter](https://abox.tools/yaml-to-json/): Both directions, and it says what each one costs. Nothing is pasted into anyone else's server.
- [XML Formatter](https://abox.tools/xml-formatter/): XML laid out to read or squeezed to ship, and converted to JSON both ways. Nothing is pasted into anyone else's server.
- [Text Diff](https://abox.tools/text-diff/): Two texts in, every difference marked, line by line and word by word. Nothing is pasted into anyone else's server.
- [Base64 Encoder & Decoder](https://abox.tools/base64/): Base64, percent-encoding, HTML entities, hex and backslash escapes, both ways. Nothing is pasted into anyone else's server.

## Questions

### Is my text uploaded anywhere?

No. Every parser and printer on this page is a function that runs in your own browser, on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That is the reason to use it for an access token, a session cookie or a customer record: pasting one of those into somebody else's formatter is giving it to them.

### Does formatting JSON change anything but the layout?

No, and that is harder than it sounds. Keys keep the order you wrote them in — a formatter built on `JSON.parse` silently moves integer-like keys to the front, so `{"10":a,"2":b}` comes back as `{"2":b,"10":a}`. Numbers keep the digits you typed, so a twenty-digit id does not lose its last three to a double and `1e999` does not become `null`. Duplicate keys are both kept, because the standard does not say which one wins and dropping one would be choosing for you.

### Which languages can it format?

JSON, XML, HTML, CSS and YAML. JSON, XML, HTML and CSS can also be squeezed flat; YAML cannot, because its short form is flow style, which is unreadable, and unreadable is the opposite of the reason to keep a file in YAML. JavaScript is deliberately not on the list — see the question about it below.

### Why does it not format JavaScript, Python or SQL?

Because laying out a programming language means parsing it properly, and a formatter that gets it nearly right is worse than none at all: it produces code that looks fine and does something else. JSON, XML, CSS and YAML have small enough grammars to be read by hand and checked with tests you can run. A JavaScript formatter is Prettier, which is a megabyte of parser, and it belongs in your editor rather than on a web page.

### My YAML says no and the JSON came out as a string. Why?

Because it is a string, and this reads YAML 1.2 rather than 1.1. In YAML 1.1, `yes`, `no`, `on` and `off` were booleans, which is the famous bug that turns the country code for Norway into `false`. YAML 1.2 dropped that and so does this: only `true`, `false`, `null` and `~` are read as anything but text. Going the other way, those words are written back *quoted*, even though this would read them as text without the quotes — because whatever opens the file next may not. PyYAML still defaults to 1.1. Reading strictly and writing conservatively is the only combination that is right either way.

### What does converting YAML to JSON lose?

Comments, because JSON has nowhere to put one. Anchors, aliases and tags are refused outright rather than guessed at — each of them says something JSON cannot say, and a converter that quietly picked an interpretation would hand you a document that is not what the file said. The other direction loses nothing: every JSON document is already a YAML document.

### What does converting JSON to XML lose?

The difference between an empty object, an empty array and an empty string, all of which become an empty element, and the type of every value, because XML has no types — which is why the reverse conversion leaves everything a string rather than deciding that `8080` was a number. An array becomes a repeated element, which is the only shape that reads back, and a key that an element name cannot hold has its awkward characters replaced rather than being emitted as a document no parser will read.

### Does reindenting HTML change how the page looks?

It can, and this is honest about it. Whitespace between two inline elements is a space between two words, so moving it is not free. Two things keep that in check: `<pre>` and `<textarea>` are copied through exactly as they were, and an element holding nothing but text stays on one line. Everything else is laid out.

### How big a file can it handle?

There is no limit set here, because there is no server paying for one. The practical ceiling is your own machine: a few megabytes of JSON is fine, and the page waits for a pause in your typing before it re-formats a very long document rather than fighting you for the keyboard.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no limit on how much you paste. The site carries advertising, which is what pays for it; the ads are not given anything about your text.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your text away to be formatted would stop the moment you unplugged.

## How the privacy claim is verifiable

- **What you paste has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that a pasted token could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. Every parser and every printer is a function in this page that takes a string and returns a string.
- **The formatters keep what they were given.** A JSON object comes back with its keys in the order you wrote them and its numbers spelled the way you spelled them, because `src/shared/parse-json.js` is a parser rather than a call to `JSON.parse`, which reorders integer-like keys and turns a twenty-digit id into the nearest double. The tests in `tests/js/text-format.test.js` check exactly that.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed a character of your text. Every line that reads, parses or writes it is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/parse-json.js` for the parser that keeps your keys in the order you wrote them, and `src/convert.js` for why a conversion is one parser and one printer with nothing in between that knows about both formats at once.
