import { backdrop, chip, clamp, hash, keyed, mix, nightSky, rgba, rounded, smooth, wrapLines, write } from './paint.js';

// Time as one true timeline: the bar is how long the count takes, and every flag on
// it is at its real distance from the start. The clock above it ticks at the rate
// chosen, because watching the first few seconds is what makes the far end land.

const SKY_TOP = [[0, [255, 241, 222]], [5, [255, 226, 196]], [8, [252, 204, 170]], [10.4, [214, 150, 124]], [12.5, [116, 84, 112]], [15, [50, 36, 86]], [18, [14, 11, 36]], [30, [5, 5, 18]]];
const SKY_LOW = [[0, [255, 250, 240]], [5, [255, 241, 222]], [8, [255, 226, 196]], [10.4, [240, 190, 150]], [12.5, [170, 120, 128]], [15, [84, 58, 112]], [18, [30, 22, 60]], [30, [10, 10, 30]]];
const TICK_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 21600, 43200, 86400, 172800, 604800, 2629800, 7889400, 15778800];
const YEAR = 31557600;

function tickStep(span) {
  const rough = span / 5;
  for (const step of TICK_STEPS) if (step >= rough) return step;
  const years = rough / YEAR;
  const power = 10 ** Math.floor(Math.log10(years));
  const unit = years / power;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power * YEAR;
}

