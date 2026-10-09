/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{parseHeight}from'./units.js?v=528f8580f1';
const WIDTH_ERRORS={'height.unreadable':'width.unreadable',
'height.tooshort':'width.toosmall','height.tootall':'width.toolarge'};
export function chartMeasurements(heightText,widthText,unit,shape){
const height=parseHeight(heightText,unit);
const usesWidth=!!(shape.stretch||!shape.markup);
let width={cm:0};
if(usesWidth){
if(!String(widthText??'').trim())width={cm:0,auto:true};
else{
const parsed=parseHeight(widthText,unit);
width=parsed.error?{error:WIDTH_ERRORS[parsed.error]}:parsed;
}
}
return{height,width,usesWidth,valid:!height.error&&!width.error};
}
