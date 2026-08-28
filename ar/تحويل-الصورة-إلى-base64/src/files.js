/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function bytes(n,t){
if(n<1024)return t('size.b',{n});
if(n<1024*1024)return t('size.kb',{n:(n/1024).toFixed(n<10240?1:0)});
return t('size.mb',{n:(n/(1024*1024)).toFixed(2)});
}
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
