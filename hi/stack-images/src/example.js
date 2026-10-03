/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoFile}from'./shared/example-photo.js?v=a2fc99e04f';
const FRAMES=6;
export function makeExample(){
return Promise.all(Array.from({length:FRAMES},(unused,i)=>photoFile(
`example-${i + 1}.jpg`,
{width:1280,height:960,grainSeed:5000+i*977},
)));
}
