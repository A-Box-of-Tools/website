/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const PATTERNS=[
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
];
const START={A:103,B:104,C:105};
const STOP=106;
const SWITCH={A:101,B:100,C:99};
export const QUIET=10;
const isDigitCode=(code)=>code>=48&&code<=57;
const inA=(code)=>code<96;
const inB=(code)=>code>=32&&code<=127;
export function values(text){
const codes=[...text].map((character)=>character.codePointAt(0));
const bad=codes.findIndex((code)=>code>127);
if(bad!==-1){
throw new RangeError(
`Code 128 holds ASCII only, and ${JSON.stringify([...text][bad])} is not. `
+'A QR code will hold it.');
}
const digits=(from)=>{
let run=0;
while(from+run<codes.length&&isDigitCode(codes[from+run]))run+=1;
return run;
};
const out=[];
let set=startSet(codes,digits(0));
out.push(START[set]);
let i=0;
while(i<codes.length){
const run=digits(i);
const wantC=run>=6||(i+run===codes.length&&run>=4&&run%2===0);
if(set==='C'&&run>=2){
out.push((codes[i]-48)*10+(codes[i+1]-48));
i+=2;
continue;
}
if(set!=='C'&&wantC){
if(run%2===1){
out.push(value(codes[i],set));
i+=1;
}
out.push(SWITCH.C);
set='C';
continue;
}
if(set==='C'){
set=inB(codes[i])&&!onlyA(codes[i])?'B':'A';
out.push(SWITCH[set]);
continue;
}
if(!holds(codes[i],set)){
const next=set==='A'?'B':'A';
const after=codes[i+1];
if(after!==undefined&&holds(after,set)){
out.push(98);
out.push(value(codes[i],next));
i+=1;
continue;
}
out.push(SWITCH[next]);
set=next;
continue;
}
out.push(value(codes[i],set));
i+=1;
}
let sum=out[0];
for(let k=1;k<out.length;k+=1)sum+=out[k]*k;
out.push(sum%103);
out.push(STOP);
return out;
}
function onlyA(code){
return code<32;
}
function holds(code,set){
return set==='A'?inA(code):inB(code);
}
function value(code,set){
if(set==='A')return code<32?code+64:code-32;
return code-32;
}
function startSet(codes,leading){
if(codes.length>=2&&leading%2===0
&&(leading===codes.length||leading>=4))return'C';
for(const code of codes){
if(onlyA(code))return'A';
if(code>95)return'B';
}
return'B';
}
export function modules(text){
const parts=[];
for(let i=0;i<QUIET;i+=1)parts.push(0);
for(const symbol of values(text)){
let dark=1;
for(const width of PATTERNS[symbol]){
for(let i=0;i<Number(width);i+=1)parts.push(dark);
dark^=1;
}
}
for(let i=0;i<QUIET;i+=1)parts.push(0);
return Uint8Array.from(parts);
}
