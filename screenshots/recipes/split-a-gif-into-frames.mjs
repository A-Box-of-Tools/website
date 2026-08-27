/**
 * Splitting a GIF into frames: the frames themselves, and the setting that
 * decides whether each one is a whole picture or a patch.
 */

export const tool = 'split-gif';

export const helpers = {
  load: async (k) => {
    k.give(await k.gif({ frames: 12, width: 480, height: 320 }));
    await k.wait('#frames-card');
    await k.settle(1200);
  },
};

export const shots = [
  {
    // How the frames come out. A GIF frame is often only the part of the
    // picture that changed, and "as it appears" is the setting that turns those
    // patches back into pictures.
    name: 'settings',
    clip: '#settings-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The frames, numbered, each with the delay it was shown for.
    name: 'frames',
    clip: '#frames-card',
    run: async (k) => {
      await load(k);
      await k.settle(600);
    },
  },
];
