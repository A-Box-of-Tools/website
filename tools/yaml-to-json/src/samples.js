/**
 * The examples behind the "Try an example" button, one per direction.
 *
 * Here rather than in main.js because they are content, not logic, and because
 * each is chosen to show the thing about that direction that is easy to miss.
 *
 * The YAML one carries a comment and a bare `no`. The comment is there to be
 * lost - that is the whole cost of this direction and it is better seen once
 * than read about - and the `no` is the Norway bug: YAML 1.1 read it as false,
 * this reads 1.2, and it comes out as the string it always was. The long id is
 * there because `JSON.parse` would have rounded it.
 *
 * The JSON one has a string with a line break in it and another that is only a
 * number by accident, both of which are quoted on the way out for the reader
 * that comes next.
 */

export const SAMPLES = {
  'yaml-json': {
    a: [
      '# Which region the renderer runs in. This comment does not survive the',
      '# trip: JSON has nowhere to put one.',
      'service: renderer',
      'replicas: 2',
      'regions:',
      '  - eu-west',
      '  - us-east',
      'flags:',
      '  cache: true',
      '  debug: false',
      'country: no',
      'account: 90071992547409931234',
    ].join('\n'),
  },

  'json-yaml': {
    a: [
      '{',
      '  "service": "renderer",',
      '  "replicas": 2,',
      '  "regions": ["eu-west", "us-east"],',
      '  "flags": { "cache": true, "debug": false },',
      '  "note": "no",',
      '  "version": "1.10",',
      '  "command": "run --watch\\nreload --graceful"',
      '}',
    ].join('\n'),
  },
};
