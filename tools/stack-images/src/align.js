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
 * within the margin. Sensor noise at one per cent is enough for the other
 * two floors to refuse it instead - at 256 on every seed, at 128 on nine in
 * ten.
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
 *   at 256, the survey square, letterboxed   next          plateau     answer
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
 * On the full 256 square, without the letterbox, every real family reads
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
 * unrelated pairs 0.63-0.97. That window is not gated by this either, then:
 * plan.js hands it only to crops whose short side is under 272 pixels, and
 * refineMargin caps what an applied residual can move such a frame at one
 * pixel for a set that did not move.
 *
 * The floor is 0.8. The real side's last case is the noisy sparse sky at the
 * survey square: the browser read it at 0.76 with the right answer, the
 * fixture at 0.63-0.89 with the right answer on every seed, and 0.8 admits
 * the browser's and six seeds of the fixture's ten - about what the old floor
 * admitted, at coherence 0.14-0.17 against 0.15 - where 0.75 admits two. At
 * twenty per cent the same field is wrong on two seeds in ten, so past that
 * refusing is right, and the floor refuses nine. It is the sparse sky and
 * nothing else that spends this margin. Every photograph, and every dense
 * field, is under 0.65 at every size on every seed - the highest of them is
 * the letterboxed textured scene at fifty per cent noise, 0.64 - so the floor
 * could sit at 0.7 for them. The sparse windows are where it is close: over
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
 * that floor could not stay. On the survey square the letterbox refuses the
 * pair (0.82-0.95), so it reaches the refinement only from a square frame,
 * and only once the survey has admitted it.
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
 * peak the way the near ones do. It is harmless as the pipeline is arranged:
 * on the survey square the same pairs are letterboxed and read 0.91-0.99,
 * refused on all eighteen seeds tried, and at 512 an argmax that landed on a
 * random lattice peak is outside the refinement's eight-pixel margin and
 * discarded there. Harmless is not invisible, and the number is recorded
 * because the consensus check is what should be catching this.
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
 * five degrees 0.07-0.22; and the letterboxed textured and low-texture turns
 * 0.26-0.42. Every seed of every one is admitted, and estimate() reads the
 * angle on all ten seeds of each. The junk there: the gradient at fifteen
 * per cent noise 0.83-0.95, unrelated pairs 0.70-1.00 (one to three seeds in
 * ten pass), and the letterboxed 8-bit gradient 0.39-0.56 - admitted, as it
 * was under the old floor, and discarded when the translation peak it
 * leads to is refused.
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
 * translation gate may well admit, and it was not taken. One floor is also
 * one floor to calibrate, which is the whole reason isMeasured is a function
 * rather than three comparisons in two places.
 */
export const N_MAX = 0.8;
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
 * seeds each at 256, with the picture letterboxed to 256x171 over black the
 * way lumaSquare letterboxes a 3:2 frame - which is what reproduces the
 * browser: a full-square gradient measures coherence 0.04-0.10 and next
 * 0.87-0.99, and so do the vignette and textured-sky rows below (next
 * 0.76-0.99), all refused without the plateau's help, and it is the
 * letterbox's hard edge, shared by both frames, that pins the vertical,
 * lifts the coherence over what was then its floor, and leaves the ridge:
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
 * against the fixtures the real side is thinner, 0.02-0.05, because the
 * letterbox ridge sits under every real pair too: the low-texture scene at
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
 * Two pairs the gate knowingly lets through, on the letterboxed square only,
 * both to be caught by the consensus check the way the JPEG lattice will be:
 * two unrelated textured pictures pass nine seeds in ten and are moved by one
 * to four alignment pixels, and two unrelated low-texture pictures at fifteen
 * per cent noise pass about half. The surface is the letterbox ridge with the
 * unrelated texture's noise bumps along it, so the argmax sits on a bump and
 * the ridge reads 0.6-0.7 of it eight pixels away - a noisy ridge measures
 * lower than the gradient's clean one. On a full square both pairs read next
 * 0.82-0.99 (texture/texture) and 0.70-0.91 (low/low, admitted on five seeds
 * in ten) at a coherence of 0.04-0.10. The structural fix is
 * to taper the picture's own box in lumaSquare rather than the whole square,
 * so the letterbox edge is not a feature both frames share; that would remove
 * the ridge under the gradients, the unrelated pairs and the real low-texture
 * answers at once, and is a follow-up rather than part of this gate. The
 * browser's own reading of a low/low pair, 0.28 and 0.81, is refused.
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
 * a next of 0.39-0.56 - nothing else refuses it, so before this it was
 * applied as a scale of 0.95-1.01.
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
 * 0.82-0.91, every one with its peak 0.6-7.5 pixels off, inside the margin,
 * at a next of 0.64-0.92 that is partly under N_MAX, so this is the floor
 * that refuses them. At sixteen, the radius the side/32 rule gave
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
 * all come through here, so there is one gate to calibrate and one to explain.
 * Without a plateau the peak is taken to be a point and without a next it is
 * taken to be alone, so a statistics object built by hand - the reference
 * move, a consensus check - is answered rather than silently refused on a
 * NaN. The size of the square no longer enters: the two floors that decide
 * are ratios of the surface to its own peak, and the tables on P_MAX and
 * N_MAX show them holding from 128 to 512 without scaling.
 */
