/**
 * tools/image-to-ico/src/ico.js - the ICO writer.
 *
 * This is a format nobody validates for you. Windows does not report a broken
 * icon, it draws nothing, or it draws the bottom half of one, or it draws a
 * black box where the transparency was - and all three of those look like a
 * problem with the picture rather than with the file around it. So the tests
 * here are byte-level and mostly about the four things that fail silently:
 *
 *   - the offset in each directory entry pointing at that entry's data
 *   - 256 written as zero, because the field is one byte wide
 *   - the doubled height in the DIB header, which is the mask's half
 *   - the rows going in bottom-up, and BGRA rather than RGBA
 *
 * The round trip at the end reads the pixels back out of the DIB by hand and
 * compares them with what went in, which is the only check that covers all of
 * the above at once.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { writeIco, dibEntry, readIcoDirectory } from '../../tools/image-to-ico/src/ico.js';
import { storageFor, dibBytes, PRESETS, SIZES } from '../../tools/image-to-ico/src/sizes.js';
import { iconName, stemOf, folderFor } from '../../tools/image-to-ico/src/files.js';
import { manifest, PACK_IMAGES, headSnippet, readme } from '../../tools/image-to-ico/src/pack.js';

const ICONDIR = 6;
const ICONDIRENTRY = 16;
const DIB_HEADER = 40;

const view = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

/** A run of bytes standing in for an encoded image. */
const filler = (length, value) => new Uint8Array(length).fill(value);

/** The eight-byte PNG signature, which is how a reader tells the kinds apart. */
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const fakePng = (length = 40) => {
  const out = filler(length, 0x11);
  out.set(PNG_SIGNATURE, 0);
  return out;
};

/** RGBA pixels, row-major, with a distinct value per channel per pixel. */
function pixelGrid(width, height, at) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const to = (y * width + x) * 4;
      const [r, g, b, a] = at(x, y);
      data[to] = r;
      data[to + 1] = g;
      data[to + 2] = b;
      data[to + 3] = a;
    }
  }
  return { width, height, data };
}

/* ------------------------------------------------------------- the header */

/**
 * A stand-in for `phrase`, so a test can say which sentence was chosen.
 *
 * The real one reads the markup. This one writes the key and its blanks, which
 * is what these tests are about: which sentence was picked and what went into
 * it. What it reads like in English is body.html's business.
 *
 * The three join phrases are the exception, and are resolved for real. A list
 * is built by joining twice, so leaving them as keys would turn "16, 32, 48"
 * into a nest no assertion could be written against.
 */
const JOINS = {
  'join.list': '{a}, {b}',
  'join.and': '{a} and {b}',
  'join.andalso': '{a}, and {b}',
};

const say = (key, values = {}) => {
  if (key in JOINS) {
    return JOINS[key].replace(/\{(\w+)\}/g, (whole, name) => values[name] ?? whole);
  }
  const filled = Object.entries(values).map(([k, v]) => `${k}=${v}`).join(' ');
  return filled ? `${key} ${filled}` : key;
};

test('the header says what an icon file says', () => {
  const ico = writeIco([{ width: 16, height: 16, kind: 'png', data: fakePng() }]);
  const v = view(ico);

  assert.equal(v.getUint16(0, true), 0, 'reserved');
  assert.equal(v.getUint16(2, true), 1, 'type 1 is an icon; 2 would be a cursor');
  assert.equal(v.getUint16(4, true), 1, 'one image');
});

test('every entry points at its own data, in order', () => {
  const entries = [
    { width: 16, height: 16, kind: 'bmp', data: filler(11, 0xa1) },
    { width: 32, height: 32, kind: 'png', data: fakePng(37) },
    { width: 48, height: 48, kind: 'bmp', data: filler(5, 0xc3) },
  ];

  const ico = writeIco(entries);
  const v = view(ico);

  assert.equal(v.getUint16(4, true), 3);
  assert.equal(
    ico.length,
    ICONDIR + 3 * ICONDIRENTRY + 11 + 37 + 5,
    'the file is the directory plus the images and nothing else');

  let expected = ICONDIR + 3 * ICONDIRENTRY;
  for (const [index, entry] of entries.entries()) {
    const dir = ICONDIR + index * ICONDIRENTRY;
    const size = v.getUint32(dir + 8, true);
    const offset = v.getUint32(dir + 12, true);

    assert.equal(size, entry.data.length, `entry ${index} reports its own length`);
    assert.equal(offset, expected, `entry ${index} points where its data actually is`);
    assert.deepEqual(
      ico.slice(offset, offset + size), entry.data,
      `entry ${index} was copied through byte for byte`);

    expected += entry.data.length;
  }
});

