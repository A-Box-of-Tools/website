/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{DAY_KEYS,empty,normalise}from'./profile.js?v=3f9e9a36a1';
export const FORMAT='abox.tools/business-profile-preview';
export const VERSION=1;
export function toJson(profile){
return`${JSON.stringify({ format: FORMAT, version: VERSION, profile }, null, 2)}\n`;
}
export function fromJson(text){
let parsed;
try{
parsed=JSON.parse(text);
}catch{
throw new Error('load.notjson');
}
if(!parsed||typeof parsed!=='object')throw new Error('load.notjson');
if(parsed.format===FORMAT&&parsed.profile){
return{profile:normalise(parsed.profile),shape:'own'};
}
const location=Array.isArray(parsed.locations)?parsed.locations[0]:parsed;
if(location&&typeof location==='object'
&&(location.title||location.storefrontAddress||location.categories)){
return{profile:normalise(fromLocation(location)),shape:'google'};
}
if(typeof parsed.name==='string'||typeof parsed.category==='string'){
return{profile:normalise(parsed),shape:'own'};
}
throw new Error('load.unknown');
}
function fromLocation(location){
const profile=empty();
const address=location.storefrontAddress??{};
profile.name=string(location.title);
profile.category=string(location.categories?.primaryCategory?.displayName);
profile.address=[
...(Array.isArray(address.addressLines)?address.addressLines:[]),
address.locality,
[address.administrativeArea,address.postalCode].filter(Boolean).join(' '),
].map(string).filter(Boolean).join(', ');
profile.serviceArea=Boolean(location.serviceArea)&&!profile.address;
profile.phone=string(location.phoneNumbers?.primaryPhone);
profile.website=string(location.websiteUri);
profile.description=string(location.profile?.description);
const status=string(location.openInfo?.status).toUpperCase();
if(status==='CLOSED_PERMANENTLY')profile.status='permanent';
else if(status==='CLOSED_TEMPORARILY')profile.status='temporary';
const week=fromPeriods(location.regularHours?.periods);
if(week)profile.hours=week;
return profile;
}
function fromPeriods(periods){
if(!Array.isArray(periods)||!periods.length)return null;
const week=DAY_KEYS.map(()=>({closed:true,open:'09:00',close:'17:00'}));
for(const period of periods){
const day=DAY_KEYS.indexOf(String(period?.openDay??'').toLowerCase().slice(0,3));
if(day<0)continue;
week[day]={
closed:false,
open:hhmm(period.openTime)??'00:00',
close:hhmm(period.closeTime)??'00:00',
};
}
return week;
}
function hhmm(time){
if(!time||typeof time!=='object')return null;
const hour=Number(time.hours??0);
const minute=Number(time.minutes??0);
if(!Number.isInteger(hour)||!Number.isInteger(minute))return null;
if(hour<0||hour>24||minute<0||minute>59)return null;
return`${String(hour % 24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}
const string=(value)=>(typeof value==='string'?value.trim():'');
