# Protect a PDF

[← All tools](../README.md) · [The tool](https://abox.tools/protect-pdf/)

Puts a password on a PDF, or restrictions on printing, copying and editing, or
both, in the browser, without the document or the password going anywhere.

It is the other half of [`unlock-pdf`](../unlock-pdf/), and it exists because
of an argument that tool makes and this one inherits: **the document worth
locking is the one you least want to hand to a website first.** Every online
"protect PDF" page asks for the unlocked original and then the password you
chose, and keeps both for as long as it keeps them. Nothing about the job needs
that. Deriving a key, running a cipher and writing the file back out are
arithmetic on bytes, and a browser does all three.

## What "protected" means, from this side

The unlocker's page is built around the fact that "protected" means two
different things, and this page has to say the same thing about what it writes.

**An open password** — the *user* password — is real. The document's contents
are enciphered under a key derived from it, the password appears nowhere in
the file, and nobody without it reads a word. This is the lock, and the page
leads with it.

**Restrictions** — no printing, no copying, no changes — are a request. A
document that opens without a password has to carry everything needed to
derive its own key, so what stops a reader printing is a permissions field,
`/P`, that readers honour by agreement and any reader may decline. Adobe
documented that from the beginning, and the unlocker next door is one of the
programs that declines. So the restrictions sit under the password on the
page, under a sentence saying exactly that. They are still worth setting: they
are how you say what you would like, and most readers listen.

**The owner password is never left blank.** Restrictions mean something only if
the password that lifts them is not the empty string, so `protect()` fills a
blank one in: with the open password, so that one password does both jobs,
which is what most people mean; or, when there is no open password either,
with a random one nobody has. That random password guards only the request not
to print, never the opening of anything, so nothing here can write a file
nobody can read.

## Why the password is asked for twice

Nothing on this site guesses passwords, and for a document locked with the
default scheme nothing honest anywhere would succeed. A forgotten password is a
lost document. So the open password is typed twice and the two have to agree
before the last card wakes, and the sentence under the boxes says, once, in
plain words, that there is no way back in. The visitor's original is not
changed by any of this and the page says to keep it.

## What is in `src/`

| File | What it does |
|---|---|
| `main.js` | the page: loading, the settings, the run, and the check afterwards |
| `format.js` | the few things this tool turns into words |
| `example.js` | asks `shared/js/example-pdf.js` for an ordinary statement |

The work itself is not here. It is in shared parts, because this tool needed
the other half of code the unlocker already had:

| Part | What it does |
|---|---|
| `shared/js/pdf-crypt.js` | the standard security handler, both directions: `standardSecurity` derives a key from a password, and `protect` builds the `/Encrypt` dictionary and the cipher that writes to match it |
| `shared/js/aes.js`, `shared/js/rc4.js` | the two ciphers, written out |
| `shared/js/pdf-permissions.js` | `/P` as a list of what the document asks readers to refuse |
| `shared/js/pdf-writer.js` | the writer every PDF tool uses, which gained a `security` option: every string and stream goes through the cipher under its object's number, and the three things a reader needs before it can have a key stay in the clear |

Those four crypto modules lived in `tools/unlock-pdf/src/` until this tool
was built. A second copy would have been the thing `tests/python/test_duplicates.py`
exists to refuse, so they moved.

## The two schemes it writes

| | | |
|---|---|---|
| **R6** | PDF 2.0, 2017 | AES-256 under the iterated password hash of algorithm 2.B. The default, and the only scheme in the family still considered strong. Every reader since Acrobat X (2010) opens it |
| **R4** | PDF 1.6, 2005 | AES-128 with the 1994 key derivation in front of it. What "restrict editing" in an office suite has written for fifteen years, and what a reader older than 2010 needs. Offered second, and named for what it is |

The revision-6 shape is worth reading in `protect256`: the file key is random,
`/U` and `/O` each carry a hash of a password and two salts, and `/UE` and
`/OE` carry the file key wrapped under a hash over the other salt. A password
proves itself against the hash and then unwraps the key, which is why two
passwords can open one document without either being derivable from the file.
`/Perms` is the permissions again under the file key, so a reader can prove the
key it derived is the one the document was written with.

Neither scheme applies SASLprep to the password; the bytes are UTF-8 (R6) or
Latin-1 (R4), truncated to 127 and 32 bytes, which is what pypdf does and what
the reading side of the same file expects. A password made of ASCII is the
same bytes under every rule.

## What the writer does differently under a `security`

`writeDocument` writes the same file it always did, with the cipher applied on
the way out. The order matters and each step is a reader's rule read backwards:

- a stream is compressed first and enciphered second, because a cipher's
  output does not compress and a reader undoes the two the other way round;
- the strings in an indirect object's dictionary are enciphered under that
  object's number, which for a stream is the stream's;
- an object stream is enciphered as one stream under its own number, and the
  objects packed inside it are written in the clear, because a reader decrypts
  the container before unpacking it and never decrypts the contents again;
- the `/Encrypt` dictionary is written as a plain, unpacked object of its own,
  because a reader has to find it before it can unpack anything — the shared
  reader's `setUpCrypt` runs exactly there, after the cross-reference chain
  and before the object streams are opened;
- the cross-reference stream is never enciphered, and the trailer gains an
  `/ID`, which the writer otherwise leaves out on purpose and which the
  revision-4 key is derived from.

With no `security` the option changes nothing, byte for byte, which the
compressor's and the unlocker's tests hold it to.

## The check afterwards

The finished bytes are opened again in the page, twice, before a download is
offered. With no `unlock` function the shared reader refuses any encrypted
document, so a file that opened would be a file with no lock on it. With the
password that was set it has to open, come back with the same number of pages,
and — read through the same `/P` table the unlocker uses — report exactly the
restrictions that were asked for. A file that fails either test is reported as
failed and the download link is not shown.

## How this is tested

The round trip — `protect` here, `standardSecurity` there — proves only that
the two halves of one file agree. What makes it worth something is that the
reading half is itself pinned by `tests/js/unlock-pdf-crypt.test.js` to files
written by pypdf, an implementation with no connection to this one; a writer
that satisfies a reader which satisfies pypdf's files is a writer that agrees
with pypdf about the specification. `tests/js/protect-pdf.test.js` runs both
revisions through the shared writer and back, with and without an open
password, checks the text and the permissions come back, checks the wrong
password and the missing password are refused, and checks that a `security`
of `null` leaves the writer's output as it was.

The other direction was checked by hand while this was built, and is worth
repeating after any change to `protect256`: pypdf 6.18 opens what the tool
writes, reports the user password as the user's and the owner's as the
owner's, refuses a wrong one, and reads the permissions back exactly.

## What it cannot do

- **Put a second password on a document that already needs one.** The format
  has room for one `/Encrypt` dictionary. A file that needs a password to open
  is turned away with a link to the unlocker; a file that only carries
  restrictions is accepted, decrypted with the blank password on the way in,
  and told that what is set here replaces what was there.
- **Keep a digital signature valid.** A signature covers the exact bytes of
  the file it was applied to, so any rewrite invalidates it. The tool notices
  when a document was signed and says so on the results.
- **Recover a password.** Deliberately, and permanently, like the tool next
  door.
