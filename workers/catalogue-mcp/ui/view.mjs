import { App, applyDocumentTheme, applyHostStyleVariables } from '@modelcontextprotocol/ext-apps';
import { matchingTools, validQuery, validateCatalogue } from '../src/search.mjs';
import * as z from 'zod/v4';

// The host's resource policy permits this bundle but forbids generated code.
z.config({ jitless: true });

const catalogue = validateCatalogue(JSON.parse(document.getElementById('catalogue-data').textContent));
const query = document.getElementById('query');
const language = document.getElementById('language');
const results = document.getElementById('results');
const row = document.getElementById('tool-row');
const phrases = document.getElementById('phrases').dataset;
const approved = new Set(Object.values(catalogue.locales).flatMap(section => section.tools.map(tool => tool.url)));
let connected = false;
let edited = false;
let visible = 20;

const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
for (const locale of Object.keys(catalogue.locales)) {
  const option = document.createElement('option');
  option.value = locale;
  option.textContent = displayNames.of(locale);
  language.append(option);
}
const app = new App({ name: 'abox.tools catalogue', version: catalogue.build.version }, {}, { autoResize: true });

function render() {
  results.lang = catalogue.locales[language.value].language;
  const valid = validQuery(query.value);
  document.getElementById('invalid-query').hidden = valid;
  const found = valid ? matchingTools(catalogue, query.value, language.value) : [];
  results.replaceChildren();
  for (const tool of found.slice(0, visible)) {
    const item = row.content.cloneNode(true);
    item.querySelector('h2').textContent = tool.name;
    item.querySelector('.description').textContent = tool.description;
    item.querySelector('.address').textContent = tool.url;
    const button = item.querySelector('button');
    button.disabled = !connected;
    button.addEventListener('click', async () => {
      if (!connected || !approved.has(tool.url)) return;
      try {
        const result = await app.openLink({ url: tool.url });
        document.getElementById('open-failed').hidden = !result?.isError;
      } catch {
        document.getElementById('open-failed').hidden = false;
      }
    });
    results.append(item);
  }
  document.getElementById('status').textContent = found.length === 1 ? phrases.countOne
    : phrases.count.replace('{count}', String(found.length)).replace('{shown}', String(Math.min(visible, found.length)));
  document.getElementById('empty').hidden = !valid || found.length !== 0;
  document.getElementById('more').hidden = found.length <= visible;
}

query.addEventListener('input', () => { edited = true; visible = 20; render(); });
language.addEventListener('change', () => { edited = true; visible = 20; render(); });
document.getElementById('more').addEventListener('click', () => { visible += 20; render(); });
app.ontoolinput = params => {
  if (edited) return;
  const args = params.arguments;
  if (validQuery(args?.query)) query.value = args.query;
  if (Object.hasOwn(catalogue.locales, args?.locale ?? 'en')) language.value = args?.locale ?? 'en';
  render();
};
app.ontoolresult = result => {
  const locale = result.structuredContent?.locale;
  if (!edited && Object.hasOwn(catalogue.locales, locale ?? '')) language.value = locale;
  render();
};
app.onhostcontextchanged = params => {
  if (params.theme) applyDocumentTheme(params.theme);
  if (params.styles?.variables) applyHostStyleVariables(params.styles.variables);
};
render();
try {
  await app.connect();
  connected = true;
  document.getElementById('connecting').hidden = true;
  const context = app.getHostContext();
  if (context?.theme) applyDocumentTheme(context.theme);
  if (context?.styles?.variables) applyHostStyleVariables(context.styles.variables);
  render();
} catch {
  document.getElementById('connecting').hidden = true;
  document.getElementById('connect-failed').hidden = false;
}
