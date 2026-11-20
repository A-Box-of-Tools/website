/**
 * What a magnification number means: one telescope twice, and a pair of
 * binoculars at dusk.
 *
 * There is no file to hand this tool. Each shot presses one of the page's own
 * examples, so what is photographed is a setting a reader can reach with one
 * click, and the two telescope shots are the same 60 mm telescope either side
 * of its limit, which is the comparison the guide is written around.
 */

export const tool = 'magnification-calculator';

export const helpers = {
  /** Press the example whose settings contain `settings`, and let the pictures land. */
  example: async (k, settings) => {
    await k.wait('#view');
    k.click(`[data-example*="${settings}"]`);
    await k.settle(900);
  },
};

export const shots = [
  {
    // Inside its useful range: the dial in the green, and a close look with
    // craters in it.
    name: 'sharp',
    clip: ['.mc-dial', '.mc-stage'],
    run: async (k) => {
      await example(k, 'tel-eyepiece=20');
    },
  },
  {
    // The number on the box: the dial at the end of the red, and the same
    // close look as a blur.
    name: 'empty',
    clip: ['.mc-dial', '.mc-stage'],
    run: async (k) => {
      await example(k, 'tel-eyepiece=4 tel-barlow=3');
    },
  },
  {
    // What the second number on a pair of binoculars is for: the view through
    // the small pair beside the eye-alone view, which is brighter.
    name: 'dusk',
    clip: ['#verdict', '.mc-stage'],
    run: async (k) => {
      await example(k, 'bin-objective=21');
    },
  },
];
