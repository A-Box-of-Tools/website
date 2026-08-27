/**
 * Making a GIF from a folder of images: the delay on each frame, and the two
 * settings that decide what it weighs.
 */

export const tool = 'gif-maker';

export const helpers = {
  load: async (k) => {
    const frames = [];
    for (let i = 0; i < 5; i += 1) {
      frames.push(await k.photo(900, 600, { name: 'frame-' + (i + 1) + '.jpg', seed: 4 + i * 9 }));
    }
    k.give(frames);
    await k.wait('#frame-list li');
    await k.settle(600);
  },
};

export const shots = [
  {
    // The frames in order, each with its own delay. Setting them all at once is
    // the row above, and is what anybody with more than three frames wants.
    name: 'frames',
    clip: '.card:has(#frame-list)',
    run: async (k) => {
      await load(k);
      await k.set('#bulk-amount', '120');
      await k.settle(400);
    },
  },
  {
    // Colours and dithering, and the summary that says what they cost. A GIF
    // has 256 colours at the most, and this is where they are spent.
    name: 'colours',
    clip: ['.card:has(#colors)', '#summary'],
    run: async (k) => {
      await load(k);
      await k.settle(600);
    },
  },
];
