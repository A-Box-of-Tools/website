/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const KINDS=[
{
id:'text',
name:'kind.text.name',
note:'kind.text.note',
fields:[
{
id:'text',
label:'field.text',
type:'textarea',
placeholder:'https://abox.tools/',
},
],
},
{
id:'wifi',
name:'kind.wifi.name',
note:'kind.wifi.note',
fields:[
{
id:'ssid',label:'field.ssid',type:'text',placeholder:'field.ssid.example',
},
{id:'password',label:'field.password',type:'text',placeholder:'',optional:true},
{
id:'security',
label:'field.security',
type:'select',
options:[['WPA','field.wpa'],['WEP','field.wep'],['nopass','field.open']],
},
{id:'hidden',label:'field.hidden',type:'checkbox',optional:true},
],
},
{
id:'contact',
name:'kind.contact.name',
note:'kind.contact.note',
fields:[
{id:'first',label:'field.first',type:'text',placeholder:'Ada',optional:true},
{id:'last',label:'field.last',type:'text',placeholder:'Lovelace',optional:true},
{id:'org',label:'field.org',type:'text',placeholder:'',optional:true},
{id:'title',label:'field.title',type:'text',placeholder:'',optional:true},
{
id:'phone',label:'field.phone',type:'tel',placeholder:'+44 20 7946 0000',
optional:true,
},
{id:'email',label:'field.email',type:'email',placeholder:'',optional:true},
{id:'url',label:'field.url',type:'text',placeholder:'',optional:true},
{id:'address',label:'field.address',type:'text',placeholder:'',optional:true},
],
},
{
id:'email',
name:'kind.email.name',
note:'kind.email.note',
fields:[
{id:'to',label:'field.to',type:'email',placeholder:'hi@abox.tools'},
{id:'subject',label:'field.subject',type:'text',placeholder:'',optional:true},
{id:'body',label:'field.body',type:'textarea',placeholder:'',optional:true},
],
},
{
id:'sms',
name:'kind.sms.name',
note:'kind.sms.note',
fields:[
{id:'number',label:'field.number',type:'tel',placeholder:'+15551234567'},
{id:'message',label:'field.message',type:'textarea',placeholder:'',optional:true},
],
},
{
id:'phone',
name:'kind.phone.name',
note:'kind.phone.note',
fields:[
{id:'number',label:'field.number',type:'tel',placeholder:'+15551234567'},
],
},
{
id:'location',
name:'kind.location.name',
note:'kind.location.note',
fields:[
{id:'latitude',label:'field.latitude',type:'text',placeholder:'51.5007'},
{id:'longitude',label:'field.longitude',type:'text',placeholder:'-0.1246'},
],
},
];
function wifiEscape(value){
return value.replace(/([\\;,:"])/g,'\\$1');
}
function vcardEscape(value){
return value.replace(/([\\;,])/g,'\\$1').replace(/\r?\n/g,'\\n');
}
export function compose(kind,values,t){
const value=(id)=>String(values[id]??'').trim();
if(kind==='text')return String(values.text??'');
if(kind==='wifi'){
const security=value('security')||'WPA';
const parts=[`T:${security}`,`S:${wifiEscape(value('ssid'))}`];
if(security!=='nopass'&&value('password')){
parts.push(`P:${wifiEscape(value('password'))}`);
}
if(values.hidden)parts.push('H:true');
return`WIFI:${parts.join(';')};;`;
}
if(kind==='contact'){
const lines=['BEGIN:VCARD','VERSION:3.0'];
const first=vcardEscape(value('first'));
const last=vcardEscape(value('last'));
lines.push(`N:${last};${first};;;`);
const full=[value('first'),value('last')].filter(Boolean).join(' ');
if(full)lines.push(`FN:${vcardEscape(full)}`);
if(value('org'))lines.push(`ORG:${vcardEscape(value('org'))}`);
if(value('title'))lines.push(`TITLE:${vcardEscape(value('title'))}`);
if(value('phone'))lines.push(`TEL;TYPE=CELL:${vcardEscape(value('phone'))}`);
if(value('email'))lines.push(`EMAIL:${vcardEscape(value('email'))}`);
if(value('url'))lines.push(`URL:${vcardEscape(value('url'))}`);
if(value('address'))lines.push(`ADR:;;${vcardEscape(value('address'))};;;;`);
lines.push('END:VCARD');
return lines.join('\n');
}
if(kind==='email'){
const query=[];
if(value('subject'))query.push(`subject=${encodeURIComponent(value('subject'))}`);
if(value('body'))query.push(`body=${encodeURIComponent(value('body'))}`);
return`mailto:${value('to')}${query.length ? `?${query.join('&')}` : ''}`;
}
if(kind==='sms'){
const number=value('number').replace(/\s+/g,'');
return value('message')?`SMSTO:${number}:${values.message}`:`SMSTO:${number}`;
}
if(kind==='phone')return`tel:${value('number').replace(/\s+/g, '')}`;
if(kind==='location')return`geo:${value('latitude')},${value('longitude')}`;
throw new RangeError(t('payload.nosuch',{kind}));
}
export function missing(kind,values){
const definition=KINDS.find((entry)=>entry.id===kind);
if(kind==='contact'){
const anything=definition.fields
.some((field)=>String(values[field.id]??'').trim());
return anything?[]:['payload.anydetail'];
}
return definition.fields
.filter((field)=>!field.optional&&field.type!=='checkbox'
&&!String(values[field.id]??'').trim())
.map((field)=>field.label);
}
