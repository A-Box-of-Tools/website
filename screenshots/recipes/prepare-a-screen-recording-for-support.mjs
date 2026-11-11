// These are the reference guides' real-tool captures, kept together
// here so this workflow can be recaptured by name without copying setup.
import * as part0 from './trim-a-video.mjs';

export const helpers = { ...part0.helpers };
export const shots = [
  {
    ...part0.shots.find((shot) => shot.name === 'marks'),
    tool: 'trim-video',
    // One continuous section keeps the reproduction and result together.
    run: async (k) => {
      k.give(await k.video({ seconds: 24 }));
      await k.wait('#section-card');
      await mark(k, 3, 19);
      await k.seek('#preview', 5.4);
      await k.settle(600);
    },
  },
];
