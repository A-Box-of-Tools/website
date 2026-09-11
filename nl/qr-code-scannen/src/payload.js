/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const OPENABLE=new Set(['http:','https:','mailto:','tel:','sms:','geo:']);
const SHORTENERS=new Set([
'bit.ly','tinyurl.com','t.co','goo.gl','ow.ly','is.gd','buff.ly',
'rebrand.ly','cutt.ly','shorturl.at','rb.gy','lnkd.in','qrco.de',
'qrs.ly','linktr.ee','tiny.cc','s.id',
]);
function fields(body){
const out=new Map();
let key='';
let value='';
let inKey=true;
for(let i=0;i<body.length;i+=1){
const character=body[i];
if(character==='\\'&&i+1<body.length){
value+=body[i+1];
i+=1;
}else if(character===':'&&inKey){
inKey=false;
}else if(character===';'){
if(key)out.set(key.toUpperCase(),value);
key='';
value='';
inKey=true;
}else if(inKey){
key+=character;
}else{
value+=character;
}
}
if(key)out.set(key.toUpperCase(),value);
return out;
}
function vcard(text){
const out=new Map();
for(const line of text.replace(/\r?\n[ \t]/g,'').split(/\r?\n/)){
const split=line.indexOf(':');
if(split<0)continue;
const name=line.slice(0,split).split(';')[0].toUpperCase();
const value=line.slice(split+1);
if(!out.has(name)&&value)out.set(name,value);
}
return out;
}
const row=(key,value,extra={})=>({key,value,...extra});
function aboutUrl(text){
let url;
try{
url=new URL(text);
}catch{
return null;
}
const host=url.hostname;
const warnings=[];
if(url.username||url.password){
warnings.push({key:'warn.userinfo',values:{host}});
}
if(host.startsWith('xn--')||host.includes('.xn--')){
warnings.push({key:'warn.punycode',values:{host}});
}else if(/[^ -~]/.test(host)){
warnings.push({key:'warn.unicode-host',values:{host}});
}
if(url.protocol==='http:')warnings.push({key:'warn.plain-http',values:{}});
if(SHORTENERS.has(host.toLowerCase().replace(/^www\./,''))){
warnings.push({key:'warn.shortener',values:{host}});
}
const rows=[row('field.host',host,{emphasis:true})];
if(url.port)rows.push(row('field.port',url.port));
rows.push(row('field.path',`${url.pathname}${url.search}${url.hash}`));
return{
kind:'url',
kindKey:url.protocol==='https:'?'kind.url':'kind.url-plain',
rows,
warnings,
link:{href:url.href,host},
};
}
function aboutWifi(text){
const map=fields(text.slice(5));
const security=(map.get('T')||'nopass').toUpperCase();
const named={WPA:'WPA/WPA2',WPA2:'WPA2',WPA3:'WPA3',WEP:'WEP'}[security];
const rows=[row('field.ssid',map.get('S')??'',{emphasis:true})];
rows.push(named
?row('field.security',named)
:row('field.security','',{phrase:'value.open-network'}));
if(map.get('P'))rows.push(row('field.password',map.get('P'),{secret:true}));
if(map.get('H')==='true')rows.push(row('field.hidden','',{phrase:'value.yes'}));
return{
kind:'wifi',
kindKey:'kind.wifi',
rows,
warnings:[{key:'warn.wifi-secret',values:{}}],
link:null,
};
}
function aboutContact(text){
const isVcard=/^BEGIN:VCARD/i.test(text);
const rows=[];
if(isVcard){
const card=vcard(text);
const name=card.get('FN')
??(card.get('N')??'').split(';').filter(Boolean).reverse().join(' ');
if(name.trim())rows.push(row('field.name',name.trim(),{emphasis:true}));
for(const[tag,key]of[['ORG','field.org'],['TITLE','field.title'],
['TEL','field.phone'],['EMAIL','field.email'],['URL','field.web'],
['ADR','field.address']]){
const value=card.get(tag);
if(value)rows.push(row(key,value.replace(/;+/g,' ').trim()));
}
}else{
const map=fields(text.slice(7));
const name=(map.get('N')??'').split(',').reverse().join(' ').trim();
if(name)rows.push(row('field.name',name,{emphasis:true}));
for(const[tag,key]of[['ORG','field.org'],['TEL','field.phone'],
['EMAIL','field.email'],['URL','field.web'],['ADR','field.address'],
['NOTE','field.note']]){
const value=map.get(tag);
if(value)rows.push(row(key,value));
}
}
return{
kind:'contact',
kindKey:isVcard?'kind.vcard':'kind.mecard',
rows,
warnings:[],
link:null,
};
}
function aboutEmail(text){
if(/^MATMSG:/i.test(text)){
const map=fields(text.slice(7));
const to=map.get('TO')??'';
return{
kind:'email',
kindKey:'kind.email',
rows:[
row('field.to',to,{emphasis:true}),
row('field.subject',map.get('SUB')??''),
row('field.message',map.get('BODY')??''),
].filter((entry)=>entry.value),
warnings:[],
link:to?{href:`mailto:${to}`,host:to}:null,
};
}
let url;
try{
url=new URL(text);
}catch{
return null;
}
const to=decodeURIComponent(url.pathname);
const rows=[row('field.to',to,{emphasis:true})];
for(const[name,key]of[['subject','field.subject'],['body','field.message']]){
const value=url.searchParams.get(name);
if(value)rows.push(row(key,value));
}
return{
kind:'email',
kindKey:'kind.email',
rows,
warnings:[],
link:{href:url.href,host:to},
};
}
function aboutSimple(text){
const lower=text.toLowerCase();
if(lower.startsWith('tel:')){
const number=text.slice(4);
return{
kind:'phone',
kindKey:'kind.phone',
rows:[row('field.number',number,{emphasis:true})],
warnings:[],
link:{href:`tel:${number}`,host:number},
};
}
if(lower.startsWith('smsto:')||lower.startsWith('sms:')){
const body=text.slice(text.indexOf(':')+1);
const split=body.indexOf(':');
const number=split<0?body:body.slice(0,split);
const message=split<0?'':body.slice(split+1);
return{
kind:'sms',
kindKey:'kind.sms',
rows:[
row('field.to',number,{emphasis:true}),
...(message?[row('field.message',message)]:[]),
],
warnings:[],
link:{href:`sms:${number}`,host:number},
};
}
if(lower.startsWith('geo:')){
const[coordinates]=text.slice(4).split('?');
const[latitude,longitude]=coordinates.split(',');
return{
kind:'place',
kindKey:'kind.place',
rows:[
row('field.latitude',latitude??'',{emphasis:true}),
row('field.longitude',longitude??'',{emphasis:true}),
],
warnings:[],
link:{href:text,host:coordinates},
};
}
return null;
}
function aboutOtp(text){
let url;
try{
url=new URL(text);
}catch{
return null;
}
return{
kind:'otp',
kindKey:'kind.otp',
rows:[
row('field.account',decodeURIComponent(url.pathname.replace(/^\/+/,'')),
{emphasis:true}),
row('field.issuer',url.searchParams.get('issuer')??''),
row('field.secret',url.searchParams.get('secret')??'',{secret:true}),
].filter((entry)=>entry.value),
warnings:[{key:'warn.otp-secret',values:{}}],
link:null,
};
}
export function describe(text){
const trimmed=text.trim();
const lower=trimmed.toLowerCase();
const found=lower.startsWith('wifi:')?aboutWifi(trimmed)
:lower.startsWith('begin:vcard')||lower.startsWith('mecard:')?aboutContact(trimmed)
:lower.startsWith('mailto:')||lower.startsWith('matmsg:')?aboutEmail(trimmed)
:lower.startsWith('otpauth://')?aboutOtp(trimmed)
:lower.startsWith('http://')||lower.startsWith('https://')?aboutUrl(trimmed)
:aboutSimple(trimmed);
if(found)return{payload:found};
const scheme=/^([a-z][a-z0-9+.-]*):/i.exec(trimmed);
if(scheme&&!OPENABLE.has(`${scheme[1].toLowerCase()}:`)){
return{
payload:{
kind:'other-scheme',
kindKey:'kind.other-scheme',
rows:[row('field.scheme',`${scheme[1].toLowerCase()}:`,{emphasis:true})],
warnings:[{key:'warn.not-openable',values:{}}],
link:null,
},
};
}
const digits=/^[0-9]+$/.test(trimmed);
return{
payload:{
kind:digits?'number':'text',
kindKey:digits?'kind.number':'kind.text',
rows:[],
warnings:[],
link:null,
},
};
}
