const SVG_NS = 'http://www.w3.org/2000/svg';
const MAX_ICONS = 24;
let nextSceneId = 0;
const colors = {
  ink: 'var(--ne-scene-ink, #28766b)', sand: 'var(--ne-scene-sand, #e7b462)',
  soft: 'var(--ne-scene-soft, #eaf2ed)', paper: 'var(--ne-scene-paper, #fff8e9)',
  muted: 'var(--ne-scene-muted, #c6d9d0)', text: 'var(--ne-scene-text, #36554c)'
};

function svgNode(name, attributes = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  if (text !== undefined) node.textContent = String(text ?? '');
  return node;
}
function add(parent, name, attributes, text) {
  const node = svgNode(name, attributes, text);
  parent.append(node);
  return node;
}
function path(parent, d, attributes = {}) { return add(parent, 'path', { d, ...attributes }); }

function pictogram(kind) {
  const icon = svgNode('g', { fill: colors.sand, stroke: colors.ink, 'stroke-width': 2.1,
    'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true' });
  switch (kind) {
    case 'spoon':
      add(icon, 'ellipse', { cx: 25, cy: 19, rx: 10, ry: 14, transform: 'rotate(-28 25 19)' });
      path(icon, 'M31 31L45 55', { fill: 'none', 'stroke-width': 6 });
      path(icon, 'M20 13Q17 18 21 24', { fill: 'none', stroke: colors.paper });
      break;
    case 'cup':
      path(icon, 'M44 23C64 18 62 44 44 43', { fill: 'none', 'stroke-width': 4 });
      path(icon, 'M13 17H46L42 53H17Z');
      add(icon, 'ellipse', { cx: 29.5, cy: 17, rx: 16.5, ry: 5, fill: colors.paper });
      path(icon, 'M20 25L22 44', { fill: 'none', stroke: colors.paper });
      break;
    case 'bath':
      path(icon, 'M15 28V16Q15 9 22 9H27', { fill: 'none', 'stroke-width': 3 });
      path(icon, 'M7 29H57L52 48H13Z');
      path(icon, 'M6 29H58', { 'stroke-width': 4 });
      path(icon, 'M17 48L14 55M47 48L50 55', { fill: 'none', 'stroke-width': 3 });
      path(icon, 'M16 36H48', { fill: 'none', stroke: colors.paper });
      break;
    case 'room':
      path(icon, 'M9 18L34 9L55 21V48L30 57L9 45Z', { fill: colors.soft });
      path(icon, 'M9 18L30 30L55 21M30 30V57', { fill: 'none' });
      path(icon, 'M9 45L34 35L55 48L30 57Z');
      path(icon, 'M34 9V35', { fill: 'none' });
      path(icon, 'M16 22V37L24 42V27Z', { fill: colors.paper });
      break;
    case 'pool':
      path(icon, 'M6 24L38 11L59 23V42L27 55L6 43Z', { fill: colors.soft });
      path(icon, 'M6 24L27 36L59 23M27 36V55', { fill: 'none' });
      path(icon, 'M12 24L38 16L53 23L27 31Z');
      path(icon, 'M22 24L29 26L37 23L43 24', { fill: 'none', stroke: colors.paper });
      path(icon, 'M11 34L20 39M35 39L49 33', { fill: 'none', stroke: colors.muted });
      break;
    case 'mountain':
      path(icon, 'M3 55L27 10L61 55Z');
      path(icon, 'M17 29L27 10L41 29L32 24L26 31L22 25Z', { fill: colors.paper });
      path(icon, 'M27 36L19 52M38 39L48 52', { fill: 'none', stroke: colors.paper });
      break;
    case 'book':
      path(icon, 'M10 13Q21 8 32 15Q43 8 54 13V53Q43 48 32 55Q21 48 10 53Z');
      path(icon, 'M14 12V47Q23 44 32 50Q41 44 50 47V12', { fill: colors.paper });
      path(icon, 'M32 15V54', { fill: 'none' });
      path(icon, 'M19 23L26 25M19 30L26 32M38 25L45 23M38 32L45 30', { fill: 'none', stroke: colors.muted });
      break;
    case 'clock':
      add(icon, 'circle', { cx: 32, cy: 32, r: 24, fill: colors.paper });
      path(icon, 'M32 17V32L43 39', { fill: 'none', 'stroke-width': 3 });
      path(icon, 'M32 12V15M52 32H49M32 52V49M12 32H15', { fill: 'none' });
      add(icon, 'circle', { cx: 32, cy: 32, r: 2.5, fill: colors.sand, stroke: 'none' });
      break;
    default:
      path(icon, 'M16 18C16 1 48 1 48 18', { fill: 'none', 'stroke-width': 3 });
      path(icon, 'M12 19L18 55Q32 60 46 55L52 19Z');
      add(icon, 'ellipse', { cx: 32, cy: 19, rx: 20, ry: 6, fill: colors.paper });
      path(icon, 'M21 30L24 48', { fill: 'none', stroke: colors.paper, 'stroke-width': 3 });
  }
  return icon;
}

