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
function apply(){
var query=fold(input.value.trim());
var terms=query.split(/\s+/).filter(function(term){
return term&&!connectors.test(term);
});
var conversion=terms.length===2&&fileFormat.test(terms[0])
&&fileFormat.test(terms[1])&&query.split(/\s+/).length>2;
var shown=0;
groups.forEach(function(group){
var visible=0;
group.rows.forEach(function(entry,index){
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
expandHash(window.location.hash,true);
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
if(!expandHash(window.location.hash,true))apply();
box.hidden=false;
})();