export function createTimeScene() {
  function drawClock(ctx, cx, cy, radius, f, spin, dark) {
    const ink = rgba(mix([60, 44, 34], [236, 228, 244], dark));
    ctx.save();
    ctx.fillStyle = rgba(mix([255, 252, 246], [38, 30, 66], dark), 0.92);
    ctx.strokeStyle = ink;
    ctx.lineWidth = Math.max(2, radius * 0.05);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const angle = i * Math.PI / 6;
      const inner = i % 3 ? 0.84 : 0.76;
      ctx.lineWidth = i % 3 ? 1.5 : 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.sin(angle) * radius * inner, cy - Math.cos(angle) * radius * inner);
      ctx.lineTo(cx + Math.sin(angle) * radius * 0.92, cy - Math.cos(angle) * radius * 0.92);
      ctx.stroke();
    }
    const hand = (angle, length, width, colour) => {
      ctx.strokeStyle = colour;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(cx - Math.sin(angle) * radius * 0.08, cy + Math.cos(angle) * radius * 0.08);
      ctx.lineTo(cx + Math.sin(angle) * radius * length, cy - Math.cos(angle) * radius * length);
      ctx.stroke();
    };
    hand(spin / 43200 * Math.PI * 2, 0.5, Math.max(2.5, radius * 0.06), ink);
    hand(spin / 3600 * Math.PI * 2, 0.74, Math.max(2, radius * 0.04), ink);
    hand(spin / 60 * Math.PI * 2, 0.86, 1.4, '#d43f4a');
    ctx.fillStyle = '#d43f4a';
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2.5, radius * 0.05), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawOrbit(ctx, cx, cy, radius, f, years, dark) {
    ctx.save();
    ctx.strokeStyle = rgba(mix([120, 90, 70], [190, 180, 220], dark), 0.6);
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius, radius * 0.62, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 0.5);
    glow.addColorStop(0, 'rgba(255,214,120,.9)');
    glow.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.17, 0, Math.PI * 2);
    ctx.fill();
    const angle = years * Math.PI * 2;
    ctx.fillStyle = '#3f8fd8';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius * 0.62, Math.max(3.5, radius * 0.1), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Layers of rock for spans a clock and a calendar have no way to show.
  function drawStrata(ctx, f, y, alpha) {
    const { w, h } = f;
    if (alpha <= 0.01) return;
    const bands = [[176, 130, 92], [150, 104, 76], [122, 86, 72], [96, 74, 74], [74, 60, 76]];
    ctx.save();
    ctx.globalAlpha = alpha;
    const tall = (h - y) / bands.length;
    bands.forEach((colour, i) => {
      ctx.fillStyle = rgba(colour);
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, y + i * tall);
      for (let x = 0; x <= w + 32; x += 32) ctx.lineTo(x, y + i * tall + Math.sin(x * 0.012 + i) * 3 + (hash(Math.round(x / 32), i + 110) - 0.5) * 3);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  return {
    draw(ctx, f) {
      const { w, h, amount, rungs, words, previous, t, motion, zero, moving, perUnit } = f;
      const seconds = Math.max(amount, 1e-6);
      const logSeconds = Math.log10(Math.max(seconds, 1));
      const lowColour = keyed(SKY_LOW, logSeconds);
      // Read off the backdrop itself: the sky passes through mid-tones on its way
      // to night, where neither black nor white text can be taken for granted.
      const dark = 1 - smooth(118, 150, 0.3 * lowColour[0] + 0.59 * lowColour[1] + 0.11 * lowColour[2]);
      backdrop(ctx, w, h, keyed(SKY_TOP, logSeconds), lowColour);
      nightSky(ctx, w, h, smooth(14, 17, logSeconds), t, motion);
      const axis = Math.round(h * 0.68);
      drawStrata(ctx, f, axis + 46, smooth(10.4, 11.6, logSeconds) * 0.9);
      const left = Math.max(18, w * 0.05);
      const span = w - left * 2;
      // The bar stops short of the right edge so the next flag can be seen coming.
      const scale = span * 0.78 / seconds;

      const clockRadius = Math.min(h * 0.17, 66);
      const clockY = Math.max(h * 0.32, 66 + clockRadius);
      const clockX = w - clockRadius - 22;
      const elapsed = f.still ? 0 : t;
      if (logSeconds < 7.6) {
        // During a change the hands run ahead of real time, so a jump in the number
        // reads as time flying past; at rest they keep the true second.
        const spin = moving ? seconds + elapsed : elapsed;
        ctx.save();
        ctx.globalAlpha = 1 - smooth(7.1, 7.6, logSeconds);
        drawClock(ctx, clockX, clockY, clockRadius, f, spin, dark);
        ctx.restore();
      }
      if (logSeconds > 7.1 && logSeconds < 12) {
        ctx.save();
        ctx.globalAlpha = smooth(7.1, 7.6, logSeconds) * (1 - smooth(11.2, 12, logSeconds));
        drawOrbit(ctx, clockX, clockY, clockRadius, f, moving ? seconds / YEAR + elapsed * 0.1 : elapsed * 0.1, dark);
        ctx.restore();
      }

      const ink = rgba(mix([56, 38, 28], [240, 234, 250], dark));
      const inkSoft = rgba(mix([56, 38, 28], [240, 234, 250], dark), 0.6);
      const halo = rgba(mix([255, 250, 240], [10, 8, 28], dark), 0.82);

      // The axis and its ticks.
      ctx.strokeStyle = inkSoft;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(left, axis + 12);
      ctx.lineTo(w, axis + 12);
      ctx.stroke();
      const visible = (w - left) / scale;
      const step = tickStep(visible);
      ctx.lineWidth = 1;
      for (let value = step; value < visible; value += step) {
        const x = left + value * scale;
        ctx.beginPath();
        ctx.moveTo(x, axis + 12);
        ctx.lineTo(x, axis + 18);
        ctx.stroke();
        if (x - left > 36) write(ctx, words.duration(value), x, axis + 29, { size: 11, weight: 500, fill: ink, halo, align: 'center' });
      }

      if (!zero) {
        const big = Math.min(58, w * 0.075);
        write(ctx, words.long(seconds), left, Math.min(axis - 108, h * 0.42), { size: big, weight: 800, fill: ink, halo: null });
        // The bar, with the count itself running along it.
        const barW = seconds * scale;
        const bar = ctx.createLinearGradient(left, 0, left + barW, 0);
        bar.addColorStop(0, '#f2a93b');
        bar.addColorStop(1, '#e0456a');
        ctx.fillStyle = bar;
        rounded(ctx, left, axis - 12, Math.max(barW, 4), 24, 7);
        ctx.fill();
        ctx.save();
        rounded(ctx, left, axis - 12, Math.max(barW, 4), 24, 7);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,.34)';
        ctx.lineWidth = 2;
        const run = motion && !f.still ? (t * 42) % 26 : 0;
        for (let x = left - 26 + run; x < left + barW; x += 26) {
          ctx.beginPath();
          ctx.moveTo(x, axis + 12);
          ctx.lineTo(x + 14, axis - 12);
          ctx.stroke();
        }
        ctx.restore();

        // Flags at their true place, tall and short in turn so neighbours can both
        // be read. A flag too close to the start to tell apart waits until it is not.
        const flags = rungs.filter(rung => {
          const x = left + rung.size * scale;
          return x <= w - 6 && rung.size * scale > span * 0.045;
        });
        flags.forEach((rung, i) => {
          const x = left + rung.size * scale;
          const reached = rung.size <= seconds * (1 + 1e-12);
          const top = axis - 44 - (flags.length - i - 1) % 2 * 34;
          ctx.strokeStyle = ink;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, axis + 12);
          ctx.lineTo(x, top);
          ctx.stroke();
          ctx.fillStyle = reached ? '#2d8a66' : '#d43f4a';
          ctx.beginPath();
          ctx.moveTo(x, top);
          ctx.lineTo(x + 11, top + 4.5);
          ctx.lineTo(x, top + 9);
          ctx.closePath();
          ctx.fill();
          // Whichever side of the pole has more room, wrapped to fit it.
          const leftSide = x > w / 2;
          const lines = wrapLines(ctx, words.name(rung.id), leftSide ? x - 14 : w - x - 22, 11.5, 700);
          lines.forEach((line, n) => write(ctx, line, leftSide ? x - 6 : x + 14, top + 2 - (lines.length - 1 - n) * 13, { size: 11.5, weight: 700, fill: ink, halo, align: leftSide ? 'right' : 'left' }));
        });

        chip(ctx, words.top(seconds), Math.min(left + barW, w - 8), axis - 28 < 60 ? axis + 30 : axis, { size: 12, align: left + barW + 90 > w ? 'right' : 'left', fill: '#16202a', ink: '#ffffff', within: w });

        if (previous !== null && previous > 0 && Math.abs(previous - amount) > amount * 1e-6) {
          const x = Math.max(left + 2, left + previous * scale);
          if (x < w - 8) {
            ctx.strokeStyle = dark > 0.5 ? 'rgba(255,255,255,.85)' : 'rgba(16,24,34,.85)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 3]);
            ctx.beginPath();
            ctx.moveTo(x, axis - 18);
            ctx.lineTo(x, axis + 20);
            ctx.stroke();
            ctx.setLineDash([]);
            chip(ctx, words.before(previous), Math.max(x, left + 6), axis + 40 + 8, { size: 11, weight: 600, fill: dark > 0.5 ? 'rgba(16,24,34,.9)' : 'rgba(255,255,255,.94)', ink: dark > 0.5 ? '#ffffff' : '#16202a', stroke: dark > 0.5 ? 'rgba(255,255,255,.3)' : 'rgba(16,24,34,.3)', within: w });
          }
        }

        // The tally: how far a real count would have got since this picture opened.
        if (!f.still) {
          const counted = Math.floor(f.sinceOpened / perUnit);
          const fraction = clamp(f.sinceOpened / seconds);
          chip(ctx, words.tally(counted, fraction), 14, h - 20, { size: 12, weight: 600, fill: 'rgba(14,16,28,.82)', ink: '#ffffff', within: w });
        }
      }
      return { dark };
    }
  };
}
