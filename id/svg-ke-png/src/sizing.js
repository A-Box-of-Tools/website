/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MODES={
scale:'scale',
width:'width',
height:'height',
longest:'longest',
box:'box',
};
export const FITS={
fit:'fit',
pad:'pad',
stretch:'stretch',
};
export const MAX_SIDE=16384;
export const MAX_PIXELS=100_000_000;
export const WARN_PIXELS=16_777_216;
export function planSize(intrinsic,settings){
const ratio=intrinsic.ratio>0?intrinsic.ratio:1;
const{mode}=settings;
if(mode===MODES.box)return boxPlan(ratio,settings);
let width;
let height;
if(mode===MODES.scale){
const scale=positive(settings.scale)??1;
width=intrinsic.width*scale;
height=intrinsic.height*scale;
}else if(mode===MODES.width){
width=positive(settings.width)??intrinsic.width;
height=width/ratio;
}else if(mode===MODES.height){
height=positive(settings.height)??intrinsic.height;
width=height*ratio;
}else if(mode===MODES.longest){
const longest=positive(settings.longest)??Math.max(intrinsic.width,intrinsic.height);
if(ratio>=1){
width=longest;
height=longest/ratio;
}else{
height=longest;
width=longest*ratio;
}
}else{
throw new Error(`unknown size mode: ${mode}`);
}
return whole(px(width),px(height));
}
function boxPlan(ratio,settings){
const boxWidth=px(positive(settings.width)??0);
const boxHeight=px(positive(settings.height)??0);
const fit=settings.fit??FITS.fit;
if(!settings.width)return whole(px(boxHeight*ratio),boxHeight);
if(!settings.height)return whole(boxWidth,px(boxWidth/ratio));
if(fit===FITS.stretch){
const plan=whole(boxWidth,boxHeight);
plan.stretch=true;
return plan;
}
const drawWidth=px(Math.min(boxWidth,boxHeight*ratio));
const drawHeight=px(Math.min(boxHeight,boxWidth/ratio));
if(fit===FITS.pad){
return{
width:boxWidth,
height:boxHeight,
draw:{
x:Math.round((boxWidth-drawWidth)/2),
y:Math.round((boxHeight-drawHeight)/2),
width:drawWidth,
height:drawHeight,
},
padded:drawWidth!==boxWidth||drawHeight!==boxHeight,
stretch:false,
};
}
return whole(drawWidth,drawHeight);
}
const whole=(width,height)=>({
width,
height,
draw:{x:0,y:0,width,height},
padded:false,
stretch:false,
});
const px=(n)=>Math.max(1,Math.round(n));
const positive=(n)=>(Number.isFinite(n)&&n>0?n:null);
export function atDensity(plan,multiple){
if(multiple===1)return plan;
return{
width:plan.width*multiple,
height:plan.height*multiple,
draw:{
x:plan.draw.x*multiple,
y:plan.draw.y*multiple,
width:plan.draw.width*multiple,
height:plan.draw.height*multiple,
},
padded:plan.padded,
stretch:plan.stretch,
};
}
export function checkLimits(plan){
const pixels=plan.width*plan.height;
if(plan.width>MAX_SIDE||plan.height>MAX_SIDE){
return{
ok:false,
warn:false,
reason:`${plan.width} × ${plan.height} is past the ${MAX_SIDE} pixel limit a canvas has on a side. `
+'Nothing would come back but a blank image.',
};
}
if(pixels>MAX_PIXELS){
return{
ok:false,
warn:false,
reason:`${megapixels(pixels)} is more than a browser will hold - it is ${Math.round(pixels * 4 / 1e6)} MB `
+'of canvas before anything is encoded. Ask for a smaller size.',
};
}
if(pixels>WARN_PIXELS){
return{
ok:true,
warn:true,
reason:`${megapixels(pixels)} is above the ${Math.round(WARN_PIXELS / 1e6)} megapixel ceiling Safari has on `
+'an iPhone or iPad. It will work on a desktop; on a phone it may come back blank.',
};
}
return{ok:true,warn:false,reason:''};
}
export const megapixels=(pixels)=>{
const mp=pixels/1e6;
return`${mp < 10 ? mp.toFixed(1) : Math.round(mp)} megapixels`;
};
export function describePlan(plan,intrinsic,densities){
const size=`${plan.width} × ${plan.height}`;
const from=`The file draws itself at ${intrinsic.width} × ${intrinsic.height}`;
const shape=plan.stretch
?' The shape is stretched to fill the box, so the drawing is distorted.'
:plan.padded
?' It is centred in the box, with the background showing either side.'
:'';
const extra=densities.length>1
?` Plus ${densities.slice(1).map((d) => `${plan.width * d} × ${plan.height * d} at @${d}x`).join(' and ')}.`
:'';
return`${from}; this comes out at ${size}, which is ${times(plan.width / intrinsic.width)} that.${shape}${extra}`;
}
export function times(factor){
if(!Number.isFinite(factor)||factor<=0)return'?';
if(Math.abs(factor-Math.round(factor))<0.005)return`${Math.round(factor)}×`;
return`${factor.toFixed(2).replace(/0$/, '')}×`;
}
