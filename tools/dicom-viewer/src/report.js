/**
 * The whole header as plain text, for pasting into a message or keeping beside
 * the file.
 *
 * WHY IT IS BUILT HERE AND NOT SCRAPED OFF THE PAGE
 *
 * Because the page shows what fits and this shows everything. The tag table
 * pages a long header and hides the values it has nothing to say about; a report
 * that quietly inherited both would be a report somebody trusted and that was
 * missing the element they were looking for.
 *
 * The layout is deliberately the one `dcmdump` uses - tag, VR, name, value, one
 * element per line, sequences indented - because somebody who wants a text dump
 * of a DICOM header almost certainly already has a tool that produces one, and
 * a format they can diff against it is worth more than a prettier one they
 * cannot.
 */

import { walk } from './dicom.js';
import { describe, formatTag } from './dictionary.js';
import { display } from './values.js';
import { fileSize } from './format.js';

/**
 * @param {object} file    what main.js knows about the open file
 * @param {TextDecoder} decoder
 * @returns {string}
 */
export function report(file, decoder, t) {
  const lines = [];
  const say = (text = '') => lines.push(text);

  // The labels are the caller's - this module cannot reach the markup they
  // live in - and the column is as wide as the widest of them rather than a
  // number counted in English. "Transfer syntax" is fifteen characters and
  // "Übertragungssyntax" is eighteen, and a column measured for the first puts
  // the second's value in the middle of its own label.
  const labels = ['report.filesize', 'report.syntax', 'report.object', 'report.image',
                  'report.frames', 'report.spacing'].map((key) => t(key));
  const width = Math.max(...labels.map((label) => label.length)) + 2;
  const [size, syntax, object, image, frames, spacing] = labels;
  const row = (label, value) => say(`${pad(label, width)}${value}`);

  say(t('report.title', { name: file.name }));
  say('='.repeat(Math.min(72, 16 + file.name.length)));
  say();
  row(size, t('report.size', {
    size: fileSize(file.size),
    bytes: t('report.bytes', { count: file.size.toLocaleString() }),
  }));
  row(syntax, file.syntax.name);
  row('', file.syntax.uid);
  if (file.sopClass) row(object, file.sopClass);

  if (file.image) {
    const { rows, columns, samplesPerPixel, bitsStored, frames: count, photometric } = file.image;
    row(image, `${columns} × ${rows}, ${t('report.bits', { bits: bitsStored })}, ${
      samplesPerPixel === 1
        ? t('report.greyscale')
        : t('report.samples', { count: samplesPerPixel })}, ${photometric}`);
    if (count > 1) row(frames, count);
    if (file.image.spacing) {
      row(spacing, t('report.spacing.value', {
        row: file.image.spacing.row, column: file.image.spacing.column,
      }));
    }
  }

  if (file.warnings.length) {
    const heading = t('report.notes');
    say();
    say(heading);
    say('-'.repeat(heading.length));
    for (const warning of file.warnings) say(`  • ${t(warning.key, warning.values)}`);
  }

  const meta = t('report.meta');
  say();
  say(meta);
  say('-'.repeat(meta.length));
  dump(file.meta, decoder, say, t);

  const dataset = t('report.dataset');
  say();
  say(dataset);
  say('-'.repeat(dataset.length));
  dump(file.dataset, decoder, say, t);

  say();
  say(t('report.origin', { origin: file.origin }));

  return lines.join('\n');
}

/** Every element of a dataset, one per line, nesting and all. */
function dump(dataset, decoder, say, t) {
  if (!dataset || dataset.elements.length === 0) {
    say(`  ${t('report.none')}`);
    return;
  }

  for (const { element, depth } of walk(dataset)) {
    const indent = '  '.repeat(depth + 1);
    const known = describe(element.tag);
    const name = known.name ?? t(known.private ? 'tag.private' : 'tag.unknown');
    const { shown } = display(element, decoder, t);

    // The name column is padded to a width the great majority of names fit in
    // and is allowed to overrun for the few that do not. A column wide enough
    // for "Referring Physician Identification Sequence" would put every value
    // on this page half a screen to the right of where it is read.
    say(`${indent}${formatTag(element.tag)} ${element.vr} ${pad(name, 44 - depth * 2)} ${shown}`);
  }
}

const pad = (text, width) => (text.length >= width ? text : text + ' '.repeat(width - text.length));
