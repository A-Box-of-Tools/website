/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const ALPHA_FLOOR=128;
export function maskFromImage(image,options={}){
const{width:w,height:h,data}=image;
const invert=options.invert===true;
const grey=new Uint8Array(w*h);
const opaque=new Uint8Array(w*h);
for(let i=0,p=0;i<grey.length;i++,p+=4){
const a=data[p+3];
opaque[i]=a>=ALPHA_FLOOR?1:0;
const k=a/255;
const r=data[p]*k+255*(1-k);
const g=data[p+1]*k+255*(1-k);
const b=data[p+2]*k+255*(1-k);
grey[i]=(0.299*r+0.587*g+0.114*b)|0;
}
const wanted=options.threshold===undefined?'otsu':options.threshold;
const threshold=wanted==='otsu'?otsu(grey):wanted;
const bits=new Uint8Array(w*h);
for(let i=0;i<bits.length;i++){
const dark=opaque[i]===1&&grey[i]<=threshold;
bits[i]=(invert?!dark:dark)?1:0;
}
return{w,h,bits,grey,rgba:data,threshold};
}
export function otsu(grey){
const hist=new Float64Array(256);
for(let i=0;i<grey.length;i++)hist[grey[i]]++;
const total=grey.length;
let sum=0;
for(let v=0;v<256;v++)sum+=v*hist[v];
let sumB=0,wB=0,best=-1,level=127;
for(let v=0;v<256;v++){
wB+=hist[v];
if(wB===0)continue;
const wF=total-wB;
if(wF===0)break;
sumB+=v*hist[v];
const mB=sumB/wB;
const mF=(sum-sumB)/wF;
const between=wB*wF*(mB-mF)*(mB-mF);
if(between>best){best=between;level=v;}
}
return level;
}
export function inkFraction(mask){
let n=0;
for(let i=0;i<mask.bits.length;i++)n+=mask.bits[i];
return n/mask.bits.length;
}
