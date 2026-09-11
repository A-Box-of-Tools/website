/**
 * An ID photo's rules, read out of the text that states them.
 *
 * Somebody applying for a document this tool has no entry for is holding the
 * rule anyway - a paragraph off an embassy's page, a line in an exam's
 * registration notice - and was left to copy ten numbers out of it into ten
 * boxes by hand. This reads the paragraph and fills the boxes.
 *
 * WHY IT IS A READER AND NOT A MODEL
 *
 * Because the page runs on the visitor's machine and nowhere else. A language
 * model would mean a server or megabytes of weights, for a job that turns out
 * to be formulaic: every rule of this kind is numbers with units - 35 mm,
 * 2 inches, 600 pixels, 300 dpi, 240 KB - and a few words that say what each
 * number is for. Numbers and units read the same in any language; only the
 * words that attach them to a box do not, and those are listed here for
 * English and Chinese, in both scripts. Text in another language still has
 * its sizes, resolution and file size read, because those name themselves by
 * their units; what it loses is the head height and the background, which it
 * names in words this does not know.
 *
 * WHAT IT PROMISES, AND WHAT IT DOES NOT
 *
 * It never guesses. Every value it fills in carries the stretch of the text it
 * came from, and the page shows the two side by side, so the one check that
 * matters - does this say what the rule says - takes a glance. A measurement
 * it found and could not place is reported rather than dropped: a figure this
 * does not recognise would otherwise vanish while its box kept a number the
 * rule never mentioned. Two photo sizes on one page are not chosen between.
 * A size given by name - 二寸, 2吋 - is not turned into millimetres, because
 * studios do not agree on what those names measure. A background the page
 * cannot check against is named rather than swapped for one it can.
 *
 * THE POSITIONS
 *
 * The text is normalised - full-width forms to ASCII, every dash to one, every
 * multiplication sign to x - one character for one, so that an offset into the
 * normalised text is the same offset into what was pasted, and the page can
 * quote the visitor's own words back. That is also why units such as 毫米 are
 * matched as written rather than rewritten to "mm": a rewrite would change the
 * length, and every quote after it would point at the wrong words.
 */

/* --------------------------------------------------------------- the words */

/**
 * What a measurement is for, by the words next to it. Matched after
 * lowercasing. Longer phrases are listed so that they end where the number's
 * meaning does: "头部宽度" has to be seen as a head width, not as a head
 * followed by a width.
 */
const WORDS = {
  paper: /\bpaper\b|\bsheet\b|相纸|相紙|冲印|沖印/g,
  headWidth: /head\s+width|width\s+of\s+(?:the\s+)?(?:head|face)|face\s+width|头部宽度?|頭部寬度?|头宽|頭寬|脸宽|臉寬|面部宽度?|面部寬度?/g,
  margin: /(?:top|bottom)\s+of\s+(?:the\s+)?(?:photo|picture|image|frame)|above\s+the\s+head|chin\s+to\s+(?:the\s+)?bottom|\bmargins?\b|(?:头顶|頭頂)(?:距|到|至)(?:照片|相片)?上|(?:下巴|下颌|下頜)(?:距|到|至)(?:照片|相片)?下|上边[缘沿]|上邊[緣沿]|下边[缘沿]|下邊[緣沿]|边距|邊距/g,
  head: /(?:head|face|chin)\s+(?:height|size|length)|height\s+of\s+(?:the\s+)?(?:head|face)|chin\s+to\s+(?:the\s+)?(?:top|crown)|crown\s+to\s+(?:the\s+)?chin|top\s+of\s+(?:the\s+)?head|\bhead\b|\bface\b|头部(?:长度|高度|长|高)?|頭部(?:長度|高度|長|高)?|头(?:长|高)度?|頭(?:長|高)度?|(?:头顶|頭頂)(?:至|到)(?:下巴|下颌|下頜)|(?:下巴|下颌|下頜)(?:至|到)(?:头顶|頭頂)|面部(?:长度|高度|長度)/g,
  eye: /\beyes?\b|eye\s+line|眼睛|双眼|雙眼|眼部|瞳孔/g,
  width: /\bwide\b|\bwidth\b|宽度?|寬度?/g,
  height: /\bhigh\b|\bheight\b|\btall\b|高度?|长度?|長度?/g,
};

