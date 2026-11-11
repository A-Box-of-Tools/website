/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const encoder=new TextEncoder();
const controls=/[\x00-\x1f\x7f-\x9f]/;
const mediaType=/^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/;
function mailbox(value){
const raw=String(value??'');
if(controls.test(raw))throw new Error('email.invalid');
const address=raw.trim();
if(!address)return'';
if(address.length>254)throw new Error('email.invalid');
const parts=address.split('@');
if(parts.length!==2||parts[0].length>64
||!/^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*$/.test(parts[0])){
throw new Error('email.invalid');
}
const labels=parts[1].split('.');
if(labels.length<2||labels.some(label=>!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/.test(label))){
throw new Error('email.invalid');
}
return address;
}
function base64(bytes){
const chunks=[];
for(let offset=0;offset<bytes.length;offset+=24576){
chunks.push(btoa(String.fromCharCode(...bytes.subarray(offset,offset+24576))));
}
return chunks.join('');
}
function base64Lines(bytes){
const encoded=base64(bytes);
const lines=[];
for(let offset=0;offset<encoded.length;offset+=76)lines.push(encoded.slice(offset,offset+76));
return lines.join('\r\n');
}
function subjectHeader(value){
const subject=String(value??'');
if(controls.test(subject))throw new Error('email.invalid');
const words=[];
let bytes=[];
for(const character of subject){
const next=encoder.encode(character);
if(bytes.length+next.length>39){
words.push(`=?UTF-8?B?${base64(new Uint8Array(bytes))}?=`);
bytes=[];
}
bytes.push(...next);
}
if(bytes.length)words.push(`=?UTF-8?B?${base64(new Uint8Array(bytes))}?=`);
return`Subject: ${words.join('\r\n ')}`;
}
function safeFilename(value,fallback){
const leaf=String(value??'').split(/[\\/]/).pop()
.replace(/[\x00-\x1f\x7f-\x9f]/g,'').trim();
return!leaf||leaf==='.'||leaf==='..'?fallback:leaf;
}
function disposition(filename){
const fallback=filename.replace(/[^A-Za-z0-9._ -]/g,'_').slice(0,48)||'attachment';
const bytes=encoder.encode(filename);
const segments=[];
for(let offset=0;offset<bytes.length;offset+=15){
segments.push(Array.from(bytes.subarray(offset,offset+15),byte=>`%${byte.toString(16).toUpperCase().padStart(2, '0')}`).join(''));
}
const parameters=[`filename="${fallback}"`,...segments.map((value,index)=>`filename*${index}*=${index === 0 ? "UTF-8''" : ''}${value}`)];
return`Content-Disposition: attachment;\r\n ${parameters.join(';\r\n ')}`;
}
async function attachmentPart(attachment,index){
if(!attachment||typeof attachment!=='object')throw new Error('email.invalid');
const filename=safeFilename(attachment.filename??attachment.name,`attachment-${index + 1}`);
const type=String(attachment.type||'application/octet-stream');
if(controls.test(type)||!mediaType.test(type))throw new Error('email.invalid');
let bytes;
if(attachment instanceof Blob){
try{bytes=new Uint8Array(await attachment.arrayBuffer());}
catch{throw new Error('email.failed');}
}else if(attachment.bytes instanceof Uint8Array){
bytes=attachment.bytes;
}else if(attachment.bytes instanceof ArrayBuffer){
bytes=new Uint8Array(attachment.bytes);
}else{
throw new Error('email.invalid');
}
return[`Content-Type: ${type}`,'Content-Transfer-Encoding: base64',disposition(filename),'',base64Lines(bytes)].join('\r\n');
}
export async function buildEmailDraft({to='',subject='',body='',attachments=[],filename='receipt-invoice-email.eml'}={}){
const recipient=mailbox(to);
const title=subjectHeader(subject);
if(!Array.isArray(attachments))throw new Error('email.invalid');
const boundary=`=_abox_${crypto.randomUUID()}`;
const parts=[];
const message=String(body??'').replace(/\r\n|\r|\n/g,'\r\n');
parts.push(['Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: base64','',base64Lines(encoder.encode(message))].join('\r\n'));
for(let index=0;index<attachments.length;index++)parts.push(await attachmentPart(attachments[index],index));
const headers=[
'X-Unsent: 1',
`Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
...(recipient?[`To: ${recipient}`]:[]),
title,
'MIME-Version: 1.0',
'Content-Type: multipart/mixed;',
` boundary="${boundary}"`,
];
const content=`${headers.join('\r\n')}\r\n\r\n${parts.map(part => `--${boundary}\r\n${part}\r\n`).join('')}--${boundary}--\r\n`;
let outputName=safeFilename(filename,'receipt-invoice-email.eml');
if(!/\.eml$/i.test(outputName))outputName+='.eml';
return new File([content],outputName,{type:'message/rfc822'});
}
