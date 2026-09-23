# Unlock PDF — take off the password and the restrictions

Most locked PDFs need no password at all. This one says which kind you have before it touches it.

> Take the password and the printing, copying and editing restrictions off a PDF in your browser. Most protected files need no password at all, and this one tells you which kind you have. Nothing is uploaded, and it never guesses a password.

هذه الصفحة أداة تفاعلية تعمل بالكامل داخل متصفحك، على العنوان https://abox.tools/ar/unlock-pdf/ — ولا يُرفَع أي شيء تعطيه إياها. وفيما يلي كل ما تقوله الصفحة عن الأداة بالكلمات؛ لاستخدامها، افتح العنوان.

## documents لا تُرفع **أبدا**. لا يوجد خادم.

The document you choose is opened, decrypted and written back out in memory on this machine, by code served from this address. Nothing here can make an upload, and there is no server on the other end of this page to receive one. Neither the file nor the password you type leaves the tab.

- ✗ No upload
- ✗ No account
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to remove a password or the restrictions from a PDF

1. **Choose the PDF.** One document at a time. It is read straight off your disk by the browser, and the first thing that happens is that it is tried with a blank password — which is what opens the majority of protected files, because the majority of them were never closed.
2. **Read what the page found.** It says which of the two kinds of protection this file has, what scheme was used and what that scheme is worth today, and lists every restriction the document asks readers to honour: printing, copying, editing, commenting, filling in forms, reordering pages, even reading it aloud to somebody who cannot see it.
3. **Type the password, but only if you are asked.** The box appears only when the blank password did not open the document, which is the only time a password is any use. Either of the document's two passwords works — the one that opens it, or the owner password that lifts its restrictions. Nothing is guessed, and what you type stays in this tab.
4. **Take it off, and read the line that says it was checked.** The document is decrypted with its own key and written back out with no encryption dictionary at all. Then the finished file is opened again here, with no password, by a reader that refuses encrypted documents — and if it will not open, or comes back with a different number of pages, you get no download and a message saying so.

## النسخة الأطول

