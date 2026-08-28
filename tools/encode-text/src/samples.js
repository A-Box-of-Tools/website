/**
 * The example behind the "Try an example" button.
 *
 * Here rather than in main.js because it is content, not logic. The string is
 * chosen to show the thing about encoding that is easy to miss: characters
 * HTML must escape, a character above ASCII, and an ampersand - the same
 * input reads differently through every codec on the menu.
 *
 * A phrase key, not the string itself: which character is "above ASCII" is
 * not the same question in every language, and each one picks its own.
 */

export const SAMPLES = {
  encode: {
    a: 'sample.text',
  },
};
