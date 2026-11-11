/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CM_PER_INCH=2.54;
const CM_PER_FOOT=30.48;
const MIN_CM=5;
const MAX_CM=1200;
const QUOTES=/[\u2018\u2019\u02B9\u2032]/g;
const DOUBLES=/[\u201C\u201D\u02BA\u2033]/g;
const FEET=/^(\d+(?:\.\d+)?)\s*(?:'|ft|feet|foot)/;
const INCH_TAIL=/\s*(?:(\d+(?:\.\d+)?)\s*(?:"|in|ins|inch|inches)?)?$/;
const FEET_AND_INCHES=new RegExp(FEET.source+INCH_TAIL.source);
const INCHES=/^(\d+(?:\.\d+)?)\s*(?:"|in|ins|inch|inches)$/;
const METRIC=/^(\d+(?:\.\d+)?)\s*(mm|cm|m|millimet(?:re|er)s?|centimet(?:re|er)s?|met(?:re|er)s?)$/;
const BARE=/^(\d+(?:\.\d+)?)$/;
const METRIC_CM={
mm:0.1,millimetre:0.1,millimeter:0.1,
cm:1,centimetre:1,centimeter:1,
m:100,metre:100,meter:100,
};
function metricScale(word){
const singular=word.replace(/s$/,'');
return METRIC_CM[singular]??METRIC_CM[word];
}
export function parseHeight(text,prefer='cm'){
const clean=String(text??'')
.replace(QUOTES,"'").replace(DOUBLES,'"')
.trim().toLowerCase().replace(/\s+/g,' ');
if(!clean)return{error:'height.empty'};
const raw=toCentimetres(clean,prefer);
if(raw===null)return{error:'height.unreadable'};
if(!Number.isFinite(raw)||raw<MIN_CM)return{error:'height.tooshort'};
if(raw>MAX_CM)return{error:'height.tootall'};
return{cm:Math.round(raw*10000)/10000};
}
function toCentimetres(clean,prefer){
const feet=FEET_AND_INCHES.exec(clean);
if(feet){
const inches=Number(feet[2]??0);
if(inches>=12)return null;
return Number(feet[1])*CM_PER_FOOT+inches*CM_PER_INCH;
}
const inches=INCHES.exec(clean);
if(inches)return Number(inches[1])*CM_PER_INCH;
const metric=METRIC.exec(clean);
if(metric){
const scale=metricScale(metric[2]);
return scale===undefined?null:Number(metric[1])*scale;
}
const bare=BARE.exec(clean);
if(!bare)return null;
const value=Number(bare[1]);
if(prefer==='ft'){
return value<=8?value*CM_PER_FOOT:value*CM_PER_INCH;
}
return value<3?value*100:value;
}
export function formatCm(cm){
const rounded=cm<100?Math.round(cm*10)/10:Math.round(cm);
return`${rounded} cm`;
}
export function formatFeet(cm){
const totalInches=Math.round(cm/CM_PER_INCH);
const feet=Math.floor(totalInches/12);
const inches=totalInches%12;
if(!feet)return`${inches} in`;
return inches?`${feet} ft ${inches} in`:`${feet} ft`;
}
export function toInput(cm,unit){
if(unit!=='ft')return String(Math.round(cm*10)/10);
const totalInches=Math.round(cm/CM_PER_INCH);
const feet=Math.floor(totalInches/12);
const inches=totalInches%12;
return feet?`${feet}'${inches}"`:`${inches}"`;
}
export function format(cm,unit){
return unit==='ft'?formatFeet(cm):formatCm(cm);
}
export function formatBoth(cm,unit){
return unit==='ft'
?`${formatFeet(cm)} (${formatCm(cm)})`
:`${formatCm(cm)} (${formatFeet(cm)})`;
}
const METRIC_STEPS=[1,2,5,10,20,25,50,100,200];
const IMPERIAL_STEPS=[1,2,3,6,12,24,60].map((inches)=>inches*CM_PER_INCH);
export function gridStep(topCm,unit,wanted=14){
const steps=unit==='ft'?IMPERIAL_STEPS:METRIC_STEPS;
const ideal=topCm/wanted;
return steps.find((step)=>step>=ideal)??steps[steps.length-1];
}
export function ceilTo(cm,step){
return Math.ceil(cm/step-1e-9)*step;
}
export function gridLabel(cm,unit){
if(unit!=='ft')return`${Math.round(cm)} cm`;
const inches=Math.round(cm/CM_PER_INCH);
const feet=Math.floor(inches/12);
const rest=inches%12;
if(!feet)return`${rest} in`;
return rest?`${feet}′${rest}″`:`${feet} ft`;
}
