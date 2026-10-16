import { offlineBlock as encodeBlock, readOfflineBlock as decodeBlock } from './shared/offline-pairing.js';
export { newOfflinePairing, OFFLINE_LIFETIME } from './shared/offline-pairing.js';

// Keep the published Share Tab envelope and leaf API while all validation is
// owned by the shared exchange used by the other paired tools.
export const offlineBlock = (pairing, description) => encodeBlock('share-tab', pairing, description);
export const readOfflineBlock = (text, type, options) => decodeBlock('share-tab', text, type, options);
