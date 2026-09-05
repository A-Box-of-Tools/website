/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{PdfDocument}from'./shared/pdf-reader.js?v=48fbbf8377';
import{harvestStrings}from'./strings.js?v=48fbbf8377';
import{pagesOf,readPage}from'./text.js?v=48fbbf8377';
export async function harvestAll(doc,pages=null){
const read=pages??await Promise.all(
pagesOf(doc).map((page,index)=>readPage(doc,page,index+1)),
);
const parts=read.map((page)=>page.text);
for(const page of read){
for(const mark of page.marked??[]){
for(const key of['ActualText','Alt']){
const value=mark.dict.get(key);
if(value?.bytes)parts.push(textOf(value.bytes));
}
}
}
parts.push(...harvestStrings(doc));
return parts.join('\n');
}
function textOf(bytes){
if(bytes.length>=2&&bytes[0]===0xfe&&bytes[1]===0xff){
let text='';
for(let at=2;at+1<bytes.length;at+=2){
text+=String.fromCharCode((bytes[at]<<8)|bytes[at+1]);
}
return text;
}
let text='';
for(const byte of bytes)text+=String.fromCharCode(byte);
return text;
}
export async function verify(bytes,expected){
const doc=await PdfDocument.open(bytes);
const pages=pagesOf(doc);
const read=await Promise.all(
pages.map((page,index)=>readPage(doc,page,index+1)),
);
const after=await harvestAll(doc,read);
const terms=expected.terms.map((term)=>{
const was=countOf(expected.text,term.text);
const now=countOf(after,term.text);
return{
text:term.text,
was,
now,
removed:term.removed,
ok:now<=Math.max(0,was-term.removed),
};
});
const survived=terms.filter((term)=>!term.ok);
const problem=problemWith(survived,pages.length,expected.pages);
return{
ok:!problem,
pages:pages.length,
terms,
survived,
problem,
};
}
function problemWith(survived,found,expected){
if(found!==expected)return'check.pages';
if(survived.length)return'check.survived';
return'';
}
export function countOf(haystack,needle){
const target=normalise(needle);
if(!target)return 0;
const text=normalise(haystack);
let count=0;
for(let at=text.indexOf(target);at>=0;at=text.indexOf(target,at+target.length)){
count+=1;
}
return count;
}
function normalise(text){
return text.replace(/\s+/g,' ').trim().toLowerCase();
}
