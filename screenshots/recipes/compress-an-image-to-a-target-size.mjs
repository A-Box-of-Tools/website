/**
 * Compressing an image to a target size: the number somebody was handed, and
 * what the tool does to hit it.
 */

export const tool = 'compress-image';

export const helpers = {
  load: async (k) => {
    k.give(await k.photo(3000, 2000, { quality: 0.95 }));
    await k.wait('#target-card');
    await k.set('#target-value', '200');
    await k.settle(400);
  },
};

export const shots = [
  {
    // The target, set to the number somebody was given. The line under the
    // presets is the tool saying what it will try, before it tries it.
    name: 'target',
    clip: '#target-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // What came out, beside what went in. A guide about a target is a guide
    // about whether it was met, and this is the only place that says.
    name: 'results',
    clip: '#results',
    run: async (k) => {
      await load(k);
      k.click('#compress-all');
      await k.wait('#result-list li');
      await k.settle(700);
    },
  },
];
