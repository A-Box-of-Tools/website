# Protect PDF — put a password on it, and restrictions if you want them

Lock a document you would rather not hand to a website in order to lock it.

> Put a password on a PDF, or restrict printing and copying, in your browser. AES-256 by default, nothing is uploaded, and the finished file is opened again here to prove the password holds before you are offered it.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/protect-pdf/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your documents are **never uploaded**. There is no server.

The document you choose is opened, encrypted and written back out in memory on this machine, by code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one. Neither the file nor the password you type leaves the tab.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to put a password on a PDF, or restrict it

1. **Choose the PDF.** One document at a time. It is read straight off your disk by the browser and opened here. A document that already needs a password is turned away with a link to the unlocker; one that only carries restrictions is accepted, and what you set below replaces them.
2. **Set the password to open it, and type it again.** This is the real lock. Whoever has this password reads the document; nobody else does, and nothing here or anywhere honest will recover it if it is forgotten. The two boxes have to agree before the button wakes. Leave both blank if all you want is restrictions on a document that still opens for everybody.
3. **Tick the restrictions, if you want any.** Printing, copying text and pictures out, and changing the document. These are requests that well-behaved readers honour, not encryption, and the page says so beside the boxes. An owner password lifts them; if you leave that box blank the open password does both jobs, and if you set no password at all a random one is used and thrown away, so the restrictions cannot be lifted by trying nothing.
4. **Protect it, and read the line that says it was checked.** The document is written back out enciphered under a fresh key. Then the finished file is opened again here twice — once with no password, where it has to be refused, and once with yours, where it has to open with the same number of pages — and if either check fails you get no download and a message saying so.

## The longer version

