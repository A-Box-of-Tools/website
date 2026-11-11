/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
if('serviceWorker'in navigator&&window.isSecureContext){
const version=document.documentElement.dataset.offlineVersion;
if(/^[0-9a-f]{10}$/.test(version||'')){
navigator.serviceWorker.register(`sw.js?v=${version}`,{updateViaCache:'none'}).catch(()=>{});
}
}
