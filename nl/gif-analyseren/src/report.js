/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{DISPOSALS}from'./gif.js';
import{duration,isFullCanvas}from'./frames.js';
import{clock,count,delay,exact,fileSize,hex,percent,rate}from'./format.js';
const RULE='-'.repeat(64);
export function report(gif,view){
const lines=[];
const say=(text='')=>lines.push(text);
const heading=(text)=>{
say();
say(text);
say(RULE);
};
say(`GIF analysis - ${view.name}`);
say(RULE);
say('Read entirely in a browser by abox.tools/gif-analyzer/. The file was not uploaded.');
heading('The file');
const timing=duration(gif.frames);
const table=[
['Version',`GIF${gif.version}`],
['Canvas',`${gif.width} x ${gif.height} pixels`],
['Size',`${fileSize(gif.size)} (${exact(gif.size)})`],
['Frames',count(gif.frames.length)],
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
heading('Where the bytes went');
const width=Math.max(...view.budget.rows.map((row)=>row.label.length));
for(const row of view.budget.rows){
if(row.bytes===0&&row.key!=='pixels')continue;
say(`${row.label.padEnd(width + 2)}${String(row.bytes).padStart(10)}  `
+`${percent(row.share).padStart(6)}  ${bar(row.share)}`);
}
say(`${'Total'.padEnd(width + 2)}${String(gif.size).padStart(10)}`);
if(view.findings.length>0){
heading('What stands out');
for(const finding of view.findings){
say(`[${finding.level}] ${plain(finding.title)}`);
say(wrap(plain(finding.body),4));
say();
}
lines.pop();
}
if(gif.frames.length>0){
heading('The frames');
const columns=[
['#',4,'right'],
['at',9,'right'],
['size',9,'right'],
['delay',6,'right'],
['disposal',28,'left'],
['palette',8,'left'],
['bytes',7,'right'],
];
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
        DISPOSALS[frame.disposal] ?? `Reserved (${frame.disposal})`,
        frame.palette ? `${frame.palette.count} local` : 'global',
        frame.bytes,
      ])}${isFullCanvas(gif, frame) ? '  full canvas' : ''}`
);
}
}
const notes=gif.extensions.filter((extension)=>extension.text);
if(notes.length>0){
heading('Text carried in the file');
for(const extension of notes){
say(`${extension.name} (${fileSize(extension.bytes)}):`);
say(wrap(extension.text.replace(/\s+/g,' ').trim().slice(0,2000),4));
say();
}
lines.pop();
}
if(gif.globalPalette){
heading('The global palette');
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
