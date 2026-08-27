/**
 * tools/gif-analyzer/src/ - the reader that takes a GIF apart.
 *
 * The analyzer is the one tool here whose output is entirely claims about a
 * file, which makes it the one where a mistake is least likely to look like a
 * mistake: a wrong delay, a palette counted twice, a byte budget that is out by
 * a kilobyte all render as a perfectly plausible page. So the tests are
 * arranged around the two things that would catch that.
 *
 * **Round trips against the writer.** `tools/gif-maker/` writes GIFs, this
 * reads them, and neither was written from the other - both were written from
 * the specification. A file goes through the writer with known frames, delays
 * and palettes, comes back through the reader, and every field has to match. A
 * reader written from the writer would agree with it about a shared mistake;
 * these two can only agree by both being right about the format.
 *
 * **The budget has to add up.** Every byte of every fixture is put in exactly
 * one bucket and the buckets are checked against the file's length. That is the
 * claim the whole "where the bytes went" half of the tool rests on, and it is
 * cheap to check on every file the suite builds.
 *
 * The refusals are here too, because a file that ends mid-block is the case an
 * analyzer exists for and is the easiest one to get wrong by throwing.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { GifWriter } from '../../tools/gif-maker/src/gif.js';
import { lzwEncode } from '../../tools/gif-maker/src/lzw.js';

import { NotAGif, frameData, parseGif } from '../../tools/gif-analyzer/src/gif.js';
import { lzwDecode } from '../../tools/gif-analyzer/src/lzw.js';
import {
  Compositor, duration, interlaceMap, isFullCanvas, paintFrame,
} from '../../tools/gif-analyzer/src/frames.js';
import { budget, distinctColors, paletteWaste } from '../../tools/gif-analyzer/src/budget.js';
import { findings } from '../../tools/gif-analyzer/src/findings.js';

/* -------------------------------------------------------------- fixtures */

/** Four colours, deliberately not greyscale so a channel swap would show. */
const PALETTE = Uint8Array.from([
  255, 0, 0,
  0, 128, 0,
  0, 0, 255,
  250, 250, 40,
]);

/** A frame of one flat colour, as indices. */
const flat = (width, height, index) => new Uint8Array(width * height).fill(index);

/** A frame whose pixels count up, so a row order mistake cannot survive it. */
function ramp(width, height, colours) {
  const out = new Uint8Array(width * height);
  for (let at = 0; at < out.length; at += 1) out[at] = at % colours;
  return out;
}

/** The simplest animation the writer will make: n frames, one shared palette. */
function simple({ width = 6, height = 4, frames = 3, delay = 8, loop = 0 } = {}) {
  const writer = new GifWriter({ width, height, palette: PALETTE, loop });
  for (let index = 0; index < frames; index += 1) {
    writer.addFrame({ indices: flat(width, height, index % 4), delay: delay + index });
  }
  return writer.finalize();
}

/* ------------------------------------------------------- the block reader */

test('reads the header, the screen descriptor and the global palette', () => {
  const gif = parseGif(simple({ width: 9, height: 7 }));

  assert.equal(gif.version, '89a');
  assert.equal(gif.width, 9);
  assert.equal(gif.height, 7);
  assert.equal(gif.size > 0, true);
  assert.equal(gif.globalPalette.count, 4);
  assert.equal(gif.globalPalette.bytes, 12);
  assert.deepEqual(Array.from(gif.globalPalette.colors), Array.from(PALETTE));
  // Square pixels are written as a zero, which means "do not adjust" rather
  // than a ratio of zero.
  assert.equal(gif.aspect, null);
  assert.equal(gif.problems.length, 0);
  assert.equal(gif.truncated, false);
});

test('reads every frame, with its delay and its rectangle', () => {
  const gif = parseGif(simple({ frames: 5, delay: 12 }));

  assert.equal(gif.frames.length, 5);
  assert.deepEqual(gif.frames.map((frame) => frame.delay), [12, 13, 14, 15, 16]);
  for (const frame of gif.frames) {
    assert.equal(frame.left, 0);
    assert.equal(frame.top, 0);
    assert.equal(frame.width, 6);
    assert.equal(frame.height, 4);
    assert.equal(frame.localPalette, false);
    assert.equal(frame.interlaced, false);
    assert.equal(isFullCanvas(gif, frame), true);
  }
});

