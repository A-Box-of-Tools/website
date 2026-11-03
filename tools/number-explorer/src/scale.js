export const MAX_COUNT = 10n ** 30n;
const SUFFIX_POWERS = Object.freeze({ k: 3, thousand: 3, m: 6, million: 6, b: 9, billion: 9, t: 12, trillion: 12 });
const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60;

export const VOLUME_REFERENCES = Object.freeze([
  Object.freeze({ id: 'spoon', volumeM3: 0.000015 }),
  Object.freeze({ id: 'cup', volumeM3: 0.00025 }),
  Object.freeze({ id: 'bucket', volumeM3: 0.01 }),
  Object.freeze({ id: 'bath', volumeM3: 0.2 }),
  Object.freeze({ id: 'room', volumeM3: 30 }),
  Object.freeze({ id: 'pool', volumeM3: 2500 }),
  Object.freeze({ id: 'mountain', volumeM3: Math.PI * 1e9 / 3 })
]);

function invalid(key) { return { ok: false, key }; }

export function parseCount(raw) {
  if (raw === null || raw === undefined || raw === '') return invalid('amount-required');
  if (typeof raw !== 'string') return invalid('amount-invalid');
  let value = raw.replace(/[\u00a0\u202f]/g, ' ').trim();
  if (!value) return invalid('amount-required');
  if (value.length > 256) return invalid('amount-invalid');
  let suffixPower = 0;
  const suffix = /^(.*?)\s*(thousand|million|billion|trillion|[kmbt])$/i.exec(value);
  if (suffix) {
    value = suffix[1].trim();
    suffixPower = SUFFIX_POWERS[suffix[2].toLowerCase()];
  }
  let exponent = 0;
  const scientific = /^(.*?)[eE]([+-]?\d+)$/.exec(value);
  if (scientific) {
    if (suffixPower) return invalid('amount-invalid');
    value = scientific[1];
    exponent = Number(scientific[2]);
  }
  const decimal = /^(\d[\d, ]*)?(?:\.(\d+))?$/.exec(value);
  if (!decimal || (!decimal[1] && !decimal[2])) return invalid('amount-invalid');
  const integerPart = decimal[1] || '';
  const fractionPart = decimal[2] || '';
  if (integerPart && !/^\d+$/.test(integerPart)
      && !/^\d{1,3}(?:,\d{3})+$/.test(integerPart)
      && !/^\d{1,3}(?: \d{3})+$/.test(integerPart)) return invalid('amount-invalid');
  let digits = (integerPart.replace(/[, ]/g, '') + fractionPart).replace(/^0+/, '');
  if (!digits) return { ok: true, count: 0n };
  if (!Number.isSafeInteger(exponent)) return invalid(exponent < 0 ? 'amount-whole' : 'amount-too-large');
  let power = exponent + suffixPower - fractionPart.length;
  // Normalizing decimal zeros first avoids allocating an integer for an enormous exponent.
  while (digits.endsWith('0')) { digits = digits.slice(0, -1); power += 1; }
  if (power < 0) return invalid('amount-whole');
  if (digits.length + power > 31) return invalid('amount-too-large');
  const count = BigInt(digits) * 10n ** BigInt(power);
  if (count > MAX_COUNT) return invalid('amount-too-large');
  return { ok: true, count };
}

function countNumber(count) {
  if (typeof count !== 'bigint' || count < 0n) throw new RangeError('amount-invalid');
  if (count > MAX_COUNT) throw new RangeError('amount-too-large');
  // Input counts stay exact; physical and text estimates use approximate arithmetic.
  return Number(count);
}

function positive(value, key) {
  if (!Number.isFinite(value) || value <= 0) throw new RangeError(key);
}

function volume(value) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('volume-invalid');
}

function referenceById(id) {
  const reference = VOLUME_REFERENCES.find(item => item.id === id);
  if (!reference) throw new RangeError('reference-invalid');
  return reference;
}

export function sandModel(count, diameterMm = 0.5, packing = 0.6) {
  const grains = countNumber(count);
  positive(diameterMm, 'sand-invalid-model');
  positive(packing, 'sand-invalid-model');
  if (packing > 1) throw new RangeError('sand-invalid-model');
  const diameterM = diameterMm / 1000;
  const grainVolumeM3 = Math.PI / 6 * diameterM ** 3 / packing;
  positive(grainVolumeM3, 'sand-invalid-model');
  const volumeM3 = grains * grainVolumeM3;
  const liters = volumeM3 * 1000;
  if (!Number.isFinite(liters)) throw new RangeError('sand-invalid-model');
  return { volumeM3, liters, cubeSideM: Math.cbrt(volumeM3) };
}

export function textModel(count, wordsPerBook = 75000) {
  const words = countNumber(count) * 0.75;
  positive(wordsPerBook, 'book-invalid-model');
  const books = words / wordsPerBook;
  if (!Number.isFinite(books)) throw new RangeError('book-invalid-model');
  return { words, books };
}

export function countingModel(count, rate = 1) {
  const items = countNumber(count);
  positive(rate, 'rate-invalid');
  const seconds = items / rate;
  if (!Number.isFinite(seconds)) throw new RangeError('rate-invalid');
  return { seconds, years: seconds / SECONDS_PER_YEAR };
}

export function chooseReference(volumeM3) {
  volume(volumeM3);
  if (volumeM3 === 0) return VOLUME_REFERENCES[0];
  let best = VOLUME_REFERENCES[0];
  let bestDistance = Infinity;
  for (const reference of VOLUME_REFERENCES) {
    const distance = Math.abs(Math.log10(volumeM3) - Math.log10(reference.volumeM3) - 1);
    if (distance < bestDistance) { best = reference; bestDistance = distance; }
  }
  return best;
}

export function compareVolume(volumeM3, referenceId) {
  volume(volumeM3);
  const reference = referenceById(referenceId);
  return { ratio: volumeM3 / reference.volumeM3, inverse: volumeM3 === 0 ? null : reference.volumeM3 / volumeM3 };
}

export function countForVolume(referenceId, diameterMm = 0.5, packing = 0.6) {
  const reference = referenceById(referenceId);
  const grainVolumeM3 = sandModel(1n, diameterMm, packing).volumeM3;
  const estimate = reference.volumeM3 / grainVolumeM3;
  if (!Number.isFinite(estimate)) throw new RangeError('amount-too-large');
  // Reverse estimates are rounded whole counts, not exact physical measurements.
  const count = BigInt(Math.round(estimate));
  countNumber(count);
  return count;
}
