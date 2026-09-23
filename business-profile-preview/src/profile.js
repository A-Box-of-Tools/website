/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const DAY_KEYS=['sun','mon','tue','wed','thu','fri','sat'];
export const FORM_DAYS=[1,2,3,4,5,6,0];
export const STATUS=['auto','open24','temporary','permanent'];
export function empty(){
return{
name:'',
category:'',
price:'',
rating:'',
reviews:'',
address:'',
serviceArea:false,
phone:'',
website:'',
description:'',
attributes:'',
status:'auto',
clock:'12',
hours:DAY_KEYS.map(()=>({closed:false,open:'09:00',close:'17:00'})),
photo:null,
};
}
export function normalise(input){
const base=empty();
const given=(input&&typeof input==='object')?input:{};
const text=(key)=>(typeof given[key]==='string'?given[key].trim():base[key]);
const hours=Array.isArray(given.hours)?given.hours:[];
return{
...base,
name:text('name'),
category:text('category'),
price:/^\$?\${0,3}$/.test(String(given.price??''))?String(given.price):'',
rating:ratingText(given.rating),
reviews:reviewsText(given.reviews),
address:text('address'),
serviceArea:given.serviceArea===true,
phone:text('phone'),
website:text('website'),
description:text('description'),
attributes:text('attributes'),
status:STATUS.includes(given.status)?given.status:'auto',
clock:given.clock==='24'?'24':'12',
hours:base.hours.map((fallback,day)=>day7(hours[day],fallback)),
photo:ownImage(given.photo),
};
}
function ratingText(value){
const number=Number.parseFloat(String(value??'').replace(',','.'));
if(!Number.isFinite(number))return'';
return String(Math.min(5,Math.max(0,Math.round(number*10)/10)));
}
function reviewsText(value){
const number=Number.parseInt(String(value??'').replace(/[^\d]/g,''),10);
return Number.isFinite(number)?String(Math.max(0,number)):'';
}
function day7(given,fallback){
if(!given||typeof given!=='object')return{...fallback};
return{
closed:given.closed===true,
open:clock(given.open)??fallback.open,
close:clock(given.close)??fallback.close,
};
}
export function clock(value){
const match=/^\s*(\d{1,2}):(\d{2})\s*$/.exec(String(value??''));
if(!match)return null;
const hour=Number(match[1]);
const minute=Number(match[2]);
if(hour>23||minute>59)return null;
return`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
const OWN_IMAGE=/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/]+={0,2}$/;
function ownImage(value){
return(typeof value==='string'&&OWN_IMAGE.test(value))?value:null;
}
export function minutes(value){
const at=clock(value);
if(!at)return null;
return Number(at.slice(0,2))*60+Number(at.slice(3));
}
function windows(hours,day){
const found=[];
for(const offset of[0,-1]){
const index=(day+offset+7)%7;
const entry=hours[index];
if(!entry||entry.closed)continue;
const from=minutes(entry.open);
const to=minutes(entry.close);
if(from===null||to===null)continue;
const span=to>from?to-from:(to===from?1440:1440-from+to);
found.push({from:from+offset*1440,to:from+offset*1440+span,day:index});
}
return found;
}
export function statusLine(profile,now){
if(profile.status==='permanent')return{key:'status.permanent'};
if(profile.status==='temporary')return{key:'status.temporary'};
if(profile.status==='open24')return{key:'status.open24'};
const day=now.getDay();
const at=now.getHours()*60+now.getMinutes();
const open=windows(profile.hours,day).find((w)=>at>=w.from&&at<w.to);
if(open){
if(open.to-open.from>=1440)return{key:'status.open24'};
return{key:'status.open',at:fromMinutes(open.to)};
}
const next=nextOpening(profile.hours,day,at);
if(!next)return{key:'status.closed'};
return next.days===0
?{key:'status.closedtoday',at:fromMinutes(next.from)}
:{key:'status.closeduntil',at:fromMinutes(next.from),day:next.day};
}
function nextOpening(hours,day,at){
for(let ahead=0;ahead<8;ahead+=1){
const which=(day+ahead)%7;
const starts=windows(hours,which)
.filter((w)=>w.from>=0&&(ahead>0||w.from>at))
.sort((a,b)=>a.from-b.from);
if(starts.length)return{days:ahead,day:which,from:starts[0].from};
}
return null;
}
function fromMinutes(total){
const within=((total%1440)+1440)%1440;
const hour=Math.floor(within/60);
return`${String(hour).padStart(2, '0')}:${String(within % 60).padStart(2, '0')}`;
}
export function showTime(value,clockKind,am,pm){
const at=clock(value);
if(!at)return'';
const hour=Number(at.slice(0,2));
const minute=at.slice(3);
if(clockKind==='24')return at;
const suffix=hour<12?am:pm;
const shown=hour%12===0?12:hour%12;
return minute==='00'?`${shown} ${suffix}`:`${shown}:${minute} ${suffix}`;
}
export function showHost(website){
return String(website||'')
.trim()
.replace(/^[a-z][a-z0-9+.-]*:\/\//i,'')
.replace(/^www\./i,'')
.replace(/\/+$/,'');
}
export function attributeList(profile){
return String(profile.attributes||'')
.split(/[,\n]/)
.map((one)=>one.trim())
.filter(Boolean)
.slice(0,6);
}
export function showCount(reviews){
if(reviews==='')return'';
return Number(reviews).toLocaleString();
}
