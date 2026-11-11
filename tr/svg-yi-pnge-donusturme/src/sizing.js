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
key:'limit.side',
values:{width:plan.width,height:plan.height,max:MAX_SIDE},
};
}
if(pixels>MAX_PIXELS){
return{
ok:false,
warn:false,
key:'limit.pixels',
values:{size:megapixels(pixels),mb:Math.round(pixels*4/1e6)},
};
}
if(pixels>WARN_PIXELS){
return{
ok:true,
warn:true,
key:'limit.safari',
values:{size:megapixels(pixels),ceiling:Math.round(WARN_PIXELS/1e6)},
};
}
return{ok:true,warn:false,key:'',values:{}};
}
export const megapixels=(pixels)=>{
const mp=pixels/1e6;
return{key:'unit.megapixels',values:{n:mp<10?mp.toFixed(1):Math.round(mp)}};
};
export function describePlan(plan,intrinsic,densities,t){
const parts=[t('plan.from',{
fromWidth:intrinsic.width,
fromHeight:intrinsic.height,
width:plan.width,
height:plan.height,
times:times(plan.width/intrinsic.width),
})];
if(plan.stretch)parts.push(t('plan.stretched'));
else if(plan.padded)parts.push(t('plan.padded'));
if(densities.length>1){
const list=densities.slice(1)
.map((d)=>t('plan.density',{width:plan.width*d,height:plan.height*d,d}))
.reduce((a,b)=>t('join.and',{a,b}));
parts.push(t('plan.plus',{list}));
}
return parts.reduce((a,b)=>t('join.sentences',{a,b}));
}
export function times(factor){
if(!Number.isFinite(factor)||factor<=0)return'?';
if(Math.abs(factor-Math.round(factor))<0.005)return`${Math.round(factor)}×`;
return`${factor.toFixed(2).replace(/0$/, '')}×`;
}
