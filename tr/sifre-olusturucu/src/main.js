/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{phrase}from'./shared/phrases.js';
import{classSizes,generate,phraseChoices,SYMBOL_SETS}from'./generate.js';
import{
bits,crackTime,passphraseSpace,passwordSpace,rating,scientific,
}from'./strength.js';
import{wordlist}from'./wordlist.js';
const $=(id)=>document.getElementById(id);
const el={
modes:Array.from(document.querySelectorAll('input[name="mode"]')),
panels:{
password:$('options-password'),
passphrase:$('options-passphrase'),
},
length:$('length'),
lengthOut:$('length-out'),
useLower:$('use-lower'),
useUpper:$('use-upper'),
useDigits:$('use-digits'),
useSymbols:$('use-symbols'),
symbolSet:$('symbol-set'),
symbolChars:$('symbol-chars'),
requireEach:$('require-each'),
avoidLookalikes:$('avoid-lookalikes'),
words:$('words'),
wordsOut:$('words-out'),
list:$('list'),
separator:$('separator'),
capitals:$('capitals'),
addDigit:$('add-digit'),
addSymbol:$('add-symbol'),
noClasses:$('no-classes'),
error:$('error'),
result:$('result'),
secret:$('secret'),
regenerate:$('regenerate'),
copy:$('copy'),
copyNote:$('copy-note'),
strength:$('strength'),
bits:$('bits'),
verdict:$('verdict'),
fill:$('strength-fill'),
crack:$('crack'),
space:$('space'),
count:$('count'),
countOut:$('count-out'),
batch:$('batch'),
copyAll:$('copy-all'),
download:$('download-txt'),
privacyToggle:$('privacy-toggle'),
privacyPanel:$('privacy-panel'),
};
const RATING_WORD={
'very-weak':'veryWeak',
weak:'weak',
fair:'fair',
strong:'strong',
'very-strong':'veryStrong',
};
const CRACK_WORD={
instant:'instant',
minutes:'minutes',
hours:'hours',
days:'days',
months:'months',
years:'years',
centuries:'centuries',
ages:'ages',
};
let shown=[];
let mode='password';
function setMode(next){
mode=next;
for(const radio of el.modes)radio.checked=radio.value===next;
for(const[name,panel]of Object.entries(el.panels))panel.hidden=name!==next;
make();
}
for(const radio of el.modes){
radio.addEventListener('change',()=>{
if(radio.checked)setMode(radio.value);
});
}
function options(){
return{
mode,
length:Number(el.length.value),
lower:el.useLower.checked,
upper:el.useUpper.checked,
digits:el.useDigits.checked,
symbols:el.useSymbols.checked,
symbolSet:el.symbolSet.value,
requireEach:el.requireEach.checked,
avoidLookalikes:el.avoidLookalikes.checked,
words:Number(el.words.value),
list:el.list.value,
separator:el.separator.value,
capitals:el.capitals.value,
addDigit:el.addDigit.checked,
addSymbol:el.addSymbol.checked,
};
}
function space(chosen){
if(chosen.mode==='passphrase'){
return passphraseSpace(
wordlist(chosen.list).length,chosen.words,phraseChoices(chosen),
);
}
return passwordSpace(classSizes(chosen),chosen.length,chosen.requireEach);
}
function showStrength(chosen){
const total=space(chosen);
const value=bits(total);
el.bits.textContent=String(Math.floor(value));
const grade=rating(value);
el.strength.dataset.rating=grade;
el.verdict.textContent=el.strength.dataset[RATING_WORD[grade]];
el.crack.textContent=el.strength.dataset[CRACK_WORD[crackTime(value)]];
el.fill.style.width=`${Math.min(100, (value / 128) * 100)}%`;
const{mantissa,exponent}=scientific(value);
if(exponent<6){
el.space.textContent=total.toLocaleString();
}else{
el.space.replaceChildren(
document.createTextNode(`${mantissa} \u00d7 10`),
Object.assign(document.createElement('sup'),{textContent:String(exponent)}),
);
}
}
function make(){
const chosen=options();
const empty=chosen.mode==='password'&&classSizes(chosen).length===0;
el.noClasses.hidden=!empty;
el.result.hidden=empty;
el.strength.hidden=empty;
if(empty){
shown=[];
el.batch.hidden=true;
el.copyAll.hidden=true;
el.download.hidden=true;
return;
}
const wanted=Number(el.count.value);
shown=Array.from({length:wanted},()=>generate(chosen));
el.secret.textContent=shown[0];
el.batch.replaceChildren(...shown.slice(1).map((secret)=>{
const item=document.createElement('li');
item.textContent=secret;
return item;
}));
el.batch.hidden=wanted<2;
el.copyAll.hidden=wanted<2;
el.download.hidden=wanted<2;
showStrength(chosen);
el.copyNote.textContent='';
}
async function toClipboard(text){
try{
await navigator.clipboard.writeText(text);
el.copyNote.textContent=el.result.dataset.copied;
el.copyNote.className='copy-note good';
}catch{
el.copyNote.textContent=el.result.dataset.copyFailed;
el.copyNote.className='copy-note warn';
}
}
function downloadList(){
const blob=new Blob([`${shown.join('\n')}\n`],{type:'text/plain'});
const url=URL.createObjectURL(blob);
const link=document.createElement('a');
link.href=url;
link.download=mode==='passphrase'?'passphrases.txt':'passwords.txt';
link.click();
URL.revokeObjectURL(url);
}
el.regenerate.addEventListener('click',make);
el.copy.addEventListener('click',()=>toClipboard(shown[0]??''));
el.copyAll.addEventListener('click',()=>toClipboard(shown.join('\n')));
el.download.addEventListener('click',downloadList);
el.length.addEventListener('input',()=>{
el.lengthOut.textContent=el.length.value;
make();
});
el.words.addEventListener('input',()=>{
el.wordsOut.textContent=el.words.value;
make();
});
el.count.addEventListener('input',()=>{
el.countOut.textContent=el.count.value;
make();
});
for(const control of[
el.useLower,el.useUpper,el.useDigits,el.useSymbols,el.symbolSet,
el.requireEach,el.avoidLookalikes,el.list,el.separator,el.capitals,
el.addDigit,el.addSymbol,
]){
control.addEventListener('change',()=>{
if(control===el.symbolSet)showSymbols();
make();
});
}
function showSymbols(){
el.symbolChars.textContent=SYMBOL_SETS[el.symbolSet.value];
}
el.privacyToggle.addEventListener('click',()=>{
const open=el.privacyPanel.hidden;
el.privacyPanel.hidden=!open;
el.privacyToggle.setAttribute('aria-expanded',String(open));
});
window.addEventListener('error',(event)=>{
el.error.hidden=false;
el.error.textContent=phrase('error.broke',{detail:event.message});
});
window.addEventListener('unhandledrejection',(event)=>{
el.error.hidden=false;
el.error.textContent=phrase('error.broke',{detail:event.reason?.message??event.reason});
});
showSymbols();
make();
document.getElementById('boot-warning')?.remove();
