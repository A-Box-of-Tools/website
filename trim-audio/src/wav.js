/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const PCM=1;
const IEEE_FLOAT=3;
export function writeWav(channels,sampleRate,{bits=16}={}){
if(!channels.length)throw new Error('a WAV needs at least one channel');
const frames=channels[0].length;
for(const channel of channels){
if(channel.length!==frames)throw new Error('channels differ in length');
}
const float=bits===32;
const bytesPerSample=float?4:2;
const dataBytes=frames*channels.length*bytesPerSample;
if(dataBytes>0xfffffff0){
throw new Error(
'That would make a WAV larger than 4 GB, which the format cannot describe. '
+'Try 16-bit rather than 32-bit float, or a shorter section.');
}
const header=writeHeader({
float,bits,sampleRate,channels:channels.length,frames,dataBytes,
});
const samples=interleave(channels,float);
return new Blob([header,samples],{type:'audio/wav'});
}
function writeHeader({float,bits,sampleRate,channels,frames,dataBytes}){
const fmtBytes=float?18:16;
const factBytes=float?12:0;
const headerBytes=12+8+fmtBytes+factBytes+8;
const bytes=new Uint8Array(headerBytes);
const view=new DataView(bytes.buffer);
let at=0;
const tag=(text)=>{
for(let i=0;i<4;i+=1)bytes[at+i]=text.charCodeAt(i);
at+=4;
};
const u32=(value)=>{view.setUint32(at,value,true);at+=4;};
const u16=(value)=>{view.setUint16(at,value,true);at+=2;};
tag('RIFF');
u32(headerBytes-8+dataBytes);
tag('WAVE');
tag('fmt ');
u32(fmtBytes);
u16(float?IEEE_FLOAT:PCM);
u16(channels);
u32(sampleRate);
u32(sampleRate*channels*(bits/8));
u16(channels*(bits/8));
u16(bits);
if(float)u16(0);
if(float){
tag('fact');
u32(4);
u32(frames);
}
tag('data');
u32(dataBytes);
return bytes;
}
function interleave(channels,float){
const count=channels.length;
const frames=channels[0].length;
const out=float
?new Float32Array(frames*count)
:new Int16Array(frames*count);
if(count===1){
const[only]=channels;
for(let i=0;i<frames;i+=1)out[i]=float?only[i]:toPcm16(only[i]);
return new Uint8Array(out.buffer);
}
for(let channel=0;channel<count;channel+=1){
const samples=channels[channel];
let at=channel;
for(let i=0;i<frames;i+=1,at+=count){
out[at]=float?samples[i]:toPcm16(samples[i]);
}
}
return new Uint8Array(out.buffer);
}
function toPcm16(value){
if(value>=1)return 32767;
if(value<=-1)return-32768;
return Math.round(value<0?value*32768:value*32767);
}
export function wavSize(frames,channels,bits){
return 44+frames*channels*(bits/8);
}
