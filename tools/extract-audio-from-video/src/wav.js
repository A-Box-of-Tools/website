/**
 * The WAV writer.
 *
 * This is the whole of the export path, and it is deliberately the smallest
 * file in the tool: a WAV is a header in front of the samples. No browser
 * ships an encoder for MP3, AAC or Opus that can be driven faster than real
 * time, so the honest choice is the one format that needs no encoder at all -
 * the samples are written down as they already are, which cannot cost quality
 * and cannot be slow.
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

/**
 * Write channels of Float32 samples as a WAV file.
 *
 * @param {Float32Array[]} channels one array per channel, all the same length
 * @param {number} sampleRate       frames per second
 * @param {{bits?: 16|32}} options  16 for PCM, 32 for IEEE float
 * @returns {Blob} the file, ready to be handed to a download link
 */
export function writeWav(channels, sampleRate, { bits = 16 } = {}) {
  if (!channels.length) throw new Error('wav.nochannels');
  const frames = channels[0].length;
  for (const channel of channels) {
    if (channel.length !== frames) throw new Error('wav.uneven');
  }

  const float = bits === 32;
  const bytesPerSample = float ? 4 : 2;
  const dataBytes = frames * channels.length * bytesPerSample;

  // A RIFF size field is 32 bits, so a WAV cannot describe more than 4 GB and
  // players disagree about what to do with one that claims to. Refusing is
  // better than writing a file that opens as noise somewhere else.
  if (dataBytes > 0xfffffff0) {
    throw new Error('wav.toobig');
  }

  const header = writeHeader({
    float, bits, sampleRate, channels: channels.length, frames, dataBytes,
  });
  const samples = interleave(channels, float);
  return new Blob([header, samples], { type: 'audio/wav' });
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
  const factBytes = float ? 12 : 0;
  const headerBytes = 12 + 8 + fmtBytes + factBytes + 8;

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
function interleave(channels, float) {
  const count = channels.length;
  const frames = channels[0].length;
  const out = float
    ? new Float32Array(frames * count)
    : new Int16Array(frames * count);

  if (count === 1) {
    const [only] = channels;
    for (let i = 0; i < frames; i += 1) out[i] = float ? only[i] : toPcm16(only[i]);
    return new Uint8Array(out.buffer);
  }

  for (let channel = 0; channel < count; channel += 1) {
    const samples = channels[channel];
    let at = channel;
    for (let i = 0; i < frames; i += 1, at += count) {
      out[at] = float ? samples[i] : toPcm16(samples[i]);
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
  return 44 + frames * channels * (bits / 8);
}
