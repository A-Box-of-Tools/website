/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{empty}from'./profile.js?v=3f9e9a36a1';
const SPLIT=/\s*[\u00b7\u22c5\u2022\u2219|]\s*|\s{3,}/;
const PRICE=/^\$\${0,3}$/;
const RATING=/^(\d(?:[.,]\d)?)\s*(?:\(\s*([\d.,\s]+)\s*\))?$/;
const REVIEWS=/^\(?\s*([\d.,\s]{1,15})\s*\)?$/;
const PHONE=/^[+(]?\d[\d\s().\u2011-]{6,20}$/;
const WEBSITE=/^(?:https?:\/\/)?(?:www\.)?[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9-]+)+(?:\/\S*)?$/i;
const LABEL=/^(?:address|adresse|direcci\u00f3n|indirizzo|endere\u00e7o|adres|hours|\u00f6ffnungszeiten|horario|phone|telefon|t\u00e9l\u00e9phone|tel\u00e9fono|telefono|website|web)\s*[:\uff1a]\s*/i;
export function parseListing(pasted,dayNames=[],ignore=[]){
const lines=String(pasted||'')
.replace(/[\u00a0\u202f\u2009]/g,' ')
.split(/\r?\n/)
.flatMap((line)=>line.split(SPLIT))
.map((line)=>line.trim())
.filter(Boolean);
const furniture=new Set(ignore.map((word)=>word.toLowerCase()));
const profile=empty();
const found=[];
const taken=new Set();
const note=(field)=>{if(!found.includes(field))found.push(field);};
const claim=(index,field)=>{taken.add(index);note(field);};
const week=readHours(lines,dayNames,taken);
if(week){
profile.hours=week;
note('hours');
}
lines.forEach((line,index)=>{
if(taken.has(index))return;
const bare=line.replace(LABEL,'').trim();
if(!bare||furniture.has(bare.toLowerCase())){taken.add(index);return;}
if(profile.rating===''){
const rating=RATING.exec(bare);
if(rating){
profile.rating=rating[1].replace(',','.');
claim(index,'rating');
if(rating[2]&&/\d/.test(rating[2])){
profile.reviews=digits(rating[2]);
note('reviews');
return;
}
const next=lines[index+1];
const count=next&&!taken.has(index+1)?REVIEWS.exec(next):null;
if(count&&/\d/.test(count[1])){
profile.reviews=digits(count[1]);
claim(index+1,'reviews');
}
return;
}
}
if(profile.price===''&&PRICE.test(bare)){
profile.price=bare;
claim(index,'price');
return;
}
if(profile.phone===''&&PHONE.test(bare)&&countDigits(bare)>=7){
profile.phone=bare;
claim(index,'phone');
return;
}
if(profile.website===''&&!bare.includes('@')&&WEBSITE.test(bare)){
profile.website=bare;
claim(index,'website');
return;
}
if(profile.address===''&&bare.includes(',')&&/\d/.test(bare)&&bare.length>8){
profile.address=bare;
claim(index,'address');
}
});
const spare=lines
.map((line,index)=>({line,index}))
.filter((one)=>!taken.has(one.index));
if(spare.length){
profile.name=spare[0].line;
claim(spare[0].index,'name');
}
const category=spare.slice(1).find((one)=>(
one.line.length<=44&&!/\d/.test(one.line)
));
if(category){
profile.category=category.line;
claim(category.index,'category');
}
return{profile,found};
}
const digits=(value)=>String(value).replace(/\D/g,'');
const countDigits=(value)=>(String(value).match(/\d/g)||[]).length;
const ENGLISH_DAYS=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const SPAN=new RegExp(
'(\\d{1,2}(?::\\d{2})?\\s*(?:[ap]\\.?\\s?m\\.?)?)'
+'\\s*(?:[-~\u2010\u2011\u2012\u2013\u2014\u2015]|to|bis|a|\u00e0|at\u00e9|hingga)\\s*'
+'(\\d{1,2}(?::\\d{2})?\\s*(?:[ap]\\.?\\s?m\\.?)?)','i');
const SHUT=/closed|geschlossen|cerrado|ferm\u00e9|chiuso|fechado|gesloten|kapal\u0131|tutup/i;
const ALL_DAY=/24\s*(?:hours|hrs|h\b)|24\/7|24 horas|24 heures|24\u6642\u9593|24\u5c0f\u65f6/i;
function readHours(lines,dayNames,taken){
const forms=ENGLISH_DAYS.map((english,day)=>[
english,
english.slice(0,3),
(dayNames[day]||'').toLowerCase(),
(dayNames[day]||'').toLowerCase().slice(0,3),
].filter(Boolean).sort((a,b)=>b.length-a.length));
const week=new Array(7).fill(null);
const claimed=[];
lines.forEach((line,index)=>{
const lower=line.toLowerCase();
const day=forms.findIndex((names)=>names.some((name)=>lower.startsWith(name)));
if(day<0||week[day])return;
const name=forms[day].find((one)=>lower.startsWith(one));
const rest=line.slice(name.length);
if(ALL_DAY.test(rest))week[day]={closed:false,open:'00:00',close:'00:00'};
else if(SHUT.test(rest))week[day]={closed:true,open:'09:00',close:'17:00'};
else{
const span=SPAN.exec(rest);
const open=span&&time24(span[1]);
const close=span&&time24(span[2]);
if(!open||!close)return;
week[day]={closed:false,open,close};
}
claimed.push(index);
});
if(week.some((day)=>day===null))return null;
claimed.forEach((index)=>taken.add(index));
return week;
}
export function time24(value){
const match=/^\s*(\d{1,2})(?::(\d{2}))?\s*(?:([ap])\.?\s?m\.?)?\s*$/i.exec(String(value||''));
if(!match)return null;
let hour=Number(match[1]);
const minute=match[2]??'00';
const half=match[3]?.toLowerCase();
if(half==='a')hour=hour===12?0:hour;
else if(half==='p')hour=hour===12?12:hour+12;
if(hour>24||Number(minute)>59)return null;
return`${String(hour % 24).padStart(2, '0')}:${minute}`;
}
