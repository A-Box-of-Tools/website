/**
 * Test the same decoder the converter uses with bytes known to be valid.
 * A failed visitor file can be corrupt, so it cannot answer this question.
 *
 * This 493-byte, 320 x 240 AVIF is the project's generated four-quadrant QA
 * fixture (qa/fixtures/quadrants.avif), encoded with libaom by ffmpeg. Keeping
 * the probe here costs less than a kilobyte and needs no request or codec.
 */
import { AVIF, decode, release } from './shared/image-convert.js';

const SAMPLE = 'AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAAD5bWV0YQAAAAAAAAAvaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAFBpY3R1cmVIYW5kbGVyAAAAAA5waXRtAAAAAAABAAAAHmlsb2MAAAAARAAAAQABAAAAAQAAASEAAADMAAAAKGlpbmYAAAAAAAEAAAAaaW5mZQIAAAAAAQAAYXYwMUNvbG9yAAAAAGppcHJwAAAAS2lwY28AAAAUaXNwZQAAAAAAAAFAAAAA8AAAABBwaXhpAAAAAAMICAgAAAAMYXYxQ4EADAAAAAATY29scm5jbHgAAgACAAIAAAAAF2lwbWEAAAAAAAAAAQABBAECgwQAAADUbWRhdAoHGCHn/e2AQDLAAREgAQQEQSFEAQAArTyl+p68JclVuPck509vOPJ0gO6GkV9QzZh3YD0bpU97FlFUIaMC4gafHK2SqRvvALSHCbD85yzkgCaKrB2/AhR0zzMLjbaYY1MuK3tg7hXNrFvVqJ+qd5AcqEowBUzhZwK/y1GGOUc6v0FszaPkdqp0vsh53Xqoxgx0vAGoNLZmTcBK7I8IZZFzEYMvcz0qtZq62rjHVIBhO3exLoJjZBzHsdR7q4535BwQhntK3JZciq80Kw==';

export async function canReadAvif() {
  const bytes = Uint8Array.from(atob(SAMPLE), (character) => character.charCodeAt(0));
  try {
    const decoded = await decode(new Blob([bytes], { type: AVIF }));
    release(decoded.bitmap);
    return true;
  } catch {
    return false;
  }
}
