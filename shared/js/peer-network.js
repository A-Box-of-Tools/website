/** The connection choice must survive a copied link as well as a fresh dial. */

export function rtcConfig(local, relay = null) {
  // A relay carried from an earlier visit must never widen a local attempt.
  if (local) return { iceServers: [] };
  const iceServers = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }];
  if (relay !== null) iceServers.push(relay);
  return { iceServers };
}

export function makeShareUrl(baseHref, code, local) {
  const url = new URL(baseHref);
  if (local) url.searchParams.set('local', '1');
  else url.searchParams.delete('local');
  url.hash = code;
  return url.href;
}

export function isLocalLink(href) {
  try {
    const values = new URL(href).searchParams.getAll('local');
    return values.length === 1 && values[0] === '1';
  } catch {
    return false;
  }
}

function candidateParts(value) {
  if (typeof value !== 'string' || /[\r\n]/.test(value)) return null;
  const fields = value.trim().replace(/^a=/i, '').split(/\s+/);
  if (fields.length < 8 || (fields.length - 8) % 2 !== 0) return null;
  if (!/^candidate:[a-z0-9+/]{1,32}$/i.test(fields[0])) return null;
  if (!/^\d+$/.test(fields[1]) || Number(fields[1]) < 1 || Number(fields[1]) > 256) return null;
  if (!/^(udp|tcp)$/i.test(fields[2])) return null;
  if (!/^\d+$/.test(fields[3]) || Number(fields[3]) > 0xffffffff) return null;
  if (!/^\d+$/.test(fields[5]) || Number(fields[5]) < 1 || Number(fields[5]) > 65535) return null;
  if (fields[6].toLowerCase() !== 'typ' || !/^(host|srflx|prflx|relay)$/i.test(fields[7])) return null;
  // A second type marker is ambiguous rather than another extension to trust.
  for (let i = 8; i < fields.length; i += 2) {
    if (fields[i].toLowerCase() === 'typ') return null;
  }
  return fields;
}

export function allowedCandidate(candidate, local) {
  if (!local) return true;
  if (candidate === null || candidate === undefined) return true;
  const value = typeof candidate === 'string' ? candidate : candidate.candidate;
  if (value === '') return true;
  const fields = candidateParts(value);
  // The wire string decides: a peer can put any value in an object's type field.
  return fields !== null && fields[7].toLowerCase() === 'host';
}

function hostDescription(sdp) {
  return sdp.replace(/^a=candidate(?:[: \t])[^\r\n]*(?:\r\n|\n|\r|$)/gmi, (line) => {
    const ending = line.match(/(?:\r\n|\n|\r)$/)?.[0] ?? '';
    const fields = candidateParts(line.slice(0, line.length - ending.length));
    if (fields === null || fields[7].toLowerCase() !== 'host') return '';
    // Related addresses describe a mapped or relayed route. They are needless
    // on a host candidate and should not survive another peer's description.
    const kept = fields.slice(0, 8);
    for (let i = 8; i < fields.length; i += 2) {
      if (!/^(raddr|rport)$/i.test(fields[i])) kept.push(fields[i], fields[i + 1]);
    }
    if (kept.length === fields.length) return line;
    return `a=${kept.join(' ')}${ending}`;
  });
}

export function localDescription(description) {
  // A peer can put candidates inside its SDP instead of trickling them, so
  // filtering addIceCandidate alone would leave a second route available.
  if (typeof description === 'string') return hostDescription(description);
  if (typeof description?.sdp !== 'string') return description;
  return { type: description.type, sdp: hostDescription(description.sdp) };
}
