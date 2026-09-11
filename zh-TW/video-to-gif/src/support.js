/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function hasWebCodecs(){
return typeof window.VideoDecoder==='function'&&typeof window.VideoFrame==='function';
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
