# Text Diff — compare two texts, side by side

Two texts in, every difference marked, line by line and word by word. Nothing is pasted into anyone else's server.

> Compare two texts and see every difference, line by line and word by word, side by side or in one column. The comparison runs in your browser - nothing is uploaded, so unreleased code never leaves your machine.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/text-diff/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your texts are **never uploaded**. There is no server.

A comparison is arithmetic over two strings, done here, in this page. The algorithm is Myers' — the one `git diff` uses — and it is hand-written in `src/diff.js`, where you can read it. This tool has no network feature of any kind — nothing to fetch, nothing to send — which matters here because the things people compare are contracts, config files and unreleased code, in pairs.

- ✗ No upload
- ✗ No account
- ✗ No size limit
- ✓ Works offline
- ✓ Open source

## How to compare two texts without uploading them

1. **Paste the two texts, or drop the two files.** The original on the left, the changed one on the right. Two files dropped on the picker at once land one either side, in the order you dropped them; swap sides if that was the wrong way round.
2. **Choose how to read it.** Side by side, or one column. A phone starts on one column, because side by side needs two columns of text and a phone has room for about one; the menu is right there either way.
3. **Ignore what does not matter.** Whitespace, upper and lower case, blank lines — each can be ignored so that a reformatted file does not read as a hundred changes. By default the unchanged middle is folded to a count, with three lines kept either side of every change.
4. **Read what changed.** Removed lines are marked on the left, added ones on the right, and inside a changed line the words that differ are highlighted — so a diff of two paragraphs shows the word that moved rather than two whole paragraphs.
5. **Take the patch.** The download is a `.patch` in the unified format, which is what a code review, `git apply` and every diff viewer expect. Copy puts the same thing on your clipboard.

## The longer version

[How to compare two JSON files](https://abox.tools/guides/compare-two-json-files/): Format both files the same way, sort the keys, then diff them. Why a raw JSON diff is mostly noise, how to canonicalise both sides in the browser, and what survives to the patch.

## Also in the box

- [Base64 Encoder & Decoder](https://abox.tools/base64/): Base64, percent-encoding, HTML entities, hex and backslash escapes, both ways. Nothing is pasted into anyone else's server.
- [Share Text & Files](https://abox.tools/share-text/): The share lives in this open tab. Readers fetch it directly from your browser, encrypted, and closing the tab ends it - nothing is stored on any server.
- [QR & Barcode Generator](https://abox.tools/qr-barcode/): Type it, and it becomes a code. Nothing is sent to make one.
- [QR & Barcode Reader](https://abox.tools/qr-barcode-reader/): Point it at a code, or drop a picture of one. It is read here, and nowhere else.

## Questions

### Are my texts uploaded anywhere?

No. The comparison is a function that runs in your own browser, on your own hardware. This tool has no network feature of any kind — it never fetches anything and never sends anything — and the page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That is the reason to use it for a contract, a config file or unreleased code: pasting those into somebody else's diff checker is giving them away, both versions at once.

### What does the comparison actually do?

It finds the shortest set of edits that turns the left-hand text into the right-hand one, using Myers' algorithm — the one `git diff` uses. Shortest is what makes a diff readable: a line inserted in the middle should show as one insertion rather than as every line after it having changed. Inside a changed line the words that differ are marked as well, so a diff of two paragraphs shows the word that moved rather than two whole paragraphs.

### Can it compare two files rather than two pastes?

Yes. Drop both onto the picker at once and they land one either side, in the order you dropped them. They are read by your browser into this page, which is the only place they go. Swap sides if you dropped them the wrong way round.

### What comes out of a comparison, and can I apply it?

The download is a unified diff — the `@@ -3,5 +3,5 @@` format that `git apply`, `patch` and every code review tool read. Copy does the same thing to your clipboard. What is on screen is a view of it: side by side, or one column, with the unchanged parts collapsed to a count unless you ask for all of them.

### Can it ignore whitespace, case or blank lines?

Yes, each separately. Ignoring whitespace makes a reformatted file compare as unchanged; ignoring case treats `Error` and `error` as the same word; ignoring blank lines skips the lines that hold nothing. The counts above the result then say the two are the same once the differences you asked to ignore are ignored — which is not the same claim as identical, and the page keeps the two claims apart.

### How big a comparison can it handle?

There is no limit set here, because there is no server paying for one. Two texts of twenty thousand lines with a handful of edits compare instantly, because the common beginning and end are trimmed before the real work starts. A comparison of two texts with nothing whatever in common stops early and says so, rather than spending a minute proving what was already obvious, and a very long comparison draws the first few thousand rows and leaves the rest to the downloaded patch.

### Is it free, and do I need an account?

It is free, and there is no account, no sign-in, no trial and no limit on how much you paste. The site carries advertising, which is what pays for it; the ads are not given anything about your texts.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your texts away to be compared would stop the moment you unplugged.

## How the privacy claim is verifiable

- **What you paste has nowhere to go.** The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site. There is no endpoint here that a pasted contract could be collected at, and nothing in the code that would send it if there were.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The comparison is a function in this page that takes two strings and returns what changed.
- **The algorithm is the standard one, readable in full.** Myers' shortest-edit-script algorithm, the one `git diff` uses, hand-written in `src/diff.js` with the decisions commented. The tests in `tests/js/text-diff.test.js` prove the deletions rebuild the left-hand text and the insertions rebuild the right-hand one, which is what correct means for a diff.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed a character of either text. Every line that reads or compares them is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy and `src/diff.js` for Myers' algorithm, the word-level pass inside each changed line, and the three guards that keep a pathological comparison from freezing the page.
