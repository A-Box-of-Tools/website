/**
 * Where the four dots start: measured off the photograph, not assumed.
 *
 * This tool spent its first version refusing to do this, and the refusal was
 * about one thing: shipping a model. A face detector is weights to download, an
 * inference runtime to run them in, and a failure mode that is uneven - the
 * published detectors are measurably worse on some faces than on others, and
 * the people whose photographs already get rejected most often are the ones a
 * bad one lets down. None of that has stopped being true, so none of it is
 * here. There is no model in this file, nothing is fetched, and the arithmetic
 * below is the same arithmetic for every face put through it.
 *
 * What is here instead is the observation that an ID photograph is not an
 * arbitrary picture. Every specification in specs.js demands the same scene: one
 * person, facing the camera, against a plain evenly-lit wall. That is a far
 * stronger constraint than any detector gets to assume, and it makes three of
 * the four points findable with nothing but subtraction:
 *
 *   - THE CROWN comes from the wall. Read the colour of the border of the
 *     picture, mark every pixel that is not that colour, take the largest
 *     connected run of them, and the top of it is the top of the head, hair
 *     included - which is the point people most often get wrong by hand,
 *     because they mark the hairline.
 *   - THE EYES come from contrast within the face rather than from skin colour.
 *     A pupil is a small dark patch with lighter face to its left, to its right
 *     and below it, well inside the outline of the head; what is scored is how
 *     much darker it is than its own surroundings, so nothing here has an
 *     opinion about what colour a face is meant to be. Two of them are wanted,
 *     level with each other and either side of the middle of the head, which is
 *     what stops a nostril or a shadow winning. The two things that beat it on
 *     the first real photograph - a hairline, and hair running down beside a
 *     cheek - are why those conditions are as specific as they are, and
 *     findEyes says which is for which.
 *   - THE CHIN is the one that cannot honestly be found this way. A jaw against
 *     a neck is a soft edge with no colour change across it, and hair down the
 *     sides removes even the outline. So it is worked out - the pupils sit at
 *     very close to half the height of a head, crown to chin - and then checked
 *     against the point where the silhouette falls away into the neck. When the
 *     two agree it is measured; when they do not, the page says the chin was a
 *     proportion rather than a finding.
 *
 * WHICH IS WHY NOTHING HERE IS FINAL. Every one of those steps has a photograph
 * it is wrong on: a patterned wall, a head cropped at the top, spectacles, a
 * heavy fringe, a beard the colour of the shadow under it. The dots stay
 * draggable, the page says which of the four were measured and which were
 * assumed, and the crop is taken from where the dots end up - never from where
 * this file put them. A starting position that is right most of the time and
 * says when it is unsure is worth having. One presented as a measurement would
 * not be.
 *
 * Everything below is arithmetic over a pixel array: no canvas, no DOM, no
 * network, and no sentence a visitor reads. Where it has something to say it
 * returns a key, and main.js looks the words up in the markup.
 */

import { deltaE, rgbToLab } from './background.js';

/**
 * The long edge of the picture this reads.
 *
 * Small on purpose. Every measurement here is a shape - the outline of a head,
 * a patch darker than its surroundings - and none of them is different in kind
 * at 480 pixels than at 4000, while the work is seventy times less.
 *
 * It is not smaller than that because of one measurement, and it is worth
 * saying which: the eyes. On an upright photograph the long edge is the height,
 * so 480 leaves about 360 across, a head around 160 wide and an iris about
 * seven pixels of it. Seven is enough to tell an eye from the eyebrow above it.
 * At 320 - which is plenty for the outline, and was the first choice here -
 * that iris is four pixels, the browser's own downscale has blurred it into the
 * white around it, and the brows win. The outline never noticed the difference;
 * the eye line came out two millimetres high on a 45 mm photograph.
 */
export const WORKING_EDGE = 480;

/** A head narrower than this has too few pixels in it to measure anything on. */
const SMALLEST_HEAD = 24;

/**
 * How far down a head its pupils sit, crown to chin.
 *
 * Adult anthropometry puts the pupils within a couple of millimetres of the
 * halfway point of the head, and hair moves the crown up without moving the
 * ratio much: 0.49 is the middle of the range the published figures give, and
 * being a per cent out on it costs about two millimetres of chin on a 45 mm
 * photograph - which the page then measures and reports rather than hiding.
 */
