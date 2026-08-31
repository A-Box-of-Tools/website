/**
 * Making a height comparison chart: the rows that describe a family, and the
 * picture they turn into.
 *
 * There is no file to hand this tool, so both shots are of a chart typed in -
 * a family and a doorway, which is the case the guide is written around.
 */

export const tool = 'compare-heights';

export const helpers = {
  /** Type a family and a doorway into the tool, the way a person would. */
  load: async (k) => {
    await k.wait('#rows .row');
    k.click('#clear');

    const family = [
      ['man', 'Dad', '183'],
      ['woman', 'Mum', '168'],
      ['boy', 'Sam', '134'],
      ['girl', 'Rosa', '122'],
      ['toddler', 'Theo', '86'],
    ];
    for (let i = 0; i < family.length; i += 1) k.click('#add-person');

    const rows = document.querySelectorAll('#rows .row');
    family.forEach(([shape, name, height], i) => {
      const row = rows[i];
      for (const [selector, value] of [['.row-shape', shape], ['.row-name', name],
        ['.row-height', height]]) {
        const field = row.querySelector(selector);
        field.value = value;
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    k.set('#preset', 'door-interior');
    await k.settle(600);
  },
};

export const shots = [
  {
    // The rows themselves, and the reading under each height box - which is
    // the thing the guide asks the reader to glance at every time.
    name: 'rows',
    clip: '#rows',
    run: async (k) => {
      await load(k);
    },
  },
  {
    // The finished chart, with the doorway that turns four numbers into a
    // sense of scale.
    name: 'chart',
    clip: '#preview',
    run: async (k) => {
      await load(k);
      await k.settle(400);
    },
  },
];
