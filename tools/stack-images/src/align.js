/**
 * Working out how far one frame moved from another.
 *
 * Stacking a hand-held burst without this produces a blur, so alignment is not
 * a refinement here, it is most of what makes the tool work on anything but a
 * tripod. There are three settings and this file implements two of them; the
 * third is doing nothing, which is the right answer for an intervalometer
 * sequence and is offered because it is.
 *
 * PHASE CORRELATION, AND WHY IT IS THE FAST ANSWER
 *
 * Shifting a picture does not change the size of its spectrum, only the phase
 * of it, and the phase changes by an amount proportional to the shift. So
 * multiplying one frame's spectrum by the conjugate of another's, dividing the
 * magnitudes out as far as the noise allows, and transforming back gives a
 * surface with a single spike at the offset between them. One transform each
 * and one back - about ten milliseconds on the small squares this works over -
 * and it finds a shift of two hundred pixels as cheaply as a shift of two.
 * Searching for the same answer by trying offsets is quadratic in the range
 * and would be the slowest thing in the tool.
 *
 * ROTATION AND SCALE, BY THE SAME TRICK APPLIED TWICE
 *
 * Rotating a picture rotates its spectrum by the same angle; scaling it scales
 * the spectrum by the inverse. Neither of those is a shift, so phase
 * correlation cannot see them - until the spectrum is resampled into log-polar
 * coordinates, where a rotation *is* a shift along one axis and a scale *is* a
 * shift along the other. Then the same correlation reads both off, the frame is
 * unrotated, and a second correlation finds what is left over as translation.
 * That is the Fourier-Mellin method, and it is why the "rotation too" setting
 * costs one more transform rather than a feature detector.
 *
 * WHAT IT CANNOT DO, STATED HERE BECAUSE THE PAGE STATES IT TOO
 *
 * Everything here is global: one shift, one angle, one scale for the whole
 * frame. A frame where the camera moved is corrected exactly; a frame where the
 * *subject* moved is not, and neither is one taken from a step to the left,
 * because parallax moves the near things further than the far ones and no
 * single transform describes that. Rotation is also only ever recovered within
 * a half turn, because the magnitude spectrum of a real picture is symmetric
 * and a rotation of 175 degrees looks exactly like one of -5.
 */

import { fft2 } from './fft.js';

/** The three settings, in the order the page offers them. */
export const ALIGN_MODES = ['none', 'translate', 'similarity'];

/**
 * Rotation and scale beyond these are not a burst, they are a mistake - a frame
 * from a different shoot, or a correlation that locked onto the noise. Past
 * them the estimate is thrown away and the frame is aligned by translation
 * alone, which is the answer that is at worst unhelpful rather than wrong.
 */
export const MAX_ROTATION = 30;
export const MIN_SCALE = 0.8;
export const MAX_SCALE = 1.25;

/**
 * How much of the cross-spectrum's magnitude the whitening keeps, as a multiple
 * of the median bin. See phaseCorrelate for what the number does; this is why
 * it is 128 and not the 0.1 to 0.3 a regularisation constant usually is.
 *
 * The median bin of a noisy square *is* the noise floor - a photograph puts
 * nothing measurable into most of its high frequencies, so most bins are noise
 * and the median sits among them. A constant of 0.3 leaves those bins at
 * nine-tenths of the weight of a real edge, which is no regularisation at all
 * on a noisy frame: measured on the low-texture fixture in the tests, with
 * fifteen per cent noise, 0.1 to 0.5 all missed the shift by 1.3 to 2.8 pixels,
 * exactly as full whitening did. Weighting a bin by how far it stands above
 * the median is what helps, and the constant sets where "above" begins. Over
 * five seeds each at 256:
 *
 *                       c = 16          64            128           256
 *   low-texture, error  0.96-1.33 px    0.29-1.08     0.21-1.01     0.23-0.93
 *   textured, error     0.11-0.25       0.06-0.23     0.06-0.23     0.06-0.22
 *   junk, coherence     up to 0.043     up to 0.068   up to 0.086   up to 0.105
 *   low-texture, coh.   0.139-0.151     0.281-0.294   0.376-0.386   0.472-0.481
 *
 * Both accuracy and the gap between a real match and an unrelated pair keep
 * improving as the constant grows, because the limit is plain
 * cross-correlation, the maximum-likelihood estimate under white noise. What
 * the limit loses is the sharp peak that made a phase-only correlation immune
 * to a repeating pattern, and at 256 the plain correlation begins to find the
 * slope the two gradient frames share - one seed lands within two pixels of
 * it - where at 128 no seed came nearer than seven. 128 is where the
 * low-texture scene lands within a pixel on four seeds of five, and 1.01 on
 * the fifth, while the gradient is still nothing but noise. The exponent
 * |X|^0.75 was measured as the alternative and landed the low-texture fixture
 * 1.29-2.74 pixels off, no better than full whitening, so it was not kept.
 */
export const WHITEN = 128;

/**
 * The gate: what a peak has to show before a frame is moved by it.
 *
 * Four statistics come back with every peak and two of them decide. `plateau`
 * asks whether the peak has a position at all - the comment on P_MAX. `next`
 * asks whether it is the answer or merely the tallest of several - the
 * comment on N_MAX. `live` is the guard under both, and `coherence` is
 * reported and not read; the two paragraphs below say why each is what it is.
 *
 * `live` is the mean weight, the share of the spectrum that stood above the
 * noise floor at all. It is not what separates a match from a mismatch - noise
 * fills every bin, so a noisy featureless frame has as much live spectrum as a
 * photograph - and is here for the other failure: a square whose spectrum is
 * numerically empty, where the median is rounding error and every bin above it
 * "agrees" perfectly. A flat frame measures 0 and a bare slope 0.0014 at 256,
 * the same slope quantised to 8 bits 0.0032 (its contour lines are a lattice,
 * and correlate at coherence 0.98 to the wrong answer), and anything with a
 * picture and any noise in it 0.0097 or more at every size tried. That last
 * figure is the 8-bit rounding of getImageData, which every square the
 * pipeline builds has been through: it puts about a 129th of the weight into
 * every bin. A float square of a clean, very smooth scene has no such floor -
 * value noise at 80 pixels measured 0.0025 with coherence 0.995 - and would
 * be refused by `live` alone, which is a fact about the tests and any future
 * caller, not about the page. Nor does the floor hold at the small windows:
 * the bare 8-bit slope measures 0.016 at 128 and 0.079 at 64, because the
 * window's own spectrum is a larger share of so few bins, so a rendered
 * gradient with no noise on it at all is refined there by its contour lattice,
 * by a shift small enough to pass for a residual. Sensor noise at one per cent
 * is enough for the other two floors to refuse it instead - at 256 on every
 * seed, at 128 on nine in ten.
 *
 * WHY COHERENCE IS REPORTED AND NOT READ
 *
 * `coherence` is the fraction of the weighted spectrum that agreed on the
 * peak - the peak times n over the sum of the weights, one for a perfect
 * match. It was the gate, at 0.15 on the coarse square and scaled by the
 * side, and it did that job on every fixture family but one, which is the
 * tool's own subject. A star field is sparse in the spectrum as well as in
 * the picture: a few hundred points put their energy into a few hundred
 * bins, and under a whitening floor of WHITEN times the median every one of
 * the thousands of noise bins still carries a small weight, so the sum in
 * the denominator belongs to the noise and a perfect match of a sparse
 * field reads as a poor one. That is what the statistic is, not where its
 * floor was. In the browser, on the built refinement path - 3000x2000
 * frames, the 512 window cut at full resolution - a field of four hundred
 * stars at six per cent noise read 0.139 against a floor of 0.075 and was
 * refined to under 0.3 pixels; at fifteen per cent it read 0.042, was
 * refused, and its frames stayed 1-2.7 pixels off where the same code
 * without the floor had refined them to under 0.3. Two unrelated smooth
 * pictures locked on their shared JPEG lattice read 0.088 and passed. The
 * browser's whole table at 512, with z the peak over the surface's deviation:
 *
 *                                 coherence   plateau   next    z      answer
 *   star field, 6% noise           0.139       0.08     0.25    36.8   right
 *   star field, 15% noise          0.042       0.33     0.69    11.7   right, refused
 *   textured scene                 0.893       0.12     0.10    178    right
 *   textured scene, 30% noise      0.168       0.52     0.48    36.4   right
 *   low-texture, 15% noise         0.040       0.36     0.85    11.1   wrong, 23 px
 *   low-texture, 30% noise         0.036       0.23     0.95    9.9    wrong
 *   smooth gradient                0.032       0.93     0.95    8.9    junk
 *   two unrelated smooth JPEGs     0.088       0.32     1.00    11.6   lattice lock
 *   unrelated low/low              0.030       0.21     0.98    8.3    junk
 *   unrelated stars/stars          0.048       0.21     0.83    13.1   junk
 *   unrelated texture/low          0.034       0.33     1.00    6.7    junk
 *   unrelated texture/stars        0.034       0.60     0.99    6.6    junk
 *
 * A right answer at 0.042 and junk at 0.088: no floor on the first column
 * separates them, and none on the z-score either (11.7 against 11.6). The
 * last column does. The ten-seed calibration of the old floor is in this
 * file's history, and what it established that still matters - the
 * whitening constant, the plateau's radius - is recorded on WHITEN and P_MAX.
 */
export const L_MIN = 0.004;

