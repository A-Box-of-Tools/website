# The picture the web saved, and the format everything still takes

Right-click a picture on almost any website today and you get a `.webp` — a format your browser reads perfectly and a great deal of other software still refuses. This is what it is, what converting costs, and why the JPEG usually comes out bigger.

[打开WebP to JPG](https://abox.tools/zh/webp-to-jpg/): The pictures the web saves, in the format everything still takes.

最后更新 17 September 2026

## The short answer

Open the [WebP to JPG converter](https://abox.tools/zh/webp-to-jpg/), drop the files in, and press “Convert”. Leave the quality slider at 92 unless you have a reason to move it. You get JPEGs back, one download button each, or a zip if there are several.

Nothing is uploaded while you do it, because nothing needs to be. That is the part worth understanding, and it is the same reason the job is so quick: the decoder is already in your browser.

## Why you have a .webp at all

WebP is Google's picture format, and websites use it because it is substantially smaller than a JPEG at the same visible quality — commonly a quarter to a third off, sometimes more. For a site serving millions of images that is a real saving in bandwidth and load time, so over the last few years most large sites switched.

Which means that when you right-click and save a picture, what lands in your downloads folder is whatever the site was serving. You did not choose WebP. You just saved a picture.

And then it will not go where you want it to go. The usual walls:

- upload forms that check the extension against a list written years ago;
- older versions of Word, PowerPoint and Photoshop;
- most e-readers, and a lot of printer and camera software;
- the occasional print shop, which will take a JPEG or a TIFF and nothing else.

Your browser, meanwhile, opens it without complaint — every browser has read WebP since 2020. That gap between what a browser can do and what everything else can do is the whole reason this page exists.

## The JPG will probably be bigger. That is not a fault

This surprises people, and it is worth saying plainly before you convert anything: a 300 KB WebP will often become a 450 KB JPEG. Nothing has gone wrong.

WebP is simply a better codec than JPEG. JPEG was finished in 1992; WebP arrived in 2010 with twenty years of additional research in it. When you convert from the newer format to the older one, you are asking a less capable compressor to describe the same picture, and it needs more bytes to do it. You are trading size for compatibility, which is a perfectly good trade when the thing at the other end will not take a WebP — but it is a trade, and a converter that hid it would be lying to you.

If the size matters afterwards, the [Image Compressor](https://abox.tools/zh/compress-image/) takes a JPEG down to a figure you name, and the tool offers it on the row under your result so you do not have to go looking.

## Transparency has to go somewhere

This is the one that catches people out, and it is the reason logos come out of other converters with a black box behind them.

A WebP can be transparent. A JPEG cannot — there is no alpha channel in the format, so there is no way to record “nothing is here”. Something has to be painted behind the picture, and the only question is what. Converters that never ask are not preserving your transparency; they are choosing for you, and the default a lot of them fall into is black.

The [converter here](https://abox.tools/zh/webp-to-jpg/) asks, defaults to white, and — importantly — only asks when a file on your list actually has transparency in it. That is checked by looking at the decoded picture rather than at the format, because plenty of WebPs carry an alpha channel that is solid from corner to corner, and a colour picker that changes nothing is worse than no colour picker.

If what you actually need is the transparency kept, do not convert to JPEG at all. Keep the WebP, or turn it into a PNG with the [Image Compressor](https://abox.tools/zh/compress-image/), which reads WebP and writes PNG.

## Animated WebP gives you one frame

A WebP can hold an animation, the way a GIF does. A JPEG holds exactly one picture, so there is nothing else a converter could do with the rest of the frames.

The tool tells you before you press anything — the row says the file is animated — and again on the result. What you get is the first frame. If you wanted the animation as something that plays, the route is to a video rather than to a still: see [converting a GIF to MP4](https://abox.tools/zh/guides/convert-a-gif-to-mp4/) for what that involves.

## The picture is re-compressed, and there is no way round it

WebP and JPEG are different codecs. There is no clever repackaging that turns one into the other; the picture has to be decoded to pixels and encoded again. Every WebP-to-JPG converter does this, including the ones that ask you to upload.

What you control is how much it costs. The slider defaults to 92, which is the setting at which a photograph is very hard to tell from the original. Below about 75 you start to see it around hard edges and text.

One case is worth knowing about: a **lossless** WebP. Those exist — they are what design tools write for flat graphics — and the JPEG made from one is the first lossy copy that picture has ever had. The tool marks a lossless file on the list so that is a decision rather than a surprise.

## The metadata does not come along

Converting through a browser canvas means the picture arrives as pixels and nothing else, so EXIF, GPS coordinates, colour profiles and any copyright block are left behind.

For most people converting a picture to send somewhere, that is the outcome they wanted anyway. If it is not — or if you want to see what a file is carrying before you decide — the [EXIF Viewer & Remover](https://abox.tools/zh/exif-editor/) reads and writes that data without re-compressing the picture. There is a longer answer in [does converting a photo remove its metadata](https://abox.tools/zh/guides/does-converting-a-photo-remove-its-metadata/).

## Why this one does not ask you to upload

Search for a WebP converter and nearly every result wants the file sent to a server. It is worth asking what the server is for, because in this case the answer is: nothing.

Reading a WebP needs a WebP decoder, and your browser has had one since 2020 — it is how the picture displayed on the website you saved it from. Writing a JPEG needs a JPEG encoder, and every browser has had one of those for as long as there have been browsers. Both halves of the job are already installed on your machine. A site that uploads your file is using its own copy of software you already own, and is holding your picture while it does.

That is not always true of conversion. The [HEIC converter](https://abox.tools/zh/guides/convert-heic-to-jpg/) genuinely does need a decoder your browser does not have, which is why that page ships one and says so at length. The honest position differs per format, and the useful question to ask of any converter is which case you are in. There is a general version of that question in [is it safe to upload files](https://abox.tools/zh/guides/is-it-safe-to-upload-files/).
