/**
 * Turning parsed metadata into sentences.
 *
 * Two jobs live here. One is formatting single values: a shutter speed is
 * stored as 1/200 and an orientation as the number 6, and neither is any use on
 * screen in that form.
 *
 * The other is the findings list, which is the part of this page that matters.
 * A table of ninety tags is not an answer to "is there anything in this photo I
 * would not want to post". The findings are that answer: the handful of things
 * in the file that say something about a person, a place or a device, each with
 * one line on why it is worth knowing about.
 */

import { describeTag, GROUP_LABELS } from './tags.js';
import { GROUP_ORDER } from './tiff.js';

/** Show at most this many numbers before saying how many more there are. */
const MAX_LIST = 8;

/** Format one entry's value for display. */
export function formatValue(group, entry) {
  const spec = describeTag(group, entry.tag);
  const { value } = entry;

  if (value === null || value === undefined) {
    return `${entry.raw.length} bytes of data`;
  }

  if (typeof value === 'string') return value.length ? value : '(empty)';

  if (spec.values && typeof value === 'number') {
    return spec.values[value] ?? `Unrecognised value (${value})`;
  }

  if (spec.format) {
    const formatted = spec.format(value);
    if (formatted) return formatted;
  }

  // A rational reads better as the fraction the camera actually wrote, as long
  // as it is not a whole number dressed up as one.
  if (Array.isArray(entry.pairs) && typeof entry.pairs[0] === 'number') {
    const [num, den] = entry.pairs;
    if (den !== 1 && den !== 0) return `${num}/${den}${spec.unit ? ` ${spec.unit}` : ''}`;
  }

  if (Array.isArray(value)) {
    const shown = value.slice(0, MAX_LIST).map(short).join(', ');
    return value.length > MAX_LIST ? `${shown}, and ${value.length - MAX_LIST} more` : shown;
  }

  return spec.unit ? `${short(value)} ${spec.unit}` : short(value);
}

const short = (n) => (typeof n === 'number' && !Number.isInteger(n) ? Number(n.toFixed(4)).toString() : String(n));

/**
 * Read the GPS directory as a position.
 *
 * EXIF stores a coordinate as three rationals - degrees, minutes, seconds - with
 * the hemisphere in a separate tag, so a file can hold a latitude of 51 with no
 * indication of which side of the equator it means until you read both.
 */
export function readPosition(gps) {
  if (!gps?.length) return null;
  const find = (tag) => gps.find((e) => e.tag === tag)?.value;

  const lat = toDegrees(find(0x0002), find(0x0001));
  const lon = toDegrees(find(0x0004), find(0x0003));
  if (lat === null || lon === null) return null;

  const altitude = find(0x0006);
  const belowSea = find(0x0005) === 1;

  return {
    lat,
    lon,
    text: `${Math.abs(lat).toFixed(6)}${DEG} ${lat < 0 ? 'S' : 'N'}, ${Math.abs(lon).toFixed(6)}${DEG} ${lon < 0 ? 'W' : 'E'}`,
    altitude: typeof altitude === 'number' ? `${Math.round(altitude)} m ${belowSea ? 'below' : 'above'} sea level` : null,
  };
}

const DEG = '°';

function toDegrees(parts, ref) {
  if (!Array.isArray(parts) || parts.length < 3) return null;
  const [d, m, s] = parts;
  if (![d, m, s].every((n) => typeof n === 'number' && isFinite(n))) return null;
  const value = d + m / 60 + s / 3600;
  const sign = typeof ref === 'string' && /^[SW]/i.test(ref.trim()) ? -1 : 1;
  return value * sign;
}

/** Pull one tag's decoded value out of a group, or undefined. */
const tagValue = (group, tag) => group?.find((e) => e.tag === tag)?.value;

const asText = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

/**
 * The list of things in this file worth knowing about, worst first.
 *
 * Every finding names what was found and says in one line why it matters. A
 * finding that cannot say the second part does not belong here - it belongs in
 * the full table further down the page, where nobody has been promised that
 * everything listed is important.
 *
 * `t` resolves a phrase key against the page, which is where the sentences
 * live: this module is copied byte for byte into fifteen languages. It is the
 * same resolver report() takes, and for the same reason.
 *
 * @returns {{level: 'high'|'medium'|'low', title: string, detail: string}[]}
 */
