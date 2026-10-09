/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const LOWEST=8000;
const HIGHEST=96000;
const MPEG_RATES=[
[11025,12000,8000],
null,
[22050,24000,16000],
[44100,48000,32000],
];
const AAC_RATES=[
96000,88200,64000,48000,44100,32000,24000,
22050,16000,12000,11025,8000,7350,
];
export function sniffSampleRate(bytes){
const rate=read(bytes);
return rate&&rate>=LOWEST&&rate<=HIGHEST?Math.round(rate):null;
}
function read(bytes){
if(bytes.length<16)return null;
const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
if(tag(bytes,0)==='RIFF'&&tag(bytes,8)==='WAVE')return riff(bytes,view);
if(tag(bytes,0)==='FORM'&&tag(bytes,8).startsWith('AIF'))return aiff(bytes,view);
if(tag(bytes,0)==='fLaC')return flac(bytes);
if(tag(bytes,0)==='OggS')return ogg(bytes,view);
if(tag(bytes,4)==='ftyp')return iso(bytes,view);
if(bytes[0]===0x1a&&bytes[1]===0x45&&bytes[2]===0xdf&&bytes[3]===0xa3){
return matroska(bytes,view);
}
return mpeg(bytes);
}
function riff(bytes,view){
let at=12;
while(at+8<=bytes.length){
const id=tag(bytes,at);
const size=view.getUint32(at+4,true);
if(id==='fmt '&&at+12<=bytes.length)return view.getUint32(at+12,true);
at+=8+size+(size%2);
}
return null;
}
function aiff(bytes,view){
let at=12;
while(at+8<=bytes.length){
const id=tag(bytes,at);
const size=view.getUint32(at+4,false);
if(id==='COMM'&&at+22<=bytes.length){
const exponent=view.getUint16(at+16,false)-16383;
const mantissa=view.getUint32(at+18,false);
return Math.round(mantissa*2**(exponent-31));
}
at+=8+size+(size%2);
}
return null;
}
function flac(bytes){
const at=4+4+10;
if(at+3>bytes.length)return null;
return(bytes[at]<<12)|(bytes[at+1]<<4)|(bytes[at+2]>>4);
}
function ogg(bytes,view){
const segments=bytes[26];
const at=27+segments;
if(at+16>bytes.length)return null;
if(tag(bytes,at)==='Opus')return 48000;
const vorbis=bytes[at]===1&&String.fromCharCode(...bytes.subarray(at+1,at+7))==='vorbis';
return vorbis?view.getUint32(at+12,true):null;
}
function iso(bytes,view){
let best=null;
const walk=(start,end,track)=>{
let at=start;
while(at+8<=end){
let size=view.getUint32(at,false);
const type=tag(bytes,at+4);
let header=8;
if(size===1){
if(at+16>end)return;
size=view.getUint32(at+8,false)*2**32+view.getUint32(at+12,false);
header=16;
}else if(size===0){
size=end-at;
}
if(size<header||at+size>end)return;
const body=at+header;
const stop=at+size;
if(type==='trak'){
const found={audio:false,rate:null};
walk(body,stop,found);
if(found.audio&&found.rate)best=Math.max(best??0,found.rate);
}else if(type==='hdlr'&&track){
if(body+12<=stop&&tag(bytes,body+8)==='soun')track.audio=true;
}else if(type==='mdhd'&&track){
const version=bytes[body];
const timescale=version===1
?(body+28<=stop?view.getUint32(body+20,false):null)
:(body+16<=stop?view.getUint32(body+12,false):null);
if(timescale)track.rate=Math.max(track.rate??0,timescale);
}else if(type==='stsd'&&track){
const rate=soundEntry(view,body+8,stop);
if(rate)track.rate=Math.max(track.rate??0,rate);
}else if(CONTAINERS.has(type)){
walk(body,stop,track);
}
at=stop;
}
};
walk(0,bytes.length,null);
return best;
}
const CONTAINERS=new Set(['moov','mdia','minf','stbl']);
function soundEntry(view,at,end){
if(at+8>end)return null;
const size=view.getUint32(at,false);
if(size<36||at+size>end||at+36>end)return null;
return view.getUint16(at+32,false);
}
function matroska(bytes,view){
const SEGMENT=0x18538067;
const TRACKS=0x1654ae6b;
const TRACK_ENTRY=0xae;
const TRACK_TYPE=0x83;
const CODEC_ID=0x86;
const AUDIO=0xe1;
const SAMPLING=0xb5;
const OUTPUT_SAMPLING=0x78b5;
let found=null;
const each=(start,end,visit)=>{
let at=start;
while(at<end){
const id=vint(bytes,at,end,true);
if(!id)return;
const size=vint(bytes,id.next,end,false);
if(!size)return;
const stop=size.unknown?end:Math.min(end,size.next+size.value);
if(stop<size.next)return;
visit(id.value,size.next,stop);
at=stop;
}
};
each(0,bytes.length,(id,from,to)=>{
if(id!==SEGMENT)return;
each(from,to,(segmentId,tracksFrom,tracksTo)=>{
if(segmentId!==TRACKS)return;
each(tracksFrom,tracksTo,(tracksId,entryFrom,entryTo)=>{
if(tracksId!==TRACK_ENTRY)return;
let isAudio=false;
let codec='';
let rate=null;
each(entryFrom,entryTo,(field,valueFrom,valueTo)=>{
if(field===TRACK_TYPE)isAudio=unsigned(bytes,valueFrom,valueTo)===2;
else if(field===CODEC_ID)codec=text(bytes,valueFrom,valueTo);
else if(field===AUDIO){
each(valueFrom,valueTo,(inner,numberFrom,numberTo)=>{
if(inner===SAMPLING&&rate===null)rate=float(view,numberFrom,numberTo);
else if(inner===OUTPUT_SAMPLING)rate=float(view,numberFrom,numberTo);
});
}
});
if(isAudio&&codec.includes('OPUS'))found=found??48000;
else if(isAudio&&rate)found=found??rate;
});
});
});
return found;
}
function vint(bytes,at,end,keepMarker){
if(at>=end)return null;
const first=bytes[at];
if(first===0)return null;
let length=1;
let mask=0x80;
while(!(first&mask)){mask>>=1;length+=1;}
if(at+length>end||length>8)return null;
let value=keepMarker?first:first&(mask-1);
let unknown=(first&(mask-1))===mask-1;
for(let i=1;i<length;i+=1){
value=value*256+bytes[at+i];
unknown=unknown&&bytes[at+i]===0xff;
}
return{value,next:at+length,unknown:!keepMarker&&unknown};
}
const unsigned=(bytes,from,to)=>{
let value=0;
for(let at=from;at<to;at+=1)value=value*256+bytes[at];
return value;
};
const text=(bytes,from,to)=>{
let out='';
for(let at=from;at<to&&bytes[at];at+=1)out+=String.fromCharCode(bytes[at]);
return out;
};
function float(view,from,to){
if(to-from===4)return view.getFloat32(from,false);
if(to-from===8)return view.getFloat64(from,false);
return null;
}
function mpeg(bytes){
let at=0;
const tagged=bytes[0]===0x49&&bytes[1]===0x44&&bytes[2]===0x33;
if(tagged&&bytes.length>10){
const size=((bytes[6]&0x7f)<<21)|((bytes[7]&0x7f)<<14)
|((bytes[8]&0x7f)<<7)|(bytes[9]&0x7f);
at=10+size;
if(bytes[5]&0x10)at+=10;
}
const limit=Math.min(bytes.length-4,at+2048);
for(;at<=limit;at+=1){
if(bytes[at]!==0xff||(bytes[at+1]&0xe0)!==0xe0)continue;
const version=(bytes[at+1]>>3)&0x03;
const layer=(bytes[at+1]>>1)&0x03;
if(layer===0){
const profile=(bytes[at+2]>>6)&0x03;
const index=(bytes[at+2]>>2)&0x0f;
if(profile!==3&&index<AAC_RATES.length)return AAC_RATES[index];
continue;
}
const rates=MPEG_RATES[version];
const bitrate=(bytes[at+2]>>4)&0x0f;
const index=(bytes[at+2]>>2)&0x03;
if(rates&&index<3&&bitrate>0&&bitrate<15)return rates[index];
}
return null;
}
function tag(bytes,at){
if(at+4>bytes.length)return'';
return String.fromCharCode(bytes[at],bytes[at+1],bytes[at+2],bytes[at+3]);
}
