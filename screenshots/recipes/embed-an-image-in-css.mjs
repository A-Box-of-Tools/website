/**
 * Embedding an image in CSS: the data URI, and the size it costs.
 */

export const tool = 'image-to-data-uri';

export const shots = [
  {
    // Where it is going decides what comes out - a CSS rule, an <img> tag, or
    // the bare URI - and that is the whole of this card.
    name: 'shape',
    clip: '#shape-card',
    run: async (k) => {
      k.give(await k.png(96, 96, { name: 'badge.png' }));
      await k.wait('#shape-card');
      await k.settle(500);
    },
  },
  {
    // The result, with the number that decides whether this was a good idea at
    // all: base64 is a third bigger than the file it was made from.
    name: 'output',
    clip: '#output-card',
    run: async (k) => {
      k.give(await k.png(96, 96, { name: 'badge.png' }));
      await k.wait('#result-list');
      await k.settle(600);
    },
  },
];
