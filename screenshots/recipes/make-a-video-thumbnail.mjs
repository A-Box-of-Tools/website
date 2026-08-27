/**
 * Making a thumbnail for a video: the frame that represents it, and the size
 * the place you are posting to wants.
 */

export const shots = [
  {
    // Step one, in the tool that takes the still.
    tool: 'grab-frame',
    name: 'frame',
    clip: '#find-card',
    run: async (k) => {
      k.give(await k.video({ seconds: 18 }));
      await k.wait('#find-card');
      await k.seek('#preview', 6.6);
      await k.settle(600);
    },
  },
  {
    // Step two, in the tool that makes it the size that was asked for. A
    // thumbnail is a still and then a resize, and the guide is about both.
    tool: 'resize-image',
    name: 'size',
    clip: '#resize-card',
    run: async (k) => {
      k.give(await k.photo(1920, 1080, { name: 'still.jpg' }));
      await k.wait('#resize-card');
      await k.set('#size-w', '1280');
      await k.set('#size-h', '720');
      await k.settle(500);
    },
  },
];
