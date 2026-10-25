/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function ascii(text){
const out=new Uint8Array(text.length);
for(let i=0;i<text.length;i++)out[i]=text.charCodeAt(i);
return out;
}
export function bytes(...values){
return new Uint8Array(values);
}
export function u16(n){
return new Uint8Array([(n>>8)&0xff,n&0xff]);
}
export function u32(n){
return new Uint8Array([(n>>>24)&0xff,(n>>>16)&0xff,(n>>>8)&0xff,n&0xff]);
}
export function i32(n){
return u32(n|0);
}
export function zeros(n){
return new Uint8Array(n);
}
export function concat(parts){
let length=0;
for(const part of parts)length+=part.byteLength;
const out=new Uint8Array(length);
let at=0;
for(const part of parts){
out.set(part,at);
at+=part.byteLength;
}
return out;
}
export function box(type,...payload){
const body=concat(payload);
return concat([u32(body.byteLength+8),ascii(type),body]);
}
export function fullBox(type,version,flags,...payload){
const header=new Uint8Array([
version,(flags>>16)&0xff,(flags>>8)&0xff,flags&0xff,
]);
return box(type,header,...payload);
}
export function fourcc(view,at){
return String.fromCharCode(
view.getUint8(at),view.getUint8(at+1),view.getUint8(at+2),view.getUint8(at+3));
}
