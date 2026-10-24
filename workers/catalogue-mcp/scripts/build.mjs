import { build } from 'esbuild';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { MAX_UTF8_DATA_BYTES } from '../ui/view-data.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const generated = path.join(root, 'generated');

function packUtf8Data(source) {
  if (typeof source !== 'string' || !source.isWellFormed()) throw new TypeError('Expected well-formed UTF-8 build data');
  const bytes = Buffer.from(source, 'utf8');
  if (!bytes.length || bytes.length > MAX_UTF8_DATA_BYTES) throw new TypeError('Build data exceeds the App limit');
  const gzip = gzipSync(bytes, { level: 9 });
  // Build artifacts must not depend on the build clock or operating system.
  gzip.fill(0, 4, 8);
  gzip[9] = 255;
  return { base64: gzip.toString('base64'), bytes: bytes.length };
}

export function packCatalogue(catalogue) {
  return packUtf8Data(JSON.stringify(catalogue));
}

export async function renderView({ template, css, javascript, catalogue }) {
  const packed = packCatalogue(catalogue);
  const module = packUtf8Data(javascript);
  const moduleSha256 = createHash('sha256').update(javascript, 'utf8').digest('base64');
  const bootstrap = await build({ entryPoints: [path.join(root, 'ui/view-loader.mjs')], bundle: true,
    write: false, format: 'esm', platform: 'browser', target: ['es2022'], minify: true, charset: 'utf8',
    define: { __APP_MODULE_BYTES__: String(module.bytes), __APP_MODULE_SHA256__: JSON.stringify(moduleSha256) } });
  const replacements = {
    __APP_CSS__: css,
    __APP_CATALOGUE__: packed.base64,
    __APP_CATALOGUE_BYTES__: String(packed.bytes),
    __APP_MODULE_DATA__: module.base64,
    __APP_MODULE_BYTES__: String(module.bytes),
    __APP_MODULE_SHA256__: moduleSha256,
    __APP_BOOTSTRAP__: bootstrap.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')
  };
  let html = template;
  for (const [token, value] of Object.entries(replacements)) {
    if (html.split(token).length !== 2) throw new TypeError('Expected one App template placeholder: ' + token);
    html = html.replace(token, () => value);
  }
  return { html, catalogueBytes: packed.bytes, packedCatalogueBytes: Buffer.byteLength(packed.base64),
    moduleBytes: module.bytes, packedModuleBytes: Buffer.byteLength(module.base64), moduleSha256 };
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
  const result = await renderView({ template, css, javascript, catalogue });
  await mkdir(generated, { recursive: true });
  await writeFile(path.join(generated, 'view.html'), result.html);
  await writeFile(path.join(generated, 'app-resource.mjs'), 'export default ' + JSON.stringify(result.html) + ';\n');
  console.log(`Bundled self-contained catalogue view: ${Buffer.byteLength(result.html)} bytes`
    + ` (catalogue ${result.catalogueBytes} -> ${result.packedCatalogueBytes} bytes;`
    + ` module ${result.moduleBytes} -> ${result.packedModuleBytes} bytes)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildView();