/** Which of two words that end at the same place is meant: the more particular
 *  one. "head height" is a head before it is a height. */
const PRIORITY = ['paper', 'headWidth', 'margin', 'head', 'eye', 'width', 'height'];

/** The same words, straight after a number: "45 mm high", "35mm(宽)". */
const POSTFIX = Object.fromEntries(PRIORITY.map((name) => [
  name, new RegExp(`^\\s*\\(?\\s*(?:${WORDS[name].source})`),
]));

/** After a word that labels what follows - "width: 35 mm" - the word belongs
 *  to the next number, not the last one. */
const LABELS_NEXT = /^\s*\)?\s*[:=\d]/;

/** How far after a size the word "paper" can be and still be naming it. */
const PAPER_REACH = 12;

/** A ceiling or a floor, said before the number. Chinese 以上 and 以下 are left
 *  out here: before a number, 以下 means "the following". */
const MOST = /no\s+(?:more|larger|bigger|greater)\s+than|not\s+(?:more|larger|bigger|greater)\s+than|(?:not\s+)?exceed\w*|\bat\s+most\b|\bup\s+to\b|\bmaximum\b|\bmax\b|less\s+than|smaller\s+than|\bunder\b|\bbelow\b|≤|<=|不超过|不超過|不大于|不大於|小于|小於|最大|上限|低于|低於/g;
const LEAST = /\bat\s+least\b|no\s+(?:less|smaller)\s+than|not\s+(?:less|smaller)\s+than|\bminimum\b|\bmin\b|more\s+than|greater\s+than|larger\s+than|\babove\b|\bover\b|≥|>=|不小于|不小於|不低于|不低於|大于|大於|最小|下限|至少/g;

/** The same, said after it: "240 KB or less", "200KB以下". */
const MOST_AFTER = /^\s*(?:或?以下|或?以内|或?以內|or\s+(?:less|smaller|below|under)|at\s+most|max(?:imum)?\b)/;
const LEAST_AFTER = /^\s*(?:或?以上|or\s+(?:more|larger|above|greater|over)|at\s+least|min(?:imum)?\b)/;

/** Background colours, each with the BACKGROUNDS key the page checks it
 *  against, or none for a colour it has no check for. Checked in order and
 *  blanked once found: off-white before white, light grey before grey. */
const COLOURS = [
  { key: 'off-white', pattern: /off[\s-]?white|米白|乳白/ },
  { key: 'cream', pattern: /\bcream\b|米色|奶油色/ },
  { key: 'light-grey', pattern: /(?:light|pale)\s+gr[ae]y|\bgr[ae]y\b|浅灰|淺灰|淡灰|灰色|灰底/ },
  { key: 'white', pattern: /\bwhite\b|白色|白底|纯白|純白|白背景/ },
  { key: null, pattern: /(?:light|pale|sky)\s+blue|\bblue\b|浅蓝|淺藍|淡蓝|淡藍|天蓝|天藍|蓝色|藍色|蓝底|藍底/ },
  { key: null, pattern: /\bred\b|红色|紅色|红底|紅底/ },
];

const BACKGROUND = /background|backdrop|背景|底色|[白蓝藍红紅灰]底/g;

/** A size given by name rather than measured. */
const NAMED = /(?<![\d.])(?:小|大)?[一二两兩12](?:寸|吋)/g;

/** Words that make a bare "2m" a file size rather than a distance. */
const FILE_WORDS = /\bfile\b|\bsize\b|大小|文件|体积|體積|容量/;

/* ---------------------------------------------------------------- the units */

