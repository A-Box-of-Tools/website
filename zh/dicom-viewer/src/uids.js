/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const TRANSFER={
'1.2.840.10008.1.2':{
name:'Implicit VR Little Endian',
little:true,explicit:false,pixels:'native',
},
'1.2.840.10008.1.2.1':{
name:'Explicit VR Little Endian',
little:true,explicit:true,pixels:'native',
},
'1.2.840.10008.1.2.1.99':{
name:'Deflated Explicit VR Little Endian',
little:true,explicit:true,deflated:true,pixels:'native',
},
'1.2.840.10008.1.2.2':{
name:'Explicit VR Big Endian (retired)',
little:false,explicit:true,pixels:'native',
},
'1.2.840.10008.1.2.5':{
name:'RLE Lossless',
little:true,explicit:true,encapsulated:true,pixels:'rle',
},
'1.2.840.10008.1.2.4.50':{
name:'JPEG Baseline (process 1)',
little:true,explicit:true,encapsulated:true,pixels:'jpeg',
},
'1.2.840.10008.1.2.4.51':{
name:'JPEG Extended (process 2 & 4)',
little:true,explicit:true,encapsulated:true,pixels:'jpeg',
},
'1.2.840.10008.1.2.4.57':{
name:'JPEG Lossless, non-hierarchical (process 14)',
little:true,explicit:true,encapsulated:true,pixels:'lossless',
},
'1.2.840.10008.1.2.4.70':{
name:'JPEG Lossless, first-order prediction (process 14, selection value 1)',
little:true,explicit:true,encapsulated:true,pixels:'lossless',
},
'1.2.840.10008.1.2.4.80':{
name:'JPEG-LS Lossless',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.81':{
name:'JPEG-LS Lossy (near-lossless)',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.90':{
name:'JPEG 2000 Image Compression (lossless only)',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.91':{
name:'JPEG 2000 Image Compression',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.92':{
name:'JPEG 2000 Part 2 Multi-component (lossless only)',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.93':{
name:'JPEG 2000 Part 2 Multi-component',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.100':{
name:'MPEG2 Main Profile / Main Level',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.101':{
name:'MPEG2 Main Profile / High Level',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.102':{
name:'MPEG-4 AVC/H.264 High Profile / Level 4.1',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.107':{
name:'HEVC/H.265 Main Profile / Level 5.1',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.201':{
name:'High-Throughput JPEG 2000 (lossless only)',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
'1.2.840.10008.1.2.4.202':{
name:'High-Throughput JPEG 2000',
little:true,explicit:true,encapsulated:true,pixels:'no',
},
};
export function transferSyntax(uid){
const found=TRANSFER[uid];
if(found)return{uid,known:true,deflated:false,encapsulated:false,...found};
return{
uid,
known:false,
name:uid?`Unrecognised transfer syntax ${uid}`:'No transfer syntax declared',
little:true,
explicit:true,
deflated:false,
encapsulated:true,
pixels:'no',
};
}
export const IMPLICIT_LITTLE='1.2.840.10008.1.2';
const SOP_CLASS={
'1.2.840.10008.5.1.4.1.1.1':'Computed Radiography Image',
'1.2.840.10008.5.1.4.1.1.1.1':'Digital X-Ray Image (for presentation)',
'1.2.840.10008.5.1.4.1.1.1.1.1':'Digital X-Ray Image (for processing)',
'1.2.840.10008.5.1.4.1.1.1.2':'Digital Mammography X-Ray Image (for presentation)',
'1.2.840.10008.5.1.4.1.1.1.2.1':'Digital Mammography X-Ray Image (for processing)',
'1.2.840.10008.5.1.4.1.1.1.3':'Digital Intra-Oral X-Ray Image (for presentation)',
'1.2.840.10008.5.1.4.1.1.2':'CT Image',
'1.2.840.10008.5.1.4.1.1.2.1':'Enhanced CT Image',
'1.2.840.10008.5.1.4.1.1.3.1':'Ultrasound Multi-frame Image',
'1.2.840.10008.5.1.4.1.1.4':'MR Image',
'1.2.840.10008.5.1.4.1.1.4.1':'Enhanced MR Image',
'1.2.840.10008.5.1.4.1.1.4.2':'MR Spectroscopy',
'1.2.840.10008.5.1.4.1.1.6.1':'Ultrasound Image',
'1.2.840.10008.5.1.4.1.1.7':'Secondary Capture Image',
'1.2.840.10008.5.1.4.1.1.7.1':'Multi-frame Single Bit Secondary Capture Image',
'1.2.840.10008.5.1.4.1.1.7.2':'Multi-frame Greyscale Byte Secondary Capture Image',
'1.2.840.10008.5.1.4.1.1.7.3':'Multi-frame Greyscale Word Secondary Capture Image',
'1.2.840.10008.5.1.4.1.1.7.4':'Multi-frame True Colour Secondary Capture Image',
'1.2.840.10008.5.1.4.1.1.12.1':'X-Ray Angiographic Image',
'1.2.840.10008.5.1.4.1.1.12.2':'X-Ray Radiofluoroscopic Image',
'1.2.840.10008.5.1.4.1.1.20':'Nuclear Medicine Image',
'1.2.840.10008.5.1.4.1.1.66':'Raw Data',
'1.2.840.10008.5.1.4.1.1.77.1.6':'VL Whole Slide Microscopy Image',
'1.2.840.10008.5.1.4.1.1.88.11':'Basic Text Structured Report',
'1.2.840.10008.5.1.4.1.1.88.22':'Enhanced Structured Report',
'1.2.840.10008.5.1.4.1.1.88.33':'Comprehensive Structured Report',
'1.2.840.10008.5.1.4.1.1.104.1':'Encapsulated PDF',
'1.2.840.10008.5.1.4.1.1.104.2':'Encapsulated CDA',
'1.2.840.10008.5.1.4.1.1.128':'PET Image',
'1.2.840.10008.5.1.4.1.1.130':'Enhanced PET Image',
'1.2.840.10008.5.1.4.1.1.481.1':'RT Image',
'1.2.840.10008.5.1.4.1.1.481.2':'RT Dose',
'1.2.840.10008.5.1.4.1.1.481.3':'RT Structure Set',
'1.2.840.10008.1.3.10':'Media Storage Directory (DICOMDIR)',
};
export const sopClass=(uid)=>SOP_CLASS[uid]??null;
export function uidName(uid){
return sopClass(uid)??TRANSFER[uid]?.name??null;
}
