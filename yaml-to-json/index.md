# YAML to JSON — and JSON back to YAML

Both directions, and it says what each one costs. Nothing is pasted into anyone else's server.

> Convert YAML to JSON and JSON to YAML in your browser. Reads YAML 1.2, so yes and no stay strings, and says exactly what each direction loses. Nothing is uploaded - a config file never leaves your machine.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/yaml-to-json/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your YAML and JSON are **never uploaded**. There is no server.

Converting is arithmetic over a string, done here, in this page. The two parsers are hand-written and in `src/` — `shared/parse-yaml.js` and `shared/parse-json.js` — and there is nothing else. This tool has no network feature of any kind — nothing to fetch, nothing to send — which matters more here than almost anywhere on this site: a YAML file is usually a deployment config, and a deployment config is usually full of hostnames, bucket names and secrets.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to convert YAML to JSON without uploading it

1. **Pick the direction.** *YAML to JSON* or *JSON to YAML*. The note under the menu says what that direction loses before you paste anything, rather than after.
2. **Paste it in, or drop the file.** Anything you can select and copy works. A file dropped on the picker is read by your own browser and put in the box — there is no upload step to leave out — and a `.json` or `.yaml` extension sets the direction for you.
3. **Choose the indentation.** Two spaces, four, or a tab. The tab is offered for JSON only: YAML is defined in terms of spaces, and a tab is not legal indentation in it.
4. **Read the error where the error is.** A parser that fails here says what it found and on which line and column, rather than “unexpected token at position 4193”. That is usually enough to fix a config file without opening anything else.
5. **Take the result.** Copy it, or download it as a file, named for the format it came out in.

## Also in the box

- [XML Formatter](https://abox.tools/xml-formatter/): XML laid out to read or squeezed to ship, and converted to JSON both ways. Nothing is pasted into anyone else's server.
- [Text Diff](https://abox.tools/text-diff/): Two texts in, every difference marked, line by line and word by word. Nothing is pasted into anyone else's server.
- [Base64 Encoder & Decoder](https://abox.tools/base64/): Base64, percent-encoding, HTML entities, hex and backslash escapes, both ways. Nothing is pasted into anyone else's server.
- [Share Text & Files](https://abox.tools/share-text/): The share lives in this open tab. Readers fetch it directly from your browser, encrypted, and closing the tab ends it - nothing is stored on any server.

## Questions

### Is my YAML uploaded anywhere?

No. Both parsers and both printers on this page are functions that run in your own browser, on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That is the reason to use it for a deployment config: those are full of hostnames, bucket names and occasionally a secret somebody meant to move, and pasting one into somebody else's converter is giving it to them.

### What does converting YAML to JSON lose?

Comments, because JSON has nowhere to put one. Anchors, aliases and tags are refused outright rather than guessed at — each of them says something JSON cannot say, and a converter that quietly picked an interpretation would hand you a document that is not what the file said. The other direction loses nothing: every JSON document is already a YAML document.

### My YAML says no and the JSON came out as a string. Why?

Because it is a string, and this reads YAML 1.2 rather than 1.1. In YAML 1.1, `yes`, `no`, `on` and `off` were booleans, which is the famous bug that turns the country code for Norway into `false`. YAML 1.2 dropped that and so does this: only `true`, `false`, `null` and `~` are read as anything but text. Going the other way, those words are written back *quoted*, even though this would read them as text without the quotes — because whatever opens the file next may not. PyYAML still defaults to 1.1. Reading strictly and writing conservatively is the only combination that is right either way.

### Does it keep the order of my keys?

Yes, in both directions, and that is harder than it sounds. A converter built on `JSON.parse` silently moves integer-like keys to the front, so `{"10":a,"2":b}` comes back as `{"2":b,"10":a}`. Numbers keep the digits you typed, so a twenty-digit account id does not lose its last three to a double. If you *want* them sorted there is a checkbox, and it sorts by how the keys read rather than by their code points.

### Can it convert several YAML documents at once?

No, and it says so rather than picking one. A file with `---` separators holds more than one document, and JSON has no shape that means “several documents” — an array would be a claim the file never made. Convert them one at a time.

### Why is there no YAML formatter here?

Because YAML has no squeezed form worth writing — the short one is flow style, which is unreadable, and unreadable is the opposite of the reason to keep a file in YAML. Laying out JSON, XML, HTML and CSS is [the JSON formatter](https://abox.tools/json-formatter/)'s job, and it lays out YAML too.

### How big a file can it handle?

There is no limit set here, because there is no server paying for one. The practical ceiling is your own machine: a few megabytes of YAML is fine, and the page waits for a pause in your typing before it converts a very long document rather than fighting you for the keyboard.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no limit on how much you paste. The site carries advertising, which is what pays for it; the ads are not given anything about your text.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your config away to be converted would stop the moment you unplugged.

## How the privacy claim is verifiable

- **What you paste has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that a pasted config could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. Both parsers and both printers are functions in this page that take a string and return a string.
- **It reads YAML 1.2, so Norway is still Norway.** In YAML 1.1, `no` was a boolean, which is the famous bug that turns the country code for Norway into `false`. This reads 1.2, where it is the string it looks like. Going the other way those words are written back *quoted*, because whatever opens the file next may still be a 1.1 reader. `tests/js/text-convert.test.js` checks both halves.
- **A conversion that cannot be honest stops instead.** An anchor, an alias or a tag in the YAML ends the conversion with a message saying which line it is on, rather than a JSON document that quietly means something else. JSON has no way to say “the same node twice”, and picking an interpretation would be choosing for you.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed a character of your text. Every line that reads, parses or writes it is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/parse-yaml.js` for the reader that refuses an anchor rather than guessing what it meant, and `src/convert.js` for why a conversion is one parser and one printer with nothing in between that knows about both formats at once.
