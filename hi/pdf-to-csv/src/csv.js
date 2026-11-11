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
function field(value){
const text=value===null||value===undefined?'':String(value);
return/[",\r\n]/.test(text)?`"${text.split('"').join('""')}"`:text;
}
export function toCsv(rows){
return'\ufeff'+rows.map((row)=>row.map(field).join(',')).join('\r\n')+'\r\n';
}