test('256 is written as zero, because the field is one byte wide', () => {
  const ico = writeIco([
    { width: 16, height: 16, kind: 'bmp', data: filler(4, 1) },
    { width: 256, height: 256, kind: 'png', data: fakePng() },
  ]);

  assert.equal(ico[ICONDIR], 16, 'a size that fits is written as itself');
  assert.equal(ico[ICONDIR + ICONDIRENTRY], 0, '256 is written as 0');
  assert.equal(ico[ICONDIR + ICONDIRENTRY + 1], 0);

  // And it has to come back as 256 rather than as nothing.
  assert.deepEqual(
    readIcoDirectory(ico).map((entry) => entry.width),
    [16, 256]);
});

test('an icon with nothing in it, and a size the format cannot hold, are refused', () => {
  assert.throws(() => writeIco([]), /^Error: ico\.empty$/);
  assert.throws(
    () => writeIco([{ width: 512, height: 512, kind: 'png', data: fakePng() }]),
    (error) => error.message === 'ico.toobig' && error.values.size === '512x512');
  assert.throws(
    () => writeIco([{ width: 0, height: 16, kind: 'png', data: fakePng() }]),
    /^Error: ico\.zero$/);
});

/* ---------------------------------------------------------------- the DIB */

test('the DIB header describes two bitmaps stacked, not one', () => {
  const dib = dibEntry(pixelGrid(4, 4, () => [0, 0, 0, 255]));
  const v = view(dib);

  assert.equal(v.getUint32(0, true), DIB_HEADER, 'header size');
  assert.equal(v.getInt32(4, true), 4, 'width');
  assert.equal(v.getInt32(8, true), 8, 'height is doubled: the image, then the mask');
  assert.equal(v.getUint16(12, true), 1, 'planes');
  assert.equal(v.getUint16(14, true), 32, 'bits per pixel');
  assert.equal(v.getUint32(16, true), 0, 'BI_RGB: an icon DIB is never compressed');
  assert.equal(v.getUint32(20, true), dib.length - DIB_HEADER, 'the pixels plus the mask');
});

test('the size of a DIB entry is arithmetic, and sizes.js agrees with the writer', () => {
  for (const px of [16, 20, 24, 32, 40, 48, 64, 96, 128, 256]) {
    const dib = dibEntry(pixelGrid(px, px, () => [1, 2, 3, 255]));
    assert.equal(dib.length, dibBytes(px), `${px}px`);
  }
});

test('a pixel buffer that does not match the size it claims is refused', () => {
  assert.throws(
    () => dibEntry({ width: 4, height: 4, data: new Uint8Array(4 * 3 * 4) }),
    /^Error: ico\.pixels$/);
});

test('the rows go in bottom-up, and the channels go in as BGRA', () => {
  // A 2x1 image: red on the left, half-transparent green on the right.
  const dib = dibEntry(pixelGrid(2, 1, (x) => (x === 0
    ? [255, 0, 0, 255]
    : [0, 255, 0, 128])));

  assert.deepEqual(
    Array.from(dib.slice(DIB_HEADER, DIB_HEADER + 8)),
    [0, 0, 255, 255, 0, 255, 0, 128],
    'blue, green, red, alpha - in that order, both pixels');
});

test('a picture is stored upside down, which is what the format asks for', () => {
  // Two rows, told apart by their red channel.
  const dib = dibEntry(pixelGrid(1, 2, (x, y) => [y === 0 ? 10 : 200, 0, 0, 255]));

  // The first row of the DIB is the last row of the picture.
  assert.equal(dib[DIB_HEADER + 2], 200, 'the bottom row of the picture comes first');
  assert.equal(dib[DIB_HEADER + 6], 10, 'and the top row comes last');
});

