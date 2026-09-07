/**
 * The scan behind the "Try an example" button.
 *
 * This tool is the hardest on the site to try, and the reason is not
 * technical: almost nobody has a .dcm to hand unless they were given one, and
 * anybody who was given one was given a scan of a real person - which is the
 * last file to go experimenting with on a site you are still deciding whether
 * to trust. So the example matters more here than anywhere else.
 *
 * It is a CT phantom rather than anatomy. See shared/js/example-dicom.js.
 */

import { exampleDicomFile } from './shared/example-dicom.js';

export function makeExample() {
  return exampleDicomFile('example.dcm');
}
