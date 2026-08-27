/**
 * Making a PDF smaller: finding out where the size actually is, and then
 * spending it.
 */

export const tool = 'compress-pdf';

export const helpers = {
  load: async (k) => {
    k.give(await k.pdf({ pages: 4, heading: 'Site survey', photo: true,
                         name: 'survey.pdf' }));
    await k.wait('#inventory-card');
    await k.settle(1600);
  },
};

export const shots = [
  {
    // Where the bytes are. Almost every large PDF is large because of the
    // pictures in it, and this card is the tool proving that before it touches
    // anything.
    name: 'inventory',
    clip: '#inventory-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // How hard to squeeze: the resolution and the quality, which together are
    // the whole trade this guide is about.
    name: 'settings',
    clip: '#settings-card',
    run: async (k) => {
      await load(k);
      await k.settle(500);
    },
  },
];
