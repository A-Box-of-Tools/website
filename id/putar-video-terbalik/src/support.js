/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
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
try{
const{supported}=await VideoDecoder.isConfigSupported(config);
return Boolean(supported);
}catch{
return false;
}
}
export async function pickH264Codec({width,height,framerate,bitrate}){
if(!hasEncoder())return null;
for(const codec of H264_CANDIDATES){
try{
const{supported}=await VideoEncoder.isConfigSupported({
codec,width,height,framerate,bitrate,
avc:{format:'avc'},
});
if(supported)return codec;
}catch{
}
}
return null;
}
