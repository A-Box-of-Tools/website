/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check (names mangled by esbuild) */
function c(t,e={}){return((document.querySelector(`#phrases [data-phrase="${t}"]`)??document.querySelector(`#frame-phrases [data-phrase="${t}"]`))?.textContent??t).replace(/\s+/g," ").trim().replace(/\{(\w+)\}/g,(n,r)=>r in e?String(e[r]):n)}export{c as phrase};
