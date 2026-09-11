/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function displayTimes(video){
const samples=video.samples;
const count=samples.length;
const order=Array.from({length:count},(unused,i)=>i);
order.sort((a,b)=>samples[a].pts-samples[b].pts||a-b);
const position=new Int32Array(count);
for(let k=0;k<count;k++)position[order[k]]=k;
const base=count?samples[order[0]].pts:0;
const pts=new Float64Array(count);
const duration=new Float64Array(count);
for(let k=0;k<count;k++)pts[order[k]]=samples[order[k]].pts-base;
for(let k=0;k<count-1;k++){
duration[order[k]]=Math.max(1,pts[order[k+1]]-pts[order[k]]);
}
if(count){
const last=order[count-1];
const declared=video.duration-pts[last];
duration[last]=declared>=1?declared:usualGap(order,duration);
}
const totalTicks=count?pts[order[count-1]]+duration[order[count-1]]:0;
return{position,pts,duration,totalTicks};
}
function usualGap(order,duration){
if(order.length<2)return 1;
const gaps=[];
for(let k=0;k<order.length-1;k++)gaps.push(duration[order[k]]);
gaps.sort((a,b)=>a-b);
return Math.max(1,gaps[gaps.length>>1]);
}
export function reversedTimes(video){
const{pts,duration,totalTicks}=displayTimes(video);
const start=new Float64Array(pts.length);
for(let i=0;i<pts.length;i++)start[i]=totalTicks-pts[i]-duration[i];
return{start,duration,totalTicks};
}
export function gopRanges(samples){
const groups=[];
for(let i=0;i<samples.length;i++){
if(i===0||samples[i].isKey)groups.push({from:i,to:i});
else groups[groups.length-1].to=i;
}
return groups;
}
export function windowLimit(width,height,budgetBytes=384<<20,bytesPerPixel=1.5){
const perFrame=Math.max(1,width*height*bytesPerPixel);
return Math.max(4,Math.min(600,Math.floor(budgetBytes/perFrame)));
}
export function frameWindows(count,limit){
const windows=[];
const size=Math.max(1,limit);
for(let end=count-1;end>=0;end-=size){
windows.push({from:Math.max(0,end-size+1),to:end});
}
return windows;
}
export function closeDurations(samples){
for(let i=0;i<samples.length;i++){
const next=samples[i+1];
samples[i].duration=next
?Math.max(1,next.dts-samples[i].dts)
:Math.max(1,samples[i].tailDuration);
}
return samples;
}
export function outputSize(video){
return{
width:Math.max(2,Math.floor(video.displayWidth/2)*2),
height:Math.max(2,Math.floor(video.displayHeight/2)*2),
};
}
