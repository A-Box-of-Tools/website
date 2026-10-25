/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
function variance(runs,at,pattern,tolerance){
let total=0;
let expected=0;
for(let i=0;i<pattern.length;i+=1){
if(at+i>=runs.length)return Infinity;
total+=runs[at+i];
expected+=pattern[i];
}
if(total<expected)return Infinity;
const unit=total/expected;
const allowed=tolerance*unit;
let error=0;
for(let i=0;i<pattern.length;i+=1){
const difference=Math.abs(runs[at+i]-pattern[i]*unit);
if(difference>allowed)return Infinity;
error+=difference;
}
return error/total;
}
function quietBefore(runs,at,unit){
return at===0||runs[at-1]>=unit*3;
}
function quietAfter(runs,end,unit){
return end>=runs.length||runs[end]>=unit*3;
}
function bestPattern(runs,at,patterns,tolerance){
let best=-1;
let bestError=Infinity;
for(let i=0;i<patterns.length;i+=1){
const error=variance(runs,at,patterns[i],tolerance);
if(error<bestError){
bestError=error;
best=i;
}
}
return best;
}
const EAN_ODD=[
[3,2,1,1],[2,2,2,1],[2,1,2,2],[1,4,1,1],[1,1,3,2],
[1,2,3,1],[1,1,1,4],[1,3,1,2],[1,2,1,3],[3,1,1,2],
];
const EAN_EVEN=EAN_ODD.map((pattern)=>[...pattern].reverse());
const EAN_BOTH=[...EAN_ODD,...EAN_EVEN];
const EAN_PARITY=[
'OOOOOO','OOEOEE','OOEEOE','OOEEEO','OEOOEE',
'OEEOOE','OEEEOO','OEOEOE','OEOEEO','OEEOEO',
];
const UPCE_PARITY=[
'EEEOOO','EEOEOO','EEOOEO','EEOOOE','EOEEOO',
'EOOEEO','EOOOEE','EOEOEO','EOEOOE','EOOEOE',
];
export function gs1Check(digits){
let sum=0;
for(let i=digits.length-1,weight=3;i>=0;i-=1,weight=4-weight){
sum+=Number(digits[i])*weight;
}
return(10-(sum%10))%10;
}
function expandUpce(system,body,check){
const[a,b,c,d,e,last]=body;
const middle=Number(last)<=2
?`${a}${b}${last}0000${c}${d}${e}`
:last==='3'?`${a}${b}${c}00000${d}${e}`
:last==='4'?`${a}${b}${c}${d}00000${e}`
:`${a}${b}${c}${d}${e}0000${last}`;
return`${system}${middle}${check}`;
}
function eanHalf(runs,at,count,patterns){
let digits='';
let parity='';
let cursor=at;
for(let i=0;i<count;i+=1){
const match=bestPattern(runs,cursor,patterns,0.7);
if(match<0)return null;
digits+=match%10;
parity+=match>=10?'E':'O';
cursor+=4;
}
return{digits,parity,at:cursor};
}
function readRetail(runs,at){
const unit=(runs[at]+runs[at+1]+runs[at+2])/3;
if(!quietBefore(runs,at,unit))return null;
const start=at+3;
const left=eanHalf(runs,start,6,EAN_BOTH);
if(left){
const first=EAN_PARITY.indexOf(left.parity);
if(first>=0&&variance(runs,left.at,[1,1,1,1,1],0.7)<Infinity){
const right=eanHalf(runs,left.at+5,6,EAN_ODD);
if(right&&variance(runs,right.at,[1,1,1],0.7)<Infinity
&&quietAfter(runs,right.at+3,unit)){
const digits=`${first}${left.digits}${right.digits}`;
if(gs1Check(digits.slice(0,12))===Number(digits[12])){
return digits[0]==='0'
?{format:'upca',name:'UPC-A',text:digits.slice(1),ean:digits}
:{format:'ean13',name:'EAN-13',text:digits,ean:digits};
}
}
}
}
if(left){
const check=UPCE_PARITY.indexOf(left.parity);
const inverted=UPCE_PARITY.indexOf([...left.parity]
.map((mark)=>(mark==='E'?'O':'E')).join(''));
const system=check>=0?0:1;
const digit=check>=0?check:inverted;
if(digit>=0&&variance(runs,left.at,[1,1,1,1,1,1],0.7)<Infinity
&&quietAfter(runs,left.at+6,unit)){
const full=expandUpce(system,left.digits,digit);
if(gs1Check(full.slice(0,11))===Number(full[11])){
return{
format:'upce',
name:'UPC-E',
text:`${system}${left.digits}${digit}`,
ean:`0${full}`,
};
}
}
}
const short=eanHalf(runs,start,4,EAN_ODD);
if(short&&variance(runs,short.at,[1,1,1,1,1],0.7)<Infinity){
const tail=eanHalf(runs,short.at+5,4,EAN_ODD);
if(tail&&variance(runs,tail.at,[1,1,1],0.7)<Infinity
&&quietAfter(runs,tail.at+3,unit)){
const digits=short.digits+tail.digits;
if(gs1Check(digits.slice(0,7))===Number(digits[7])){
return{format:'ean8',name:'EAN-8',text:digits,ean:digits};
}
}
}
return null;
}
const CODE128=[
'212222','222122','222221','121223','121322','131222','122213',
'122312','132212','221213','221312','231212','112232','122132',
'122231','113222','123122','123221','223211','221132','221231',
'213212','223112','312131','311222','321122','321221','312212',
'322112','322211','212123','212321','232121','111323','131123',
'131321','112313','132113','132311','211313','231113','231311',
'112133','112331','132131','113123','113321','133121','313121',
'211331','231131','213113','213311','213131','311123','311321',
'331121','312113','312311','332111','314111','221411','431111',
'111224','111422','121124','121421','141122','141221','112214',
'112412','122114','122411','142112','142211','241211','221114',
'413111','241112','134111','111242','121142','121241','114212',
'124112','124211','411212','421112','421211','212141','214121',
'412121','111143','111341','131141','114113','114311','411113',
'411311','113141','114131','311141','411131','211412','211214',
'211232','2331112',
].map((widths)=>[...widths].map(Number).slice(0,6));
const CODE128_STOP=106;
function code128A(value){
if(value<64)return String.fromCharCode(value+32);
if(value<96)return String.fromCharCode(value-64);
return null;
}
function code128B(value){
return value<96?String.fromCharCode(value+32):null;
}
function readCode128(runs,at){
const start=bestPattern(runs,at,CODE128.slice(103,106),0.7);
if(start<0)return null;
let width=0;
for(let i=0;i<6;i+=1)width+=runs[at+i];
const unit=width/11;
if(!quietBefore(runs,at,unit))return null;
const values=[];
let cursor=at+6;
for(;;){
const value=bestPattern(runs,cursor,CODE128,0.7);
if(value<0)return null;
cursor+=6;
if(value===CODE128_STOP)break;
values.push(value);
if(values.length>256)return null;
}
if(!quietAfter(runs,cursor+1,unit))return null;
if(!values.length)return null;
const check=values.pop();
let checksum=103+start;
values.forEach((value,index)=>{checksum+=value*(index+1);});
if(checksum%103!==check)return null;
let set='ABC'[start];
let shift=null;
let text='';
for(const value of values){
const active=shift??set;
shift=null;
if(active==='C'){
if(value<100)text+=String(value).padStart(2,'0');
else if(value===100)set='B';
else if(value===101)set='A';
continue;
}
if(value<96){
const character=active==='A'?code128A(value):code128B(value);
if(character===null)return null;
text+=character;
}else if(value===98){
shift=active==='A'?'B':'A';
}else if(value===99){
set='C';
}else if(value===100){
set=active==='B'?'A':'B';
}else if(value===101){
set=active==='A'?'B':'A';
}
}
return{format:'code128',name:'Code 128',text};
}
const TWO_OF_FIVE=(()=>{
const weights=[1,2,4,7,0];
const byValue=new Map();
for(let a=0;a<5;a+=1){
for(let b=a+1;b<5;b+=1){
const total=weights[a]+weights[b];
byValue.set(total===11?0:total,[a,b]);
}
}
return byValue;
})();
const ITF_DIGITS=Array.from({length:10},(unused,digit)=>{
const wide=TWO_OF_FIVE.get(digit);
return[0,1,2,3,4].map((position)=>(wide.includes(position)?3:1));
});
const CODE39_VALUES='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%';
const CODE39=(()=>{
const table=new Map();
const groups=[['1234567890',3],['ABCDEFGHIJ',5],['KLMNOPQRST',7],['UVWXYZ-. *',1]];
for(const[characters,wideSpace]of groups){
[...characters].forEach((character,index)=>{
const widths=new Array(9).fill(1);
for(const bar of TWO_OF_FIVE.get((index+1)%10))widths[bar*2]=3;
widths[wideSpace]=3;
table.set(character,widths);
});
}
for(const[character,spaces]of[['$',[1,3,5]],['/',[1,3,7]],
['+',[1,5,7]],['%',[3,5,7]]]){
const widths=new Array(9).fill(1);
for(const space of spaces)widths[space]=3;
table.set(character,widths);
}
return table;
})();
const CODE39_CHARACTERS=[...CODE39.keys()];
const CODE39_PATTERNS=CODE39_CHARACTERS.map((character)=>CODE39.get(character));
function readCode39(runs,at){
const asterisk=CODE39.get('*');
if(variance(runs,at,asterisk,0.5)===Infinity)return null;
let width=0;
for(let i=0;i<9;i+=1)width+=runs[at+i];
const unit=width/13;
if(!quietBefore(runs,at,unit))return null;
let cursor=at+9;
let text='';
for(let guard=0;guard<100;guard+=1){
cursor+=1;
if(cursor>=runs.length)return null;
if(variance(runs,cursor,asterisk,0.5)<Infinity){
if(!text.length||!quietAfter(runs,cursor+9,unit))return null;
return{format:'code39',name:'Code 39',text};
}
const match=bestPattern(runs,cursor,CODE39_PATTERNS,0.5);
if(match<0)return null;
const character=CODE39_CHARACTERS[match];
if(character==='*')return null;
text+=character;
cursor+=9;
}
return null;
}
function readItf(runs,at){
if(variance(runs,at,[1,1,1,1],0.5)===Infinity)return null;
const unit=(runs[at]+runs[at+1]+runs[at+2]+runs[at+3])/4;
if(!quietBefore(runs,at,unit))return null;
let cursor=at+4;
let digits='';
while(cursor+10<=runs.length&&digits.length<40){
const bars=[0,2,4,6,8].map((i)=>runs[cursor+i]);
const spaces=[1,3,5,7,9].map((i)=>runs[cursor+i]);
const first=bestPattern(bars,0,ITF_DIGITS,0.6);
const second=bestPattern(spaces,0,ITF_DIGITS,0.6);
if(first<0||second<0)break;
digits+=`${first}${second}`;
cursor+=10;
}
if(digits.length<4)return null;
if(variance(runs,cursor,[3,1,1],0.5)===Infinity)return null;
if(!quietAfter(runs,cursor+3,unit))return null;
const carton=digits.length===14&&gs1Check(digits.slice(0,13))===Number(digits[13]);
return{
format:carton?'itf14':'itf',
name:carton?'ITF-14':'Interleaved 2 of 5',
text:digits,
ean:carton?digits:null,
};
}
function runsOf(read,length){
const runs=[];
const firstIsDark=read(0)===1;
let dark=firstIsDark;
let from=0;
for(let i=1;i<=length;i+=1){
const here=i<length&&read(i)===1;
if(here===dark&&i<length)continue;
runs.push(i-from);
from=i;
dark=here;
}
return{runs,firstIsDark};
}
function readLine(line){
const{runs,firstIsDark}=line;
const results=[];
if(runs.length>400)return results;
for(let at=firstIsDark?0:1;at+3<runs.length;at+=2){
const retail=readRetail(runs,at);
if(retail){results.push(retail);continue;}
const code128=readCode128(runs,at);
if(code128){results.push(code128);continue;}
const itf=readItf(runs,at);
if(itf){results.push(itf);continue;}
const code39=readCode39(runs,at);
if(code39)results.push(code39);
}
return results;
}
function reversed(line){
return{
runs:[...line.runs].reverse(),
firstIsDark:line.runs.length%2===0?!line.firstIsDark:line.firstIsDark,
};
}
const SELF_CHECKING=new Set(['itf14','code128']);
export function readLinear(bits,width,height,lines=24){
const tally=new Map();
const consider=(line)=>{
const onThisLine=new Map();
for(const source of[line,reversed(line)]){
for(const found of readLine(source)){
onThisLine.set(`${found.format}:${found.text}`,found);
}
}
for(const[key,found]of onThisLine.entries()){
const seen=tally.get(key);
if(seen)seen.lines+=1;
else tally.set(key,{...found,lines:1});
}
};
const across=Math.min(lines,height);
for(let i=0;i<across;i+=1){
const y=Math.floor(((i+0.5)*height)/across);
consider(runsOf((x)=>bits[y*width+x],width));
}
const down=Math.min(lines,width);
for(let i=0;i<down;i+=1){
const x=Math.floor(((i+0.5)*width)/down);
consider(runsOf((y)=>bits[y*width+x],height));
}
const believable=[...tally.values()].filter(
(found)=>found.lines>=2||SELF_CHECKING.has(found.format));
if(!believable.length)return null;
believable.sort((a,b)=>b.lines-a.lines);
return believable[0];
}
