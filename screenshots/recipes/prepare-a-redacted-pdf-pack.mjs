// These are the reference guides' real-tool captures, kept together
// here so this workflow can be recaptured by name without copying setup.
import * as part0 from './redact-a-pdf.mjs';

export const helpers = { ...part0.helpers };
export const shots = [
  { ...part0.shots.find((shot) => shot.name === 'find'), tool: 'redact-pdf' },
];
