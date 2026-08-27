/**
 * Combining images into a PDF: the page size, and what happens to a picture
 * that is not the shape of the page.
 */

export const tool = 'images-to-pdf';

export const helpers = {
  load: async (k) => {
    const pages = [];
    for (let i = 0; i < 4; i += 1) {
      pages.push(await k.photo(1600, 1200, { name: 'scan-' + (i + 1) + '.jpg', seed: 21 + i * 5 }));
    }
    k.give(pages);
    await k.wait('#image-list li');
    await k.settle(800);
  },
};

export const shots = [
  {
    // The page, and how a picture meets it. Fit, fill and the margin are the
    // three settings this guide is about.
    name: 'layout',
    clip: '.card:has(#page-size)',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The preview, which is the only way to find out that "fill the page" has
    // quietly cut the top off every one of them.
    name: 'preview',
    clip: ['#preview', '#summary'],
    run: async (k) => {
      await load(k);
      await k.settle(700);
    },
  },
];
