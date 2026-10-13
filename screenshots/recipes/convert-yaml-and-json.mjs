/** A comment is lost while a large integer and the string "no" survive. */
export const tool = 'yaml-to-json';
export const data = {
  SOURCE: '# A local example\nenabled: true\ncountry: no\naccount: 12345678901234567890\n',
};
export const shots = [{
  name: 'values',
  clip: ['#panes', '#conversion-feedback', '#output'],
  run: async (k) => {
    k.give(k.file(SOURCE, 'settings.yaml', 'application/yaml'));
    await k.wait('#output');
    await k.settle(700);
  },
}];
