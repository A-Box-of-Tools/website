/**
 * tools/id-photo/src/detect.js - where the four dots start.
 *
 * The risk this file covers is not a crash. It is a photograph the tool marks
 * up confidently and wrongly: an eye line on the eyebrows, a crown on the
 * hairline, a chin in the collar. Any of those produces a crop that looks
 * right, passes every check on the page - because the checks measure the dots -
 * and is rejected six weeks later by somebody with a ruler.
 *
 * So every test here is a synthetic portrait with a known crown, chin and pair
 * of pupils, and every assertion is about how far the answer is from those, as
 * a fraction of the head. A per cent of head height is a third of a millimetre
 * on a 45 mm photograph; the tolerances below are set where a human dragging
 * the dot would land, not where the arithmetic happens to.
 *
 * The awkward ones matter more than the easy one:
 *
 *   - the same face at four skin tones and two hair colours, because a detector
 *     that is better on some faces than on others is the single reason this
 *     tool refused to have one for its first version. Nothing here reads
 *     colour: the outline is a difference from the wall and the eyes are a
 *     difference from their own surroundings, and these tests are what holds
 *     that true.
 *   - eyebrows, which outscore eyes at everything except being where eyes are;
 *   - a subject whose shoulders are a separate shape from their head, which is
 *     what a collar the colour of the wall does, and which used to make the
 *     largest thing in the picture the wrong thing;
 *   - and the pictures where the honest answer is "nothing", which have to
 *     come back as nothing rather than as four dots in the middle.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { WORKING_EDGE, findMarks } from '../../tools/id-photo/src/detect.js';

/**
 * A head-and-shoulders photograph, made out of ellipses.
 *
 * Deliberately crude - a wall, a head of hair, a face inside it, two brows, two
 * eyes, a mouth, a neck and a pair of shoulders - because what is being tested
 * is geometry rather than photography, and a fixture whose truth is a set of
 * numbers at the top of it is one whose failures can be read.
 *
 * `truth` is what a careful person dragging the dots would produce, which is
 * what the answers are compared against.
 */
function portrait({
  width = 360, height = 480,
  wall = [225, 226, 228],
  hair = [58, 44, 38],
  skin = [214, 173, 148],
  eye = [46, 38, 34],
  sclera = [242, 237, 230],
  brow = [70, 54, 46],
  crownY = 68, chinY = 281,
  faceHalf = 70,
  hairHalf = null,          // hair wider than the face, for a bushy head
  hairlineAt = 0.22,        // how far down the head the forehead starts
  eyeGap = 58,
  centreX = 180,
  neck = true,
  shoulders = 0.30,         // where they start, below the chin, in head heights
} = {}) {
  const data = new Uint8ClampedArray(width * height * 4);
  const headH = chinY - crownY;
  const headCy = crownY + headH / 2;
  const eyeY = crownY + 0.49 * headH;
  const browY = eyeY - headH * 0.085;
  const inside = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let rgb = wall;

      if (shoulders !== null && y > chinY + headH * shoulders
          && Math.abs(x - centreX) < faceHalf * 0.55 + (y - chinY - headH * shoulders) * 2.6) {
        rgb = [70, 78, 96];
      }
      if (neck && y > chinY - headH * 0.04 && y < chinY + headH * 0.34
          && Math.abs(x - centreX) < faceHalf * 0.46) rgb = [190, 150, 128];

      if (inside(x, y, centreX, headCy, hairHalf ?? faceHalf * 1.12, headH / 2)) rgb = hair;
      if (inside(x, y, centreX, headCy + headH * 0.06, faceHalf, headH * 0.43)
          && y > crownY + headH * hairlineAt) rgb = skin;

      for (const side of [-1, 1]) {
        const ex = centreX + side * eyeGap / 2;
        if (brow && Math.abs(x - ex) < headH * 0.075 && Math.abs(y - browY) < headH * 0.018) rgb = brow;
        // An eye is a small dark iris with white either side of it, not a dark
        // patch. Drawn as a dark patch, every version of this file passed and
        // the first real photograph did not: a box around the whole opening
        // averages that white back in until the iris is barely darker than a
        // cheek, and the white itself is close enough to a pale wall to be cut
        // out of the head altogether.
        if (eye && inside(x, y, ex, eyeY, headH * 0.075, headH * 0.032)) rgb = sclera;
        if (eye && inside(x, y, ex, eyeY, headH * 0.032, headH * 0.030)) rgb = eye;
      }
      if (Math.abs(x - centreX) < headH * 0.10
          && Math.abs(y - (chinY - headH * 0.19)) < headH * 0.016) rgb = [140, 84, 82];

      const at = (y * width + x) * 4;
      data[at] = rgb[0];
      data[at + 1] = rgb[1];
      data[at + 2] = rgb[2];
      data[at + 3] = 255;
    }
  }

  return {
    image: { data, width, height },
    truth: { crownY, chinY, eyeY, centreX, eyeGap, headH },
  };
}

