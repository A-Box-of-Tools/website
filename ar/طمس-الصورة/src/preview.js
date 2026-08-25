/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{applyRegions}from'./redact.js';
const MAX_SIDE=1800;
export class Preview{
#canvas;
#context;
#base=null;
#scale=1;
#source={width:0,height:0};
constructor(canvas){
this.#canvas=canvas;
this.#context=canvas.getContext('2d',{willReadFrequently:true});
}
get scale(){
return this.#scale;
}
setSource(bitmap,size){
this.#source=size;
const longest=Math.max(size.width,size.height);
this.#scale=longest>MAX_SIDE?MAX_SIDE/longest:1;
this.#canvas.width=Math.max(1,Math.round(size.width*this.#scale));
this.#canvas.height=Math.max(1,Math.round(size.height*this.#scale));
this.#context.drawImage(bitmap,0,0,this.#canvas.width,this.#canvas.height);
this.#base=this.#context.getImageData(0,0,this.#canvas.width,this.#canvas.height);
}
clear(){
this.#base=null;
this.#context.clearRect(0,0,this.#canvas.width,this.#canvas.height);
}
draw(regions,strength){
if(!this.#base)return;
const pixels=new ImageData(
new Uint8ClampedArray(this.#base.data),
this.#base.width,
this.#base.height,
);
applyRegions(pixels,regions.map((region)=>this.#scaled(region)),strength);
this.#context.putImageData(pixels,0,0);
}
#scaled(region){
const scale=this.#scale;
if(scale===1)return region;
const x=Math.round(region.x*scale);
const y=Math.round(region.y*scale);
return{
style:region.style,
x,
y,
width:Math.max(1,Math.round((region.x+region.width)*scale)-x),
height:Math.max(1,Math.round((region.y+region.height)*scale)-y),
};
}
}
