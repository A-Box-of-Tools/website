/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
window.dataLayer=window.dataLayer||[];
function gtag(){dataLayer.push(arguments);}
window.gtag=gtag;
var notAVisit=navigator.webdriver||location.origin+'/'!=='https://abox.tools/';
if(notAVisit){
window['ga-disable-G-SCBN29XZ31']=true;
}
var canonical=document.querySelector('link[rel="canonical"]');
var measurementPage=new URL(canonical?canonical.href:'https://abox.tools/404.html');
var campaign=new URLSearchParams(location.search);
['utm_source','utm_medium','utm_campaign','utm_id','utm_content','utm_term',
'gclid','dclid','gbraid','wbraid'].forEach(function(key){
var value=campaign.get(key);
if(value)measurementPage.searchParams.set(key,value);
});
var measurementReferrer='';
try{
var referrer=new URL(document.referrer);
if(referrer.protocol==='https:'||referrer.protocol==='http:'){
measurementReferrer=referrer.origin+'/';
}
}catch(err){}
gtag('js',new Date());
gtag('config','G-SCBN29XZ31',{
page_location:measurementPage.href,
page_title:document.title,
page_referrer:measurementReferrer,
});
(function(){
var panel=document.getElementById('feedback');
var slug=panel&&panel.getAttribute('data-tool');
if(!slug||!/^[a-z][a-z0-9-]*$/.test(slug))return;
var complete=false;
window.aboxToolComplete=function(){
if(complete)return;
try{
gtag('event','tool_complete',{
send_to:'G-SCBN29XZ31',
tool_slug:slug,
});
complete=true;
}catch(err){
}
};
try{
gtag('event','tool_view',{
send_to:'G-SCBN29XZ31',
tool_slug:slug,
});
}catch(err){}
if(['images-to-video','stack-images','gif-analyzer','split-gif'].indexOf(slug)===-1)return;
var stages={
input:'tool_input',
start:'tool_start',
ready:'tool_ready',
problem:'tool_problem',
cancel:'tool_cancel',
};
var reached=Object.create(null);
window.aboxToolJourney=function(step){
if(typeof step!=='string'||!Object.prototype.hasOwnProperty.call(stages,step)
||reached[step])return;
try{
gtag('event',stages[step],{
send_to:'G-SCBN29XZ31',
tool_slug:slug,
});
reached[step]=true;
}catch(err){}
};
}());
(function(){
try{
var sourceTag=document.querySelector('meta[name="abox-workflow-source"]');
var source=sourceTag&&sourceTag.content;
var validPage=/^[a-z][a-z0-9-]*(?:\/[a-z][a-z0-9-]*)?$/;
if(!source||!validPage.test(source))return;
var targets=Object.create(null);
[
'gif-maker','gif-to-mp4','split-gif','images-to-video',
'stack-images','gif-analyzer','timelapse-video','resize-image','compress-image',
'guides/turn-images-into-a-video','guides/stack-photos-to-reduce-noise',
'guides/whats-inside-a-gif','guides/split-a-gif-into-frames',
'guides/edit-a-gif-frame-by-frame',
].forEach(function(id){targets[id]=true;});
document.querySelectorAll('meta[name="abox-workflow-target"]').forEach(function(tag){
if(validPage.test(tag.content))targets[tag.content]=true;
});
var selected=Object.create(null);
document.querySelectorAll('a[data-workflow-target]').forEach(function(link){
var target=link.getAttribute('data-workflow-target');
if(!targets[target]||target===source)return;
link.addEventListener('click',function(event){
if((event&&event.defaultPrevented)||selected[target])return;
try{
gtag('event','workflow_link',{
send_to:'G-SCBN29XZ31',
source_page:source,
target_page:target,
});
selected[target]=true;
}catch(err){}
});
});
}catch(err){}
}());
if(!notAVisit){
var ad=document.createElement('script');
ad.async=true;
ad.crossOrigin='anonymous';
ad.src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5997711677062324';
document.head.appendChild(ad);
}
