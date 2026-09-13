/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const WORDS={
paper:/\bpaper\b|\bsheet\b|相纸|相紙|冲印|沖印/g,
headWidth:/head\s+width|width\s+of\s+(?:the\s+)?(?:head|face)|face\s+width|头部宽度?|頭部寬度?|头宽|頭寬|脸宽|臉寬|面部宽度?|面部寬度?/g,
margin:/(?:top|bottom)\s+of\s+(?:the\s+)?(?:photo|picture|image|frame)|above\s+the\s+head|chin\s+to\s+(?:the\s+)?bottom|\bmargins?\b|(?:头顶|頭頂)(?:距|到|至)(?:照片|相片)?上|(?:下巴|下颌|下頜)(?:距|到|至)(?:照片|相片)?下|上边[缘沿]|上邊[緣沿]|下边[缘沿]|下邊[緣沿]|边距|邊距/g,
head:/(?:head|face|chin)\s+(?:height|size|length)|height\s+of\s+(?:the\s+)?(?:head|face)|chin\s+to\s+(?:the\s+)?(?:top|crown)|crown\s+to\s+(?:the\s+)?chin|top\s+of\s+(?:the\s+)?head|\bhead\b|\bface\b|头部(?:长度|高度|长|高)?|頭部(?:長度|高度|長|高)?|头(?:长|高)度?|頭(?:長|高)度?|(?:头顶|頭頂)(?:至|到)(?:下巴|下颌|下頜)|(?:下巴|下颌|下頜)(?:至|到)(?:头顶|頭頂)|面部(?:长度|高度|長度)/g,
eye:/\beyes?\b|eye\s+line|眼睛|双眼|雙眼|眼部|瞳孔/g,
width:/\bwide\b|\bwidth\b|宽度?|寬度?/g,
height:/\bhigh\b|\bheight\b|\btall\b|高度?|长度?|長度?/g,
};
const PRIORITY=['paper','headWidth','margin','head','eye','width','height'];
const POSTFIX=Object.fromEntries(PRIORITY.map((name)=>[
name,new RegExp(`^\\s*\\(?\\s*(?:${WORDS[name].source})`),
]));
const LABELS_NEXT=/^\s*\)?\s*[:=\d]/;
const PAPER_REACH=12;
const MOST=/no\s+(?:more|larger|bigger|greater)\s+than|not\s+(?:more|larger|bigger|greater)\s+than|(?:not\s+)?exceed\w*|\bat\s+most\b|\bup\s+to\b|\bmaximum\b|\bmax\b|less\s+than|smaller\s+than|\bunder\b|\bbelow\b|≤|<=|不超过|不超過|不大于|不大於|小于|小於|最大|上限|低于|低於/g;
const LEAST=/\bat\s+least\b|no\s+(?:less|smaller)\s+than|not\s+(?:less|smaller)\s+than|\bminimum\b|\bmin\b|more\s+than|greater\s+than|larger\s+than|\babove\b|\bover\b|≥|>=|不小于|不小於|不低于|不低於|大于|大於|最小|下限|至少/g;
const MOST_AFTER=/^\s*(?:或?以下|或?以内|或?以內|or\s+(?:less|smaller|below|under)|at\s+most|max(?:imum)?\b)/;
const LEAST_AFTER=/^\s*(?:或?以上|or\s+(?:more|larger|above|greater|over)|at\s+least|min(?:imum)?\b)/;
const COLOURS=[
{key:'off-white',pattern:/off[\s-]?white|米白|乳白/},
{key:'cream',pattern:/\bcream\b|米色|奶油色/},
{key:'light-grey',pattern:/(?:light|pale)\s+gr[ae]y|\bgr[ae]y\b|浅灰|淺灰|淡灰|灰色|灰底/},
{key:'white',pattern:/\bwhite\b|白色|白底|纯白|純白|白背景/},
{key:null,pattern:/(?:light|pale|sky)\s+blue|\bblue\b|浅蓝|淺藍|淡蓝|淡藍|天蓝|天藍|蓝色|藍色|蓝底|藍底/},
{key:null,pattern:/\bred\b|红色|紅色|红底|紅底/},
];
const BACKGROUND=/background|backdrop|背景|底色|[白蓝藍红紅灰]底/g;
const NAMED=/(?<![\d.])(?:小|大)?[一二两兩12](?:寸|吋)/g;
const FILE_WORDS=/\bfile\b|\bsize\b|大小|文件|体积|體積|容量/;
const UNITS={
mm:/mm|millimet(?:er|re)s?|毫米/,
cm:/cm|centimet(?:er|re)s?|厘米|公分/,
inch:/inch(?:es)?|in\b|"|″|英寸|英吋/,
dpi:/dpi|ppi|pixels?\s+per\s+inch|像素\/英寸/,
px:/px|pixels?|像素/,
kb:/kb|kib|kbytes?|kilobytes?|千字节|千字節|k(?![a-z])/,
mb:/mb|mib|megabytes?|兆字节|兆字節|兆/,
m:/m(?![a-z])/,
};
const MM_PER={mm:1,cm:10,inch:25.4};
const NUMBER=/\d+\s+\d\/\d{1,2}|\d\/\d{1,2}|\d+(?:[.,]\d+)?/.source;
const TIMES=/x|by|乘/.source;
const LABEL=/\([^()]{1,8}\)/.source;
const BETWEEN=/between|从|從|在|介于|介於/.source;
const BETWEEN_AND=/and|-|~|to|和|与|與|至|到/.source;
const RANGE_MARK=/-|~|to|至|到/.source;
const unit=(prefix)=>Object.entries(UNITS)
.map(([name,pattern])=>`(?<${prefix}${name}>${pattern.source})`).join('|');
const A_SIDE=`(?<a>${NUMBER})\\s*(?:${unit('a')})?`;
const B_SIDE=`(?<b>${NUMBER})\\s*(?:${unit('')})`;
const SHAPES=[
{shape:'pair',pattern:new RegExp(`${A_SIDE}\\s*(?:${LABEL})?\\s*(?:${TIMES})\\s*${B_SIDE}`,'g')},
{shape:'range',pattern:new RegExp(`(?:${BETWEEN})\\s*${A_SIDE}\\s*(?:${BETWEEN_AND})\\s*${B_SIDE}`,'g')},
{shape:'range',pattern:new RegExp(`${A_SIDE}\\s*(?:${RANGE_MARK})\\s*${B_SIDE}`,'g')},
{shape:'single',pattern:new RegExp(B_SIDE,'g')},
];
const CLAUSE=/[\n。;!?•]|\.\s/g;
export function readRequirements(text){
const source=normalise(String(text??''));
const measures=findMeasures(source);
const reading={values:{},found:[],notes:[],unused:[]};
placeSizes(source,measures,reading);
placeHead(measures,reading);
placeSimple(measures,reading);
placeBackground(source,reading);
dropRestatements(measures,reading);
for(const m of measures){
if(!m.used&&!m.noted){
reading.unused.push({from:m.from,to:m.to,key:WHY[m.word]??'read.unused.other'});
}
}
return reading;
}
const WHY={
paper:'read.unused.paper',
headWidth:'read.unused.headwidth',
eye:'read.unused.eye',
margin:'read.unused.margin',
};
export function normalise(text){
let out='';
for(const ch of text){
if(ch.length>1){out+=ch;continue;}
const code=ch.charCodeAt(0);
let c=code>=0xff01&&code<=0xff5e?String.fromCharCode(code-0xfee0):ch;
if(c==='　'||c===' ')c=' ';
else if('×✕✖*'.includes(c))c='x';
else if('‐‑‒–—―−'.includes(c))c='-';
else if(c==='〜')c='~';
else if(c==='“'||c==='”')c='"';
const lower=c.toLowerCase();
out+=lower.length===1?lower:c;
}
return out;
}
function findMeasures(text){
const taken=new Uint8Array(text.length);
const out=[];
for(const{shape,pattern}of SHAPES){
pattern.lastIndex=0;
for(const match of text.matchAll(pattern)){
const from=match.index;
const to=from+match[0].length;
if(taken.subarray(from,to).some(Boolean))continue;
let name=unitOf(match.groups,'');
if(name==='m'){
if(!FILE_WORDS.test(text.slice(clauseStart(text,from),clauseEnd(text,to))))continue;
name='mb';
}
const b=numberOf(match.groups.b);
let a=shape==='single'?b:numberOf(match.groups.a);
const aName=unitOf(match.groups,'a');
if(aName&&aName!==name){
if(!MM_PER[aName]||!MM_PER[name])continue;
a=(a*MM_PER[aName])/MM_PER[name];
}
if(!Number.isFinite(a)||!Number.isFinite(b))continue;
taken.fill(1,from,to);
out.push({shape,unit:name,a,b,from,to});
}
}
out.sort((x,y)=>x.from-y.from);
for(const[index,m]of out.entries()){
const start=Math.max(index>0?out[index-1].to:0,clauseStart(text,m.from));
const end=Math.min(index+1<out.length?out[index+1].from:text.length,
clauseEnd(text,m.to));
const before=text.slice(start,m.from);
const after=text.slice(m.to,end);
m.word=keyword(before,after);
m.bound=bound(before,after);
}
return out;
}
function unitOf(groups,prefix){
for(const name of Object.keys(UNITS)){
if(groups[prefix+name]!==undefined)return name;
}
return null;
}
function numberOf(text){
if(text===undefined)return NaN;
const mixed=/^(?:(\d+)\s+)?(\d)\/(\d{1,2})$/.exec(text);
if(mixed)return Number(mixed[1]??0)+Number(mixed[2])/Number(mixed[3]);
if(/^\d{1,3}(?:,\d{3})+$/.test(text))return Number(text.replace(/,/g,''));
return Number(text.replace(',','.'));
}
function clauseStart(text,at){
let start=0;
CLAUSE.lastIndex=0;
for(const match of text.matchAll(CLAUSE)){
if(match.index+match[0].length>at)break;
start=match.index+match[0].length;
}
return start;
}
function clauseEnd(text,at){
const found=text.slice(at).search(CLAUSE);
return found<0?text.length:at+found;
}
function lastOf(pattern,text){
pattern.lastIndex=0;
let found=null;
for(const match of text.matchAll(pattern)){
const end=match.index+match[0].length;
if(!found||end>found.end||(end===found.end&&match.index<found.start)){
found={start:match.index,end};
}
}
return found;
}
function keyword(before,after){
let best=null;
for(const name of PRIORITY){
const match=POSTFIX[name].exec(after);
if(!match||LABELS_NEXT.test(after.slice(match[0].length)))continue;
if(!best||match[0].length>best.length)best={name,length:match[0].length};
}
if(best)return best.name;
for(const name of PRIORITY){
const found=lastOf(WORDS[name],before);
if(found&&(!best||found.end>best.end))best={name,end:found.end};
}
if(best)return best.name;
for(const name of PRIORITY){
const at=after.search(WORDS[name]);
if(at<0||(name==='paper'&&at>PAPER_REACH))continue;
if(!best||at<best.at)best={name,at};
}
return best?.name??null;
}
function bound(before,after){
if(MOST_AFTER.test(after))return'most';
if(LEAST_AFTER.test(after))return'least';
const most=lastOf(MOST,before);
const least=lastOf(LEAST,before);
if(!most&&!least)return null;
if(!least)return'most';
if(!most)return'least';
if(most.end!==least.end)return most.end>least.end?'most':'least';
return most.start<least.start?'most':'least';
}
const tenth=(value)=>Math.round(value*10)/10;
const span=({from,to})=>({from,to});
function fill(reading,field,value,m){
reading.values[field]=value;
reading.found.push({field,value,from:m.from,to:m.to});
m.used=true;
}
function orient(a,b){
return a<=b?{w:a,h:b}:{w:b,h:a};
}
function placeSizes(text,measures,reading){
const printed=measures.filter((m)=>m.shape==='pair'&&MM_PER[m.unit]&&m.word!=='paper');
const sizes=[];
for(const m of printed){
const size=orient(m.a*MM_PER[m.unit],m.b*MM_PER[m.unit]);
const same=sizes.find((s)=>Math.abs(s.w-size.w)<=1&&Math.abs(s.h-size.h)<=1);
if(!same)sizes.push({...size,m,all:[m]});
else{
same.all.push(m);
if(m.unit==='mm'&&same.m.unit!=='mm')Object.assign(same,size,{m});
}
}
if(sizes.length===1){
const[{w,h,m,all}]=sizes;
fill(reading,'widthMm',tenth(w),m);
fill(reading,'heightMm',tenth(h),m);
for(const other of all)other.used=true;
}else if(sizes.length>1){
reading.notes.push({key:'read.sizes',spans:sizes.map(({m})=>span(m))});
for(const s of sizes)for(const m of s.all)m.noted=true;
}else{
for(const[field,word]of[['widthMm','width'],['heightMm','height']]){
const m=measures.find((x)=>x.shape==='single'&&MM_PER[x.unit]&&x.word===word);
if(m)fill(reading,field,tenth(m.b*MM_PER[m.unit]),m);
}
}
if(reading.values.widthMm===undefined&&reading.values.heightMm===undefined){
NAMED.lastIndex=0;
const named=[...text.matchAll(NAMED)].map((match)=>({
from:match.index,to:match.index+match[0].length,
}));
if(named.length)reading.notes.push({key:'read.named',spans:named});
}
const pixels=measures.filter((m)=>m.shape==='pair'&&m.unit==='px');
if(pixels.length){
const smallest=pixels.reduce((x,y)=>(x.a*x.b<=y.a*y.b?x:y));
const{w,h}=orient(smallest.a,smallest.b);
fill(reading,'pxWidth',Math.round(w),smallest);
fill(reading,'pxHeight',Math.round(h),smallest);
if(pixels.some((m)=>m.a*m.b!==smallest.a*smallest.b)){
reading.notes.push({key:'read.pxrange',spans:pixels.map(span)});
}
for(const m of pixels)m.used=true;
}else{
for(const[field,word]of[['pxWidth','width'],['pxHeight','height']]){
const m=measures.find((x)=>x.shape==='single'&&x.unit==='px'&&x.word===word);
if(m)fill(reading,field,Math.round(m.b),m);
}
}
}
function placeHead(measures,reading){
const heads=measures.filter((m)=>MM_PER[m.unit]&&!m.used&&m.word==='head');
const ranges=heads.filter((m)=>m.shape==='range');
const range=ranges.find((m)=>m.unit==='mm')??ranges.find((m)=>m.unit==='cm')??ranges[0];
if(range){
const scale=MM_PER[range.unit];
fill(reading,'headMinMm',tenth(Math.min(range.a,range.b)*scale),range);
fill(reading,'headMaxMm',tenth(Math.max(range.a,range.b)*scale),range);
return;
}
for(const m of heads.filter((x)=>x.shape==='single')){
const mm=tenth(m.b*MM_PER[m.unit]);
const{headMinMm:min,headMaxMm:max}=reading.values;
if(m.bound==='least'&&min===undefined)fill(reading,'headMinMm',mm,m);
else if(m.bound==='most'&&max===undefined)fill(reading,'headMaxMm',mm,m);
else if(!m.bound&&min===undefined&&max===undefined){
fill(reading,'headMinMm',mm,m);
fill(reading,'headMaxMm',mm,m);
}
}
}
function placeSimple(measures,reading){
const dpi=measures.find((m)=>m.unit==='dpi');
if(dpi)fill(reading,'dpi',Math.round(Math.min(dpi.a,dpi.b)),dpi);
for(const m of measures.filter((x)=>x.unit==='kb'||x.unit==='mb')){
const scale=m.unit==='mb'?1024:1;
if(m.shape==='range'){
if(reading.values.minKb===undefined)fill(reading,'minKb',Math.round(Math.min(m.a,m.b)*scale),m);
if(reading.values.maxKb===undefined)fill(reading,'maxKb',Math.round(Math.max(m.a,m.b)*scale),m);
continue;
}
const field=m.bound==='least'?'minKb':'maxKb';
if(reading.values[field]===undefined)fill(reading,field,Math.round(m.b*scale),m);
}
}
function placeBackground(text,reading){
const clauses=new Map();
BACKGROUND.lastIndex=0;
for(const match of text.matchAll(BACKGROUND)){
const from=clauseStart(text,match.index);
if(!clauses.has(from))clauses.set(from,clauseEnd(text,match.index+match[0].length));
}
const named=[];
for(const[from,to]of clauses){
let rest=text.slice(from,to);
for(const colour of COLOURS){
for(;;){
const match=colour.pattern.exec(rest);
if(!match)break;
named.push({key:colour.key,from:from+match.index,to:from+match.index+match[0].length});
rest=rest.slice(0,match.index)+' '.repeat(match[0].length)+rest.slice(match.index+match[0].length);
}
}
}
if(!named.length)return;
named.sort((x,y)=>x.from-y.from);
const checkable=named.filter((n)=>n.key);
if(!checkable.length){
reading.notes.push({key:'read.colour',spans:named.map(span)});
return;
}
const keys=new Set(checkable.map((n)=>n.key));
let key=checkable[0].key;
if(keys.size===2&&keys.has('white')&&keys.has('off-white'))key='off-white';
else if(keys.size===2&&keys.has('light-grey')&&keys.has('cream'))key='cream';
const at=checkable.find((n)=>n.key===key)??checkable[0];
reading.values.background=key;
reading.found.push({field:'background',value:key,from:at.from,to:at.to});
}
function dropRestatements(measures,reading){
const v=reading.values;
const defined=(list)=>list.filter((x)=>x!==undefined);
const lengths=defined([v.widthMm,v.heightMm,v.headMinMm,v.headMaxMm]);
const near=(list,value,within)=>list.some((x)=>Math.abs(x-value)<=within);
for(const m of measures){
if(m.used||m.noted)continue;
const values=m.shape==='single'?[m.b]:[m.a,m.b];
if(MM_PER[m.unit]){
if(values.every((x)=>near(lengths,x*MM_PER[m.unit],1)))m.used=true;
}else if(m.unit==='px'){
if(values.every((x)=>near(defined([v.pxWidth,v.pxHeight]),x,0)))m.used=true;
}else if(m.unit==='kb'||m.unit==='mb'){
const scale=m.unit==='mb'?1024:1;
if(values.every((x)=>near(defined([v.minKb,v.maxKb]),x*scale,1)))m.used=true;
}else if(m.unit==='dpi'){
m.used=true;
}
}
}
