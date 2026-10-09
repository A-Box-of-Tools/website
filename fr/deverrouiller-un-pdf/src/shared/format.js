/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const pad=(n)=>String(n).padStart(2,'0');
export function sizeText(n,t,{under,kb=0,mb=1,gb,base=1024}={}){
const KB=base;
const MB=KB*base;
const GB=MB*base;
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
export function clockText(seconds,{decimals=3}={}){
const scale=10**decimals;
const total=Math.round(Math.max(0,seconds||0)*scale);
const whole=Math.floor(total/scale);
const hours=Math.floor(whole/3600);
const minutes=Math.floor((whole%3600)/60);
const tail=`${pad(whole % 60)}.${String(total % scale).padStart(decimals, '0')}`;
return hours?`${hours}:${pad(minutes)}:${tail}`:`${minutes}:${tail}`;
}
