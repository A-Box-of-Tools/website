/**
 * A text import only owns the editor until another import or an edit replaces it.
 *
 * File.text() cannot be aborted. Retiring its owner instead keeps late values,
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
        const texts = await Promise.all(Array.from(files, (file) => file.text()));
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
