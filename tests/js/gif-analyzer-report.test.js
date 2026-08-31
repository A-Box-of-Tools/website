/**
 * tools/gif-analyzer/src/format.js and report.js - the numbers, and the file
 * somebody pastes into a bug report.
 *
 * Two different kinds of risk, in one place because the second is built out of
 * the first.
 *
 * `format.js` exists so that the same quantity reads the same way in the
 * summary, the byte table and the report. Three copies of "round it unless it
 * is small" is how a page says 1.0 KB in one row and 1 KB in the next, so the
 * thresholds are pinned here rather than left to whoever reads the code.
 *
 * `report.js` writes a fixed-width table, and the way a fixed-width table fails
 * is silent: a heading in Japanese occupies two cells per character and one
 * `String.length` each, so a column padded by length comes out narrow and every
 * row below it steps sideways. Nothing throws, the file is still produced, and
 * it is unreadable only to the people whose language did it. So the alignment
 * tests below measure the built report in cells rather than characters, and one
 * of them puts the whole thing through a translator that answers in Japanese.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { GifWriter } from '../../tools/gif-maker/src/gif.js';
import { parseGif } from '../../tools/gif-analyzer/src/gif.js';
import { budget } from '../../tools/gif-analyzer/src/budget.js';
import { findings } from '../../tools/gif-analyzer/src/findings.js';
import { report } from '../../tools/gif-analyzer/src/report.js';
import {
  clock, count, delay, fileSize, hex, percent, plural, rate,
} from '../../tools/gif-analyzer/src/format.js';

/* ------------------------------------------------------------------ format */

test('a file size changes unit where a person would', () => {
  // The boundaries are the whole content of this function. A byte either side
  // of each is checked, because an off-by-one here reads as plausible forever.
  assert.equal(fileSize(0), '0 B');
  assert.equal(fileSize(1023), '1023 B');
  assert.equal(fileSize(1024), '1.0 KB');
  // Under 10 KB keeps a decimal; at 10 KB it stops being worth one.
  assert.equal(fileSize(10239), '10.0 KB');
  assert.equal(fileSize(10240), '10 KB');
  assert.equal(fileSize(1048575), '1024 KB');
  assert.equal(fileSize(1048576), '1.00 MB');
  assert.equal(fileSize(10485759), '10.00 MB');
  assert.equal(fileSize(10485760), '10.0 MB');
});

test('a delay is written in the only unit a GIF has', () => {
  // Zero means "as fast as possible" and is written as such rather than as
  // 0.00, which would read as a measurement.
  assert.equal(delay(0, say), 'unit.seconds n=0');
  assert.equal(delay(1, say), 'unit.seconds n=0.01');
  assert.equal(delay(8, say), 'unit.seconds n=0.08');
  // Under ten seconds keeps both decimals; at ten it drops to one.
  assert.equal(delay(999, say), 'unit.seconds n=9.99');
  assert.equal(delay(1000, say), 'unit.seconds n=10.0');
  // The longest a 16-bit count of hundredths can express.
  assert.equal(delay(65535, say), 'unit.seconds n=655.4');
});

test('a duration becomes minutes and seconds where that reads better', () => {
  assert.equal(clock(0, say), 'unit.seconds n=0.00');
  assert.equal(clock(950, say), 'unit.seconds n=9.50');
  assert.equal(clock(1000, say), 'unit.seconds n=10.0');
  assert.equal(clock(5999, say), 'unit.seconds n=60.0');
  assert.equal(clock(6000, say), 'clock.minutes minutes=1 seconds=0.0');
  assert.equal(clock(9050, say), 'clock.minutes minutes=1 seconds=30.5');
});

test('a frame rate needs two frames and some time to divide', () => {
  assert.equal(rate(0, 100), null);
  assert.equal(rate(1, 100), null);
  assert.equal(rate(2, 0), null);
  assert.equal(rate(10, 100), 10);
  assert.equal(rate(3, 25), 12);
});

test('a share is rounded without ever rounding away to nothing', () => {
  // A row that is 0.04% of the file is not 0%: the whole point of the table is
  // that every byte is somewhere, so a visible row must not read as empty.
  assert.equal(percent(0), '0%');
  assert.equal(percent(0.0004), '<0.1%');
  assert.equal(percent(0.001), '0.1%');
  assert.equal(percent(0.099), '9.9%');
  assert.equal(percent(0.1), '10%');
  assert.equal(percent(1), '100%');
});

