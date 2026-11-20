import { arcminPerUnit } from './subjects.js';
import { drawSky } from './scene-sky.js';
import { drawLand } from './scene-land.js';
import { drawSlide } from './scene-slide.js';
import { drawNear } from './scene-near.js';
import { TAU } from './kit.js';

// One picture: a subject, at a scale of angle, softened by a blur and dimmed by a
// brightness. The three pictures on the page are this function called three times
// with different numbers, which is the whole of the page's claim about them.
//
// Everything is measured in the angle the eye is shown. A picture has so many pixels
// to the arcminute; a subject is so many arcminutes to the bare eye for each of its
// own units, times the magnification; a blur is so many arcminutes. Nothing is ever
// sized in pixels directly, so nothing can be the wrong size for its neighbours.

const SCENES = { sky: drawSky, land: drawLand, slide: drawSlide, near: drawNear };

// The whole view is drawn inside a frame this many degrees across, so that an
// ordinary eyepiece's circle nearly fills it and the scale does not change when the
// eyepiece does. Only a circle too wide for the frame widens it.
export const FRAME_DEGREES = 72;
export const frameFor = shownField => Math.max(FRAME_DEGREES, shownField + 4);

// The close look is two arcminutes to a pixel. A phone or laptop screen held where it
// is read puts two or three of its own pixels in one of these, so what it shows is
// about what a good eye would separate, and a blur of four arcminutes looks soft.
export const CLOSE_PX_PER_ARCMIN = 0.5;

// A blur is made by drawing small and scaling back up, because a canvas has no blur
// of its own in every browser. This is how many times smaller to draw for a blur of
// so many pixels, and under a pixel and a quarter it is not worth doing at all.
export function softening(blurPixels) {
  return blurPixels < 1.25 ? 1 : Math.min(blurPixels, 48);
}

// What a drawing module is told: where the middle is, how many pixels one of the
// subject's own units takes, how wide the blur is in those units, and the smallest
// thing worth drawing, which is a third of the blur or a third of a pixel.
export function geometry(spec, w, h, ratio) {
  const perUnit = arcminPerUnit(spec.subject) * spec.power;
  const k = perUnit * spec.pxPerArcmin;
  const soft = spec.blurArcmin / perUnit;
  const shrink = softening(spec.blurArcmin * spec.pxPerArcmin * ratio);
  const px = ratio / shrink;
  return { w, h, cx: w / 2, cy: h / 2, k, soft, shrink, px, fine: Math.max(soft / 3, 0.35 / (k * px)) };
}

export function render(ctx, w, h, ratio, spec, layerFor) {
  const g = {
    ...geometry(spec, w, h, ratio),
    id: spec.id,
    power: spec.power,
    dusk: Boolean(spec.subject.dusk),
    backdrop: spec.backdrop,
    lit: Boolean(spec.lit),
    faintest: spec.faintest,
    words: spec.words,
    face: spec.face
  };
  const scene = SCENES[spec.subject.kind];
  if (g.shrink === 1) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    scene(ctx, g);
  } else {
    let layer = layerFor(Math.max(2, Math.ceil(w * g.px)), Math.max(2, Math.ceil(h * g.px)));
    const pen = layer.getContext('2d');
    pen.setTransform(layer.width / w, 0, 0, layer.height / h, 0, 0);
    scene(pen, g);
    // Back up by doubling, since one large step leaves the grid of the small drawing
    // showing through, and several small ones do not.
    while (layer.width * 2 < w * ratio) {
      const next = layerFor(layer.width * 2, layer.height * 2);
      const brush = next.getContext('2d');
      brush.setTransform(1, 0, 0, 1, 0, 0);
      brush.imageSmoothingEnabled = true;
      brush.imageSmoothingQuality = 'high';
      brush.drawImage(layer, 0, 0, next.width, next.height);
      layer = next;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(layer, 0, 0, Math.round(w * ratio), Math.round(h * ratio));
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  if (spec.brightness < 1) {
    ctx.fillStyle = `rgba(0,0,0,${1 - spec.brightness})`;
    ctx.fillRect(0, 0, w, h);
  }
  if (spec.shownField) {
    // The field stop: everything outside the circle the eyepiece shows is the black
    // of the inside of the instrument.
    const radius = spec.shownField * 30 * spec.pxPerArcmin;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.moveTo(w / 2 + radius, h / 2);
    ctx.arc(w / 2, h / 2, radius, 0, TAU);
    ctx.fill('evenodd');
    // A night sky is nearly as dark as the barrel, so the edge of the field is given
    // the faint line a real field stop has where stray light catches it.
    ctx.strokeStyle = 'rgba(150,160,180,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.max(0, radius - 0.5), 0, TAU);
    ctx.stroke();
  }
  return g;
}

// Draw one picture into a canvas at the size the page has given it. False when the
// canvas has no size yet, which is a page still being laid out or a hidden tab.
export function paint(canvas, spec, layerFor) {
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) return false;
  const ratio = Math.min(3, Math.max(1, globalThis.devicePixelRatio || 1));
  const wide = Math.round(box.width * ratio);
  const tall = Math.round(box.height * ratio);
  if (canvas.width !== wide || canvas.height !== tall) {
    canvas.width = wide;
    canvas.height = tall;
  }
  render(canvas.getContext('2d'), box.width, box.height, ratio, spec, layerFor);
  return true;
}
