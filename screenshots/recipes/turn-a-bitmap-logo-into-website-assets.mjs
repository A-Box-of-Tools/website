// These are the reference guides' real-tool captures, kept together
// here so this workflow can be recaptured by name without copying setup.
import * as part0 from './trace-an-image-into-an-svg.mjs';
import * as part1 from './make-a-favicon.mjs';

export const helpers = { ...part0.helpers, ...part1.helpers };
export const shots = [
  { ...part0.shots.find((shot) => shot.name === 'outline'), tool: 'image-to-svg' },
  { ...part1.shots.find((shot) => shot.name === 'sizes'), tool: 'image-to-ico' },
];
