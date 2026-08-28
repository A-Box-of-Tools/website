/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{DISPOSALS}from'./gif.js';
import{duration,isFullCanvas}from'./frames.js';
import{clock,count,delay,exact,fileSize,hex,percent,rate}from'./format.js';
const RULE='-'.repeat(64);
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
[t('report.size'),t('report.bothsizes',{rounded:fileSize(gif.size),exact:exact(gif.size)})],
[t('report.frames'),count(gif.frames.length)],
['Runs for',`${clock(timing.nominal)} as written`],
];
if(timing.clamped>0){
table.push(['Actually plays',`${clock(timing.real)} - ${count(timing.clamped)} `
+'frame(s) below 0.02s are clamped to 0.10s by every browser']);
}
const fps=rate(gif.frames.length,timing.real);
if(fps)table.push(['Rate',`${fps.toFixed(1)} frames a second`]);
table.push(['Loops',gif.loop===null?'no loop block - plays once'
:gif.loop===0?'forever':`${count(gif.loop)} times`]);
table.push(['Global palette',gif.globalPalette
?`${count(gif.globalPalette.count)} colours`:'none']);
if(view.colors!==undefined)table.push(['Colours drawn',count(view.colors)]);
table.push(['Background index',String(gif.backgroundIndex)]);
for(const[label,value]of table)say(`${label.padEnd(18)}${value}`);
heading(t('report.budget'));
const total=t('report.total');
const labels=new Map(view.budget.rows.map((row)=>[row.key,t(row.label)]));
const width=Math.max(total.length,...labels.values().map((label)=>label.length));
for(const row of view.budget.rows){
if(row.bytes===0&&row.key!=='pixels')continue;
say(`${labels.get(row.key).padEnd(width + 2)}${String(row.bytes).padStart(10)}  `
+`${percent(row.share).padStart(6)}  ${bar(row.share)}`);
}
say(`${total.padEnd(width + 2)}${String(gif.size).padStart(10)}`);
if(view.findings.length>0){
heading(t('report.findings'));
for(const finding of view.findings){
say(`[${finding.level}] ${plain(t(finding.title, finding.values))}`);
say(wrap(plain(t(finding.body,finding.values)),4));
say();
}
lines.pop();
}
if(gif.frames.length>0){
heading(t('report.frametable'));
const columns=[
[t('column.index'),4,'right'],
[t('column.at'),9,'right'],
[t('column.size'),9,'right'],
[t('column.delay'),6,'right'],
[t('column.disposal'),28,'left'],
[t('column.palette'),8,'left'],
[t('column.bytes'),7,'right'],
].map(([label,wide,align])=>[label,Math.max(wide,label.length),align]);
const line=(values)=>values
.map((value,at)=>(columns[at][2]==='right'
?String(value).padStart(columns[at][1])
:String(value).padEnd(columns[at][1])))
.join('  ')
.trimEnd();
say(line(columns.map(([label])=>label)));
for(const frame of gif.frames){
say(`${line([
        frame.index + 1,
        `${frame.left},${frame.top}`,
        `${frame.width}x${frame.height}`,
        delay(frame.delay),
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
