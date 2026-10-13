/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{AbortedError,said}from'./shared/errors.js?v=6839eb22c4';
import{findDarkHeader,normalizeReceiptImage,headerReadingDimensions}from'./ocr-image.js?v=6839eb22c4';
import{merchantFromRecognition,needsRecoveryRecognition,needsHeaderRecognition}from'./ocr-results.js?v=6839eb22c4';
const vendor=new URL('../vendor/',import.meta.url);
const assets={
core:new URL('tesseract-core-lstm.js',vendor).href,
wasm:new URL('wasm-data.js',vendor).href,
model:new URL('eng-data.js',vendor).href,
worker:new URL('worker.min.js',vendor).href,
};
const wrapper=new URL('ocr-worker.js',vendor).href;
let current=null;
let nextId=0;
export function recognize(canvas,onProgress=()=>{}){
const session=current??=createSession();
const run=session.tail.then(async()=>{
if(session.closed)throw new AbortedError();
session.progress=onProgress;
await session.ready;
const blob=await canvasBlob(canvas);
if(session.closed)throw new AbortedError();
const image=new Uint8Array(await blob.arrayBuffer());
if(session.closed)throw new AbortedError();
const data=await request(session,'recognize',{
image,
options:{tessedit_pageseg_mode:'6',thresholding_method:'0',user_defined_dpi:'300'},
output:{text:true,blocks:true},
},180000);
let merchant=merchantFromRecognition(data);
let recovery=null;
if(needsRecoveryRecognition(data)){
let recoveryCanvas;
try{
recoveryCanvas=normalizedCanvas(canvas);
if(recoveryCanvas){
const recoveryBlob=await canvasBlob(recoveryCanvas);
if(session.closed)throw new AbortedError();
const recoveryImage=new Uint8Array(await recoveryBlob.arrayBuffer());
recovery=await request(session,'recognize',{
image:recoveryImage,
options:{tessedit_pageseg_mode:'6',thresholding_method:'2',user_defined_dpi:'300'},
output:{text:true,blocks:true},
},180000);
}
}catch(error){
if(error.name==='AbortError')throw error;
}finally{
if(recoveryCanvas)recoveryCanvas.width=recoveryCanvas.height=0;
}
}
const text=typeof data.text==='string'?data.text:'';
const result={
text,bodyText:text,merchant,
confidence:Number.isFinite(data.confidence)?data.confidence:0,
};
if(recovery){
result.recoveryText=typeof recovery.text==='string'?recovery.text:'';
result.recoveryMerchant=merchantFromRecognition(recovery);
result.recoveryConfidence=Number.isFinite(recovery.confidence)?recovery.confidence:0;
}
if(!session.closed&&needsHeaderRecognition(result)){
let headerCanvas;
try{
headerCanvas=closerHeader(canvas);
if(headerCanvas){
const headerBlob=await canvasBlob(headerCanvas);
if(session.closed)throw new AbortedError();
const headerImage=new Uint8Array(await headerBlob.arrayBuffer());
const header=await request(session,'recognize',{
image:headerImage,
options:{tessedit_pageseg_mode:'6',thresholding_method:'2',user_defined_dpi:'300'},
output:{text:true,blocks:true},
},180000);
result.headerText=typeof header.text==='string'?header.text:'';
result.headerMerchant=merchantFromRecognition(header);
result.headerConfidence=Number.isFinite(header.confidence)?header.confidence:0;
}
}catch(error){
if(error.name==='AbortError')throw error;
}finally{
if(headerCanvas)headerCanvas.width=headerCanvas.height=0;
}
}
if(!merchant&&!result.recoveryMerchant&&!result.headerMerchant&&!session.closed){
let headerCanvas;
try{
const context=canvas.getContext('2d');
const region=findDarkHeader(context.getImageData(0,0,canvas.width,canvas.height));
if(region){
headerCanvas=invertedHeader(canvas,region);
const headerBlob=await canvasBlob(headerCanvas);
if(session.closed)throw new AbortedError();
const headerImage=new Uint8Array(await headerBlob.arrayBuffer());
for(const mode of['6','11']){
const header=await request(session,'recognize',{
image:headerImage,
options:{tessedit_pageseg_mode:mode,thresholding_method:'0',user_defined_dpi:'300'},
output:{text:true,blocks:true},
},180000);
merchant=merchantFromRecognition(header,{minimumConfidence:55});
if(merchant)break;
}
}
}catch(error){
if(error.name==='AbortError')throw error;
}finally{
if(headerCanvas)headerCanvas.width=headerCanvas.height=0;
}
}
result.text=merchant&&!text.includes(merchant)?`${merchant}\n${text}`:text;
result.merchant=merchant;
return result;
});
session.tail=run.catch(()=>{});
return run;
}
function closerHeader(canvas){
const dimensions=headerReadingDimensions(canvas.width,canvas.height);
if(!dimensions)return null;
const header=document.createElement('canvas');
header.width=dimensions.width;
header.height=dimensions.height;
try{
const context=header.getContext('2d');
if(!context)throw said('ocr.failed');
context.fillStyle='#fff';
context.fillRect(0,0,header.width,header.height);
context.imageSmoothingEnabled=true;
context.imageSmoothingQuality='high';
const border=dimensions.border;
context.drawImage(canvas,0,0,canvas.width,dimensions.sourceHeight,
border,border,header.width-border*2,header.height-border*2);
const pixels=normalizeReceiptImage(context.getImageData(0,0,header.width,header.height));
if(!pixels)throw said('ocr.failed');
context.putImageData(new ImageData(pixels.data,pixels.width,pixels.height),0,0);
return header;
}catch(error){
header.width=header.height=0;
throw error;
}
}
function normalizedCanvas(canvas){
const context=canvas.getContext('2d');
if(!context)return null;
const pixels=normalizeReceiptImage(context.getImageData(0,0,canvas.width,canvas.height));
if(!pixels)return null;
const recovery=document.createElement('canvas');
recovery.width=pixels.width;
recovery.height=pixels.height;
try{
const destination=recovery.getContext('2d');
if(!destination)throw said('ocr.failed');
destination.putImageData(new ImageData(pixels.data,pixels.width,pixels.height),0,0);
return recovery;
}catch(error){
recovery.width=recovery.height=0;
throw error;
}
}
function invertedHeader(canvas,{x,y,width,height}){
const border=16;
const header=document.createElement('canvas');
header.width=width+border*2;
header.height=height+border*2;
try{
const context=header.getContext('2d');
if(!context)throw said('ocr.failed');
context.fillStyle='#fff';
context.fillRect(0,0,header.width,header.height);
context.drawImage(canvas,x,y,width,height,border,border,width,height);
const pixels=context.getImageData(border,border,width,height);
for(let i=0;i<pixels.data.length;i+=4){
const gray=255-Math.round(pixels.data[i]*0.299+pixels.data[i+1]*0.587+pixels.data[i+2]*0.114);
pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=gray;
pixels.data[i+3]=255;
}
context.putImageData(pixels,border,border);
return header;
}catch(error){
header.width=header.height=0;
throw error;
}
}
export function terminateOcr(){
if(current)dispose(current,new AbortedError());
}
function createSession(){
const bootstrap=`self.RECEIPT_OCR_ASSETS = ${JSON.stringify(assets)};\n`
+`importScripts(${JSON.stringify(wrapper)});\n`;
const url=URL.createObjectURL(new Blob([bootstrap],{
type:'application/javascript',
}));
let worker;
try{
worker=new Worker(url);
}catch{
URL.revokeObjectURL(url);
throw said('ocr.failed');
}
const session={
worker,url,pending:new Map(),closed:false,
progress:()=>{},tail:Promise.resolve(),ready:null,
};
worker.addEventListener('message',({data})=>{
if(session.closed)return;
if(data.status==='progress'){
session.progress({
status:data.data.status,
progress:Math.max(0,Math.min(1,Number(data.data.progress)||0)),
});
return;
}
const job=session.pending.get(data.jobId);
if(!job)return;
session.pending.delete(data.jobId);
clearTimeout(job.timer);
if(data.status==='resolve')job.resolve(data.data);
else if(data.status==='reject')dispose(session,said('ocr.failed'),job);
});
worker.addEventListener('error',(event)=>{
event.preventDefault();
dispose(session,said('ocr.failed'));
});
worker.addEventListener('messageerror',()=>{
dispose(session,said('ocr.failed'));
});
session.ready=initialize(session).catch((error)=>{
dispose(session,error);
throw error;
});
session.ready.catch(()=>{});
return session;
}
async function initialize(session){
await request(session,'load',{
options:{lstmOnly:true,corePath:assets.core,logging:false},
});
await request(session,'loadLanguage',{
langs:'eng',
options:{cacheMethod:'none',gzip:true,lstmOnly:true},
});
await request(session,'initialize',{langs:'eng',oem:1,config:{}});
await request(session,'setParameters',{
params:{tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'},
});
}
function request(session,action,payload,timeout=120000){
if(session.closed)return Promise.reject(new AbortedError());
const jobId=`receipt-${++nextId}`;
return new Promise((resolve,reject)=>{
const timer=setTimeout(()=>dispose(session,said('ocr.timeout')),timeout);
session.pending.set(jobId,{resolve,reject,timer});
try{
session.worker.postMessage({workerId:'receipt-ocr',jobId,action,payload});
}catch{
dispose(session,said('ocr.failed'));
}
});
}
function dispose(session,error,rejectedJob=null){
if(session.closed){
rejectedJob?.reject(error);
return;
}
session.closed=true;
session.worker.terminate();
URL.revokeObjectURL(session.url);
rejectedJob?.reject(error);
for(const job of session.pending.values()){
clearTimeout(job.timer);
job.reject(error);
}
session.pending.clear();
if(current===session)current=null;
}
function canvasBlob(canvas){
return new Promise((resolve,reject)=>{
canvas.toBlob((blob)=>{
if(blob)resolve(blob);
else reject(said('ocr.failed'));
},'image/png');
});
}
