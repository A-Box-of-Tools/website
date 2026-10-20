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

export function rememberApproval(owner, who) {
  const id = token(approvalIdentity(who));
  const retained = (owner.approved || []).filter(entry => entry !== id);
  // Leaving is not revocation. Refuse a new grant at capacity instead of
  // surprising a returning participant with another approval request.
  if (retained.length >= MAX_APPROVED) return null;
  return { ...owner, approved: [...retained, id] };
}

export const forgetApproval = (owner, who) => owner.approval === true
  ? { ...owner, approved: (owner.approved || []).filter(entry => entry !== token(approvalIdentity(who))) }
  : owner;

export const clearApprovals = owner => owner.approval === true ? { ...owner, approved: [] } : owner;
