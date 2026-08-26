/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function phrase(key,values={}){
const found=document.querySelector(`#phrases [data-phrase="${key}"]`)
??document.querySelector(`#frame-phrases [data-phrase="${key}"]`);
const text=(found?.textContent??key).replace(/\s+/g,' ').trim();
return text.replace(/\{(\w+)\}/g,(whole,name)=>(
name in values?String(values[name]):whole));
}
