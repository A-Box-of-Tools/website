/**
 * A passport photograph: the rules for the country, and the checks against
 * them.
 *
 * No face is photographed here and none is invented. The tool is shown with the
 * rulebook open, which is the half a reader cannot get anywhere else - the
 * millimetres, the head height, and where those numbers came from.
 */

export const tool = 'id-photo';

export const shots = [
  {
    // The specification: size, head height, background, and the note saying
    // which authority published it and when it was read.
    name: 'spec',
    clip: '#spec-card',
    run: async (k) => {
      await k.wait('#spec');
      await k.set('#spec', 'us-passport');
      await k.settle(900);
    },
  },
];
