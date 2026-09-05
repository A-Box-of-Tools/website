/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{DISPOSALS}from'./gif.js?v=bed13b6cb6';
import{duration,isFullCanvas}from'./frames.js?v=bed13b6cb6';
import{clock,count,delay,exact,fileSize,hex,percent,rate}from'./format.js?v=bed13b6cb6';
const RULE='-'.repeat(64);
const columns=(text)=>[...text].reduce((n,ch)=>n
+(/[\u1100-\u115f\u2e80-\u303e\u3041-\u33ff\u3400-\u4dbf\u4e00-\u9fff\ua000-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe6f\uff00-\uff60\uffe0-\uffe6]/.test(ch)?2:1),0);
const pad=(text,wide)=>text+' '.repeat(Math.max(0,wide-columns(text)));
export function report(gif,view,t){
const lines=[];
const say=(text='')=>lines.push(text);
const heading=(text)=>{
say();
say(text);
say(RULE);
};
say(t('report.title',{name:view.name}));
say(RULE);
say(t('report.provenance'));
heading(t('report.file'));
const timing=duration(gif.frames);
const table=[
[t('report.version'),`GIF${gif.version}`],
[t('report.canvas'),t('report.pixels',{width:gif.width,height:gif.height})],
[t('report.size'),
t('report.bothsizes',{rounded:fileSize(gif.size),exact:exact(gif.size,t)})],
[t('report.frames'),count(gif.frames.length)],
[t('report.runsfor'),t('report.aswritten',{time:clock(timing.nominal,t)})],
];
if(timing.clamped>0){
table.push([t('report.actually'),
t('report.clamped',{time:clock(timing.real,t),n:count(timing.clamped)})]);
}
const fps=rate(gif.frames.length,timing.real);
if(fps)table.push([t('report.rate'),t('report.persecond',{fps:fps.toFixed(1)})]);
table.push([t('report.loops'),gif.loop===null?t('report.noloop')
:gif.loop===0?t('loops.forever'):t('loops.times',{n:count(gif.loop)})]);
table.push([t('report.globalpal'),gif.globalPalette
?t('report.colours',{n:count(gif.globalPalette.count)}):t('report.nopalette')]);
if(view.colors!==undefined)table.push([t('report.drawn'),count(view.colors)]);
table.push([t('report.background'),String(gif.backgroundIndex)]);
const label=Math.max(...table.map(([name])=>columns(name)));
for(const[name,value]of table)say(`${pad(name, label + 2)}${value}`);
heading(t('report.budget'));
const total=t('report.total');
const labels=new Map(view.budget.rows.map((row)=>[row.key,t(row.label)]));
const width=Math.max(columns(total),...[...labels.values()].map(columns));
for(const row of view.budget.rows){
if(row.bytes===0&&row.key!=='pixels')continue;
say(`${pad(labels.get(row.key), width + 2)}${String(row.bytes).padStart(10)}  `
+`${percent(row.share).padStart(6)}  ${bar(row.share)}`);
}
say(`${pad(total, width + 2)}${String(gif.size).padStart(10)}`);
if(view.findings.length>0){
heading(t('report.findings'));
for(const finding of view.findings){
const values=fill(finding.values,t);
say(`[${finding.level}] ${plain(t(finding.title, values))}`);
say(wrap(plain(t(finding.body,values)),4));
say();
}
lines.pop();
}
if(gif.frames.length>0){
heading(t('report.frametable'));
const grid=[
[t('column.index'),4,'right'],
[t('column.at'),9,'right'],
[t('column.size'),9,'right'],
[t('column.delay'),6,'right'],
[t('column.disposal'),28,'left'],
[t('column.palette'),8,'left'],
[t('column.bytes'),7,'right'],
].map(([label,wide,align])=>[label,Math.max(wide,columns(label)),align]);
const line=(values)=>values
.map((value,at)=>(grid[at][2]==='right'
?' '.repeat(Math.max(0,grid[at][1]-columns(String(value))))+value
:pad(String(value),grid[at][1])))
.join('  ')
.trimEnd();
say(line(grid.map(([label])=>label)));
for(const frame of gif.frames){
say(`${line([
        frame.index + 1,
        `${frame.left},${frame.top}`,
        `${frame.width}x${frame.height}`,
        delay(frame.delay, t),
        t(DISPOSALS[frame.disposal] ?? 'disposal.reserved', { n: frame.disposal }),
        frame.palette
          ? t('report.localpalette', { colours: frame.palette.count })
          : t('report.globalpalette'),
        frame.bytes,
      ])}${isFullCanvas(gif, frame) ? `  ${t('report.fullcanvas')}` : ''}`
);
}
}
const notes=gif.extensions.filter((extension)=>extension.text);
if(notes.length>0){
heading(t('report.text'));
for(const extension of notes){
say(`${extension.name} (${fileSize(extension.bytes)}):`);
say(wrap(extension.text.replace(/\s+/g,' ').trim().slice(0,2000),4));
say();
}
lines.pop();
}
if(gif.globalPalette){
heading(t('report.palette'));
const swatches=[];
for(let index=0;index<gif.globalPalette.count;index+=1){
swatches.push(hex(gif.globalPalette.colors,index));
}
for(let at=0;at<swatches.length;at+=8){
say(`  ${swatches.slice(at, at + 8).join('  ')}`);
}
}
say();
return`${lines.join('\n')}\n`;
}
const fill=(values={},t)=>Object.fromEntries(Object.entries(values)
.map(([name,value])=>[name,value?.key?t(value.key,value.values):value]));
const bar=(share)=>'#'.repeat(Math.max(share>0?1:0,Math.round(share*20)));
const plain=(fragment)=>fragment
.replace(/<[^>]+>/g,'')
.replace(/&times;/g,'x')
.replace(/&ldquo;|&rdquo;/g,'"')
.replace(/&amp;/g,'&')
.replace(/&lt;/g,'<')
.replace(/&gt;/g,'>')
.replace(/&quot;/g,'"')
.replace(/&#39;/g,"'")
.replace(/&nbsp;/g,' ');
function wrap(text,indent){
const pad=' '.repeat(indent);
const out=[];
let line=pad;
for(const word of text.split(/\s+/)){
if(line.length+word.length+1>76&&line!==pad){
out.push(line);
line=pad;
}
line+=(line===pad?'':' ')+word;
}
if(line!==pad)out.push(line);
return out.join('\n');
}
