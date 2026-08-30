/**
 * The examples behind the "Try an example" button.
 *
 * Here rather than in main.js because they are content, not logic, and because
 * each one is chosen to show the thing about that job that is easy to miss:
 * the JSON has keys that a formatter built on `JSON.parse` would reorder, and
 * the YAML-bound document has a `no` in it that YAML 1.1 would have turned
 * into `false`.
 */

export const SAMPLES = {
  format: {
    language: 'json',
    a: '{"10":"ten","2":"two","name":"a box of tools","tags":["local","offline"],'
      + '"limits":{"files":null,"size":1e999},"price":0.1,"free":true}',
  },

  convert: {
    conversion: 'json-yaml',
    a: [
      '{',
      '  "service": "renderer",',
      '  "replicas": 2,',
      '  "regions": ["eu-west", "us-east"],',
      '  "flags": { "cache": true, "debug": false },',
      '  "note": "no",',
      '  "command": "run --watch\nreload --graceful"',
      '}',
    ].join('\n'),
  },
};
