/**
 * The whole analysis as plain text, for saving or pasting into a bug report.
 *
 * Plain text rather than JSON, and rather than a screenshot, because the thing
 * people do with this is paste it somewhere a person will read it - an issue,
 * a message to whoever made the file, a note to themselves. A fixed-width table
 * survives that; JSON turns into an argument about formatting, and a screenshot
 * cannot be searched.
 *
 * Everything in it comes from the same functions the page renders from, so the
 * file and the screen cannot disagree. The filename is the only thing here that
 * is not derived: it is the GIF's own name with `.txt` on the end.
 */

import { DISPOSALS } from './gif.js';
import { duration, isFullCanvas } from './frames.js';
import { clock, count, delay, exact, fileSize, hex, percent, rate } from './format.js';

const RULE = '-'.repeat(64);

/**
 * How wide a string is in a fixed-width font.
 *
 * A CJK character occupies two cells, and `String.length` counts one, so a
 * Japanese heading padded by its length leaves the column short by however
 * many characters it has. This report is meant to be pasted somewhere a
 * person reads it, and a table whose columns do not line up is not one.
 */
const columns = (text) => [...text].reduce((n, ch) => n
  + (/[\u1100-\u115f\u2e80-\u303e\u3041-\u33ff\u3400-\u4dbf\u4e00-\u9fff\ua000-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/.test(ch) ? 2 : 1), 0);

/** padEnd, counting cells rather than characters. */
const pad = (text, wide) => text + ' '.repeat(Math.max(0, wide - columns(text)));

/**
 * @param {object} gif  as returned by parseGif
 * @param {object} view  what main.js worked out: `{name, budget, findings, colors, waste}`
 * @param {(key: string, values?: object) => string} t  a phrase, by key
 * @returns {string}
 */
export function report(gif, view, t) {
  const lines = [];
  const say = (text = '') => lines.push(text);
  const heading = (text) => {
    say();
    say(text);
    say(RULE);
  };

  say(t('report.title', { name: view.name }));
  say(RULE);
  say(t('report.provenance'));

  heading(t('report.file'));
  const timing = duration(gif.frames);
  const table = [
    [t('report.version'), `GIF${gif.version}`],
    [t('report.canvas'), t('report.pixels', { width: gif.width, height: gif.height })],
    [t('report.size'),
      t('report.bothsizes', { rounded: fileSize(gif.size), exact: exact(gif.size, t) })],
    [t('report.frames'), count(gif.frames.length)],
    [t('report.runsfor'), t('report.aswritten', { time: clock(timing.nominal, t) })],
  ];
  if (timing.clamped > 0) {
    table.push([t('report.actually'),
      t('report.clamped', { time: clock(timing.real, t), n: count(timing.clamped) })]);
  }
  const fps = rate(gif.frames.length, timing.real);
  if (fps) table.push([t('report.rate'), t('report.persecond', { fps: fps.toFixed(1) })]);
  table.push([t('report.loops'), gif.loop === null ? t('report.noloop')
    : gif.loop === 0 ? t('loops.forever') : t('loops.times', { n: count(gif.loop) })]);
  table.push([t('report.globalpal'), gif.globalPalette
    ? t('report.colours', { n: count(gif.globalPalette.count) }) : t('report.nopalette')]);
  if (view.colors !== undefined) table.push([t('report.drawn'), count(view.colors)]);
  table.push([t('report.background'), String(gif.backgroundIndex)]);
  // The column is as wide as the widest label rather than a fixed 18: a
  // longer word in another language should widen it, not run into the value.
  const label = Math.max(...table.map(([name]) => columns(name)));
  for (const [name, value] of table) say(`${pad(name, label + 2)}${value}`);

  heading(t('report.budget'));
  const total = t('report.total');
  const labels = new Map(view.budget.rows.map((row) => [row.key, t(row.label)]));
  const width = Math.max(columns(total), ...[...labels.values()].map(columns));
  for (const row of view.budget.rows) {
    if (row.bytes === 0 && row.key !== 'pixels') continue;
    say(`${pad(labels.get(row.key), width + 2)}${String(row.bytes).padStart(10)}  `
      + `${percent(row.share).padStart(6)}  ${bar(row.share)}`);
  }
  say(`${pad(total, width + 2)}${String(gif.size).padStart(10)}`);

  if (view.findings.length > 0) {
    heading(t('report.findings'));
    for (const finding of view.findings) {
      const values = fill(finding.values, t);
      say(`[${finding.level}] ${plain(t(finding.title, values))}`);
      say(wrap(plain(t(finding.body, values)), 4));
      say();
    }
    lines.pop();
  }

  if (gif.frames.length > 0) {
    heading(t('report.frametable'));
    // The header and the rows are laid out from the same list of widths, so
    // they cannot drift apart - which is the failure a hand-spaced header has
    // every time a column changes.
    // The width is the wider of the published column and its own heading, so
    // a longer word in another language widens the column rather than
    // overflowing it.
    const grid = [
      [t('column.index'), 4, 'right'],
      [t('column.at'), 9, 'right'],
      [t('column.size'), 9, 'right'],
      [t('column.delay'), 6, 'right'],
      [t('column.disposal'), 28, 'left'],
      [t('column.palette'), 8, 'left'],
      [t('column.bytes'), 7, 'right'],
    ].map(([label, wide, align]) => [label, Math.max(wide, columns(label)), align]);
    const line = (values) => values
      .map((value, at) => (grid[at][2] === 'right'
        ? ' '.repeat(Math.max(0, grid[at][1] - columns(String(value)))) + value
        : pad(String(value), grid[at][1])))
      .join('  ')
      .trimEnd();

    say(line(grid.map(([label]) => label)));
    for (const frame of gif.frames) {
      say(`${line([
        frame.index + 1,
        `${frame.left},${frame.top}`,
        `${frame.width}x${frame.height}`,
        delay(frame.delay, t),
        t(DISPOSALS[frame.disposal] ?? 'disposal.reserved', { n: frame.disposal }),
        frame.palette
          ? t('report.localpalette', { colours: frame.palette.count })
          : t('report.globalpalette'),
        frame.bytes,
      ])}${isFullCanvas(gif, frame) ? `  ${t('report.fullcanvas')}` : ''}`);
    }
  }

  const notes = gif.extensions.filter((extension) => extension.text);
  if (notes.length > 0) {
    heading(t('report.text'));
    for (const extension of notes) {
      say(`${extension.name} (${fileSize(extension.bytes)}):`);
      say(wrap(extension.text.replace(/\s+/g, ' ').trim().slice(0, 2000), 4));
      say();
    }
    lines.pop();
  }

  if (gif.globalPalette) {
    heading(t('report.palette'));
    const swatches = [];
    for (let index = 0; index < gif.globalPalette.count; index += 1) {
      swatches.push(hex(gif.globalPalette.colors, index));
    }
    for (let at = 0; at < swatches.length; at += 8) {
      say(`  ${swatches.slice(at, at + 8).join('  ')}`);
    }
  }

  say();
  return `${lines.join('\n')}\n`;
}

/** A finding's blanks, with any that are themselves a phrase resolved. */
const fill = (values = {}, t) => Object.fromEntries(Object.entries(values)
  .map(([name, value]) => [name, value?.key ? t(value.key, value.values) : value]));

/** A share of the file, as a row of blocks. Twenty wide, so it fits a message. */
const bar = (share) => '#'.repeat(Math.max(share > 0 ? 1 : 0, Math.round(share * 20)));

/** The findings are written as HTML for the page; this is the same words without it. */
const plain = (fragment) => fragment
  .replace(/<[^>]+>/g, '')
  .replace(/&times;/g, 'x')
  .replace(/&ldquo;|&rdquo;/g, '"')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, ' ');

/** Wrap to something that survives being pasted into a comment box. */
function wrap(text, indent) {
  const pad = ' '.repeat(indent);
  const out = [];
  let line = pad;
  for (const word of text.split(/\s+/)) {
    if (line.length + word.length + 1 > 76 && line !== pad) {
      out.push(line);
      line = pad;
    }
    line += (line === pad ? '' : ' ') + word;
  }
  if (line !== pad) out.push(line);
  return out.join('\n');
}
