/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{
INK,box,document_,emptyTile,esc,icon,picture,round,stars,starsWidth,text,wrap,
}from'./render.js?v=3f9e9a36a1';
const DOT=' · ';
const baseline=(top,size,height)=>top+height/2+size*0.36;
function topRounded(x,y,width,height,radius){
return`M${round(x)} ${round(y + radius)}a${radius} ${radius} 0 0 1 ${radius} ${-radius}`
+`h${round(width - 2 * radius)}a${radius} ${radius} 0 0 1 ${radius} ${radius}`
+`v${round(height - radius)}h${round(-width)}z`;
}
function ratingRow(view,x,top,height,id,measure,{size=14,star=14,short=false}={}){
const y=baseline(top,size,height);
const count=short?view.reviewsShort:view.reviewsText;
if(!view.hasReviews){
return text(count,x,y,{size,fill:INK.dim});
}
const number=text(view.ratingText,x,y,{size,weight:500});
const after=x+measure(view.ratingText,size,500)+5;
const row=stars(after,top+(height-star)/2,star,view.rating,id);
return number+row
+text(count,after+starsWidth(star)+6,y,{size,fill:INK.link});
}
function metaLine(view){
return[view.category,view.price].filter(Boolean).join(DOT);
}
function statusLine(view,x,top,height,measure,size=14){
const y=baseline(top,size,height);
const tone=view.status.tone==='open'?INK.open:INK.closed;
const lead=text(view.status.lead,x,y,{size,fill:tone,weight:500});
if(!view.status.tail)return lead;
const after=x+measure(view.status.lead,size,500)+measure(' ',size);
return lead+text(`${DOT.trimStart()}${view.status.tail}`,after,y,{
size,fill:INK.dim,
});
}
function infoRow(mark,value,x,top,width,measure,{colour=INK.text,lines=2}={}){
const wrapped=wrap(value,width-34,{size:14,lines},measure);
if(!wrapped.length)return{markup:'',height:0};
const height=Math.max(30,wrapped.length*20+10);
const markup=icon(mark,x,top+(Math.min(height,30)-20)/2,20)
+wrapped.map((line,n)=>(
text(line,x+34,baseline(top+n*20,14,30),{size:14,fill:colour})
)).join('');
return{markup,height};
}
function actionRow(view,x,top,width,measure,{filled=false,size=44}={}){
const shown=view.actions.slice(0,5);
if(!shown.length)return{markup:'',height:0};
const step=width/shown.length;
const markup=shown.map((action,n)=>{
const centre=x+step*(n+0.5);
const solid=filled&&n===0;
const circle=`<circle cx="${round(centre)}" cy="${round(top + size / 2)}" `
+`r="${round(size / 2)}" fill="${solid ? INK.link : 'none'}" `
+`stroke="${solid ? INK.link : INK.rule}" stroke-width="1"/>`;
const mark=icon(action.mark,centre-10,top+size/2-10,20,
solid?'#ffffff':INK.link);
const label=text(action.label,centre,top+size+17,{
size:12,fill:INK.link,anchor:'middle',
});
return circle+mark+label;
}).join('');
return{markup,height:size+24};
}
function chipRow(view,x,top,width,measure){
if(!view.chips.length)return{markup:'',height:0};
const height=26;
const gap=8;
let cursorX=x;
let cursorY=top;
let markup='';
for(const chip of view.chips){
const chipWidth=measure(chip,13,400)+24;
if(cursorX>x&&cursorX+chipWidth>x+width){
cursorX=x;
cursorY+=height+gap;
}
markup+=box(cursorX,cursorY,chipWidth,height,{radius:13,fill:INK.chip})
+text(chip,cursorX+12,baseline(cursorY,13,height),{size:13,fill:INK.text});
cursorX+=chipWidth+gap;
}
return{markup,height:cursorY-top+height};
}
const rule=(x,y,width)=>box(x,y,width,1,{fill:INK.rule});
export function panel(view,measure){
const width=428;
const pad=20;
const inner=width-pad*2;
const hero=168;
let body=view.photo
?`<clipPath id="panel-hero"><path d="${topRounded(0, 0, width, hero, 8)}"/></clipPath>`
+`<image href="${esc(view.photo)}" x="0" y="0" width="${width}" height="${hero}" `
+'preserveAspectRatio="xMidYMid slice" clip-path="url(#panel-hero)"/>'
:`<path d="${topRounded(0, 0, width, hero, 8)}" fill="${INK.tile}"/>`
+icon('photo',width/2-23,hero/2-23,46,'#bdc1c6',1.6);
let cursor=hero+18;
const name=wrap(view.name,inner,{size:24,lines:2},measure);
body+=name.map((line,n)=>(
text(line,pad,cursor+24*0.78+n*30,{
size:24,fill:view.named?INK.text:INK.dim,
})
)).join('');
cursor+=name.length*30+4;
body+=ratingRow(view,pad,cursor,22,'panel-stars',measure);
cursor+=22;
const meta=metaLine(view);
if(meta){
body+=text(meta,pad,baseline(cursor,14,20),{size:14,fill:INK.dim});
cursor+=20;
}
cursor+=14;
const actions=actionRow(view,pad,cursor,inner,measure);
body+=actions.markup;
cursor+=actions.height+14;
body+=rule(pad,cursor,inner);
cursor+=13;
for(const row of[
['pin',view.addressText,INK.text],
['clock','',INK.text],
['phone',view.phone,INK.text],
['globe',view.host,INK.link],
]){
if(row[0]==='clock'){
body+=icon('clock',pad,cursor+5,20)+statusLine(view,pad+34,cursor,30,measure);
cursor+=30;
continue;
}
const drawn=infoRow(row[0],row[1],pad,cursor,inner,measure,{colour:row[2]});
body+=drawn.markup;
cursor+=drawn.height;
}
cursor+=4;
if(view.description){
body+=rule(pad,cursor,inner);
cursor+=14;
body+=text(view.words.from,pad,cursor+10,{size:13,weight:500,fill:INK.dim});
cursor+=22;
const lines=wrap(view.description,inner,{size:14,lines:4},measure);
body+=lines.map((line,n)=>text(line,pad,cursor+11+n*20,{size:14})).join('');
cursor+=lines.length*20+4;
}
const chips=chipRow(view,pad,cursor+8,inner,measure);
if(chips.height){body+=chips.markup;cursor+=chips.height+8;}
cursor+=20;
const frame=`<rect x="0.5" y="0.5" width="${width - 1}" height="${round(cursor - 1)}" `
+`rx="8" fill="none" stroke="${INK.rule}"/>`;
return{svg:document_(width,Math.round(cursor),body+frame),width,height:Math.round(cursor)};
}
export function mobile(view,measure){
const width=390;
const pad=16;
const inner=width-pad*2;
const hero=208;
let body=view.photo
?picture(view.photo,0,0,width,hero,0,'mobile-hero')
:emptyTile(0,0,width,hero,0);
let cursor=hero+16;
const name=wrap(view.name,inner,{size:22,lines:2},measure);
body+=name.map((line,n)=>(
text(line,pad,cursor+22*0.78+n*28,{
size:22,weight:500,fill:view.named?INK.text:INK.dim,
})
)).join('');
cursor+=name.length*28+2;
body+=ratingRow(view,pad,cursor,22,'mobile-stars',measure);
cursor+=22;
const meta=metaLine(view);
if(meta){
body+=text(meta,pad,baseline(cursor,14,20),{size:14,fill:INK.dim});
cursor+=20;
}
body+=statusLine(view,pad,cursor,20,measure);
cursor+=20+14;
const actions=actionRow(view,pad,cursor,inner,measure,{filled:true,size:42});
body+=actions.markup;
cursor+=actions.height+12;
let rows='';
let below=cursor+13;
for(const[mark,value,colour]of[
['pin',view.addressText,INK.text],
['phone',view.phone,INK.text],
['globe',view.host,INK.link],
]){
const drawn=infoRow(mark,value,pad,below,inner,measure,{colour});
rows+=drawn.markup;
below+=drawn.height;
}
if(rows){
body+=rule(pad,cursor,inner)+rows;
cursor=below+4;
}
if(view.description){
body+=rule(pad,cursor,inner);
cursor+=14;
const lines=wrap(view.description,inner,{size:14,lines:4},measure);
body+=lines.map((line,n)=>text(line,pad,cursor+11+n*20,{size:14})).join('');
cursor+=lines.length*20+4;
}
const chips=chipRow(view,pad,cursor+8,inner,measure);
if(chips.height){body+=chips.markup;cursor+=chips.height+8;}
cursor+=20;
return{svg:document_(width,Math.round(cursor),body),width,height:Math.round(cursor)};
}
export function listing(view,measure){
const width=640;
const pad=16;
const thumb=92;
const column=width-pad*3-thumb;
let body='';
let cursor=pad;
const name=wrap(view.name,column,{size:18,lines:1},measure);
body+=text(name[0]??'',pad,cursor+18,{
size:18,fill:view.named?INK.text:INK.dim,
});
cursor+=26;
body+=ratingRow(view,pad,cursor,20,'listing-stars',measure,
{size:13,star:13,short:true});
cursor+=20;
const meta=[metaLine(view),view.addressText].filter(Boolean).join(DOT);
if(meta){
const line=wrap(meta,column,{size:13,lines:1},measure);
body+=text(line[0]??'',pad,baseline(cursor,13,18),{size:13,fill:INK.dim});
cursor+=18;
}
body+=statusLine(view,pad,cursor,18,measure,13);
cursor+=18+12;
const pills=[
view.host?{mark:'globe',label:view.words.website}:null,
view.address?{mark:'route',label:view.words.directions}:null,
].filter(Boolean);
let pillX=pad;
for(const pill of pills){
const pillWidth=measure(pill.label,13,500)+46;
body+=box(pillX,cursor,pillWidth,32,{radius:16,fill:'#ffffff',stroke:INK.rule})
+icon(pill.mark,pillX+12,cursor+8,16,INK.link)
+text(pill.label,pillX+34,baseline(cursor,13,32),{
size:13,weight:500,fill:INK.link,
});
pillX+=pillWidth+8;
}
cursor+=(pills.length?32:0)+pad;
const height=Math.round(Math.max(cursor,pad*2+thumb));
const at=width-pad-thumb;
body=(view.photo
?picture(view.photo,at,pad,thumb,thumb,8,'listing-thumb')
:emptyTile(at,pad,thumb,thumb,8))+body;
const frame=`<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" `
+`rx="8" fill="none" stroke="${INK.rule}"/>`;
return{svg:document_(width,height,body+frame),width,height};
}
export const SURFACES={panel,mobile,listing};
