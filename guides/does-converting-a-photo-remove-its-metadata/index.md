# Does converting a photo remove its metadata?

Sometimes, and both answers have burned people. Re-encoding through a canvas strips everything; a careful converter copies everything over; the picture looks identical either way. The only reliable move is to stop predicting and look at the file.

Last updated 26 August 2026

## The short answer

Sometimes. Converting, resizing or compressing a photo removes its metadata when the tool rebuilds the image from pixels, and keeps the metadata when the tool copies it across on purpose — and nothing on screen tells you which one happened. The picture looks the same in both cases, because metadata was never part of the picture.

Both outcomes surprise people, in opposite directions. Somebody counts on the location being scrubbed by “just resizing it”, and it survives. Somebody else counts on the capture date surviving a format change, and it is gone. The two mistakes have the same cure: stop predicting what a tool probably did, and look at what the file actually contains.

## What is riding along, and why it is separate

A photo file is two things in one container: the encoded image, and a block of tags about it — EXIF, plus often XMP and a colour profile. The tags typically include when the photo was taken, the camera and lens, the exposure settings, the GPS coordinates of where you stood, and frequently a small embedded thumbnail of the image — sometimes of the image as it was *before* an edit, which is how a crop can fail to remove what it cropped. The full tour of what lives in there is in [the EXIF guide](https://abox.tools/guides/remove-exif-and-gps-data/).

The point that decides everything: the tags are *beside* the pixels, not inside them. A tool that decodes the image gets pixels and no tags; whatever it writes out contains only what it chooses to put back. A tool that edits the file without re-encoding can leave the tags untouched — or remove exactly them and nothing else.

## Why re-encoding strips, and copying keeps

Most browser-based image work happens on a canvas: decode the file to raw pixels, transform them, encode a fresh file. A canvas carries no tags, so the fresh file has none — not by policy but by construction. That is why the [Image Compressor](https://abox.tools/compress-image/) and the [Image Resizer](https://abox.tools/resize-image/) here produce output with no EXIF, no GPS and no XMP, and their pages say so: it is unavoidable, and worth knowing when you wanted the capture date kept.

A converter, by contrast, may go out of its way to preserve. The [HEIC to JPG converter](https://abox.tools/heic-to-jpg/) on this site does exactly that — it lifts the metadata block out of the HEIC container and installs it in the JPEG, dates, GPS and all, because a conversion is supposed to be the same photo in a different coat. (One tag is deliberately rewritten: orientation, so the image does not turn sideways; and the block only fits JPEG output — the format menu says so.) Two honest tools, opposite behaviours, each correct for its job — which is precisely why guessing from the kind of tool does not work.

Beyond the browser the picture is just as mixed, with the same logic underneath. Screenshots and exports are fresh encodes: no camera metadata. Messaging apps recompress aggressively, so photos sent as photos usually lose their tags — but the same file sent “as a document” travels byte for byte, tags included. Email attachments and cloud drives move files unchanged. The pattern holds: rebuilt means stripped, copied means kept.

## Checking instead of assuming

The check takes under a minute: open the output file — not the original — in the [EXIF Viewer & Remover](https://abox.tools/exif-editor/) and read what is there. It parses the file on your own machine and shows every tag, the embedded thumbnail included. Nothing there, nothing leaked. Still there, and you can see exactly what.

Three habits follow from everything above:

- **When the goal is privacy, remove deliberately.** Strip the tags with the EXIF tool — it edits the file without re-encoding, so the picture loses nothing — and then check the result. Do not rely on a resize that happens to strip as a side effect.
- **When the goal is keeping the record, convert with a tool that says it preserves** — and check that too, because “probably kept it” fails in the other direction: a photo archive with the dates cooked off is also a loss.
- **Check the file you actually send**, after the last step in your pipeline. Each tool in a chain makes its own decision, and only the final file's contents count.

And if the checking tool is itself a web page, the usual question applies to it — a metadata viewer receives your photo, GPS and all. The one here runs entirely in your browser with nothing sent anywhere, and [the guide on uploading](https://abox.tools/guides/is-it-safe-to-upload-files/) shows how to verify that claim rather than take it on faith.
