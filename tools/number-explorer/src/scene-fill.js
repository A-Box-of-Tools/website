import { CONTAINERS, containerIndex, levelForShare } from './containers.js';
import { backdrop, chip, chipBox, clamp, hash, lerp, meets, mix, nightSky, paintEarth, rgba, scatter, smooth, widthOf, write } from './paint.js';

// Water or sand pouring into one named container after another. When a container
// overflows the camera pulls back to the next one and the old one shrinks into the
// corner, full, so the step up in size is the thing a visitor sees.

const MATERIALS = {
  water: { top: [96, 205, 245], low: [10, 86, 168], line: [205, 242, 255], dark: [8, 62, 128] },
  sand: { top: [236, 200, 128], low: [176, 124, 58], line: [250, 230, 178], dark: [130, 88, 38] }
};

const SCENERY = {
  indoor: { top: [240, 247, 251], low: [220, 235, 244], ground: [201, 186, 162], shell: [44, 74, 98], dark: 0 },
  outdoor: { top: [166, 221, 247], low: [232, 247, 252], ground: [140, 182, 118], shell: [44, 74, 98], dark: 0 },
  sea: { top: [160, 214, 241], low: [226, 244, 250], ground: [86, 158, 196], shell: [44, 66, 84], dark: 0 },
  desert: { top: [248, 222, 172], low: [253, 240, 214], ground: [222, 186, 128], shell: [120, 88, 50], dark: 0 },
  alpine: { top: [174, 212, 238], low: [234, 243, 250], ground: [150, 170, 150], shell: [66, 84, 100], dark: 0 },
  lake: { top: [176, 208, 222], low: [228, 238, 240], ground: [92, 128, 96], shell: [52, 78, 64], dark: 0 },
  space: { top: [5, 9, 20], low: [11, 18, 38], ground: [11, 18, 38], shell: [160, 184, 214], dark: 1 }
};

const SCENERY_OF = { spoon: 'indoor', cup: 'indoor', bucket: 'indoor', bath: 'indoor', room: 'indoor', pool: 'outdoor', tanker: 'sea', pyramid: 'desert', mountain: 'alpine', loch: 'lake', superior: 'lake', water: 'space', moon: 'space', earth: 'space', neptune: 'space' };

const point = (box, x, y) => [box.x + x * box.w, box.y + y * box.h];

function trace(ctx, box, polygon) {
  ctx.beginPath();
  polygon.forEach(([x, y], i) => {
    const [px, py] = point(box, x, y);
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  });
  ctx.closePath();
}

function line(ctx, box, points, width, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach(([x, y], i) => {
    const [px, py] = point(box, x, y);
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  });
  ctx.stroke();
}

function fillShape(ctx, box, points, colour) {
  trace(ctx, box, points);
  ctx.fillStyle = colour;
  ctx.fill();
}