const UNITS = {
  mm: /mm|millimet(?:er|re)s?|毫米/,
  cm: /cm|centimet(?:er|re)s?|厘米|公分/,
  inch: /inch(?:es)?|in\b|"|″|英寸|英吋/,
  dpi: /dpi|ppi|pixels?\s+per\s+inch|像素\/英寸/,
  px: /px|pixels?|像素/,
  kb: /kb|kib|kbytes?|kilobytes?|千字节|千字節|k(?![a-z])/,
  mb: /mb|mib|megabytes?|兆字节|兆字節|兆/,
  m: /m(?![a-z])/,
};

const MM_PER = { mm: 1, cm: 10, inch: 25.4 };

const NUMBER = /\d+\s+\d\/\d{1,2}|\d\/\d{1,2}|\d+(?:[.,]\d+)?/.source;
const TIMES = /x|by|乘/.source;
const LABEL = /\([^()]{1,8}\)/.source;
const BETWEEN = /between|从|從|在|介于|介於/.source;
const BETWEEN_AND = /and|-|~|to|和|与|與|至|到/.source;
const RANGE_MARK = /-|~|to|至|到/.source;

/** The unit alternatives as named groups, prefixed so that the unit after the
 *  first number and the unit after the second can both be in one pattern. */
const unit = (prefix) => Object.entries(UNITS)
  .map(([name, pattern]) => `(?<${prefix}${name}>${pattern.source})`).join('|');

const A_SIDE = `(?<a>${NUMBER})\\s*(?:${unit('a')})?`;
const B_SIDE = `(?<b>${NUMBER})\\s*(?:${unit('')})`;

/** Longest shape first; a stretch one shape took is not read again. */
const SHAPES = [
  // Two directions at once: 35 x 45 mm, 35mm(宽) x 45mm(高).
  { shape: 'pair', pattern: new RegExp(`${A_SIDE}\\s*(?:${LABEL})?\\s*(?:${TIMES})\\s*${B_SIDE}`, 'g') },
  // A range: between 32 and 36 mm, 32-36 mm, 20KB至200KB.
  { shape: 'range', pattern: new RegExp(`(?:${BETWEEN})\\s*${A_SIDE}\\s*(?:${BETWEEN_AND})\\s*${B_SIDE}`, 'g') },
  { shape: 'range', pattern: new RegExp(`${A_SIDE}\\s*(?:${RANGE_MARK})\\s*${B_SIDE}`, 'g') },
  { shape: 'single', pattern: new RegExp(B_SIDE, 'g') },
];

/** Where a clause ends. A comma does not end one: "宽33mm，高48mm" is one
 *  clause of words and numbers taking turns. */
const CLAUSE = /[\n。;!?•]|\.\s/g;

/* ----------------------------------------------------------------- reading */

/**
 * @typedef {{from: number, to: number}} Span  offsets into the text as pasted
 *
 * @typedef {object} Reading
 * @property {Record<string, number|string>} values  by the keys withCustom() reads
 * @property {({field: string, value: number|string} & Span)[]} found
 * @property {({key: string, spans: Span[]})[]} notes  phrase keys for the page
 * @property {({key: string} & Span)[]} unused  figures read and not placed, each
 *   with the phrase key that says why
 */

/**
 * Read the rules out of some text.
 *
 * @param {string} text  as pasted
 * @returns {Reading}
 */
export function readRequirements(text) {
  const source = normalise(String(text ?? ''));
  const measures = findMeasures(source);
  const reading = { values: {}, found: [], notes: [], unused: [] };

  placeSizes(source, measures, reading);
  placeHead(measures, reading);
  placeSimple(measures, reading);
  placeBackground(source, reading);
  dropRestatements(measures, reading);

  for (const m of measures) {
    if (!m.used && !m.noted) {
      reading.unused.push({ from: m.from, to: m.to, key: WHY[m.word] ?? 'read.unused.other' });
    }
  }
  return reading;
}

/** Why a figure was read and left alone, as the phrase that says so. */
const WHY = {
  paper: 'read.unused.paper',
  headWidth: 'read.unused.headwidth',
  eye: 'read.unused.eye',
  margin: 'read.unused.margin',
};

