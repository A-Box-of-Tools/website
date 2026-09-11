/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MM_PER_INCH=25.4;
export const mmToPx=(mm,dpi)=>(mm*dpi)/MM_PER_INCH;
export const pxToMm=(px,dpi)=>(px*MM_PER_INCH)/dpi;
const px=(value)=>Math.max(1,Math.round(value));
const clamp=(value,low,high)=>Math.min(high,Math.max(low,value));
const mid=(band)=>(band.min+band.max)/2;
export function frameAspect(spec){
if(spec.print)return spec.print.widthMm/spec.print.heightMm;
const digital=spec.digital;
const width=digital?.width?.exact??digital?.width?.min;
const height=digital?.height?.exact??digital?.height?.min;
if(width&&height)return width/height;
throw new Error('frame.nosize');
}
export function printPixels(spec,dpi){
if(!spec.print)return null;
const used=Math.max(spec.print.dpi,Math.round(Number(dpi)||0)||spec.print.dpi);
return{
width:px(mmToPx(spec.print.widthMm,used)),
height:px(mmToPx(spec.print.heightMm,used)),
dpi:used,
};
}
export function faceOf(marks){
const eyeY=(marks.leftEye.y+marks.rightEye.y)/2;
const centreX=(marks.leftEye.x+marks.rightEye.x)/2;
const dx=marks.rightEye.x-marks.leftEye.x;
const dy=marks.rightEye.y-marks.leftEye.y;
return{
eyeY,
centreX,
headPx:marks.chin.y-marks.crown.y,
eyeSpacing:Math.hypot(dx,dy),
tilt:dx===0&&dy===0?0:(Math.atan2(dy,dx)*180)/Math.PI,
};
}
export function fitFrame(marks,spec,source){
const face=faceOf(marks);
const aspect=frameAspect(spec);
const headTarget=mid(spec.head);
const eyeTarget=mid(spec.eye);
let height=face.headPx>0?face.headPx/headTarget:source.height;
let width=height*aspect;
const shrink=Math.min(1,source.width/width,source.height/height);
height*=shrink;
width*=shrink;
const idealTop=face.eyeY-(1-eyeTarget)*height;
const idealLeft=face.centreX-width/2;
const top=clamp(idealTop,0,source.height-height);
const left=clamp(idealLeft,0,source.width-width);
const rect={
x:Math.round(left),
y:Math.round(top),
width:px(width),
height:px(height),
};
return{
rect:containIn(rect,source),
ideal:{x:idealLeft,y:idealTop,width,height},
short:{
top:Math.max(0,Math.round(-idealTop)),
bottom:Math.max(0,Math.round(idealTop+height-source.height)),
left:Math.max(0,Math.round(-idealLeft)),
right:Math.max(0,Math.round(idealLeft+width-source.width)),
},
};
}
export function containIn(rect,source){
const width=Math.min(rect.width,source.width);
const height=Math.min(rect.height,source.height);
return{
x:clamp(Math.round(rect.x),0,source.width-width),
y:clamp(Math.round(rect.y),0,source.height-height),
width,
height,
};
}
export function measure(rect,marks,spec){
const face=faceOf(marks);
const headFraction=rect.height>0?face.headPx/rect.height:0;
const eyeFraction=rect.height>0?1-(face.eyeY-rect.y)/rect.height:0;
const centreOffset=rect.width>0
?(face.centreX-(rect.x+rect.width/2))/rect.width
:0;
const heightMm=spec.print?.heightMm??null;
return{
head:{
...checkBand(headFraction,spec.head),
mm:heightMm===null?null:headFraction*heightMm,
},
eye:{
...checkBand(eyeFraction,spec.eye),
mm:heightMm===null?null:eyeFraction*heightMm,
},
centre:{
offset:centreOffset,
status:Math.abs(centreOffset)<=0.02?'ok':centreOffset<0?'low':'high',
},
tilt:{
degrees:face.tilt,
status:Math.abs(face.tilt)<=3?'ok':'high',
},
eyeSpacing:face.eyeSpacing,
};
}
export function checkBand(value,band){
const status=value<band.min?'low':value>band.max?'high':'ok';
return{value,status,min:band.min,max:band.max,advisory:Boolean(band.advisory)};
}
export function passes(metrics){
return metrics.head.status==='ok'
&&metrics.eye.status==='ok'
&&metrics.centre.status==='ok'
&&metrics.tilt.status==='ok';
}
export function resampling(rect,output){
const scale=Math.min(rect.width/output.width,rect.height/output.height);
return{
scale,
enlarging:scale<0.95,
severe:scale<0.6,
have:{width:rect.width,height:rect.height},
need:{width:output.width,height:output.height},
};
}
export function guideLines(spec){
return{
eye:{from:1-spec.eye.max,to:1-spec.eye.min},
head:{min:spec.head.min,max:spec.head.max},
};
}
