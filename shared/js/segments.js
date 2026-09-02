/**
 * Segments: the list of in-and-out points you mark while something plays, and
 * the text file they are saved as.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/segments.js and the
 * build copies it to <tool>/src/shared/segments.js for the tools that ask for
 * it with `js_parts = ["segments", ...]`: the video cutter and the audio
 * trimmer, which carried the same file apart from one number. It imports
 * nothing.
 *
 * This is the shape both tools are built around, and it is worth saying why,
 * because it is not the shape most online cutters have. Most of them give you
 * one pair of handles and ask which single stretch to keep. That is fine for
 * topping and tailing a clip and useless for the job people actually sit down
 * to do: watch or listen to a recording once, mark the six moments worth
 * keeping as they go past, and get those six back as one file with the rest
 * gone.
 *
 * So a recording here holds a *list* of segments rather than a selection:
 *
 *   - `i` opens a segment at the playhead and `o` closes it. Between the two
 *     the segment is "pending" and drawn as such.
 *   - Each closed segment is a row you can replay, retime by hand, reorder or
 *     delete, and the total of their lengths is what the finished file will
 *     run to.
 *
 * The marks can be saved as a plain text file and read back, in two formats:
 *
 *   seconds,<name>
 *   12.345,67.890
 *
 *   HHMMSSmmm,<name>
 *   00:00:12.345,00:01:07.890
 *
 * The first line names the format and what was marked; every line after it
 * is one segment. Keeping to that layout is deliberate: it is the layout of
 * the `cutVideoByTimestamps.py` script this tool was modelled on, so a file
 * written here can be fed to that script, a file written by either tool here
 * can be dropped onto the other, and a file written by the script can be
 * dropped onto both. Marking is careful work and nobody should have to do it
 * twice because two programs could not agree on a comma.
 *
 * Nothing in this file touches a sample or a frame. It turns times into text
 * and back.
 *
 * THE ONE NUMBER THAT DIFFERS
 *
 * The shortest segment worth keeping is not the same for sound as for
 * pictures: a millisecond of audio is forty-eight samples, a millisecond of
 * video is no frame at all. So it is a parameter, `minSegment`, and each tool
 * passes its own with the reasoning beside it.
 */

/** The two format names, spelled as the file spells them. */
export const TIMESTAMP_FORMATS = ['seconds', 'HHMMSSmmm'];

/**
 * HH:MM:SS.mmm, always with the hours, because that is what the file format
 * uses and a reader that has to guess whether the first field is hours or
 * minutes is a reader that will one day guess wrong.
 *
 * The instant is rounded to milliseconds **once, before it is taken apart**.
 * Flooring the seconds and rounding the fraction separately is the same
 * arithmetic and a different answer: 3.9996 floors to 3 and rounds to 1000,
 * and the two are then written next to each other as `00:00:03.1000` - four
 * digits in a field that holds three, and a time that reads back as 3.1. A
 * mark is careful work and this is the format it is saved in, so nine tenths
 * of a second is not a rounding error to shrug at.
 */
export function formatClock(seconds) {
  const total = Math.round(Math.max(0, Number(seconds) || 0) * 1000);
  const whole = Math.floor(total / 1000);
  const pad = (value, size) => String(value).padStart(size, '0');
  return `${pad(Math.floor(whole / 3600), 2)}:${pad(Math.floor(whole / 60) % 60, 2)}`
    + `:${pad(whole % 60, 2)}.${pad(total % 1000, 3)}`;
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

/**
 * The segments that are actually finished, as ranges the export understands.
 *
 * @param {object[]} segments
 * @param {number} minSegment  the shortest length worth keeping, in seconds
 */
export function segmentRanges(segments, minSegment) {
  return segments
    .filter((segment) => segment.end !== null && segment.end - segment.start > minSegment)
    .map((segment) => ({ start: segment.start, end: segment.end }));
}

/** How long the finished file will run to. */
export function totalCaptured(segments, minSegment) {
  return segmentRanges(segments, minSegment)
    .reduce((total, range) => total + (range.end - range.start), 0);
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
 * @param {object} options
 * @param {'seconds'|'HHMMSSmmm'} [options.format]
 * @param {string} [options.name]  what was marked. Written into the header,
 *   where the script this format comes from puts a YouTube id.
 * @param {number} options.minSegment  see segmentRanges
 */
export function writeTimestamps(segments, { format = 'seconds', name = '', minSegment } = {}) {
  const chosen = TIMESTAMP_FORMATS.includes(format) ? format : 'seconds';
  // A comma in the header would give the line three fields and a reader two
  // ways to be wrong about which is which.
  const lines = [`${chosen},${String(name).replace(/[,\r\n]+/g, ' ').trim()}`];

  for (const range of segmentRanges(segments, minSegment)) {
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
    throw new Error('marks.unreadable');
  }

  return { format, name, segments, skipped };
}
