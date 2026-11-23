import { TAU, disc, eachCell, frameOf, hash } from './kit.js';

// A songbird on a branch, in metres. The bird is the size of a robin, 14 cm from bill
// to tail, and everything about it is drawn in its real size and then scaled, so the
// eye that is a dot at eight times is an eye with a glint in it at forty.

const EVERYWHERE = { left: -1e6, right: 1e6, top: -1e6, bottom: 1e6 };

// Leaves well behind the bird and out of focus: soft patches, never an edge.
function foliage(ctx, g) {
  const frame = frameOf(g, EVERYWHERE);
  eachCell(frame, 0.9, 400, (i, j) => {
    if (hash(i, j, 61) > 0.62) return;
    const x = g.cx + (i + hash(i, j, 62)) * 0.9 * g.k;
    const y = g.cy + (j + hash(i, j, 63)) * 0.9 * g.k;
    const reach = (0.5 + 0.6 * hash(i, j, 64)) * g.k;
    const green = hash(i, j, 65) > 0.5 ? '86,132,78' : '112,150,88';
    const leaf = ctx.createRadialGradient(x, y, reach * 0.1, x, y, reach);
    leaf.addColorStop(0, `rgba(${green},0.6)`);
    leaf.addColorStop(1, `rgba(${green},0)`);
    ctx.fillStyle = leaf;
    disc(ctx, x, y, reach);
    ctx.fill();
  });
}

// The branch runs right across the picture, whatever the picture's width.
function branch(ctx, g) {
  const reach = (g.w + g.h) / g.k;
  const thick = 0.017;
  const at = x => 0.046 + 0.05 * x;
  ctx.strokeStyle = '#5a4532';
  ctx.lineWidth = Math.max(0.7, thick * g.k);
  ctx.beginPath();
  ctx.moveTo(g.cx - reach * g.k, g.cy + at(-reach) * g.k);
  ctx.lineTo(g.cx + reach * g.k, g.cy + at(reach) * g.k);
  ctx.stroke();
  if (0.003 * g.k < 1.6) return;
  // Bark, once it is wide enough on screen to have any.
  ctx.strokeStyle = 'rgba(40,30,22,0.5)';
  ctx.lineWidth = Math.max(0.5, 0.0005 * g.k);
  const frame = frameOf(g, { left: -reach, right: reach, top: -1, bottom: 1 });
  eachCell({ left: frame.left, right: frame.right, top: 0, bottom: 0.015 }, 0.003, 4000, (i, j) => {
    const x = (i + hash(i, j, 71)) * 0.003;
    const y = at(x) + (j - 2.5 + hash(i, j, 72)) * 0.003;
    ctx.beginPath();
    ctx.moveTo(g.cx + x * g.k, g.cy + y * g.k);
    ctx.lineTo(g.cx + (x + 0.004) * g.k, g.cy + (y + 0.0003) * g.k);
    ctx.stroke();
  });
}

function oval(ctx, x, y, wide, tall, turn, tone) {
  ctx.fillStyle = tone;
  ctx.beginPath();
  ctx.ellipse(x, y, wide, tall, turn, 0, TAU);
  ctx.fill();
}

// Feather texture inside a body part: short strokes lying the way feathers lie, in
// two sizes, the finer a tenth of a millimetre wide.
function barbs(ctx, g, patch, spacing, width, tone) {
  if (spacing * g.k < 2.2) return;
  const frame = frameOf(g, patch);
  if (frame.empty) return;
  ctx.strokeStyle = tone;
  ctx.lineWidth = width;
  eachCell(frame, spacing, 6000, (i, j) => {
    const x = (i + hash(i, j, 81)) * spacing;
    const y = (j + hash(i, j, 82)) * spacing;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + spacing * 0.9, y + spacing * 0.35);
    ctx.stroke();
  });
}