export function buildFindings(item, t) {
  const out = [];
  const groups = item.exif?.ok ? item.exif.groups : null;
  const meta = item.meta;

  if (!item.exifUnreadable && meta.exif && !countTags(item)) {
    out.push({
      level: 'low',
      title: t('find.exifempty.title'),
      detail: t('find.exifempty.detail', { size: bytes(meta.exif.length) }),
    });
  }

  if (item.exifUnreadable) {
    out.push({
      level: 'high',
      title: t('find.exifbad.title'),
      detail: t('find.exifbad.detail', { reason: t(item.exifError) }),
    });
  }

  const position = readPosition(groups?.gps);
  if (position) {
    out.push({
      level: 'high',
      title: t('find.gps.title'),
      detail: position.altitude
        ? t('find.gps.detailalt', { position: position.text, altitude: position.altitude })
        : t('find.gps.detail', { position: position.text }),
    });
  } else if (groups?.gps?.length) {
    out.push({
      level: 'high',
      title: t('find.gpspart.title'),
      detail: t(groups.gps.length === 1 ? 'find.gpspart.one' : 'find.gpspart.many',
                { count: groups.gps.length }),
    });
  }

  const taken = asText(tagValue(groups?.exif, 0x9003)) ?? asText(tagValue(groups?.ifd0, 0x0132));
  if (taken) {
    out.push({
      level: 'medium',
      title: t('find.taken.title'),
      detail: t('find.taken.detail', { when: taken }),
    });
  }

  const make = asText(tagValue(groups?.ifd0, 0x010f));
  const model = asText(tagValue(groups?.ifd0, 0x0110));
  if (make || model) {
    // Most cameras write the manufacturer into the model as well, so joining
    // the two blindly produces "Canon Canon EOS R6".
    const device = make && model && !model.toLowerCase().startsWith(make.toLowerCase())
      ? `${make} ${model}`
      : (model ?? make);
    out.push({
      level: 'medium',
      title: t('find.device.title'),
      detail: t('find.device.detail', { device }),
    });
  }

  const identifiers = [
    [groups?.exif, 0xa431, 'find.id.cameraserial'],
    [groups?.exif, 0xa435, 'find.id.lensserial'],
    [groups?.exif, 0xa430, 'find.id.owner'],
    [groups?.exif, 0xa420, 'find.id.uniqueid'],
    [groups?.ifd0, 0x013b, 'find.id.artist'],
    [groups?.ifd0, 0x9c9d, 'find.id.author'],
    [groups?.ifd0, 0x8298, 'find.id.copyright'],
  ]
    .map(([group, tag, key]) => ({ label: t(key), value: asText(tagValue(group, tag)) }))
    .filter((x) => x.value);

  if (identifiers.length) {
    out.push({
      level: 'high',
      title: t('find.identity.title'),
      detail: t('find.identity.detail', {
        found: identifiers.map((x) => `${x.label}: ${x.value}`).join('. '),
      }),
    });
  }

  const software = asText(tagValue(groups?.ifd0, 0x0131));
  if (software) {
    out.push({
      level: 'medium',
      title: t('find.software.title'),
      detail: t('find.software.detail', { software }),
    });
  }

  const makerNote = groups?.exif?.find((e) => e.tag === 0x927c);
  if (makerNote) {
    out.push({
      level: 'high',
      title: t('find.makernote.title'),
      detail: t('find.makernote.detail', { size: bytes(makerNote.raw.length) }),
    });
  }

  if (item.exif?.thumbnail?.length) {
    out.push({
      level: 'medium',
      title: t('find.thumbnail.title'),
      detail: t('find.thumbnail.detail', { size: bytes(item.exif.thumbnail.length) }),
    });
  }

  if (meta.xmp) {
    out.push({
      level: 'medium',
      title: t('find.xmp.title'),
      detail: t('find.xmp.detail', { size: bytes(meta.xmp.length) }),
    });
  }

  if (meta.iptc) {
    out.push({
      level: 'high',
      title: t('find.iptc.title'),
      detail: t('find.iptc.detail', { size: bytes(meta.iptc.length) }),
    });
  }

  for (const comment of meta.comments) {
    if (comment.trim()) {
      out.push({
        level: 'medium',
        title: t('find.comment.title'),
        detail: t('find.comment.detail', { comment: comment.trim().slice(0, 300) }),
      });
    }
  }

  for (const text of meta.text) {
    if (text.value?.trim()) {
      out.push({
        level: /author|artist|creat|copyright|owner|comment|source|url/i.test(text.keyword) ? 'high' : 'low',
        title: t('find.text.title', { keyword: text.keyword }),
        detail: text.value.trim().slice(0, 300),
      });
    }
  }

  if (meta.extras.length) {
    out.push({
      level: 'low',
      title: t('find.unknown.title'),
      detail: t('find.unknown.detail', {
        blocks: meta.extras.map((x) => `${x.label} (${bytes(x.size)})`).join(', '),
      }),
    });
  }

  return out;
}

