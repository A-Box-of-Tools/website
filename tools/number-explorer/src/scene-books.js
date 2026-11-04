import { backdrop, chip, clamp, hash, keyed, mix, nebula, nightSky, paintEarth, paintGalaxy, rgba, rounded, scatter, smooth, widthOf, wrapLines, write } from './paint.js';

// A stack of books on one true ruler, from a single book on the floor to a line
// that crosses the observable universe. The camera is the whole animation: it pulls
// back to keep the top of the stack in view, and everything else is drawn at its
// real size for that zoom, so landmarks shrink past on their own.

const BOOK_WIDTH_M = 0.15;
const EARTH_RADIUS_M = 6371000;
const LIGHT_YEAR_M = 9.4607e15;
// Where the solar system sits in the Milky Way, as a share of the way out from the
// centre, so the stack rises from the right place in the galaxy it passes through.
const SUN_IN_GALAXY = 0.52;

const SKY_TOP = [[-0.6, [247, 240, 228]], [0.3, [244, 236, 220]], [1.1, [176, 221, 246]], [3, [112, 186, 236]], [4.2, [48, 116, 188]], [4.9, [13, 36, 82]], [5.6, [5, 10, 26]], [9, [3, 5, 14]]];
const SKY_LOW = [[-0.6, [238, 229, 211]], [0.3, [234, 223, 202]], [1.1, [228, 244, 251]], [3, [208, 236, 250]], [4.2, [142, 198, 234]], [4.9, [36, 86, 150]], [5.6, [9, 18, 42]], [9, [4, 7, 18]]];
const COVERS = [[148, 52, 48], [29, 88, 124], [204, 146, 44], [46, 106, 84], [94, 62, 134], [24, 54, 96], [182, 86, 40], [122, 42, 84], [58, 122, 134], [172, 150, 96]];

// Each drawn in a box 100 by 100 and stretched to the landmark's true height and a
// believable width, so an arc here looks round only after that stretch.
const OUTLINES = {
  table: { aspect: 1.5, d: 'M0 0H100V7H0ZM7 7H14V100H7ZM86 7H93V100H86Z' },
  person: { aspect: 0.34, d: 'M50 0A28 10 0 1 1 50 20A28 10 0 1 1 50 0ZM18 23H82Q96 23 97 33L100 58Q100 62 93 62Q87 62 86 58L80 38V62L84 100H58L50 66L42 100H16L20 62V38L14 58Q13 62 7 62Q0 62 0 58L3 33Q4 23 18 23Z' },
  house: { aspect: 1.05, d: 'M50 0L100 44H89V100H11V44H0ZM42 100V68H58V100ZM22 60V46H36V60ZM64 60V46H78V60Z', rule: 'evenodd' },
  liberty: { aspect: 0.42, d: 'M14 100L20 86H80L86 100ZM28 86L34 52H66L72 86ZM36 52L40 24Q50 18 60 24L64 52ZM41 16A9 4 0 1 1 59 16A9 4 0 1 1 41 16ZM44 12L42 8L47 11L50 6L53 11L58 8L56 12ZM58 26L70 8L75 9L64 30ZM68 8H78L76 4H70ZM73 4Q69 1 73 0Q77 1 73 4Z' },
  eiffel: { aspect: 0.42, d: 'M49 0H51L52 14L55 34L59 50L80 100H62Q50 74 38 100H20L41 50L45 34L48 14ZM43 33H57V36H43ZM36 50H64V54H36ZM47 13H53V15H47Z' },
  burj: { aspect: 0.2, d: 'M49 0H51L52 18H56L57 38H62L63 58H70L71 78H80L84 100H16L20 78H29L30 58H37L38 38H43L44 18H48Z' },
  everest: { aspect: 2.6, d: 'M0 100L14 70L22 76L36 44L44 52L56 0L66 30L72 24L84 58L90 54L100 100Z', snow: 'M50 26L56 0L66 30L61 27L58 34L54 27Z' }
};
const AIRLINER = 'M100 50L60 44L40 8H30L40 44L12 42L4 28H0L3 50L0 72H4L12 58L40 56L30 92H40L60 56Z';