[How to unlock a PDF, and which kind of locked it is](https://abox.tools/ar/guides/unlock-a-pdf/): A PDF that will not print and a PDF that will not open are two different problems with one name. What each of them actually is, why one comes off in a click and the other cannot come off at all, and how to tell which you have.

## أسئلة

### Do I need the password?

Usually not, and the page tells you within a second of choosing the file. Most "protected" PDFs — bank statements, payslips, exported reports, anything from an office suite's "restrict editing" box — open for anybody and merely carry a list of things readers are asked not to do. Those come off with one click and no password. A document that genuinely asks you for a password when you open it is the other kind, and for that one you need the password.

### Can it open a PDF whose password I do not have?

No, and it does not try. There is no dictionary, no word list and no brute-force search anywhere in this tool — you can read `src/crypt.js` and see that there is no loop in it. For the oldest documents, with 40-bit keys, a search would in fact work, which is exactly why the refusal is written down rather than left to be assumed. If you have lost the password to your own document, this page cannot help you and neither can any honest one.

### What is the difference between the two passwords?

A PDF has room for two. The *user* password is the one a reader asks you for; without it the file does not open. The *owner* password lifts the restrictions — printing, copying, editing — and a document very often has an owner password with no user password at all, which is why it opens for everybody and still refuses to print. This tool accepts either one, and tells you which of them the document actually let it in with.

### Is removing the restrictions legal?

That depends on the document and on where you are, and it is a question about your rights in the file rather than about the technology. What can be said plainly is what the format does: the restrictions are a field inside the document that readers honour by agreement, not a cryptographic barrier, and Adobe has documented them that way since they were introduced. This tool is for documents you are entitled to use — your own statement that will not print, a report you paid for that will not copy, a scan you need to reorder. If you are not entitled to the file, nothing here changes that.

### Which kinds of encryption does it handle?

Every published one: RC4 at 40 and 128 bits (revisions 2 and 3), AES-128 (revision 4), and AES-256 in both the withdrawn 2008 form and the current PDF 2.0 one (revisions 5 and 6). What it does not handle is certificate-based encryption, where the key belongs to a smart card or a key store rather than to a password, and Adobe's one unpublished variant. Both are refused with a message saying which they are, rather than failing vaguely.

### Will the document look any different afterwards?

No. Nothing is re-rendered, re-encoded or reflowed: every page's drawing instructions, every embedded font and every image is copied through exactly as it arrived. Text stays selectable, scans stay at their original resolution, and nothing moves. The file may come out slightly smaller, because a rewrite leaves behind the superseded copies of objects that earlier edits left in it.

### What happens to a signed document?

Its signature stops being valid, and there is no way round that. A signature covers the exact bytes of the file it was applied to, so any change at all — by any program, including the one that signed it — invalidates it. That is the whole point of a signature. This tool writes a new file, notices when the original was signed, and says so on the results. Keep your original: it is still the signed one.

### Are my documents or passwords uploaded anywhere?

No. The file is read, decrypted and written by your own browser on your own hardware, and the password goes into a key derivation running in this tab. There is no server side to this tool, and the page's `Content-Security-Policy` names every address it may contact — none of them belongs to this site. The simplest way to satisfy yourself is to unplug from the network and use the page anyway.

### How do I know the protection is really gone?

Because the tool checks, on your machine, and shows you the result. When the file has been written it is handed back to the same reader that the other PDF tools on this site use — one that refuses an encrypted document outright — and it has to open with no password and come back with the same number of pages. If it does not, the run is reported as failed and nothing is offered for download. You can check it yourself afterwards too: open it in any reader and look at the document properties, where every permission should now read Allowed.

### Is there a size limit, and does it cost anything?

There is no limit written into the tool. The limit is your own machine: the document is held in memory while it is worked on, so a laptop will take a few hundred megabytes without complaint and will struggle somewhere above that. It is free, there is no account, no sign-in and no trial. The site carries advertising, which is what pays for it; the ads are not given anything about your documents.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your document away to be unlocked would stop the moment you unplugged.

## كيف يمكن التحقق من وعد الخصوصية

- **Most protected PDFs are not locked at all, and this page says so before it does anything.** A PDF can carry two quite different things. An *open password* is real: without it the file cannot be read, and nothing here will find one. *Restrictions* — no printing, no copying, no editing — are not. A file carrying only those opens for anybody, which means it has to contain everything needed to derive its own key, because your reader derived it. What stops the reader printing is a permissions field inside the document, honoured by agreement between well-behaved programs. Adobe documented that from the beginning. Removing it is not breaking anything; it is declining to volunteer. The page tells you which of the two you have, and only asks for a password when there is genuinely one to ask for.
- **It does not guess passwords, and there is no loop in it that could.** If a document has an open password, you supply it or the document stays shut. There is no dictionary here, no word list, and no attempt on the 40-bit keys of the 1990s that really would fall to a search. That is a deliberate line rather than a limitation nobody got round to: a page that quietly tried a few million passwords for you would be a different tool with a different name, and it is not this one. Both the password that opens a document and the owner password that lifts its restrictions are accepted, because either one is a password you were given.
- **The password is typed here and used here.** What you type goes into a key derivation running in this tab and nowhere else. It is not stored, not remembered between files, and not written to the address bar, and the page's `Content-Security-Policy` names every address this page may contact — not one of them belongs to this site. A tool that asked for a document password and then made a network request would be doing the single worst thing a tool of this kind can do.
- **The finished file is opened again, here, before you are offered it.** Everything above is this tool marking its own homework until that happens. So the bytes that are about to become your download are handed to the same reader that [the compressor](https://abox.tools/ar/ضغط-pdf/), [the merger](https://abox.tools/ar/دمج-pdf/) and [the redactor](https://abox.tools/ar/طمس-pdf/) use — a reader that refuses an encrypted document outright — and it has to open with no password and come back with the same number of pages. A file that still had any encryption on it could not pass that. If it does not, the run is reported as failed and there is no download.
- **The pages themselves are not re-rendered, re-encoded or reflowed.** What changes is the encryption around the document, not the document. Every page's drawing instructions, every embedded font and every picture is written back out exactly as it arrived, so text stays selectable and searchable, scans stay at the resolution they were scanned at, and nothing shifts on a page. The one thing that does change is what a rewrite always changes: older superseded copies of objects left behind by earlier edits are not carried over, which usually makes the file a little smaller.
- **A digital signature cannot survive this, and the page says when there is one.** A signature covers the exact bytes of the file it was applied to, so any rewrite invalidates it — that is what a signature is for. This tool writes a new file, so the copy you get back is unsigned, and it says so on the results when it finds a signature to warn about. Your original is still the signed one. There is no way round this and no tool that has one.
- **It says what the protection was actually worth.** A document locked with 40-bit RC4 in 1998 and one locked with AES-256 last year both say "password protected" in a reader, and they are decades apart. The page names the scheme, the key length and the revision, and says plainly which of them are broken, which are merely superseded, and which is current. That is worth knowing about a file you were told was secure, and no reader shows it to you.
- **Certificate-locked documents are turned away rather than half-opened.** Some documents are encrypted to a certificate rather than a password — the corporate kind, where the key lives in a smart card or a key store. Those are refused with a message saying what they are. Nothing typed into a password box can stand in for a private key, and pretending otherwise would waste your time.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google. Neither is handed anything about your document: not a file, not a page, not a name, a size, a page count, a password, or what the file was protected with. Every line that reads, decrypts or writes a PDF is served from this origin and listed in the repository.
- **What the donate button loads, and what it is not given.** The "Buy me a coffee" button in the header is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link and nothing more: it reports no visit, and it is handed nothing about you or your documents. Nothing happens unless you click it, and what you would be clicking through to is somebody else's site.
- **It works offline.** Disconnect from the network and everything on this page still functions. That is the simplest proof of all: a tool that sent your document away to be unlocked would stop.

**تحقّق بنفسك.** لا شيء مما سبق عليك تصديقه دون تحقق. تُولَّد هذه الصفحة من القوالب والإعدادات في المستودع بواسطة سكربت بناء يمكنك قراءته وتشغيله بنفسك، والنتيجة موجودة في فرع `dist` — فقارِن إذن بين ما يُقدَّم فعلا وما ينتجه بناء المصادر: https://github.com/A-Box-of-Tools/website

الملفات الجديرة بالقراءة أولا هي `config/site.toml` من أجل سياسة أمان المحتوى (Content-Security-Policy), `src/crypt.js` for how a password becomes a document's key — and for the fact that there is no loop in it anywhere — and `src/aes.js` and `src/rc4.js` for the two ciphers themselves. None of them can reach the network, and neither can the reader or the writer beside them.
