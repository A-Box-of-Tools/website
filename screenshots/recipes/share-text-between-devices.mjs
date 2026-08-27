/**
 * Sharing text between devices: what you are handing over, and the name that
 * is the whole of the address.
 *
 * Nothing here publishes. Publishing opens the one WebSocket this site has, to
 * a rendezvous that is not running behind the capture harness, and a screenshot
 * of a failed connection would be a screenshot of the harness rather than of
 * the tool.
 */

export const tool = 'share-text';

export const data = {
  NOTE: 'Meeting notes - Thursday\n\n'
    + '- The rendezvous stores nothing; it only introduces the two browsers.\n'
    + '- Ask Priya for the updated figures before Friday.\n'
    + '- Booking reference: 4471-QX\n',
};

export const shots = [
  {
    // What is being shared, in the editor that keeps it. Markdown is a switch
    // rather than a mode, so the same box holds a shopping list and a document.
    name: 'write',
    clip: '.card:has(#editor)',
    run: async (k) => {
      await k.wait('#text');
      await k.set('#text', NOTE);
      await k.settle(600);
    },
  },
  {
    // The name, and the two switches beside it. The guide spends a section on
    // this because the name is the address and the only thing keeping a
    // stranger out.
    name: 'name',
    clip: '.card:has(#code)',
    run: async (k) => {
      await k.wait('#code');
      await k.set('#text', NOTE);
      await k.set('#code', 'thursday-notes');
      await k.settle(600);
    },
  },
];
