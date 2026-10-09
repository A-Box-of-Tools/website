/** A chosen local wall time must survive the Date constructor unchanged. */
export function previewDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31
      || hour > 23 || minute > 59) return null;
  const date = new Date(0);
  // setFullYear also keeps years 1..99 out of the constructor's 1900 shortcut.
  date.setFullYear(year, month - 1, day);
  date.setHours(hour, minute, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1
    && date.getDate() === day && date.getHours() === hour
    && date.getMinutes() === minute ? date : null;
}

/** Native datetime-local inputs take local components, rather than UTC ISO. */
export function localDateValue(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${String(date.getFullYear()).padStart(4, '0')}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
