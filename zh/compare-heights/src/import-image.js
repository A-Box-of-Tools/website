/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const IMAGE_LIMITS={
bytes:12*1024*1024,
side:1400,
smallest:2,
};
const PNG_DATA=/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/;
export function fit(width,height,longest=IMAGE_LIMITS.side){
if(!(width>0)||!(height>0))return null;
const scale=Math.min(1,longest/Math.max(width,height));
return{
width:Math.max(1,Math.round(width*scale)),
height:Math.max(1,Math.round(height*scale)),
};
}
export function imageMarkup(href,aspect){
if(typeof href!=='string'||!PNG_DATA.test(href))return null;
if(!(aspect>0)||!Number.isFinite(aspect))return null;
const w=Math.round(aspect*1e6)/1e6;
return`<image href="${href}" x="${-w / 2}" y="0" width="${w}" height="1"`
+' preserveAspectRatio="none"/>';
}
export function nameFromFile(filename){
return String(filename).replace(/\.(png|svg)$/i,'').slice(0,40);
}
