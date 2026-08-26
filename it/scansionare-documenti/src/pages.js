/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const PAPER=[
{key:'paper.a',aspect:1/Math.SQRT2},
{key:'paper.letter',aspect:215.9/279.4},
{key:'paper.legal',aspect:215.9/355.6},
{key:'paper.card',aspect:53.98/85.6},
];
const TOLERANCE=0.03;
export function matchPaper(aspect){
if(!Number.isFinite(aspect)||aspect<=0)return null;
for(const paper of PAPER){
if(Math.abs(Math.log(aspect/paper.aspect))<=TOLERANCE){
return{key:paper.key,landscape:false};
}
if(Math.abs(Math.log(aspect/(1/paper.aspect)))<=TOLERANCE){
return{key:paper.key,landscape:true};
}
}
return null;
}
export function stemOf(name){
const clean=String(name??'').replace(/\.[a-z0-9]{1,8}$/i,'').trim();
return clean||'scan';
}
export function outName(stem,extension){
return`${safeStem(stem)}-scan.${extension}`;
}
export function pageName(stem,index,total,extension){
const width=String(total).length;
return`${safeStem(stem)}-page-${String(index + 1).padStart(width, '0')}.${extension}`;
}
function safeStem(stem){
return String(stem??'').replace(/[\\/:*?"<>|]+/g,'-').slice(0,60)||'scan';
}
export function sizeText(bytes){
if(!Number.isFinite(bytes)||bytes<0)return'';
if(bytes<1024)return`${bytes} B`;
if(bytes<1024*1024)return`${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} kB`;
return`${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}
export function ratioText(aspect){
if(!Number.isFinite(aspect)||aspect<=0)return'';
const ratio=aspect>1?aspect:1/aspect;
return`1:${ratio.toFixed(2)}`;
}
export function coverage(quad,width,height){
const area=Math.abs(
(quad[0].x*quad[1].y-quad[1].x*quad[0].y)
+(quad[1].x*quad[2].y-quad[2].x*quad[1].y)
+(quad[2].x*quad[3].y-quad[3].x*quad[2].y)
+(quad[3].x*quad[0].y-quad[0].x*quad[3].y),
)/2;
const frame=width*height;
return frame>0?area/frame:0;
}
export function scanQuality(widthPx,aspect){
const paper=matchPaper(aspect);
if(!paper)return null;
const millimetres={
'paper.a':[210,297],
'paper.letter':[215.9,279.4],
'paper.legal':[215.9,355.6],
'paper.card':[85.6,53.98],
}[paper.key];
if(!millimetres)return null;
const across=paper.landscape?Math.max(...millimetres):Math.min(...millimetres);
const dpi=Math.round((widthPx/across)*25.4);
let key='quality.good';
if(dpi<120)key='quality.low';
else if(dpi<200)key='quality.fair';
return{dpi,key};
}
