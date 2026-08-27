/**
 * Merging and splitting PDFs: the page grid, and the three ways of cutting one
 * document into several.
 */

export const tool = 'merge-pdf';

export const helpers = {
  load: async (k) => {
    k.give(await k.pdf({ pages: 4, heading: 'Contract', name: 'contract.pdf' }),
           await k.pdf({ pages: 3, heading: 'Appendix', name: 'appendix.pdf' }));
    await k.wait('#page-list li, #page-list .page');
    await k.settle(1600);
  },
};

export const shots = [
  {
    // Every page of both documents, in the order they will come out. Dragging
    // one somewhere else is the whole of "arrange", and the range box above is
    // for when there are two hundred of them.
    name: 'pages',
    clip: '#pages-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // One document or several. Splitting by size, at a page, or back into the
    // files it was made of - and the summary says what each will produce.
    name: 'output',
    clip: '#output-card',
    run: async (k) => {
      await load(k);
      await k.settle(500);
    },
  },
];