const EYE_LEVEL = 0.49;

/** Head height as a multiple of head width, hair included in both. */
const HEAD_SHAPE = 1.45;

/**
 * The jaw, as a fraction of the width of the head, and where that lands.
 *
 * The outline is followed down until it has lost three tenths of its width -
 * and that point is NOT the chin, it is somewhere up the jaw, because a head
 * narrows gradually. How far up is worth doing properly rather than fudging:
 * treat the lower half of a head as an ellipse and a width of 0.70 is reached
 * at 0.5 + 0.5 * sqrt(1 - 0.70 * 0.70) = 0.857 of the way down it. Undoing that
 * is what turns a crossing point into a chin. Without it the outline reads
 * every head as seven per cent short, which on a 45 mm photograph is three
 * millimetres of head height - most of one country's whole tolerance.
 */
const JAW_WIDTH = 0.70;
const JAW_LEVEL = 0.5 + 0.5 * Math.sqrt(1 - JAW_WIDTH * JAW_WIDTH);

/**
 * The boxes an eye is looked for in, as fractions of the width of the head:
 * across, then down.
 *
 * Three, and the smallest is the one that matters. An eye is not a dark patch;
 * it is a small dark IRIS with bright sclera either side of it, and a box drawn
 * around the whole opening averages that white back in until the eye is barely
 * darker than the cheek. An iris is about a twelfth of the width of a head, so
 * the first box is a square roughly that size, and it lands inside the iris
 * with the sclera outside it where it belongs - which turns a diluted patch
 * into the strongest thing on the face.
 *
 * The other two are wider and flatter, for eyes that show little white: a
 * squint, a smile, a photograph taken in bright sun. Three sweeps of a summed
 * table is a few milliseconds and the best answer of the three wins.
 *
 * They are fractions of the head rather than the face because the head is what
 * the outline gives. Under a lot of hair the head is half as wide again as the
 * face, which is the other reason for a spread rather than one size.
 */
const EYE_BOXES = [[0.055, 0.055], [0.09, 0.06], [0.14, 0.085]];

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

/** The value a given fraction of the way through an already-sorted array. */
function at(sorted, fraction) {
  if (!sorted.length) return 0;
  return sorted[clamp(Math.round((sorted.length - 1) * fraction), 0, sorted.length - 1)];
}

const median = (values) => at([...values].sort((a, b) => a - b), 0.5);

/**
 * @typedef {object} Finding
 * @property {import('./geometry.js').Marks|null} marks  in the pixels handed in
 * @property {'measured'|'rough'|'none'} quality
 * @property {string[]} notes   keys naming whatever could not be measured
 */

/**
 * Find the crown, the chin and both pupils on one decoded picture.
 *
 * @param {{data: Uint8ClampedArray, width: number, height: number}} image
 * @returns {Finding}
 */
