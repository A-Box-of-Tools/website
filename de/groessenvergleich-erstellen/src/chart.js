/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{ceilTo,gridLabel,gridStep}from'./units.js';
export const FONT='system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
function escape(text){
return String(text)
.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
.replace(/"/g,'&quot;');
}
const round=(n)=>Math.round(n*100)/100;
export function isDark(hex){
const match=/^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
if(!match)return false;
const value=parseInt(match[1],16);
const channels=[(value>>16)&255,(value>>8)&255,value&255]
.map((c)=>c/255)
.map((c)=>(c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4));
const luminance=0.2126*channels[0]+0.7152*channels[1]+0.0722*channels[2];
return luminance<0.4;
}
export function ceiling(tallestCm,plotHeight,labelHeight,unit){
const step=gridStep(tallestCm,unit);
let topCm=ceilTo(tallestCm,step);
for(let tries=0;tries<4;tries+=1){
const scale=plotHeight/topCm;
if((topCm-tallestCm)*scale>=labelHeight)break;
topCm+=step;
}
return{topCm,step};
}
function columns(figures,scale,font,measure){
const gap=font*1.7;
return figures.map((figure)=>{
const height=figure.cm*scale;
const drawn=figure.shape.markup&&!figure.shape.stretch
?figure.shape.width*height
:Math.max((figure.widthCm||figure.cm*0.6)*scale,6);
const name=figure.name?measure(figure.name,font,600):0;
const label=measure(figure.label,font*0.86);
return{figure,height,drawn,width:Math.max(drawn,name,label)+gap};
});
}
export function chartSvg(figures,options,measure){
const{
plotHeight,unit,background,ink,showRuler=true,showNames=true,
}=options;
const font=Math.max(11,Math.round(plotHeight*0.026));
const pad=Math.round(font*1.1);
const labelHeight=showNames?Math.round(font*2.5):Math.round(font*0.6);
const tallest=figures.reduce((most,f)=>Math.max(most,f.cm),0)||100;
const{topCm,step}=ceiling(tallest,plotHeight,labelHeight,unit);
const scale=plotHeight/topCm;
const lines=[];
for(let cm=step;cm<=topCm+1e-6;cm+=step){
lines.push({cm,text:gridLabel(cm,unit)});
}
const rulerFont=Math.round(font*0.8);
const gutter=showRuler
?Math.round(lines.reduce((wide,l)=>Math.max(wide,measure(l.text,rulerFont)),0)
+rulerFont*0.9)
:0;
const laid=columns(figures,scale,font,measure);
const plotWidth=Math.max(laid.reduce((sum,c)=>sum+c.width,0),font*8);
const width=Math.round(pad*2+gutter*2+plotWidth);
const height=Math.round(pad*2+labelHeight+plotHeight);
const groundY=height-pad;
const left=pad+gutter;
const parts=[
`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" `
+`viewBox="0 0 ${width} ${height}" font-family='${FONT}'>`,
];
if(background!=='none'){
parts.push(`<rect width="${width}" height="${height}" fill="${escape(background)}"/>`);
}
if(showRuler){
const rules=[];
for(const line of lines){
const y=round(groundY-line.cm*scale);
const at=Math.round(y)+0.5;
rules.push(`M${pad} ${at}H${width - pad}`);
}
parts.push(`<path d="${rules.join('')}" stroke="${escape(ink)}" `
+`stroke-width="1" opacity="0.18" fill="none"/>`);
for(const line of lines){
const y=round(groundY-line.cm*scale+rulerFont*0.36);
const text=escape(line.text);
parts.push(`<text x="${left - rulerFont * 0.5}" y="${y}" font-size="${rulerFont}" `
+`fill="${escape(ink)}" opacity="0.65" text-anchor="end">${text}</text>`);
parts.push(`<text x="${width - left + rulerFont * 0.5}" y="${y}" `
+`font-size="${rulerFont}" fill="${escape(ink)}" opacity="0.65">${text}</text>`);
}
}
parts.push(`<path d="M${pad} ${Math.round(groundY) + 0.5}H${width - pad}" `
+`stroke="${escape(ink)}" stroke-width="1.5" opacity="0.55" fill="none"/>`);
let x=left;
for(const column of laid){
const{figure}=column;
const centre=round(x+column.width/2);
const top=round(groundY-column.height);
const colour=escape(figure.colour);
if(figure.shape.markup){
const scaled=round(column.height);
const inner=figure.shape.inner
?`<g transform="${escape(figure.shape.inner)}">`:'';
const across=round(column.drawn);
const factors=figure.shape.stretch?`${across} ${scaled}`:`${scaled}`;
parts.push(`<g fill="${colour}" transform="translate(${centre} ${top}) `
+`scale(${factors})">${inner}${figure.shape.markup}`
+`${inner ? '</g>' : ''}</g>`);
}else{
parts.push(`<rect x="${round(centre - column.drawn / 2)}" y="${top}" `
+`width="${round(column.drawn)}" height="${round(column.height)}" `
+`fill="${colour}"/>`);
}
if(showNames){
const heightBaseline=round(top-font*0.5);
if(figure.name){
parts.push(`<text x="${centre}" y="${round(heightBaseline - font * 1.15)}" `
+`font-size="${font}" font-weight="600" fill="${colour}" `
+`text-anchor="middle">${escape(figure.name)}</text>`);
}
parts.push(`<text x="${centre}" y="${heightBaseline}" font-size="${round(font * 0.86)}" `
+`fill="${escape(ink)}" opacity="0.75" text-anchor="middle">`
+`${escape(figure.label)}</text>`);
}
x+=column.width;
}
parts.push('</svg>');
return{svg:parts.join(''),width,height,topCm,step};
}
