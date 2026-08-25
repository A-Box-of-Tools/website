/**
 * Tag names, and the value representation of a tag in a file that did not say.
 *
 * WHY A DICTIONARY IS NOT OPTIONAL
 *
 * In Implicit VR Little Endian - still the default transfer syntax, and what
 * most of what comes off a hospital CD is written in - an element is a tag, a
 * 32-bit length, and that many bytes. Nothing in the file says whether those
 * bytes are a number, a name or a date. The only way to know is to look the tag
 * up in the data dictionary of PS3.6, which is why every DICOM reader carries
 * one and why a tag that is not in it can only be shown as bytes.
 *
 * WHY THIS ONE IS SHORT
 *
 * PS3.6 has about four thousand entries. Shipping all of them would be a
 * quarter of a megabyte of JavaScript in eleven languages for the sake of tags
 * a viewer never reads and a reader has never seen. What is here is everything
 * this tool actually uses - the pixel module, the modality and VOI transforms,
 * the geometry a slice needs - plus everything the identification panel has an
 * opinion about, plus the tags somebody reading a header expects to find in it.
 *
 * A tag not in here is not dropped. `describe` answers with a VR of UN and no
 * name, the page prints the number and the length, and the element still counts
 * towards the totals. The failure mode of a short dictionary should be a less
 * useful row, never a missing one.
 */

/**
 * tag -> [value representation, name].
 *
 * The tag is the group and element as eight lower-case hex digits, which is how
 * dicom.js keys everything, and the names are the ones PS3.6 gives them.
 */