export function findMarks(image) {
  const { width, height } = image;
  if (!width || !height) return nothing();

  const lab = labField(image);
  const wall = readWall(lab, width, height);
  // Past this there is no wall: the border of the picture is as varied as the
  // middle of it, so no threshold separates a person from anything, and the
  // outline that came back would be the shape of the room. It is the one place
  // this file gives up completely rather than answering with a caveat.
  if (!wall || wall.noise > 25) return nothing();

  const blob = subjectOf(lab, wall, width, height);
  if (!blob || blob.area < width * height * 0.04) return nothing();

  const crownY = crownOf(blob.rows, height);
  if (crownY < 0) return nothing();

  const shape = silhouette(blob.rows, crownY, height);
  if (shape.headWidth < SMALLEST_HEAD) return nothing();

  const notes = [];
  // A head already touching the top edge has had its crown cropped off, so the
  // topmost row of the silhouette is where the photograph ends rather than
  // where the head does. It is still the best place to put the dot, and the
  // page still has to say that it was not found.
  const cropped = crownY === 0;
  if (cropped) notes.push('top');
  // A wall this uneven is a wall a head cannot be cut out from. The figure is
  // the one the background check calls "not one flat colour"; there it is
  // advice, here it is the difference between an outline and a guess. It is not
  // worth reporting on a photograph whose head runs off the top, because there
  // the border that was sampled is partly head - the reading is about the
  // cropping, which has already been said, rather than about the wall.
  if (wall.noise > 12 && !cropped) notes.push('background');

  const centreX = centreOf(blob, crownY, shape.head, height);
  const eyes = findEyes(lab, blob.mask, width, height, { crownY, centreX, ...shape });
  if (!eyes) notes.push('eyes');

  const eyeY = eyes ? (eyes.left.y + eyes.right.y) / 2 : crownY + EYE_LEVEL * shape.head;
  const eyeX = eyes ? (eyes.left.x + eyes.right.x) / 2 : centreX;

  // The chin, from the proportion, then checked against the silhouette. The
  // check is only allowed to move it a little: an outline that disagrees by
  // more than a sixth is not a jaw, it is hair, a collar or a shadow, and
  // averaging that in would drag a fair estimate towards a bad one.
  let chinY = crownY + (eyeY - crownY) / EYE_LEVEL;
  const outlined = shape.jawY > eyeY
    ? crownY + (shape.jawY - crownY) / JAW_LEVEL
    : -1;
  if (outlined > 0 && Math.abs(outlined - chinY) <= (chinY - crownY) / 6) {
    chinY = (chinY + outlined) / 2;
  } else {
    notes.push('chin');
  }

  const marks = {
    crown: { x: crownXOf(blob, crownY, height, centreX), y: crownY },
    chin: { x: eyeX, y: chinY },
    leftEye: eyes ? eyes.left : { x: eyeX - 0.20 * shape.headWidth, y: eyeY },
    rightEye: eyes ? eyes.right : { x: eyeX + 0.20 * shape.headWidth, y: eyeY },
  };

  return {
    marks: contain(marks, width, height),
    quality: notes.length ? 'rough' : 'measured',
    notes,
  };
}

/**
 * Nothing was found.
 *
 * One answer for every way of failing, and it always names the background,
 * because every one of those ways is the same way: the wall behind the person
 * was not plain enough to find a person against. Handing back a guess with a
 * confident shape would be worse than handing back nothing.
 */
const nothing = () => ({ marks: null, quality: 'none', notes: ['background'] });

/** Every mark rounded, and inside the picture it was found on. */
function contain(marks, width, height) {
  return Object.fromEntries(Object.entries(marks).map(([key, point]) => [key, {
    x: clamp(Math.round(point.x), 0, width - 1),
    y: clamp(Math.round(point.y), 0, height - 1),
  }]));
}

/* ---------------------------------------------------------------- the wall */

/** The whole picture in CIE Lab, one triple per pixel, laid out flat. */
function labField({ data, width, height }) {
  const lab = new Float32Array(width * height * 3);
  for (let i = 0, p = 0; i < width * height; i += 1, p += 4) {
    const [l, a, b] = rgbToLab([data[p], data[p + 1], data[p + 2]]);
    lab[i * 3] = l;
    lab[i * 3 + 1] = a;
    lab[i * 3 + 2] = b;
  }
  return lab;
}

/** A border pixel further than this from the wall's colour is not wall at all. */
const NOT_WALL = 25;

/**
 * What colour the wall is, and how far from that colour the wall itself gets.
 *
 * The median rather than the average, because the average of a border that
 * caught a shoulder is a colour that is neither the wall nor the shoulder.
 *
 * The second number is the one every threshold below is set from, and getting
 * it right means separating two things that look identical in a single figure:
 * a wall with a shadow on it, and a border with a head in it. So the pixels
 * that are plainly not wall are set aside before it is taken. Without that, a
 * photograph framed tightly enough to put hair in the top corners reads as an
 * impossible background and the whole picture is refused - when in fact the
 * wall was perfectly plain and it was the framing that was tight.
 *
 * If most of the border is in that discarded pile there is no wall to speak of,
 * and null says so.
 */
