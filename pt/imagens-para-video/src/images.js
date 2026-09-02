/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{loadImages as loadList}from'./shared/image-list.js';
export{decodeFull,moveItem,releaseItem,sortItems}from'./shared/image-list.js';
const THUMB_MAX=240;
export function loadImages(files,defaults){
return loadList(files,{
thumbMax:THUMB_MAX,
fields:()=>({frames:defaults.frames,seconds:defaults.seconds}),
});
}