test('reads the loop count out of the Netscape block', () => {
  assert.equal(parseGif(simple({ loop: 0 })).loop, 0);
  assert.equal(parseGif(simple({ loop: 7 })).loop, 7);

  // No block at all is a different thing from a count of one: the file plays
  // once because nothing told it to repeat, and the page has to say which.
  const once = parseGif(simple({ loop: null }));
  assert.equal(once.loop, null);
  assert.equal(once.extensions.length, 0);
});

test('reads a per-frame palette and a transparent index', () => {
  const writer = new GifWriter({ width: 4, height: 4, loop: 0 });
  writer.addFrame({
    indices: flat(4, 4, 1),
    palette: PALETTE,
    delay: 5,
    transparentIndex: 2,
  });
  const gif = parseGif(writer.finalize());

  assert.equal(gif.globalPalette, null);
  const [frame] = gif.frames;
  assert.equal(frame.localPalette, true);
  assert.equal(frame.palette.count, 4);
  assert.equal(frame.transparentIndex, 2);
  // Transparency forces "clear back to the background", because otherwise the
  // see-through parts of the next frame show this one underneath.
  assert.equal(frame.disposal, 2);
});

test('a frame that names no palette entry beyond its table is still read', () => {
  // The writer pads a four-colour table up to the power of two the format
  // insists on, so the file declares four entries and the reader must not
  // invent the twelve bytes of padding as colours.
  const gif = parseGif(simple());
  assert.equal(gif.globalPalette.count, 4);
  assert.equal(gif.globalPalette.colors.length, 12);
});

/* --------------------------------------------------- the byte accounting */

test('the byte budget adds up to the file, exactly', () => {
  for (const options of [
    { frames: 1 },
    { frames: 12, width: 40, height: 30 },
    { frames: 3, loop: null },
  ]) {
    const bytes = simple(options);
    const gif = parseGif(bytes);
    const plan = budget(gif);

    const summed = plan.rows.reduce((total, row) => total + row.bytes, 0);
    assert.equal(summed, bytes.length,
      `budget rows come to ${summed} for a ${bytes.length}-byte file`);
    assert.equal(plan.rows.some((row) => row.key === 'unaccounted'), false);
    assert.equal(plan.total, bytes.length);
  }
});

test('a frame spans exactly its control block, descriptor, palette and data', () => {
  const gif = parseGif(simple({ frames: 4 }));
  for (const frame of gif.frames) {
    const parts = (frame.control ? frame.control.bytes : 0)
      + 11                                        // descriptor, plus the code size
      + (frame.palette ? frame.palette.bytes : 0)
      + frame.payloadBytes
      + frame.framingBytes;
    assert.equal(frame.bytes, parts);
  }
});

test('a comment between the timing block and its image is not charged to the frame', () => {
  // The specification lets any number of blocks sit between a graphic control
  // extension and the image it describes. Measuring the frame as a span would
  // charge it for the comment; adding the parts up does not.
  const bytes = withComment(simple({ frames: 2 }), 'written by something');
  const gif = parseGif(bytes);
  const plan = budget(gif);

  assert.equal(gif.frames.length, 2);
  assert.equal(gif.extensions.filter((entry) => entry.kind === 'comment').length, 1);
  assert.equal(plan.rows.reduce((total, row) => total + row.bytes, 0), bytes.length);
  assert.equal(plan.rows.some((row) => row.key === 'unaccounted'), false);

  const clean = parseGif(simple({ frames: 2 }));
  assert.deepEqual(gif.frames.map((frame) => frame.bytes),
    clean.frames.map((frame) => frame.bytes));
});

test('a comment block is read back as its text', () => {
  const gif = parseGif(withComment(simple(), 'made in 1998'));
  const comment = gif.extensions.find((entry) => entry.kind === 'comment');
  assert.equal(comment.text, 'made in 1998');
  assert.equal(comment.dataBytes, 12);

  // The key rather than the sentence: the sentences live in body.html now,
  // in fifteen languages, and what this module owes the page is which one
  // applies and the numbers that go in it.
  const found = findings(gif).find((entry) => entry.title === 'find.comment.title');
  assert.notEqual(found, undefined);
  assert.equal(found.values.bytes, '12 B');
});

