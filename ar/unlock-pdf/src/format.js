/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function pages(n){
return{key:n===1?'count.pages.one':'count.pages.many',values:{n}};
}
export function scheme({cipher,bits,revision}){
return{key:cipher==='aes'?'scheme.aes':'scheme.rc4',values:{bits,r:revision}};
}
export function strength({cipher,bits,revision}){
if(cipher==='rc4')return bits<=40?'scheme.age.weak':'scheme.age.dated';
if(bits<=128)return'scheme.age.aes128';
return revision===5?'scheme.age.old256':'scheme.age.current';
}
export function outName(name){
const stem=name.replace(/\.pdf$/i,'')||'document';
return`${stem}-unlocked.pdf`;
}
