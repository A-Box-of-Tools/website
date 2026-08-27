/**
 * Getting photographs ready for the web: the long edge first, the quality
 * second. Two tools, in that order, which is the point of the guide.
 */

export const shots = [
  {
    tool: 'resize-image',
    name: 'long-edge',
    clip: '#resize-card',
    run: async (k) => {
      const shots = [];
      for (let i = 0; i < 3; i += 1) {
        shots.push(await k.photo(4000, 3000, { name: 'DSC_010' + i + '.jpg', seed: 30 + i * 6 }));
      }
      k.give(shots);
      await k.wait('#resize-card');
      // The long edge, which is the one setting that treats a portrait and a
      // landscape photograph the same way.
      await k.set('#resize-mode', 'longest');
      await k.set('#size-longest', '1600');
      await k.settle(700);
    },
  },
  {
    tool: 'compress-image',
    name: 'quality',
    clip: '#results',
    run: async (k) => {
      const shots = [];
      for (let i = 0; i < 3; i += 1) {
        shots.push(await k.photo(1600, 1200, { name: 'DSC_010' + i + '.jpg', seed: 30 + i * 6 }));
      }
      k.give(shots);
      await k.wait('#target-card');
      await k.set('#target-value', '150');
      await k.settle(400);
      k.click('#compress-all');
      await k.wait('#result-list li');
      await k.settle(900);
    },
  },
];
