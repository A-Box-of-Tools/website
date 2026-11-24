/**
 * The folder on this device: reading what is in it, and writing what arrives.
 *
 * Three kinds of folder, by what the browser offers:
 *   handle  showDirectoryPicker, which can read again later and, with the
 *           visitor's permission, write. Chromium on a computer.
 *   files   an <input webkitdirectory>, a snapshot that can only be read.
 *           Firefox and Safari. Received files go into a ZIP instead.
 *   none    no folder at all; this device can only receive, into a ZIP.
 */
import { leftOut, joinPath, MAX_DEPTH, MAX_PATH } from './paths.js';
import { MAX_FILES } from './listing.js';

// A folder with ten thousand skipped files does not need ten thousand rows
// saying so; the count is kept whole and the list is a sample.
const MAX_SKIPPED_SHOWN = 200;
// getFile() is a round trip to the browser process per file. A handful at a
// time keeps a large folder from taking a round trip's worth per file.
const BATCH = 32;
// What a ZIP can hold in memory before the browser is likely to give up on a
// phone. A folder bigger than that needs a browser that can write folders.
export const ZIP_LIMIT = 512 * 1024 * 1024;
const ZIP_FILES = 20000;

export function folderSupport(scope = globalThis) {
  const directory = typeof scope.showDirectoryPicker === 'function';
  const input = typeof scope.HTMLInputElement === 'function' && 'webkitdirectory' in scope.HTMLInputElement.prototype;
  return { directory, input };
}

function collector() {
  const entries = new Map();
  const skipped = [];
  let skippedCount = 0, bytes = 0;
  return {
    entries,
    skip(path, reason) {
      skippedCount += 1;
      if (skipped.length < MAX_SKIPPED_SHOWN) skipped.push({ path, reason });
    },
    add(entry) {
      if (entries.has(entry.key)) { this.skip(entry.key, 'duplicate'); return; }
      if (entries.size >= MAX_FILES) throw new Error('folder.too-many');
      entries.set(entry.key, entry);
      bytes += entry.size;
    },
    result(name) { return { name, entries, skipped, skippedCount, bytes }; },
  };
}

/** Walk a folder the visitor picked. Only names, sizes and dates are read. */
export async function readDirectory(root, { progress = () => {}, current = () => true } = {}) {
  const found = collector();
  async function walk(directory, parent, depth) {
    const files = [];
    for await (const child of directory.values()) {
      if (!current()) throw new Error('folder.cancelled');
      const name = child.name.normalize('NFC');
      const path = joinPath(parent, name);
      const folder = child.kind === 'directory';
      const reason = leftOut(child.name, folder);
      if (reason) found.skip(path, reason);
      else if (depth + 1 >= MAX_DEPTH) found.skip(path, 'deep');
      else if (folder) await walk(child, path, depth + 1);
      else if (path.length > MAX_PATH) found.skip(path, 'long');
      else files.push({ child, path });
    }
    for (let at = 0; at < files.length; at += BATCH) {
      const batch = files.slice(at, at + BATCH);
      const read = await Promise.all(batch.map(({ child }) => child.getFile().catch(() => null)));
      if (!current()) throw new Error('folder.cancelled');
      batch.forEach(({ child, path }, index) => {
        const file = read[index];
        if (!file) found.skip(path, 'unreadable');
        else found.add({ key: path, path, size: file.size, mtime: file.lastModified, handle: child });
      });
      progress(found.entries.size);
    }
  }
  await walk(root, '', 0);
  return found.result(root.name);
}

/** The snapshot an <input webkitdirectory> hands over. */
export function readFileList(list) {
  const found = collector();
  let name = '';
  for (const file of list) {
    const names = (file.webkitRelativePath || file.name).split('/').filter(Boolean);
    // The first part is the chosen folder itself, which the other side names its own way.
    if (names.length > 1) name ||= names.shift();
    const path = names.map((part) => part.normalize('NFC')).join('/');
    let reason = null;
    names.forEach((part, index) => { reason ??= leftOut(part, index < names.length - 1); });
    if (reason) found.skip(path, reason);
    else if (names.length >= MAX_DEPTH) found.skip(path, 'deep');
    else if (path.length > MAX_PATH) found.skip(path, 'long');
    else found.add({ key: path, path, size: file.size, mtime: file.lastModified, file });
  }
  return found.result(name);
}

export function emptyFolder() {
  return { name: '', entries: new Map(), skipped: [], skippedCount: 0, bytes: 0 };
}

/** The file behind an entry, read fresh so a change since the listing shows in its size or date. */
export function fileOf(entry) {
  return entry.handle ? entry.handle.getFile() : Promise.resolve(entry.file);
}

/**
 * Writes into a picked folder. createWritable() writes to a sibling file and
 * moves it over the original when closed, so an interrupted transfer leaves
 * the old file exactly as it was. What this adds is the other half: a file or
 * folder that did not exist before an aborted write is removed again, so a
 * cancelled sync leaves no empty files behind.
 */
export function folderWriter(root) {
  return {
    async open(path) {
      const names = path.split('/');
      const made = [];
      let directory = root;
      try {
        for (const name of names.slice(0, -1)) {
          let next;
          try { next = await directory.getDirectoryHandle(name); }
          catch (error) {
            if (error?.name !== 'NotFoundError') throw error;
            next = await directory.getDirectoryHandle(name, { create: true });
            made.push([directory, name]);
          }
          directory = next;
        }
        const leaf = names.at(-1);
        let handle, created = false;
        try { handle = await directory.getFileHandle(leaf); }
        catch (error) {
          if (error?.name !== 'NotFoundError') throw error;
          handle = await directory.getFileHandle(leaf, { create: true });
          created = true;
        }
        const folder = directory;
        const undo = async () => {
          if (created) { try { await folder.removeEntry(leaf); } catch {} }
          await removeMade(made);
        };
        let stream;
        try { stream = await handle.createWritable({ keepExistingData: false }); }
        catch (error) { await undo(); throw error; }
        return {
          write: (chunk) => stream.write(chunk),
          async close() {
            await stream.close();
            const file = await handle.getFile();
            return { size: file.size, mtime: file.lastModified };
          },
          async abort() {
            try { await stream.abort(); } catch {}
            await undo();
          },
        };
      } catch (error) {
        await removeMade(made);
        throw error;
      }
    },
  };
}

// Innermost first. Without `recursive` a folder something else has written
// into since refuses to go, which is the answer wanted.
async function removeMade(made) {
  for (const [parent, name] of [...made].reverse()) {
    try { await parent.removeEntry(name); } catch {}
  }
}

/** Received files held for one ZIP download, where a folder cannot be written. */
export function zipCollector(limit = ZIP_LIMIT) {
  const files = [];
  let reserved = 0;
  return {
    async open(path, size) {
      if (reserved + size > limit || files.length >= ZIP_FILES) throw new Error('zip.limit');
      reserved += size;
      let parts = [];
      return {
        write(chunk) { parts.push(new Uint8Array(chunk)); },
        close() {
          const data = new Uint8Array(size);
          let at = 0;
          for (const part of parts) { data.set(part, at); at += part.length; }
          parts = [];
          files.push({ name: path, data });
          return { size, mtime: null };
        },
        abort() { reserved -= size; parts = []; },
      };
    },
    files: () => files,
    bytes: () => reserved,
    clear() { files.length = 0; reserved = 0; },
  };
}
