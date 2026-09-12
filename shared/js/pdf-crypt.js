/**
 * The standard security handler: turning a password into a document's key.
 *
 * This is the whole of what "PDF protection" is, and it is worth saying up
 * front what it is not. There is no lock on a PDF that a reader consults and
 * obeys. The file's contents - every string and every stream - are genuinely
 * enciphered, and the question is only ever whether the key can be worked out
 * from what the file itself carries. Four generations of the format answer
 * that differently and this file implements all four, because documents from
 * all four are still in people's inboxes.
 *
 * THE TWO PASSWORDS, AND WHY ONE OF THEM IS NOT A PASSWORD
 *
 * A PDF has room for two. The *user* password is the one a reader asks you
 * for; without it the file does not open. The *owner* password is the one that
 * lifts the restrictions - no printing, no copying, no editing - and a
 * document may have an owner password with no user password at all. That is by
 * far the commonest kind of protected file, and it is the case where this tool
 * needs nothing from you.
 *
 * The reason is structural rather than a flaw anybody introduced. A file that
 * opens without being asked for anything must contain everything needed to
 * derive its key, because your reader derived it. What stops that reader
 * printing the document is a permissions field - /P - which is *inside* the
 * file, protected by nothing but the reader's willingness to look at it. Adobe
 * documented this from the beginning: the restrictions are enforced by
 * agreement between well-behaved programs, not by cryptography. So removing
 * them is not breaking anything; it is declining to volunteer.
 *
 * A user password is the opposite. It genuinely is not in the file, and
 * nothing here will find one: there is no guessing, no dictionary and no
 * attempt on the 40-bit keys that would in fact fall to one. You supply the
 * password or the document stays shut. That line is drawn in the tool, said on
 * its page, and is the reason this file has no loop in it anywhere.
 *
 * WHAT THE FOUR GENERATIONS ARE
 *
 *   R2  PDF 1.1, 1994. RC4 with a 40-bit key, MD5 to derive it. Inside the
 *       American export limit of the day, and exhaustible now on a laptop.
 *   R3  PDF 1.4. The same shape with up to 128 bits, and the key derivation
 *       iterated fifty times, which was already the accepted way to make a
 *       password hash expensive.
 *   R4  PDF 1.6. Adds AES-128 and a table of named crypt filters, so that
 *       different parts of one document can be treated differently.
 *   R5  An Adobe extension, 2008, and withdrawn: AES-256 with a single
 *       SHA-256 of the password, which turned out to be attackable at the
 *       speed a graphics card can hash. Files exist and open here.
 *   R6  PDF 2.0, and the one still worth anything. AES-256 with the iterated
 *       hash below, which is deliberately expensive to compute.
 *
 * The revision, not the version, is what decides the algorithm, which is why
 * everything below branches on /R.
 */

import { md5 } from './md5.js';
import { rc4 } from './rc4.js';
import { Aes, cbcDecrypt, cbcEncrypt } from './aes.js';
import { permissionsIn } from './pdf-permissions.js';

/** The password was not the user's or the owner's. Carries a phrase key. */
export class WrongPasswordError extends Error {}

/** The file is protected by something this tool does not implement. */
export class UnsupportedEncryptionError extends Error {
  constructor(message, values) {
    super(message);
    this.values = values;
  }
}

/**
 * The 32 bytes every password before PDF 2.0 is padded out to.
 *
 * They are arbitrary, published, and identical in every document ever made,
 * which is the point: a blank password is a known 32-byte string, so a file
 * with no user password has a key that anybody can derive. Half of what this
 * tool does follows from that one constant.
 */
