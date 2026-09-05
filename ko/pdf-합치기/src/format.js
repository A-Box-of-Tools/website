/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{sizeText}from'./shared/format.js?v=9577a93b49';
export const bytes=(n,t)=>sizeText(n,t,{under:'size.bytes',kb:'auto',mb:2});
export function count(n,noun,t){
return t(`count.${noun}.${n === 1 ? 'one' : 'many'}`,{n});
}
export function shortName(text,most=28){
const name=String(text??'');
if(name.length<=most)return name;
return`${name.slice(0, most - 12)}…${name.slice(-11)}`;
}
