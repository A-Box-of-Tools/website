/**
 * Checking a file against the checksum it was published with.
 */

export const tool = 'hash-checksum';

export const helpers = {
  load: async (k) => {
    k.give(await k.photo(2000, 1400, { name: 'installer.jpg' }));
    await k.wait('#digests');
    await k.settle(900);
  },
};

export const shots = [
  {
    // The digests, all of them at once. Which one to compare is decided by
    // whoever published the file, so the tool does not make you choose first.
    name: 'digests',
    clip: '#results',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The comparison, which is the only step that matters: paste what the
    // download page said and the tool says yes or no rather than making
    // somebody read sixty-four characters off a screen.
    name: 'compare',
    clip: '#compare-card',
    run: async (k) => {
      await load(k);
      const digest = document.querySelector('#digests .digest-value, #digests code');
      await k.set('#expected', digest ? digest.textContent.trim() : '');
      await k.settle(600);
    },
  },
];
