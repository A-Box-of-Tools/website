/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function acceptsImageFile(file,extensions=[],mimeTypes=null){
const mime=String(file?.type??'').toLowerCase();
const declared=mimeTypes===null
?mime.startsWith('image/')
:mimeTypes.some(type=>type.toLowerCase()===mime);
if(declared)return true;
const extension=/\.([a-z0-9]+)$/i.exec(String(file?.name??''))?.[1]?.toLowerCase();
return Boolean(extension&&extensions.some(value=>value.replace(/^\./,'').toLowerCase()===extension));
}