const TAGS = {
  /* --- file meta, group 0002. Always explicit VR, so the VRs here are only
     ever used for display; the names are the point. ------------------------ */
  '00020000': ['UL', 'File Meta Information Group Length'],
  '00020001': ['OB', 'File Meta Information Version'],
  '00020002': ['UI', 'Media Storage SOP Class UID'],
  '00020003': ['UI', 'Media Storage SOP Instance UID'],
  '00020010': ['UI', 'Transfer Syntax UID'],
  '00020012': ['UI', 'Implementation Class UID'],
  '00020013': ['SH', 'Implementation Version Name'],
  '00020016': ['AE', 'Source Application Entity Title'],
  '00020017': ['AE', 'Sending Application Entity Title'],
  '00020018': ['AE', 'Receiving Application Entity Title'],
  '00020026': ['UR', 'Source Presentation Address'],
  '00020100': ['UI', 'Private Information Creator UID'],
  '00020102': ['OB', 'Private Information'],

  /* --- identification and the study --------------------------------------- */
  '00080005': ['CS', 'Specific Character Set'],
  '00080008': ['CS', 'Image Type'],
  '00080012': ['DA', 'Instance Creation Date'],
  '00080013': ['TM', 'Instance Creation Time'],
  '00080014': ['UI', 'Instance Creator UID'],
  '00080016': ['UI', 'SOP Class UID'],
  '00080018': ['UI', 'SOP Instance UID'],
  '00080020': ['DA', 'Study Date'],
  '00080021': ['DA', 'Series Date'],
  '00080022': ['DA', 'Acquisition Date'],
  '00080023': ['DA', 'Content Date'],
  '0008002a': ['DT', 'Acquisition DateTime'],
  '00080030': ['TM', 'Study Time'],
  '00080031': ['TM', 'Series Time'],
  '00080032': ['TM', 'Acquisition Time'],
  '00080033': ['TM', 'Content Time'],
  '00080050': ['SH', 'Accession Number'],
  '00080060': ['CS', 'Modality'],
  '00080061': ['CS', 'Modalities in Study'],
  '00080064': ['CS', 'Conversion Type'],
  '00080068': ['CS', 'Presentation Intent Type'],
  '00080070': ['LO', 'Manufacturer'],
  '00080080': ['LO', 'Institution Name'],
  '00080081': ['ST', 'Institution Address'],
  '00080082': ['SQ', 'Institution Code Sequence'],
  '00080090': ['PN', 'Referring Physician’s Name'],
  '00080092': ['ST', 'Referring Physician’s Address'],
  '00080094': ['SH', 'Referring Physician’s Telephone Numbers'],
  '00080096': ['SQ', 'Referring Physician Identification Sequence'],
  '00081010': ['SH', 'Station Name'],
  '00081030': ['LO', 'Study Description'],
  '00081032': ['SQ', 'Procedure Code Sequence'],
  '0008103e': ['LO', 'Series Description'],
  '00081040': ['LO', 'Institutional Department Name'],
  '00081048': ['PN', 'Physician(s) of Record'],
  '00081050': ['PN', 'Performing Physician’s Name'],
  '00081060': ['PN', 'Name of Physician(s) Reading Study'],
  '00081070': ['PN', 'Operators’ Name'],
  '00081080': ['LO', 'Admitting Diagnoses Description'],
  '00081084': ['SQ', 'Admitting Diagnoses Code Sequence'],
  '00081090': ['LO', 'Manufacturer’s Model Name'],
  '00081111': ['SQ', 'Referenced Performed Procedure Step Sequence'],
  '00081115': ['SQ', 'Referenced Series Sequence'],
  '00081140': ['SQ', 'Referenced Image Sequence'],
  '00081150': ['UI', 'Referenced SOP Class UID'],
  '00081155': ['UI', 'Referenced SOP Instance UID'],
  '00082111': ['ST', 'Derivation Description'],
  '00082112': ['SQ', 'Source Image Sequence'],
  '00083010': ['UI', 'Irradiation Event UID'],
  '00089007': ['CS', 'Frame Type'],

  /* --- the patient -------------------------------------------------------- */
  '00100010': ['PN', 'Patient’s Name'],
  '00100020': ['LO', 'Patient ID'],
  '00100021': ['LO', 'Issuer of Patient ID'],
  '00100030': ['DA', 'Patient’s Birth Date'],
  '00100032': ['TM', 'Patient’s Birth Time'],
  '00100040': ['CS', 'Patient’s Sex'],
  '00100050': ['SQ', 'Patient’s Insurance Plan Code Sequence'],
  '00101000': ['LO', 'Other Patient IDs'],
  '00101001': ['PN', 'Other Patient Names'],
  '00101002': ['SQ', 'Other Patient IDs Sequence'],
  '00101005': ['PN', 'Patient’s Birth Name'],
  '00101010': ['AS', 'Patient’s Age'],
  '00101020': ['DS', 'Patient’s Size'],
  '00101030': ['DS', 'Patient’s Weight'],
  '00101040': ['LO', 'Patient’s Address'],
  '00101060': ['PN', 'Patient’s Mother’s Birth Name'],
  '00101080': ['LO', 'Military Rank'],
  '00101090': ['LO', 'Medical Record Locator'],
  '00102000': ['LO', 'Medical Alerts'],
  '00102110': ['LO', 'Allergies'],
  '00102150': ['LO', 'Country of Residence'],
  '00102152': ['LO', 'Region of Residence'],
  '00102154': ['SH', 'Patient’s Telephone Numbers'],
  '00102160': ['SH', 'Ethnic Group'],
  '00102180': ['SH', 'Occupation'],
  '00102201': ['LO', 'Patient Species Description'],
  '00102297': ['PN', 'Responsible Person'],
  '00102299': ['LO', 'Responsible Organization'],
  '001021b0': ['LT', 'Additional Patient History'],
  '00104000': ['LT', 'Patient Comments'],

  /* --- how the picture was made ------------------------------------------- */
  '00180010': ['LO', 'Contrast/Bolus Agent'],
  '00180015': ['CS', 'Body Part Examined'],
  '00180020': ['CS', 'Scanning Sequence'],
  '00180021': ['CS', 'Sequence Variant'],
  '00180022': ['CS', 'Scan Options'],
  '00180023': ['CS', 'MR Acquisition Type'],
  '00180024': ['SH', 'Sequence Name'],
  '00180050': ['DS', 'Slice Thickness'],
  '00180060': ['DS', 'KVP'],
  '00180080': ['DS', 'Repetition Time'],
  '00180081': ['DS', 'Echo Time'],
  '00180082': ['DS', 'Inversion Time'],
  '00180083': ['DS', 'Number of Averages'],
  '00180084': ['DS', 'Imaging Frequency'],
  '00180085': ['SH', 'Imaged Nucleus'],
  '00180086': ['IS', 'Echo Numbers'],
  '00180087': ['DS', 'Magnetic Field Strength'],
  '00180088': ['DS', 'Spacing Between Slices'],
  '00180089': ['IS', 'Number of Phase Encoding Steps'],
  '00180090': ['DS', 'Data Collection Diameter'],
  '00180091': ['IS', 'Echo Train Length'],
  '00181000': ['LO', 'Device Serial Number'],
  '00181004': ['LO', 'Plate ID'],
  '00181020': ['LO', 'Software Versions'],
  '00181030': ['LO', 'Protocol Name'],
  '00181040': ['LO', 'Contrast/Bolus Route'],
  '00181050': ['DS', 'Spatial Resolution'],
  '00181060': ['DS', 'Trigger Time'],
  '00181063': ['DS', 'Frame Time'],
  '00181064': ['LO', 'Cardiac Framing Type'],
  '00181066': ['DS', 'Nominal Interval'],
  '00181088': ['IS', 'Heart Rate'],
  '00181100': ['DS', 'Reconstruction Diameter'],
  '00181110': ['DS', 'Distance Source to Detector'],
  '00181111': ['DS', 'Distance Source to Patient'],
  '00181120': ['DS', 'Gantry/Detector Tilt'],
  '00181130': ['DS', 'Table Height'],
  '00181140': ['CS', 'Rotation Direction'],
  '00181150': ['IS', 'Exposure Time'],
  '00181151': ['IS', 'X-Ray Tube Current'],
  '00181152': ['IS', 'Exposure'],
  '00181160': ['SH', 'Filter Type'],
  '00181164': ['DS', 'Imager Pixel Spacing'],
  '00181170': ['IS', 'Generator Power'],
  '00181190': ['DS', 'Focal Spot(s)'],
  '00181200': ['DA', 'Date of Last Calibration'],
  '00181201': ['TM', 'Time of Last Calibration'],
  '00181210': ['SH', 'Convolution Kernel'],
  '00181242': ['IS', 'Actual Frame Duration'],
  '00181250': ['SH', 'Receive Coil Name'],
  '00181251': ['SH', 'Transmit Coil Name'],
  '00181260': ['SH', 'Plate Type'],
  '00181310': ['US', 'Acquisition Matrix'],
  '00181312': ['CS', 'In-plane Phase Encoding Direction'],
  '00181314': ['DS', 'Flip Angle'],
  '00181315': ['CS', 'Variable Flip Angle Flag'],
  '00181316': ['DS', 'SAR'],
  '00181318': ['DS', 'dB/dt'],
  '00185100': ['CS', 'Patient Position'],
  '00186000': ['DS', 'Sensitivity'],
  '00189073': ['FD', 'Acquisition Duration'],
  '0018a001': ['SQ', 'Contributing Equipment Sequence'],

  /* --- where the picture is, and what it belongs to ------------------------ */
  '0020000d': ['UI', 'Study Instance UID'],
  '0020000e': ['UI', 'Series Instance UID'],
  '00200010': ['SH', 'Study ID'],
  '00200011': ['IS', 'Series Number'],
  '00200012': ['IS', 'Acquisition Number'],
  '00200013': ['IS', 'Instance Number'],
  '00200020': ['CS', 'Patient Orientation'],
  '00200032': ['DS', 'Image Position (Patient)'],
  '00200037': ['DS', 'Image Orientation (Patient)'],
  '00200052': ['UI', 'Frame of Reference UID'],
  '00200060': ['CS', 'Laterality'],
  '00201040': ['LO', 'Position Reference Indicator'],
  '00201041': ['DS', 'Slice Location'],
  '00201209': ['IS', 'Number of Series Related Instances'],
  '00204000': ['LT', 'Image Comments'],
  '00209056': ['SH', 'Stack ID'],
  '00209057': ['UL', 'In-Stack Position Number'],
  '00209113': ['SQ', 'Plane Position Sequence'],
  '00209116': ['SQ', 'Plane Orientation Sequence'],
  '00209128': ['UL', 'Temporal Position Index'],

  /* --- the pixels --------------------------------------------------------- */
  '00280002': ['US', 'Samples per Pixel'],
  '00280004': ['CS', 'Photometric Interpretation'],
  '00280006': ['US', 'Planar Configuration'],
  '00280008': ['IS', 'Number of Frames'],
  '00280009': ['AT', 'Frame Increment Pointer'],
  '00280010': ['US', 'Rows'],
  '00280011': ['US', 'Columns'],
  '00280030': ['DS', 'Pixel Spacing'],
  '00280034': ['IS', 'Pixel Aspect Ratio'],
  '00280051': ['CS', 'Corrected Image'],
  '00280100': ['US', 'Bits Allocated'],
  '00280101': ['US', 'Bits Stored'],
  '00280102': ['US', 'High Bit'],
  '00280103': ['US', 'Pixel Representation'],
  '00280106': ['US', 'Smallest Image Pixel Value'],
  '00280107': ['US', 'Largest Image Pixel Value'],
  '00280120': ['US', 'Pixel Padding Value'],
  '00280121': ['US', 'Pixel Padding Range Limit'],
  '00281050': ['DS', 'Window Center'],
  '00281051': ['DS', 'Window Width'],
  '00281052': ['DS', 'Rescale Intercept'],
  '00281053': ['DS', 'Rescale Slope'],
  '00281054': ['LO', 'Rescale Type'],
  '00281055': ['LO', 'Window Center & Width Explanation'],
  '00281056': ['CS', 'VOI LUT Function'],
  '00281101': ['US', 'Red Palette Colour Lookup Table Descriptor'],
  '00281102': ['US', 'Green Palette Colour Lookup Table Descriptor'],
  '00281103': ['US', 'Blue Palette Colour Lookup Table Descriptor'],
  '00281201': ['OW', 'Red Palette Colour Lookup Table Data'],
  '00281202': ['OW', 'Green Palette Colour Lookup Table Data'],
  '00281203': ['OW', 'Blue Palette Colour Lookup Table Data'],
  '00282110': ['CS', 'Lossy Image Compression'],
  '00282112': ['DS', 'Lossy Image Compression Ratio'],
  '00282114': ['CS', 'Lossy Image Compression Method'],
  '00283000': ['SQ', 'Modality LUT Sequence'],
  '00283002': ['US', 'LUT Descriptor'],
  '00283003': ['LO', 'LUT Explanation'],
  '00283004': ['LO', 'Modality LUT Type'],
  '00283006': ['OW', 'LUT Data'],
  '00283010': ['SQ', 'VOI LUT Sequence'],
  '00287fe0': ['UR', 'Pixel Data Provider URL'],
  '00289110': ['SQ', 'Pixel Measures Sequence'],
  '00289132': ['SQ', 'Frame VOI LUT Sequence'],
  '00289145': ['SQ', 'Pixel Value Transformation Sequence'],
  '7fe00010': ['OW', 'Pixel Data'],

  /* --- the functional groups, which is where a modern multi-frame keeps the
     numbers that used to sit at the top level ------------------------------ */
  '52009229': ['SQ', 'Shared Functional Groups Sequence'],
  '52009230': ['SQ', 'Per-frame Functional Groups Sequence'],

  /* --- the study as an order ---------------------------------------------- */
  '00321032': ['PN', 'Requesting Physician'],
  '00321033': ['LO', 'Requesting Service'],
  '00321060': ['LO', 'Requested Procedure Description'],
  '00380010': ['LO', 'Admission ID'],
  '00380300': ['LO', 'Current Patient Location'],
  '00380400': ['LO', 'Patient’s Institution Residence'],
  '00380500': ['LO', 'Patient State'],
  '00384000': ['LT', 'Visit Comments'],
  '00400002': ['DA', 'Scheduled Procedure Step Start Date'],
  '00400003': ['TM', 'Scheduled Procedure Step Start Time'],
  '00400006': ['PN', 'Scheduled Performing Physician’s Name'],
  '00400007': ['LO', 'Scheduled Procedure Step Description'],
  '00400009': ['SH', 'Scheduled Procedure Step ID'],
  '00400241': ['AE', 'Performed Station AE Title'],
  '00400244': ['DA', 'Performed Procedure Step Start Date'],
  '00400245': ['TM', 'Performed Procedure Step Start Time'],
  '00400253': ['SH', 'Performed Procedure Step ID'],
  '00400254': ['LO', 'Performed Procedure Step Description'],
  '00400275': ['SQ', 'Request Attributes Sequence'],
  '00401001': ['SH', 'Requested Procedure ID'],
  '00402016': ['LO', 'Placer Order Number / Imaging Service Request'],
  '00402017': ['LO', 'Filler Order Number / Imaging Service Request'],
  '00408302': ['DS', 'Entrance Dose in mGy'],
  '0040a123': ['PN', 'Person Name'],
  '0040a730': ['SQ', 'Content Sequence'],

  /* --- what somebody wrote on it ------------------------------------------ */
  '00700001': ['SQ', 'Graphic Annotation Sequence'],
  '00700084': ['PN', 'Content Creator’s Name'],
  '20500020': ['CS', 'Presentation LUT Shape'],
  '4008010c': ['PN', 'Interpretation Author'],
  '40080114': ['PN', 'Physician Approving Interpretation'],
  '4008011a': ['PN', 'Interpretation Recorder'],
  '40080300': ['ST', 'Impressions'],
};

