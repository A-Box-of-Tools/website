/**
 * Reversing a video: what has to be decoded to do it, and what that costs.
 */

export const tool = 'reverse-video';

export const shots = [
  {
    // The clip as it arrived, with what the tool worked out about it. Reversing
    // is the one operation that cannot be streamed, and these facts are what
    // decide whether it will fit in memory.
    name: 'source',
    clip: '#source',
    run: async (k) => {
      k.give(await k.video({ seconds: 14 }));
      await k.wait('#source');
      await k.settle(700);
    },
  },
  {
    // What comes out, and the warning about sound: a reversed soundtrack is
    // rarely what anybody wanted, and this is where that decision is made.
    name: 'export',
    clip: '#export-card',
    run: async (k) => {
      k.give(await k.video({ seconds: 14 }));
      await k.wait('#export-card');
      await k.settle(700);
    },
  },
];