export function sceneGroupSize(ratio) {
  if (!Number.isFinite(ratio) || ratio <= MAX_ICONS) return 1;
  return 10 ** Math.ceil(Math.log10(ratio / MAX_ICONS));
}

export function drawScene({ kind = 'bucket', ratio = 0, label = '', description = '', groupLabel = '', fractionLabel = '', zeroLabel = '' } = {}) {
  const amount = Number.isFinite(ratio) ? Math.max(0, ratio) : 0;
  const units = amount / sceneGroupSize(amount);
  const count = Math.min(MAX_ICONS, Math.ceil(units));
  const hasFraction = units > 0 && units % 1 !== 0;
  const sceneId = ++nextSceneId;
  const titleId = `ne-scene-title-${sceneId}`;
  const descriptionId = `ne-scene-description-${sceneId}`;
  const scene = svgNode('svg', { xmlns: SVG_NS, viewBox: '0 0 640 350', role: 'img',
    'aria-labelledby': `${titleId} ${descriptionId}`, class: 'ne-scene', preserveAspectRatio: 'xMidYMid meet' });
  add(scene, 'title', { id: titleId }, label);
  add(scene, 'desc', { id: descriptionId }, description);
  const decoration = add(scene, 'g', { 'aria-hidden': 'true' });
  add(decoration, 'rect', { x: 8, y: 8, width: 624, height: 334, rx: 25, fill: colors.soft, opacity: 0.35 });
  for (let x = 48; x <= 592; x += 32) add(decoration, 'circle', { cx: x, cy: 270, r: 1.5, fill: colors.muted, opacity: 0.7 });
  if (count === 0) {
    add(scene, 'text', { x: 320, y: 150, 'text-anchor': 'middle', fill: colors.text, 'font-family': 'inherit', 'font-size': 20, class: 'ne-scene__zero' }, zeroLabel);
  } else {
    const columns = count <= 3 ? count : count <= 8 ? 4 : 6;
    const rows = Math.ceil(count / columns);
    const cellWidth = Math.min(142, 552 / columns);
    const cellHeight = Math.min(112, 230 / rows);
    const size = Math.min(82, cellWidth - 22, cellHeight - 18);
    const top = 24 + (230 - rows * cellHeight) / 2;
    for (let index = 0; index < count; index++) {
      const row = Math.floor(index / columns);
      const column = index % columns;
      const rowCount = Math.min(columns, count - row * columns);
      const x = (640 - rowCount * cellWidth) / 2 + column * cellWidth;
      const y = top + row * cellHeight;
      const fractional = hasFraction && index === count - 1;
      const tile = add(scene, 'g', { class: fractional ? 'ne-scene__unit ne-scene__unit--fraction' : 'ne-scene__unit', 'aria-hidden': 'true' });
      // A marked reference icon avoids suggesting that pictured area measures volume.
      if (fractional) add(tile, 'rect', { x: x + 5, y: y + 3, width: cellWidth - 10, height: cellHeight - 6, rx: 14,
        fill: colors.muted, 'fill-opacity': 0.18, stroke: colors.ink, 'stroke-opacity': 0.45, 'stroke-width': 1.2, 'stroke-dasharray': '3 5' });
      const icon = pictogram(kind);
      icon.setAttribute('transform', `translate(${x + (cellWidth - size) / 2} ${y + (cellHeight - size) / 2}) scale(${size / 64})`);
      if (fractional) icon.setAttribute('opacity', '0.38');
      tile.append(icon);
      if (fractional) add(tile, 'circle', { cx: x + cellWidth - 14, cy: y + 13, r: 4, fill: colors.sand, stroke: colors.ink, 'stroke-width': 1 });
    }
  }
  add(scene, 'text', { x: 320, y: 298, 'text-anchor': 'middle', fill: colors.text, 'font-family': 'inherit', 'font-size': 14, 'font-weight': 600, class: 'ne-scene__group-label' }, groupLabel);
  if (hasFraction && fractionLabel) add(scene, 'text', { x: 320, y: 324, 'text-anchor': 'middle', fill: colors.text, 'font-family': 'inherit', 'font-size': 13, class: 'ne-scene__fraction-label' }, fractionLabel);
  return scene;
}