test('a palette entry is hex a person can paste somewhere', () => {
  const colors = Uint8Array.from([255, 0, 0, 0, 128, 0, 1, 2, 3]);
  assert.equal(hex(colors, 0), '#FF0000');
  assert.equal(hex(colors, 1), '#008000');
  // Single digits are padded, or the string is not a colour.
  assert.equal(hex(colors, 2), '#010203');
});

test('one and many are two sentences rather than a suffix', () => {
  // A language whose plural is not an s on the end has to be able to write
  // both out, and one with no plural writes the same words twice.
  assert.equal(plural(1, 'frames', say), 'frames.one n=1');
  assert.equal(plural(0, 'frames', say), 'frames.many n=0');
  assert.equal(plural(2, 'frames', say), 'frames.many n=2');
});

test('a count is grouped the way the reader\'s locale groups it', () => {
  assert.equal(count(1000), (1000).toLocaleString());
});

/* ------------------------------------------------------------------ report */

test('the report names the file and everything in it', () => {
  const text = build(gifOf({ frames: 3, width: 6, height: 4 }));

  assert.ok(text.startsWith('report.title name=example.gif'));
  // The provenance line is why the file can be pasted anywhere: it says what
  // made it. Losing it makes the report anonymous.
  assert.ok(text.includes('report.provenance'));
  assert.ok(text.includes('report.version'));
  assert.ok(text.includes('report.frametable'));
  assert.ok(text.endsWith('\n'));
});

test('every frame gets exactly one row', () => {
  const text = build(gifOf({ frames: 5 }));
  const rows = tableRows(text);

  assert.equal(rows.length, 5);
  // Numbered from one, because the person reading this is counting pictures.
  assert.deepEqual(rows.map((row) => row.trim().split(/\s+/)[0]), ['1', '2', '3', '4', '5']);
});

test('the frame table lines up, header and rows alike', () => {
  const text = build(gifOf({ frames: 4 }));
  const header = tableHeader(text);

  // The palette column is left-aligned, so its content starts exactly where
  // its field does - in the heading, and in every row under it.
  const wanted = startOf(header, 'column.palette');
  for (const [index, row] of tableRows(text).entries()) {
    assert.equal(startOf(row, 'global'), wanted,
      `frame row ${index + 1} does not line up:\n${header}\n${row}`);
  }
});

test('a CJK heading widens its column rather than breaking it', () => {
  // The failure this exists for. Every heading in front of this column is
  // wider in cells than it is in characters, so padding counted by length
  // leaves the header and the rows disagreeing about where the column starts -
  // and the report is still produced, and still says all the right things.
  const text = build(gifOf({ frames: 3 }), japanese);
  const header = tableHeader(text);

  assert.ok(/[぀-ヿ一-鿿]/.test(header), 'the fixture did not translate');

  const wanted = startOf(header, '配色');
  for (const [index, row] of tableRows(text).entries()) {
    assert.equal(startOf(row, 'global'), wanted,
      `frame row ${index + 1} does not line up:\n${header}\n${row}`);
  }
});

test('the summary column is as wide as its widest label, in cells', () => {
  // The label column is sized to the widest label rather than to a fixed
  // number, so a longer word in another language widens it instead of running
  // into the value beside it. Every value in the block therefore starts at the
  // same cell, which is only true if the widening counted cells.
  const text = build(gifOf({ frames: 2 }), japanese);
  const block = section(text, 'report.file');
  const starts = block.map(valueStart);

  assert.ok(block.length >= 5, `the summary block was not found:\n${block.join('\n')}`);
  // Every line has to be a label and a value with a gap between them. A label
  // that outgrew its column runs straight into its value and has no gap at
  // all, so dropping the unreadable lines here would drop the broken ones.
  assert.ok(starts.every((n) => n !== null),
    `a label ran into its value:\n${block.join('\n')}`);
  assert.equal(new Set(starts).size, 1,
    `values start at ${[...new Set(starts)].join(', ')}:\n${block.join('\n')}`);
});

test('the byte table adds up to the size of the file', () => {
  const gif = gifOf({ frames: 4 });
  const rows = section(build(gif), 'report.budget');

  // The last line of the block is the total, and it is the file's own length.
  assert.equal(Number(rows.at(-1).trim().split(/\s+/).at(-1)), gif.size);
});

