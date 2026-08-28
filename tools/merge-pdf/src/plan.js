/**
 * Which pages, and how many files they come out as.
 *
 * Two small languages, both of them typed by people rather than generated:
 *
 *   "1-3, 8, 12-"   which pages a bulk action applies to
 *   "4, 9, 15"      where a document is cut
 *
 * Neither is worth a parser generator, and both are worth being strict about.
 * A range box that silently ignores what it could not understand is how
 * somebody deletes forty pages they meant to keep, so anything unparseable is
 * reported as itself - `parseRanges` hands back the text it choked on and the
 * interface refuses to run until it is fixed.
 *
 * Page numbers here are 1-based everywhere, because that is what is on the
 * screen and what the person typing is counting. They become indices exactly
 * once, at the edge of this file.
 */

/**
 * Parse "1-3, 8, 12-" against a document of `total` pages.
 *
 * @param {string} text
 * @param {number} total
 * @returns {{pages: number[], error: string}} pages is sorted, deduplicated,
 *   and 1-based; error is empty when the whole string was understood.
 */
export function parseRanges(text, total, t) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return { pages: [], error: '' };

  const wanted = new Set();
  const bad = [];

  for (const piece of trimmed.split(/[,;]+/)) {
    const part = piece.trim();
    if (!part) continue;

    const word = part.toLowerCase();
    if (word === 'all') {
      for (let n = 1; n <= total; n += 1) wanted.add(n);
      continue;
    }
    if (word === 'odd' || word === 'even') {
      const start = word === 'odd' ? 1 : 2;
      for (let n = start; n <= total; n += 2) wanted.add(n);
      continue;
    }
    if (word === 'last') {
      if (total) wanted.add(total);
      continue;
    }

    // A range, with either end allowed to be missing: "-4" is up to four and
    // "12-" is twelve to the end. Both are how people write it.
    const range = /^(\d*)\s*(?:-|–|\.\.|to)\s*(\d*)$/.exec(part);
    if (range && (range[1] || range[2])) {
      const from = range[1] ? Number(range[1]) : 1;
      const to = range[2] ? Number(range[2]) : total;
      if (from < 1 || to < 1 || from > total || to > total) {
        bad.push(part);
        continue;
      }
      const [low, high] = from <= to ? [from, to] : [to, from];
      for (let n = low; n <= high; n += 1) wanted.add(n);
      continue;
    }

    if (/^\d+$/.test(part)) {
      const n = Number(part);
      if (n >= 1 && n <= total) wanted.add(n);
      else bad.push(part);
      continue;
    }

    bad.push(part);
  }

  const pages = [...wanted].sort((a, b) => a - b);
  if (!bad.length) return { pages, error: '' };

  // Two whole sentences. The English one chose a demonstrative, a verb and
  // a noun with three separate ternaries, which is a sentence built out of
  // English grammar rather than one a translator can be handed.
  return {
    pages,
    error: t(bad.length === 1 ? 'range.bad.one' : 'range.bad.many', {
      list: bad.join(', '),
      // A second number, and a second sentence: how many pages there are has
      // nothing to do with how many things could not be read, and English
      // makes a different word agree with each.
      total: t(total === 1 ? 'range.total.one' : 'range.total.many', { n: total }),
    }),
  };
}

/** "1-3, 8, 12-14", the way a person would write the set back. The inverse of
 *  the parser above, and used to show what a click just selected. */
export function describeRanges(pages, t) {
  if (!pages.length) return t('range.none');

  const runs = [];
  let start = pages[0];
  let last = pages[0];

  for (const page of pages.slice(1)) {
    if (page === last + 1) {
      last = page;
      continue;
    }
    runs.push([start, last]);
    start = page;
    last = page;
  }
  runs.push([start, last]);

  return runs.map(([from, to]) => {
    if (from === to) return String(from);
    if (to === from + 1) return t('range.pair', { from, to });
    return t('range.run', { from, to });
  }).join(', ');
}

/* ------------------------------------------------------------- splitting */

/**
 * Cut the running order into the documents it will be written as.
 *
 * @param {any[]} entries the pages, in output order
 * @param {{mode: string, size: number, at: number[]}} how
 * @returns {{entries: any[], from: number, to: number}[]} each output file,
 *   with the 1-based page numbers it covers, for naming it afterwards.
 */
export function splitInto(entries, { mode = 'single', size = 1, at = [] } = {}) {
  if (!entries.length) return [];

  if (mode === 'each') return entries.map((entry, index) => group([entry], index + 1));

  if (mode === 'every') {
    const step = Math.max(1, Math.floor(size) || 1);
    const parts = [];
    for (let start = 0; start < entries.length; start += step) {
      parts.push(group(entries.slice(start, start + step), start + 1));
    }
    return parts;
  }

  if (mode === 'at') {
    // The numbers name the first page of each new file, so page 1 is never a
    // cut - a cut before the first page would make an empty file.
    const cuts = [...new Set(at.filter((n) => n > 1 && n <= entries.length))]
      .sort((a, b) => a - b);
    const parts = [];
    let start = 0;
    for (const cut of [...cuts, entries.length + 1]) {
      const end = Math.min(cut - 1, entries.length);
      if (end > start) parts.push(group(entries.slice(start, end), start + 1));
      start = end;
    }
    return parts;
  }

  if (mode === 'file') {
    // One output per source document, in the order the pages appear. A run of
    // pages from the same file that is interrupted and comes back is one file,
    // not two, because "split back into the files it came from" is the job.
    const bySource = new Map();
    for (const entry of entries) {
      if (!bySource.has(entry.source)) bySource.set(entry.source, []);
      bySource.get(entry.source).push(entry);
    }
    return [...bySource.values()].map((list) => group(list, 1));
  }

  return [group(entries, 1)];
}

function group(list, from) {
  return { entries: list, from, to: from + list.length - 1 };
}

/**
 * What to call each finished file.
 *
 * The stem is the first source document's name, because in the two cases that
 * matter - one file split, or several merged - that is the name a person would
 * recognise. What follows it says which pages are in it, so that a folder of
 * fifty is readable without opening any of them.
 */
export function outputNames(parts, { stem, mode, suffix = 'edited' }) {
  const base = clean(stem) || 'document';

  const names = parts.map((part) => {
    if (parts.length === 1) return `${base}-${suffix}.pdf`;
    if (mode === 'file') return `${clean(labelOf(part)) || base}.pdf`;
    if (part.from === part.to) return `${base}-page-${part.from}.pdf`;
    return `${base}-pages-${part.from}-${part.to}.pdf`;
  });

  return unique(names);
}

/** Two files in one archive cannot share a name, and splitting by source
 *  document is exactly the case where two of them can. */
function unique(names) {
  const seen = new Map();
  return names.map((name) => {
    const taken = seen.get(name) ?? 0;
    seen.set(name, taken + 1);
    if (!taken) return name;
    return name.replace(/\.pdf$/i, `-${taken + 1}.pdf`);
  });
}

function labelOf(part) {
  return part.entries[0]?.source?.label ?? '';
}

function clean(text) {
  // Whatever the file was called, minus the extension and anything that would
  // make a bad entry in an archive on somebody else's operating system.
  return String(text ?? '').replace(/\.pdf$/i, '')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/** What the archive of a split is called. One prompt instead of fifty. */
export function archiveName(stem) {
  return `${clean(stem) || 'document'}-split.zip`;
}
