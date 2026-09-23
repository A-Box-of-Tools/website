/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
if('serviceWorker'in navigator&&window.isSecureContext){
navigator.serviceWorker.register('sw.js').catch(()=>{});
}
