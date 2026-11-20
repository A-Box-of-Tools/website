// What a magnification number buys, and where it stops buying anything.
//
// Nothing here knows about the page: numbers in, numbers and short keys out, so every
// rule can be held to a worked example in tests/js/magnification-calculator.test.js.
//
// One idea carries the four instruments. A lens of any kind blurs a point into a disc,
// and what the eye is shown is that disc magnified. Seen through an exit pupil one
// millimetre wide, the disc is about 2.3 arcminutes across, in a telescope and in a
// microscope alike, and it grows as the exit pupil shrinks. A keen eye separates one
// arcminute. So an exit pupil wider than 2.3 mm leaves detail the eye cannot yet pick
// out, one of 1 mm shows all of it comfortably, and one under half a millimetre is
// only enlarging the blur. Those three pupils are the published rules of thumb, which
// is the check on the idea: a telescope's "aperture in millimetres" and "twice that",
// and a microscope's "500 to 1000 times the numerical aperture".

export const ARCMIN_PER_RADIAN = 10800 / Math.PI;
export const ARCSEC_PER_RADIAN = 648000 / Math.PI;

// The distance a magnifier's and a microscope's power is counted from: something held
// 250 mm from the eye is "one times".
export const NEAR_POINT_MM = 250;

// Green light, where the eye is most sensitive, and the wavelength the microscope
// makers' own tables assume.
export const WAVELENGTH_MM = 0.00055;

// Rayleigh's criterion, 1.22 wavelengths over the aperture, three ways: as the blur an
// eye sees through a 1 mm exit pupil, as arcseconds for an aperture of 1 mm, and as
// micrometres for a numerical aperture of 1.
export const BLUR_ARCMIN_AT_1MM = 1.22 * WAVELENGTH_MM * ARCMIN_PER_RADIAN;
export const RAYLEIGH_ARCSEC_MM = 1.22 * WAVELENGTH_MM * ARCSEC_PER_RADIAN;
export const RAYLEIGH_UM_NA = 0.61 * WAVELENGTH_MM * 1000;

export const KEEN_EYE_ARCMIN = 1;
export const FULL_PUPIL_MM = 1;
export const EMPTY_PUPIL_MM = 0.5;

// Above this the air, not the telescope, sets the limit on most nights.
export const SEEING_CEILING = 300;

// The widest circle the pictures are drawn for, which is the widest eyepiece in
// common use. Anything wider is refused where it is typed rather than drawn wrong.
export const WIDEST_SHOWN_FIELD = 82;

// What a binocular's eyepieces show when the field is not printed on it: sixty
// apparent degrees, which is 7.5 degrees of scenery at eight times.
export const TYPICAL_BINOCULAR_FIELD = 60;

// A microscope eyepiece's field number when it is not engraved: 180 mm over its
// magnification, which is 18 mm at ten times and keeps the circle looked into the
// same width. A weak eyepiece cannot have the 36 mm that gives it, because the tube it
// slides into is 23 mm across, so 20 mm is the most that is assumed.
export const TYPICAL_FIELD_NUMBER_AT_1X = 180;
export const WIDEST_TYPICAL_FIELD_NUMBER = 20;

// A magnifier's lens is usually a little narrower than its focal length, until the
// focal length is longer than a lens anybody would hold: a reading or lamp magnifier
// is about 100 mm across however weak it is.
export const TYPICAL_LENS_PER_FOCAL = 0.85;
export const WIDEST_TYPICAL_LENS = 100;

// The longest focal length that still magnifies with the eye relaxed: 250 mm is one
// times exactly, and this is a tenth more than that.
export const WEAKEST_RELAXED_FOCAL = 250 / 1.1;

const SLACK = 1e-9;
const rad = degrees => degrees * Math.PI / 180;
const deg = radians => radians * 180 / Math.PI;
export const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));

