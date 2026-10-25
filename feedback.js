/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
(function(){
'use strict';
var KEY='abox-feedback-';
var STATE=/^(a|d1|d2)\.(\d{1,15})$/;
var SILENCE={a:180,d1:30,d2:365};
var DAY=86400000;
var DELAY=1500;
var THANKS=2500;
var panel=document.getElementById('feedback');
if(!panel)return;
var slug=panel.getAttribute('data-tool')||'';
var ask=panel.querySelector('.feedback-ask');
var why=panel.querySelector('.feedback-why');
var thanks=panel.querySelector('.feedback-thanks');
var note=panel.querySelector('.feedback-note');
if(!slug||!ask||!why||!thanks)return;
var asked=false;
var pending=null;
function stored(){
try{
var raw=window.localStorage.getItem(KEY+slug);
return raw&&STATE.test(raw)?STATE.exec(raw):null;
}catch(err){
return null;
}
}
function remember(state){
try{
window.localStorage.setItem(KEY+slug,state+'.'+Date.now());
}catch(err){}
}
function silent(){
var was=stored();
if(!was)return false;
var when=Number(was[2]);
if(when>Date.now())return false;
return Date.now()-when<SILENCE[was[1]]*DAY;
}
function refusal(){
var was=stored();
return was&&was[1].charAt(0)==='d'?'d2':'d1';
}
function send(verdict,reason){
var queue=window.dataLayer;
if(!queue||typeof queue.push!=='function')return;
function gtag(){queue.push(arguments);}
try{
gtag('event','tool_feedback',{
tool_slug:slug,
verdict:verdict,
reason:reason,
});
}catch(err){}
}
function flush(){
if(pending===null)return;
send('down',pending);
pending=null;
}
function show(after){
var host=after&&after.closest?after.closest('section'):null;
if(host&&host.parentNode&&!host.contains(panel)){
host.insertAdjacentElement('afterend',panel);
}
panel.hidden=false;
}
function settle(state){
remember(state);
ask.hidden=true;
why.hidden=true;
if(note)note.hidden=true;
thanks.hidden=false;
window.setTimeout(function(){panel.hidden=true;},THANKS);
}
panel.addEventListener('click',function(event){
var target=event.target;
if(!target||!target.closest)return;
var vote=target.closest('[data-verdict]');
if(vote){
if(vote.getAttribute('data-verdict')==='up'){
send('up','none');
settle('a');
}else{
pending='none';
ask.hidden=true;
why.hidden=false;
}
return;
}
var chip=target.closest('[data-reason]');
if(chip){
pending=chip.getAttribute('data-reason');
flush();
settle('a');
return;
}
if(target.closest('.feedback-close')){
var answered=pending!==null;
flush();
settle(answered?'a':refusal());
}
});
window.addEventListener('pagehide',flush);
if(silent())return;
document.addEventListener('click',function(event){
if(asked)return;
var target=event.target;
if(!target||!target.closest)return;
var trigger=target.closest(
'a[download][href], button[id^="download"], [data-download]');
if(!trigger||trigger.disabled)return;
asked=true;
window.setTimeout(function(){show(trigger);},DELAY);
},true);
}());
