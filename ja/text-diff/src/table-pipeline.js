/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{parseTable,typedColumns,LIMITS}from'./shared/table-data.js?v=3b3c2f8831';
function readsAsTable(table){
const records=table.rows.length+(table.header?1:0);
if(table.headers.length<2||!table.rows.length||records<2)return false;
if(table.shortRows>records*.2)return false;
if(table.header||table.delimiter==='\t')return true;
const cells=table.rows.flatMap(row=>row.slice(1)).filter(Boolean);
const spaced=cells.filter(cell=>cell.startsWith(' ')).length;
return spaced<=cells.length/2||typedColumns(table)>0;
}
export function tablePair(a,b){
const texts=[a,b];
try{
const tables=texts.map(text=>parseTable(text,{header:'auto'}));
if(!tables.every(readsAsTable))return null;
const files=texts.map((text,index)=>new File([text],index?'table-b.csv':'table-a.csv',{type:'text/csv'}));
return files.some(file=>file.size>LIMITS.inputChars)?null:files;
}catch{
return null;
}
}