[How to password-protect a PDF, and what it is actually worth](https://abox.tools/guides/protect-a-pdf/): A password on a PDF is a real lock. A restriction on printing is a request. What each one does, which encryption to choose, why the upload is the strange part of every online tool, and what happens if you forget the password.

## Also in the box

- [PDF Watermark](https://abox.tools/watermark-pdf/): A scan that says where it went is a scan that cannot quietly go somewhere else.
- [PDF Redactor](https://abox.tools/redact-pdf/): The letters are deleted from the file, and the file is searched afterwards to prove it.
- [PDF to CSV](https://abox.tools/pdf-to-csv/): Finds every table in a PDF and turns it into rows a spreadsheet can open.
- [Images to PDF](https://abox.tools/images-to-pdf/): Put your pictures into one document.

## Questions

### Is a password-protected PDF actually secure?

With the default here, yes, exactly as secure as the password: AES-256 under the PDF 2.0 password hash is the current scheme and there is no shortcut through it. What is worth knowing is that not every "password protected" PDF was made this way. The format has been through five generations, from a 40-bit key in 1994 that a laptop can search outright to this one, and readers report them all with the same words. This page writes the strongest, and names the other one it can write for what it is.

### What is the difference between the password and the restrictions?

A PDF has room for two passwords. The *user* password is the one a reader asks for; without it the file does not open, and that is real. The *owner* password lifts the *restrictions* — printing, copying, editing — and those are a request. A document that opens without a password must contain everything needed to derive its own key, so the only thing stopping a reader from printing it is a field it has agreed to honour, and any reader may decline. The [PDF Unlocker](https://abox.tools/unlock-pdf/) on this site is one that declines. Set restrictions to say what you would like; set a password to make sure.

### What if I forget the password?

Then the document is lost, and it is better to hear that here than from a "password recovery" site that takes your file first. Nothing on this site guesses passwords — you can read `src/shared/pdf-crypt.js` and see there is no loop in it — and for a document locked with the default scheme, nothing honest anywhere would succeed. That is why the page asks for the password twice. Keep your original: it is not changed by this, and it is the copy you will want if the password is ever gone.

### Should I choose AES-256 or AES-128?

AES-256, unless a reader from before 2010 has to open the file. The 256-bit option is the PDF 2.0 scheme — Acrobat X and later, every browser, every phone, every current reader. The 128-bit option is the 2005 scheme, which those older readers understand, and it is weaker not because of the cipher but because of the 1994 key derivation in front of it, which makes guessing a password far cheaper than the cipher suggests. If you do not know which reader will open the file, choose 256.

### Can I protect a PDF that is already protected?

If it opens without a password and only carries restrictions, yes: drop it in, and what you set replaces what was there. If it asks for a password to open, this page turns it away and points at the [PDF Unlocker](https://abox.tools/unlock-pdf/), which takes the old protection off in the same browser; bring the unlocked copy back here for the new one. Two locks on one document is not something the format can express, so changing a password is always take-off-then-put-on.

### Will the document look any different afterwards?

No. Nothing is re-rendered, re-encoded or reflowed: every page's drawing instructions, every embedded font and every image is copied through exactly as it arrived, enciphered. For whoever has the password, text stays selectable, scans stay at their original resolution, and nothing moves. The file may come out slightly smaller, because a rewrite leaves behind the superseded copies of objects that earlier edits left in it, and slightly larger where encryption adds sixteen bytes to every stream.

### What happens to a signed document?

Its signature stops being valid, and there is no way round that. A signature covers the exact bytes of the file it was applied to, so any change at all — by any program, including the one that signed it — invalidates it. This tool writes a new file, notices when the original was signed, and says so on the results. If you need a document that is both signed and protected, protect it first and sign the protected copy.

### Are my documents or passwords uploaded anywhere?

No. The file is read, encrypted and written by your own browser on your own hardware, and the password goes into a key derivation running in this tab. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The simplest way to satisfy yourself is to unplug from the network and use the page anyway. On this tool of all tools, that is the point: a document you are locking is one you would rather not hand round first.

### How do I know the protection is really on?

Because the tool checks, on your machine, and shows you the result. When the file has been written it is handed back to the same reader that the other PDF tools on this site use, twice. With no password it has to be refused outright; with the password you set it has to open, come back with the same number of pages, and report the restrictions you ticked. If either check fails, the run is reported as failed and nothing is offered for download. You can check it yourself afterwards too: open it in any reader, which will ask for the password, and look at the document properties for the permissions.

### Is there a size limit, and does it cost anything?

There is no limit written into the tool. The limit is your own machine: the document is held in memory while it is worked on, so a laptop will take a few hundred megabytes without complaint and will struggle somewhere above that. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your documents.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your document away to be encrypted would stop the moment you unplugged.

## How the privacy claim is verifiable

- **The one tool where uploading would defeat the point.** A document worth putting a password on is, by definition, one you do not want in other people's hands. Every online tool that offers to protect it asks you to hand it over first — the unlocked original, and then the password you chose — to a server whose retention you cannot see. This page cannot do that. The file is read by your own browser, the key is derived in this tab, the encrypted copy is written in memory, and the page's `Content-Security-Policy` names every address it may contact — not one of them belongs to this site. Unplug from the network and it keeps working, which is the simplest proof there is.
- **A password is real. A restriction is a request. The page says which is which.** An *open password* genuinely locks the document: the contents are enciphered with a key derived from it, the password is written nowhere in the file, and nobody without it reads a word. *Restrictions* — no printing, no copying, no editing — are different. A document that opens without a password has to carry everything needed to derive its own key, so what stops a reader printing is a permissions field the reader agrees to honour, and any reader may decline. Adobe documented that from the beginning, and the [PDF Unlocker](https://abox.tools/unlock-pdf/) on this site is one of the programs that declines. Restrictions are still worth setting: they are how you say what you would like, and most readers listen. They are just not a lock, and this page will not tell you they are.
- **AES-256, the current scheme, unless you ask for the older one.** PDF encryption has been through five generations, and readers report all of them as "password protected". The default here is the newest: AES-256 with the PDF 2.0 password hash, which is deliberately expensive to compute and is the only scheme in the family still considered strong. A document locked this way is as good as the password on it. The one reason to choose the other option, AES-128 with the 1994 key derivation, is a reader older than 2010 that has to open the file, and the page says so beside the choice rather than offering the weaker scheme as a peer of the stronger one.
- **The password is asked for twice, because there is no way back.** Nothing on this site guesses passwords, and nothing honest anywhere does either: a document locked with a strong scheme and a password nobody remembers is a document nobody will read again. So the open password is typed twice and the two have to agree, and the page says plainly, once, that a forgotten password is a lost file. Keep your original. Nothing about it is changed by this.
- **The finished file is opened again, here, before you are offered it.** Everything above is this tool marking its own homework until that happens. So the bytes that are about to become your download are handed to the same reader every PDF tool on this site uses, twice: once with no password, where it has to be refused, and once with the password you set, where it has to open and come back with the same number of pages and the restrictions you asked for. A file that failed either test would be reported as failed, with no download offered.
- **The pages themselves are not re-rendered, re-encoded or reflowed.** What changes is the encryption around the document, not the document. Every page's drawing instructions, every embedded font and every picture is written back out exactly as it arrived, enciphered, so text stays selectable and searchable for whoever has the password, scans stay at the resolution they were scanned at, and nothing shifts on a page. The one thing that does change is what a rewrite always changes: older superseded copies of objects left behind by earlier edits are not carried over.
- **A digital signature cannot survive this, and the page says when there is one.** A signature covers the exact bytes of the file it was applied to, so any rewrite invalidates it — that is what a signature is for. This tool writes a new file, so the copy you get back is unsigned, and it says so on the results when it finds a signature to warn about. Your original is still the signed one. If you need both, sign after you protect, not before.
- **A document that is already locked is sent next door first.** A file that needs a password to open is not re-locked here with a password on top of a password. It is turned away with a link to the [PDF Unlocker](https://abox.tools/unlock-pdf/), which takes the old protection off in the same browser, and the unlocked copy comes back here for the new one. A file that opens for anybody and only carries restrictions is accepted, and told plainly that what you set replaces what was there.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your document: not a file, not a page, not a name, a size, a page count, a password, or what the file was protected with. Every line that reads, encrypts or writes a PDF is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your documents. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your document away to be encrypted would stop.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/shared/pdf-crypt.js` for how a password becomes a document's key and how the /Encrypt dictionary is built from it, and `src/shared/aes.js` for the cipher itself. None of them can reach the network, and neither can the reader or the writer beside them.
