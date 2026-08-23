/**
 * tools/hash-checksum/src - the five hash functions, and what the page does
 * with them.
 *
 * Three kinds of check, in the order they are worth anything:
 *
 * 1. The published test vectors. RFC 1321 and FIPS 180-4 both print digests for
 *    a handful of short messages, and those come from outside this repository.
 * 2. Every one of them against node:crypto, over random data, at every message
 *    length from 0 to 200 bytes and at a few beyond it. That range is chosen
 *    rather than round: the padding needs a whole extra block when the message
 *    ends within nine bytes of a block boundary, and 0 to 200 crosses that
 *    boundary three times for the 64-byte algorithms and once for SHA-512.
 * 3. The same data fed in awkward pieces - one byte at a time, in sevens, in
 *    one lump - which has to give the same answer, because that is the whole
 *    claim this tool makes about size.
 *
 * A hash checked only against itself proves nothing at all, so nothing here
 * compares this code with this code.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash, randomBytes } from 'node:crypto';

import { bitLength } from '../../tools/hash-checksum/src/blocks.js';
import { md5 } from '../../tools/hash-checksum/src/md5.js';
import { sha1 } from '../../tools/hash-checksum/src/sha1.js';
import { sha256 } from '../../tools/hash-checksum/src/sha256.js';
import { sha384, sha512 } from '../../tools/hash-checksum/src/sha512.js';
import { ALGORITHMS, ORDER, Stopped, Unreadable, hashFile, hex } from '../../tools/hash-checksum/src/hash.js';
import { algorithmsIn, readExpected, verdict } from '../../tools/hash-checksum/src/expected.js';

const MAKERS = { md5, sha1, sha256, sha384, sha512 };

/** node:crypto knows these by slightly different names than the markup does. */
const NODE_NAME = {
  md5: 'md5', sha1: 'sha1', sha256: 'sha256', sha384: 'sha384', sha512: 'sha512',
};

const utf8 = (text) => new TextEncoder().encode(text);

function digestOf(id, ...chunks) {
  const state = MAKERS[id]();
  for (const chunk of chunks) state.update(chunk);
  return hex(state.digest());
}

/* ------------------------------------------------------ published vectors */

