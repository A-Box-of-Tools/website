/**
 * Turning a long video into a time-lapse: the speed, and what it does to the
 * length and to how much of the file has to be read.
 */

export const tool = 'timelapse-video';

export const helpers = {
  load: async (k, speed) => {
    k.give(await k.video({ seconds: 30 }));
    await k.wait('#speed-card');
    await k.set('#speed', speed);
    await k.settle(600);
  },
};

export const shots = [
  {
    // The speed, and the two numbers it decides: how far apart the frames it
    // keeps are, and how long what comes out will run.
    name: 'speed',
    clip: '#speed-card',
    run: async (k) => {
      await load(k, '20');
    },
  },
  {
    // The summary, which is the sentence this whole tool exists to be able to
    // say: it reads a fraction of the file, and here is the fraction.
    name: 'summary',
    clip: '#export-card',
    run: async (k) => {
      await load(k, '20');
      await k.settle(500);
    },
  },
];
