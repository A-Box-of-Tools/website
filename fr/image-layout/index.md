# Image Layout — collage and contact sheet maker

Put your pictures together. Keep them on your machine.

> Arrange images in a grid or strip with ready-to-use presets. Adjust each picture with pan and zoom, then save one PNG, JPEG or WebP. Free, offline and no upload.

Cette page est un outil interactif qui fonctionne entièrement dans votre navigateur, à l'adresse https://abox.tools/fr/image-layout/ — rien de ce que vous lui confiez n'est envoyé. Ce qui suit est tout ce que la page dit de l'outil, en mots ; pour l'utiliser, ouvrez l'adresse.

## Cet outil n'envoie **jamais** vos images. Il n'y a pas de serveur.

Your images are read, arranged and written by your own browser, using the canvas and image encoders it already has. This tool has no network feature of its own: no upload, no remote image import, and no codec to fetch.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source
- ✓ Files stay on your device

## How to arrange multiple images into one picture

1. **Choose your pictures.** Drop several images onto the picker, or browse for them. The tiles show what the browser could open. The example makes pictures on this page if you want to try the controls first.
2. **Put them in order.** Drag a tile to move it, or use its arrow buttons. Remove a picture that does not belong. The order runs across each row of a grid, from left to right in a horizontal strip, and from top to bottom in a vertical one.
3. **Start with a preset, then set the spacing.** Choose square cells, a contact sheet, a strip, portrait cells or a seamless grid. Adjust the output width, grid columns, cell shape, gap and outer margin. Presets keep your filename and each picture's existing framing.
4. **Adjust the picture inside each frame.** Select a picture in the preview or choose it from Frame. Drag to pan, or use Horizontal position, Vertical position and Zoom. Zoom out below 100% to show more background, or zoom in to enlarge and crop. At 100% zoom, “Fit whole image” keeps every edge; “Fill box (crop edges)” starts with a centred crop. Reset this frame restores the selected picture, and Reset all frames restores every picture's starting fit.
5. **Check the preview, then save one image.** The preview shows the arrangement and crop used by the download. Choose PNG, JPEG or WebP, set a background or transparency where the format permits it, and create the image. Export draws from the original files at the output size.

## La version longue

