/**
 * The WAV writer.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/wav.js and the build
 * copies it to <tool>/src/shared/wav.js for the tools that ask for it with
 * `js_parts = ["wav", ...]`: the audio editor, the trimmer and the extractor,
 * which carried identical copies until the tests could follow a `./shared/`
 * import (tests/js/resolve-shared.mjs). It imports nothing, so it can be asked
 * for on its own.
 *
 * This is the whole of the export path, and it is deliberately the smallest
 * file in any audio tool here: a WAV is a header in front of the samples. No browser
 * ships an encoder for MP3, AAC or Opus that can be driven faster than real
 * time, so the honest choice is the one format that needs no encoder at all -
 * Float preserves the decoded samples. PCM16 rounds and clamps them; both
 * paths write locally, and large outputs still take time and memory.
 *
 * Two depths, because they answer different questions:
 *
 *   16-bit PCM   what everything on earth plays, and what a CD is. Half the
 *                size of float, and below the noise floor of anything that
 *                was ever an MP3.
 *   32-bit float exactly the samples this tool computed, including any that
 *                went past full scale. Nothing is clamped, so an edit that
 *                overshot can still be pulled back down in an editor.
 */

/** RIFF chunk ids and the two format tags used here. */
const PCM = 1;
const IEEE_FLOAT = 3;
const headerSize = (float) => (float ? 58 : 44);

/**
 * Write channels of Float32 samples as a WAV file.
 *
 * @param {Float32Array[]} channels one array per channel, all the same length
 * @param {number} sampleRate       frames per second
 * @param {{bits?: 16|32}} options  16 for PCM, 32 for IEEE float
 * @returns {Blob} the file, ready to be handed to a download link
 */
export function writeWav(channels, sampleRate, { bits = 16 } = {}) {
  const { header, float, frames } = prepareWav(channels, sampleRate, { bits });
  return new Blob([header, packWavFrames(channels, float, 0, frames)], { type: 'audio/wav' });
}

/** Both writers validate the complete RIFF before allocating sample bytes. */
export function prepareWav(channels, sampleRate, { bits = 16 } = {}) {
  if (!channels.length) throw new Error('wav.nochannels');
  const frames = channels[0].length;
  for (const channel of channels) {
    if (channel.length !== frames) throw new Error('wav.uneven');
  }

  const float = bits === 32;
  const dataBytes = frames * channels.length * (float ? 4 : 2);
  const headerBytes = headerSize(float);
  // The RIFF count includes its remaining header, not just the sample data.
  // Float's fact chunk and cbSize also belong inside that 32-bit ceiling.
  if (dataBytes > 0xffffffff - (headerBytes - 8)) throw new Error('wav.toobig');

  return {
    frames, float,
    header: writeHeader({ float, bits, sampleRate, channels: channels.length, frames, dataBytes }),
  };
}

/**
 * The header.
 *
 * PCM gets the classic 16-byte `fmt `, which is what every reader since 1991
 * expects. Float gets an 18-byte one with an explicit `cbSize` of zero and a
 * `fact` chunk naming the frame count, because that is what the non-PCM half
 * of the specification asks for and some readers check.
 */
function writeHeader({ float, bits, sampleRate, channels, frames, dataBytes }) {
  const fmtBytes = float ? 18 : 16;
  const headerBytes = headerSize(float);

  const bytes = new Uint8Array(headerBytes);
  const view = new DataView(bytes.buffer);
  let at = 0;

  const tag = (text) => {
    for (let i = 0; i < 4; i += 1) bytes[at + i] = text.charCodeAt(i);
    at += 4;
  };
  const u32 = (value) => { view.setUint32(at, value, true); at += 4; };
  const u16 = (value) => { view.setUint16(at, value, true); at += 2; };

  tag('RIFF');
  u32(headerBytes - 8 + dataBytes); // everything after this field
  tag('WAVE');

  tag('fmt ');
  u32(fmtBytes);
  u16(float ? IEEE_FLOAT : PCM);
  u16(channels);
  u32(sampleRate);
  u32(sampleRate * channels * (bits / 8)); // bytes per second
  u16(channels * (bits / 8));              // bytes per frame
  u16(bits);
  if (float) u16(0);                       // cbSize: no extension follows

  if (float) {
    tag('fact');
    u32(4);
    u32(frames);
  }

  tag('data');
  u32(dataBytes);
  return bytes;
}

/**
 * Channels in, one run of frames out.
 *
 * The 16-bit path is where the only lossy step in this tool lives, and it is
 * the conventional one: full scale negative is one step further from zero than
 * full scale positive, so the two directions are scaled by their own limit
 * rather than both by 32767. Anything past full scale is clamped, which is
 * what "this will clip" on the page is warning about.
 */
export function packWavFrames(channels, float, from, to) {
  const count = channels.length;
  const frames = to - from;
  const out = float
    ? new Float32Array(frames * count)
    : new Int16Array(frames * count);

  if (count === 1) {
    const [only] = channels;
    for (let i = 0; i < frames; i += 1) out[i] = float ? only[from + i] : toPcm16(only[from + i]);
    return new Uint8Array(out.buffer);
  }

  for (let channel = 0; channel < count; channel += 1) {
    const samples = channels[channel];
    let at = channel;
    for (let i = 0; i < frames; i += 1, at += count) {
      out[at] = float ? samples[from + i] : toPcm16(samples[from + i]);
    }
  }
  return new Uint8Array(out.buffer);
}

function toPcm16(value) {
  if (value >= 1) return 32767;
  if (value <= -1) return -32768;
  return Math.round(value < 0 ? value * 32768 : value * 32767);
}

/** What a file of this shape will weigh, for the line on the page that says so. */
export function wavSize(frames, channels, bits) {
  return headerSize(bits === 32) + frames * channels * (bits / 8);
}
