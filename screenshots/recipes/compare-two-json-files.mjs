/**
 * Comparing two JSON files: the diff, and the switches that stop it reporting
 * differences nobody cares about.
 */

export const tool = 'compare-text';

export const data = {
  LEFT: JSON.stringify({
  name: 'orders-api',
  version: '2.4.0',
  port: 8080,
  retries: 3,
  features: { search: true, exports: false },
  hosts: ['eu-west-1', 'eu-west-2'],
}, null, 2),

  RIGHT: JSON.stringify({
  name: 'orders-api',
  version: '2.5.1',
  port: 8080,
  retries: 5,
  features: { search: true, exports: true, webhooks: true },
  hosts: ['eu-west-1', 'eu-west-2', 'us-east-1'],
  }, null, 2),
};

export const helpers = {
  load: async (k, left, right) => {
    k.give(k.file(left, 'config.old.json', 'application/json'),
           k.file(right, 'config.new.json', 'application/json'));
    await k.wait('#diff-view');
    await k.settle(700);
  },
};

export const shots = [
  {
    // Two versions of the same file side by side, with the lines that moved
    // marked. This is what the tool is for and what the guide opens with.
    name: 'diff',
    clip: '#diff-view',
    run: async (k) => {
      await load(k, LEFT, RIGHT);
    },
  },
  {
    // The switches. A diff that reports every line because one file was saved
    // with different line endings is the failure these three exist to prevent.
    name: 'options',
    clip: '.card:has(#view)',
    run: async (k) => {
      await load(k, LEFT, RIGHT);
      k.click('#only-changes');
      await k.settle(500);
    },
  },
];