/**
 * `next`: whether the peak is the answer or merely the tallest of several.
 *
 * The tallest point of the surface outside a box of NEXT_REACH pixels around
 * the peak, as a fraction of the peak - the peak-to-sidelobe ratio, the
 * oldest test there is of a correlation peak. A genuine match has one peak
 * and the rest of the surface is noise; two unrelated pictures have many
 * noise peaks of much the same height, and the argmax is whichever happened
 * to be tallest; a lattice lock has a row of equal peaks eight pixels apart.
 * The box keeps the peak's own skirt from being read as a second peak, and
 * it is ten because the plateau is read at eight: inside eight the shape of
 * the peak is P_MAX's question, and this one begins where that one stops.
 *
 * Measured over ten seeds on the fixtures in tests/js/stack-images-align.test.js.
 * The four-hundred-star rows are the browser's field as the pipeline sees
 * it: four hundred stars on a 3000x2000 frame, shrunk twelvefold into 256x171
 * over the letterbox for the survey - each star a sub-pixel dot, the noise
 * averaged down by the same factor, then 8-bit - and, for the refinement,
 * the twenty-two of them that fall in a 512 window cut from the middle of
 * the frame, at full-resolution noise.
 *
 *   at 512, the refinement window            next          plateau     answer
 *   textured, 15% and 30% noise              0.09-0.24     0.21-0.35   right
 *   low-texture, 15% and 30%                 0.09-0.30     0.35-0.55   right
 *   four hundred stars in the square, 6-15%  0.06-0.14     0.03-0.07   right
 *   twenty-two stars in the window, 6-15%    0.26-0.57     0.01-0.21   right
 *   twenty stars, 6%                         0.40-0.53     0.05-0.30   right
 *   twenty stars, 6%, ten other draws        0.32-0.72     0.02-0.49   right
 *   seventeen stars, 6%, ten other draws     0.37-0.96     0.02-0.51   right, 9 of 10 pass
 *   twenty stars, 15%                        0.80-0.99     0.18-0.64   wrong, 10-105 px
 *   wall, 60-pixel features, 5% and 15%      0.78-0.92     0.79-0.90   plateau refuses
 *   wall, 30-pixel features, 15%             0.64-0.79     0.78-0.85   plateau refuses
 *   gradient, 15% noise, and 8-bit at 1%     0.84-0.99     0.43-0.94   junk
 *   two unrelated smooth JPEGs, Q95 to Q20   0.72-1.00     0.03-0.98   junk, 8 of 80 pass
 *   unrelated texture/texture, low/low, 5%   0.82-0.99     0.31-0.82   junk
 *   unrelated texture/texture, 15%           0.75-0.98     0.50-0.90   junk, 8 of 40 pass
 *   unrelated texture/stars, stars/stars     0.89-0.99     0.06-0.68   junk
 *   unrelated texture/low                    0.67-0.84     0.43-0.70   junk, 8 of 10 pass
 *
 *   at 256, top-anchored, tapered whole      next          plateau     answer
 *   textured, 15% and 30%                    0.28-0.50     0.23-0.55   right
 *   low-texture, 15% and 30%                 0.20-0.41     0.43-0.62   right
 *   four hundred stars, 6% and 10%           0.45-0.69     0.14-0.31   right
 *   four hundred stars, 15%                  0.63-0.89     0.31-0.49   right, 6 of 10 pass
 *   four hundred stars, 20%                  0.70-0.95     0.39-0.81   8 of 10 right, 1 passes
 *   two hundred stars, 6%                    0.66-0.79     0.17-0.26   right
 *   two hundred stars, 10%                   0.81-0.98     0.29-0.94   7 of 10 right, none pass
 *   eight hundred stars, 6-20%               0.33-0.76     0.11-0.46   right
 *   twenty stars, 6%                         0.26-0.34     0.10-0.19   right
 *   gradients, 8-bit, 1% to 12% noise        0.92-0.99     0.93-1.00   both refuse
 *   textured sky                             0.94-0.98     0.96-0.98   both refuse
 *   unrelated low/low, 5% and 15%            0.72-0.83     0.64-0.80   junk, 4 of 10 pass at 15%
 *   unrelated texture/texture, 5%            0.78-0.88     0.59-0.73   junk, 3 of 10 pass
 *   unrelated texture/low                    0.82-0.95     0.75-1.00   junk
 *   unrelated texture/stars                  0.72-0.98     0.50-0.74   junk, 7 of 10 pass
 *   unrelated stars/stars                    0.82-1.00     0.22-0.73   junk
 *
 * That table, and every reading in it, is the top-anchored letterbox with the
 * whole square tapered - the fixture, not the square the pipeline builds. It
 * is kept because these constants were chosen on it and it is what reproduces
 * them. `placement` centres the box, so a real letterbox's edges sit where the
 * square's own taper has already faded them to a quarter and the fixture's sit
 * at three-quarters; the fixture's ridge is about three times the pipeline's,
 * and anything measured on it overstates what the letterbox does.
 *
 * SINCE lumaSquare HANDS window2d THE PICTURE'S BOX
 *
 * Re-measured on the CENTRED box, twenty seeds a family, 3:2 and 2:3 together,
 * the scenes lifted to a photographic black level so that the letterbox step
 * is the height a photograph's is. The third column is the same family as a
 * SQUARE output, which has no letterbox and which this function has never
 * treated any differently:
 *
 *                                     whole square   the box    square output
 *   textured, 15% / 30% / 50% noise    0.18-0.64     0.13-0.71    0.13-0.60
 *   low-texture, 15% and 30%           0.20-0.44     0.12-0.44    0.11-0.36
 *   four hundred stars, 6% and 15%     0.07-0.15     0.08-0.20    0.07-0.14
 *   8-bit gradient and skies, 1%-1.3%  0.94-1.00     0.76-1.00    0.79-1.00
 *   unrelated texture/texture, 5%      0.80-0.95     0.80-0.99    0.78-1.00
 *   unrelated texture/texture, 15%     0.74-1.00     0.71-1.00    0.81-0.99
 *   unrelated low/low, 5%              0.88-1.00     0.71-1.00    0.88-1.00
 *   unrelated low/low, 15%             0.80-1.00     0.71-1.00    0.72-0.96
 *   unrelated texture/low, 5%          0.84-1.00     0.68-1.00    0.68-0.94
 *   unrelated texture/low, 15%         0.74-0.99     0.60-0.97    0.64-0.90
 *   unrelated texture against stars    0.78-1.00     0.74-1.00    0.84-0.99
 *
 * and the same eleven junk families counted rather than ranged, admitted by
 * isMeasured AT THIS FLOOR over twenty seeds each - which is the floor the
 * coarse square asked while the ridge was doing its gating, and not the floor
 * it asks now:
 *
 *                       whole square   the box   square output
 *   3:2 output             5/220        31/220      36/220
 *   2:3 output             1/220        39/220      36/220
 *
 * The third column is the answer to both of the other two. The letterbox's
 * edge stood high away from the peak on every surface it was in, and this
 * statistic reads how high the surface stands away from the peak - so the
 * letterbox was refusing junk, by accident, on exactly the outputs that were
 * not square. Taking it out does not open a hole; it gives every output shape
 * the hole a square output has always had, and it is the same hole: the
 * unrelated texture/low and low/low pairs whose surfaces are a few broad bumps
 * rather than many sharp ones. The paragraph on the JPEG lattice below is
 * where that leak is already recorded, and the consensus check is what is left
 * to catch it. Nothing downstream can veto a coarse peak that passed - the
 * refinement can only decline to improve it - so what the consensus catches is
 * the refinement's own windows, and a junk coarse move that got through is
 * applied.
 *
 * Those counts are what this floor lets through, and they are the reason the
 * coarse square stopped asking it. N_MAX_SURVEY judges that square now, and
 * refuses every one of these eleven families on every seed of every shape;
 * what it costs instead is on its own comment.
 *
 * There is no room to lower THIS floor for it, and the coarse-only floor that
 * answers it is N_MAX_SURVEY. This paragraph used to say there was no such
 * floor to split off, and what it was reading when it said so was a fixture
 * rather than the pipeline: at 256 with nothing resized on the way in, the
 * real side reached 0.71 on the textured scene at fifty per cent noise against
 * a junk side starting at 0.60, and no line separated them. A fixture that
 * resizes the way the survey does - the scene drawn several times larger, its
 * noise averaged down with the picture - reads that same scene at 0.04-0.13,
 * and the browser reads it at 0.04-0.06. The noise a 256-native fixture leaves
 * on a real scene is noise the pipeline has already thrown away, and it was
 * the whole of what hid the gap. What decides 0.8 meanwhile is
 * unchanged and is nothing to do with the coarse square: the sparse sky at the
 * refinement window, 0.72-0.96 over ten draws, and the log-polar turn too
 * small to separate from the surface's own junk peak, 0.81 - both full
 * squares, windowed with no box at all.
 *
 * On the full 256 square, without the letterbox - the square-output column
 * above, and nothing else: the box column beside it is a different reading of
 * the same scene, 0.13-0.71 against 0.13-0.60 on the row that decides this
 * range, and what the coarse square reads is on N_MAX_SURVEY's own comment
 * rather than here. Every real family reads
 * 0.07-0.62 - the textured scene at fifty per cent noise is the 0.62, and is
 * 0.3-2.4 pixels off - and the junk 0.59-1.00: gradients 0.76-0.99 over forty
 * seeds with none admitted, the seeds that dip under this floor being refused
 * by the plateau instead (0.72-0.81 there), unrelated
 * texture/texture 0.82-0.99, texture/stars and stars/stars 0.79-1.00, low/low
 * 0.70-0.91 (5 of 10 pass at fifteen per cent), texture/low 0.59-0.83 (8 of
 * 10). At 128 the real pairs read 0.04-0.45 and the junk 0.67-1.00, with the
 * gradients passing one seed in ten; at 64 the noisy textured pair reaches
 * 0.80 on one seed, the 8-bit gradient at one per cent noise reads 0.41-0.70
 * and passes eight seeds in ten where the old floor refused it, and the
 * unrelated pairs 0.63-0.97. That window is not gated by this either, then,
 * and what carries it is no longer a cap on the correction: the refinement
 * measures nine windows and applies nothing that four of them do not agree
 * on, so a 64-pixel square that read junk has to be joined by three more
 * reading the same junk in the same direction before any of it reaches a
 * frame. One window passing this floor when it should not is now a window
 * dropped by the consensus rather than a frame moved.
 *
 * The floor is 0.8. The real side's last case is the noisy sparse sky at the
 * survey square: the browser read it at 0.76 with the right answer, the
 * fixture at 0.63-0.89 with the right answer on every seed, and 0.8 admits
 * the browser's and six seeds of the fixture's ten - about what the old floor
 * admitted, at coherence 0.14-0.17 against 0.15 - where 0.75 admits two. At
 * twenty per cent the same field is wrong on two seeds in ten, so past that
 * refusing is right, and the floor refuses nine. It is the sparse sky and
 * nothing else that spends this margin. Every photograph, and every dense
 * field, is under 0.65 at every size on every seed but one: the textured scene
 * at fifty per cent noise, which read 0.64 over the letterbox and reads 0.71
 * over the picture's box, aligned correctly on every seed at both. That one
 * row is why the floor could not simply be dropped to 0.7 for the coarse
 * square once the ridge went. The sparse windows are where it is close: over
 * ten different draws of a sparse sky the twenty-star window at six per cent
 * reaches 0.72 and a seventeen-star one 0.96, the second refused on one draw
 * in ten although its answer was right. Which draw of the sky the window
 * caught, not how much noise is on it, decides how near the floor a real
 * answer lands. The log-polar turns below reach 0.81. What 0.8 lets through
 * that 0.75 would not is a seed here and there of the unrelated pairs - a
 * sparse sky and an unrelated pair are both one peak among noise peaks, and
 * they overlap between 0.7 and 0.9 - and about one seed in ten of the two
 * unrelated JPEGs below. It sits nearer the junk than the middle for the
 * reason the plateau floor does: a coarse move refused is a frame stacked
 * at the identity, unaligned by its whole shift, and a junk
 * frame admitted was junk in the stack already; the consensus check is where
 * to be strict.
 *
 * One family the coherence floor caught and this does not: two unrelated
 * pictures of which one has little texture. Its surface is the low-texture
 * picture's own correlation shape with the other picture's noise on it, a
 * few broad bumps rather than many sharp ones, and the tallest bump's
 * neighbours read 0.67-0.84 at 512 and 0.59-0.83 at 256 - inside the floor
 * on eight seeds of ten - at a plateau of 0.43-0.70 that P_MAX does not
 * catch either. Coherence read it at 0.05-0.06, a quarter of the real
 * low-texture scene's, and it was the one junk family where coherence had a
 * margin; the sparse skies sit at 0.04-0.05 in the same place, which is why
 * that floor could not stay. The survey square used to refuse the pair on
 * every seed of a letterboxed output and no longer does: over the picture's
 * box it reads 0.78-1.00 at 3:2 and 0.68-0.92 at 2:3, admitted on three seeds
 * of twenty and fifteen, against a square output's own 0.68-0.94 and eleven.
 * So this pair now reaches the refinement from a frame of any shape, which is
 * the leak the table above is about and this is one family of it.
 *
 * The two unrelated JPEGs are the widest of the junk families that this
 * reading is meant to catch and does not always. Over eighty seed pairs -
 * two unrelated scenes, one smooth and one mid-textured, at qualities 95, 75,
 * 50 and 20 - next ran 0.72-1.00 and eight were admitted, about one in ten,
 * worst on the smooth pair at quality 50 where three of ten passed; the
 * plateau never refused one that this admitted. The leak is where the lattice
 * puts its aliases. The nearest sit eight pixels from the peak, inside the
 * box, so what is read is the pair at sixteen or seventeen, and those fall
 * with the scene's own smooth envelope rather than standing level with the
 * peak the way the near ones do. At the survey square the same pairs used to
 * be refused on every seed by the letterbox rather than by anything here -
 * next 0.97-0.98 at a plateau of 0.99 - and over the picture's box they read
 * next 0.69-0.99 at a plateau of 0.16-0.79 and pass on two seeds in ten at
 * 3:2 and three at 2:3, where the same pair as a square output passes none.
 * That is the widest the box's cost gets on any family measured, and it is
 * left standing rather than gated because the frame it admits is one window
 * disagreeing with the other eight at the refinement, which the consensus
 * drops. The consensus is what catches this rather than either floor, which is
 * why the number is recorded.
 *
 * The reach was measured at 6, 8, 10, 12, 16 and 20. None of them moves the
 * unrelated pairs or the star fields, whose next peak is far away - a sparse
 * sky reads the same 0.33 at every reach from 6 to 20. What moves is a real
 * broad peak's own skirt, and the skirt is wider than the box: on the ring
 * around the peak the low-texture and textured pairs first fall to the
 * outside level at eleven or twelve pixels, so at ten the reading is still
 * partly the peak itself. It costs 0.03 on the low-texture scene at fifteen
 * per cent noise, 0.10 at thirty and 0.08 on the letterboxed textured scene
 * at fifty, against a reach past the skirt - not enough to buy anything, and
 * a wider box would have to be justified against the junk it stops looking
 * at. At 6, inside the plateau radius, the skirt lifts the low-texture scene
 * at thirty per cent to 0.61 and the textured at fifty to 0.82, for nothing.
 * Six does do one thing ten cannot: the refinement's lattice lock on smooth
 * JPEG content, whose neighbouring peaks sit exactly eight pixels away, reads
 * 0.50-0.69 there against 0.46-0.93 at ten. That would be a floor of 0.7
 * refusing the lock outright, bought with the real side's margin, so it was
 * not taken - and, as the paragraph on plateauRadius says, the plateau
 * refuses that lock anyway at every quality but the heaviest.
 *
 * The same floor decides the log-polar peak, and it needs no floor of its
 * own. Real turns at 256 over ten seeds: the low-texture scene turned three
 * degrees reads 0.30-0.46 at fifteen per cent noise, 0.36-0.47 at twenty and
 * 0.41-0.61 at thirty; turned four degrees, 0.31-0.61; the textured scene
 * turned four degrees 0.20-0.27, nine degrees at thirty per cent 0.48-0.72,
 * twenty degrees 0.22-0.34, scaled by 1.12 0.23-0.38; a star field turned
 * five degrees 0.07-0.22. Every seed of every one is admitted here, and
 * estimate() reads the angle on all ten seeds of each. The junk there: the
 * gradient at fifteen per cent noise 0.83-0.95 and unrelated pairs 0.70-1.00,
 * one to three seeds in ten passing.
 *
 * The letterbox is the one place this reading moved when lumaSquare began
 * handing window2d the picture's box, and it moved the right way. On the
 * centred 3:2 box over twenty seeds, the 8-bit gradient's log-polar peak read
 * 0.20-0.54 with the whole square tapered and was admitted on every seed -
 * nothing refused it, and similarity mode was applying it as a scale of
 * 0.95-1.01 - where over the picture's box it reads 0.74-1.00 and is refused
 * on eighteen. Two seeds still pass, so this is a rate and not a rule, and
 * what they buy is discarded when the translation peak they lead to is
 * refused. Real turns are a wash or better: the textured scene turned nine
 * degrees at thirty per cent goes from fifteen seeds in twenty admitted to
 * twenty, the low-texture scene turned three degrees at twenty per cent from
 * twenty to nineteen, and estimate() reads both angles to within a degree or
 * two either way.
 *
 * The margin there is 0.01, not the 0.08 those rows suggest, and the case
 * that spends it is a turn too small to matter. Ten further seeds of the
 * textured scene turned a third of a degree at thirty per cent noise read
 * 0.35-0.81, right on every one, and the seed at 0.811 is refused: the
 * smaller the turn, the nearer the log-polar peak sits to the surface's own
 * junk peak at zero, and the two read as one crowd. What that seed costs is
 * the rotation and not the frame - a third of a degree is under a pixel over
 * most of a 24-megapixel frame, and the translation is measured either way.
 * A floor of 0.85 for this surface alone would admit it, and would also
 * admit the unrelated pairs that sit at 0.71-0.86 there, one of which reads
 * a 7.2-degree turn between two pictures that share nothing; the trade is
 * one refused third of a degree against a wrong turn applied to a frame the
 * translation gate may well admit, and it was not taken.
 *
 * This floor decides every surface but one, and N_MAX_SURVEY says which one
 * and why. The two are the same reading of two different surfaces, not two
 * opinions about one: everything gated here is a full square of picture at the
 * resolution it was shot at, and the exception is a thumbnail of the whole
 * frame with a taper cut to the picture's own box.
 */
