/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{inferLocationCurrency}from'./location-currency.js?v=6839eb22c4';
const CODES='USD CAD AUD NZD EUR GBP INR CHF JPY CNY HKD SGD KRW BRL MXN ZAR SEK NOK DKK PLN CZK HUF RON TRY ILS AED SAR THB MYR IDR PHP TWD VND BDT PKR LKR NPR NGN KES UAH RUB';
const KNOWN_CODES=new Set(CODES.split(' '));
const CODE=new RegExp(`\\b(?:${CODES.split(' ').join('|')})\\b`,'gi');
const MARKER=new RegExp(`^(?:(?:${CODES.split(' ').join('|')})\\b|(?:US|CA|AU|NZ|HK|SG|C|A)?\\$|[€£¥₹])\\s*|\\s*(?:(?:${CODES.split(' ').join('|')})\\b|[$€£¥₹])$`,'i');
export function parseAmount(input){
let value=String(input??'').replace(/[\u00a0\u2007\u2009\u202f]/g,' ').trim();
if(!value)return null;
let negative=false;
let signed=false;
if(value.startsWith('(')&&value.endsWith(')')){
negative=true;
signed=true;
value=value.slice(1,-1).trim();
}
value=value.replace(MARKER,'').trim();
if(/^[+-]/.test(value)){
if(signed)return null;
negative=value[0]==='-';
signed=true;
value=value.slice(1).trim();
}else if(value.endsWith('-')){
if(signed)return null;
negative=true;
value=value.slice(0,-1).trim();
}
value=value.replace(MARKER,'').trim();
if(!/^[\d., '’]+$/.test(value))return null;
let decimal='';
const dots=(value.match(/\./g)??[]).length;
const commas=(value.match(/,/g)??[]).length;
if(dots&&commas){
decimal=value.lastIndexOf('.')>value.lastIndexOf(',')?'.':',';
if((decimal==='.'?dots:commas)!==1)return null;
}else if(dots===1||commas===1){
const mark=dots?'.':',';
const tail=value.slice(value.lastIndexOf(mark)+1);
if(/^\d{1,2}$/.test(tail))decimal=mark;
else return null;
}
let integer=value;
let fraction='';
if(decimal){
[integer,fraction]=value.split(decimal);
if(!/^\d{1,2}$/.test(fraction))return null;
if(!integer)integer='0';
}
const separators=new Set((integer.match(/[., '’]/g)??[]).map((mark)=>mark==='’'?"'":mark));
if(separators.size>1)return null;
if(separators.size){
const groups=integer.replace(/’/g,"'").split([...separators][0]);
if(!/^\d{1,3}$/.test(groups[0])||!groups.slice(1).every((group)=>/^\d{3}$/.test(group)))return null;
integer=groups.join('');
}
if(!/^\d+$/.test(integer))return null;
const minor=Number(integer)*100+Number(fraction.padEnd(2,'0'));
if(!Number.isSafeInteger(minor))return null;
return minor===0?0:negative?-minor:minor;
}
export function formatMinor(minor){
if(!Number.isSafeInteger(minor))throw new RangeError('invalidAmount');
const absolute=Math.abs(minor);
return`${minor < 0 ? '-' : ''}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`;
}
function currencies(text){
const found=new Set([...text.matchAll(CODE)].map((match)=>match[0].toUpperCase()));
const symbolText=text.replace(/[$€£¥₹](?:[ \t]*[$€£¥₹])+/g,cluster=>new Set(cluster.match(/[$€£¥₹]/g)).size>1?'':cluster);
const symbols=[
[/\bUS\$/i,'USD'],[/\b(?:CA|C)\$/i,'CAD'],[/\b(?:AU|A)\$/i,'AUD'],
[/\bNZ\$/i,'NZD'],[/\bHK\$/i,'HKD'],[/\bSG\$/i,'SGD'],
[/€/,'EUR'],[/£/,'GBP'],[/₹/,'INR'],
];
for(const[pattern,currency]of symbols)if(pattern.test(symbolText))found.add(currency);
return found;
}
function monetaryCodes(text){
const found=new Set();
const labels=new Set(['TAX','VAT','GST','HST','PST','QTY','TIP','NET','DUE','SUB','TOT','FOR','AND','ALL','OFF']);
for(const pattern of[/\b([A-Z]{3})(?=\s*[+-]?\(?\s*(?:\d|[.,]\d))/gi,
/\d(?:[\d., '’]*\d)?\s*([A-Z]{3})\b/gi]){
for(const match of text.matchAll(pattern)){
const code=match[1].toUpperCase();
if(!labels.has(code))found.add(code);
}
}
return found;
}
function currencyFitsSymbol(line,currency){
if(line.includes('$')&&!/^(?:USD|CAD|AUD|NZD|HKD|SGD|BRL|MXN)$/.test(currency))return false;
if(line.includes('¥')&&!/^(?:JPY|CNY)$/.test(currency))return false;
return true;
}
function totalLabel(line){
if(/\b(?:sub\s*[- ]?\s*total|(?:tax|vat|gst|hst|pst|cash|card|discounts?|savings?|tender(?:ed)?)\s+total|total\s+(?:(?:sales\s+)?(?:tax|vat|gst|hst|pst)|cash|card|before|excl(?:uding)?|savings?|discounts?|tender(?:ed)?|items?|quantity|points)|(?:cash|card|amount)\s+tendered|tender(?:ed)?|change)\b/i.test(line))return null;
const label=/\b(?:refund\s+total|total\s+refund|amount\s+refunded|grand\s+total|invoice\s+total|receipt\s+total|amount\s+(?:due|payable)|balance\s+due|total\s+after\s+(?:tax|vat|gst|hst|pst)|total(?:\s+(?:amount|due|payable|paid))?)\b/gi;
const matches=[...line.matchAll(label)];
if(!matches.length)return null;
const match=matches.at(-1);
const refund=/refund/i.test(match[0]);
const score=refund||/grand|amount\s+(?:due|payable)|balance\s+due|total\s+(?:due|payable|after)/i.test(match[0])?3:2;
return{score,refund,start:match.index+match[0].length};
}
function amounts(line,onlyMoney=false){
line=line.replace(/[\u00a0\u2007\u2009\u202f]/g,' ').replace(/(\d)[ \t]*([.,])[ \t]+(?=\d)|(\d)[ \t]+([.,])(?=\d)/g,
(match,first,firstMark,alternate,alternateMark)=>`${first ?? alternate}${firstMark ?? alternateMark}`);
const values=[];
const pattern=/[+-]?\(?[ \t]*(?:(?:[A-Z]{1,3}\$)|[$€£¥₹])?[ \t]*(?:\d+(?:[.,'’ \u00a0\u202f]\d+)*|[.,]\d{1,2})[ \t]*\)?-?/giu;
for(const match of line.matchAll(pattern)){
const leading=match[0].length-match[0].trimStart().length;
const trailing=match[0].length-match[0].trimEnd().length;
const before=line[match.index+leading-1]??'';
const after=line[match.index+match[0].length-trailing]??'';
if(/[\w./-]/.test(before)||/[\w./%\-]/.test(after))continue;
if(onlyMoney&&!/[.,]\d{1,2}\b|[$€£¥₹]/.test(match[0]))continue;
const minor=parseAmount(match[0]);
if(minor!==null)values.push(minor);
}
return values;
}
function printedDate(lines){
const pattern=/\b(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}|\d{1,2}[ -](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[ ,.-]+\d{2,4}|(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[ .-]+\d{1,2}[ ,.-]+\d{2,4})\b/gi;
const candidates=lines.filter((line)=>!/\b(?:due|delivery|ship)\s+date\b/i.test(line));
const preferred=candidates.filter((line)=>/\b(?:invoice|receipt|issued?|purchase|transaction)?\s*date\b/i.test(line));
for(const line of[...preferred,...candidates]){
for(const match of line.matchAll(pattern))if(possiblePrintedDate(match[0]))return match[0];
}
return'';
}
function possiblePrintedDate(value){
if(!/^\d+[-/.]\d+[-/.]\d+$/.test(value))return true;
const parts=value.split(/[-/.]/);
const[first,middle,last]=parts.map(Number);
const month=number=>number>=1&&number<=12;
const day=number=>number>=1&&number<=31;
if(parts[0].length===4)return month(middle)&&day(last);
if(parts[2].length===4)return month(first)&&day(middle)||day(first)&&month(middle);
return month(first)&&day(middle)||day(first)&&month(middle)||month(middle)&&day(last);
}
function plainReference(line){
const match=line.match(/^(?:invoice|receipts?)\s+([A-Z0-9][A-Z0-9._/-]*)\s*$/i);
return match&&/\d/.test(match[1])?match[1]:'';
}
function printedReference(lines){
const explicit=/\b(?:invoice|receipts?|document|reference|ref)\s*(?:no\.?|number|#|id|:)\s*[:#-]?\s*([A-Z0-9][A-Z0-9._/-]*)/i;
for(const line of lines){
const match=line.match(explicit);
if(match)return match[1];
const reference=plainReference(line);
if(reference)return reference;
const inline=line.match(/\breceipts?\s+([A-Z][A-Z0-9._/-]*)\b/i);
if(inline&&/\d/.test(inline[1])&&printedDate([line]))return inline[1];
}
return'';
}
function receiptMetadataSection(lines){
let receiptEvidence=false;
const terminalTitle=/^TRANSACTION\s+RECORD\b|^TRANSACT[ \t]*\[[ \t]*ON[ \t]+RECORD[ \t]*[:.]?$/i;
for(let index=0;index<lines.length;index++){
const line=lines[index];
if(receiptEvidence&&terminalTitle.test(line)){
const following=lines.slice(index+1,index+18);
const kinds=new Set();
for(const part of following){
if(/^(?:card\s*(?:number|type|entry)|acct\s*:)/i.test(part))kinds.add('card');
if(/^(?:auth(?:orization)?\s*(?:#|:|no\b)|approval\s*(?:#|:|code\b))/i.test(part))kinds.add('authorization');
if(/^(?:term(?:inal)?\s*(?:id|#|:)|sequence\s*(?:#|:)|trans(?:action)?\s*type\b|type\s*:\s*purchase\b)/i.test(part))kinds.add('terminal');
}
if(kinds.size>=2)return{lines:lines.slice(0,index),appendedPayment:true};
}
const label=totalLabel(line);
if(label&&(amounts(line.slice(label.start)).length===1
||!line.slice(label.start).trim()&&index+1<lines.length&&amounts(lines[index+1]).length===1))receiptEvidence=true;
}
return{lines,appendedPayment:false};
}
function printedMerchant(lines){
const table=lines.findIndex((line)=>/^(?:qty|quantity|items?|desc(?:ription)?|desription|unit\s+price|price|rate)\s*[:.]?$/i.test(line)
||(line.match(/\b(?:qty|quantity|items?|desc(?:ription)?|desription|price)\b/gi)??[]).length>=2);
return lines.slice(0,table<0?8:Math.min(table,8)).find((line)=>/[A-Za-z]/.test(line)
&&!plainReference(line)
&&!/^(?:qty|quantity|items?|desc(?:ription)?|desription|unit\s+price|price|rate)\s*[:.]?$/i.test(line)
&&!/^(?:(?:sales|payment|purchase|tax)\s+)?(?:invoice|receipts?|credit\s+note|original|copy)\b(?:\s*(?:no\.?|number|#|:|$)|\s*[-#]?\s*\d)/i.test(line)
&&!/^(?:(?:grand|invoice|receipt)\s+total|total(?:\s+(?:amount|due|payable|paid|after\s+(?:tax|vat|gst|hst|pst)))?)\b\s*[:=]?\s*(?:$|[+\-(\d$€£¥₹]|[A-Z]{3}\s*[+\-(]?\s*\d)/i.test(line)
&&!/^(?:\d|date\b|sub\s*total\b|amount\b|balance\b|bill\s+to\b|ship\s+to\b|tel\b|phone\b|www\.|https?:|vat\b|tax\b|currency\b)/i.test(line))??'';
}
export function extractReceipt(input){
const text=String(input??'').replace(/\r\n?/g,'\n');
const lines=text.split('\n').map((line)=>line.trim()).filter(Boolean);
const candidates=[];
const totals=[];
for(let index=0;index<lines.length;index++){
const line=lines[index];
const label=totalLabel(line);
let valueText=label?line.slice(label.start).replace(/^\s*[:=]\s*/,''):line;
const itemCount=label&&/^\s*\(?\s*\d+(?:[.,]\d+)?\s+(?:items?|units?)\b\s*\)?\s*/i.exec(valueText);
const unitPrice=itemCount&&/@|\bx\b/i.test(valueText.slice(itemCount[0].length));
if(itemCount)valueText=valueText.slice(itemCount[0].length);
let currencyText=line;
let values=unitPrice?[]:amounts(valueText,!label);
if(label&&!unitPrice&&!values.length&&!/[A-Za-z\d]/.test(valueText.replace(CODE,''))
&&index+1<lines.length&&!/[A-Za-z]/.test(lines[index+1].replace(CODE,''))){
values=amounts(lines[index+1]);
if(values.length)currencyText+=` ${lines[index + 1]}`;
}
if(label?.refund)values=values.map((minor)=>-Math.abs(minor));
for(const minor of values)candidates.push({amount:formatMinor(minor),label:line});
if(label&&values.length===1)totals.push({minor:values[0],score:label.score,line,currencyText});
}
const highest=totals.reduce((score,total)=>Math.max(score,total.score),0);
const choices=totals.filter((total)=>total.score===highest);
const distinct=new Set(choices.map((total)=>total.minor));
const chosenCurrencies=new Set(choices.flatMap((total)=>[...currencies(total.currencyText),...monetaryCodes(total.currencyText)]));
const ambiguous=distinct.size>1||chosenCurrencies.size>1;
const selected=distinct.size===1&&!ambiguous?choices[0]:null;
const currencyEvidence=selected?currencies(selected.currencyText):new Set();
const documentCurrencies=currencies(text);
const documentCurrency=documentCurrencies.size===1?[...documentCurrencies][0]:'';
let currency=currencyEvidence.size===1?[...currencyEvidence][0]
:currencyEvidence.size===0&&documentCurrency&&(!selected||currencyFitsSymbol(selected.currencyText,documentCurrency))?documentCurrency:'';
const totalCodes=new Set(lines.flatMap((line,index)=>{
const label=totalLabel(line);
if(!label)return[];
const value=line.slice(label.start).trim();
return[...monetaryCodes(value||lines[index+1]||'')];
}));
const unresolvedTotalCode=[...totalCodes].some(code=>!KNOWN_CODES.has(code)
||!selected&&code!==currency);
if(!currencyEvidence.size&&unresolvedTotalCode)currency='';
const metadata=receiptMetadataSection(lines);
const receiptDate=printedDate(metadata.lines);
const date=receiptDate||(metadata.appendedPayment?printedDate(lines):'');
const otherPrintedCurrency=/\b(?:currency|curr)\s*[:=-]?\s*[A-Z]{3}\b|\b(?:DEM|FRF|ITL|ESP|PTE|NLG|BEF|ATS|FIM|IEP|GRD|SIT|SKK|EEK|LVL|LTL|HRK|BGN|CYP|MTL)\b/i.test(text);
const brokenTotalSymbol=selected&&/([$€£¥₹])[ \t]*([$€£¥₹])/.test(selected.currencyText)
&&[...selected.currencyText.matchAll(/([$€£¥₹])[ \t]*([$€£¥₹])/g)].some(match=>match[1]!==match[2]);
const currencyBlocked=!currency&&(chosenCurrencies.size>1||documentCurrencies.size>1
||otherPrintedCurrency||totalCodes.size>0
||brokenTotalSymbol
||documentCurrency&&selected&&!currencyFitsSymbol(selected.currencyText,documentCurrency));
const location=!currency&&!ambiguous&&!currencyBlocked&&!currencyEvidence.size&&!documentCurrencies.size
?inferLocationCurrency(lines,date):null;
const inferred=location&&(!selected||currencyFitsSymbol(selected.currencyText,location.currency))?location:null;
if(inferred)currency=inferred.currency;
const reference=printedReference(metadata.lines);
return{
merchant:printedMerchant(lines),date,reference,currency,
amount:selected?formatMinor(selected.minor):'',candidates,
warning:ambiguous?'ambiguousTotal':selected?'reviewExtraction':'missingTotal',
...(inferred?{currencySource:'location',locationEvidence:inferred.evidence}:{}),
...(currencyBlocked?{currencyBlocked:true}:{}),
...(!receiptDate&&date&&metadata.appendedPayment?{dateSource:'payment'}:{}),
};
}
export function duplicatePhotoCounts(records){
const names=new Map();
for(const record of records){
const file=record.file;
if(!file||typeof file.name!=='string'||!Number.isSafeInteger(file.size)||file.size<0)continue;
if(!names.has(file.name))names.set(file.name,new Map());
const sizes=names.get(file.name);
if(!sizes.has(file.size))sizes.set(file.size,[]);
sizes.get(file.size).push(record);
}
const counts=new Map();
for(const sizes of names.values()){
for(const group of sizes.values()){
if(group.length>1)for(const record of group)counts.set(record,group.length);
}
}
return counts;
}
export function summarize(records){
const groups=new Map();
let confirmedCount=0;
let reviewCount=0;
let invalidCount=0;
for(const record of records){
if(record.confirmed!==true){
reviewCount++;
continue;
}
const minor=parseAmount(record.amount);
const currency=String(record.currency??'').trim().toUpperCase();
if(minor===null||(currency&&!/^[A-Z]{3}$/.test(currency))){
invalidCount++;
continue;
}
confirmedCount++;
if(!groups.has(currency))groups.set(currency,{currency,count:0,minor:0});
const group=groups.get(currency);
group.count++;
if(group.minor!==null){
const sum=group.minor+minor;
group.minor=Number.isSafeInteger(sum)?sum:null;
}
}
const totals=[...groups.values()].sort((a,b)=>a.currency.localeCompare(b.currency)).map((group)=>({
...group,amount:group.minor===null?'':formatMinor(group.minor),
warning:group.minor===null?'totalOverflow':'',
}));
return{count:records.length,confirmedCount,reviewCount,invalidCount,totals};
}
export function csvCell(value,numeric=false){
let text=String(value??'');
if(!numeric&&/^[\s]*[=+\-@]|^[\t\r\n]/.test(text))text=`'${text}`;
return`"${text.replace(/"/g, '""')}"`;
}
export function buildCsv(records,labels={}){
const keys=['filename','merchant','date','reference','currency','amount','confirmed'];
const rows=[keys.map((key)=>csvCell(labels[key]??key)).join(',')];
for(const record of records){
const minor=parseAmount(record.amount);
const values=[record.name??record.filename,record.merchant,record.date,record.reference,
record.currency,minor===null?record.amount:formatMinor(minor),
record.confirmed===true?labels.yes??'true':labels.no??'false'];
rows.push(values.map((value,index)=>csvCell(value,index===5&&minor!==null)).join(','));
}
return`${rows.join('\r\n')}\r\n`;
}
export function buildMailto({to='',subject='',body=''}={}){
const rawRecipient=String(to);
const recipient=rawRecipient.trim();
const title=String(subject);
if(/[\x00-\x1f\x7f]/.test(rawRecipient)||/[\x00-\x1f\x7f]/.test(title))return null;
const mailboxes=recipient?recipient.split(',').map((address)=>address.trim()):[];
if(mailboxes.some((address)=>!/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@(?:[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?\.)+[A-Z]{2,}$/i.test(address)))return null;
const path=mailboxes.map((address)=>encodeURIComponent(address).replace(/%40/g,'@')).join(',');
const message=String(body).replace(/\r\n|\r|\n/g,'\r\n');
return`mailto:${path}?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(message)}`;
}
