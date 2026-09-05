/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{sizeText}from'./shared/format.js?v=99bbf4b1ff';
export const bytes=(n,t)=>sizeText(n,t,{under:'size.b',kb:'auto',mb:2});
export function count(n){
return n.toLocaleString('en-US');
}
export function overhead(fileBytes,uriLength,t){
if(!fileBytes)return'';
const delta=Math.round(((uriLength-fileBytes)/fileBytes)*100);
if(delta===0)return t('overhead.same');
return delta>0
?t('overhead.larger',{percent:delta})
:t('overhead.smaller',{percent:-delta});
}
export function verdict(uriLength){
if(uriLength<=2*1024)return{level:'good',key:'verdict.tiny'};
if(uriLength<=10*1024)return{level:'good',key:'verdict.icon'};
if(uriLength<=50*1024)return{level:'fair',key:'verdict.large'};
return{level:'poor',key:'verdict.toobig'};
}
export function metadataNote(meta,fileBytes,t){
const share=fileBytes?Math.round((meta.bytes/fileBytes)*100):0;
const values={size:bytes(meta.bytes,t),kinds:list(meta.kinds,t),percent:share};
return t(share>=5?'meta.share':'meta.plain',values);
}
export function list(items,t){
const said=items.map((item)=>t(item));
if(said.length<=1)return said[0]??'';
return t('join.and',{
a:said.slice(0,-1).reduce((x,y)=>t('join.comma',{a:x,b:y})),
b:said[said.length-1],
});
}
export function dimensions(width,height){
return`${width} × ${height}`;
}
