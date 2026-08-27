/**
 * Making a QR code and proving it scans: the code, and then the same code read
 * back by a different tool.
 *
 * The second shot is handed the picture the first one made - kept in the tab
 * between the two page loads - so the screenshot really is of this code being
 * read, and not of some other code that was known to work.
 */

export const shots = [
  {
    tool: 'qr-barcode',
    name: 'made',
    clip: '#result-card',
    run: async (k) => {
      await k.wait('#fields input, #fields textarea');
      await k.set('#fields input, #fields textarea', 'https://abox.tools/');
      await k.settle(900);
      await k.keep('qr', await k.grab('#preview svg, #preview img, #preview canvas',
                                      { name: 'qr-code.png', width: 512, height: 512 }));
    },
  },
  {
    tool: 'qr-barcode-reader',
    name: 'read',
    clip: '#results-card',
    run: async (k) => {
      k.give(await k.kept('qr'));
      await k.wait('#results li, #results .result');
      await k.settle(700);
    },
  },
];
