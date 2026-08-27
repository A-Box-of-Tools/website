/**
 * What stands out about this file.
 *
 * The tables above this on the page are facts. These are readings of them, and
 * they are the reason somebody opens an analyzer rather than a hex editor: a
 * frame table says "delay 1", and what a person wants told is that every
 * browser will play that at ten, so the animation runs five times slower than
 * whatever made it intended.
 *
 * Three rules, because a findings list that cries wolf is worse than no list:
 *
 *  - **Say the number.** "This file spends 41 KB on colour tables" earns its
 *    line; "consider optimising your palette" does not.
 *  - **Only when it is true of this file.** Nothing here fires on a threshold
 *    somebody guessed at. Every level below is either a property of the format
 *    (browsers clamp under 2cs) or a measured quantity with its own arithmetic.
 *  - **Never recommend a tool.** This one reads files; the fixes are elsewhere,
 *    and a findings list that turns into an advertisement stops being a
 *    finding.
 *
 * The levels are `note`, `warn` and `bad`, which is the order they sort in.
 *
 * WHY THIS FILE NAMES ITS SENTENCES RATHER THAN WRITING THEM
 *
 * It used to write them, and they were English in all fifteen languages: this
 * module is copied byte for byte into every locale, as everything under src/
 * is, and a sentence in here is a sentence a German reader gets in English. So
 * each finding now carries the KEY of a title and a body, plus the numbers that
 * fill their blanks; main.js resolves both against #phrases, where the locale
 * machinery already reaches. See shared/js/phrases.js.
 *
 * The keys also took the English grammar out of the arithmetic. This file used
 * to build `redraw${full === 1 ? 's' : ''}` and choose between 'a frame' and
 * 'some frames' - conjugation, decided in a module that cannot know which
 * language is reading it. A count now picks between two whole sentences, `.one`
 * and `.many`, and what agrees with what is the translator's business.
 */

import { isFullCanvas, duration } from './frames.js';

const LEVELS = { bad: 0, warn: 1, note: 2 };

/**
 * @param {object} gif  as returned by parseGif
 * @param {object} stats  what main.js measured while decoding: `{used, decoded,
 *   waste, colors, identical}`. All optional - a file too large to decode still
 *   gets every finding that comes from the structure alone.
 * @returns {{level: string, title: string, body: string, values: object}[]}
 *   `title` and `body` are phrase keys rather than sentences.
 */
