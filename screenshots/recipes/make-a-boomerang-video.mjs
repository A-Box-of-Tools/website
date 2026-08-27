/**
 * A boomerang: a short piece cut out, then the same piece backwards, joined.
 * Two tools, so two screenshots of two different pages.
 */

export const shots = [
  {
    // Cutting the second or two that will bounce. A boomerang is short on
    // purpose, and the segment table is where that is decided.
    tool: 'trim-video',
    name: 'section',
    clip: ['#timeline', '#segment-table'],
    run: async (k) => {
      k.give(await k.video({ seconds: 14 }));
      await k.wait('#section-card');
      await k.seek('#preview', 4);
      k.click('#mark-in');
      await k.seek('#preview', 5.6);
      k.click('#mark-out');
      await k.settle(600);
    },
  },
  {
    // And the second half of the trick, in the tool that plays it backwards.
    tool: 'reverse-video',
    name: 'reverse',
    clip: '#export-card',
    run: async (k) => {
      k.give(await k.video({ seconds: 2, fps: 30 }));
      await k.wait('#export-card');
      await k.settle(700);
    },
  },
];
