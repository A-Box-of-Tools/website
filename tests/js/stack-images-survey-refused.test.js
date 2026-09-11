/**
 * tools/stack-images/src/align.js - the gate at the survey square, what it refuses.
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

import {
  L_MIN, N_MAX, N_MAX_SURVEY, P_MAX, estimate, isMeasured,
} from '../../tools/stack-images/src/align.js';
import {
  field, lowScene, otherLow, diagonal, starList, noisy, GATE_SIZE,
  BLACK_LEVEL, SURVEY_SCALE, SURVEY_SEEDS, surveyRect, surveyScene,
  surveyStars, surveySquares, surveySeeds,
} from './stack-images-fixtures.js';

test('a clear sky is refused at the survey square, where the whole square let it through', () => {
  // The regression this floor exists to stop, reproduced. Over the whole
  // square the letterbox's edge stood high away from the peak and lifted this
  // reading to 0.96, so N_MAX refused a sky on every seed of every shape.
  // Over the picture's box the ridge is gone, the sky reads under 0.8, and the
  // seeds the old gate admits below are moved 1.77 to 2.07 alignment pixels
  // from an identity that was the truth - which the multiply-up from a 256
  // square to a 3000-pixel frame turns into about twenty-five output ones. In
  // the browser the same thing happened at 3:2, on eleven seeds in twelve at
  // 0.62-0.74 and up to 38 output pixels.
  const wide = surveyRect(3000, 2000);
  const tall = surveyRect(2000, 3000);
  const slope = (rect) => surveyScene(rect, diagonal);

  // A sky with five per cent noise is the junk family that comes nearest this
  // floor, and the one where the floor does the work rather than watching the
  // other two do it: live is 0.0120, well over L_MIN, and the plateau runs
  // 0.650-0.736 at 3:2 and 0.671-0.750 at 2:3, so P_MAX lets some of these
  // through and this floor has to catch them. 3:2 reads next 0.578-0.674 and
  // N_MAX admits two seeds of the four, moved 0.72-2.07 alignment pixels from
  // an identity that was the truth; 2:3 reads 0.647-0.708 and N_MAX admits
  // one, moved 1.00-2.43.
  for (const [rect, what, leaks] of [[wide, '3:2', 2], [tall, '2:3', 1]]) {
    const noisySky = slope(rect);
    let admitted = 0;
    let reached = 0;
    for (const found of surveySeeds(rect, noisySky, noisySky, 12.75)) {
      assert.ok(!isMeasured(found, N_MAX_SURVEY), `${what} noisy sky at ${found.next}`);
      if (found.live >= L_MIN && found.plateau <= P_MAX) reached += 1;
      if (isMeasured(found)) admitted += 1;
    }
    assert.ok(reached > 0, `${what}: no seed reaches this floor, so it decides nothing here`);
    assert.equal(admitted, leaks, `${what}: the seeds the floor this replaced would have moved`);
  }

  // And the clean sky the browser measured: 3:2 next 0.672-0.674 at a plateau
  // of 0.566-0.571, 2:3 next 0.637-0.644 at 0.543-0.549. Both are refused by
  // live as well in this fixture - a slope with 0.4% noise on it leaves 0.0038
  // against L_MIN's 0.004, where the browser's JPEG leaves enough for it to
  // pass - so what is pinned here is the uniqueness reading itself.
  for (const [rect, what] of [[wide, '3:2'], [tall, '2:3']]) {
    const clean = slope(rect);
    for (const found of surveySeeds(rect, clean, clean, 1)) {
      assert.ok(found.next > N_MAX_SURVEY, `${what} clear sky at ${found.next}`);
      assert.ok(!isMeasured(found, N_MAX_SURVEY), `${what} clear sky: plateau ${found.plateau}`);
    }
  }

  // And the junk family the coarse square has always leaked, for which this
  // floor changes nothing: two unrelated low-texture pictures read 0.939-0.962
  // at a plateau of 0.351-0.427 and are refused either way, with 18.2
  // alignment pixels of movement behind them. This is here because a floor
  // that refuses a sky and stops refusing junk would be no gate at all.
  const unrelated = surveySeeds(
    wide, surveyScene(wide, lowScene, { level: BLACK_LEVEL }),
    surveyScene(wide, otherLow, { level: BLACK_LEVEL }), 13.5,
  );
  for (const found of unrelated) {
    assert.ok(found.next > N_MAX, `the unrelated pair at ${found.next}`);
    assert.ok(!isMeasured(found, N_MAX_SURVEY));
  }
});

test('the survey floor is the one estimate asks for the translation peak', () => {
  // The floor above is only worth having if it is passed where it belongs, and
  // a defaulted argument is exactly the kind of thing a refactor drops without
  // any test noticing. So this drives the whole of estimate() rather than
  // phaseCorrelate and isMeasured separately: a five per cent sky is refused
  // at both shapes, and it is refused by nothing but this floor, because with
  // the argument dropped N_MAX admits three of these eight squares.
  for (const [width, height, what] of [[3000, 2000, '3:2'], [2000, 3000, '2:3']]) {
    const rect = surveyRect(width, height);
    const sky = surveyScene(rect, diagonal);
    for (const seed of SURVEY_SEEDS) {
      const [a, b] = surveySquares(rect, sky, sky, 12.75, seed);
      const found = estimate(a, b, GATE_SIZE, 'translate');
      assert.equal(found.measured, false, `${what} sky through estimate: next ${found.next}`);
    }
  }
});

test('a sparse star field is refused at the survey square, and its answer was right', () => {
  // What the floor costs, pinned rather than argued away. Thirty-four stars
  // over a 3:2 output read next 0.497-0.587 - inside the band where a clear
  // sky lives, and above the floor - with their answer 0.45-0.61 of a pixel
  // from the truth. So these frames stack at the identity, and are not
  // refined either, because a frame the coarse pass refused is not refined.
  //
  // There is no floor that avoids this. Over five draws each of twenty,
  // thirty-four and fifty stars at three shapes and seven seeds - 315 pairs,
  // 296 of them right to within a pixel - a floor of 0.45 admits 151 of the
  // right ones, 0.5 admits 199 and 0.8 admits 274, and the family reads
  // 0.223-0.999 across the whole of that. It overlaps every junk family
  // measured, because a sparse field's peak genuinely is one of several and at
  // the survey square that is what a clear sky looks like too. The comment on
  // N_MAX_SURVEY has the counts and why the line sits where it does.
  const wide = surveyRect(3000, 2000);
  const moved = { dx: 2.4 * SURVEY_SCALE, dy: -1.7 * SURVEY_SCALE };
  const sparse = starList(wide.width * SURVEY_SCALE, 34);
  for (const found of surveySeeds(wide, surveyStars(wide, sparse), surveyStars(wide, sparse, moved), 15)) {
    const off = Math.hypot(found.dx + 2.4, found.dy - 1.7);
    assert.ok(off < 1, `thirty-four stars: ${off} pixels off, so the answer is right`);
    assert.ok(!isMeasured(found, N_MAX_SURVEY), `thirty-four stars at ${found.next}`);
    assert.ok(isMeasured(found), `thirty-four stars: N_MAX admits it at ${found.next}`);
  }
});