export const N_MAX = 0.8;

/**
 * The same reading at the coarse survey square, where it lands elsewhere.
 *
 * `next` is a ratio of a surface to its own peak and so does not scale with
 * the side - the tables above hold from 128 to 512 - but it does depend on
 * what is in the square, and the coarse square holds something no refinement
 * window does. Two things separate the regimes, and both arrived together.
 *
 * The survey square is a thumbnail. The whole frame is resized to a 256 long
 * edge before it is correlated, so a photograph's noise is averaged down about
 * twelvefold on the way in and the peak that comes back is sharper than the
 * same scene's at a full-resolution window: the textured scene at fifty per
 * cent noise reads 0.04-0.06 here in the browser, where a sparse sky at the
 * 512 window - the family that set N_MAX - reads 0.32-0.96 with its answer
 * right. And since lumaSquare hands window2d the picture's box, the letterbox
 * ridge is gone from this square. That ridge stood high away from the peak on
 * every surface it was in, junk and real alike, which is exactly what this
 * statistic reads, so removing it moved the whole distribution down - the junk
 * with it, which is the point. A clear sky at 3:2 that read 0.96 over the
 * whole square reads 0.62-0.74 over the box, and 0.8 no longer refuses it.
 *
 * WHAT THE BROWSER MEASURED, on the built survey path - a scene rendered at
 * 3000x2000 or 2000x3000, JPEG at quality 0.92, createImageBitmap resized to
 * the 256-long-edge thumbnail, drawn into the square through the fit
 * transform, then this reading - twelve seeds a family, as the peak-uniqueness
 * reading and as the count isMeasured admitted at 0.8:
 *
 *                                   whole square   the box    admitted
 *   textured 3:2                     0.06-0.09     0.03-0.04   12 -> 12
 *   textured, 50% noise, 3:2         0.13-0.16     0.04-0.06   12 -> 12
 *   low texture 15%, 2:3             0.24-0.27     0.05-0.07   12 -> 12
 *   low texture 15%, 3:2             0.36-0.39     0.07-0.11   12 -> 12
 *   four hundred stars, 6%, 3:2      0.41-0.51     0.12-0.29   12 -> 12
 *   clear sky, 3:2                   0.96          0.62-0.74    0 -> 11
 *   clear sky, 2:3                   0.96          0.75-0.91    0 -> 0
 *   noisy sky, 3:2                   0.94-0.97     0.73-0.99    0 -> 1
 *   unrelated low/low, 3:2           0.89-1.00     0.71-0.99    0 -> 2
 *   unrelated texture/texture, 3:2   0.82-0.99     0.80-1.00    0 -> 0
 *
 * The separation is wider than the letterbox ever gave - a real answer at
 * worst 0.29 against junk at best 0.62, where the letterbox had 0.51 against
 * 0.82 - and it is in the wrong place for a floor of 0.8, which a clear sky at
 * 3:2 now walks under on eleven seeds in twelve, moved by up to 38 output
 * pixels from an identity that was the truth. That is the failure the plateau
 * and this reading exist to prevent, so the box needed a floor of its own.
 *
 * WHERE THE LINE IS, measured in node on fixtures that reproduce that path -
 * the scene rendered large, given its noise and its 8 bits there,
 * box-averaged down into the picture's rectangle and drawn into the centred
 * box - at 3:2, 2:3 and square outputs, twenty-one seeds a family.
 *
 * THE RESIZE RATIO IS THE FIXTURE. The pipeline shrinks a whole frame into a
 * 256 long edge, so a 3000-pixel frame is averaged 11.7 to one before anything
 * is correlated, and a fixture that renders smaller leaves noise on a real
 * scene that the pipeline has already thrown away. The scenes below are
 * therefore rendered at twelve times the rectangle inside the square - 3072
 * into 256, the browser's own ratio to a rounding - and the tests derive that
 * multiplier from the two sizes rather than stating it. The scale is not a
 * detail: swept at 4, 6, 8, 10 and 12 against the browser column above, only
 * the last reproduces it. At 6, which is what the first version of this floor
 * was measured on, the low-texture scene at fifteen per cent reads 0.035-0.037
 * where the browser reads 0.07-0.11 and the fixture at twelve reads
 * 0.073-0.077; the sparse fields read about half what they read at twelve, and
 * the floor that came out of it was too high to be safe by that much.
 *
 * How the fixtures then compare with the browser, family by family, box
 * column, the browser's number second:
 *
 *   textured, 3:2                  0.057-0.063   0.03-0.04   fixture high
 *   textured 50% noise, 3:2        0.057-0.073   0.04-0.06   fixture high
 *   low texture 15%, 2:3           0.080-0.085   0.05-0.07   fixture high
 *   low texture 15%, 3:2           0.073-0.077   0.07-0.11   inside
 *   four hundred stars 6%, 3:2     0.151-0.201   0.12-0.29   inside
 *   clear sky, 3:2                 0.671-0.674   0.62-0.74   inside
 *   clear sky, 2:3                 0.637-0.645   0.75-0.91   fixture LOW
 *   noisy sky, 3:2                 0.577-0.716   0.73-0.99   fixture LOW
 *   unrelated low/low, 3:2         0.906-1.000   0.71-0.99   fixture high
 *   unrelated texture/texture      0.875-0.999   0.80-1.00   inside
 *
 * So the real side agrees to about two hundredths and the junk side reads LOW
 * on the skies - by a tenth at 2:3 and by fifteen hundredths on the noisy one.
 * That is the conservative direction and the reason the fixtures are worth
 * trusting for a floor: they put the junk nearer the real side than the
 * browser does, so a line that clears the fixtures' junk clears the browser's
 * by more. It is not licence to trust them upward. Where a fixture family
 * reads higher than the browser on the real side, the browser is the number
 * this floor is calibrated against, and any family the browser never measured
 * is marked below as what it is.
 *
 *                                          next        answer
 *   textured, clean to 50% noise          0.053-0.084  right, 0.11-0.14 px
 *   textured, frame eight times dimmer    0.073-0.087  right, 0.11-0.14 px
 *   low texture, 15% and 30%              0.066-0.087  right, 0.10-0.12 px
 *   four hundred stars, 6%                0.127-0.201  right, 0.15-0.24 px
 *   twenty to fifty stars, five draws     0.223-0.999  FIXTURE ONLY, below
 *   skies: three slopes, 0.4% to 5%       0.577-0.998  junk, moved 0.0-2.7 px
 *   unrelated low/low                     0.869-1.000  junk, moved 18 px
 *   unrelated texture/texture             0.813-0.999  junk
 *   texture against stars                 0.737-0.999  junk
 *   two unrelated JPEGs, Q95 to Q20       0.840-0.999  junk
 *
 * The brightness row is eight TIMES - three stops - with the dim frame
 * quantised to 8 bits at an eighth of the level and carrying the bright
 * frame's read noise, which is the harsher of the two ways to model a bracket;
 * scale its noise down with it and the same pair reads 0.054-0.079. Eight
 * STOPS, 256 to one, is not that family and is not a real one: it reads
 * 0.77-1.00 with its answer between a fifth of a pixel and fifty-eight, and
 * both floors refuse it, which is right.
 *
 * THE FLOOR IS 0.45, and it is the middle of the band the browser measured:
 * every real family it read is under 0.29 and every junk family over 0.62. The
 * fixtures narrow that band rather than widen it - real to 0.20, junk to 0.577
 * - and 0.45 sits inside both, 0.16 above the highest real reading either path
 * gives and 0.13 below the lowest junk one. The two closest families are the
 * four-hundred-star field, which the browser reads at 0.12-0.29 and the
 * fixtures at 0.127-0.201 over three shapes, and a sky at five per cent noise,
 * which the fixtures read at 0.577-0.716 with live and plateau both passing
 * and which moves a frame 0.7-2.7 alignment pixels; the browser's own nearest
 * junk is the clear 3:2 sky at 0.62-0.74.
 *
 * WHAT IT COSTS IS SPARSE STAR FIELDS, and there is no floor that does not.
 * A field of twenty to fifty stars in the thumbnail is the one family that
 * spans the whole band: over five draws each at three shapes and seven seeds,
 * 315 pairs, it reads 0.223-0.999. The browser never measured one on this
 * path, so this row is the fixtures' alone, and it overlaps every junk family
 * in the table - a sparse field's peak genuinely is one of several, which at
 * the survey square is also what a clear sky looks like. Of the 296 of those
 * pairs whose answer is right to within a pixel, 0.45 admits 151, 0.5 admits
 * 199 and 0.8 admits 274; of the 19 that are wrong, 0.45 admits one and 0.8
 * admits two. So the trade is stated rather than claimed away: raising the
 * floor towards the junk buys sparse fields back a few at a time and never all
 * of them, and a field this floor refuses stacks at the identity and is not
 * refined either, because a frame the coarse pass refused is not refined at
 * all; the comment in the stack says why. A dense field - the four hundred
 * stars a real night sky leaves in a 256 thumbnail - is admitted on every seed
 * of every shape, with 0.16 to spare against the browser's own reading of it
 * and 0.25 against the fixtures'.
 *
 * It leans the opposite way to N_MAX, and deliberately. A junk pair N_MAX
 * admits is two pictures that share nothing, in a set that was never going to
 * stack; a sky this floor admits is a set that was perfectly good until the
 * alignment invented a move for it. Admitting costs more here than there, so
 * this floor sits at the middle of its band where N_MAX sits nearer the junk,
 * and the sparse fields are what pays for that.
 *
 * Only the coarse translation peak is judged here. The refinement's windows
 * are full squares of picture with no box, at the resolution the frame was
 * shot at, and the table on N_MAX is theirs; so is the log-polar surface,
 * which logPolar builds as a whole square and window2d tapers whole whatever
 * shape the output has. Both halves of that are pinned by tests that fail if
 * the floor is passed where it should not be or dropped where it should: a
 * real twelve-degree turn's log-polar peak reads 0.625 and has to be admitted,
 * and a five per cent sky at the survey square reads 0.578-0.708 through
 * estimate() and has to be refused.
 */
