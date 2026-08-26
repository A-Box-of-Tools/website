/**
 * A deliberately small markdown renderer.
 *
 * Written here rather than vendored because the Content-Security-Policy
 * allows no libraries - and because the reader's page runs this on text from
 * the other side of the wire, which makes the safety argument the whole
 * design. Every character of input is entity-escaped before any tag is
 * emitted, only the fixed set of tags below can be produced, and links allow
 * only http, https and mailto, so shared text cannot become script no matter
 * who wrote it.
 *
 * The dialect is the everyday subset: #-###### headings, **bold**, *italic*,
 * `code`, fenced blocks, - and 1. lists, > quotes, --- rules, [text](url)
 * links. Line breaks inside a paragraph are kept as typed - pasted notes are
 * not reflowed.
 */

export const escapeHtml = (s) => s
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inline(s) {
  let out = '';
  for (const part of s.split(/(`[^`]+`)/)) {
    if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
      out += `<code>${escapeHtml(part.slice(1, -1))}</code>`;
      continue;
    }
    let t = escapeHtml(part);
    // The href is already entity-escaped, so a quote cannot break out of the
    // attribute; the scheme check is what keeps javascript: as plain text.
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (whole, text, href) => (
      /^(https?:\/\/|mailto:)/i.test(href)
        ? `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
        : whole));
    t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    t = t.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    out += t;
  }
  return out;
}

/** @param {string} src @returns {string} safe HTML */
export function renderMarkdown(src) {
  const lines = src.split('\n');
  let html = '';
  for (let i = 0; i < lines.length;) {
    const line = lines[i];
    if (/^```/.test(line)) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^```/.test(lines[i])) { body.push(lines[i]); i += 1; }
      i += 1;
      html += `<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`;
      continue;
    }
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const n = heading[1].length;
      html += `<h${n}>${inline(heading[2])}</h${n}>`;
      i += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,})\s*$/.test(line)) { html += '<hr>'; i += 1; continue; }
    if (/^>/.test(line)) {
      const body = [];
      while (i < lines.length && /^>/.test(lines[i])) { body.push(lines[i].replace(/^>\s?/, '')); i += 1; }
      html += `<blockquote>${body.map(inline).join('<br>')}</blockquote>`;
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^[-*]\s+/, '')); i += 1; }
      html += `<ul>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`;
      continue;
    }
    if (/^\d+[.)]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+[.)]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\d+[.)]\s+/, '')); i += 1; }
      html += `<ol>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`;
      continue;
    }
    if (line.trim() === '') { i += 1; continue; }
    const body = [];
    while (i < lines.length && lines[i].trim() !== ''
           && !/^(#{1,6}\s|```|>|[-*]\s|\d+[.)]\s|-{3,}\s*$|\*{3,}\s*$)/.test(lines[i])) {
      body.push(lines[i]);
      i += 1;
    }
    html += `<p>${body.map(inline).join('<br>')}</p>`;
  }
  return html;
}
