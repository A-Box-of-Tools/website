/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function frameText({width,height}){
const long=Math.max(width,height);
const named={3840:'4K',2560:'1440p',1920:'1080p',1280:'720p',854:'480p',640:'360p'}[long];
return named
?{key:'frame.named',values:{name:named,width,height}}
:{key:'frame.plain',values:{width,height}};
}
export function rotationText(rotation){
return{key:`rotation.${rotation}`};
}
export function turnText(turn){
return{key:`turn.${turn}`};
}
export function codecText(codec,fallback=''){
const id=String(codec??'');
if(/^mp4a\.40\./.test(id))return{key:'codec.aac'};
if(id==='opus')return{key:'codec.opus'};
if(id==='vorbis')return{key:'codec.vorbis'};
if(id==='mp3')return{key:'codec.mp3'};
if(id==='flac')return{key:'codec.flac'};
if(id==='ac-3')return{key:'codec.ac3'};
if(id==='ec-3')return{key:'codec.eac3'};
return{key:'codec.other',values:{name:id||fallback||'?'}};
}
export function bitrateText(bitsPerSecond){
if(bitsPerSecond>=1_000_000){
return{key:'rate.mbit',values:{n:(bitsPerSecond/1_000_000).toFixed(1)}};
}
return{key:'rate.kbit',values:{n:Math.round(bitsPerSecond/1000)}};
}
export function outName(name){
const stem=name.replace(/\.[^.]+$/,'')||'video';
return`${stem}-rotated.mp4`;
}