// What stands behind the water.
function behind(ctx, id, box, shell) {
  const stroke = rgba(shell);
  switch (id) {
    case 'room': {
      ctx.fillStyle = '#fbf6ec';
      ctx.fillRect(box.x, box.y, box.w, box.h);
      fillShape(ctx, box, [[0.08, 0.18], [0.3, 0.18], [0.3, 0.62], [0.08, 0.62]], '#bfe2f6');
      line(ctx, box, [[0.19, 0.18], [0.19, 0.62]], 2, 'rgba(255,255,255,.9)');
      line(ctx, box, [[0.08, 0.4], [0.3, 0.4]], 2, 'rgba(255,255,255,.9)');
      fillShape(ctx, box, [[0.74, 0.22], [0.9, 0.22], [0.9, 1], [0.74, 1]], '#c29a6c');
      ctx.fillStyle = '#6a4c2b';
      ctx.beginPath();
      ctx.arc(box.x + 0.86 * box.w, box.y + 0.62 * box.h, Math.max(1.5, box.h * 0.016), 0, Math.PI * 2);
      ctx.fill();
      line(ctx, box, [[0.5, 0], [0.5, 0.1]], 2, stroke);
      fillShape(ctx, box, [[0.46, 0.1], [0.54, 0.1], [0.57, 0.17], [0.43, 0.17]], '#ffd98a');
      break;
    }
    case 'pool': {
      ctx.fillStyle = '#d9eef6';
      trace(ctx, box, CONTAINERS.pool.inside);
      ctx.fill();
      ctx.save();
      trace(ctx, box, CONTAINERS.pool.inside);
      ctx.clip();
      ctx.strokeStyle = 'rgba(70,130,170,.22)';
      ctx.lineWidth = 1;
      const tile = Math.max(8, box.h * 0.07);
      for (let x = box.x; x < box.x + box.w; x += tile) {
        ctx.beginPath();
        ctx.moveTo(x, box.y);
        ctx.lineTo(x, box.y + box.h);
        ctx.stroke();
      }
      for (let y = box.y; y < box.y + box.h; y += tile) {
        ctx.beginPath();
        ctx.moveTo(box.x, y);
        ctx.lineTo(box.x + box.w, y);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case 'tanker': {
      fillShape(ctx, box, [[0.76, 0.3], [0.76, 0.08], [0.9, 0.08], [0.9, 0.3]], '#f1f3f5');
      fillShape(ctx, box, [[0.79, 0.08], [0.79, 0], [0.85, 0], [0.85, 0.08]], '#b6423a');
      line(ctx, box, [[0.78, 0.17], [0.88, 0.17]], Math.max(1.5, box.h * 0.025), 'rgba(40,70,100,.7)');
      trace(ctx, box, CONTAINERS.tanker.inside);
      ctx.fillStyle = '#334a5e';
      ctx.fill();
      break;
    }
    case 'pyramid': {
      trace(ctx, box, CONTAINERS.pyramid.inside);
      ctx.fillStyle = '#e2c084';
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(120,86,40,.3)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 11; i++) {
        const y = box.y + box.h * i / 11;
        ctx.beginPath();
        ctx.moveTo(box.x, y);
        ctx.lineTo(box.x + box.w, y);
        ctx.stroke();
      }
      ctx.restore();
      break;
    }
    case 'mountain': {
      trace(ctx, box, CONTAINERS.mountain.inside);
      ctx.fillStyle = '#7f92a3';
      ctx.fill();
      break;
    }
    case 'loch':
    case 'superior': {
      // The land runs on past the frame on both sides. In the corner inset the
      // clip set by the caller is what stops it crossing the whole picture.
      const shape = CONTAINERS[id].inside;
      trace(ctx, box, [[-6, shape[0][1]], ...shape, [7, shape[shape.length - 1][1]], [7, 6], [-6, 6]]);
      ctx.fillStyle = '#566f5c';
      ctx.fill();
      break;
    }
    case 'water': {
      ctx.fillStyle = 'rgba(120,170,220,.12)';
      trace(ctx, box, CONTAINERS.water.inside);
      ctx.fill();
      break;
    }
    case 'moon': {
      trace(ctx, box, CONTAINERS.moon.inside);
      ctx.fillStyle = '#b9bdc6';
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = 'rgba(112,118,132,.55)';
      for (let i = 0; i < 9; i++) {
        const [a, b] = scatter(i + 3);
        ctx.beginPath();
        ctx.arc(box.x + a * box.w, box.y + b * box.h, box.w * (0.03 + hash(i, 41) * 0.07), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }
    case 'earth':
      paintEarth(ctx, box.x + box.w / 2, box.y + box.h / 2, box.w / 2);
      break;
    case 'neptune': {
      trace(ctx, box, CONTAINERS.neptune.inside);
      const blue = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
      blue.addColorStop(0, '#6f9cec');
      blue.addColorStop(0.5, '#3e6ad0');
      blue.addColorStop(1, '#2b4ca4');
      ctx.fillStyle = blue;
      ctx.fill();
      break;
    }
    default:
      if (id === 'spoon' || id === 'cup' || id === 'bucket' || id === 'bath') {
        trace(ctx, box, CONTAINERS[id].inside);
        ctx.fillStyle = id === 'cup' ? 'rgba(255,255,255,.55)' : id === 'bath' ? '#ffffff' : id === 'bucket' ? '#c2ccd6' : '#d7dde4';
        ctx.fill();
      }
  }
  if (id === 'spoon') {
    line(ctx, box, [[0.52, 0.2], [0.72, 0.14], [1, 0.02]], Math.max(3, box.h * 0.1), '#aeb8c4');
  }
  if (id === 'bucket') {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = Math.max(1.5, box.h * 0.016);
    ctx.beginPath();
    ctx.ellipse(box.x + box.w / 2, box.y + box.h * 0.16, box.w * 0.41, box.h * 0.16, 0, Math.PI, 0);
    ctx.stroke();
  }
}

// What stands in front of it: the rim, the lettering of the thing.
function before(ctx, id, box, shell) {
  const stroke = rgba(shell);
  const weight = Math.max(1.8, Math.min(box.w, box.h) * 0.012);
  switch (id) {
    case 'spoon':
      trace(ctx, box, CONTAINERS.spoon.inside);
      ctx.strokeStyle = '#7c8894';
      ctx.lineWidth = weight * 1.2;
      ctx.stroke();
      break;
    case 'cup':
      line(ctx, box, [[0.05, 0.02], [0.16, 0.95], [0.84, 0.95], [0.95, 0.02]], weight, stroke);
      line(ctx, box, [[0.14, 0.99], [0.86, 0.99]], weight * 1.6, stroke);
      line(ctx, box, [[0.17, 0.12], [0.22, 0.64]], weight * 1.1, 'rgba(255,255,255,.7)');
      break;
    case 'bucket':
      line(ctx, box, [[0.09, 0.16], [0.23, 0.98], [0.77, 0.98], [0.91, 0.16]], weight * 1.2, stroke);
      line(ctx, box, [[0.06, 0.16], [0.94, 0.16]], weight * 2, stroke);
      break;
    case 'bath':
      trace(ctx, box, CONTAINERS.bath.inside);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = weight;
      ctx.stroke();
      line(ctx, box, [[0, 0.14], [1, 0.14]], weight * 2.2, stroke);
      line(ctx, box, [[0.16, 0.86], [0.13, 0.98]], weight * 2, stroke);
      line(ctx, box, [[0.84, 0.86], [0.87, 0.98]], weight * 2, stroke);
      line(ctx, box, [[0.1, 0.14], [0.1, 0.02], [0.17, 0.02], [0.17, 0.07]], weight * 1.3, '#8e9aa6');
      break;
    case 'room':
      ctx.strokeStyle = stroke;
      ctx.lineWidth = weight * 1.6;
      ctx.strokeRect(box.x, box.y, box.w, box.h);
      break;
    case 'pool':
      line(ctx, box, [[-0.03, 0.16], [0, 0.16], [0, 1], [1, 1], [1, 0.16], [1.03, 0.16]], weight * 1.5, stroke);
      line(ctx, box, [[0.1, 0.02], [0.1, 0.16], [0.135, 0.16], [0.135, 0.02]], weight, '#8e9aa6');
      for (let i = 0; i < 4; i++) line(ctx, box, [[0.1, 0.05 + i * 0.03], [0.135, 0.05 + i * 0.03]], weight * 0.7, '#8e9aa6');
      fillShape(ctx, box, [[0.84, 0.08], [0.9, 0.08], [0.91, 0.16], [0.83, 0.16]], '#e4632e');
      break;
    case 'tanker':
      trace(ctx, box, CONTAINERS.tanker.inside);
      ctx.strokeStyle = '#a23a33';
      ctx.lineWidth = weight * 2.4;
      ctx.stroke();
      line(ctx, box, [[0, 0.3], [1, 0.3]], weight * 2, '#2c3f51');
      break;
    case 'pyramid':
      trace(ctx, box, CONTAINERS.pyramid.inside);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = weight;
      ctx.stroke();
      break;
    case 'mountain': {
      fillShape(ctx, box, [[0.5, 0], [0.62, 0.24], [0.56, 0.2], [0.51, 0.3], [0.45, 0.2], [0.38, 0.24]], 'rgba(248,251,253,.95)');
      trace(ctx, box, CONTAINERS.mountain.inside);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = weight;
      ctx.stroke();
      break;
    }
    case 'loch':
    case 'superior': {
      const shape = CONTAINERS[id].inside;
      ctx.strokeStyle = 'rgba(36,54,42,.8)';
      ctx.lineWidth = weight;
      trace(ctx, box, shape);
      ctx.stroke();
      ctx.fillStyle = '#2f5d42';
      for (const [edge, side] of [[shape[0], -1], [shape[shape.length - 1], 1]]) {
        for (let i = 0; i < 4; i++) {
          const x = box.x + edge[0] * box.w + side * (i * box.w * 0.035 + box.w * 0.01);
          const y = box.y + edge[1] * box.h - box.h * 0.01;
          const tall = box.h * (0.09 + hash(i, 43) * 0.05);
          ctx.beginPath();
          ctx.moveTo(x, y - tall);
          ctx.lineTo(x + tall * 0.32, y);
          ctx.lineTo(x - tall * 0.32, y);
          ctx.closePath();
          ctx.fill();
        }
      }
      break;
    }
    case 'water': {
      const gloss = ctx.createRadialGradient(box.x + box.w * 0.34, box.y + box.h * 0.3, 0, box.x + box.w * 0.5, box.y + box.h * 0.5, box.w * 0.55);
      gloss.addColorStop(0, 'rgba(255,255,255,.28)');
      gloss.addColorStop(0.5, 'rgba(255,255,255,0)');
      gloss.addColorStop(1, 'rgba(0,16,50,.28)');
      ctx.fillStyle = gloss;
      trace(ctx, box, CONTAINERS.water.inside);
      ctx.fill();
      ctx.strokeStyle = rgba(shell, 0.7);
      ctx.lineWidth = 1.2;
      ctx.stroke();
      break;
    }
    case 'moon':
    case 'earth':
    case 'neptune': {
      const shadow = ctx.createRadialGradient(box.x + box.w * 0.36, box.y + box.h * 0.32, box.w * 0.2, box.x + box.w * 0.5, box.y + box.h * 0.5, box.w * 0.55);
      shadow.addColorStop(0, 'rgba(0,0,0,0)');
      shadow.addColorStop(1, 'rgba(0,6,24,.55)');
      ctx.fillStyle = shadow;
      trace(ctx, box, CONTAINERS[id].inside);
      ctx.fill();
      break;
    }
    default:
  }
}

export function createFillScene(kind) {
  const material = MATERIALS[kind];
  const isWater = kind === 'water';
  const falling = [];
  const ripples = [];
  let current = null;
  let shift = null;
  let sinceDrop = 0;

  function fitBox(w, h, aspect, topRoom, lowRoom) {
    const roomW = w * (w < 560 ? 0.8 : 0.58);
    const roomH = h - topRoom - lowRoom;
    let boxH = roomH;
    let boxW = boxH * aspect;
    if (boxW > roomW) {
      boxW = roomW;
      boxH = boxW / aspect;
    }
    return { x: (w - boxW) / 2, y: h - lowRoom - boxH, w: boxW, h: boxH };
  }

  function drawBody(ctx, id, box, share, f, shell) {
    const shape = CONTAINERS[id];
    const level = box.y + levelForShare(shape.inside, share) * box.h;
    const bottom = box.y + box.h;
    const swell = isWater ? clamp(1.4 + Math.abs(f.velocity) * 3.2, 1.4, Math.max(2, box.h * 0.035)) : 0;
    const clock = f.still ? 2.5 : f.t;
    ctx.save();
    trace(ctx, box, shape.inside);
    ctx.clip();
    if (share > 0) {
      const body = ctx.createLinearGradient(0, level, 0, Math.max(level + 40, bottom));
      body.addColorStop(0, rgba(material.top));
      body.addColorStop(1, rgba(material.low));
      ctx.fillStyle = body;
      const surface = x => {
        if (share >= 1) return box.y - 4;
        if (isWater) return level + swell * Math.sin(x * 0.028 + clock * 1.8) + swell * 0.5 * Math.sin(x * 0.067 - clock * 1.1);
        const around = (x - (box.x + box.w / 2)) / (box.w / 2);
        // Sand heaps under the pour and slumps toward the walls, where water lies flat.
        return level - Math.min(box.h * 0.08, (bottom - level) * 0.3) * (0.5 - around * around * 0.9);
      };
      ctx.beginPath();
      ctx.moveTo(box.x - 2, bottom + 4);
      for (let x = box.x - 2; x <= box.x + box.w + 6; x += 6) ctx.lineTo(x, surface(x));
      ctx.lineTo(box.x + box.w + 2, bottom + 4);
      ctx.closePath();
      ctx.fill();
      if (share < 1) {
        ctx.strokeStyle = rgba(material.line, 0.85);
        ctx.lineWidth = isWater ? 2 : 1;
        ctx.beginPath();
        for (let x = box.x - 2; x <= box.x + box.w + 6; x += 6) {
          if (x === box.x - 2) ctx.moveTo(x, surface(x)); else ctx.lineTo(x, surface(x));
        }
        ctx.stroke();
      }
      if (isWater && bottom - level > 16) {
        for (let i = 0; i < 9; i++) {
          const rise = (clock * (0.08 + hash(i, 51) * 0.1) + hash(i, 52)) % 1;
          const x = box.x + box.w * (0.08 + hash(i, 53) * 0.84) + Math.sin(clock + i) * 2;
          const y = lerp(bottom, level + 3, rise);
          ctx.fillStyle = `rgba(255,255,255,${0.32 * (1 - rise)})`;
          ctx.beginPath();
          ctx.arc(x, y, 1 + hash(i, 54) * Math.max(1, box.h * 0.008), 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (!isWater) {
        for (let i = 0; i < 240; i++) {
          const x = box.x + hash(i, 55) * box.w;
          const y = level + hash(i, 56) * (bottom - level);
          ctx.fillStyle = i % 2 ? rgba(material.dark, 0.3) : rgba(material.line, 0.4);
          ctx.fillRect(x, y, 1.4, 1.4);
        }
      }
    }
    ctx.restore();
    return { level, shell };
  }

  function drawContainer(ctx, id, box, share, f, shell, clipped = false) {
    ctx.save();
    if (clipped) {
      ctx.beginPath();
      ctx.rect(box.x - 6, box.y - 6, box.w + 12, box.h + 12);
      ctx.clip();
    }
    behind(ctx, id, box, shell);
    const result = drawBody(ctx, id, box, share, f, shell);
    before(ctx, id, box, shell);
    ctx.restore();
    return result;
  }

  // Too few to fill anything: the drops or grains themselves, each one drawn.
  function drawCounted(ctx, f, scenery) {
    const { w, h, amount, perUnit, t } = f;
    const count = amount / perUnit;
    const whole = Math.ceil(count - 1e-9);
    if (whole <= 0) return;
    const areaW = w * 0.74;
    const areaH = h * 0.6;
    const baseline = h * 0.86;
    // Sand sits in a heap, whose area is half the box; drops are lined up in a tray.
    const area = isWater ? areaW * areaH : areaW * areaH * 0.5;
    const size = clamp(Math.sqrt(area / whole) * 0.84, 2, isWater ? 84 : 52);
    const across = Math.max(1, Math.floor(areaW / size));
    let row = 0;
    let used = 0;
    ctx.save();
    for (let i = 0; i < whole; i++) {
      const rowWidth = isWater ? across : Math.max(1, across - row * 2);
      const column = i - used;
      const bob = f.motion && whole < 60 ? Math.sin(t * 1.6 + i) * size * 0.04 : 0;
      const x = w / 2 + (column - (Math.min(rowWidth, whole - used) - 1) / 2) * size + (isWater ? 0 : (hash(i, 61) - 0.5) * size * 0.3);
      const y = baseline - (row + 0.5) * size * (isWater ? 1 : 0.86) + bob;
      const alpha = i === whole - 1 ? clamp(count - i + 0.15) : 1;
      if (isWater) drawDrop(ctx, x, y, size * 0.42, alpha);
      else drawGrain(ctx, x, y, size * 0.44, i, alpha);
      if (column + 1 >= rowWidth) {
        used = i + 1;
        row += 1;
      }
    }
    ctx.restore();
    ctx.fillStyle = rgba(scenery.ground);
    ctx.fillRect(0, baseline, w, h - baseline);
  }

  function drawDrop(ctx, x, y, r, alpha) {
    ctx.globalAlpha = alpha;
    const body = ctx.createRadialGradient(x - r * 0.3, y - r * 0.1, r * 0.1, x, y + r * 0.2, r * 1.2);
    body.addColorStop(0, '#c9f0ff');
    body.addColorStop(0.5, '#4cb6ea');
    body.addColorStop(1, '#0f6db6');
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.moveTo(x, y - r * 1.25);
    ctx.bezierCurveTo(x + r * 0.28, y - r * 0.6, x + r, y - r * 0.1, x + r, y + r * 0.34);
    ctx.arc(x, y + r * 0.34, r, 0, Math.PI);
    ctx.bezierCurveTo(x - r, y - r * 0.1, x - r * 0.28, y - r * 0.6, x, y - r * 1.25);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawGrain(ctx, x, y, r, i, alpha) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = rgba(mix(material.top, material.low, hash(i, 62)));
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.78 + hash(i, 63) * 0.2), hash(i, 64) * 3, 0, Math.PI * 2);
    ctx.fill();
    if (r > 5) {
      ctx.fillStyle = 'rgba(255,255,255,.35)';
      ctx.beginPath();
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function pour(ctx, f, box, level) {
    if (f.still || !f.motion) return;
    sinceDrop += f.dt;
    const rate = isWater ? (f.moving ? 0.03 : 1.2) : (f.moving ? 0.008 : 0.09);
    const cx = box.x + box.w / 2;
    while (sinceDrop > rate) {
      sinceDrop -= rate;
      if (falling.length < 90) falling.push({ x: cx + (hash(falling.length, 71) - 0.5) * Math.min(box.w * 0.16, 26), y: -8, v: 40 + hash(falling.length, 72) * 50 });
    }
    for (let i = falling.length - 1; i >= 0; i--) {
      const item = falling[i];
      item.v += 720 * f.dt;
      item.y += item.v * f.dt;
      if (item.y >= level) {
        if (isWater && ripples.length < 8) ripples.push({ x: item.x, y: level, age: 0 });
        falling.splice(i, 1);
        continue;
      }
      if (isWater) drawDrop(ctx, item.x, item.y, 3.2, 0.9);
      else {
        ctx.fillStyle = rgba(material.top);
        ctx.fillRect(item.x, item.y, 1.8, 1.8);
      }
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const ripple = ripples[i];
      ripple.age += f.dt / 0.7;
      if (ripple.age >= 1) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - ripple.age)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(ripple.x, ripple.y, 4 + ripple.age * 26, 1.2 + ripple.age * 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  return {
    draw(ctx, f) {
      const { w, h, amount, rungs, words, perUnit, previous, zero, readout } = f;
      const index = containerIndex(amount, rungs);
      const countedBelow = !zero && amount / perUnit <= Math.min(rungs[0].size / perUnit, 3000);
      const id = rungs[index].id;
      if (current === null) current = index;
      if (index !== current) {
        if (!f.still && f.motion) shift = { from: current, age: 0 };
        current = index;
      }
      let progress = 1;
      if (shift && !f.still) {
        shift.age += f.dt / 0.75;
        progress = smooth(0, 1, shift.age);
        if (shift.age >= 1) shift = null;
      }
      const showingFrom = shift && !f.still ? shift.from : null;
      const scenery = SCENERY[SCENERY_OF[id]];
      const fromScenery = showingFrom !== null ? SCENERY[SCENERY_OF[rungs[showingFrom].id]] : scenery;
      const top = mix(fromScenery.top, scenery.top, progress);
      const low = mix(fromScenery.low, scenery.low, progress);
      const ground = mix(fromScenery.ground, scenery.ground, progress);
      const darkness = lerp(fromScenery.dark, scenery.dark, progress);
      backdrop(ctx, w, h, top, low);
      nightSky(ctx, w, h, darkness, f.t, f.motion);
      const lowRoom = h * 0.13;
      const box = fitBox(w, h, CONTAINERS[id].aspect, h * 0.2, lowRoom);
      if (darkness < 0.98) {
        ctx.fillStyle = rgba(ground, 1 - darkness);
        ctx.fillRect(0, box.y + box.h, w, h);
      }

      if (countedBelow) {
        drawCounted(ctx, f, scenery);
        return { dark: darkness };
      }

      const share = clamp(amount / rungs[index].size);
      // The old container shrinks into the corner as the new one arrives from
      // just outside the frame, which is what going up a size looks like.
      const insetTall = Math.min(h * 0.17, 74);
      if (showingFrom !== null) {
        const old = rungs[showingFrom].id;
        const goingUp = showingFrom < index;
        const oldBox = fitBox(w, h, CONTAINERS[old].aspect, h * 0.2, lowRoom);
        const k = goingUp ? lerp(1, 0.2, progress) : lerp(1, 1.9, progress);
        const shrunk = { x: lerp(oldBox.x, w - 18 - oldBox.w * k, goingUp ? progress : 0), y: lerp(oldBox.y, 66, goingUp ? progress : 0), w: oldBox.w * k, h: oldBox.h * k };
        ctx.save();
        ctx.globalAlpha = 1 - progress;
        drawContainer(ctx, old, shrunk, goingUp ? 1 : clamp(amount / rungs[showingFrom].size), f, mix(fromScenery.shell, scenery.shell, progress), true);
        ctx.restore();
      }
      const arriving = showingFrom === null ? 1 : showingFrom < index ? lerp(1.5, 1, progress) : lerp(0.3, 1, progress);
      const drawn = { x: box.x + box.w / 2 - box.w * arriving / 2, y: box.y + box.h - box.h * arriving, w: box.w * arriving, h: box.h * arriving };
      ctx.save();
      ctx.globalAlpha = showingFrom === null ? 1 : progress;
      const { level } = drawContainer(ctx, id, drawn, share, f, scenery.shell);
      ctx.restore();
      if (showingFrom === null && !zero) pour(ctx, f, box, level);

      const pale = darkness < 0.5;
      const ink = pale ? '#16202a' : '#f1f5fb';
      const halo = pale ? 'rgba(255,255,255,.85)' : 'rgba(4,8,20,.85)';
      const nameY = Math.max(box.y - 16, 58);

      // Corner inset: the last thing this amount filled, and how many times over. It stays
      // in its corner, so it is worked out first and the chips that move keep clear of it.
      let corner = null;
      if (index > 0 && showingFrom === null) {
        const lastId = rungs[index - 1].id;
        const aspect = CONTAINERS[lastId].aspect;
        const insetW = Math.min(insetTall * aspect, w * 0.2);
        const insetH = insetW / aspect;
        const inset = { x: w - 18 - insetW, y: 62, w: insetW, h: insetH };
        const line = words.times(amount / rungs[index - 1].size);
        const y = inset.y + insetH + 15;
        const options = { size: 12, align: 'right', fill: pale ? 'rgba(255,255,255,.92)' : 'rgba(16,24,34,.9)', ink: pale ? '#16202a' : '#ffffff', stroke: pale ? 'rgba(16,24,34,.25)' : 'rgba(255,255,255,.3)', within: w };
        const times = chipBox(ctx, line, w - 18, y, options);
        corner = { lastId, inset, line, y, options, box: { left: Math.min(inset.x, times.left), right: w, top: inset.y, bottom: times.bottom } };
      }

      // The level's chip follows the surface until the corner is in its way, and then waits
      // under the corner while the surface goes on up. The surface says the rest.
      let levelBox = null;
      if (share < 1 && showingFrom === null) {
        const tagX = Math.min(box.x + box.w + 10, w - 8);
        const align = box.x + box.w + 90 < w ? 'left' : 'right';
        const options = { size: 12, align, fill: pale ? '#0f6db6' : '#ffffff', ink: pale ? '#ffffff' : '#0a1626', within: w, clear: corner?.box ?? null, downward: true };
        levelBox = chip(ctx, words.full(share), align === 'left' ? tagX : w - 10, clamp(level, box.y + 10, box.y + box.h - 10), options);
      }
      if (share >= 1) chip(ctx, words.times(amount / rungs[index].size), w / 2, box.y + box.h / 2, { size: 15, align: 'center', fill: '#ffffff', ink: '#0a1626', within: w });
      if (corner) {
        drawContainer(ctx, corner.lastId, corner.inset, 1, f, scenery.shell, true);
        chip(ctx, corner.line, w - 18, corner.y, corner.options);
      }
      // After the inset, which a long name reaches on a narrow stage.
      write(ctx, words.name(id), w / 2, nameY, { size: 13, weight: 700, fill: ink, halo, align: 'center', within: w });
      if (previous !== null && previous > 0 && share < 1 && previous < rungs[index].size && Math.abs(previous - amount) > amount * 1e-6) {
        const beforeLevel = drawn.y + levelForShare(CONTAINERS[id].inside, clamp(previous / rungs[index].size)) * drawn.h;
        ctx.save();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = pale ? 'rgba(16,24,34,.75)' : 'rgba(255,255,255,.8)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(drawn.x - 10, beforeLevel);
        ctx.lineTo(drawn.x + drawn.w * 0.28, beforeLevel);
        ctx.stroke();
        ctx.restore();
        // A level near the brim puts this under the container's name, and it comes down off
        // that. A long one reaches across the stage to the level's chip when the two are close,
        // and steps off toward the side it came from. If that leaves it nowhere, it goes without.
        const line = words.before(previous);
        const x = Math.max(drawn.x - 12, 92);
        const nameHalf = widthOf(ctx, words.name(id), 13, 700) / 2 + 2;
        const nameBox = { left: w / 2 - nameHalf, right: w / 2 + nameHalf, top: nameY - 9, bottom: nameY + 9 };
        const look = { size: 11, weight: 600, align: 'right', fill: pale ? 'rgba(255,255,255,.92)' : 'rgba(16,24,34,.9)', ink: pale ? '#16202a' : '#ffffff', stroke: pale ? 'rgba(16,24,34,.25)' : 'rgba(255,255,255,.3)', within: w };
        const y = chipBox(ctx, line, x, beforeLevel, { ...look, clear: nameBox, downward: true }).y;
        // Nearest first, in the direction it steps, because the level's chip can be waiting under the corner.
        const options = { ...look, clear: previous < amount ? [corner?.box, levelBox] : [levelBox, corner?.box], downward: previous < amount };
        const placed = chipBox(ctx, line, x, y, options);
        if (![readout, nameBox].some(other => other && meets(placed, other))) chip(ctx, line, x, y, options);
      }
      return { dark: darkness };
    }
  };
}
