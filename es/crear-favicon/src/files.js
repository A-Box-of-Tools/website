/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{sizeText}from'./shared/format.js?v=a69b115f80';
export const bytes=(n,t)=>sizeText(n,t,{under:'size.bytes',kb:'auto',mb:2});
export const dimensions=(width,height)=>`${width} × ${height}`;
export const countOf=(n,noun,t)=>
t(`count.${noun}.${n === 1 ? 'one' : 'many'}`,{n});
export function iconName(sourceName,ext,website){
if(ext==='ico'&&website)return'favicon.ico';
return`${stemOf(sourceName)}.${ext}`;
}
export function stemOf(name){
return name.replace(/\.[^.]+$/,'').trim()||'icon';
}
export const folderFor=(name)=>stemOf(name).replace(/[\\/:*?"<>|]+/g,'-');
export function describe(sizes,storage,fit,transparent,t){
if(!sizes.length)return t('pick.none');
const fitKey=fit==='pad'
?`fit.pad.${transparent ? 'transparent' : 'colour'}`
:`fit.${fit}`;
return t('describe.line',{
count:countOf(sizes.length,'size',t),
list:listOf(sizes,t),
kind:t(`store.${storage}`),
fit:t(fitKey),
});
}
export function listOf(parts,t,key='join.list'){
return parts.reduce((a,b)=>t(key,{a,b}));
}
