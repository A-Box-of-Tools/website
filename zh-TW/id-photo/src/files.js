/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{trim}from'./specs.js';
export function stemOf(name){
const clean=String(name??'').replace(/\.[^./\\]+$/,'');
return clean||'photo';
}
export function outName(stem,spec,kind,detail={}){
const safe=stem.replace(/[^\w-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'photo';
if(kind==='print'){
const size=spec.print?`${trim(spec.print.widthMm)}x${trim(spec.print.heightMm)}mm`:'print';
return`${safe}-${spec.id}-${size}.jpg`;
}
if(kind==='sheet')return`${safe}-${spec.id}-sheet-${detail.paper ?? 'print'}.jpg`;
return`${safe}-${spec.id}-${detail.width}x${detail.height}.jpg`;
}
export const percent=(value)=>`${(value * 100).toFixed(1)}%`;
export function bandText(band,heightMm,t){
const fractions=t('band.range',{min:percent(band.min),max:percent(band.max)});
if(band.minMm!==undefined&&band.maxMm!==undefined){
return t('band.mm',{range:fractions,min:trim(band.minMm),max:trim(band.maxMm)});
}
if(heightMm){
return t('band.mm',{
range:fractions,
min:trim(band.min*heightMm),
max:trim(band.max*heightMm),
});
}
return fractions;
}
export function verdictText(check,subject,heightMm,t){
const measured=check.mm!==null&&check.mm!==undefined
?t('measured.mm',{percent:percent(check.value),mm:trim(check.mm)})
:percent(check.value);
return t(`verdict.${subject}.${check.status}`,{
measured,
wanted:bandText(check,heightMm,t),
});
}
export const statusClass=(status,advisory=false)=>{
if(status==='ok')return'good';
return advisory?'warn':'bad';
};
export function tiltText(tilt,t){
const size=Math.abs(tilt.degrees);
if(size<0.5)return t('tilt.level');
const side=tilt.degrees>0?'right':'left';
return t(`tilt.${tilt.status === 'ok' ? 'ok' : 'bad'}.${side}`,{degrees:size.toFixed(1)});
}
export function centreText(centre,t){
const size=Math.abs(centre.offset);
if(centre.status==='ok')return t('centre.ok');
const side=centre.offset>0?'right':'left';
return t(`centre.${side}`,{size:percent(size)});
}
export function resamplingText(check,t){
const sizes={
have:`${check.have.width} x ${check.have.height}`,
need:`${check.need.width} x ${check.need.height}`,
};
if(!check.enlarging)return t('resample.enough',sizes);
return t(check.severe?'resample.severe':'resample.slight',sizes);
}
export function readyText(passing,backgroundStatus,t){
if(!passing)return t('ready.geometry');
return t(backgroundStatus==='bad'?'ready.background':'ready.good');
}
