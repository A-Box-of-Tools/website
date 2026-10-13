# Is it safe to paste text into an online tool?

Pasting does not feel like uploading, and that is the trap: the same bytes leave your machine either way if the page sends them. This is about what a pasted config or log actually carries, and how to tell whether the tool in front of you has anywhere to send it.

Last updated 26 August 2026

## The short answer

Pasting text into a web page can be exactly as consequential as uploading a file to it. The reason it does not feel that way is that the gesture is borrowed from somewhere safe: between two of your own windows, paste moves text from one place you control to another place you control. On a web page, the second place is a text box that a script can read — and what happens next depends entirely on the page, not on the gesture.

Plenty of paste-shaped tools do their work on a server: the page sends your text away, the server formats or validates or diffs it, and the result comes back. Nothing about the screen tells you which kind you are using. The text box looks the same either way; so does the “Format” button. The difference is one network request, invisible unless you look for it.

## What a paste actually carries

The pastes that end up in online tools are rarely prose. They are the working text of somebody's job, and the genre matters, because some of the most sensitive strings in computing are precisely the ones that get pasted into formatters at midnight:

- **Configuration files** exist to hold the things a program must not hard-code, and those things are database passwords, API keys and signing secrets. A config pasted whole into a validator carries every one of them.
- **Logs and stack traces** carry session tokens in URLs, email addresses, internal hostnames, and occasionally a request body with somebody's personal data in it.
- **API responses** are snapshots of production data — real customers, real balances — pasted somewhere convenient to be read.
- **Anything base64-shaped** that gets pasted into a decoder was usually encoded because it mattered: a token being debugged, a certificate, an auth header.

A key that transits somebody else's server has to be treated as exposed the moment you notice — revoked and reissued, which on a production system is an afternoon nobody planned. The point is not that formatter sites are harvesting credentials. It is that you cannot know what a server logs, and a secret whose exposure you cannot rule out is a secret you have to rotate.

## Why the tool does not need your text to leave

Here is the technical fact that settles the question: formatting, validating, converting and comparing text are among the easiest jobs in computing. Parsing JSON, indenting XML, diffing two files, encoding base64 — a browser does these in milliseconds, locally, and has been able to for years. A server adds nothing to the job. When a paste-shaped tool uploads your text, that is an architectural leftover or a convenience for the operator, never a necessity of the work.

That is what this site's text tools are the counterexample to. The [JSON Formatter](https://abox.tools/format-json/) parses, formats and converts JSON, XML, HTML, CSS and YAML; the [Text Diff](https://abox.tools/compare-text/) marks every difference between two texts line by line and word by word; the [Base64 Encoder & Decoder](https://abox.tools/encode-text/) goes both ways between text and its encodings. All three run on your machine, and what you paste has nowhere to go — the pages carry no code path that could send it.

Two of them have companion guides already: [formatting JSON without uploading it](https://abox.tools/guides/format-json-without-uploading-it/) and [comparing two JSON files](https://abox.tools/guides/compare-two-json-files/).

## How to tell which kind you are using

The checks are the same as for a file tool, and they are written up in full in [the guide on uploading](https://abox.tools/guides/is-it-safe-to-upload-files/). The paste-shaped short version:

- **Pull the plug.** Load the page, disconnect, paste, press the button. A local tool carries on; a server tool stops. Thirty seconds, no expertise, no way to fake it.
- **Watch the Network tab while you press Format.** A request that leaves at that moment, roughly the size of your paste, is your paste leaving. No request, no upload.
- **Beware the helpful extras.** A “share this snippet” button, a history of your recent pastes across devices, a link you can send a colleague — each of those is only possible if the text was stored on a server. Features are claims: a page that can show your paste to somebody else has kept it.

And one habit beats all three checks: paste less. A validator does not need the real password to validate the shape of a config — `"REDACTED"` parses identically. For the paste that is itself the secret, the rule collapses to something even simpler: the only page that should ever receive a password is the login page it belongs to.
