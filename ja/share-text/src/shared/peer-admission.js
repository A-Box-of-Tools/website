/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const STORE='abox.pairing-admissions.v1';
const MAX_RECEIPTS=64;
const MAX_GRANTS=256;
export function validAdmissionToken(value){
return typeof value==='string'&&(/^[a-f0-9]{64}$/.test(value)
||/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value));
}
export class AdmissionGrants{
constructor({random=globalThis.crypto,limit=MAX_GRANTS}={}){
this.random=random;
this.limit=limit;
this.tokens=new Set();
}
has(token){return validAdmissionToken(token)&&this.tokens.has(token);}
issue(previous){
if(this.has(previous))return previous;
if(this.tokens.size>=this.limit)return null;
try{
const token=Array.from(this.random.getRandomValues(new Uint8Array(32)),byte=>byte.toString(16).padStart(2,'0')).join('');
this.tokens.add(token);
return token;
}catch{return null;}
}
revoke(token){this.tokens.delete(token);}
clear(){this.tokens.clear();}
}
export function createAdmissionCache({storage=()=>globalThis.localStorage,limit=MAX_RECEIPTS}={}){
const memory=new Map();
const key=(tool,code,route)=>JSON.stringify([tool,code,route]);
const stored=()=>{
try{
const rows=JSON.parse(storage()?.getItem(STORE)||'[]');
return new Map(Array.isArray(rows)?rows.slice(-limit).filter(row=>Array.isArray(row)
&&row.length===2&&typeof row[0]==='string'&&row[0].length<=256&&validAdmissionToken(row[1])):[]);
}catch{return new Map();}
};
return{
read(tool,code,route){
const scope=key(tool,code,route);
return stored().get(scope)??memory.get(scope)??null;
},
save(tool,code,route,token){
if(!validAdmissionToken(token))return;
const scope=key(tool,code,route),rows=stored();
memory.delete(scope);memory.set(scope,token);
while(memory.size>limit)memory.delete(memory.keys().next().value);
rows.delete(scope);rows.set(scope,token);
while(rows.size>limit)rows.delete(rows.keys().next().value);
try{storage()?.setItem(STORE,JSON.stringify([...rows]));}catch{}
},
};
}
