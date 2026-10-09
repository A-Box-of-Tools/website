/*
 * Tesseract's worker can take a language as bytes, but its public initializer
 * treats the same object as a language name. Supply bytes only to loadLanguage
 * and keep the following initialize request's language as the string "eng".
 * Registering this listener first lets the upstream worker stay unmodified.
 *
 * A blob worker inherits the page's CSP. Its imports need absolute URLs,
 * because relative importScripts URLs resolve against the blob, even when
 * the calling code was itself imported from a normal file.
 */
importScripts(self.RECEIPT_OCR_ASSETS.core,
  self.RECEIPT_OCR_ASSETS.wasm, self.RECEIPT_OCR_ASSETS.model);

function bytesFromBase64(encoded) {
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
const englishBytes = bytesFromBase64(self.RECEIPT_ENGLISH_DATA);
const wasmBytes = bytesFromBase64(self.RECEIPT_WASM_DATA);
delete self.RECEIPT_ENGLISH_DATA;
delete self.RECEIPT_WASM_DATA;

// Even Emscripten's embedded build first tries a fetch of its data: URL.
// Supplying wasmBinary skips that path and keeps connect-src untouched.
const originalCore = self.TesseractCore;
self.TesseractCore = (options) => originalCore({ ...options, wasmBinary: wasmBytes });

self.addEventListener('message', ({ data }) => {
  if (data.action === 'loadLanguage') {
    data.payload.langs = [{ code: 'eng', data: englishBytes }];
  }
});

importScripts(self.RECEIPT_OCR_ASSETS.worker);
