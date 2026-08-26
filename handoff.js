/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
(function(){
'use strict';
var DB='abox-handoff';
var STORE='files';
var FRESH=10*60*1000;
function open(){
return new Promise(function(resolve,reject){
var req=window.indexedDB.open(DB,1);
req.onupgradeneeded=function(){req.result.createObjectStore(STORE);};
req.onsuccess=function(){resolve(req.result);};
req.onerror=function(){reject(req.error);};
});
}
function inStore(mode,use){
return open().then(function(db){
return new Promise(function(resolve,reject){
var tx=db.transaction(STORE,mode);
var req=use(tx.objectStore(STORE));
tx.oncomplete=function(){db.close();resolve(req&&req.result);};
tx.onerror=function(){db.close();reject(tx.error);};
});
});
}
function park(slug,record){
return inStore('readwrite',function(store){return store.put(record,slug);});
}
function take(slug){
return inStore('readwrite',function(store){
var got=store.get(slug);
got.onsuccess=function(){store.delete(slug);};
return got;
});
}
function sweep(){
return inStore('readwrite',function(store){
var walk=store.openCursor();
walk.onsuccess=function(){
var cursor=walk.result;
if(!cursor)return;
var record=cursor.value;
if(!record||!record.time||Date.now()-record.time>FRESH)cursor.delete();
cursor.continue();
};
return null;
});
}
var page=document.getElementById('feedback');
var slug=page?page.getAttribute('data-tool'):'';
function deliver(file){
var input=document.getElementById('file-input');
if(!input||typeof DataTransfer==='undefined')return;
var carrier=new DataTransfer();
carrier.items.add(file);
input.files=carrier.files;
input.dispatchEvent(new Event('change',{bubbles:true}));
}
function receive(){
if(!slug)return;
take(slug).then(function(record){
if(record&&record.file&&record.time
&&Date.now()-record.time<=FRESH){
deliver(record.file);
}
return sweep();
}).catch(function(){
});
}
if(document.readyState==='complete')receive();
else window.addEventListener('load',receive,{once:true});
var nav=document.getElementById('handoff');
if(!nav)return;
function result(){
var anchor=document.getElementById('download');
if(!anchor||anchor.hidden||!anchor.hasAttribute('download'))return null;
var href=anchor.getAttribute('href')||'';
return href.indexOf('blob:')===0?anchor:null;
}
function show(){
var anchor=result();
if(!anchor){
if(!nav.hidden)nav.hidden=true;
return;
}
var host=anchor.closest('.toolbar')||anchor;
if(!host.parentNode)return;
if(host.nextElementSibling!==nav)host.insertAdjacentElement('afterend',nav);
if(nav.hidden)nav.hidden=false;
}
var watch=new MutationObserver(show);
watch.observe(document.body,{
subtree:true,attributes:true,attributeFilter:['href','hidden'],
});
show();
nav.addEventListener('click',function(event){
var link=event.target&&event.target.closest
?event.target.closest('a[data-slug]'):null;
if(!link)return;
var anchor=result();
if(!anchor)return;
event.preventDefault();
var name=anchor.getAttribute('download')||'result';
window.fetch(anchor.href)
.then(function(response){return response.blob();})
.then(function(blob){
var file=new File([blob],name,{type:blob.type});
return park(link.getAttribute('data-slug'),
{file:file,from:slug,time:Date.now()});
})
.catch(function(){})
.then(function(){window.location.assign(link.href);});
});
})();
