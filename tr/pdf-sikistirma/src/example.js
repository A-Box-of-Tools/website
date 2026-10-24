/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{examplePdfFile}from'./shared/example-pdf.js?v=1986656815';
import{photoCanvas}from'./shared/example-photo.js?v=1986656815';
const WIDTH=1400;
const HEIGHT=1000;
async function jpegBytes(seed){
const canvas=photoCanvas(WIDTH,HEIGHT,{seed});
const blob=await new Promise((resolve,reject)=>{
canvas.toBlob((made)=>(made?resolve(made):reject(new Error('encode'))),'image/jpeg',0.95);
});
return new Uint8Array(await blob.arrayBuffer());
}
export async function makeExample(){
const jpegs=await Promise.all([20260907,481207,90210].map(jpegBytes));
return examplePdfFile('example.pdf',{
pages:3,
jpegs,
jpegSize:{width:WIDTH,height:HEIGHT},
});
}
