# The OCR engine and its English model

The tool carries Tesseract rather than sending a picture to an OCR service.
These files come from pinned official npm packages, downloaded while developing
the tool. The page contacts none of those package hosts at runtime.

| File | Source | Bytes | SHA-256 |
|---|---|---:|---|
| `worker.min.js` | `tesseract.js` 6.0.1, `dist/worker.min.js` | 111,162 | `38645599043239c0eb6db08a6504a92dcdc292200535f3e9339cd77c4443b842` |
| `tesseract-core-lstm.js` | `tesseract.js-core` 6.0.0, file of the same name | 124,747 | `48a3ee8e00924cb8c7f0cc0d099b1318fea120af56b3ee8fb3a70dd2311806c2` |
| The binary bytes inside `wasm-data.js` | `tesseract.js-core` 6.0.0, `tesseract-core-lstm.wasm` | 2,871,085 | `220e2e87551edccb85519796a170469f8ab2a8055216789e3b8b1ada18b7bc2b` |
| `wasm-data.js` | The preceding binary bytes, base64 encoded inside a script | 3,828,365 | `201fd1ec8805bd1ebdea9520090eeccd44d46776df96a436280ce94e7cb28d4e` |
| The gzip bytes inside `eng-data.js` | `@tesseract.js-data/eng` 1.0.0, `4.0.0_best_int/eng.traineddata.gz` | 2,952,873 | `45b4cb346724ac1774f1c36f42f182b887bcdb28ebe63e6fff90ac41f3fcff91` |
| `eng-data.js` | The preceding gzip bytes, base64 encoded inside a script | 3,937,405 | `1c4c271dd752b5591daa5630e6cd734c6536c9f38a16bb45c05409b96aab76f0` |

The worker and core loader are unmodified. The WebAssembly binary and English
model are wrapped in scripts, with notices describing that change, so they
also load under `script-src` instead of requiring a fetch. The adapter supplies
the binary as the factory's `wasmBinary` option. This matters even for the
upstream core with its binary embedded: that build first tries fetching its
data URL, and only falls back to decoding the embedded bytes once CSP blocks
it. Supplying bytes explicitly never enters that loader path.
Together the executable files are about 8 MB on disk and about 4.5 MB when
compressed for delivery. The expanded English model occupies 5,199,098 bytes.
The generator copies every file here and precaches it in this tool's service
worker, so recognition remains available after the tool has been cached.

The pinned archives are:

- <https://registry.npmjs.org/tesseract.js/-/tesseract.js-6.0.1.tgz>
- <https://registry.npmjs.org/tesseract.js-core/-/tesseract.js-core-6.0.0.tgz>
- <https://registry.npmjs.org/@tesseract.js-data/eng/-/eng-1.0.0.tgz>

`LICENSE-tesseract.js`, `LICENSE-tesseract-core` and
`LICENSE-language-data` carry the Apache 2.0 licenses. The language-data
license comes from [the upstream data repository](https://github.com/naptha/tessdata/blob/gh-pages/LICENSE).
`worker.min.js.LICENSE.txt` preserves the bundled components' notices.

`ocr-worker.js` is this repository's adapter. It supplies the compressed model
bytes to the upstream `loadLanguage` handler and leaves `initialize` with the
language name `eng`. Tesseract 6.0.1 supports model bytes in its language loader,
but its initializer reads an object differently; restricting the substitution
to the loader avoids changing third-party code. The worker decompresses the
bytes itself and writes them into its in-memory filesystem. No IndexedDB cache
is needed; the service worker already owns the cached scripts.

`src/ocr.js` starts this adapter as a blob worker, which inherits the page's
Content Security Policy. It sends the upstream worker's existing messages
directly, because the public `createWorker` promise hides the worker until
initialization finishes and would prevent cancelling that stage. Absolute asset
URLs are passed into the blob bootstrap, because an imported classic script
still resolves its relative `importScripts` URLs against the worker's location.

This tool needs `worker-src 'self' blob:` and `script-src
'wasm-unsafe-eval'`. It does not widen `connect-src`: the engine has its binary
already, the language loader receives bytes rather than a URL, and pictures
arrive as a PNG byte array made from the page's canvas. The upstream bundles
contain network fallback code, but these paths are not reached and this
worker's inherited policy refuses them.

The deliberately non-SIMD LSTM core works on browsers without WebAssembly SIMD.
It avoids shipping a second engine solely for speed, at the cost of slower OCR
on devices with SIMD. The English model reads English printed text; handwritten
documents and other scripts require different models and are not claimed here.
