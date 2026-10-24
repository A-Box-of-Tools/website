/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{cellsOf}from'./tables.js?v=d4c7e8c12a';
import{isData,isValue,looksNumeric,parseAmount,parseDate}from'./values.js?v=d4c7e8c12a';
const CONTINUED=1.6;
const MAX_HEADING_LINES=3;
const STRAY=1/3;
const MOSTLY=0.6;
export function buildTable(table,{order='dmy',mark='.'}={}){
const columns=table.columns.map((column)=>({...column}));
const blocks=table.blocks.map((block)=>block.lines.map((line)=>({
page:block.page,line,cells:cellsOf(line,columns),
})));
const everything=blocks.flat();
const anyData=everything.some((entry)=>entry.cells.some(isData));
let headers=columns.map(()=>'');
const rows=[];
blocks.forEach((entries,index)=>{
const top=headingLines(entries,anyData);
let body=entries;
if(index===0){
headers=stack(top,columns.length);
body=entries.slice(top.length);
}else{
for(let count=top.length;count>0;count-=1){
if(same(stack(top.slice(0,count),columns.length),headers)){
body=entries.slice(count);
break;
}
}
}
placeRows(body.filter((entry)=>!isPageMarker(entry)),rows);
});
foldStrays(headers,rows,columns);
return{
headers,
rows,
columns,
page:table.page,
dateColumn:dateColumnOf(rows,headers.length,order),
moneyColumns:moneyColumnsOf(rows,headers.length,mark),
};
}
function headingLines(entries,anyData){
if(!anyData)return entries.length>1?entries.slice(0,1):[];
const top=[];
for(const entry of entries){
if(entry.cells.some(isData))break;
top.push(entry);
if(top.length>MAX_HEADING_LINES)return[];
}
return top.length===entries.length?[]:top;
}
function stack(entries,width){
const out=new Array(width).fill('');
for(const entry of entries){
entry.cells.forEach((cell,at)=>{
if(cell)out[at]=out[at]?`${out[at]} ${cell}`:cell;
});
}
return out;
}
function placeRows(entries,rows){
let previous=null;
let waiting=[];
entries.forEach((entry,index)=>{
if(loose(entry)){
const at=entry.cells.findIndex(Boolean);
const up=previous&&textAt(previous.row,at)?spacing(previous.line,entry.line):Infinity;
const next=entries[index+1];
const down=next?spacing(entry.line,next.line):Infinity;
if(up<=CONTINUED&&up<=down){
previous.row.cells[at]=`${previous.row.cells[at]} ${entry.cells[at]}`;
previous={row:previous.row,line:entry.line};
return;
}
if(down<=CONTINUED){
waiting.push(entry);
return;
}
}
const row={page:entry.page,cells:[...entry.cells]};
for(const held of waiting){
const at=held.cells.findIndex(Boolean);
if(textAt(row,at)||!row.cells[at]){
row.cells[at]=[held.cells[at],row.cells[at]].filter(Boolean).join(' ');
}else{
rows.push({page:held.page,cells:[...held.cells]});
}
}
waiting=[];
if(!row.cells.some(Boolean))return;
rows.push(row);
previous={row,line:entry.line};
});
for(const held of waiting)rows.push({page:held.page,cells:[...held.cells]});
}
function loose(entry){
const filled=entry.cells.filter(Boolean);
return filled.length===1&&!isValue(filled[0]);
}
function textAt(row,at){
return Boolean(row.cells[at])&&!isValue(row.cells[at]);
}
function spacing(upper,lower){
return(upper.y-lower.y)/Math.max(upper.height,lower.height,1);
}
function same(a,b){
return a.length===b.length&&a.every((cell,at)=>cell===b[at]);
}
function isPageMarker(entry){
const text=entry.cells.filter(Boolean).join(' ').trim();
return/^(?:page\s*)?\d+\s*(?:of|\/)\s*\d+$/i.test(text)
||/^page\s*\d+$/i.test(text)
||/^[-–]\s*\d+\s*[-–]$/.test(text);
}
function foldStrays(headers,rows,columns){
if(!headers.some(Boolean)||rows.length<3)return;
for(let at=columns.length-1;at>=0&&columns.length>2;at-=1){
if(headers[at])continue;
const filled=rows.filter((row)=>row.cells[at]).length;
if(filled/rows.length>=STRAY)continue;
const into=foldInto(at,rows,columns);
for(const row of rows){
const piece=row.cells[at];
if(!piece)continue;
const other=row.cells[into];
row.cells[into]=into<at?[other,piece].filter(Boolean).join(' ')
:[piece,other].filter(Boolean).join(' ');
}
for(const row of rows)row.cells.splice(at,1);
headers.splice(at,1);
columns.splice(at,1);
}
}
function foldInto(at,rows,columns){
const leftGap=at>0?columns[at].x0-columns[at-1].x1:Infinity;
const rightGap=at<columns.length-1?columns[at+1].x0-columns[at].x1:Infinity;
const nearer=leftGap<=rightGap?at-1:at+1;
const further=nearer===at-1?at+1:at-1;
const pieces=rows.map((row)=>row.cells[at]).filter(Boolean);
const words=pieces.some((piece)=>!isValue(piece)&&!/^(?:CR|DR|[-+])$/i.test(piece));
if(!words||further<0||further>=columns.length)return nearer;
const wordy=(column)=>{
const cells=rows.map((row)=>row.cells[column]).filter(Boolean);
return cells.length&&cells.filter((cell)=>!isValue(cell)).length>=cells.length/2;
};
return wordy(nearer)||!wordy(further)?nearer:further;
}
function dateColumnOf(rows,width,order){
let best=-1;
let bestCount=0;
for(let at=0;at<width;at+=1){
const count=rows.filter((row)=>parseDate(row.cells[at],order)!==null).length;
if(count>bestCount){
bestCount=count;
best=at;
}
}
return bestCount>=Math.max(2,rows.length*MOSTLY)?best:-1;
}
function moneyColumnsOf(rows,width,mark){
const columns=[];
const fraction=new RegExp(`\\${mark}\\d{1,2}(?!\\d)`);
for(let at=0;at<width;at+=1){
let filled=0;
let parsed=0;
let fractional=0;
for(const row of rows){
const cell=row.cells[at];
if(!cell)continue;
filled+=1;
if(!looksNumeric(cell)||parseAmount(cell,mark)===null)continue;
parsed+=1;
if(fraction.test(cell))fractional+=1;
}
if(filled&&parsed>=filled*MOSTLY&&fractional>=parsed*MOSTLY)columns.push(at);
}
return columns;
}
