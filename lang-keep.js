/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
(function(){
'use strict';
var DB='abox-lang-keep';
var STORE='work';
var FRESH=2*60*1000;
var IGNORE={
file:true,hidden:true,password:true,
button:true,submit:true,reset:true,image:true,
'select-multiple':true,
};
var page=document.getElementById('feedback');
var slug=page?page.getAttribute('data-tool'):'';
var main=document.getElementById('main');
var here=document.documentElement.getAttribute('lang')||'';
var input=document.getElementById('file-input');
if(!slug||!main)return;
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
function park(record){
return inStore('readwrite',function(store){return store.put(record,slug);});
}
function take(){
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
function fallback(node){
var options=node.options;
for(var i=0;i<options.length;i+=1){
if(options[i].defaultSelected)return options[i].value;
}
return options.length?options[0].value:'';
}
function keyOf(node){
if(node.id)return'#'+node.id;
var type=String(node.type||'').toLowerCase();
var name=node.getAttribute('name');
if(name){
return'@'+name
+(type==='radio'||type==='checkbox'?'='+node.value:'');
}
var data=[];
var attrs=node.attributes;
for(var i=0;i<attrs.length;i+=1){
if(attrs[i].name.indexOf('data-')===0){
data.push(attrs[i].name+'='+attrs[i].value);
}
}
return data.length?'~'+data.sort().join('&'):'';
}
function settings(){
var out=[];
var nodes=main.querySelectorAll('input, textarea, select');
for(var i=0;i<nodes.length;i+=1){
var node=nodes[i];
var type=String(node.type||'').toLowerCase();
if(node.disabled||node.readOnly||IGNORE[type])continue;
var key=keyOf(node);
if(!key)continue;
if(type==='checkbox'||type==='radio'){
if(node.checked!==node.defaultChecked)out.push({key:key,on:node.checked});
}else if(node.tagName==='SELECT'){
if(node.value!==fallback(node))out.push({key:key,value:node.value});
}else if(node.value!==node.defaultValue){
out.push({key:key,value:node.value});
}
}
return out;
}
function find(key){
var nodes=main.querySelectorAll('input, textarea, select');
for(var i=0;i<nodes.length;i+=1){
if(keyOf(nodes[i])===key)return nodes[i];
}
return null;
}
function apply(values){
for(var i=0;i<values.length;i+=1){
var want=values[i];
var node=want.key?find(want.key):null;
if(!node)continue;
if(typeof want.on==='boolean'){
if(node.checked===want.on)continue;
node.checked=want.on;
}else{
if(node.value===want.value)continue;
node.value=want.value;
if(node.value!==want.value)continue;
}
node.dispatchEvent(new Event('input',{bubbles:true}));
node.dispatchEvent(new Event('change',{bubbles:true}));
}
}
var held=[];
var restoring=false;
function note(files){
var picked=[];
for(var i=0;i<(files?files.length:0);i+=1)picked.push(files[i]);
if(!picked.length)return;
held=(input&&input.multiple&&!restoring)?held.concat(picked):picked;
}
if(input){
input.addEventListener('change',function(){note(input.files);});
}
document.addEventListener('drop',function(event){
var target=event.target;
if(!target||!target.closest||!target.closest('#dropzone'))return;
if(event.dataTransfer)note(event.dataTransfer.files);
},true);
function deliver(files){
if(!input||!files.length||typeof DataTransfer==='undefined')return;
var carrier=new DataTransfer();
for(var i=0;i<files.length;i+=1)carrier.items.add(files[i]);
input.files=carrier.files;
restoring=true;
input.dispatchEvent(new Event('change',{bubbles:true}));
restoring=false;
}
function receive(){
take().then(function(record){
if(record&&record.time&&Date.now()-record.time<=FRESH
&&record.lang&&record.lang!==here){
if(record.files)deliver(record.files);
if(record.values)apply(record.values);
}
return sweep();
}).catch(function(){
});
}
if(document.readyState==='complete')receive();
else window.addEventListener('load',receive,{once:true});
var carrying=false;
document.addEventListener('click',function(event){
if(event.defaultPrevented||event.button!==0)return;
if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
var target=event.target;
if(!target||!target.closest)return;
var link=target.closest('a[hreflang]');
if(!link||!link.closest('.lang-switch, .lang-pick, .lang-auto'))return;
if(carrying){event.preventDefault();return;}
var values=settings();
if(!values.length&&!held.length)return;
event.preventDefault();
carrying=true;
link.setAttribute('aria-busy','true');
park({lang:here,values:values,files:held,time:Date.now()})
.catch(function(){
})
.then(function(){window.location.assign(link.href);});
});
}());
