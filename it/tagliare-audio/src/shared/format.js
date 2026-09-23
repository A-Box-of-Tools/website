/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const KB=1024;
const MB=KB*1024;
const GB=MB*1024;
const pad=(n)=>String(n).padStart(2,'0');
export function sizeText(n,t,{under,kb=0,mb=1,gb}={}){
const size=Number.isFinite(n)&&n>0?n:0;
if(under&&size<KB)return t(under,{n:Math.round(size)});
if(size<MB){
const decimals=kb==='auto'?(size<10*KB?1:0):kb;
return t('size.kb',{n:(size/KB).toFixed(decimals)});
}
if(gb&&size>=GB)return t(gb,{n:(size/GB).toFixed(2)});
return t('size.mb',{n:(size/MB).toFixed(mb)});
}
export function durationText(seconds,t,{hours,decimals='auto'}={}){
const whole=Math.max(0,Math.round(seconds));
if(hours&&whole>=3600){
return t(hours,{
hours:Math.floor(whole/3600),
minutes:pad(Math.floor((whole%3600)/60)),
});
}
const minutes=Math.floor(whole/60);
if(minutes)return t('time.minutes',{minutes,seconds:pad(whole%60)});
const n=decimals==='auto'
?(seconds<10?seconds.toFixed(1):whole)
:seconds.toFixed(decimals);
return t('time.seconds',{n});
}
export function clockText(seconds){
const total=Math.round(Math.max(0,seconds||0)*1000);
const whole=Math.floor(total/1000);
const hours=Math.floor(whole/3600);
const minutes=Math.floor((whole%3600)/60);
const tail=`${pad(whole % 60)}.${String(total % 1000).padStart(3, '0')}`;
return hours?`${hours}:${pad(minutes)}:${tail}`:`${minutes}:${tail}`;
}