/**
 * Sizes, in the units a person would say them in.
 *
 * The unit is the symbol rather than the word, because every one of these ends
 * up inside a sentence that is translated around it - a German finding reading
 * "512 B von EXIF" is right, and "512 bytes von EXIF" is half English.
 */
export function bytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** How many EXIF tags there are, across every directory. */
export function countTags(item) {
  if (!item.exif?.ok) return 0;
  return GROUP_ORDER.reduce((n, group) => n + (item.exif.groups[group]?.length ?? 0), 0);
}

/**
 * Roughly how much of the file is metadata.
 *
 * Rough on purpose: the wrappers, the padding and the segment headers are a few
 * dozen bytes that would make this look more precise than it is. What it is for
 * is the sentence "most of this file is the picture, and this much is not".
 */
export function metadataSize(item) {
  const meta = item.meta;
  let total = meta.exif?.length ?? 0;
  total += meta.xmp?.length ?? 0;
  total += meta.iptc?.length ?? 0;
  total += meta.icc?.length ?? 0;
  for (const c of meta.comments) total += c.length;
  for (const t of meta.text) total += (t.keyword?.length ?? 0) + (t.value?.length ?? 0);
  for (const e of meta.extras) total += e.size;
  return total;
}

/** The short labels shown on a file's row in the list. */
export function badges(item) {
  const out = [];
  if (!item.ok) return [{ label: 'Cannot read', level: 'high' }];

  const groups = item.exif?.ok ? item.exif.groups : null;
  const tags = countTags(item);

  if (groups?.gps?.length) out.push({ label: 'GPS', level: 'high' });
  if (item.exifUnreadable) out.push({ label: 'EXIF unreadable', level: 'high' });
  else if (tags) out.push({ label: `EXIF ${tags}`, level: 'medium' });
  else if (item.meta.exif) out.push({ label: 'EXIF empty', level: 'low' });
  if (item.exif?.thumbnail?.length) out.push({ label: 'Thumbnail', level: 'medium' });
  if (item.meta.xmp) out.push({ label: 'XMP', level: 'medium' });
  if (item.meta.iptc) out.push({ label: 'IPTC', level: 'high' });
  if (item.meta.comments.length) out.push({ label: 'Comment', level: 'medium' });
  if (item.meta.text.length) out.push({ label: `Text ${item.meta.text.length}`, level: 'medium' });
  if (item.meta.icc) out.push({ label: 'ICC', level: 'low' });
  if (item.meta.extras.length) out.push({ label: 'Unknown blocks', level: 'low' });

  if (!out.length) out.push({ label: 'Nothing found', level: 'clean' });
  return out;
}

/** True when there is something in this file that removing would change. */
export function hasMetadata(item) {
  if (!item.ok) return false;
  // meta.exif rather than the tag count: a block that parsed to nothing, or did
  // not parse at all, is still bytes in the file that removing would take out.
  return countTags(item) > 0
    || Boolean(item.meta.exif)
    || Boolean(item.exif?.thumbnail?.length)
    || Boolean(item.meta.xmp) || Boolean(item.meta.iptc) || Boolean(item.meta.icc)
    || item.meta.comments.length > 0 || item.meta.text.length > 0 || item.meta.extras.length > 0;
}

/** The tag tables, in the order they are shown. Empty groups are left out. */
export function tagGroups(item) {
  if (!item.exif?.ok) return [];
  return GROUP_ORDER
    .filter((group) => item.exif.groups[group]?.length)
    .map((group) => ({
      id: group,
      ...GROUP_LABELS[group],
      entries: [...item.exif.groups[group]].sort((a, b) => a.tag - b.tag),
    }));
}
