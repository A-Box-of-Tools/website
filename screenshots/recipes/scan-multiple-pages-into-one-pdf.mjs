/**
 * Several photographed pages into one PDF: the strip of pages, and the
 * document they become.
 */

export const shots = [
  {
    tool: 'document-scanner',
    name: 'pages',
    clip: ['#page-strip', '#edit-card'],
    run: async (k) => {
      const pages = [];
      for (const heading of ['Delivery note', 'Terms of sale', 'Receipt']) {
        pages.push(await k.snap({ heading, name: heading.split(' ')[0] + '.jpg' }));
      }
      k.give(pages);
      await k.wait('#page-strip li, #page-strip button');
      await k.settle(2000);
    },
  },
  {
    tool: 'images-to-pdf',
    name: 'document',
    clip: '.card:has(#page-size)',
    run: async (k) => {
      const pages = [];
      for (let i = 0; i < 3; i += 1) {
        pages.push(await k.page(1240, 1754,
                                { heading: 'Delivery note',
                                  name: 'page-' + (i + 1) + '.png' }));
      }
      k.give(pages);
      await k.wait('#image-list li');
      await k.settle(900);
    },
  },
];
