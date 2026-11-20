import { ARCMIN_PER_RADIAN, ARCSEC_PER_RADIAN, NEAR_POINT_MM, clamp } from './optics.js';

// The things there are to look at, in their own units, and how big each is to an eye.
//
// Every subject is measured the way it comes: the sky in arcseconds, a bird in metres
// at a stated range, a specimen in millimetres held at the reading distance. One
// number turns each into arcminutes for the bare eye, and a magnification multiplies
// that. The pictures are drawn from these figures and from nothing else, which is
// what lets the page say that a size on screen is a true one.

const rad = degrees => degrees * Math.PI / 180;

// Figures from NASA's planetary fact sheets: radii in kilometres, distances in
// kilometres at a mean opposition, the Moon's at its mean distance.
export const MOON = { radius: 1737.4, distance: 384400, albedo: 0.12, sunDistance: 1 };
export const JUPITER = { equatorial: 71492, polar: 66854, distance: 628.81e6, albedo: 0.538, sunDistance: 5.2038 };
export const SATURN = { equatorial: 60268, polar: 54364, distance: 1277.13e6, albedo: 0.499, sunDistance: 9.5826 };

export const arcsecPerKm = body => ARCSEC_PER_RADIAN / body.distance;

// The seas of the near side: latitude north, longitude east and width in kilometres,
// from the IAU's list. A fourth figure is how tall a sea is for its width, for the two
// that are far from round: the Sea of Cold is a long strip, and the Ocean of Storms,
// whose listed size is its length, runs north to south.
export const MARIA = [
  [34.72, -14.91, 1146], [27.29, 18.36, 674], [8.35, 30.83, 876], [16.18, 59.1, 556],
  [-7.83, 53.67, 840], [-15.19, 34.6, 339], [-20.59, -17.29, 715], [-24.48, -38.57, 420],
  [57.59, -0.01, 1446, 0.17], [13.2, 4.09, 242], [-10.53, -22.31, 350], [7.79, -30.64, 512],
  [20.67, -56.68, 1150, 2.2]
];

// About twenty of the largest and brightest craters, where they are: latitude,
// longitude, width in kilometres, and what marks each out. Everything smaller is
// scattered by rule in the drawing, because no list goes down to half a kilometre.
export const CRATERS = [
  [-43.3, -11.4, 85, 'ray'], [9.6, -20.1, 93, 'ray'], [8.1, -38, 31, 'ray'], [23.7, -47.4, 40, 'ray'],
  [16.1, 46.8, 27, 'ray'], [51.6, -9.4, 101, 'dark'], [-5.5, -68.3, 173, 'dark'], [-58.6, -14.1, 231, 'plain'],
  [-9.3, -1.9, 154, 'plain'], [-13.4, -2.8, 110, 'plain'], [-18.3, -1.9, 97, 'plain'], [-11.4, 26.4, 99, 'plain'],
  [-8.9, 61.1, 132, 'plain'], [29.7, -4, 81, 'plain'], [14.5, -11.3, 59, 'plain'], [31.8, 29.9, 95, 'plain'],
  [-25.1, 60.4, 177, 'plain'], [-50.5, -6.3, 194, 'plain'], [-44.3, -55.3, 212, 'plain'], [-17.6, -40.1, 111, 'plain'],
  [50.2, 17.4, 87, 'plain']
];

// A place on the Moon as the eye sees it: across and down in Moon radii, north up and
// east to the right, with how squarely it faces us. That last figure is what squashes
// a round sea into an ellipse near the edge.
export function moonSpot(latitude, longitude) {
  const across = Math.cos(rad(latitude)) * Math.sin(rad(longitude));
  const down = -Math.sin(rad(latitude));
  return { across, down, facing: Math.cos(rad(latitude)) * Math.cos(rad(longitude)) };
}

// Jupiter's four large moons: orbit and radius in kilometres, and where along its
// orbit each is drawn. They move from hour to hour, so any picture is one evening's.
export const GALILEANS = [
  { orbit: 421800, radius: 1821.5, along: 0.82 },
  { orbit: 671100, radius: 1560.8, along: -0.7 },
  { orbit: 1070400, radius: 2631.2, along: 0.93 },
  { orbit: 1882700, radius: 2410.3, along: -0.86 }
];

