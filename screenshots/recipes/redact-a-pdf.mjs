/**
 * Redacting a PDF: finding the words, and taking them out of the file rather
 * than drawing a rectangle over them.
 */

export const tool = 'redact-pdf';

export const helpers = {
  load: async (k) => {
    k.give(await k.pdf({ pages: 3, heading: 'Invoice' }));
    await k.wait('#find-card');
    await k.settle(1200);
    await k.set('#terms', 'INV-4471\n8842');
    await k.settle(1200);
  },
};

export const shots = [
  {
    // The terms, and every place they appear. Typing what has to go and letting
    // the tool find it is the difference between this and a black rectangle.
    name: 'find',
    clip: '#find-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The page as text, which is the part that surprises people: a PDF is not a
    // picture, and the words in it can be selected, searched and copied by
    // anybody who receives it.
    name: 'page',
    clip: '#page-card',
    run: async (k) => {
      await load(k);
      await k.settle(900);
    },
  },
];
