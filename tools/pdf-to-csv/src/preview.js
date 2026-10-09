/** A bounded preview uses one-based row numbers, as the balance warnings do. */
export function previewWindow(total, row = 1, size = 25) {
  const count = Math.max(0, Math.floor(total));
  if (!count) return { start: 0, end: 0 };
  const target = Math.max(1, Math.min(count, Number.isFinite(row) ? Math.floor(row) : 1));
  const start = Math.floor((target - 1) / size) * size;
  return { start, end: Math.min(count, start + size) };
}
