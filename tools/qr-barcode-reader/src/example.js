/**
 * The picture behind the "Try an example" button.
 *
 * A QR code made by this site's own generator - shared/js/qr.js, the same
 * module /qr-barcode/ writes codes with - drawn onto a canvas with a quiet
 * margin around it. So the reader is being shown a code the writer produced,
 * which is the one pairing where a disagreement between the two would show up
 * immediately rather than in somebody's scanner.
 *
 * It carries a plain URL because that is what people point this at, and
 * because the page's whole argument is about what it does NOT do with one: the
 * link is shown, and never opened.
 */

import { makeQr } from './shared/qr.js';

const TEXT = 'https://abox.tools/qr-barcode-reader/';

export function makeExample() {
  const qr = makeQr(TEXT, { level: 'M' });
  const quiet = 4;
  const scale = 8;
  const side = (qr.size + quiet * 2) * scale;

  const canvas = document.createElement('canvas');
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, side, side);
  ctx.fillStyle = '#000000';
  for (let y = 0; y < qr.size; y += 1) {
    for (let x = 0; x < qr.size; x += 1) {
      if (qr.modules[y * qr.size + x]) {
        ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      }
    }
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob
        ? resolve(new File([blob], 'example-qr.png', { type: 'image/png' }))
        : reject(new Error('encode'))),
      'image/png',
    );
  });
}
