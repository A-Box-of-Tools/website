/**
 * Finding the page in the photograph: where the four corners start.
 *
 * WHAT THIS IS NOT. It is not a model. There is nothing to download, no
 * inference runtime, no weights, and nothing fetched - the same rule the rest of
 * this site keeps, kept here because a document scanner that had to fetch a
 * segmentation network before it could straighten a payslip would be a document
 * scanner that phoned home about payslips.
 *
 * WHAT IT IS INSTEAD is the observation that a page is a rectangle, and a
 * rectangle photographed by anybody is four long straight edges with something
 * different on each side of them. That is a much stronger constraint than a
 * general object detector gets to assume, and it is enough:
 *
 *   1. shrink the photograph, because none of this is different at 480 pixels
 *      than at 4000 and the work is seventy times less;
 *   2. take the gradient, which is where the picture changes;
 *   3. let every pixel that sits on an edge vote for the straight line it would
 *      lie on - a Hough transform, but told which direction to vote in by its
 *      own gradient rather than voting for all 180 of them, which is both
 *      thirty times cheaper and much less noisy;
 *   4. pick the strong lines out of the votes, pair them into candidate
 *      rectangles, and score each candidate by walking its four sides and asking
 *      how much of each one has a real edge under it.
 *
 * Step 4 is where the useful judgement is, and it is deliberately not the votes
 * themselves. A Hough peak says "many pixels somewhere on this infinite line
 * agree"; it does not say they were between these two corners. Walking the
 * actual segments is what stops a candidate whose top edge is the top of the
 * page and whose bottom edge is a shelf three metres behind it.
 *
 * THE FOUR EDGES OF THE PICTURE ARE CANDIDATE LINES TOO, at a fixed, modest
 * support. A page held close enough to fill the frame runs off the side of the
 * photograph, and there is then no edge to find on that side because it was
 * never photographed. Refusing to consider the frame edge would fail every one
 * of those pictures; letting it in at a support a real edge easily beats means
 * it wins only when nothing else is there.
 *
 * WHEN IT DOES NOT KNOW, IT SAYS SO. A photograph of a page on a desk the same
 * colour as the page, or a page in a shadow with its edge lost in it, produces
 * candidates that score badly - and a bad best candidate comes back as `found:
 * false` with the whole frame as the quad, so the page can say "drag the corners
 * yourself" rather than confidently straightening the wrong rectangle. The
 * corners are draggable either way; nothing here is ever final.
 *
 * Everything below is arithmetic over a pixel array. No canvas, no DOM, no
 * network, and no sentence a visitor reads - where it has something to say it
 * returns a key and main.js looks the words up in the markup.
 */

import {
  clampPoint, isConvex, orderCorners, quadArea, sharpestCorner, wholeFrame,
} from './geometry.js';

/**
 * The long edge of the picture this reads.
 *
 * A page edge is a hundreds-of-pixels-long straight line at any sensible size,
 * and shrinking to 480 turns the sensor noise and the paper grain that a phone
 * photograph is full of into an average, which is exactly what the gradient
 * wants. Going smaller starts to cost real edges: at 240 a page photographed
 * from a distance has edges only two or three pixels of contrast wide, and the
 * browser's own downscale has already blurred them into the background.
 */
export const WORKING_EDGE = 480;

/** One degree per bin, which is finer than a corner handle can be dragged. */
const THETA_STEPS = 180;

/** Two pixels per bin of distance, at the working size. */
const RHO_STEP = 2;

/**
 * How far either side of a pixel's measured gradient direction its vote is
 * spread, in degrees, and what it is worth at each remove.
 *
 * Five degrees, falling off linearly. The width is not a guess: on the set of
 * synthetic photographs in tests/js/document-scanner-detect.test.js, going from
 * one degree to five takes the worst corner error from four and a half per cent
 * of the frame to under half a per cent, and every case in the set from found to
 * found accurately. Seven and above measures worse again, which is what a
 * smear wide enough to blend two genuinely different lines together would do.
 */
