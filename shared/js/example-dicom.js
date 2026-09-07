/**
 * A DICOM file, written in the page.
 *
 * /dicom-viewer/ is the hardest tool on the site to try, because almost nobody
 * has a .dcm to hand unless they have been given one - and somebody who has
 * been given one has been given a scan of a real person, which is the last
 * file anybody should be experimenting with on a website they are still
 * deciding whether to trust. So this one matters more than most.
 *
 * WHAT IT IS
 *
 * A single-frame CT slice: explicit VR, little endian, 16-bit signed pixels in
 * Hounsfield units through the usual rescale slope and intercept. The picture
 * is a phantom rather than anatomy - a body-shaped ellipse of soft tissue with
 * bone at the back, two lungs, and a small dense insert - because the point is
 * to exercise the viewer, and a viewer is exercised by the window: with the
 * right window the lungs are black and the bone is white, and with the wrong
 * one the whole slice is a grey smear. Real anatomy would demonstrate the same
 * thing while raising a question about whose anatomy it was.
 *
 * The patient tags are filled in with an obvious placeholder rather than left
 * out. A viewer that shows a header should be shown a header, and a file with
 * empty name and id fields would quietly skip the part of the page that
 * explains what a scan carries about the person in it.
 */

/** Rows and columns. Small enough to build quickly, large enough to read. */
const SIZE = 384;

/** The transfer syntax the file declares: explicit VR, little endian. */
const EXPLICIT_LE = '1.2.840.10008.1.2.1';

/** CT Image Storage. */
const CT_IMAGE = '1.2.840.10008.5.1.4.1.1.2';

const enc = new TextEncoder();

/** DICOM strings are even-length; the pad is a space, or NUL for UIDs. */
function padded(value, pad = ' ') {
  return value.length % 2 === 0 ? value : value + pad;
}

/**
 * One data element, explicit VR.
 *
 * The two-byte length form covers every VR used here; OB and OW take the long
 * form with two reserved bytes, which is why the pixel data is written apart
 * from this helper.
 */
function element(group, tag, vr, bytes) {
  const head = new Uint8Array(8);
  const view = new DataView(head.buffer);
  view.setUint16(0, group, true);
  view.setUint16(2, tag, true);
  head[4] = vr.charCodeAt(0);
  head[5] = vr.charCodeAt(1);
  view.setUint16(6, bytes.length, true);
  return [head, bytes];
}

const str = (group, tag, vr, value) => element(group, tag, vr, enc.encode(padded(value, vr === 'UI' ? '\0' : ' ')));

function us(group, tag, value) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, value, true);
  return element(group, tag, 'US', b);
}

function ss(group, tag, value) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setInt16(0, value, true);
  return element(group, tag, 'SS', b);
}

/**
 * Draw the phantom, in Hounsfield units.
 *
 * Air is -1000, lung about -750, fat -90, soft tissue around 40, and cortical
 * bone 1000 and up. Those are the numbers the window presets on the page are
 * built around, so a slice made of them lands where the presets expect.
 */
function phantom() {
  const pixels = new Int16Array(SIZE * SIZE);
  const cx = SIZE / 2;
  const cy = SIZE / 2;

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const nx = (x - cx) / (SIZE * 0.42);
      const ny = (y - cy) / (SIZE * 0.32);
      const r = nx * nx + ny * ny;

      let hu = -1000;                                   // air, outside the body
      if (r <= 1) {
        hu = 40;                                        // soft tissue
        // A rind of fat just inside the skin.
        if (r > 0.86) hu = -90;
        // Two lungs.
        for (const side of [-1, 1]) {
          const lx = (x - (cx + side * SIZE * 0.16)) / (SIZE * 0.13);
          const ly = (y - (cy - SIZE * 0.02)) / (SIZE * 0.17);
          if (lx * lx + ly * ly < 1) hu = -750;
        }
        // The spine, at the back, and two ribs at the sides.
        const sx = (x - cx) / (SIZE * 0.05);
        const sy = (y - (cy + SIZE * 0.20)) / (SIZE * 0.05);
        if (sx * sx + sy * sy < 1) hu = 1100;
        for (const side of [-1, 1]) {
          const bx = (x - (cx + side * SIZE * 0.36)) / (SIZE * 0.02);
          const by = (y - cy) / (SIZE * 0.14);
          if (bx * bx + by * by < 1) hu = 900;
        }
        // A small dense insert, the thing a window is adjusted to look at.
        const dx = (x - (cx + SIZE * 0.10)) / (SIZE * 0.03);
        const dy = (y - (cy + SIZE * 0.06)) / (SIZE * 0.03);
        if (dx * dx + dy * dy < 1) hu = 350;
      }

      // A little noise, because a scan has some and a viewer's window is
      // judged partly on how it handles it.
      pixels[y * SIZE + x] = hu + ((x * 7 + y * 13) % 11) - 5;
    }
  }
  return pixels;
}