// Which side of the two limits an exit pupil stands on. The boundaries belong to the
// better side: exactly 1 mm is still sharp, exactly half a millimetre is still full.
export function regimeFor(exitPupil, eyePupil = Infinity) {
  if (exitPupil > eyePupil * (1 + SLACK)) return 'wasted';
  if (exitPupil > BLUR_ARCMIN_AT_1MM / KEEN_EYE_ARCMIN * (1 + SLACK)) return 'spare';
  if (exitPupil >= FULL_PUPIL_MM * (1 - SLACK)) return 'sharp';
  if (exitPupil >= EMPTY_PUPIL_MM * (1 - SLACK)) return 'full';
  return 'empty';
}

// The detail an eye is given, as the magnification that would already show all of it.
// Past that, more magnification makes the same detail larger and nothing else.
function detailPower(magnification, exitPupil) {
  return Math.min(magnification, magnification * exitPupil * KEEN_EYE_ARCMIN / BLUR_ARCMIN_AT_1MM);
}

export function telescope({ aperture, focal, eyepiece, barlow = 1, apparentField = 52, eyePupil = 7, barrel = 27 }) {
  const reach = focal * barlow;
  const magnification = reach / eyepiece;
  const exitPupil = aperture / magnification;
  // An eyepiece cannot show a wider circle than its barrel lets through, which is why
  // a 40 mm eyepiece in a 1.25 inch barrel never has a 52 degree field.
  const wanted = eyepiece * rad(apparentField);
  const stop = Math.min(wanted, barrel);
  const shownField = Math.min(deg(stop / eyepiece), WIDEST_SHOWN_FIELD);
  const limitArcsec = RAYLEIGH_ARCSEC_MM / aperture;
  // Light the eye cannot take in is light the telescope did not collect: with a beam
  // wider than the pupil, the outer part of the mirror or lens is not being used.
  const working = Math.min(aperture, magnification * eyePupil);
  const regime = regimeFor(exitPupil, eyePupil);
  return {
    magnification,
    focalRatio: focal / aperture,
    exitPupil,
    shownField,
    trueField: shownField / magnification,
    stopped: wanted > barrel * (1 + SLACK),
    limitArcsec,
    blurArcmin: BLUR_ARCMIN_AT_1MM / exitPupil,
    detailArcsec: Math.max(limitArcsec, 60 * KEEN_EYE_ARCMIN / magnification),
    detailPower: detailPower(magnification, exitPupil),
    lowest: aperture / eyePupil,
    sharpFrom: aperture / BLUR_ARCMIN_AT_1MM,
    fullFrom: aperture / FULL_PUPIL_MM,
    highest: aperture / EMPTY_PUPIL_MM,
    lightGrasp: (working / eyePupil) ** 2,
    brightness: Math.min(1, (exitPupil / eyePupil) ** 2),
    regime,
    seeing: magnification > SEEING_CEILING * (1 + SLACK) && regime !== 'empty'
  };
}

export const eyepieceFor = (magnification, focal, barlow = 1) => focal * barlow / magnification;

// A field of view as it is printed on a pair of binoculars, three ways. The widths are
// exact chords rather than 17.5 m for every degree, so 393 ft and 131 m are both 7.5.
export const fieldFromMetres = metres => deg(2 * Math.atan(metres / 2000));
export const fieldFromFeet = feet => deg(2 * Math.atan(feet / 6000));
export const metresAt1000 = field => 2000 * Math.tan(rad(field / 2));
export const feetAt1000Yards = field => 6000 * Math.tan(rad(field / 2));

export function binoculars({ magnification, objective, field = null, eyePupil = 5 }) {
  const exitPupil = objective / magnification;
  const trueField = field ?? TYPICAL_BINOCULAR_FIELD / magnification;
  const brightness = Math.min(1, (exitPupil / eyePupil) ** 2);
  const limitArcsec = RAYLEIGH_ARCSEC_MM / objective;
  const working = Math.min(objective, magnification * eyePupil);
  return {
    magnification,
    exitPupil,
    trueField,
    // Magnification times the field: the simple convention, and the one the pictures
    // need, because it is what makes a thing's share of the circle its share of the
    // view. The standard that takes the tangent of each half-angle gives about five
    // degrees less for the same pair.
    shownField: Math.min(trueField * magnification, WIDEST_SHOWN_FIELD),
    metres: metresAt1000(trueField),
    feet: feetAt1000Yards(trueField),
    twilight: Math.sqrt(magnification * objective),
    limitArcsec,
    blurArcmin: BLUR_ARCMIN_AT_1MM / exitPupil,
    detailArcsec: Math.max(limitArcsec, 60 * KEEN_EYE_ARCMIN / magnification),
    detailPower: detailPower(magnification, exitPupil),
    lightGrasp: (working / eyePupil) ** 2,
    brightness,
    regime: regimeFor(exitPupil),
    light: brightness >= 1 - SLACK ? 'full' : brightness >= 0.5 ? 'less' : 'dim',
    hand: magnification <= 8 ? 'steady' : magnification <= 12 ? 'care' : 'tripod'
  };
}

