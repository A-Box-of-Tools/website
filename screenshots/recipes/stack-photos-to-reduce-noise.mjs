/**
 * Stacking photographs to cut noise: what the modes do, and what the stack
 * costs before it is run.
 */

export const tool = 'stack-images';

export const helpers = {
  load: async (k) => {
    // The tool's own example keeps the scene fixed and changes only grain.
    // Varying k.photo's seed changes the ridges as well, which is movement
    // rather than noise and makes an average a misleading demonstration.
    k.click('#example-button');
    await k.wait('#run:not(:disabled)');
    await k.settle();
  },
};

export const shots = [
  {
    // The plan distinguishes stack decodes from inspection reads, so the
    // photograph shows both instead of implying the header count is all I/O.
    name: 'plan',
    clip: ['.card:has(#mode)', '#plan'],
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The viewer and alignment report let a reader check the result against
    // the chosen reference, rather than trusting a smaller noisy thumbnail.
    name: 'result',
    clip: '#result',
    run: async (k) => {
      await load(k);
      k.click('#run');
      const image = await k.wait('#result:not([hidden]) #result-image');
      await k.wait('#comparison-divider:not([hidden])');
      const reference = await k.wait('#reference-image');
      await Promise.all([image.decode(), reference.decode()]);
      await k.settle();
    },
  },
];