test('the mask marks the transparent pixels, and is padded to four bytes a row', () => {
  // 8 pixels across: the first two transparent, the rest opaque.
  const dib = dibEntry(pixelGrid(8, 1, (x) => [0, 0, 0, x < 2 ? 0 : 255]));

  const maskAt = DIB_HEADER + 8 * 4;
  assert.equal(dib.length - maskAt, 4, 'one row of mask, padded from one byte to four');
  assert.equal(dib[maskAt], 0b11000000, 'a set bit means see-through');
  assert.deepEqual(Array.from(dib.slice(maskAt + 1)), [0, 0, 0], 'the padding is zeroed');
});

test('a fully opaque picture still carries a mask, all of it clear', () => {
  const dib = dibEntry(pixelGrid(8, 2, () => [9, 9, 9, 255]));
  const maskAt = DIB_HEADER + 8 * 2 * 4;
  assert.equal(dib.length - maskAt, 8, 'two rows of four bytes');
  assert.ok(dib.slice(maskAt).every((byte) => byte === 0));
});

test('a DIB round trips: the pixels read back out are the pixels that went in', () => {
  const source = pixelGrid(5, 3, (x, y) => [x * 40, y * 60, (x + y) * 20, x === y ? 0 : 255]);
  const dib = dibEntry(source);

  const stride = 5 * 4;
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 5; x += 1) {
      const from = (y * 5 + x) * 4;
      const to = DIB_HEADER + (3 - 1 - y) * stride + x * 4;
      assert.deepEqual(
        [dib[to + 2], dib[to + 1], dib[to], dib[to + 3]],
        [source.data[from], source.data[from + 1], source.data[from + 2], source.data[from + 3]],
        `pixel ${x},${y}`);
    }
  }
});

/* ----------------------------------------------------- reading it back out */

test('the directory reader tells the two kinds of entry apart', () => {
  const ico = writeIco([
    { width: 16, height: 16, kind: 'bmp', data: dibEntry(pixelGrid(16, 16, () => [0, 0, 0, 255])) },
    { width: 256, height: 256, kind: 'png', data: fakePng(64) },
  ]);

  assert.deepEqual(readIcoDirectory(ico), [
    { width: 16, height: 16, kind: 'bmp', bytes: dibBytes(16) },
    { width: 256, height: 256, kind: 'png', bytes: 64 },
  ]);
});

test('the reader refuses a file that is not one, rather than inventing entries', () => {
  assert.throws(() => readIcoDirectory(new Uint8Array(3)), /^Error: ico\.short$/);

  const cursor = writeIco([{ width: 16, height: 16, kind: 'png', data: fakePng() }]);
  cursor[2] = 2;  // type 2 is a cursor, which this tool does not write
  assert.throws(() => readIcoDirectory(cursor), /^Error: ico\.type$/);

  const truncated = writeIco([{ width: 16, height: 16, kind: 'png', data: fakePng() }]);
  assert.throws(() => readIcoDirectory(truncated.slice(0, 20)),
    /^Error: ico\.(directory|entry)$/);
});

/* ------------------------------------------------------ the standards table */

test('automatic storage puts the small sizes where anything can read them', () => {
  assert.equal(storageFor(16, 'auto'), 'bmp');
  assert.equal(storageFor(64, 'auto'), 'bmp');
  assert.equal(storageFor(96, 'auto'), 'png');
  assert.equal(storageFor(256, 'auto'), 'png');

  // Asked for outright, a choice is a choice at every size.
  assert.equal(storageFor(256, 'bmp'), 'bmp');
  assert.equal(storageFor(16, 'png'), 'png');
});

test('every preset asks only for sizes the tool offers, and that the format holds', () => {
  const offered = new Set(SIZES.map(({ px }) => px));
  for (const preset of PRESETS) {
    assert.ok(preset.sizes.length, `${preset.id} has sizes`);
    for (const px of preset.sizes) {
      assert.ok(offered.has(px), `${preset.id} asks for ${px}, which is not on the size list`);
      assert.ok(px >= 1 && px <= 256, `${preset.id} asks for ${px}, which no .ico can hold`);
    }
  }
});

test('every size on the list says what asks for it', () => {
  // The reason is a phrase key now, so what this can still check is that
  // every size declares one and that no two sizes share it. Whether the
  // phrase behind it exists is test_phrases.py's job, in every language.
  const seen = new Set();
  for (const { px, why } of SIZES) {
    assert.equal(why, `why.${px}`, `${px} has no reason beside it`);
    assert.ok(!seen.has(why), `${px} shares its reason with another size`);
    seen.add(why);
  }
});

/* ------------------------------------------------------------------ naming */