test('local palettes are counted once each and the global one only once', () => {
  const writer = new GifWriter({ width: 4, height: 4, loop: 0 });
  for (let index = 0; index < 3; index += 1) {
    writer.addFrame({ indices: flat(4, 4, index), palette: PALETTE, delay: 4 });
  }
  const gif = parseGif(writer.finalize());
  const plan = budget(gif);
  const row = plan.rows.find((entry) => entry.key === 'local');

  assert.equal(gif.frames.length, 3);
  assert.equal(row.bytes, 3 * 12);
  assert.equal(plan.rows.find((entry) => entry.key === 'global').bytes, 0);
});

test('bytes sitting after the trailer are found and named', () => {
  const bytes = simple();
  const padded = new Uint8Array(bytes.length + 40);
  padded.set(bytes);
  padded.fill(0x7f, bytes.length);

  const gif = parseGif(padded);
  assert.equal(gif.trailingBytes, 40);
  assert.equal(budget(gif).rows.find((row) => row.key === 'after').bytes, 40);
  assert.equal(budget(gif).rows.reduce((total, row) => total + row.bytes, 0), padded.length);
});

/* ------------------------------------------------------ the decompressor */

test('what the maker compresses, the analyzer expands, byte for byte', () => {
  const cases = [
    { indices: flat(16, 16, 3), codeSize: 2 },
    { indices: ramp(64, 8, 4), codeSize: 2 },
    { indices: ramp(200, 20, 256), codeSize: 8 },
    // Long and varied enough to fill all 4096 codes and force the encoder to
    // reset, which is where an encoder and a decoder disagree about code widths
    // if they are going to.
    { indices: noise(300, 60, 200), codeSize: 8 },
  ];

  for (const { indices, codeSize } of cases) {
    // lzwEncode hands back the raw compressed run; cutting it into the
    // length-prefixed sub-blocks is the container's job, and gif.js does it on
    // the way in. Both sides here work on the run.
    const out = lzwDecode(lzwEncode(indices, codeSize), codeSize, indices.length);

    assert.equal(out.complete, true);
    assert.equal(out.corrupt, null);
    assert.equal(out.truncated, false);
    assert.equal(out.pixels, indices.length);
    assert.deepEqual(Array.from(out.indices), Array.from(indices));
  }
});

test('a frame decodes to the pixels it was built from, through the whole file', () => {
  const indices = ramp(12, 9, 4);
  const writer = new GifWriter({ width: 12, height: 9, palette: PALETTE, loop: 0 });
  writer.addFrame({ indices, delay: 10 });
  const bytes = writer.finalize();

  const gif = parseGif(bytes);
  const [frame] = gif.frames;
  const out = lzwDecode(frameData(bytes, frame), frame.minCodeSize, 12 * 9);

  assert.equal(out.complete, true);
  assert.deepEqual(Array.from(out.indices), Array.from(indices));
  // One reset, at the start of the stream, is how a frame begins. More than
  // that on a frame this small would mean the counting is wrong.
  assert.equal(out.clears, 1);
});

test('a truncated stream returns what it had and says it was cut short', () => {
  const indices = ramp(80, 40, 4);
  const compressed = lzwEncode(indices, 2);
  const out = lzwDecode(compressed.subarray(0, 20), 2, indices.length);

  assert.equal(out.truncated, true);
  assert.equal(out.complete, false);
  assert.equal(out.pixels > 0, true);
  assert.equal(out.pixels < indices.length, true);
  // Everything it did produce is still right: a partial decode that quietly
  // shifted would be worse than no decode at all.
  assert.deepEqual(
    Array.from(out.indices.subarray(0, out.pixels)),
    Array.from(indices.subarray(0, out.pixels)),
  );
});

test('a code referring to an entry that does not exist is refused, not guessed', () => {
  // At a code size of 2 the dictionary starts with four colours, a clear code
  // and an end code, so entry 6 is the first that can be added and 7 does not
  // exist yet. This stream asks for 7 straight after one colour.
  const out = lzwDecode(pack(3, [4, 0, 7]), 2, 64);
  assert.notEqual(out.corrupt, null);
  assert.equal(out.corrupt.key, 'decode.codemissing');
  assert.equal(out.corrupt.values.entries, '6');
  assert.equal(out.complete, false);
});

