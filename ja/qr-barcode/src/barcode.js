/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{modules as code128Modules,QUIET as CODE128_QUIET}from'./code128.js?v=b5506e299a';
const WIDE=3;
const EAN_L=[
'0001101','0011001','0010011','0111101','0100011',
'0110001','0101111','0111011','0110111','0001011',
];
const EAN_R=EAN_L.map((bits)=>[...bits].map((bit)=>(bit==='0'?'1':'0')).join(''));
const EAN_G=EAN_R.map((bits)=>[...bits].reverse().join(''));
const EAN_PARITY=[
'LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG',
'LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL',
];
export function gs1Check(digits){
let sum=0;
for(let i=digits.length-1,weight=3;i>=0;i-=1,weight=4-weight){
sum+=Number(digits[i])*weight;
}
return(10-(sum%10))%10;
}
const TWO_OF_FIVE=(()=>{
const weights=[1,2,4,7,0];
const byValue=new Map();
for(let a=0;a<5;a+=1){
for(let b=a+1;b<5;b+=1){
const total=weights[a]+weights[b];
byValue.set(total===11?10:total,[a,b]);
}
}
return byValue;
})();
const CODE39=(()=>{
const table=new Map();
const groups=[
['1234567890',3],
['ABCDEFGHIJ',5],
['KLMNOPQRST',7],
['UVWXYZ-. *',1],
];
for(const[characters,wideSpace]of groups){
[...characters].forEach((character,index)=>{
const widths=new Array(9).fill(1);
for(const bar of TWO_OF_FIVE.get(index+1))widths[bar*2]=WIDE;
widths[wideSpace]=WIDE;
table.set(character,widths);
});
}
const specials=[['$',[1,3,5]],['/',[1,3,7]],['+',[1,5,7]],['%',[3,5,7]]];
for(const[character,spaces]of specials){
const widths=new Array(9).fill(1);
for(const space of spaces)widths[space]=WIDE;
table.set(character,widths);
}
return table;
})();
const CODE39_VALUES='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
function quiet(width){
return new Array(width).fill(0);
}
function bits(pattern){
return[...pattern].map(Number);
}
function widths(list,startDark=1){
const out=[];
let dark=startDark;
for(const width of list){
for(let i=0;i<width;i+=1)out.push(dark);
dark^=1;
}
return out;
}
function retail(digits,kind){
const quietLeft=kind==='ean13'?11:kind==='upca'?9:7;
const quietRight=kind==='ean13'?7:kind==='upca'?9:7;
const modules=[...quiet(quietLeft)];
const guards=[...quiet(quietLeft)];
const mark=(list,guard=false)=>{
for(const module of list){
modules.push(module);
guards.push(guard?1:0);
}
};
const full=kind==='upca'?`0${digits}`:digits;
const left=kind==='ean8'?full.slice(0,4):full.slice(1,7);
const right=kind==='ean8'?full.slice(4):full.slice(7);
const parity=kind==='ean8'?'LLLL':EAN_PARITY[Number(full[0])];
mark(bits('101'),true);
[...left].forEach((digit,index)=>{
mark(bits(parity[index]==='L'?EAN_L[Number(digit)]:EAN_G[Number(digit)]));
});
mark(bits('01010'),true);
for(const digit of right)mark(bits(EAN_R[Number(digit)]));
mark(bits('101'),true);
for(let i=0;i<quietRight;i+=1){
modules.push(0);
guards.push(0);
}
const leftStart=quietLeft+3;
const rightStart=leftStart+left.length*7+5;
const labels=[];
if(kind==='ean13'){
labels.push({text:full[0],from:0,to:quietLeft,outside:true});
labels.push({text:left,from:leftStart,to:leftStart+42});
labels.push({text:right,from:rightStart,to:rightStart+42});
}else if(kind==='upca'){
labels.push({text:digits[0],from:0,to:quietLeft,outside:true});
labels.push({text:left.slice(1),from:leftStart+7,to:leftStart+42});
labels.push({text:right.slice(0,5),from:rightStart,to:rightStart+35});
labels.push({
text:digits[digits.length-1],
from:modules.length-quietRight,
to:modules.length,
outside:true,
});
}else{
labels.push({text:left,from:leftStart,to:leftStart+28});
labels.push({text:right,from:rightStart,to:rightStart+28});
}
return{
modules:Uint8Array.from(modules),
guards:Uint8Array.from(guards),
labels,
quiet:{left:quietLeft,right:quietRight},
};
}
function interleaved(digits){
const QUIET_ITF=10;
const modules=[...quiet(QUIET_ITF),...widths([1,1,1,1])];
for(let i=0;i<digits.length;i+=2){
const bars=TWO_OF_FIVE.get(Number(digits[i])===0?10:Number(digits[i]));
const spaces=TWO_OF_FIVE.get(Number(digits[i+1])===0?10:Number(digits[i+1]));
const pair=[];
for(let k=0;k<5;k+=1){
pair.push(bars.includes(k)?WIDE:1);
pair.push(spaces.includes(k)?WIDE:1);
}
modules.push(...widths(pair));
}
modules.push(...widths([WIDE,1,1]));
modules.push(...quiet(QUIET_ITF));
return{
modules:Uint8Array.from(modules),
guards:new Uint8Array(modules.length),
labels:[{text:digits,from:QUIET_ITF,to:modules.length-QUIET_ITF}],
quiet:{left:QUIET_ITF,right:QUIET_ITF},
};
}
function code39(text,addCheck,t){
const QUIET_39=10;
const characters=[...text];
for(const character of characters){
if(!CODE39.has(character)||character==='*'){
throw new RangeError(t('bar.code39.cannot',
{char:JSON.stringify(character)}));
}
}
const printed=[...characters];
if(addCheck){
const sum=characters.reduce((total,character)=>total+CODE39_VALUES.indexOf(character),0);
printed.push(CODE39_VALUES[sum%43]);
}
const modules=[...quiet(QUIET_39)];
for(const character of['*',...printed,'*']){
modules.push(...widths(CODE39.get(character)));
modules.push(0);
}
modules.pop();
modules.push(...quiet(QUIET_39));
return{
modules:Uint8Array.from(modules),
guards:new Uint8Array(modules.length),
labels:[{text:`*${printed.join('')}*`,from:QUIET_39,to:modules.length-QUIET_39}],
quiet:{left:QUIET_39,right:QUIET_39},
};
}
export const SYMBOLOGIES=[
{
id:'code128',
name:'Code 128',
holds:'bar.code128.holds',
needs:'bar.code128.needs',
pattern:null,
},
{
id:'ean13',
name:'EAN-13',
holds:'bar.ean13.holds',
needs:'bar.ean13.needs',
pattern:/^[0-9]{12,13}$/,
},
{
id:'upca',
name:'UPC-A',
holds:'bar.upca.holds',
needs:'bar.upca.needs',
pattern:/^[0-9]{11,12}$/,
},
{
id:'ean8',
name:'EAN-8',
holds:'bar.ean8.holds',
needs:'bar.ean8.needs',
pattern:/^[0-9]{7,8}$/,
},
{
id:'itf14',
name:'ITF-14',
holds:'bar.itf14.holds',
needs:'bar.itf14.needs',
pattern:/^[0-9]{13,14}$/,
},
{
id:'itf',
name:'Interleaved 2 of 5',
holds:'bar.itf.holds',
needs:'bar.itf.needs',
pattern:/^([0-9]{2})+$/,
},
{
id:'code39',
name:'Code 39',
holds:'bar.code39.holds',
needs:'bar.code39.needs',
pattern:/^[0-9A-Z\-. $/+%]+$/,
},
];
function withCheck(digits,length,name,t){
if(digits.length===length){
const expected=gs1Check(digits.slice(0,length-1));
if(Number(digits[length-1])!==expected){
throw new RangeError(t('bar.checkdigit',
{name,expected,actual:digits[length-1]}));
}
return{digits,added:false};
}
return{digits:digits+gs1Check(digits),added:true};
}
export function makeBarcode(text,options,t){
const symbology=SYMBOLOGIES.find((entry)=>entry.id===options.symbology);
if(!symbology)throw new RangeError(t('bar.nosuch',{id:options.symbology}));
const value=symbology.id==='code39'?text.toUpperCase():text;
if(!value)throw new RangeError(t('bar.empty',{name:symbology.name}));
if(symbology.pattern&&!symbology.pattern.test(value)){
throw new RangeError(t('bar.wants',
{name:symbology.name,needs:t(symbology.needs)}));
}
let note='';
let drawn;
let printed=value;
if(symbology.id==='ean13'||symbology.id==='upca'||symbology.id==='ean8'){
const length={ean13:13,upca:12,ean8:8}[symbology.id];
const checked=withCheck(value,length,symbology.name,t);
printed=checked.digits;
if(checked.added)note=t('bar.added',{digit:printed.slice(-1)});
drawn=retail(printed,symbology.id);
}else if(symbology.id==='itf14'){
const checked=withCheck(value,14,'ITF-14',t);
printed=checked.digits;
if(checked.added)note=t('bar.added',{digit:printed.slice(-1)});
drawn=interleaved(printed);
}else if(symbology.id==='itf'){
drawn=interleaved(value);
}else if(symbology.id==='code39'){
drawn=code39(value,options.code39Check===true,t);
if(options.code39Check)note=t('bar.modulo43');
if(value!==text){
note=note?t('bar.andraised',{note}):t('bar.raised');
}
}else{
drawn={
modules:code128Modules(value,t),
guards:null,
labels:null,
quiet:{left:CODE128_QUIET,right:CODE128_QUIET},
};
drawn.guards=new Uint8Array(drawn.modules.length);
drawn.labels=[{
text:value,
from:CODE128_QUIET,
to:drawn.modules.length-CODE128_QUIET,
}];
}
return{
...drawn,
symbology:symbology.id,
name:symbology.name,
text:printed,
note,
};
}
