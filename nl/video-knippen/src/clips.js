/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
function sameBytes(a,b){
if(!a||!b||a.byteLength!==b.byteLength)return false;
for(let i=0;i<a.byteLength;i++){
if(a[i]!==b[i])return false;
}
return true;
}
function nameOf(clip,index,t){
return clip.name||t('clip.nth',{n:index+1});
}
export function videoJoinable(clips,t){
if(!clips.length)return{ok:false,reason:t('join.nothing')};
const unread=clips.findIndex((clip)=>!clip.media);
if(unread>=0){
return{
ok:false,
reason:t('join.unread',{name:nameOf(clips[unread],unread,t)}),
};
}
const first=clips[0].media.video;
for(let i=1;i<clips.length;i++){
const video=clips[i].media.video;
const name=nameOf(clips[i],i,t);
if(video.displayWidth!==first.displayWidth||video.displayHeight!==first.displayHeight){
return{
ok:false,
reason:t('join.size',{
name,
size:`${video.displayWidth}x${video.displayHeight}`,
first:`${first.displayWidth}x${first.displayHeight}`,
}),
};
}
if(video.rotation!==first.rotation){
return{
ok:false,
reason:t(first.rotation?'join.rotated':'join.rotated.none',
{name,degrees:video.rotation,first:first.rotation}),
};
}
if(video.codec!==first.codec){
return{
ok:false,
reason:t('join.codec',{name,codec:video.codec,first:first.codec}),
};
}
if(!sameBytes(video.sampleEntry,first.sampleEntry)){
return{ok:false,reason:t('join.settings',{name})};
}
}
return{ok:true,reason:null};
}
export function audioJoinable(clips,t){
if(!clips.length)return{ok:true,reason:null,present:false};
if(clips.some((clip)=>!clip.media)){
return{ok:false,reason:t('join.unreadable'),present:false};
}
const withSound=clips.filter((clip)=>clip.media.audio&&clip.media.audio.samples.length);
if(!withSound.length)return{ok:true,reason:null,present:false};
if(withSound.length!==clips.length){
const silent=clips.findIndex(
(clip)=>!(clip.media.audio&&clip.media.audio.samples.length));
return{
ok:false,
reason:t('join.silent',{name:nameOf(clips[silent],silent,t)}),
present:true,
};
}
const first=clips[0].media.audio;
for(let i=1;i<clips.length;i++){
const audio=clips[i].media.audio;
const name=nameOf(clips[i],i,t);
if(Math.round(audio.sampleRate)!==Math.round(first.sampleRate)
||audio.channels!==first.channels){
return{
ok:false,
reason:t('join.sound',{
name,
channels:audio.channels,
rate:Math.round(audio.sampleRate),
firstchannels:first.channels,
firstrate:Math.round(first.sampleRate),
}),
present:true,
};
}
if(!sameBytes(audio.sampleEntry,first.sampleEntry)){
return{ok:false,reason:t('join.soundentry',{name}),present:true};
}
}
return{ok:true,reason:null,present:true};
}
export function joinability(clips,{keepAudio=true,t}={}){
const video=videoJoinable(clips,t);
const audio=audioJoinable(clips,t);
let sound='none';
if(keepAudio&&audio.present)sound=audio.ok?'copy':'encode';
if(!video.ok)return{copy:false,reason:video.reason,sound};
if(keepAudio&&!audio.ok)return{copy:false,reason:audio.reason,sound};
return{copy:true,reason:null,sound};
}
export function outputFrame(clips,choice='first'){
const sizes=clips
.filter((clip)=>clip.source&&clip.source.width&&clip.source.height)
.map((clip)=>({width:clip.source.width,height:clip.source.height}));
if(!sizes.length)return{width:640,height:480};
const even=({width,height})=>({
width:Math.max(2,Math.floor(width/2)*2),
height:Math.max(2,Math.floor(height/2)*2),
});
if(choice==='1080p')return{width:1920,height:1080};
if(choice==='720p')return{width:1280,height:720};
if(choice==='largest'){
return even(sizes.reduce(
(best,size)=>(size.width*size.height>best.width*best.height?size:best)));
}
return even(sizes[0]);
}
