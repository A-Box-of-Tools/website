/**
 * Running the job: assemble, write, and then open what was written.
 *
 * The last step is the one worth arguing for. Everything before it is this
 * tool's own code claiming success - the page tree was built, the objects were
 * copied, the bytes came out. None of that is evidence. So every finished file
 * is handed straight back to `reader.js`, parsed as though a stranger had sent
 * it, and its pages counted by walking the tree rather than reading /Count. If
 * that number is not the number asked for, the run is reported as failed and
 * no download is offered, because a PDF that is subtly wrong is worse than one
 * that obviously is: nobody checks page 40 of a file that opened fine.
 *
 * The compressor makes the same check for the same reason. It is cheap - one
 * more parse of a file that is already in memory - and it is the only line on
 * the results that is not this tool marking its own homework.
 */

import { assemble } from './assemble.js';
import { archiveName, outputNames, splitInto } from './plan.js';
import { PdfDocument } from './reader.js';
import { makeZip } from './zip.js';
import { writeDocument } from './writer.js';

/**
 * @param {any[]} entries the pages, in output order
 * @param {{split: object, stem: string, suffix: string, bookmarks: boolean}} how
 * @param {{onProgress?: (done: number, total: number, what: string) => void,
 *          signal?: AbortSignal}} hooks
 */
export async function produce(entries, how, { onProgress, signal } = {}) {
  const parts = splitInto(entries, how.split);
  const names = outputNames(parts, {
    stem: how.stem, mode: how.split?.mode ?? 'single', suffix: how.suffix,
  });

  const files = [];
  const notes = new Set();
  let failed = '';

  for (let at = 0; at < parts.length; at += 1) {
    if (signal?.aborted) throw new DOMException('Cancelled', 'AbortError');
    onProgress?.(at, parts.length, names[at]);

    const part = parts[at];
    const built = assemble(part.entries, { bookmarks: how.bookmarks });
    for (const note of built.notes) notes.add(note);

    // The bytes rather than the Blob the writer hands back: they are needed to
    // check the file, and needed again if it goes into an archive. One copy in
    // memory, made into a Blob at the moment somebody clicks Download.
    const written = await writeDocument(built.build, { signal });
    const data = new Uint8Array(await written.arrayBuffer());

    const check = await verify(data, part.entries.length);
    if (!check.ok) failed = check.text;

    files.push({
      name: names[at],
      data,
      size: data.length,
      pages: part.entries.length,
      from: part.from,
      to: part.to,
      fields: built.fields,
      links: built.links,
      check,
    });
  }

  onProgress?.(parts.length, parts.length, '');

  // One file is a download. Fifty is fifty save prompts, which is where people
  // give up and go back to the site that wanted the upload, so they go in an
  // archive - stored, not compressed, because a PDF is already compressed and
  // deflating one again buys a percent for a lot of work.
  const archive = files.length > 1
    ? {
      name: archiveName(how.stem),
      blob: makeZip(files.map((file) => ({ name: file.name, data: file.data }))),
    }
    : null;

  return {
    files,
    archive,
    notes: [...notes],
    ok: !failed,
    problem: failed,
  };
}

/**
 * Open the finished file and count what is in it.
 *
 * @param {Uint8Array} bytes
 * @param {number} expected
 */
async function verify(bytes, expected) {
  try {
    const doc = await PdfDocument.open(bytes);
    const pages = doc.countPages();
    if (pages !== expected) {
      return {
        ok: false,
        text: `the finished file opens with ${pages} page${pages === 1 ? '' : 's'} `
          + `where ${expected} ${expected === 1 ? 'was' : 'were'} asked for`,
      };
    }
    return {
      ok: true,
      text: `opened again here and counted ${pages} page${pages === 1 ? '' : 's'}`,
    };
  } catch (error) {
    return { ok: false, text: `the finished file would not open again (${error.message})` };
  }
}
