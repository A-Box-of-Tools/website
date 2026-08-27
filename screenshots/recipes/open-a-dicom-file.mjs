/**
 * Opening a DICOM file: the picture, and the fact that most of the file is not
 * the picture.
 */

export const tool = 'dicom-viewer';

export const helpers = {
  load: async (k) => {
    k.give(k.dicom({ patient: 'ANON^PHANTOM', modality: 'CT' }));
    await k.wait('#viewer-card');
    await k.settle(1400);
  },
};

export const shots = [
  {
    // The image, with the window and level controls beside it. A scan is
    // twelve or sixteen bits deep and a screen is eight, so which slice of the
    // range you look at is a setting rather than a detail.
    name: 'viewer',
    clip: '#viewer-card',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // What the file says about the person it is of. This is the card that makes
    // the guide's point: a DICOM carries a name, a date of birth and an
    // accession number, and emailing one is emailing all of that.
    name: 'identity',
    clip: '#identity-card',
    run: async (k) => {
      await load(k);
      await k.settle(500);
    },
  },
];
