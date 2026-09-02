/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{assemble}from'./assemble.js';
import{archiveName,outputNames,splitInto}from'./plan.js';
import{count}from'./format.js';
import{PdfDocument}from'./reader.js';
import{makeZip}from'./shared/zip.js';
import{writeDocument}from'./writer.js';
export async function produce(entries,how,{onProgress,signal,t}={}){
const parts=splitInto(entries,how.split);
const names=outputNames(parts,{
stem:how.stem,mode:how.split?.mode??'single',suffix:how.suffix,
});
const files=[];
const notes=new Set();
let failed='';
for(let at=0;at<parts.length;at+=1){
if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
onProgress?.(at,parts.length,names[at]);
const part=parts[at];
const built=assemble(part.entries,{bookmarks:how.bookmarks,t});
for(const note of built.notes)notes.add(note);
const written=await writeDocument(built.build,{signal});
const data=new Uint8Array(await written.arrayBuffer());
const check=await verify(data,part.entries.length,t);
if(!check.ok)failed=check.text;
files.push({
name:names[at],
data,
size:data.length,
pages:part.entries.length,
from:part.from,
to:part.to,
fields:built.fields,
links:built.links,
check,
});
}
onProgress?.(parts.length,parts.length,'');
const archive=files.length>1
?{
name:archiveName(how.stem),
blob:makeZip(files.map((file)=>({name:file.name,data:file.data}))),
}
:null;
return{
files,
archive,
notes:[...notes],
ok:!failed,
problem:failed,
};
}
async function verify(bytes,expected,t){
try{
const doc=await PdfDocument.open(bytes);
const pages=doc.countPages();
if(pages!==expected){
return{
ok:false,
text:t(expected===1?'check.wrong.one':'check.wrong.many',{
found:count(pages,'page',t),
expected,
}),
};
}
return{ok:true,text:t('check.ok',{pages:count(pages,'page',t)})};
}catch(error){
return{ok:false,text:t('check.noopen',{detail:error.message})};
}
}
