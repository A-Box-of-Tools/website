/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n,t){
if(n<1024)return t('size.bytes',{n});
if(n<1024*1024)return t('size.kb',{n:(n/1024).toFixed(n<10240?1:0)});
return t('size.mb',{n:(n/(1024*1024)).toFixed(2)});
}
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
