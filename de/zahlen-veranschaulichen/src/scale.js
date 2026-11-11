/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MAX_COUNT=10n**30n;
const LATIN=/\p{Script=Latin}/u;
const HAN_DIGITS=Object.freeze({'一':'1','二':'2','两':'2','兩':'2','三':'3','四':'4','五':'5','六':'6','七':'7','八':'8','九':'9'});
const MANY_GROUPS=/^\d{1,3}(?:(?:\.\d{3}){2,}|(?:,\d{3}){2,})$/;
const SPACED=/^\d{1,3}(?: \d{3})+$/;
const SECONDS_PER_YEAR=365.25*24*60*60;
const LIGHT_YEAR_M=9.4607e15;
const WORDS_PER_TOKEN=0.75;
const ladder=items=>Object.freeze(items.map(item=>Object.freeze(item)));
export const VOLUME_REFERENCES=ladder([
{id:'spoon',size:0.000015},
{id:'cup',size:0.00025},
{id:'bucket',size:0.01},
{id:'bath',size:0.2},
{id:'room',size:30},
{id:'pool',size:2500},
{id:'tanker',size:320000},
{id:'pyramid',size:2.6e6},
{id:'mountain',size:Math.PI*1e9/3},
{id:'loch',size:7.4e9},
{id:'superior',size:1.21e13},
{id:'water',size:1.386e18}
]);
export const PLANET_REFERENCES=ladder([
{id:'moon',size:2.1968e19},
{id:'earth',size:1.08321e21},
{id:'neptune',size:6.254e22}
]);
export const VOLUME_LADDER=Object.freeze([...VOLUME_REFERENCES,...PLANET_REFERENCES]);
const HEIGHT_REFERENCES=ladder([
{id:'table',size:0.75,standing:true},
{id:'person',size:1.7,standing:true},
{id:'house',size:8,standing:true},
{id:'liberty',size:93,standing:true},
{id:'eiffel',size:330,standing:true},
{id:'burj',size:828,standing:true},
{id:'everest',size:8849,standing:true},
{id:'airliner',size:11000},
{id:'congress',books:25.77e6},
{id:'everybook',books:129864880},
{id:'iss',size:400000},
{id:'around',size:40075000},
{id:'moon',size:3.844e8},
{id:'mars',size:5.46e10},
{id:'sun',size:1.496e11},
{id:'neptune',size:4.515e12},
{id:'voyager',size:2.59e13},
{id:'lightyear',size:LIGHT_YEAR_M},
{id:'proxima',size:4.24*LIGHT_YEAR_M},
{id:'orion',size:1500*LIGHT_YEAR_M},
{id:'milkyway',size:100000*LIGHT_YEAR_M},
{id:'andromeda',size:2.5e6*LIGHT_YEAR_M},
{id:'virgo',size:54e6*LIGHT_YEAR_M},
{id:'quasar',size:2.5e9*LIGHT_YEAR_M},
{id:'edge',size:46.5e9*LIGHT_YEAR_M}
]);
export const STAR_REFERENCES=ladder([
{id:'dipper',size:7},
{id:'sky',size:9100},
{id:'omega',size:1e7},
{id:'milkyway',size:1e11},
{id:'andromeda',size:1e12},
{id:'universe',size:1e23}
]);
export const TIME_REFERENCES=ladder([
{id:'minute',size:60},
{id:'hour',size:3600},
{id:'day',size:86400},
{id:'week',size:604800},
{id:'year',size:SECONDS_PER_YEAR},
{id:'decade',size:10*SECONDS_PER_YEAR},
{id:'lifetime',size:80*SECONDS_PER_YEAR},
{id:'pyramid',size:4500*SECONDS_PER_YEAR},
{id:'sapiens',size:300000*SECONDS_PER_YEAR},
{id:'dinosaurs',size:66e6*SECONDS_PER_YEAR},
{id:'earth',size:4.54e9*SECONDS_PER_YEAR},
{id:'universe',size:13.8e9*SECONDS_PER_YEAR}
]);
function invalid(key){return{ok:false,key};}
function escaped(mark){return mark.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
export function countReading(words,locale,names=''){
const parts=new Intl.NumberFormat(locale).formatToParts(1234567.5);
const mark=type=>parts.find(part=>part.type===type).value.replace(/[\u00a0\u202f]/g,' ');
const decimal=mark('decimal');
const group=mark('group');
const worded=new Intl.NumberFormat(locale,{notation:'compact',compactDisplay:'long'}).formatToParts(2e6);
return{
decimal,
group,
joint:worded.find(part=>part.type==='literal')?.value??'',
plurals:new Intl.PluralRules(locale),
words:[...words.matchAll(/([^\s=\d]+)=(\d+)/g)].map(([,word,power])=>[word.toLowerCase(),Number(power)]),
names:[...names.matchAll(/([^\s=\d]+)=(\d+)/g)].map(([,word,power])=>{
const[one,other=one]=word.split('/');
return{one,other,power:Number(power),size:Number(`1e${power}`)};
}).sort((a,b)=>b.power-a.power),
number:new RegExp(`^(\\d[\\d${escaped(group)} ]*)?(?:${escaped(decimal)}(\\d+))?$`),
grouped:new RegExp(`^\\d{1,3}(?:${escaped(group)}\\d{3})+$`)
};
}
export const ENGLISH=countReading('a=0 an=0 k=3 thousand=3 m=6 million=6 b=9 billion=9 t=12 trillion=12 quadrillion=15 quintillion=18 sextillion=21 septillion=24 octillion=27 nonillion=30','en','quadrillion=15 quintillion=18 sextillion=21 septillion=24 octillion=27 nonillion=30');
function takeWords(value,words){
let rest=value;
const taken=[];
for(;;){
const bare=rest.replace(/(\p{Script=Latin})\.$/u,'$1');
const lower=bare.toLowerCase();
const found=words.find(([word])=>lower.endsWith(word)&&!(LATIN.test(word[0])&&LATIN.test(lower.at(-word.length-1)??'')));
if(!found)return{rest,taken};
taken.push(found);
rest=bare.slice(0,-found[0].length).trimEnd();
}
}
export function parseCount(raw,reading=ENGLISH){
if(raw===null||raw===undefined||raw==='')return invalid('amount-required');
if(typeof raw!=='string')return invalid('amount-invalid');
let value=raw.replace(/[\uff01-\uff5e]/g,wide=>String.fromCharCode(wide.charCodeAt(0)-0xfee0)).replace(/[\u00a0\u202f\u3000]/g,' ').normalize('NFC').trim();
if(!value)return invalid('amount-required');
if(value.length>256)return invalid('amount-invalid');
const{rest,taken}=takeWords(value,reading.words);
const suffixPower=taken.reduce((sum,[,power])=>sum+power,0);
value=HAN_DIGITS[rest]??rest;
if(!value){
if(!suffixPower||/^\p{Script=Latin}$/u.test(taken[0][0]))return invalid('amount-invalid');
value='1';
}else if(taken.some(([,power])=>!power)){
return invalid('amount-invalid');
}
let exponent=0;
const scientific=/^(.*?)[eE]([+-]?\d+)$/.exec(value);
if(scientific){
if(taken.length)return invalid('amount-invalid');
value=scientific[1].replace('.',reading.decimal);
exponent=Number(scientific[2]);
}
if(MANY_GROUPS.test(value))value=value.replace(/\D/g,'');
const decimal=reading.number.exec(value);
if(!decimal||(!decimal[1]&&!decimal[2]))return invalid('amount-invalid');
const integerPart=decimal[1]||'';
const fractionPart=decimal[2]||'';
if(integerPart&&!/^\d+$/.test(integerPart)
&&!reading.grouped.test(integerPart)
&&!SPACED.test(integerPart))return invalid('amount-invalid');
let digits=(integerPart.replace(/\D/g,'')+fractionPart).replace(/^0+/,'');
if(!digits)return{ok:true,count:0n};
if(!Number.isSafeInteger(exponent))return invalid(exponent<0?'amount-whole':'amount-too-large');
let power=exponent+suffixPower-fractionPart.length;
while(digits.endsWith('0')){digits=digits.slice(0,-1);power+=1;}
if(power<0)return invalid('amount-whole');
if(digits.length+power>31)return invalid('amount-too-large');
const count=BigInt(digits)*10n**BigInt(power);
if(count>MAX_COUNT)return invalid('amount-too-large');
return{ok:true,count};
}
function countNumber(count){
if(typeof count!=='bigint'||count<0n)throw new RangeError('amount-invalid');
if(count>MAX_COUNT)throw new RangeError('amount-too-large');
return Number(count);
}
function positive(value,key){
if(!Number.isFinite(value)||value<=0)throw new RangeError(key);
}
function volume(value){
if(!Number.isFinite(value)||value<0)throw new RangeError('volume-invalid');
}
function referenceById(id){
const reference=VOLUME_LADDER.find(item=>item.id===id);
if(!reference)throw new RangeError('reference-invalid');
return reference;
}
export function sandModel(count,diameterMm=0.5,packing=0.6){
const grains=countNumber(count);
positive(diameterMm,'sand-invalid-model');
positive(packing,'sand-invalid-model');
if(packing>1)throw new RangeError('sand-invalid-model');
const diameterM=diameterMm/1000;
const grainVolumeM3=Math.PI/6*diameterM**3/packing;
positive(grainVolumeM3,'sand-invalid-model');
const volumeM3=grains*grainVolumeM3;
const liters=volumeM3*1000;
if(!Number.isFinite(liters))throw new RangeError('sand-invalid-model');
return{volumeM3,liters,cubeSideM:Math.cbrt(volumeM3)};
}
export function waterModel(count,dropMl=0.05){
const drops=countNumber(count);
positive(dropMl,'water-invalid-model');
const liters=drops*dropMl/1000;
const volumeM3=liters/1000;
return{volumeM3,liters,cubeSideM:Math.cbrt(volumeM3)};
}
export function textModel(count,wordsPerBook=75000){
const words=countNumber(count)*WORDS_PER_TOKEN;
positive(wordsPerBook,'book-invalid-model');
const books=words/wordsPerBook;
if(!Number.isFinite(books))throw new RangeError('book-invalid-model');
return{words,books};
}
export function booksPerUnit(unit='book',wordsPerBook=75000){
positive(wordsPerBook,'book-invalid-model');
if(unit==='word')return 1/wordsPerBook;
if(unit==='token')return WORDS_PER_TOKEN/wordsPerBook;
return 1;
}
export function bookModel(count,{unit='book',thicknessM=0.03,wordsPerBook=75000}={}){
positive(thicknessM,'book-invalid-model');
const books=countNumber(count)*booksPerUnit(unit,wordsPerBook);
return{books,words:books*wordsPerBook,heightM:books*thicknessM};
}
export function countingModel(count,rate=1){
const items=countNumber(count);
positive(rate,'rate-invalid');
const seconds=items/rate;
if(!Number.isFinite(seconds))throw new RangeError('rate-invalid');
return{seconds,years:seconds/SECONDS_PER_YEAR};
}
export function compareVolume(volumeM3,referenceId){
volume(volumeM3);
const reference=referenceById(referenceId);
return{ratio:volumeM3/reference.size,inverse:volumeM3===0?null:reference.size/volumeM3};
}
export function countForVolume(referenceId,diameterMm=0.5,packing=0.6){
const reference=referenceById(referenceId);
const grainVolumeM3=sandModel(1n,diameterMm,packing).volumeM3;
const estimate=reference.size/grainVolumeM3;
if(!Number.isFinite(estimate))throw new RangeError('amount-too-large');
const count=BigInt(Math.round(estimate));
countNumber(count);
return count;
}
export function heightLadder(thicknessM=0.03){
positive(thicknessM,'book-invalid-model');
return HEIGHT_REFERENCES
.map(item=>(item.books?{...item,size:item.books*thicknessM}:item))
.sort((a,b)=>a.size-b.size);
}
export function sizePerUnit(world,settings={}){
const{unit,thicknessM=0.03,wordsPerBook=75000,dropMl=0.05,diameterMm=0.5,rate=1}=settings;
switch(world){
case'books':return booksPerUnit(unit,wordsPerBook)*thicknessM;
case'water':return waterModel(1n,dropMl).volumeM3;
case'sand':return sandModel(1n,diameterMm).volumeM3;
case'stars':return 1;
case'time':return 1/rate;
default:throw new RangeError('world-invalid');
}
}
export function ladderFor(world,settings={}){
switch(world){
case'books':return heightLadder(settings.thicknessM);
case'water':case'sand':return VOLUME_LADDER;
case'stars':return STAR_REFERENCES;
case'time':return TIME_REFERENCES;
default:throw new RangeError('world-invalid');
}
}
export function placeOnLadder(value,rungs){
let index=-1;
for(let i=0;i<rungs.length;i++)if(rungs[i].size<=value*(1+1e-12))index=i;
const below=rungs[index]??null;
const above=rungs[index+1]??null;
return{index,below,above,times:below?value/below.size:null,share:above?value/above.size:null};
}
export function roundUpCount(count,digits=3){
const text=count.toString();
if(text.length<=digits)return count;
const unit=10n**BigInt(text.length-digits);
const rounded=count%unit===0n?count:(count/unit+1n)*unit;
return rounded>MAX_COUNT?MAX_COUNT:rounded;
}
export function countForSize(size,perUnit){
const estimate=size/perUnit;
if(!Number.isFinite(estimate)||estimate>Number(MAX_COUNT))return null;
return roundUpCount(BigInt(Math.max(1,Math.ceil(estimate))));
}
export function log10Count(count){
if(count<=0n)return 0;
const digits=count.toString();
return Math.log10(Number(digits.slice(0,15)))+digits.length-Math.min(digits.length,15);
}
export function dialCount(position){
if(position>=30)return MAX_COUNT;
const place=Math.max(0,position);
const nearest=Math.round(place);
if(Math.abs(place-nearest)<0.03)return 10n**BigInt(nearest);
const power=Math.floor(place);
if(power===0)return BigInt(Math.round(10**place));
return BigInt(Math.round(10**(place-power+1)))*10n**BigInt(power-1);
}
export function namedAmount(value,digits,{names,plurals}){
const name=names.find(({size})=>value>=size);
if(!name)return null;
const amount=Number((value/name.size).toPrecision(digits));
return{amount,power:name.power,word:plurals.select(amount)==='one'?name.one:name.other};
}
export function countText(count,reading=ENGLISH){
const{decimal,group,joint}=reading;
const text=count.toString();
const grouped=digits=>digits.replace(/\B(?=(\d{3})+$)/g,group);
if(text.length<=15)return grouped(text);
const named=namedAmount(Number(count),4,reading);
if(!named||text.replace(/0+$/,'').length>4)return text;
const whole=text.slice(0,-named.power);
const part=text.slice(-named.power).replace(/0+$/,'');
return`${whole.length > 4 ? grouped(whole) : whole}${part ? `${decimal}${part}` : ''}${joint}${named.word}`;
}
