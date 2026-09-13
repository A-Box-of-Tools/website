# How to unlock a PDF, and which kind of locked it is

“Protected” covers two completely different things. One is a password that genuinely keeps everybody out. The other is a note inside the file asking your reader not to print it, which your reader has agreed to honour. Telling them apart takes a second and decides everything that follows.

[Abrir PDF Unlocker](https://abox.tools/es/unlock-pdf/): Most locked PDFs need no password at all. This one says which kind you have before it touches it.

Última actualización 10 September 2026

## The short answer

Open the [PDF Unlocker](https://abox.tools/es/unlock-pdf/) and drop the document in. Within a second it will tell you which of two situations you are in, and they are not close to each other:

- **The document opens, but will not print or copy.** No password is needed. Press the button and the restrictions are gone. This is by far the commoner case.
- **The document asks for a password before it will open.** You need that password. Nothing on that page — or on any honest page — will find it for you.

The rest of this explains why those two are so different, which is worth knowing before you hand a document to anything that offers to unlock it.

## The two locks, and why only one of them is a lock

A PDF has room for two passwords, and readers present them almost identically, which is where all the confusion comes from.

The **user password** — usually called the open password — is real. The contents of the file are genuinely enciphered, the key is derived from that password, and the password is not written down anywhere in the document. Without it, nobody reads the file: not you, not a website, not the program that made it.

The **owner password** is a different thing wearing similar clothes. It controls the *restrictions*: no printing, no copying, no editing, no filling in the form. And a document very commonly has an owner password with no user password at all — which is exactly the file that opens the moment you double-click it and then refuses to print.

Here is the part almost nobody is told. A file that opens without asking you for anything *must contain everything needed to derive its own key*, because your reader just derived it, without asking you for anything. So the contents are encrypted with a key that anybody can work out. What stops your reader printing is a separate field inside the document — a row of permission bits — that readers honour because they have agreed to. Adobe documented it that way from the beginning. It is a request, not a barrier.

That is why removing restrictions is instant and removing an open password is impossible. They are not two strengths of the same lock. One is a lock and one is a note on the door.

## How to tell which one you have, without any tool at all

Double-click the file.

- **It asks you for a password.** That is a user password. You need it.
- **It opens, and something is greyed out** — the print button, or copy, or the form fields — and the title bar or the document properties say something like “Secured”. That is restrictions only, and they come off.

In most readers you can see the detail: open the document properties and look at the Security tab, which lists every permission as Allowed or Not Allowed. The [PDF Unlocker](https://abox.tools/es/unlock-pdf/) shows the same list, and adds the thing no reader shows you — which encryption scheme the file uses, and what that scheme is worth today.

## What “encrypted” is worth depends entirely on when it was done

Two documents can both report “password protected” and be thirty years apart in what that means. The format has been through five generations:

- **RC4, 40-bit** (PDF 1.1, 1994). Built to fit inside the American export limits of the day. The key is short enough to be searched outright on ordinary hardware.
- **RC4, 128-bit** (PDF 1.4, 2001). Nobody searches a 128-bit key, but RC4 itself has been considered broken since 2013; it was prohibited in TLS in 2015 and browsers dropped it early the year after.
- **AES-128** (PDF 1.6, 2005). A modern cipher with a key derivation from 1994 still bolted to the front of it. The encryption is sound; the step that turns your password into a key is cheap enough that guessing passwords is far easier than the cipher suggests.
- **AES-256, first attempt** (2008). Adobe's own extension, later withdrawn: the password hash turned out to be cheap enough to attack at the speed a graphics card can hash.
- **AES-256, PDF 2.0** (2017). Deliberately expensive to compute, and the one still worth something. A document locked this way is as good as the password on it.

If somebody has sent you a document and told you it is safe because it is password protected, this is the question to ask. A twenty-year-old workflow can still be emitting the first entry on that list.

## If you have lost the open password

Then the document is lost, and it is worth hearing that plainly rather than working through a series of sites that will each take your file first.

Search results for this are full of “PDF password recovery” tools. What they do is guess: a dictionary, then patterns, then every combination, which is fast for a short password and never finishes for a long one. Some of them run on your machine, most of them upload your document to a server that guesses for you, and a great many take payment before telling you whether it worked. If the file was made in the last few years with a real password, none of them will get in.

The [PDF Unlocker](https://abox.tools/es/unlock-pdf/) does not guess, and does not offer to. There is no dictionary and no loop in it anywhere — you can read the source. That is a deliberate line rather than a missing feature: for the oldest documents a search really would work, which is exactly why the refusal is written down instead of left to be assumed.

What is worth trying first, before anything else: whoever sent it to you usually still has it. Corporate documents are very often locked with the same password across a whole department, or with something predictable like your date of birth or the last digits of an account number — banks and payroll systems do this routinely, and the password is nearly always described in the covering email you have already deleted.

## Should you upload it?

Consider what is actually in the documents people need unlocked. Bank statements that will not print. Payslips. Medical letters. A contract that will not copy. Tax paperwork. Almost by definition, a protected document is one somebody thought was worth protecting.

Handing that to a website means the private thing arrives at their server first, intact, and — if it has an open password — you have helpfully sent the password along with it. What they keep, how long for and who has access to it is not something you can check from the outside, whatever the page says.

None of it needs to happen. Every step in unlocking a PDF is arithmetic on bytes: derive a key, run a cipher, write the file back out. A browser does all three perfectly well, which is what [the tool here](https://abox.tools/es/unlock-pdf/) does — the document and the password stay in the tab, and the page keeps working with the network unplugged. If you want to prove that rather than take our word for it, that is the test: disconnect, and use it anyway.

There is a more general version of this argument in [is it safe to upload files](https://abox.tools/es/guias/es-seguro-subir-archivos/), and the same question about the documents people most regret sending in [is it safe to upload a bank statement](https://abox.tools/es/guides/is-it-safe-to-upload-a-bank-statement/).

## Two things that will happen to the file, and one that will not

**A signature will stop being valid.** If the document was digitally signed, removing the encryption breaks the signature — not because of anything careless, but because a signature covers the exact bytes of the file it was applied to, and unlocking writes a new file. Any program that did this would have the same effect. Keep your original; it is still the signed one.

**The file usually gets slightly smaller.** Rewriting a document leaves behind the superseded copies of objects that earlier edits appended to it. That is a side effect, not the point.

**The pages themselves do not change.** Nothing is re-rendered, re-encoded or reflowed: the drawing instructions, the embedded fonts and the images come through exactly as they arrived. Text stays selectable, scans stay at the resolution they were scanned at, and nothing moves on the page. If a tool hands you back a document that looks softer or where the text has become a picture, it has done something other than unlock it.

## Is it allowed?

That is a question about your rights in the document rather than about the technology, and the answer depends on the file and on where you are.

What can be said without any hedging is what the format does. The restrictions are a field inside the document that readers honour by agreement; they are not a cryptographic barrier and have never been presented as one. The everyday uses are the obvious ones: your own statement that will not print, a report you paid for that will not copy, a scan whose pages you need to reorder, a form you are supposed to fill in. If the document is not yours to use, removing a permission bit does not make it yours.

## Afterwards

An unlocked document is an ordinary one, so the rest of the box works on it: [merge or split it](https://abox.tools/es/unir-pdf/), [make it smaller](https://abox.tools/es/comprimir-pdf/), or [take a name out of it properly](https://abox.tools/es/censurar-pdf/) — which, if the reason it was locked was that it contains something private, is very likely the next thing you actually want.
