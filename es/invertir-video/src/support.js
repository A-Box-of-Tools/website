/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{askSupported}from'./shared/codec-support.js';
const H264_CANDIDATES=[
'avc1.640034',
'avc1.640033',
'avc1.640032',
'avc1.64002a',
'avc1.640028',
'avc1.4d0034',
'avc1.4d0028',
'avc1.42003e',
'avc1.42001f',
];
export function hasWebCodecs(){
return typeof window.VideoDecoder==='function'
&&typeof window.VideoEncoder==='function'
&&typeof window.VideoFrame==='function';
}
export function hasEncoder(){
return typeof window.VideoEncoder==='function'
&&typeof window.VideoFrame==='function';
}
export async function canDecode(config){
if(!hasWebCodecs())return false;
return await askSupported(VideoDecoder,config)===true;
}
export async function pickH264Codec({width,height,framerate,bitrate}){
if(!hasEncoder())return null;
for(const codec of H264_CANDIDATES){
const supported=await askSupported(VideoEncoder,{
codec,width,height,framerate,bitrate,
avc:{format:'avc'},
});
if(supported)return codec;
if(supported===null)return null;
}
return null;
}
