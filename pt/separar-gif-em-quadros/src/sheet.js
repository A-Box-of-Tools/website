/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const MAX_SIDE=16384;
export const CAUTION_SIDE=4096;
export function suggestColumns(count){
if(count<=0)return 0;
return Math.ceil(Math.sqrt(count));
}
export function sheetPlan(count,frameWidth,frameHeight,columns){
const cells=Math.max(0,Math.floor(count));
const wanted=Math.floor(columns)>0?Math.floor(columns):suggestColumns(cells);
const cols=Math.max(1,Math.min(wanted,cells||1));
const rows=cells>0?Math.ceil(cells/cols):0;
const width=cols*frameWidth;
const height=rows*frameHeight;
return{
cells,columns:cols,rows,width,height,
tooBig:width>MAX_SIDE||height>MAX_SIDE,
risky:width>CAUTION_SIDE||height>CAUTION_SIDE,
};
}
export function cellAt(index,plan,frameWidth,frameHeight){
return{
x:(index%plan.columns)*frameWidth,
y:Math.floor(index/plan.columns)*frameHeight,
};
}
export function sheetName(base,plan){
return`${base}-sheet-${plan.columns}x${plan.rows}.png`;
}
