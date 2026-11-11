# Protect, transfer and verify a PDF

Prepare the document first, protect its final contents, then check the exact file that arrives. A password controls opening the PDF; a checksum checks whether the received bytes match the copy you sent.

Last updated 22 October 2026

## Finish the document before protecting it

You need to send a fictional `committee-papers.pdf` to one other person. You want a password to be required before it opens, and a check that the downloaded copy matches the final file you sent. These are separate jobs: protection controls opening; a checksum compares bytes; transfer moves those bytes to the recipient.

1. Finish and inspect the document.
2. Generate a unique password and protect a copy of the PDF.
3. Calculate SHA-256 for that exact protected copy.
4. Transfer it and have the recipient compare the checksum.

Complete editing, page selection, redaction and compression first. Password protection does not remove a detail you forgot to delete; a checksum cannot tell you whether the right pages are in the pack. Keep the original safely. Any later change to the protected file requires a fresh checksum.

## Require a password to open the PDF

Use the [Password & Passphrase Generator](https://abox.tools/password-generator/) to make a long, unique random password. Store it somewhere you can retrieve safely, such as your password manager. Do not reuse an account password or a password printed in a guide. The [generator guide](https://abox.tools/guides/is-it-safe-to-use-an-online-password-generator/) explains local generation.

Load the finished document into the [PDF Protector](https://abox.tools/protect-pdf/) and set the opening password. Restrictions on printing or copying are a different feature: a document that opens without a password does not meet this workflow's goal. Keep the default AES-256 setting unless a reviewed compatibility requirement calls for another approach. See the [protection guide](https://abox.tools/guides/protect-a-pdf/) for the settings and their limitations.

Download `committee-papers-protected.pdf`. Give it a filename that does not itself disclose private information: encrypting a document does not conceal the name of the attachment.

## Test the protected download

Open the downloaded file in a PDF reader and check that it requires the opening password. Use the stored password, then read the pages. If the reader remembers passwords, use a fresh reader session; an already unlocked preview does not demonstrate what a first-time recipient will see.

Confirm that the recipient can use password-protected PDFs and that the file meets the transfer tool's limit. Share Text & Files currently caps an individual file at 200 MB. If the document needs shrinking, return to the original, compress and inspect it, then protect the resulting version. Do that before calculating its digest.

Keep the original and password safe. Losing the password can leave the protected copy unreadable. The encrypted copy is the attachment for the remaining steps; do not accidentally select the original.

## Hash the final encrypted bytes

Select `committee-papers-protected.pdf` in [Hash & Checksum](https://abox.tools/hash-checksum/) and use its SHA-256 result. Copy the full digest: SHA-256 has 64 hexadecimal characters. Comparing only the beginning or end is a weaker check. The [checksum guide](https://abox.tools/guides/verify-a-file-checksum/) explains how to compare an expected digest.

Two PDFs can look identical and still have different hashes. Even separately encrypting the same original can produce different bytes. Hash the actual protected download, not an earlier version or an unencrypted copy saved by a reader.

| Working item | Use |
| --- | --- |
| Original PDF | Retain safely for future edits |
| Protected PDF | Hash, transfer and verify this exact file |
| Opening password | Give only to the intended recipient |
| Expected SHA-256 | Communicate through a trusted channel for comparison |

## Transfer the protected copy

Open [Share Text & Files](https://abox.tools/share-text/), select the protected download, and invite the recipient. Keep Private access and approve the intended receiving device. Leave the sending tab open until the recipient finishes downloading. Follow the [sharing guide](https://abox.tools/guides/share-text-between-devices/) for connection choices and troubleshooting.

This step deliberately uses a network. In the usual between-device flow, a public rendezvous introduces the browsers; even Local network mode needs that introduction. Direct sends the file between peers. Choosing Cloud relay sends encrypted WebRTC traffic through the relay instead. The introduction service does not carry the file's contents. Password protection also remains on the downloaded PDF.

Give the password through a separate trusted channel. Give the expected digest through an authenticated channel too, such as your established conversation with the recipient. Sending a replacement file and a replacement digest together could make them agree, so a hash supplied only beside an untrusted download does not establish its origin.

## Compare the received file before changing it

On the receiving device, download the file and open [Hash & Checksum](https://abox.tools/hash-checksum/). Select that received PDF, use SHA-256, and compare the entire digest with the trusted expected value. The tool's comparison field avoids trying to spot one wrong character by eye.

A matching SHA-256 provides strong evidence that the received bytes match the sender's hashed copy. It does not by itself identify the author, establish that the contents are correct, or make the file safe to open. This workflow assumes a document expected from a known sender.

If the digests differ, first confirm that both people chose the same algorithm and the protected copy. A similarly named original, a new encrypted export or a later saved version can explain the difference. Resolve it before calling the received copy verified. Do not decrypt and resave the file before comparing: that would change its bytes.

Once the comparison succeeds, open that same file with the password and confirm the intended pages are readable. Hashing and reading answer different questions; this last check still matters.

## End the transfer after confirming receipt

Close the sending tab after the recipient has downloaded, verified and opened the document. This stops live hosting. It does not erase a copy someone already downloaded, and the PDF password does not provide expiry or remote revocation. Someone with both file and password can keep access.

The completed handover is specific: the PDF asks for an opening password, the received encrypted file matches the expected SHA-256, and the intended recipient can read the intended pages. Keep the transfer invitation and password sharing limited to that recipient.
