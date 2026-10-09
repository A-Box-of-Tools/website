/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{makeQr}from'./shared/qr.js?v=f402d491e6';
const TEXT='https://abox.tools/qr-barcode-reader/';
export function makeExample(){
const qr=makeQr(TEXT,{level:'M'});
const quiet=4;
const scale=8;
const side=(qr.size+quiet*2)*scale;
const canvas=document.createElement('canvas');
canvas.width=side;
canvas.height=side;
const ctx=canvas.getContext('2d');
ctx.fillStyle='#ffffff';
ctx.fillRect(0,0,side,side);
ctx.fillStyle='#000000';
for(let y=0;y<qr.size;y+=1){
for(let x=0;x<qr.size;x+=1){
if(qr.modules[y*qr.size+x]){
ctx.fillRect((x+quiet)*scale,(y+quiet)*scale,scale,scale);
}
}
}
return new Promise((resolve,reject)=>{
canvas.toBlob(
(blob)=>(blob
?resolve(new File([blob],'example-qr.png',{type:'image/png'}))
:reject(new Error('encode'))),
'image/png',
);
});
}
