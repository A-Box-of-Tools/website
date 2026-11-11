/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function pages(n){
return{key:n===1?'count.pages.one':'count.pages.many',values:{n}};
}
export function outName(name){
const stem=name.replace(/\.pdf$/i,'')||'document';
return`${stem}-watermarked.pdf`;
}
