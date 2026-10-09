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
function deliver(files){
var input=document.getElementById('file-input');
if(!input||!files.length||typeof DataTransfer==='undefined')return;
var carrier=new DataTransfer();
for(var i=0;i<files.length;i++)carrier.items.add(files[i]);
input.files=carrier.files;
input.dispatchEvent(new Event('change',{bubbles:true}));
}
function carried(record){
if(!record)return[];
if(record.files&&record.files.length)return record.files;
return record.file?[record.file]:[];
}
function receive(){
if(!slug)return;
take(slug).then(function(record){
if(record&&record.time&&Date.now()-record.time<=FRESH){
deliver(carried(record));
}
return sweep();
}).catch(function(){
});
}
if(document.readyState==='complete')receive();
else window.addEventListener('load',receive,{once:true});
var nav=document.getElementById('handoff');
if(!nav)return;
function carriable(anchor){
if(!anchor||anchor.hidden||!anchor.hasAttribute('download'))return false;
var href=anchor.getAttribute('href')||'';
if(href.indexOf('blob:')!==0)return false;
return anchor.offsetParent!==null;
}
function results(){
var found=[];
var one=document.getElementById('download');
if(carriable(one))found.push(one);
var rows=document.querySelectorAll('.result-list a[download]');
for(var i=0;i<rows.length;i++){
if(carriable(rows[i]))found.push(rows[i]);
}
return found;
}
function firstResult(){
var one=document.getElementById('download');
if(carriable(one))return one;
var rows=document.querySelectorAll('.result-list a[download]');
for(var i=0;i<rows.length;i++){
if(carriable(rows[i]))return rows[i];
}
return null;
}
function seat(anchor){
var node=anchor;
while(node.parentNode&&node.parentNode!==document.body){
var parent=node.parentNode;
var display=window.getComputedStyle(parent).display;
if(display==='block'||display==='flow-root'||display==='none'){
return parent;
}
node=parent;
}
return null;
}
function show(){
var anchor=firstResult();
if(!anchor){
return;
}
if(!nav.hidden&&nav.parentNode&&nav.parentNode!==document.body
&&nav.parentNode.contains(anchor)&&nav.parentNode.lastElementChild===nav){
return;
}
var host=seat(anchor);
if(host){
if(host.lastElementChild!==nav)host.appendChild(nav);
}else if(anchor.parentNode&&anchor.nextElementSibling!==nav){
anchor.insertAdjacentElement('afterend',nav);
}
if(nav.hidden)nav.hidden=false;
}
var watch=new MutationObserver(show);
watch.observe(document.body,{
subtree:true,childList:true,
attributes:true,attributeFilter:['href','hidden'],
});
show();
var carrying=false;
nav.addEventListener('click',function(event){
var link=event.target&&event.target.closest
?event.target.closest('a[data-slug]'):null;
if(!link)return;
if(carrying){event.preventDefault();return;}
var anchors=results();
if(!anchors.length)return;
event.preventDefault();
carrying=true;
link.setAttribute('aria-busy','true');
window.Promise.all(anchors.map(function(anchor){
return window.fetch(anchor.href)
.then(function(response){return response.blob();})
.then(function(blob){
return new File([blob],anchor.getAttribute('download')||'result',
{type:blob.type});
});
}))
.then(function(files){
return park(link.getAttribute('data-slug'),
{files:files,from:slug,time:Date.now()});
})
.catch(function(){})
.then(function(){window.location.assign(link.href);});
});
})();
