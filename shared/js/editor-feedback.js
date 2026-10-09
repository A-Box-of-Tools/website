/**
 * Feedback belongs to the text and mode that produced it. A live parser must
 * not move focus while someone types; the explicit action may move it only
 * while that same source is still on screen.
 */
export function sourceOffset(text, error, { normalized = false } = {}) {
  if (!normalized) return Math.max(0, Math.min(text.length, Number(error.index) || 0));
  let index = text.startsWith('\ufeff') ? 1 : 0;
  let line = 1;
  while (index < text.length && line < error.line) {
    const ch = text[index++];
    if (ch === '\r') { if (text[index] === '\n') index += 1; line += 1; }
    else if (ch === '\n') line += 1;
  }
  const start = index;
  while (index < text.length && !'\r\n'.includes(text[index])) index += 1;
  return Math.min(index, start + Math.max(0, error.column - 1));
}

/** Keep counts over the whole conversion while retaining only four examples. */
export function conversionDiagnostics() {
  const report = { comments: 0, names: 0, collisions: 0, examples: [] };
  return {
    report,
    record(entry) {
      if (entry.kind === 'yaml.comment') report.comments += 1;
      else if (entry.kind === 'xml.name') {
        report.names += 1;
        if (report.examples.length < 4) report.examples.push({ from: entry.from, to: entry.to });
      } else if (entry.kind === 'xml.collision') report.collisions += 1;
    },
  };
}

const shortKey = (key) => {
  const points = Array.from(String(key));
  return JSON.stringify(points.slice(0, 80).join('') + (points.length > 80 ? '…' : ''));
};

/** Caret-only pages may omit notes; conversion consumers keep their existing sink. */
export function editorFeedback({ input, go, notes, phrase, context }) {
  let target = null;
  const clear = () => {
    target = null;
    go.hidden = true;
    input.removeAttribute('aria-invalid');
    notes?.replaceChildren();
    if (notes) notes.hidden = true;
  };
  const line = (text) => {
    if (!notes) return;
    const item = document.createElement('li');
    item.textContent = text;
    notes.append(item);
    notes.hidden = false;
  };
  go.addEventListener('click', () => {
    if (!target || target.source !== input.value || target.context !== context()) { clear(); return; }
    input.focus();
    input.setSelectionRange(target.index, target.index);
    const height = Number.parseFloat(getComputedStyle(input).lineHeight) || 20;
    input.scrollTop = Math.max(0, (target.line - 1) * height - input.clientHeight / 2);
  });
  return {
    clear,
    error(error, { conversion = false } = {}) {
      if (error?.name !== 'ParseError') return;
      target = { source: input.value, context: context(), line: error.line,
        index: sourceOffset(input.value, error, { normalized: error.reason.startsWith('yaml.') }) };
      input.setAttribute('aria-invalid', 'true');
      go.hidden = false;
      if (conversion && ['yaml.anchors', 'yaml.aliases', 'yaml.tags', 'yaml.documents', 'yaml.complexkey'].includes(error.reason)) {
        line(phrase('convert.refused'));
      }
    },
    conversion(report, { yaml = false } = {}) {
      if (yaml) line(phrase('convert.comments', { n: report.comments.toLocaleString() }));
      if (report.names) line(phrase('convert.names', { n: report.names.toLocaleString() }));
      if (report.collisions) line(phrase('convert.collisions', { n: report.collisions.toLocaleString() }));
      for (const example of report.examples) {
        line(phrase('convert.name.example', { from: shortKey(example.from), to: shortKey(example.to) }));
      }
    },
  };
}
