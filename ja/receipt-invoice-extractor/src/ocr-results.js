/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{extractReceipt}from'./receipt.js?v=6839eb22c4';
import{inferLocationCurrency}from'./location-currency.js?v=6839eb22c4';
function itemTable(text){
return(text.match(/\b(?:qty|quantity|items?|desc(?:ription)?|desription|price)\b/gi)??[]).length>=2;
}
function bodyStarts(text){
return itemTable(text)
||/^(?:qty|quantity|items?|desc(?:ription)?|desription|unit\s+price|price|rate)\s*[:.]?$/i.test(text)
||/^(?:date\b|(?:invoice|receipt|transaction|purchase|issue)\s+date\b|cashier\b|operator\b|register\b|sub\s*[- ]?\s*total\b|total\b|grand\s+total\b|amount\b|balance\b|cash\b|change\b|discount\b|bill\s+to\b|ship\s+to\b|customer\b|\d+\s+\S)/i.test(text)
||/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}\b/.test(text);
}
function validBox(box){
return box&&['x0','y0','x1','y1'].every(key=>Number.isFinite(box[key]))
&&box.x1>box.x0&&box.y1>box.y0;
}
function recognitionLines(data){
const lines=[];
for(const block of Array.isArray(data?.blocks)?data.blocks:[]){
for(const paragraph of Array.isArray(block?.paragraphs)?block.paragraphs:[]){
for(const line of Array.isArray(paragraph?.lines)?paragraph.lines:[]){
const text=typeof line?.text==='string'?line.text.replace(/\s+/g,' ').trim():'';
if(text&&validBox(line?.bbox))lines.push({text,confidence:line.confidence,bbox:line.bbox});
}
}
}
return lines.sort((a,b)=>a.bbox.y0-b.bbox.y0||a.bbox.x0-b.bbox.x0);
}
export function needsRecoveryRecognition(data){
const result=extractReceipt(data?.text??'');
if(!result.amount||!result.date)return true;
if(Number.isFinite(data?.confidence)&&data.confidence<72)return true;
const totalLines=new Set(result.candidates.filter(candidate=>candidate.amount===result.amount
&&/\b(?:total|amount|balance)\b/i.test(candidate.label)).map(candidate=>candidate.label.replace(/\s+/g,' ')));
return recognitionLines(data).some(line=>Number.isFinite(line.confidence)&&line.confidence<70
&&(totalLines.has(line.text)||line.text.includes(result.date)));
}
export function needsHeaderRecognition(recognition){
const result=receiptFromRecognition(recognition);
return!result.merchant||!result.currency&&/[$¥]/.test(`${recognition?.bodyText ?? ''}\n${recognition?.recoveryText ?? ''}`);
}
export function merchantFromRecognition(data,{minimumConfidence=60}={}){
if(!Number.isFinite(minimumConfidence)||minimumConfidence<55||minimumConfidence>100)return'';
const leading=recognitionLines(data).slice(0,8);
const boundary=leading.findIndex(line=>bodyStarts(line.text));
const header=boundary<0?leading:leading.slice(0,boundary);
const eligible=header.filter(line=>Number.isFinite(line.confidence)&&line.confidence>=minimumConfidence&&line.confidence<=100
&&(line.text.match(/\p{L}/gu)??[]).length>=3).map(line=>({
...line,
parseText:line.text.replace(/^\d+(?=[A-Za-z]|[-.'’&][A-Za-z])/,''),
}));
const merchant=extractReceipt(eligible.map(line=>line.parseText).join('\n')).merchant;
return eligible.find(line=>line.parseText===merchant)?.text??'';
}
export function receiptFromRecognition(recognition){
const result=extractReceipt(recognition?.bodyText??'');
if(typeof recognition?.merchant==='string')result.merchant=recognition.merchant;
if(typeof recognition?.recoveryText!=='string'||!recognition.recoveryText.trim())return withHeaderEvidence(result,recognition);
const recovery=extractReceipt(recognition.recoveryText);
if(!result.merchant&&typeof recognition.recoveryMerchant==='string')result.merchant=recognition.recoveryMerchant;
const compatibleCurrency=currencyFitsPrimaryTotal(result,recovery.currency);
let locationText=recognition.bodyText??'';
let conflict=false;
for(const field of['amount','date','reference','currency']){
if(!recovery[field])continue;
if(field==='date'&&result.date){
if(result.dateSource!=='payment'&&recovery.dateSource==='payment')continue;
if(result.dateSource==='payment'&&recovery.dateSource!=='payment'
&&Number.isFinite(recognition.recoveryConfidence)&&recognition.recoveryConfidence>=60){
result.date=recovery.date;
delete result.dateSource;
continue;
}
}
if(field==='currency'){
if(!result.currency&&(result.currencyBlocked||!compatibleCurrency))continue;
if(result.currency&&!result.currencySource&&recovery.currencySource==='location')continue;
}
if(result[field]&&comparable(field,result[field])!==comparable(field,recovery[field])){
result[field]='';
if(field==='date')delete result.dateSource;
if(field==='currency'){
clearCurrencyEvidence(result);
result.currencyBlocked=true;
}
conflict=true;
}else if(!result[field]){
if(field==='amount'&&result.warning==='ambiguousTotal')continue;
if(!Number.isFinite(recognition.recoveryConfidence)||recognition.recoveryConfidence<60)continue;
result[field]=recovery[field];
if(field==='date'&&recovery.dateSource==='payment')result.dateSource='payment';
if(field==='currency'){
copyCurrencyEvidence(result,recovery);
locationText=recognition.recoveryText;
}
}
}
if(recovery.warning==='ambiguousTotal'&&result.amount){
result.amount='';
conflict=true;
}
if(result.currencySource==='location'){
const location=inferLocationCurrency(locationText,result.date);
if(location?.currency!==result.currency){
result.currency='';
clearCurrencyEvidence(result);
}
}
result.candidates=[...result.candidates,...recovery.candidates.map(candidate=>({...candidate,source:'recovery'}))];
result.warning=conflict?'conflictingRecognition'
:result.warning==='ambiguousTotal'?'ambiguousTotal':result.amount?'reviewExtraction':'missingTotal';
return withHeaderEvidence(result,recognition);
}
function withHeaderEvidence(result,recognition){
if(!result.merchant&&typeof recognition?.headerMerchant==='string')result.merchant=recognition.headerMerchant;
if(result.currency||result.currencyBlocked||typeof recognition?.headerText!=='string'
||!Number.isFinite(recognition.headerConfidence)||recognition.headerConfidence<60)return result;
const location=inferLocationCurrency(recognition.headerText,result.date);
if(!location)return result;
for(const text of[recognition.bodyText,recognition.recoveryText]){
if(typeof text!=='string'||!text.trim())continue;
const body=extractReceipt(text);
if(body.currencyBlocked||!currencyFitsPrimaryTotal(body,location.currency))return result;
if(body.currency&&!body.currencySource&&body.currency!==location.currency)return result;
if(/\$\s*[+\-(]?\s*\d/.test(text)&&!/^(?:USD|CAD|AUD|NZD|HKD|SGD|BRL|MXN)$/.test(location.currency))return result;
if(/¥\s*[+\-(]?\s*\d/.test(text)&&!/^(?:JPY|CNY)$/.test(location.currency))return result;
}
result.currency=location.currency;
result.currencySource='location';
result.locationEvidence=location.evidence;
return result;
}
function comparable(field,value){
const text=String(value).trim().toLowerCase();
return field==='date'?calendarDate(text)??text.replace(/[./-]/g,'-').replace(/\s+/g,' '):text;
}
function calendarDate(value){
let year;
let month;
let day;
const yearFirst=/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(value);
const yearLast=/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(value);
if(yearFirst){
[year,month,day]=yearFirst.slice(1).map(Number);
}else if(yearLast){
const[first,second,printedYear]=yearLast.slice(1).map(Number);
if(first>12)[year,month,day]=[printedYear,second,first];
else if(second>12)[year,month,day]=[printedYear,first,second];
else return null;
}else{
const months={
jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,
jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,
oct:10,october:10,nov:11,november:11,dec:12,december:12,
};
const monthFirst=/^([a-z]+)[ ,.-]+(\d{1,2})[ ,.-]+(\d{4})$/.exec(value);
const dayFirst=/^(\d{1,2})[ ,.-]+([a-z]+)[ ,.-]+(\d{4})$/.exec(value);
if(monthFirst)[year,month,day]=[Number(monthFirst[3]),months[monthFirst[1]],Number(monthFirst[2])];
else if(dayFirst)[year,month,day]=[Number(dayFirst[3]),months[dayFirst[2]],Number(dayFirst[1])];
else return null;
}
if(!Number.isInteger(year)||year<1||year>9999||!Number.isInteger(month)||month<1||month>12
||!Number.isInteger(day)||day<1)return null;
const leap=year%4===0&&(year%100!==0||year%400===0);
const days=month===2?leap?29:28:[4,6,9,11].includes(month)?30:31;
if(day>days)return null;
return`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
function currencyFitsPrimaryTotal(result,currency){
const labels=result.candidates.filter(candidate=>candidate.amount===result.amount
&&/\b(?:total|amount|balance)\b/i.test(candidate.label)).map(candidate=>candidate.label).join('\n');
if(labels.includes('$')&&!/^(?:USD|CAD|AUD|NZD|HKD|SGD|BRL|MXN)$/.test(currency))return false;
if(labels.includes('¥')&&!/^(?:JPY|CNY)$/.test(currency))return false;
return true;
}
function clearCurrencyEvidence(result){
if('currencySource'in result)result.currencySource='';
if('locationEvidence'in result)result.locationEvidence='';
}
function copyCurrencyEvidence(result,source){
for(const key of['currencySource','locationEvidence']){
if(key in source)result[key]=source[key];
}
}
