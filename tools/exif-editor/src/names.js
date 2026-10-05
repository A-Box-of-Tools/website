/** Download names belong to outputs; the original list keeps its source names. */
import { outputType } from './container.js';

export function outName(item, suffix) {
  const { ext } = outputType(item.kind);
  const base = item.name.replace(/\.[^.]+$/, '') || 'photo';
  return `${base}-${suffix}.${ext}`;
}

/**
 * AVIF and PNG sources can become the same PNG name. A result gets its name
 * once so its download and archive entry agree, including on file systems that
 * treat letter case or equivalent Unicode spellings as the same name.
 */
export function cleanNames(items) {
  const used = new Set();
  const key = name => name.normalize('NFC').toLowerCase();
  return items.map(item => {
    const original = outName(item, 'clean');
    const dot = original.lastIndexOf('.');
    const stem = original.slice(0, dot);
    const extension = original.slice(dot);
    let name = original;
    let index = 1;
    while (used.has(key(name))) name = `${stem}-${++index}${extension}`;
    used.add(key(name));
    return name;
  });
}
