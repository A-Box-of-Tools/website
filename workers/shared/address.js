// Which network a request spends its budget against. One IPv6 customer normally
// holds a whole /64, so the budget belongs to the /64 rather than to each address.
//
// Rendezvous, feedback and the catalogue each bundle this file when they are
// deployed by hand. Changing it changes a limit only on the Workers deployed
// afterwards; none of them depends on another having moved first.

export function ipv4Octets(value) {
  if (typeof value !== "string" || !/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) return null;
  const parts = value.split(".");
  const octets = parts.map(Number);
  return octets.some((n, i) => n > 255 || String(n) !== parts[i]) ? null : octets;
}

// Devices on an IPv6 LAN have distinct interface identifiers. Expanding
// the compressed form before masking avoids dividing one /64 by device.
export function ipv6Network(address) {
  const [left, right] = address.split("::");
  const leading = left ? left.split(":") : [];
  const trailing = right ? right.split(":") : [];
  const groups = right === undefined ? leading
    : [...leading, ...Array(8 - leading.length - trailing.length).fill("0"), ...trailing];
  return `${groups.slice(0, 4).map((n) => parseInt(n, 16).toString(16)).join(":")}::/64`;
}

function ipv6Budget(value) {
  if (typeof value !== "string" || !/^[a-fA-F0-9:.]+$/.test(value) || !value.includes(":")) return null;
  try {
    const address = new URL(`https://[${value}]/`).hostname.slice(1, -1);
    // A leading zero group is an embedded form such as ::ffff:192.0.2.1, whose
    // first 64 bits are the same for everybody and name no network at all.
    return address.startsWith("::") || address.startsWith("0:") ? address : ipv6Network(address);
  } catch {
    return null;
  }
}

// The key for a rate limit, never a decision about the address: unlike a
// discovery group this has to return something for every request, because a
// reserved or unrecognised source is still somebody to count.
export function requestNetwork(request, fallback = "") {
  const edgeAddress = request.headers.get("CF-Connecting-IP");
  // Pseudo IPv4's overwrite mode hashes each full IPv6 address into a Class E
  // marker and keeps the real one in this edge header. Its marker is required:
  // the header is ignored for an ordinary source.
  const octets = ipv4Octets(edgeAddress);
  if (octets !== null && octets[0] >= 240) {
    const preserved = ipv6Budget(request.headers.get("CF-Connecting-IPv6"));
    if (preserved !== null) return preserved;
  }
  return ipv6Budget(edgeAddress) ?? (edgeAddress || fallback);
}