const PAD = new Uint8Array([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41,
  0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80,
  0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

const NO_IV = new Uint8Array(16);
const EMPTY = new Uint8Array(0);

/**
 * An `unlock` for PdfDocument.open, and somewhere to read the answer back.
 *
 * The reader calls the function with the file's /Encrypt dictionary and wants
 * a cipher back. Everything the *page* wants to say afterwards - which scheme
 * this was, how long the key was, whether the password given turned out to be
 * the user's or the owner's - falls out of the same work and would otherwise
 * have to be worked out twice, so it is written into `report` on the way past.
 *
 * @param {string} password what the visitor typed, or '' before they were asked
 * @returns {{unlock: Function, report: object}}
 */
export function standardSecurity(password = '') {
  const report = {
    /** Was there any encryption at all? */
    encrypted: false,
    /** 2 to 6; the generation table at the top of this file. */
    revision: 0,
    /** 'rc4' or 'aes'. */
    cipher: '',
    /** Key length in bits: 40, 128 or 256. */
    bits: 0,
    /** 'blank', 'user' or 'owner' - which password actually opened it. */
    opened: '',
    /** The /P bits, as a list of what the document asked readers not to do. */
    restrictions: [],
    /** True when the document said readers may ignore /P for accessibility. */
    encryptMetadata: true,
    /** Set when the document's own check value confirmed the key (R6 only). */
    keyConfirmed: false,
  };

  const unlock = async (encrypt, doc) => {
    report.encrypted = true;

    // The reader hands over whatever /Encrypt resolved to, which in a damaged
    // file is nothing at all. It is still an encrypted document - there is
    // simply nothing left to derive a key from.
    if (!(encrypt instanceof Map)) throw new UnsupportedEncryptionError('crypt.malformed');

    const handler = doc.get(encrypt, 'Filter');
    if (handler && handler.value !== 'Standard') {
      // /Adobe.PubSec and friends encrypt to a certificate rather than a
      // password. Nothing typed into a box can open one.
      throw new UnsupportedEncryptionError('crypt.handler', { name: handler.value });
    }

    const version = doc.get(encrypt, 'V') ?? 0;
    const revision = doc.get(encrypt, 'R') ?? 0;
    report.revision = revision;

    // /V 3 is Adobe's unpublished variant and /V 0 is undocumented; neither
    // has an algorithm to implement. Everything else in range is below.
    if (revision < 2 || revision > 6 || version < 1 || version === 3 || version > 5) {
      throw new UnsupportedEncryptionError('crypt.version', { v: version, r: revision });
    }

    report.encryptMetadata = doc.get(encrypt, 'EncryptMetadata') !== false;
    report.restrictions = permissionsIn(doc.get(encrypt, 'P') ?? 0, revision);

    const filters = readCryptFilters(doc, encrypt, version);
    const key = version >= 5
      ? await key256(password, doc, encrypt, report)
      : key128(password, doc, encrypt, version, revision, report);

    report.bits = key.length * 8;
    // Whichever filter the document actually uses. Usually StmF, but a file
    // may leave its streams in the clear and encipher only its strings, and
    // reporting "RC4" for an AES document because /StmF said /Identity would
    // be wrong on the one line of the page that is meant to be checkable.
    const cipher = filters.table.get(filters.streamName)
      ?? filters.table.get(filters.stringName);
    report.cipher = version >= 5 || cipher?.aes ? 'aes' : 'rc4';

    return makeCrypt(key, filters, version >= 5, report);
  };

  return { unlock, report };
}

/* ------------------------------------------------- RC4 and AES-128 (R2-R4) */

/**
 * Algorithm 2: the file key, from the password and four things in the file.
 *
 * The /O entry, the permissions and the file's first ID string all go into the
 * hash, which is what ties a key to one document: the same password on two
 * files gives two different keys.
 */
function key128(password, doc, encrypt, version, revision, report) {
  const owner = stringBytes(doc.get(encrypt, 'O'));
  const user = stringBytes(doc.get(encrypt, 'U'));
  const permissions = doc.get(encrypt, 'P') ?? 0;
  const id = firstId(doc);
  const length = version === 1 ? 5 : Math.floor((doc.get(encrypt, 'Length') ?? 40) / 8);

  const bytes = latin1(password);
  const settings = {
    owner, permissions, id, revision, length, encryptMetadata: report.encryptMetadata,
  };

  // A file whose user password is blank opens for everybody, so this is tried
  // first and its answer is 'blank' whatever the visitor typed - reporting a
  // typed password as "correct" when any password would have done is a small
  // lie, and this page's whole subject is which protections were real.
  const blank = deriveKey(EMPTY, settings);
  if (matchesUser(blank, user, id, revision)) {
    report.opened = 'blank';
    return blank;
  }

  if (password) {
    const asUser = deriveKey(bytes, settings);
    if (matchesUser(asUser, user, id, revision)) {
      report.opened = 'user';
      return asUser;
    }

    // Algorithm 7: an owner password does not derive the key directly. It
    // decrypts /O, which holds the *user* password, and that opens the file -
    // which is how one document can have two passwords and one key.
    const recovered = userPasswordFromOwner(bytes, owner, revision, length);
    const asOwner = deriveKey(recovered, settings);
    if (matchesUser(asOwner, user, id, revision)) {
      report.opened = 'owner';
      return asOwner;
    }
  }

  throw new WrongPasswordError('crypt.wrongpassword');
}

/** The password padded out to exactly 32 bytes, which is what gets hashed. */
function padded(bytes) {
  const out = new Uint8Array(32);
  const take = Math.min(bytes.length, 32);
  out.set(bytes.subarray(0, take));
  out.set(PAD.subarray(0, 32 - take), take);
  return out;
}

function deriveKey(password, { owner, permissions, id, revision, length, encryptMetadata }) {
  const hash = md5();
  hash.update(padded(password));
  hash.update(owner.subarray(0, 32));
  hash.update(int32le(permissions));
  hash.update(id);
  // A document that leaves its metadata in the clear says so by mixing four
  // 0xff bytes in here, so that a key derived without knowing that is wrong.
  if (revision >= 4 && !encryptMetadata) {
    hash.update(new Uint8Array([0xff, 0xff, 0xff, 0xff]));
  }

  let digest = hash.digest();
  const size = revision === 2 ? 5 : clamp(length, 5, 16);

  // Fifty more rounds, over the key-length prefix rather than the whole
  // digest. Cheap now, and it was fifty times the cost of a guess in 2001.
  if (revision >= 3) {
    for (let i = 0; i < 50; i += 1) {
      const again = md5();
      again.update(digest.subarray(0, size));
      digest = again.digest();
    }
  }

  return digest.slice(0, size);
}

/**
 * Algorithms 4 and 5: does this key produce the /U the file carries?
 *
 * /U is the padding string encrypted under the key, so recomputing it is the
 * password check. R3 onwards folds the file ID in and runs twenty RC4 passes
 * with twenty derived keys, and compares only the first sixteen bytes - the
 * last sixteen of /U are arbitrary and writers fill them differently.
 */
function matchesUser(key, user, id, revision) {
  if (user.length < 16) return false;

  if (revision === 2) {
    return same(rc4(key, PAD), user.subarray(0, 32), 32);
  }

  const hash = md5();
  hash.update(PAD);
  hash.update(id);

  let x = rc4(key, hash.digest());
  for (let i = 1; i <= 19; i += 1) x = rc4(xorEach(key, i), x);

  return same(x, user.subarray(0, 16), 16);
}

/** Algorithm 7 run backwards: /O decrypted with the owner password is the
 *  padded user password. */
function userPasswordFromOwner(password, owner, revision, length) {
  const hash = md5();
  hash.update(padded(password));
  let digest = hash.digest();

  const size = revision === 2 ? 5 : clamp(length, 5, 16);
  if (revision >= 3) {
    for (let i = 0; i < 50; i += 1) {
      const again = md5();
      again.update(digest);
      digest = again.digest();
    }
  }

  const key = digest.slice(0, size);
  if (revision === 2) return rc4(key, owner.subarray(0, 32));

  let x = owner.slice(0, 32);
  for (let i = 19; i >= 0; i -= 1) x = rc4(xorEach(key, i), x);
  return x;
}

/* ------------------------------------------------------- the other direction */

/**
 * Build an /Encrypt dictionary, and a cipher that writes to match it.
 *
 * The only export here that goes this way, and two pages call it. For
 * /protect-pdf/ it is the tool: a password, or a set of restrictions, put on
 * to a document that had none. /unlock-pdf/ uses it for its example alone,
 * because a page demonstrating that restrictions come off has to show them
 * coming off a file that really carries some.
 *
 * Two revisions are written. Both are ones the reading half of this file is
 * checked against files somebody else's implementation wrote, which is what
 * makes writing them here worth anything:
 *
 *   R6  AES-256 under the PDF 2.0 password hash - the default, and the only
 *       scheme in the table at the top of this file still worth having. Every
 *       reader since Acrobat X, in 2010, opens it.
 *   R4  AES-128 with the 1994 key derivation in front of it. What "restrict
 *       editing" in an office suite has produced for fifteen years, and what
 *       a reader older than 2010 needs.
 *
 * THE OWNER PASSWORD IS NEVER LEFT BLANK. A document may carry restrictions
 * and no open password, and that means something only if the owner password
 * that lifts the restrictions is not blank too: with both blank, the file
 * would say "please do not print this" and let any reader lift the request by
 * trying the empty string. So a caller that sets no owner password gets the
 * open password used in its place - one password doing both jobs, which is
 * what most people mean - and a caller that sets neither gets a random one,
 * made here and never seen by anybody. That random password never guards the
 * opening of a document, only the request not to print it, so nothing here
 * can hand back a file that nobody can read.
 *
 * @param {object} settings
 * @param {string} [settings.userPassword]  what a reader asks for; '' for a
 *   document that opens for anybody and is only restricted
 * @param {string} [settings.ownerPassword]  what lifts the restrictions
 * @param {number} [settings.permissions]  /P, where -1 restricts nothing
 * @param {Uint8Array} settings.id  the first half of the trailer's /ID. The
 *   R4 key is derived from it, so it has to exist before anything is
 *   encrypted and go into the trailer unchanged afterwards
 * @param {4|6} [settings.revision]
 * @returns {Promise<{dictionary: string, id: Uint8Array, revision: number,
 *   bits: number, minVersion: string,
 *   encrypt: (bytes: Uint8Array, num: number, gen: number) => Uint8Array}>}
 */
export async function protect({
  userPassword = '', ownerPassword = '', permissions = -1, id, revision = 6,
}) {
  const owner = ownerPassword || userPassword || randomPassword();
  const p = permissions | 0;
  const made = revision === 4
    ? protect128(userPassword, owner, p, id)
    : await protect256(userPassword, owner, p);
  return { ...made, id };
}

/** Revision 4: the 1994 shape, with AES-128 as the cipher. */
function protect128(userPassword, ownerPassword, permissions, id) {
  const revision = 4;
  const length = 16;
  const user = latin1(userPassword);

  // The order matters and is not obvious: /O is computed from the two
  // passwords, the file key from /O, and /U from the file key. Each depends
  // on the one before it.
  const owner = ownerEntry(latin1(ownerPassword), user, revision, length);
  const key = deriveKey(user, {
    owner, permissions, id, revision, length, encryptMetadata: true,
  });
  const check = userEntry(key, id);

  const dictionary = '<< /Filter /Standard /V 4 /R 4 /Length 128'
    + ' /CF << /StdCF << /CFM /AESV2 /AuthEvent /DocOpen /Length 16 >> >>'
    + ' /StmF /StdCF /StrF /StdCF'
    + ` /O ${hex(owner)} /U ${hex(check)} /P ${permissions} >>`;

  return {
    dictionary,
    revision,
    bits: 128,
    minVersion: '1.6',
    encrypt: (bytes, num, gen) => aesEncrypt(objectKey(key, num, gen, true), bytes),
  };
}

/**
 * Revision 6: the file key is random, and each password only wraps it.
 *
 * Algorithms 8, 9 and 10, run forwards, and the mirror of key256 below: /U
 * is the hash of the password and a validation salt with both salts behind
 * it, /UE is the file key wrapped under a hash over the other salt, and /O
 * and /OE are the same with the whole of /U hashed in. /Perms is the
 * permissions again under the file key, which is what lets a reader prove
 * the key it derived is the one the document was written with rather than
 * merely one that decrypts to something.
 */
async function protect256(userPassword, ownerPassword, permissions) {
  const key = random(32);
  // At most 127 bytes of UTF-8, which is what the format says and what the
  // reading side truncates to as well.
  const user = utf8(userPassword).subarray(0, 127);
  const owner = utf8(ownerPassword).subarray(0, 127);

  const userValidation = random(8);
  const userKey = random(8);
  const U = join(await hash2B(user, userValidation, EMPTY, 6), userValidation, userKey);
  const UE = cbcEncrypt(new Aes(await hash2B(user, userKey, EMPTY, 6)), NO_IV, key);

  const ownerValidation = random(8);
  const ownerKey = random(8);
  const O = join(await hash2B(owner, ownerValidation, U, 6), ownerValidation, ownerKey);
  const OE = cbcEncrypt(new Aes(await hash2B(owner, ownerKey, U, 6)), NO_IV, key);

  // /P little-endian, four 0xff, 'T' for "the metadata is encrypted too",
  // then 'adb', then four bytes of anything. One block under a zero IV is
  // ECB, which is what permsAgree undoes.
  const perms = new Uint8Array(16);
  perms.set(int32le(permissions), 0);
  perms.fill(0xff, 4, 8);
  perms.set([0x54, 0x61, 0x64, 0x62], 8);
  perms.set(random(4), 12);
  const Perms = cbcEncrypt(new Aes(key), NO_IV, perms);

  const dictionary = '<< /Filter /Standard /V 5 /R 6 /Length 256'
    + ' /CF << /StdCF << /CFM /AESV3 /AuthEvent /DocOpen /Length 32 >> >>'
    + ' /StmF /StdCF /StrF /StdCF'
    + ` /O ${hex(O)} /U ${hex(U)} /OE ${hex(OE)} /UE ${hex(UE)}`
    + ` /P ${permissions} /Perms ${hex(Perms)} >>`;

  return {
    dictionary,
    revision: 6,
    bits: 256,
    minVersion: '1.7',
    // The file key is used as it is: from R5 the object's number is no
    // longer folded in, and the two arguments are ignored on purpose.
    encrypt: (bytes) => aesEncrypt(key, bytes),
  };
}

/** Algorithm 3: /O is the padded user password encrypted under a key made
 *  from the owner password. */
function ownerEntry(ownerPassword, userPassword, revision, length) {
  const hash = md5();
  hash.update(padded(ownerPassword));
  let digest = hash.digest();

  // The whole digest each round here, where algorithm 2 uses only the first n
  // bytes. The asymmetry is in the specification and is easy to miss.
  for (let i = 0; i < 50; i += 1) {
    const again = md5();
    again.update(digest);
    digest = again.digest();
  }

  const key = digest.slice(0, clamp(length, 5, 16));
  let x = rc4(key, padded(userPassword));
  for (let i = 1; i <= 19; i += 1) x = rc4(xorEach(key, i), x);
  return x;
}

/** Algorithm 5 run forwards: what matchesUser checks against. */
function userEntry(key, id) {
  const hash = md5();
  hash.update(PAD);
  hash.update(id);

  let x = rc4(key, hash.digest());
  for (let i = 1; i <= 19; i += 1) x = rc4(xorEach(key, i), x);

  // Sixteen bytes of anything at all. Writers put arbitrary padding here and
  // no reader looks at it; zeros say plainly that nothing is hidden in them.
  const out = new Uint8Array(32);
  out.set(x.subarray(0, 16));
  return out;
}

/** A random IV in front, PKCS#7 padding behind - the mirror of aesDecrypt. */
function aesEncrypt(key, bytes) {
  const iv = random(16);

  // Always at least one byte of padding, even when the length already fits,
  // so that stripping it is never ambiguous.
  const fill = 16 - (bytes.length % 16);
  const block = new Uint8Array(bytes.length + fill);
  block.set(bytes);
  block.fill(fill, bytes.length);

  return join(iv, cbcEncrypt(new Aes(key), iv, block));
}

/** A PDF hex string, which is the one spelling that needs no escaping. */
function hex(bytes) {
  let out = '<';
  for (const byte of bytes) out += byte.toString(16).padStart(2, '0');
  return `${out}>`;
}

const random = (n) => crypto.getRandomValues(new Uint8Array(n));

/** An owner password for a document whose caller set none: 192 bits of
 *  randomness, spelt as hex so that it is a password in every revision's
 *  encoding. It is used once, here, and never shown to anybody. */
function randomPassword() {
  return hex(random(24)).slice(1, -1);
}

/* -------------------------------------------------------- AES-256 (R5, R6) */

/**
 * The 2017 scheme, where the file key is random and the password only unwraps
 * it.
 *
 * This is the one that is actually strong, and the shape is worth reading: /U
 * and /O each carry a hash of the password and two salts, and /UE and /OE
 * carry the file's real key, wrapped. So the password proves itself against
 * the hash and then unwraps the key - which means changing the password does
 * not re-encrypt the document, and means the user and owner passwords unwrap
 * the very same key by two different routes.
 */
async function key256(password, doc, encrypt, report) {
  const user = stringBytes(doc.get(encrypt, 'U'));
  const owner = stringBytes(doc.get(encrypt, 'O'));
  const userExtra = stringBytes(doc.get(encrypt, 'UE'));
  const ownerExtra = stringBytes(doc.get(encrypt, 'OE'));
  const revision = doc.get(encrypt, 'R');

  if (user.length < 48 || owner.length < 48) {
    throw new UnsupportedEncryptionError('crypt.malformed');
  }

  // At most 127 bytes of UTF-8, which is what the format says and what every
  // writer does; a longer password is silently the same as its first 127.
  const bytes = utf8(password).subarray(0, 127);

  // The blank password first, for the same reason as the older scheme: a
  // document restricted but not closed opens for anybody, and asking for a
  // password that does not exist would be a strange thing to do.
  const candidates = password === '' ? [EMPTY] : [EMPTY, bytes];

  for (const tried of candidates) {
    const blank = tried === EMPTY;

    const asUser = await hash2B(tried, user.subarray(32, 40), EMPTY, revision);
    if (same(asUser, user.subarray(0, 32), 32)) {
      report.opened = blank ? 'blank' : 'user';
      const wrapping = await hash2B(tried, user.subarray(40, 48), EMPTY, revision);
      return unwrap(wrapping, userExtra, doc, encrypt, report);
    }

    // The owner check hashes the whole of /U alongside the password, which is
    // what stops an owner password from one document opening another.
    const udata = user.subarray(0, 48);
    const asOwner = await hash2B(tried, owner.subarray(32, 40), udata, revision);
    if (same(asOwner, owner.subarray(0, 32), 32)) {
      report.opened = blank ? 'blank' : 'owner';
      const wrapping = await hash2B(tried, owner.subarray(40, 48), udata, revision);
      return unwrap(wrapping, ownerExtra, doc, encrypt, report);
    }
  }

  throw new WrongPasswordError('crypt.wrongpassword');
}

function unwrap(wrapping, wrapped, doc, encrypt, report) {
  if (wrapped.length < 32) throw new UnsupportedEncryptionError('crypt.malformed');
  const key = cbcDecrypt(new Aes(wrapping), NO_IV, wrapped.subarray(0, 32));
  report.keyConfirmed = permsAgree(key, doc, encrypt);
  return key;
}

/**
 * The document's own check on the key: /Perms is the permissions field
 * encrypted under the file key, so decrypting it and finding the same numbers
 * proves the key is right rather than merely plausible.
 *
 * A mismatch is reported and not raised. The check is a writer's option, some
 * of them fill it in wrongly, and a document that decrypts perfectly should
 * not be refused over a field no reader enforces.
 */
function permsAgree(key, doc, encrypt) {
  const perms = stringBytes(doc.get(encrypt, 'Perms'));
  if (perms.length < 16) return false;

  // One block with a zero IV is ECB, which is what this field uses.
  const plain = cbcDecrypt(new Aes(key), NO_IV, perms.subarray(0, 16));
  if (plain[9] !== 0x61 || plain[10] !== 0x64 || plain[11] !== 0x62) return false;

  const stated = doc.get(encrypt, 'P') ?? 0;
  const view = new DataView(plain.buffer, plain.byteOffset, 4);
  return view.getInt32(0, true) === (stated | 0);
}

/**
 * Algorithm 2.B, the PDF 2.0 password hash.
 *
 * A SHA-256 to start, then rounds of "encrypt a lot of copies of the password
 * and hash the result", where which SHA to use is decided by the ciphertext
 * itself - so the rounds cannot be reordered or precomputed. It runs at least
 * 64 times and stops on a condition that depends on the data, which is what
 * makes the cost per guess unpredictable and therefore awkward to build
 * hardware for.
 *
 * R5 is the withdrawn Adobe version and is only the first line.
 */
async function hash2B(password, salt, extra, revision) {
  let k = new Uint8Array(await sha(256, join(password, salt, extra)));
  if (revision === 5) return k;

  let round = 0;
  for (;;) {
    const one = join(password, k, extra);
    const k1 = new Uint8Array(one.length * 64);
    for (let i = 0; i < 64; i += 1) k1.set(one, i * one.length);

    const e = cbcEncrypt(new Aes(k.subarray(0, 16)), k.subarray(16, 32), k1);

    let sum = 0;
    for (let i = 0; i < 16; i += 1) sum += e[i];
    k = new Uint8Array(await sha([256, 384, 512][sum % 3], e));

    round += 1;
    // Sixty-four rounds at least, then until the last byte of the ciphertext
    // is small enough - so the count depends on the password.
    if (round >= 64 && e[e.length - 1] <= round - 32) break;
  }

  return k.slice(0, 32);
}

const sha = (bits, bytes) => crypto.subtle.digest(`SHA-${bits}`, bytes);

/* --------------------------------------------------------- the crypt filters */

/**
 * /CF, the table of named ciphers a PDF 1.6 document may define.
 *
 * Before R4 there is no table: one cipher covers the file, and this makes a
 * one-entry table saying so, which is what lets everything downstream ask the
 * same question of every document. In practice even R4 files define exactly
 * one filter and name it StdCF, and the only other name anybody writes is
 * /Identity, which means "leave this alone".
 */
function readCryptFilters(doc, encrypt, version) {
  const table = new Map();

  if (version < 4) {
    table.set('StdCF', { aes: false });
    return { table, streamName: 'StdCF', stringName: 'StdCF' };
  }

  const declared = doc.get(encrypt, 'CF');
  if (declared instanceof Map) {
    for (const [name, entry] of declared) {
      const dict = doc.resolve(entry);
      if (!(dict instanceof Map)) continue;
      const method = doc.get(dict, 'CFM');
      table.set(name, {
        aes: method?.value === 'AESV2' || method?.value === 'AESV3',
        none: method?.value === 'None',
      });
    }
  }

  const named = (key) => {
    const value = doc.get(encrypt, key);
    // The default is /Identity, and /Identity is the format's way of saying
    // this half of the document is not encrypted at all.
    const name = value?.value ?? 'Identity';
    return name === 'Identity' || table.get(name)?.none ? null : name;
  };

  return { table, streamName: named('StmF'), stringName: named('StrF') };
}

/**
 * The object the reader is handed: how to undo the cipher on one thing.
 *
 * Both entry points take the object's own number and generation, because
 * before PDF 2.0 those are mixed into a per-object key - the same string in
 * two objects encrypts differently, which stops a document being attacked by
 * looking for repeats. From R5 the file key is used unchanged, and the two
 * numbers are ignored.
 */
function makeCrypt(fileKey, filters, whole, report) {
  // A stream naming a filter the table never declared is a broken file rather
  // than an unencrypted one, so it falls back to the document's own default.
  const cipherFor = (name) => filters.table.get(name)
    ?? filters.table.get(filters.streamName) ?? { aes: whole };

  const apply = (bytes, num, gen, name) => {
    const filter = cipherFor(name);
    const key = whole ? fileKey : objectKey(fileKey, num, gen, filter.aes);
    return filter.aes ? aesDecrypt(key, bytes) : rc4(key, bytes);
  };

  return {
    encryptMetadata: report.encryptMetadata,
    streamFilter: filters.streamName,
    stringFilter: filters.stringName,

    decryptStream(bytes, num, gen, name) {
      return apply(bytes, num, gen, name ?? filters.streamName);
    },

    decryptString(bytes, num, gen) {
      if (filters.stringName === null) return bytes;
      return apply(bytes, num, gen, filters.stringName);
    },

  };
}

/**
 * Algorithm 1: the file key with the object's number folded in.
 *
 * The five bytes are the object number little-endian and then the generation,
 * and AES adds four more spelling "sAlT" - which is in the specification
 * exactly like that, and is the kind of detail that makes a wrong
 * implementation decrypt every stream to noise while looking correct.
 */
function objectKey(fileKey, num, gen, aes) {
  const hash = md5();
  hash.update(fileKey);
  hash.update(new Uint8Array([
    num & 0xff, (num >> 8) & 0xff, (num >> 16) & 0xff, gen & 0xff, (gen >> 8) & 0xff,
  ]));
  if (aes) hash.update(new Uint8Array([0x73, 0x41, 0x6c, 0x54]));

  return hash.digest().slice(0, Math.min(fileKey.length + 5, 16));
}

/**
 * An AES-encrypted stream or string: the IV in front, then the ciphertext.
 *
 * The padding is PKCS#7 and is stripped only when it is well formed. A file
 * whose writer padded wrongly - and they exist - then arrives sixteen bytes
 * long rather than truncated, which a PDF parser survives and a missing tail
 * does not.
 */
function aesDecrypt(key, bytes) {
  if (bytes.length <= 16) return EMPTY;

  const body = bytes.subarray(16, 16 + Math.floor((bytes.length - 16) / 16) * 16);
  const out = cbcDecrypt(new Aes(key), bytes.subarray(0, 16), body);

  const last = out[out.length - 1];
  if (last >= 1 && last <= 16 && last <= out.length) {
    for (let i = out.length - last; i < out.length; i += 1) {
      if (out[i] !== last) return out;
    }
    return out.subarray(0, out.length - last);
  }

  return out;
}

/* ------------------------------------------------------------------ scraps */

/** The first half of the trailer's /ID, which is part of every pre-2017 key.
 *  A repaired file may have lost it; the empty string is what a writer that
 *  never wrote one leaves, and files like that exist and open. */
function firstId(doc) {
  const id = doc.resolve(doc.trailer.get('ID'));
  return Array.isArray(id) ? stringBytes(doc.resolve(id[0])) : EMPTY;
}

function stringBytes(value) {
  return value?.bytes instanceof Uint8Array ? value.bytes : EMPTY;
}

/**
 * The password as bytes, for R2 to R4.
 *
 * Latin-1 rather than UTF-8, because that is what those revisions specify and
 * what the writers of the day did. It matters for exactly one class of
 * document - a pre-2017 file whose password is not ASCII - and getting it
 * wrong there looks like a wrong password rather than an encoding problem.
 */
function latin1(text) {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) out[i] = text.charCodeAt(i) & 0xff;
  return out;
}

function utf8(text) {
  return new TextEncoder().encode(text);
}

function int32le(value) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setInt32(0, value | 0, true);
  return out;
}

/** The key with `value` exclusive-ored into every byte: the twenty derived
 *  keys of algorithm 5, which is the cheapest possible key schedule. */
function xorEach(key, value) {
  const out = new Uint8Array(key.length);
  for (let i = 0; i < key.length; i += 1) out[i] = key[i] ^ value;
  return out;
}

function join(...parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}

function same(a, b, length) {
  if (a.length < length || b.length < length) return false;
  let differences = 0;
  for (let i = 0; i < length; i += 1) differences |= a[i] ^ b[i];
  return differences === 0;
}

function clamp(value, low, high) {
  return Math.min(Math.max(Number.isFinite(value) ? value : low, low), high);
}
