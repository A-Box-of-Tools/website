/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
(function(){
'use strict';
var button=document.querySelector('.page-md-copy');
var block=document.getElementById('page-markdown');
var status=document.querySelector('.page-md-status');
if(!button||!block||!status)return;
var clipboard=navigator.clipboard;
if(!clipboard||typeof clipboard.writeText!=='function'){
button.hidden=true;
return;
}
var LINGER=2000;
var timer=0;
function say(word){
status.textContent=word;
clearTimeout(timer);
timer=setTimeout(function(){status.textContent='';},LINGER);
}
button.addEventListener('click',function(){
clipboard.writeText(block.textContent).then(
function(){say(status.getAttribute('data-copied')||'');},
function(){say(status.getAttribute('data-failed')||'');}
);
});
})();