export const N_MAX_SURVEY = 0.45;
const NEXT_REACH = 10;

/**
 * The shape of the peak: junk that correlates perfectly well and still has no
 * position - a plateau or a ridge.
 *
 * `plateau` is the highest point of the surface eight pixels from the peak
 * in the eight compass directions - eight along the axes, eight times root
 * two on the diagonals - as a fraction of the peak. A height statistic -
 * coherence then, next now - asks how tall the peak is; this asks whether it
 * has a position at all. A smooth gradient - a clear sky - correlates with
 * itself perfectly well, because its 8-bit banding survives the survey and
 * the two frames share every hard edge the survey square gives them, but
 * the surface it produces is a ridge, and where the argmax lands on that
 * ridge is decided by the noise. In the browser, four frames of one gradient
 * with twelve per cent noise came back measured at coherence 0.47-0.51 and
 * were moved by
 * -12.9, +35.6 and -0.4 output pixels from an identity that was the truth:
 * one to three alignment pixels, which the multiply-up turns into tens. The
 * sub-pixel fit cannot help, because it is fitting a parabola to the top of
 * a plateau.
 *
 * Measured in the browser on the built survey path (3000x2000 frames, JPEG,
 * resized to 256x171 and drawn into the 256 square), the plateau at r = 8:
 *
 *                                   coherence   plateau
 *   gradient, identical or shifted  0.28-0.52   0.93-0.99
 *   two unrelated low-texture       0.28        0.81
 *   low-texture, 30% noise          0.60        0.60
 *   low-texture, 15% noise          0.71-0.81   0.34-0.40
 *   star field, 6% noise            0.51-0.66   0.35-0.48
 *   textured, clean and 30% noise   0.92-0.96   0.11-0.17
 *
 * and in node on the fixtures in tests/js/stack-images-align.test.js, ten
 * seeds each at 256, over the tests' TOP-ANCHORED letterbox with the whole
 * square tapered. That is a stronger letterbox than `placement` builds and it
 * is what these readings were taken on; it is also what reproduces the browser
 * rows above, where a full-square gradient measures coherence 0.04-0.10 and
 * next 0.87-0.99, and so do the vignette and textured-sky rows below (next
 * 0.76-0.99), all refused without the plateau's help. It is the letterbox's
 * hard edge, shared by both frames, that pins the vertical, lifts the
 * coherence over what was then its floor, and leaves the ridge:
 *
 *                                        coherence    plateau     refused
 *   gradient, 8-bit, 0.3-3% noise        0.43-0.60    0.95-0.996  all
 *   gradient, 8-bit, 12% noise           0.20-0.23    0.87-1.00   all
 *   vignette, 8-bit, 1-3% noise          0.48-0.57    0.96-0.99   all
 *   textured sky (5% low-frequency)      0.45-0.57    0.94-0.99   all
 *   vignette over low-texture, moved 3   0.54-0.55    0.67-0.74   5 of 10
 *   two unrelated low-texture, 5%        0.25-0.26    0.73-0.82   all
 *   two unrelated low-texture, 15%       0.15-0.17    0.59-0.83   about half
 *   two unrelated textured, 5%           0.18-0.20    0.59-0.73   1 of 10
 *   unrelated texture/low, /stars        0.09-0.21    0.42-0.94   all
 *   low-texture, 30% noise               0.26-0.28    0.47-0.68   none
 *   low-texture, 15% noise               0.40-0.42    0.44-0.58   none
 *   textured, 50% noise                  0.11-0.12    0.47-0.72   1 of 10
 *   textured, 30% noise                  0.19-0.21    0.37-0.54   none
 *   textured, 15% noise                  0.36-0.38    0.24-0.29   none
 *   vignette over textured, moved 3      0.69-0.70    0.40-0.42   none
 *   star field, 6% and 15% noise         0.52-0.79    0.03-0.10   none
 *   twenty stars, 6% noise               0.20-0.23    0.02-0.12   none
 *
 * The floor is 0.7. Against the browser it has 0.1 of margin on both sides;
 * against those fixtures the real side is thinner, 0.02-0.05, because the
 * ridge sat under every real pair too: the low-texture scene at
 * thirty per cent noise reaches 0.65-0.68 depending on the seeds, and the
 * scene that straddles the floor is a low-texture one under a lens vignette
 * that did not move with it, refused on half its seeds although its peak was
 * within 0.8 pixels of the truth on every one. Raising the floor to 0.75
 * would take all ten and still refuse every gradient (0.87 at worst) and the
 * five per cent low/low pair, but admits more of the two pairs below - a
 * trade, not an improvement, so 0.7 stands. The textured sky is refused
 * because it cannot be located rather than because it is junk: its peak was
 * 1.2-6.8 pixels off, and refusing it is right. The textured scene at fifty
 * per cent noise was refused by the coherence floor of the time, with its
 * peak 0.6-2.2 pixels off; it now passes nine seeds in ten at a next of
 * 0.55-0.67, with 0.4-2.4 pixels of error, which is the small blur a
 * doubtful coarse move on a real scene costs.
 *
 * That table is a surface the coarse pass no longer builds, because
 * lumaSquare now hands window2d the output box and the taper follows the
 * picture's own edge. Re-measured on the CENTRED box, twenty seeds a family
 * over 3:2 and 2:3, this floor's readings all fall and so do the answers'
 * distance from it: the 8-bit gradients and skies read 0.56-0.93 here where
 * the whole-square taper read 0.96-1.00, the two unrelated textured pictures
 * 0.23-0.87, the two unrelated low-texture ones 0.37-0.81, the low-texture
 * scene at thirty per cent 0.39-0.58 and the textured at fifty 0.28-0.52.
 *
 * What that means for the gradient is the point, and it is not that this floor
 * catches it. Over the whole square it was refused by plateau AND by next,
 * with a wide margin on both; over the box its plateau alone would admit it on
 * some seeds and only next still refuses, at 0.81-1.00 - the same numbers the
 * gradient reads as a square output (plateau 0.61-0.85, next 0.80-1.00, one
 * seed in twenty admitted), because the box is what a square output has always
 * been. The two junk pairs this floor knowingly let through go the same way:
 * they read 0.23-0.87 and 0.37-0.81 here, under the floor, and it is next that
 * decides them. The comment on N_MAX has that whole trade counted, and the
 * browser's own reading of a low/low pair, 0.28 and 0.81, is refused.
 *
 * Which `next` decides them is N_MAX_SURVEY rather than N_MAX, and the
 * difference is not academic: in the browser, where the sky is a photograph of
 * one rather than a fixture, the plateau over the box reads under this floor
 * AND the uniqueness reads 0.62-0.74, so 0.8 admitted a clear sky on eleven
 * seeds in twelve. Neither floor catches that alone. What this one still
 * catches, and was calibrated for, is the plateau of a scene that cannot be
 * located: the wall and the textured sky at the refinement windows, in the
 * paragraph below, which are full squares and untouched.
 *
 * One row the two tables do not agree on: the browser's star field reads
 * 0.35-0.48, ten times the fixture's, and flat across radii of three, five
 * and eight, which is the signature of a ridge rather than of star size. Why
 * that survey square carries a ridge at four tenths of the peak is not
 * explained; it is well under the floor either way.
 *
 * The same floor decides the log-polar peak. Real turns measured 0.02-0.57
 * there (the low-texture scene turned three degrees at twenty per cent noise
 * is the 0.57), and the letterboxed gradient 0.78 at a coherence of 0.22 and
 * a next of 0.39-0.56 - nothing else refused it, so before this it was
 * applied as a scale of 0.95-1.01.
 *
 * On the centred box the pipeline builds, twenty seeds, that gradient's
 * log-polar peak is the one place the change helps the gate rather than
 * costing it: over the whole square it reads plateau 0.19-0.57 at a next of
 * 0.19-0.54 and is admitted on every seed, and over the picture's box it
 * reads plateau 0.07-0.85 at a next of 0.74-1.00 and is refused on eighteen,
 * mostly by next. Real turns are unharmed and slightly better: the textured
 * scene turned nine degrees at thirty per cent noise reads plateau 0.13-0.59
 * here against 0.13-0.87 over the whole square, which is one seed in twenty
 * that this floor used to refuse and no longer does, and the low-texture
 * scene turned three degrees reads 0.18-0.69 against 0.10-0.62, under the
 * floor either way. A refused log-polar peak is a frame reporting no
 * rotation, not a frame refused, which is why either direction is
 * affordable.
 *
 * The radius is eight at every size, and plateauRadius says why it does not
 * follow the side. What it reads at the refinement windows, full square, ten
 * seeds: at 512 every real fixture is under the floor with margin - the
 * low-texture scene 0.35-0.40 at fifteen per cent noise and 0.43-0.55 at
 * thirty, textured 0.20-0.48 at fifteen to fifty, stars 0.04-0.08, the
 * low-texture scene under a vignette 0.34-0.44 - while the plateaus the
 * refinement exists to refuse are all over it: a wall with sixty-pixel
 * features at 0.77-0.96 (fifteen per cent noise) and 0.82-0.90 (five), the
 * same wall with thirty-pixel features 0.77-0.87, and the textured sky
 * 0.82-0.91, every one with its peak 0.6-7.5 pixels off - close enough to pass
 * for a residual - at a next of 0.64-0.92 that is partly under N_MAX, so this
 * is the floor that refuses them. At sixteen, the radius the side/32 rule gave
 * 512, the wall at five per cent read 0.59-0.71 and passed nine seeds in ten
 * with 0.6-5.1 pixels of error applied. At 128 the low-texture pair at
 * fifteen per cent reads 0.33-0.47 and is kept, as is the vignette-over-low
 * pair at 0.35-0.53, where the radius of four the old rule gave 128 refused
 * the first at 0.76-0.91 with its peak in the right place; every junk family
 * at 128 is refused by next (0.67-1.00, one gradient seed in ten passing).
 * At 64 the real pairs read 0.02-0.65 here and the junk 0.11-0.73, and the
 * comment on N_MAX says why that window is gated by neither floor.
 */
