/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{parseJson,printJson}from'./shared/parse-json.js?v=f87a3bb150';
import{parseYaml,printYaml}from'./shared/parse-yaml.js?v=f87a3bb150';
export function jsonToYaml(text,{indent=2}={}){
return printYaml(parseJson(text),{indent});
}
export function yamlToJson(text,{indent='  ',sortKeys=false}={}){
return`${printJson(stripRaw(parseYaml(text)), { indent, sortKeys })}\n`;
}
function stripRaw(node){
switch(node.t){
case'map':return{t:'map',pairs:node.pairs.map((pair)=>({key:pair.key,value:stripRaw(pair.value)}))};
case'seq':return{t:'seq',items:node.items.map(stripRaw)};
case'str':return{t:'str',value:node.value};
default:return node;
}
}
export const CONVERSIONS=[
{
id:'yaml-json',
name:'convert.yaml-json.name',
note:'convert.yaml-json',
run:(text,options)=>yamlToJson(text,{indent:options.indent,sortKeys:options.sortKeys}),
output:'json',
},
{
id:'json-yaml',
name:'convert.json-yaml.name',
note:'convert.json-yaml',
run:(text,options)=>jsonToYaml(text,{indent:options.spaces}),
output:'yaml',
},
];
export const conversionById=(id)=>CONVERSIONS.find((item)=>item.id===id)??CONVERSIONS[0];
