/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SIZES={small:0.45,medium:0.65,large:0.85};
const TILE_GAP=0.6;
export function placements(visible,aspect,{size,diagonal,tiled}){
const angle=diagonal?diagonalAngle(visible):0;
const fraction=SIZES[size]??SIZES.medium;
const reach=diagonal
?Math.hypot(visible.width,visible.height)
:Math.min(visible.width,visible.height*aspect);
let width=reach*fraction;
let height=width/aspect;
const tallest=visible.height*0.9;
if(height>tallest){
height=tallest;
width=height*aspect;
}
if(!tiled){
return[{cx:visible.width/2,cy:visible.height/2,width,height,angle}];
}
const tile=tiled?Math.min(width,visible.width*0.5):width;
const tileHeight=tile/aspect;
const stepX=tile*(1+TILE_GAP);
const stepY=Math.max(tileHeight*3,tile*0.75);
const out=[];
let row=0;
for(let cy=stepY/2;cy<visible.height;cy+=stepY,row+=1){
const shift=row%2?stepX/2:0;
for(let cx=shift+stepX/2-stepX;cx<visible.width+stepX/2;cx+=stepX){
if(cx<-tile/2||cx>visible.width+tile/2)continue;
out.push({cx,cy,width:tile,height:tileHeight,angle});
}
}
return out;
}
export function diagonalAngle(visible){
return(Math.atan2(visible.height,visible.width)*180)/Math.PI;
}
export function placementMatrix({cx,cy,width,height,angle}){
const rad=(angle*Math.PI)/180;
const cos=Math.cos(rad);
const sin=Math.sin(rad);
return[
width*cos,width*sin,
-height*sin,height*cos,
cx-(width*cos-height*sin)/2,
cy-(width*sin+height*cos)/2,
];
}
export function visibleToUser(rotate,box){
const[x0,y0,x1,y1]=box;
switch(rotate){
case 90:return[0,1,-1,0,x1,y0];
case 180:return[-1,0,0,-1,x1,y1];
case 270:return[0,-1,1,0,x0,y1];
default:return[1,0,0,1,x0,y0];
}
}
export function visibleSize(rotate,box){
const width=box[2]-box[0];
const height=box[3]-box[1];
return rotate===90||rotate===270
?{width:height,height:width}
:{width,height};
}
export function contentFor(spots,toUser,names){
const lines=['q',`/${names.state} gs`,`${matrix(toUser)} cm`];
for(const spot of spots){
lines.push('q',`${matrix(placementMatrix(spot))} cm`,`/${names.image} Do`,'Q');
}
lines.push('Q');
return`${lines.join('\n')}\n`;
}
function matrix(values){
return values.map(formatNumber).join(' ');
}
export function formatNumber(value){
if(!Number.isFinite(value))return'0';
if(Number.isInteger(value))return String(value);
return value.toFixed(4).replace(/\.?0+$/,'')||'0';
}
