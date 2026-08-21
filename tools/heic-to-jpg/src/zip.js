/**
 * A ZIP writer, stored (uncompressed) only.
 *
 * Compressing twenty photos and handing back twenty downloads means twenty save
 * prompts, which is the sort of thing that makes people give up and use the
 * upload site instead. One archive is one prompt.
 *
 * Nothing here compresses. Deflating a folder of JPEGs saves almost nothing -
 * they are already compressed - and writing a deflate implementation to achieve
 * that would be more code than the rest of this tool put together. Method 0 is
 * a header in front of the bytes, which is all this needs to be.
 *
 * @see https://pkware.cachefly.net/webdocs/casestudies/APPNOTE.TXT
 */

import { crc32 } from './crc32.js';

const LOCAL_SIG = 0x04034b50;
const CENTRAL_SIG = 0x02014b50;
const END_SIG = 0x06054b50;

/** Bit 11 tells the reader the file name is UTF-8 rather than code page 437. */
const FLAG_UTF8 = 0x0800;

const utf8 = new TextEncoder();

/** MS-DOS packed date and time, which is what a ZIP entry records. */
function dosStamp(date) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

/**
 * @param {{name: string, data: Uint8Array}[]} files
 * @returns {Blob}
 */
export function makeZip(files) {
  const stamp = dosStamp(new Date());
  const parts = [];
  const central = [];
  let offset = 0;

  for (const file of files) {
    const name = utf8.encode(file.name);
    const sum = crc32([file.data]);

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, LOCAL_SIG, true);
    lv.setUint16(4, 20, true); // version needed
    lv.setUint16(6, FLAG_UTF8, true);
    lv.setUint16(8, 0, true); // method 0: stored
    lv.setUint16(10, stamp.time, true);
    lv.setUint16(12, stamp.day, true);
    lv.setUint32(14, sum, true);
    lv.setUint32(18, file.data.length, true);
    lv.setUint32(22, file.data.length, true);
    lv.setUint16(26, name.length, true);
    local.set(name, 30);

    parts.push(local, file.data);

    const entry = new Uint8Array(46 + name.length);
    const cv = new DataView(entry.buffer);
    cv.setUint32(0, CENTRAL_SIG, true);
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, FLAG_UTF8, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, stamp.time, true);
    cv.setUint16(14, stamp.day, true);
    cv.setUint32(16, sum, true);
    cv.setUint32(20, file.data.length, true);
    cv.setUint32(24, file.data.length, true);
    cv.setUint16(28, name.length, true);
    cv.setUint32(42, offset, true); // where the local header for this entry is
    entry.set(name, 46);
    central.push(entry);

    offset += local.length + file.data.length;
  }

  const centralSize = central.reduce((n, e) => n + e.length, 0);

  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, END_SIG, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
