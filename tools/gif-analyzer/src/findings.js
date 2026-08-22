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
 */

import { isFullCanvas, duration } from './frames.js';

const LEVELS = { bad: 0, warn: 1, note: 2 };

/**
 * @param {object} gif  as returned by parseGif
 * @param {object} stats  what main.js measured while decoding: `{used, decoded,
 *   waste, colors, identical}`. All optional - a file too large to decode still
 *   gets every finding that comes from the structure alone.
 */
export function findings(gif, stats = {}) {
  const out = [];
  const add = (level, title, body) => out.push({ level, title, body });
  const frames = gif.frames;
  const plural = (n, one, many) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

  // ---------------------------------------------------------- what it is not

  if (frames.length === 0) {
    add('bad', 'There are no frames in this file.',
      'The header parsed, but no image block followed it. Whatever this is, no viewer will '
      + 'draw anything from it.');
  }

  for (const problem of gif.problems) add('bad', 'The file does not end cleanly.', problem);

  if (gif.trailingBytes > 0) {
    add('warn', `${bytes(gif.trailingBytes)} sit after the end of the file.`,
      'Every decoder stops at the trailer byte, so these are never read and never drawn. '
      + 'They are usually a second file appended to the first, or an editor that wrote past '
      + 'itself. Cutting the file at the trailer loses nothing.');
  }

  // -------------------------------------------------------------- the timing

  if (frames.length > 1) {
    const { nominal, real, clamped } = duration(frames);

    if (clamped > 0) {
      add('warn', `${plural(clamped, 'frame asks', 'frames ask')} to be held for less than `
        + '0.02 seconds, and no browser will do it.',
        'Every browser since Netscape rounds a delay under two hundredths of a second up to '
        + 'ten - a rule written in 1996 for the spinning globes of the time and never removed. '
        + `So this animation says it runs for ${seconds(nominal)} and actually plays for `
        + `${seconds(real)}, about ${(real / Math.max(nominal, 1)).toFixed(1)} times slower. `
        + 'Writing 0.02 instead of 0.01 gets the speed it was asking for.');
    }

    const zero = frames.filter((frame) => frame.delay === 0).length;
    if (zero > 0 && zero === frames.length) {
      add('warn', 'Every frame has a delay of zero.',
        'The file gives no timing at all, so what it plays at is entirely up to the viewer - '
        + 'usually ten frames a second, but nothing guarantees it. Two different browsers can '
        + 'play this at two different speeds and both be right.');
    }

    const delays = new Set(frames.map((frame) => frame.delay));
    if (delays.size > 1) {
      const sorted = [...frames].sort((a, b) => a.delay - b.delay);
      add('note', `The frames are not evenly timed: ${delays.size} different delays, from `
        + `${seconds(sorted[0].delay)} to ${seconds(sorted[sorted.length - 1].delay)}.`,
        'A held final frame is deliberate and common. A scatter of delays through the middle '
        + 'is usually a converter dropping frames from a video and stretching the neighbours '
        + 'to cover the gap.');
    }
  }

  // ------------------------------------------------------------ the looping

  if (frames.length > 1) {
    if (gif.loop === null) {
      add('warn', 'There is no loop block, so this plays once and stops.',
        'Looping is not part of the GIF specification. It is a block Netscape invented in '
        + '1995 that everything implemented anyway, and a file without one is a file every '
        + 'browser shows exactly once. If this was meant to loop, whatever wrote it left the '
        + 'block out.');
    } else if (gif.loop > 0) {
      add('note', `This plays ${plural(gif.loop, 'time', 'times')} and then stops.`,
        'The loop block names a count rather than the usual zero, which means forever. '
        + 'Some older viewers ignore the count and loop anyway.');
    }
  }

  // ----------------------------------------------------------- the rectangles

  if (frames.length > 1) {
    const full = frames.filter((frame) => isFullCanvas(gif, frame)).length;
    if (full === frames.length) {
      add('warn', 'Every frame redraws the whole canvas.',
        'A GIF may store a frame as only the rectangle that changed since the last one, which '
        + 'is why a screen recording of a mostly-still window can be small. Nothing here does: '
        + 'every frame is the full '
        + `${gif.width}&times;${gif.height}. That is correct for frames made from unrelated `
        + 'pictures, and is money left on the table for anything filmed or recorded, where most '
        + 'of the picture does not move between frames.');
    } else if (full > 0) {
      // Written as "1 frame of 12" rather than "1 of 12 frames" so that the
      // verb has something to agree with in both directions.
      add('note', `${plural(full, 'frame', 'frames')} of ${frames.length} `
        + `redraw${full === 1 ? 's' : ''} the whole canvas; the rest store only the part `
        + 'that changed.',
        'That is what an optimised GIF looks like. The full-canvas ones are usually the first '
        + 'frame and any point where the picture changed completely.');
    } else {
      add('note', 'No frame redraws the whole canvas.',
        'Every frame after the first stores only the rectangle that changed, which is the '
        + 'format used properly and is why this file is as small as it is.');
    }

    const outside = frames.filter((frame) => (
      frame.left + frame.width > gif.width || frame.top + frame.height > gif.height
    ));
    if (outside.length > 0) {
      add('bad', `${plural(outside.length, 'frame reaches', 'frames reach')} outside the canvas.`,
        `The canvas is ${gif.width}&times;${gif.height} and ${outside.length === 1 ? 'a frame' : 'some frames'} `
        + 'claim a rectangle that runs off the edge of it. Decoders disagree about what to do '
        + 'with the overhang: some clip it, some refuse the file.');
    }
  }

  // ------------------------------------------------------------ the palettes

  const locals = frames.filter((frame) => frame.palette);
  if (locals.length > 0) {
    const cost = locals.reduce((sum, frame) => sum + frame.palette.bytes, 0);
    const level = cost > gif.size * 0.1 ? 'warn' : 'note';
    add(level, `${plural(locals.length, 'frame carries', 'frames carry')} a colour table of `
      + `its own, costing ${bytes(cost)} - ${share(cost, gif.size)} of the file.`,
      'A palette of its own lets a frame use colours the shared table does not have, and costs '
      + 'three bytes per entry every time it is written. Where the frames are of the same scene, '
      + 'one table for all of them is both smaller and steadier to watch: a palette that lurches '
      + 'between frames is what GIF flicker actually is.');
  }

  if (!gif.globalPalette && frames.length > 0) {
    add('note', 'There is no global colour table.',
      'Nothing is wrong with that - every frame here brings its own - but it does mean a viewer '
      + 'has nothing to paint the canvas with before the first frame arrives.');
  }

  if (stats.waste && stats.waste.wastedEntries > 0) {
    const { wastedEntries, wastedBytes, declared, referenced } = stats.waste;
    const level = wastedBytes > gif.size * 0.05 ? 'warn' : 'note';
    add(level, `${wastedEntries.toLocaleString()} colour table entries are never used, which is `
      + `${bytes(wastedBytes)}.`,
      `The tables in this file declare ${declared.toLocaleString()} colours and the pixels refer `
      + `to ${referenced.toLocaleString()} of them. A colour table is a power of two entries long `
      + 'whatever is in it, so a frame using nine colours still gets sixteen; some rounding up is '
      + 'unavoidable. Much more than that means the palettes were built for a different picture '
      + 'than the one that ended up in the frame.');
  }

  if (stats.colors !== undefined && frames.length > 0) {
    add('note', `The whole animation draws with ${plural(stats.colors, 'colour', 'colours')}.`,
      stats.colors <= 64
        ? 'That is flat artwork, and it is what GIF was designed for. A file like this compresses '
        + 'well and dithers badly, so if it looks speckled the dithering is the thing to turn off.'
        : 'A photograph, or something rendered from one. GIF gives a frame at most 256 colours, '
        + 'so anything with a gradient in it is being approximated - which is where dithering, '
        + 'and the noise that makes a file large, comes from.');
  }

  // ------------------------------------------------------------ the metadata

  for (const extension of gif.extensions) {
    if (extension.kind === 'comment') {
      add('note', `There is a comment block of ${bytes(extension.dataBytes)} in this file.`,
        'Comments are not shown by any viewer and are carried by every copy of the file. '
        + 'They are usually the name of whatever wrote it, and occasionally something the '
        + 'author would not have chosen to publish.');
    } else if (extension.name.startsWith('XMP')) {
      const level = extension.bytes > gif.size * 0.05 ? 'warn' : 'note';
      add(level, `An XMP metadata packet takes up ${bytes(extension.bytes)} - `
        + `${share(extension.bytes, gif.size)} of the file.`,
        'XMP is the XML block an image editor writes to record what it did, and it can carry '
        + 'the edit history, the software, and sometimes the author. No viewer draws any of it. '
        + 'Removing it costs the picture nothing.');
    } else if (extension.name.startsWith('ICCRGBG1')) {
      add('note', `An ICC colour profile takes up ${bytes(extension.bytes)}.`,
        'The profile says what the numbers in the palette mean as colours. Almost nothing '
        + 'reads one out of a GIF, so it is usually weight for nothing - but dropping it can '
        + 'shift the colours in the viewers that do.');
    } else if (extension.kind === 'plain-text') {
      add('note', 'There is a plain-text extension in this file.',
        'A block that asks the viewer to draw text over the picture in a grid of cells. It was '
        + 'in the 1989 specification, it was never implemented by anything, and every decoder '
        + 'skips it. Whatever it says will not appear.');
    } else if (extension.kind === 'application' && extension.loop === undefined) {
      // The only place in this file where text out of the GIF itself reaches a
      // string that is rendered as HTML, so it is escaped here. An eight-byte
      // identifier field is not markup, but it is bytes from a file somebody
      // else made, and that is the whole argument.
      add('note', `There is an application block named &ldquo;${escape(extension.name)}&rdquo;, `
        + `of ${bytes(extension.bytes)}.`,
        'Application blocks are how anything outside the specification gets into a GIF. Viewers '
        + 'skip the ones they do not recognise, so this one is weight unless something '
        + 'specific is reading it.');
    }
  }

  // ----------------------------------------------------------- the machinery

  const interlaced = frames.filter((frame) => frame.interlaced).length;
  if (interlaced > 0) {
    add('note', `${plural(interlaced, 'frame is', 'frames are')} interlaced.`,
      'The rows are stored in four passes so that a picture arriving down a slow line showed a '
      + 'coarse version of itself early. It made sense in 1993, it compresses slightly worse '
      + 'than storing the rows in order, and no viewer benefits from it now.');
  }

  if (gif.version !== '89a') {
    add('note', `This file says it is GIF${gif.version} rather than GIF89a.`,
      'GIF87a came first and has no timing blocks, no transparency and no loop block. A file '
      + 'claiming 87a while carrying any of those is common - decoders do not check - but it '
      + 'is a sign the header was copied rather than written.');
  }

  if (gif.globalPalette && gif.backgroundIndex >= gif.globalPalette.count) {
    add('warn', `The background colour is index ${gif.backgroundIndex}, and the global table `
      + `only has ${gif.globalPalette.count} entries.`,
      'Nothing will crash - viewers use transparent instead - but it means the field was never '
      + 'set, or was set for a palette that is no longer the one in the file.');
  }

  if (gif.aspect !== null) {
    add('note', `The pixel aspect ratio is set to ${gif.aspect.toFixed(2)}.`,
      'A field for displays that did not have square pixels. Every modern viewer ignores it and '
      + 'draws the frame at its stored size, so a file relying on it will look stretched to '
      + 'whoever made it and normal to everybody else.');
  }

  const clears = stats.decoded
    ? stats.decoded.reduce((sum, frame) => sum + (frame ? frame.clears : 0), 0)
    : 0;
  if (clears > frames.length) {
    add('note', `The compressor reset its dictionary ${clears.toLocaleString()} times.`,
      'LZW builds a dictionary as it goes and can hold 4,096 entries; when it fills, the '
      + 'encoder starts again. Once per frame is normal - it is how a frame begins. More than '
      + 'that means the picture was varied enough to exhaust the dictionary partway through, '
      + 'which is what a photograph or heavy dithering does, and is why those files are large.');
  }

  if (stats.identical > 0) {
    add('warn', `${plural(stats.identical, 'frame is', 'frames are')} identical to the frame `
      + 'before.',
      'They cost their full compressed size and change nothing on screen. Adding their delay '
      + 'to the previous frame instead would look exactly the same and would be smaller.');
  }

  if (stats.decoded) {
    const broken = stats.decoded.filter((frame) => frame && (frame.corrupt || frame.truncated));
    if (broken.length > 0) {
      add('bad', `${plural(broken.length, 'frame does', 'frames do')} not decode completely.`,
        `${broken[0].corrupt ?? 'The compressed data ends before the frame is full'}. `
        + 'A viewer will draw what it can and leave the rest of the rectangle blank.');
    }
  }

  out.sort((a, b) => LEVELS[a.level] - LEVELS[b.level]);
  return out;
}

/* ---------------------------------------------------------------- wording */

const bytes = (n) => (
  n < 1024 ? `${n} bytes` : n < 1024 * 1024
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
