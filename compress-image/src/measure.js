/* Built from https://github.com/A-Box-of-Tools/website by build.py. Comments and indentation removed; nothing renamed. Verify with: python build.py --check */
const COMPARE_LONG_SIDE=1280;
const WINDOW=8;
const C1=(0.01*255)**2;
const C2=(0.03*255)**2;
function luma(source,width,height){
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});
ctx.fillStyle='#ffffff';
ctx.fillRect(0,0,width,height);
ctx.imageSmoothingEnabled=true;
ctx.imageSmoothingQuality='high';
ctx.drawImage(source,0,0,width,height);
const{data}=ctx.getImageData(0,0,width,height);
const out=new Float32Array(width*height);
for(let i=0,p=0;i<out.length;i+=1,p+=4){
out[i]=0.299*data[p]+0.587*data[p+1]+0.114*data[p+2];
}
canvas.width=0;
canvas.height=0;
return out;
}
export function compare(original,result,size){
const scale=Math.min(1,COMPARE_LONG_SIDE/Math.max(size.width,size.height));
const width=Math.max(WINDOW,Math.round(size.width*scale));
const height=Math.max(WINDOW,Math.round(size.height*scale));
let a;
let b;
try{
a=luma(original,width,height);
b=luma(result,width,height);
}catch{
return null;
}
let ssimTotal=0;
let windows=0;
let squareError=0;
const acrossWindows=Math.floor(width/WINDOW);
const downWindows=Math.floor(height/WINDOW);
for(let wy=0;wy<downWindows;wy+=1){
for(let wx=0;wx<acrossWindows;wx+=1){
let sumA=0;
let sumB=0;
let sumAA=0;
let sumBB=0;
let sumAB=0;
for(let y=0;y<WINDOW;y+=1){
let i=(wy*WINDOW+y)*width+wx*WINDOW;
for(let x=0;x<WINDOW;x+=1,i+=1){
const va=a[i];
const vb=b[i];
sumA+=va;
sumB+=vb;
sumAA+=va*va;
sumBB+=vb*vb;
sumAB+=va*vb;
}
}
const n=WINDOW*WINDOW;
const meanA=sumA/n;
const meanB=sumB/n;
const varA=sumAA/n-meanA*meanA;
const varB=sumBB/n-meanB*meanB;
const covAB=sumAB/n-meanA*meanB;
const numerator=(2*meanA*meanB+C1)*(2*covAB+C2);
const denominator=(meanA*meanA+meanB*meanB+C1)*(varA+varB+C2);
ssimTotal+=numerator/denominator;
windows+=1;
}
}
for(let i=0;i<a.length;i+=1){
const diff=a[i]-b[i];
squareError+=diff*diff;
}
const mse=squareError/a.length;
const psnr=mse===0?Infinity:10*Math.log10((255*255)/mse);
return{ssim:windows?ssimTotal/windows:1,psnr};
}
export function hasTransparency(source,size){
const scale=Math.min(1,200/Math.max(size.width,size.height));
const width=Math.max(1,Math.round(size.width*scale));
const height=Math.max(1,Math.round(size.height*scale));
const canvas=document.createElement('canvas');
canvas.width=width;
canvas.height=height;
const ctx=canvas.getContext('2d',{willReadFrequently:true});
ctx.drawImage(source,0,0,width,height);
let transparent=false;
try{
const{data}=ctx.getImageData(0,0,width,height);
for(let p=3;p<data.length;p+=4){
if(data[p]<250){transparent=true;break;}
}
}catch{
transparent=false;
}
canvas.width=0;
canvas.height=0;
return transparent;
}