[How to arrange multiple images into one picture](https://abox.tools/fr/guides/arrange-images/): Make a collage, contact sheet or image strip: choose a grid, keep pictures whole or crop to fill, set the spacing and save a PNG, JPEG or WebP without uploading.

## Questions

### Are my images uploaded anywhere?

No. Reading, arranging and exporting happen in your browser on your own machine. This tool adds no network feature to the page, and the files, thumbnails and names are never handed to the advertising or measurement scripts. It also works with the network disconnected after loading.

### Can I make a collage, a contact sheet or a strip?

Yes. A grid puts the pictures into equal cells with the column count you choose. A horizontal strip places them side by side; a vertical strip places them one above another. Drag the tiles or use their arrow buttons to change the order. This makes one flat image rather than an editable design document.

### Which presets can I start from?

Choose a square collage, a three-column contact sheet, a side-by-side strip, a vertical strip, a portrait collage or a seamless collage with no gaps. They set layout and export controls, which you can still adjust. A preset keeps your filename and each picture's pan and zoom. The complete image's shape depends on the number of pictures; square cells do not promise a square output.

### How do I keep the whole of every picture?

Choose “Fit whole image” and use “Reset all frames” to return every picture to 100% zoom and its starting position. Each source then fits inside its cell, with background wherever the shapes differ. A strip's “Keep original shapes (strips)” option gives each picture a cell with its own proportions, so there is no crop or extra space at 100% zoom. Choosing a preset keeps existing framing; resetting the frames is what undoes a previous zoom.

### Can I move or zoom one picture without changing its neighbours?

Yes. Select its frame in the preview or the Frame menu, then drag to pan, use the position controls, or adjust Zoom from 25% to 400%. The selected fit is the 100% baseline. Zooming out below 100% shrinks the picture and shows more background; zooming in enlarges it and can crop its edges. Panning is available on an axis when the picture and frame have different sizes. A larger picture can move to choose its crop; a smaller picture can move within the unused space while staying wholly inside the frame. “Fill box (crop edges)” starts with a centred crop, and you can move it to keep the subject in view. The framing stays with the picture when you reorder it. Reset this frame restores its starting position and 100% zoom; Reset all frames restores every picture. Zoom cannot add detail that the original does not contain.

### Can the gaps and background be transparent?

Yes, when you choose PNG or WebP and turn on transparency. That also preserves see-through parts of the input pictures. JPEG has no alpha channel, so it always uses a solid background. The background colour also fills the space around a picture shown whole in a cell.

### Which formats can I use?

The input must be an image your browser can decode, including JPEG, PNG, WebP, GIF, BMP, AVIF and supported SVG files. HEIC support depends on your browser; [HEIC to JPG](https://abox.tools/fr/convertir-heic-en-jpg/) can convert one first. Output is PNG, JPEG or WebP. If the browser cannot write WebP, that choice is disabled rather than saving a PNG with a WebP extension.

### Does it keep an animation?

No. This is a still-image layout. An animated GIF, WebP or AVIF is reduced to the first frame the browser decodes. To arrange separate frames from a GIF, extract them first with [GIF Splitter](https://abox.tools/fr/decouper-un-gif-en-images/).

### Does the preview use the full-resolution pictures?

The live preview uses small copies so changing a gap or column count stays quick. Export uses the original files. Both use the same layout geometry, but fine detail should be checked in the finished file, especially when a small source is enlarged.

### What are the size limits?

The finished canvas is limited to 8192 pixels on either side and 32 megapixels in total. A tall strip can reach the height limit even when its width is small. Reduce the output width, use more grid columns, or split the pictures into several layouts if the page reports a limit. Your browser can still run out of memory below those limits with very large source files; export opens one full-size picture at a time.

### Will the picture quality, colours and metadata stay the same?

This makes a new image by drawing your pictures onto a browser canvas. Resizing or cropping changes the pixels, and JPEG or WebP compression can lose detail. PNG keeps the pixels of the finished canvas, which is not the same as preserving the original files. The canvas makes an 8-bit SDR image, so wide-gamut colour, HDR and partly transparent colours may change. Source EXIF, GPS, date and camera tags are not copied. Keep the originals if you need an archival copy.

### Is it free, and does it work offline?

It is free, with no account, trial or watermark. Load the page once, then disconnect and the arrangement and export still work. Advertising pays for the site; it is not given anything about your pictures.

## Comment cette promesse se vérifie

- **The pictures stay here.** Your browser reads the files you choose and draws the combined picture in memory. This tool has no network feature and no endpoint to receive your files. The page's `Content-Security-Policy` names the addresses it may contact; your pictures, their names and their thumbnails are never handed to them.
- **The layout is made by this page.** There is no image service behind the preview and no remote renderer behind the download. The same rectangles decide where the pictures land in both, and the browser's own encoder turns the finished canvas into a PNG, JPEG or WebP.
- **The original files are left alone.** A layout is a new image. The files you picked stay as they were; no edited copy is written over them. Source EXIF, GPS, camera and date tags are not copied into the layout, because it is made from pixels rather than from the original file containers.
- **What Google loads, and what it is not given.** The page's advertising and measurement scripts come from Google. Neither is given your images, their names, their dimensions, their number, or anything drawn from them. The code that reads and arranges a picture is served from this origin.
- **What the donate button loads, and what it is not given.** The “Buy me a coffee” button is drawn by a script from cdnjs.buymeacoffee.com and letters itself from Google Fonts. It is a link, and it is handed nothing about your pictures. Clicking it opens the service's own page.
- **Disconnect and check.** After the page has loaded, it can import, preview and export with the network disconnected. The example is drawn in the page too; it is never downloaded from somewhere else.

**Vérifiez vous-même.** Rien de ce qui précède n'est à croire sur parole. Cette page est produite à partir des gabarits et de la configuration du dépôt par un script de compilation que vous pouvez lire et exécuter vous-même, et le résultat est publié sur la branche `dist`, ce qui vous permet de comparer ce qui est servi avec ce que produit une compilation des sources : https://github.com/A-Box-of-Tools/website

Les fichiers à lire en premier sont `config/site.toml` pour la Content-Security-Policy, `src/arrange.js` for the geometry shared by the preview and export, `src/shared/image-list.js` for how the chosen pictures are read, and `src/shared/image-convert.js` for the browser's encoder and the check that it wrote the format you asked for.
