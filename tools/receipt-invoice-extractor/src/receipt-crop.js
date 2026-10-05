/**
 * A long receipt can run off both ends of a photograph, leaving only its two
 * paper edges to find. The general four-corner detector deliberately declines
 * that weak rectangle. This fallback measures those long sides across the
 * picture instead of letting the much darker lettering and barcode win.
 *
 * It removes side background only. Keeping both ends is intentional: a date
 * below the barcode must survive even when it is too small to detect as ink.
 */
const FRAME = Object.freeze({ x: 0, y: 0, width: 1, height: 1 });

function median(values) {
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)] ?? 0;
}

function channel(image) {
  const output = new Float32Array(image.width * image.height);
  for (let i = 0; i < output.length; i += 1) {
    const pixel = i * 4;
    const alpha = image.data[pixel + 3] / 255;
    output[i] = (image.data[pixel] * 0.299 + image.data[pixel + 1] * 0.587
      + image.data[pixel + 2] * 0.114) * alpha + 255 * (1 - alpha);
  }
  return output;
}

function sideCandidates(grey, across, along, transposed, polarity) {
  const at = transposed
    ? (x, y) => grey[x * along + y]
    : (x, y) => grey[y * across + x];
  const gap = Math.max(2, Math.round(Math.min(across, along) * 0.008));
  const start = Math.max(2, Math.round(along * 0.025));
  const end = along - start;
  const candidates = [];
  const profiles = new Float32Array(across);

  for (let x = gap; x < across - gap; x += 1) {
    const values = [];
    const bands = Array.from({ length: 8 }, () => []);
    let support = 0;
    for (let y = start; y < end; y += 1) {
      const step = (at(x + gap, y) - at(x - gap, y)) * polarity;
      values.push(step);
      bands[Math.min(7, Math.floor((y - start) * 8 / (end - start)))].push(step);
      if (step > 3) support += 1;
    }
    const strength = median(values);
    profiles[x] = strength;
    if (strength < 6 || support / values.length < 0.68) continue;
    const bandSupport = bands.map(valuesInBand => median(valuesInBand) > 3);
    // Both ends must carry evidence, so a logo or barcode cannot supply a side.
    if (!bandSupport[0] || !bandSupport[7] || bandSupport.filter(Boolean).length < 6) continue;
    const paper = [];
    const outside = [];
    const insideX = x + polarity * gap * 2;
    const outsideX = x - polarity * gap * 2;
    if (insideX < 0 || insideX >= across || outsideX < 0 || outsideX >= across) continue;
    for (let y = start; y < end; y += 1) {
      paper.push(at(insideX, y));
      outside.push(at(outsideX, y));
    }
    if (median(paper) < 120 || median(paper) - median(outside) < 5) continue;
    candidates.push({ x, strength, support: support / values.length });
  }

  candidates.sort((a, b) => b.strength - a.strength);
  const peaks = [];
  for (const candidate of candidates) {
    if (peaks.some(peak => Math.abs(peak.x - candidate.x) <= gap * 3)) continue;
    // A gradual lighting ramp lacks the local peak of a photographed edge.
    const neighbours = [candidate.x - gap * 3, candidate.x + gap * 3]
      .filter(x => x >= gap && x < across - gap).map(x => profiles[x]);
    if (!neighbours.length || candidate.strength - Math.max(...neighbours) < 3) continue;
    peaks.push(candidate);
    if (peaks.length === 8) break;
  }
  return { peaks, gap, at };
}

function narrowBand(grey, across, along, transposed) {
  const left = sideCandidates(grey, across, along, transposed, 1);
  const right = sideCandidates(grey, across, along, transposed, -1);
  const candidates = [];
  for (const a of left.peaks) {
    for (const b of right.peaks) {
      const span = b.x - a.x;
      if (span < across * 0.22 || span > across * 0.84 || along / span < 1.35) continue;
      let ink = 0;
      const inkBands = new Set();
      const inset = left.gap * 3;
      for (let y = 2; y < along - 2; y += 1) {
        for (let x = a.x + inset; x < b.x - inset; x += 1) {
          const here = left.at(x, y);
          const light = Math.max(left.at(x - 2, y), left.at(x + 2, y),
            left.at(x, y - 2), left.at(x, y + 2));
          if (light - here > 20) {
            ink += 1;
            inkBands.add(Math.floor(y * 8 / along));
          }
        }
      }
      // Printed detail spread down the strip distinguishes it from a reflection.
      if (ink < span * along * 0.003 || inkBands.size < 4) continue;
      const score = Math.min(a.strength, b.strength) * Math.min(a.support, b.support);
      const margin = Math.max(left.gap * 3, across * 0.025);
      const first = Math.max(0, a.x - margin) / across;
      const last = Math.min(across, b.x + margin) / across;
      candidates.push({ score, first, last, crop: transposed
        ? { x: 0, y: first, width: 1, height: last - first }
        : { x: first, y: 0, width: last - first, height: 1 } });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  // Two separate paper strips may be two documents; choosing one would lose data.
  if (!best || candidates.some(candidate => candidate.score >= best.score * 0.75
      && (candidate.last < best.first || candidate.first > best.last))) return null;
  return { score: best.score, crop: best.crop };
}

/** Return normalized crop coordinates; uncertain pictures retain every pixel. */
export function findReceiptCrop(image) {
  const { width, height, data } = image ?? {};
  const empty = { found: false, crop: { ...FRAME }, score: 0 };
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height)
      || width < 24 || height < 24 || width * height > 1_000_000
      || !data || data.length !== width * height * 4) return empty;
  const grey = channel(image);
  const candidates = [narrowBand(grey, width, height, false),
    narrowBand(grey, height, width, true)].filter(Boolean);
  candidates.sort((a, b) => b.score - a.score);
  return candidates.length ? { found: true, ...candidates[0] } : empty;
}
