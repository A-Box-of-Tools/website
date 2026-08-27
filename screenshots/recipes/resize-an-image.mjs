/**
 * How to resize an image without wrecking it.
 *
 * `run` is serialised and evaluated in the tool's page, so it has to be an
 * arrow function and it can only reach what the browser has: `k` is the helper
 * object from inpage.js, and nothing from this file crosses over.
 */

export const tool = 'resize-image';

export const shots = [
  {
    // One number, and the other left blank - the thing the guide opens with.
    name: 'one-number',
    clip: '#resize-card',
    run: async (k) => {
      k.give(await k.photo(2400, 1600));
      await k.wait('#resize-card');
      await k.set('#size-w', '1920');
      await k.settle();
    },
  },
  {
    // Both sides given, so the fit menu appears with them: this is the choice
    // the longest section of the guide is about.
    name: 'fit',
    clip: ['#pixels-fields', '#size-summary'],
    run: async (k) => {
      k.give(await k.photo(2400, 1600));
      await k.wait('#resize-card');
      await k.set('#size-w', '1200');
      await k.set('#size-h', '1200');
      await k.settle();
    },
  },
];