test('a website icon is called favicon.ico and nothing else', () => {
  assert.equal(iconName('my-logo.png', 'ico', true), 'favicon.ico');
  assert.equal(iconName('my-logo.png', 'ico', false), 'my-logo.ico');
  assert.equal(iconName('logo.with.dots.svg', 'ico', false), 'logo.with.dots.ico');
  // There is no reserved name for an .icns: a bundle names its own in
  // Info.plist, so the picture's name is the useful one every time.
  assert.equal(iconName('my-logo.png', 'icns', true), 'my-logo.icns');
  assert.equal(iconName('my-logo.png', 'icns', false), 'my-logo.icns');
  assert.equal(stemOf('.png'), 'icon', 'a name that is only an extension still gets one');
  assert.equal(folderFor('a/b:c.png'), 'a-b-c', 'a folder name cannot carry path separators');
});

/* -------------------------------------------------------------- the pack */

test('the README lists the .ico only when one was made', () => {
  const withIco = readme('favicon.ico', [16, 32, 48], true, say);
  assert.ok(withIco.includes('favicon.ico  -  readme.ico sizes=16, 32, 48'));
  assert.ok(!withIco.includes('readme.noico'));

  const without = readme('favicon.ico', [], false, say);
  assert.ok(!without.includes('readme.ico'), 'it must not name a file that is not there');
  assert.ok(without.includes('readme.noico'));

  // Every file in the pack is listed, and each says what it is for.
  for (const image of PACK_IMAGES) {
    assert.ok(withIco.includes(`${image.name}  -  ${image.why}`), image.name);
  }
});

test('the README wraps at the spaces, however long the translation is', () => {
  // The paragraphs used to be typed with their line breaks in them, which
  // only works while the words are English and never change.
  const long = (key) => (key.startsWith('readme.') && key !== 'readme.title'
    ? `${key} `.repeat(30).trim()
    : say(key));
  for (const line of readme('favicon.ico', [16], true, long).split('\n')) {
    assert.ok(line.length <= 78 || !line.includes(' '), line);
  }
});

test('the README underline is as long as the title it underlines', () => {
  const ruleFor = (title) => readme('favicon.ico', [16], true,
    (key) => (key === 'readme.title' ? title : say(key))).split('\n')[1];

  assert.equal(ruleFor('Ein Satz Website-Symbole'), '='.repeat(24));

  // A CJK character is two columns wide in the fixed-width font a .txt is read
  // in, so counting characters would put thirteen equals signs under a title
  // that is twenty-six columns wide.
  assert.equal(ruleFor('ウェブサイトのアイコン一式'), '='.repeat(26));
  assert.equal(ruleFor('웹사이트 아이콘'), '='.repeat(15));
});

test('the manifest is JSON, and points at files the pack actually contains', () => {
  const parsed = JSON.parse(manifest({ name: 'Example', background: '#fff', theme: '#000' }));
  const names = new Set(PACK_IMAGES.map((image) => image.name));

  assert.equal(parsed.name, 'Example');
  assert.ok(parsed.icons.length);
  for (const icon of parsed.icons) {
    assert.ok(names.has(icon.src.replace(/^\//, '')), `${icon.src} is not in the pack`);
    assert.equal(icon.sizes, `${icon.src.match(/(\d+)x\d+/)[1]}x${icon.src.match(/\d+x(\d+)/)[1]}`);
  }

  const maskable = parsed.icons.find((icon) => icon.purpose === 'maskable');
  assert.ok(maskable, 'an adaptive launcher needs one that is safe to crop');
  const drawn = PACK_IMAGES.find((image) => image.name === maskable.src.replace(/^\//, ''));
  assert.ok(drawn.inset > 0, 'and the maskable one has to be drawn inside the safe area');
});

test('the pack sizes match the names they are given', () => {
  for (const image of PACK_IMAGES) {
    const named = image.name.match(/(\d+)x\d+/);
    if (named) assert.equal(Number(named[1]), image.px, image.name);
  }
});

test('the head snippet does not link favicon.ico, which browsers ask for anyway', () => {
  const html = headSnippet(say);
  assert.ok(html.includes('apple-touch-icon.png'));
  assert.ok(html.includes('site.webmanifest'));
  assert.ok(!/<link[^>]*favicon\.ico/.test(html),
    'linking it as well is how a site serves the same file twice');
});