const SMEAR = 5;
const SMEAR_WEIGHT = [1, 0.83, 0.67, 0.5, 0.33, 0.2];

/**
 * How wide the peak belonging to one line is, in bins, when peaks are looked
 * for. Narrow in angle on purpose: with the smear above, one line makes a ridge
 * eleven bins wide, and a suppression window as wide as the ridge would also
 * swallow the edge of the page running two degrees away from it.
 */
const PEAK_THETA = 3;
const PEAK_RHO = 4;

/**
 * How many strong lines are carried into the candidate search, and how they are
 * shared out.
 *
 * A plain "strongest twenty" does not work, and the way it fails is worth
 * recording because it looks like a bug in the Hough transform and is not. Every
 * line of text on a page is a strong straight edge at the same angle as the top
 * of the page, and there are thirty of them. They take all twenty places, the
 * two side edges of the page never make the list, and there is then no pair of
 * lines at right angles to anything - the search returns nothing at all, on the
 * clearest photograph in the set.
 *
 * So the places are shared out by angle: at most a few lines from any ten degree
 * band, from at most a handful of bands. Text can crowd out other text; it
 * cannot crowd out the sides of the page.
 */
const MAX_PER_ANGLE = 4;
const MAX_ANGLE_BANDS = 6;
const ANGLE_BAND = 10;

/**
 * What the edge of the picture is worth as a candidate page edge.
 *
 * A real page edge scores far above this, so the frame only wins where there is
 * genuinely nothing else - which is the picture where the page runs off the
 * side, and is the right answer there.
 */
const BORDER_SUPPORT = 0.3;

/** A side with less than this under it is not an edge anybody photographed. */
const MIN_SIDE_SUPPORT = 0.25;

/** Below this, the answer is offered as a guess rather than as a finding. */
const ACCEPT_SCORE = 0.42;

/**
 * How one-sided the brightness step across a side has to be before that side is
 * allowed an opinion about which way the page lies.
 *
 * A real page edge is close to unanimous - every sample across it steps the same
 * way - so this is set high. It is what a picture of pure noise fails: every
 * rectangle in one has gradient along all four sides, but the steps are as often
 * one way as the other, so no side can say which side of itself the page is on,
 * and the whole thing is marked down as the guess it is.
 */
const CLEAR_STEP = 0.5;

/** What a candidate that cannot agree with itself keeps of its score. */
const DISAGREEMENT = 0.45;

/** A page smaller than this share of the frame is something on the page. */
const MIN_AREA_SHARE = 0.1;

/** Opposite sides closer together than this share of the frame are not sides. */
const MIN_SEPARATION_SHARE = 0.12;

/**
 * How many pairs of opposite sides are carried into the search for a rectangle.
 *
 * The work from here is quadratic in this number, and the cut is what makes a
 * photograph of a brick wall cost about what a photograph of a page costs.
 */
const MAX_PAIRS = 90;

/** And how many of those may run in any one direction. */
const MAX_PAIRS_PER_ANGLE = 16;

/** Degrees. How far from parallel two opposite sides may be. */
const PARALLEL_TOLERANCE = 32;

/** Degrees. How far from square the two pairs of sides may be to each other. */
const SQUARE_TOLERANCE = 40;

const RADIANS = Math.PI / 180;

/**
 * Find the page.
 *
 * @param {{data: Uint8ClampedArray, width: number, height: number}} image
 *   RGBA, already shrunk to something around WORKING_EDGE. Coordinates come back
 *   in this picture's own pixels; scaling them up to the original is the
 *   caller's job, and is a multiplication.
 * @returns {{quad: {x: number, y: number}[], found: boolean, score: number,
 *   reason: string}} `reason` is a key, not a sentence - see #phrases in
 *   body.html.
 */
