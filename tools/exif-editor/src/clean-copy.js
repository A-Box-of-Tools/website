/** A completed copy keeps its requested policy even after the editor changes. */
import { serializeExif } from './tiff.js';
import { hasMetadata } from './report.js';

/** Serialize the orientation now, before an asynchronous AVIF job can yield. */
export function prepareCleanCopy(item, { keepOrientation, keepIcc }) {
  const requested = Object.freeze({
    applies: item.kind !== 'avif',
    keepOrientation: Boolean(keepOrientation),
    keepIcc: Boolean(keepIcc),
  });
  const source = Object.freeze({ name: item.name, size: item.size, kind: item.kind });
  return { source, requested, metadata: hasMetadata(item),
    plan: requested.applies ? stripPlan(item, requested.keepOrientation, requested.keepIcc) : null };
}

/**
 * The plan for "remove everything".
 *
 * Every key is null, which is the plan language for "take it out". The only
 * thing that can put anything back is the orientation option, and it does so by
 * writing a fresh EXIF block holding that one tag - not by keeping the original
 * block and deleting the rest of it, which would leave whatever this tool had
 * failed to parse still sitting in the file.
 */
function stripPlan(item, keepOrientation, keepIcc) {
  const plan = { exif: null, xmp: null, iptc: null, comments: null, extras: null, text: null };
  if (!keepIcc) plan.icc = null;

  if (keepOrientation && item.exif?.ok) {
    const orientation = item.exif.groups.ifd0.find((e) => e.tag === 0x0112);
    // A photo that is already the right way up does not need the tag, and not
    // writing it is the difference between "almost empty" and empty.
    if (orientation && orientation.value !== 1) {
      plan.exif = serializeExif({
        littleEndian: item.exif.littleEndian,
        groups: { ifd0: [orientation], exif: [], gps: [], interop: [], ifd1: [] },
        thumbnail: null,
      });
    }
  }

  return plan;
}
