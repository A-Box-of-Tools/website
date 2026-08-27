/**
 * Trimming an audio file: reading the waveform, and the fade that hides a join.
 */

export const tool = 'trim-audio';

export const helpers = {
  load: async (k) => {
    k.give(k.audio({ seconds: 30 }));
    await k.wait('#section-card');
    await k.seek('#preview', 2.2);
    k.click('#mark-in');
    await k.seek('#preview', 12.4);
    k.click('#mark-out');
    await k.seek('#preview', 18);
    k.click('#mark-in');
    await k.seek('#preview', 26);
    k.click('#mark-out');
    await k.settle(700);
  },
};

export const shots = [
  {
    // Two pieces kept out of the middle of a recording. The gaps in the
    // waveform are where somebody stopped talking, which is what makes a
    // waveform worth looking at rather than a stopwatch.
    name: 'marks',
    clip: ['#timeline', '#segment-table'],
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The fade, and where it is applied - only at a join, which is the detail
    // the guide is careful about.
    name: 'export',
    clip: '#export-card',
    run: async (k) => {
      await load(k);
      await k.settle(400);
    },
  },
];
