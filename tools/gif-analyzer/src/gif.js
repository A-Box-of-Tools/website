/**
 * The GIF reader: a walk through the file's blocks that records where each one
 * started and how long it was.
 *
 * The offsets are not incidental. This tool's whole job is to say where a
 * file's bytes went, and that answer is only trustworthy if the parts add up to
 * the file - so every block records `at` and `bytes`, and `budget.js` later
 * checks that the sum is the file size exactly. A parser that merely extracted
 * the fields would produce a plausible-looking pie chart that could be wrong by
 * a kilobyte and never say so.
 *
 * The pixels are not decompressed here. This file finds the compressed runs and
 * measures them; `lzw.js` expands one when something asks for it, which keeps
 * "what is in this file" separate from "what does it draw", and means a file
 * with one corrupt frame still reports the other ninety-nine.
 *
 * WHAT IT DOES WITH A BROKEN FILE
 *
 * It keeps what it read. A GIF that stops halfway, or that has a byte where a
 * block marker should be, is a file somebody is analysing precisely because it
 * is broken - so the parse stops, records why in `problems`, and returns the
 * frames it already had rather than throwing all of them away.
 *
 * @see https://www.w3.org/Graphics/GIF/spec-gif89a.txt
 */

import { ByteReader, Truncated, text } from './reader.js';

/** Block markers, by their leading byte. */
const EXTENSION = 0x21;
const IMAGE_DESCRIPTOR = 0x2c;
const TRAILER = 0x3b;

/** Extension labels, by the byte after the 0x21. */
const GRAPHIC_CONTROL = 0xf9;
const COMMENT = 0xfe;
const PLAIN_TEXT = 0x01;
const APPLICATION = 0xff;

/** The header: six bytes of signature plus the seven-byte screen descriptor. */
const HEADER_BYTES = 13;

/** What to leave behind when a frame's time is up. Indexed by the field value. */
export const DISPOSALS = [
  'Unspecified',
  'Leave it in place',
  'Clear back to the background',
  'Restore what was underneath',
];

/**
 * Read a GIF.
 *
 * @param {Uint8Array} bytes  the whole file
 * @returns {object} everything the file says about itself, with byte ranges
 */
export function parseGif(bytes) {
  // Checked before the reader is even made, so that a file too short to hold a
  // signature is reported as the wrong file rather than as a truncated GIF.
  if (bytes.length < 6 || text(bytes.subarray(0, 3)) !== 'GIF') {
    throw new NotAGif(`this file starts with ${describe(bytes)}, not "GIF"`);
  }

  const reader = new ByteReader(bytes);
  reader.skip(3);
  const version = reader.ascii(3);

  const width = reader.u16();
  const height = reader.u16();
  const packed = reader.u8();
  const backgroundIndex = reader.u8();
  const aspectByte = reader.u8();

  const gif = {
    size: bytes.length,
    version,
    width,
    height,
    // Three bits saying how many bits of colour the picture the GIF was made
    // from had. Nothing has read it since about 1990; every encoder writes its
    // own table's depth here. Reported because a file that says something
    // unusual is a hint about what wrote it.
    colorResolution: ((packed >> 4) & 7) + 1,
    globalSorted: Boolean(packed & 8),
    backgroundIndex,
    aspectByte,
    // 0 means square pixels. Anything else is (n + 15) / 64, a rule from a time
    // when displays were not square, and is ignored by every modern decoder.
    aspect: aspectByte === 0 ? null : (aspectByte + 15) / 64,
    globalPalette: null,
    loop: null,
    loopSource: null,
    frames: [],
    extensions: [],
    trailerAt: -1,
    trailingBytes: 0,
    truncated: false,
    problems: [],
  };

  if (packed & 0x80) {
    const count = 1 << ((packed & 7) + 1);
    gif.globalPalette = readPalette(reader, count, gif.globalSorted);
  }

  walk(reader, gif);
  return gif;
}

/** Thrown when the file is not a GIF at all, which is a different mistake. */
export class NotAGif extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotAGif';
  }
}

/** What a file that is not a GIF appears to be, for the error message. */
function describe(bytes) {
  const magic = [
    [[0xff, 0xd8, 0xff], 'a JPEG'],
    [[0x89, 0x50, 0x4e, 0x47], 'a PNG'],
    [[0x52, 0x49, 0x46, 0x46], 'a RIFF file - a WebP or a WAV'],
    [[0x25, 0x50, 0x44, 0x46], 'a PDF'],
    [[0x50, 0x4b, 0x03, 0x04], 'a zip file'],
  ];
  for (const [prefix, name] of magic) {
    if (prefix.every((byte, i) => bytes[i] === byte)) return name;
  }
  const head = Array.from(bytes.subarray(0, 3), (b) => b.toString(16).padStart(2, '0'));
  return `the bytes ${head.join(' ')}`;
}

