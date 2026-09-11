/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markSvg}from'./shared/example-mark.js?v=0c9c52952c';
export function makeExample(){
return new File([markSvg()],'example.svg',{type:'image/svg+xml'});
}
