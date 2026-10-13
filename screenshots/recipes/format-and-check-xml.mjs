/** The formatted document and its mapped JSON are two different results. */
export const tool = 'xml-formatter';
export const data = {
  SOURCE: '<settings region="local"><port>8080</port><feature>export</feature><feature>preview</feature></settings>',
};
export const shots = [{
  name: 'mapping',
  clip: ['#panes', '#output'],
  run: async (k) => {
    k.give(k.file(SOURCE, 'settings.xml', 'application/xml'));
    await k.settle(700);
    k.click('#tab-convert');
    await k.wait('#output');
    await k.settle(500);
  },
}];
