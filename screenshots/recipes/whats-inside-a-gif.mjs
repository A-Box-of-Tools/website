/**
 * What is inside a GIF: where the bytes went, and what the file says about
 * itself that a player never shows.
 */

export const tool = 'gif-analyzer';

export const helpers = {
  load: async (k) => {
    k.give(await k.gif({ frames: 12, width: 480, height: 320 }));
    await k.wait('#summary-card');
    await k.settle(1200);
  },
};

export const shots = [
  {
    // The facts: version, canvas, how many frames, how many colours, and
    // whether it loops. Everything a reader came to find out.
    name: 'facts',
    clip: '#summary-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // Where the bytes went, frame by frame. A GIF that is too big is almost
    // always too big for a reason this bar makes obvious.
    name: 'budget',
    clip: '#budget-card',
    run: async (k) => {
      await load(k);
      await k.settle(500);
    },
  },
];
