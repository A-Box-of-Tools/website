/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function openInPlayer(video,url){
return new Promise((resolve)=>{
const done=(result)=>{
clearTimeout(timer);
video.removeEventListener('loadedmetadata',ok);
video.removeEventListener('error',bad);
resolve(result);
};
const ok=()=>done({
ok:video.videoWidth>0&&video.videoHeight>0,
width:video.videoWidth,
height:video.videoHeight,
duration:Number.isFinite(video.duration)?video.duration:0,
});
const bad=()=>done({ok:false,width:0,height:0,duration:0});
const timer=setTimeout(bad,15000);
video.addEventListener('loadedmetadata',ok,{once:true});
video.addEventListener('error',bad,{once:true});
video.src=url;
video.load();
});
}
export function measureImage(url){
return new Promise((resolve)=>{
const img=new Image();
img.onload=()=>resolve({width:img.naturalWidth,height:img.naturalHeight});
img.onerror=()=>resolve(null);
img.src=url;
});
}
