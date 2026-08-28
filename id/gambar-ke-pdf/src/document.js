/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{PdfWriter,num,textString}from'./pdf.js';
import{prepareImage}from'./encode.js';
import{layoutPage,placement}from'./layout.js';
const PRODUCER='abox.tools images to PDF';
export async function buildDocument(items,settings,{onProgress,signal}={}){
if(!items.length)throw new Error('build.noimages');
const pdf=new PdfWriter();
const catalog=pdf.reserve();
const pageTree=pdf.reserve();
const pageIds=[];
let copied=0;
for(const[index,item]of items.entries()){
stopIfCancelled(signal);
onProgress?.({done:index,total:items.length,name:item.name});
const image=await prepareImage(item,settings);
if(image.copied)copied+=1;
const page=layoutPage({
width:image.width,
height:image.height,
orientation:image.orientation,
rotate:item.rotate,
},settings);
pageIds.push(writePage(pdf,pageTree,image,page,settings,item.rotate));
await new Promise((resolve)=>setTimeout(resolve,0));
}
stopIfCancelled(signal);
onProgress?.({done:items.length,total:items.length,name:''});
pdf.object(catalog,`<< /Type /Catalog /Pages ${pageTree} 0 R >>`);
pdf.object(pageTree,`<< /Type /Pages /Count ${pageIds.length} `
+`/Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`);
const info=writeInfo(pdf,settings);
return{blob:pdf.finish({root:catalog,info}),pages:pageIds.length,copied};
}
function stopIfCancelled(signal){
if(signal?.aborted)throw new DOMException('Cancelled','AbortError');
}
function writePage(pdf,pageTree,image,page,settings,rotate){
const imageId=pdf.reserve();
const contentsId=pdf.reserve();
const pageId=pdf.reserve();
const smaskId=image.smask?pdf.reserve():0;
const iccId=usableIcc(image)?pdf.reserve():0;
if(smaskId){
pdf.stream(smaskId,` /Type /XObject /Subtype /Image`
+` /Width ${image.width} /Height ${image.height}`
+' /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode'
+decodeParms(image,1),image.smask.data);
}
if(iccId){
pdf.stream(iccId,` /N ${image.gray ? 1 : 3}`
+` /Alternate ${image.gray ? '/DeviceGray' : '/DeviceRGB'}`,image.icc);
}
const colorSpace=iccId
?`[/ICCBased ${iccId} 0 R]`
:(image.gray?'/DeviceGray':'/DeviceRGB');
pdf.stream(imageId,' /Type /XObject /Subtype /Image'
+` /Width ${image.width} /Height ${image.height}`
+` /ColorSpace ${colorSpace} /BitsPerComponent 8`
+(image.kind==='dct'?' /Filter /DCTDecode':' /Filter /FlateDecode')
+(image.predictor?decodeParms(image,3):'')
+(smaskId?` /SMask ${smaskId} 0 R`:''),image.data);
pdf.stream(contentsId,'',contentStream(image,page,settings,rotate));
pdf.object(pageId,`<< /Type /Page /Parent ${pageTree} 0 R`
+` /MediaBox [0 0 ${num(page.width)} ${num(page.height)}]`
+` /Resources << /XObject << /Im0 ${imageId} 0 R >> >>`
+` /Contents ${contentsId} 0 R >>`);
return pageId;
}
function decodeParms(image,colors){
return` /DecodeParms << /Predictor 15 /Colors ${colors}`
+` /BitsPerComponent 8 /Columns ${image.width} >>`;
}
function usableIcc(image){
if(!image.icc||image.icc.length<20)return false;
const space=String.fromCharCode(...image.icc.subarray(16,20));
return image.gray?space==='GRAY':space==='RGB ';
}
function contentStream(image,page,settings,rotate){
const lines=['q'];
const[r,g,b]=parseColor(settings.background);
lines.push(`${num(r)} ${num(g)} ${num(b)} rg`);
lines.push(`0 0 ${num(page.width)} ${num(page.height)} re f`);
if(page.clip){
lines.push(`${num(page.clip.x)} ${num(page.clip.y)} `
+`${num(page.clip.width)} ${num(page.clip.height)} re W n`);
}
const matrix=placement(page.rect,image.orientation,rotate);
lines.push(`${matrix.map(num).join(' ')} cm`);
lines.push('/Im0 Do','Q','');
return new TextEncoder().encode(lines.join('\n'));
}
function parseColor(value){
const match=/^#?([0-9a-f]{6})$/i.exec(String(value??''));
if(!match)return[1,1,1];
const int=parseInt(match[1],16);
return[(int>>16)&0xff,(int>>8)&0xff,int&0xff].map((c)=>c/255);
}
function writeInfo(pdf,settings){
const entries=[`/Producer ${textString(PRODUCER)}`];
if(settings.title?.trim())entries.push(`/Title ${textString(settings.title.trim())}`);
if(settings.author?.trim())entries.push(`/Author ${textString(settings.author.trim())}`);
if(settings.dated)entries.push(`/CreationDate ${pdfDate(new Date())}`);
const id=pdf.reserve();
pdf.object(id,`<< ${entries.join(' ')} >>`);
return id;
}
function pdfDate(date){
const pad=(value)=>String(Math.floor(Math.abs(value))).padStart(2,'0');
const offset=-date.getTimezoneOffset();
const zone=offset===0
?'Z'
:`${offset > 0 ? '+' : '-'}${pad(offset / 60)}'${pad(offset % 60)}'`;
return`(D:${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`
+`${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}${zone})`;
}