export function findPageQuad(image) {
  const { width, height } = image;
  const frame = wholeFrame(width, height);
  if (width < 24 || height < 24) {
    return { quad: frame, found: false, score: 0, reason: 'detect.tiny' };
  }

  const grey = blur(luma(image), width, height);
  const edges = gradient(grey, width, height);
  const bars = thresholds(edges.magnitude);

  if (bars.strong <= 0) {
    return { quad: frame, found: false, score: 0, reason: 'detect.flat' };
  }

  const lines = strongLines(edges, width, height, bars.vote);
  const best = bestQuad(lines, edges, width, height, bars.support);

  if (!best) return { quad: frame, found: false, score: 0, reason: 'detect.nothing' };

  const quad = best.quad.map((point) => clampPoint(point, width, height));
  return {
    quad,
    found: best.score >= ACCEPT_SCORE,
    score: best.score,
    reason: best.score >= ACCEPT_SCORE ? 'detect.found' : 'detect.unsure',
  };
}

/* ------------------------------------------------------------ the picture */

/**
 * Brightness, by Rec. 601 luma.
 *
 * Which weights are used matters less than that the picture is reduced to one
 * channel before anything is measured on it: an edge is a change, and a change
 * in three channels at once is three chances for the same edge to be found
 * three pixels apart.
 */
function luma(image) {
  const { data, width, height } = image;
  const out = new Float32Array(width * height);
  for (let i = 0, p = 0; p < out.length; i += 4, p += 1) {
    out[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }
  return out;
}

/**
 * A 3x3 box blur, separable, run once.
 *
 * Enough to stop paper grain and JPEG ringing from generating gradient the
 * Hough transform would then take seriously, and not enough to move an edge.
 */
function blur(values, width, height) {
  const across = new Float32Array(values.length);
  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      const left = values[row + Math.max(0, x - 1)];
      const right = values[row + Math.min(width - 1, x + 1)];
      across[row + x] = (left + values[row + x] + right) / 3;
    }
  }

  const out = new Float32Array(values.length);
  for (let y = 0; y < height; y += 1) {
    const up = Math.max(0, y - 1) * width;
    const down = Math.min(height - 1, y + 1) * width;
    const row = y * width;
    for (let x = 0; x < width; x += 1) {
      out[row + x] = (across[up + x] + across[row + x] + across[down + x]) / 3;
    }
  }
  return out;
}

/**
 * The Sobel gradient: how fast the picture is changing, and which way.
 *
 * The direction is the half of this that most edge detectors throw away and
 * this one needs, because it is what lets each pixel vote for one angle rather
 * than for all 180 of them.
 */
function gradient(grey, width, height) {
  const gx = new Float32Array(grey.length);
  const gy = new Float32Array(grey.length);
  const magnitude = new Float32Array(grey.length);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const at = y * width + x;
      const up = at - width;
      const down = at + width;

      const dx = (grey[up + 1] + 2 * grey[at + 1] + grey[down + 1])
        - (grey[up - 1] + 2 * grey[at - 1] + grey[down - 1]);
      const dy = (grey[down - 1] + 2 * grey[down] + grey[down + 1])
        - (grey[up - 1] + 2 * grey[up] + grey[up + 1]);

      // Divided by four so a step from black to white comes out around 255,
      // which keeps every threshold in this file readable as a grey level.
      gx[at] = dx / 4;
      gy[at] = dy / 4;
      magnitude[at] = Math.hypot(gx[at], gy[at]);
    }
  }

  return { gx, gy, magnitude };
}

/**
 * The two bars: what counts as an edge worth voting, and what counts as an edge
 * worth crediting a side for.
 *
 * Both are set from the strongest edges actually in this picture rather than
 * from a fixed grey level, because the contrast between a page and a desk is a
 * property of the desk. The top percentile is taken rather than the maximum, so
 * one blown-out highlight cannot raise the bar on the whole picture.
 */
