/**
 * Cropping a video: the box, and the re-encode it forces.
 */

export const tool = 'crop-video';

export const helpers = {
  load: async (k) => {
    k.give(await k.video({ seconds: 16 }));
    await k.wait('#crop-card');
    await k.seek('#preview', 4.5);
    await k.set('#crop-w', '640');
    await k.set('#crop-h', '640');
    k.click('#crop-centre');
    await k.settle(500);
  },
};

export const shots = [
  {
    // The box over the picture, with the numbers beside it. A square crop out
    // of a widescreen clip is the job somebody arrives here with.
    name: 'box',
    clip: '#crop-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // What it costs. Cropping cannot be done by copying the file, so this card
    // is the guide's whole point about quality and about size.
    name: 'export',
    clip: '#export-card',
    run: async (k) => {
      await load(k);
      await k.settle(400);
    },
  },
];
