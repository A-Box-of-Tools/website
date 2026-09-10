# Unlock a PDF

[← All tools](../README.md) · [The tool](https://abox.tools/unlock-pdf/)

Takes the password and the printing, copying and editing restrictions off a
PDF, in the browser, without the document or the password going anywhere.

The reason this tool exists is a fact about the format that almost nobody is
told: **most protected PDFs are not locked at all.** So the page's first job is
not to unlock anything. It is to say which of two very different situations you
are in.

## The two things "protected" means

A PDF can carry two entirely separate protections, and readers present them
almost identically.

**An open password** — the *user* password — is real. Without it the document
cannot be read by anybody, including this tool. Nothing here will find one:
there is no dictionary, no word list and no search. `src/crypt.js` has no loop
in it anywhere, which is a claim you can check by reading it, and the page makes
it out loud rather than leaving it to be inferred. That matters most for the
oldest documents, where a 40-bit RC4 key genuinely *would* fall to a search — a
tool that quietly did that would be a different tool with a different name.

**Restrictions** — no printing, no copying, no editing — are not real in the
same sense, and the reason is structural rather than a flaw anybody introduced.
A file that opens without asking you for anything must contain everything
needed to derive its own key, because your reader derived it. What stops that
reader printing is a permissions field, `/P`, sitting *inside* the document and
protected by nothing but the reader's willingness to look at it. Adobe
documented this from the beginning: the restrictions are honoured by agreement
between well-behaved programs. Removing them is not breaking anything; it is
declining to volunteer.

So a file is always tried with the blank password first. If that opens it, the
document was never closed — only restricted — and there is nothing to ask for.
If it does not, the password box appears, and only then.

## What is in `src/`

| File | What it does |
|---|---|
| `main.js` | the page: loading, the password box, the report, the run |
| `crypt.js` | the standard security handler — the whole of PDF encryption |
| `aes.js` | AES-128 and AES-256 in CBC, written out |
| `rc4.js` | RC4, for every document written before about 2008 |
| `permissions.js` | `/P` as the list of things the document asks readers to refuse |
| `format.js` | the few things this tool turns into words |
| `example.js` | builds the example — a document that really is locked |

The reading and writing of the PDF itself is not here: it is the four shared
parts under `shared/js/` that the compressor, the merger and the redactor also
use.

## The four generations, and why the revision decides everything

`crypt.js` implements every published version of the standard security handler.
Which one a document uses is decided by `/R`, the *revision*, not by `/V`:

| | | |
|---|---|---|
| **R2** | PDF 1.1, 1994 | RC4 with a 40-bit key, MD5 to derive it. Inside the American export limit of the day, and exhaustible now on a laptop |
| **R3** | PDF 1.4 | The same shape at up to 128 bits, with the key derivation iterated fifty times |
| **R4** | PDF 1.6 | Adds AES-128 and a table of named crypt filters, so different parts of one document can be treated differently |
| **R5** | An Adobe extension, 2008, withdrawn | AES-256 with a single SHA-256 of the password, which turned out to be attackable at the speed a graphics card can hash |
| **R6** | PDF 2.0 | AES-256 with a deliberately expensive iterated hash. The one still worth anything |

Two things are refused rather than half-attempted: **certificate-based**
encryption, where the key belongs to a smart card or a key store rather than to
a password, and Adobe's one unpublished variant (`/V 3`). Both get a message
saying which they are.

The page names the scheme, the key length and the revision, and says which of
them are broken, which are merely superseded, and which is current. No reader
shows you that, and it is worth knowing about a file you were told was secure.

## Why the ciphers are written out rather than taken from the browser

The browser has AES-CBC in native code, and it is not used. This is a site
whose first instinct is always the native API, so the reason is worth stating.

**`crypto.subtle` is asynchronous.** The code that has to call it is
`PdfDocument.getObject` — an ordinary synchronous function that the reader, the
filters and the writer all lean on, and whose own header comment says that
parsing eagerly is what lets `resolve` stay a plain function instead of
spreading `await` through every caller. Decrypting cannot be bolted on
afterwards either: an object is ciphertext until its own number has been mixed
into the key, and its number is known in exactly one place — the moment it is
parsed. So the choice was a synchronous cipher here, or `await` in three shared
files and four other tools. This is much the smaller change.

There is a second, smaller reason pointing the same way: WebCrypto's CBC always
pads and always unpads, with no raw mode, and two of the things PDF asks for —
wrapping the file key in `/UE` and `/OE`, and the inner loop of the PDF 2.0
password hash — are unpadded by definition.

The SHA family *is* taken from the browser, because it is needed once, during
key derivation, which is already asynchronous. Only MD5 is hand-written, in
`shared/js/md5.js`, because no browser offers one — it moved there from
`/hash-checksum/` when this tool needed it rather than becoming a second copy.

## How the reader was changed, and how little

`shared/js/pdf-reader.js` used to refuse every encrypted document flatly, and
it still does — unless the caller passes an `unlock` function to `open`. One
tool does. The other four carry no crypto at all and behave exactly as before.

What the reader gained is only the knowledge of how to *apply* a cipher: which
strings and streams are covered by one, which are exempt, and when the key has
to exist. That last part is the subtle bit, and it is worth knowing about
before changing anything there:

- **An object stream is encrypted as a stream**, so it has to be decrypted
  before it is unpacked — and the objects that come out of it are then already
  in the clear and must not be decrypted a second time. That is why
  `setUpCrypt` sits between the cross-reference chain and
  `expandObjectStreams`, and why getting the order wrong produces a page tree
  full of nulls rather than an error.
- **Four things are never encrypted**, and each corrupts a document quietly if
  handled wrongly: the `/Encrypt` dictionary itself, cross-reference streams
  (which a reader must find the file with before it could possibly have a key),
  the XMP packet when `/EncryptMetadata` is false, and any stream whose filter
  chain names `/Crypt` with `/Identity`.
- **The generation number is taken from the object's own header**, not from the
  cross-reference table, which throws it away. It is part of the key.

## The example is a document that really is locked

Every other example on this site is a picture, a recording or a document, and
`shared/js/example-pdf.js` already writes a perfectly good PDF. What it does
not write is a *locked* one — and demonstrating that restrictions come off a
document that never had any would be demonstrating nothing.

So `src/example.js` writes a two-page statement and then encrypts it, using the
one export in `crypt.js` that goes the other way. What comes out is the
commonest protected file in the world: AES-128, no password to open it, an
owner password nobody has typed in, and printing and copying switched off. Open
it in a reader before using the tool and the print button will be greyed out.

A tool that removes protection has no business adding any, and that one export
is the exception, with one caller. It is also why the tests do not lean on it:
see below.

## How this is tested

The round trip — encrypt with `example.js`, decrypt with `crypt.js` — proves
only that the two agree with each other, so it is not what the read side rests
on. `tests/js/unlock-pdf-crypt.test.js` carries fixtures produced by a
completely separate implementation (pypdf), one per scheme, and checks that
this code opens them, gets the right text out, reads the right permissions, and
refuses a wrong password. The encryptor is checked in the other direction too:
what `example.js` writes is a file that other readers open as an ordinary
AES-128 document.

## What it cannot do

- **Find a password you do not have.** Deliberately, and permanently.
- **Keep a digital signature valid.** A signature covers the exact bytes of the
  file it was applied to, so any rewrite invalidates it — that is what a
  signature is for. The tool notices when a document was signed and says so on
  the results.
- **Open a certificate-encrypted document.** That needs the private key it was
  issued to.
