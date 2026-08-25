/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{blur,globalBinarize,grayscale,invert,localBinarize}from'./binarize.js';
import{readQr}from'./detect.js';
import{readLinear}from'./linear.js';
import{describe}from'./payload.js';
export function scan(image,{thorough=true}={}){
const{width,height}=image;
if(!width||!height)return null;
const gray=grayscale(image.data,width,height);
const local=localBinarize(gray,width,height);
const passes=[{bits:local,how:'local'}];
if(thorough){
passes.push(
{bits:invert(local),how:'inverted'},
{bits:globalBinarize(gray,width,height),how:'global'},
{bits:localBinarize(blur(gray,width,height),width,height),how:'softened'},
);
}else{
passes.push({bits:invert(local),how:'inverted'});
}
for(const dense of thorough?[false,true]:[false]){
for(const pass of passes){
const found=readQr(pass.bits,width,height,dense);
if(found){
return{
kind:'qr',
symbology:'qr',
name:'QR code',
how:pass.how,
dense,
...found,
...describe(found.text),
};
}
}
}
for(const pass of passes){
const found=readLinear(pass.bits,width,height,thorough?24:12);
if(found){
return{
kind:'linear',
symbology:found.format,
how:pass.how,
...found,
...describe(found.text),
};
}
}
return null;
}
