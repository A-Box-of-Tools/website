/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{PdfWriter,PT_PER_INCH,PT_PER_MM,num,textString}from'./pdf.js';
const PRODUCER='abox.tools document scanner';
export const PAGE_SIZES={
a4:[210,297],
a5:[148,210],
letter:[215.9,279.4],
legal:[215.9,355.6],
};
export function layoutPage(page,settings){
const margin=Math.max(0,Number(settings.margin)||0)*PT_PER_MM;
if(settings.pageSize==='fit'){
const dpi=Math.min(1200,Math.max(36,Number(settings.dpi)||200));
const width=(page.width*PT_PER_INCH)/dpi;
const height=(page.height*PT_PER_INCH)/dpi;
return{
width:width+margin*2,
height:height+margin*2,
rect:{x:margin,y:margin,width,height},
};
}
const[shortSide,longSide]=PAGE_SIZES[settings.pageSize]??PAGE_SIZES.a4;
const portrait=page.height>=page.width;
const sheet=portrait
?[shortSide*PT_PER_MM,longSide*PT_PER_MM]
:[longSide*PT_PER_MM,shortSide*PT_PER_MM];
const box={
x:margin,
y:margin,
width:Math.max(1,sheet[0]-margin*2),
height:Math.max(1,sheet[1]-margin*2),
};
const scale=Math.min(box.width/page.width,box.height/page.height);
const width=page.width*scale;
const height=page.height*scale;
return{
width:sheet[0],
height:sheet[1],
rect:{
x:box.x+(box.width-width)/2,
y:box.y+(box.height-height)/2,
width,
height,
},
};
}
export function buildDocument(pages,settings){
if(!pages.length)throw new Error('There are no pages to write.');
const pdf=new PdfWriter();
const catalog=pdf.reserve();
const tree=pdf.reserve();
const ids=[];
for(const page of pages){
ids.push(writePage(pdf,tree,page,layoutPage(page,settings)));
}
pdf.object(catalog,`<< /Type /Catalog /Pages ${tree} 0 R >>`);
pdf.object(tree,`<< /Type /Pages /Count ${ids.length} `
+`/Kids [${ids.map((id) => `${id} 0 R`).join(' ')}] >>`);
const info=writeInfo(pdf,settings);
return pdf.finish({root:catalog,info});
}
function writePage(pdf,tree,image,sheet){
const imageId=pdf.reserve();
const contentsId=pdf.reserve();
const pageId=pdf.reserve();
const bits=image.kind==='flate1'?1:8;
pdf.stream(imageId,' /Type /XObject /Subtype /Image'
+` /Width ${image.width} /Height ${image.height}`
+` /ColorSpace ${image.gray ? '/DeviceGray' : '/DeviceRGB'}`
+` /BitsPerComponent ${bits}`
+(image.kind==='dct'?' /Filter /DCTDecode':' /Filter /FlateDecode'),image.data);
pdf.stream(contentsId,'',contentStream(sheet));
pdf.object(pageId,`<< /Type /Page /Parent ${tree} 0 R`
+` /MediaBox [0 0 ${num(sheet.width)} ${num(sheet.height)}]`
+` /Resources << /XObject << /Im0 ${imageId} 0 R >> >>`
+` /Contents ${contentsId} 0 R >>`);
return pageId;
}
function contentStream(sheet){
const{rect}=sheet;
const lines=[
'q',
'1 1 1 rg',
`0 0 ${num(sheet.width)} ${num(sheet.height)} re f`,
`${num(rect.width)} 0 0 ${num(rect.height)} ${num(rect.x)} ${num(rect.y)} cm`,
'/Im0 Do',
'Q',
'',
];
return new TextEncoder().encode(lines.join('\n'));
}
function writeInfo(pdf,settings){
const entries=[`/Producer ${textString(PRODUCER)}`];
const title=settings.title?.trim();
if(title)entries.push(`/Title ${textString(title)}`);
const id=pdf.reserve();
pdf.object(id,`<< ${entries.join(' ')} >>`);
return id;
}
