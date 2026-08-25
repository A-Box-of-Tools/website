/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const FORMATS={
'image/png':{extension:'png',label:'PNG',lossless:true},
'image/jpeg':{extension:'jpg',label:'JPEG',lossless:false},
'image/webp':{extension:'webp',label:'WebP',lossless:false},
};
function split(seconds){
const total=Math.max(0,Math.round(seconds*1000));
const whole=Math.floor(total/1000);
return{
hours:Math.floor(whole/3600),
minutes:Math.floor((whole%3600)/60),
secs:whole%60,
millis:String(total%1000).padStart(3,'0'),
};
}
export function timecode(seconds){
const{hours,minutes,secs,millis}=split(seconds);
const pad=(value)=>String(value).padStart(2,'0');
const tail=`${pad(minutes)}-${pad(secs)}.${millis}`;
return hours?`${pad(hours)}-${tail}`:tail;
}
export function clockTime(seconds){
const{hours,minutes,secs,millis}=split(seconds);
const pad=(value)=>String(value).padStart(2,'0');
return hours
?`${hours}:${pad(minutes)}:${pad(secs)}.${millis}`
:`${minutes}:${pad(secs)}.${millis}`;
}
export function stillName(sourceName,seconds,type){
const base=String(sourceName??'video')
.replace(/\.[^./\\]+$/,'')
.replace(/[\\/:*?"<>|]+/g,'_')
.trim()||'video';
const{extension}=FORMATS[type]??FORMATS['image/png'];
return`${base}-${timecode(seconds)}.${extension}`;
}
export function encodeStill(canvas,{type='image/png',quality=0.92}={}){
return new Promise((resolve,reject)=>{
const done=(blob)=>{
if(blob)resolve(blob);
else reject(new Error(`This browser would not write a ${FORMATS[type]?.label ?? type}.`));
};
if(type==='image/png')canvas.toBlob(done,type);
else canvas.toBlob(done,type,quality);
});
}
