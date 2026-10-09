/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase,ltr}from'./shared/phrases.js?v=a8e748bf06';
import{measureImage}from'./shared/media.js?v=a8e748bf06';
import{saveBlob}from'./shared/download.js?v=a8e748bf06';
import{messageBox}from'./shared/message-box.js?v=a8e748bf06';
import{wireFilePicker,readingLabel}from'./shared/file-picker.js?v=a8e748bf06';
import{makeZip}from'./shared/zip.js?v=a8e748bf06';
import{readImage,readBytes,serialize,exifBytes,outputType,KIND_NAMES}from'./container.js?v=a8e748bf06';
import{cleanAvif}from'./avif.js?v=a8e748bf06';
import{prepareCleanCopy}from'./clean-copy.js?v=a8e748bf06';
import{outName,cleanNames}from'./names.js?v=a8e748bf06';
import{setEntryValue,createEntry,TYPE}from'./tiff.js?v=a8e748bf06';
import{describeTag}from'./tags.js?v=a8e748bf06';
import{makeExample}from'./example.js?v=a8e748bf06';
import{
formatValue,readPosition,buildFindings,badges,bytes as humanBytes,
countTags,metadataSize,hasMetadata,tagGroups,
}from'./report.js?v=a8e748bf06';
const $=(id)=>document.getElementById(id);
const el={
dropzone:$('dropzone'),
fileInput:$('file-input'),
fileList:$('file-list'),
listToolbar:$('list-toolbar'),
countLabel:$('count-label'),
clearAll:$('clear-all'),
loadError:$('load-error'),
stripAll:$('strip-all'),
stripStatus:$('strip-status'),
keepOrientation:$('keep-orientation'),
keepIcc:$('keep-icc'),
keepSummary:$('keep-summary'),
cleanResults:$('clean-results'),
resultList:$('result-list'),
downloadZip:$('download-zip'),
inspectEmpty:$('inspect-empty'),
inspector:$('inspector'),
inspectThumb:$('inspect-thumb'),
inspectName:$('inspect-name'),
inspectSub:$('inspect-sub'),
inspectSelect:$('inspect-select'),
avifInspectNote:$('avif-inspect-note'),
findingsList:$('findings-list'),
blockList:$('block-list'),
tagGroups:$('tag-groups'),
tagsNote:$('tags-note'),
addTag:$('add-tag'),
addTagSelect:$('add-tag-select'),
addTagValue:$('add-tag-value'),
addTagGo:$('add-tag-go'),
saveEdits:$('save-edits'),
revertEdits:$('revert-edits'),
saveStatus:$('save-status'),
editError:$('edit-error'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const{show:showLoadError,clear:clearLoadError}=messageBox(el.loadError);
let items=[];
let selectedId=null;
let nextId=1;
let cleaning=false;
let cleanEpoch=0;
let resultUrls=[];
let resultEpoch=0;
const picker=wireFilePicker({
input:el.fileInput,
dropzone:el.dropzone,
onFiles(files){
addFiles(files);
},
example:makeExample,
});
async function addFiles(files){
if(!files?.length)return;
picker.busy(readingLabel(files.length));
const failures=[];
try{
for(const file of files){
let item;
try{
item=await readImage(file);
}catch(error){
failures.push(`${file.name}: ${phrase(error.message, error.values)}`);
continue;
}
item.id=nextId;
nextId+=1;
item.name=file.name;
item.size=file.size;
item.drop=new Set();
item.dirty=false;
item.thumbUrl=URL.createObjectURL(file);
const dims=await measureImage(item.thumbUrl);
if(dims&&item.doc)item.doc.canvas=dims;
if(item.kind==='avif'&&(!dims||dims.width*dims.height>80_000_000)){
item.ok=false;
item.error=dims?'write.aviflarge':'read.avifdecode';
}
if(item.ok)normalizeExif(item);
if(item.ok){
const position=readPosition(item.exif.groups.gps);
item.had={
exif:countTags(item)>0,
gps:item.exif.groups.gps.length>0,
thumbnail:Boolean(item.exif.thumbnail?.length),
where:position?`${position.text}.`:phrase('block.gps.partial'),
};
item.textChunks=item.meta.text.map((t)=>({
keyword:t.keyword,
value:t.value??'',
unreadable:Boolean(t.unreadable),
}));
item.textDirty=false;
}
items.push(item);
if(!item.ok)failures.push(`${file.name}: ${phrase(item.error, item.values)}`);
}
}finally{
picker.done();
}
if(failures.length)showLoadError(failures.join('\n'));
else clearLoadError();
if(selectedId===null)selectedId=items.find((i)=>i.ok)?.id??null;
render();
}
const emptyExif=()=>({
ok:true,
littleEndian:true,
groups:{ifd0:[],exif:[],gps:[],interop:[],ifd1:[]},
thumbnail:null,
});
function normalizeExif(item){
item.exifUnreadable=Boolean(item.exif&&!item.exif.ok&&item.meta.exif);
item.exifError=item.exifUnreadable?item.exif.error:null;
if(!item.exif?.ok)item.exif=emptyExif();
}
function removeItem(id){
const at=items.findIndex((i)=>i.id===id);
if(at<0)return;
cleanEpoch+=1;
URL.revokeObjectURL(items[at].thumbUrl);
items.splice(at,1);
if(selectedId===id)selectedId=items.find((i)=>i.ok)?.id??null;
render();
}
el.clearAll.addEventListener('click',()=>{
cleanEpoch+=1;
for(const item of items)URL.revokeObjectURL(item.thumbUrl);
items=[];
selectedId=null;
clearResults();
clearLoadError();
render();
});
function render(){
const any=items.length>0;
el.listToolbar.hidden=!any;
el.countLabel.textContent=any
?phrase(items.length===1?'list.photos.one':'list.photos.many',{count:items.length})
:'';
renderList();
el.stripAll.disabled=cleaning||!items.some((i)=>i.ok);
renderKeepSummary();
renderInspector();
}
function renderList(){
el.fileList.replaceChildren();
for(const item of items){
const li=document.createElement('li');
li.className='file-row';
if(item.id===selectedId)li.classList.add('selected');
if(!item.ok)li.classList.add('unreadable');
const pick=document.createElement('button');
pick.type='button';
pick.className='file-pick';
pick.disabled=!item.ok;
pick.addEventListener('click',()=>{selectedId=item.id;render();});
const thumb=document.createElement('img');
thumb.className='file-thumb';
thumb.src=item.thumbUrl;
thumb.alt='';
thumb.loading='lazy';
pick.appendChild(thumb);
const main=document.createElement('span');
main.className='file-main';
const name=document.createElement('span');
name.className='file-name';
name.textContent=item.name;
main.appendChild(name);
const sub=document.createElement('span');
sub.className='file-sub';
sub.textContent=item.ok
?phrase(item.kind==='avif'?'row.avif':'row.file',{
kind:KIND_NAMES[item.kind],
size:humanBytes(item.size),
metadata:humanBytes(metadataSize(item)),
})
:phrase(item.error,item.values);
main.appendChild(sub);
if(item.ok){
const row=document.createElement('span');
row.className='badges';
const shownBadges=badges(item).filter((badge)=>item.kind!=='avif'||badge.label!=='badge.clean');
if(item.kind==='avif')shownBadges.push({label:'badge.avif',level:'medium'});
for(const badge of shownBadges){
const span=document.createElement('span');
span.className=`badge badge-${badge.level}`;
span.textContent=phrase(badge.label,badge.values);
row.appendChild(span);
}
main.appendChild(row);
}
pick.appendChild(main);
li.appendChild(pick);
const remove=document.createElement('button');
remove.type='button';
remove.className='row-remove';
const off=phrase('row.remove',{name:item.name});
remove.title=off;
remove.setAttribute('aria-label',off);
remove.textContent='×';
remove.addEventListener('click',()=>removeItem(item.id));
li.appendChild(remove);
el.fileList.appendChild(li);
}
}
function renderKeepSummary(){
const orientation=el.keepOrientation.checked;
const icc=el.keepIcc.checked;
const anyAvif=items.some((item)=>item.ok&&item.kind==='avif');
const containerEdits=items.some((item)=>item.ok&&item.kind!=='avif');
el.keepOrientation.disabled=cleaning||(anyAvif&&!containerEdits);
el.keepIcc.disabled=cleaning||(anyAvif&&!containerEdits);
if(anyAvif&&!containerEdits){
el.keepSummary.textContent=phrase('keep.avif');
return;
}
if(!orientation&&!icc)el.keepSummary.textContent=phrase('keep.nothing');
else if(orientation&&icc)el.keepSummary.textContent=phrase('keep.both');
else el.keepSummary.textContent=phrase(orientation?'keep.orientation':'keep.icc');
if(anyAvif)el.keepSummary.textContent+=` ${phrase('keep.avif')}`;
}
el.keepOrientation.addEventListener('change',renderKeepSummary);
el.keepIcc.addEventListener('change',renderKeepSummary);
const say=(value)=>{
if(value?.parts){
return value.parts.map((key)=>phrase(key)).reduce((left,right)=>
phrase('value.separator',{left,right}));
}
return value?.key?phrase(value.key,value.values):value;
};
const selected=()=>items.find((i)=>i.id===selectedId&&i.ok)??null;
function renderInspector(){
const item=selected();
el.inspector.hidden=!item;
el.inspectEmpty.hidden=Boolean(item);
if(el.avifInspectNote)el.avifInspectNote.hidden=item?.kind!=='avif';
if(!item)return;
el.inspectSelect.replaceChildren();
const readable=items.filter((i)=>i.ok);
for(const other of readable){
const option=document.createElement('option');
option.value=String(other.id);
option.textContent=other.name;
option.selected=other.id===item.id;
el.inspectSelect.appendChild(option);
}
el.inspectSelect.parentElement.hidden=readable.length<2;
el.inspectThumb.src=item.thumbUrl;
el.inspectThumb.hidden=false;
el.inspectName.textContent=item.name;
const size=item.doc?.canvas;
el.inspectSub.textContent=[
KIND_NAMES[item.kind],
size?ltr(`${size.width} × ${size.height}`):null,
humanBytes(item.size),
item.kind==='avif'?phrase('inspect.avif'):hasMetadata(item)
?phrase('inspect.metadata',{size:humanBytes(metadataSize(item))})
:phrase('inspect.nometadata'),
].filter(Boolean).join(' · ');
renderFindings(item);
renderBlocks(item);
renderTags(item);
renderAddTag(item);
updateSaveButtons();
clearEditError();
}
el.inspectSelect.addEventListener('change',()=>{
selectedId=Number(el.inspectSelect.value);
render();
});
function renderFindings(item){
el.findingsList.replaceChildren();
const findings=buildFindings(item,phrase);
if(!findings.length){
const li=document.createElement('li');
li.className=item.kind==='avif'?'finding':'finding finding-clean';
const title=document.createElement('p');
title.className='finding-title';
title.textContent=phrase(item.kind==='avif'?'avif.scope.title':'find.clean.title');
const detail=document.createElement('p');
detail.className='finding-detail';
detail.textContent=phrase(item.kind==='avif'?'avif.nofindings'
:item.dirty?'find.clean.cleared':'find.clean.never');
li.append(title,detail);
el.findingsList.appendChild(li);
return;
}
for(const finding of findings){
const li=document.createElement('li');
li.className=`finding finding-${finding.level}`;
const title=document.createElement('p');
title.className='finding-title';
title.textContent=finding.title;
const detail=document.createElement('p');
detail.className='finding-detail';
detail.textContent=finding.detail;
li.append(title,detail);
el.findingsList.appendChild(li);
}
}
function blockDescriptors(item){
const groups=item.exif.groups;
const meta=item.meta;
const list=[];
const clearGroups=()=>{
for(const key of Object.keys(groups))groups[key]=[];
item.exif.thumbnail=null;
};
if(item.exifUnreadable){
list.push({
title:phrase('block.exifbad.title'),
detail:phrase('block.exifbad.detail',{
size:humanBytes(meta.exif.length),
reason:phrase(item.exifError),
}),
gone:true,
pill:phrase('block.cannotkeep'),
});
}
if(item.had.exif){
list.push({
title:phrase('block.exif.title'),
detail:phrase(countTags(item)===1?'block.exif.one':'block.exif.many',
{count:countTags(item)}),
gone:countTags(item)===0,
label:phrase('block.exif.remove'),
remove:clearGroups,
});
}
if(item.had.gps){
list.push({
title:phrase('block.gps.title'),
detail:item.had.where,
gone:groups.gps.length===0,
label:phrase('block.gps.remove'),
remove:()=>{groups.gps=[];},
});
}
if(item.had.thumbnail){
list.push({
title:phrase('block.thumbnail.title'),
detail:phrase('block.thumbnail.detail'),
gone:!item.exif.thumbnail,
label:phrase('block.thumbnail.remove'),
remove:()=>{item.exif.thumbnail=null;},
});
}
const containerBlocks=[
['xmp',meta.xmp!==null&&meta.xmp!==undefined,
()=>phrase('block.xmp.detail',{size:humanBytes(meta.xmp.length)})],
['iptc',Boolean(meta.iptc),
()=>phrase('block.iptc.detail',{size:humanBytes(meta.iptc.length)})],
['text',meta.text.length>0,
()=>phrase(meta.text.length===1?'block.text.one':'block.text.many',{
count:meta.text.length,
keywords:meta.text.map((t)=>t.keyword).join(', '),
})],
['comments',meta.comments.length>0,
()=>phrase(meta.comments.length===1?'block.comments.one':'block.comments.many',
{count:meta.comments.length})],
['extras',meta.extras.length>0,
()=>phrase('block.extras.detail',{
blocks:meta.extras.map((x)=>`${x.label} (${humanBytes(x.size)})`).join(', '),
})],
['icc',Boolean(meta.icc),
()=>phrase(meta.iccName?'block.icc.named':'block.icc.detail',{
size:humanBytes(meta.icc.length),
name:meta.iccName,
})],
];
for(const[id,present,detail]of containerBlocks){
if(!present)continue;
list.push({
title:phrase(`block.${id}.title`),
detail:detail(),
gone:item.drop.has(id),
label:phrase('block.remove'),
remove:()=>item.drop.add(id),
});
}
return list;
}
function renderBlocks(item){
el.blockList.replaceChildren();
if(item.kind==='avif'){
const li=document.createElement('li');
li.className='block block-none';
li.textContent=phrase('avif.blocks');
el.blockList.appendChild(li);
return;
}
const blocks=blockDescriptors(item);
if(!blocks.length&&!item.meta.notes.length){
const li=document.createElement('li');
li.className='block block-none';
li.textContent=phrase('block.none');
el.blockList.appendChild(li);
return;
}
for(const block of blocks){
const li=document.createElement('li');
li.className=`block${block.gone ? ' block-gone' : ''}`;
const text=document.createElement('div');
const title=document.createElement('p');
title.className='block-title';
title.textContent=block.title;
const detail=document.createElement('p');
detail.className='block-detail';
detail.textContent=block.detail;
text.append(title,detail);
li.appendChild(text);
if(block.gone){
const pill=document.createElement('span');
pill.className='block-removed';
pill.textContent=block.pill??phrase('block.removed');
li.appendChild(pill);
}else{
const button=document.createElement('button');
button.type='button';
button.className='ghost danger';
button.textContent=block.label;
button.addEventListener('click',()=>{
block.remove();
item.dirty=true;
renderInspector();
renderList();
});
li.appendChild(button);
}
el.blockList.appendChild(li);
}
for(const note of item.meta.notes){
const li=document.createElement('li');
li.className='block block-kept';
const text=document.createElement('div');
const title=document.createElement('p');
title.className='block-title';
title.textContent=phrase(note.label);
const detail=document.createElement('p');
detail.className='block-detail';
detail.textContent=phrase(note.detail);
text.append(title,detail);
li.appendChild(text);
const pill=document.createElement('span');
pill.className='block-kept-pill';
pill.textContent=phrase('block.kept');
li.appendChild(pill);
el.blockList.appendChild(li);
}
}
function renderTags(item){
el.tagGroups.replaceChildren();
const groups=tagGroups(item);
el.tagsNote.textContent=phrase(item.kind==='avif'?'editor.avif'
:groups.length?'editor.note':'editor.notags');
if(item.textChunks?.length&&!item.drop.has('text'))el.tagGroups.appendChild(textChunkGroup(item));
for(const group of groups){
const section=document.createElement('section');
section.className='tag-group';
const heading=document.createElement('h4');
heading.textContent=phrase(group.title);
const count=document.createElement('span');
count.className='group-count';
count.textContent=phrase(group.entries.length===1?'editor.tags.one':'editor.tags.many',
{count:group.entries.length});
heading.appendChild(count);
section.appendChild(heading);
const note=document.createElement('p');
note.className='group-note';
note.textContent=phrase(group.note);
section.appendChild(note);
const scroll=document.createElement('div');
scroll.className='table-scroll';
const table=document.createElement('table');
table.className='tag-table';
const head=document.createElement('thead');
const headRow=document.createElement('tr');
for(const label of[phrase('editor.tag'),phrase('editor.value'),'']){
const th=document.createElement('th');
th.scope='col';
th.textContent=label;
headRow.appendChild(th);
}
head.appendChild(headRow);
table.appendChild(head);
const body=document.createElement('tbody');
for(const entry of group.entries)body.appendChild(tagRow(item,group.id,entry));
table.appendChild(body);
scroll.appendChild(table);
section.appendChild(scroll);
el.tagGroups.appendChild(section);
}
}
function textChunkGroup(item){
const section=document.createElement('section');
section.className='tag-group';
const heading=document.createElement('h4');
heading.textContent=phrase('block.text.title');
const count=document.createElement('span');
count.className='group-count';
count.textContent=phrase(item.textChunks.length===1?'editor.pairs.one':'editor.pairs.many',
{count:item.textChunks.length});
heading.appendChild(count);
section.appendChild(heading);
const frozen=item.textChunks.some((t)=>t.unreadable);
const note=document.createElement('p');
note.className='group-note';
note.textContent=phrase(frozen?'editor.frozen':'editor.textnote');
section.appendChild(note);
const scroll=document.createElement('div');
scroll.className='table-scroll';
const table=document.createElement('table');
table.className='tag-table';
const head=document.createElement('thead');
const headRow=document.createElement('tr');
for(const label of[phrase('editor.keyword'),phrase('editor.value'),'']){
const th=document.createElement('th');
th.scope='col';
th.textContent=label;
headRow.appendChild(th);
}
head.appendChild(headRow);
table.appendChild(head);
const body=document.createElement('tbody');
for(const chunk of item.textChunks){
const tr=document.createElement('tr');
const th=document.createElement('th');
th.scope='row';
if(frozen){
th.textContent=chunk.keyword;
}else{
const key=document.createElement('input');
key.className='tag-input';
key.value=chunk.keyword;
key.spellcheck=false;
key.setAttribute('aria-label',phrase('editor.keywordfor',{keyword:chunk.keyword}));
key.addEventListener('change',()=>{
chunk.keyword=key.value;
item.textDirty=true;
markDirty(item);
});
th.appendChild(key);
}
tr.appendChild(th);
const valueCell=document.createElement('td');
if(chunk.unreadable){
const span=document.createElement('span');
span.className='tag-readonly';
span.textContent=phrase('editor.unreadable');
valueCell.appendChild(span);
}else if(frozen){
const span=document.createElement('span');
span.className='tag-readonly';
span.textContent=chunk.value;
valueCell.appendChild(span);
}else{
const input=document.createElement('input');
input.className='tag-input';
input.value=chunk.value;
input.spellcheck=false;
input.setAttribute('aria-label',phrase('editor.valuefor',{keyword:chunk.keyword}));
input.addEventListener('change',()=>{
chunk.value=input.value;
item.textDirty=true;
markDirty(item);
});
valueCell.appendChild(input);
}
tr.appendChild(valueCell);
const actions=document.createElement('td');
actions.className='tag-actions';
if(!frozen){
const remove=document.createElement('button');
remove.type='button';
remove.className='tag-delete';
remove.textContent=phrase('block.remove');
remove.setAttribute('aria-label',phrase('editor.removechunk',{keyword:chunk.keyword}));
remove.addEventListener('click',()=>{
const at=item.textChunks.indexOf(chunk);
if(at>=0)item.textChunks.splice(at,1);
item.textDirty=true;
item.dirty=true;
renderInspector();
renderList();
});
actions.appendChild(remove);
}
tr.appendChild(actions);
body.appendChild(tr);
}
table.appendChild(body);
scroll.appendChild(table);
section.appendChild(scroll);
return section;
}
function tagRow(item,group,entry){
const spec=describeTag(group,entry.tag);
const tr=document.createElement('tr');
const th=document.createElement('th');
th.scope='row';
const name=document.createElement('span');
name.className='tag-name';
name.textContent=spec.name;
th.appendChild(name);
if(spec.risk){
const dot=document.createElement('span');
dot.className=`tag-risk tag-risk-${spec.risk}`;
dot.textContent=phrase(spec.risk==='high'?'risk.high':'risk.medium');
if(spec.note)dot.title=phrase(spec.note);
th.appendChild(dot);
}
const id=document.createElement('span');
id.className='tag-id';
id.textContent=`0x${entry.tag.toString(16).padStart(4, '0')}`;
th.appendChild(id);
tr.appendChild(th);
const valueCell=document.createElement('td');
valueCell.appendChild(editorFor(item,group,entry));
tr.appendChild(valueCell);
const actions=document.createElement('td');
actions.className='tag-actions';
const remove=document.createElement('button');
remove.type='button';
remove.className='tag-delete';
remove.disabled=item.kind==='avif';
remove.textContent=phrase('block.remove');
remove.setAttribute('aria-label',phrase('editor.removetag',{tag:spec.name}));
remove.addEventListener('click',()=>{
if(item.kind==='avif')return;
const list=item.exif.groups[group];
const at=list.indexOf(entry);
if(at>=0)list.splice(at,1);
item.dirty=true;
renderInspector();
renderList();
});
actions.appendChild(remove);
tr.appendChild(actions);
return tr;
}
function editableText(entry){
if(typeof entry.value==='string')return entry.value;
if(Array.isArray(entry.value))return entry.value.join(' ');
if(typeof entry.value==='number')return String(entry.value);
return'';
}
function editorFor(item,group,entry){
const spec=describeTag(group,entry.tag);
if(!spec.edit||item.kind==='avif'){
const span=document.createElement('span');
span.className='tag-readonly';
span.textContent=say(formatValue(group,entry));
return span;
}
const commit=(control,raw)=>{
if(setEntryValue(entry,raw,item.exif.littleEndian)){
control.classList.remove('bad');
clearEditError();
markDirty(item);
}else if(String(raw).trim()===''){
control.classList.add('bad');
showEditError(phrase('edit.blank',{tag:spec.name}));
}else{
control.classList.add('bad');
showEditError(phrase(spec.edit==='text'?'edit.wanttext':'edit.wantnumber',
{value:raw,tag:spec.name}));
}
};
if(spec.edit==='enum'){
const select=document.createElement('select');
select.className='tag-input';
const known=Object.entries(spec.values??{});
if(typeof entry.value==='number'&&!spec.values?.[entry.value]){
known.push([String(entry.value),{key:'value.unknown',values:{value:entry.value}}]);
}
for(const[value,label]of known){
const option=document.createElement('option');
option.value=value;
option.textContent=say(label);
option.selected=Number(value)===entry.value;
select.appendChild(option);
}
select.addEventListener('change',()=>commit(select,select.value));
return select;
}
const input=document.createElement('input');
input.className='tag-input';
input.type=spec.edit==='int'?'number':'text';
input.spellcheck=false;
input.value=editableText(entry);
input.addEventListener('change',()=>commit(input,input.value));
return input;
}
const ADDABLE=[
{group:'ifd0',tag:0x010e,type:TYPE.ASCII,hint:'hint.description'},
{group:'ifd0',tag:0x013b,type:TYPE.ASCII,hint:'hint.artist'},
{group:'ifd0',tag:0x8298,type:TYPE.ASCII,hint:'hint.copyright'},
{group:'ifd0',tag:0x0131,type:TYPE.ASCII,hint:'hint.software'},
{group:'ifd0',tag:0x0132,type:TYPE.ASCII,hint:'hint.datetime'},
{group:'ifd0',tag:0x010f,type:TYPE.ASCII,hint:'hint.make'},
{group:'ifd0',tag:0x0110,type:TYPE.ASCII,hint:'hint.model'},
{group:'ifd0',tag:0x0112,type:TYPE.SHORT,hint:'hint.orientation'},
{group:'exif',tag:0x9003,type:TYPE.ASCII,hint:'hint.datetime'},
{group:'exif',tag:0x9286,type:TYPE.UNDEFINED,hint:'hint.comment'},
{group:'exif',tag:0x8827,type:TYPE.SHORT,hint:'hint.iso'},
];
function renderAddTag(item){
el.addTagSelect.replaceChildren();
if(item.kind==='avif'){
el.addTag.hidden=true;
return;
}
const available=ADDABLE.filter(
(candidate)=>!item.exif.groups[candidate.group].some((e)=>e.tag===candidate.tag),
);
el.addTag.hidden=available.length===0;
if(!available.length)return;
for(const candidate of available){
const option=document.createElement('option');
option.value=`${candidate.group}:${candidate.tag}`;
option.textContent=describeTag(candidate.group,candidate.tag).name;
el.addTagSelect.appendChild(option);
}
syncAddTagHint();
}
function syncAddTagHint(){
const candidate=ADDABLE.find((c)=>`${c.group}:${c.tag}`===el.addTagSelect.value);
el.addTagValue.placeholder=candidate?phrase(candidate.hint):'';
}
el.addTagSelect.addEventListener('change',syncAddTagHint);
el.addTagGo.addEventListener('click',()=>{
const item=selected();
if(!item||item.kind==='avif')return;
const candidate=ADDABLE.find((c)=>`${c.group}:${c.tag}`===el.addTagSelect.value);
if(!candidate)return;
const entry=createEntry(candidate.tag,candidate.type,el.addTagValue.value,item.exif.littleEndian);
if(!entry){
showEditError(phrase('edit.badvalue',{value:el.addTagValue.value}));
return;
}
item.exif.groups[candidate.group].push(entry);
item.dirty=true;
el.addTagValue.value='';
renderInspector();
renderList();
el.addTag.open=true;
});
function markDirty(item){
item.dirty=true;
updateSaveButtons();
renderFindings(item);
renderList();
}
function updateSaveButtons(){
const item=selected();
el.saveEdits.disabled=!item?.dirty||item.kind==='avif';
el.revertEdits.disabled=!item?.dirty||item.kind==='avif';
if(item&&!item.dirty)el.saveStatus.textContent='';
}
function editPlan(item){
const plan={exif:exifBytes(item.exif)};
for(const id of['xmp','iptc','icc','comments','extras','text']){
if(item.drop.has(id))plan[id]=null;
}
if(!item.drop.has('text')&&item.textDirty){
plan.text=item.textChunks
.filter((t)=>!t.unreadable)
.map(({keyword,value})=>({keyword,value}));
}
return plan;
}
el.stripAll.addEventListener('click',async()=>{
if(cleaning)return;
cleaning=true;
const epoch=++cleanEpoch;
const keepOrientation=el.keepOrientation.checked;
const keepIcc=el.keepIcc.checked;
const results=[];
const batch=items.filter((item)=>item.ok).map((item)=>{
try{return{item,...prepareCleanCopy(item,{keepOrientation,keepIcc})};}
catch(error){return{item,error};}
});
render();
try{
for(const{item,source,requested,plan,metadata,error:planError}of batch){
if(epoch!==cleanEpoch)return;
try{
if(planError)throw planError;
if(item.kind==='avif'){
const data=await cleanAvif(item.bytes);
results.push({item:source,requested,data,note:phrase('clean.avif')});
}else if(!metadata){
results.push({item:source,note:phrase('strip.nothing')});
}else{
results.push({item:source,requested,data:serialize(item,plan)});
}
}catch(error){
results.push({item,error:phrase(error.message,error.values)});
}
}
if(epoch!==cleanEpoch)return;
showResults(results);
const cleaned=results.filter((r)=>r.data).length;
el.stripStatus.textContent=cleaned
?phrase(cleaned===1?'strip.done.one':'strip.done.many',{count:cleaned})
:phrase('strip.none');
}finally{
cleaning=false;
render();
}
});
function clearResults(){
resultEpoch+=1;
for(const url of resultUrls)URL.revokeObjectURL(url);
resultUrls=[];
el.resultList.replaceChildren();
el.cleanResults.hidden=true;
el.downloadZip.hidden=true;
el.stripStatus.textContent='';
}
function showResults(results){
clearResults();
if(!results.length)return;
const cleaned=results.filter(result=>result.data);
const names=cleanNames(cleaned.map(result=>result.item));
cleaned.forEach((result,index)=>{result.outputName=names[index];});
el.cleanResults.hidden=false;
for(const result of results){
const li=document.createElement('li');
li.className='result-row';
const text=document.createElement('div');
const name=document.createElement('p');
name.className='result-name';
name.textContent=result.item.name;
text.appendChild(name);
const detail=document.createElement('p');
detail.className='result-detail';
if(result.data){
const sizes={
before:humanBytes(result.item.size),
after:humanBytes(result.data.length),
};
if(result.item.kind==='avif')detail.textContent=phrase('result.avif',sizes);
else{
detail.textContent=phrase('result.saved',{
...sizes,saved:humanBytes(Math.max(0,result.item.size-result.data.length)),
});
if(result.note)detail.textContent=`${result.note} · ${detail.textContent}`;
}
}else if(result.error){
detail.textContent=result.error;
li.classList.add('result-failed');
}else{
detail.textContent=result.note;
}
text.appendChild(detail);
if(result.data){
const policy=document.createElement('p');
policy.className='result-policy';
policy.textContent=result.requested.applies?phrase('copy.requested',{
orientation:phrase(result.requested.keepOrientation?'copy.on':'copy.off'),
icc:phrase(result.requested.keepIcc?'copy.on':'copy.off'),
}):phrase('copy.avif');
text.appendChild(policy);
}
li.appendChild(text);
if(result.data){
const url=URL.createObjectURL(new Blob([result.data],{type:outputType(result.item.kind).mime}));
resultUrls.push(url);
const link=document.createElement('a');
link.className='primary as-button';
link.href=url;
link.download=result.outputName;
link.textContent=phrase('result.download');
li.appendChild(link);
li.appendChild(cleanedInspection(result,resultEpoch));
}
el.resultList.appendChild(li);
}
el.downloadZip.hidden=cleaned.length<2;
el.downloadZip.onclick=()=>{
const zip=makeZip(cleaned.map((r)=>({name:r.outputName,data:r.data})));
saveBlob(zip,'photos-without-metadata.zip');
};
}
function cleanedInspection(result,epoch){
const details=document.createElement('details');
details.className='clean-inspection';
const summary=document.createElement('summary');
summary.textContent=phrase('copy.inspect');
summary.setAttribute('aria-label',phrase('copy.inspectname',{name:result.outputName}));
const content=document.createElement('div');
content.className='copy-inventory';
const status=document.createElement('p');
status.className='result-detail';
status.setAttribute('role','status');
details.append(summary,status,content);
let started=false;
details.addEventListener('toggle',async()=>{
if(!details.open||started)return;
started=true;
status.textContent=phrase('copy.reading');
const current=()=>epoch===resultEpoch&&details.isConnected;
try{
const copy=await readBytes(result.data);
if(!current())return;
if(!copy.ok)throw new Error(copy.error);
renderCopyInventory(copy,content);
status.textContent='';
}catch(error){
if(current())status.textContent=phrase('copy.failed',{
reason:phrase(error.message,error.values),
});
}
});
return details;
}
function renderCopyInventory(copy,target){
const intro=document.createElement('p');
intro.className='copy-scope';
intro.textContent=phrase('copy.scope');
target.appendChild(intro);
const list=document.createElement('dl');
list.className='copy-facts';
const fact=(label,value)=>{
const row=document.createElement('div');
const name=document.createElement('dt');
const detail=document.createElement('dd');
name.textContent=label;
detail.textContent=value;
row.append(name,detail);
list.appendChild(row);
};
fact(phrase('copy.tags'),copy.meta.exif&&!copy.exif?.ok
?phrase('badge.exifbad'):String(countTags(copy)));
fact(phrase('copy.profile'),copy.meta.icc
?humanBytes(copy.meta.icc.length):phrase('copy.absent'));
for(const id of['xmp','iptc']){
if(copy.meta[id])fact(phrase(`block.${id}.title`),humanBytes(copy.meta[id].length));
}
for(const id of['comments','text','extras']){
if(copy.meta[id].length)fact(phrase(`block.${id}.title`),String(copy.meta[id].length));
}
if(copy.exif?.thumbnail?.length){
fact(phrase('block.thumbnail.title'),humanBytes(copy.exif.thumbnail.length));
}
for(const group of tagGroups(copy)){
for(const entry of group.entries){
const spec=describeTag(group.id,entry.tag);
fact(phrase(spec.name),say(formatValue(group.id,entry)));
}
}
target.appendChild(list);
if(!hasMetadata(copy)){
const empty=document.createElement('p');
empty.className='result-detail';
empty.textContent=phrase('copy.none');
target.appendChild(empty);
}
for(const note of copy.meta.notes){
const text=document.createElement('p');
text.className='result-detail';
text.textContent=phrase('copy.note',{
label:phrase(note.label),detail:phrase(note.detail),
});
target.appendChild(text);
}
}
el.saveEdits.addEventListener('click',()=>{
const item=selected();
if(!item||item.kind==='avif')return;
try{
const data=serialize(item,editPlan(item));
saveBlob(new Blob([data],{type:outputType(item.kind).mime}),outName(item,'edited'));
el.saveStatus.textContent=phrase('edit.saved',{name:outName(item,'edited'),size:humanBytes(data.length)});
clearEditError();
}catch(error){
showEditError(phrase(error.message,error.values));
}
});
el.revertEdits.addEventListener('click',async()=>{
const item=selected();
if(!item||item.kind==='avif')return;
const canvas=item.doc?.canvas??null;
const fresh=await readBytes(item.bytes);
Object.assign(item,fresh);
normalizeExif(item);
if(item.doc&&canvas)item.doc.canvas=canvas;
item.drop=new Set();
item.textChunks=item.meta.text.map((t)=>({
keyword:t.keyword,
value:t.value??'',
unreadable:Boolean(t.unreadable),
}));
item.textDirty=false;
item.dirty=false;
render();
el.saveStatus.textContent=phrase('save.reverted');
});
function showEditError(message){
el.editError.textContent=message;
el.editError.hidden=false;
}
function clearEditError(){
el.editError.textContent='';
el.editError.hidden=true;
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
showLoadError(phrase('error.broke',{detail:event.message}));
});
window.addEventListener('unhandledrejection',(event)=>{
showLoadError(phrase('error.broke',{detail:event.reason?.message??event.reason}));
});
render();
document.getElementById('boot-warning')?.remove();
