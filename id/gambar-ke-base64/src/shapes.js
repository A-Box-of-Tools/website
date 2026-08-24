/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check (names mangled by esbuild) */
const a=[{id:"uri",ext:"txt"},{id:"css-rule",ext:"css"},{id:"css-var",ext:"css"},{id:"html",ext:"html"},{id:"markdown",ext:"md"}],c=e=>a.find(n=>n.id===e)??a[0];function o(e,n){switch(e){case"css-rule":return`.${n.ident} {
  background-image: url("${n.uri}");
}`;case"css-var":return`--${n.ident}: url("${n.uri}");`;case"html":return`<img src="${n.uri}" alt=""${s(n)}>`;case"markdown":return`![](${n.uri})`;default:return n.uri}}function s(e){return e.svg||!e.width||!e.height?"":` width="${e.width}" height="${e.height}"`}function d(e,n){const t=n.map(r=>o(e,r));return e==="css-var"?`:root {
${t.map(r=>`  ${r}`).join(`
`)}
}`:e==="uri"?n.map((r,i)=>`${r.name}
${t[i]}`).join(`

`):t.join(`

`)}function $(e){return`data-uris.${c(e).ext}`}function m(e,n){return`${n.ident}-data-uri.${c(e).ext}`}function p(e){const n=new Map;return e.map(t=>{const r=u(t),i=n.get(r)??0;return n.set(r,i+1),i?`${r}-${i+1}`:r})}function u(e){const t=(e.replace(/\.[^.]+$/,"")||e).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");return t?/^[0-9]/.test(t)?`img-${t}`:t:"image"}export{a as SHAPES,d as bundle,$ as bundleName,m as fileName,p as identifiers,o as render,c as shapeById};
