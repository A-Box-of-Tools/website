/**
 * Tracing a shape into an SVG: what the outline looks like over the pixels it
 * came from, and what happens when the picture is a photograph instead.
 *
 * The sample is drawn here rather than checked in, like every other recipe's,
 * but it is drawn rather than photographed for a second reason as well: this
 * tool's whole argument is that it traces SHAPES, and a photograph would
 * illustrate the failure it warns about rather than the job it does. The
 * second shot uses one on purpose.
 */

export const tool = 'image-to-svg';

export const helpers = {
  /** A stencil: flat shapes and a word, the kind of picture that traces well. */
  stencil: async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 420;
    const g = canvas.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.fillStyle = '#101418';

    // A rosette, because a shape with a hole in it is the one that proves the
    // winding: the middle has to come out as a hole rather than as ink.
    g.beginPath();
    for (let i = 0; i < 12; i += 1) {
      const angle = (i / 12) * Math.PI * 2;
      g.ellipse(150 + Math.cos(angle) * 52, 150 + Math.sin(angle) * 52, 34, 34, 0, 0, 7);
    }
    g.fill();
    g.globalCompositeOperation = 'destination-out';
    g.beginPath();
    g.arc(150, 150, 40, 0, 7);
    g.fill();
    g.globalCompositeOperation = 'source-over';

    g.beginPath();
    g.moveTo(430, 60);
    g.lineTo(560, 250);
    g.lineTo(300, 250);
    g.closePath();
    g.fill();

    g.font = '700 96px Georgia, "Times New Roman", serif';
    g.fillText('Stencil', 60, 370);

    // The speck that a click is for, in a corner where it is obviously not
    // part of the drawing.
    g.beginPath();
    g.arc(600, 390, 9, 0, 7);
    g.fill();

    const blob = await new Promise((done) => canvas.toBlob(done, 'image/png'));
    return new File([blob], 'stencil.png', { type: 'image/png' });
  },

  traced: async (k) => {
    k.give(await stencil());
    await k.wait('#stage-picture');
    await k.until(() => document.querySelector('#facts')?.textContent.trim().length > 0,
      { label: 'the trace' });
    await k.settle(600);
  },
};

export const shots = [
  {
    // The outline over the pixels it came from, which is the whole idea: an
    // outline is right or wrong relative to those pixels and nothing else.
    name: 'outline',
    clip: '#work-card',
    run: async (k) => {
      await traced(k);
    },
  },
  {
    // What it says about the result, and what it offers.
    name: 'save',
    clip: '#save-card',
    run: async (k) => {
      await traced(k);
      await k.settle(300);
    },
  },
  {
    // A photograph, and the warning. This is the shot that stops the guide
    // reading as though tracing were a general-purpose converter.
    name: 'photograph',
    clip: ['#facts', '#too-big'],
    run: async (k) => {
      k.give(await k.png(1200, 900, { name: 'photo.png' }));
      await k.wait('#stage-picture');
      await k.until(() => !document.querySelector('#too-big')?.hidden,
        { label: 'the too-much warning' });
      await k.settle(500);
    },
  },
];