/** A picture of one flat colour and nothing else. */
function flat(rgb, width = 360, height = 480) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = rgb[0];
    data[i * 4 + 1] = rgb[1];
    data[i * 4 + 2] = rgb[2];
    data[i * 4 + 3] = 255;
  }
  return { data, width, height };
}

/**
 * Assert every mark landed within `slack` of the truth, as a fraction of head
 * height. Reported in per cent, because that is the unit the failure is in:
 * one per cent of a 45 mm photograph is 0.45 mm.
 */
function near(found, truth, slack, what) {
  assert.ok(found.marks, `${what}: nothing was found at all`);
  const off = (value, want) => Math.abs(value - want) / truth.headH;
  const eyeY = (found.marks.leftEye.y + found.marks.rightEye.y) / 2;
  const gap = found.marks.rightEye.x - found.marks.leftEye.x;

  for (const [name, distance] of [
    ['crown', off(found.marks.crown.y, truth.crownY)],
    ['chin', off(found.marks.chin.y, truth.chinY)],
    ['eye line', off(eyeY, truth.eyeY)],
    ['eye spacing', off(gap, truth.eyeGap)],
  ]) {
    assert.ok(
      distance <= slack,
      `${what}: the ${name} is ${(distance * 100).toFixed(1)}% of head height out, `
      + `which is more than the ${(slack * 100).toFixed(0)}% allowed`,
    );
  }
}

/* ================================================================ the easy one */

test('findMarks: an ordinary portrait puts all four within a per cent', () => {
  const { image, truth } = portrait();
  const found = findMarks(image);
  assert.equal(found.quality, 'measured');
  assert.deepEqual(found.notes, []);
  near(found, truth, 0.02, 'a plain portrait');
});

test('findMarks: the crown is the top of the hair, not the hairline', () => {
  // The face starts a fifth of the way down the head; a detector that found the
  // forehead instead of the hair would be out by that much, and every head
  // would come out too small.
  const { image, truth } = portrait({ hair: [30, 22, 18] });
  const found = findMarks(image);
  assert.ok(
    Math.abs(found.marks.crown.y - truth.crownY) < truth.headH * 0.03,
    'the crown landed on the hairline rather than on the hair',
  );
});

/* ============================================================= the same face, differently */

test('findMarks: nothing about it depends on the colour of the face', () => {
  // Four skin tones across the range, each with hair and eyes that go with it.
  // The tolerance is the same for all four on purpose: a detector allowed to be
  // twice as good on one of these as on another is the thing this tool spent
  // its first version refusing to ship.
  const faces = [
    { name: 'very dark', skin: [72, 52, 42], hair: [26, 20, 18], eye: [14, 11, 10], brow: [34, 26, 22] },
    { name: 'dark', skin: [124, 88, 68], hair: [34, 26, 22], eye: [22, 17, 15], brow: [46, 35, 30] },
    { name: 'olive', skin: [190, 150, 120], hair: [60, 44, 34], eye: [40, 32, 28], brow: [72, 55, 44] },
    { name: 'very pale', skin: [244, 218, 202], hair: [206, 180, 138], eye: [72, 62, 88], brow: [184, 156, 118] },
  ];

  for (const face of faces) {
    const { image, truth } = portrait(face);
    const found = findMarks(image);
    assert.equal(found.quality, 'measured', `${face.name}: came back as ${found.quality}`);
    near(found, truth, 0.02, face.name);
  }
});

test('findMarks: a wall of any of the published colours works the same', () => {
  for (const wall of [[255, 255, 255], [248, 248, 246], [225, 226, 228], [200, 200, 202]]) {
    const { image, truth } = portrait({ wall });
    near(findMarks(image), truth, 0.02, `a ${wall.join(',')} wall`);
  }
});

test('findMarks: a head off to one side is found where it is', () => {
  const { image, truth } = portrait({ centreX: 128 });
  const found = findMarks(image);
  near(found, truth, 0.02, 'an off-centre head');
  const middle = (found.marks.leftEye.x + found.marks.rightEye.x) / 2;
  assert.ok(Math.abs(middle - truth.centreX) < truth.headH * 0.03);
});

