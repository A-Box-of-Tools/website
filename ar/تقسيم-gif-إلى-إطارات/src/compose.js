/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export class GifCanvas{
constructor(gif){
this.gif=gif;
this.width=gif.width;
this.height=gif.height;
this.pixels=new Uint8ClampedArray(this.width*this.height*4);
this.saved=null;
this.at=0;
}
next(){
const frame=this.gif.frames[this.at];
if(!frame)return null;
const previous=this.gif.frames[this.at-1];
if(previous){
if(previous.disposal===2)this.clear(previous);
else if(previous.disposal===3&&this.saved)this.pixels.set(this.saved);
}
if(frame.disposal===3)this.saved=this.pixels.slice();
paint(this.pixels,this.width,this.height,frame);
const index=this.at;
this.at+=1;
return{index,frame,pixels:this.pixels};
}
clear(frame){
const left=Math.max(0,frame.x);
const top=Math.max(0,frame.y);
const right=Math.min(this.width,frame.x+frame.width);
const bottom=Math.min(this.height,frame.y+frame.height);
if(right<=left)return;
for(let y=top;y<bottom;y+=1){
const from=(y*this.width+left)*4;
this.pixels.fill(0,from,from+(right-left)*4);
}
}
}
export function paint(pixels,width,height,frame){
const{palette,indices,transparentIndex}=frame;
const colours=Math.floor(palette.length/3);
for(let row=0;row<frame.height;row+=1){
const y=frame.y+row;
if(y<0||y>=height)continue;
for(let column=0;column<frame.width;column+=1){
const x=frame.x+column;
if(x<0||x>=width)continue;
const index=indices[row*frame.width+column];
if(index===transparentIndex)continue;
const entry=(index<colours?index:0)*3;
const at=(y*width+x)*4;
pixels[at]=palette[entry];
pixels[at+1]=palette[entry+1];
pixels[at+2]=palette[entry+2];
pixels[at+3]=255;
}
}
return pixels;
}
export function patchPixels(frame){
const pixels=new Uint8ClampedArray(frame.width*frame.height*4);
paint(pixels,frame.width,frame.height,{...frame,x:0,y:0});
return pixels;
}
export function flatten(pixels,colour){
for(let at=0;at<pixels.length;at+=4){
const alpha=pixels[at+3];
if(alpha===255)continue;
if(alpha===0){
pixels[at]=colour.r;
pixels[at+1]=colour.g;
pixels[at+2]=colour.b;
}else{
const weight=alpha/255;
pixels[at]=pixels[at]*weight+colour.r*(1-weight);
pixels[at+1]=pixels[at+1]*weight+colour.g*(1-weight);
pixels[at+2]=pixels[at+2]*weight+colour.b*(1-weight);
}
pixels[at+3]=255;
}
return pixels;
}
export function parseColour(text){
const match=/^#?([0-9a-f]{6})$/i.exec(String(text??'').trim());
if(!match)return{r:255,g:255,b:255};
const value=parseInt(match[1],16);
return{r:(value>>16)&0xff,g:(value>>8)&0xff,b:value&0xff};
}
