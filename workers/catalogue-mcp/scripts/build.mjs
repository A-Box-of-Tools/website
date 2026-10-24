import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { MAX_CATALOGUE_BYTES } from '../ui/view-data.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const generated = path.join(root, 'generated');

export function packCatalogue(catalogue) {
  const bytes = Buffer.from(JSON.stringify(catalogue), 'utf8');
  if (!bytes.length || bytes.length > MAX_CATALOGUE_BYTES) throw new TypeError('Catalogue exceeds the App data limit');
  const gzip = gzipSync(bytes, { level: 9 });
  // Public catalogue bytes must not depend on the build clock or operating system.
  gzip.fill(0, 4, 8);
  gzip[9] = 255;
  return { base64: gzip.toString('base64'), bytes: bytes.length };
}

export function renderView({ template, css, javascript, catalogue }) {
  const packed = packCatalogue(catalogue);
  const replacements = {
    __APP_CSS__: css,
    __APP_CATALOGUE__: packed.base64,
    __APP_CATALOGUE_BYTES__: String(packed.bytes),
    __APP_JS__: javascript.replace(/<\/script/gi, '<\\/script')
  };
  let html = template;
  for (const [token, value] of Object.entries(replacements)) {
    if (html.split(token).length !== 2) throw new TypeError('Expected one App template placeholder: ' + token);
    html = html.replace(token, () => value);
  }
  return { html, catalogueBytes: packed.bytes, packedCatalogueBytes: Buffer.byteLength(packed.base64) };
}

export async function bundleAppJavascript(entryPoint = path.join(root, 'ui/view.mjs')) {
  const bundle = await build({ entryPoints: [entryPoint], bundle: true,
    write: false, format: 'esm', platform: 'browser', target: ['es2022'], minify: true, charset: 'utf8' });
  return bundle.outputFiles[0].text;
}

export async function buildView() {
  const catalogue = JSON.parse(await readFile(path.join(generated, 'catalogue.json'), 'utf8'));
  const javascript = await bundleAppJavascript();
  const [template, css] = await Promise.all([
    readFile(path.join(root, 'ui/view.html'), 'utf8'), readFile(path.join(root, 'ui/view.css'), 'utf8')
  ]);
  const result = renderView({ template, css, javascript, catalogue });
  await mkdir(generated, { recursive: true });
  await writeFile(path.join(generated, 'view.html'), result.html);
  await writeFile(path.join(generated, 'app-resource.mjs'), 'export default ' + JSON.stringify(result.html) + ';\n');
  console.log(`Bundled self-contained catalogue view: ${Buffer.byteLength(result.html)} bytes`
    + ` (catalogue ${result.catalogueBytes} -> ${result.packedCatalogueBytes} bytes)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildView();