// Saturn's rings, inner and outer edge in kilometres from its centre, and how
// strongly each shows. The gap between the second and the third is Cassini's division.
export const RINGS = [
  { inner: 74658, outer: 91975, strength: 0.22 },
  { inner: 91975, outer: 117507, strength: 1 },
  { inner: 122340, outer: 136780, strength: 0.78 }
];
export const ENCKE = { middle: 133410, width: 325 };
export const RING_TILT = 20;
export const TITAN = { orbit: 1221870, radius: 2574.7, magnitude: 8.4 };

// The eleven brightest Pleiades: right ascension as hours, minutes, seconds,
// declination as degrees, arcminutes, arcseconds, and magnitude.
const PLEIADES_CATALOGUE = [
  [3, 47, 29.06, 24, 6, 18.9, 2.85], [3, 49, 9.73, 24, 3, 12.7, 3.62], [3, 44, 52.52, 24, 6, 48.4, 3.72],
  [3, 45, 49.59, 24, 22, 4.3, 3.87], [3, 46, 19.56, 23, 56, 54.5, 4.14], [3, 45, 12.48, 24, 28, 2.6, 4.3],
  [3, 49, 11.2, 24, 8, 12.6, 5.05], [3, 44, 48.2, 24, 17, 22.5, 5.45], [3, 45, 9.73, 24, 50, 21.7, 5.66],
  [3, 45, 54.46, 24, 33, 16.6, 5.76], [3, 46, 2.89, 24, 31, 40.8, 6.43]
];

// Each star as arcseconds from Alcyone, the brightest, which is where anybody points
// a telescope at them. East is to the left and north is up, as the sky is seen with
// nothing turning it round. The sky is laid flat the way a photograph lays it, on the
// plane touching it at that star, so the distance between two stars on the picture is
// their distance in the sky.
export const PLEIADES = (() => {
  const stars = PLEIADES_CATALOGUE.map(([h, m, s, d, dm, ds, magnitude]) => ({
    ascension: rad((h + m / 60 + s / 3600) * 15),
    declination: rad(d + dm / 60 + ds / 3600),
    magnitude
  }));
  const { ascension, declination } = stars[0];
  return stars.map(star => {
    const turn = star.ascension - ascension;
    const depth = Math.sin(declination) * Math.sin(star.declination) + Math.cos(declination) * Math.cos(star.declination) * Math.cos(turn);
    return {
      across: -Math.cos(star.declination) * Math.sin(turn) / depth * ARCSEC_PER_RADIAN,
      down: -(Math.cos(declination) * Math.sin(star.declination) - Math.sin(declination) * Math.cos(star.declination) * Math.cos(turn)) / depth * ARCSEC_PER_RADIAN,
      magnitude: star.magnitude
    };
  });
})();

// How much light each lit surface has to spare. A view only looks dull once it falls
// below a couple of candelas per square metre, and the full Moon is about 2500. The
// planets follow from sunlight thinning with the square of distance and from how much
// each reflects. Daylight and dusk are round figures for a sunlit and a twilit scene.
const DULL_NITS = 2;
const FULL_MOON_NITS = 2500;
const sunlit = body => FULL_MOON_NITS * (body.albedo / body.sunDistance ** 2) / (MOON.albedo / MOON.sunDistance ** 2);

const moonArcsec = 2 * MOON.radius * arcsecPerKm(MOON);
const span = stars => Math.max(...stars.map(star => star.across)) - Math.min(...stars.map(star => star.across));

