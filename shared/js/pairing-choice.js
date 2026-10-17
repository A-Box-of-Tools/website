// A browser's network indicator is a hint, not a reachability probe. Explicit
// choices and invitations keep their meaning even when that hint is wrong.
export function pairingChoice({ preference = 'auto', online, invitation = false,
  invitationLink = false, manualDraft = false, introductionFailed = false } = {}) {
  if (preference === 'online' || preference === 'offline') {
    return { method: preference, notice: '' };
  }
  if (introductionFailed) return { method: 'offline', notice: 'pairing.unavailable' };
  if (invitationLink) return { method: 'online', notice: online === false ? 'pairing.invitation-offline' : '' };
  if (manualDraft) return { method: 'offline', notice: 'pairing.manual-draft' };
  if (invitation) return { method: 'online', notice: online === false ? 'pairing.invitation-offline' : '' };
  if (online === false) return { method: 'offline', notice: 'pairing.detected-offline' };
  return { method: 'online', notice: '' };
}
