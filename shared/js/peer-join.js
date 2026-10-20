const HANDOFF = 'pairing.discovery-join';
const LIFETIME = 30000;

/** A new reader tab preserves the draft without turning invitation URLs into consent. */
export function openJoinedPage(href, { sourceUrl = location.href, open = (...args) => window.open(...args), now = Date.now } = {}) {
  let target;
  try {
    const source = new URL(sourceUrl);
    target = new URL(href, source);
    if (!['http:', 'https:'].includes(target.protocol) || target.origin !== source.origin || target.pathname !== source.pathname) return false;
  } catch { return false; }
  let page;
  try {
    page = open('about:blank', '_blank');
    if (!page) return false;
    page.opener = null;
    // about:blank inherits the opener's sessionStorage. Clear this new tab
    // before navigating so it cannot recover the draft owner's host identity.
    page.sessionStorage.clear();
    page.sessionStorage.setItem(HANDOFF, JSON.stringify({ href: target.href, time: now() }));
    page.location.replace(target.href);
    return true;
  } catch {
    try { page?.close(); } catch {}
    return false;
  }
}

/** Consume before validating: a changed route, expired handoff or reload needs fresh consent. */
export function consumeJoinedPage({ href = location.href, storage, now = Date.now } = {}) {
  try {
    storage ??= globalThis.sessionStorage;
    const raw = storage.getItem(HANDOFF);
    storage.removeItem(HANDOFF);
    if (!raw) return false;
    const handoff = JSON.parse(raw);
    const age = now() - handoff.time;
    return handoff.href === href && Number.isFinite(handoff.time) && age >= 0 && age <= LIFETIME;
  } catch { return false; }
}
