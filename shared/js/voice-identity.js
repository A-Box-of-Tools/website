const STORE = 'abox.voice-identities.v1';
const LIMIT = 64;
const validKey = value => typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value);

// Active connection state stays in the tool's tab. This cache remembers only
// the personal capability, so leaving cannot reconnect a microphone but a later
// explicit join can prove the same identity to that host.
export function createVoiceIdentityCache({ storage = () => globalThis.localStorage, limit = LIMIT } = {}) {
  const memory = new Map();
  const read = () => {
    try {
      const value = JSON.parse(storage()?.getItem(STORE) || '[]');
      return new Map(Array.isArray(value) ? value.slice(-limit).filter(row => Array.isArray(row)
        && row.length === 2 && typeof row[0] === 'string' && row[0].length <= 128 && validKey(row[1])) : []);
    } catch { return new Map(); }
  };
  return {
    get(tool, code, route, previous, create) {
      if (!['walkie-talkie', 'voice-oncall'].includes(tool) || !/^[a-f0-9]{64}$/i.test(code || '')
          || !['direct', 'relay'].includes(route)) return null;
      const scope = JSON.stringify([tool, code.toLowerCase(), route]), rows = read();
      const key = rows.get(scope) || memory.get(scope) || (validKey(previous) ? previous : create());
      if (!validKey(key)) throw new TypeError('Invalid voice identity');
      // Refresh the bounded cache on use. Storage failure only limits identity
      // continuity to this page; it must not prevent a connection or a Leave.
      memory.delete(scope); memory.set(scope, key);
      rows.delete(scope); rows.set(scope, key);
      while (memory.size > limit) memory.delete(memory.keys().next().value);
      while (rows.size > limit) rows.delete(rows.keys().next().value);
      try { storage()?.setItem(STORE, JSON.stringify([...rows])); } catch {}
      return key;
    },
  };
}
