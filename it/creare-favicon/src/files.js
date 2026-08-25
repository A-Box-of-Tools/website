/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n){
if(n<1024)return`${n} bytes`;
if(n<1024*1024)return`${(n / 1024).toFixed(n < 10240 ? 1 : 0)} KB`;
return`${(n / (1024 * 1024)).toFixed(2)} MB`;
}
export const dimensions=(width,height)=>`${width} × ${height}`;
export const countOf=(n)=>`${n} image${n === 1 ? '' : 's'}`;
export function iconName(sourceName,ext,website){
if(ext==='ico'&&website)return'favicon.ico';
return`${stemOf(sourceName)}.${ext}`;
}
export function stemOf(name){
return name.replace(/\.[^.]+$/,'').trim()||'icon';
}
export const folderFor=(name)=>stemOf(name).replace(/[\\/:*?"<>|]+/g,'-');
export function describe(sizes,storage,fit,transparent){
if(!sizes.length)return'Tick at least one size.';
const kinds={
auto:'stored the pre-Vista way up to 64 pixels and as PNG above that',
png:'every size stored as PNG',
bmp:'every size stored the pre-Vista way',
};
const fits={
pad:transparent
?'padded to a square, with the padding left transparent'
:'padded to a square on the background colour',
crop:'cropped to the square in the middle',
stretch:'stretched to a square',
};
return`${sizes.length} size${sizes.length === 1 ? '' : 's'} - ${sizes.join(', ')} `
+`- ${kinds[storage]}. A picture that is not already square is ${fits[fit]}.`;
}
