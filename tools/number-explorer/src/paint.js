// What the scenes have in common. Nothing here decides what a number means.

export const clamp = (x, low = 0, high = 1) => Math.min(high, Math.max(low, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const mix = (a, b, t) => a.map((value, i) => lerp(value, b[i], t));
export const rgba = (c, alpha = 1) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${alpha})`;

export function smooth(low, high, x) {
  const t = clamp((x - low) / (high - low));
  return t * t * (3 - 2 * t);
}

// A colour read off a list of [position, colour] stops. Every backdrop that
// changes with scale goes through this, so a scene has no seams to fall into.
export function keyed(stops, x) {
  if (x <= stops[0][0]) return stops[0][1];
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (x - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
  }
  return stops[stops.length - 1][1];
}

// Scattered, but the same scatter every time: the thousandth star stays where it
// was when the count moves on to the two-thousandth, which is what makes a number
// read as growing rather than as a fresh picture of noise.
export function hash(i, salt = 0) {
  let h = Math.imul(i + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca77);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

// A low-discrepancy sequence spreads points evenly at every count, where plain
// random leaves clumps and holes that a small number makes obvious. On its own it
// also falls into rows the eye picks out at once, so each point is nudged off them.
export function scatter(i) {
  return [
    (1.5 + i * 0.7548776662466927 + (hash(i, 7) - 0.5) * 0.07) % 1,
    (1.5 + i * 0.5698402909980532 + (hash(i, 8) - 0.5) * 0.07) % 1
  ];
}

export function gauss(i, salt) {
  const u = Math.max(1e-6, hash(i, salt));
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * hash(i, salt + 101));
}

let family = 'system-ui, sans-serif';
export function useFont(name) { if (name) family = name; }

export function rounded(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function fontFor(size, weight = 600) { return `${weight} ${size}px ${family}`; }

// Every label sits on a backdrop that changes with scale, so each one carries a
// halo of the opposite tone rather than trusting what is behind it.
// `within` is the stage's width: a label given it slides along to stay on the stage.
export function write(ctx, line, x, y, { size = 12, weight = 600, fill = '#fff', halo = 'rgba(0,0,0,.6)', align = 'left', baseline = 'middle', alpha = 1, within = 0 } = {}) {
  if (alpha <= 0.01 || !line) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = fontFor(size, weight);
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.lineJoin = 'round';
  if (within) {
    const wide = ctx.measureText(line).width;
    const left = align === 'right' ? x - wide : align === 'center' ? x - wide / 2 : x;
    x += clamp(left, 4, Math.max(4, within - 4 - wide)) - left;
  }
  if (halo) {
    ctx.strokeStyle = halo;
    ctx.lineWidth = Math.max(2.5, size / 4);
    ctx.strokeText(line, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(line, x, y);
  ctx.restore();
}

// Everything placed on a stage can be asked for its box, and two labels that share any of
// it are a label nobody can read. The scenes settle who moves and who goes without.
export const meets = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

// Landmark names are written for sentences, and some are long for a narrow stage, in
// some languages much longer than in others. `within` is the stage's width and `room`
// how much of it this chip may have: a chip shrinks to fit, takes a second line after
// that, and always stays on the stage. It never drops words, because a name cut short
// says nothing about which landmark is meant. `clear` is a box already claimed, or a list
// of them taken in turn: this chip steps up above it rather than covering it, or below it
// when `downward`.
//
// This is where a chip will go, without painting it, because what is written before a
// chip has to keep clear of it as well as what is written after.
export function chipBox(ctx, line, x, y, { size = 12, weight = 700, align = 'left', within = 0, room = 0, clear = null, downward = false } = {}) {
  ctx.save();
  let lines = [line];
  let fontSize = size;
  ctx.font = fontFor(fontSize, weight);
  let width = ctx.measureText(line).width + fontSize * 1.3;
  const limit = room || (within ? within - 12 : 0);
  if (limit && width > limit) {
    fontSize = Math.max(10, size * limit / width);
    ctx.font = fontFor(fontSize, weight);
    width = ctx.measureText(line).width + fontSize * 1.3;
    if (width > limit) {
      lines = wrapLines(ctx, line, limit - fontSize * 1.3, fontSize, weight);
      width = Math.max(...lines.map(part => ctx.measureText(part).width)) + fontSize * 1.3;
    }
  }
  ctx.restore();
  const height = size * 2 + (lines.length - 1) * fontSize * 1.2;
  let left = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x;
  if (within) left = clamp(left, 6, Math.max(6, within - 6 - width));
  for (const box of [clear].flat()) {
    if (box && left < box.right && left + width > box.left && y - height / 2 < box.bottom && y + height / 2 > box.top) {
      y = downward ? box.bottom + height / 2 + 3 : box.top - height / 2 - 3;
    }
  }
  return { left, right: left + width, top: y - height / 2, bottom: y + height / 2, y, height, lines, fontSize };
}

export function chip(ctx, line, x, y, options = {}) {
  const { size = 12, weight = 700, fill = '#fff', ink = '#16202a', alpha = 1, stroke = null } = options;
  if (alpha <= 0.01 || !line) return undefined;
  const box = chipBox(ctx, line, x, y, options);
  const { left, right, top, height, lines, fontSize } = box;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = fontFor(fontSize, weight);
  rounded(ctx, left, top, right - left, height, Math.min(height, size * 2) / 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  lines.forEach((part, i) => ctx.fillText(part, (left + right) / 2, box.y + 0.5 + (i - (lines.length - 1) / 2) * fontSize * 1.2));
  ctx.restore();
  return box;
}

export function widthOf(ctx, line, size, weight = 600) {
  ctx.save();
  ctx.font = fontFor(size, weight);
  const width = ctx.measureText(line).width;
  ctx.restore();
  return width;
}

// The size that lets a line a scene will not wrap fit its room, no larger than it asked for.
export function fittedSize(ctx, line, size, weight, room) {
  const width = widthOf(ctx, line, size, weight);
  return width > room ? Math.max(10, size * room / width) : size;
}

// Where a line may give way. Chinese and Japanese have no spaces and break between any
// two characters, keeping opening marks with what follows and closing marks and small
// kana with what comes before. Anything else breaks at a plain space or after a hyphen,
// which is the one place a long German compound can give way. The no-break space Intl
// puts in "0,1 %" is not a place to break, which is why this is not \s.
const BREAKS = / +|[（「『《“‘]*[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}ー][）」』》”’，。、；：？！ぁぃぅぇぉっゃゅょァィゥェォッャュョー]*|[^ \p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}-]*-|[^ \p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}-]+/gu;

export function wrapLines(ctx, line, width, size, weight = 600) {
  ctx.save();
  ctx.font = fontFor(size, weight);
  const fits = text => ctx.measureText(text).width <= width;
  const lines = [];
  let part = '';
  for (let piece of line.match(BREAKS) ?? []) {
    if (fits((part + piece).trimEnd())) {
      part += piece;
      continue;
    }
    if (part.trim()) lines.push(part.trimEnd());
    piece = piece.trimStart();
    // A word wider than the whole line breaks where it has to, since the alternative
    // is a word that runs off the stage.
    while (piece.length > 1 && !fits(piece)) {
      let cut = piece.length - 1;
      while (cut > 1 && !fits(`${piece.slice(0, cut)}-`)) cut -= 1;
      lines.push(`${piece.slice(0, cut)}-`);
      piece = piece.slice(cut);
    }
    part = piece;
  }
  if (part.trim()) lines.push(part.trimEnd());
  ctx.restore();
  return lines;
}

export function backdrop(ctx, w, h, top, bottom) {
  const gradient = ctx.createLinearGradient(0, 0, 0, h);
  gradient.addColorStop(0, rgba(top));
  gradient.addColorStop(1, rgba(bottom));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

export function nightSky(ctx, w, h, alpha, t = 0, motion = false, count = 240) {
  if (alpha <= 0.01) return;
  ctx.save();
  for (let i = 0; i < count; i++) {
    const [px, py] = scatter(i + 40);
    const size = 0.7 + hash(i, 3) * hash(i, 4) * 1.5;
    const twinkle = motion ? 0.75 + 0.25 * Math.sin(t * (0.7 + hash(i, 5) * 1.6) + i) : 0.9;
    ctx.fillStyle = `rgba(232,238,255,${(0.35 + hash(i, 6) * 0.6) * alpha * twinkle})`;
    ctx.fillRect(px * w, py * h, size, size);
  }
  ctx.restore();
}

// Colour in deep space, because stars on flat black read as a broken texture once
// the only thing moving is a line getting longer.
export function nebula(ctx, w, h, alpha) {
  if (alpha <= 0.01) return;
  const patches = [[0.78, 0.26, 0.5, '120,90,210'], [0.5, 0.82, 0.62, '40,110,190'], [0.14, 0.42, 0.42, '190,70,130']];
  for (const [x, y, reach, colour] of patches) {
    const radius = Math.max(w, h) * reach;
    const glow = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, radius);
    glow.addColorStop(0, `rgba(${colour},${0.16 * alpha})`);
    glow.addColorStop(1, `rgba(${colour},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);
  }
}

