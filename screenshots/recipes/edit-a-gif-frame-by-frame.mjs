/**
 * Editing a GIF frame by frame: there is no one tool for it, so the guide is
 * about two - take it apart, put it back together - and so are the pictures.
 */

export const shots = [
  {
    tool: 'split-gif',
    name: 'apart',
    clip: '#frames-card',
    run: async (k) => {
      k.give(await k.gif({ frames: 10, width: 480, height: 320 }));
      await k.wait('#frames-card');
      await k.settle(1400);
    },
  },
  {
    // And back together, with the delays that decide how it plays. The frames
    // here are the ones the step above would have written out.
    tool: 'gif-maker',
    name: 'together',
    clip: '.card:has(#frame-list)',
    run: async (k) => {
      const frames = [];
      for (let i = 0; i < 6; i += 1) {
        frames.push(await k.photo(480, 320, { name: 'frame-' + (i + 1) + '.png', seed: 60 + i * 3 }));
      }
      k.give(frames);
      await k.wait('#frame-list li');
      await k.settle(900);
    },
  },
];
