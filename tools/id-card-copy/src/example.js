/**
 * The two photographs behind the "Try an example" button.
 *
 * A made-up card - no country, no issuer, a specimen stamp across it and the
 * example mark where an emblem would be - photographed front and back on a
 * desk, at an angle and in uneven light. That is the input this tool exists for:
 * a flat, square-on picture of a card would demonstrate the layout and nothing
 * of the corner finding or the straightening.
 *
 * The card is put into each photograph by a true perspective map rather than
 * by drawing it in strips. A strip at a time is a fine fake for a page, where
 * only the four corners are judged; here the straightened result is compared
 * against a known shape, 85.6 by 53.98, and an approximate projection would
 * hand the tool a card it could not straighten exactly.
 */

import { homography, project } from './shared/document-geometry.js';
import { drawMark } from './shared/example-mark.js';
import { canvasFile } from './shared/example-photo.js';

/** Ten pixels to the millimetre: an ID-1 card at roughly 254 DPI. */
const CARD_W = 856;
const CARD_H = 540;
const RADIUS = 32;

export async function makeExample() {
  const front = photograph(cardCanvas(drawFront), {
    corners: [[300, 262], [1112, 214], [1168, 744], [262, 812]],
    lamp: [0.25, 0.15],
    seed: 7,
  });
  const back = photograph(cardCanvas(drawBack), {
    corners: [[236, 300], [1080, 250], [1150, 790], [208, 846]],
    lamp: [0.8, 0.2],
    seed: 11,
  });
  return Promise.all([
    canvasFile(front, 'example-card-front.jpg', 'image/jpeg', 0.9),
    canvasFile(back, 'example-card-back.jpg', 'image/jpeg', 0.9),
  ]);
}

function cardCanvas(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  draw(canvas.getContext('2d'));
  return canvas;
}

