/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{PT_PER_INCH,PT_PER_MM}from'./pdf.js';
export const PAGE_SIZES={
a3:[297,420],
a4:[210,297],
a5:[148,210],
letter:[215.9,279.4],
legal:[215.9,355.6],
tabloid:[279.4,431.8],
};
const ORIENTATIONS={
1:[1,0,0,1,0,0],
2:[-1,0,0,1,1,0],
3:[-1,0,0,-1,1,1],
4:[1,0,0,-1,0,1],
5:[0,-1,-1,0,1,1],
6:[0,-1,1,0,0,1],
7:[0,1,1,0,0,0],
8:[0,1,-1,0,1,0],
};
const ROTATIONS={
0:ORIENTATIONS[1],
90:ORIENTATIONS[6],
180:ORIENTATIONS[3],
270:ORIENTATIONS[8],
};
function multiply(first,second){
const[a1,b1,c1,d1,e1,f1]=first;
const[a2,b2,c2,d2,e2,f2]=second;
return[
a1*a2+b1*c2,
a1*b2+b1*d2,
c1*a2+d1*c2,
c1*b2+d1*d2,
e1*a2+f1*c2+e2,
e1*b2+f1*d2+f2,
];
}
export function swapsAxes(orientation=1,rotate=0){
const tagTurns=orientation>=5&&orientation<=8;
const ownTurns=rotate===90||rotate===270;
return tagTurns!==ownTurns;
}
export function displaySize(width,height,orientation=1,rotate=0){
return swapsAxes(orientation,rotate)
?{width:height,height:width}
:{width,height};
}
export function seenSize(item){
return displaySize(item.width,item.height,item.orientation,item.rotate);
}
export function placement(rect,orientation=1,rotate=0){
const turn=multiply(
ORIENTATIONS[orientation]??ORIENTATIONS[1],
ROTATIONS[rotate]??ROTATIONS[0],
);
const[a,b,c,d,e,f]=turn;
return[
a*rect.width,b*rect.height,
c*rect.width,d*rect.height,
e*rect.width+rect.x,f*rect.height+rect.y,
];
}
export function pageSizePt(settings){
if(settings.pageSize==='custom'){
const unit=settings.customUnit==='in'?PT_PER_INCH:PT_PER_MM;
return[
Math.max(1,Number(settings.customWidth)||0)*unit,
Math.max(1,Number(settings.customHeight)||0)*unit,
];
}
const[width,height]=PAGE_SIZES[settings.pageSize]??PAGE_SIZES.a4;
return[width*PT_PER_MM,height*PT_PER_MM];
}
export function layoutPage(image,settings){
const seen=displaySize(image.width,image.height,image.orientation,image.rotate);
const margin=Math.max(0,Number(settings.margin)||0)*PT_PER_MM;
if(settings.pageSize==='fit'){
const dpi=Math.min(1200,Math.max(18,Number(settings.dpi)||150));
const width=(seen.width*PT_PER_INCH)/dpi;
const height=(seen.height*PT_PER_INCH)/dpi;
return{
width:width+margin*2,
height:height+margin*2,
rect:{x:margin,y:margin,width,height},
clip:null,
};
}
let[width,height]=pageSizePt(settings);
const landscape=settings.orientation==='landscape'
||(settings.orientation==='auto'&&seen.width>seen.height);
if(landscape!==(width>height))[width,height]=[height,width];
const box={
x:margin,
y:margin,
width:Math.max(1,width-margin*2),
height:Math.max(1,height-margin*2),
};
return{
width,
height,
rect:fitRect(seen.width,seen.height,box,settings.fit),
clip:settings.fit==='cover'?box:null,
};
}
export function fitRect(sw,sh,box,mode){
if(mode==='stretch')return{...box};
const scale=mode==='cover'
?Math.max(box.width/sw,box.height/sh)
:Math.min(box.width/sw,box.height/sh);
const width=sw*scale;
const height=sh*scale;
return{
x:box.x+(box.width-width)/2,
y:box.y+(box.height-height)/2,
width,
height,
};
}
