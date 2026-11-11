import { phrase } from './phrases.js';

/**
 * The text a file holds, or a refusal.
 *
 * `File.text()` decodes UTF-8 and replaces whatever is not, so two different
 * files in another encoding can come back as one string: "Müller" and "Möller"
 * saved as Windows-1252 lose the same letter to the same replacement character,
 * and Text Diff reported those two files as identical. A byte order mark is
 * definitive, so UTF-16 is read as what it says it is. Nothing else can be told
 * apart from the bytes alone, and a wrong guess is the same damage said more
 * confidently, so anything that is not valid UTF-8 is refused with a sentence the
 * visitor can act on.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
export async function readText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf-16le'
    : bytes[0] === 0xfe && bytes[1] === 0xff ? 'utf-16be' : 'utf-8';
  try {
    return new TextDecoder(encoding, { fatal: true }).decode(bytes);
  } catch {
    throw new Error(phrase('text.encoding'));
  }
}

/**
 * A text import only owns the editor until another import or an edit replaces it.
 *
 * Reading a file cannot be aborted. Retiring its owner instead keeps late values,
 * errors and cleanup from changing the page after the visitor has moved on.
 */
export function textImport({ busy, done }) {
  let pending = null;

  return {
    /**
     * Applying text and reporting errors happen while this owner is current;
     * returning text for a caller to apply after await would leave another
     * promise continuation in which a newer edit could overtake it.
     *
     * @returns {Promise<string[] | null>} Null means retired or a reported failure.
     */
    async read(files, { apply = () => {}, failed } = {}) {
      const owner = {};
      pending = owner;
      busy(files.length);
      try {
        const texts = await Promise.all(Array.from(files, (file) => readText(file)));
        if (pending !== owner) return null;
        apply(texts);
        return texts;
      } catch (error) {
        if (pending === owner) {
          if (!failed) throw error;
          failed(error);
        }
        return null;
      } finally {
        if (pending === owner) {
          pending = null;
          done();
        }
      }
    },

    invalidate() {
      if (pending === null) return;
      pending = null;
      done();
    },
  };
}
