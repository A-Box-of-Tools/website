/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{decodeRLE}from'./rle.js';
import{decodeJPEGLossless}from'./jpeg-lossless.js';
import{number,numbers,text}from'./values.js';
export function imageInfo(dataset,decoder){
const rows=number(dataset,'00280010',decoder,0);
const columns=number(dataset,'00280011',decoder,0);
const samplesPerPixel=number(dataset,'00280002',decoder,1);
const bitsAllocated=number(dataset,'00280100',decoder,16);
const bitsStored=number(dataset,'00280101',decoder,bitsAllocated);
const highBit=number(dataset,'00280102',decoder,bitsStored-1);
const photometric=text(dataset,'00280004',decoder).toUpperCase()||'MONOCHROME2';
const centers=numbers(dataset,'00281050',decoder);
const widths=numbers(dataset,'00281051',decoder);
const spacing=numbers(dataset,'00280030',decoder);
return{
rows,
columns,
samplesPerPixel,
bitsAllocated,
bitsStored:bitsStored>0&&bitsStored<=bitsAllocated?bitsStored:bitsAllocated,
highBit:highBit>=0&&highBit<bitsAllocated?highBit:bitsStored-1,
signed:number(dataset,'00280103',decoder,0)===1,
planar:number(dataset,'00280006',decoder,0)===1,
photometric,
modality:text(dataset,'00080060',decoder).toUpperCase(),
subsampled:photometric==='YBR_FULL_422'&&samplesPerPixel===3,
frames:Math.max(1,number(dataset,'00280008',decoder,1)),
slope:number(dataset,'00281053',decoder,1)||1,
intercept:number(dataset,'00281052',decoder,0),
rescaleType:text(dataset,'00281054',decoder),
windowCenters:centers,
windowWidths:widths,
windowNames:(dataset?.byTag.get('00281055')?.value
?String(decoder.decode(dataset.byTag.get('00281055').value)).split('\\')
:[]).map((name)=>name.trim()),
voiFunction:text(dataset,'00281056',decoder).toUpperCase(),
spacing:spacing.length>=2?{row:spacing[0],column:spacing[1]}:null,
padding:padValue(dataset,decoder,number(dataset,'00280103',decoder,0)===1),
palette:readPalette(dataset,decoder),
};
}
function padValue(dataset,decoder,signed){
if(!dataset?.byTag.has('00280120'))return null;
const raw=number(dataset,'00280120',decoder,null);
if(raw===null)return null;
return signed&&raw>32767?raw-65536:raw;
}
function readPalette(dataset,decoder){
const descriptor=numbers(dataset,'00281101',decoder);
if(descriptor.length<3)return null;
const[declared,first,bits]=descriptor;
const count=declared===0?65536:declared;
const table=(tag)=>{
const element=dataset.byTag.get(tag);
if(!element?.value)return null;
const bytes=element.value;
const out=new Uint8Array(count);
const eightBit=bytes.length<=count;
for(let at=0;at<count;at+=1){
if(eightBit){
out[at]=bytes[at]??0;
}else{
const value=(bytes[at*2+1]<<8)|bytes[at*2];
out[at]=bits>8?value>>8:value&0xff;
}
}
return out;
};
const red=table('00281201');
const green=table('00281202');
const blue=table('00281203');
if(!red||!green||!blue)return null;
return{red,green,blue,first,count};
}
export function decodeFrame(bytes,pixel,info,syntax,index){
const{rows,columns,samplesPerPixel}=info;
if(!rows||!columns)throw new Error('this file declares no image size');
const count=rows*columns;
if(syntax.pixels==='lossless'){
const fragment=frameFragment(bytes,pixel,info.frames,index);
const jpeg=decodeJPEGLossless(fragment);
return fromSamples(jpeg.samples,{...info,planar:false},jpeg.components,
count,false);
}
if(syntax.pixels==='rle'){
const fragment=frameFragment(bytes,pixel,info.frames,index);
const perSample=Math.max(1,Math.ceil(info.bitsAllocated/8));
const raw=decodeRLE(fragment,count,samplesPerPixel,perSample);
return fromBytes(raw,{...info,planar:false},count,true);
}
if(syntax.pixels!=='native'){
throw new Error(`${syntax.name} is a compression this page cannot decode`);
}
const frameBytes=nativeFrame(bytes,pixel,info,count,index);
if(info.subsampled){
return fromBytes(expand422(frameBytes,count),{...info,subsampled:false},
count,syntax.little);
}
return fromBytes(frameBytes,info,count,syntax.little);
}
function nativeFrame(bytes,pixel,info,count,index){
const bytesPerSample=Math.ceil(info.bitsAllocated/8);
const perFrame=info.bitsAllocated===1
?Math.ceil(count*info.samplesPerPixel/8)
:count*(info.subsampled?2:info.samplesPerPixel)*bytesPerSample;
const start=pixel.offset+perFrame*index;
const end=Math.min(start+perFrame,pixel.offset+pixel.length,bytes.length);
if(start>=end)throw new Error(`frame ${index + 1} is past the end of the pixel data`);
const frame=bytes.subarray(start,end);
if(frame.length<perFrame){
const padded=new Uint8Array(perFrame);
padded.set(frame);
return padded;
}
return frame;
}
export function frameFragment(bytes,pixel,frames,index){
const list=pixel.fragments??[];
if(list.length===0)throw new Error('this file has no pixel data fragments');
let wanted=list;
if(frames<=1){
wanted=list;
}else if(list.length===frames){
wanted=[list[index]];
}else if(pixel.offsetTable?.length===frames){
const base=list[0].offset-8;
const from=pixel.offsetTable[index];
const to=index+1<frames?pixel.offsetTable[index+1]:Infinity;
wanted=list.filter((part)=>part.offset-8-base>=from
&&part.offset-8-base<to);
}else{
throw new Error(`this file has ${list.length} pixel data fragments for ${frames
    } frames and no offset table to say which belong to which`
);
}
if(wanted.length===0)throw new Error(`no pixel data fragment holds frame ${index + 1}`);
if(wanted.length===1){
return bytes.subarray(wanted[0].offset,wanted[0].offset+wanted[0].length);
}
const total=wanted.reduce((sum,part)=>sum+part.length,0);
const joined=new Uint8Array(total);
let at=0;
for(const part of wanted){
joined.set(bytes.subarray(part.offset,part.offset+part.length),at);
at+=part.length;
}
return joined;
}
function fromBytes(bytes,info,count,little){
const{bitsAllocated,bitsStored,highBit,signed,samplesPerPixel}=info;
const total=count*samplesPerPixel;
const shift=Math.max(0,highBit-bitsStored+1);
const wide=bitsStored>=32;
const mask=wide?-1:(1<<bitsStored)-1;
const sign=wide?0:1<<(bitsStored-1);
const raw=new Int32Array(total);
if(bitsAllocated===1){
for(let at=0;at<total;at+=1){
raw[at]=(bytes[at>>3]>>(at&7))&1;
}
}else if(bitsAllocated===8){
for(let at=0;at<total;at+=1)raw[at]=bytes[at]??0;
}else if(bitsAllocated===16){
for(let at=0;at<total;at+=1){
const low=bytes[at*2]??0;
const high=bytes[at*2+1]??0;
raw[at]=little?(high<<8)|low:(low<<8)|high;
}
}else if(bitsAllocated===32){
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
for(let at=0;at<total;at+=1){
raw[at]=at*4+4<=bytes.length?view.getUint32(at*4,little):0;
}
}else{
throw new Error(`${bitsAllocated} bits per sample, which is not 1, 8, 16 or 32`);
}
for(let at=0;at<total;at+=1){
let value=wide?raw[at]:(raw[at]>>shift)&mask;
if(sign&&signed&&(value&sign))value-=mask+1;
raw[at]=value;
}
return fromSamples(raw,info,samplesPerPixel,count,true);
}
function fromSamples(values,info,samplesPerPixel,count,masked){
const{rows,columns,planar,photometric,bitsStored,signed}=info;
let out=values;
if(!masked){
const mask=(1<<bitsStored)-1;
const sign=1<<(bitsStored-1);
const converted=new Int32Array(values.length);
for(let at=0;at<values.length;at+=1){
let value=values[at]&mask;
if(signed&&(value&sign))value-=mask+1;
converted[at]=value;
}
out=converted;
}else if(!(out instanceof Int32Array)){
out=Int32Array.from(out);
}
if(samplesPerPixel===3&&planar)out=interleave(out,count);
if(samplesPerPixel===3&&photometric.startsWith('YBR')){
out=ybrToRgb(out,count);
}
let min=Infinity;
let max=-Infinity;
const padding=info.padding;
for(let at=0;at<out.length;at+=1){
const value=out[at];
if(padding!==null&&value===padding)continue;
if(value<min)min=value;
if(value>max)max=value;
}
if(min===Infinity){min=0;max=0;}
return{
width:columns,
height:rows,
samples:samplesPerPixel===3?3:1,
values:out,
min,
max,
};
}
function interleave(values,count){
const out=new Int32Array(count*3);
for(let at=0;at<count;at+=1){
out[at*3]=values[at];
out[at*3+1]=values[count+at];
out[at*3+2]=values[count*2+at];
}
return out;
}
function ybrToRgb(values,count){
const out=new Int32Array(count*3);
for(let at=0;at<count;at+=1){
const y=values[at*3];
const cb=values[at*3+1]-128;
const cr=values[at*3+2]-128;
out[at*3]=clamp8(y+1.402*cr);
out[at*3+1]=clamp8(y-0.344136*cb-0.714136*cr);
out[at*3+2]=clamp8(y+1.772*cb);
}
return out;
}
const clamp8=(value)=>(value<0?0:value>255?255:Math.round(value));
function expand422(bytes,count){
const out=new Uint8Array(count*3);
for(let pair=0;pair*2<count;pair+=1){
const from=pair*4;
const cb=bytes[from+2]??0;
const cr=bytes[from+3]??0;
for(let step=0;step<2;step+=1){
const at=pair*2+step;
if(at>=count)break;
out[at*3]=bytes[from+step]??0;
out[at*3+1]=cb;
out[at*3+2]=cr;
}
}
return out;
}