// kind: which drawing module, and so which unit. piece: the width, in that unit, of
// the thing a sentence can name. distance in metres, where "as if from" means
// something. nits: how bright it is to the bare eye; none for stars, which are points,
// and none for anything lit by a lamp or held in ordinary light. pupil: the eye's own
// in the light the subject is seen by, where that is not the dark. tall: the piece is
// a height and not a width, which is true of a line of type in any script, where the
// width of a letter is not. finest: the smallest thing drawn, which a test holds below
// what the best instrument resolves.
export const SUBJECTS = {
  moon: { kind: 'sky', piece: moonArcsec, distance: MOON.distance * 1000, nits: FULL_MOON_NITS, finest: 0.27 },
  jupiter: { kind: 'sky', piece: 2 * JUPITER.equatorial * arcsecPerKm(JUPITER), distance: JUPITER.distance * 1000, nits: sunlit(JUPITER), finest: 0.25 },
  saturn: { kind: 'sky', piece: 2 * RINGS[2].outer * arcsecPerKm(SATURN), distance: SATURN.distance * 1000, nits: sunlit(SATURN), finest: ENCKE.width * arcsecPerKm(SATURN) },
  pleiades: { kind: 'sky', piece: span(PLEIADES), points: true, finest: 0 },
  'bird-day': { kind: 'land', range: 20, piece: 0.14, distance: 20, nits: 5000, pupil: 2.5, finest: 0.0001 },
  'bird-dusk': { kind: 'land', range: 20, piece: 0.14, distance: 20, nits: 3, pupil: 5, dusk: true, finest: 0.0001 },
  onion: { kind: 'slide', piece: 0.3, finest: 0.00025 },
  blood: { kind: 'slide', piece: 0.0075, finest: 0.00025 },
  hair: { kind: 'slide', piece: 0.07, finest: 0.00025 },
  salt: { kind: 'slide', piece: 0.3, finest: 0.00025 },
  bacteria: { kind: 'slide', piece: 0.002, finest: 0.00025 },
  print: { kind: 'near', piece: 2.82, tall: true, finest: 0.003 },
  ruler: { kind: 'near', piece: 1, finest: 0.003 }
};

// What each instrument is pointed at, first choice first.
export const LOOKS = {
  telescope: ['moon', 'jupiter', 'saturn', 'pleiades'],
  binoculars: ['bird-day', 'bird-dusk', 'moon', 'pleiades'],
  microscope: ['onion', 'blood', 'hair', 'salt', 'bacteria'],
  magnifier: ['print', 'ruler', 'salt', 'hair']
};

// Arcminutes to the bare eye for one of the subject's own units.
export function arcminPerUnit(subject) {
  if (subject.kind === 'sky') return 1 / 60;
  if (subject.kind === 'land') return ARCMIN_PER_RADIAN / subject.range;
  return ARCMIN_PER_RADIAN / NEAR_POINT_MM;
}

// What an instrument makes of a subject: how wide it looks, how much of the circle it
// fills, and for something far away, the two distances it would have to be seen from
// with the eye alone to look that big and to show that much.
export function seen(subject, numbers) {
  const apparentArcmin = subject.piece * arcminPerUnit(subject) * numbers.magnification;
  const report = {
    apparentArcmin,
    share: apparentArcmin / (numbers.shownField * 60),
    // A near thing is said to look as wide as something M times its size held at the
    // reading distance, which is what "M times" was defined to mean for it.
    lookalike: subject.piece * numbers.magnification,
    detailBound: numbers.detailPower < numbers.magnification * (1 - 1e-9)
  };
  if (subject.distance) {
    report.asIfFrom = subject.distance / numbers.magnification;
    report.detailFrom = subject.distance / numbers.detailPower;
  }
  return report;
}

// How bright the picture is drawn, from none to all of what the screen can show. The
// light a subject has to spare is spent first, so the Moon at a tenth of the bare eye's
// brightness still looks full, and what is left is put through the screen's own curve.
export function shownBrightness(subject, brightness) {
  if (!subject.nits) return 1;
  return clamp(subject.nits / DULL_NITS * brightness) ** (1 / 2.2);
}

// The faintest star that shows: about magnitude 6 to the eye alone under a dark sky,
// and five magnitudes more for every hundredfold gain in light.
export const NAKED_EYE_MAGNITUDE = 6;
export function faintestStar(lightGrasp = 1) {
  return NAKED_EYE_MAGNITUDE + 2.5 * Math.log10(Math.max(lightGrasp, 1e-9));
}
