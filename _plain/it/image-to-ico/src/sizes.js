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
 */

/**
 * Every size this tool will put in an .ico, with what wants it.
 *
 * @type {{px: number, why: string}[]}
 */
export const SIZES = [
  { px: 16, why: 'browser tab, address bar, and the small icon in Explorer' },
  { px: 20, why: 'Windows list views at 125%' },
  { px: 24, why: 'the Windows taskbar at 150%' },
  { px: 32, why: 'the desktop, the taskbar, and a browser bookmark bar' },
  { px: 40, why: 'the desktop at 125%' },
  { px: 48, why: 'Explorer’s medium icons, and what Google reads a favicon at' },
  { px: 64, why: 'Explorer at 200%, and the Alt-Tab switcher' },
  { px: 96, why: 'Explorer’s large icons' },
  { px: 128, why: 'the old jumbo size, still read by installers' },
  { px: 256, why: 'Explorer’s extra-large icons and the Start menu; the largest an .ico holds' },
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
 * @property {string} label
 * @property {string} note      shown under the choice
 * @property {number[]} sizes
 * @property {'auto'|'png'|'bmp'} storage  how the entries are stored
 */

/** @type {Preset[]} */
export const PRESETS = [
  {
    id: 'website',
    label: 'Website favicon',
    note: 'The classic favicon.ico that goes at the root of a site. Three sizes is '
      + 'the whole convention: 16 for the tab, 32 for a bookmark and a Windows '
      + 'shortcut, 48 because that is the size Google reads a site icon at.',
    sizes: [16, 32, 48],
    storage: 'auto',
  },
  {
    id: 'app',
    label: 'Windows application icon',
    note: 'What an .exe or a shortcut wants, and what Visual Studio’s own '
      + 'app.ico contains: the three shell sizes plus the 256 that the Start '
      + 'menu and Explorer’s extra-large view draw from.',
    sizes: [16, 32, 48, 256],
    storage: 'auto',
  },
  {
    id: 'app-hidpi',
    label: 'Windows application, every scale',
    note: 'The same icon with the in-between sizes Windows asks for at 125%, '
      + '150% and 200% display scaling. Bigger file, and the only version that '
      + 'is not quietly resampled on a high-DPI laptop.',
    sizes: [16, 20, 24, 32, 40, 48, 64, 96, 128, 256],
    storage: 'auto',
  },
  {
    id: 'legacy',
    label: 'Maximum compatibility',
    note: 'Three sizes, every one of them stored the pre-Vista way, for '
      + 'installers, embedded devices and old shell tooling that reads an .ico '
      + 'itself and does not know what a PNG inside one is.',
    sizes: [16, 32, 48],
    storage: 'bmp',
  },
  {
    id: 'custom',
    label: 'Choose the sizes yourself',
    note: 'Every size this format can hold. Ticking all of them is rarely the '
      + 'right answer: each one is a whole picture, and nothing reads a size '
      + 'nothing asked for.',
    sizes: [16, 32, 48],
    storage: 'auto',
  },
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