function readWall(lab, width, height) {
  const edgeX = Math.max(2, Math.round(width * 0.06));
  const edgeY = Math.max(2, Math.round(height * 0.06));
  const seen = [];

  for (let y = 0; y < height; y += 1) {
    const flanking = y < height * 0.6;
    for (let x = 0; x < width; x += 1) {
      if (!(y < edgeY || (flanking && (x < edgeX || x >= width - edgeX)))) continue;
      const i = (y * width + x) * 3;
      seen.push([lab[i], lab[i + 1], lab[i + 2]]);
    }
  }

  if (seen.length < 64) return null;
  const colour = [0, 1, 2].map((channel) => median(seen.map((one) => one[channel])));
  const away = seen.map((one) => deltaE(one, colour)).sort((a, b) => a - b);
  const wall = away.filter((one) => one <= NOT_WALL);
  if (wall.length < away.length / 2) return null;
  return { lab: colour, noise: at(wall, 0.9) };
}

/* ------------------------------------------------------------- the outline */

/**
 * The head, as the highest substantial run of pixels that are not the wall.
 *
 * Connected rather than merely different, so a dark corner or a mark on the
 * paint cannot be part of a head.
 *
 * HIGHEST RATHER THAN LARGEST, which is not the obvious choice and is the one
 * that survives real photographs. The largest thing in a head-and-shoulders
 * picture is the shoulders, and they are not always joined to the head: a neck
 * in shadow, or a collar the colour of the wall, breaks the run in two and
 * leaves the bigger half - the one with no face in it - looking exactly like
 * the subject. Whereas in every photograph any of these rules would accept, the
 * topmost substantial thing in the frame is somebody's head.
 *
 * "Substantial" is doing real work in that sentence, and is two conditions: a
 * quarter of the size of the biggest run, so a speck of noise cannot outrank a
 * person by being nearer the ceiling, and a bounding box at least a seventh of
 * the picture tall, which is what a band of shadow along the top edge fails.
 *
 * @returns {{rows: Int32Array, sumX: Float64Array, area: number, mask: Uint8Array}|null}
 */
function subjectOf(lab, wall, width, height) {
  const count = width * height;
  const limit = clamp(wall.noise * 2.2, 8, 26);

  const fore = new Uint8Array(count);
  const pixel = [0, 0, 0];
  for (let i = 0; i < count; i += 1) {
    pixel[0] = lab[i * 3];
    pixel[1] = lab[i * 3 + 1];
    pixel[2] = lab[i * 3 + 2];
    if (deltaE(pixel, wall.lab) > limit) fore[i] = 1;
  }

  // Flood filled from an explicit stack rather than by recursion: a foreground
  // that is most of the picture is a hundred thousand pixels deep, and the call
  // stack is the one part of this that would not survive it.
  const label = new Int32Array(count).fill(-1);
  const stack = new Int32Array(count);
  const areas = [];
  const tops = [];
  const bottoms = [];

  for (let seed = 0; seed < count; seed += 1) {
    if (!fore[seed] || label[seed] !== -1) continue;
    const id = areas.length;
    areas.push(0);
    tops.push(height);
    bottoms.push(0);

    let top = 0;
    stack[top] = seed;
    top += 1;
    label[seed] = id;

    while (top > 0) {
      top -= 1;
      const here = stack[top];
      areas[id] += 1;
      const x = here % width;
      const y = (here - x) / width;
      if (y < tops[id]) tops[id] = y;
      if (y > bottoms[id]) bottoms[id] = y;

      if (x > 0 && fore[here - 1] && label[here - 1] === -1) {
        label[here - 1] = id;
        stack[top] = here - 1;
        top += 1;
      }
      if (x + 1 < width && fore[here + 1] && label[here + 1] === -1) {
        label[here + 1] = id;
        stack[top] = here + 1;
        top += 1;
      }
      if (y > 0 && fore[here - width] && label[here - width] === -1) {
        label[here - width] = id;
        stack[top] = here - width;
        top += 1;
      }
      if (y + 1 < height && fore[here + width] && label[here + width] === -1) {
        label[here + width] = id;
        stack[top] = here + width;
        top += 1;
      }
    }
  }

  if (!areas.length) return null;

  let largest = 0;
  for (const area of areas) largest = Math.max(largest, area);

  let winner = areas.indexOf(largest);
  let highest = height;
  for (let id = 0; id < areas.length; id += 1) {
    if (areas[id] < largest * 0.25) continue;
    if (bottoms[id] - tops[id] < height * 0.14) continue;
    if (tops[id] < highest) {
      highest = tops[id];
      winner = id;
    }
  }

  const rows = new Int32Array(height);
  const sumX = new Float64Array(height);
  const mask = new Uint8Array(count);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (label[y * width + x] !== winner) continue;
      mask[y * width + x] = 1;
      rows[y] += 1;
      sumX[y] += x;
    }
  }

  fillHoles(mask, stack, width, height);
  return { rows, sumX, area: areas[winner], mask };
}

