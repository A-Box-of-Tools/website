/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{walk}from'./dicom.js';
import{describe,formatTag}from'./dictionary.js';
import{display}from'./values.js';
import{fileSize}from'./format.js';
export function report(file,decoder){
const lines=[];
const say=(text='')=>lines.push(text);
say(`DICOM header — ${file.name}`);
say('='.repeat(Math.min(72,16+file.name.length)));
say();
say(`File size          ${fileSize(file.size)} (${file.size.toLocaleString()} bytes)`);
say(`Transfer syntax    ${file.syntax.name}`);
say(`                   ${file.syntax.uid}`);
if(file.sopClass)say(`Object             ${file.sopClass}`);
if(file.image){
const{rows,columns,samplesPerPixel,bitsStored,frames,photometric}=file.image;
say(`Image              ${columns} × ${rows}, ${bitsStored}-bit, ${
      samplesPerPixel === 1 ? 'greyscale' : `${samplesPerPixel} samples`}, ${photometric}`
);
if(frames>1)say(`Frames             ${frames}`);
if(file.image.spacing){
say(`Pixel spacing      ${file.image.spacing.row} × ${file.image.spacing.column} mm`);
}
}
if(file.warnings.length){
say();
say('Notes on reading this file');
say('-'.repeat(26));
for(const warning of file.warnings)say(`  • ${warning}`);
}
say();
say('File meta information');
say('-'.repeat(21));
dump(file.meta,decoder,say);
say();
say('Dataset');
say('-'.repeat(7));
dump(file.dataset,decoder,say);
say();
say(`Read in a browser at ${file.origin}, which uploads nothing.`);
return lines.join('\n');
}
function dump(dataset,decoder,say){
if(!dataset||dataset.elements.length===0){
say('  (none)');
return;
}
for(const{element,depth}of walk(dataset)){
const indent='  '.repeat(depth+1);
const known=describe(element.tag);
const name=known.name??(known.private?'(private)':'(unknown)');
const{shown}=display(element,decoder);
say(`${indent}${formatTag(element.tag)} ${element.vr} ${pad(name, 44 - depth * 2)} ${shown}`);
}
}
const pad=(text,width)=>(text.length>=width?text:text+' '.repeat(width-text.length));
