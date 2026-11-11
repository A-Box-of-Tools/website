/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoFile}from'./shared/example-photo.js?v=a4518e3bf8';
const FRAMES=8;
export function makeExample(){
return Promise.all(Array.from({length:FRAMES},(unused,i)=>photoFile(
`example-${i + 1}.jpg`,
{width:640,height:480,shift:i*45},
)));
}