/**
 * One character for one: full-width forms to ASCII, every dash and every
 * multiplication sign to one of each, curly double quotes to the inch mark
 * they stand for after a number, and lowercase where lowercasing keeps the
 * length.
 */
export function normalise(text) {
  let out = '';
  for (const ch of text) {
    // A character outside the basic plane is two code units and has to stay
    // two, or every offset after it moves.
    if (ch.length > 1) { out += ch; continue; }
    const code = ch.charCodeAt(0);
    let c = code >= 0xff01 && code <= 0xff5e ? String.fromCharCode(code - 0xfee0) : ch;
    if (c === '　' || c === ' ') c = ' ';
    else if ('×✕✖*'.includes(c)) c = 'x';
    else if ('‐‑‒–—―−'.includes(c)) c = '-';
    else if (c === '〜') c = '~';
    else if (c === '“' || c === '”') c = '"';
    const lower = c.toLowerCase();
    out += lower.length === 1 ? lower : c;
  }
  return out;
}

/** Every measurement in the text, none overlapping, in reading order. */
function findMeasures(text) {
  const taken = new Uint8Array(text.length);
  const out = [];

  for (const { shape, pattern } of SHAPES) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) {
      const from = match.index;
      const to = from + match[0].length;
      if (taken.subarray(from, to).some(Boolean)) continue;

      let name = unitOf(match.groups, '');
      if (name === 'm') {
        // "2M" is a file size in a sentence about the file and a distance in
        // one about where to stand.
        if (!FILE_WORDS.test(text.slice(clauseStart(text, from), clauseEnd(text, to)))) continue;
        name = 'mb';
      }
      const b = numberOf(match.groups.b);
      let a = shape === 'single' ? b : numberOf(match.groups.a);
      const aName = unitOf(match.groups, 'a');
      if (aName && aName !== name) {
        if (!MM_PER[aName] || !MM_PER[name]) continue;
        a = (a * MM_PER[aName]) / MM_PER[name];
      }
      if (!Number.isFinite(a) || !Number.isFinite(b)) continue;

      taken.fill(1, from, to);
      out.push({ shape, unit: name, a, b, from, to });
    }
  }

  out.sort((x, y) => x.from - y.from);
  for (const [index, m] of out.entries()) {
    const start = Math.max(index > 0 ? out[index - 1].to : 0, clauseStart(text, m.from));
    const end = Math.min(index + 1 < out.length ? out[index + 1].from : text.length,
      clauseEnd(text, m.to));
    const before = text.slice(start, m.from);
    const after = text.slice(m.to, end);
    m.word = keyword(before, after);
    m.bound = bound(before, after);
  }
  return out;
}

function unitOf(groups, prefix) {
  for (const name of Object.keys(UNITS)) {
    if (groups[prefix + name] !== undefined) return name;
  }
  return null;
}

/** "1,200" is twelve hundred, "3,5" is three and a half, "1 3/8" is 1.375. */
function numberOf(text) {
  if (text === undefined) return NaN;
  const mixed = /^(?:(\d+)\s+)?(\d)\/(\d{1,2})$/.exec(text);
  if (mixed) return Number(mixed[1] ?? 0) + Number(mixed[2]) / Number(mixed[3]);
  if (/^\d{1,3}(?:,\d{3})+$/.test(text)) return Number(text.replace(/,/g, ''));
  return Number(text.replace(',', '.'));
}

function clauseStart(text, at) {
  let start = 0;
  CLAUSE.lastIndex = 0;
  for (const match of text.matchAll(CLAUSE)) {
    if (match.index + match[0].length > at) break;
    start = match.index + match[0].length;
  }
  return start;
}

function clauseEnd(text, at) {
  const found = text.slice(at).search(CLAUSE);
  return found < 0 ? text.length : at + found;
}

