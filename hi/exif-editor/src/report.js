/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{describeTag,GROUP_LABELS}from'./tags.js';
import{GROUP_ORDER}from'./tiff.js';
const MAX_LIST=8;
export function formatValue(group,entry){
const spec=describeTag(group,entry.tag);
const{value}=entry;
if(value===null||value===undefined){
return{key:'value.raw',values:{bytes:entry.raw.length}};
}
if(typeof value==='string')return value.length?value:{key:'value.empty'};
if(spec.values&&typeof value==='number'){
return spec.values[value]??{key:'value.unknown',values:{value}};
}
if(spec.format){
const formatted=spec.format(value);
if(formatted)return formatted;
}
if(Array.isArray(entry.pairs)&&typeof entry.pairs[0]==='number'){
const[num,den]=entry.pairs;
if(den!==1&&den!==0)return`${num}/${den}${spec.unit ? ` ${spec.unit}` : ''}`;
}
if(Array.isArray(value)){
const shown=value.slice(0,MAX_LIST).map(short).join(', ');
if(value.length<=MAX_LIST)return shown;
return{key:'value.more',values:{shown,more:value.length-MAX_LIST}};
}
return spec.unit?`${short(value)} ${spec.unit}`:short(value);
}
const short=(n)=>(typeof n==='number'&&!Number.isInteger(n)?Number(n.toFixed(4)).toString():String(n));
export function readPosition(gps){
if(!gps?.length)return null;
const find=(tag)=>gps.find((e)=>e.tag===tag)?.value;
const lat=toDegrees(find(0x0002),find(0x0001));
const lon=toDegrees(find(0x0004),find(0x0003));
if(lat===null||lon===null)return null;
const altitude=find(0x0006);
const belowSea=find(0x0005)===1;
return{
lat,
lon,
text:`${Math.abs(lat).toFixed(6)}${DEG} ${lat < 0 ? 'S' : 'N'}, ${Math.abs(lon).toFixed(6)}${DEG} ${lon < 0 ? 'W' : 'E'}`,
altitude:typeof altitude==='number'?`${Math.round(altitude)} m ${belowSea ? 'below' : 'above'} sea level`:null,
};
}
const DEG='°';
function toDegrees(parts,ref){
if(!Array.isArray(parts)||parts.length<3)return null;
const[d,m,s]=parts;
if(![d,m,s].every((n)=>typeof n==='number'&&isFinite(n)))return null;
const value=d+m/60+s/3600;
const sign=typeof ref==='string'&&/^[SW]/i.test(ref.trim())?-1:1;
return value*sign;
}
const tagValue=(group,tag)=>group?.find((e)=>e.tag===tag)?.value;
const asText=(v)=>(typeof v==='string'&&v.trim()?v.trim():null);
export function buildFindings(item,t){
const out=[];
const groups=item.exif?.ok?item.exif.groups:null;
const meta=item.meta;
if(!item.exifUnreadable&&meta.exif&&!countTags(item)){
out.push({
level:'low',
title:t('find.exifempty.title'),
detail:t('find.exifempty.detail',{size:bytes(meta.exif.length)}),
});
}
if(item.exifUnreadable){
out.push({
level:'high',
title:t('find.exifbad.title'),
detail:t('find.exifbad.detail',{reason:t(item.exifError)}),
});
}
const position=readPosition(groups?.gps);
if(position){
out.push({
level:'high',
title:t('find.gps.title'),
detail:position.altitude
?t('find.gps.detailalt',{position:position.text,altitude:position.altitude})
:t('find.gps.detail',{position:position.text}),
});
}else if(groups?.gps?.length){
out.push({
level:'high',
title:t('find.gpspart.title'),
detail:t(groups.gps.length===1?'find.gpspart.one':'find.gpspart.many',
{count:groups.gps.length}),
});
}
const taken=asText(tagValue(groups?.exif,0x9003))??asText(tagValue(groups?.ifd0,0x0132));
if(taken){
out.push({
level:'medium',
title:t('find.taken.title'),
detail:t('find.taken.detail',{when:taken}),
});
}
const make=asText(tagValue(groups?.ifd0,0x010f));
const model=asText(tagValue(groups?.ifd0,0x0110));
if(make||model){
const device=make&&model&&!model.toLowerCase().startsWith(make.toLowerCase())
?`${make} ${model}`
:(model??make);
out.push({
level:'medium',
title:t('find.device.title'),
detail:t('find.device.detail',{device}),
});
}
const identifiers=[
[groups?.exif,0xa431,'find.id.cameraserial'],
[groups?.exif,0xa435,'find.id.lensserial'],
[groups?.exif,0xa430,'find.id.owner'],
[groups?.exif,0xa420,'find.id.uniqueid'],
[groups?.ifd0,0x013b,'find.id.artist'],
[groups?.ifd0,0x9c9d,'find.id.author'],
[groups?.ifd0,0x8298,'find.id.copyright'],
]
.map(([group,tag,key])=>({label:t(key),value:asText(tagValue(group,tag))}))
.filter((x)=>x.value);
if(identifiers.length){
out.push({
level:'high',
title:t('find.identity.title'),
detail:t('find.identity.detail',{
found:identifiers.map((x)=>`${x.label}: ${x.value}`).join('. '),
}),
});
}
const software=asText(tagValue(groups?.ifd0,0x0131));
if(software){
out.push({
level:'medium',
title:t('find.software.title'),
detail:t('find.software.detail',{software}),
});
}
const makerNote=groups?.exif?.find((e)=>e.tag===0x927c);
if(makerNote){
out.push({
level:'high',
title:t('find.makernote.title'),
detail:t('find.makernote.detail',{size:bytes(makerNote.raw.length)}),
});
}
if(item.exif?.thumbnail?.length){
out.push({
level:'medium',
title:t('find.thumbnail.title'),
detail:t('find.thumbnail.detail',{size:bytes(item.exif.thumbnail.length)}),
});
}
if(meta.xmp){
out.push({
level:'medium',
title:t('find.xmp.title'),
detail:t('find.xmp.detail',{size:bytes(meta.xmp.length)}),
});
}
if(meta.iptc){
out.push({
level:'high',
title:t('find.iptc.title'),
detail:t('find.iptc.detail',{size:bytes(meta.iptc.length)}),
});
}
for(const comment of meta.comments){
if(comment.trim()){
out.push({
level:'medium',
title:t('find.comment.title'),
detail:t('find.comment.detail',{comment:comment.trim().slice(0,300)}),
});
}
}
for(const text of meta.text){
if(text.value?.trim()){
out.push({
level:/author|artist|creat|copyright|owner|comment|source|url/i.test(text.keyword)?'high':'low',
title:t('find.text.title',{keyword:text.keyword}),
detail:text.value.trim().slice(0,300),
});
}
}
if(meta.extras.length){
out.push({
level:'low',
title:t('find.unknown.title'),
detail:t('find.unknown.detail',{
blocks:meta.extras.map((x)=>`${x.label} (${bytes(x.size)})`).join(', '),
}),
});
}
return out;
}
export function bytes(n){
if(n<1024)return`${n} B`;
if(n<1024*1024)return`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
return`${(n / (1024 * 1024)).toFixed(1)} MB`;
}
export function countTags(item){
if(!item.exif?.ok)return 0;
return GROUP_ORDER.reduce((n,group)=>n+(item.exif.groups[group]?.length??0),0);
}
export function metadataSize(item){
const meta=item.meta;
let total=meta.exif?.length??0;
total+=meta.xmp?.length??0;
total+=meta.iptc?.length??0;
total+=meta.icc?.length??0;
for(const c of meta.comments)total+=c.length;
for(const t of meta.text)total+=(t.keyword?.length??0)+(t.value?.length??0);
for(const e of meta.extras)total+=e.size;
return total;
}
export function badges(item){
const out=[];
if(!item.ok)return[{label:'badge.unreadable',level:'high'}];
const groups=item.exif?.ok?item.exif.groups:null;
const tags=countTags(item);
if(groups?.gps?.length)out.push({label:'GPS',level:'high'});
if(item.exifUnreadable)out.push({label:'badge.exifbad',level:'high'});
else if(tags)out.push({label:'badge.exif',values:{count:tags},level:'medium'});
else if(item.meta.exif)out.push({label:'badge.exifempty',level:'low'});
if(item.exif?.thumbnail?.length)out.push({label:'badge.thumbnail',level:'medium'});
if(item.meta.xmp)out.push({label:'XMP',level:'medium'});
if(item.meta.iptc)out.push({label:'IPTC',level:'high'});
if(item.meta.comments.length)out.push({label:'badge.comment',level:'medium'});
if(item.meta.text.length){
out.push({label:'badge.text',values:{count:item.meta.text.length},level:'medium'});
}
if(item.meta.icc)out.push({label:'ICC',level:'low'});
if(item.meta.extras.length)out.push({label:'badge.unknown',level:'low'});
if(!out.length)out.push({label:'badge.clean',level:'clean'});
return out;
}
export function hasMetadata(item){
if(!item.ok)return false;
return countTags(item)>0
||Boolean(item.meta.exif)
||Boolean(item.exif?.thumbnail?.length)
||Boolean(item.meta.xmp)||Boolean(item.meta.iptc)||Boolean(item.meta.icc)
||item.meta.comments.length>0||item.meta.text.length>0||item.meta.extras.length>0;
}
export function tagGroups(item){
if(!item.exif?.ok)return[];
return GROUP_ORDER
.filter((group)=>item.exif.groups[group]?.length)
.map((group)=>({
id:group,
...GROUP_LABELS[group],
entries:[...item.exif.groups[group]].sort((a,b)=>a.tag-b.tag),
}));
}
