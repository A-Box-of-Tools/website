/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SERIES_LIMIT=500;
export function distinctFrameTimes(order){
return order.every((frame,index)=>Number.isFinite(frame.time)
&&(!index||frame.time>order[index-1].time));
}
export function seriesPlan({order,duration=0,every}){
if(!Number.isFinite(every)||every<0.1)return null;
const indexes=[];
if(order?.length){
if(!distinctFrameTimes(order))return null;
const start=Math.max(0,order[0].time);
const end=order.at(-1).time;
let mark=0;
let count=0;
let first=null;
let last=null;
let index=0;
let previous=-1;
while(start+mark*every<=end+1e-9){
const at=start+mark*every;
while(index+1<order.length&&order[index+1].time<=at)index++;
if(index!==previous){
count++;
first??=order[index].time;
last=order[index].time;
if(indexes.length<SERIES_LIMIT)indexes.push(index);
previous=index;
}
if(index+1===order.length)break;
mark=Math.max(mark+1,Math.ceil((order[index+1].time-start)/every));
}
return{count,first,last,indexes,overflow:count>SERIES_LIMIT};
}
if(!(duration>0)||!Number.isFinite(duration))return null;
const count=Math.floor(duration/every+1e-9)+1;
return{count,first:0,last:(count-1)*every,overflow:count>SERIES_LIMIT};
}
export function coveringInterval(end){
return Math.max(0.1,Math.ceil(end/(SERIES_LIMIT-1)*1000)/1000);
}