export const P_MAX = 0.7;

/**
 * Whether a correlation peak is one to act on.
 *
 * Takes what phaseCorrelate returned, and is the one place the decision is
 * made: the log-polar peak, the translation peak and the refinement's residual
 * all come through here, so there is one gate to explain and one place to
 * change how any of them is decided.
 * Without a plateau the peak is taken to be a point and without a next it is
 * taken to be alone, so a statistics object built by hand - the reference
 * move, a consensus check - is answered rather than silently refused on a
 * NaN. The size of the square does not enter: the floors that decide are
 * ratios of the surface to its own peak, and the tables on P_MAX and N_MAX
 * show them holding from 128 to 512 without scaling.
 *
 * What the square holds does enter, in one place, which is what `floor` is
 * for. Every caller but one is judging a full square of picture at the
 * resolution the frame was shot at and wants N_MAX; the coarse survey square
 * is a thumbnail with a taper cut to the picture's box, its whole distribution
 * sits lower, and it passes N_MAX_SURVEY. The floor travels as an argument
 * rather than as a second function so that the two cannot drift apart, and
 * because a caller that says nothing gets the floor the tables above describe.
 */
export function isMeasured({ live, plateau = 0, next = 0 }, floor = N_MAX) {
  return live >= L_MIN && plateau <= P_MAX && next <= floor;
}

