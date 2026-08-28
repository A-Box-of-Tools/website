/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const URL_ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const utf8={
encode:(text)=>new TextEncoder().encode(text),
decode:(bytes)=>new TextDecoder('utf-8',{fatal:true}).decode(bytes),
};
export class CodecError extends Error{
constructor(key,values={}){
super(key);
this.name='CodecError';
this.values=values;
}
}
export function bytesToBase64(bytes,{urlSafe=false,pad=!urlSafe}={}){
const table=urlSafe?URL_ALPHABET:ALPHABET;
let out='';
for(let i=0;i<bytes.length;i+=3){
const a=bytes[i];
const b=bytes[i+1];
const c=bytes[i+2];
out+=table[a>>2];
out+=table[((a&0x03)<<4)|((b??0)>>4)];
out+=b===undefined?(pad?'=':''):table[((b&0x0f)<<2)|((c??0)>>6)];
out+=c===undefined?(pad?'=':''):table[c&0x3f];
}
return out;
}
export function base64ToBytes(text){
const cleaned=text.replace(/[\s\r\n]+/g,'');
const body=cleaned.replace(/=+$/,'');
const padding=cleaned.length-body.length;
if(padding>2)throw new CodecError('b64.padding');
if(padding&&cleaned.length%4!==0)throw new CodecError('b64.notfour');
if(body.length%4===1)throw new CodecError('b64.length');
const bytes=new Uint8Array(Math.floor((body.length*6)/8));
let held=0;
let bits=0;
let out=0;
for(const ch of body){
let value=ALPHABET.indexOf(ch);
if(value<0)value=URL_ALPHABET.indexOf(ch);
if(value<0){
throw new CodecError('b64.character',{ch});
}
held=((held<<6)|value)&0xffff;
bits+=6;
if(bits>=8){
bits-=8;
bytes[out]=(held>>bits)&0xff;
out+=1;
}
}
return bytes;
}
const NAMED={
amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',
copy:'©',reg:'®',trade:'™',hellip:'…',
mdash:'—',ndash:'–',lsquo:'‘',rsquo:'’',
ldquo:'“',rdquo:'”',bull:'•',middot:'·',
deg:'°',plusmn:'±',times:'×',divide:'÷',
euro:'€',pound:'£',yen:'¥',cent:'¢',
sect:'§',para:'¶',dagger:'†',laquo:'«',
raquo:'»',frac12:'½',frac14:'¼',frac34:'¾',
larr:'←',rarr:'→',harr:'↔',crarr:'↵',
infin:'∞',ne:'≠',le:'≤',ge:'≥',
};
export function escapeHtml(text){
return text.replace(/[&<>"']/g,(ch)=>({
'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;',
}[ch]));
}
export function unescapeHtml(text){
return text.replace(/&(#[0-9]+|#[xX][0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g,(whole,body)=>{
if(body[0]==='#'){
const code=body[1]==='x'||body[1]==='X'
?parseInt(body.slice(2),16):parseInt(body.slice(1),10);
if(!Number.isFinite(code)||code<0||code>0x10ffff)return whole;
return String.fromCodePoint(code);
}
return NAMED[body]??whole;
});
}
export function bytesToHex(bytes,{spaced=false}={}){
const parts=Array.from(bytes,(byte)=>byte.toString(16).padStart(2,'0'));
return spaced?parts.join(' '):parts.join('');
}
export function hexToBytes(text){
const cleaned=text.replace(/0x|\\x|[\s,:;-]+/gi,'');
if(cleaned==='')return new Uint8Array(0);
if(!/^[0-9a-fA-F]+$/.test(cleaned)){
const bad=cleaned.match(/[^0-9a-fA-F]/)[0];
throw new CodecError('hex.digit',{ch:bad});
}
if(cleaned.length%2)throw new CodecError('hex.odd');
const bytes=new Uint8Array(cleaned.length/2);
for(let i=0;i<bytes.length;i+=1){
bytes[i]=parseInt(cleaned.slice(i*2,i*2+2),16);
}
return bytes;
}
export function escapeUnicode(text){
let out='';
for(const ch of text){
const code=ch.codePointAt(0);
if(ch==='\\'){out+='\\\\';continue;}
if(ch==='\n'){out+='\\n';continue;}
if(ch==='\r'){out+='\\r';continue;}
if(ch==='\t'){out+='\\t';continue;}
if(code<0x20||code===0x7f){out+=`\\u${code.toString(16).padStart(4, '0')}`;continue;}
if(code<0x7f){out+=ch;continue;}
for(let i=0;i<ch.length;i+=1){
out+=`\\u${ch.charCodeAt(i).toString(16).padStart(4, '0')}`;
}
}
return out;
}
export function unescapeUnicode(text){
let out='';
for(let i=0;i<text.length;i+=1){
if(text[i]!=='\\'){out+=text[i];continue;}
const next=text[i+1];
const short={n:'\n',r:'\r',t:'\t',b:'\b',f:'\f',v:'\v','0':'\0','\\':'\\',"'":"'",'"':'"','/':'/'};
if(next==='u'&&text[i+2]==='{'){
const end=text.indexOf('}',i+3);
const digits=end<0?'':text.slice(i+3,end);
if(!/^[0-9a-fA-F]{1,6}$/.test(digits))throw new CodecError('esc.braces');
out+=String.fromCodePoint(parseInt(digits,16));
i=end;
continue;
}
if(next==='u'||next==='x'){
const width=next==='u'?4:2;
const digits=text.slice(i+2,i+2+width);
if(!new RegExp(`^[0-9a-fA-F]{${width}}$`).test(digits)){
throw new CodecError('esc.digits',{escape:next,width});
}
out+=String.fromCharCode(parseInt(digits,16));
i+=1+width;
continue;
}
if(next!==undefined&&next in short){out+=short[next];i+=1;continue;}
throw new CodecError('esc.unknown',{escape:next??''});
}
return out;
}
function decodePercent(text,whole){
try{
return whole?decodeURI(text):decodeURIComponent(text);
}catch{
const bad=/%[0-9a-fA-F]{0,2}/.exec(text.replace(/%[0-9a-fA-F]{2}/g,''));
throw new CodecError(bad?'pct.incomplete':'pct.notutf8',
bad?{escape:bad[0]}:{});
}
}
export const CODECS=[
{
id:'base64',
name:'codec.base64.name',
note:'codec.base64.note',
encode:(text)=>bytesToBase64(utf8.encode(text)),
decode:(text)=>utf8.decode(base64ToBytes(text)),
},
{
id:'base64url',
name:'codec.base64url.name',
note:'codec.base64url.note',
encode:(text)=>bytesToBase64(utf8.encode(text),{urlSafe:true}),
decode:(text)=>utf8.decode(base64ToBytes(text)),
},
{
id:'url',
name:'codec.url.name',
note:'codec.url.note',
encode:(text)=>encodeURIComponent(text),
decode:(text)=>decodePercent(text,false),
},
{
id:'url-whole',
name:'codec.url-whole.name',
note:'codec.url-whole.note',
encode:(text)=>encodeURI(text),
decode:(text)=>decodePercent(text,true),
},
{
id:'html',
name:'codec.html.name',
note:'codec.html.note',
encode:escapeHtml,
decode:unescapeHtml,
},
{
id:'hex',
name:'codec.hex.name',
note:'codec.hex.note',
encode:(text)=>bytesToHex(utf8.encode(text),{spaced:true}),
decode:(text)=>utf8.decode(hexToBytes(text)),
},
{
id:'escapes',
name:'codec.escapes.name',
note:'codec.escapes.note',
encode:escapeUnicode,
decode:unescapeUnicode,
},
];
export const codecById=(id)=>CODECS.find((codec)=>codec.id===id)??CODECS[0];
