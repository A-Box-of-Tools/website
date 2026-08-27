/**
 * Turning a folder of images into a video: how long each one is on screen, and
 * what the frame rate has to do with it.
 */

export const tool = 'images-to-video';

export const helpers = {
  load: async (k) => {
    const frames = [];
    for (let i = 0; i < 6; i += 1) {
      frames.push(await k.photo(1600, 900, { name: 'shot-' + (i + 1) + '.jpg', seed: 11 + i * 7 }));
    }
    k.give(frames);
    await k.wait('#image-list li');
    await k.settle(600);
  },
};

export const shots = [
  {
    // The list, in the order they will play, with the seconds each one holds.
    name: 'order',
    clip: '.card:has(#image-list)',
    run: async (k) => {
      await load(k);
      await k.set('#bulk-amount', '2');
      k.click('#apply-bulk');
      await k.settle(500);
    },
  },
  {
    // What it adds up to. The summary answers "how long will this be", which is
    // the question the two settings above are really asking.
    name: 'summary',
    clip: ['.card:has(#resolution)', '#summary'],
    run: async (k) => {
      await load(k);
      await k.settle(700);
    },
  },
];
