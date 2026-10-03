/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function base64(bytes){
const CHUNK=0x8000;
let binary='';
for(let at=0;at<bytes.length;at+=CHUNK){
binary+=String.fromCharCode.apply(null,bytes.subarray(at,at+CHUNK));
}
return btoa(binary);
}
export function fromBase64(text){
const binary=atob(text);
const out=new Uint8Array(binary.length);
for(let i=0;i<binary.length;i+=1)out[i]=binary.charCodeAt(i);
return out;
}
const MUST_ESCAPE=/["#%<>]/;
export function encodeSvg(text){
let out='';
for(const ch of stripBom(text)){
const code=ch.codePointAt(0);
out+=(code<0x20||code>0x7e||MUST_ESCAPE.test(ch))
?encodeURIComponent(ch)
:ch;
}
return out;
}
function stripBom(text){
return text.charCodeAt(0)===0xfeff?text.slice(1):text;
}
export function svgDataUri(text){
return`data:image/svg+xml,${encodeSvg(text)}`;
}
export function base64DataUri(bytes,mime){
return`data:${mime};base64,${base64(bytes)}`;
}