export function isMeasured({ live, plateau = 0, next = 0 }) {
  return live >= L_MIN && plateau <= P_MAX && next <= N_MAX;
}

/** The identity, for a frame that needs no moving or could not be measured. */
export const NO_MOVE = Object.freeze({ dx: 0, dy: 0, angle: 0, scale: 1 });

/* ------------------------------------------------------------- preparation */

/**
 * A Hann window over the square, with the mean taken out first.
 *
 * Both halves matter and both are about the edges. A Fourier transform treats
 * the square as one tile of an infinite repeating pattern, so the right-hand
 * edge sits against the left-hand one; unless the picture happens to match
 * itself there, that seam is a hard vertical line, and a hard line is a huge
 * feature that both frames share regardless of how they moved. The window fades
 * the edges to nothing so there is no seam, and subtracting the mean first
 * stops the fade itself becoming the brightest structure in the frame.
 */
export function window2d(values, size) {
  let total = 0;
  for (let i = 0; i < values.length; i += 1) total += values[i];
  const mean = total / values.length;

  const taper = new Float64Array(size);
  for (let i = 0; i < size; i += 1) {
    taper[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1));
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      values[y * size + x] = (values[y * size + x] - mean) * taper[y] * taper[x];
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
 * Eight is the refinement's margin. A residual is only applied when it is
 * within eight output pixels of the coarse answer, so a peak still standing
 * eight pixels out cannot place the frame within the margin whatever its
 * argmax says; and at the coarse square eight alignment pixels is already
 * tens of output pixels on any frame the survey shrank. The first version
 * scaled the radius with the side - a thirty-second of it, sixteen at 512 -
 * reasoning from the multiply-up, which the refinement window does not have:
 * at sixteen the wall at output resolution the refinement exists to refuse
 * passed nine seeds in ten, and at four the low-texture pair at 128 was
 * refused with its peak in the right place. The comment on P_MAX has the
 * readings at both.
 *
 * Eight is also the pitch of a JPEG's block grid, and that coincidence is
 * doing work nobody chose. Two frames of one smooth scene compressed at
 * quality 75 or 50 lock onto the lattice, and the shoulder read at eight
 * lands on its first alias: the plateau spikes there - 0.71-0.96 at r = 8
 * against 0.50-0.69 at 6, 0.56-0.81 at 9 and 0.47-0.74 at 10 - and refuses
 * the lock on every seed at both qualities, where next does not. Only at
 * quality 20, where the alias is buried in the blocking, does the lock get
 * through. So a change to this radius, or to the margin it is drawn from,
 * silently gives that lock back; the lattice test in
 * tests/js/stack-images-align.test.js pins both sides so it cannot go
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
 * featureless surface happened to be, and the caller should not apply it.
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
    measured: isMeasured(shift),
    clamped,
    live: shift.live,
    coherence: shift.coherence,
    plateau: shift.plateau,
    next: shift.next,
  };
}