export function microscope({ objective, na, eyepiece, fieldNumber = null }) {
  const magnification = objective * eyepiece;
  const number = fieldNumber ?? Math.min(TYPICAL_FIELD_NUMBER_AT_1X / eyepiece, WIDEST_TYPICAL_FIELD_NUMBER);
  // The beam leaving the eyepiece: twice the reading distance times the numerical
  // aperture, over the magnification. It is what makes 500 x NA the same statement
  // as a telescope's one millimetre.
  const exitPupil = 2 * NEAR_POINT_MM * na / magnification;
  const limitUm = RAYLEIGH_UM_NA / na;
  return {
    magnification,
    fieldNumber: number,
    fieldMm: number / objective,
    shownField: Math.min(deg(number * eyepiece / NEAR_POINT_MM), WIDEST_SHOWN_FIELD),
    exitPupil,
    limitUm,
    blurArcmin: BLUR_ARCMIN_AT_1MM / exitPupil,
    detailUm: Math.max(limitUm, 1000 * NEAR_POINT_MM * KEEN_EYE_ARCMIN / ARCMIN_PER_RADIAN / magnification),
    detailPower: detailPower(magnification, exitPupil),
    sharpFrom: 2 * NEAR_POINT_MM * na / BLUR_ARCMIN_AT_1MM,
    fullFrom: 2 * NEAR_POINT_MM * na / FULL_PUPIL_MM,
    highest: 2 * NEAR_POINT_MM * na / EMPTY_PUPIL_MM,
    brightness: 1,
    regime: regimeFor(exitPupil)
  };
}

// One lens, described the three ways its maker might: a power, a focal length or
// dioptres. Two conventions turn a focal length into a power, and boxes use both: the
// eye relaxed, 250 / f, and the eye focused as near as it can, one more than that.
export function magnifierFocal(value, unit, close = false) {
  if (unit === 'focal') return value;
  if (unit === 'dioptre') return 1000 / value;
  return NEAR_POINT_MM / (close ? value - 1 : value);
}

export function magnifier({ value, unit = 'power', close = false, lens = null, eyePupil = 3 }) {
  const focal = magnifierFocal(value, unit, close);
  const magnification = NEAR_POINT_MM / focal + (close ? 1 : 0);
  const width = lens ?? Math.min(focal * TYPICAL_LENS_PER_FOCAL, WIDEST_TYPICAL_LENS);
  // The eye's own pupil is the narrowest opening the light passes, so a simple lens
  // is never the limit: the eye is, magnified.
  const detailUm = 1000 * NEAR_POINT_MM * KEEN_EYE_ARCMIN / ARCMIN_PER_RADIAN / magnification;
  return {
    magnification,
    focal,
    dioptres: 1000 / focal,
    lens: width,
    // The lens is a window: seen from one focal length behind it, it is so many
    // degrees wide, and what shows in it is that angle shrunk by the magnification.
    // Counted with the eye relaxed that is exactly the lens's own width, and counted
    // with one added it is a little less.
    fieldMm: width * NEAR_POINT_MM / focal / magnification,
    shownField: Math.min(deg(width / focal), WIDEST_SHOWN_FIELD),
    exitPupil: eyePupil,
    blurArcmin: BLUR_ARCMIN_AT_1MM / eyePupil,
    detailUm,
    detailPower: magnification,
    brightness: 1,
    regime: 'spare',
    band: magnification < 3 ? 'reading' : magnification < 8 ? 'inspect' : magnification <= 20 ? 'loupe' : 'beyond'
  };
}

