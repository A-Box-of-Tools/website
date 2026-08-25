/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{describeTag,GROUP_LABELS}from'./tags.js';
import{GROUP_ORDER}from'./tiff.js';
const MAX_LIST=8;
export function formatValue(group,entry){
const spec=describeTag(group,entry.tag);
const{value}=entry;
if(value===null||value===undefined){
return`${entry.raw.length} bytes of data`;
}
if(typeof value==='string')return value.length?value:'(empty)';
if(spec.values&&typeof value==='number'){
return spec.values[value]??`Unrecognised value (${value})`;
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
return value.length>MAX_LIST?`${shown}, and ${value.length - MAX_LIST} more`:shown;
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
export function buildFindings(item){
const out=[];
const groups=item.exif?.ok?item.exif.groups:null;
const meta=item.meta;
if(!item.exifUnreadable&&meta.exif&&!countTags(item)){
out.push({
level:'low',
title:'An EXIF block with nothing in it',
detail:`${bytes(meta.exif.length)} of EXIF that parses cleanly and holds no tags. Harmless, and removed along with everything else.`,
});
}
if(item.exifUnreadable){
out.push({
level:'high',
title:'An EXIF block nobody can read',
detail:`There is EXIF here and it would not parse: ${item.exifError} Everything below is what could be read of the rest of the file, so treat this one as an unknown quantity - which is a reason to remove it, not to leave it.`,
});
}
const position=readPosition(groups?.gps);
if(position){
out.push({
level:'high',
title:'Where the photo was taken',
detail:`${position.text}${position.altitude ? `, ${position.altitude}` : ''}. That is precise enough to name a building, and it travels with the file into anything you post it to.`,
});
}else if(groups?.gps?.length){
out.push({
level:'high',
title:'Location tags, without a full position',
detail:`${groups.gps.length} GPS tag${groups.gps.length === 1 ? '' : 's'} are here but no usable latitude and longitude. Direction of travel, altitude and the GPS clock can still be among them.`,
});
}
const taken=asText(tagValue(groups?.exif,0x9003))??asText(tagValue(groups?.ifd0,0x0132));
if(taken){
out.push({
level:'medium',
title:'When it was taken',
detail:`${taken}, to the second. Combined with a location this places a person somewhere at a particular moment.`,
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
title:'The device it came from',
detail:`${device}. Harmless on its own; it becomes an identifier when every photo you post carries the same one.`,
});
}
const identifiers=[
[groups?.exif,0xa431,'Camera serial number'],
[groups?.exif,0xa435,'Lens serial number'],
[groups?.exif,0xa430,'Camera owner'],
[groups?.exif,0xa420,'Image unique ID'],
[groups?.ifd0,0x013b,'Artist'],
[groups?.ifd0,0x9c9d,'Author'],
[groups?.ifd0,0x8298,'Copyright'],
]
.map(([group,tag,label])=>({label,value:asText(tagValue(group,tag))}))
.filter((x)=>x.value);
if(identifiers.length){
out.push({
level:'high',
title:'Something that names you or your kit',
detail:`${identifiers.map((x) => `${x.label}: ${x.value}`).join('. ')}. A serial number ties every photo from that body together, whoever posted them and wherever.`,
});
}
const software=asText(tagValue(groups?.ifd0,0x0131));
if(software){
out.push({
level:'medium',
title:'What edited it',
detail:`${software}. This is often the phone's firmware version, which is a narrower thing to publish than the model alone.`,
});
}
const makerNote=groups?.exif?.find((e)=>e.tag===0x927c);
if(makerNote){
out.push({
level:'high',
title:'The maker note',
detail:`${bytes(makerNote.raw.length)} of the manufacturer's own private data. It is undocumented, it varies by model, and it is where serial numbers, focus points and shutter counts tend to hide.`,
});
}
if(item.exif?.thumbnail?.length){
out.push({
level:'medium',
title:'A second copy of the picture',
detail:`${bytes(item.exif.thumbnail.length)} holding a small JPEG preview. If the photo was cropped after the camera wrote it, some editors leave the thumbnail showing the uncropped frame.`,
});
}
if(meta.xmp){
out.push({
level:'medium',
title:'An XMP packet',
detail:`${bytes(meta.xmp.length)} of XML. It usually repeats the camera and the timestamps, and adds the edit history: which program, which version, and every time the file was saved.`,
});
}
if(meta.iptc){
out.push({
level:'high',
title:'An IPTC block',
detail:`${bytes(meta.iptc.length)} of the fields a photo desk fills in - byline, caption, city, credit. If this came from a stock library or a newsroom, someone's name is likely in it.`,
});
}
for(const comment of meta.comments){
if(comment.trim()){
out.push({level:'medium',title:'A comment',detail:`"${comment.trim().slice(0, 300)}"`});
}
}
for(const text of meta.text){
if(text.value?.trim()){
out.push({
level:/author|artist|creat|copyright|owner|comment|source|url/i.test(text.keyword)?'high':'low',
title:`Text: ${text.keyword}`,
detail:text.value.trim().slice(0,300),
});
}
}
if(meta.extras.length){
out.push({
level:'low',
title:'Blocks this tool cannot read',
detail:`${meta.extras.map((x) => `${x.label} (${bytes(x.size)})`).join(', ')}. Unreadable is not the same as empty, so these are removed along with everything else.`,
});
}
return out;
}
export function bytes(n){
if(n<1024)return`${n} bytes`;
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
if(!item.ok)return[{label:'Cannot read',level:'high'}];
const groups=item.exif?.ok?item.exif.groups:null;
const tags=countTags(item);
if(groups?.gps?.length)out.push({label:'GPS',level:'high'});
if(item.exifUnreadable)out.push({label:'EXIF unreadable',level:'high'});
else if(tags)out.push({label:`EXIF ${tags}`,level:'medium'});
else if(item.meta.exif)out.push({label:'EXIF empty',level:'low'});
if(item.exif?.thumbnail?.length)out.push({label:'Thumbnail',level:'medium'});
if(item.meta.xmp)out.push({label:'XMP',level:'medium'});
if(item.meta.iptc)out.push({label:'IPTC',level:'high'});
if(item.meta.comments.length)out.push({label:'Comment',level:'medium'});
if(item.meta.text.length)out.push({label:`Text ${item.meta.text.length}`,level:'medium'});
if(item.meta.icc)out.push({label:'ICC',level:'low'});
if(item.meta.extras.length)out.push({label:'Unknown blocks',level:'low'});
if(!out.length)out.push({label:'Nothing found',level:'clean'});
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
