/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
(function(){
'use strict';
var CHOICE='abox-lang';
var MOVED='abox-lang-from';
var TAG=/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/i;
function read(store,key){
try{
var value=window[store].getItem(key);
return value&&TAG.test(value)?value:null;
}catch(err){
return null;
}
}
function forget(store,key){
try{
window[store].removeItem(key);
}catch(err){}
}
function remember(store,key,value){
try{
window[store].setItem(key,value);
}catch(err){}
}
function offered(){
var links=document.querySelectorAll('link[rel="alternate"][hreflang]');
var out=[];
for(var i=0;i<links.length;i+=1){
out.push({
tag:links[i].getAttribute('hreflang'),
path:new URL(links[i].getAttribute('href'),location.href).pathname,
});
}
return out;
}
function preferred(wanted,available){
for(var i=0;i<wanted.length;i+=1){
var want=String(wanted[i]).toLowerCase();
var root=want.split('-')[0];
for(var j=0;j<available.length;j+=1){
if(available[j].tag.toLowerCase()===want)return available[j];
}
for(var k=0;k<available.length;k+=1){
if(available[k].tag.toLowerCase().split('-')[0]===root)return available[k];
}
}
return null;
}
function named(available,tag){
for(var i=0;i<available.length;i+=1){
if(available[i].tag.toLowerCase()===String(tag).toLowerCase())return available[i];
}
return null;
}
var all=offered();
var here=document.documentElement.getAttribute('lang')||'';
var languages=[];
var base=null;
for(var i=0;i<all.length;i+=1){
if(all[i].tag==='x-default')base=all[i];
else languages.push(all[i]);
}
var leaving=false;
if(base&&languages.length>1&&base.path===location.pathname){
var choice=read('localStorage',CHOICE);
var want=(choice&&named(languages,choice))
||(choice?null:preferred(navigator.languages||[navigator.language],languages));
if(want&&want.path!==location.pathname){
remember('sessionStorage',MOVED,here);
leaving=true;
location.replace(want.path+location.search+location.hash);
}
}
document.addEventListener('click',function(event){
var target=event.target;
if(!target||!target.closest)return;
var link=target.closest('a[hreflang]');
if(!link||!link.closest('.lang-switch, .lang-pick, .lang-auto'))return;
var tag=link.getAttribute('hreflang');
if(tag&&TAG.test(tag))remember('localStorage',CHOICE,tag);
});
function ready(fn){
if(document.readyState!=='loading')fn();
else document.addEventListener('DOMContentLoaded',fn);
}
if(!leaving){
ready(function(){
var from=read('sessionStorage',MOVED);
forget('sessionStorage',MOVED);
if(!from||from===here)return;
var notice=document.getElementById('lang-auto');
var wanted='a[hreflang="'+from+'"]';
var link=document.querySelector('.lang-switch '+wanted+', .lang-pick '+wanted);
if(!notice||!link)return;
var back=notice.querySelector('.lang-auto-back');
if(!back)return;
back.setAttribute('href',link.getAttribute('href'));
back.setAttribute('hreflang',from);
back.setAttribute('lang',from);
back.textContent=link.textContent.trim();
notice.hidden=false;
});
}
}());