/**
 * The tags that repeat across a range of groups, which a flat table cannot
 * hold.
 *
 * Overlays occupy every even group from 6000 to 601e and curves every even
 * group from 5000 to 501e, with the same element numbers in each. Sixteen
 * copies of each row would be a lot of table for something one pattern says
 * once.
 */
const REPEATED = [
  [/^60[0-9a-f]{2}0010$/, ['US', 'Overlay Rows']],
  [/^60[0-9a-f]{2}0011$/, ['US', 'Overlay Columns']],
  [/^60[0-9a-f]{2}0015$/, ['IS', 'Number of Frames in Overlay']],
  [/^60[0-9a-f]{2}0022$/, ['LO', 'Overlay Description']],
  [/^60[0-9a-f]{2}0040$/, ['CS', 'Overlay Type']],
  [/^60[0-9a-f]{2}0050$/, ['SS', 'Overlay Origin']],
  [/^60[0-9a-f]{2}0100$/, ['US', 'Overlay Bits Allocated']],
  [/^60[0-9a-f]{2}0102$/, ['US', 'Overlay Bit Position']],
  [/^60[0-9a-f]{2}1500$/, ['LO', 'Overlay Label']],
  [/^60[0-9a-f]{2}3000$/, ['OW', 'Overlay Data']],
  [/^50[0-9a-f]{2}0005$/, ['US', 'Curve Dimensions']],
  [/^50[0-9a-f]{2}3000$/, ['OW', 'Curve Data']],
];

