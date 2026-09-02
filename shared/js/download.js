/**
 * Handing a result to the browser as a file, with no server to fetch it from.
 *
 * GENERATED INTO EACH TOOL. This file lives at shared/js/download.js and the
 * build copies it to <tool>/src/shared/download.js for the tools that ask for
 * it with `js_parts = ["download", ...]`. It imports nothing.
 *
 * Two shapes, because tools want two things:
 *
 *   saveBlob(blob, name)   a download that starts now: the ZIP a button just
 *                          built, the PNG a chart was drawn into.
 *   downloadLink(link)     a link on the page that points at the latest
 *                          result until there is a newer one or none; the
 *                          formatter pages move it on every keystroke.
 *
 * Both hold an object URL, and an object URL is a reference the page owns
 * until it says otherwise: the blob behind it cannot be collected until it is
 * revoked. So the link revokes the last one before it points at the next, and
 * the one-shot download revokes late - revoking at once can cancel a download
 * that has not started yet in some browsers, and a minute is long after the
 * browser has opened the blob for itself.
 */

/**
 * Start a download of `blob` under `name`. Nothing leaves the machine.
 *
 * @param {Blob} blob
 * @param {string} name  what the file will be called
 */
export function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.rel = 'noopener';
  // In the document while it is clicked: some browsers have ignored a
  // synthetic click on a link that was not.
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * A download link that follows the result.
 *
 * @param {HTMLAnchorElement} link  the link on the page, hidden until there
 *   is something to offer
 * @param {string} [type]  the MIME type a string is wrapped in; a Blob is
 *   offered as it is
 * @returns {{offer: (content: string|Blob, name: string) => void, clear: () => void}}
 */
export function downloadLink(link, type = 'text/plain;charset=utf-8') {
  let url = null;
  const clear = () => {
    if (url) URL.revokeObjectURL(url);
    url = null;
    link.hidden = true;
  };
  return {
    /** Point the link at `content`, or hide it when there is nothing. */
    offer(content, name) {
      clear();
      if (content === '') return;
      url = URL.createObjectURL(
        content instanceof Blob ? content : new Blob([content], { type }));
      link.href = url;
      link.download = name;
      link.hidden = false;
    },
    clear,
  };
}
