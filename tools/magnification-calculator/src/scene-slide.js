import { TAU, disc, eachCell, frameOf, hash } from './kit.js';

// Small things, in millimetres. Each specimen is drawn at two scales at once: the
// smear or scrap a bare eye sees on the glass, and the cells it is made of, which
// only appear once a cell is wider than a pixel. So the same drawing is a pink
// stain to the eye alone and a field of discs at four hundred times.

// A desk, and on it a glass slide 75 mm by 25 with a cover slip in the middle. Under
// a microscope the glass is lit from below and is the whole background; under a
// magnifier the thing lies on paper instead.
function backdrop(ctx, g) {
  if (g.backdrop === 'paper') {
    ctx.fillStyle = '#f3f0e6';
    ctx.fillRect(0, 0, g.w, g.h);
    return;
  }
  ctx.fillStyle = g.lit ? '#191b1f' : '#3d4249';
  ctx.fillRect(0, 0, g.w, g.h);
  ctx.fillStyle = g.lit ? '#f4f6f0' : '#d3dcdc';
  ctx.fillRect(g.cx - 37.5 * g.k, g.cy - 12.5 * g.k, 75 * g.k, 25 * g.k);
  ctx.strokeStyle = 'rgba(104,124,130,0.7)';
  ctx.lineWidth = Math.max(0.6, 0.12 * g.k);
  ctx.strokeRect(g.cx - 37.5 * g.k, g.cy - 12.5 * g.k, 75 * g.k, 25 * g.k);
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(g.cx - 11 * g.k, g.cy - 11 * g.k, 22 * g.k, 22 * g.k);
  ctx.strokeStyle = 'rgba(120,140,150,0.5)';
  ctx.lineWidth = Math.max(0.5, 0.08 * g.k);
  ctx.strokeRect(g.cx - 11 * g.k, g.cy - 11 * g.k, 22 * g.k, 22 * g.k);
}

// Onion skin: rows of long cells laid like bricks, 0.3 mm by 0.07, each with a nucleus.
function onion(ctx, g) {
  const patch = { left: -6, right: 6, top: -4.5, bottom: 4.5 };
  const rowTall = 0.07;
  const cellLong = 0.3;
  ctx.fillStyle = 'rgba(206,186,120,0.36)';
  ctx.fillRect(g.cx + patch.left * g.k, g.cy + patch.top * g.k, 12 * g.k, 9 * g.k);
  if (rowTall * g.k < 1.4) return;
  const frame = frameOf(g, patch);
  if (frame.empty) return;
  const wall = Math.max(0.6, 0.004 * g.k);
  const edge = (row, i) => (i + 0.5 * hash(row, 0, 5) + 0.3 * (hash(row, i, 9) - 0.5)) * cellLong;
  for (let row = Math.floor(frame.top / rowTall); row < Math.ceil(frame.bottom / rowTall); row++) {
    const y = g.cy + row * rowTall * g.k;
    ctx.strokeStyle = 'rgba(112,92,48,0.85)';
    ctx.lineWidth = wall;
    ctx.beginPath();
    ctx.moveTo(g.cx + frame.left * g.k, y);
    ctx.lineTo(g.cx + frame.right * g.k, y);
    for (let i = Math.floor(frame.left / cellLong) - 1; i <= Math.ceil(frame.right / cellLong); i++) {
      const x = g.cx + edge(row, i) * g.k;
      ctx.moveTo(x, y);
      ctx.lineTo(x + rowTall * g.k * 0.18, y + rowTall * g.k);
    }
    ctx.stroke();
    if (0.014 * g.k < 1.2) continue;
    for (let i = Math.floor(frame.left / cellLong) - 1; i <= Math.ceil(frame.right / cellLong); i++) {
      const long = edge(row, i + 1) - edge(row, i);
      const x = g.cx + (edge(row, i) + long * (0.3 + 0.4 * hash(row, i, 13))) * g.k;
      const middle = y + rowTall * g.k * (0.35 + 0.3 * hash(row, i, 14));
      ctx.fillStyle = 'rgba(120,84,40,0.8)';
      disc(ctx, x, middle, 0.007 * g.k);
      ctx.fill();
      if (0.003 * g.k >= 1) {
        ctx.fillStyle = 'rgba(70,44,18,0.9)';
        disc(ctx, x + 0.002 * g.k, middle - 0.001 * g.k, 0.0015 * g.k);
        ctx.fill();
      }
      if (0.0005 * g.k < 1) continue;
      // The grains in the cell's fluid, a quarter of a micrometre across.
      ctx.fillStyle = 'rgba(120,100,60,0.5)';
      for (let n = 0; n < 14; n++) {
        disc(ctx, g.cx + (edge(row, i) + long * hash(row * 31 + i, n, 15)) * g.k, y + rowTall * g.k * hash(row * 31 + i, n, 16), 0.000125 * g.k * (1 + 3 * hash(i, n, 17)));
        ctx.fill();
      }
    }
  }
}

