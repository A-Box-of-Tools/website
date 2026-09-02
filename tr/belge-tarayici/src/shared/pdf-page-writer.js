/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const PT_PER_INCH=72;
export const PT_PER_MM=72/25.4;
export function num(value){
if(!Number.isFinite(value))return'0';
const fixed=value.toFixed(4);
return fixed.replace(/\.?0+$/,'')||'0';
}
function latin1(text){
const out=new Uint8Array(text.length);
for(let i=0;i<text.length;i+=1)out[i]=text.charCodeAt(i)&0xff;
return out;
}
export function textString(value){
let hex='FEFF';
for(const unit of utf16Units(value))hex+=unit.toString(16).padStart(4,'0').toUpperCase();
return`<${hex}>`;
}
function*utf16Units(value){
for(let i=0;i<value.length;i+=1)yield value.charCodeAt(i);
}
export class PdfWriter{
constructor(){
this.chunks=[];
this.length=0;
this.offsets=[];
this.raw(latin1('%PDF-1.7\n'));
this.raw(new Uint8Array([0x25,0xe2,0xe3,0xcf,0xd3,0x0a]));
}
raw(bytes){
this.chunks.push(bytes);
this.length+=bytes.length;
}
ascii(text){
this.raw(latin1(text));
}
reserve(){
this.offsets.push(0);
return this.offsets.length;
}
object(id,body){
this.offsets[id-1]=this.length;
this.ascii(`${id} 0 obj\n${body}\nendobj\n`);
}
stream(id,entries,data){
this.offsets[id-1]=this.length;
this.ascii(`${id} 0 obj\n<<${entries} /Length ${data.length}>>\nstream\n`);
this.raw(data);
this.ascii('\nendstream\nendobj\n');
}
finish({root,info}){
const start=this.length;
const count=this.offsets.length+1;
let table=`xref\n0 ${count}\n0000000000 65535 f\r\n`;
for(const offset of this.offsets){
table+=`${String(offset).padStart(10, '0')} 00000 n\r\n`;
}
this.ascii(table);
const trailer=info
?`<< /Size ${count} /Root ${root} 0 R /Info ${info} 0 R >>`
:`<< /Size ${count} /Root ${root} 0 R >>`;
this.ascii(`trailer\n${trailer}\nstartxref\n${start}\n%%EOF\n`);
return new Blob(this.chunks,{type:'application/pdf'});
}
}
