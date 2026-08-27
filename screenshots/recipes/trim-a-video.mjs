/**
 * Trimming a video: marking the sections, and what the cut costs.
 */

export const tool = 'trim-video';

/**
 * Shared by both shots, and evaluated in the page beside them: mark a pair of
 * in and out points the way somebody watching the clip would.
 */
export const helpers = {
  mark: async (k, from, to) => {
    await k.seek('#preview', from);
    k.click('#mark-in');
    await k.seek('#preview', to);
    k.click('#mark-out');
  },
};

export const shots = [
  {
    // Two segments marked, so the table under the timeline has rows in it and
    // the running total means something. The clock burned into the clip is what
    // ties the numbers in the rows to the picture above them.
    name: 'marks',
    clip: ['#timeline', '#segment-table'],
    run: async (k) => {
      k.give(await k.video({ seconds: 24 }));
      await k.wait('#section-card');
      await mark(k, 3, 9.5);
      await mark(k, 14, 19);
      await k.seek('#preview', 5.4);
      await k.settle(600);
    },
  },
  {
    // What the two answers cost, which is the question the guide is really
    // about: the summary counts the pieces and says how long the result runs.
    name: 'summary',
    clip: '#export-card',
    run: async (k) => {
      k.give(await k.video({ seconds: 24 }));
      await k.wait('#section-card');
      await mark(k, 3, 9.5);
      await mark(k, 14, 19);
      await k.settle(600);
    },
  },
];
