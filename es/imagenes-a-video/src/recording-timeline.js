/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function recordingTimeline(items){
const boundaries=[];
let totalSeconds=0;
for(const item of items){
totalSeconds+=item.duration;
boundaries.push(totalSeconds);
}
return{boundaries,totalSeconds};
}
export function recordingIndex(boundaries,elapsed){
let first=0;
let last=boundaries.length;
while(first<last){
const middle=Math.floor((first+last)/2);
if(elapsed<boundaries[middle])last=middle;
else first=middle+1;
}
return Math.min(first,boundaries.length-1);
}
