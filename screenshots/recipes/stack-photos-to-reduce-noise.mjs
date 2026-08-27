/**
 * Stacking photographs to cut noise: what the modes do, and what the stack
 * costs before it is run.
 */

export const tool = 'stack-images';

export const helpers = {
  load: async (k) => {
    const frames = [];
    // The same scene eight times with a different grain on each, which is what
    // a burst off a tripod is and the whole premise of averaging them.
    for (let i = 0; i < 8; i += 1) {
      frames.push(await k.photo(1600, 1100, { name: 'burst-' + (i + 1) + '.jpg', seed: 300 + i }));
    }
    k.give(frames);
    await k.wait('#frame-list li');
    await k.settle(900);
  },
};

export const shots = [
  {
    // The modes, and the plan under them: how much memory this will take and
    // how much of each file it has to read to do it.
    name: 'plan',
    clip: ['.card:has(#mode)', '#plan'],
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The result, with the note about how far each frame had to be moved to
    // line up - which is the part a reader will not believe without seeing.
    name: 'result',
    clip: '#result',
    run: async (k) => {
      await load(k);
      k.click('#run');
      await k.wait('#result-image');
      await k.settle(900);
    },
  },
];
