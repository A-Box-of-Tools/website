/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{walk}from'./dicom.js';
import{describe,formatTag}from'./dictionary.js';
import{display}from'./values.js';
import{fileSize}from'./format.js';
export function report(file,decoder,t){
const lines=[];
const say=(text='')=>lines.push(text);
const labels=['report.filesize','report.syntax','report.object','report.image',
'report.frames','report.spacing'].map((key)=>t(key));
const width=Math.max(...labels.map((label)=>label.length))+2;
const[size,syntax,object,image,frames,spacing]=labels;
const row=(label,value)=>say(`${pad(label, width)}${value}`);
say(t('report.title',{name:file.name}));
say('='.repeat(Math.min(72,16+file.name.length)));
say();
row(size,t('report.size',{
size:fileSize(file.size),
bytes:t('report.bytes',{count:file.size.toLocaleString()}),
}));
row(syntax,file.syntax.name);
row('',file.syntax.uid);
if(file.sopClass)row(object,file.sopClass);
if(file.image){
const{rows,columns,samplesPerPixel,bitsStored,frames:count,photometric}=file.image;
row(image,`${columns} × ${rows}, ${t('report.bits', { bits: bitsStored })}, ${
      samplesPerPixel === 1
        ? t('report.greyscale')
        : t('report.samples', { count: samplesPerPixel })}, ${photometric}`
);
if(count>1)row(frames,count);
if(file.image.spacing){
row(spacing,t('report.spacing.value',{
row:file.image.spacing.row,column:file.image.spacing.column,
}));
}
}
if(file.warnings.length){
const heading=t('report.notes');
say();
say(heading);
say('-'.repeat(heading.length));
for(const warning of file.warnings)say(`  • ${t(warning.key, warning.values)}`);
}
const meta=t('report.meta');
say();
say(meta);
say('-'.repeat(meta.length));
dump(file.meta,decoder,say,t);
const dataset=t('report.dataset');
say();
say(dataset);
say('-'.repeat(dataset.length));
dump(file.dataset,decoder,say,t);
say();
say(t('report.origin',{origin:file.origin}));
return lines.join('\n');
}
function dump(dataset,decoder,say,t){
if(!dataset||dataset.elements.length===0){
say(`  ${t('report.none')}`);
return;
}
for(const{element,depth}of walk(dataset)){
const indent='  '.repeat(depth+1);
const known=describe(element.tag);
const name=known.name??t(known.private?'tag.private':'tag.unknown');
const{shown}=display(element,decoder,t);
say(`${indent}${formatTag(element.tag)} ${element.vr} ${pad(name, 44 - depth * 2)} ${shown}`);
}
}
const pad=(text,width)=>(text.length>=width?text:text+' '.repeat(width-text.length));
