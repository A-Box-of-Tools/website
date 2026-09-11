/**
 * tools/stack-images/src/align.js - the gate at the survey square, what it admits.
 *
 * The coarse pass measures a whole frame shrunk into a 256 square, and these
 * tests measure it the way the pipeline builds it: each scene rendered at a
 * phone's size, given its noise and its 8 bits there, averaged down through
 * the same resize and drawn into the same centred box. That is what makes
 * them slow - a 3072-pixel scene is a hundred and forty times the work of a
 * 256 one - and slow is why they are their own files: `node --test` runs
 * files in parallel and the tests in one file in series, and the four survey
 * tests were fifty seconds of the suite's sixty, on one core, with every
 * other file finished and waiting. Split in two by which side of the floor
 * they pin, the longer of the two is under thirty. The fixtures they draw are
 * in stack-images-fixtures.js, beside the note on why the ratio is derived
 * and not chosen; the rest of what the gate is pinned against is in
 * stack-images-align.test.js.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { N_MAX_SURVEY, isMeasured } from '../../tools/stack-images/src/align.js';
import {
  scene, lowScene, starList, BLACK_LEVEL, SURVEY_SCALE, surveyRect,
  surveyScene, surveyStars, surveySeeds,
} from './stack-images-fixtures.js';

test('the real families are measured at the survey square', () => {
  // The other side of the floor, on the same path: what a photograph reads
  // once the resize has averaged its noise down. Every one of these is right
  // to a fifth of a pixel and every one is admitted, and the widest of them
  // is what decides how low the floor can go.
  const wide = surveyRect(3000, 2000);
  const tall = surveyRect(2000, 3000);
  const moved = { dx: 2.4 * SURVEY_SCALE, dy: -1.7 * SURVEY_SCALE };
  const off = (found) => Math.hypot(found.dx + 2.4, found.dy - 1.7);

  const admits = (rect, first, second, sigma, worst, what) => {
    for (const found of surveySeeds(rect, first, second, sigma)) {
      assert.ok(isMeasured(found, N_MAX_SURVEY), `${what}: next ${found.next}`);
      assert.ok(off(found) < worst, `${what}: ${off(found)} pixels off`);
    }
  };

  // The textured scene at fifty per cent noise - the family a 256-native
  // fixture reads at 0.71, and the reason this file used to say no floor
  // could sit under 0.8. Through the resize it reads 0.057-0.067, right to
  // 0.115-0.139 of a pixel.
  admits(wide, surveyScene(wide, scene, { level: BLACK_LEVEL }),
    surveyScene(wide, scene, { ...moved, level: BLACK_LEVEL }), 92, 0.3, 'textured, 50% noise');

  // A low-texture scene at fifteen per cent, letterboxed the other way:
  // next 0.080-0.084, right to 0.106-0.108 of a pixel.
  admits(tall, surveyScene(tall, lowScene, { level: BLACK_LEVEL }),
    surveyScene(tall, lowScene, { ...moved, level: BLACK_LEVEL }), 13.5, 0.3, 'low texture 15%');

  // A night sky as the survey square really sees one: four hundred stars over
  // a 3000-pixel frame, each of them a sub-pixel dot by the time the resize is
  // done. next 0.157-0.180 against a floor of 0.45, right to 0.199-0.215 of a
  // pixel. This is the real family that comes nearest the floor, and the
  // browser reads the same field at 0.12-0.29.
  const dense = starList(wide.width * SURVEY_SCALE, 400);
  admits(wide, surveyStars(wide, dense), surveyStars(wide, dense, moved), 15, 0.3, 'four hundred stars');

  // And a pair eight times apart in brightness, which is a bracket rather than
  // a burst but is the same alignment question. The dim frame is quantised to
  // 8 bits at an eighth of the level and carries the same read noise as the
  // bright one, which is the harsher of the two ways to model it: next
  // 0.073-0.087, right to 0.115-0.135 of a pixel. Eight *stops* apart - 256 to
  // one - is a different case and not a real family: it reads 0.77-1.00 with
  // its answer anywhere between a fifth of a pixel and fifty-eight, and both
  // floors refuse it, correctly.
  admits(wide, surveyScene(wide, scene, { level: BLACK_LEVEL }),
    surveyScene(wide, (u, v) => (scene(u, v) + BLACK_LEVEL) / 8, moved), 28, 0.3,
    'textured, frame eight times dimmer');
});
