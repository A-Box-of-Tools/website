/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{PdfWriter,num,textString,PT_PER_MM}from'./pdf-page-writer.js?v=1986656815';
import{HEADINGS,LEDGER_HEADINGS,ledgerRows,rowsFor}from'./example-statement.js?v=1986656815';
const A4={width:Math.round(210*PT_PER_MM),height:Math.round(297*PT_PER_MM)};
const literal=(s)=>s.replace(/([\\()])/g,'\\$1');
const COLUMNS=[56,150,260,420];
const LEDGER_COLUMNS=[56,132,250,372,470];
function pageStream(page,pages,rows,headings=HEADINGS,columns=COLUMNS){
const top=A4.height-90;
const out=[];
out.push('0.12 0.21 0.31 rg');
out.push(`BT /F1 22 Tf 56 ${top + 26} Td (${literal(`STATEMENT ${page} / ${pages}`)}) Tj ET`);
out.push(`56 ${top + 14} m ${A4.width - 56} ${top + 14} l S`);
out.push('0.35 0.35 0.35 rg');
headings.forEach((heading,c)=>{
out.push(`BT /F1 9 Tf ${columns[c]} ${top - 10} Td (${literal(heading)}) Tj ET`);
});
out.push('0 0 0 rg');
rows.forEach((row,i)=>{
const y=top-34-i*22;
row.forEach((cell,c)=>{
out.push(`BT /F1 11 Tf ${columns[c]} ${y} Td (${literal(cell)}) Tj ET`);
});
});
out.push('0.78 0.80 0.82 rg');
out.push(`BT /F1 96 Tf ${A4.width / 2 - 30} 90 Td (${page}) Tj ET`);
return new TextEncoder().encode(out.join('\n'));
}
export function examplePdfFile(name,
{pages=3,jpegs=null,jpegSize=null,ledger=false}={}){
const writer=new PdfWriter();
const catalog=writer.reserve();
const pagesId=writer.reserve();
const font=writer.reserve();
const pageIds=[];
const contentIds=[];
const imageIds=[];
for(let i=0;i<pages;i+=1){
pageIds.push(writer.reserve());
contentIds.push(writer.reserve());
imageIds.push(jpegs?writer.reserve():null);
}
writer.object(font,
'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
const rows=ledger?ledgerRows():null;
const perPage=rows?Math.ceil(rows.length/pages):0;
for(let i=0;i<pages;i+=1){
let stream=rows
?pageStream(i+1,pages,rows.slice(i*perPage,(i+1)*perPage),
LEDGER_HEADINGS,LEDGER_COLUMNS)
:pageStream(i+1,pages,rowsFor(i+1));
if(jpegs){
const w=A4.width-112;
const h=Math.round(w*(jpegSize.height/jpegSize.width));
const draw=new TextEncoder().encode(
`\nq ${num(w)} 0 0 ${num(h)} 56 ${num(120)} cm /Im0 Do Q`);
const joined=new Uint8Array(stream.length+draw.length);
joined.set(stream,0);
joined.set(draw,stream.length);
stream=joined;
writer.stream(imageIds[i],
' /Type /XObject /Subtype /Image'
+` /Width ${jpegSize.width} /Height ${jpegSize.height}`
+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode',
jpegs[i%jpegs.length]);
}
writer.stream(contentIds[i],'',stream);
const xobject=jpegs?` /XObject << /Im0 ${imageIds[i]} 0 R >>`:'';
writer.object(pageIds[i],
`<< /Type /Page /Parent ${pagesId} 0 R`
+` /MediaBox [0 0 ${A4.width} ${A4.height}]`
+` /Resources << /Font << /F1 ${font} 0 R >>${xobject} >>`
+` /Contents ${contentIds[i]} 0 R >>`);
}
writer.object(pagesId,
`<< /Type /Pages /Count ${pages}`
+` /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] >>`);
writer.object(catalog,`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
const blob=writer.finish({root:catalog});
return new File([blob],name,{type:'application/pdf',lastModified:Date.now()});
}
export{textString};
