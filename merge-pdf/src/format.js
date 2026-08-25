/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n){
if(!Number.isFinite(n)||n<0)return'0 bytes';
if(n<1024)return`${Math.round(n)} bytes`;
if(n<1024*1024)return`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
return`${(n / (1024 * 1024)).toFixed(2)} MB`;
}
export function count(n,singular,plural=`${singular}s`){
return`${n} ${n === 1 ? singular : plural}`;
}
export function shortName(text,most=28){
const name=String(text??'');
if(name.length<=most)return name;
return`${name.slice(0, most - 12)}…${name.slice(-11)}`;
}
