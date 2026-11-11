/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const CODE_PATTERN=/^[a-z0-9][a-z0-9-]{0,63}$/;
export function normalize(raw){
return raw.toLowerCase()
.replace(/[\s_]+/g,'-')
.replace(/[^a-z0-9-]/g,'')
.replace(/-+/g,'-')
.replace(/^-|-$/g,'')
.slice(0,64);
}
