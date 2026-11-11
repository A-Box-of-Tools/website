/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const TARGET_WIDTH=2400;
const MAX_HEIGHT=1200;
const PADDING=0.15;
export function renderStamp(text,colour){
const words=text.trim()||' ';
const family='system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
const probe=canvas(10,10).getContext('2d');
probe.font=`bold 100px ${family}`;
const measured=probe.measureText(words);
const ascent=measured.actualBoundingBoxAscent||80;
const descent=measured.actualBoundingBoxDescent||20;
const widthAt100=Math.max(measured.width,1);
let fontSize=(100*TARGET_WIDTH)/(widthAt100*(1+2*PADDING));
let height=(ascent+descent)*(fontSize/100)*(1+2*PADDING);
if(height>MAX_HEIGHT){
fontSize*=MAX_HEIGHT/height;
height=MAX_HEIGHT;
}
const width=Math.max(1,Math.round(widthAt100*(fontSize/100)*(1+2*PADDING)));
height=Math.max(1,Math.round(height));
const surface=canvas(width,height);
const ctx=surface.getContext('2d');
ctx.font=`bold ${fontSize}px ${family}`;
ctx.textBaseline='alphabetic';
ctx.textAlign='center';
const{r,g,b}=colour;
ctx.fillStyle=`rgb(${r} ${g} ${b})`;
const baseline=height-descent*(fontSize/100)-height*PADDING/(1+2*PADDING);
ctx.fillText(words,width/2,baseline);
const{data}=ctx.getImageData(0,0,width,height);
const count=width*height;
const rgb=new Uint8Array(count*3);
const alpha=new Uint8Array(count);
for(let i=0;i<count;i+=1){
rgb[i*3]=colour.r;
rgb[i*3+1]=colour.g;
rgb[i*3+2]=colour.b;
alpha[i]=data[i*4+3];
}
return{width,height,rgb,alpha};
}
function canvas(width,height){
if(typeof OffscreenCanvas==='function')return new OffscreenCanvas(width,height);
const element=document.createElement('canvas');
element.width=width;
element.height=height;
return element;
}
export const COLOURS={
grey:{r:96,g:96,b:96},
red:{r:192,g:32,b:32},
blue:{r:32,g:80,b:192},
};