function thresholds(magnitude) {
  let peak = 0;
  for (let i = 0; i < magnitude.length; i += 1) {
    if (magnitude[i] > peak) peak = magnitude[i];
  }
  if (peak <= 0) return { strong: 0, vote: 0, support: 0 };

  const bins = new Uint32Array(256);
  const scale = 255 / peak;
  let counted = 0;
  for (let i = 0; i < magnitude.length; i += 1) {
    if (magnitude[i] <= 0) continue;
    bins[Math.min(255, Math.round(magnitude[i] * scale))] += 1;
    counted += 1;
  }

  // The 99th percentile of the pixels that have any gradient at all - which on
  // a photograph of a page is the page edge, the printed text, and not much
  // else.
  let seen = 0;
  let bin = 255;
  for (let i = 0; i < 256; i += 1) {
    seen += bins[i];
    if (seen >= counted * 0.99) {
      bin = i;
      break;
    }
  }
  const strong = (bin / scale) || peak;

  return {
    strong,
    // Voting is deliberately the stricter of the two. A vote from a pixel that
    // is only just an edge is a vote in a random direction, and there are tens
    // of thousands of those.
    vote: Math.max(8, strong * 0.35),
    support: Math.max(5, strong * 0.15),
  };
}

/* --------------------------------------------------------------- the lines */

/**
 * The Hough transform, told where to vote.
 *
 * A line is written the way Hough wrote it - the angle of its normal and its
 * distance from the origin - with the origin at the middle of the picture, so
 * that the distance runs symmetrically and the accumulator is half the size it
 * would otherwise be.
 *
 * The saving that matters is the other one: an edge pixel knows the direction of
 * its own gradient, and the normal of the line it lies on is that direction. So
 * it votes into three bins around that angle rather than into all 180. What
 * comes out is not merely thirty times cheaper - it is far cleaner, because the
 * 177 votes each pixel is no longer casting were all noise.
 */
function accumulate({ gx, gy, magnitude }, width, height, bar) {
  const diagonal = Math.hypot(width, height) / 2;
  const rhoBins = Math.ceil((2 * diagonal) / RHO_STEP) + 2;
  const centre = rhoBins / 2;
  const votes = new Float32Array(THETA_STEPS * rhoBins);

  const cos = new Float32Array(THETA_STEPS);
  const sin = new Float32Array(THETA_STEPS);
  for (let t = 0; t < THETA_STEPS; t += 1) {
    cos[t] = Math.cos(t * RADIANS);
    sin[t] = Math.sin(t * RADIANS);
  }

  const halfWidth = width / 2;
  const halfHeight = height / 2;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const at = y * width + x;
      const strength = magnitude[at];
      if (strength < bar) continue;

      // atan2 of the gradient is the angle of the normal, in [-180, 180); a line
      // and the same line turned half way round are the same line, so it is
      // folded into [0, 180).
      let angle = Math.atan2(gy[at], gx[at]) / RADIANS;
      if (angle < 0) angle += 180;
      const middle = Math.round(angle) % THETA_STEPS;

      const px = x - halfWidth;
      const py = y - halfHeight;

      // Every bin within a few degrees of the measured direction, weighted, and
      // NOT just the one bin the gradient points at. The reason is a real
      // failure and a subtle one: the gradient direction on a near-vertical edge
      // is quantised by the pixel staircase the edge is drawn as. A page edge
      // three degrees off vertical has almost no vertical component to its
      // gradient anywhere except at the steps, so every pixel on it reports
      // "zero degrees" - and at zero degrees that edge is not a line at all, it
      // is a slope, its votes spread over ten bins of distance, and the peak
      // that should have been the side of the page never forms. Smearing across
      // the angle puts them back together at the angle they actually share.
      for (let step = -SMEAR; step <= SMEAR; step += 1) {
        const t = (middle + step + THETA_STEPS) % THETA_STEPS;
        const rho = px * cos[t] + py * sin[t];
        const bin = Math.round(centre + rho / RHO_STEP);
        if (bin < 0 || bin >= rhoBins) continue;
        votes[t * rhoBins + bin] += strength * SMEAR_WEIGHT[Math.abs(step)];
      }
    }
  }

  return { votes, rhoBins, centre, cos, sin };
}

/**
 * The strongest lines, with the neighbours of each one suppressed.
 *
 * Without the suppression a single page edge comes back as six lines a degree
 * apart, they crowd out the other three edges of the page, and the candidate
 * search then has six copies of one side and nothing to pair them with.
 */
