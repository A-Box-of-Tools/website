/**
 * Only codec settings arrive here, never media. The page owns the deadline
 * and terminates this worker even if a native query blocks its event loop.
 */
const CODECS = new Set(['VideoEncoder', 'VideoDecoder', 'AudioEncoder', 'AudioDecoder']);

self.onmessage = async ({ data }) => {
  self.onmessage = null;
  const { codec, configs } = data ?? {};
  if (!CODECS.has(codec) || !Array.isArray(configs)) {
    self.postMessage({ index: null });
    return;
  }
  const api = globalThis[codec];
  if (typeof api?.isConfigSupported === 'function') {
    for (let index = 0; index < configs.length; index += 1) {
      try {
        const answer = await api.isConfigSupported(configs[index]);
        if (answer?.supported === true) {
          self.postMessage({ index });
          return;
        }
      } catch {
        // A rejected configuration says nothing about the next candidate.
      }
    }
  }
  self.postMessage({ index: -1 });
};
