/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function fileSize(count){
if(count<1024)return`${count} B`;
if(count<1024*1024)return`${(count / 1024).toFixed(count < 10240 ? 1 : 0)} KB`;
return`${(count / 1048576).toFixed(count < 10485760 ? 2 : 1)} MB`;
}
export const exact=(count)=>`${count.toLocaleString()} bytes`;
export const count=(value)=>value.toLocaleString();
export function millimetres(value){
const size=Math.abs(value);
if(size>=100)return`${value.toFixed(0)} mm`;
if(size>=10)return`${value.toFixed(1)} mm`;
return`${value.toFixed(2)} mm`;
}
export function quantity(value,unit,t){
const shown=Number.isInteger(value)?String(value)
:Math.abs(value)>=100?value.toFixed(1):value.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');
return unit?t('unit.value',{n:shown,unit}):shown;
}
export const windowLabel=(center,width)=>`C ${Math.round(center)} / W ${Math.round(width)}`;
