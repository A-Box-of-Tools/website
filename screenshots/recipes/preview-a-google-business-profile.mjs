/**
 * Previewing a business profile: the card the fields turn into, what a
 * keyword-stuffed name does to the narrowest surface, the sentence the hours
 * produce, and what a pasted listing gets read as.
 *
 * There is no file to hand this tool - the page opens with a coffee shop
 * already typed into it - so most of these shots are of the sample profile.
 * The cover photo is the one exception, and it goes in through the tool's own
 * file input rather than through `give`, which looks for a `#file-input` this
 * page has not got: the photo is an extra here, not the input.
 */

export const tool = 'business-profile-preview';

export const helpers = {
  /** Put a cover photo on the sample profile, the way the button would. */
  cover: async (k) => {
    const input = document.querySelector('#photo-file');
    const carrier = new DataTransfer();
    carrier.items.add(await k.photo(1600, 900, { name: 'shopfront.jpg' }));
    input.files = carrier.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await k.until(() => document.querySelector('#stage svg image'),
      { label: 'the photo to reach the card' });
    await k.settle(400);
  },

  /** Show one of the three surfaces. */
  surface: async (k, which) => {
    k.click(`.chip[data-surface="${which}"]`);
    await k.settle(300);
  },
};

export const shots = [
  {
    // The knowledge panel: the surface people look themselves up on, and the
    // one that shows every field at once.
    name: 'panel',
    clip: '#stage',
    run: async (k) => {
      await k.wait('#stage svg');
      await cover(k);
    },
  },
  {
    // The point of the guide's first decision, in one picture: the same name
    // with the town and the trade bolted on, in the narrowest place it is
    // read, ending in the ellipsis that eats the keywords.
    name: 'search-result',
    clip: '#stage',
    run: async (k) => {
      await k.wait('#stage svg');
      await cover(k);
      k.set('#name', 'Blue Bottle Coffee Roasters Downtown Toronto - Best Espresso');
      await surface(k, 'listing');
    },
  },
  {
    // The one line on a listing that changes without anybody touching it.
    // Sunday is switched off, so the sentence under the week says what a
    // visitor on a Sunday evening would be told.
    name: 'hours',
    clip: ['#week', '#week-note'],
    run: async (k) => {
      await k.wait('.week-row');
      const sunday = document.querySelector('.week-row[data-day="0"] .day-shut');
      sunday.checked = true;
      sunday.dispatchEvent(new Event('input', { bubbles: true }));
      k.set('.week-row[data-day="6"] .day-close', '13:00');
      await k.settle(400);
    },
  },
  {
    // Importing a listing by pasting it, and the half that matters: the line
    // underneath saying which fields were read, so a wrong guess is visible
    // rather than signed off.
    name: 'import',
    clip: ['#paste', '#import-note'],
    run: async (k) => {
      document.querySelector('#import-card').open = true;
      k.set('#paste', [
        'Northside Dental Care',
        'Website',
        'Directions',
        '4.8 (213)',
        'Dentist',
        '88 Bathurst St Unit 4, Toronto, ON M5V 2P7',
        '(647) 555-9021',
        'northsidedental.example.ca',
      ].join('\n'));
      k.click('#read-paste');
      await k.wait('#import-note');
      await k.settle(300);
    },
  },
];