/**
 * The last match of a pattern in some text; of two ending together, the
 * longer, so that "不大于" is not read as the "大于" inside it.
 *
 * Every pattern here is global and shared, and matchAll() starts from the
 * pattern's lastIndex, so it is put back first: one exec() left it partway
 * along a clause once, and the next clause was searched from that offset.
 */
function lastOf(pattern, text) {
  pattern.lastIndex = 0;
  let found = null;
  for (const match of text.matchAll(pattern)) {
    const end = match.index + match[0].length;
    if (!found || end > found.end || (end === found.end && match.index < found.start)) {
      found = { start: match.index, end };
    }
  }
  return found;
}

/**
 * What a measurement is for. A word straight after the number, unless it is
 * labelling the next one; otherwise the nearest before it; otherwise the
 * first after it.
 */
function keyword(before, after) {
  let best = null;
  for (const name of PRIORITY) {
    const match = POSTFIX[name].exec(after);
    if (!match || LABELS_NEXT.test(after.slice(match[0].length))) continue;
    if (!best || match[0].length > best.length) best = { name, length: match[0].length };
  }
  if (best) return best.name;

  for (const name of PRIORITY) {
    const found = lastOf(WORDS[name], before);
    if (found && (!best || found.end > best.end)) best = { name, end: found.end };
  }
  if (best) return best.name;

  // Paper only close by: "4x6 inch photo paper" is a paper size, and "35 x 45
  // mm, printed on photo paper" is a photo size in a sentence about printing.
  for (const name of PRIORITY) {
    const at = after.search(WORDS[name]);
    if (at < 0 || (name === 'paper' && at > PAPER_REACH)) continue;
    if (!best || at < best.at) best = { name, at };
  }
  return best?.name ?? null;
}

/** Whether a figure is a ceiling or a floor. */
function bound(before, after) {
  if (MOST_AFTER.test(after)) return 'most';
  if (LEAST_AFTER.test(after)) return 'least';
  const most = lastOf(MOST, before);
  const least = lastOf(LEAST, before);
  if (!most && !least) return null;
  if (!least) return 'most';
  if (!most) return 'least';
  if (most.end !== least.end) return most.end > least.end ? 'most' : 'least';
  return most.start < least.start ? 'most' : 'least';
}

/* ----------------------------------------------------------------- placing */

const tenth = (value) => Math.round(value * 10) / 10;

const span = ({ from, to }) => ({ from, to });

function fill(reading, field, value, m) {
  reading.values[field] = value;
  reading.found.push({ field, value, from: m.from, to: m.to });
  m.used = true;
}

/** An ID photo is never wider than it is tall, so a rule that writes its size
 *  height by width is asking for the same photograph. */
function orient(a, b) {
  return a <= b ? { w: a, h: b } : { w: b, h: a };
}

/**
 * The printed size and the upload size.
 *
 * A printed size said twice - "2 x 2 inches (51 x 51 mm)" - is one size, and
 * the millimetres win because they are what the boxes take. Two sizes that
 * differ are two documents on one page, and choosing between them is not this
 * reader's to do.
 */
