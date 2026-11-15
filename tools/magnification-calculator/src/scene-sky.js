import { CRATERS, ENCKE, GALILEANS, JUPITER, MARIA, MOON, PLEIADES, RINGS, RING_TILT, SATURN, TITAN, arcsecPerKm, moonSpot } from './subjects.js';
import { TAU, disc, eachCell, glint, hash, rgba } from './kit.js';

// The night sky, in arcseconds. Each drawing is handed a scale and the smallest
// thing worth drawing, and draws what there is at that scale: a point of light when
// the whole Moon is under a pixel, and craters half a kilometre wide when it fills
// the picture many times over. Nothing here knows which instrument is asking.

const NIGHT = '#090c16';
const rad = degrees => degrees * Math.PI / 180;

// Each sea as it lies on the disc: where, how wide in Moon radii, how tall for its
// width, how squarely it faces us and which way the disc's edge is from it.
const SEAS = MARIA.map(([latitude, longitude, width, tall = 1]) => {
  const spot = moonSpot(latitude, longitude);
  const turn = Math.atan2(spot.down, spot.across);
  return { ...spot, half: width / 2 / MOON.radius, tall, turn, cos: Math.cos(turn), sin: Math.sin(turn) };
});

// The Moon is a ball, so a round thing near its edge is seen squashed along the line
// to the centre. This turns the drawing plane so that a circle comes out that way.
function onMoon(ctx, x, y, spot) {
  ctx.translate(x, y);
  ctx.rotate(spot.turn);
  ctx.scale(Math.max(0.06, spot.facing), 1);
  ctx.rotate(-spot.turn);
}

function inSea(across, down) {
  for (const sea of SEAS) {
    const dx = across - sea.across;
    const dy = down - sea.down;
    // Nowhere near it, which is most seas for most craters, and cheap to say.
    if (Math.abs(dx) > sea.half * 2.4 || Math.abs(dy) > sea.half * 2.4) continue;
    const along = (dx * sea.cos + dy * sea.sin) / sea.facing;
    const beside = -dx * sea.sin + dy * sea.cos;
    const east = along * sea.cos - beside * sea.sin;
    const south = along * sea.sin + beside * sea.cos;
    if ((east / sea.half) ** 2 + (south / (sea.half * sea.tall)) ** 2 < 0.8) return true;
  }
  return false;
}

// One crater, in a plane already moved and squashed to where it is. Lit from the
// upper left, as every map of the Moon is, so a rim reads as a rim.
function crater(ctx, reach, kind) {
  if (kind === 'ray' && reach > 1.2) {
    const halo = ctx.createRadialGradient(0, 0, reach * 0.6, 0, 0, reach * 5);
    halo.addColorStop(0, 'rgba(255,255,248,0.5)');
    halo.addColorStop(1, 'rgba(255,255,248,0)');
    ctx.fillStyle = halo;
    disc(ctx, 0, 0, reach * 5);
    ctx.fill();
    if (reach > 2.5) {
      ctx.strokeStyle = 'rgba(255,255,248,0.2)';
      ctx.lineWidth = Math.max(0.6, reach * 0.22);
      for (let i = 0; i < 9; i++) {
        const angle = i * 0.698 + 0.3;
        const far = reach * (6 + 5 * hash(i, 3, 11));
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * reach * 1.3, Math.sin(angle) * reach * 1.3);
        ctx.lineTo(Math.cos(angle) * far, Math.sin(angle) * far);
        ctx.stroke();
      }
    }
  }
  if (reach < 1.6) {
    ctx.fillStyle = kind === 'dark' ? 'rgba(52,54,62,0.7)' : 'rgba(70,70,76,0.42)';
    disc(ctx, 0, 0, reach);
    ctx.fill();
    return;
  }
  ctx.fillStyle = kind === 'dark' ? 'rgba(58,60,70,0.78)' : kind === 'ray' ? 'rgba(238,237,228,0.85)' : 'rgba(150,149,142,0.5)';
  disc(ctx, 0, 0, reach * 0.86);
  ctx.fill();
  ctx.lineWidth = Math.max(0.6, reach * 0.16);
  ctx.strokeStyle = 'rgba(250,250,242,0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, reach * 0.93, 0.2, 3.3);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(62,62,68,0.6)';
  ctx.beginPath();
  ctx.arc(0, 0, reach * 0.93, 3.3, TAU + 0.2);
  ctx.stroke();
  if (reach > 7) {
    ctx.fillStyle = 'rgba(244,243,236,0.8)';
    disc(ctx, 0, 0, reach * 0.11);
    ctx.fill();
  }
}