const LAND = [[-0.36, -0.28, 0.3, 0.2, 0.3], [0.2, -0.44, 0.26, 0.15, -0.2], [0.42, 0.06, 0.24, 0.3, 0.5], [-0.2, 0.36, 0.17, 0.28, 0.2], [0.04, 0.02, 0.13, 0.09, 0.8]];

export function paintEarth(ctx, cx, cy, radius, alpha = 1) {
  if (alpha <= 0.01 || radius <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  const glow = ctx.createRadialGradient(cx, cy, radius * 0.97, cx, cy, radius + Math.max(5, radius * 0.09));
  glow.addColorStop(0, 'rgba(130,200,255,.55)');
  glow.addColorStop(1, 'rgba(130,200,255,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + Math.max(5, radius * 0.09), 0, Math.PI * 2);
  ctx.fill();
  const sea = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.35, radius * 0.1, cx, cy, radius);
  sea.addColorStop(0, '#3f9bdc');
  sea.addColorStop(1, '#123f7c');
  ctx.fillStyle = sea;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  if (radius > 3) {
    ctx.clip();
    ctx.fillStyle = '#4e9a5f';
    for (const [x, y, rx, ry, turn] of LAND) {
      ctx.beginPath();
      ctx.ellipse(cx + x * radius, cy + y * radius, rx * radius, ry * radius, turn, 0, Math.PI * 2);
      ctx.fill();
    }
    // A globe has caps. Close up, one would fill the frame and read as snow.
    ctx.fillStyle = `rgba(255,255,255,${0.85 * (1 - smooth(140, 420, radius))})`;
    ctx.beginPath();
    ctx.ellipse(cx, cy - radius * 0.98, radius * 0.5, radius * 0.1, 0, 0, Math.PI * 2);
    ctx.ellipse(cx, cy + radius * 0.98, radius * 0.56, radius * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(cx + (hash(i, 21) - 0.5) * radius * 1.5, cy + (hash(i, 22) - 0.5) * radius * 1.5, radius * 0.3, radius * 0.05, hash(i, 23), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

// A rough spiral, sorted from the core outward so a share of it can light up as
// a region rather than as noise. Coordinates are in a unit disc.
export function spiralDots(count) {
  const dots = [];
  for (let i = 0; i < count; i++) {
    const kind = hash(i, 11);
    let x;
    let y;
    if (kind < 0.2) {
      x = gauss(i, 12) * 0.095;
      y = gauss(i, 13) * 0.095;
    } else if (kind < 0.86) {
      const along = Math.pow(hash(i, 14), 0.72);
      const radius = 0.08 + along * 0.9;
      const arm = Math.floor(hash(i, 15) * 4);
      const angle = arm * Math.PI / 2 + 2.6 * Math.log(radius / 0.08) + gauss(i, 16) * (0.34 - along * 0.2);
      x = radius * Math.cos(angle) + gauss(i, 17) * 0.012;
      y = radius * Math.sin(angle) + gauss(i, 18) * 0.012;
    } else {
      const radius = Math.sqrt(hash(i, 19));
      const angle = hash(i, 20) * Math.PI * 2;
      x = radius * Math.cos(angle);
      y = radius * Math.sin(angle);
    }
    const length = Math.hypot(x, y);
    if (length > 1) { x /= length; y /= length; }
    // Feathered, or the lit share would end in a hard circle no galaxy has.
    const reach = Math.min(1, length * (0.72 + hash(i, 27) * 0.56));
    dots.push({ x, y, radius: reach, size: 0.7 + hash(i, 24) * hash(i, 25) * 1.9, warm: length < 0.22 || hash(i, 26) < 0.14 });
  }
  return dots.sort((a, b) => a.radius - b.radius);
}

// The picture is drawn once at a fixed size and only ever rescaled, so a turning
// galaxy costs one image per frame however many dots are in it.
export function dotLayer(size = 1024) {
  const layer = document.createElement('canvas');
  layer.width = size;
  layer.height = size;
  return layer;
}

export function plotDots(layer, dots, from, to, colour) {
  const ctx = layer.getContext('2d');
  const half = layer.width / 2;
  for (let i = from; i < to; i++) {
    const dot = dots[i];
    ctx.fillStyle = colour(dot);
    ctx.fillRect(half + dot.x * half * 0.98 - dot.size, half + dot.y * half * 0.98 - dot.size, dot.size * 2, dot.size * 2);
  }
}

let galaxyImage = null;
export function galaxySprite() {
  if (galaxyImage) return galaxyImage;
  const dots = spiralDots(20000);
  galaxyImage = dotLayer(1024);
  plotDots(galaxyImage, dots, 0, dots.length, dot => (dot.warm ? 'rgba(255,226,180,.8)' : 'rgba(176,206,255,.7)'));
  const ctx = galaxyImage.getContext('2d');
  const core = ctx.createRadialGradient(512, 512, 0, 512, 512, 170);
  core.addColorStop(0, 'rgba(255,240,214,.85)');
  core.addColorStop(1, 'rgba(255,240,214,0)');
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, 1024, 1024);
  return galaxyImage;
}

export function paintGalaxy(ctx, cx, cy, radius, { turn = 0, tilt = 0.56, alpha = 1 } = {}) {
  if (alpha <= 0.01 || radius <= 0.2) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.globalCompositeOperation = 'lighter';
  ctx.translate(cx, cy);
  ctx.scale(1, tilt);
  ctx.rotate(turn);
  ctx.drawImage(galaxySprite(), -radius, -radius, radius * 2, radius * 2);
  ctx.restore();
}
