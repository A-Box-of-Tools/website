/**
 * Cleaning up a voice memo: what the tool can tell you about the recording,
 * and the two dials worth moving.
 */

export const tool = 'edit-audio';

export const helpers = {
  load: async (k) => {
    k.give(k.audio({ seconds: 34 }));
    await k.wait('#edit-card');
    await k.settle(900);
  },
};

export const shots = [
  {
    // The recording as it arrived: its length, its format, and how close to
    // clipping the loudest moment is. That last number is the one that decides
    // whether turning it up is safe.
    name: 'source',
    clip: '#source',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // Speed and volume, and the summary that says what they will do. Speeding
    // up a memo without moving the pitch is the trick most people are after.
    name: 'edit',
    clip: '#edit-card',
    run: async (k) => {
      await load(k);
      await k.set('#speed', '1.25');
      await k.set('#volume', '4');
      await k.settle(600);
    },
  },
];