// The craters no list names, by rule. Each width has a grid of its own, a crater in
// most cells of the highlands and few of the seas', so halving the width quadruples
// the count, which is roughly how the Moon is.
const WIDTHS = [96, 48, 24, 12, 6, 3, 1.5, 0.75, 0.5];

function scattered(ctx, g, radius, perKm) {
  const finest = g.fine / arcsecPerKm(MOON);
  WIDTHS.forEach((width, level) => {
    const reach = width / 2 * perKm;
    if (reach < 0.7 || width < finest || reach > g.w) return;
    const pitch = width * 3.4 / MOON.radius;
    const frame = {
      left: Math.max(-1, -g.cx / radius),
      right: Math.min(1, (g.w - g.cx) / radius),
      top: Math.max(-1, -g.cy / radius),
      bottom: Math.min(1, (g.h - g.cy) / radius)
    };
    // The smallest are a dot each, and there are thousands of them, so they are
    // gathered and filled as one shape instead of each being placed and squashed.
    const dots = [];
    eachCell(frame, pitch, 6000, (i, j) => {
      const across = (i + 0.2 + 0.6 * hash(i, j, level)) * pitch;
      const down = (j + 0.2 + 0.6 * hash(i, j, level + 40)) * pitch;
      const out = across * across + down * down;
      if (out > 0.94) return;
      if (hash(i, j, level + 80) > (inSea(across, down) ? 0.1 : 0.62)) return;
      const wide = reach * (0.65 + 0.7 * hash(i, j, level + 120));
      if (wide < 1.6) {
        dots.push(g.cx + across * radius, g.cy + down * radius, wide);
        return;
      }
      ctx.save();
      onMoon(ctx, g.cx + across * radius, g.cy + down * radius, { facing: Math.sqrt(1 - out), turn: Math.atan2(down, across) });
      crater(ctx, wide, 'plain');
      ctx.restore();
    });
    if (!dots.length) return;
    ctx.fillStyle = 'rgba(70,70,76,0.42)';
    ctx.beginPath();
    for (let n = 0; n < dots.length; n += 3) {
      ctx.moveTo(dots[n] + dots[n + 2], dots[n + 1]);
      ctx.arc(dots[n], dots[n + 1], dots[n + 2], 0, TAU);
    }
    ctx.fill();
  });
}

function moon(ctx, g) {
  const perKm = arcsecPerKm(MOON) * g.k;
  const radius = MOON.radius * perKm;
  if (radius < 1.3) {
    glint(ctx, g.cx, g.cy, Math.max(1.4, radius * 2), [236, 236, 226]);
    return;
  }
  ctx.save();
  const face = ctx.createRadialGradient(g.cx, g.cy, radius * 0.1, g.cx, g.cy, radius);
  face.addColorStop(0, '#e6e5dd');
  face.addColorStop(0.75, '#d8d7ce');
  face.addColorStop(1, '#bdbcb3');
  ctx.fillStyle = face;
  disc(ctx, g.cx, g.cy, radius);
  ctx.fill();
  disc(ctx, g.cx, g.cy, radius);
  ctx.clip();
  SEAS.forEach((sea, which) => {
    const reach = sea.half * radius;
    ctx.save();
    onMoon(ctx, g.cx + sea.across * radius, g.cy + sea.down * radius, sea);
    ctx.scale(1, sea.tall);
    // A sea is a flooded basin with bays round its shore, not a disc: one patch in
    // the middle and a ring of smaller ones overlapping it.
    for (let lobe = 0; lobe < 8; lobe++) {
      const turn = lobe ? lobe * 0.9 + hash(which, lobe, 51) : 0;
      const out = lobe ? reach * (0.42 + 0.22 * hash(which, lobe, 52)) : 0;
      const wide = lobe ? reach * (0.34 + 0.2 * hash(which, lobe, 53)) : reach * 0.74;
      const x = Math.cos(turn) * out;
      const y = Math.sin(turn) * out;
      const tint = ctx.createRadialGradient(x, y, wide * 0.3, x, y, wide);
      tint.addColorStop(0, 'rgba(86,90,102,0.5)');
      tint.addColorStop(0.7, 'rgba(90,94,106,0.36)');
      tint.addColorStop(1, 'rgba(90,94,106,0)');
      ctx.fillStyle = tint;
      disc(ctx, x, y, wide);
      ctx.fill();
    }
    ctx.restore();
  });
  scattered(ctx, g, radius, perKm);
  for (const [latitude, longitude, width, kind] of CRATERS) {
    const reach = width / 2 * perKm;
    if (reach < 0.45) continue;
    const spot = moonSpot(latitude, longitude);
    ctx.save();
    onMoon(ctx, g.cx + spot.across * radius, g.cy + spot.down * radius, { facing: spot.facing, turn: Math.atan2(spot.down, spot.across) });
    crater(ctx, reach, kind);
    ctx.restore();
  }
  ctx.restore();
}