/** The identity, for a frame that needs no moving or could not be measured. */
export const NO_MOVE = Object.freeze({ dx: 0, dy: 0, angle: 0, scale: 1 });

/* ------------------------------------------------------------- preparation */

/**
 * A Hann window over the square, or over a rectangle inside it, with the mean
 * taken out first.
 *
 * Both halves matter and both are about the edges. A Fourier transform treats
 * the square as one tile of an infinite repeating pattern, so the right-hand
 * edge sits against the left-hand one; unless the picture happens to match
 * itself there, that seam is a hard vertical line, and a hard line is a huge
 * feature that both frames share regardless of how they moved. The window fades
 * the edges to nothing so there is no seam, and subtracting the mean first
 * stops the fade itself becoming the brightest structure in the frame.
 *
 * WHY A RECTANGLE, AND WHEN
 *
 * The coarse square is the output box letterboxed into 256, so unless the
 * output is square the picture fills a sub-rectangle of it and the rest is the
 * canvas's transparent black, which reads back as a luma of zero. Fading the
 * square's own edges leaves that inner edge untouched: a hard step from picture
 * values straight down to nothing, in exactly the same place in every frame,
 * and therefore the strongest thing the two frames share however the camera
 * moved. It matches itself at every offset along its own direction, which is a
 * ridge in the correlation surface rather than a peak. Given the picture's
 * rectangle, the mean and the taper are taken over that rectangle alone and
 * everything outside it is left at zero, so the picture's own edge fades out
 * the way the square's edges do and the step is gone. `box` is in pixels of
 * the square and is rounded to whole ones; the whole square is the same window
 * as before, to the last bit.
 *
 * WHAT THE STEP WAS DOING, WHICH IS TWO THINGS
 *
 * It pulled the answer along the letterboxed axis, and it stood high away from
 * the peak on every surface it was in - which is what `next` reads, so it was
 * also gating. Both are the same feature and neither can be had without the
 * other; everything below is that trade, measured.
 *
 * In the browser, on the built survey path - JPEG at quality 0.92,
 * createImageBitmap resized to the 256-long-edge thumbnail, drawn into the
 * square through the same fit transform - as the error of the coarse move in
 * output pixels. One pair per scene, so these are single readings rather than
 * ranges. "Centre square" is the alternative of cropping the output's middle
 * square to fill the alignment square and letterboxing nothing, measured and
 * not taken because it is inconsistent across the real scenes.
 *
 *                            square window   this   centre square
 *   texture 3:2                   0.84       0.78      1.03
 *   texture 2:3                   1.17       0.94      1.00
 *   low texture 15%, 3:2          1.98       1.48      2.18
 *   low texture 15%, 2:3          2.64       1.46      1.49
 *   low texture 30%, 3:2          1.81       0.76      1.29
 *   stars 6%, 3:2                 2.03       2.04      1.71
 *   low texture 15%, square       0.77       0.77      0.77
 *
 * The last row is the control: with no letterbox there is no rectangle and all
 * three are the same window.
 *
 * THE SAME THING OVER SEEDS, AND THE REST OF IT
 *
 * On the fixtures in tests/js/stack-images-align.test.js, at the box
 * `placement` actually builds - CENTRED in the square, rows 43 to 212 for a
 * 3:2 output and columns 43 to 212 for a 2:3 one - twenty seeds a family, the
 * error of the coarse move in alignment pixels. The right-hand column is the
 * same scene as a SQUARE output, where there is no letterbox and this function
 * is unchanged, and it is the column that explains the other two:
 *
 *                          whole square   the box     square output
 *   low texture 15%, 3:2    1.36-1.96     0.08-1.37     0.10-1.10
 *   low texture 15%, 2:3    2.03-2.37     0.13-1.21     0.10-1.10
 *   low texture 30%, 3:2    0.65-2.14     0.12-2.24     0.22-1.56
 *   low texture 30%, 2:3    0.44-2.54     0.26-1.63     0.22-1.56
 *   textured 15%, 3:2       0.03-0.43     0.07-0.44     0.03-0.39
 *   textured 50%, 3:2       0.37-2.51     0.38-3.57     0.39-1.54
 *   four hundred stars 6%   0.00-0.06     0.01-0.07     0.00-0.06
 *
 * A letterboxed low-texture pair was landing a pixel and a half to two and a
 * half out where the same scene as a square output lands inside one, and with
 * the box it lands where the square output does. That is the whole of the
 * accuracy claim: the box does not make the coarse pass better than it was, it
 * stops the letterbox making it worse. The test in the align suite pins the
 * first ten of those seeds, where the boxed rows read 0.29-1.09 and 0.13-1.05.
 * The stars have a black ground, so their step is the size of a night sky's
 * mean and there was nothing there to remove. The textured scene at fifty per
 * cent noise is the one row where the box is worse than either neighbour, and
 * the reason is that it is the picture and not the square that is being
 * correlated now - 256 by 170 rather than 256 by 256 - so the noisiest scene
 * has a third less to average over.
 *
 * The junk side moves the same way and for the same reason. Over eleven junk
 * families - the 8-bit gradient and two skies at three noise levels, unrelated
 * texture/texture, low/low and texture/low at two each, and texture against
 * stars - twenty seeds each, admitted by isMeasured AT N_MAX, which is the
 * floor the coarse square was being judged against when the ridge came out and
 * is no longer the floor it is judged against at all:
 *
 *                       whole square   the box   square output
 *   3:2 output             5/220        31/220      36/220
 *   2:3 output             1/220        39/220      36/220
 *
 * So the ridge was a gate that only letterboxed outputs had, and taking it out
 * leaves every output shape with the leak a square output has always had and
 * the README already records - the unrelated texture/low and low/low pairs,
 * left to the consensus check. That is a real cost and it is the reason this
 * change is a trade rather than a fix; what it is not is a new failure, and the
 * right-hand column is how to tell the difference.
 *
 * THE TWO FIXTURE TRAPS UNDER THOSE NUMBERS
 *
 * The height of the step is the picture's own mean above black, so a fixture
 * whose scene starts at zero has a third of a photograph's ridge and does not
 * reproduce the browser at all: at the fixtures' own levels the low-texture
 * 3:2 pair reads 0.10-1.42 with the whole square against 0.08-1.37 with the
 * box, which is no difference. Lifted to a photographic black level it reads
 * 1.36-1.96 against 0.08-1.37, and `next` falls from 0.20-0.31 to 0.12-0.20
 * against the browser's own 0.26 to 0.08. The tests lift it, and say so.
 *
 * The other is the geometry. `placement` centres the box, so a 3:2 picture's
 * two horizontal edges land where the square's own taper has already faded to
 * a quarter; a fixture that anchors the letterbox at the top instead puts its
 * one edge at three-quarters weight and shows an effect three times the size.
 * The tests' `letterbox` helper is the top-anchored one and is kept only
 * because the tables on P_MAX and N_MAX were read on it.
 *
 * Filling outside the box with the box's mean and tapering the whole square -
 * the alternative this file used to name as the fix - was measured on the same
 * families and is the same trade, not a way round it: 39/220 and 35/220 of the
 * junk against the box's 31 and 39, with the low-texture pair at 0.16-1.09.
 * It is the step that was doing the gating, not the size of the picture under
 * it, and nothing that removes the step keeps it.
 *
 * So the gate work the step was doing by accident is done on purpose instead,
 * by a floor calibrated on the surface that is left. Taking the ridge out
 * lowered every reading on this square, real and junk together, and the junk
 * further than the real: N_MAX_SURVEY is where the two now separate, and its
 * comment carries the distribution both sides of it. That is the shape of this
 * whole change - the letterbox was buying accuracy away to pay for a gate, and
 * the accuracy is bought back with a number that can be looked at.
 *
 * @param {Float64Array} values     size*size, modified in place
 * @param {number} size             the side of the square
 * @param {?{x: number, y: number, width: number, height: number}} box
 *   the picture's rectangle inside the square, or nothing for all of it
 */
