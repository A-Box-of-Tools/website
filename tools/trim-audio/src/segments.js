/**
 * Segments: the list of in-and-out points you mark while a recording plays.
 *
 * This is the shape the tool is built around, and it is worth saying why,
 * because it is not the shape most online audio trimmers have. Most of them
 * give you one pair of handles and ask which single stretch to keep. That is
 * fine for topping and tailing a jingle and useless for the job people
 * actually sit down to do: listen to an hour of interview once, mark the six
 * answers worth keeping as they go past, and get those six back as one file
 * with the rest gone.
 *
 * So a recording here holds a *list* of segments rather than a selection:
 *
 *   - `i` starts one at the playhead. Pressing it again before you have closed
 *     the segment moves that start rather than opening a second one.
 *   - `o` closes the open segment at the playhead.
 *   - Each closed segment is a row you can replay, retime by hand, reorder or
 *     delete, and the total of their lengths is what the finished file will
 *     run to.
 *
 * ## The timestamps file
 *
 * The marks can be saved as a plain text file and read back, in the same two
 * formats the video cutter next door writes:
 *
 *     seconds,<name>                 HHMMSSmmm,<name>
 *     207.687,347.737                00:03:27.687,00:05:47.737
 *     630.284,668.796                00:10:30.284,00:11:08.796
 *
 * The first line names the format and what was marked; every line after it is
 * one segment. Keeping to that layout is deliberate: a file written here can
 * be dropped onto the video cutter, and onto the other tools that already
 * read that layout, and a file written by one of them can be dropped onto
 * this page. Marking is careful work and nobody should have to do it twice
 * because two programs could not agree on a comma.
 *
 * Nothing in this file touches a sample. It turns times into text and back.
 */

/** The two format names, spelled as the file spells them. */
export const TIMESTAMP_FORMATS = ['seconds', 'HHMMSSmmm'];

/**
 * The shortest segment worth keeping. A millisecond is about forty-eight
 * samples at the rate most things record at - short enough that no mark made
 * on purpose is refused, long enough that a double-tap of `o` does not leave
 * an empty row behind.
 */
const MIN_SEGMENT = 0.001;

/**
 * HH:MM:SS.mmm, always with the hours, because that is what the file format
 * uses and a reader that has to guess whether the first field is hours or
 * minutes is a reader that will one day guess wrong.
 */
export function formatClock(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const whole = Math.floor(safe);
  const pad = (value, size) => String(value).padStart(size, '0');
  return `${pad(Math.floor(whole / 3600), 2)}:${pad(Math.floor(whole / 60) % 60, 2)}`
    + `:${pad(whole % 60, 2)}.${pad(Math.round((safe - whole) * 1000), 3)}`;
}

/**
 * The reverse. Accepts what the two formats write and what a person types:
 * `01:02:03.400`, `2:03.4` and `123.4` all mean something, and all three turn
 * up in files people have edited by hand.
 *
 * @returns {number|null} seconds, or null if it is not a time at all.
 */
export function parseClock(text) {
  const trimmed = String(text ?? '').trim();
  if (!trimmed) return null;

  const parts = trimmed.split(':');
  if (parts.length > 3) return null;

  let total = 0;
  for (const part of parts) {
    if (!/^\d*\.?\d*$/.test(part) || part === '' || part === '.') return null;
    total = total * 60 + Number(part);
  }
  return Number.isFinite(total) ? total : null;
}

/* ----------------------------------------------------------- the segments */

/** The segments that are actually finished, as ranges the export understands. */
export function segmentRanges(segments) {
  return segments
    .filter((segment) => segment.end !== null && segment.end - segment.start > MIN_SEGMENT)
    .map((segment) => ({ start: segment.start, end: segment.end }));
}

/** How long the finished recording will run to. */
export function totalCaptured(segments) {
  return segmentRanges(segments).reduce((total, range) => total + (range.end - range.start), 0);
}

/**
 * Whether a segment is still being marked - opened with `i`, not yet closed
 * with `o`. There is at most one, and it is always the last.
 */
export function openSegment(segments) {
  const last = segments[segments.length - 1];
  return last && last.end === null ? last : null;
}

/* ---------------------------------------------------------------- the file */

/**
 * @param {object[]} segments
 * @param {'seconds'|'HHMMSSmmm'} format
 * @param {string} name  what was marked. Written into the header.
 */
export function writeTimestamps(segments, { format = 'seconds', name = '' } = {}) {
  const chosen = TIMESTAMP_FORMATS.includes(format) ? format : 'seconds';
  // A comma in the header would give the line three fields and a reader two
  // ways to be wrong about which is which.
  const lines = [`${chosen},${String(name).replace(/[,\r\n]+/g, ' ').trim()}`];

  for (const range of segmentRanges(segments)) {
    lines.push(chosen === 'seconds'
      ? `${range.start.toFixed(3)},${range.end.toFixed(3)}`
      : `${formatClock(range.start)},${formatClock(range.end)}`);
  }

  return `${lines.join('\n')}\n`;
}

/**
 * Read one back.
 *
 * The header is optional. A file that begins with a pair of times is taken as
 * segments all the way down, because a list of times with no preamble is what
 * somebody writing one by hand produces, and refusing it would be pedantry
 * rather than safety - the times either parse or they do not.
 *
 * @returns {{format: string, name: string, segments: object[], skipped: number}}
 * @throws {Error} when nothing in the file parses as a segment.
 */
export function readTimestamps(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  let format = 'seconds';
  let name = '';
  let at = 0;

  const head = (lines[0] ?? '').trim().split(',');
  if (TIMESTAMP_FORMATS.includes(head[0])) {
    format = head[0];
    name = (head[1] ?? '').trim();
    at = 1;
  }

  const segments = [];
  let skipped = 0;

  for (let i = at; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = line.split(',');
    if (fields.length < 2) { skipped++; continue; }

    const start = parseClock(fields[0]);
    const end = parseClock(fields[1]);
    if (start === null || end === null || end <= start) { skipped++; continue; }

    segments.push({ start, end });
  }

  if (!segments.length) {
    throw new Error('No segments could be read from that file. Each line after the '
      + 'first should be a start and an end, separated by a comma.');
  }

  return { format, name, segments, skipped };
}
