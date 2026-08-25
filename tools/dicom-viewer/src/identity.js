/**
 * Which of a file's tags name a person, and how directly.
 *
 * WHY A VIEWER HAS AN OPINION ABOUT THIS AT ALL
 *
 * Because the thing people get wrong about a DICOM file is not that it has a
 * patient name in it. It is how much else it has. A file that somebody has
 * carefully blanked the name out of still carries the accession number, the
 * birth date, the referring physician, the institution, the scanner's serial
 * number and the study UID - and those together identify a person about as well
 * as the name did. The private tags of some scanners carry the name again in a
 * field nobody outside the manufacturer can read.
 *
 * So the page lists them. Not to anonymise anything - this tool writes nothing
 * and changes nothing - but because "what is in this file about the person it
 * is of" is a question somebody about to put a slice in a teaching deck needs
 * answered, and no viewer answers it.
 *
 * WHERE THE LIST COMES FROM
 *
 * PS3.15 table E.1-1, the Basic Application Level Confidentiality Profile: the
 * standard's own list of what has to go before a dataset can be called
 * de-identified. It is longer than this - it runs to several hundred entries
 * including every private tag - so what is here is the part of it a person
 * would recognise on sight, with the rest reported in aggregate.
 *
 * `direct` is a tag that names or numbers the person. `context` is a tag that
 * narrows down who they could be: a date, a place, a machine, or an identifier
 * that a hospital could look up. The distinction matters because the second
 * kind is what survives a careless anonymisation.
 */

import { describe, isPrivate } from './dictionary.js';

/** tag -> how directly it identifies. */
const IDENTIFIERS = {
  '00100010': 'direct',   // Patient's Name
  '00100020': 'direct',   // Patient ID
  '00100021': 'direct',   // Issuer of Patient ID
  '00101000': 'direct',   // Other Patient IDs
  '00101001': 'direct',   // Other Patient Names
  '00101005': 'direct',   // Patient's Birth Name
  '00101040': 'direct',   // Patient's Address
  '00101060': 'direct',   // Patient's Mother's Birth Name
  '00102154': 'direct',   // Patient's Telephone Numbers
  '00101090': 'direct',   // Medical Record Locator
  '00102297': 'direct',   // Responsible Person
  '00380010': 'direct',   // Admission ID
  '00080050': 'direct',   // Accession Number
  '00402016': 'direct',   // Placer Order Number
  '00402017': 'direct',   // Filler Order Number

  '00100030': 'context',  // Patient's Birth Date
  '00100032': 'context',  // Patient's Birth Time
  '00100040': 'context',  // Patient's Sex
  '00101010': 'context',  // Patient's Age
  '00101020': 'context',  // Patient's Size
  '00101030': 'context',  // Patient's Weight
  '00102150': 'context',  // Country of Residence
  '00102152': 'context',  // Region of Residence
  '00102160': 'context',  // Ethnic Group
  '00102180': 'context',  // Occupation
  '00102000': 'context',  // Medical Alerts
  '00102110': 'context',  // Allergies
  '001021b0': 'context',  // Additional Patient History
  '00104000': 'context',  // Patient Comments
  '00101080': 'context',  // Military Rank
  '00102299': 'context',  // Responsible Organization

  '00080080': 'context',  // Institution Name
  '00080081': 'context',  // Institution Address
  '00080090': 'context',  // Referring Physician's Name
  '00080092': 'context',  // Referring Physician's Address
  '00080094': 'context',  // Referring Physician's Telephone Numbers
  '00081010': 'context',  // Station Name
  '00081040': 'context',  // Institutional Department Name
  '00081048': 'context',  // Physician(s) of Record
  '00081050': 'context',  // Performing Physician's Name
  '00081060': 'context',  // Name of Physician(s) Reading Study
  '00081070': 'context',  // Operators' Name
  '00081080': 'context',  // Admitting Diagnoses Description
  '00321032': 'context',  // Requesting Physician
  '00321033': 'context',  // Requesting Service
  '00321060': 'context',  // Requested Procedure Description
  '00400006': 'context',  // Scheduled Performing Physician's Name
  '00700084': 'context',  // Content Creator's Name
  '0040a123': 'context',  // Person Name
  '4008010c': 'context',  // Interpretation Author
  '40080114': 'context',  // Physician Approving Interpretation
  '4008011a': 'context',  // Interpretation Recorder

  '00080020': 'context',  // Study Date
  '00080021': 'context',  // Series Date
  '00080022': 'context',  // Acquisition Date
  '00080023': 'context',  // Content Date
  '00080030': 'context',  // Study Time
  '00080031': 'context',  // Series Time
  '00080032': 'context',  // Acquisition Time
  '00080033': 'context',  // Content Time
  '0008002a': 'context',  // Acquisition DateTime
  '00080012': 'context',  // Instance Creation Date
  '00080013': 'context',  // Instance Creation Time
  '00400244': 'context',  // Performed Procedure Step Start Date
  '00400245': 'context',  // Performed Procedure Step Start Time
  '00400002': 'context',  // Scheduled Procedure Step Start Date
  '00400003': 'context',  // Scheduled Procedure Step Start Time

  '00181000': 'context',  // Device Serial Number
  '00200010': 'context',  // Study ID
  '00401001': 'context',  // Requested Procedure ID
  '00400253': 'context',  // Performed Procedure Step ID
  '00400009': 'context',  // Scheduled Procedure Step ID
  '00204000': 'context',  // Image Comments
  '00384000': 'context',  // Visit Comments
  '00380300': 'context',  // Current Patient Location
  '00380400': 'context',  // Patient's Institution Residence
};

/**
 * The identifiers this dataset actually carries, with their values.
 *
 * An element that is present and empty is *not* reported. A file whose Patient's
 * Name is a zero-length value has had the name taken out, and listing it as an
 * identifier would tell somebody their anonymiser had not worked when it had.
 *
 * @param {Iterable<{element: object, depth: number}>} elements  from dicom.js `walk`
 * @param {(element: object) => {shown: string}} show  values.js `display`, bound
 *   to this file's character set
 */
export function identifiers(elements, show) {
  const found = [];
  let privateCount = 0;
  let uidCount = 0;

  for (const { element } of elements) {
    const level = IDENTIFIERS[element.tag];

    if (isPrivate(element.tag) && element.length > 0 && !element.items) {
      privateCount += 1;
    }

    // The UIDs are their own category. A study instance UID identifies nobody
    // by itself and is a perfect key into the archive that made it, which is
    // why the standard requires them to be replaced rather than merely blanked.
    if (element.vr === 'UI' && UID_TAGS.has(element.tag) && element.length > 0) {
      uidCount += 1;
    }

    if (!level) continue;
    if (!element.value || element.length === 0) continue;

    const { shown } = show(element);
    if (!shown || shown === '(empty)') continue;

    found.push({ tag: element.tag, name: describe(element.tag).name, level, value: shown });
  }

  return { found, privateCount, uidCount };
}

/** The identifiers that are keys into an archive rather than names of a person. */
const UID_TAGS = new Set([
  '0020000d',   // Study Instance UID
  '0020000e',   // Series Instance UID
  '00080018',   // SOP Instance UID
  '00200052',   // Frame of Reference UID
  '00080014',   // Instance Creator UID
  '00083010',   // Irradiation Event UID
]);
