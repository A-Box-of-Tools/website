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
.replace(/[-\u2010-\u2015\u2212]/g,'');
}
var groups=[];
var items=[];
Array.prototype.forEach.call(
document.querySelectorAll('main .category'),function(section){
var heading=section.querySelector('h2');
var note=section.querySelector('.category-note');
var groupText=fold(
(heading?heading.textContent:'')+' '+(note?note.textContent:''));
var rows=[];
Array.prototype.forEach.call(
section.querySelectorAll('.tool-grid > li'),function(row){
var entry={row:row,text:fold(row.textContent)+' '+groupText};
rows.push(entry);
items.push(entry);
});
groups.push({section:section,rows:rows});
});
if(!items.length)return;
function apply(){
var query=fold(input.value.trim());
var shown=0;
groups.forEach(function(group){
var visible=0;
group.rows.forEach(function(entry){
var match=!query||entry.text.indexOf(query)!==-1;
entry.row.hidden=!match;
if(match)visible++;
});
group.section.hidden=visible===0;
shown+=visible;
});
empty.hidden=shown!==0;
}
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
box.hidden=false;
if(input.value)apply();
})();
