/**
 * Making a QR code: what goes in it, and the two settings that decide whether
 * it scans off a printed page.
 */

export const tool = 'qr-barcode';

export const helpers = {
  load: async (k) => {
    await k.wait('#fields input, #fields textarea');
    await k.set('#fields input, #fields textarea', 'https://abox.tools/');
    await k.settle(800);
  },
};

export const shots = [
  {
    // The code itself, and the facts under it: the version, the error
    // correction level, and how much room is left before it has to grow.
    name: 'result',
    clip: '#result-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // Error correction and the quiet zone. Both are about a code surviving the
    // real world - a fold, a logo, a bad print - and both are here.
    name: 'options',
    clip: '#qr-options',
    run: async (k) => {
      await load(k);
      await k.settle(400);
    },
  },
];