export function window2d(values, size, box = null) {
  const left = box ? Math.min(size, Math.max(0, Math.round(box.x))) : 0;
  const top = box ? Math.min(size, Math.max(0, Math.round(box.y))) : 0;
  const right = box ? Math.min(size, Math.max(left, Math.round(box.x + box.width))) : size;
  const bottom = box ? Math.min(size, Math.max(top, Math.round(box.y + box.height))) : size;
  const width = right - left;
  const height = bottom - top;

  // A rectangle a pixel or less on a side has no taper to speak of - the Hann
  // divides by one less than the side - and nothing in it to correlate either.
  if (width < 2 || height < 2) {
    values.fill(0);
    return values;
  }

  let total = 0;
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) total += values[y * size + x];
  }
  const mean = total / (width * height);

  const taper = (span) => {
    const out = new Float64Array(span);
    for (let i = 0; i < span; i += 1) out[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (span - 1));
    return out;
  };
  const across = taper(width);
  const down = taper(height);

  for (let y = 0; y < size; y += 1) {
    const inside = y >= top && y < bottom;
    for (let x = 0; x < size; x += 1) {
      values[y * size + x] = inside && x >= left && x < right
        ? (values[y * size + x] - mean) * down[y - top] * across[x - left]
        : 0;
    }
  }
  return values;
}

/* ------------------------------------------------------- phase correlation */

/**
 * Where `b` sits relative to `a`.
 *
 * The returned shift is what has to be applied to `b` to put it on top of `a`,
 * measured in pixels of the square both were resampled into.
 *
 * The peak is fitted with a parabola through its two neighbours on each axis,
 * which is what gets this below a whole pixel. Without it every frame snaps to
 * an integer offset and a burst that drifted by half a pixel a frame stacks
 * slightly soft - the exact softness the alignment was there to prevent.
 *
 * Beside the shift it returns the four statistics, two of which the gate
 * reads. `live` is the mean of the weights the whitening gave the bins, the
 * share of the spectrum that stood above the noise floor. `coherence` is the
 * peak divided by the height every weighted bin agreeing would have produced:
 * one for a perfect match, near zero for two pictures that share nothing -
 * and, the comment on L_MIN says why, near zero for a perfect match of a
 * sparse field too, which is why it is reported and not read. Neither depends
 * on how bright the frames were or how much spectrum they had, which is what
 * the z-score this used to report did depend on - after whitening, every live
 * bin has the same magnitude, so a perfect match peaks at k/n over a floor of
 * about sqrt(k)/n, and the score was sqrt(k): a count of the bins that
 * survived, not a measure of agreement. It read 27 on a featureless gradient.
 * `plateau` is how much of the peak is still standing a few pixels away from
 * it, the shape of the peak rather than its height, and `next` is how tall
 * the rest of the surface gets once the peak's own neighbourhood is left out,
 * whether the peak is the answer or the tallest of several; the comments on
 * P_MAX and N_MAX say what each catches that the other cannot.
 *
 * @param {Float64Array} a  windowed, size*size
 * @param {Float64Array} b  windowed, size*size
 * @param {number} size     a power of two
 */
export function phaseCorrelate(a, b, size) {
  const n = size * size;
  const aRe = Float64Array.from(a);
  const aIm = new Float64Array(n);
  const bRe = Float64Array.from(b);
  const bIm = new Float64Array(n);

  fft2(aRe, aIm, size);
  fft2(bRe, bIm, size);

  // The cross-power spectrum, whitened - each bin divided by its own magnitude,
  // so that only where the structure is counts and not how strong it is, which
  // is what makes this indifferent to one frame being brighter than the other.
  //
  // Divided by its magnitude plus a floor, rather than by its magnitude alone,
  // and the floor is the point. Whitening lifts every bin to the same weight,
  // including the thousands a photograph put nothing into, which hold nothing
  // but sensor noise and whose phases say nothing about the shift. Adding a
  // floor of WHITEN times the median bin to the divisor leaves a bin well
  // above the floor whitened and lets one below it fade in proportion to how
  // far below it is: the strong bins vote with one voice each and the noise
  // barely votes at all. The median rather than the mean because the mean is
  // owned by the handful of low-frequency bins and says nothing about where
  // the noise sits.
  const magnitude = new Float64Array(n);
  let strongest = 0;
  for (let i = 0; i < n; i += 1) {
    const re = aRe[i] * bRe[i] + aIm[i] * bIm[i];
    const im = aIm[i] * bRe[i] - aRe[i] * bIm[i];
    aRe[i] = re;
    aIm[i] = im;
    magnitude[i] = Math.hypot(re, im);
    if (magnitude[i] > strongest) strongest = magnitude[i];
  }

  const eps = WHITEN * median(magnitude);
  // Only a guard against dividing by nothing, on a square that is genuinely
  // empty; anything with a picture in it never reaches it.
  const floor = strongest * 1e-6;
  let weight = 0;
  for (let i = 0; i < n; i += 1) {
    const divisor = magnitude[i] + eps;
    if (divisor <= floor) {
      aRe[i] = 0;
      aIm[i] = 0;
    } else {
      aRe[i] /= divisor;
      aIm[i] /= divisor;
      weight += magnitude[i] / divisor;
    }
  }

  fft2(aRe, aIm, size, true);

  let peak = -Infinity;
  let peakAt = 0;
  for (let i = 0; i < n; i += 1) {
    if (aRe[i] > peak) { peak = aRe[i]; peakAt = i; }
  }

  const px = peakAt % size;
  const py = (peakAt / size) | 0;
  const at = (x, y) => aRe[((y + size) % size) * size + ((x + size) % size)];

  const dx = wrap(px + parabola(at(px - 1, py), peak, at(px + 1, py)), size);
  const dy = wrap(py + parabola(at(px, py - 1), peak, at(px, py + 1)), size);

  // How much of the peak is still standing a few pixels out. A peak that is a
  // point has fallen to the noise by then; one that is a plateau or a ridge
  // has not, and its argmax is wherever the noise tipped it. Eight compass
  // directions rather than a ring, because a ridge runs one way and the
  // question is whether *any* direction is still high - r along the axes and
  // r * sqrt(2) on the diagonals, which P_MAX was calibrated on: a true ring
  // at r reads 0.05-0.15 higher on real peaks and would need its own floor.
  const r = plateauRadius();
  let shoulder = -Infinity;
  for (let j = -1; j <= 1; j += 1) {
    for (let i = -1; i <= 1; i += 1) {
      if (i === 0 && j === 0) continue;
      const value = at(px + i * r, py + j * r);
      if (value > shoulder) shoulder = value;
    }
  }

  // The tallest point anywhere else on the surface, outside a box around the
  // peak wide enough to hold the peak's own skirt: whether the peak is the
  // answer or merely the tallest of several. A second pass rather than part
  // of the first, because the box is not known until the peak is; it is one
  // comparison per bin and the transform above dwarfs it. Wrapping, since the
  // surface does.
  const reach = NEXT_REACH;
  const inside = new Uint8Array(size);
  for (let x = 0; x < size; x += 1) {
    const away = Math.abs(x - px);
    inside[x] = Math.min(away, size - away) <= reach ? 1 : 0;
  }
  let next = -Infinity;
  let outside = false;
  for (let y = 0; y < size; y += 1) {
    const away = Math.abs(y - py);
    const row = y * size;
    if (Math.min(away, size - away) <= reach) {
      for (let x = 0; x < size; x += 1) {
        if (inside[x]) continue;
        outside = true;
        if (aRe[row + x] > next) next = aRe[row + x];
      }
    } else {
      outside = true;
      for (let x = 0; x < size; x += 1) {
        if (aRe[row + x] > next) next = aRe[row + x];
      }
    }
  }

  return {
    // The peak sits where the frame has to be moved to, not where it moved
    // from, so this is already the correction and is not negated. That is the
    // one fact in this file worth checking rather than reasoning about, and the
    // first test beside it pins it against a shift the test itself created.
    dx,
    dy,
    peak,
    live: weight / n,
    // The inverse transform divides by n, so every weighted bin agreeing at
    // one offset stacks to weight / n there.
    coherence: weight > 0 ? (peak * n) / weight : 0,
    plateau: peak > 0 ? shoulder / peak : 1,
    next: peak > 0 && outside ? next / peak : 1,
  };
}

/**
 * How far from the peak the plateau is read: eight pixels, at every size.
 *
 * Eight is the scale at which a peak has stopped placing anything. The
 * refinement is looking for a residual of a pixel or two, so a peak still
 * standing at eight cannot say which of nine pixels the frame belongs at,
 * whatever its argmax reports; and at the coarse square eight alignment
 * pixels is already tens of output pixels on any frame the survey shrank.
 * The first version scaled the radius with the side - a thirty-second of it,
 * sixteen at 512 - reasoning from the multiply-up, which the refinement
 * window does not have: at sixteen the wall at output resolution the
 * refinement exists to refuse passed nine seeds in ten, and at four the
 * low-texture pair at 128 was refused with its peak in the right place. The
 * comment on P_MAX has the readings at both.
 *
 * Eight is also the pitch of a JPEG's block grid, and that coincidence is
 * doing work nobody chose. Two frames of one smooth scene compressed at
 * quality 75 or 50 lock onto the lattice, and the shoulder read at eight
 * lands on its first alias: the plateau spikes there - 0.71-0.96 at r = 8
 * against 0.50-0.69 at 6, 0.56-0.81 at 9 and 0.47-0.74 at 10 - and refuses
 * the lock on every seed at both qualities, where next does not. Only at
 * quality 20, where the alias is buried in the blocking, does the lock get
 * through. So a change to this radius silently gives that lock back, and what
 * must not be broken is the pair of numbers - a reach of eight, read at eight
 * - rather than any reasoning about where either came from; the lattice test
 * in tests/js/stack-images-align.test.js pins both sides so it cannot go
 * quietly.
 */
