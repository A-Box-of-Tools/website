/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{photoFile}from'./shared/example-photo.js?v=d057103c7b';
const FRAMES=12;
export function makeExample(){
return Promise.all(Array.from({length:FRAMES},(unused,i)=>photoFile(
`example-${String(i + 1).padStart(2, '0')}.jpg`,
{width:1280,height:720,shift:i*60},
)));
}
