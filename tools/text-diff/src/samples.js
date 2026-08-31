/**
 * The example behind the "Try an example" button.
 *
 * Here rather than in main.js because it is content, not logic. The two texts
 * differ by an insertion as well as an edit, which is the case a line-by-line
 * comparison gets wrong - and the reason the algorithm behind this page is
 * Myers' rather than a walk down both texts at once.
 */

export const SAMPLES = {
  diff: {
    a: [
      'The tools here run in your browser.',
      'Your files stay on your machine.',
      'There is nothing to upload.',
      'There is no account to make.',
      'Everything is free.',
    ].join('\n'),
    b: [
      'The tools here run in your own browser.',
      'Your files stay on your machine.',
      'There is nothing to upload, and nowhere to upload it to.',
      'There is no account to make.',
      'It works offline.',
      'Everything is free.',
    ].join('\n'),
  },
};
