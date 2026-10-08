/** Different image shapes show what fitting inside square boxes leaves visible. */
export const tool = 'image-layout';

export const shots = [
  {
    name: 'layout',
    clip: '#layout-card',
    run: async (k) => {
      k.click('#example-button');
      await k.wait('#image-list li');
      await k.until(() => !document.getElementById('preview').hidden
        && !document.getElementById('export').disabled, { label: 'the finished layout preview' });
      await k.settle();
    },
  },
];
