# How to watermark a PDF, and what the stamp is actually for

A scan stamped with who it is for cannot quietly be used somewhere else. That is the whole job, it is worth doing, and it is not the same thing as locking the document. Here is what to write, how to put it on, and where the line is.

[打开PDF 水印](https://abox.tools/zh/watermark-pdf/): 一份写着自己去了哪里的扫描件，就没法悄悄再去别的地方。

最后更新 12 September 2026

## The short answer

Open the [PDF Watermark](https://abox.tools/zh/watermark-pdf/), drop the document in, type who the copy is for and when — “For Acme Lettings only · 12 September 2026” — and press the button. The words go across every page at the angle, size and opacity you choose, the result is opened again in the page to check every page carries them, and nothing is uploaded. Unplug from the internet and it works the same.

The rest of this is about what you have just done and what you have not, because the two are easy to confuse and the difference matters more than the stamp.

## What a watermark does

It makes a copy say where it went. A passport scan that carries “for Acme Lettings only” across it and turns up at a different agency, or in a loan application you never made, carries the name of the place it leaked from. That is why lenders, letting agents, lawyers and employers ask for scans to be stamped, and it is why it is worth a minute of your time before you send one: a document that can be traced is a document that is less useful to steal.

That is the whole of it. It is a real thing and it is not a small one, and the point of this page is to say exactly how big it is.

## What a watermark does not do

It does not stop anybody copying the document, reading it, or sending it on, and anybody with a PDF editor can take the stamp off again in a minute. A watermark is a label, not a lock. Any page that tells you otherwise is selling something.

If the document must not be read by the wrong person at all, that is a different job: put a password on it with the [PDF Protector](https://abox.tools/zh/protect-pdf/), which encrypts the file so that nobody without the password reads a word. The two go together naturally — stamp it, then lock it — and the watermark tool offers the protector as the next step under its result. [How to password-protect a PDF](https://abox.tools/zh/guides/protect-a-pdf/) explains what that lock is worth.

## What to write on it

Three things, and the shorter the better, because the stamp has to stay readable over the page:

- **Who it is for.** The name of the organisation, or the person. “For Acme Lettings only”, “Provided to Northbank Mortgages”.
- **What for**, if it is not obvious. “Tenancy reference only”, “Identity check — not for onward use”.
- **The date.** A copy with a date on it is a copy that can be told apart from every other copy you ever sent.

Any language works. The words are drawn by your own browser, with the fonts on your own machine, so the stamp can say whatever you can type — Chinese, Arabic, Hindi, an address with accents in it.

## How it sits on the page

Diagonal, once, across the middle of each page is the shape that does the job on a scan of a document: it crosses the important part, it cannot be cropped away without losing the content, and it is legible at a glance. Repeating the stamp across the page is for the case where a small crop — one signature, one account number — would otherwise escape unmarked.

Faint enough to read through, dark enough to survive a photocopy: about a third opaque is where the tool starts, and grey is the colour that argues least with whatever is on the page. Red is for when the stamp is the point.

The preview on the page is a blank sheet the size and shape of your first page with the stamp laid on it exactly where the file will put it. Your own page is not drawn in it, because the site has no PDF renderer — on purpose, and [the About page](https://abox.tools/zh/about/) says why. Open the result in any reader to see the two together.

## Why the upload is the strange part

Think about what you are stamping. The reason to mark a scan with who it is for is that it is about to leave your hands and you are worried about where it might go. Every online tool that offers to stamp it asks you to hand it over first, to a server whose retention you cannot see — which is precisely the thing the stamp is meant to guard against, done once more, before the guard is on.

None of it needs to happen. Putting words across a page is a small arithmetic on the file — one picture added, and each page told to draw it — and a browser does it perfectly well. That is what [the tool here](https://abox.tools/zh/watermark-pdf/) does: the document and the words stay in the tab, the page's own policy names every address it may contact and none of them is this site's, and it keeps working with the network unplugged. If you would rather prove that than take our word for it, that is the test: disconnect, and use it anyway.

There is a more general version of this argument in [is it safe to upload files](https://abox.tools/zh/guides/is-it-safe-to-upload-files/), and the sharper one for the document people most often need to stamp in [is it safe to upload a photo of your ID](https://abox.tools/zh/guides/is-it-safe-to-upload-a-photo-of-your-id/).

## Two things that will happen to the file, and one that will not

**A signature will stop being valid.** If the document was digitally signed, stamping it breaks the signature, because a signature covers the exact bytes of the file it was applied to and stamping writes a new file. Any program would have the same effect. Keep your original.

**The file grows a little.** The stamp is one picture, shared by every page, which for a few words is a few tens of kilobytes.

**The pages themselves do not change.** The stamp is drawn over the page, not into it: nothing is re-rendered, re-encoded or reflowed, a scan stays at the resolution it was scanned at, text stays selectable and searchable underneath, and nothing moves.

## Before and after

A stamp goes on last, after the other jobs, because it should cover the finished document: [take out anything that should not be in it at all](https://abox.tools/zh/redact-pdf/), [put the pages in order](https://abox.tools/zh/merge-pdf/), then stamp it. And after the stamp, if the document must not be read by the wrong person, [lock it](https://abox.tools/zh/protect-pdf/). A locked document cannot be stamped without unlocking it first, which is why the order is this way round.
