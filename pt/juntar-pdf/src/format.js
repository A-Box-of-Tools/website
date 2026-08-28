/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n,t){
if(!Number.isFinite(n)||n<0)return t('size.bytes',{n:0});
if(n<1024)return t('size.bytes',{n:Math.round(n)});
if(n<1024*1024)return t('size.kb',{n:(n/1024).toFixed(n<10240?1:0)});
return t('size.mb',{n:(n/(1024*1024)).toFixed(2)});
}
export function count(n,noun,t){
return t(`count.${noun}.${n === 1 ? 'one' : 'many'}`,{n});
}
export function shortName(text,most=28){
const name=String(text??'');
if(name.length<=most)return name;
return`${name.slice(0, most - 12)}…${name.slice(-11)}`;
}