const paths = new Map();
function pathOf(d) {
  if (!paths.has(d)) paths.set(d, new Path2D(d));
  return paths.get(d);
}

function drawBook(ctx, x, y, width, thick, i) {
  const cover = COVERS[Math.floor(hash(i, 3) * COVERS.length)];
  ctx.fillStyle = rgba(cover);
  if (thick >= 5) {
    rounded(ctx, x, y, width, thick, Math.min(3, thick * 0.18));
    ctx.fill();
  } else {
    ctx.fillRect(x, y, width, thick);
  }
  if (thick >= 5) {
    ctx.fillStyle = 'rgba(0,0,0,.16)';
    ctx.fillRect(x, y + thick - Math.max(1, thick * 0.1), width, Math.max(1, thick * 0.1));
    ctx.fillStyle = 'rgba(255,255,255,.1)';
    ctx.fillRect(x, y, width, Math.max(1, thick * 0.09));
  }
  if (thick >= 9) {
    ctx.fillStyle = 'rgba(255,240,205,.82)';
    const label = width * (0.22 + hash(i, 6) * 0.2);
    rounded(ctx, x + width * (0.34 + hash(i, 7) * 0.2), y + thick * 0.32, label, thick * 0.36, 2);
    ctx.fill();
  }
  if (thick >= 14) {
    ctx.fillStyle = 'rgba(255,214,130,.6)';
    ctx.fillRect(x + width * 0.09, y, Math.max(1.5, width * 0.012), thick);
    ctx.fillRect(x + width * 0.91, y, Math.max(1.5, width * 0.012), thick);
  }
}

// Nice steps for the ruler: one, two or five of a power of ten, in whichever unit
// the ruler is written in, since a round number of meters is not a round number of
// light-years.
function rulerStep(span) {
  const unit = span >= LIGHT_YEAR_M * 0.4 ? LIGHT_YEAR_M : 1;
  const rough = span / unit / 4;
  const power = 10 ** Math.floor(Math.log10(rough));
  const lead = rough / power;
  return (lead < 1.6 ? 1 : lead < 3.6 ? 2 : 5) * power * unit;
}

