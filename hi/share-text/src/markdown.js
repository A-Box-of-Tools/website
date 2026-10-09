/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const escapeHtml=(s)=>s
.replace(/&/g,'&amp;').replace(/</g,'&lt;')
.replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function inline(s){
let out='';
for(const part of s.split(/(`[^`]+`)/)){
if(part.length>2&&part.startsWith('`')&&part.endsWith('`')){
out+=`<code>${escapeHtml(part.slice(1, -1))}</code>`;
continue;
}
let t=escapeHtml(part);
t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(whole,text,href)=>(
/^(https?:\/\/|mailto:)/i.test(href)
?`<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
:whole));
t=t.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
t=t.replace(/\*([^*]+)\*/g,'<em>$1</em>');
out+=t;
}
return out;
}
export function renderMarkdown(src){
const lines=src.split('\n');
let html='';
for(let i=0;i<lines.length;){
const line=lines[i];
if(/^```/.test(line)){
const body=[];
i+=1;
while(i<lines.length&&!/^```/.test(lines[i])){body.push(lines[i]);i+=1;}
i+=1;
html+=`<pre><code>${escapeHtml(body.join('\n'))}</code></pre>`;
continue;
}
const heading=line.match(/^(#{1,6})\s+(.*)$/);
if(heading){
const n=heading[1].length;
html+=`<h${n}>${inline(heading[2])}</h${n}>`;
i+=1;
continue;
}
if(/^(-{3,}|\*{3,})\s*$/.test(line)){html+='<hr>';i+=1;continue;}
if(/^>/.test(line)){
const body=[];
while(i<lines.length&&/^>/.test(lines[i])){body.push(lines[i].replace(/^>\s?/,''));i+=1;}
html+=`<blockquote>${body.map(inline).join('<br>')}</blockquote>`;
continue;
}
if(/^[-*]\s+/.test(line)){
const items=[];
while(i<lines.length&&/^[-*]\s+/.test(lines[i])){items.push(lines[i].replace(/^[-*]\s+/,''));i+=1;}
html+=`<ul>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`;
continue;
}
if(/^\d+[.)]\s+/.test(line)){
const items=[];
while(i<lines.length&&/^\d+[.)]\s+/.test(lines[i])){items.push(lines[i].replace(/^\d+[.)]\s+/,''));i+=1;}
html+=`<ol>${items.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`;
continue;
}
if(line.trim()===''){i+=1;continue;}
const body=[];
while(i<lines.length&&lines[i].trim()!==''
&&!/^(#{1,6}\s|```|>|[-*]\s|\d+[.)]\s|-{3,}\s*$|\*{3,}\s*$)/.test(lines[i])){
body.push(lines[i]);
i+=1;
}
html+=`<p>${body.map(inline).join('<br>')}</p>`;
}
return html;
}
