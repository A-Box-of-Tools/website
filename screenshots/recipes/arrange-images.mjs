/** A preset supplies the cells; one reframed image shows that crops are individual. */
export const tool = 'image-layout';

export const shots = [
  {
    name: 'layout',
    clip: '#layout-card',
    run: async (k) => {
      k.click('#example-button');
      await k.wait('#image-list li');
      await k.until(() => !document.getElementById('preview').hidden
        && document.querySelectorAll('#frame-layer button').length === 4
        && !document.getElementById('export').disabled,
      { label: 'the finished layout preview' });

      k.set('#preset', 'portrait');
      await k.until(() => !document.getElementById('preview').hidden
        && document.getElementById('ratio').value === 'portrait'
        && document.querySelectorAll('#frame-layer button').length === 4,
      { label: 'the portrait preset preview' });
      k.click('#frame-layer button:first-child');
      k.set('#frame-zoom', '150');
      await k.until(() => !document.getElementById('frame-pan-x').disabled
        && !document.getElementById('frame-pan-y').disabled,
      { label: 'the selected image with room to pan' });
      k.set('#frame-pan-x', '35');
      k.set('#frame-pan-y', '-15');
      await k.until(() => document.querySelector('#frame-layer button:first-child')
        ?.getAttribute('aria-pressed') === 'true'
        && document.getElementById('frame-zoom-label').textContent === '150%'
        && document.getElementById('layout-error').hidden,
      { label: 'the individually reframed picture' });
      await k.settle();
    },
  },
];
