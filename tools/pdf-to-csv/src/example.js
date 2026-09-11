/**
 * The example statement, built in the page.
 *
 * `ledger: true` is what this tool needs out of the shared builder and the
 * other three PDF tools do not: signed amounts and a running balance. Without
 * a balance column the example would demonstrate the converter with the only
 * claim it makes about correctness switched off, which is a poor advertisement
 * and a worse test.
 */

import { examplePdfFile } from './shared/example-pdf.js';

export function makeExample() {
  return examplePdfFile('example-statement.pdf', { pages: 3, ledger: true });
}
