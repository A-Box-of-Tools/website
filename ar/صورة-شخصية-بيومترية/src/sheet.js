/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{mmToPx}from'./geometry.js';
export const PAPERS=[
{id:'4x6',label:'4 x 6 inch print (10 x 15 cm)',widthMm:152.4,heightMm:101.6},
{id:'5x7',label:'5 x 7 inch print (13 x 18 cm)',widthMm:177.8,heightMm:127},
{id:'a4',label:'A4 sheet (210 x 297 mm)',widthMm:297,heightMm:210},
{id:'letter',label:'US Letter (8.5 x 11 inch)',widthMm:279.4,heightMm:215.9},
];
export const paperById=(id)=>PAPERS.find((paper)=>paper.id===id)??PAPERS[0];
const DEFAULT_MARGIN_MM=3;
const DEFAULT_GAP_MM=2;
function fitCount(spanMm,cellMm,gapMm){
if(cellMm<=0)return 0;
return Math.max(0,Math.floor((spanMm+gapMm)/(cellMm+gapMm)));
}
export function planSheet({photo,paper,dpi,marginMm=DEFAULT_MARGIN_MM,gapMm=DEFAULT_GAP_MM,rotate=false}){
const sheet=rotate
?{widthMm:paper.heightMm,heightMm:paper.widthMm}
:{widthMm:paper.widthMm,heightMm:paper.heightMm};
const usableW=sheet.widthMm-marginMm*2;
const usableH=sheet.heightMm-marginMm*2;
const columns=fitCount(usableW,photo.widthMm,gapMm);
const rows=fitCount(usableH,photo.heightMm,gapMm);
const toPx=(mm)=>Math.round(mmToPx(mm,dpi));
const canvas={width:toPx(sheet.widthMm),height:toPx(sheet.heightMm)};
const cells=[];
const marks=[];
if(columns>0&&rows>0){
const blockW=columns*photo.widthMm+(columns-1)*gapMm;
const blockH=rows*photo.heightMm+(rows-1)*gapMm;
const originX=(sheet.widthMm-blockW)/2;
const originY=(sheet.heightMm-blockH)/2;
for(let row=0;row<rows;row+=1){
for(let column=0;column<columns;column+=1){
cells.push({
x:toPx(originX+column*(photo.widthMm+gapMm)),
y:toPx(originY+row*(photo.heightMm+gapMm)),
width:toPx(photo.widthMm),
height:toPx(photo.heightMm),
});
}
}
marks.push(...cutMarks({
columns,rows,photo,gapMm,originX,originY,sheet,toPx,
}));
}
return{
canvas,
paper:sheet,
cells,
marks,
columns,
rows,
count:cells.length,
dpi,
};
}
function cutMarks({columns,rows,photo,gapMm,originX,originY,sheet,toPx}){
const marks=[];
const reachMm=Math.min(gapMm/2,2.5);
const columnEdges=[];
for(let column=0;column<columns;column+=1){
const left=originX+column*(photo.widthMm+gapMm);
columnEdges.push(left,left+photo.widthMm);
}
const rowEdges=[];
for(let row=0;row<rows;row+=1){
const top=originY+row*(photo.heightMm+gapMm);
rowEdges.push(top,top+photo.heightMm);
}
const blockTop=rowEdges[0];
const blockBottom=rowEdges[rowEdges.length-1];
const blockLeft=columnEdges[0];
const blockRight=columnEdges[columnEdges.length-1];
for(const edge of columnEdges){
marks.push({
x1:toPx(edge),y1:0,x2:toPx(edge),y2:toPx(Math.max(0,blockTop-reachMm)),
});
marks.push({
x1:toPx(edge),
y1:toPx(Math.min(sheet.heightMm,blockBottom+reachMm)),
x2:toPx(edge),
y2:toPx(sheet.heightMm),
});
}
for(const edge of rowEdges){
marks.push({
x1:0,y1:toPx(edge),x2:toPx(Math.max(0,blockLeft-reachMm)),y2:toPx(edge),
});
marks.push({
x1:toPx(Math.min(sheet.widthMm,blockRight+reachMm)),
y1:toPx(edge),
x2:toPx(sheet.widthMm),
y2:toPx(edge),
});
}
for(let column=1;column<columns;column+=1){
const gapCentre=originX+column*(photo.widthMm+gapMm)-gapMm/2;
for(const edge of rowEdges){
marks.push({
x1:toPx(gapCentre-reachMm),y1:toPx(edge),
x2:toPx(gapCentre+reachMm),y2:toPx(edge),
});
}
}
for(let row=1;row<rows;row+=1){
const gapCentre=originY+row*(photo.heightMm+gapMm)-gapMm/2;
for(const edge of columnEdges){
marks.push({
x1:toPx(edge),y1:toPx(gapCentre-reachMm),
x2:toPx(edge),y2:toPx(gapCentre+reachMm),
});
}
}
return marks;
}
export function bestSheet(options){
const upright=planSheet({...options,rotate:false});
const turned=planSheet({...options,rotate:true});
return turned.count>upright.count?turned:upright;
}
export function describeSheet(plan){
if(!plan.count)return'this photo does not fit on this paper at all.';
const copies=plan.count===1?'1 copy':`${plan.count} copies`;
return`${copies}, ${plan.columns} across and ${plan.rows} down`;
}
