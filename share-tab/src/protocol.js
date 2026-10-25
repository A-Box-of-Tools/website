/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{CODE_PATTERN as ROOM_CODE_PATTERN}from'./shared/room-names.js?v=ea23015c25';
import{transportUrl}from'./shared/peer-transport.js?v=ea23015c25';
import{validAdmissionToken}from'./shared/peer-admission.js?v=ea23015c25';
export const TOOL='share-tab';
export const PROTOCOL='share-tab-v1';
export const CHANNEL='share-tab-control';
export const CODE_PATTERN=/^tab-[a-z2-7]{16}$/;
export function makeCode(random=globalThis.crypto){
const alphabet='abcdefghijklmnopqrstuvwxyz234567';
const bytes=random.getRandomValues(new Uint8Array(16));
return`tab-${Array.from(bytes, (byte) => alphabet[byte & 31]).join('')}`;
}
export function parseCode(value){
if(typeof value!=='string'||value.length>2048)return null;
let code=value.trim();
if(/^https?:\/\//i.test(code)){
try{code=new URL(code).hash.slice(1);}catch{return null;}
}
code=code.replace(/^#/,'').toLowerCase();
return ROOM_CODE_PATTERN.test(code)&&CODE_PATTERN.test(code)?code:null;
}
export function viewerLink(href,code,transport='direct'){
if(typeof code!=='string'||!CODE_PATTERN.test(code))throw new Error('code.invalid');
const url=new URL(href);
url.search='';
url.hash=code;
return transportUrl(url.href,transport);
}
export function controlMessage(text){
if(typeof text!=='string'||text.length>1024)return null;
try{
const value=JSON.parse(text);
if(!value||value.protocol!==PROTOCOL||Array.isArray(value))return null;
if(!['hello','request','approved','approval-ack','denied','busy','ended'].includes(value.type))return null;
if(value.type==='request'&&(typeof value.note!=='string'||value.note.length>80))return null;
if(value.token!==undefined&&(!['request','approved'].includes(value.type)||!validAdmissionToken(value.token)))return null;
return value;
}catch{return null;}
}