/**
 * Close up the parts of a person that read as wall.
 *
 * A mask made by subtracting a colour has holes in it wherever the person
 * happens to be that colour, and on a light background the brightest thing on a
 * face is the white of an eye. So the eyes come out as two holes punched
 * through the head - which is fine for measuring an outline and fatal for the
 * one thing the mask is otherwise used for, deciding whether a candidate for a
 * pupil is inside the head or on the edge of it. Every eye was on the edge of a
 * hole, and none of them was found.
 *
 * The distinction that fixes it is enclosure rather than colour: paint from the
 * border of the picture inwards through everything that is not the person, and
 * whatever is left unpainted is surrounded by them. It is their eye, or a
 * highlight on their forehead, or a gap in their hair, and all three are inside
 * a head. The row counts above are deliberately taken BEFORE this runs: the
 * outline of a head is what it is, and filling it in must not change the width
 * anything is measured against.
 */
function fillHoles(mask, stack, width, height) {
  const count = width * height;
  const wall = new Uint8Array(count);
  let top = 0;

  const reach = (at) => {
    if (mask[at] || wall[at]) return;
    wall[at] = 1;
    stack[top] = at;
    top += 1;
  };

  for (let x = 0; x < width; x += 1) {
    reach(x);
    reach((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    reach(y * width);
    reach(y * width + width - 1);
  }

  while (top > 0) {
    top -= 1;
    const here = stack[top];
    const x = here % width;
    const y = (here - x) / width;
    if (x > 0) reach(here - 1);
    if (x + 1 < width) reach(here + 1);
    if (y > 0) reach(here - width);
    if (y + 1 < height) reach(here + width);
  }

  for (let i = 0; i < count; i += 1) if (!wall[i]) mask[i] = 1;
}

/**
 * The first row that is head rather than speckle.
 *
 * Three rows in a row, each with three pixels in it: enough that one bright
 * dot of sensor noise cannot be the top of somebody's head, and little enough
 * that a wisp of hair still counts as hair.
 */
function crownOf(rows, height) {
  for (let y = 0; y + 2 < height; y += 1) {
    if (rows[y] >= 3 && rows[y + 1] >= 3 && rows[y + 2] >= 3) return y;
  }
  return -1;
}

/** The x the head sits at, near the top of it, for the crown dot. */
function crownXOf(blob, crownY, height, fallback) {
  const span = Math.max(2, Math.round(height * 0.03));
  let count = 0;
  let total = 0;
  for (let y = crownY; y < Math.min(height, crownY + span); y += 1) {
    count += blob.rows[y];
    total += blob.sumX[y];
  }
  return count ? total / count : fallback;
}

/** The x the face sits at, taken across the middle of the head. */
function centreOf(blob, crownY, head, height) {
  const from = Math.max(0, Math.round(crownY + 0.25 * head));
  const to = Math.min(height, Math.round(crownY + 0.65 * head));
  let count = 0;
  let total = 0;
  for (let y = from; y < to; y += 1) {
    count += blob.rows[y];
    total += blob.sumX[y];
  }
  return count ? total / count : 0;
}

/** A row profile with its noise taken out, so a slope can be read off it. */
function smoothed(rows, span) {
  const out = new Float64Array(rows.length);
  for (let y = 0; y < rows.length; y += 1) {
    let total = 0;
    let seen = 0;
    for (let k = -span; k <= span; k += 1) {
      if (y + k < 0 || y + k >= rows.length) continue;
      total += rows[y + k];
      seen += 1;
    }
    out[y] = total / seen;
  }
  return out;
}

/**
 * How wide the head is, how tall that makes it, and where the jaw runs into
 * the neck.
 *
 * WHERE A HEAD STOPS is the question, and there is exactly one mark of it in an
 * outline: a head widens to the ears, narrows into a neck, and then the
 * shoulders widen again. That turn - narrowest, then growing - is the neck, and
 * everything above it is head.
 *
 * The first version of this guessed instead: it assumed the head filled roughly
 * the top four tenths of what was below the crown, and took the widest row in
 * there. That is true of a photograph taken close up and false of the one this
 * tool spends its whole guide asking for - taken a metre and a half away, where
 * the head is small, the shoulders are wide, and they begin well inside the top
 * four tenths. The widest row was then a shoulder, the head came out twice its
 * real width, and every box the eyes were looked for in was too big to find
 * one.
 *
 * Walking down and watching for the turn costs the same single pass and needs
 * no guess about proportions at all. Hair long enough to hide the neck leaves
 * no turn to find, and then this falls back to the widest row there was, which
 * is the honest answer for an outline that has no neck in it.
 */
function silhouette(rows, crownY, height) {
  const profile = smoothed(rows, Math.max(1, Math.round(height * 0.008)));
  const below = height - crownY;

  let peak = 0;
  let valley = Infinity;
  let neckY = -1;
  let end = height;

  for (let y = crownY; y < height; y += 1) {
    const at = profile[y];
    // Still on the way to the widest part of the head.
    if (neckY < 0 && at >= peak) {
      peak = at;
      continue;
    }
    // Past it, and narrowing: this is the jaw and then the neck.
    if (at < peak * 0.85) {
      if (at <= valley) {
        valley = at;
        neckY = y;
      } else if (at > valley * 1.35) {
        // Widening again, by more than noise. Shoulders.
        end = y;
        break;
      }
    }
  }

  const head = clamp(peak * HEAD_SHAPE, 0.1 * below, 0.95 * below);
  return { headWidth: peak, head, neckY, jawY: jawOf(profile, crownY, head, peak, end) };
}

/**
 * Where the outline falls away into the neck.
 *
 * Looked for only below the middle of the head, because above it the widest
 * thing in the picture is hair and the narrowing under it is a forehead, not a
 * jaw; and never below the shoulders, because a shoulder is not a jaw however
 * much the arithmetic would like it to be. On a head with hair down past the
 * shoulders there is no fall at all, and -1 says so rather than naming a row
 * that means nothing.
 */
function jawOf(profile, crownY, head, widest, end) {
  if (widest <= 0) return -1;
  const from = Math.max(0, Math.round(crownY + 0.55 * head));
  const to = Math.min(end, Math.round(crownY + 1.45 * head));

  for (let y = from; y < to; y += 1) {
    if (profile[y] < widest * JAW_WIDTH) return y;
  }
  return -1;
}

/* ---------------------------------------------------------------- the eyes */

/**
 * The two pupils, as the best pair of small dark patches in the face.
 *
 * WHAT IS SCORED. Not darkness, which would find hair and the shadow under a
 * chin, but darkness *relative to what is beside and below it*. Because the
 * comparison is local, nothing in it depends on how light or dark the face is -
 * a patch twelve units darker than its own surroundings scores twelve on every
 * face there is, which is the whole reason it is written this way rather than
 * as a model of what skin looks like.
 *
 * AGAINST THE WORST NEIGHBOUR, NOT THEIR AVERAGE, and that is the difference
 * between this working and not. An eye has lighter face to its left, to its
 * right and below it: three sides, all light. The bottom edge of a head of hair
 * has hair to its left, hair to its right and forehead below it - and averaging
 * the four sides together lets that one bright forehead carry three dark ones.
 * Hair is far darker against skin than an iris is, so the average scored the
 * hairline above the eyes and put the whole face two features high on the first
 * real photograph it met. Taking the WORST of the three sides costs nothing and
 * asks the question that actually separates them: is this patch dark on its
 * own, or is it a piece of something bigger that is dark?
 *
 * Above is deliberately not one of the three. On a heavy fringe, and on anybody
 * whose brow sits low, what is above an eye is hair or eyebrow, and demanding
 * light there would reject the eyes of the people hardest to place by hand.
 *
 * AND ENTIRELY INSIDE THE HEAD, which is the other half of it. Hair running
 * down beside a cheek is a narrow dark band with the wall on one side of it and
 * a face on the other, and by every test above it looks exactly like an eye -
 * it outscored the real ones on the second photograph tried. But it lies on the
 * edge of the silhouette, and an eye never does: so a candidate is only
 * considered when it and all three of its neighbours are wholly inside the run
 * of pixels that is the person. The outline is doing a second job here, and it
 * is the constraint no amount of local contrast could have supplied.
 *
 * WHY A PAIR. Singly, the best-scoring patch on a face is as often a nostril or
 * the corner of a mouth. Two of them, level with each other, either side of the
 * middle of the head and the right distance apart, is a face - and asking for
 * all of that at once costs one loop and throws out nearly every wrong answer a
 * single patch would have given.
 *
 * WHY THE LOWER PAIR WINS. Eyebrows are the one thing left that beats eyes at
 * this game: darker, larger and no less paired, with light skin either side of
 * them and below. So when a second pair is found close below the first and is
 * not much worse, the lower one is taken - brows sit above eyes on everybody,
 * and a dot on a brow puts the eye line about two millimetres high on a 45 mm
 * photograph. The smallest of the boxes below helps here on its own: a box the
 * size of an iris, sitting in the middle of a brow, has more brow to its left
 * and right and so scores nothing, while the same box on an iris has sclera on
 * both sides.
 *
 * @returns {{left: {x: number, y: number}, right: {x: number, y: number}}|null}
 */
function findEyes(lab, mask, width, height, face) {
  const { crownY, centreX, headWidth, head } = face;

  const x0 = Math.max(0, Math.round(centreX - 0.58 * headWidth));
  const x1 = Math.min(width, Math.round(centreX + 0.58 * headWidth));
  const y0 = Math.max(0, Math.round(crownY + 0.15 * head));
  const y1 = Math.min(height, Math.round(crownY + 0.85 * head));
  const w = x1 - x0;
  const h = y1 - y0;
  if (w < 20 || h < 14) return null;

  // What the lit part of the face reads as. The upper end of the window rather
  // than its average, because a good part of the window is hair, brow and
  // shadow, and the average of those is not what an eye is dark against.
  const lights = [];
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) lights.push(lab[(y * width + x) * 3]);
  }
  lights.sort((a, b) => a - b);
  const skin = at(lights, 0.75);

  const dark = new Float64Array(w * h);
  const outside = new Float64Array(w * h);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const at3 = (y + y0) * width + (x + x0);
      dark[y * w + x] = Math.max(0, skin - lab[at3 * 3]);
      outside[y * w + x] = mask[at3] ? 0 : 1;
    }
  }

  const sums = integral(dark, w, h);
  const off = integral(outside, w, h);
  const localCentre = centreX - x0;

  let best = null;
  for (const [across, down] of EYE_BOXES) {
    const bw = clamp(Math.round(across * headWidth), 3, Math.floor(w / 5));
    const bh = clamp(Math.round(down * headWidth), 2, Math.floor(h / 5));
    const pair = bestPair(scan(sums, off, w, h, bw, bh), bw, headWidth, localCentre);
    if (pair && (!best || pair.score > best.score)) best = { ...pair, bw, bh };
  }

  if (!best) return null;
  return {
    left: pupil(dark, w, h, best.l, best.bw, best.bh, x0, y0),
    right: pupil(dark, w, h, best.r, best.bw, best.bh, x0, y0),
  };
}