function strongLines(edges, width, height, bar) {
  const { votes, rhoBins, centre } = accumulate(edges, width, height, bar);

  const peaks = [];
  for (let t = 0; t < THETA_STEPS; t += 1) {
    for (let r = 1; r < rhoBins - 1; r += 1) {
      const value = votes[t * rhoBins + r];
      if (value <= 0) continue;

      // A local maximum over a window a good deal wider in distance than in
      // angle, which is the shape a single edge's votes actually make.
      let top = true;
      for (let dt = -PEAK_THETA; dt <= PEAK_THETA && top; dt += 1) {
        const tt = ((t + dt) % THETA_STEPS + THETA_STEPS) % THETA_STEPS;
        for (let dr = -PEAK_RHO; dr <= PEAK_RHO; dr += 1) {
          const rr = r + dr;
          if (rr < 0 || rr >= rhoBins) continue;
          if (votes[tt * rhoBins + rr] > value) {
            top = false;
            break;
          }
        }
      }
      if (!top) continue;

      peaks.push({
        theta: t * RADIANS,
        rho: (r - centre) * RHO_STEP,
        votes: value,
        border: false,
      });
    }
  }

  peaks.sort((a, b) => b.votes - a.votes);

  const distinct = [];
  for (const peak of peaks) {
    if (distinct.some((other) => nearlyTheSameLine(peak, other, width, height))) continue;
    distinct.push(peak);
  }

  const kept = shareOutByAngle(distinct);

  // The edges of the photograph, which are candidate page edges wherever the
  // page runs off the picture. Written in the same centred coordinates.
  //
  // They are given the middling vote of the lines actually found rather than
  // none, because votes are what the pairs are ranked by and a line with no
  // votes would be cut before it was ever tried. Middling is the honest value:
  // the frame is not evidence of a page edge, and it is not evidence against
  // one either.
  const nominal = medianVotes(kept);
  for (const border of [
    { theta: 0, rho: -width / 2 },
    { theta: 0, rho: width / 2 },
    { theta: Math.PI / 2, rho: -height / 2 },
    { theta: Math.PI / 2, rho: height / 2 },
  ]) {
    kept.push({ ...border, votes: nominal, border: true });
  }

  return kept;
}

/**
 * Share the places out by angle, and always keep the outermost line of each
 * band.
 *
 * The outermost rule is the other half of the answer to the crowding problem
 * above, and it is not a heuristic bolted on: the page is by definition the
 * outside of everything printed on it, so within a band of angles the line
 * furthest out in each direction is the one most likely to be an edge of the
 * page rather than something on it. Keeping those two costs two places per band
 * and rescues the photograph where the writing is darker than the paper's own
 * edge - which is most photographs of a printed page on a pale desk.
 *
 * A weak line is not rescued by being outermost. That would promote the
 * strongest bit of noise in the picture, once per band, every time.
 */
function shareOutByAngle(lines) {
  const bands = new Map();
  for (const line of lines) {
    const band = Math.round(line.theta / RADIANS / ANGLE_BAND) % (180 / ANGLE_BAND);
    if (!bands.has(band)) bands.set(band, []);
    bands.get(band).push(line);
  }

  const strongest = [...bands.values()]
    .sort((a, b) => b[0].votes - a[0].votes)
    .slice(0, MAX_ANGLE_BANDS);

  const kept = [];
  for (const band of strongest) {
    const chosen = new Set(band.slice(0, MAX_PER_ANGLE));
    const worth = band.filter((line) => line.votes >= band[0].votes * 0.3);
    if (worth.length) {
      chosen.add(worth.reduce((a, b) => (b.rho < a.rho ? b : a)));
      chosen.add(worth.reduce((a, b) => (b.rho > a.rho ? b : a)));
    }
    kept.push(...chosen);
  }

  return kept;
}

