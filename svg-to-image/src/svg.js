/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const DEFAULT_WIDTH=300;
export const DEFAULT_HEIGHT=150;
const UNITS={
'':1,
px:1,
pt:96/72,
pc:16,
in:96,
cm:96/2.54,
mm:96/25.4,
q:96/101.6,
};
export function looksLikeSvg(file){
return file?.type==='image/svg+xml'||/\.svgz?$/i.test(file?.name??'');
}
export function decodeSvgText(buffer){
const bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);
if(bytes[0]===0xff&&bytes[1]===0xfe)return decodeWith(bytes.subarray(2),'utf-16le');
if(bytes[0]===0xfe&&bytes[1]===0xff)return decodeWith(bytes.subarray(2),'utf-16be');
if(bytes[0]===0xef&&bytes[1]===0xbb&&bytes[2]===0xbf){
return decodeWith(bytes.subarray(3),'utf-8');
}
if(bytes[0]===0x3c&&bytes[1]===0x00)return decodeWith(bytes,'utf-16le');
if(bytes[0]===0x00&&bytes[1]===0x3c)return decodeWith(bytes,'utf-16be');
const head=decodeWith(bytes.subarray(0,200),'latin1');
const declared=/<\?xml[^>]*encoding\s*=\s*["']([\w-]+)["']/i.exec(head)?.[1];
if(declared&&!/^utf-?8$/i.test(declared)){
try{
return new TextDecoder(declared).decode(bytes);
}catch{
}
}
return decodeWith(bytes,'utf-8');
}
const decodeWith=(bytes,label)=>new TextDecoder(label).decode(bytes);
export function readRoot(text){
let at=skipProlog(text,0);
if(!/^<svg[\s/>]/i.test(text.slice(at,at+5)))return null;
const end=findTagEnd(text,at);
if(end<0)return null;
const inner=text.slice(at+4,text[end-1]==='/'?end-1:end);
const attrs={};
const spelling=new Map();
const pattern=/([:A-Za-z_][-.:\w]*)\s*=\s*("[^"]*"|'[^']*')/g;
for(let match=pattern.exec(inner);match;match=pattern.exec(inner)){
const key=match[1].toLowerCase();
attrs[key]=unescapeAttr(match[2].slice(1,-1));
spelling.set(key,match[1]);
}
return{attrs,spelling,start:at,end:end+1};
}
function skipProlog(text,at){
for(;;){
while(at<text.length&&/\s/.test(text[at]))at+=1;
if(text.startsWith('<?',at)){
const close=text.indexOf('?>',at);
if(close<0)return text.length;
at=close+2;
}else if(text.startsWith('<!--',at)){
const close=text.indexOf('-->',at);
if(close<0)return text.length;
at=close+3;
}else if(/^<!doctype/i.test(text.slice(at,at+9))){
at=skipDoctype(text,at);
}else{
return at;
}
}
}
function skipDoctype(text,at){
const bracket=text.indexOf('[',at);
const close=text.indexOf('>',at);
if(bracket>=0&&close>=0&&bracket<close){
const subset=text.indexOf(']',bracket);
if(subset<0)return text.length;
const after=text.indexOf('>',subset);
return after<0?text.length:after+1;
}
return close<0?text.length:close+1;
}
function findTagEnd(text,at){
let quote=null;
for(let i=at;i<text.length;i+=1){
const ch=text[i];
if(quote){
if(ch===quote)quote=null;
}else if(ch==='"'||ch==="'"){
quote=ch;
}else if(ch==='>'){
return i;
}
}
return-1;
}
export function parseLength(value){
if(value==null)return null;
const match=/^\s*([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)\s*([a-z%]*)\s*$/i.exec(String(value));
if(!match)return null;
const scale=UNITS[match[2].toLowerCase()];
if(scale===undefined)return null;
const px=Number(match[1])*scale;
return Number.isFinite(px)&&px>0?px:null;
}
export function parseViewBox(value){
if(!value)return null;
const parts=String(value).trim().split(/[\s,]+/);
if(parts.length!==4)return null;
const numbers=parts.map(Number);
if(numbers.some((n)=>!Number.isFinite(n)))return null;
const[x,y,width,height]=numbers;
if(width<=0||height<=0)return null;
return{x,y,width,height};
}
export function intrinsicSize(text){
const root=readRoot(text);
if(!root)return null;
const viewBox=parseViewBox(root.attrs.viewbox);
const width=parseLength(root.attrs.width);
const height=parseLength(root.attrs.height);
const answer=(w,h,source)=>({
width:round(w),
height:round(h),
ratio:w/h,
source,
viewBox,
});
if(width&&height)return answer(width,height,'attributes');
const boxRatio=viewBox?viewBox.width/viewBox.height:null;
if(width&&boxRatio)return answer(width,width/boxRatio,'mixed');
if(height&&boxRatio)return answer(height*boxRatio,height,'mixed');
if(viewBox)return answer(viewBox.width,viewBox.height,'viewbox');
if(width)return answer(width,DEFAULT_HEIGHT,'mixed');
if(height)return answer(DEFAULT_WIDTH,height,'mixed');
return answer(DEFAULT_WIDTH,DEFAULT_HEIGHT,'default');
}
const round=(n)=>Math.max(1,Math.round(n*1000)/1000);
export function sizedSvg(text,width,height,{stretch=false}={}){
const root=readRoot(text);
if(!root)throw new Error('there is no <svg> element in this file.');
const attrs={...root.attrs};
const size=intrinsicSize(text);
if(!parseViewBox(attrs.viewbox)){
attrs.viewbox=`0 0 ${size.width} ${size.height}`;
}
if(!attrs.xmlns)attrs.xmlns='http://www.w3.org/2000/svg';
if(stretch)attrs.preserveaspectratio='none';
attrs.width=String(width);
attrs.height=String(height);
return text.slice(0,root.start)+renderRoot(attrs,root.spelling)+text.slice(root.end);
}
const CANONICAL={
viewbox:'viewBox',
preserveaspectratio:'preserveAspectRatio',
};
function renderRoot(attrs,spelling){
const written=Object.entries(attrs).map(([key,value])=>{
const name=spelling.get(key)??CANONICAL[key]??key;
return`${name}="${escapeAttr(value)}"`;
});
return`<svg ${written.join(' ')}>`;
}
function unescapeAttr(value){
return value
.replace(/&lt;/g,'<')
.replace(/&gt;/g,'>')
.replace(/&quot;/g,'"')
.replace(/&apos;/g,"'")
.replace(/&amp;/g,'&');
}
function escapeAttr(value){
return String(value)
.replace(/&/g,'&amp;')
.replace(/</g,'&lt;')
.replace(/>/g,'&gt;')
.replace(/"/g,'&quot;');
}