function plateauRadius() {
  return 8;
}

/**
 * The median of an array, by quickselect over a copy.
 *
 * A sort would do the same in twenty-five milliseconds at 512 by 512, which
 * per frame is a quarter of the time the correlation itself takes; this is a
 * fifth of that, and the array is only read once more anyway.
 */
function median(values) {
  const copy = Float64Array.from(values);
  const target = copy.length >> 1;
  let low = 0;
  let high = copy.length - 1;
  while (low < high) {
    const pivot = copy[(low + high) >> 1];
    let i = low;
    let j = high;
    while (i <= j) {
      while (copy[i] < pivot) i += 1;
      while (copy[j] > pivot) j -= 1;
      if (i <= j) {
        const swap = copy[i];
        copy[i] = copy[j];
        copy[j] = swap;
        i += 1;
        j -= 1;
      }
    }
    if (j < target) low = i;
    else if (i > target) high = j;
    else break;
  }
  return copy[target];
}

/** Sub-pixel offset of a peak, from it and its two neighbours. */
function parabola(before, middle, after) {
  const denominator = before - 2 * middle + after;
  if (!denominator) return 0;
  const shift = (0.5 * (before - after)) / denominator;
  // A fit that lands outside the sample it was centred on is not a refinement,
  // it is a peak that was never parabolic. The integer answer is better.
  return Math.abs(shift) <= 1 ? shift : 0;
}

/** An index in [0, size) read as an offset in (-size/2, size/2]. */
function wrap(value, size) {
  return value > size / 2 ? value - size : value;
}

/* ------------------------------------------------------------- log-polar */

/**
 * The log-magnitude spectrum of a square, with the zero frequency moved to the
 * middle.
 *
 * The logarithm is not decoration. A picture's spectrum is overwhelmingly
 * concentrated near zero frequency - the average brightness dwarfs everything -
 * and resampling that linearly gives a log-polar image that is one bright blob
 * and no structure to correlate. Taking the logarithm flattens it enough for
 * the edges and textures further out to count.
 */
export function logSpectrum(values, size) {
  const re = Float64Array.from(values);
  const im = new Float64Array(size * size);
  fft2(re, im, size);

  const half = size >> 1;
  const out = new Float64Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      // fftshift, done while reading rather than as a second pass over the
      // array: quadrant (x, y) of the transform belongs at (x + half, y + half).
      const to = ((y + half) % size) * size + ((x + half) % size);
      out[to] = Math.log1p(Math.hypot(re[y * size + x], im[y * size + x]));
    }
  }
  return out;
}

/**
 * Resample a centred spectrum into log-polar coordinates: angle down, log of
 * radius across.
 *
 * Angles run over half a turn only, which is the 180-degree ambiguity mentioned
 * at the top of this file: the magnitude spectrum of a real-valued picture is
 * symmetric through the origin, so the other half carries no information this
 * has not already got.
 *
 * The radius starts at 1 rather than 0 because the logarithm of nothing is not
 * a coordinate, and because the very centre of the spectrum is the average
 * brightness, which says nothing about rotation.
 */
export function logPolar(spectrum, size) {
  const centre = size / 2;
  const maxRadius = centre - 1;
  const base = Math.log(maxRadius) / size;
  const out = new Float64Array(size * size);

  for (let row = 0; row < size; row += 1) {
    const angle = (Math.PI * row) / size;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let column = 0; column < size; column += 1) {
      const radius = Math.exp(column * base);
      out[row * size + column] = sample(
        spectrum, size, centre + radius * cos, centre + radius * sin,
      );
    }
  }
  return { values: out, base };
}

/** Bilinear read, with anything outside the square treated as zero. */
function sample(values, size, x, y) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  if (x0 < 0 || y0 < 0 || x0 + 1 >= size || y0 + 1 >= size) return 0;
  const fx = x - x0;
  const fy = y - y0;
  const top = values[y0 * size + x0] * (1 - fx) + values[y0 * size + x0 + 1] * fx;
  const bottom = values[(y0 + 1) * size + x0] * (1 - fx) + values[(y0 + 1) * size + x0 + 1] * fx;
  return top * (1 - fy) + bottom * fy;
}

/**
 * Rotate and scale a square about its middle, bilinearly.
 *
 * Used to undo a measured rotation before measuring the translation that is
 * left. It reads backwards - for each destination pixel, where in the source
 * did it come from - which is the only way to resample without leaving holes.
 */
export function rotateScale(values, size, degrees, scale) {
  const out = new Float64Array(size * size);
  const radians = (degrees * Math.PI) / 180;
  const cos = Math.cos(radians) / scale;
  const sin = Math.sin(radians) / scale;
  const centre = (size - 1) / 2;

  for (let y = 0; y < size; y += 1) {
    const dy = y - centre;
    for (let x = 0; x < size; x += 1) {
      const dx = x - centre;
      out[y * size + x] = sample(
        values, size, centre + dx * cos + dy * sin, centre - dx * sin + dy * cos,
      );
    }
  }
  return out;
}

/* --------------------------------------------------------------- the door */

/**
 * How to move `frame` so that it lands on `reference`.
 *
 * EVERYTHING RETURNED IS A CORRECTION, NOT A MEASUREMENT. `scale` is what the
 * frame must be multiplied by, not how much larger it is; `angle` is the turn
 * that puts it straight, not the turn it arrived with; `dx`/`dy` are where it
 * has to go, not where it came from. Mixing the two conventions in one object
 * is the mistake this whole file is arranged to avoid, because every one of
 * them is off by a minus sign in a way that still produces a plausible picture.
 *
 * They apply in that order: scale about the centre, then rotate about the
 * centre, then translate. The translation is measured after the other two have
 * been undone, so applying it first would be applying it in the wrong frame.
 *
 * Both arguments are luma squares of the same power-of-two size, already
 * windowed by `window2d`. The answer is in the units of that square; the caller
 * scales the translation back up to the working resolution, and leaves the
 * angle and the scale alone because neither depends on how large the square
 * was.
 *
 * `measured` says whether the translation peak passed the gate. When it did
 * not, the shift returned beside it is whatever the tallest point of a
 * featureless surface happened to be, and the caller should not apply it. This
 * is the pipeline's coarse survey and nothing else calls it, so that gate is
 * the survey's: N_MAX_SURVEY for the translation peak, and N_MAX for the
 * log-polar one, which is a full square whatever shape the output is.
 * `clamped` is a different report and says only one thing: the rotation or
 * scale read off the log-polar peak was too large to be a burst. A log-polar
 * peak the gate refused is not that - the frame reported no rotation at all,
 * and the page must not say it reported too much - so it falls back to
 * translation silently, with `clamped` left false.
 *
 * @param {Float64Array} reference
 * @param {Float64Array} frame
 * @param {number} size
 * @param {string} mode  one of ALIGN_MODES
 * @returns {{dx: number, dy: number, angle: number, scale: number,
 *   measured: boolean, clamped: boolean, live: number, coherence: number,
 *   plateau: number, next: number}}
 */
export function estimate(reference, frame, size, mode) {
  if (mode === 'none') return { ...NO_MOVE, measured: true, clamped: false };

  let angle = 0;
  let scale = 1;
  let clamped = false;
  let moved = frame;

  if (mode === 'similarity') {
    const a = logPolar(logSpectrum(reference, size), size);
    const b = logPolar(logSpectrum(frame, size), size);
    // The log-polar maps are windowed too. Their left edge is the middle of the
    // spectrum and their right edge is its corner, which is as abrupt a seam as
    // the one in the picture itself.
    const found = phaseCorrelate(
      window2d(a.values, size), window2d(b.values, size), size,
    );

    // Down the rows is the angle, across the columns is the logarithm of the
    // scale. The row shift covers half a turn over the whole square.
    // Both readings come out as corrections already - the shift that puts the
    // frame's spectrum back on the reference's is the rotation that puts the
    // frame back - so neither is negated here. The scale is the exception: the
    // column shift measures how much larger the frame is, and the correction is
    // the reciprocal of that.
    const measured = (found.dy * 180) / size;
    angle = measured > 90 ? measured - 180 : measured;
    scale = 1 / Math.exp(found.dx * b.base);

    // The gate is asked before the bounds are, and the order is the point. A
    // peak the gate refuses is where the surface's noise piled up, and the
    // row that noise chose spans half a turn, so a third of the time it lands
    // past thirty degrees; asked the other way round, that frame would be
    // reported as having turned too far to be a burst when it reported no
    // turn at all.
    if (!isMeasured(found)) {
      // Not a peak. Fall back to translation, with nothing to report.
      angle = 0;
      scale = 1;
    } else if (Math.abs(angle) > MAX_ROTATION || scale < MIN_SCALE || scale > MAX_SCALE
        || !Number.isFinite(scale)) {
      // Not a burst. The same fall-back, which is the answer that can only
      // fail to help rather than actively harm, and this one is said.
      angle = 0;
      scale = 1;
      clamped = true;
    } else {
      moved = rotateScale(frame, size, angle, scale);
    }
  }

  const shift = phaseCorrelate(reference, moved, size);
  return {
    dx: shift.dx,
    dy: shift.dy,
    angle,
    scale,
    // A thumbnail of the whole frame, tapered to the picture rather than to
    // the square: a different surface from anything the refinement correlates,
    // and N_MAX_SURVEY is where this statistic separates on it. The log-polar
    // peak above is a whole square of spectrum and keeps N_MAX.
    measured: isMeasured(shift, N_MAX_SURVEY),
    clamped,
    live: shift.live,
    coherence: shift.coherence,
    plateau: shift.plateau,
    next: shift.next,
  };
}
