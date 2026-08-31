/**
 * Formatting JSON without uploading it: the two panes, and where the error is
 * when there is one.
 */

export const tool = 'json-formatter';

export const data = {
  MESSY: '{"name":"orders-api","version":"2.5.1","limits":{"rate":100,'
    + '"burst":250},"regions":["eu-west-1","us-east-1"],"enabled":true}',

  // A trailing comma: the commonest way for a file somebody has edited by hand
  // to stop parsing, and the one the error message has to be good about.
  BROKEN: '{\n  "name": "orders-api",\n  "regions": [\n    "eu-west-1",\n'
    + '    "us-east-1",\n  ],\n  "enabled": true\n}',
};

export const shots = [
  {
    // One line in, formatted out. The pane on the right is the whole tool.
    name: 'panes',
    clip: '#panes',
    run: async (k) => {
      k.give(k.file(MESSY, 'config.json', 'application/json'));
      await k.wait('#output');
      await k.settle(700);
    },
  },
  {
    // What a syntax error looks like. A trailing comma is the commonest one and
    // the message says which line it is on, which is the point.
    name: 'error',
    clip: ['#panes', '#error'],
    run: async (k) => {
      k.give(k.file(BROKEN, 'config.json', 'application/json'));
      await k.wait('#error');
      await k.settle(600);
    },
  },
];
