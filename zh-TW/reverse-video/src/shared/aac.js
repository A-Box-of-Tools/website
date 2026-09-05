/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{fourcc,bytes,concat,u16,u32,box}from'./mp4-boxes.js?v=710dc5c362';
const DEFAULT_BITRATE=160_000;
function descriptorLength(view,at){
let value=0;
let next=at;
for(let i=0;i<4;i++){
const byte=view.getUint8(next);
next++;
value=(value<<7)|(byte&0x7f);
if(!(byte&0x80))break;
}
return{value,next};
}
function objectType(asc){
if(!asc.length)return 2;
const top=asc[0]>>3;
if(top!==31)return top;
if(asc.length<2)return 2;
return 32+(((asc[0]&0x7)<<3)|(asc[1]>>5));
}
export function audioDecoderConfig(track){
if(!track?.sampleEntry||track.entryType!=='mp4a')return null;
const entry=track.sampleEntry;
const view=new DataView(entry.buffer,entry.byteOffset,entry.byteLength);
let at=8+28;
let esds=null;
while(at+8<=entry.byteLength){
const size=view.getUint32(at);
if(size<8||at+size>entry.byteLength)break;
if(fourcc(view,at+4)==='esds'){
esds={body:at+8,end:at+size};
break;
}
at+=size;
}
if(!esds)return null;
try{
let read=esds.body+4;
if(view.getUint8(read)!==0x03)return null;
read=descriptorLength(view,read+1).next;
read+=2;
const flags=view.getUint8(read);
read+=1;
if(flags&0x80)read+=2;
if(flags&0x40)read+=1+view.getUint8(read);
if(flags&0x20)read+=2;
if(view.getUint8(read)!==0x04)return null;
read=descriptorLength(view,read+1).next;
const indication=view.getUint8(read);
if(indication!==0x40)return null;
read+=1+1+3+4+4;
if(view.getUint8(read)!==0x05)return null;
const length=descriptorLength(view,read+1);
const asc=new Uint8Array(
entry.buffer.slice(
entry.byteOffset+length.next,entry.byteOffset+length.next+length.value));
if(!asc.length)return null;
return{
codec:`mp4a.40.${objectType(asc)}`,
description:asc,
sampleRate:Math.round(track.sampleRate),
numberOfChannels:track.channels,
};
}catch{
return null;
}
}
function descriptor(tag,...payload){
const body=concat(payload);
if(body.byteLength>0x7f){
throw new Error('audio.descriptor');
}
return concat([bytes(tag,body.byteLength),body]);
}
export function mp4aSampleEntry({channels,sampleRate,asc,bitrate=DEFAULT_BITRATE}){
const esds=box('esds',u32(0),
descriptor(0x03,
u16(1),
bytes(0x00),
descriptor(0x04,
bytes(0x40),
bytes(0x15),
bytes(0,0,0),
u32(bitrate),
u32(bitrate),
descriptor(0x05,asc),
),
descriptor(0x06,bytes(0x02)),
),
);
return box('mp4a',
new Uint8Array(6),
u16(1),
new Uint8Array(8),
u16(channels),
u16(16),
u16(0),
u16(0),
u32(sampleRate<<16),
esds,
);
}
