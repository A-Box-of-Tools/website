/**
 * What a recipe can use, evaluated in the tool's own page before its `run`.
 *
 * There are no sample files checked into this repository and there should not
 * be. A photograph would carry somebody's copyright and a licence to read; a
 * scan would carry whatever was on the paper. So the files the tools are
 * photographed with are drawn here, in the page, a few seconds before they are
 * used: a canvas, a gradient and some shapes, encoded by the browser itself.
 * They are obviously synthetic at full size and read as a photograph at the
 * size a screenshot shows them, which is the size that matters.
 *
 * Everything is deterministic. The same recipe run twice produces the same
 * picture, so a screenshot that changes is a screenshot of something that
 * changed.
 */

(() => {
  const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

  /** A tiny deterministic generator, so "random" here is the same every run. */
  function rng(seed) {
    let state = seed >>> 0;
    return () => {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }

  function canvas(width, height) {
    const element = document.createElement('canvas');
    element.width = width;
    element.height = height;
    return element;
  }

  function toFile(element, name, type, quality) {
    return new Promise((done) => {
      element.toBlob((blob) => done(new File([blob], name, { type })),
                     type, quality);
    });
  }

  /**
   * A landscape, drawn rather than photographed: sky, sun, three ridges, water,
   * and a grain of noise over the whole of it so a compressor has something to
   * chew on. Detailed enough that resizing, cropping and quality all show.
   */
  function drawPhoto(context, width, height, seed = 7) {
    const random = rng(seed);
    const sky = context.createLinearGradient(0, 0, 0, height * 0.62);
    sky.addColorStop(0, '#1f4f8a');
    sky.addColorStop(0.55, '#7bb0d8');
    sky.addColorStop(1, '#f2c98a');
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    context.fillStyle = '#fde9b8';
    context.beginPath();
    context.arc(width * 0.72, height * 0.3, Math.min(width, height) * 0.07,
                0, Math.PI * 2);
    context.fill();

    const ridges = [
      { base: 0.68, height: 0.26, colour: '#3f5f6b' },
      { base: 0.72, height: 0.18, colour: '#4f7480' },
      { base: 0.76, height: 0.12, colour: '#688e96' },
    ];
    for (const ridge of ridges) {
      context.fillStyle = ridge.colour;
      context.beginPath();
      context.moveTo(0, height);
      let x = 0;
      let y = height * ridge.base;
      context.lineTo(x, y);
      while (x < width) {
        const step = width * (0.08 + random() * 0.09);
        const rise = height * ridge.height * (random() - 0.45);
        x += step;
        y = Math.max(height * (ridge.base - ridge.height),
                     Math.min(height * (ridge.base + 0.04), y + rise));
        context.lineTo(x, y);
      }
      context.lineTo(width, height);
      context.closePath();
      context.fill();
    }

    const water = context.createLinearGradient(0, height * 0.78, 0, height);
    water.addColorStop(0, '#2c4a63');
    water.addColorStop(1, '#16283a');
    context.fillStyle = water;
    context.fillRect(0, height * 0.78, width, height * 0.22);
    context.strokeStyle = 'rgba(255,255,255,0.18)';
    context.lineWidth = Math.max(1, height / 400);
    for (let i = 0; i < 22; i += 1) {
      const y = height * (0.79 + random() * 0.2);
      const from = width * random() * 0.8;
      context.beginPath();
      context.moveTo(from, y);
      context.lineTo(from + width * (0.05 + random() * 0.18), y);
      context.stroke();
    }

    // Two birds, because an image with nothing small in it hides exactly the
    // damage a guide about resizing is describing.
    context.strokeStyle = 'rgba(20,30,40,0.75)';
    context.lineWidth = Math.max(1.5, height / 300);
    for (const [bx, by, scale] of [[0.3, 0.22, 1], [0.38, 0.28, 0.7]]) {
      const size = Math.min(width, height) * 0.035 * scale;
      context.beginPath();
      context.moveTo(width * bx - size, height * by);
      context.quadraticCurveTo(width * bx - size / 2, height * by - size / 2,
                               width * bx, height * by);
      context.quadraticCurveTo(width * bx + size / 2, height * by - size / 2,
                               width * bx + size, height * by);
      context.stroke();
    }

    const grain = context.getImageData(0, 0, width, height);
    for (let i = 0; i < grain.data.length; i += 4) {
      const shift = (random() - 0.5) * 14;
      grain.data[i] += shift;
      grain.data[i + 1] += shift;
      grain.data[i + 2] += shift;
    }
    context.putImageData(grain, 0, 0);
  }

  /** A page of text, for the tools that are handed paper rather than pictures. */
  function drawPage(context, width, height, { heading = 'Quarterly report' } = {}) {
    const random = rng(19);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    const margin = width * 0.1;
    context.fillStyle = '#111417';
    context.font = `600 ${Math.round(width * 0.045)}px Georgia, serif`;
    context.fillText(heading, margin, height * 0.12);

    context.fillStyle = '#3c4248';
    let y = height * 0.18;
    while (y < height * 0.88) {
      const run = 0.6 + random() * 0.4;
      const gap = height * 0.028;
      context.fillRect(margin, y, (width - margin * 2) * run,
                       Math.max(2, height * 0.008));
      y += gap;
      if (random() < 0.12) y += gap * 0.8;
    }
  }

  /**
   * A short film, encoded in the page.
   *
   * WebCodecs draws the frames and crop-video's own MP4 writer wraps them,
   * imported straight off the site being photographed - it is the same origin,
   * so `/crop-video/src/mp4.js` is just there. Borrowing it rather than
   * carrying a copy is deliberate: the repository already keeps five copies of
   * the MP4 reader in step by hand, and a sixth living in a dev script is one
   * nobody would think to look at. If that module's shape ever changes this
   * fails loudly on the next capture, which is the right way round.
   *
   * MediaRecorder would be fewer lines and was the first attempt. It timestamps
   * frames by the wall clock, so a twelve second clip takes twelve seconds to
   * make and the guides need a couple of dozen of them. Encoding by hand puts
   * the timestamps where they are asked for and the whole clip takes about a
   * second.
   */
  async function film({ width, height, seconds, fps, draw, keyEvery }) {
    const { Mp4Writer, VIDEO_TIMESCALE } = await import('/crop-video/src/mp4.js');
    const writer = new Mp4Writer({ width, height });
    const encoder = new VideoEncoder({
      output: (chunk, meta) => {
        if (meta?.decoderConfig?.description) {
          writer.setDecoderConfig(meta.decoderConfig.description);
        }
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        writer.addVideoSample(
          data, chunk.type === 'key',
          Math.round((chunk.timestamp * VIDEO_TIMESCALE) / 1e6));
      },
      error: (problem) => { throw problem; },
    });
    encoder.configure({
      codec: 'avc1.42E01E',
      width,
      height,
      bitrate: 3_000_000,
      framerate: fps,
      // Length-prefixed samples in an avcC track, which is what the writer
      // above is expecting; the other format is Annex B, for a stream.
      avc: { format: 'avc' },
    });

    const element = canvas(width, height);
    const context = element.getContext('2d');
    const total = Math.round(seconds * fps);
    for (let i = 0; i < total; i += 1) {
      draw(context, i / fps, i);
      const frame = new VideoFrame(element, {
        timestamp: Math.round((i * 1e6) / fps),
        duration: Math.round(1e6 / fps),
      });
      encoder.encode(frame, { keyFrame: i % keyEvery === 0 });
      frame.close();
      // The encoder queue is not infinite and nothing here is in a hurry.
      if (encoder.encodeQueueSize > 30) await sleep(0);
    }
    await encoder.flush();
    encoder.close();
    return writer.finalize();
  }

  /** The scene every clip is of: a landscape, a sun crossing it, and a clock. */
  function drawScene(context, width, height, at, seconds) {
    const noon = Math.min(1, at / Math.max(seconds, 0.001));
    const sky = context.createLinearGradient(0, 0, 0, height * 0.7);
    sky.addColorStop(0, `hsl(${210 - noon * 30} 55% ${30 + noon * 14}%)`);
    sky.addColorStop(1, `hsl(${34 + noon * 10} 70% ${64 + noon * 10}%)`);
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    context.fillStyle = '#fdeab6';
    context.beginPath();
    context.arc(width * (0.12 + noon * 0.76),
                height * (0.6 - Math.sin(noon * Math.PI) * 0.42),
                height * 0.07, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#39525c';
    context.beginPath();
    context.moveTo(0, height);
    context.lineTo(0, height * 0.72);
    context.lineTo(width * 0.28, height * 0.55);
    context.lineTo(width * 0.52, height * 0.74);
    context.lineTo(width * 0.74, height * 0.58);
    context.lineTo(width, height * 0.75);
    context.lineTo(width, height);
    context.fill();

    // A ball crossing the frame, so a still is obviously a still of one moment
    // and a reversed clip is obviously reversed.
    context.fillStyle = '#e2574c';
    context.beginPath();
    context.arc(width * (0.08 + ((at * 0.22) % 1) * 0.84),
                height * (0.84 - Math.abs(Math.sin(at * 2.2)) * 0.18),
                height * 0.045, 0, Math.PI * 2);
    context.fill();

    // The clock. A guide about trimming is about which seconds, and a picture
    // of it that does not say which second is a picture of nothing.
    const stamp = `${Math.floor(at / 60)}:${String(Math.floor(at % 60)).padStart(2, '0')}`
      + `.${String(Math.floor((at % 1) * 10))}`;
    context.font = `600 ${Math.round(height * 0.11)}px "Segoe UI", system-ui, sans-serif`;
    context.textBaseline = 'top';
    const pad = height * 0.03;
    const wide = context.measureText(stamp).width;
    context.fillStyle = 'rgba(12,16,22,0.55)';
    context.fillRect(pad, pad, wide + pad * 1.6, height * 0.135);
    context.fillStyle = '#ffffff';
    context.fillText(stamp, pad * 1.8, pad * 1.25);
  }

  /**
   * A WAV, written by hand.
   *
   * Not a recording of anything: bursts of a wandering tone separated by
   * silence, which is what a voice memo looks like once it is a waveform, and
   * the point of every screenshot that shows one - a guide about trimming needs
   * gaps a reader can see the tool marking.
   */
  function wave({ seconds, rate, name }) {
    const count = Math.round(seconds * rate);
    const samples = new Int16Array(count);
    const random = rng(3);
    // Where the talking is, as fractions of the whole.
    const phrases = [[0.04, 0.20], [0.26, 0.46], [0.53, 0.62], [0.70, 0.95]];
    for (let i = 0; i < count; i += 1) {
      const at = i / count;
      const phrase = phrases.find(([from, to]) => at >= from && at <= to);
      if (!phrase) {
        samples[i] = (random() - 0.5) * 240;
        continue;
      }
      const into = (at - phrase[0]) / (phrase[1] - phrase[0]);
      // A quick attack and a slow tail, so the block has a shape rather than
      // being a rectangle of noise.
      const envelope = Math.min(1, into * 12) * (1 - into) ** 0.4;
      const pitch = 150 + Math.sin(into * 9) * 40;
      const t = i / rate;
      const voice = Math.sin(t * pitch * Math.PI * 2)
        + 0.5 * Math.sin(t * pitch * 2 * Math.PI * 2)
        + 0.25 * Math.sin(t * pitch * 3.02 * Math.PI * 2);
      samples[i] = Math.max(-32000, Math.min(32000,
        voice * envelope * 8200 + (random() - 0.5) * 900));
    }

    const header = new ArrayBuffer(44);
    const view = new DataView(header);
    const ascii = (at, text) => {
      for (let i = 0; i < text.length; i += 1) view.setUint8(at + i, text.charCodeAt(i));
    };
    ascii(0, 'RIFF');
    view.setUint32(4, 36 + samples.byteLength, true);
    ascii(8, 'WAVEfmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);          // PCM
    view.setUint16(22, 1, true);          // mono
    view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true);   // bytes per second
    view.setUint16(32, 2, true);          // bytes per frame
    view.setUint16(34, 16, true);         // bits
    ascii(36, 'data');
    view.setUint32(40, samples.byteLength, true);
    return new File([header, samples], name, { type: 'audio/wav' });
  }

  /**
   * A PDF, written by hand, because there is no encoder in a browser for one.
   *
   * Real text in a real font, so the tools that read a PDF rather than just
   * counting its pages - the redactor picks words off the page - have something
   * to find. `photo` embeds a JPEG straight as a DCTDecode image, which is what
   * a scanned page is and what the compressor is for.
   */
  async function paper({ pages, heading, photo, name }) {
    const parts = [];
    const offsets = [];
    let at = 0;
    const push = (bytes) => {
      const data = typeof bytes === 'string'
        ? new TextEncoder().encode(bytes) : bytes;
      parts.push(data);
      at += data.length;
    };
    const object = (body) => {
      offsets.push(at);
      push(`${offsets.length} 0 obj\n`);
      push(body);
      push('\nendobj\n');
      return offsets.length;
    };

    const jpeg = photo
      ? new Uint8Array(await photo.arrayBuffer())
      : null;

    push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
    // 1 catalog, 2 pages, then per page a page object and its content stream,
    // then the font and any image. Numbered in that order because a PDF
    // reference is a number and these have to be predictable.
    const pageIds = [];
    for (let i = 0; i < pages; i += 1) pageIds.push(3 + i * 2);
    const fontId = 3 + pages * 2;
    const imageId = jpeg ? fontId + 1 : 0;

    object(`<< /Type /Catalog /Pages 2 0 R >>`);
    object(`<< /Type /Pages /Count ${pages} /Kids [${
      pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`);

    for (let i = 0; i < pages; i += 1) {
      const lines = [
        'BT /F1 22 Tf 62 742 Td (' + `${heading} - page ${i + 1}` + ') Tj ET',
      ];
      let y = 700;
      const words = ['The', 'invoice', 'number', 'is', 'INV-4471', 'and', 'the',
                     'account', 'it', 'was', 'paid', 'from', 'ends', '8842.',
                     'Payment', 'was', 'received', 'on', 'the', 'ninth.'];
      for (let line = 0; line < 14; line += 1) {
        const text = words.slice(line % 6, (line % 6) + 9).join(' ');
        lines.push(`BT /F1 12 Tf 62 ${y} Td (${text}) Tj ET`);
        y -= 20;
      }
      if (jpeg) lines.push('q 300 0 0 200 62 300 cm /Im1 Do Q');
      const stream = lines.join('\n');
      object(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources `
             + `<< /Font << /F1 ${fontId} 0 R >>`
             + (jpeg ? ` /XObject << /Im1 ${imageId} 0 R >>` : '')
             + ` >> /Contents ${pageIds[i] + 1} 0 R >>`);
      object(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    }

    object('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    if (jpeg) {
      offsets.push(at);
      push(`${offsets.length} 0 obj\n`);
      push(`<< /Type /XObject /Subtype /Image /Width 1200 /Height 800 `
           + `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode `
           + `/Length ${jpeg.length} >>\nstream\n`);
      push(jpeg);
      push('\nendstream\nendobj\n');
    }

    const startxref = at;
    let table = `xref\n0 ${offsets.length + 1}\n0000000000 65535 f \n`;
    for (const offset of offsets) {
      table += `${String(offset).padStart(10, '0')} 00000 n \n`;
    }
    table += `trailer\n<< /Size ${offsets.length + 1} /Root 1 0 R >>\n`
           + `startxref\n${startxref}\n%%EOF\n`;
    push(table);

    return new File(parts, name, { type: 'application/pdf' });
  }

  /**
   * A JPEG with EXIF in it, including where it was taken.
   *
   * A canvas encodes a clean JPEG and nothing else - no camera, no date, no
   * coordinates - which makes it useless for photographing a tool whose subject
   * is exactly those fields. So the APP1 segment is written here by hand and
   * spliced in after the SOI marker, which is where a camera puts it.
   *
   * Little-endian TIFF, one IFD of camera fields and a GPS IFD hanging off it.
   * The coordinates are the middle of the Atlantic on purpose: a screenshot of
   * a tool showing somebody a real address is a screenshot with somebody's
   * address in it, even when the somebody is invented.
   */
  async function withExif(file, { make, model, taken, lens }) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const encoder = new TextEncoder();
    const even = (data) => (data.length % 2 ? [data, new Uint8Array(1)] : [data]);

    // Anything longer than four bytes lives after all three directories and is
    // pointed at from its entry, so the tails are collected as the entries are
    // written and their offsets handed out from a running total. That is the
    // whole of TIFF's awkwardness and the reason this is not a struct.
    const tails = [];
    let tailAt = 0;
    const stash = (data) => {
      const at = tailAt;
      const padded = even(data);
      tails.push(...padded);
      tailAt += padded.reduce((sum, part) => sum + part.length, 0);
      return at;
    };

    const ifd = (entries) => {
      const block = new Uint8Array(2 + entries.length * 12 + 4);
      const view = new DataView(block.buffer);
      view.setUint16(0, entries.length, true);
      entries.forEach((entry, i) => {
        const base = 2 + i * 12;
        view.setUint16(base, entry.tag, true);
        view.setUint16(base + 2, entry.type, true);
        view.setUint32(base + 4, entry.count, true);
        if (entry.inline !== undefined) view.setUint32(base + 8, entry.inline, true);
        else view.setUint32(base + 8, entry.at, true);
      });
      return block;
    };

    const ascii = (tag, value) => {
      const data = encoder.encode(`${value}\0`);
      return data.length <= 4
        ? { tag, type: 2, count: data.length,
            inline: new DataView(new Uint8Array([...data, 0, 0, 0, 0]).buffer).getUint32(0, true) }
        : { tag, type: 2, count: data.length, data };
    };
    const short = (tag, value) => ({ tag, type: 3, count: 1, inline: value });
    const long = (tag, value) => ({ tag, type: 4, count: 1, inline: value });
    const ratios = (tag, numbers) => {
      const data = new Uint8Array(numbers.length * 4);
      const view = new DataView(data.buffer);
      numbers.forEach((number, i) => view.setUint32(i * 4, number, true));
      return { tag, type: 5, count: numbers.length / 2, data };
    };

    // Laid out header, then the three directories, then every tail: so an
    // offset is only knowable once the three directories have been sized, and
    // they can be sized without writing them because an entry is twelve bytes
    // whatever is in it.
    const zeroth = [ascii(0x010f, make), ascii(0x0110, model), ascii(0x0132, taken),
                    short(0x0112, 1), ascii(0x0131, 'abox.tools screenshots')];
    const exif = [ascii(0x9003, taken), ascii(0xa434, lens),
                  ratios(0x829a, [1, 250]), ratios(0x829d, [28, 10]), short(0x8827, 200)];
    // The middle of the Atlantic, deliberately: a screenshot of a tool showing
    // somebody a real address is a screenshot with an address in it, even when
    // the somebody is invented.
    const gps = [ascii(0x0001, 'N'), ratios(0x0002, [38, 1, 53, 1, 2300, 100]),
                 ascii(0x0003, 'W'), ratios(0x0004, [30, 1, 12, 1, 4100, 100])];

    const zerothSize = 2 + (zeroth.length + 2) * 12 + 4;
    const exifSize = 2 + exif.length * 12 + 4;
    const gpsSize = 2 + gps.length * 12 + 4;
    const exifAt = 8 + zerothSize;
    const gpsAt = exifAt + exifSize;
    tailAt = gpsAt + gpsSize;

    const place = (entries) => entries.map((entry) => (
      entry.data ? { ...entry, at: stash(entry.data) } : entry));

    const zerothPlaced = place(zeroth);
    // The two pointers go last, and after `place` so the tails they follow are
    // already counted.
    const zerothBlock = ifd([...zerothPlaced, long(0x8769, exifAt), long(0x8825, gpsAt)]);
    const exifBlock = ifd(place(exif));
    const gpsBlock = ifd(place(gps));

    const header = new Uint8Array(8);
    const headerView = new DataView(header.buffer);
    headerView.setUint16(0, 0x4949, true);   // little-endian, and say so twice
    headerView.setUint16(2, 42, true);
    headerView.setUint32(4, 8, true);

    const payload = [encoder.encode('Exif\0\0'), header,
                     zerothBlock, exifBlock, gpsBlock, ...tails];
    const length = payload.reduce((sum, part) => sum + part.length, 0) + 2 - 6 + 6;
    const marker = new Uint8Array([0xff, 0xe1, (length >> 8) & 0xff, length & 0xff]);

    // After the SOI marker, which is where a camera puts it.
    return new File([bytes.slice(0, 2), marker, ...payload, bytes.slice(2)],
                    file.name, { type: 'image/jpeg' });
  }


  /**
   * A DICOM file, written here because there is nowhere to get one from.
   *
   * Every real .dcm is a picture of a real person, and a repository of a static
   * site is not the place for one even with the names taken out. This writes
   * the smallest file the viewer will open: the 128 byte preamble, the meta
   * group that says how the rest is encoded, and a dataset with a small
   * greyscale image in it, laid out as explicit VR little-endian.
   */
  function scan({ rows, columns, patient, modality, name }) {
    const parts = [];
    const ascii = (text) => new TextEncoder().encode(text);
    const even = (text) => (text.length % 2 ? `${text} ` : text);

    const element = (group, tag, vr, value) => {
      const head = new Uint8Array(vr === 'OW' || vr === 'OB' ? 12 : 8);
      const view = new DataView(head.buffer);
      view.setUint16(0, group, true);
      view.setUint16(2, tag, true);
      head.set(ascii(vr), 4);
      if (vr === 'OW' || vr === 'OB') {
        view.setUint32(8, value.byteLength, true);
      } else {
        view.setUint16(6, value.byteLength ?? value.length, true);
      }
      return [head, value];
    };
    const str = (group, tag, vr, text) => element(group, tag, vr, ascii(even(text)));
    const us = (group, tag, number) => {
      const value = new Uint8Array(2);
      new DataView(value.buffer).setUint16(0, number, true);
      return element(group, tag, 'US', value);
    };

    // The image: a bright disc on a dark ground with a gradient across it, so
    // the window and level controls visibly do something.
    const pixels = new Uint16Array(rows * columns);
    for (let y = 0; y < rows; y += 1) {
      for (let x = 0; x < columns; x += 1) {
        const dx = (x - columns / 2) / (columns / 2);
        const dy = (y - rows / 2) / (rows / 2);
        const away = Math.sqrt(dx * dx + dy * dy);
        const inside = away < 0.72 ? 1 - away * 0.6 : 0.06;
        pixels[y * columns + x] = Math.round(
          Math.min(1, inside + Math.sin(x / 9) * 0.03 + Math.cos(y / 11) * 0.03) * 3200);
      }
    }

    const dataset = [
      str(0x0008, 0x0016, 'UI', '1.2.840.10008.5.1.4.1.1.7'),
      str(0x0008, 0x0018, 'UI', '1.2.826.0.1.3680043.8.498.1'),
      str(0x0008, 0x0060, 'CS', modality),
      str(0x0008, 0x1030, 'LO', 'Screenshot study'),
      str(0x0010, 0x0010, 'PN', patient),
      str(0x0010, 0x0020, 'LO', 'ABOX-0001'),
      str(0x0010, 0x0030, 'DA', '19850514'),
      str(0x0020, 0x000d, 'UI', '1.2.826.0.1.3680043.8.498.2'),
      str(0x0020, 0x000e, 'UI', '1.2.826.0.1.3680043.8.498.3'),
      str(0x0020, 0x0013, 'IS', '1'),
      us(0x0028, 0x0002, 1),          // samples per pixel
      str(0x0028, 0x0004, 'CS', 'MONOCHROME2'),
      us(0x0028, 0x0010, rows),
      us(0x0028, 0x0011, columns),
      str(0x0028, 0x0030, 'DS', '0.5\\0.5'),
      us(0x0028, 0x0100, 16),         // bits allocated
      us(0x0028, 0x0101, 12),         // bits stored
      us(0x0028, 0x0102, 11),         // high bit
      us(0x0028, 0x0103, 0),          // unsigned
      str(0x0028, 0x1050, 'DS', '1600'),
      str(0x0028, 0x1051, 'DS', '3000'),
      element(0x7fe0, 0x0010, 'OW', new Uint8Array(pixels.buffer)),
    ].flat();

    const syntax = '1.2.840.10008.1.2.1\0';
    const meta = [
      str(0x0002, 0x0002, 'UI', '1.2.840.10008.5.1.4.1.1.7'),
      str(0x0002, 0x0003, 'UI', '1.2.826.0.1.3680043.8.498.1'),
      element(0x0002, 0x0010, 'UI', ascii(syntax)),
      str(0x0002, 0x0012, 'UI', '1.2.826.0.1.3680043.8.498.9'),
    ].flat();
    const metaLength = meta.reduce((sum, part) => sum + part.length, 0);
    const lengthValue = new Uint8Array(4);
    new DataView(lengthValue.buffer).setUint32(0, metaLength, true);

    parts.push(new Uint8Array(128), ascii('DICM'),
               ...element(0x0002, 0x0000, 'UL', lengthValue),
               ...meta, ...dataset);
    return new File(parts, name, { type: 'application/dicom' });
  }

  const shot = {
    sleep,

    /** A photograph-shaped JPEG, drawn on the spot. */
    async photo(width = 2400, height = 1600, { name = 'photo.jpg', quality = 0.86,
                                               seed = 7 } = {}) {
      const element = canvas(width, height);
      drawPhoto(element.getContext('2d'), width, height, seed);
      return toFile(element, name, 'image/jpeg', quality);
    },

    /** The same subject as a PNG, for the tools that care about the format. */
    async png(width = 1600, height = 1200, { name = 'photo.png', seed = 7 } = {}) {
      const element = canvas(width, height);
      drawPhoto(element.getContext('2d'), width, height, seed);
      return toFile(element, name, 'image/png');
    },

    /** A scanned-looking page. */
    async page(width = 1240, height = 1754, options = {}) {
      const element = canvas(width, height);
      drawPage(element.getContext('2d'), width, height, options);
      return toFile(element, options.name ?? 'page.png', 'image/png');
    },

    /** A clip: an MP4 with a clock burned into the corner. */
    async video({ width = 854, height = 480, seconds = 12, fps = 15,
                  name = 'clip.mp4' } = {}) {
      const blob = await film({
        width, height, seconds, fps,
        // Two seconds apart, which is what a phone writes and what makes a
        // guide about cutting on a keyframe worth reading.
        keyEvery: fps * 2,
        draw: (context, at) => drawScene(context, width, height, at, seconds),
      });
      return new File([blob], name, { type: 'video/mp4' });
    },

    /** A voice memo: bursts of speech-shaped tone with real gaps between them. */
    audio({ seconds = 26, rate = 22050, name = 'memo.wav' } = {}) {
      return wave({ seconds, rate, name });
    },

    /**
     * A photograph OF a page: the sheet at an angle on a desk, with a shadow.
     *
     * Which is the file the scanner tools are for, and not something `page()`
     * can stand in for - a flat, square, full-frame scan is exactly the input
     * that makes corner detection look like it is doing nothing.
     */
    async snap({ width = 1600, height = 1200, angle = -7,
                 heading = 'Delivery note', name = 'IMG_0413.jpg' } = {}) {
      const sheet = canvas(900, 1270);
      drawPage(sheet.getContext('2d'), 900, 1270, { heading });

      const element = canvas(width, height);
      const context = element.getContext('2d');
      const desk = context.createLinearGradient(0, 0, width, height);
      desk.addColorStop(0, '#6b6157');
      desk.addColorStop(1, '#4a423a');
      context.fillStyle = desk;
      context.fillRect(0, 0, width, height);

      context.save();
      context.translate(width / 2, height / 2);
      context.rotate((angle * Math.PI) / 180);
      const tall = height * 0.86;
      const wide = tall * (900 / 1270);
      context.shadowColor = 'rgba(0,0,0,0.45)';
      context.shadowBlur = height * 0.03;
      context.shadowOffsetY = height * 0.012;
      context.drawImage(sheet, -wide / 2, -tall / 2, wide, tall);
      context.restore();

      // A phone photographs a page unevenly lit, and the cleaning step is
      // mostly about that, so the light has to be uneven here too.
      const light = context.createRadialGradient(
        width * 0.32, height * 0.28, height * 0.05,
        width * 0.5, height * 0.5, height * 0.95);
      light.addColorStop(0, 'rgba(255,255,255,0.16)');
      light.addColorStop(1, 'rgba(0,0,0,0.22)');
      context.fillStyle = light;
      context.fillRect(0, 0, width, height);

      return toFile(element, name, 'image/jpeg', 0.9);
    },

    /** A document. `photo: true` puts a JPEG on every page. */
    async pdf({ pages = 3, heading = 'Quarterly report', photo = false,
                name = 'report.pdf' } = {}) {
      const picture = photo
        ? await shot.photo(1200, 800, { quality: 0.92 })
        : null;
      return paper({ pages, heading, photo: picture, name });
    },

    /**
     * An animated GIF, encoded by gif-maker's own encoder.
     *
     * Borrowed off the site the same way the MP4 writer is, and for the same
     * reason: the alternative is a second GIF encoder living in a dev script,
     * where nobody would ever look at it again.
     */
    async gif({ frames = 8, width = 480, height = 320, delay = 0.12,
                colors = 128, name = 'animation.gif' } = {}) {
      const { loadImages } = await import('/gif-maker/src/images.js');
      const { encodeGif } = await import('/gif-maker/src/encode.js');
      const seconds = frames * delay;
      const files = [];
      for (let i = 0; i < frames; i += 1) {
        const element = canvas(width, height);
        drawScene(element.getContext('2d'), width, height, i * delay, seconds);
        files.push(await toFile(element, `frame-${i + 1}.png`, 'image/png'));
      }
      const { items } = await loadImages(files, delay);
      const { blob } = await encodeGif({
        items,
        settings: {
          width, height, fit: 'fit', background: '#ffffff', colors,
          dither: false, sharedPalette: true, transparent: false,
          loop: 0, loopMode: 'forever',
        },
      });
      return new File([blob], name, { type: 'image/gif' });
    },

    /** A photograph that has been through a camera, so far as its EXIF says. */
    async exifPhoto({ name = 'IMG_2841.jpg' } = {}) {
      const base = await shot.photo(2400, 1600, { name });
      return withExif(base, {
        make: 'Canon',
        model: 'Canon EOS 200D',
        taken: '2026:03:14 16:22:05',
        lens: 'EF-S 18-55mm f/3.5-5.6 IS STM',
      });
    },

    /** A DICOM file with a small greyscale image in it. */
    dicom({ rows = 256, columns = 256, patient = 'ANON^TEST',
            modality = 'CT', name = 'scan.dcm' } = {}) {
      return scan({ rows, columns, patient, modality, name });
    },

    /** Anything that is really just text: SVG, JSON, a log. */
    file(text, name, type) {
      return new File([text], name, { type });
    },

    /**
     * Take whatever a tool has drawn - a canvas, an <img>, an inline <svg> -
     * and turn it back into a file.
     *
     * For the guides that are about two tools in a row: the picture one of them
     * made is the file the next one is handed, which is the whole workflow and
     * is worth photographing rather than describing.
     */
    async grab(selector, { name = 'from-the-tool.png', width, height } = {}) {
      const source = await shot.wait(selector, { visible: false });
      let drawable = source;
      if (source.tagName === 'svg') {
        const markup = new XMLSerializer().serializeToString(source);
        const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }));
        drawable = new Image();
        await new Promise((done, fail) => {
          drawable.onload = done;
          drawable.onerror = fail;
          drawable.src = url;
        });
      } else if (source.tagName === 'IMG' && !source.complete) {
        await new Promise((done) => { source.onload = done; });
      }
      const wide = width ?? drawable.naturalWidth ?? drawable.width;
      const tall = height ?? drawable.naturalHeight ?? drawable.height;
      const element = canvas(wide, tall);
      const context = element.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, wide, tall);
      context.drawImage(drawable, 0, 0, wide, tall);
      return toFile(element, name, 'image/png');
    },

    /**
     * Keep a file for the next shot of the same recipe.
     *
     * Each shot is its own page load, so nothing survives between them except
     * what the origin keeps - and sessionStorage is per tab, which is exactly
     * the life of one capture run.
     */
    async keep(key, file) {
      const reader = new FileReader();
      const text = await new Promise((done) => {
        reader.onload = () => done(reader.result);
        reader.readAsDataURL(file);
      });
      sessionStorage.setItem(`shot:${key}`, `${file.name}\n${text}`);
    },

    /** The file the shot before this one kept. */
    async kept(key) {
      const held = sessionStorage.getItem(`shot:${key}`);
      if (!held) throw new Error(`nothing kept under ${key}`);
      const [name, url] = held.split('\n');
      // Decoded by hand rather than fetched. A data: URL is not in connect-src
      // - the site's policy is deliberately narrow about what a page may reach
      // for - so fetch() on one is refused, and quite right too.
      const [prefix, base64] = url.split(',');
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      return new File([bytes], name, { type: prefix.slice(5).replace(';base64', '') });
    },

    /** Hand files to the tool exactly as the file picker would. */
    give(...files) {
      const input = document.querySelector('#file-input');
      if (!input) throw new Error('this page has no #file-input');
      const carrier = new DataTransfer();
      for (const file of files.flat()) carrier.items.add(file);
      input.files = carrier.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    },

    /**
     * Wait until a selector matches something visible, or give up loudly.
     *
     * `visible: false` waits only for the element to exist, which is what the
     * media helpers want: a tool that swaps its <video> for a canvas once it has
     * a frame leaves the video in the page and out of the layout, and it can
     * still be seeked.
     */
    async wait(selector, { timeout = 20000, visible = true } = {}) {
      const until = Date.now() + timeout;
      for (;;) {
        const found = document.querySelector(selector);
        if (found && (!visible || found.offsetParent !== null)) return found;
        if (Date.now() > until) throw new Error(`waited for ${selector}`);
        await sleep(80);
      }
    },

    /** Wait until a selector matches nothing, or nothing visible. */
    async gone(selector, { timeout = 60000 } = {}) {
      const until = Date.now() + timeout;
      for (;;) {
        const found = document.querySelector(selector);
        if (!found || found.offsetParent === null) return;
        if (Date.now() > until) throw new Error(`${selector} never went away`);
        await sleep(80);
      }
    },

    /** Wait until a test of the page comes back true. */
    async until(check, { timeout = 30000, label = 'a condition' } = {}) {
      const end = Date.now() + timeout;
      for (;;) {
        const answer = await check();
        if (answer) return answer;
        if (Date.now() > end) throw new Error(`waited for ${label}`);
        await sleep(100);
      }
    },

    /**
     * Move a <video> or <audio> to a moment and wait for the frame.
     *
     * A media element that has never been asked for a time paints black, so
     * every screenshot of a video tool needs this: a still of the black frame
     * is a picture of a tool that appears not to have loaded the file.
     */
    async seek(selector, time) {
      const media = await shot.wait(selector, { visible: false });
      await shot.until(() => media.readyState >= 1, { label: 'the metadata' });
      if (Math.abs(media.currentTime - time) < 0.001) return media;
      await new Promise((done) => {
        const painted = () => {
          media.removeEventListener('seeked', painted);
          done();
        };
        media.addEventListener('seeked', painted);
        media.currentTime = time;
        setTimeout(done, 5000);
      });
      await shot.settle(150);
      return media;
    },

    click(selector) {
      const found = document.querySelector(selector);
      if (!found) throw new Error(`nothing to click at ${selector}`);
      found.click();
    },

    /** Set a form control and tell the page about it, the way a person would. */
    set(selector, value) {
      const field = document.querySelector(selector);
      if (!field) throw new Error(`no field at ${selector}`);
      if (field.type === 'checkbox' || field.type === 'radio') field.checked = !!value;
      else field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));
    },

    /** Let layout and any pending paint catch up. */
    async settle(ms = 400) {
      await new Promise((done) => requestAnimationFrame(() => done()));
      await sleep(ms);
      await new Promise((done) => requestAnimationFrame(() => done()));
    },

    /**
     * The rectangle to photograph, in page coordinates.
     *
     * A selector, or several - the picture is whatever encloses all of them, so
     * a shot can take a control and the result it produced without taking the
     * empty half of the page between them.
     */
    box(clip) {
      const { selectors, pad = 12 } = typeof clip === 'string'
        ? { selectors: [clip] }
        : Array.isArray(clip) ? { selectors: clip } : clip;
      const list = (Array.isArray(selectors) ? selectors : [selectors]);
      let left = Infinity; let top = Infinity;
      let right = -Infinity; let bottom = -Infinity;
      for (const selector of list) {
        const found = document.querySelector(selector);
        if (!found) throw new Error(`nothing to photograph at ${selector}`);
        const rect = found.getBoundingClientRect();
        left = Math.min(left, rect.left + scrollX);
        top = Math.min(top, rect.top + scrollY);
        right = Math.max(right, rect.right + scrollX);
        bottom = Math.max(bottom, rect.bottom + scrollY);
      }
      return {
        x: Math.max(0, Math.round(left - pad)),
        y: Math.max(0, Math.round(top - pad)),
        width: Math.round(right - left + pad * 2),
        height: Math.round(bottom - top + pad * 2),
      };
    },
  };

  window.__shot = shot;
})();
