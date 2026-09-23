# Is it safe to upload files to an AI?

The same question this site's first guide asked about converters, aimed at the place files actually go now. The honest answer is the same shape: usually nothing bad happens, and you cannot verify any of it — plus one difference that matters. A converter transforms your file without caring what is in it. An AI is sent the file precisely so that something will read it.

Last updated 27 August 2026

## The short answer

Attaching a file to an AI chat is an upload. So is pasting text into one. The window does not look like an upload form — there is no progress bar, no “your file is being transferred” — but the bytes cross the internet to a vendor's servers all the same, and everything the [first guide in this group](https://abox.tools/guides/is-it-safe-to-upload-files/) said about uploads applies from that moment: how long it is kept, who can reach it, what backups outlive the deletion timer — every answer is a promise you take on trust, checkable by nobody outside the company.

For most files, most of the time, nothing bad happens; reputable AI vendors publish retention policies and mostly follow them. The reason the question deserves its own page is that an AI is not a converter with a different name. Three differences change what a careful person does — and none of them means “never”. They mean: send less, and send it clean.

## Where the file actually goes

To the vendor's computers, where several things can lawfully happen to it under the terms you accepted. It is kept for some period — sometimes hours, sometimes years, often depending on plan and settings you may never have opened. It may be shown to human reviewers, most commonly when an automated system flags the conversation. Depending on the vendor, the plan and a setting whose default varies, it may be used to train future models. And it sits in your own conversation history, which means it is also behind your password, on every device that can open your account.

None of that is hidden; it is in the policies. The point this group of guides keeps making is narrower: **you cannot check any of it**. A tool that runs in your browser can prove its claims with the wi-fi switched off. A service whose entire value is a model running on someone else's hardware cannot, by its nature, offer you that proof. Trust may well be warranted. It is still trust.

## Three ways an AI is not a converter

### 1. The file is sent to be read

A converter re-encodes your file without caring what is in it; no part of the pipeline is interested in the contents. An AI is the opposite: reading the contents is the product. That is not sinister — it is what you asked for — but it changes what “sensitive” means. A photo's compromising detail survives a resize untouched and unexamined; a contract's compromising clause is precisely what the summary will be built from.

### 2. An agent can pass it on

A converter's server is a dead end: file in, file out. A modern AI assistant is increasingly an agent with tools of its own — web search, code execution, third-party services it can call. Content you hand it can be quoted into a search query, written into a sandbox, or sent to whatever tool the agent judges useful, each hop adding a party you never chose. Good agents are conservative about this; the point is that the audience for your file is no longer necessarily one company.

### 3. You paste the sensitive thing on purpose

Nobody uploads their employment contract to an image resizer. People paste it into a chatbot every day, because “explain this clause” is exactly the job an AI is good at. The files this question is really about — contracts, medical results, logs with keys in them, other people's data — are the ones an AI is most useful for, which is why “just don't” is not the advice this page gives. The advice is the next section.

## Send less, and send it clean

The four checks the first guide teaches mostly do not translate here — a chatbot fails the pull-the-plug test by design, and the Network tab merely confirms that everything goes. When “does it leave?” is answered before you start, the useful question becomes **what needs to go, and in what state**. In practice:

- **Send the passage, not the archive.** A question about one clause needs one clause, not the folder of contracts. The less that goes, the less there is to be retained, reviewed or forwarded — and the answer usually gets better, not worse.
- **Strip what the question does not need.** A photo straight off a phone carries GPS coordinates, timestamps and a camera serial number that no question about the picture requires. The [EXIF viewer and remover](https://abox.tools/exif-editor/) shows what is riding along and takes it out, in your browser, before anything is attached.
- **Redact by deletion, not by covering.** If a document goes to an AI with names, numbers or identifiers it does not need, remove them first with the [PDF redactor](https://abox.tools/redact-pdf/) or the [image redactor](https://abox.tools/redact-image/) — both delete what you mark rather than drawing over it, and the difference is [a guide of its own](https://abox.tools/guides/can-blacked-out-text-be-recovered/). A model reads the file more thoroughly than any human skim; a half-covered secret is not half-safe.
- **Keep credentials out entirely.** Logs and config files go into chats with API keys and tokens still inside, and a pasted secret should be treated as spent — the same rule the guide on [pasting into online tools](https://abox.tools/guides/is-it-safe-to-paste-into-an-online-tool/) arrives at. Rotate anything that slipped through.

## When sending is genuinely fine, and when nothing needs to go

Send the file when the contents are not sensitive and the help is real; when you are on terms you have actually read, with retention and training settings you have actually set; or when your organisation has an agreement that pins those answers down in writing. That is most everyday use, and this page is not an argument against it.

And notice how often the answer to “does anything need to go at all?” is no. The chores people hand to AI chats — compress this, convert this, strip this data, make this smaller than a form's limit — are jobs a browser can do on your own machine, and every tool on this site does them without the file leaving. An AI agent can even drive those tools for you, and when it runs locally the delegation costs nothing — that is [the previous guide](https://abox.tools/guides/can-an-ai-agent-use-these-tools/). The clean division of labour: this site's tools are where a file gets smaller, cleaner and stripped of what nobody else needs to see — on your machine — and what you choose to send afterwards goes out on purpose, in the state you decided.
