/**
 * Redacting an image: covering something over, and the difference between
 * covering it and removing it.
 */

export const tool = 'redact-image';

export const helpers = {
  load: async (k) => {
    k.give(await k.photo(1800, 1200, { name: 'screenshot.jpg' }));
    await k.wait('#edit-card');
    await k.settle(900);
    k.click('#add-box');
    await k.settle(400);
  },
};

export const shots = [
  {
    // A box over the part that should not be seen, and the choice of what to
    // put in it. A blur is reversible often enough to be worth warning about,
    // which is what the note under the styles is for.
    name: 'cover',
    clip: ['#stage', '#box-summary'],
    run: async (k) => {
      await load(k);
    },
  },
  {
    // Saving, which is the step that makes it real: the covered pixels are
    // gone from the file that comes out rather than hidden inside it.
    name: 'save',
    clip: '#save-card',
    run: async (k) => {
      await load(k);
      await k.settle(400);
    },
  },
];
