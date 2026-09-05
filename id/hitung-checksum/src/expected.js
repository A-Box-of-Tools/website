/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ALGORITHMS,ORDER}from'./hash.js?v=37afe7ce81';
const BY_LENGTH=new Map(ORDER.map((id)=>[ALGORITHMS[id].hex,id]));
const TAGGED=/^[^\S\n]*[A-Za-z0-9-]+[^\S\n]*\(([^)]*)\)[^\S\n]*=[^\S\n]*([0-9a-fA-F]+)[^\S\n]*$/;
const GNU=/^[^\S\n]*([0-9a-fA-F]{16,160})[^\S\n]+[*?^ ]?[^\S\n]*(\S.*?)[^\S\n]*$/;
const SRI=/\b(sha256|sha384|sha512)-([A-Za-z0-9+/]{20,}={0,2})/;
const HEX_RUN=/^[0-9a-fA-F]+$/;
export function readExpected(text){
const entries=[];
const strays=[];
const seen=new Set();
const take=(digest,name)=>{
const lower=digest.toLowerCase();
const algorithm=BY_LENGTH.get(lower.length);
if(!algorithm){
if(!seen.has(lower))strays.push({hex:lower});
seen.add(lower);
return;
}
const key=`${algorithm}:${lower}:${name ?? ''}`;
if(seen.has(key))return;
seen.add(key);
entries.push({hex:lower,algorithm,name:name||null});
};
for(const line of text.split(/\r?\n/)){
if(!line.trim())continue;
const tagged=TAGGED.exec(line);
if(tagged){
take(tagged[2],tagged[1].trim());
continue;
}
const sri=SRI.exec(line);
if(sri){
const bytes=fromBase64(sri[2]);
if(bytes){
take([...bytes].map((b)=>b.toString(16).padStart(2,'0')).join(''),null);
continue;
}
}
const gnu=GNU.exec(line);
if(gnu){
take(gnu[1],gnu[2]);
continue;
}
const bare=line.replace(/^[^:=]*[:=]/,'').replace(/\s+/g,'');
if(HEX_RUN.test(bare)&&bare.length>=8)take(bare,null);
}
const joined=text.replace(/\s+/g,'');
const wrapped=entries.length!==1
&&entries.every((entry)=>entry.name===null)
&&HEX_RUN.test(joined)
&&BY_LENGTH.has(joined.length);
if(wrapped){
strays.length=0;
entries.unshift({hex:joined.toLowerCase(),algorithm:BY_LENGTH.get(joined.length),name:null});
}
return{entries,strays,wrapped};
}
function fromBase64(text){
try{
const raw=atob(text);
const out=new Uint8Array(raw.length);
for(let i=0;i<raw.length;i+=1)out[i]=raw.charCodeAt(i);
return out;
}catch{
return null;
}
}
export function algorithmsIn(entries){
const wanted=new Set(entries.map((entry)=>entry.algorithm));
return ORDER.filter((id)=>wanted.has(id));
}
export function verdict(entries,digests,fileName){
if(!entries.length)return{state:'none'};
const named=fileName
?entries.filter((entry)=>entry.name&&basename(entry.name)===basename(fileName))
:[];
const candidates=named.length?named:entries;
for(const entry of candidates){
if(digests[entry.algorithm]===entry.hex){
return{state:'match',entry,renamed:false};
}
}
if(named.length){
for(const entry of entries){
if(digests[entry.algorithm]===entry.hex){
return{state:'match',entry,renamed:true};
}
}
}
const missing=algorithmsIn(candidates).filter((id)=>!(id in digests));
if(missing.length)return{state:'waiting',missing};
return{state:'mismatch',entry:candidates[0]};
}
function basename(name){
return name.split(/[\/]/).pop().trim();
}
