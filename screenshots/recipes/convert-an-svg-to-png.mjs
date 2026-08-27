/**
 * Turning an SVG into a PNG: the one question a vector file cannot answer for
 * itself, which is how big.
 */

export const tool = 'svg-to-image';

export const helpers = {
  load: async (k) => {
    const drawing = [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 160" width="240" height="160">',
      '<rect width="240" height="160" rx="14" fill="#1f4f8a"/>',
      '<circle cx="72" cy="72" r="38" fill="#f2c98a"/>',
      '<path d="M20 140 L96 60 L150 140 Z" fill="#7bb0d8"/>',
      '<path d="M120 140 L176 78 L226 140 Z" fill="#cfe3f8"/>',
      '<text x="120" y="28" fill="#ffffff" font-family="Segoe UI, sans-serif"',
      ' font-size="16" text-anchor="middle">a vector drawing</text>',
      '</svg>',
    ].join('');
    k.give(k.file(drawing, 'drawing.svg', 'image/svg+xml'));
    await k.wait('#size-card');
    await k.set('#size-mode', 'width');
    await k.set('#size-width', '1024');
    await k.settle(500);
  },
};

export const shots = [
  {
    // The ways of saying how big, with the one that suits a logo filled in.
    name: 'size',
    clip: '#size-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The proof: the tool draws it at the size asked for and shows it at that
    // size before anything is saved.
    name: 'preview',
    clip: '#run-card',
    run: async (k) => {
      await load(k);
      await k.settle(700);
    },
  },
];
