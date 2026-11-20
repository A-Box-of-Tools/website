import { eachCell, frameOf, hash } from './kit.js';

// Things held in the hand, in millimetres: a printed page and a ruler. The page is
// the one place a picture here carries words, and they are not labels: they are the
// thing being looked at, handed in from the markup so that each language's page is
// printed in that language.

const EVERYWHERE = { left: -1e6, right: 1e6, top: -1e6, bottom: 1e6 };

// Paper is fibres, twenty micrometres wide, and finer threads between them. They are
// what a strong lens shows when the print has run out of detail of its own.
function fibres(ctx, g) {
  const frame = frameOf(g, EVERYWHERE);
  for (const [pitch, long, wide, alpha] of [[0.35, 0.8, 0.02, 0.16], [0.05, 0.07, 0.003, 0.2]]) {
    if (wide * g.k < 0.6) continue;
    ctx.strokeStyle = `rgba(150,138,116,${alpha})`;
    ctx.lineWidth = wide * g.k;
    eachCell(frame, pitch, 6000, (i, j) => {
      const x = g.cx + (i + hash(i, j, 91)) * pitch * g.k;
      const y = g.cy + (j + hash(i, j, 92)) * pitch * g.k;
      const turn = hash(i, j, 93) * Math.PI;
      const reach = long * g.k * (0.5 + hash(i, j, 94));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + Math.cos(turn) * reach * 0.5 + reach * 0.2, y + Math.sin(turn) * reach * 0.5, x + Math.cos(turn) * reach, y + Math.sin(turn) * reach);
      ctx.stroke();
    });
  }
}

// Three sizes of type down one page: 8 point, which is ordinary small print, 5
// point, which is the kind a contract hides things in, and a line of microprint a
// quarter of a millimetre high, as on a banknote. Each row is where its baseline
// sits and how tall its letters' body is, in millimetres.
const ROWS = [
  [-3.1, 2.82, 0], [0.7, 2.82, 1], [4.5, 2.82, 2], [8.3, 1.76, 0], [10.7, 1.76, 1], [13.1, 1.76, 2],
  [15.7, 0.25, 3], [16.15, 0.25, 3], [16.6, 0.25, 3]
];
// The middle of the picture falls on the second line, a few letters in, so the close
// look lands on type and not on the white between two lines of it.
const MARGIN = -12;

function print(ctx, g) {
  ctx.fillStyle = '#1c1b19';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  for (const [baseline, body, which] of ROWS) {
    const tall = body * g.k;
    const y = g.cy + baseline * g.k;
    if (y < -tall || y - tall > g.h) continue;
    const words = g.words[which] || '';
    const x = g.cx + MARGIN * g.k;
    // Microprint runs the width of the note, so the one line is repeated along it.
    const line = which === 3 ? `${words} ${words} ${words}` : words;
    if (tall < 1.5) {
      // Too small for the screen to form a letter: a grey line where the line of type
      // is, as long as the type would be. The length is measured and not counted,
      // because a line of Japanese is twice as long as its count of letters suggests.
      ctx.font = `10px ${g.face}`;
      const long = ctx.measureText(line).width * tall / 10;
      ctx.globalAlpha = Math.min(0.55, 0.2 + tall * 0.25);
      ctx.fillRect(x, y - tall * 0.5, long, Math.max(0.6, tall * 0.5));
      ctx.globalAlpha = 1;
      continue;
    }
    ctx.font = `${tall}px ${g.face}`;
    ctx.fillText(line, x, y);
  }
}

// A ruler's edge: a mark every millimetre, a longer one every five and the longest
// every ten, each 0.14 mm wide. The picture is centred on the tip of a ten.
function ruler(ctx, g) {
  const edge = -1.6;
  ctx.fillStyle = '#dcc993';
  ctx.fillRect(0, g.cy + edge * g.k, g.w, 28 * g.k);
  ctx.fillStyle = 'rgba(90,72,40,0.7)';
  ctx.fillRect(0, g.cy + edge * g.k, g.w, Math.max(0.7, 0.1 * g.k));
  const frame = frameOf(g, EVERYWHERE);
  const halves = 0.5 * g.k >= 3;
  const step = halves ? 0.5 : 1;
  ctx.fillStyle = '#231d12';
  for (let at = Math.floor(frame.left / step) * step, n = 0; at <= frame.right && n < 1200; at += step, n++) {
    const whole = Math.abs(at - Math.round(at)) < 1e-6;
    const mark = Math.round(at);
    const long = !whole ? 1.8 : mark % 10 === 0 ? 7 : mark % 5 === 0 ? 5 : 3.2;
    const wide = Math.max(0.6, (whole ? 0.14 : 0.1) * g.k);
    ctx.fillRect(g.cx + at * g.k - wide / 2, g.cy + edge * g.k, wide, long * g.k);
    // The middle of the picture is the ruler's 2 cm mark, so its numbers run on from there.
    if (whole && mark % 10 === 0 && mark >= -20 && 3 * g.k >= 5) {
      ctx.font = `${3 * g.k}px ${g.face}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(String(mark / 10 + 2), g.cx + at * g.k, g.cy + (edge + 7.8) * g.k);
    }
  }
}

export function drawNear(ctx, g) {
  ctx.fillStyle = '#f4f1e8';
  ctx.fillRect(0, 0, g.w, g.h);
  fibres(ctx, g);
  if (g.id === 'ruler') ruler(ctx, g);
  else print(ctx, g);
}
