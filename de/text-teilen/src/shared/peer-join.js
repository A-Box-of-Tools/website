/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const HANDOFF='pairing.discovery-join';
const LIFETIME=30000;
export function openJoinedPage(href,{sourceUrl=location.href,open=(...args)=>window.open(...args),now=Date.now}={}){
let target;
try{
const source=new URL(sourceUrl);
target=new URL(href,source);
if(!['http:','https:'].includes(target.protocol)||target.origin!==source.origin||target.pathname!==source.pathname)return false;
}catch{return false;}
let page;
try{
page=open('about:blank','_blank');
if(!page)return false;
page.opener=null;
page.sessionStorage.clear();
page.sessionStorage.setItem(HANDOFF,JSON.stringify({href:target.href,time:now()}));
page.location.replace(target.href);
return true;
}catch{
try{page?.close();}catch{}
return false;
}
}
export function consumeJoinedPage({href=location.href,storage,now=Date.now}={}){
try{
storage??=globalThis.sessionStorage;
const raw=storage.getItem(HANDOFF);
storage.removeItem(HANDOFF);
if(!raw)return false;
const handoff=JSON.parse(raw);
const age=now()-handoff.time;
return handoff.href===href&&Number.isFinite(handoff.time)&&age>=0&&age<=LIFETIME;
}catch{return false;}
}
