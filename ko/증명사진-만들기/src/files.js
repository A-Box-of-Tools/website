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
export function bandText(band,heightMm){
const fractions=`${percent(band.min)} to ${percent(band.max)}`;
if(band.minMm!==undefined&&band.maxMm!==undefined){
return`${fractions} (${trim(band.minMm)}-${trim(band.maxMm)} mm)`;
}
if(heightMm){
return`${fractions} (${trim(band.min * heightMm)}-${trim(band.max * heightMm)} mm)`;
}
return fractions;
}
export function verdictText(check,subject,heightMm){
const measured=check.mm!==null&&check.mm!==undefined
?`${percent(check.value)} (${trim(check.mm)} mm)`
:percent(check.value);
const wanted=bandText(check,heightMm);
if(check.status==='ok')return`${subject} is ${measured}. The rule asks for ${wanted}.`;
const direction=check.status==='low'
?(subject==='Eye line'?'too low in the frame':'too small')
:(subject==='Eye line'?'too high in the frame':'too large');
const fix=subject==='Eye line'
?(check.status==='low'?'Move the box down.':'Move the box up.')
:(check.status==='low'?'Make the box smaller.':'Make the box larger.');
return`${subject} is ${measured}, which is ${direction}. The rule asks for ${wanted}. ${fix}`;
}
export const statusClass=(status,advisory=false)=>{
if(status==='ok')return'good';
return advisory?'warn':'bad';
};
export function tiltText(tilt){
const size=Math.abs(tilt.degrees);
if(size<0.5)return'The eye line is level.';
const side=tilt.degrees>0?'right':'left';
const tail=tilt.status==='ok'
?'which is within the couple of degrees an examiner will not notice.'
:'which is enough to be noticed. Retake it with the camera level, or straighten the picture first.';
return`The head leans ${size.toFixed(1)} degrees to the ${side}, ${tail}`;
}
export function centreText(centre){
const size=Math.abs(centre.offset);
if(centre.status==='ok')return'The face is centred in the frame.';
const side=centre.offset>0?'right':'left';
return`The face sits ${percent(size)} of the frame's width to the ${side} of centre. `
+'Drag the box the other way, or press Fit again.';
}
export function resamplingText(check){
if(!check.enlarging){
return`The crop is ${check.have.width} x ${check.have.height} pixels and the output is `
+`${check.need.width} x ${check.need.height}, so nothing has to be invented.`;
}
const short=`The crop is only ${check.have.width} x ${check.have.height} pixels and the output `
+`is ${check.need.width} x ${check.need.height}.`;
return check.severe
?`${short} That is a long way short: the result will look soft, and on paper it will look `
+'like a screenshot. A photograph taken closer, or at a higher resolution, is the only fix.'
:`${short} It will be enlarged slightly, which costs a little sharpness and nothing else.`;
}
export function readyText(passing,backgroundStatus){
if(!passing){
return'The geometry does not meet the rule yet. You can still save the files - '
+'nothing here refuses to give you your own photograph - but the figures above '
+'are what the form will be measuring.';
}
if(backgroundStatus==='bad'){
return'The geometry meets the rule. The background does not, and that is the more '
+'common reason a photograph comes back.';
}
return'The geometry meets the rule and the background reads as acceptable.';
}