test('a code that names the entry about to be added is expanded, not refused', () => {
  // The case that looks like a paradox and is legal: a code for the entry that
  // has not been added yet. It is always the previous string plus its own first
  // byte, and every real encoder emits it. Clear, then 0, then entry 6 - which
  // is "0 followed by 0" - giving three pixels of colour zero.
  const out = lzwDecode(pack(3, [4, 0, 6, 5]), 2, 3);
  assert.equal(out.corrupt, null);
  assert.equal(out.complete, true);
  assert.deepEqual(Array.from(out.indices), [0, 0, 0]);
});

test('a code size outside 2..8 is refused before anything is allocated', () => {
  assert.notEqual(lzwDecode(new Uint8Array(4), 1, 16).corrupt, null);
  assert.notEqual(lzwDecode(new Uint8Array(4), 9, 16).corrupt, null);
});

/* -------------------------------------------------------- the compositing */

test('interlaced rows land where the four passes put them', () => {
  assert.deepEqual(Array.from(interlaceMap(8)), [0, 4, 2, 6, 1, 3, 5, 7]);
  assert.deepEqual(Array.from(interlaceMap(1)), [0]);

  // Whatever the height, every row is written exactly once.
  for (const height of [2, 3, 5, 9, 16, 17, 40]) {
    const map = Array.from(interlaceMap(height)).sort((a, b) => a - b);
    assert.deepEqual(map, Array.from({ length: height }, (unused, row) => row));
  }
});

test('a frame paints its palette, and marks which entries it used', () => {
  const frame = {
    index: 0, left: 0, top: 0, width: 2, height: 2, interlaced: false, transparentIndex: -1,
  };
  const painted = paintFrame(frame, Uint8Array.from([0, 1, 2, 3]), {
    colors: PALETTE, count: 4,
  });

  assert.deepEqual(Array.from(painted.pixels.subarray(0, 4)), [255, 0, 0, 255]);
  assert.deepEqual(Array.from(painted.pixels.subarray(4, 8)), [0, 128, 0, 255]);
  assert.equal(painted.missing, 0);
  assert.deepEqual(Array.from(painted.used.subarray(0, 5)), [1, 1, 1, 1, 0]);
});

test('a transparent index is left as nothing, not as black', () => {
  const frame = {
    index: 0, left: 0, top: 0, width: 2, height: 1, interlaced: false, transparentIndex: 0,
  };
  const painted = paintFrame(frame, Uint8Array.from([0, 1]), { colors: PALETTE, count: 4 });

  assert.equal(painted.pixels[3], 0, 'the transparent pixel has no alpha');
  assert.equal(painted.pixels[7], 255, 'the opaque one does');
});

test('a pixel naming an entry the palette does not have is counted, not drawn', () => {
  const frame = {
    index: 0, left: 0, top: 0, width: 2, height: 1, interlaced: false, transparentIndex: -1,
  };
  const painted = paintFrame(frame, Uint8Array.from([0, 9]), { colors: PALETTE, count: 4 });
  assert.equal(painted.missing, 1);
  assert.equal(painted.pixels[7], 0);
});

test('disposal happens after the frame is shown, not before it is drawn', () => {
  const canvas = new Compositor(2, 1);
  const red = Uint8ClampedArray.from([255, 0, 0, 255]);
  const green = Uint8ClampedArray.from([0, 128, 0, 255]);

  // Frame one fills the left pixel and asks for it to be cleared afterwards.
  const first = canvas.draw(
    { left: 0, top: 0, width: 1, height: 1, disposal: 2 }, red,
  );
  assert.deepEqual(Array.from(first.subarray(0, 4)), [255, 0, 0, 255],
    'the frame that asked to be cleared is still shown');
  assert.deepEqual(Array.from(canvas.pixels.subarray(0, 4)), [0, 0, 0, 0],
    'and is gone from the canvas by the time the next frame draws');

  const second = canvas.draw(
    { left: 1, top: 0, width: 1, height: 1, disposal: 1 }, green,
  );
  assert.deepEqual(Array.from(second.subarray(0, 4)), [0, 0, 0, 0]);
  assert.deepEqual(Array.from(second.subarray(4, 8)), [0, 128, 0, 255]);
});

test('"restore what was underneath" puts the canvas back', () => {
  const canvas = new Compositor(1, 1);
  const red = Uint8ClampedArray.from([255, 0, 0, 255]);
  const blue = Uint8ClampedArray.from([0, 0, 255, 255]);
  const rect = { left: 0, top: 0, width: 1, height: 1 };

  canvas.draw({ ...rect, disposal: 1 }, red);
  const shown = canvas.draw({ ...rect, disposal: 3 }, blue);

  assert.deepEqual(Array.from(shown), [0, 0, 255, 255], 'the frame is shown as drawn');
  assert.deepEqual(Array.from(canvas.pixels), [255, 0, 0, 255], 'and then undone');
});

