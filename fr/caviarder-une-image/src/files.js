/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{blockCount,blurRadius,strengthOf}from'./regions.js';
export function stemOf(name){
const clean=String(name??'').replace(/\.[^./\\]+$/,'');
return clean||'image';
}
export const STYLE_LABELS={
fill:'blacked out',
pixelate:'pixelated',
blur:'blurred',
};
export const FORMATS={
png:{id:'png',mime:'image/png',extension:'png',lossy:false},
jpeg:{id:'jpeg',mime:'image/jpeg',extension:'jpg',lossy:true},
webp:{id:'webp',mime:'image/webp',extension:'webp',lossy:true},
};
export function chooseFormat(choice,sourceType=''){
if(choice!=='auto')return FORMATS[choice]??FORMATS.png;
return sourceType==='image/jpeg'?FORMATS.jpeg:FORMATS.png;
}
export function outName(stem,format){
const safe=String(stem).replace(/[^\w-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,60)
||'image';
return`${safe}-redacted.${format.extension}`;
}
export function sizeText(bytes){
if(bytes<1024)return`${bytes} B`;
if(bytes<1024*1024)return`${(bytes / 1024).toFixed(1)} KB`;
return`${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
export function describeRegion(region,strength){
const where=`${region.width} x ${region.height} at ${region.x}, ${region.y}`;
if(region.style==='pixelate'){
const blocks=blockCount(region,strength);
return`${where} - pixelated, ${blocks.size} px blocks (${blocks.across} x ${blocks.down})`;
}
if(region.style==='blur'){
return`${where} - blurred, ${blurRadius(region, strength)} px radius`;
}
return`${where} - blacked out`;
}
export function countSummary(regions){
if(regions.length===0)return'';
const counts={fill:0,pixelate:0,blur:0};
for(const region of regions)counts[region.style]=(counts[region.style]??0)+1;
const parts=Object.entries(counts)
.filter(([,n])=>n>0)
.map(([style,n])=>`${n} ${STYLE_LABELS[style]}`);
const noun=regions.length===1?'area':'areas';
return`${regions.length} ${noun}: ${parts.join(', ')}.`;
}
export function riskNote(regions,strength){
const soft=regions.filter((region)=>region.style!=='fill');
if(soft.length===0)return null;
const mosaics=soft.filter((region)=>region.style==='pixelate');
const blurs=soft.filter((region)=>region.style==='blur');
const parts=[];
if(mosaics.length>0){
const finest=mosaics
.map((region)=>blockCount(region,strength))
.reduce((worst,blocks)=>(blocks.across*blocks.down>worst.across*worst.down
?blocks:worst));
parts.push(
`The finest mosaic here is ${finest.across} x ${finest.down} blocks of ${finest.size} px. `
+`That is ${finest.across * finest.down} averages of what was underneath, left in the file.`,
);
}
if(blurs.length>0){
const radii=blurs.map((region)=>blurRadius(region,strength));
parts.push(
`${blurs.length === 1 ? 'The blur' : 'The smallest blur'} has a radius of `
+`${Math.min(...radii)} px. A blur is an average too, and a small one over sharp `
+'text is the case that has been worked backwards.',
);
}
parts.push('Black out anything that reads as text.');
return parts.join(' ');
}
export function strengthNote(strength){
const chosen=strengthOf(strength);
return`${chosen.label} - about ${chosen.blocks} blocks across the shorter side of a box, `
+`and a blur radius of a ${chosen.blur}th of it.`;
}
