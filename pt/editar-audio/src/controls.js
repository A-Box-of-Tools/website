/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function parseEditNumber(text,kind){
const suffix=kind==='speed'?'(?:x|×)?':'(?:dB)?';
const match=new RegExp(`^([+-]?(?:\\d+(?:[.,]\\d{1,2})?|[.,]\\d{1,2}))\\s*${suffix}$`,'i')
.exec(String(text).trim().replace(/−/g,'-'));
if(!match)return null;
const number=Number(match[1].replace(',','.'));
const[min,max]=kind==='speed'?[0.25,4]:[-24,24];
return Number.isFinite(number)&&number>=min&&number<=max?number:null;
}
export function previewSource(source,position){
const from=Math.max(0,Math.floor((Number.isFinite(position)?position:0)*source.sampleRate));
if(from>=source.frames)return null;
const to=Math.min(source.frames,from+Math.round(5*source.sampleRate));
return{from,to,source:{...source,frames:to-from,
duration:(to-from)/source.sampleRate,
channels:source.channels.map((samples)=>samples.subarray(from,to))}};
}
