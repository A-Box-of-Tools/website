/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const DEFAULT_VIDEO_BUDGET=6_000_000;
export const MAX_VIEWERS=8;
const MIN_VIDEO_BUDGET=1_000_000;
const MAX_VIDEO_BUDGET=10_000_000;
const MAX_VIEWER_BITRATE=1_500_000;
const ADMISSION_BITRATE=250_000;
export function normalizeVideoBudget(value){
const bits=Number(value);
return Number.isFinite(bits)&&bits>0
?Math.floor(Math.min(MAX_VIDEO_BUDGET,Math.max(MIN_VIDEO_BUDGET,bits)))
:DEFAULT_VIDEO_BUDGET;
}
export function viewerLimit(budget=DEFAULT_VIDEO_BUDGET){
return Math.min(MAX_VIEWERS,Math.floor(normalizeVideoBudget(budget)/ADMISSION_BITRATE));
}
export function videoBitrate(viewers,budget=DEFAULT_VIDEO_BUDGET){
if(!Number.isSafeInteger(viewers)||viewers<1)return 0;
return Math.min(MAX_VIEWER_BITRATE,Math.floor(normalizeVideoBudget(budget)/viewers));
}
export class VideoBandwidth{
constructor({current=()=>true,onStatus=()=>{}}={}){
this.current=current;
this.onStatus=onStatus;
this.sequence=0;
this.desired=null;
this.running=null;
}
update(entries,budget=DEFAULT_VIDEO_BUDGET){
const reserved=[...new Set(entries)].filter((entry)=>this.current(entry));
this.desired={
entries:reserved.map((entry)=>({entry,sender:entry.sender})),
budget:normalizeVideoBudget(budget),
sequence:++this.sequence,
};
this.running??=Promise.resolve().then(()=>this.drain());
return this.running;
}
valid(snapshot,entry,sender){
return snapshot.sequence===this.sequence&&this.current(entry)&&entry.sender===sender;
}
async apply(snapshot,entry,sender,bitrate){
if(!this.valid(snapshot,entry,sender))return null;
if(typeof sender.getParameters!=='function'||typeof sender.setParameters!=='function')return false;
try{
const parameters=sender.getParameters();
const encodings=parameters?.encodings;
if(!Array.isArray(encodings)||!encodings.length)return false;
const share=Math.floor(bitrate/encodings.length);
if(encodings.every((encoding)=>encoding.maxBitrate===share))return true;
encodings.forEach((encoding)=>{encoding.maxBitrate=share;});
await sender.setParameters(parameters);
if(!this.valid(snapshot,entry,sender))return null;
const applied=sender.getParameters()?.encodings;
if(!Array.isArray(applied)||applied.length!==encodings.length
||applied.some((encoding)=>encoding.maxBitrate!==share))return false;
return true;
}catch{
return this.valid(snapshot,entry,sender)?false:null;
}
}
async drain(){
let status=null;
try{
while(this.desired){
const snapshot=this.desired;
this.desired=null;
const bitrate=videoBitrate(snapshot.entries.length,snapshot.budget);
let supported=true;
for(const{entry,sender}of snapshot.entries){
if(snapshot.sequence!==this.sequence)break;
if(!sender)continue;
if(sender.track?.kind!=='video'||!this.current(entry))continue;
const result=await this.apply(snapshot,entry,sender,bitrate);
if(result===false)supported=false;
}
if(snapshot.sequence!==this.sequence)continue;
status={supported,viewers:snapshot.entries.length,budget:snapshot.budget,bitrate};
this.onStatus(status);
}
return status;
}finally{
this.running=null;
}
}
clear(){
this.sequence+=1;
this.desired=null;
}
}
