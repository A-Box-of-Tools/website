# Image Layout

*Put your pictures together. Keep them on your machine.* · lives at `/image-layout/` · [all tools](../) · [how the site is built](../../README.md)

This tool turns several images into one still picture: a regular grid for a
collage or contact sheet, a horizontal strip for a comparison, or a vertical
strip for a sequence of screenshots. It does not blend the pictures together
as Image Stacker does, and does not put them on separate PDF pages. The job
here is deciding which rectangle each picture occupies on one canvas.

## One plan for the preview and the export

`src/arrange.js` works out the output size and every cell from the selected
layout, output width, column count, cell shape, gap and outer padding. Both the
live preview and the full-size export use that geometry. A preview with its own
CSS layout would be easy to write, and could silently disagree with the result
once integer rounding and several gaps had been accounted for.

A grid uses equal cells. Square, landscape and portrait shapes give a fixed
frame; a horizontal or vertical strip can also use each image's original
proportions. Original proportions mean a common height across a horizontal
strip and a common width down a vertical strip, rather than distortion to make
different-shaped sources occupy identical rectangles.

Contain shows the whole source, centred in the cell, with background around it
where the shapes differ. Cover fills the cell by centre-cropping the overflow.
There is no stretch mode: making a contact sheet does not warrant quietly
changing the proportions of the things being compared.

## Keep source pixels available without keeping every source open

[`shared/js/image-list.js`](../../shared/js/image-list.js) decodes a file once
to measure it and make a thumbnail, then closes the full-size bitmap. Items
retain their `File`, dimensions and small thumbnail, with natural name sorting,
reordering and explicit release of the thumbnail URLs supplied by the same
shared part. The file gate comes from
[`shared/js/image-input.js`](../../shared/js/image-input.js), so a `.avif` with
an empty operating-system MIME type can still reach the decoder.

The list thumbnails are JPEGs, so the canvas preview does not use them: doing
so would flatten transparency before the visitor had chosen a background. It
instead decodes smaller bitmaps from the original files, preserving alpha, and
draws them one at a time. Export opens each original at full size, draws it into
its planned rectangle, then closes it before opening the next. That matters
for a folder of phone photos: holding all their decoded RGBA pixels would use
gigabytes before the output canvas had even been allocated. EXIF orientation
is honoured by the browser decode.

`src/main.js` owns the list and control state, drag ordering and accessible
arrow buttons, cancellation, the preview and result URLs. Changing a setting
invalidates the previous result so an old download cannot claim to represent
newly selected gaps or a new order.

## A format is checked rather than assumed

The page writes PNG, JPEG and WebP using the browser's own encoders through
[`shared/js/image-convert.js`](../../shared/js/image-convert.js). WebP is
probed before it is offered, and the real output's MIME type is checked as
well. A canvas that cannot write an asked-for format may return PNG instead;
renaming that blob `.webp` would make the export wrong even though its pixels
looked correct in the page.

PNG and WebP permit transparency, which leaves the gaps, padding and any
transparent source pixels transparent when requested. JPEG always has a solid
background. Its quality control and WebP's quality control apply to the new
combined image, rather than trying to retain each source's encoding settings.

The output is limited to 8192 pixels on either side and 32 megapixels overall.
The side limit catches long strips, which a pixel-count limit alone would
miss. These are conservative allocation bounds rather than a guarantee that a
browser will spare the memory: one very large source can still fail to decode.
Cancellation is checked between pictures, because the browser's current decode
or encode cannot be interrupted by this page.

## The output is a new image, not a container for the originals

Every source is drawn to an 8-bit SDR canvas. Scaling and centre-cropping change
the pixels, JPEG and WebP may add compression loss, and colour, HDR or partly
transparent channel values can change in the browser's canvas conversion.
PNG is lossless relative to the finished canvas rather than an archival copy
of the input files. EXIF, GPS, camera and date tags are not copied into the
result, and animated inputs contribute only the first decoded frame. These
limits belong in the FAQ because a visitor should know them before using the
layout as a preserved copy.

## No network feature

The inputs are local files, the thumbnails and result use object URLs, and
`src/example.js` draws the worked example in the page using the shared example
photograph. Nothing is fetched for an import, a preview or an export. There is
no carry-on row and no CSP extension, including no `blob:` allowance under
`connect-src`; object URLs used as image sources rely on the site's existing
`img-src` policy.

The guide is [`arrange-images`](../../pages/guides/arrange-images/). Its
screenshot is captured from the built tool by the guide harness, rather than
drawn from a separate design.
