# How to password-protect a PDF, and what it is actually worth

A password on a PDF genuinely keeps people out. A restriction on printing or copying asks them nicely. Both are worth having, and the difference decides what you can promise the person you send the file to.

[Open the PDF Protector](https://abox.tools/protect-pdf/): Lock a document you would rather not hand to a website in order to lock it.

Last updated 12 September 2026

## The short answer

Open the [PDF Protector](https://abox.tools/protect-pdf/), drop the document in, type a password twice, and press the button. The file is encrypted in your browser with AES-256, and the page opens the result again — once without the password, where it has to be refused, and once with it — before it offers you the download. Nothing is uploaded; unplug from the internet and it works the same.

The rest of this is about what you have just done, because a password and a restriction are not the same thing, and the difference is the difference between a promise you can make and one you cannot.

## The two things you can put on a PDF

A PDF has room for two passwords, and readers present them so alike that most people never learn they are different.

The **open password** — the *user* password — is a lock. The contents of the file are genuinely enciphered, the key is derived from the password, and the password is not written down anywhere in the document. Without it nobody reads the file: not the person you sent it to, not a website, not the program that made it.

The **restrictions** — no printing, no copying, no editing, controlled by the *owner* password — are a request. Here is the part almost nobody is told: a document that opens without asking for a password *must contain everything needed to derive its own key*, because your reader just derived it. So what stops the reader printing is a separate field inside the file, a row of permission bits, that readers honour because they have agreed to. Adobe documented it that way from the beginning, and any reader may decline. The [unlocker on this site](https://abox.tools/guides/unlock-a-pdf/) is one that does.

That is not a reason to skip the restrictions. Most readers do honour them, and ticking “no printing” is how you say what you would like to happen to the file. It is a reason not to *rely* on them. If the file must not be read by the wrong person, set an open password. If you would rather it were not printed, tick the box, and know that you have asked rather than made sure.

## Which encryption to choose

The tool offers two, and the default is the right one unless you have a specific reason.

- **AES-256**, the PDF 2.0 scheme from 2017, is the default. The password goes through a hash that is deliberately expensive to compute and runs a different number of rounds depending on the data, which is what makes it awkward to build hardware to guess against. Every reader since Acrobat X in 2010 opens it — every browser, every phone, every current desktop reader. A document locked this way is as good as the password on it.
- **AES-128**, the 2005 scheme, is there for one reason: a reader older than 2010 that has to open the file. The cipher is fine. What is weaker is the step in front of it that turns your password into a key, which dates from 1994 and is cheap enough that guessing passwords is far easier than the cipher suggests. If you do not know which reader will open the file, choose 256.

Both of these are worlds away from the first generation of PDF encryption, a 40-bit key from 1994 that a laptop can search outright, and readers report all of them with the same two words. If somebody has told you a document is safe because it is password protected, which generation is the question to ask. The [PDF Unlocker](https://abox.tools/unlock-pdf/) answers it for any file you drop on it.

## Why the password is worth more than the scheme

With AES-256 there is no shortcut through the encryption, so the only way in without the password is to guess it, and the hash is built to make each guess slow. Slow is not the same as impossible. A six-character word is a few million guesses; a sentence you can remember is not. The page counts the characters as you type and says so when the count is short, but the rule is simple enough to carry in your head: the document is exactly as safe as the password, and a long one costs nothing.

Two things follow. Type it twice — the page insists, because a typo in a strong password is a document nobody will ever open. And keep your original. Protecting a file writes a new one and leaves the original exactly as it was, and the original is the copy you will want if the password is ever lost.

## If you forget it

Then the document is lost, and it is better to hear that here than from a “PDF password recovery” site that takes your file first. What those sites do is guess — a dictionary, then patterns, then everything — and against a real password on the current scheme they do not finish. Most upload your document to a server that guesses for you, and a good many charge before saying whether it worked.

Nothing on this site guesses. There is no loop in the unlocker that could, and the protector asks for the password twice precisely because there is no way back. That is a deliberate line rather than a missing feature.

## Why the upload is the strange part

Think about what you are protecting. A bank statement. A contract. A medical letter. Tax paperwork. A scan of your passport for a landlord. Almost by definition, a document you are about to put a password on is one you would rather not have lying around in other people's hands.

Every online tool that offers to protect it asks you to hand it over first: the unlocked original, and then the password you chose, to a server whose retention you cannot see. However well-meaning the page, you have just sent the private thing, intact, together with the key, to somebody you do not know, in order to make it private.

None of it needs to happen. Every step in protecting a PDF is arithmetic on bytes — derive a key, run a cipher, write the file back out — and a browser does all three perfectly well. That is what [the tool here](https://abox.tools/protect-pdf/) does. The document and the password stay in the tab, the page's own policy names every address it may contact and none of them is this site's, and it keeps working with the network unplugged. If you would rather prove that than take our word for it, that is the test: disconnect, and use it anyway.

There is a more general version of this argument in [is it safe to upload files](https://abox.tools/guides/is-it-safe-to-upload-files/), and the same question asked of the document people most regret sending in [is it safe to upload a bank statement](https://abox.tools/guides/is-it-safe-to-upload-a-bank-statement/).

## Two things that will happen to the file, and one that will not

**A signature will stop being valid.** If the document was digitally signed, protecting it breaks the signature — not through carelessness, but because a signature covers the exact bytes of the file it was applied to, and protecting writes a new file. Any program would have the same effect. If you need both, protect first and sign the protected copy.

**The size will change a little.** Encryption adds sixteen bytes to every stream and string, and a rewrite leaves behind the superseded copies of objects that earlier edits appended. Which of the two wins depends on the file, and neither is the point.

**The pages themselves do not change.** Nothing is re-rendered, re-encoded or reflowed: the drawing instructions, the embedded fonts and the images are enciphered exactly as they arrived. For whoever has the password, text stays selectable, scans stay at the resolution they were scanned at, and nothing moves on the page.

## Changing a password that is already there

The format has room for one lock, so a document that already needs a password cannot have a second one put on top. The tool turns such a file away and points at the [PDF Unlocker](https://abox.tools/unlock-pdf/), which takes the old protection off in the same browser; bring the unlocked copy back and put the new password on. A document that only carries restrictions — the kind that opens for everybody and refuses to print — is accepted as it is, and told that what you set replaces what was there.

## Before you protect it

A locked document is the end of the line for the rest of the box: once it needs a password, nothing else here will open it without going through the unlocker first. So do the other jobs before this one — [merge or split it](https://abox.tools/merge-pdf/), [make it smaller](https://abox.tools/compress-pdf/), and above all [take out anything that should not be in it at all](https://abox.tools/redact-pdf/), because a password protects the file from strangers and does nothing about what the person you send it to can read.
