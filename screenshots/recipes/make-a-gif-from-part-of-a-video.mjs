/**
 * A GIF of one moment in a longer video: finding the moment, and keeping what
 * comes out small enough to post.
 */

export const tool = 'video-to-gif';

export const shots = [
  {
    // Marking in and out on the clip itself, which is the part people expect to
    // have to do in a video editor first.
    name: 'marks',
    clip: '#section-card',
    run: async (k) => {
      k.give(await k.video({ seconds: 24 }));
      await k.wait('#section-card');
      await k.seek('#preview', 11);
      k.click('#mark-in');
      await k.seek('#preview', 14);
      k.click('#mark-out');
      await k.seek('#preview', 12.4);
      await k.settle(700);
    },
  },
];