test('a frame smaller than the canvas paints only its own rectangle', () => {
  const canvas = new Compositor(3, 1);
  canvas.draw(
    { left: 1, top: 0, width: 1, height: 1, disposal: 1 },
    Uint8ClampedArray.from([250, 250, 40, 255]),
  );
  assert.deepEqual(Array.from(canvas.pixels), [
    0, 0, 0, 0,
    250, 250, 40, 255,
    0, 0, 0, 0,
  ]);
});

/* ---------------------------------------------------------- the readings */

test('the two durations differ exactly where a browser would clamp', () => {
  assert.deepEqual(duration([{ delay: 10 }, { delay: 10 }]),
    { nominal: 20, real: 20, clamped: 0 });
  // 0 and 1 are both under the floor; 2 is not.
  assert.deepEqual(duration([{ delay: 0 }, { delay: 1 }, { delay: 2 }]),
    { nominal: 3, real: 22, clamped: 2 });
});

test('unused palette entries are counted, and a shared table only once', () => {
  const gif = parseGif(simple({ frames: 3 }));
  // Three frames, each of one flat colour, all off the same four-entry table:
  // three entries referred to between them, one never.
  const used = gif.frames.map((frame, index) => {
    const flags = new Uint8Array(256);
    flags[index % 4] = 1;
    return flags;
  });

  const waste = paletteWaste(gif, used);
  assert.equal(waste.declared, 4, 'the shared table is paid for once');
  assert.equal(waste.referenced, 3);
  assert.equal(waste.wastedEntries, 1);
  assert.equal(waste.wastedBytes, 3);

  assert.equal(distinctColors(gif, used).size, 3);
});

test('a colour in two palettes is one colour, not two', () => {
  const writer = new GifWriter({ width: 2, height: 2, loop: 0 });
  writer.addFrame({ indices: flat(2, 2, 0), palette: PALETTE, delay: 5 });
  writer.addFrame({ indices: flat(2, 2, 0), palette: PALETTE, delay: 5 });
  const gif = parseGif(writer.finalize());

  const used = gif.frames.map(() => {
    const flags = new Uint8Array(256);
    flags[0] = 1;
    return flags;
  });
  assert.equal(distinctColors(gif, used).size, 1);
});

test('the clamped-delay finding fires on the delays that cause it', () => {
  const writer = new GifWriter({ width: 2, height: 2, palette: PALETTE, loop: 0 });
  writer.addFrame({ indices: flat(2, 2, 0), delay: 1 });
  writer.addFrame({ indices: flat(2, 2, 1), delay: 1 });
  const gif = parseGif(writer.finalize());

  const titles = findings(gif).map((finding) => finding.title);
  assert.ok(titles.some((key) => key.startsWith('find.clamped.title')));
});

test('a file with no loop block is told it will only play once', () => {
  const gif = parseGif(simple({ loop: null, frames: 3 }));
  const found = findings(gif).find((finding) => finding.title === 'find.noloop.title');
  assert.notEqual(found, undefined);
  assert.equal(found.level, 'warn');
});

test('a well-formed looping animation raises nothing alarming', () => {
  const writer = new GifWriter({ width: 8, height: 8, palette: PALETTE, loop: 0 });
  for (let index = 0; index < 4; index += 1) {
    writer.addFrame({ indices: flat(8, 8, index), delay: 8 });
  }
  const gif = parseGif(writer.finalize());

  const levels = findings(gif).map((finding) => finding.level);
  assert.equal(levels.includes('bad'), false);
  // Every frame here really is the whole canvas, which is worth one warning and
  // is the only one this file should earn.
  assert.deepEqual(levels.filter((level) => level === 'warn').length, 1);
});

/* --------------------------------------------------------- the refusals */

test('something that is not a GIF is refused as that, not as a broken GIF', () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.throws(() => parseGif(png), (error) => (
    error instanceof NotAGif && /a PNG/.test(error.message)
  ));

  // Too short to hold a signature at all: still the wrong file, not a truncated
  // one, because there is nothing here that claims to be a GIF.
  assert.throws(() => parseGif(Uint8Array.from([0x47])), NotAGif);
});

