/**
 * Scanning a document with a phone: putting the corners on the page, and what
 * cleaning it up actually does.
 */

export const tool = 'document-scanner';

export const helpers = {
  load: async (k) => {
    k.give(await k.snap());
    await k.wait('#edit-card');
    await k.settle(1600);
  },
};

export const shots = [
  {
    // The corners, found and then dragged if they were found wrong. A page
    // photographed at an angle is the normal case rather than the awkward one.
    name: 'corners',
    clip: '#edit-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // What cleaning up does: the page flattened, the uneven light taken out,
    // and the modes that decide how far to go.
    name: 'clean',
    clip: ['#scan-preview', '#strength-row'],
    run: async (k) => {
      await load(k);
      await k.settle(1200);
    },
  },
];