/**
 * Every box in the window, scored against the worst of the three sides that
 * ought to be lighter than it.
 *
 * The sweep starts a box in from the left and stops a box short of the right
 * and of the bottom, so all three neighbours are real picture rather than a
 * clamped sliver; and a box whose neighbourhood strays off the silhouette is
 * skipped before it is scored at all, because whatever it is, it is not an eye.
 */
function scan(sums, off, w, h, bw, bh) {
  const mean = (ax, ay, bx, by) => patch(sums, w, ax, ay, bx, by) / ((bx - ax) * (by - ay));
  const found = [];

  for (let y = 0; y + 2 * bh <= h; y += 1) {
    for (let x = bw; x + 2 * bw <= w; x += 1) {
      // One lookup, and it throws out every candidate on the edge of the head.
      if (patch(off, w, x - bw, y, x + 2 * bw, y + 2 * bh) > 0) continue;
      const inner = mean(x, y, x + bw, y + bh);
      if (inner <= 0) continue;
      const beside = Math.max(
        mean(x - bw, y, x, y + bh),
        mean(x + bw, y, x + 2 * bw, y + bh),
        mean(x, y + bh, x + bw, y + 2 * bh),
      );
      if (inner > beside) found.push({ x, y, score: inner - beside });
    }
  }
  return found;
}

