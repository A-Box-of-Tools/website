/** The page refuses passwords the selected writer would change or truncate. */
export function passwordIssue(password, revision) {
  if (revision === 4 && /[^\u0000-\u00ff]/u.test(password)) {
    return { key: 'latin1', values: {} };
  }
  const limit = revision === 4 ? 32 : 127;
  const n = revision === 4 ? password.length : new TextEncoder().encode(password).length;
  return n > limit ? { key: 'limit', values: { n, limit } } : null;
}