test('the published test vectors', () => {
  // RFC 1321, section A.5.
  assert.equal(digestOf('md5', utf8('')), 'd41d8cd98f00b204e9800998ecf8427e');
  assert.equal(digestOf('md5', utf8('abc')), '900150983cd24fb0d6963f7d28e17f72');
  assert.equal(
    digestOf('md5', utf8('message digest')),
    'f96b697d7cb7938d525a2f31aaf161d0',
  );

  // FIPS 180-4, the one-block and two-block examples.
  assert.equal(digestOf('sha1', utf8('abc')), 'a9993e364706816aba3e25717850c26c9cd0d89d');
  assert.equal(
    digestOf('sha256', utf8('abc')),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
  assert.equal(
    digestOf('sha384', utf8('abc')),
    'cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed'
    + '8086072ba1e7cc2358baeca134c825a7',
  );
  assert.equal(
    digestOf('sha512', utf8('abc')),
    'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a'
    + '2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f',
  );

  // The empty message, which is the case where the padding is the whole input.
  for (const id of ORDER) {
    assert.equal(digestOf(id), createHash(NODE_NAME[id]).digest('hex'), id);
  }
});

/* ------------------------------------------------- against the system's own */

test('every length from 0 to 200 bytes agrees with node:crypto', () => {
  const data = randomBytes(200);
  for (let length = 0; length <= 200; length += 1) {
    const slice = data.subarray(0, length);
    for (const id of ORDER) {
      assert.equal(
        digestOf(id, new Uint8Array(slice)),
        createHash(NODE_NAME[id]).update(slice).digest('hex'),
        `${id} at ${length} bytes`,
      );
    }
  }
});

test('the lengths where the padding needs a block of its own', () => {
  // A 64-byte block holds an 8-byte length, so a message ending at 56 to 63
  // bytes past a boundary pushes the length into a new block. SHA-512 has a
  // 128-byte block and a 16-byte length, so its awkward range is 112 to 127.
  const awkward = [55, 56, 57, 63, 64, 65, 119, 120, 127, 128, 129, 447, 448, 1023, 1024];
  const data = randomBytes(2048);
  for (const length of awkward) {
    const slice = data.subarray(0, length);
    for (const id of ORDER) {
      assert.equal(
        digestOf(id, new Uint8Array(slice)),
        createHash(NODE_NAME[id]).update(slice).digest('hex'),
        `${id} at ${length} bytes`,
      );
    }
  }
});

test('how the bytes arrive makes no difference', () => {
  const data = randomBytes(5000);
  for (const id of ORDER) {
    const whole = digestOf(id, new Uint8Array(data));

    const byOne = MAKERS[id]();
    for (const byte of data) byOne.update(Uint8Array.of(byte));

    const bySeven = MAKERS[id]();
    for (let at = 0; at < data.length; at += 7) {
      bySeven.update(new Uint8Array(data.subarray(at, at + 7)));
    }

    // Including empty updates, which a chunked read can produce at the end.
    const withGaps = MAKERS[id]();
    withGaps.update(new Uint8Array(0));
    withGaps.update(new Uint8Array(data.subarray(0, 1)));
    withGaps.update(new Uint8Array(0));
    withGaps.update(new Uint8Array(data.subarray(1)));

    assert.equal(hex(byOne.digest()), whole, `${id}, one byte at a time`);
    assert.equal(hex(bySeven.digest()), whole, `${id}, in sevens`);
    assert.equal(hex(withGaps.digest()), whole, `${id}, with empty updates`);
  }
});

test('a message long enough to need a two-word bit length', () => {
  // Nothing here counts in 32 bits, but the length field is written as two
  // halves and a message under 512 MB never exercises the high one. This one
  // does not either - it is 1 MB - so the halves are checked directly instead,
  // in the unit test below. This case is about the block loop at scale.
  const megabyte = randomBytes(1024 * 1024);
  for (const id of ORDER) {
    assert.equal(
      digestOf(id, new Uint8Array(megabyte)),
      createHash(NODE_NAME[id]).update(megabyte).digest('hex'),
      id,
    );
  }
});

test('the bit length is split into halves that a 4 GB file would need', () => {
  // A byte count is exact in a double up to 2^53, and multiplying by eight is
  // exact up to 2^50 - which is a petabyte. The halves are what the padding
  // writes, and the high one first becomes non-zero at 512 MB.
  assert.deepEqual(bitLength(0), { hi: 0, lo: 0 });
  assert.deepEqual(bitLength(1), { hi: 0, lo: 8 });
  assert.deepEqual(bitLength(0x1fffffff), { hi: 0, lo: 0xfffffff8 });
  assert.deepEqual(bitLength(0x20000000), { hi: 1, lo: 0 });
  assert.deepEqual(bitLength(5 * 1024 * 1024 * 1024), { hi: 10, lo: 0 });
});

/* --------------------------------------------------------- reading a file */

/** A Blob stands in for a File: hashFile only ever uses .size and .slice(). */
const blobOf = (bytes) => new Blob([bytes]);

test('hashFile gives the same answer as hashing the whole thing', async () => {
  const data = randomBytes(70_000);
  const found = await hashFile(blobOf(data), ORDER, { chunkSize: 1024 });
  for (const id of ORDER) {
    assert.equal(found[id], createHash(NODE_NAME[id]).update(data).digest('hex'), id);
  }
});

test('the chunk size changes nothing, including an empty file', async () => {
  const data = randomBytes(4097);
  const sizes = [1, 7, 4096, 4097, 4098, 1 << 20];
  for (const chunkSize of sizes) {
    const found = await hashFile(blobOf(data), ['sha256'], { chunkSize });
    assert.equal(
      found.sha256,
      createHash('sha256').update(data).digest('hex'),
      `chunk size ${chunkSize}`,
    );
  }

  const empty = await hashFile(blobOf(new Uint8Array(0)), ORDER, { chunkSize: 16 });
  for (const id of ORDER) {
    assert.equal(empty[id], createHash(NODE_NAME[id]).digest('hex'), id);
  }
});

test('progress is reported from zero to the whole file, and never past it', async () => {
  const data = randomBytes(10_000);
  const seen = [];
  await hashFile(blobOf(data), ['md5'], {
    chunkSize: 3000,
    onProgress(done, total) {
      assert.equal(total, data.length);
      assert.ok(done <= total, 'progress never exceeds the file');
      seen.push(done);
    },
  });
  assert.equal(seen[0], 0);
  assert.equal(seen.at(-1), data.length);
  for (let i = 1; i < seen.length; i += 1) assert.ok(seen[i] >= seen[i - 1], 'never goes back');
});

test('stopping throws Stopped rather than half an answer', async () => {
  const controller = new AbortController();
  const data = randomBytes(10_000);
  const promise = hashFile(blobOf(data), ['sha256'], {
    chunkSize: 100,
    signal: controller.signal,
    onProgress(done) { if (done >= 500) controller.abort(); },
  });
  await assert.rejects(promise, Stopped);
});

test('a file that reads short is refused rather than half-hashed', async () => {
  // What a File does when the thing on disk was replaced mid-read. Half a file
  // has a wrong checksum, not a partial one, so there is nothing worth
  // returning.
  const shrinking = {
    size: 10_000,
    slice: () => ({ arrayBuffer: async () => new ArrayBuffer(0) }),
  };
  await assert.rejects(hashFile(shrinking, ['md5'], { chunkSize: 100 }), Unreadable);

  const gone = {
    size: 10_000,
    slice: () => ({ arrayBuffer: async () => { throw new Error('NotReadableError'); } }),
  };
  await assert.rejects(hashFile(gone, ['md5'], { chunkSize: 100 }), Unreadable);
});

/* ------------------------------------------------- reading a pasted value */

const only = (text) => {
  const { entries } = readExpected(text);
  assert.equal(entries.length, 1, `expected one entry from ${JSON.stringify(text)}`);
  return entries[0];
};

const SHA256_ABC = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
const MD5_EMPTY = 'd41d8cd98f00b204e9800998ecf8427e';

test('a checksum is recognised in every shape it gets published in', () => {
  assert.deepEqual(only(SHA256_ABC), { hex: SHA256_ABC, algorithm: 'sha256', name: null });

  // Upper case, which is what Windows prints.
  assert.equal(only(SHA256_ABC.toUpperCase()).hex, SHA256_ABC);

  // In groups of eight, which is what certutil prints.
  assert.equal(only(SHA256_ABC.replace(/(.{8})/g, '$1 ')).hex, SHA256_ABC);

  // A label in front of it.
  assert.equal(only(`SHA-256: ${SHA256_ABC}`).hex, SHA256_ABC);
  assert.equal(only(`sha256 = ${SHA256_ABC}`).hex, SHA256_ABC);

  // GNU coreutils, both the text and the binary marker.
  assert.deepEqual(only(`${MD5_EMPTY}  ubuntu.iso`), {
    hex: MD5_EMPTY, algorithm: 'md5', name: 'ubuntu.iso',
  });
  assert.equal(only(`${MD5_EMPTY} *ubuntu.iso`).name, 'ubuntu.iso');

  // The BSD tagged form, which is what shasum --tag writes and what this tool
  // saves.
  assert.deepEqual(only(`SHA256 (ubuntu.iso) = ${SHA256_ABC}`), {
    hex: SHA256_ABC, algorithm: 'sha256', name: 'ubuntu.iso',
  });

  // One digest wrapped over two lines by whatever it was copied out of. Each
  // half here is 32 characters, which is exactly the length of an MD5, so the
  // line-by-line readings are kept as candidates and the joined one leads.
  const split = readExpected(`${SHA256_ABC.slice(0, 32)}\n${SHA256_ABC.slice(32)}`);
  assert.equal(split.wrapped, true);
  assert.deepEqual(split.entries[0], { hex: SHA256_ABC, algorithm: 'sha256', name: null });
  assert.equal(verdict(split.entries, { sha256: SHA256_ABC }, 'x.iso').state, 'match');

  // A single line is not a wrap, and is not reported as one.
  assert.equal(readExpected(SHA256_ABC).wrapped, false);
});

test('a subresource-integrity value is base64 and is decoded', () => {
  const sri = 'sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC';
  const entry = only(`integrity="${sri}"`);
  assert.equal(entry.algorithm, 'sha384');
  assert.equal(entry.hex.length, 96);
  assert.equal(entry.hex, Buffer.from(sri.split('-')[1], 'base64').toString('hex'));
});

test('the algorithm comes from the length, and the lengths are all different', () => {
  const lengths = ORDER.map((id) => ALGORITHMS[id].hex);
  assert.equal(new Set(lengths).size, lengths.length);
  for (const id of ORDER) {
    const digest = digestOf(id, utf8('abc'));
    assert.equal(only(digest).algorithm, id);
  }
});

test('what is not a checksum is not reported as one', () => {
  assert.deepEqual(readExpected(''), { entries: [], strays: [], wrapped: false });
  assert.deepEqual(readExpected('no idea'), { entries: [], strays: [], wrapped: false });

  // Hex of the wrong length is worth naming, because a truncated copy is the
  // usual reason and the visitor can act on being told the number.
  const short = readExpected(SHA256_ABC.slice(0, 63));
  assert.equal(short.entries.length, 0);
  assert.equal(short.strays[0].hex.length, 63);
});

test('a whole SHA256SUMS file is read, and the line naming the file wins', () => {
  const other = 'a'.repeat(64);
  const text = [
    `${other} *ubuntu-24.04-desktop-amd64.iso`,
    `${SHA256_ABC} *ubuntu-24.04-live-server-amd64.iso`,
  ].join('\n');

  const { entries } = readExpected(text);
  assert.equal(entries.length, 2);
  assert.deepEqual(algorithmsIn(entries), ['sha256']);

  const answer = verdict(entries, { sha256: SHA256_ABC }, 'ubuntu-24.04-live-server-amd64.iso');
  assert.equal(answer.state, 'match');
  assert.equal(answer.renamed, false);

  // Choosing the desktop image and finding the server image checksum is more
  // useful reported as "these are the bytes of that other line" than as a bare
  // mismatch, so it comes back as a match under a name the visitor did not pick.
  const swapped = verdict(entries, { sha256: SHA256_ABC }, 'ubuntu-24.04-desktop-amd64.iso');
  assert.equal(swapped.state, 'match');
  assert.equal(swapped.renamed, true);
  assert.equal(swapped.entry.name, 'ubuntu-24.04-live-server-amd64.iso');

  // Bytes that match no line at all are still a mismatch.
  const neither = verdict(entries, { sha256: 'c'.repeat(64) }, 'ubuntu-24.04-desktop-amd64.iso');
  assert.equal(neither.state, 'mismatch');
});

test('a match under another name is a match, and says so', () => {
  const { entries } = readExpected(`${SHA256_ABC} *ubuntu.iso\n${'b'.repeat(64)} *other.iso`);
  const answer = verdict(entries, { sha256: SHA256_ABC }, 'other.iso');
  assert.equal(answer.state, 'match');
  assert.equal(answer.renamed, true);
  assert.equal(answer.entry.name, 'ubuntu.iso');
});

test('a path in a checksum file is compared by its last segment', () => {
  const { entries } = readExpected(`${SHA256_ABC}  ./dist/disk.iso`);
  assert.equal(verdict(entries, { sha256: SHA256_ABC }, 'disk.iso').state, 'match');
});

test('the verdict waits rather than guessing when the digest is not computed yet', () => {
  const { entries } = readExpected(SHA256_ABC);
  assert.deepEqual(verdict(entries, {}, 'x.iso'), { state: 'waiting', missing: ['sha256'] });
  assert.deepEqual(verdict([], { sha256: SHA256_ABC }, 'x.iso'), { state: 'none' });
  assert.equal(verdict(entries, { sha256: 'c'.repeat(64) }, 'x.iso').state, 'mismatch');
});

test('case never decides a comparison', () => {
  const { entries } = readExpected(SHA256_ABC.toUpperCase());
  assert.equal(verdict(entries, { sha256: SHA256_ABC }, 'x.iso').state, 'match');
});

/* ------------------------------------------------------------ the registry */

test('every algorithm the markup can tick is one hash.js knows', () => {
  for (const id of ORDER) {
    assert.ok(ALGORITHMS[id], id);
    assert.equal(digestOf(id, utf8('abc')).length, ALGORITHMS[id].hex);
    // The tag is what a saved file writes and what a pasted BSD line is read
    // back from, so a round trip through it has to land on the same algorithm.
    const line = `${ALGORITHMS[id].tag} (x) = ${digestOf(id, utf8('abc'))}`;
    assert.equal(only(line).algorithm, id);
  }
  assert.deepEqual(Object.keys(ALGORITHMS).sort(), [...ORDER].sort());
});