/** The best two boxes that could be a pair of eyes, at one box size. */
function bestPair(found, bw, headWidth, localCentre) {
  const apart = 0.06 * headWidth;
  const left = pick(found.filter((one) => one.x + bw / 2 < localCentre - apart), bw, bw);
  const right = pick(found.filter((one) => one.x + bw / 2 > localCentre + apart), bw, bw);

  const pairs = [];
  for (const l of left) {
    for (const r of right) {
      const gap = r.x - l.x;
      if (gap < 0.24 * headWidth || gap > 0.62 * headWidth) continue;
      const level = Math.abs(r.y - l.y);
      if (level > 0.12 * headWidth) continue;
      const off = Math.abs((l.x + r.x + bw) / 2 - localCentre);
      pairs.push({
        l,
        r,
        y: (l.y + r.y) / 2,
        // Level and centred are not conditions the pair either meets or fails -
        // a face turned a few degrees meets neither exactly - so they scale the
        // score rather than gating it, and a slightly crooked pair of eyes
        // still beats a perfectly level pair of nostrils.
        score: (l.score + r.score)
          * (1 - 0.5 * clamp(level / (0.12 * headWidth), 0, 1))
          * (1 - 0.4 * clamp(off / (0.20 * headWidth), 0, 1)),
      });
    }
  }

  if (!pairs.length) return null;
  pairs.sort((a, b) => b.score - a.score);

  // Below this the winner is not a feature, it is the best-scoring piece of an
  // evenly lit cheek, and a photograph with no findable eyes on it should say
  // so rather than put two dots somewhere plausible.
  let best = pairs[0];
  if (best.score < 3) return null;

  // A pupil sits roughly a seventh of a head width below its eyebrow - less of
  // one, on somebody whose hair makes the head wider than the face. Anything in
  // that window scoring nearly as well as the winner is taken to be the eyes,
  // and the winner to have been the brows.
  for (const pair of pairs) {
    const drop = pair.y - best.y;
    if (drop > 0.03 * headWidth && drop < 0.25 * headWidth && pair.score > best.score * 0.45) {
      best = pair;
      break;
    }
  }
  return best;
}