function placeSizes(text, measures, reading) {
  const printed = measures.filter((m) => m.shape === 'pair' && MM_PER[m.unit] && m.word !== 'paper');
  const sizes = [];
  for (const m of printed) {
    const size = orient(m.a * MM_PER[m.unit], m.b * MM_PER[m.unit]);
    const same = sizes.find((s) => Math.abs(s.w - size.w) <= 1 && Math.abs(s.h - size.h) <= 1);
    if (!same) sizes.push({ ...size, m, all: [m] });
    else {
      same.all.push(m);
      if (m.unit === 'mm' && same.m.unit !== 'mm') Object.assign(same, size, { m });
    }
  }

  if (sizes.length === 1) {
    const [{ w, h, m, all }] = sizes;
    fill(reading, 'widthMm', tenth(w), m);
    fill(reading, 'heightMm', tenth(h), m);
    for (const other of all) other.used = true;
  } else if (sizes.length > 1) {
    reading.notes.push({ key: 'read.sizes', spans: sizes.map(({ m }) => span(m)) });
    for (const s of sizes) for (const m of s.all) m.noted = true;
  } else {
    // Or the two directions said one at a time: "35 mm wide, 45 mm high".
    for (const [field, word] of [['widthMm', 'width'], ['heightMm', 'height']]) {
      const m = measures.find((x) => x.shape === 'single' && MM_PER[x.unit] && x.word === word);
      if (m) fill(reading, field, tenth(m.b * MM_PER[m.unit]), m);
    }
  }

  if (reading.values.widthMm === undefined && reading.values.heightMm === undefined) {
    NAMED.lastIndex = 0;
    const named = [...text.matchAll(NAMED)].map((match) => ({
      from: match.index, to: match.index + match[0].length,
    }));
    if (named.length) reading.notes.push({ key: 'read.named', spans: named });
  }

  // The upload box takes one exact size. A rule that allows a range of them
  // is met by its smallest, which is what is filled in, and the page says so.
  const pixels = measures.filter((m) => m.shape === 'pair' && m.unit === 'px');
  if (pixels.length) {
    const smallest = pixels.reduce((x, y) => (x.a * x.b <= y.a * y.b ? x : y));
    const { w, h } = orient(smallest.a, smallest.b);
    fill(reading, 'pxWidth', Math.round(w), smallest);
    fill(reading, 'pxHeight', Math.round(h), smallest);
    if (pixels.some((m) => m.a * m.b !== smallest.a * smallest.b)) {
      reading.notes.push({ key: 'read.pxrange', spans: pixels.map(span) });
    }
    for (const m of pixels) m.used = true;
  } else {
    for (const [field, word] of [['pxWidth', 'width'], ['pxHeight', 'height']]) {
      const m = measures.find((x) => x.shape === 'single' && x.unit === 'px' && x.word === word);
      if (m) fill(reading, field, Math.round(m.b), m);
    }
  }
}

/**
 * The head, chin to crown.
 *
 * A range beats a single figure, and a range in millimetres beats the same
 * range in inches: a rule that gives the head both ways gives one head twice,
 * and the millimetres are what the boxes take. Head widths, eye positions and
 * margins are measured by this page some other way or not at all, so they are
 * left for the list of what was read and not used - filling a head width into
 * a head height box would crop every face wrong.
 */
function placeHead(measures, reading) {
  const heads = measures.filter((m) => MM_PER[m.unit] && !m.used && m.word === 'head');
  const ranges = heads.filter((m) => m.shape === 'range');
  const range = ranges.find((m) => m.unit === 'mm') ?? ranges.find((m) => m.unit === 'cm') ?? ranges[0];

  if (range) {
    const scale = MM_PER[range.unit];
    fill(reading, 'headMinMm', tenth(Math.min(range.a, range.b) * scale), range);
    fill(reading, 'headMaxMm', tenth(Math.max(range.a, range.b) * scale), range);
    return;
  }

  // Single figures: "at least 32 mm", "no more than 36 mm", or one exact size.
  for (const m of heads.filter((x) => x.shape === 'single')) {
    const mm = tenth(m.b * MM_PER[m.unit]);
    const { headMinMm: min, headMaxMm: max } = reading.values;
    if (m.bound === 'least' && min === undefined) fill(reading, 'headMinMm', mm, m);
    else if (m.bound === 'most' && max === undefined) fill(reading, 'headMaxMm', mm, m);
    else if (!m.bound && min === undefined && max === undefined) {
      fill(reading, 'headMinMm', mm, m);
      fill(reading, 'headMaxMm', mm, m);
    }
  }
}

