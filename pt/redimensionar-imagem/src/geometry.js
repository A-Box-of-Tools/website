/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const px=(value)=>Math.max(1,Math.round(value));
export const RATIOS=['1:1','4:5','9:16','16:9','4:3','3:2'];
export function parseRatio(text){
if(typeof text==='number')return Number.isFinite(text)&&text>0?text:null;
const value=String(text??'').trim();
if(!value)return null;
const pair=value.match(/^(\d*\.?\d+)\s*[:/x×]\s*(\d*\.?\d+)$/i);
if(pair){
const w=Number.parseFloat(pair[1]);
const h=Number.parseFloat(pair[2]);
return w>0&&h>0?w/h:null;
}
if(!/^\d*\.?\d+$/.test(value))return null;
const single=Number.parseFloat(value);
return Number.isFinite(single)&&single>0?single:null;
}
export function ratioCrop(rect,aspect){
if(!aspect||!Number.isFinite(aspect))return{...rect};
let width=rect.width;
let height=rect.height;
if(width/height>aspect)width=height*aspect;
else height=width/aspect;
width=Math.min(rect.width,px(width));
height=Math.min(rect.height,px(height));
return{
x:rect.x+Math.round((rect.width-width)/2),
y:rect.y+Math.round((rect.height-height)/2),
width,
height,
};
}
export function toFractions(rect,size){
return{
x:rect.x/size.width,
y:rect.y/size.height,
width:rect.width/size.width,
height:rect.height/size.height,
};
}
export function fromFractions(fractions,size){
const width=Math.min(size.width,px(fractions.width*size.width));
const height=Math.min(size.height,px(fractions.height*size.height));
return{
x:Math.max(0,Math.min(Math.round(fractions.x*size.width),size.width-width)),
y:Math.max(0,Math.min(Math.round(fractions.y*size.height),size.height-height)),
width,
height,
};
}
export const wholeOf=(size)=>({x:0,y:0,width:size.width,height:size.height});
export const FITS=['contain','cover','pad','stretch'];
export function plan(crop,resize){
const source={...crop};
const mode=resize.mode??'none';
if(mode==='percent'){
const factor=(Number(resize.percent)||100)/100;
return laid(source,source.width*factor,source.height*factor);
}
if(mode==='longest'){
const longest=Math.max(source.width,source.height);
const wanted=Number(resize.longest)||longest;
const scale=limit(wanted/longest,resize.noEnlarge);
return laid(source,source.width*scale,source.height*scale);
}
if(mode==='pixels'){
return pixelPlan(source,resize);
}
return laid(source,source.width,source.height);
}
function pixelPlan(source,resize){
const width=positive(resize.width);
const height=positive(resize.height);
if(!width&&!height)return laid(source,source.width,source.height);
if(width&&!height){
const scale=limit(width/source.width,resize.noEnlarge);
return laid(source,source.width*scale,source.height*scale);
}
if(height&&!width){
const scale=limit(height/source.height,resize.noEnlarge);
return laid(source,source.width*scale,source.height*scale);
}
const fit=FITS.includes(resize.fit)?resize.fit:'contain';
if(fit==='stretch'){
return{
source,
canvas:{width,height},
draw:{x:0,y:0,width,height},
padded:false,
scale:width/source.width,
};
}
if(fit==='cover'){
const tight=ratioCrop(source,width/height);
const scale=limit(width/tight.width,resize.noEnlarge);
return laid(tight,tight.width*scale,tight.height*scale);
}
const scale=limit(Math.min(width/source.width,height/source.height),resize.noEnlarge);
if(fit==='pad'){
const drawn={width:px(source.width*scale),height:px(source.height*scale)};
return{
source,
canvas:{width,height},
draw:{
x:Math.round((width-drawn.width)/2),
y:Math.round((height-drawn.height)/2),
width:drawn.width,
height:drawn.height,
},
padded:drawn.width!==width||drawn.height!==height,
scale,
};
}
return laid(source,source.width*scale,source.height*scale);
}
function laid(source,width,height){
const canvas={width:px(width),height:px(height)};
return{
source,
canvas,
draw:{x:0,y:0,width:canvas.width,height:canvas.height},
padded:false,
scale:canvas.width/source.width,
};
}
const limit=(scale,noEnlarge)=>(noEnlarge?Math.min(1,scale):scale);
function positive(value){
const number=Number.parseFloat(value);
return Number.isFinite(number)&&number>=1?Math.round(number):null;
}
export function isUntouched(size,result){
return result.source.x===0
&&result.source.y===0
&&result.source.width===size.width
&&result.source.height===size.height
&&result.canvas.width===size.width
&&result.canvas.height===size.height
&&!result.padded;
}