/** A summed-area table, so any rectangle's total is four lookups. */
function integral(values, width, height) {
  const sums = new Float64Array((width + 1) * (height + 1));
  for (let y = 0; y < height; y += 1) {
    let run = 0;
    for (let x = 0; x < width; x += 1) {
      run += values[y * width + x];
      sums[(y + 1) * (width + 1) + (x + 1)] = sums[y * (width + 1) + (x + 1)] + run;
    }
  }
  return sums;
}

const patch = (sums, width, ax, ay, bx, by) => (
  sums[by * (width + 1) + bx] - sums[ay * (width + 1) + bx]
  - sums[by * (width + 1) + ax] + sums[ay * (width + 1) + ax]
);

/**
 * The best few boxes on one side of the face, with the near-duplicates gone.
 *
 * Every box within half an eye of the winner is the same eye seen again, and
 * keeping them would fill the shortlist with one feature. Eight survivors is
 * more than enough for the pairing below to have a choice.
 */
function pick(boxes, bw, bh) {
  const sorted = [...boxes].sort((a, b) => b.score - a.score);
  const kept = [];
  for (const box of sorted) {
    if (kept.some((one) => Math.abs(one.x - box.x) < bw && Math.abs(one.y - box.y) < bh)) continue;
    kept.push(box);
    if (kept.length === 8) break;
  }
  return kept;
}

/** Where in its box the dark actually is, weighted, back in picture pixels. */
function pupil(dark, w, h, box, bw, bh, x0, y0) {
  let weight = 0;
  let sx = 0;
  let sy = 0;
  for (let y = box.y; y < Math.min(h, box.y + bh); y += 1) {
    for (let x = box.x; x < Math.min(w, box.x + bw); x += 1) {
      const value = dark[y * w + x];
      weight += value;
      sx += value * x;
      sy += value * y;
    }
  }
  if (!weight) return { x: x0 + box.x + bw / 2, y: y0 + box.y + bh / 2 };
  return { x: x0 + sx / weight, y: y0 + sy / weight };
}
