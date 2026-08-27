/**
 * Making a favicon: the sizes that go inside the file, and what the smallest
 * one actually looks like.
 */

export const tool = 'image-to-ico';

export const shots = [
  {
    // What the icon is for, which is what decides the set of sizes inside it.
    name: 'preset',
    clip: ['#preset-list', '#size-summary'],
    run: async (k) => {
      k.give(await k.png(512, 512, { name: 'mark.png' }));
      await k.wait('#preset-card');
      await k.settle(500);
    },
  },
  {
    // The reason this tool draws a preview at all: a mark that reads at 512
    // pixels can be a smudge at 16, and this is where that is found out.
    name: 'sizes',
    clip: '#run-card',
    run: async (k) => {
      k.give(await k.png(512, 512, { name: 'mark.png' }));
      await k.wait('#preview-strip');
      await k.settle(800);
    },
  },
];
