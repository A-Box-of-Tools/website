/**
 * The examples behind the "Try an example" button, one per job.
 *
 * Here rather than in main.js because they are content, not logic, and because
 * each is chosen to show the thing about that job that is easy to miss.
 *
 * The one to format arrives indented three different ways, with an attribute,
 * a self-closing element and a comment in it: those are the three things a
 * reader wants to see survive the trip, and the ragged whitespace is what
 * hand-edited XML actually looks like. It is deliberately not already flat -
 * a sample with nothing to take out would report "squeezed flat, 0% off",
 * which reads as a broken button rather than as an honest measurement.
 *
 * The one to convert has a repeated element in it: that is what becomes a JSON
 * array, and it is the only part of the mapping that is not obvious at a
 * glance.
 */

export const SAMPLES = {
  format: {
    a: [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<catalogue lang="en">',
      '<!-- prices exclude tax -->',
      '        <item sku="A-1"><name>Ratchet</name>',
      '   <price currency="GBP">18.00</price></item>',
      '  <item sku="A-2">',
      '<name>Socket set</name><price currency="GBP">42.50</price><note/>',
      '    </item>',
      '</catalogue>',
    ].join('\n'),
  },

  convert: {
    conversion: 'xml-json',
    a: [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<server name="renderer">',
      '  <region>eu-west</region>',
      '  <region>us-east</region>',
      '  <replicas>2</replicas>',
      '  <flags cache="true" debug="false"/>',
      '</server>',
    ].join('\n'),
  },
};
