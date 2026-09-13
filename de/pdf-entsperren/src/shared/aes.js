/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
function xtime(a){
return((a<<1)^(a&0x80?0x1b:0))&0xff;
}
const EXP=new Uint8Array(256);
const LOG=new Uint8Array(256);
{
let value=1;
for(let i=0;i<255;i+=1){
EXP[i]=value;
LOG[value]=i;
value^=xtime(value);
}
EXP[255]=EXP[0];
}
function mul(a,b){
return a&&b?EXP[(LOG[a]+LOG[b])%255]:0;
}
const SBOX=new Uint8Array(256);
const INV_SBOX=new Uint8Array(256);
for(let i=0;i<256;i+=1){
const inverse=i?EXP[255-LOG[i]]:0;
let s=inverse;
for(let bit=1;bit<=4;bit+=1){
s^=((inverse<<bit)|(inverse>>>(8-bit)))&0xff;
}
s^=0x63;
SBOX[i]=s;
INV_SBOX[s]=i;
}
const MUL={};
for(const factor of[2,3,9,11,13,14]){
const table=new Uint8Array(256);
for(let i=0;i<256;i+=1)table[i]=mul(i,factor);
MUL[factor]=table;
}
const RCON=new Uint8Array(11);
RCON[1]=1;
for(let i=2;i<11;i+=1)RCON[i]=xtime(RCON[i-1]);
export class Aes{
constructor(key){
const words=key.length/4;
if(!Number.isInteger(words)||![4,6,8].includes(words)){
throw new RangeError(`AES has no ${key.length}-byte key size`);
}
this.rounds=words+6;
this.schedule=expandKey(key,words,this.rounds);
}
encryptBlock(state){
const{schedule,rounds}=this;
addRoundKey(state,schedule,0);
for(let round=1;round<rounds;round+=1){
substitute(state,SBOX);
shiftRows(state);
mixColumns(state);
addRoundKey(state,schedule,round);
}
substitute(state,SBOX);
shiftRows(state);
addRoundKey(state,schedule,rounds);
}
decryptBlock(state){
const{schedule,rounds}=this;
addRoundKey(state,schedule,rounds);
for(let round=rounds-1;round>0;round-=1){
invShiftRows(state);
substitute(state,INV_SBOX);
addRoundKey(state,schedule,round);
invMixColumns(state);
}
invShiftRows(state);
substitute(state,INV_SBOX);
addRoundKey(state,schedule,0);
}
}
function addRoundKey(state,schedule,round){
const at=round*16;
for(let i=0;i<16;i+=1)state[i]^=schedule[at+i];
}
function substitute(state,table){
for(let i=0;i<16;i+=1)state[i]=table[state[i]];
}
function shiftRows(state){
const copy=state.slice();
for(let row=1;row<4;row+=1){
for(let col=0;col<4;col+=1){
state[row+4*col]=copy[row+4*((col+row)%4)];
}
}
}
function invShiftRows(state){
const copy=state.slice();
for(let row=1;row<4;row+=1){
for(let col=0;col<4;col+=1){
state[row+4*col]=copy[row+4*((col-row+4)%4)];
}
}
}
function mixColumns(state){
const two=MUL[2];
const three=MUL[3];
for(let col=0;col<4;col+=1){
const at=col*4;
const a=state[at];
const b=state[at+1];
const c=state[at+2];
const d=state[at+3];
state[at]=two[a]^three[b]^c^d;
state[at+1]=a^two[b]^three[c]^d;
state[at+2]=a^b^two[c]^three[d];
state[at+3]=three[a]^b^c^two[d];
}
}
function invMixColumns(state){
const nine=MUL[9];
const eleven=MUL[11];
const thirteen=MUL[13];
const fourteen=MUL[14];
for(let col=0;col<4;col+=1){
const at=col*4;
const a=state[at];
const b=state[at+1];
const c=state[at+2];
const d=state[at+3];
state[at]=fourteen[a]^eleven[b]^thirteen[c]^nine[d];
state[at+1]=nine[a]^fourteen[b]^eleven[c]^thirteen[d];
state[at+2]=thirteen[a]^nine[b]^fourteen[c]^eleven[d];
state[at+3]=eleven[a]^thirteen[b]^nine[c]^fourteen[d];
}
}
function expandKey(key,words,rounds){
const total=4*(rounds+1);
const schedule=new Uint8Array(total*4);
schedule.set(key);
const word=new Uint8Array(4);
for(let i=words;i<total;i+=1){
word.set(schedule.subarray((i-1)*4,i*4));
if(i%words===0){
const first=word[0];
word[0]=SBOX[word[1]]^RCON[i/words];
word[1]=SBOX[word[2]];
word[2]=SBOX[word[3]];
word[3]=SBOX[first];
}else if(words>6&&i%words===4){
for(let b=0;b<4;b+=1)word[b]=SBOX[word[b]];
}
for(let b=0;b<4;b+=1){
schedule[i*4+b]=schedule[(i-words)*4+b]^word[b];
}
}
return schedule;
}
export function cbcEncrypt(aes,iv,data){
const out=new Uint8Array(data.length-(data.length%16));
const block=new Uint8Array(16);
let previous=iv;
for(let at=0;at+16<=out.length;at+=16){
for(let i=0;i<16;i+=1)block[i]=data[at+i]^previous[i];
aes.encryptBlock(block);
out.set(block,at);
previous=out.subarray(at,at+16);
}
return out;
}
export function cbcDecrypt(aes,iv,data){
const out=new Uint8Array(data.length-(data.length%16));
const block=new Uint8Array(16);
let previous=iv;
for(let at=0;at+16<=out.length;at+=16){
block.set(data.subarray(at,at+16));
aes.decryptBlock(block);
for(let i=0;i<16;i+=1)out[at+i]=block[i]^previous[i];
previous=data.subarray(at,at+16);
}
return out;
}
