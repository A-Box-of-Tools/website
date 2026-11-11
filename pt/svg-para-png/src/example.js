/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markSvg}from'./shared/example-mark.js?v=ef2404b66a';
export function makeExample(){
return new File([markSvg()],'example.svg',{type:'image/svg+xml'});
}