test('a row worth no bytes is left out, and pixels never are', () => {
  // A GIF with no local palettes and no metadata has several empty rows. They
  // are noise in a text report, but "0 bytes of pixels" is a real finding.
  const rows = section(build(gifOf({ frames: 2 })), 'report.budget');

  assert.ok(rows.some((row) => row.startsWith('budget.pixels.label')));
  assert.ok(!rows.some((row) => row.startsWith('budget.local.label')),
    'an empty local-palette row was printed');
});

test('a share too small to draw still draws one block', () => {
  // The bar is how the table is read at a glance, so a row with bytes in it
  // and no bar at all reads as an empty row.
  const rows = section(build(gifOf({ frames: 6, width: 40, height: 40 })), 'report.budget');

  // Read from the front rather than the back: a row whose bar went missing has
  // one field fewer, so counting from the end would quietly measure the label
  // instead and skip the very row this test exists for.
  let tiny = 0;
  for (const row of rows.slice(0, -1)) {
    const parts = row.match(/^\S+\s+(\d+)\s+(\S+)\s*(#*)$/);
    assert.ok(parts, `unreadable budget row:\n${row}`);
    const [, bytes, share, bar] = parts;
    assert.ok(bar.length >= 1, `no bar on a row of ${bytes} bytes (${share}):\n${row}`);
    if (bar.length === 1 && share !== '100%') tiny += 1;
  }
  // And the fixture has to contain such a row, or the assertion above is only
  // ever checking rows that would have drawn a bar anyway.
  assert.ok(tiny > 0, 'no row was small enough to round away');
});

test('a loop count is said three different ways', () => {
  assert.ok(build(gifOf({ frames: 2, loop: 0 })).includes('loops.forever'));
  assert.ok(build(gifOf({ frames: 2, loop: 3 })).includes('loops.times n=3'));

  // No Netscape block at all is not the same as looping zero times. The writer
  // next door always writes one, so the field is cleared here instead of by
  // hand-assembling a second fixture to carry one absent block.
  const silent = { ...gifOf({ frames: 2 }), loop: null };
  assert.ok(report(silent, viewOf(silent), page).includes('report.noloop'));
});

test('the findings arrive as words rather than as markup', () => {
  // They are written as HTML for the page. A text file carrying <b> and
  // &times; is a text file somebody has to clean up before pasting it.
  const text = build(gifOf({ frames: 3, width: 40, height: 40 }), markup);
  const block = section(text, 'report.findings').join('\n');

  assert.ok(block.length > 0, 'no findings were reported');
  assert.ok(!/[<>]/.test(block), `markup survived into the report:\n${block}`);
  assert.ok(!/&\w+;/.test(block), `an HTML entity survived into the report:\n${block}`);
  // The entities are replaced by what they meant, not deleted.
  assert.ok(block.includes('40x40') && block.includes('"here"') && block.includes('&'));
});

test('a finding\'s body is wrapped to something a comment box will hold', () => {
  const text = build(gifOf({ frames: 3, width: 40, height: 40 }), longWinded);
  // Only the findings block is wrapped; the frame table indents its own rows
  // and they are as wide as the table needs them to be.
  const wrapped = section(text, 'report.findings').filter((line) => line.startsWith('    '));

  assert.ok(wrapped.length > 1, 'nothing was wrapped');
  for (const line of wrapped) assert.ok(line.length <= 76, `${line.length} columns: ${line}`);
});

test('the palette is listed eight colours to a line', () => {
  const lines = section(build(gifOf({ frames: 2 })), 'report.palette');

  assert.ok(lines.length > 0);
  for (const line of lines) {
    const swatches = line.trim().split(/\s+/);
    assert.ok(swatches.length <= 8, `${swatches.length} swatches on one line`);
    for (const swatch of swatches) assert.match(swatch, /^#[0-9A-F]{6}$/);
  }
});

/* ---------------------------------------------------------------- fixtures */

/** Four colours, deliberately not greyscale so a channel swap would show. */
const PALETTE = Uint8Array.from([255, 0, 0, 0, 128, 0, 0, 0, 255, 250, 250, 40]);

/** A GIF with n frames, parsed - a real file, written by the tool next door. */
function gifOf({ frames = 3, width = 6, height = 4, loop = 0 } = {}) {
  const writer = new GifWriter({ width, height, palette: PALETTE, loop });
  for (let index = 0; index < frames; index += 1) {
    writer.addFrame({
      indices: new Uint8Array(width * height).fill(index % 4),
      delay: 8 + index,
    });
  }
  return parseGif(writer.finalize());
}

/**
 * The view main.js hands the report. `colors` is already a number by the time
 * it arrives - main.js counts the set - so the decode that produces it is not
 * repeated here: what is under test on this side is the layout, and the
 * analyzer's own suite already checks the counting.
 */
const viewOf = (gif) => ({
  name: 'example.gif',
  budget: budget(gif),
  findings: findings(gif, {}),
  colors: 4,
});

const build = (gif, t = page) => report(gif, viewOf(gif), t);

/**
 * Stands in for phrase() where what is asserted is the key. The real one reads
 * the markup; this writes the key and its blanks, because the sentence is
 * body.html's in fifteen languages.
 */
function say(key, values = {}) {
  const filled = Object.entries(values).map(([k, v]) => `${k}=${v}`).join(' ');
  return filled ? `${key} ${filled}` : String(key);
}

/**
 * The same, except that the handful of keys landing inside a table cell answer
 * with something the length of a real translation.
 *
 * A key written out in full is wider than the column it sits in, and a fixture
 * that overflows every column cannot say anything about whether the columns
 * were the right width - which is the whole point of the tests that use this.
 */
const CELLS = {
  'unit.seconds': ({ n }) => `${n}s`,
  'disposal.unspecified': () => 'none',
  'disposal.keep': () => 'keep',
  'disposal.background': () => 'clear',
  'disposal.restore': () => 'restore',
  'disposal.reserved': ({ n }) => `reserved ${n}`,
  'report.globalpalette': () => 'global',
  'report.localpalette': ({ colours }) => `local ${colours}`,
  'report.fullcanvas': () => 'full',
};

const page = (key, values = {}) => (CELLS[key] ? CELLS[key](values) : say(key, values));

/** A translator that answers in Japanese, so the columns are measured in cells. */
function japanese(key, values = {}) {
  const words = {
    'column.index': '番号',
    'column.at': '位置',
    'column.size': '大きさ',
    'column.delay': '待ち時間',
    'column.disposal': '破棄の方法',
    'column.palette': '配色',
    'column.bytes': 'バイト数',
    'report.version': 'バージョン',
    'report.canvas': '画面の大きさ',
    'report.size': 'ファイルの大きさ',
    'report.frames': 'フレーム数',
    'report.runsfor': '再生時間',
    'report.loops': '繰り返し',
    'report.globalpal': '全体の配色',
    'report.drawn': '使用色数',
    'report.background': '背景色',
  };
  return words[key] ?? page(key, values);
}

/** A translator that answers findings in the HTML the page renders. */
const markup = (key, values = {}) => (String(key).startsWith('find.')
  ? '<b>A finding</b> about 40&times;40 &amp; friends &ldquo;here&rdquo;'
  : page(key, values));

/** A translator whose findings are long enough to need wrapping. */
const longWinded = (key, values = {}) => (String(key).startsWith('find.')
  ? Array(40).fill('a reasonably long clause about the file').join(' ')
  : page(key, values));

/* ----------------------------------------------------------------- helpers */

/** How wide a string is in a fixed-width font, counting CJK as two cells. */
const cells = (text) => [...text].reduce((n, ch) => n
  + (/[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/.test(ch) ? 2 : 1), 0);

/** The lines of one section, between its rule and the blank line after it. */
function section(text, heading) {
  const lines = text.split('\n');
  const at = lines.findIndex((line) => line.startsWith(heading));
  assert.ok(at >= 0, `no ${heading} section in the report`);
  const out = [];
  for (let i = at + 2; i < lines.length && lines[i] !== ''; i += 1) out.push(lines[i]);
  return out;
}

const tableHeader = (text) => section(text, 'report.frametable')[0];
const tableRows = (text) => section(text, 'report.frametable').slice(1);

/**
 * How far into a line, in cells, a piece of text starts.
 *
 * This is the measurement the whole table rests on. A left-aligned column is
 * the one worth anchoring to: its content begins exactly where its field
 * begins, so everything in front of it - including a heading a translator
 * widened - has to have been counted in cells for the answer to match.
 */
function startOf(line, text) {
  const at = line.indexOf(text);
  assert.ok(at >= 0, `"${text}" is not in:\n${line}`);
  return cells(line.slice(0, at));
}

/** Where the value in a `label  value` line begins, in cells. */
function valueStart(line) {
  const parts = line.match(/^(\S+(?: \S+)*?)( {2,})(\S.*)$/);
  return parts ? cells(parts[1]) + parts[2].length : null;
}