/**
 * What is known about one tag.
 *
 * @param {string} tag  eight lower-case hex digits
 * @returns {{vr: string, name: string|null, private?: boolean}}
 */
export function describe(tag) {
  const found = TAGS[tag];
  if (found) return { vr: found[0], name: found[1] };

  for (const [pattern, entry] of REPEATED) {
    if (pattern.test(tag)) return { vr: entry[0], name: entry[1] };
  }

  // Every group may carry a (gggg,0000) holding the number of bytes the rest of
  // the group occupies. It is a UL in every group there is, so a dictionary
  // entry per group would be four thousand rows of the same answer.
  if (tag.endsWith('0000')) return { vr: 'UL', name: 'Group Length' };

  // An odd group number is a private element: the manufacturer's own, with
  // meanings published nowhere this tool could look them up. Which is worth
  // saying on the row rather than leaving as a blank name, because "nobody
  // outside the company that wrote it knows what this is" is information.
  if (isPrivate(tag)) return { vr: 'UN', name: null, private: true };

  return { vr: 'UN', name: null };
}

/** Private elements live in odd-numbered groups. PS3.5 section 7.8. */
export function isPrivate(tag) {
  return (parseInt(tag.slice(0, 4), 16) & 1) === 1;
}

/** `(0010,0010)`, which is how the standard and every other tool write a tag. */
export const formatTag = (tag) => `(${tag.slice(0, 4)},${tag.slice(4)})`.toUpperCase();
