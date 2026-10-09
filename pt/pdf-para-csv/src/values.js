/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const CURRENCY=/[$£€¥₹₽¢₩₪₫₴₦₱฿]/g;
const THIN_SPACES=/[    ]/g;
const MONTHS=new Map(Object.entries({
jan:1,feb:2,mar:3,apr:4,may:5,jun:6,
jul:7,aug:8,sep:9,sept:9,oct:10,nov:11,dec:12,
}));
const NUMERIC=/^(?:[-+(]|(?:CR|DR)\s)?\s*\d[\d.,\s]*\d?\s*[-)]?\s*(?:CR|DR)?\.?$/i;
export function looksNumeric(text){
const trimmed=String(text).replace(CURRENCY,'').replace(THIN_SPACES,' ').trim();
return trimmed.length>0&&/\d/.test(trimmed)&&NUMERIC.test(trimmed);
}
export function decimalMark(samples){
let dot=0;
let comma=0;
for(const sample of samples){
const text=String(sample).replace(CURRENCY,'').replace(THIN_SPACES,'').trim();
const lastDot=text.lastIndexOf('.');
const lastComma=text.lastIndexOf(',');
if(lastDot>=0&&lastComma>=0){
if(lastDot>lastComma)dot+=4;else comma+=4;
continue;
}
const tail=/([.,])(\d+)$/.exec(text);
if(!tail)continue;
if(tail[2].length===2){
if(tail[1]==='.')dot+=3;else comma+=3;
}else if(tail[2].length===3){
if(tail[1]==='.')comma+=1;else dot+=1;
}
}
return comma>dot?',':'.';
}
export function parseAmount(text,mark='.'){
let value=String(text).replace(CURRENCY,'').replace(THIN_SPACES,' ').trim();
if(!value)return null;
let sign=1;
if(value.startsWith('(')&&value.endsWith(')')){
sign=-sign;
value=value.slice(1,-1).trim();
}
const marker=/(?:^(CR|DR)\b\.?|\b(CR|DR)\.?$)/i.exec(value);
if(marker){
if((marker[1]??marker[2]).toUpperCase()==='DR')sign=-sign;
value=value.replace(marker[0],'').trim();
}
if(value.startsWith('-')){
sign=-sign;
value=value.slice(1).trim();
}else if(value.endsWith('-')){
sign=-sign;
value=value.slice(0,-1).trim();
}else if(value.startsWith('+')){
value=value.slice(1).trim();
}
const grouping=mark==='.'?',':'.';
value=value.split(grouping).join('').split(' ').join('');
if(mark===',')value=value.replace(',','.');
if(!/^\d+(?:\.\d+)?$/.test(value))return null;
const number=Number(value);
return Number.isFinite(number)?sign*number:null;
}
const PARTIAL_DATE=/^(?:(\d{1,2})[\s-]([A-Za-z]{3,9})\.?|([A-Za-z]{3,9})\.?\s(\d{1,2}))$/;
const PERCENT=/^[-+(]?\d[\d.,\s]*%\)?$/;
export function looksLikeDate(text){
const value=String(text).trim();
if(parseDate(value)!==null)return true;
if(/^\d{1,2}[/.-]\d{1,2}$/.test(value))return true;
const partial=PARTIAL_DATE.exec(value);
if(!partial)return false;
const name=(partial[2]??partial[3]).toLowerCase();
return MONTHS.has(name.slice(0,4))||MONTHS.has(name.slice(0,3));
}
export function isValue(text){
const value=String(text).trim();
return value!==''&&(looksNumeric(value)||PERCENT.test(value)||looksLikeDate(value));
}
export function isData(text){
const value=String(text).trim();
if(/^(?:19|20)\d\d$/.test(value))return false;
if(isValue(value))return true;
return(value.match(/\d{3,}/g)??[]).some((digits)=>!/^(?:19|20)\d\d$/.test(digits));
}
export function formatAmount(value){
return value.toFixed(2);
}
function dateParts(text){
const value=String(text).trim().replace(/,/g,' ').replace(/\s+/g,' ');
const iso=/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(value);
if(iso)return{year:+iso[1],a:+iso[2],b:+iso[3],known:'ymd'};
const named=/^(\d{1,2})[-\s]([A-Za-z]{3,9})\.?[-\s](\d{2,4})$/.exec(value);
if(named){
const month=MONTHS.get(named[2].toLowerCase().slice(0,4))
??MONTHS.get(named[2].toLowerCase().slice(0,3));
if(month)return{year:+named[3],a:month,b:+named[1],known:'named'};
}
const leading=/^([A-Za-z]{3,9})\.?[-\s](\d{1,2})[-\s](\d{2,4})$/.exec(value);
if(leading){
const month=MONTHS.get(leading[1].toLowerCase().slice(0,4))
??MONTHS.get(leading[1].toLowerCase().slice(0,3));
if(month)return{year:+leading[3],a:month,b:+leading[2],known:'named'};
}
const numeric=/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/.exec(value);
if(numeric)return{year:+numeric[3],a:+numeric[1],b:+numeric[2],known:null};
return null;
}
function fullYear(year){
if(year>=100)return year;
return year<=68?2000+year:1900+year;
}
function valid(year,month,day){
if(month<1||month>12||day<1||day>31)return false;
const at=new Date(Date.UTC(year,month-1,day));
return at.getUTCMonth()===month-1&&at.getUTCDate()===day;
}
export function hasAmbiguousDates(samples){
return samples.some((sample)=>{
const parts=dateParts(sample);
return parts!==null&&parts.known===null;
});
}
export function dateOrder(samples){
let dayFirst=0;
let monthFirst=0;
for(const sample of samples){
const parts=dateParts(sample);
if(!parts||parts.known)continue;
if(parts.a>12)dayFirst+=1;
else if(parts.b>12)monthFirst+=1;
}
if(dayFirst&&!monthFirst)return'dmy';
if(monthFirst&&!dayFirst)return'mdy';
return null;
}
export function parseDate(text,order='dmy'){
const parts=dateParts(text);
if(!parts)return null;
let year=fullYear(parts.year);
let month;
let day;
if(parts.known==='ymd'||parts.known==='named'){
month=parts.a;
day=parts.b;
}else if(order==='mdy'){
month=parts.a;
day=parts.b;
}else{
month=parts.b;
day=parts.a;
}
if(!valid(year,month,day))return null;
const pad=(n)=>String(n).padStart(2,'0');
return`${year}-${pad(month)}-${pad(day)}`;
}
