/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const KINDS=[
{
id:'text',
name:'Text or a link',
note:'Anything at all. A web address is what a phone camera will offer to open.',
fields:[
{
id:'text',
label:'Text or web address',
type:'textarea',
placeholder:'https://abox.tools/',
},
],
},
{
id:'wifi',
name:'Wi-Fi network',
note:'Scanning it offers to join the network. Android reads this natively; '
+'so does the iPhone camera from iOS 11 onwards.',
fields:[
{id:'ssid',label:'Network name (SSID)',type:'text',placeholder:'The Coffee Shop'},
{id:'password',label:'Password',type:'text',placeholder:'',optional:true},
{
id:'security',
label:'Security',
type:'select',
options:[['WPA','WPA / WPA2 / WPA3'],['WEP','WEP'],['nopass','Open - no password']],
},
{id:'hidden',label:'The network is hidden',type:'checkbox',optional:true},
],
},
{
id:'contact',
name:'Contact card',
note:'A vCard, which is what a phone offers to save into its address book.',
fields:[
{id:'first',label:'First name',type:'text',placeholder:'Ada',optional:true},
{id:'last',label:'Last name',type:'text',placeholder:'Lovelace',optional:true},
{id:'org',label:'Organisation',type:'text',placeholder:'',optional:true},
{id:'title',label:'Job title',type:'text',placeholder:'',optional:true},
{id:'phone',label:'Phone',type:'tel',placeholder:'+44 20 7946 0000',optional:true},
{id:'email',label:'Email',type:'email',placeholder:'',optional:true},
{id:'url',label:'Website',type:'text',placeholder:'',optional:true},
{id:'address',label:'Address',type:'text',placeholder:'',optional:true},
],
},
{
id:'email',
name:'Email',
note:'Opens a new message with the address, and the subject and body if you fill them in.',
fields:[
{id:'to',label:'To',type:'email',placeholder:'hi@abox.tools'},
{id:'subject',label:'Subject',type:'text',placeholder:'',optional:true},
{id:'body',label:'Message',type:'textarea',placeholder:'',optional:true},
],
},
{
id:'sms',
name:'Text message',
note:'Opens a new message to that number, with the text ready to send.',
fields:[
{id:'number',label:'Phone number',type:'tel',placeholder:'+15551234567'},
{id:'message',label:'Message',type:'textarea',placeholder:'',optional:true},
],
},
{
id:'phone',
name:'Phone number',
note:'Offers to call the number.',
fields:[
{id:'number',label:'Phone number',type:'tel',placeholder:'+15551234567'},
],
},
{
id:'location',
name:'A place on the map',
note:'Opens the coordinates in whichever map application the phone uses.',
fields:[
{id:'latitude',label:'Latitude',type:'text',placeholder:'51.5007'},
{id:'longitude',label:'Longitude',type:'text',placeholder:'-0.1246'},
],
},
];
function wifiEscape(value){
return value.replace(/([\\;,:"])/g,'\\$1');
}
function vcardEscape(value){
return value.replace(/([\\;,])/g,'\\$1').replace(/\r?\n/g,'\\n');
}
export function compose(kind,values){
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
throw new RangeError(`no such kind: ${kind}`);
}
export function missing(kind,values){
const definition=KINDS.find((entry)=>entry.id===kind);
if(kind==='contact'){
const anything=definition.fields
.some((field)=>String(values[field.id]??'').trim());
return anything?[]:['At least one detail'];
}
return definition.fields
.filter((field)=>!field.optional&&field.type!=='checkbox'
&&!String(values[field.id]??'').trim())
.map((field)=>field.label);
}
