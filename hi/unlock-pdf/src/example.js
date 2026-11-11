/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{PdfWriter,PT_PER_MM}from'./shared/pdf-page-writer.js?v=879b53dba1';
import{HEADINGS,rowsFor}from'./shared/example-statement.js?v=879b53dba1';
import{protect}from'./crypt.js?v=879b53dba1';
const A4={width:Math.round(210*PT_PER_MM),height:Math.round(297*PT_PER_MM)};
const COLUMNS=[56,150,260,420];
const PAGES=2;
const PERMISSIONS=-1&~(4|16);
const OWNER_PASSWORD='example-owner-password';
const literal=(s)=>s.replace(/([\\()])/g,'\\$1');
const latin1=(text)=>{
const out=new Uint8Array(text.length);
for(let i=0;i<text.length;i+=1)out[i]=text.charCodeAt(i)&0xff;
return out;
};
function pageStream(page,rows){
const top=A4.height-90;
const out=[];
out.push('0.12 0.21 0.31 rg');
out.push(`BT /F1 22 Tf 56 ${top + 26} Td (${literal(`STATEMENT ${page} / ${PAGES}`)}) Tj ET`);
out.push(`56 ${top + 14} m ${A4.width - 56} ${top + 14} l S`);
out.push('0.35 0.35 0.35 rg');
HEADINGS.forEach((heading,c)=>{
out.push(`BT /F1 9 Tf ${COLUMNS[c]} ${top - 10} Td (${literal(heading)}) Tj ET`);
});
out.push('0 0 0 rg');
rows.forEach((row,i)=>{
const y=top-34-i*22;
row.forEach((cell,c)=>{
out.push(`BT /F1 11 Tf ${COLUMNS[c]} ${y} Td (${literal(cell)}) Tj ET`);
});
});
return latin1(out.join('\n'));
}
export function makeExample(name='protected-statement.pdf'){
const id=crypto.getRandomValues(new Uint8Array(16));
const security=protect({ownerPassword:OWNER_PASSWORD,permissions:PERMISSIONS,id});
const writer=new PdfWriter();
const catalog=writer.reserve();
const pagesId=writer.reserve();
const font=writer.reserve();
const info=writer.reserve();
const encrypt=writer.reserve();
const pageIds=[];
const contentIds=[];
for(let i=0;i<PAGES;i+=1){
pageIds.push(writer.reserve());
contentIds.push(writer.reserve());
}
writer.object(font,
'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
for(let i=0;i<PAGES;i+=1){
writer.stream(contentIds[i],'',security.encrypt(pageStream(i+1,rowsFor(i+1)),
contentIds[i],0));
writer.object(pageIds[i],
`<< /Type /Page /Parent ${pagesId} 0 R`
+` /MediaBox [0 0 ${A4.width} ${A4.height}]`
+` /Resources << /Font << /F1 ${font} 0 R >> >>`
+` /Contents ${contentIds[i]} 0 R >>`);
}
writer.object(pagesId,
`<< /Type /Pages /Count ${PAGES}`
+` /Kids [${pageIds.map((pageId) => `${pageId} 0 R`).join(' ')}] >>`);
writer.object(catalog,`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
writer.object(info,`<< /Producer ${hex(security.encrypt(
    latin1('An office suite, restricted on export'), info, 0))}`
+` /Title ${hex(security.encrypt(latin1('Quarterly statement'), info, 0))} >>`);
writer.object(encrypt,security.dictionary);
return new File(
[writer.finish({
root:catalog,
info,
extra:` /Encrypt ${encrypt} 0 R /ID [${hex(id)} ${hex(id)}]`,
})],
name,
{type:'application/pdf',lastModified:Date.now()},
);
}
function hex(bytes){
let out='<';
for(const byte of bytes)out+=byte.toString(16).padStart(2,'0');
return`${out}>`;
}