// A blood smear: red cells 7.5 µm wide with a pale middle, now and then a white cell
// with its lobed nucleus, and platelets between them.
function blood(ctx, g) {
  const patch = { left: -17, right: 17, top: -7, bottom: 7 };
  const stain = ctx.createLinearGradient(g.cx + patch.left * g.k, 0, g.cx + patch.right * g.k, 0);
  stain.addColorStop(0, 'rgba(176,52,48,0.5)');
  stain.addColorStop(1, 'rgba(176,52,48,0.14)');
  ctx.fillStyle = stain;
  ctx.fillRect(g.cx + patch.left * g.k, g.cy + patch.top * g.k, 34 * g.k, 14 * g.k);
  const pitch = 0.0105;
  if (pitch * g.k < 1.6) return;
  const frame = frameOf(g, patch);
  if (frame.empty) return;
  const reach = 0.00375 * g.k;
  eachCell(frame, pitch, 14000, (i, j) => {
    const dice = hash(i, j, 3);
    if (dice > 0.72) return;
    const x = g.cx + (i + 0.5 + 0.5 * (hash(i, j, 4) - 0.5)) * pitch * g.k;
    const y = g.cy + (j + 0.5 + 0.5 * (hash(i, j, 6) - 0.5)) * pitch * g.k;
    if (dice < 0.003) {
      ctx.fillStyle = 'rgba(214,208,232,0.92)';
      disc(ctx, x, y, 0.0065 * g.k);
      ctx.fill();
      ctx.fillStyle = 'rgba(96,60,150,0.9)';
      for (const [dx, dy] of [[-0.0022, -0.001], [0.0016, -0.0018], [0.0008, 0.0022]]) {
        disc(ctx, x + dx * g.k, y + dy * g.k, 0.0026 * g.k);
        ctx.fill();
      }
      if (0.00025 * g.k < 1) return;
      ctx.fillStyle = 'rgba(150,120,190,0.6)';
      for (let n = 0; n < 30; n++) {
        const turn = hash(i * 17 + j, n, 8) * TAU;
        const out = 0.0058 * Math.sqrt(hash(i * 17 + j, n, 9)) * g.k;
        disc(ctx, x + Math.cos(turn) * out, y + Math.sin(turn) * out, 0.000125 * g.k);
        ctx.fill();
      }
      return;
    }
    if (dice < 0.03) {
      ctx.fillStyle = 'rgba(120,70,160,0.8)';
      disc(ctx, x, y, Math.max(0.5, 0.0012 * g.k));
      ctx.fill();
      return;
    }
    ctx.fillStyle = 'rgba(198,74,62,0.82)';
    disc(ctx, x, y, reach);
    ctx.fill();
    if (reach < 2.2) return;
    ctx.fillStyle = 'rgba(244,206,196,0.75)';
    disc(ctx, x, y, reach * 0.45);
    ctx.fill();
    if (0.0004 * g.k < 0.8) return;
    ctx.strokeStyle = 'rgba(140,40,36,0.7)';
    ctx.lineWidth = 0.00025 * g.k;
    disc(ctx, x, y, reach);
    ctx.stroke();
  });
}

