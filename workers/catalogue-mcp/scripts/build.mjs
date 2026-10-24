import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const generated = path.join(root, 'generated');
const catalogue = JSON.parse(await readFile(path.join(generated, 'catalogue.json'), 'utf8'));
const bundle = await build({ entryPoints: [path.join(root, 'ui/view.mjs')], bundle: true,
  write: false, format: 'esm', platform: 'browser', target: ['es2022'], minify: true });
const js = bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const json = JSON.stringify(catalogue).replace(/[<>&\u2028\u2029]/g,
  char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'));
let html = await readFile(path.join(root, 'ui/view.html'), 'utf8');
html = html.replace('__APP_CSS__', await readFile(path.join(root, 'ui/view.css'), 'utf8'))
  .replace('__APP_CATALOGUE__', () => json).replace('__APP_JS__', () => js);
await mkdir(generated, { recursive: true });
await writeFile(path.join(generated, 'view.html'), html);
await writeFile(path.join(generated, 'app-resource.mjs'), 'export default ' + JSON.stringify(html) + ';\n');
console.log(`Bundled self-contained catalogue view: ${Buffer.byteLength(html)} bytes`);
