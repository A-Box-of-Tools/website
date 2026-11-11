/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js?v=583bb01e63';
import{booksPerUnit,countReading,namedAmount,placeOnLadder}from'./scale.js?v=583bb01e63';
const locale=document.documentElement.lang||undefined;
const LIGHT_YEAR_M=9.4607e15;
const SECONDS_PER_YEAR=31557600;
const SMALLEST_SHARE=1e-8;
export const reading=countReading(phrase('count.words'),locale,phrase('count.names'));
const formats=new Map();
function format(options){
const key=JSON.stringify(options);
if(!formats.has(key))formats.set(key,new Intl.NumberFormat(locale,options));
return formats.get(key);
}
const significant=(digits=3)=>format({maximumSignificantDigits:digits});
const compact=(digits=3)=>format({notation:'compact',compactDisplay:'long',maximumSignificantDigits:digits});
const plurals=new Intl.PluralRules(locale);
const singular=(value,digits=3)=>{
const amount=Number(value.toPrecision(digits));
return amount<1e15&&plurals.select(amount)==='one';
};
const phrases=new Map();
export function cached(key){
if(!phrases.has(key))phrases.set(key,phrase(key));
return phrases.get(key);
}
function spoken(value,digits=3){
const rounded=Number(value.toPrecision(digits));
const named=namedAmount(rounded,digits,reading);
if(!named)return compact(digits).format(rounded);
return`${format({ maximumSignificantDigits: digits, useGrouping: 'min2' }).format(named.amount)}${reading.joint}${named.word}`;
}
const inWords=(value,digits=3)=>Number(value.toPrecision(digits))>=1e6;
export function pretty(value,digits=3){
return inWords(value,digits)?spoken(value,digits):significant(digits).format(value);
}
export function exact(count){return format({}).format(count);}
export function readback(count){
const digits=count.toString();
if(digits.length<4)return exact(count);
const words=spoken(Number(count));
return words.replace(/\D/g,'')===digits?exact(count):`${exact(count)} · ${words.replace(/ /g, '\u00a0')}`;
}
export function percent(share){
const percentage=format({style:'percent',maximumSignificantDigits:2});
return share>0&&share<SMALLEST_SHARE?`<${percentage.format(SMALLEST_SHARE)}`:percentage.format(share);
}
function noun(value,name,digits=3){
if(!inWords(value,digits))return name;
return cached(/^[aeiouyà-ÿ]/i.test(name)?'unit.of.vowel':'unit.of').replace('{unit}',name);
}
export function times(value){return phrase('ratio.times',{number:pretty(value)});}
function unitName(unit,display,plural=2){
const pieces=format({style:'unit',unit,unitDisplay:display}).formatToParts(plural);
return pieces.filter(piece=>piece.type==='unit').map(piece=>piece.value).join('');
}
function unitShort(value,unit,digits=3){
if(inWords(value,digits))return`${pretty(value, digits)}${reading.joint}${noun(value, unitName(unit, unit === 'year' ? 'long' : 'short'), digits)}`;
return format({style:'unit',unit,unitDisplay:'short',maximumSignificantDigits:digits}).format(value);
}
function unitLong(value,unit){
if(inWords(value))return{number:pretty(value),unit:noun(value,unitName(unit,'long'))};
const pieces=format({style:'unit',unit,unitDisplay:'long',maximumSignificantDigits:3}).formatToParts(value);
return{
number:pieces.filter(piece=>piece.type!=='unit').map(piece=>piece.value).join('').trim(),
unit:pieces.filter(piece=>piece.type==='unit').map(piece=>piece.value).join('')
};
}
export function length(metres,digits=3){
if(metres>=LIGHT_YEAR_M*0.1){
const value=metres/LIGHT_YEAR_M;
return`${pretty(value, digits)} ${noun(value, cached(singular(value, digits) ? 'unit.lightyear' : 'unit.lightyears'), digits)}`;
}
if(metres>=1000)return unitShort(metres/1000,'kilometer',digits);
if(metres>=1)return unitShort(metres,'meter',digits);
if(metres>=0.01)return unitShort(metres*100,'centimeter',digits);
return unitShort(metres*1000,'millimeter',digits);
}
function lengthWords(metres){
if(metres>=LIGHT_YEAR_M*0.1){
const value=metres/LIGHT_YEAR_M;
return{number:pretty(value),unit:noun(value,cached(singular(value)?'unit.lightyear':'unit.lightyears'))};
}
if(metres>=1000)return unitLong(metres/1000,'kilometer');
if(metres>=1)return unitLong(metres,'meter');
if(metres>=0.01)return unitLong(metres*100,'centimeter');
return unitLong(metres*1000,'millimeter');
}
export function volume(cubicMetres,digits=3){
if(cubicMetres>=1e9)return`${pretty(cubicMetres / 1e9, digits)} ${noun(cubicMetres / 1e9, 'km³', digits)}`;
if(cubicMetres>=1000)return`${pretty(cubicMetres, digits)} ${noun(cubicMetres, 'm³', digits)}`;
if(cubicMetres>=0.001)return unitShort(cubicMetres*1000,'liter',digits);
return unitShort(cubicMetres*1e6,'milliliter',digits);
}
function volumeWords(cubicMetres){
if(cubicMetres>=1e9){
const value=cubicMetres/1e9;
return{number:pretty(value),unit:noun(value,cached(singular(value)?'unit.km3.single':'unit.km3'))};
}
if(cubicMetres>=1000)return{number:pretty(cubicMetres),unit:noun(cubicMetres,cached('unit.m3'))};
if(cubicMetres>=0.001)return unitLong(cubicMetres*1000,'liter');
return unitLong(cubicMetres*1e6,'milliliter');
}
export function duration(seconds,digits=3){
if(seconds>=SECONDS_PER_YEAR)return unitShort(seconds/SECONDS_PER_YEAR,'year',digits);
if(seconds>=86400)return unitShort(seconds/86400,'day',digits);
if(seconds>=3600)return unitShort(seconds/3600,'hour',digits);
if(seconds>=60)return unitShort(seconds/60,'minute',digits);
return unitShort(seconds,'second',digits);
}
function durationWords(seconds){
if(seconds>=SECONDS_PER_YEAR)return unitLong(seconds/SECONDS_PER_YEAR,'year');
if(seconds>=86400)return unitLong(seconds/86400,'day');
if(seconds>=3600)return unitLong(seconds/3600,'hour');
if(seconds>=60)return unitLong(seconds/60,'minute');
return unitLong(seconds,'second');
}
export function durationLong(seconds){
const words=durationWords(seconds);
return`${words.number}${reading.joint}${words.unit}`;
}
export function rungName(world,id){
return cached(`${world === 'water' || world === 'sand' ? 'volume' : world === 'books' ? 'height' : world}.${id}`);
}
export function joined(sentences){
return sentences.filter(Boolean).join(' ').replace(/([。！？]) /g,'$1');
}
export function capital(line){
return line?line[0].toLocaleUpperCase(locale)+line.slice(1):line;
}
export function sizeOf(world,size){
if(world==='books')return length(size,4);
if(world==='water'||world==='sand')return volume(size,4);
if(world==='stars')return pretty(size,4);
return duration(size,4);
}
function standing(world,place){
const family=world==='water'||world==='sand'?'fill':world;
const lines=[];
if(place.below){
const name=rungName(world,place.below.id);
if(place.times<1.05)lines.push(phrase(`near.${family}`,{name}));
else lines.push(phrase(`past.${family}`,{name,times:pretty(place.times)}));
}
if(place.above)lines.push(phrase(`next.${family}`,{name:rungName(world,place.above.id),share:percent(place.share)}));
return joined(lines);
}
function finishing(seconds){
if(seconds<3600)return'';
const years=seconds/SECONDS_PER_YEAR;
if(years>100000)return'';
const end=new Date(Date.now()+seconds*1000);
if(years<2)return phrase('finish.date',{date:new Intl.DateTimeFormat(locale,{dateStyle:'long'}).format(end)});
return phrase('finish.year',{year:new Intl.DateTimeFormat(locale,{year:'numeric'}).format(end)});
}
export function describe(world,count,settings,perUnit,rungs){
const amount=Number(count)*perUnit;
const said=pretty(Number(count));
const single=count===1n;
const place=placeOnLadder(amount,rungs);
if(count===0n)return{kicker:cached('result.empty'),number:'0',unit:'',story:cached('zero.story'),tab:'—',place};
let answer;
let tab;
switch(world){
case'books':{
const words=lengthWords(amount);
const books=Number(count)*booksPerUnit(settings.unit,settings.wordsPerBook);
const key=settings.unit==='book'?(single?'kicker.books.single':'kicker.books'):`kicker.${settings.unit}s`;
answer={
kicker:phrase(key,{count:said,books:pretty(books),words:pretty(books*settings.wordsPerBook)}),
number:words.number,
unit:phrase('unit.tall',{unit:words.unit})
};
tab=length(amount);
break;
}
case'water':
case'sand':{
const words=volumeWords(amount);
answer={kicker:phrase(single?`kicker.${world}.single`:`kicker.${world}`,{count:said}),number:words.number,unit:words.unit};
tab=volume(amount);
break;
}
case'stars':{
const milkyWay=rungs.find(rung=>rung.id==='milkyway').size;
const universe=rungs.find(rung=>rung.id==='universe').size;
const kicker=phrase(single?'kicker.stars.single':'kicker.stars',{count:said});
if(amount>=universe){
const many=amount/universe;
answer={kicker,number:pretty(many),unit:noun(many,cached(singular(many)?'stars.universe.single':'stars.universes'))};
}else if(amount>=milkyWay){
const many=amount/milkyWay;
answer={kicker,number:pretty(many),unit:noun(many,cached(singular(many)?'stars.milkyway.single':'stars.milkyways'))};
}else{
answer={kicker,number:percent(place.share),unit:phrase('stars.of',{name:rungName(world,place.above.id)})};
}
tab=amount>=milkyWay?`${pretty(amount / milkyWay)} ${noun(amount / milkyWay, cached(singular(amount / milkyWay) ? 'stars.milkyway.single' : 'stars.milkyways'))}`:phrase('stars.tab',{share:percent(amount/milkyWay)});
break;
}
default:{
const words=durationWords(amount);
answer={kicker:phrase('kicker.time',{count:said}),number:words.number,unit:words.unit};
tab=duration(amount);
}
}
const finish=world==='time'?finishing(amount):'';
return{...answer,story:joined([standing(world,place),finish]),tab,place};
}
export function hud(world,log,settings,perUnit){
const value=10**log;
const said=pretty(value<1000?Math.round(value):value);
const one=Math.round(value)===1;
switch(world){
case'books':{
const key=settings.unit==='book'?(one?'hud.books.single':'hud.books'):`hud.${settings.unit}s`;
return{big:phrase(key,{count:said}),small:length(value*perUnit)};
}
case'water':return{big:phrase(one?'hud.water.single':'hud.water',{count:said}),small:volume(value*perUnit)};
case'sand':return{big:phrase(one?'hud.sand.single':'hud.sand',{count:said}),small:volume(value*perUnit)};
case'stars':return{big:phrase(one?'hud.stars.single':'hud.stars',{count:said}),small:''};
default:return{big:phrase('hud.time',{count:said}),small:''};
}
}
