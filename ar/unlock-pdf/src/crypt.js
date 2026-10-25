/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{md5}from'./shared/md5.js?v=879b53dba1';
import{rc4}from'./rc4.js?v=879b53dba1';
import{Aes,cbcDecrypt,cbcEncrypt}from'./aes.js?v=879b53dba1';
import{permissionsIn}from'./permissions.js?v=879b53dba1';
export class WrongPasswordError extends Error{}
export class UnsupportedEncryptionError extends Error{
constructor(message,values){
super(message);
this.values=values;
}
}
const PAD=new Uint8Array([
0x28,0xbf,0x4e,0x5e,0x4e,0x75,0x8a,0x41,
0x64,0x00,0x4e,0x56,0xff,0xfa,0x01,0x08,
0x2e,0x2e,0x00,0xb6,0xd0,0x68,0x3e,0x80,
0x2f,0x0c,0xa9,0xfe,0x64,0x53,0x69,0x7a,
]);
const NO_IV=new Uint8Array(16);
const EMPTY=new Uint8Array(0);
export function standardSecurity(password=''){
const report={
encrypted:false,
revision:0,
cipher:'',
bits:0,
opened:'',
restrictions:[],
encryptMetadata:true,
keyConfirmed:false,
};
const unlock=async(encrypt,doc)=>{
report.encrypted=true;
if(!(encrypt instanceof Map))throw new UnsupportedEncryptionError('crypt.malformed');
const handler=doc.get(encrypt,'Filter');
if(handler&&handler.value!=='Standard'){
throw new UnsupportedEncryptionError('crypt.handler',{name:handler.value});
}
const version=doc.get(encrypt,'V')??0;
const revision=doc.get(encrypt,'R')??0;
report.revision=revision;
if(revision<2||revision>6||version<1||version===3||version>5){
throw new UnsupportedEncryptionError('crypt.version',{v:version,r:revision});
}
report.encryptMetadata=doc.get(encrypt,'EncryptMetadata')!==false;
report.restrictions=permissionsIn(doc.get(encrypt,'P')??0,revision);
const filters=readCryptFilters(doc,encrypt,version);
const key=version>=5
?await key256(password,doc,encrypt,report)
:key128(password,doc,encrypt,version,revision,report);
report.bits=key.length*8;
const cipher=filters.table.get(filters.streamName)
??filters.table.get(filters.stringName);
report.cipher=version>=5||cipher?.aes?'aes':'rc4';
return makeCrypt(key,filters,version>=5,report);
};
return{unlock,report};
}
function key128(password,doc,encrypt,version,revision,report){
const owner=stringBytes(doc.get(encrypt,'O'));
const user=stringBytes(doc.get(encrypt,'U'));
const permissions=doc.get(encrypt,'P')??0;
const id=firstId(doc);
const length=version===1?5:Math.floor((doc.get(encrypt,'Length')??40)/8);
const bytes=latin1(password);
const settings={
owner,permissions,id,revision,length,encryptMetadata:report.encryptMetadata,
};
const blank=deriveKey(EMPTY,settings);
if(matchesUser(blank,user,id,revision)){
report.opened='blank';
return blank;
}
if(password){
const asUser=deriveKey(bytes,settings);
if(matchesUser(asUser,user,id,revision)){
report.opened='user';
return asUser;
}
const recovered=userPasswordFromOwner(bytes,owner,revision,length);
const asOwner=deriveKey(recovered,settings);
if(matchesUser(asOwner,user,id,revision)){
report.opened='owner';
return asOwner;
}
}
throw new WrongPasswordError('crypt.wrongpassword');
}
function padded(bytes){
const out=new Uint8Array(32);
const take=Math.min(bytes.length,32);
out.set(bytes.subarray(0,take));
out.set(PAD.subarray(0,32-take),take);
return out;
}
function deriveKey(password,{owner,permissions,id,revision,length,encryptMetadata}){
const hash=md5();
hash.update(padded(password));
hash.update(owner.subarray(0,32));
hash.update(int32le(permissions));
hash.update(id);
if(revision>=4&&!encryptMetadata){
hash.update(new Uint8Array([0xff,0xff,0xff,0xff]));
}
let digest=hash.digest();
const size=revision===2?5:clamp(length,5,16);
if(revision>=3){
for(let i=0;i<50;i+=1){
const again=md5();
again.update(digest.subarray(0,size));
digest=again.digest();
}
}
return digest.slice(0,size);
}
function matchesUser(key,user,id,revision){
if(user.length<16)return false;
if(revision===2){
return same(rc4(key,PAD),user.subarray(0,32),32);
}
const hash=md5();
hash.update(PAD);
hash.update(id);
let x=rc4(key,hash.digest());
for(let i=1;i<=19;i+=1)x=rc4(xorEach(key,i),x);
return same(x,user.subarray(0,16),16);
}
function userPasswordFromOwner(password,owner,revision,length){
const hash=md5();
hash.update(padded(password));
let digest=hash.digest();
const size=revision===2?5:clamp(length,5,16);
if(revision>=3){
for(let i=0;i<50;i+=1){
const again=md5();
again.update(digest);
digest=again.digest();
}
}
const key=digest.slice(0,size);
if(revision===2)return rc4(key,owner.subarray(0,32));
let x=owner.slice(0,32);
for(let i=19;i>=0;i-=1)x=rc4(xorEach(key,i),x);
return x;
}
export function protect({ownerPassword,permissions,id}){
const revision=4;
const length=16;
const owner=ownerEntry(ownerPassword,revision,length);
const key=deriveKey(EMPTY,{
owner,permissions,id,revision,length,encryptMetadata:true,
});
const user=userEntry(key,id);
const dictionary='<< /Filter /Standard /V 4 /R 4 /Length 128'
+' /CF << /StdCF << /CFM /AESV2 /AuthEvent /DocOpen /Length 16 >> >>'
+' /StmF /StdCF /StrF /StdCF'
+` /O ${hex(owner)} /U ${hex(user)} /P ${permissions | 0} >>`;
return{
dictionary,
encrypt:(bytes,num,gen)=>aesEncrypt(objectKey(key,num,gen,true),bytes),
};
}
function ownerEntry(ownerPassword,revision,length){
const hash=md5();
hash.update(padded(latin1(ownerPassword)));
let digest=hash.digest();
for(let i=0;i<50;i+=1){
const again=md5();
again.update(digest);
digest=again.digest();
}
const key=digest.slice(0,clamp(length,5,16));
let x=rc4(key,PAD);
for(let i=1;i<=19;i+=1)x=rc4(xorEach(key,i),x);
return x;
}
function userEntry(key,id){
const hash=md5();
hash.update(PAD);
hash.update(id);
let x=rc4(key,hash.digest());
for(let i=1;i<=19;i+=1)x=rc4(xorEach(key,i),x);
const out=new Uint8Array(32);
out.set(x.subarray(0,16));
return out;
}
function aesEncrypt(key,bytes){
const iv=crypto.getRandomValues(new Uint8Array(16));
const fill=16-(bytes.length%16);
const block=new Uint8Array(bytes.length+fill);
block.set(bytes);
block.fill(fill,bytes.length);
return join(iv,cbcEncrypt(new Aes(key),iv,block));
}
function hex(bytes){
let out='<';
for(const byte of bytes)out+=byte.toString(16).padStart(2,'0');
return`${out}>`;
}
async function key256(password,doc,encrypt,report){
const user=stringBytes(doc.get(encrypt,'U'));
const owner=stringBytes(doc.get(encrypt,'O'));
const userExtra=stringBytes(doc.get(encrypt,'UE'));
const ownerExtra=stringBytes(doc.get(encrypt,'OE'));
const revision=doc.get(encrypt,'R');
if(user.length<48||owner.length<48){
throw new UnsupportedEncryptionError('crypt.malformed');
}
const bytes=utf8(password).subarray(0,127);
const candidates=password===''?[EMPTY]:[EMPTY,bytes];
for(const tried of candidates){
const blank=tried===EMPTY;
const asUser=await hash2B(tried,user.subarray(32,40),EMPTY,revision);
if(same(asUser,user.subarray(0,32),32)){
report.opened=blank?'blank':'user';
const wrapping=await hash2B(tried,user.subarray(40,48),EMPTY,revision);
return unwrap(wrapping,userExtra,doc,encrypt,report);
}
const udata=user.subarray(0,48);
const asOwner=await hash2B(tried,owner.subarray(32,40),udata,revision);
if(same(asOwner,owner.subarray(0,32),32)){
report.opened=blank?'blank':'owner';
const wrapping=await hash2B(tried,owner.subarray(40,48),udata,revision);
return unwrap(wrapping,ownerExtra,doc,encrypt,report);
}
}
throw new WrongPasswordError('crypt.wrongpassword');
}
function unwrap(wrapping,wrapped,doc,encrypt,report){
if(wrapped.length<32)throw new UnsupportedEncryptionError('crypt.malformed');
const key=cbcDecrypt(new Aes(wrapping),NO_IV,wrapped.subarray(0,32));
report.keyConfirmed=permsAgree(key,doc,encrypt);
return key;
}
function permsAgree(key,doc,encrypt){
const perms=stringBytes(doc.get(encrypt,'Perms'));
if(perms.length<16)return false;
const plain=cbcDecrypt(new Aes(key),NO_IV,perms.subarray(0,16));
if(plain[9]!==0x61||plain[10]!==0x64||plain[11]!==0x62)return false;
const stated=doc.get(encrypt,'P')??0;
const view=new DataView(plain.buffer,plain.byteOffset,4);
return view.getInt32(0,true)===(stated|0);
}
async function hash2B(password,salt,extra,revision){
let k=new Uint8Array(await sha(256,join(password,salt,extra)));
if(revision===5)return k;
let round=0;
for(;;){
const one=join(password,k,extra);
const k1=new Uint8Array(one.length*64);
for(let i=0;i<64;i+=1)k1.set(one,i*one.length);
const e=cbcEncrypt(new Aes(k.subarray(0,16)),k.subarray(16,32),k1);
let sum=0;
for(let i=0;i<16;i+=1)sum+=e[i];
k=new Uint8Array(await sha([256,384,512][sum%3],e));
round+=1;
if(round>=64&&e[e.length-1]<=round-32)break;
}
return k.slice(0,32);
}
const sha=(bits,bytes)=>crypto.subtle.digest(`SHA-${bits}`,bytes);
function readCryptFilters(doc,encrypt,version){
const table=new Map();
if(version<4){
table.set('StdCF',{aes:false});
return{table,streamName:'StdCF',stringName:'StdCF'};
}
const declared=doc.get(encrypt,'CF');
if(declared instanceof Map){
for(const[name,entry]of declared){
const dict=doc.resolve(entry);
if(!(dict instanceof Map))continue;
const method=doc.get(dict,'CFM');
table.set(name,{
aes:method?.value==='AESV2'||method?.value==='AESV3',
none:method?.value==='None',
});
}
}
const named=(key)=>{
const value=doc.get(encrypt,key);
const name=value?.value??'Identity';
return name==='Identity'||table.get(name)?.none?null:name;
};
return{table,streamName:named('StmF'),stringName:named('StrF')};
}
function makeCrypt(fileKey,filters,whole,report){
const cipherFor=(name)=>filters.table.get(name)
??filters.table.get(filters.streamName)??{aes:whole};
const apply=(bytes,num,gen,name)=>{
const filter=cipherFor(name);
const key=whole?fileKey:objectKey(fileKey,num,gen,filter.aes);
return filter.aes?aesDecrypt(key,bytes):rc4(key,bytes);
};
return{
encryptMetadata:report.encryptMetadata,
streamFilter:filters.streamName,
stringFilter:filters.stringName,
decryptStream(bytes,num,gen,name){
return apply(bytes,num,gen,name??filters.streamName);
},
decryptString(bytes,num,gen){
if(filters.stringName===null)return bytes;
return apply(bytes,num,gen,filters.stringName);
},
};
}
function objectKey(fileKey,num,gen,aes){
const hash=md5();
hash.update(fileKey);
hash.update(new Uint8Array([
num&0xff,(num>>8)&0xff,(num>>16)&0xff,gen&0xff,(gen>>8)&0xff,
]));
if(aes)hash.update(new Uint8Array([0x73,0x41,0x6c,0x54]));
return hash.digest().slice(0,Math.min(fileKey.length+5,16));
}
function aesDecrypt(key,bytes){
if(bytes.length<=16)return EMPTY;
const body=bytes.subarray(16,16+Math.floor((bytes.length-16)/16)*16);
const out=cbcDecrypt(new Aes(key),bytes.subarray(0,16),body);
const last=out[out.length-1];
if(last>=1&&last<=16&&last<=out.length){
for(let i=out.length-last;i<out.length;i+=1){
if(out[i]!==last)return out;
}
return out.subarray(0,out.length-last);
}
return out;
}
function firstId(doc){
const id=doc.resolve(doc.trailer.get('ID'));
return Array.isArray(id)?stringBytes(doc.resolve(id[0])):EMPTY;
}
function stringBytes(value){
return value?.bytes instanceof Uint8Array?value.bytes:EMPTY;
}
function latin1(text){
const out=new Uint8Array(text.length);
for(let i=0;i<text.length;i+=1)out[i]=text.charCodeAt(i)&0xff;
return out;
}
function utf8(text){
return new TextEncoder().encode(text);
}
function int32le(value){
const out=new Uint8Array(4);
new DataView(out.buffer).setInt32(0,value|0,true);
return out;
}
function xorEach(key,value){
const out=new Uint8Array(key.length);
for(let i=0;i<key.length;i+=1)out[i]=key[i]^value;
return out;
}
function join(...parts){
const total=parts.reduce((sum,part)=>sum+part.length,0);
const out=new Uint8Array(total);
let at=0;
for(const part of parts){
out.set(part,at);
at+=part.length;
}
return out;
}
function same(a,b,length){
if(a.length<length||b.length<length)return false;
let differences=0;
for(let i=0;i<length;i+=1)differences|=a[i]^b[i];
return differences===0;
}
function clamp(value,low,high){
return Math.min(Math.max(Number.isFinite(value)?value:low,low),high);
}