// The value a magnifier's box would print for a magnification, in the notation its
// field is currently in. The dial needs it, since it moves in magnification.
export function magnifierValue(magnification, unit, close = false) {
  const focal = NEAR_POINT_MM / (close ? magnification - 1 : magnification);
  if (unit === 'focal') return focal;
  if (unit === 'dioptre') return 1000 / focal;
  return magnification;
}

// The dial runs in magnification on a logarithmic track, because 20 to 40 is the same
// step as 200 to 400. A telescope's track is laid out in apertures, so its zones fall
// in the same places for every telescope and only the numbers on them change.
export function dialSpan(world, { aperture = 70, objective = 10 } = {}) {
  if (world === 'telescope') return [aperture / 8, aperture * 12];
  if (world === 'binoculars') return [4, 40];
  if (world === 'microscope') return [objective * 5, objective * 30];
  return [1.5, 40];
}

export const dialPosition = (magnification, [low, high]) => clamp(Math.log(magnification / low) / Math.log(high / low));
export const dialPower = (position, [low, high]) => low * (high / low) ** clamp(position);

// Where the dial's zones change, as magnifications, lowest first.
export function zoneEdges(world, numbers) {
  if (world === 'telescope') return [numbers.lowest, numbers.sharpFrom, numbers.fullFrom, numbers.highest];
  if (world === 'microscope') return [numbers.sharpFrom, numbers.fullFrom, numbers.highest];
  if (world === 'binoculars') return [8, 12];
  return [3, 8, 20];
}

// A number worth writing into a box: two or three figures, so a dial dragged to 9.7 mm
// does not leave 9.722222 behind it.
export function tidy(value, digits = 3) {
  return Number(value.toPrecision(digits));
}

// What each box will accept.
export const LIMITS = {
  telescope: { aperture: [20, 2000], focal: [100, 30000], eyepiece: [2, 60] },
  binoculars: { magnification: [2, 100], objective: [10, 250], field: [0.3, 30] },
  microscope: { objective: [1, 250], na: [0.02, 1.6], eyepiece: [2, 40], fieldNumber: [4, 30] },
  magnifier: { power: [1.1, 60], dioptre: [2, 240], focal: [4, 500], lens: [4, 250] }
};

// Boxes that may be left empty, each of which then takes a typical value.
export const OPTIONAL = { field: true, fieldNumber: true, lens: true };

// Three of the boxes are bounded by another: a field of view, a field number and a
// lens width each imply a circle looked into, and no eyepiece shows one wider than
// the widest drawn here. Without this a typing slip becomes a 240 degree view.
export function limitsFor(world, values) {
  const limits = { ...LIMITS[world] };
  const widest = rad(WIDEST_SHOWN_FIELD);
  const capped = (name, ceiling) => { limits[name] = [limits[name][0], Math.max(limits[name][0], Math.min(limits[name][1], ceiling))]; };
  if (world === 'binoculars' && values.magnification > 0) capped('field', WIDEST_SHOWN_FIELD / values.magnification);
  if (world === 'microscope' && values.eyepiece > 0) capped('fieldNumber', widest * NEAR_POINT_MM / values.eyepiece);
  if (world === 'magnifier' && values.focalLength > 0) capped('lens', widest * values.focalLength);
  // Counted with the eye relaxed, a lens weaker than about four diopters does not
  // magnify at all, and the page would be describing a lens that shrinks.
  if (world === 'magnifier' && !values.close) {
    limits.dioptre = [1000 / WEAKEST_RELAXED_FOCAL, limits.dioptre[1]];
    limits.focal = [limits.focal[0], WEAKEST_RELAXED_FOCAL];
  }
  return limits;
}

// The first box that cannot be used, or null. A missing optional box is not a fault.
export function firstFault(world, values) {
  for (const [name, [low, high]] of Object.entries(limitsFor(world, values))) {
    if (!(name in values)) continue;
    const value = values[name];
    if (value === null || value === undefined || value === '') {
      if (OPTIONAL[name]) continue;
      return { name, low, high, missing: true };
    }
    if (!Number.isFinite(value) || value < low || value > high) return { name, low, high, missing: false };
  }
  return null;
}
