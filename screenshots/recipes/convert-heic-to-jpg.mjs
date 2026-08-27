/**
 * Converting HEIC to JPEG: what to ask for on the way out, and the metadata
 * question nobody expects.
 *
 * A HEIC cannot be made in a browser - there is no encoder for it - so the tool
 * is photographed with a JPEG in it. Everything these two cards show is the
 * same either way: they are about what comes out, not what went in.
 */

export const tool = 'heic-to-jpg';

export const helpers = {
  load: async (k) => {
    k.give(await k.photo(3000, 2000, { name: 'IMG_0421.jpg' }));
    await k.wait('#options-card');
    await k.settle(900);
  },
};

export const shots = [
  {
    // Format and quality, and the switch that decides whether the date and the
    // place the picture was taken come across with it.
    name: 'options',
    clip: '#options-card',
    run: async (k) => {
      await load(k);
    },
  },
];
