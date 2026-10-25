/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function log2(n){
if(n<=0n)throw new RangeError('log2 needs a positive count');
const bits=n.toString(2).length;
if(bits<=53)return Math.log2(Number(n));
const shift=BigInt(bits-53);
return(bits-53)+Math.log2(Number(n>>shift));
}
function power(base,exponent){
return BigInt(base)**BigInt(exponent);
}
export function passwordSpace(sizes,length,requireEach){
const total=sizes.reduce((sum,size)=>sum+size,0);
if(total===0||length===0)return 0n;
if(!requireEach)return power(total,length);
if(length<sizes.length)return 0n;
let count=0n;
for(let mask=0;mask<(1<<sizes.length);mask+=1){
let dropped=0;
let excluded=0;
for(let i=0;i<sizes.length;i+=1){
if(mask&(1<<i)){
dropped+=1;
excluded+=sizes[i];
}
}
const term=power(total-excluded,length);
count+=dropped%2===0?term:-term;
}
return count;
}
export function passphraseSpace(listSize,words,extras=[]){
if(listSize===0||words===0)return 0n;
return extras.reduce((count,choices)=>count*BigInt(choices),
power(listSize,words));
}
export function bits(space){
return space<=0n?0:log2(space);
}
export function rating(value){
if(value<40)return'very-weak';
if(value<60)return'weak';
if(value<75)return'fair';
if(value<100)return'strong';
return'very-strong';
}
export const GUESSES_PER_SECOND=1e11;
const HOUR=3600;
const DAY=24*HOUR;
const MONTH=30*DAY;
const YEAR=365.25*DAY;
export function crackTime(value){
const seconds=2**(value-1-Math.log2(GUESSES_PER_SECOND));
if(seconds<1)return'instant';
if(seconds<HOUR)return'minutes';
if(seconds<DAY)return'hours';
if(seconds<MONTH)return'days';
if(seconds<YEAR)return'months';
if(seconds<100*YEAR)return'years';
if(seconds<1e6*YEAR)return'centuries';
return'ages';
}
export function scientific(value){
const log10=value*Math.log10(2);
const exponent=Math.floor(log10);
const mantissa=10**(log10-exponent);
return mantissa>=9.95
?{mantissa:1,exponent:exponent+1}
:{mantissa:Math.round(mantissa*10)/10,exponent};
}