// Jupiter's dark belts and pale zones by latitude: from, to, tone and strength.
const BELTS = [
  [50, 90, [150, 140, 128], 0.5], [24, 31, [176, 138, 104], 0.5], [8, 18, [150, 98, 70], 0.8],
  [-20, -8, [158, 108, 78], 0.75], [-32, -27, [176, 140, 110], 0.45], [-90, -52, [148, 138, 128], 0.5]
];
const RED_SPOT = { wide: 7500, tall: 5500, latitude: -22, along: 0.3 };

// The ovals and knots that ride the belts, three sizes of them, the smallest a
// quarter of an arcsecond: what a large telescope shows on a steady night.
function storms(ctx, g, wide, tall, perKm) {
  const finest = g.fine / arcsecPerKm(JUPITER);
  [[2600, 10000], [900, 3400], [380, 1500]].forEach(([size, spacing], level) => {
    const reach = size * perKm;
    if (reach < 0.6 || size * 2 < finest) return;
    const frame = {
      left: Math.max(-JUPITER.equatorial, -g.cx / perKm),
      right: Math.min(JUPITER.equatorial, (g.w - g.cx) / perKm),
      top: Math.max(-JUPITER.polar, -g.cy / perKm),
      bottom: Math.min(JUPITER.polar, (g.h - g.cy) / perKm)
    };
    eachCell(frame, spacing, 4000, (i, j) => {
      if (hash(i, j, level + 7) > 0.45) return;
      const x = (i + 0.2 + 0.6 * hash(i, j, level + 17)) * spacing;
      const y = (j + 0.2 + 0.6 * hash(i, j, level + 27)) * spacing;
      if ((x / JUPITER.equatorial) ** 2 + (y / JUPITER.polar) ** 2 > 0.9) return;
      ctx.fillStyle = hash(i, j, level + 37) > 0.5 ? 'rgba(250,242,222,0.5)' : 'rgba(120,78,58,0.42)';
      ctx.beginPath();
      ctx.ellipse(g.cx + x * perKm, g.cy + y * perKm, reach * 1.7, reach, 0, 0, TAU);
      ctx.fill();
    });
  });
}

function jupiter(ctx, g) {
  const perKm = arcsecPerKm(JUPITER) * g.k;
  const wide = JUPITER.equatorial * perKm;
  const tall = JUPITER.polar * perKm;
  // The moons are as bright as stars the eye can see, and lost in the planet's glare
  // until something pulls them clear of it, which ordinary binoculars do.
  if (g.power >= 5) {
    for (const body of GALILEANS) {
      const x = g.cx + body.orbit * body.along * perKm;
      if (Math.abs(x - g.cx) < wide + 3) continue;
      glint(ctx, x, g.cy, Math.max(1.2, body.radius * perKm * 1.5, g.soft * g.k * 0.6), [240, 236, 224], 0.95);
    }
  }
  if (wide < 1.3) {
    glint(ctx, g.cx, g.cy, Math.max(1.8, wide * 2.2), [250, 240, 214]);
    return;
  }
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(g.cx, g.cy, wide, tall, 0, 0, TAU);
  ctx.clip();
  ctx.fillStyle = '#e9dcc0';
  ctx.fillRect(g.cx - wide, g.cy - tall, wide * 2, tall * 2);
  for (const [from, to, tone, strength] of BELTS) {
    const upper = g.cy - tall * Math.sin(rad(to));
    const lower = g.cy - tall * Math.sin(rad(from));
    ctx.fillStyle = rgba(tone, strength);
    ctx.fillRect(g.cx - wide, upper, wide * 2, lower - upper);
  }
  storms(ctx, g, wide, tall, perKm);
  if (RED_SPOT.wide * perKm > 0.5) {
    ctx.fillStyle = 'rgba(190,96,70,0.9)';
    ctx.beginPath();
    ctx.ellipse(g.cx + wide * RED_SPOT.along, g.cy - tall * Math.sin(rad(RED_SPOT.latitude)), RED_SPOT.wide * perKm, RED_SPOT.tall * perKm, 0, 0, TAU);
    ctx.fill();
  }
  ctx.translate(g.cx, g.cy);
  ctx.scale(1, tall / wide);
  const limb = ctx.createRadialGradient(0, 0, wide * 0.55, 0, 0, wide);
  limb.addColorStop(0, 'rgba(20,14,10,0)');
  limb.addColorStop(1, 'rgba(20,14,10,0.6)');
  ctx.fillStyle = limb;
  disc(ctx, 0, 0, wide);
  ctx.fill();
  ctx.restore();
}

