/**
 * Cropping a video: the box, and the re-encode it forces.
 */

export const tool = 'crop-video';

export const helpers = {
  load: async (k) => {
    k.give(await k.video({ seconds: 16 }));
    // The transport arrives with the file, and the crop card was on screen
    // before it, so this is what says the file is in.
    await k.wait('#transport');
    // Moved from the slider rather than by setting currentTime behind the
    // page's back, so the clock under it agrees with the frame the crop box
    // is being lined up against.
    k.set('#scrub', '4500');
    await k.until(() => {
      const video = document.querySelector('#preview');
      return !video.seeking && video.readyState >= 2;
    }, { label: 'the frame at 4.5s' });
    await k.set('#crop-w', '640');
    await k.set('#crop-h', '640');
    k.click('#crop-centre');
    await k.settle(500);
  },
};

export const shots = [
  {
    // The box over the picture, with the numbers beside it. A square crop out
    // of a widescreen clip is the job somebody arrives here with.
    name: 'box',
    clip: '#crop-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // What it costs. Cropping cannot be done by copying the file, so this card
    // is the guide's whole point about quality and about size.
    name: 'export',
    clip: '#export-card',
    run: async (k) => {
      await load(k);
      await k.settle(400);
    },
  },
];
