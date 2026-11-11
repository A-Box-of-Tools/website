/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const TIP='details.info-tip';
const MARK=`${TIP} > summary`;
const EDGE=12;
const LINGER=150;
export function watchInfoTips(document,window){
let showing=null;
let held=false;
let lingering;
const place=tip=>{
const note=tip.querySelector(':scope > [role="tooltip"]');
if(!note)return;
delete tip.dataset.placement;
note.style.marginInlineStart='';
const box=note.getBoundingClientRect();
const past=window.getComputedStyle(note).direction==='rtl'
?EDGE-box.left
:box.right-(document.documentElement.clientWidth-EDGE);
if(past>0)note.style.marginInlineStart=`${-past}px`;
if(box.bottom<=window.innerHeight-EDGE)return;
tip.dataset.placement='above';
if(note.getBoundingClientRect().top<EDGE)delete tip.dataset.placement;
};
const hide=()=>{
clearTimeout(lingering);
held=false;
if(showing)showing.open=false;
showing=null;
};
const show=(tip,hold=false)=>{
clearTimeout(lingering);
if(tip!==showing)hide();
showing=tip;
if(hold)held=true;
tip.open=true;
place(tip);
};
const on=(type,handler)=>document.addEventListener(type,handler,true);
on('click',event=>{
const mark=event.target.closest?.(MARK);
if(!mark)return;
event.preventDefault();
if(mark.parentElement===showing&&held)hide();
else show(mark.parentElement,true);
});
on('pointerover',event=>{
const tip=event.target.closest?.(TIP);
if(event.pointerType!=='mouse'||!tip||tip.contains(event.relatedTarget))return;
clearTimeout(lingering);
if(!held)show(tip);
});
on('pointerout',event=>{
if(event.pointerType!=='mouse'||held)return;
if(!showing?.contains(event.target)||showing.contains(event.relatedTarget))return;
lingering=setTimeout(hide,LINGER);
});
on('pointerdown',event=>{
if(!showing)return;
if(!showing.contains(event.target))hide();
else if(!event.target.closest(MARK))held=true;
});
on('focusin',event=>{
if(showing&&!showing.contains(event.target))hide();
if(event.target.matches?.(`${MARK}:focus-visible`))show(event.target.parentElement,true);
});
on('keydown',event=>{
if(event.key!=='Escape'||!showing)return;
hide();
event.preventDefault();
});
on('toggle',event=>{
const tip=event.target;
if(!tip.matches?.(TIP)||tip.open===(tip===showing))return;
if(tip.open)show(tip);
else hide();
});
window.addEventListener('resize',()=>{if(showing)place(showing);});
}
if(typeof document!=='undefined')watchInfoTips(document,window);
