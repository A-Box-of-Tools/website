export const MAX_UTF8_DATA_BYTES = 1024 * 1024;
export const MAX_CATALOGUE_BYTES = MAX_UTF8_DATA_BYTES;

export async function decodeUtf8Data(encoded, expectedBytes) {
  if (typeof encoded !== 'string' || !Number.isSafeInteger(expectedBytes)
      || expectedBytes < 1 || expectedBytes > MAX_UTF8_DATA_BYTES
      || encoded.length > MAX_UTF8_DATA_BYTES * 2
      || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)
      || typeof DecompressionStream !== 'function') {
    throw new TypeError('Invalid or unsupported compressed build data');
  }
  const compressed = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
  const reader = new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > expectedBytes) {
        await reader.cancel();
        throw new TypeError('Decoded data exceeds its declared size');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (size !== expectedBytes) throw new TypeError('Decoded size does not match the build');
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
}

export async function decodeCatalogueData(encoded, expectedBytes) {
  return JSON.parse(await decodeUtf8Data(encoded, expectedBytes));
}