test('a file that stops mid-block keeps every frame it had read', () => {
  const bytes = simple({ frames: 6 });
  const whole = parseGif(bytes);
  const cut = parseGif(bytes.subarray(0, bytes.length - 30));

  assert.equal(whole.frames.length, 6);
  assert.equal(cut.truncated, true);
  assert.equal(cut.trailerAt, -1);
  assert.equal(cut.frames.length > 0, true);
  assert.equal(cut.frames.length < 6, true);
  assert.equal(cut.problems.length > 0, true);

  // The frames that did survive are unchanged, which is the whole promise.
  for (const [index, frame] of cut.frames.entries()) {
    assert.equal(frame.delay, whole.frames[index].delay);
    assert.equal(frame.payloadBytes, whole.frames[index].payloadBytes);
  }
});

test('a byte where a block marker should be stops the walk and says where', () => {
  const bytes = Uint8Array.from(simple({ frames: 3 }));
  // Find the second frame's image descriptor and corrupt its marker.
  const gif = parseGif(bytes);
  const at = gif.frames[1].control ? gif.frames[1].control.at : gif.frames[1].at;
  bytes[at] = 0x5a;

  const broken = parseGif(bytes);
  assert.equal(broken.frames.length, 1);
  assert.equal(broken.truncated, true);
  // The parser names its complaint and carries the numbers; findings.js
  // hands both to phrase(). Asserting the pair is stricter than asserting a
  // sentence was, because a typo in either now fails.
  assert.equal(broken.problems[0].key, 'parse.unknownblock');
  assert.equal(broken.problems[0].values.at, String(at));
  assert.equal(broken.problems[0].values.marker, '5a');
});

test('a truncated file still produces a budget, with the gap named', () => {
  const bytes = simple({ frames: 6 });
  const gif = parseGif(bytes.subarray(0, bytes.length - 30));
  const plan = budget(gif);

  const summed = plan.rows.reduce((total, row) => total + row.bytes, 0);
  assert.equal(summed, gif.size);
  assert.equal(plan.rows.some((row) => row.key === 'unaccounted'), true);
});

/* ----------------------------------------------------------- the helpers */

/**
 * Slip a comment extension in between the first frame's timing block and its
 * image descriptor.
 *
 * The writer in `tools/gif-maker/` has no reason to produce this and never
 * will; files in the wild do, because the specification allows any number of
 * blocks between a graphic control extension and the image it describes.
 */
function withComment(bytes, comment) {
  const text = Uint8Array.from(comment, (character) => character.charCodeAt(0) & 0xff);
  const block = Uint8Array.from([0x21, 0xfe, text.length, ...text, 0]);

  // The first graphic control extension: 0x21 0xF9, somewhere after the header.
  let at = 13;
  while (at < bytes.length - 1 && !(bytes[at] === 0x21 && bytes[at + 1] === 0xf9)) at += 1;
  const after = at + 8;

  const out = new Uint8Array(bytes.length + block.length);
  out.set(bytes.subarray(0, after));
  out.set(block, after);
  out.set(bytes.subarray(after), after + block.length);
  return out;
}

/**
 * A handful of codes, packed the way the format packs them: fixed width, least
 * significant bit first, running across byte boundaries.
 *
 * Written out here rather than produced by the encoder because the streams
 * these tests need are ones no encoder would ever emit.
 */
function pack(width, codes) {
  const out = [];
  let buffer = 0;
  let bits = 0;
  for (const code of codes) {
    buffer |= code << bits;
    bits += width;
    while (bits >= 8) {
      out.push(buffer & 0xff);
      buffer >>= 8;
      bits -= 8;
    }
  }
  if (bits > 0) out.push(buffer & 0xff);
  return Uint8Array.from(out);
}

/**
 * Pixels varied enough to exhaust the dictionary.
 *
 * A fixed generator rather than Math.random, so a failure is reproducible: the
 * point is to fill 4,096 codes and force a reset, and a test that does that
 * only sometimes is worse than one that never does.
 */
function noise(width, height, colours) {
  const out = new Uint8Array(width * height);
  let state = 0x2f6e2b1;
  for (let at = 0; at < out.length; at += 1) {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    out[at] = (state >>> 16) % colours;
  }
  return out;
}