export function createBooksScene() {
  const falling = [];
  let settledBooks = 0;

  function drawOverview(ctx, f, scale, view, base, stackX, stackRight, taken) {
    const { w, h, t, rungs } = f;
    const inkDark = smooth(4.2, 4.9, view);
    const lineInk = mix([48, 62, 78], [224, 233, 245], inkDark);
    const iconX = Math.min(w - 26, Math.max(stackRight + 56, w * 0.64));
    const labels = [];

    // Far things are drawn first, at true size, so the stack crosses in front of them.
    for (const rung of rungs) {
      if (rung.standing) continue;
      const lift = rung.size * scale;
      const y = base - lift;
      const alpha = smooth(h * 0.025, h * 0.08, lift) * smooth(h * 0.015, h * 0.09, y);
      drawFar(ctx, rung, f, scale, base, iconX, stackX);
      if (alpha <= 0.01) continue;
      if (taken.some(box => iconX + 14 > box.left && iconX - 14 < box.right && y + 14 > box.top && y - 14 < box.bottom)) continue;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = rgba(lineInk, 0.36);
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.moveTo(stackRight + 4, y);
      ctx.lineTo(iconX, y);
      ctx.stroke();
      ctx.setLineDash([]);
      drawIcon(ctx, rung, iconX, y, scale, t);
      ctx.restore();
      labels.push({ y, alpha, size: rung.size, id: rung.id });
    }

    return { labels, iconX };
  }

  // Written after everything standing on the ground, because a mountain's name has
  // first claim on the sky above it: the mountain is what the picture is showing there.
  function writeOverviewLabels(ctx, f, view, { labels, iconX }, taken) {
    const { w, rungs, words } = f;
    const inkDark = smooth(4.2, 4.9, view);
    // Largest first, so when two labels want one line the one nearer the top of
    // the stack, the next thing to be reached, is the one that keeps it.
    labels.sort((a, b) => b.size - a.size);
    const kept = [];
    const rightSide = iconX < w * 0.7;
    const x = rightSide ? iconX + 16 : iconX - 16;
    const align = rightSide ? 'left' : 'right';
    const room = rightSide ? w - x - 8 : x - 8;
    const fill = rgba(mix([24, 34, 46], [240, 245, 252], inkDark));
    const halo = rgba(mix([255, 255, 255], [4, 8, 20], inkDark), 0.78);
    for (const label of labels) {
      const lines = wrapLines(ctx, words.name(label.id), room, 12, 700);
      const tall = 32 + (lines.length - 1) * 14;
      if (kept.some(other => Math.abs(other.y - label.y) < Math.max(tall, other.tall))) continue;
      const wide = Math.max(...lines.map(line => widthOf(ctx, line, 12, 700)));
      const left = rightSide ? x : x - wide;
      const top = label.y - 14 - (lines.length - 1) * 14;
      if (taken.some(box => left < box.right && left + wide > box.left && top < box.bottom && label.y + 16 > box.top)) continue;
      kept.push({ y: label.y, tall });
      lines.forEach((line, i) => write(ctx, line, x, label.y - 7 - (lines.length - 1 - i) * 14, { size: 12, weight: 700, fill, halo, align, alpha: label.alpha }));
      write(ctx, words.length(rungs.find(r => r.id === label.id).size, 4), x, label.y + 8, { size: 11, weight: 500, fill, halo, align, alpha: label.alpha * 0.86 });
    }
  }

  // The three things big enough to be drawn at their true size at deep zoom. Each
  // stands where it really is relative to the foot of the stack, and leaves the
  // frame once it would be too close to read as a shape at all.
  function drawFar(ctx, rung, f, scale, base, iconX, stackX) {
    const { h, t, motion } = f;
    const turn = motion ? t * 0.015 : 0.4;
    if (rung.id === 'milkyway') {
      const radius = rung.size / 2 * scale;
      paintGalaxy(ctx, stackX + radius * SUN_IN_GALAXY, base, radius, { turn, tilt: 0.5, alpha: smooth(2, 12, radius) * (1 - smooth(h * 1.5, h * 2.6, radius)) * 0.8 });
    } else if (rung.id === 'andromeda') {
      const radius = 110000 * LIGHT_YEAR_M * scale;
      paintGalaxy(ctx, iconX, base - rung.size * scale, Math.max(radius, 2.5), { turn: turn + 1, tilt: 0.42, alpha: smooth(h * 0.05, h * 0.16, rung.size * scale) * (1 - smooth(h * 0.75, h * 1.1, radius)) });
    } else if (rung.id === 'edge') {
      // The observable universe is centred on whoever is observing, so its edge is
      // a circle around the foot of the stack, and the stack is a radius of it.
      const radius = rung.size * scale;
      const alpha = smooth(1.5, 7, radius) * (1 - smooth(h * 1.3, h * 2.2, radius));
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = 'rgba(168,190,255,.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.arc(stackX, base, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(180,200,255,.5)';
      for (let i = 0; radius > 24 && i < 420; i++) {
        const [a, b] = scatter(i);
        const distance = Math.sqrt(a) * radius;
        const angle = b * Math.PI * 2;
        ctx.fillRect(stackX + Math.cos(angle) * distance, base + Math.sin(angle) * distance, 1.2, 1.2);
      }
      ctx.restore();
    }
  }

  function drawIcon(ctx, rung, x, y, scale, t) {
    switch (rung.id) {
      case 'airliner':
        ctx.save();
        ctx.translate(x - 14, y - 14);
        ctx.scale(0.28, 0.28);
        ctx.fillStyle = '#f4f7fb';
        ctx.strokeStyle = 'rgba(20,40,60,.65)';
        ctx.lineWidth = 3;
        ctx.stroke(pathOf(AIRLINER));
        ctx.fill(pathOf(AIRLINER));
        ctx.restore();
        break;
      case 'iss':
        ctx.fillStyle = '#d7dfea';
        ctx.fillRect(x - 13, y - 1, 26, 2);
        ctx.fillRect(x - 3, y - 3.5, 6, 7);
        ctx.fillStyle = '#3f6fb4';
        for (const dx of [-13, -8, 5, 10]) {
          ctx.fillRect(x + dx, y - 8, 3.5, 7);
          ctx.fillRect(x + dx, y + 1, 3.5, 7);
        }
        break;
      case 'moon': {
        const radius = Math.max(4.5, 1738100 * scale);
        ctx.fillStyle = '#cfd3da';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(120,126,140,.55)';
        for (const [a, b, c] of [[-0.3, -0.25, 0.22], [0.3, 0.1, 0.16], [-0.1, 0.4, 0.12]]) {
          ctx.beginPath();
          ctx.arc(x + a * radius, y + b * radius, c * radius, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
      case 'sun': {
        const radius = Math.max(7, 696000000 * scale);
        const glow = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 4);
        glow.addColorStop(0, 'rgba(255,214,120,.95)');
        glow.addColorStop(1, 'rgba(255,170,60,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffe9a8';
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'neptune':
        ctx.fillStyle = '#4b7fe0';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'mars':
        ctx.fillStyle = '#d0623a';
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'voyager':
        ctx.fillStyle = '#d7dfea';
        ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        ctx.beginPath();
        ctx.ellipse(x, y - 4, 6, 2.2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 10, y - 0.5, 20, 1);
        break;
      case 'orion': {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 12);
        glow.addColorStop(0, 'rgba(255,150,190,.95)');
        glow.addColorStop(1, 'rgba(150,120,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 12, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'virgo':
        ctx.fillStyle = '#e8edff';
        for (let i = 0; i < 14; i++) ctx.fillRect(x + (hash(i, 37) - 0.5) * 20, y + (hash(i, 38) - 0.5) * 12, 1.6, 1.6);
        break;
      case 'quasar': {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 9);
        glow.addColorStop(0, 'rgba(255,255,255,1)');
        glow.addColorStop(1, 'rgba(120,180,255,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(x - 0.5, y - 15, 1, 30);
        break;
      }
      case 'proxima':
      case 'lightyear': {
        ctx.fillStyle = rung.id === 'proxima' ? '#ff9a7a' : '#e6ecff';
        const pulse = 3 + Math.sin(t * 2) * 0.4;
        ctx.beginPath();
        ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'congress':
      case 'everybook':
        ctx.fillStyle = rung.id === 'congress' ? '#d98a3a' : '#c4543f';
        rounded(ctx, x - 7, y - 5, 14, 10, 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        ctx.fillRect(x - 1, y - 5, 2, 10);
        break;
      default:
        ctx.fillStyle = '#e6ecff';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
  }

  function drawGround(ctx, f, scale, view, base, stackX) {
    const { w, h } = f;
    const radius = EARTH_RADIUS_M * scale;
    if (radius < 30000) {
      const centre = stackX;
      // The surface close up and the globe from afar hand over gradually, so the
      // ground does not change colour at one particular zoom.
      const close = smooth(1500, 3200, radius);
      if (close < 1) paintEarth(ctx, centre, base + radius, radius, 1 - close);
      if (close > 0) {
        ctx.save();
        ctx.globalAlpha = close;
        const land = ctx.createLinearGradient(0, base, 0, base + h * 0.2);
        land.addColorStop(0, '#4f8f6a');
        land.addColorStop(1, '#1e5583');
        ctx.fillStyle = land;
        ctx.beginPath();
        ctx.arc(centre, base + radius, radius, 0, Math.PI * 2);
        ctx.fill();
        const haze = ctx.createRadialGradient(centre, base + radius, radius * 0.995, centre, base + radius, radius + 22);
        haze.addColorStop(0, 'rgba(150,210,255,.6)');
        haze.addColorStop(1, 'rgba(150,210,255,0)');
        ctx.fillStyle = haze;
        ctx.beginPath();
        ctx.arc(centre, base + radius, radius + 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      return;
    }
    const outdoor = smooth(0.46, 1.05, view);
    const top = mix([172, 124, 80], [120, 170, 96], outdoor);
    const low = mix([140, 96, 58], [80, 134, 74], outdoor);
    const ground = ctx.createLinearGradient(0, base, 0, h);
    ground.addColorStop(0, rgba(top));
    ground.addColorStop(1, rgba(low));
    ctx.fillStyle = ground;
    ctx.fillRect(0, base, w, h - base);
    if (outdoor < 0.99) {
      ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - outdoor)})`;
      ctx.fillRect(0, base - 7, w, 7);
      ctx.fillStyle = `rgba(90,60,30,${0.16 * (1 - outdoor)})`;
      for (let x = 0; x < w; x += 58) ctx.fillRect(x + 20, base, 1.5, h - base);
    }
  }

  function drawClouds(ctx, f, scale, view, base) {
    const alpha = smooth(2.2, 2.9, view) * (1 - smooth(4.2, 4.7, view));
    if (alpha <= 0.01) return;
    ctx.save();
    ctx.fillStyle = `rgba(255,255,255,${0.75 * alpha})`;
    for (let i = 0; i < 7; i++) {
      const altitude = 900 + hash(i, 31) * 7000;
      const y = base - altitude * scale;
      const x = (hash(i, 32) * 1.1 + (f.motion ? f.t * 0.004 : 0)) % 1.1 * f.w;
      const size = clamp((300 + hash(i, 33) * 600) * scale, 8, 120);
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.ellipse(x + (j - 1.5) * size * 0.8, y + Math.sin(j * 2) * size * 0.14, size * (0.7 + hash(j + i, 34) * 0.4), size * 0.28, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Where each landmark on the ground stands this frame and where its name goes,
  // worked out first because everything in the sky has to keep clear of those names.
  function placeStanding(ctx, f, scale, base, stackRight) {
    const { w, h, rungs, words } = f;
    const slots = [0.62, 0.8, 0.71];
    const room = w - stackRight;
    const placed = [];
    rungs.filter(rung => rung.standing).forEach((rung, i) => {
      const tall = rung.size * scale;
      const alpha = smooth(h * 0.04, h * 0.11, tall) * (1 - smooth(h * 0.86, h * 1.14, tall));
      if (alpha <= 0.01) return;
      const wide = tall * OUTLINES[rung.id].aspect;
      const x = Math.max(stackRight + Math.min(wide / 2 + 12, room * 0.5), stackRight + room * (slots[i % 3] - 0.3) / 0.7);
      const labelX = clamp(x, 80, w - 80);
      const labelY = clamp(base - tall - 22, 20, h - 30);
      const half = widthOf(ctx, words.name(rung.id), 12, 700) / 2;
      placed.push({ rung, x, tall, wide, alpha, labelX, labelY, box: { left: labelX - half - 4, right: labelX + half + 4, top: labelY - 9, bottom: labelY + 22 } });
    });
    return placed;
  }

  function drawStanding(ctx, f, scale, view, base, placed) {
    const { words } = f;
    const shade = mix([44, 60, 76], [140, 166, 190], smooth(3.8, 4.8, view));
    for (const { rung, x, tall, wide, alpha } of placed) {
      const shape = OUTLINES[rung.id];
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x - wide / 2, base - tall);
      ctx.scale(wide / 100, tall / 100);
      ctx.fillStyle = rgba(shade);
      ctx.fill(pathOf(shape.d), shape.rule || 'nonzero');
      if (shape.snow) {
        ctx.fillStyle = 'rgba(246,249,252,.95)';
        ctx.fill(pathOf(shape.snow));
      }
      ctx.restore();
    }
    const dark = view > 4.4;
    const fill = dark ? '#eef3fa' : '#1c2733';
    const halo = dark ? 'rgba(4,8,20,.8)' : 'rgba(255,255,255,.85)';
    for (const { rung, alpha, labelX, labelY } of placed) {
      write(ctx, words.name(rung.id), labelX, labelY, { size: 12, weight: 700, fill, halo, align: 'center', alpha });
      write(ctx, words.length(rung.size, 4), labelX, labelY + 14, { size: 11, weight: 500, fill, halo, align: 'center', alpha: alpha * 0.86 });
    }
  }

  function drawRuler(ctx, f, scale, view, base) {
    const metres = (base - 30) / scale;
    const step = rulerStep(metres);
    const dark = smooth(4.2, 4.9, view);
    const ink = mix([40, 54, 68], [214, 224, 238], dark);
    const halo = rgba(mix([255, 255, 255], [4, 8, 20], dark), 0.72);
    ctx.save();
    ctx.strokeStyle = rgba(ink, 0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10.5, base);
    ctx.lineTo(10.5, 96);
    ctx.stroke();
    for (let value = step; value * scale < base - 96; value += step) {
      const y = Math.round(base - value * scale) + 0.5;
      ctx.beginPath();
      ctx.moveTo(10.5, y);
      ctx.lineTo(17, y);
      ctx.stroke();
      write(ctx, f.words.length(value, 3), 21, y, { size: 11, weight: 500, fill: rgba(ink), halo });
    }
    ctx.restore();
  }

  function drawStack(ctx, f, scale, view, base, stackX, stackWidth) {
    const { amount, thickness, dt, motion, still } = f;
    const thick = thickness * scale;
    const books = amount / thickness;
    const whole = Math.floor(books + 1e-9);
    if (view > 4.6) {
      const glow = smooth(4.6, 5.6, view);
      ctx.fillStyle = `rgba(255,214,150,${0.22 * glow})`;
      ctx.fillRect(stackX - 5, base - amount * scale, stackWidth + 10, amount * scale);
    }
    if (thick >= 2.4) {
      if (motion && !still && whole > settledBooks && whole < 400) {
        for (let i = Math.max(settledBooks, whole - 40); i < whole; i++) falling.push({ i, age: 0 });
      }
      settledBooks = whole;
      const fallingNow = new Set(falling.map(item => item.i));
      for (let i = 0; i < whole; i++) {
        if (fallingNow.has(i)) continue;
        const jitter = hash(i, 2);
        const width = stackWidth * (0.86 + 0.14 * hash(i, 1));
        drawBook(ctx, stackX + (stackWidth - width) * jitter, base - (i + 1) * thick, width, Math.max(1.4, thick - (thick > 6 ? 0.6 : 0)), i);
      }
      for (let n = falling.length - 1; n >= 0; n--) {
        const item = falling[n];
        item.age += dt / 0.34;
        if (item.age >= 1 || item.i >= whole) {
          falling.splice(n, 1);
          continue;
        }
        const drop = (1 - item.age) ** 2 * f.h * 0.45;
        const width = stackWidth * (0.86 + 0.14 * hash(item.i, 1));
        ctx.save();
        ctx.globalAlpha = clamp(item.age * 2.5);
        drawBook(ctx, stackX + (stackWidth - width) * hash(item.i, 2), base - (item.i + 1) * thick - drop, width, Math.max(1.4, thick - 0.6), item.i);
        ctx.restore();
      }
      const part = books - whole;
      if (!f.moving && part > 0.0005 && books < 40) {
        // A share of a book, which only words or tokens can ask for, is shown as a
        // slice of a book's true thickness against an outline of the whole one.
        const y = base - whole * thick;
        ctx.strokeStyle = 'rgba(60,70,80,.55)';
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(stackX + 0.5, y - thick + 0.5, stackWidth - 1, thick - 1);
        ctx.setLineDash([]);
        const slice = Math.max(1.2, thick * part);
        ctx.fillStyle = rgba(COVERS[0]);
        ctx.fillRect(stackX, y - slice, stackWidth, slice);
      }
      return;
    }
    settledBooks = whole;
    falling.length = 0;
    // Too thin to draw one by one, so the stack becomes bands of books. The band
    // width passes through a crossfade rather than snapping at each power of ten.
    const needed = Math.log10(5 / thick);
    const power = Math.ceil(needed);
    const fade = smooth(0.55, 1, needed - power + 1);
    // The coarser bands go under at full strength, so the crossfade never lets a
    // mountain show through the books.
    drawBands(ctx, base, stackX, stackWidth, thick * 10 ** (power + 1), amount * scale, power + 1, 1);
    if (fade < 0.99) drawBands(ctx, base, stackX, stackWidth, thick * 10 ** power, amount * scale, power, 1 - fade);
  }

  function drawBands(ctx, base, x, width, band, tall, salt, alpha) {
    const count = Math.ceil(tall / band);
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let i = 0; i < count; i++) {
      const y = base - (i + 1) * band;
      const top = Math.max(base - tall, y);
      ctx.fillStyle = rgba(COVERS[Math.floor(hash(i, salt + 50) * COVERS.length)]);
      ctx.fillRect(x, top, width, base - i * band - top + 0.6);
    }
    ctx.restore();
  }

  return {
    draw(ctx, f) {
      const { w, h, amount, words, previous, zero } = f;
      const base = Math.round(h * 0.9);
      // The top of the stack stays clear of the readout in the corner, which takes
      // a larger share of the height the shorter the stage is.
      const room = base - Math.max(h * 0.2, 100);
      // One book on the floor is as close as the camera goes: the first eleven
      // books build up in front of it before it has to pull back at all.
      const scale = room / Math.max(amount, 0.34);
      const view = Math.log10(h / scale);
      backdrop(ctx, w, h, keyed(SKY_TOP, view), keyed(SKY_LOW, view));
      nightSky(ctx, w, h, smooth(4.4, 5.5, view), f.t, f.motion);
      nebula(ctx, w, h, smooth(6, 8, view));
      const stackX = Math.round(Math.max(w * 0.3, 124));
      const stackWidth = Math.max(16, BOOK_WIDTH_M * scale);
      const stackRight = stackX + stackWidth;
      const placed = placeStanding(ctx, f, scale, base, stackRight);
      const taken = placed.filter(item => item.alpha > 0.35).map(item => item.box);
      const overview = drawOverview(ctx, f, scale, view, base, stackX, stackRight, taken);
      drawClouds(ctx, f, scale, view, base);
      drawStanding(ctx, f, scale, view, base, placed);
      drawGround(ctx, f, scale, view, base, stackX + stackWidth / 2);
      writeOverviewLabels(ctx, f, view, overview, taken);
      drawRuler(ctx, f, scale, view, base);
      if (!zero) {
        drawStack(ctx, f, scale, view, base, stackX, stackWidth);
        // Small enough to hide behind the stack, the observable universe is drawn in
        // front of it: a ring that size at the foot of a stack is the point of the page.
        const universe = f.rungs.find(rung => rung.id === 'edge').size * scale;
        if (universe > 1.5 && universe < 40) {
          ctx.strokeStyle = '#ffd98a';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(stackX + stackWidth / 2, base, Math.max(universe, 3), 0, Math.PI * 2);
          ctx.stroke();
        }
        // Whatever the stack has outgrown has shrunk to nothing at its foot, and how
        // far it has been left behind is the whole of the magnification.
        const passed = f.rungs.filter(rung => rung.size <= amount).pop();
        if (passed && passed.size * scale < h * 0.06 && amount > passed.size * 1.05) {
          const dim = view < 4.4;
          chip(ctx, words.passed(passed.id, amount / passed.size), stackRight + 10, base - 13, { size: 11, weight: 600, fill: dim ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.12)', ink: dim ? '#16202a' : '#f5f8fd', stroke: dim ? 'rgba(16,24,34,.2)' : 'rgba(255,255,255,.22)', within: w, room: w - stackRight - 16 });
        }
        const top = base - amount * scale;
        const pale = view < 4.4;
        chip(ctx, words.top(amount), stackRight + 8, top - 2, { size: 12, fill: pale ? '#16202a' : '#ffffff', ink: pale ? '#ffffff' : '#10161e', within: w });
        if (previous !== null && previous > 0 && Math.abs(previous - amount) > amount * 1e-6) {
          const y = Math.min(base - 3, base - previous * scale);
          ctx.save();
          ctx.strokeStyle = pale ? 'rgba(16,24,34,.85)' : 'rgba(255,255,255,.85)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(stackX - 12, y);
          ctx.lineTo(stackRight + 6, y);
          ctx.stroke();
          ctx.restore();
          chip(ctx, words.before(previous), stackX - 14, Math.min(y, base - 14), { size: 11, weight: 600, align: 'right', fill: pale ? 'rgba(255,255,255,.92)' : 'rgba(16,24,34,.88)', ink: pale ? '#16202a' : '#ffffff', stroke: pale ? 'rgba(16,24,34,.3)' : 'rgba(255,255,255,.3)', within: w, room: stackX - 20 });
        }
      }
      return { dark: smooth(4.2, 4.9, view) };
    }
  };
}