// One hair, 0.07 mm thick, crossing the picture: a darker core down the middle and
// the overlapping scales of its surface, about nine micrometres apart.
function hair(ctx, g) {
  const half = 0.035 * g.k;
  const far = g.w + g.h;
  ctx.save();
  ctx.translate(g.cx, g.cy);
  ctx.rotate(-0.18);
  if (half < 0.6) {
    // Thinner than a pixel, a hair is still seen, as a line fainter than it is dark.
    ctx.strokeStyle = `rgba(70,52,36,${Math.min(1, 0.25 + half)})`;
    ctx.lineWidth = Math.max(0.6, half * 2);
    ctx.beginPath();
    ctx.moveTo(-far, 0);
    ctx.lineTo(far, 0);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const shaft = ctx.createLinearGradient(0, -half, 0, half);
  shaft.addColorStop(0, '#4a3626');
  shaft.addColorStop(0.5, '#86633f');
  shaft.addColorStop(1, '#4a3626');
  ctx.fillStyle = shaft;
  ctx.fillRect(-far, -half, far * 2, half * 2);
  if (0.016 * g.k >= 1.2) {
    ctx.fillStyle = 'rgba(40,28,20,0.5)';
    ctx.fillRect(-far, -0.008 * g.k, far * 2, 0.016 * g.k);
  }
  const spacing = 0.009 * g.k;
  if (spacing >= 2.2) {
    const count = Math.min(700, Math.ceil(far / spacing));
    for (const [tone, width] of [['rgba(30,22,16,0.5)', Math.max(0.5, 0.0005 * g.k)], ['rgba(230,200,160,0.35)', 0.00025 * g.k]]) {
      if (width < 0.4) continue;
      ctx.strokeStyle = tone;
      ctx.lineWidth = width;
      ctx.beginPath();
      for (let n = -count; n <= count; n++) {
        const x = (n + 0.4 * (hash(n, 2, 31) - 0.5)) * spacing + width;
        ctx.moveTo(x, -half);
        ctx.lineTo(x + spacing * 0.7, 0);
        ctx.lineTo(x, half);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Seventy grains of table salt, placed once. Salt grows as cubes, so each is a
// square from above, with the sunken cross of a crystal that grew fastest at its edges.
const GRAINS = Array.from({ length: 70 }, (unused, n) => ({
  x: (hash(n, 1, 41) - 0.5) * 14,
  y: (hash(n, 2, 41) - 0.5) * 10,
  wide: 0.18 + 0.27 * hash(n, 3, 41),
  turn: hash(n, 4, 41) * Math.PI / 2
}));
// One sits in the middle, where the close look falls.
GRAINS[0] = { x: 0.02, y: -0.03, wide: 0.3, turn: 0.35 };

function salt(ctx, g) {
  for (const grain of GRAINS) {
    const reach = grain.wide / 2 * g.k;
    const x = g.cx + grain.x * g.k;
    const y = g.cy + grain.y * g.k;
    if (x + reach * 2 < 0 || x - reach * 2 > g.w || y + reach * 2 < 0 || y - reach * 2 > g.h) continue;
    if (reach < 0.6) {
      ctx.fillStyle = g.backdrop === 'paper' ? 'rgba(120,120,116,0.5)' : 'rgba(90,98,106,0.6)';
      ctx.fillRect(x - 0.5, y - 0.5, 1, 1);
      continue;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(grain.turn);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    ctx.fillRect(-reach * 0.92, -reach * 0.92, reach * 2, reach * 2);
    ctx.fillStyle = 'rgba(248,250,250,0.96)';
    ctx.fillRect(-reach, -reach, reach * 2, reach * 2);
    ctx.strokeStyle = 'rgba(84,92,100,0.85)';
    ctx.lineWidth = Math.max(0.6, reach * 0.07);
    ctx.strokeRect(-reach, -reach, reach * 2, reach * 2);
    if (reach > 4) {
      ctx.strokeStyle = 'rgba(120,130,140,0.6)';
      ctx.lineWidth = Math.max(0.5, reach * 0.035);
      ctx.strokeRect(-reach * 0.5, -reach * 0.5, reach, reach);
      ctx.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        ctx.moveTo(sx * reach, sy * reach);
        ctx.lineTo(sx * reach * 0.5, sy * reach * 0.5);
      }
      ctx.stroke();
    }
    // The steps a crystal face grows in, a hundredth of a millimetre apart.
    const step = 0.012 * g.k;
    if (step >= 2.5 && 0.00025 * g.k >= 0.4) {
      ctx.strokeStyle = 'rgba(130,140,150,0.45)';
      ctx.lineWidth = 0.00025 * g.k;
      for (let out = reach * 0.5 + step, n = 0; out < reach && n < 40; out += step, n++) ctx.strokeRect(-out, -out, out * 2, out * 2);
    }
    ctx.restore();
  }
}

// A stained smear of bacteria: rods two micrometres long and half of one wide, and
// here and there a short chain of round ones.
function bacteria(ctx, g) {
  const patch = { left: -8, right: 8, top: -5, bottom: 5 };
  ctx.fillStyle = 'rgba(120,84,170,0.24)';
  ctx.fillRect(g.cx + patch.left * g.k, g.cy + patch.top * g.k, 16 * g.k, 10 * g.k);
  if (0.002 * g.k < 1.1) return;
  const frame = frameOf(g, patch);
  if (frame.empty) return;
  const pitch = 0.0065;
  ctx.lineCap = 'round';
  eachCell(frame, pitch, 14000, (i, j) => {
    const dice = hash(i, j, 21);
    if (dice > 0.4) return;
    const x = g.cx + (i + hash(i, j, 22)) * pitch * g.k;
    const y = g.cy + (j + hash(i, j, 24)) * pitch * g.k;
    const turn = hash(i, j, 23) * Math.PI;
    const dx = Math.cos(turn) * g.k;
    const dy = Math.sin(turn) * g.k;
    if (dice < 0.06) {
      ctx.fillStyle = 'rgba(84,50,140,0.85)';
      for (let n = -1.5; n <= 1.5; n++) {
        disc(ctx, x + dx * n * 0.0011, y + dy * n * 0.0011, Math.max(0.5, 0.0005 * g.k));
        ctx.fill();
      }
      return;
    }
    // The rod itself, and once it is wide enough, the paler inside of it.
    const core = 0.00025 * g.k;
    for (const [tone, width] of [['rgba(98,58,150,0.85)', Math.max(0.35, core * 2)], ['rgba(176,148,214,0.6)', core]]) {
      if (width < 0.35) continue;
      ctx.strokeStyle = tone;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x - dx * 0.00075, y - dy * 0.00075);
      ctx.lineTo(x + dx * 0.00075, y + dy * 0.00075);
      ctx.stroke();
    }
  });
  ctx.lineCap = 'butt';
}

const SPECIMENS = { onion, blood, hair, salt, bacteria };

export function drawSlide(ctx, g) {
  backdrop(ctx, g);
  SPECIMENS[g.id](ctx, g);
}
