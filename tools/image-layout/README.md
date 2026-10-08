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

At 100% zoom, contain shows the whole source and starts centred in the cell,
with background around it where the shapes differ. Cover starts with a centred crop
of the overflow; per-image pan and zoom let the visitor choose a different
framing.
There is no stretch mode: making a contact sheet does not warrant quietly
changing the proportions of the things being compared.

## Presets are starting points, and framing belongs to each image

`src/presets.js` holds six arrangements: square cells, a contact sheet,
horizontal and vertical strips, portrait cells, and a seamless grid. The
first preserves the original defaults. The contact sheet and strips start by
keeping the whole picture at 100% zoom; the portrait and seamless arrangements
fill their cells and crop the overflow. These are cell shapes rather than promises about the
finished image's aspect ratio, because an arbitrary number of pictures changes
its row count and height.

The module contains identifiers and settings rather than visitor-facing names.
The names and explanations live in the markup where they can be translated.
A preset applies layout and export defaults and leaves the filename and each
image's existing framing alone. Choosing a whole-image preset does not undo
a previous zoom; Reset all frames restores the starting fit when that is the
job the visitor wants.
After applying it, the same ordinary controls stay available for fine tuning;
the choices are conveniences rather than a separate kind of document.

Each image can be reframed with its own pan and zoom. Dragging changes the part
shown inside that image's cell; the position and zoom controls provide the same
adjustments by keyboard. The fit is the 100% baseline, with zoom available from
25% to 400%. Zooming out below 100% shrinks the picture inside its cell and
shows more background; zooming in enlarges it and can crop its edges. A reset
brings that image back to its starting position and 100% zoom.

Pan is available on each axis where the image and cell have different sizes.
For a larger image it selects which part is cropped; for a smaller image it
moves the picture through the unused space, bounded so the whole picture stays
inside the cell. A letterboxed picture therefore starts centred but can be
aligned toward an edge without changing its size.

The framing belongs to the image, so it moves with the tile when the list is
reordered. Preview and export use the same framing, and zoom never changes the
cell size or moves neighbouring images. Enlarging the source spends the detail
it already contains rather than adding any, which the guide says before the
visitor exports a tightly zoomed picture.

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
keeps them within a shared 8-megapixel preview budget so framing can update
without decoding on every pointer movement. Export opens each original at full
size, draws it into its planned rectangle, then closes it before opening the
next. That matters
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

Every source is drawn to an 8-bit SDR canvas. Scaling and cropping change
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
