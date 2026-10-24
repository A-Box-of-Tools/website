/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{markSvg}from'./shared/example-mark.js?v=92104b0767';
export function makeExample(){
return new File([markSvg()],'example.svg',{type:'image/svg+xml'});
}
