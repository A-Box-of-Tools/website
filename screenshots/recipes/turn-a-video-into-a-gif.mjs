/**
 * Turning a video into a GIF: the section, and the three settings that decide
 * whether the result is shareable or twenty megabytes.
 */

export const tool = 'video-to-gif';

export const helpers = {
  load: async (k) => {
    k.give(await k.video({ seconds: 20 }));
    await k.wait('#section-card');
    await k.seek('#preview', 6);
    k.click('#mark-in');
    await k.seek('#preview', 10);
    k.click('#mark-out');
    await k.seek('#preview', 7.5);
    await k.settle(600);
  },
};

export const shots = [
  {
    // The section. A GIF of a whole clip is the mistake this card exists to
    // stop, and the bar shows exactly how much of it is being taken.
    name: 'section',
    clip: '#section-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // Width, frame rate and the estimate they add up to. This is the card the
    // guide spends most of its words on.
    name: 'size',
    clip: '#export-card',
    run: async (k) => {
      await load(k);
      await k.set('#width', '480');
      await k.settle(500);
    },
  },
];
