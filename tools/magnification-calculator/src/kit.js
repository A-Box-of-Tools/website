// What the four drawing modules have in common. Nothing here decides what anything is.

export const TAU = Math.PI * 2;
export const lerp = (a, b, t) => a + (b - a) * t;
export const rgba = (tone, alpha = 1) => `rgba(${tone[0]},${tone[1]},${tone[2]},${alpha})`;

// Scattered, but the same scatter every time: the crater that was there at 70 times
// is still there at 140, which is what lets a picture read as the same thing closer.
export function hash(i, j = 0, salt = 0) {
  let h = Math.imul(i | 0, 0x27d4eb2d) ^ Math.imul(j | 0, 0x165667b1) ^ Math.imul(salt | 0, 0x9e3779b9);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

export function disc(ctx, x, y, radius) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
}

// A point of light: bright in the middle and fading out, never smaller than a screen
// can show. Stars and far-off moons are this at any magnification.
export function glint(ctx, x, y, radius, tone, alpha = 1) {
  const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
  glow.addColorStop(0, rgba(tone, alpha));
  glow.addColorStop(0.45, rgba(tone, alpha * 0.55));
  glow.addColorStop(1, rgba(tone, 0));
  ctx.fillStyle = glow;
  disc(ctx, x, y, radius);
  ctx.fill();
}

// Every cell of a grid that can be seen, and no others: a field of craters or cells
// goes on far past the edge of the picture, and only the part in view is worth the
// arithmetic. The frame says where the picture's edges are in the grid's own units.
// Returns false, having visited nothing, when the cells are too many to be worth
// drawing one by one, which is the caller's cue to draw a tint instead.
export function eachCell(frame, pitch, most, visit) {
  const first = Math.floor(frame.left / pitch);
  const last = Math.ceil(frame.right / pitch);
  const top = Math.floor(frame.top / pitch);
  const bottom = Math.ceil(frame.bottom / pitch);
  if ((last - first) * (bottom - top) > most) return false;
  for (let j = top; j < bottom; j++) {
    for (let i = first; i < last; i++) visit(i, j);
  }
  return true;
}

// The part of a drawing's own plane that the picture shows, cut down to a patch of it.
export function frameOf(g, patch) {
  const left = Math.max(patch.left, (0 - g.cx) / g.k);
  const right = Math.min(patch.right, (g.w - g.cx) / g.k);
  const top = Math.max(patch.top, (0 - g.cy) / g.k);
  const bottom = Math.min(patch.bottom, (g.h - g.cy) / g.k);
  return { left, right, top, bottom, empty: left >= right || top >= bottom };
}