/**
 * Build the file.
 *
 * @param {string} name
 * @returns {File}
 */
export function exampleDicomFile(name = 'example.dcm') {
  const pixels = phantom();
  const pixelBytes = new Uint8Array(pixels.buffer);

  const meta = [
    ...str(0x0002, 0x0002, 'UI', CT_IMAGE),
    ...str(0x0002, 0x0003, 'UI', '1.2.826.0.1.3680043.8.498.1'),
    ...str(0x0002, 0x0010, 'UI', EXPLICIT_LE),
    ...str(0x0002, 0x0012, 'UI', '1.2.826.0.1.3680043.8.498.2'),
  ];
  const metaBytes = meta.reduce((n, part) => n + part.length, 0);

  const groupLength = new Uint8Array(4);
  new DataView(groupLength.buffer).setUint32(0, metaBytes, true);

  const body = [
    // Patient and study. An obvious placeholder rather than nothing: a viewer
    // that shows a header should be given one to show.
    ...str(0x0008, 0x0020, 'DA', '20260214'),
    ...str(0x0008, 0x0030, 'TM', '164107'),
    ...str(0x0008, 0x0060, 'CS', 'CT'),
    ...str(0x0008, 0x0070, 'LO', 'abox.tools'),
    ...str(0x0008, 0x1030, 'LO', 'EXAMPLE STUDY'),
    ...str(0x0008, 0x103e, 'LO', 'EXAMPLE SERIES'),
    ...str(0x0010, 0x0010, 'PN', 'EXAMPLE^PHANTOM'),
    ...str(0x0010, 0x0020, 'LO', 'EXAMPLE-0001'),
    ...str(0x0010, 0x0040, 'CS', 'O'),
    ...str(0x0020, 0x000d, 'UI', '1.2.826.0.1.3680043.8.498.3'),
    ...str(0x0020, 0x000e, 'UI', '1.2.826.0.1.3680043.8.498.4'),
    ...str(0x0020, 0x0013, 'IS', '1'),

    // The image itself.
    ...us(0x0028, 0x0002, 1),                    // samples per pixel
    ...str(0x0028, 0x0004, 'CS', 'MONOCHROME2'),
    ...us(0x0028, 0x0010, SIZE),                 // rows
    ...us(0x0028, 0x0011, SIZE),                 // columns
    ...str(0x0028, 0x0030, 'DS', '0.68\\0.68'),  // pixel spacing, mm
    ...us(0x0028, 0x0100, 16),                   // bits allocated
    ...us(0x0028, 0x0101, 16),                   // bits stored
    ...us(0x0028, 0x0102, 15),                   // high bit
    ...us(0x0028, 0x0103, 1),                    // signed
    ...str(0x0028, 0x1050, 'DS', '40'),          // window centre
    ...str(0x0028, 0x1051, 'DS', '400'),         // window width
    ...str(0x0028, 0x1052, 'DS', '0'),           // rescale intercept
    ...str(0x0028, 0x1053, 'DS', '1'),           // rescale slope
    ...str(0x0028, 0x1054, 'LO', 'HU'),
  ];

  // Pixel data is OW, which takes the long length form: two reserved bytes and
  // a four-byte length. That is why it is not written through `element`.
  const pixelHead = new Uint8Array(12);
  const ph = new DataView(pixelHead.buffer);
  ph.setUint16(0, 0x7fe0, true);
  ph.setUint16(2, 0x0010, true);
  pixelHead[4] = 'O'.charCodeAt(0);
  pixelHead[5] = 'W'.charCodeAt(0);
  ph.setUint16(6, 0, true);                      // reserved
  ph.setUint32(8, pixelBytes.length, true);

  const parts = [
    new Uint8Array(128),                         // the preamble, all zero
    enc.encode('DICM'),
    ...element(0x0002, 0x0000, 'UL', groupLength),
    ...meta,
    ...body,
    pixelHead,
    pixelBytes,
  ];

  return new File(parts, name, { type: 'application/dicom', lastModified: Date.now() });
}
