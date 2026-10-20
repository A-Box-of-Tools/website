// Approval is a room policy, separate from knowing its invitation or password.
// Socket attachments keep the bounded roster through hibernation and reconnects;
// removing the last socket removes it along with the rest of the room.
const MAX_APPROVED = 10;
const token = id => id.replaceAll('-', '').slice(0, 32);

export const approvalFrame = owner => typeof owner?.approval === 'boolean' ? { approval: owner.approval } : {};
export const approvalState = owner => ({ ...approvalFrame(owner),
  ...(owner?.approval === true ? { approved: owner.approved || [] } : {}) });
export const approvalMatches = (owner, requested) => !owner || (owner.approval === true) === (requested === true);
export const admitted = who => who?.verified === true && who.admitted !== false;
export const approvalIdentity = who => who.clientHash || who.id;
export const approved = (owner, who) => owner.approval !== true
  || (owner.approved || []).includes(token(approvalIdentity(who)));

export function rememberApproval(owner, who, active) {
  const id = token(approvalIdentity(who));
  const retained = (owner.approved || []).filter(entry => entry !== id);
  const live = new Set(active.filter(admitted).map(peer => token(approvalIdentity(peer))));
  // Never evict a live admission. Older disconnected identities may ask again
  // after turnover, rather than growing a permanent visitor registry.
  if (retained.length >= MAX_APPROVED) {
    const index = retained.findIndex(entry => !live.has(entry));
    if (index < 0) return null;
    retained.splice(index, 1);
  }
  return { ...owner, approved: [...retained, id] };
}
