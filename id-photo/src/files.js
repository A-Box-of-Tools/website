/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{
backgroundOf,pixelLabel,portalBytes,portalPixels,printLabel,trim,
}from'./specs.js?v=a400f69c75';
import{sizeText}from'./encode.js?v=a400f69c75';
import{ltr}from'./shared/phrases.js?v=a400f69c75';
const SIZE_KEYS={print:'doc.size.mm',upload:'doc.size.px',both:'doc.size.both'};
export function docSize(spec,t){
const print=spec.print
?t(SIZE_KEYS.print,{
width:trim(spec.print.widthMm),
height:trim(spec.print.heightMm),
})
:null;
const pixels=portalPixels(spec);
const upload=pixels
?t(SIZE_KEYS.upload,{width:pixels.width,height:pixels.height})
:null;
if(print&&upload)return t(SIZE_KEYS.both,{print,upload});
return print??upload??'';
}
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
export function specFacts(spec,t){
const heightMm=spec.print?.heightMm??null;
const guidance=(text,advisory)=>(advisory?t('band.guidance',{band:text}):text);
const rows=[[t('facts.print'),printLabel(spec,t)]];
if(spec.kind!=='signature'){
rows.push(
[t('facts.head'),guidance(bandText(spec.head,heightMm,t),spec.head.advisory)],
[t('facts.eye'),guidance(bandText(spec.eye,heightMm,t),spec.eye.advisory)],
);
}
rows.push([t('facts.background'),backgroundOf(spec,t).label]);
if(!spec.digital){
rows.push([t('facts.upload'),t('facts.upload.print')]);
return rows;
}
const bytes=portalBytes(spec);
const size=Number.isFinite(bytes.max)
?(bytes.min
?t('bytes.band',{min:sizeText(bytes.min,t),max:sizeText(bytes.max,t)})
:t('bytes.upto',{max:sizeText(bytes.max,t)}))
:(bytes.min?t('bytes.from',{min:sizeText(bytes.min,t)}):t('bytes.none'));
rows.push([t(spec.digital.label),
t('facts.upload.value',{pixels:pixelLabel(spec,t),size})]);
return rows;
}
const SOURCE_KEYS={figures:'source.line',words:'source.line.words',own:'source.own'};
export function sourceLine(spec,t){
if(!spec.source.checked)return t(SOURCE_KEYS.own);
return t(spec.published==='words'?SOURCE_KEYS.words:SOURCE_KEYS.figures,{
authority:t(spec.source.authority),
document:t(spec.source.document),
checked:spec.source.checked,
});
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
have:ltr(`${check.have.width} x ${check.have.height}`),
need:ltr(`${check.need.width} x ${check.need.height}`),
};
if(!check.enlarging)return t('resample.enough',sizes);
return t(check.severe?'resample.severe':'resample.slight',sizes);
}
export function readyText(passing,backgroundStatus,t){
if(!passing)return t('ready.geometry');
return t(backgroundStatus==='bad'?'ready.background':'ready.good');
}
