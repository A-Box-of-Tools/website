/**
 * Removing EXIF and GPS data: what is actually in the file, and the difference
 * between taking it out and taking some of it out.
 */

export const tool = 'exif-editor';

export const helpers = {
  load: async (k) => {
    k.give(await k.exifPhoto());
    await k.wait('#inspect-card');
    await k.settle(1100);
  },
};

export const shots = [
  {
    // What the photograph is carrying: the camera, the date, the settings, and
    // the coordinates. Somebody who has never looked at this is the reader this
    // guide is written for.
    name: 'inside',
    clip: ['#inspect-thumb', '#findings-list'],
    run: async (k) => {
      await load(k);
    },
  },
  {
    // Taking it out, and the two things worth keeping: which way up the picture
    // goes, and what its colours mean.
    name: 'strip',
    clip: '#strip-card',
    run: async (k) => {
      await load(k);
      await k.settle(400);
    },
  },
];