/** A colour table: `count` entries of three bytes, red green blue. */
function readPalette(reader, count, sorted) {
  const at = reader.at;
  const colors = reader.slice(count * 3);
  return { at, bytes: count * 3, count, sorted, colors };
}

/**
 * The block stream, from after the global colour table to the trailer.
 *
 * One loop, one block per turn, and the only state carried between turns is the
 * graphic control extension - which is a block in its own right that describes
 * the *next* image rather than itself, and is the reason a frame's timing and a
 * frame's pixels arrive separately.
 */
function walk(reader, gif) {
  let control = null;

  // A key and its numbers rather than a sentence: this module is copied into
  // fifteen languages, and findings.js resolves what it names. See
  // shared/js/phrases.js.
  const stop = (key, values = {}) => {
    gif.problems.push({ key, values });
  };

  while (true) {
    if (reader.done) {
      gif.truncated = true;
      stop('parse.notrailer');
      return;
    }

    const start = reader.at;
    let marker;
    try {
      marker = reader.u8();

      if (marker === TRAILER) {
        gif.trailerAt = start;
        gif.trailingBytes = reader.left;
        return;
      }

      if (marker === IMAGE_DESCRIPTOR) {
        gif.frames.push(readImage(reader, gif, control, control ? control.at : start));
        control = null;
        continue;
      }

      if (marker !== EXTENSION) {
        stop('parse.unknownblock', {
          at: start.toLocaleString(),
          marker: marker.toString(16).padStart(2, '0'),
        });
        gif.truncated = true;
        return;
      }

      const label = reader.u8();
      if (label === GRAPHIC_CONTROL) {
        if (control) {
          stop('parse.twocontrols', {
            first: control.at.toLocaleString(),
            second: start.toLocaleString(),
          });
        }
        control = readControl(reader, start);
        continue;
      }

      gif.extensions.push(readExtension(reader, gif, label, start));
    } catch (error) {
      if (!(error instanceof Truncated)) throw error;
      gif.truncated = true;
      stop('parse.midblock', { at: start.toLocaleString(), detail: error.message });
      return;
    }
  }
}

/**
 * The graphic control extension: how long, what afterwards, and which index is
 * see-through.
 *
 * Its four fields are declared with a length in front of them, and that length
 * is 4 in every file anybody has. It is read as a length anyway, and the
 * trailing sub-blocks are consumed properly, because the alternative is that
 * one unusual file shifts the cursor by a byte and every block after it becomes
 * nonsense - the failure this whole parser is written to avoid.
 */
function readControl(reader, at) {
  const size = reader.u8();
  const fields = reader.slice(size);
  const packed = fields[0] ?? 0;
  const delay = size >= 3 ? fields[1] | (fields[2] << 8) : 0;
  const transparentIndex = fields[3] ?? 0;

  let blocks = 0;
  while (true) {
    const next = reader.u8();
    if (next === 0) break;
    reader.skip(next);
    blocks += 1;
  }

  return {
    at,
    // Eight, in every well-formed file: 0x21, 0xF9, the size byte, four bytes
    // of fields, and the zero terminator.
    bytes: reader.at - at,
    size,
    delay,
    disposal: (packed >> 2) & 7,
    userInput: Boolean(packed & 2),
    transparent: Boolean(packed & 1),
    transparentIndex,
    wellFormed: size === 4 && blocks === 0,
  };
}

/**
 * One frame: an image descriptor, perhaps a colour table of its own, and then
 * the compressed pixels in length-prefixed sub-blocks.
 *
 * The sub-blocks are measured rather than joined. A frame's payload is usually
 * most of what it costs, and the framing around it - one length byte per 255
 * and a zero at the end - is the rest; keeping the two apart is what lets the
 * byte budget show the second one, which is otherwise invisible and, on a GIF
 * of many tiny frames, is not nothing.
 */
function readImage(reader, gif, control, at) {
  const left = reader.u16();
  const top = reader.u16();
  const width = reader.u16();
  const height = reader.u16();
  const packed = reader.u8();

  const interlaced = Boolean(packed & 0x40);
  const sorted = Boolean(packed & 0x20);
  let palette = null;
  if (packed & 0x80) {
    palette = readPalette(reader, 1 << ((packed & 7) + 1), sorted);
  }

  const minCodeSize = reader.u8();
  const dataAt = reader.at;

  // Walk the sub-blocks without copying them. `lzw.js` is handed the ranges and
  // joins them only when a frame is actually being drawn, so opening a hundred-
  // megabyte GIF to read its structure does not also copy it.
  const runs = [];
  let payloadBytes = 0;
  while (true) {
    const size = reader.u8();
    if (size === 0) break;
    runs.push([reader.at, size]);
    reader.skip(size);
    payloadBytes += size;
  }

  const paletteBytes = palette ? palette.bytes : 0;

  return {
    index: gif.frames.length,
    at,
    // Added up from the parts rather than measured as `reader.at - at`, because
    // a graphic control block does not have to sit immediately in front of the
    // image it describes - a comment may come between them - and a span would
    // then quietly charge this frame for somebody else's block.
    bytes: (control ? control.bytes : 0) + 11 + paletteBytes + payloadBytes + runs.length + 1,
    control,
    left,
    top,
    width,
    height,
    interlaced,
    palette,
    localPalette: Boolean(palette),
    minCodeSize,
    dataAt,
    dataBytes: reader.at - dataAt,
    payloadBytes,
    // The length bytes and the terminating zero: what the sub-block scheme
    // costs on top of the compressed data itself.
    framingBytes: runs.length + 1,
    subBlocks: runs.length,
    runs,
    delay: control ? control.delay : 0,
    disposal: control ? control.disposal : 0,
    transparentIndex: control && control.transparent ? control.transparentIndex : -1,
  };
}