test('findMarks: a big head and a small head are both measured, not assumed', () => {
  for (const size of [
    { crownY: 22, chinY: 337, faceHalf: 88, eyeGap: 72 },
    { crownY: 124, chinY: 247, faceHalf: 38, eyeGap: 31 },
  ]) {
    const { image, truth } = portrait(size);
    near(findMarks(image), truth, 0.03, `a head ${truth.headH} pixels tall`);
  }
});

/* ================================================================== the traps */

test('findMarks: the eye line lands on the eyes, not on the eyebrows', () => {
  // The one failure worth its own test. The brows here are wider and darker
  // than the eyes, which is true of most faces and is why the best-scoring pair
  // of dark patches on a face is usually the wrong pair.
  const { image, truth } = portrait({ brow: [40, 30, 26], eye: [58, 48, 42] });
  const found = findMarks(image);
  const eyeY = (found.marks.leftEye.y + found.marks.rightEye.y) / 2;
  const browY = truth.eyeY - truth.headH * 0.085;

  assert.ok(
    Math.abs(eyeY - truth.eyeY) < Math.abs(eyeY - browY),
    'the eye line came out nearer the eyebrows than the eyes',
  );
  near(found, truth, 0.03, 'heavy eyebrows');
});

test('findMarks: shoulders that are their own shape do not become the head', () => {
  // What a collar the colour of the wall, or a neck in shadow, does: the run of
  // not-wall pixels is in two pieces and the larger of them is the one with no
  // face in it. The head is the higher piece, which is why that is what is
  // taken.
  const { image, truth } = portrait({ neck: false });
  const found = findMarks(image);
  assert.ok(
    found.marks.crown.y < truth.crownY + truth.headH * 0.05,
    `the crown landed at ${found.marks.crown.y}, which is down on the body`,
  );
  near(found, truth, 0.03, 'a detached pair of shoulders');
});

test('findMarks: hair wider than the face does not become the eyes', () => {
  // What the first real photograph did, and neither the arithmetic nor any
  // fixture here had met: a head of hair half as wide again as the face, coming
  // down past the eyes on both sides and over the forehead to a low hairline.
  //
  // Two things about it beat the first version of this file. The bottom edge of
  // the hair is dark with a bright forehead under it, which read as a pair of
  // eyes once the four sides around it were averaged into one number - so the
  // eye line landed on the hairline and dragged the chin up with it. And the
  // hair beside each cheek is a narrow dark band with the wall on one side and a
  // face on the other, which looks like an eye from every angle except that it
  // sits on the edge of the silhouette, where an eye never does.
  const { image, truth } = portrait({ hairHalf: 104, faceHalf: 70, hairlineAt: 0.34 });
  const found = findMarks(image);
  const eyeY = (found.marks.leftEye.y + found.marks.rightEye.y) / 2;
  const hairline = truth.crownY + truth.headH * 0.34;

  assert.ok(
    Math.abs(eyeY - truth.eyeY) < Math.abs(eyeY - hairline),
    `the eye line came out at ${eyeY.toFixed(0)}, nearer the hairline (${hairline.toFixed(0)}) `
    + `than the eyes (${truth.eyeY.toFixed(0)})`,
  );
  assert.equal(found.quality, 'measured');
  near(found, truth, 0.03, 'a bushy head of hair');
});

test('findMarks: bushy hair, a low hairline and eyes with little contrast', () => {
  // The same head, with eyes only half as dark against the skin, and dark skin
  // under dark hair - the two ways the eyes have least to say for themselves.
  for (const face of [
    { name: 'low contrast', eye: [96, 78, 66], brow: [70, 56, 46] },
    { name: 'dark skin', skin: [92, 66, 54], hair: [26, 20, 18], eye: [20, 15, 13], brow: [40, 30, 26] },
  ]) {
    const { image, truth } = portrait({
      hairHalf: 104, faceHalf: 70, hairlineAt: 0.34, ...face,
    });
    near(findMarks(image), truth, 0.03, face.name);
  }
});

test('findMarks: wide shoulders are not measured as the width of a head', () => {
  // The photograph this tool spends its whole guide asking for: taken from a
  // metre and a half away, so the head is small in the frame and the shoulders
  // are wide and start not far below the chin. Deciding where a head stops by
  // assuming it fills the top of the picture put the widest row on a shoulder,
  // came out with a head twice its real width, and made every box the eyes were
  // looked for in too big to find one. A head narrows into a neck and only then
  // widens again, and that turn is what is looked for instead.
  const { image, truth } = portrait({
    crownY: 152, chinY: 280, faceHalf: 40, eyeGap: 34, shoulders: 0.25,
  });
  const found = findMarks(image);
  assert.equal(found.quality, 'measured', `notes were ${found.notes.join(',')}`);
  near(found, truth, 0.04, 'a small head over wide shoulders');
});

