/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{exampleGifFile}from'./shared/example-gif.js?v=4784420433';
export async function makeExample(name='animation.gif'){
return exampleGifFile(name,{frames:24,delay:8});
}
