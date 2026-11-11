/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
(function(){
'use strict';
var box=document.getElementById('tool-filter');
var input=document.getElementById('tool-filter-input');
var empty=document.getElementById('tool-filter-none');
if(!box||!input||!empty)return;
function fold(text){
return text.toLowerCase().normalize('NFD')
.replace(/[\u0300-\u036f]/g,'')
.replace(/[-\u2010-\u2015\u2212]/g,'')
.replace(/\bjpeg\b/g,'jpg');
}
var formats={
'resize-image':['jpg png webp gif bmp avif','jpg png webp'],
'heic-to-jpg':['heic heif','jpg png webp'],
'webp-to-jpg':['webp','jpg'],
'png-to-webp':['png','webp'],
'avif-to-jpg':['avif','jpg'],
'svg-to-image':['svg','png jpg webp'],
'image-to-svg':['jpg png webp','svg'],
'image-to-ico':['jpg png webp','ico icns'],
'convert-to-mp4':['webm mkv mov mp4','mp4'],
'gif-to-mp4':['gif','mp4'],
'video-to-gif':['mp4 webm mov','gif'],
'yaml-to-json':['yaml yml json','yaml yml json'],
'xml-formatter':['xml json','xml json'],
'json-formatter':['json xml html css yaml yml','json xml html css yaml yml']
};
var connectors=/^(to|into|a|al|para|de|em|en|zu|in|nach|convert|convertir|converter|umwandeln)$/;
var fileFormat=/^(jpg|png|webp|gif|bmp|avif|heic|heif|svg|ico|icns|webm|mkv|mov|mp4|yaml|yml|json|xml|html|css)$/;
var groups=[];
var items=[];
Array.prototype.forEach.call(
document.querySelectorAll('main .category'),function(section){
var heading=section.querySelector('h2');
var note=section.querySelector('.category-note');
var toggle=section.querySelector('.category-toggle');
var groupText=fold(
(heading?heading.textContent:'')+' '+(note?note.textContent:''));
var rows=[];
Array.prototype.forEach.call(
section.querySelectorAll('.tool-grid > li'),function(row){
var card=row.querySelector('a.tool-card');
var slug=card?card.getAttribute('data-tool'):'';
var capability=formats[slug];
var description=card?card.getAttribute('data-search')||'':'';
var entry={row:row,slug:slug,capability:capability,
card:card,description:description,
category:heading?heading.textContent.trim():'',
text:fold(row.textContent+' '+description)+' '+groupText
+' '+(capability?capability.join(' '):'')};
rows.push(entry);
items.push(entry);
});
groups.push({
section:section,
rows:rows,
toggle:toggle,
more:section.querySelector('.category-more'),
less:section.querySelector('.category-less'),
expanded:!toggle
});
});
if(!items.length)return;
function matching(value){
var query=fold(value.trim());
var terms=query.split(/\s+/).filter(function(term){
return term&&!connectors.test(term);
});
var conversion=terms.length===2&&fileFormat.test(terms[0])
&&fileFormat.test(terms[1])&&query.split(/\s+/).length>2;
return{
query:query,
matches:function(entry){
var match=!query||entry.text.indexOf(query)!==-1
||(terms.length>0&&terms.every(function(term){
return entry.text.indexOf(term)!==-1;
}));
if(conversion){
match=!!entry.capability
&&entry.capability[0].split(' ').indexOf(terms[0])!==-1
&&entry.capability[1].split(' ').indexOf(terms[1])!==-1;
if(entry.slug==='json-formatter'&&terms[0]!==terms[1]){
match=(terms[0]==='json'&&/^(xml|yaml|yml)$/.test(terms[1]))
||(terms[1]==='json'&&/^(xml|yaml|yml)$/.test(terms[0]));
}
}
return match;
}
};
}
function apply(){
var search=matching(input.value);
var query=search.query;
var shown=0;
groups.forEach(function(group){
var visible=0;
group.rows.forEach(function(entry,index){
var match=search.matches(entry);
entry.row.hidden=!match||(!query&&!group.expanded&&index>=3);
if(match)visible++;
});
if(group.toggle){
group.toggle.hidden=!!query||group.rows.length<=3;
group.toggle.setAttribute('aria-expanded',String(group.expanded));
}
if(group.more)group.more.hidden=group.expanded;
if(group.less)group.less.hidden=!group.expanded;
group.section.hidden=visible===0;
shown+=visible;
});
empty.hidden=shown!==0;
}
groups.forEach(function(group){
if(!group.toggle)return;
group.toggle.addEventListener('click',function(){
group.expanded=!group.expanded;
apply();
});
});
function expandHash(hash,scroll){
var id;
try{
id=decodeURIComponent(hash.slice(1));
}catch(error){
return false;
}
var group=groups.find(function(candidate){
return candidate.section.getAttribute('id')===id;
});
if(!group)return false;
input.value='';
group.expanded=true;
apply();
if(scroll)group.section.scrollIntoView({block:'start'});
return true;
}
function applyHash(hash,scroll){
if(hash.slice(0,8)==='#search='){
var query;
try{
query=decodeURIComponent(hash.slice(8));
}catch(error){
return false;
}
if(Array.from(query).length>200)return false;
input.value=query;
apply();
return true;
}
return expandHash(hash,scroll);
}
Array.prototype.forEach.call(
document.querySelectorAll('.hub-categories a'),function(anchor){
anchor.addEventListener('click',function(event){
if(event.defaultPrevented||event.ctrlKey||event.metaKey
||event.shiftKey||event.altKey
||(typeof event.button==='number'&&event.button!==0))return;
var hash=anchor.getAttribute('href')||'';
if(hash.charAt(0)==='#')expandHash(hash,false);
});
});
window.addEventListener('hashchange',function(){
var hash=window.location.hash;
if(!applyHash(hash,true)&&(!hash||hash==='#')){
input.value='';
apply();
}
});
input.addEventListener('input',apply);
input.addEventListener('keydown',function(event){
if(event.key==='Escape'&&input.value){
input.value='';
apply();
}
});
document.addEventListener('keydown',function(event){
if(event.key!=='/'||event.ctrlKey||event.metaKey||event.altKey)return;
var active=document.activeElement;
if(active&&(active.isContentEditable
||/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)))return;
event.preventDefault();
input.focus();
});
if(!applyHash(window.location.hash,true))apply();
box.hidden=false;
function registerDiscovery(){
var words=document.getElementById('hub-agent-phrases');
var context=document.modelContext;
if(!context||typeof context.registerTool!=='function'){
context=window.navigator&&window.navigator.modelContext;
}
if(!words||!context||typeof context.registerTool!=='function')return;
var title=words.getAttribute('data-title');
var description=words.getAttribute('data-description');
var queryDescription=words.getAttribute('data-query-description');
if(!title||!description||!queryDescription)return;
Promise.resolve(context.registerTool({
name:'find_browser_tools',
title:title,
description:description,
inputSchema:{
type:'object',
properties:{
query:{type:'string',maxLength:200,description:queryDescription},
limit:{type:'integer',minimum:1,maximum:20,default:10}
},
required:['query'],
additionalProperties:false
},
annotations:{
readOnlyHint:true,
consequentialHint:false,
untrustedContentHint:false
},
execute:function(args){
var own=Object.prototype.hasOwnProperty;
if(!args||typeof args!=='object'||Array.isArray(args)
||!own.call(args,'query')||typeof args.query!=='string'
||Array.from(args.query).length>200
||Object.keys(args).some(function(key){return key!=='query'&&key!=='limit';})
||(own.call(args,'limit')&&(!Number.isInteger(args.limit)
||args.limit<1||args.limit>20))){
return{ok:false,code:'invalid_arguments'};
}
var limit=own.call(args,'limit')?args.limit:10;
var search=matching(args.query);
var found=items.filter(function(entry){
return entry.card&&search.matches(entry);
});
return{
ok:true,
total:found.length,
hasMore:found.length>limit,
tools:found.slice(0,limit).map(function(entry){
var name=entry.card.querySelector('.tool-name');
return{
name:(name?name.textContent:entry.card.textContent).trim(),
description:entry.description.trim(),
url:new URL(entry.card.getAttribute('href'),window.location.href).href,
category:entry.category
};
})
};
}
})).catch(function(){});
}
try{
registerDiscovery();
}catch(error){}
})();
