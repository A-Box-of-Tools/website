// These are starting settings, not fixed-size posters. The picture count still
// determines the row count and the finished height. Names live in the markup.
const common = {
  background: '#ffffff',
  transparent: false,
  format: 'image/png',
  quality: 90,
};

// A preset never carries a filename: choosing an arrangement must not replace
// the name someone has already given the finished file.
export const PRESETS = Object.freeze({
  square: Object.freeze({
    ...common,
    layout: 'grid', columns: 2, width: 1200, ratio: 'square',
    fit: 'contain', gap: 16, padding: 24,
  }),
  contact: Object.freeze({
    ...common,
    layout: 'grid', columns: 3, width: 1800, ratio: 'landscape',
    fit: 'contain', gap: 20, padding: 32,
  }),
  horizontal: Object.freeze({
    ...common,
    layout: 'horizontal', columns: 1, width: 1600, ratio: 'original',
    fit: 'contain', gap: 16, padding: 24,
  }),
  vertical: Object.freeze({
    ...common,
    layout: 'vertical', columns: 1, width: 1200, ratio: 'original',
    fit: 'contain', gap: 16, padding: 24,
  }),
  portrait: Object.freeze({
    ...common,
    layout: 'grid', columns: 2, width: 1200, ratio: 'portrait',
    fit: 'cover', gap: 16, padding: 24, format: 'image/jpeg',
  }),
  seamless: Object.freeze({
    ...common,
    layout: 'grid', columns: 2, width: 1200, ratio: 'square',
    fit: 'cover', gap: 0, padding: 0, format: 'image/jpeg',
  }),
});
