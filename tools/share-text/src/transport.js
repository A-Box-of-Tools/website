import { rtcConfig, allowedCandidate, localDescription } from './network.js';
import { peerConfiguration, transportCandidate, transportDescription, transportMode } from './shared/peer-transport.js';
import { candidateParts } from './shared/peer-network.js';

// Ordinary Share Text retains its public address discovery. Local Direct
// remains host-only, while an explicit relay session uses relay candidates only.
export function shareConfiguration(mode, local, servers) {
  if (transportMode(mode) === null) throw new Error('transport.invalid');
  return mode === 'relay' ? peerConfiguration(mode, servers) : rtcConfig(local);
}
export function shareCandidate(candidate, mode, local) {
  if (transportMode(mode) === null) return false;
  if (mode === 'relay') return transportCandidate(candidate, mode);
  if (local) return allowedCandidate(candidate, true);
  if (candidate == null) return true;
  const text = typeof candidate === 'string' ? candidate : candidate.candidate;
  if (text === '') return true;
  const fields = candidateParts(text);
  return fields !== null && fields[7].toLowerCase() !== 'relay';
}
export function shareDescription(description, mode, local) {
  if (transportMode(mode) === null) throw new Error('transport.invalid');
  if (mode === 'relay') return transportDescription(description, mode);
  if (local) return localDescription(description);
  const clean = sdp => sdp.replace(/^a=candidate(?:[: \t])[^\r\n]*(?:\r\n|\n|\r|$)/gmi,
    line => shareCandidate(line.trim(), mode, false) ? line : '');
  if (typeof description === 'string') return clean(description);
  return typeof description?.sdp === 'string' ? { type: description.type, sdp: clean(description.sdp) } : description;
}
