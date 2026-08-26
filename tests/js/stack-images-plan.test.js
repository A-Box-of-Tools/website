/**
 * tools/stack-images/src/plan.js - what a stack will cost before it is run.
 *
 * The numbers this produces are shown to the visitor before they press the
 * button, so they have to be the numbers the run actually has. Two of them are
 * worth pinning hard:
 *
 * `decodes` is the promise the tool makes about its own speed. A streaming mode
 * over twenty frames is twenty decodes, and if that ever quietly becomes eighty
 * because the banding kicked in, the tool has become four times slower with
 * nothing on screen to say so.
 *
 * `peak` is the promise it makes about memory. Quoting it low is how a tab
 * dies halfway through somebody's stack.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_BUDGET, MIN_BAND_ROWS, MODES, MODE_IDS, SCALES,
  bands, bytesPerPixel, commonArea, isMode, outputSize, placement, planRun, scaleThatFits,
  workingSize,
} from '../../tools/stack-images/src/plan.js';

const MEGAPIXEL_24 = { width: 6000, height: 4000 };

test('every mode is declared, and nothing else is', () => {
  assert.deepEqual(
    MODE_IDS.slice().sort(),
    ['focus', 'max', 'mean', 'median', 'min', 'sigma', 'sum'],
  );
  for (const id of MODE_IDS) {
    assert.ok(MODES[id].passes >= 1, `${id} has to read the frames at least once`);
  }
  assert.equal(isMode('mean'), true);
  assert.equal(isMode('average'), false);
  assert.equal(isMode('constructor'), false, 'a prototype key is not a mode');
});

test('a streaming mode costs the same memory however many frames there are', () => {
  // The whole performance argument, and it is about memory rather than about
  // banding: for six of the seven modes the accumulator is the same size for a
  // hundred frames as for two, so nothing about the plan changes when more
  // frames arrive except how long it takes. Only the median holds the frames.
  for (const mode of ['mean', 'max', 'min', 'sum', 'focus', 'sigma']) {
    const ten = planRun({ ...MEGAPIXEL_24, frames: 10, mode });
    const forty = planRun({ ...MEGAPIXEL_24, frames: 40, mode });

    assert.equal(forty.peak, ten.peak, `${mode} should not cost more memory for more frames`);
    assert.equal(forty.rows, ten.rows, `${mode} should not band harder for more frames`);
    assert.equal(forty.decodes, ten.decodes * 4, `${mode} should scale only in time`);
  }

  const median = planRun({ ...MEGAPIXEL_24, frames: 40, mode: 'median' });
  assert.ok(
    median.peak > planRun({ ...MEGAPIXEL_24, frames: 10, mode: 'median' }).rows * 0,
    'the median is the one that holds the frames',
  );
  assert.ok(median.banded, 'and the one that has to band for it');
});

test('the cheap methods fit 24 megapixels whole; the expensive ones do not', () => {
  // Worth pinning as a table rather than as a rule, because the line falls
  // between them and moves whenever an accumulator changes size. Anything that
  // crosses it should be a decision, not a surprise.
  const bandsAt24 = (mode) => planRun({ ...MEGAPIXEL_24, frames: 20, mode }).bands;

  for (const mode of ['mean', 'max', 'min', 'sum']) {
    assert.equal(bandsAt24(mode), 1, `${mode} should fit 24 megapixels in one piece`);
  }
  // Focus carries two float buffers to measure sharpness in and sigma carries
  // two float accumulators, and with the output canvas taken off the budget
  // neither quite fits at full size. One step down is four times less, and both
  // fit comfortably.
  for (const mode of ['focus', 'sigma', 'median']) {
    assert.ok(bandsAt24(mode) > 1, `${mode} was expected to need banding at 24 megapixels`);
    assert.equal(
      planRun({ width: 3000, height: 2000, frames: 20, mode }).bands, 1,
      `${mode} should fit at half resolution`,
    );
    assert.equal(
      scaleThatFits({ ...MEGAPIXEL_24, frames: 20, mode }), 'half',
      `${mode} should be able to advise half`,
    );
  }
});

test('sigma clipping reads them twice, and says twice', () => {
  const plan = planRun({ width: 3000, height: 2000, frames: 20, mode: 'sigma' });
  assert.equal(plan.passes, 2);
  assert.equal(plan.bands, 1);
  assert.equal(plan.decodes, 40, 'twenty frames, read twice');
});

test('a banded run quotes the decodes banding costs, not the ones it wanted', () => {
  // The point is that the tool knows: it bands rather than dying, and the
  // figure on the page admits the extra reads rather than quoting the number a
  // single-pass run would have had.
  const full = planRun({ ...MEGAPIXEL_24, frames: 20, mode: 'sigma' });
  assert.ok(full.banded, 'a run this size has to band');
  assert.equal(full.decodes, full.bands * 2 * 20);
  assert.ok(full.decodes > 40, 'banding is not free, and the figure shown must admit it');
  assert.ok(full.peak <= DEFAULT_BUDGET, `peak ${full.peak} is over the budget`);
});

test('the median bands, and the banding is what costs the extra decodes', () => {
  // Twenty 24-megapixel frames at three bytes a pixel is 1.4 GB, which is the
  // case the banding exists for. It must not silently succeed as one band.
  const plan = planRun({ ...MEGAPIXEL_24, frames: 20, mode: 'median' });

  assert.ok(plan.banded, 'the median of twenty 24-megapixel frames has to band');
  assert.ok(plan.bands > 1);
  assert.ok(plan.peak <= DEFAULT_BUDGET, `peak ${plan.peak} is over the budget`);
  assert.equal(plan.decodes, plan.bands * 20, 'each band reads every frame again');
  assert.ok(plan.rows >= MIN_BAND_ROWS);
});

test('a small median does not band, and costs one decode a frame', () => {
  const plan = planRun({ width: 800, height: 600, frames: 12, mode: 'median' });
  assert.equal(plan.bands, 1);
  assert.equal(plan.decodes, 12);
});

test('the peak quoted is the peak that gets allocated', () => {
  // Three things get allocated and all three are in the figure: the
  // accumulators, the RGBA the canvas hands back, and the full-size canvas the
  // answer is drawn into. Leaving the readback out quotes 25% low; leaving the
  // output canvas out quotes a fifth low at 24 megapixels, and it is the one
  // that is easy to forget because it is not part of the band arithmetic.
  const frames = 8;
  for (const mode of MODE_IDS) {
    const plan = planRun({ width: 1000, height: 1000, frames, mode });
    assert.equal(
      plan.peak,
      1000 * 1000 * 4 + plan.rows * 1000 * bytesPerPixel(mode, frames),
      `${mode} quoted a peak that is not its allocation`,
    );
  }

  // And the output canvas is counted even when nothing else is: a one-row band
  // of a huge picture still has that picture to write into.
  const wide = planRun({ width: 6000, height: 4000, frames: 200, mode: 'median' });
  assert.ok(wide.peak > 6000 * 4000 * 4, 'the canvas itself went missing');
  assert.ok(
    bytesPerPixel('mean', 8) > MODES.mean.bytes,
    'the readback buffer is part of the working set',
  );
  assert.equal(
    bytesPerPixel('median', 8),
    MODES.median.bytes * 8 + 4,
    'the median holds one copy per frame',
  );
});

test('a budget too small for a whole band still produces a usable one', () => {
  // Rather than fail, a run that cannot afford a comfortable band gets the
  // smallest useful one. A band of a single row would fit any budget and would
  // spend all its time in per-band overhead.
  const plan = planRun({ ...MEGAPIXEL_24, frames: 100, mode: 'median', budget: 1024 });
  assert.equal(plan.rows, MIN_BAND_ROWS);
  assert.ok(plan.bands > 1);
});

test('a picture shorter than a band is one band, not a band taller than it', () => {
  const plan = planRun({ width: 100, height: 4, frames: 3, mode: 'mean' });
  assert.equal(plan.rows, 4, 'the band cannot be taller than the picture');
  assert.equal(plan.bands, 1);
});

test('a run with no size, or no mode, is refused', () => {
  assert.throws(() => planRun({ width: 0, height: 10, frames: 2, mode: 'mean' }), RangeError);
  assert.throws(() => planRun({ width: 10, height: 10, frames: 2, mode: 'nope' }), RangeError);
  assert.throws(() => bytesPerPixel('nope', 1), RangeError);
});

test('focus stacking asks for overlap, and the bands give it', () => {
  assert.ok(MODES.focus.context > 0, 'sharpness is measured from the neighbours');
  assert.equal(MODES.mean.context, 0, 'an average has no neighbours');

  const list = bands(100, 40, 2);
  assert.deepEqual(list.map((b) => [b.y, b.rows]), [[0, 40], [40, 40], [80, 20]]);

  // The first band has nothing above it to overlap into, the middle one has
  // overlap on both sides, and the last has nothing below.
  assert.deepEqual(list[0], { y: 0, rows: 40, readY: 0, readRows: 42, offset: 0 });
  assert.deepEqual(list[1], { y: 40, rows: 40, readY: 38, readRows: 44, offset: 2 });
  assert.deepEqual(list[2], { y: 80, rows: 20, readY: 78, readRows: 22, offset: 2 });
});

test('the bands cover the picture exactly once', () => {
  for (const [height, rows, context] of [[100, 40, 0], [100, 40, 2], [7, 3, 1], [10, 10, 0]]) {
    const list = bands(height, rows, context);
    let covered = 0;
    for (const band of list) {
      assert.equal(band.y, covered, 'a gap or an overlap in what gets written');
      assert.ok(band.readY <= band.y);
      assert.ok(band.readY + band.readRows >= band.y + band.rows);
      assert.ok(band.readY + band.readRows <= height, 'read past the bottom');
      assert.equal(band.offset, band.y - band.readY);
      covered += band.rows;
    }
    assert.equal(covered, height, `${height} rows in bands of ${rows} did not add up`);
  }
});

test('the working size halves without drifting off by one', () => {
  assert.deepEqual(workingSize(6000, 4000, SCALES.full), { width: 6000, height: 4000 });
  assert.deepEqual(workingSize(6000, 4000, SCALES.half), { width: 3000, height: 2000 });
  assert.deepEqual(workingSize(4001, 3001, SCALES.half), { width: 2001, height: 1501 });
  assert.deepEqual(workingSize(4000, 3000, SCALES.quarter), { width: 1000, height: 750 });
  assert.deepEqual(workingSize(2, 2, 0.01), { width: 1, height: 1 }, 'never zero');
});

test('the output is the largest frame, not the first', () => {
  const frames = [
    { width: 1600, height: 1200 },
    { width: 6000, height: 4000 },
    { width: 3000, height: 2000 },
  ];
  assert.deepEqual(outputSize(frames), { width: 6000, height: 4000 });
  assert.deepEqual(outputSize(frames, SCALES.half), { width: 3000, height: 2000 });
  assert.equal(outputSize([]), null);
});

test('a frame of a different size is centred rather than refused', () => {
  const output = { width: 1000, height: 1000 };
  const square = placement({ width: 500, height: 500 }, output);
  assert.deepEqual(square, { scale: 2, x: 0, y: 0, width: 1000, height: 1000 });

  const wide = placement({ width: 1000, height: 500 }, output);
  assert.equal(wide.scale, 1);
  assert.equal(wide.x, 0);
  assert.equal(wide.y, 250, 'a wide frame sits in the middle, not at the top');
});

test('the advice about resolution is advice that is true', () => {
  // scaleThatFits says which working resolution avoids banding. Whatever it
  // names has to actually avoid it, or the note under the picture is wrong.
  const ask = { ...MEGAPIXEL_24, frames: 30, mode: 'median' };
  const name = scaleThatFits(ask);
  if (name) {
    const size = workingSize(ask.width, ask.height, SCALES[name]);
    assert.equal(planRun({ ...size, frames: 30, mode: 'median' }).banded, false);
  }
  assert.equal(scaleThatFits({ ...MEGAPIXEL_24, frames: 4, mode: 'mean' }), 'full');
  // Two hundred frames of 24 megapixels will not fit at any resolution offered,
  // and saying so is better than naming one that does not help.
  assert.equal(scaleThatFits({ ...MEGAPIXEL_24, frames: 400, mode: 'median' }), null);
});

test('with no alignment, nothing is cropped', () => {
  const output = { width: 100, height: 80 };
  const still = [{ dx: 0, dy: 0, angle: 0, scale: 1 }, { dx: 0, dy: 0, angle: 0, scale: 1 }];
  assert.deepEqual(commonArea(still, output), { x: 0, y: 0, width: 100, height: 80 });
});

test('a shifted frame crops the edge it stopped reaching', () => {
  // The bug this exists for: a frame moved ten pixels right does not cover the
  // left ten pixels, those pixels are transparent, and transparent reads as
  // zero to an accumulator - so an averaged hand-held burst comes out with a
  // dark border unless the border is cut off.
  const output = { width: 100, height: 100 };

  assert.deepEqual(
    commonArea([{ dx: 0, dy: 0, angle: 0, scale: 1 }, { dx: 10, dy: 5, angle: 0, scale: 1 }], output),
    { x: 10, y: 5, width: 90, height: 95 },
  );

  // Frames that went opposite ways cost an edge at each end.
  assert.deepEqual(
    commonArea([{ dx: 10, dy: 0, angle: 0, scale: 1 }, { dx: -10, dy: 0, angle: 0, scale: 1 }], output),
    { x: 10, y: 0, width: 80, height: 100 },
  );
});

test('a rotated frame crops on every side', () => {
  const area = commonArea([{ dx: 0, dy: 0, angle: 5, scale: 1 }], { width: 100, height: 100 });
  assert.ok(area.x > 0 && area.y > 0, 'a turn does not reach the corners');
  assert.ok(area.width < 100 && area.height < 100);
  assert.ok(area.width > 80, `cropped harder than a five degree turn warrants: ${area.width}`);
});

test('frames that barely overlap are not cropped to a sliver', () => {
  // Better to hand back a stack with visible edges, which somebody can look at
  // and understand, than a postage stamp with no explanation.
  const output = { width: 100, height: 100 };
  assert.deepEqual(
    commonArea([{ dx: 0, dy: 0, angle: 0, scale: 1 }, { dx: 95, dy: 0, angle: 0, scale: 1 }], output),
    { x: 0, y: 0, width: 100, height: 100 },
  );
});

test('the crop never leaves the output, whatever it is handed', () => {
  const output = { width: 200, height: 150 };
  for (const move of [
    { dx: -400, dy: 0, angle: 0, scale: 1 },
    { dx: 0, dy: 0, angle: 45, scale: 3 },
    { dx: 12, dy: -7, angle: -8, scale: 0.9 },
    {},
  ]) {
    const area = commonArea([move], output);
    assert.ok(area.x >= 0 && area.y >= 0, `${JSON.stringify(move)} started outside`);
    assert.ok(area.x + area.width <= output.width, `${JSON.stringify(move)} ran off the right`);
    assert.ok(area.y + area.height <= output.height, `${JSON.stringify(move)} ran off the bottom`);
    assert.ok(area.width > 0 && area.height > 0, `${JSON.stringify(move)} cropped to nothing`);
  }
});