// Half of the rings pass behind the globe and half in front. Each half is a set of
// flattened hoops, and the gap between the second and the third is not drawn: it is
// simply where no hoop is, which is what Cassini's division is.
function rings(ctx, g, perKm, flat, front) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, front ? g.cy : 0, g.w, front ? g.h - g.cy : g.cy);
  ctx.clip();
  for (const ring of RINGS) {
    ctx.fillStyle = rgba([226, 208, 168], ring.strength * 0.92);
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, ring.outer * perKm, ring.outer * perKm * flat, 0, 0, TAU);
    ctx.moveTo(g.cx + ring.inner * perKm, g.cy);
    ctx.ellipse(g.cx, g.cy, ring.inner * perKm, ring.inner * perKm * flat, 0, 0, TAU);
    ctx.fill('evenodd');
  }
  if (ENCKE.width * perKm > 0.08) {
    ctx.strokeStyle = NIGHT;
    ctx.lineWidth = ENCKE.width * perKm;
    ctx.beginPath();
    ctx.ellipse(g.cx, g.cy, ENCKE.middle * perKm, ENCKE.middle * perKm * flat, 0, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function saturn(ctx, g) {
  const perKm = arcsecPerKm(SATURN) * g.k;
  const wide = SATURN.equatorial * perKm;
  const tall = SATURN.polar * perKm;
  const flat = Math.sin(rad(RING_TILT));
  const titan = TITAN.orbit * 0.9 * perKm;
  if (g.power >= 20 && titan > RINGS[2].outer * perKm + 3) {
    glint(ctx, g.cx - titan, g.cy + titan * 0.12, Math.max(1.1, TITAN.radius * perKm * 1.5, g.soft * g.k * 0.6), [236, 214, 170], 0.8);
  }
  if (RINGS[2].outer * perKm < 1.6) {
    glint(ctx, g.cx, g.cy, Math.max(1.6, wide * 2.6), [244, 232, 196]);
    return;
  }
  rings(ctx, g, perKm, flat, false);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(g.cx, g.cy, wide, tall, 0, 0, TAU);
  ctx.clip();
  ctx.fillStyle = '#e4d3a4';
  ctx.fillRect(g.cx - wide, g.cy - tall, wide * 2, tall * 2);
  for (const [from, to, strength] of [[14, 24, 0.3], [-26, -15, 0.26], [55, 90, 0.34], [-90, -58, 0.3]]) {
    const upper = g.cy - tall * Math.sin(rad(to));
    const lower = g.cy - tall * Math.sin(rad(from));
    ctx.fillStyle = rgba([150, 124, 84], strength);
    ctx.fillRect(g.cx - wide, upper, wide * 2, lower - upper);
  }
  ctx.translate(g.cx, g.cy);
  ctx.scale(1, tall / wide);
  const limb = ctx.createRadialGradient(0, 0, wide * 0.5, 0, 0, wide);
  limb.addColorStop(0, 'rgba(22,16,8,0)');
  limb.addColorStop(1, 'rgba(22,16,8,0.62)');
  ctx.fillStyle = limb;
  disc(ctx, 0, 0, wide);
  ctx.fill();
  ctx.restore();
  rings(ctx, g, perKm, flat, true);
}

// A star is a point, so it is never drawn to scale: its dot is as wide as the
// instrument's blur and as bright as its margin over the faintest star that shows.
function pleiades(ctx, g) {
  const blur = Math.max(0.9, g.soft * g.k * 0.6);
  for (const star of PLEIADES) {
    const margin = g.faintest - star.magnitude;
    if (margin < 0) continue;
    const reach = blur * (1.2 + 0.42 * Math.min(margin, 9));
    glint(ctx, g.cx + star.across * g.k, g.cy + star.down * g.k, reach, [214, 228, 255], Math.min(1, 0.5 + 0.2 * margin));
  }
}

const DRAWINGS = { moon, jupiter, saturn, pleiades };

export function drawSky(ctx, g) {
  ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, g.w, g.h);
  DRAWINGS[g.id](ctx, g);
}