/**
 * Everything else with a 0x21 in front of it: comments, application blocks, and
 * the plain-text extension nobody has ever implemented.
 *
 * They all share one shape - a fixed head, then sub-blocks - so they are read
 * the same way and told apart afterwards. Two of them are worth understanding
 * rather than measuring, and both are here: NETSCAPE, which is the only reason
 * a GIF loops, and XMP, which is how a file ends up carrying forty kilobytes of
 * XML describing an edit made in 2009.
 */
function readExtension(reader, gif, label, at) {
  const block = { at, label, kind: 'unknown', name: '', bytes: 0, dataBytes: 0, text: null };

  let head = null;
  if (label === APPLICATION) {
    const size = reader.u8();
    head = reader.slice(size);
    block.kind = 'application';
    block.name = text(head.subarray(0, 8)).trim();
    block.auth = text(head.subarray(8, 11));
  } else if (label === PLAIN_TEXT) {
    const size = reader.u8();
    head = reader.slice(size);
    block.kind = 'plain-text';
    block.name = 'Plain text';
  } else if (label === COMMENT) {
    block.kind = 'comment';
    block.name = 'Comment';
  } else {
    block.name = `Extension 0x${label.toString(16).padStart(2, '0')}`;
  }

  const runs = [];
  let dataBytes = 0;
  while (true) {
    const size = reader.u8();
    if (size === 0) break;
    runs.push(reader.slice(size));
    dataBytes += size;
  }

  block.bytes = reader.at - at;
  block.dataBytes = dataBytes;
  block.subBlocks = runs.length;

  if (isXmp(block)) block.text = joinText(runs, true);
  else if (block.kind === 'comment') block.text = joinText(runs, false);

  // The Netscape application extension. It is not in the specification: it is a
  // private block from Navigator 2.0 that everything implemented anyway, which
  // is why the loop count of every animated GIF on the internet is carried in a
  // vendor extension rather than in a field. Sub-block id 1 is the counter, and
  // 0 there means forever.
  if (block.kind === 'application' && (block.name === 'NETSCAPE' || block.name === 'ANIMEXTS1.0')) {
    const first = runs[0];
    if (first && first.length >= 3 && first[0] === 1) {
      const times = first[1] | (first[2] << 8);
      if (gif.loop === null) {
        gif.loop = times;
        gif.loopSource = block.name;
      }
      block.loop = times;
    }
  }

  return block;
}

/** Adobe's XMP packet, which rides in an application extension of its own. */
const isXmp = (block) => block.kind === 'application' && block.name.startsWith('XMP');

/**
 * Join sub-blocks back into one string.
 *
 * XMP is the reason this is not simply a concatenation of the payloads: Adobe
 * writes the packet as one run of bytes and then appends a 258-byte magic
 * trailer to make the sub-block lengths come out right, so the tail has to go.
 * It is a trick, it is in every file Photoshop has ever saved, and reading the
 * XML without knowing about it gets you 258 bytes of binary on the end.
 */
function joinText(runs, trimXmpTrailer) {
  const total = runs.reduce((sum, run) => sum + run.length, 0);
  const joined = new Uint8Array(total);
  let at = 0;
  for (const run of runs) {
    joined.set(run, at);
    at += run.length;
  }

  const asText = text(joined);
  if (!trimXmpTrailer) return asText;

  const marker = asText.lastIndexOf('<?xpacket end');
  if (marker < 0) return asText;
  const close = asText.indexOf('>', marker);
  return close < 0 ? asText : asText.slice(0, close + 1);
}

/**
 * A frame's compressed bytes, joined out of its sub-blocks.
 *
 * Done here rather than during the parse for the reason in `readImage`: the
 * structure of a large GIF is cheap to read and the pixels are not, so nothing
 * is copied until a frame is about to be drawn.
 */
export function frameData(bytes, frame) {
  const out = new Uint8Array(frame.payloadBytes);
  let at = 0;
  for (const [start, size] of frame.runs) {
    out.set(bytes.subarray(start, start + size), at);
    at += size;
  }
  return out;
}

/** The palette a frame draws with: its own if it has one, the file's otherwise. */
export const paletteFor = (gif, frame) => frame.palette ?? gif.globalPalette;

export { HEADER_BYTES };
