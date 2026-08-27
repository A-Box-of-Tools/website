/**
 * Grabbing a still out of a video: finding the frame, and getting the one you
 * meant rather than the one next to it.
 */

export const tool = 'grab-frame';

export const helpers = {
  find: async (k, at) => {
    k.give(await k.video({ seconds: 18 }));
    await k.wait('#find-card');
    await k.seek('#preview', at);
    await k.settle(500);
  },
};

export const shots = [
  {
    // The frame, and the two ways of saying which one: the time and the frame
    // number. The clock in the picture is what makes them legible.
    name: 'find',
    clip: '#find-card',
    run: async (k) => {
      await find(k, 7.2);
    },
  },
  {
    // The stills taken so far, each one a file waiting to be saved. Taking
    // several and choosing afterwards is what the guide recommends.
    name: 'shots',
    clip: '#shots-card',
    run: async (k) => {
      await find(k, 3.4);
      k.click('#grab');
      await k.seek('#preview', 9.1);
      k.click('#grab');
      await k.seek('#preview', 14.6);
      k.click('#grab');
      await k.wait('#shots img, #shots canvas');
      await k.settle(700);
    },
  },
];