function medianVotes(lines) {
  if (!lines.length) return 0;
  const sorted = lines.map((line) => line.votes).sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

/** Two lines that would draw on top of each other across this picture. */
function nearlyTheSameLine(a, b, width, height) {
  const { angle, gap } = relate(a, b);
  return Math.abs(angle) < 4 && Math.abs(gap) < Math.min(width, height) * 0.04;
}

/**
 * How two lines stand to each other: the angle between them in degrees, and the
 * distance between them if they are close to parallel.
 *
 * The fold is the fiddly part. Angles live in [0, 180), so a line at 179 degrees
 * and one at 1 degree are two degrees apart and not 178 - and when they are
 * compared that way round, one of the two distances has to change sign with it.
 *
 * The angle comes back signed, because the caller that pairs two sides of a page
 * needs it to say which direction the pair as a whole runs in.
 */
function relate(a, b) {
  let difference = (b.theta - a.theta) / RADIANS;
  let rho = b.rho;
  if (difference > 90) {
    difference -= 180;
    rho = -rho;
  } else if (difference < -90) {
    difference += 180;
    rho = -rho;
  }
  return { angle: difference, gap: rho - a.rho };
}

/** Where two lines cross, in picture coordinates, or null if they are parallel. */
function intersect(a, b, width, height) {
  const ca = Math.cos(a.theta);
  const sa = Math.sin(a.theta);
  const cb = Math.cos(b.theta);
  const sb = Math.sin(b.theta);

  const det = ca * sb - sa * cb;
  if (Math.abs(det) < 1e-6) return null;

  return {
    x: (a.rho * sb - b.rho * sa) / det + width / 2,
    y: (ca * b.rho - cb * a.rho) / det + height / 2,
  };
}

/* ---------------------------------------------------------- the candidates */

/**
 * Pairs of lines that could be opposite sides of the same page: close to
 * parallel, and far enough apart to have a page between them.
 */
function oppositePairs(lines, width, height) {
  const apart = Math.min(width, height) * MIN_SEPARATION_SHARE;
  const pairs = [];

  for (let i = 0; i < lines.length; i += 1) {
    for (let j = i + 1; j < lines.length; j += 1) {
      const { angle, gap } = relate(lines[i], lines[j]);
      if (Math.abs(angle) > PARALLEL_TOLERANCE) continue;
      if (Math.abs(gap) < apart) continue;

      let theta = lines[i].theta + (angle * RADIANS) / 2;
      if (theta < 0) theta += Math.PI;
      if (theta >= Math.PI) theta -= Math.PI;

      pairs.push({
        lines: [lines[i], lines[j]],
        theta,
        // A pair of opposite sides is worth what its weaker side is worth, not
        // what the two of them add up to. Adding them was a real bug and a
        // quiet one: a strong line of text paired with a faint smudge outscored
        // the top and bottom edges of the page paired with each other, took the
        // last place in its direction, and the correct rectangle was never
        // built at all - so what came out was a page cropped to the last line
        // of writing on it, confidently.
        votes: Math.min(lines[i].votes, lines[j].votes),
        borders: (lines[i].border ? 1 : 0) + (lines[j].border ? 1 : 0),
      });
    }
  }

  // Shared out by direction, for the same reason the lines were and with the
  // same failure if they are not: thirty lines of text make several hundred
  // pairs of "opposite sides", every one of them running the same way and every
  // one of them carrying more votes than the two sides of the page. Cut the
  // list by votes alone and what survives is a hundred and fifty ways to pair up
  // the writing, with nothing at right angles to any of them.
  const bands = new Map();
  for (const pair of pairs) {
    const band = Math.round(pair.theta / RADIANS / ANGLE_BAND) % (180 / ANGLE_BAND);
    if (!bands.has(band)) bands.set(band, []);
    bands.get(band).push(pair);
  }

  const shared = [];
  for (const band of bands.values()) {
    band.sort((a, b) => b.votes - a.votes);
    shared.push(...band.slice(0, MAX_PAIRS_PER_ANGLE));
  }

  return shared.sort((a, b) => b.votes - a.votes).slice(0, MAX_PAIRS);
}

/**
 * The best rectangle the lines can make, scored by what is actually under its
 * four sides.
 *
 * The candidate count is bounded twice: MAX_LINES caps how many lines there are
 * to pair, and the pairs are sorted by how many votes they carry and cut off, so
 * a picture of a brick wall costs the same as a picture of a page.
 */
function bestQuad(lines, edges, width, height, bar) {
  const pairs = oppositePairs(lines, width, height);

  const area = width * height;
  let best = null;

  for (let i = 0; i < pairs.length; i += 1) {
    for (let j = i + 1; j < pairs.length; j += 1) {
      const across = pairs[i];
      const down = pairs[j];

      // The two pairs have to be roughly at right angles to each other, or they
      // are the same side of the page found twice.
      let between = Math.abs(across.theta - down.theta) / RADIANS;
      if (between > 90) between = 180 - between;
      if (Math.abs(between - 90) > SQUARE_TOLERANCE) continue;

      // All four sides taken from the frame is not a finding, it is the whole
      // picture, and it is what the caller falls back to anyway.
      if (across.borders + down.borders >= 4) continue;

      const corners = [];
      let usable = true;
      for (const a of across.lines) {
        for (const b of down.lines) {
          const point = intersect(a, b, width, height);
          // A corner a long way outside the picture belongs to two lines that
          // cross somewhere off the desk, not to a page.
          if (!point || point.x < -width * 0.02 || point.x > width * 1.02
            || point.y < -height * 0.02 || point.y > height * 1.02) {
            usable = false;
          }
          if (!usable) break;
          corners.push(point);
        }
        if (!usable) break;
      }
      if (!usable) continue;

      const quad = orderCorners(corners);
      if (!isConvex(quad)) continue;
      if (sharpestCorner(quad) < 40) continue;

      const share = quadArea(quad) / area;
      if (share < MIN_AREA_SHARE) continue;

      const score = scoreQuad(quad, [...across.lines, ...down.lines], edges, width, height, bar, share);
      if (score !== null && (!best || score > best.score)) best = { quad, score };
    }
  }

  return best;
}

/**
 * How good a candidate is: how much of each of its four sides has an edge under
 * it, whether those four edges are the boundary of one thing, and how much of
 * the picture it covers.
 *
 * THE POLARITY TEST is the part that earns its place. A page is lighter than
 * what is around it, or darker than what is around it, but it is one or the
 * other on all four sides - so the brightness step across each side, measured
 * facing inwards, has the same sign four times. A line of text does not behave
 * like that: it is darker than the paper on both of its own sides, so a
 * candidate that has taken the top of the page for its top edge and the bottom
 * of a line of text for its bottom edge disagrees with itself, and is marked
 * down rather than being allowed to win on the strength of the writing.
 *
 * It is a penalty rather than a refusal, because there is a real photograph it
 * would otherwise throw away: a page lying half on a dark desk and half on a
 * pale one. That picture should still be straightened - just not in preference
 * to one that makes sense.
 *
 * THE AREA TERM settles the other question every scanner has to answer at least
 * once: a table drawn on the page has four crisp sides too. The power is low on
 * purpose - enough that the page beats the table on it, not so much that the
 * desk beats the page.
 */
function scoreQuad(quad, lines, edges, width, height, bar, share) {
  const sides = [];
  for (let i = 0; i < 4; i += 1) {
    const line = sideLine(quad, i, lines, width, height);
    sides.push(line?.border
      ? { support: BORDER_SUPPORT, polarity: 0 }
      : sideEvidence(quad[i], quad[(i + 1) % 4], edges, width, height, bar));
  }

  const weakest = Math.min(...sides.map((side) => side.support));
  if (weakest < MIN_SIDE_SUPPORT) return null;

  const mean = sides.reduce((sum, side) => sum + side.support, 0) / 4;

  // Sides too faint to have an opinion about which way the step goes - and the
  // edges of the picture, which have no step at all - abstain rather than voting
  // for agreement they cannot see. Two opinions is the minimum for there to be
  // agreement at all, and requiring it is what a picture of pure noise fails on:
  // every side of every rectangle in it is covered in gradient, so the support
  // is high everywhere, and not one of those sides can say which side of itself
  // is the page.
  const opinions = sides.map((side) => side.polarity).filter((value) => Math.abs(value) > CLEAR_STEP);
  const agree = opinions.length >= 2
    && (opinions.every((value) => value > 0) || opinions.every((value) => value < 0));

  return mean * share ** 0.35 * (agree ? 1 : DISAGREEMENT);
}

/**
 * Which of the four lines a given side of the quad came from.
 *
 * Ordering the corners loses the pairing they were built from, and only one bit
 * of it is wanted back: whether this side is the edge of the photograph rather
 * than an edge in it. Asking which line both ends of the side sit on is the
 * cheapest honest way to get that bit, and it cannot be ambiguous - the four
 * lines of a candidate are two pairs at right angles, so no other line comes
 * near both ends.
 */
function sideLine(quad, index, lines, width, height) {
  const a = quad[index];
  const b = quad[(index + 1) % 4];
  const offset = (point, line) => Math.abs(
    (point.x - width / 2) * Math.cos(line.theta)
    + (point.y - height / 2) * Math.sin(line.theta)
    - line.rho,
  );

  let best = null;
  let closest = Infinity;
  for (const line of lines) {
    const away = Math.max(offset(a, line), offset(b, line));
    if (away < closest) {
      closest = away;
      best = line;
    }
  }

  return best;
}

/**
 * What is actually under one side: how much of it is an edge, and which way the
 * picture steps as that edge is crossed.
 *
 * Walked as a segment rather than read off the Hough peak that produced it,
 * because a peak is a statement about an infinite line and a page has ends. The
 * ends themselves are skipped: within a few pixels of a corner the gradient
 * belongs to both sides at once and to neither cleanly.
 *
 * What is measured at each step is the part of the gradient pointing across the
 * side, towards the inside of the quad. Taking the component rather than the
 * magnitude is what stops a candidate borrowing support from the very line it is
 * meant to be perpendicular to; keeping the sign is what makes the polarity test
 * above possible.
 *
 * Support is credit rather than a count: an edge at twice the bar counts fully,
 * one that barely clears it counts for half. A hit-and-miss count would score a
 * page edge that is only just visible exactly as highly as one that is obvious,
 * and the difference between those two is most of what "is this a page?" means.
 */
function sideEvidence(a, b, { gx, gy, magnitude }, width, height, bar) {
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (length < 8) return { support: 0, polarity: 0 };

  const steps = Math.min(64, Math.max(16, Math.round(length / 3)));
  // The inward normal, for corners held in the order orderCorners produces.
  const nx = -(b.y - a.y) / length;
  const ny = (b.x - a.x) / length;

  let credit = 0;
  let taken = 0;
  let signed = 0;
  let total = 0;

  for (let i = 0; i < steps; i += 1) {
    // Six per cent in from each end.
    const along = 0.06 + (0.88 * i) / (steps - 1);
    const x = a.x + (b.x - a.x) * along;
    const y = a.y + (b.y - a.y) * along;

    let best = 0;
    // A page edge in a photograph is two or three pixels wide and the line
    // through it is a fit, so the search either side of it is what stops half a
    // pixel of fitting error reading as no edge at all.
    for (let off = -2; off <= 2; off += 1) {
      const sx = Math.round(x + nx * off);
      const sy = Math.round(y + ny * off);
      if (sx < 1 || sy < 1 || sx >= width - 1 || sy >= height - 1) continue;
      const at = sy * width + sx;
      if (magnitude[at] < bar) continue;
      const across = gx[at] * nx + gy[at] * ny;
      if (Math.abs(across) > Math.abs(best)) best = across;
    }

    taken += 1;
    credit += Math.min(1, Math.abs(best) / (bar * 2));
    signed += best;
    total += Math.abs(best);
  }

  return {
    support: taken ? credit / taken : 0,
    polarity: total > 0 ? signed / total : 0,
  };
}
