/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{parseJson,printJson}from'./shared/parse-json.js';
import{parseXml,printXml}from'./shared/parse-xml.js';
import{parseCss,printCss}from'./css.js';
import{parseYaml,printYaml}from'./shared/parse-yaml.js';
export const LANGUAGES=[
{id:'json',name:'JSON',minifies:true,sorts:true},
{id:'xml',name:'XML',minifies:true,sorts:false},
{id:'html',name:'HTML',minifies:true,sorts:false},
{id:'css',name:'CSS',minifies:true,sorts:false},
{id:'yaml',name:'YAML',minifies:false,sorts:false},
];
export const languageById=(id)=>LANGUAGES.find((item)=>item.id===id)??LANGUAGES[0];
export function formatText(text,{language,minify=false,indent='  ',sortKeys=false}){
return endWithNewline(run());
function run(){
switch(language){
case'json':
return printJson(parseJson(text),{indent:minify?'':indent,sortKeys});
case'xml':
return printXml(parseXml(text),{indent,minify});
case'html':
return printXml(parseXml(text,{html:true}),{indent,minify,html:true});
case'css':
return printCss(parseCss(text),{indent,minify});
case'yaml':
return printYaml(parseYaml(text),{indent:indent==='\t'?2:indent.length||2});
default:
const wrong=new Error('format.unknown');
wrong.values={language};
throw wrong;
}
}
}
function endWithNewline(text){
return text.endsWith('\n')?text:`${text}\n`;
}
export function detectLanguage(text){
const trimmed=stripLeadingComments(text.trim());
if(trimmed==='')return null;
if(trimmed.startsWith('<')){
return looksLikeHtml(trimmed)?'html':'xml';
}
if(trimmed.startsWith('{')||trimmed.startsWith('[')){
if(parses(()=>parseJson(text)))return'json';
return'json';
}
if(looksLikeCss(trimmed))return'css';
if(parses(()=>parseJson(text)))return'json';
if(looksLikeYaml(trimmed)&&parses(()=>parseYaml(text)))return'yaml';
return null;
}
function parses(run){
try{
run();
return true;
}catch{
return false;
}
}
function stripLeadingComments(text){
let rest=text;
for(;;){
if(rest.startsWith('/*')){
const end=rest.indexOf('*/');
if(end<0)return rest;
rest=rest.slice(end+2).trimStart();
continue;
}
if(rest.startsWith('//')){
const end=rest.indexOf('\n');
if(end<0)return'';
rest=rest.slice(end+1).trimStart();
continue;
}
return rest;
}
}
const HTML_MARKERS=/^<(!doctype html|html|head|body|div|p|span|table|ul|ol|section|main|nav|header|footer|h[1-6]|script|style|meta|link|form|a|img|br)\b/i;
function looksLikeHtml(trimmed){
if(/^<\?xml/i.test(trimmed))return false;
if(HTML_MARKERS.test(trimmed))return true;
return/<(br|hr|img|meta|link|input)\b[^>]*[^/]>/i.test(trimmed);
}
function looksLikeCss(trimmed){
if(/^@(media|import|charset|font-face|supports|layer|keyframes|tailwind|use)\b/i.test(trimmed))return true;
const open=trimmed.indexOf('{');
if(open<1)return false;
const close=trimmed.indexOf('}',open);
if(close<0)return false;
const body=trimmed.slice(open+1,close);
return/[-a-zA-Z]\s*:\s*[^;]+;/.test(body)&&!/^\s*["']/.test(trimmed);
}
function looksLikeYaml(trimmed){
if(trimmed.startsWith('---'))return true;
return/^[ \t]*(-\s+\S|[A-Za-z_"'][^\n:]*:(\s|$))/m.test(trimmed);
}
