/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{serializeExif}from'./tiff.js?v=a8e748bf06';
import{hasMetadata}from'./report.js?v=a8e748bf06';
export function prepareCleanCopy(item,{keepOrientation,keepIcc}){
const requested=Object.freeze({
applies:item.kind!=='avif',
keepOrientation:Boolean(keepOrientation),
keepIcc:Boolean(keepIcc),
});
const source=Object.freeze({name:item.name,size:item.size,kind:item.kind});
return{source,requested,metadata:hasMetadata(item),
plan:requested.applies?stripPlan(item,requested.keepOrientation,requested.keepIcc):null};
}
function stripPlan(item,keepOrientation,keepIcc){
const plan={exif:null,xmp:null,iptc:null,comments:null,extras:null,text:null};
if(!keepIcc)plan.icc=null;
if(keepOrientation&&item.exif?.ok){
const orientation=item.exif.groups.ifd0.find((e)=>e.tag===0x0112);
if(orientation&&orientation.value!==1){
plan.exif=serializeExif({
littleEndian:item.exif.littleEndian,
groups:{ifd0:[orientation],exif:[],gps:[],interop:[],ifd1:[]},
thumbnail:null,
});
}
}
return plan;
}
