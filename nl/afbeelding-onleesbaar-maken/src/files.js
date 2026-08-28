/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{blockCount,blurRadius,strengthOf}from'./regions.js';
export function stemOf(name){
const clean=String(name??'').replace(/\.[^./\\]+$/,'');
return clean||'image';
}
export const STYLE_LABELS={
fill:'style.fill',
pixelate:'style.pixelate',
blur:'style.blur',
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
export function sizeText(bytes,t){
if(bytes<1024)return t('size.b',{n:bytes});
if(bytes<1024*1024)return t('size.kb',{n:(bytes/1024).toFixed(1)});
return t('size.mb',{n:(bytes/(1024*1024)).toFixed(2)});
}
export function describeRegion(region,strength,t){
const where=t('region.where',{
width:region.width,height:region.height,x:region.x,y:region.y,
});
if(region.style==='pixelate'){
const blocks=blockCount(region,strength);
return t('region.pixelated',{
where,size:blocks.size,across:blocks.across,down:blocks.down,
});
}
if(region.style==='blur'){
return t('region.blurred',{where,radius:blurRadius(region,strength)});
}
return t('region.filled',{where});
}
export function countSummary(regions,t){
if(regions.length===0)return'';
const counts={fill:0,pixelate:0,blur:0};
for(const region of regions)counts[region.style]=(counts[region.style]??0)+1;
const parts=Object.entries(counts)
.filter(([,n])=>n>0)
.map(([style,n])=>t(`${STYLE_LABELS[style]}.${n === 1 ? 'one' : 'many'}`,{n}))
.reduce((a,b)=>t('join.comma',{a,b}));
return t(regions.length===1?'count.one':'count.many',
{n:regions.length,parts});
}
export function riskNote(regions,strength,t){
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
parts.push(t('risk.mosaic',{
across:finest.across,
down:finest.down,
size:finest.size,
averages:finest.across*finest.down,
}));
}
if(blurs.length>0){
const radii=blurs.map((region)=>blurRadius(region,strength));
parts.push(t(blurs.length===1?'risk.blur.one':'risk.blur.many',
{radius:Math.min(...radii)}));
}
parts.push(t('risk.advice'));
return parts.reduce((a,b)=>t('join.sentences',{a,b}));
}
export function strengthNote(strength,t){
const chosen=strengthOf(strength);
return t('strength.note',{
label:t(chosen.label),blocks:chosen.blocks,blur:chosen.blur,
});
}