function bird(ctx, g) {
  if (0.14 * g.k < 2.4) {
    // Under a few pixels long there is no bird to draw, only that something is there.
    oval(ctx, g.cx, g.cy, Math.max(0.9, 0.06 * g.k), Math.max(0.7, 0.035 * g.k), 0, 'rgba(92,66,44,0.9)');
    return;
  }
  ctx.save();
  ctx.translate(g.cx, g.cy);
  ctx.scale(g.k, g.k);
  ctx.lineCap = 'round';
  // Legs first, so the body sits over where they join it.
  ctx.strokeStyle = '#5f4b3c';
  ctx.lineWidth = 0.0015;
  for (const [fromX, toX] of [[-0.006, -0.009], [0.009, 0.007]]) {
    ctx.beginPath();
    ctx.moveTo(fromX, 0.026);
    ctx.lineTo(toX, 0.0375);
    ctx.stroke();
    if (0.004 * g.k > 1.5) {
      for (const toe of [-0.006, 0, 0.005]) {
        ctx.beginPath();
        ctx.moveTo(toX, 0.0375);
        ctx.lineTo(toX + toe, 0.0405);
        ctx.stroke();
      }
    }
  }
  // Tail, back, belly, breast, wing, head and face, back to front.
  ctx.fillStyle = '#6a4f38';
  ctx.beginPath();
  ctx.moveTo(0.03, 0.002);
  ctx.lineTo(0.088, 0.022);
  ctx.lineTo(0.083, 0.032);
  ctx.lineTo(0.028, 0.02);
  ctx.closePath();
  ctx.fill();
  oval(ctx, 0, 0, 0.046, 0.033, -0.25, '#8a6a48');
  oval(ctx, -0.011, 0.009, 0.035, 0.025, -0.3, '#e9e0d0');
  oval(ctx, -0.024, -0.003, 0.024, 0.022, 0, '#d9722f');
  oval(ctx, 0.015, -0.003, 0.036, 0.016, 0.3, '#6f553a');
  oval(ctx, -0.04, -0.034, 0.0215, 0.0215, 0, '#8a6a48');
  oval(ctx, -0.047, -0.029, 0.014, 0.014, 0, '#d9722f');
  ctx.fillStyle = '#3d3428';
  ctx.beginPath();
  ctx.moveTo(-0.0595, -0.0365);
  ctx.lineTo(-0.073, -0.0325);
  ctx.lineTo(-0.0595, -0.0295);
  ctx.closePath();
  ctx.fill();
  // The long feathers of the folded wing, then the texture of the smaller ones.
  if (0.005 * g.k > 1.4) {
    ctx.strokeStyle = 'rgba(52,38,26,0.75)';
    ctx.lineWidth = 0.0007;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(-0.012 + i * 0.006, -0.012 + i * 0.002);
      ctx.lineTo(0.02 + i * 0.006, 0.004 + i * 0.0022);
      ctx.stroke();
    }
  }
  barbs(ctx, g, { left: -0.045, right: -0.002, top: -0.022, bottom: 0.03 }, 0.0024, 0.0003, 'rgba(120,58,22,0.4)');
  barbs(ctx, g, { left: -0.02, right: 0.045, top: -0.018, bottom: 0.012 }, 0.0024, 0.0003, 'rgba(48,34,24,0.4)');
  barbs(ctx, g, { left: -0.06, right: 0.045, top: -0.055, bottom: 0.03 }, 0.0006, 0.0001, 'rgba(40,28,20,0.3)');
  // The eye last: it is what somebody looking for detail looks at.
  if (0.006 >= g.fine) {
    oval(ctx, -0.046, -0.04, 0.003, 0.003, 0, '#17130f');
    if (0.0016 >= g.fine) oval(ctx, -0.0468, -0.0409, 0.0008, 0.0008, 0, '#ffffff');
  }
  ctx.restore();
}

export function drawLand(ctx, g) {
  const sky = ctx.createLinearGradient(0, 0, 0, g.h);
  sky.addColorStop(0, '#a9cfee');
  sky.addColorStop(1, '#dcecf7');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, g.w, g.h);
  foliage(ctx, g);
  branch(ctx, g);
  bird(ctx, g);
  if (g.dusk) {
    // Dusk takes the colour out before it takes the light: the whole scene is
    // darkened toward blue, and the instrument's own dimming comes on top of that.
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = '#56608e';
    ctx.fillRect(0, 0, g.w, g.h);
    ctx.globalCompositeOperation = 'source-over';
  }
}