export function findings(gif, stats = {}) {
  const out = [];
  const add = (level, title, body, values = {}) => out.push({ level, title, body, values });
  const frames = gif.frames;
  /** `.one` for exactly one and `.many` otherwise: two sentences, not a suffix. */
  const count = (n, key) => `${key}.${n === 1 ? 'one' : 'many'}`;

  // ---------------------------------------------------------- what it is not

  if (frames.length === 0) {
    add('bad', 'find.noframes.title', 'find.noframes.body');
  }

  // The body is the parser's own account of what it ran into, which gif.js
  // names rather than writes for the same reason this file does.
  for (const problem of gif.problems) {
    add('bad', 'find.unclean.title', problem.key, problem.values);
  }

  if (gif.trailingBytes > 0) {
    add('warn', 'find.trailing.title', 'find.trailing.body',
      { bytes: bytes(gif.trailingBytes) });
  }

  // -------------------------------------------------------------- the timing

  if (frames.length > 1) {
    const { nominal, real, clamped } = duration(frames);

    if (clamped > 0) {
      add('warn', count(clamped, 'find.clamped.title'), 'find.clamped.body', {
        count: clamped.toLocaleString(),
        nominal: seconds(nominal),
        real: seconds(real),
        factor: (real / Math.max(nominal, 1)).toFixed(1),
      });
    }

    const zero = frames.filter((frame) => frame.delay === 0).length;
    if (zero > 0 && zero === frames.length) {
      add('warn', 'find.zerodelay.title', 'find.zerodelay.body');
    }

    const delays = new Set(frames.map((frame) => frame.delay));
    if (delays.size > 1) {
      const sorted = [...frames].sort((a, b) => a.delay - b.delay);
      add('note', 'find.uneven.title', 'find.uneven.body', {
        delays: delays.size.toLocaleString(),
        shortest: seconds(sorted[0].delay),
        longest: seconds(sorted[sorted.length - 1].delay),
      });
    }
  }

  // ------------------------------------------------------------ the looping

  if (frames.length > 1) {
    if (gif.loop === null) {
      add('warn', 'find.noloop.title', 'find.noloop.body');
    } else if (gif.loop > 0) {
      add('note', count(gif.loop, 'find.loopcount.title'), 'find.loopcount.body',
        { count: gif.loop.toLocaleString() });
    }
  }

  // ----------------------------------------------------------- the rectangles

  if (frames.length > 1) {
    const full = frames.filter((frame) => isFullCanvas(gif, frame)).length;
    if (full === frames.length) {
      add('warn', 'find.allfull.title', 'find.allfull.body',
        { width: gif.width, height: gif.height });
    } else if (full > 0) {
      add('note', count(full, 'find.somefull.title'), 'find.somefull.body',
        { count: full.toLocaleString(), total: frames.length.toLocaleString() });
    } else {
      add('note', 'find.nonefull.title', 'find.nonefull.body');
    }

    const outside = frames.filter((frame) => (
      frame.left + frame.width > gif.width || frame.top + frame.height > gif.height
    ));
    if (outside.length > 0) {
      add('bad', count(outside.length, 'find.outside.title'),
        count(outside.length, 'find.outside.body'),
        { count: outside.length.toLocaleString(), width: gif.width, height: gif.height });
    }
  }

  // ------------------------------------------------------------ the palettes

  const locals = frames.filter((frame) => frame.palette);
  if (locals.length > 0) {
    const cost = locals.reduce((sum, frame) => sum + frame.palette.bytes, 0);
    const level = cost > gif.size * 0.1 ? 'warn' : 'note';
    add(level, count(locals.length, 'find.localpal.title'), 'find.localpal.body', {
      count: locals.length.toLocaleString(),
      bytes: bytes(cost),
      share: share(cost, gif.size),
    });
  }

  if (!gif.globalPalette && frames.length > 0) {
    add('note', 'find.noglobal.title', 'find.noglobal.body');
  }

  if (stats.waste && stats.waste.wastedEntries > 0) {
    const { wastedEntries, wastedBytes, declared, referenced } = stats.waste;
    const level = wastedBytes > gif.size * 0.05 ? 'warn' : 'note';
    add(level, 'find.waste.title', 'find.waste.body', {
      entries: wastedEntries.toLocaleString(),
      bytes: bytes(wastedBytes),
      declared: declared.toLocaleString(),
      referenced: referenced.toLocaleString(),
    });
  }

  if (stats.colors !== undefined && frames.length > 0) {
    // Two bodies rather than one with a clause: under sixty-four colours is
    // artwork and the advice is about dithering; above it the file is a
    // photograph and the advice is about why it is large.
    add('note', count(stats.colors, 'find.colors.title'),
      stats.colors <= 64 ? 'find.colors.body.flat' : 'find.colors.body.photo',
      { count: stats.colors.toLocaleString() });
  }

  // ------------------------------------------------------------ the metadata

  for (const extension of gif.extensions) {
    if (extension.kind === 'comment') {
      add('note', 'find.comment.title', 'find.comment.body',
        { bytes: bytes(extension.dataBytes) });
    } else if (extension.name.startsWith('XMP')) {
      const level = extension.bytes > gif.size * 0.05 ? 'warn' : 'note';
      add(level, 'find.xmp.title', 'find.xmp.body',
        { bytes: bytes(extension.bytes), share: share(extension.bytes, gif.size) });
    } else if (extension.name.startsWith('ICCRGBG1')) {
      add('note', 'find.icc.title', 'find.icc.body', { bytes: bytes(extension.bytes) });
    } else if (extension.kind === 'plain-text') {
      add('note', 'find.plaintext.title', 'find.plaintext.body');
    } else if (extension.kind === 'application' && extension.loop === undefined) {
      // The only value on this page that comes out of somebody else's file and
      // reaches a string rendered as markup, so it is escaped here. An
      // eight-byte identifier field is not markup, but it is bytes from a file
      // this tool did not write, and that is the whole argument.
      add('note', 'find.appblock.title', 'find.appblock.body',
        { name: escape(extension.name), bytes: bytes(extension.bytes) });
    }
  }

  // ----------------------------------------------------------- the machinery

  const interlaced = frames.filter((frame) => frame.interlaced).length;
  if (interlaced > 0) {
    add('note', count(interlaced, 'find.interlaced.title'), 'find.interlaced.body',
      { count: interlaced.toLocaleString() });
  }

  if (gif.version !== '89a') {
    add('note', 'find.version.title', 'find.version.body', { version: gif.version });
  }

  if (gif.globalPalette && gif.backgroundIndex >= gif.globalPalette.count) {
    add('warn', 'find.bgindex.title', 'find.bgindex.body', {
      index: gif.backgroundIndex.toLocaleString(),
      entries: gif.globalPalette.count.toLocaleString(),
    });
  }

  if (gif.aspect !== null) {
    add('note', 'find.aspect.title', 'find.aspect.body', { ratio: gif.aspect.toFixed(2) });
  }

  const clears = stats.decoded
    ? stats.decoded.reduce((sum, frame) => sum + (frame ? frame.clears : 0), 0)
    : 0;
  if (clears > frames.length) {
    add('note', 'find.clears.title', 'find.clears.body', { count: clears.toLocaleString() });
  }

  if (stats.identical > 0) {
    add('warn', count(stats.identical, 'find.identical.title'), 'find.identical.body',
      { count: stats.identical.toLocaleString() });
  }

  if (stats.decoded) {
    const broken = stats.decoded.filter((frame) => frame && (frame.corrupt || frame.truncated));
    if (broken.length > 0) {
      // The decoder's own account of what went wrong when it has one, and the
      // plain "it ran out" when the data simply stopped. Both are keys, and the
      // decoder's numbers travel with it.
      const first = broken[0].corrupt;
      add('bad', count(broken.length, 'find.broken.title'),
        first ? first.key : 'find.broken.body.short',
        { count: broken.length.toLocaleString(), ...(first ? first.values : {}) });
    }
  }

  out.sort((a, b) => LEVELS[a.level] - LEVELS[b.level]);
  return out;
}

/* ---------------------------------------------------------------- wording */

/* B rather than the word, for the reason KB and MB beside it are already
   symbols: the word is English - octets in French, バイト in Japanese - and a
   number formatted in here cannot reach the markup a translation lives in. */
const bytes = (n) => (
  n < 1024 ? `${n} B` : n < 1024 * 1024
    ? `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`
    : `${(n / 1048576).toFixed(1)} MB`
);

const share = (part, whole) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : '0%');

/** Hundredths of a second, as the seconds a person would say. */
const seconds = (centiseconds) => {
  const value = centiseconds / 100;
  return value >= 10 ? `${value.toFixed(1)}s` : `${value.toFixed(2)}s`;
};

/** Markup characters, out of a string that came from somebody else's file. */
const escape = (value) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