/** Resolution and file size, which name themselves by their units. */
function placeSimple(measures, reading) {
  // Of a range of resolutions, the lowest is the one every photo at or above
  // it meets.
  const dpi = measures.find((m) => m.unit === 'dpi');
  if (dpi) fill(reading, 'dpi', Math.round(Math.min(dpi.a, dpi.b)), dpi);

  for (const m of measures.filter((x) => x.unit === 'kb' || x.unit === 'mb')) {
    const scale = m.unit === 'mb' ? 1024 : 1;
    if (m.shape === 'range') {
      if (reading.values.minKb === undefined) fill(reading, 'minKb', Math.round(Math.min(m.a, m.b) * scale), m);
      if (reading.values.maxKb === undefined) fill(reading, 'maxKb', Math.round(Math.max(m.a, m.b) * scale), m);
      continue;
    }
    // A single file size with nothing to say which end it is, is a ceiling:
    // that is what "file size: 200 KB" means on every form that says it.
    const field = m.bound === 'least' ? 'minKb' : 'maxKb';
    if (reading.values[field] === undefined) fill(reading, field, Math.round(m.b * scale), m);
  }
}

/**
 * The background, from a colour named in a clause that says "background".
 *
 * A rule naming more than one colour accepts any of them, so a colour the page
 * can check against wins over one it cannot; "white or off-white" is the
 * page's own off-white entry and "light grey or cream" its cream one. A rule
 * naming only colours the page has no check for - the blue and the red many
 * forms ask for - gets a note, and the box is left alone: setting it to white
 * would have the page check the photo against a rule it had just said it read.
 */
function placeBackground(text, reading) {
  const clauses = new Map();
  BACKGROUND.lastIndex = 0;
  for (const match of text.matchAll(BACKGROUND)) {
    const from = clauseStart(text, match.index);
    if (!clauses.has(from)) clauses.set(from, clauseEnd(text, match.index + match[0].length));
  }

  const named = [];
  for (const [from, to] of clauses) {
    let rest = text.slice(from, to);
    for (const colour of COLOURS) {
      for (;;) {
        const match = colour.pattern.exec(rest);
        if (!match) break;
        named.push({ key: colour.key, from: from + match.index, to: from + match.index + match[0].length });
        // Blanked, so that "off-white" is not found again as "white".
        rest = rest.slice(0, match.index) + ' '.repeat(match[0].length) + rest.slice(match.index + match[0].length);
      }
    }
  }
  if (!named.length) return;
  named.sort((x, y) => x.from - y.from);

  const checkable = named.filter((n) => n.key);
  if (!checkable.length) {
    reading.notes.push({ key: 'read.colour', spans: named.map(span) });
    return;
  }
  const keys = new Set(checkable.map((n) => n.key));
  let key = checkable[0].key;
  if (keys.size === 2 && keys.has('white') && keys.has('off-white')) key = 'off-white';
  else if (keys.size === 2 && keys.has('light-grey') && keys.has('cream')) key = 'cream';

  const at = checkable.find((n) => n.key === key) ?? checkable[0];
  reading.values.background = key;
  reading.found.push({ field: 'background', value: key, from: at.from, to: at.to });
}

/**
 * Figures that restate one already placed - "25 mm - 35 mm (1 inch to 1 3/8
 * inches)" - are the same rule said twice, not a rule left unread.
 */
function dropRestatements(measures, reading) {
  const v = reading.values;
  const defined = (list) => list.filter((x) => x !== undefined);
  const lengths = defined([v.widthMm, v.heightMm, v.headMinMm, v.headMaxMm]);
  const near = (list, value, within) => list.some((x) => Math.abs(x - value) <= within);

  for (const m of measures) {
    if (m.used || m.noted) continue;
    const values = m.shape === 'single' ? [m.b] : [m.a, m.b];
    if (MM_PER[m.unit]) {
      if (values.every((x) => near(lengths, x * MM_PER[m.unit], 1))) m.used = true;
    } else if (m.unit === 'px') {
      if (values.every((x) => near(defined([v.pxWidth, v.pxHeight]), x, 0))) m.used = true;
    } else if (m.unit === 'kb' || m.unit === 'mb') {
      const scale = m.unit === 'mb' ? 1024 : 1;
      if (values.every((x) => near(defined([v.minKb, v.maxKb]), x * scale, 1))) m.used = true;
    } else if (m.unit === 'dpi') {
      m.used = true;
    }
  }
}