/** A pale ground with fine wavy lines, which is what every printed card has. */
function ground(ctx, from, to, line) {
  const fill = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  fill.addColorStop(0, from);
  fill.addColorStop(1, to);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.strokeStyle = line;
  ctx.lineWidth = 1;
  for (let row = -40; row < CARD_H + 40; row += 14) {
    ctx.beginPath();
    for (let x = 0; x <= CARD_W; x += 8) {
      const y = row + Math.sin((x + row * 3) / 46) * 6;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function label(ctx, text, x, y, size, colour, weight = 600) {
  ctx.font = `${weight} ${size}px system-ui, "Segoe UI", Arial, sans-serif`;
  ctx.fillStyle = colour;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y);
}

function stamp(ctx) {
  ctx.save();
  ctx.translate(CARD_W * 0.62, CARD_H * 0.62);
  ctx.rotate(-0.32);
  ctx.globalAlpha = 0.16;
  label(ctx, 'SPECIMEN', -170, 26, 76, '#a01818', 800);
  ctx.restore();
}

function drawFront(ctx) {
  ground(ctx, '#e4f1ee', '#ece6f4', 'rgba(40, 110, 120, 0.10)');

  // A dark band a couple of millimetres inside a light border, as on most real
  // cards. It is in the example on purpose: the corner finder used to take the
  // band's lower edge for the top of the card, because the border and the
  // band's top edge step in opposite directions a few pixels apart, and the
  // example is where that would show first if it came back.
  ctx.fillStyle = '#1f5f6b';
  ctx.beginPath();
  ctx.roundRect(22, 22, CARD_W - 44, 80, 14);
  ctx.fill();
  ctx.save();
  ctx.translate(36, 30);
  drawMark(ctx, 64);
  ctx.restore();
  label(ctx, 'EXAMPLE CARD', 120, 76, 38, '#ffffff', 700);

  // The portrait: a head and shoulders, nobody in particular.
  ctx.fillStyle = '#c9d6e3';
  ctx.fillRect(40, 130, 214, 268);
  ctx.fillStyle = '#7d91a8';
  ctx.beginPath();
  ctx.arc(147, 226, 58, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(147, 398, 98, 92, 0, Math.PI, 0);
  ctx.fill();

  const fields = [
    ['SURNAME', 'SAMPLE'],
    ['GIVEN NAMES', 'ALEX JORDAN'],
    ['DATE OF BIRTH', '01 01 1990'],
    ['CARD NUMBER', 'X 0000 0000'],
  ];
  fields.forEach(([name, value], index) => {
    const y = 150 + index * 74;
    label(ctx, name, 290, y, 17, '#4f6b73');
    label(ctx, value, 290, y + 34, 31, '#13262b', 700);
  });

  ctx.fillStyle = '#d9b44a';
  ctx.fillRect(40, 430, 70, 54);
  ctx.strokeStyle = 'rgba(90, 70, 20, 0.6)';
  ctx.strokeRect(52, 442, 46, 30);
  label(ctx, 'VALID UNTIL 01 01 2040', 290, 470, 22, '#4f6b73');
  stamp(ctx);
}

function drawBack(ctx) {
  ground(ctx, '#eef0e2', '#e2ecf5', 'rgba(90, 100, 40, 0.10)');

  label(ctx, 'ADDRESS', 40, 66, 17, '#5d6a4f');
  label(ctx, '12 EXAMPLE STREET', 40, 102, 29, '#1d2615', 700);
  label(ctx, 'SAMPLETOWN 00000', 40, 140, 29, '#1d2615', 700);

  // A two-dimensional code that encodes nothing: squares from a fixed sequence.
  let state = 42;
  const next = () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(640, 40, 176, 176);
  ctx.fillStyle = '#1d2615';
  for (let row = 0; row < 20; row += 1) {
    for (let col = 0; col < 20; col += 1) {
      const corner = (row < 6 && col < 6) || (row < 6 && col > 13) || (row > 13 && col < 6);
      if (corner ? (row % 5 === 0 || col % 5 === 0 || (row % 5 > 1 && col % 5 > 1 && row % 5 < 4 && col % 5 < 4)) : next() > 0.5) {
        ctx.fillRect(648 + col * 8, 48 + row * 8, 8, 8);
      }
    }
  }

  label(ctx, 'ISSUED 01 01 2030', 40, 210, 22, '#5d6a4f');

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillRect(0, 372, CARD_W, 168);
  ctx.font = '600 33px ui-monospace, Consolas, "Courier New", monospace';
  ctx.fillStyle = '#1d2615';
  ['IDXXXX00000000<<<<<<<<<<<<<<<<', '9001011M4001019XXX<<<<<<<<<<<0', 'SAMPLE<<ALEX<JORDAN<<<<<<<<<<<']
    .forEach((line, index) => ctx.fillText(line, 34, 420 + index * 44));
  stamp(ctx);
}

/**
 * Put the card on a desk, in perspective, and light the scene unevenly.
 *
 * Every pixel of the photograph is mapped back onto the card through the
 * homography from the four corners, four samples to a pixel so the card's edge
 * is smooth rather than stepped. Outside the card's rounded outline the desk
 * shows through.
 */
function photograph(card, { corners, lamp, seed }) {
  const width = 1400;
  const height = 1050;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  desk(ctx, width, height, seed);

  const quad = corners.map(([x, y]) => ({ x, y }));
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  quad.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  const toCard = homography(quad, [
    { x: 0, y: 0 }, { x: CARD_W, y: 0 }, { x: CARD_W, y: CARD_H }, { x: 0, y: CARD_H },
  ]);
  const source = card.getContext('2d').getImageData(0, 0, CARD_W, CARD_H).data;
  const photo = ctx.getImageData(0, 0, width, height);
  const out = photo.data;

  const xs = quad.map((point) => point.x);
  const ys = quad.map((point) => point.y);
  const left = Math.max(0, Math.floor(Math.min(...xs)) - 1);
  const right = Math.min(width, Math.ceil(Math.max(...xs)) + 1);
  const top = Math.max(0, Math.floor(Math.min(...ys)) - 1);
  const bottom = Math.min(height, Math.ceil(Math.max(...ys)) + 1);
  const offsets = [0.25, 0.75];

  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      let hits = 0;
      for (const oy of offsets) {
        for (const ox of offsets) {
          const at = project(toCard, x + ox, y + oy);
          if (!onCard(at.x, at.y)) continue;
          const i = (Math.min(CARD_H - 1, Math.floor(at.y)) * CARD_W + Math.min(CARD_W - 1, Math.floor(at.x))) * 4;
          r += source[i];
          g += source[i + 1];
          b += source[i + 2];
          hits += 1;
        }
      }
      if (!hits) continue;
      const p = (y * width + x) * 4;
      const cover = hits / 4;
      out[p] = out[p] * (1 - cover) + (r / hits) * cover;
      out[p + 1] = out[p + 1] * (1 - cover) + (g / hits) * cover;
      out[p + 2] = out[p + 2] * (1 - cover) + (b / hits) * cover;
    }
  }
  ctx.putImageData(photo, 0, 0);

  const light = ctx.createRadialGradient(
    width * lamp[0], height * lamp[1], 0, width * lamp[0], height * lamp[1], Math.max(width, height) * 1.1,
  );
  light.addColorStop(0, 'rgba(255, 247, 228, 0.22)');
  light.addColorStop(1, 'rgba(0, 0, 0, 0.26)');
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, width, height);
  return canvas;
}

function onCard(x, y) {
  if (x < 0 || y < 0 || x >= CARD_W || y >= CARD_H) return false;
  const cx = Math.min(Math.max(x, RADIUS), CARD_W - RADIUS);
  const cy = Math.min(Math.max(y, RADIUS), CARD_H - RADIUS);
  return Math.hypot(x - cx, y - cy) <= RADIUS;
}

/** A wooden desk: a warm gradient, a grain of long wavering lines, some noise. */
function desk(ctx, width, height, seed) {
  const wood = ctx.createLinearGradient(0, 0, width, height);
  wood.addColorStop(0, '#6b5038');
  wood.addColorStop(1, '#4a3626');
  ctx.fillStyle = wood;
  ctx.fillRect(0, 0, width, height);

  let state = seed;
  const next = () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
  ctx.lineWidth = 2;
  for (let i = 0; i < 70; i += 1) {
    const y0 = next() * height;
    ctx.strokeStyle = `rgba(${next() > 0.5 ? '30, 18, 8' : '140, 105, 72'}, ${0.12 + next() * 0.12})`;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 20) {
      const y = y0 + Math.sin(x / (120 + i * 3)) * 9 + x * 0.04;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