test('findMarks: the white of an eye is not mistaken for the wall behind it', () => {
  // A mask made by subtracting the wall colour has a hole in it wherever the
  // person is that colour, and against a white background the whitest thing on
  // a face is the white of an eye. Both eyes came out as holes punched through
  // the head, every candidate for a pupil was on the edge of one, and the eyes
  // were reported as unfindable on a photograph they are perfectly visible in.
  const { image, truth } = portrait({ wall: [253, 253, 252] });
  const found = findMarks(image);
  assert.ok(!found.notes.includes('eyes'), 'the eyes went missing into the background');
  near(found, truth, 0.03, 'a white wall behind a white sclera');
});

test('findMarks: a head cropped at the top says so rather than guessing', () => {
  const { image, truth } = portrait({ crownY: -22, chinY: 214 });
  const found = findMarks(image);
  assert.equal(found.quality, 'rough');
  assert.ok(found.notes.includes('top'), `notes were ${found.notes.join(',')}`);
  assert.equal(found.marks.crown.y, 0, 'the crown is at the edge it was cut off at');
  // The eyes are still findable on a head with no top to it, and they are what
  // most of the geometry hangs off, so they still have to be right.
  const eyeY = (found.marks.leftEye.y + found.marks.rightEye.y) / 2;
  assert.ok(Math.abs(eyeY - truth.eyeY) < truth.headH * 0.03);
});

test('findMarks: a face with no findable eyes reports that it placed them', () => {
  const { image } = portrait({ eye: null, brow: null });
  const found = findMarks(image);
  assert.equal(found.quality, 'rough');
  assert.ok(found.notes.includes('eyes'), `notes were ${found.notes.join(',')}`);
  assert.ok(found.marks, 'the outline was still worth something');
});

/* ========================================================== when to say nothing */

test('findMarks: an empty wall is nothing, not a face in the middle of it', () => {
  const found = findMarks(flat([230, 230, 230]));
  assert.equal(found.quality, 'none');
  assert.equal(found.marks, null);
  assert.deepEqual(found.notes, ['background']);
});

test('findMarks: a picture with no wall in it is refused outright', () => {
  // Every pixel a different colour: there is no background to subtract, so any
  // outline that came back would be the shape of the room. The one case where
  // this file gives up completely rather than answering with a caveat.
  const width = 360;
  const height = 480;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) {
    data[i * 4] = (i * 37) % 256;
    data[i * 4 + 1] = (i * 91) % 256;
    data[i * 4 + 2] = (i * 173) % 256;
    data[i * 4 + 3] = 255;
  }
  const found = findMarks({ data, width, height });
  assert.equal(found.quality, 'none');
  assert.equal(found.marks, null);
});

test('findMarks: an empty picture is not guessed at', () => {
  const found = findMarks({ data: new Uint8ClampedArray(0), width: 0, height: 0 });
  assert.equal(found.quality, 'none');
  assert.equal(found.marks, null);
});

/* ================================================================== the answer */

test('findMarks: every mark comes back a whole pixel inside the picture', () => {
  const { image } = portrait();
  const found = findMarks(image);
  for (const [key, point] of Object.entries(found.marks)) {
    assert.equal(point.x, Math.round(point.x), `${key}.x is not a whole pixel`);
    assert.equal(point.y, Math.round(point.y), `${key}.y is not a whole pixel`);
    assert.ok(point.x >= 0 && point.x < image.width, `${key}.x is off the picture`);
    assert.ok(point.y >= 0 && point.y < image.height, `${key}.y is off the picture`);
  }
  assert.ok(
    found.marks.leftEye.x < found.marks.rightEye.x,
    'the left eye is the one on the left as you look at the picture',
  );
});

test('findMarks: the marks are in the order geometry.js expects', () => {
  const { image } = portrait();
  assert.deepEqual(
    Object.keys(findMarks(image).marks).sort(),
    ['chin', 'crown', 'leftEye', 'rightEye'],
  );
});

test('the working size is large enough for the thing that needs it most', () => {
  // An iris is about a twentieth of the width of a head, and a head about a
  // third of the width of an upright photograph. Below roughly this figure the
  // iris is four pixels, the downscale has blurred it into the white around it,
  // and the eye line comes out on the eyebrows - which the test above would
  // catch on a fixture and nobody would catch on a photograph.
  assert.ok(WORKING_EDGE >= 480);
});
