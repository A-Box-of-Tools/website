/**
 * The standards: which sizes go in an icon, and who asked for them.
 *
 * Every number below is somebody's published requirement rather than a round
 * figure that looked sensible. That is the entire difference between this tool
 * and a size box: "16, 32, 48" is not a preference, it is what a browser reads
 * out of a favicon.ico, and 20 and 40 exist because Windows draws the taskbar
 * at 125% and 250% on the machines people actually own.
 *
 * The `why` line for each size is shown beside it on the page. It is here, in
 * the same table as the number, so that a size cannot be added without saying
 * what asks for it - which is how a "complete" icon set ends up at eleven
 * entries and 400 KB with nine of them doing nothing.
 *
 * What is here is the phrase key rather than the sentence. This file is copied
 * byte for byte into every language, so a reason written here would be English
 * at fourteen of them; the words live in body.html and main.js reads them back.
 * A key with no phrase behind it shows on the page as itself, which is the
 * same kind of loud that an empty reason would be.
 */

/**
 * Every size this tool will put in an .ico, with the key of what wants it.
 *
 * @type {{px: number, why: string}[]}
 */
export const SIZES = [
  { px: 16, why: 'why.16' },
  { px: 20, why: 'why.20' },
  { px: 24, why: 'why.24' },
  { px: 32, why: 'why.32' },
  { px: 40, why: 'why.40' },
  { px: 48, why: 'why.48' },
  { px: 64, why: 'why.64' },
  { px: 96, why: 'why.96' },
  { px: 128, why: 'why.128' },
  { px: 256, why: 'why.256' },
];

/** Quick lookup for the note beside a size. */
export const WHY = new Map(SIZES.map(({ px, why }) => [px, why]));

/**
 * A named standard: the sizes it asks for, and the reason to pick it.
 *
 * The four here are not four opinions about the same job. They are the four
 * jobs people actually arrive with - a website, an application, an application
 * that has to look right on a 4K laptop, and a file that has to open in
 * something written twenty years ago - and each one has a different answer.
 *
 * @typedef {object} Preset
 * @property {string} id
 * @property {string} label     phrase key
 * @property {string} note      phrase key, shown under the choice
 * @property {number[]} sizes
 * @property {'auto'|'png'|'bmp'} storage  how the entries are stored
 */

/** @type {Preset[]} */
export const PRESETS = [
  { id: 'website', label: 'preset.website.label', note: 'preset.website.note', sizes: [16, 32, 48], storage: 'auto' },
  { id: 'app', label: 'preset.app.label', note: 'preset.app.note', sizes: [16, 32, 48, 256], storage: 'auto' },
  {
    id: 'app-hidpi',
    label: 'preset.app-hidpi.label',
    note: 'preset.app-hidpi.note',
    sizes: [16, 20, 24, 32, 40, 48, 64, 96, 128, 256],
    storage: 'auto',
  },
  { id: 'legacy', label: 'preset.legacy.label', note: 'preset.legacy.note', sizes: [16, 32, 48], storage: 'bmp' },
  { id: 'custom', label: 'preset.custom.label', note: 'preset.custom.note', sizes: [16, 32, 48], storage: 'auto' },
];

export const presetById = (id) => PRESETS.find((preset) => preset.id === id) ?? PRESETS[0];

/**
 * How one entry of a given size should be stored.
 *
 * 'auto' is the split described at the top of ico.js: a DIB where the saving
 * from PNG would be a few kilobytes, a PNG where it is hundreds. 64 is the
 * dividing line because a 64x64 DIB is 16 KB and a 128x128 one is 65 KB, and
 * the second of those is worth the compatibility it costs.
 *
 * @param {number} px
 * @param {'auto'|'png'|'bmp'} storage
 * @returns {'png'|'bmp'}
 */
export function storageFor(px, storage) {
  if (storage === 'png' || storage === 'bmp') return storage;
  return px > 64 ? 'png' : 'bmp';
}

/**
 * Roughly what a DIB entry of this size costs, before anything is drawn.
 *
 * Exact, in fact - a 32-bit DIB is not compressed, so its size is arithmetic -
 * which is what makes it worth showing next to the sizes as they are ticked.
 * The PNG ones cannot be predicted and are not guessed at.
 */
export const dibBytes = (px) => 40 + px * px * 4 + (((px + 31) >> 5) * 4) * px;
