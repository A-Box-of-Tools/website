/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function columnLetter(index){
let name='';
let at=index;
do{
name=String.fromCharCode(65+(at%26))+name;
at=Math.floor(at/26)-1;
}while(at>=0);
return name;
}
const NUMBER=/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const FORMULA=/^[\s]*[=+\-@＝＋－＠]|^[\t\r\n]/;
export function csvValue(cell,{spreadsheetSafe=false}={}){
const typed=cell!==null&&typeof cell==='object';
const text=String((typed?cell.value:cell)??'');
const numeric=typeof cell==='number'&&Number.isFinite(cell)
||typed&&cell.numeric===true&&NUMBER.test(text);
return spreadsheetSafe&&!numeric&&FORMULA.test(text)?`'${text}`:text;
}
export function formulaCells(rows){
return rows.reduce((count,row)=>count+row.filter((cell)=>
csvValue(cell,{spreadsheetSafe:true})!==csvValue(cell)).length,0);
}
function field(value,options){
const text=csvValue(value,options);
const quote=/[",\r\n]/.test(text)||text!==csvValue(value);
return quote?`"${text.split('"').join('""')}"`:text;
}
export function toCsv(rows,options={}){
return'\ufeff'+rows.map((row)=>row.map((cell)=>field(cell,options)).join(','))
.join('\r\n')+'\r\n';
}
