/**
 * Which names a synced file may carry. A folder kept in step between Windows,
 * macOS and Linux has to live by the strictest of the three, or a name one
 * side allows becomes a file the other cannot write - or, worse, a name that
 * means a different file there.
 */

export const MAX_NAME = 255;
export const MAX_PATH = 1024;
export const MAX_DEPTH = 32;

// Windows reserves these device names with any extension after them:
// NUL.txt and NUL.tar.gz are both the null device.
const RESERVED = /^(?:con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\..*)?$/i;
// Control characters, both separators, and what Windows refuses in a name.
const REFUSED = /[\x00-\x1f\x7f"*:<>?\\|/]/;
// The litter operating systems leave in every folder. Nobody means to sync
// it, and copying a Windows thumbnail cache onto a Mac only makes more.
const SYSTEM_FILES = new Set(['.ds_store', 'thumbs.db', 'ehthumbs.db', 'ehthumbs_vista.db', 'desktop.ini', '.localized', '.directory']);
const SYSTEM_FOLDERS = new Set(['$recycle.bin', 'system volume information', '.trashes', '.trash', '.spotlight-v100',
  '.fseventsd', '.temporaryitems', '.documentrevisions-v100', '@eadir']);
// Chromium writes into a sibling .crswap and moves it over the file when the
// write completes, so one found while walking is a write caught half-way.
// Office and LibreOffice lock files say a document is open somewhere; copied
// to another computer they say something false.
const TEMPORARY = /\.crswap$|^~\$|^\.~lock\..*#$/i;

export function portableName(name) {
  return typeof name === 'string' && name.length > 0 && name.length <= MAX_NAME
    && name !== '.' && name !== '..' && !REFUSED.test(name)
    // Windows drops a trailing dot or space, so "notes." would arrive as "notes".
    && !/[. ]$/.test(name) && !RESERVED.test(name);
}

/** Why a name met while walking a folder is left out, or null to keep it. */
export function leftOut(name, folder = false) {
  const lower = name.toLowerCase();
  if ((folder ? SYSTEM_FOLDERS : SYSTEM_FILES).has(lower)) return 'system';
  // AppleDouble files hold a Mac file's metadata on a disk that cannot.
  if (!folder && lower.startsWith('._')) return 'system';
  if (!folder && TEMPORARY.test(name)) return 'temporary';
  if (!portableName(name.normalize('NFC'))) return 'name';
  return null;
}

export function joinPath(parent, name) {
  return parent ? `${parent}/${name}` : name;
}

/**
 * A relative path as both sides write it: NFC, forward slashes, every part a
 * portable name. macOS can hand the same name over decomposed; composing it
 * here is what lets one "café" match the other.
 */
export function validPath(path) {
  if (typeof path !== 'string' || path.length === 0 || path.length > MAX_PATH || path !== path.normalize('NFC')) return false;
  const names = path.split('/');
  return names.length <= MAX_DEPTH && names.every(portableName);
}

/** Windows and macOS (by default) treat names differing only in case as one. */
export function foldPath(path) {
  return path.toLowerCase();
}
