/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check (names mangled by esbuild) */
import{deflate as b,filterNames as R}from"./filters.js";import{name as k,Name as E,PdfStream as w,PdfString as O,Ref as y}from"./objects.js";const M=200,T=128;class C{constructor(){this.chunks=[],this.length=0}raw(n){this.chunks.push(n),this.length+=n.length}ascii(n){const o=new Uint8Array(n.length);for(let e=0;e<n.length;e+=1)o[e]=n.charCodeAt(e)&255;this.raw(o)}}function L(t){return Number.isFinite(t)?Number.isInteger(t)&&Math.abs(t)<1e15?String(t):t.toFixed(6).replace(/\.?0+$/,"")||"0":"0"}function D(t){let n="/";for(const o of t){const e=o.charCodeAt(0),s=e>32&&e<127&&!"()<>[]{}/%#".includes(o);n+=s?o:`#${e.toString(16).padStart(2,"0")}`}return n}function P(t){let n="<";for(const o of t)n+=o.toString(16).padStart(2,"0");return`${n}>`}function A(t,n,o=0){if(o>200||t==null)return"null";if(t===!0)return"true";if(t===!1)return"false";if(typeof t=="number")return L(t);if(t instanceof E)return D(t.value);if(t instanceof O)return P(t.bytes);if(t instanceof y){const e=n.get(t.num);return e===void 0?"null":`${e} 0 R`}return Array.isArray(t)?`[${t.map(e=>A(e,n,o+1)).join(" ")}]`:t instanceof w?S(t.dict,n,o):t instanceof Map?S(t,n,o):"null"}function S(t,n,o){let e="<<";for(const[s,c]of t)e+=`${D(s)} ${A(c,n,o+1)} `;return`${e.trimEnd()}>>`}function U(t,n){const o=new Set,e=[],s=(c,l)=>{if(l>500)return;if(c instanceof y){if(o.has(c.num))return;o.add(c.num),e.push(c.num);return}if(Array.isArray(c)){for(const i of c)s(i,l+1);return}const u=c instanceof w?c.dict:c;if(u instanceof Map)for(const i of u.values())s(i,l+1)};for(const c of n)s(c,0);for(let c=0;c<e.length;c+=1)s(t.getObject(e[c]),0);return o}function q(t){let n=0;const o=(e,s)=>{e instanceof Map&&e.has(s)&&(e.delete(s),n+=1)};for(const e of t.objects.values()){const s=e instanceof w?e.dict:e;s instanceof Map&&(o(s,"Metadata"),o(s,"PieceInfo"),o(s,"LastModified"),o(s,"Thumb"))}return t.trailer.delete("Info"),n}async function G(t,{onProgress:n,recompress:o=!0,signal:e}={}){const s=[t.trailer.get("Root")];t.trailer.has("Info")&&s.push(t.trailer.get("Info"));const l=[...U(t,s)].sort((f,h)=>f-h),u=new Map;l.forEach((f,h)=>u.set(f,h+1));const i=[],d=[];for(const f of l){const h=t.getObject(f);h instanceof w?i.push({num:f,value:h}):d.push({num:f,value:h})}const a=new C,p=t.version>="1.5"?t.version:"1.5";a.ascii(`%PDF-${p}
`),a.raw(new Uint8Array([37,226,227,207,211,10]));const m=new Map,x={next:l.length+1};let g=0;const r=i.length+d.length;for(const{num:f,value:h}of i){if(e?.aborted)throw new DOMException("Cancelled","AbortError");const j=u.get(f);m.set(j,{offset:a.length});let{raw:$}=h;if(o&&z(t,h))try{const F=await b($);F.length<$.length&&($=F,h.dict.set("Filter",k("FlateDecode")))}catch{}h.dict.set("Length",$.length),a.ascii(`${j} 0 obj
${S(h.dict,u,0)}
stream
`),a.raw($),a.ascii(`
endstream
endobj
`),g+=1,g%24===0&&(n?.(g,r),await I())}return await W(a,d,u,m,x,()=>{g+=1,g%200===0&&n?.(g,r)}),await B(a,m,u,t,x),n?.(r,r),new Blob(a.chunks,{type:"application/pdf"})}function I(){return new Promise(t=>setTimeout(t,0))}function z(t,n){return n.raw.length<T?!1:R(n.dict,o=>t.resolve(o)).length===0}async function W(t,n,o,e,s,c){for(let l=0;l<n.length;l+=M){const u=n.slice(l,l+M);let i="",d="";for(const{num:r,value:f}of u){const h=o.get(r);i+=`${h} ${d.length} `,d+=`${A(f,o,0)}
`,c()}const a=i+d,p=new Uint8Array(a.length);for(let r=0;r<a.length;r+=1)p[r]=a.charCodeAt(r)&255;const m=s.next;s.next+=1,u.forEach(({num:r},f)=>{e.set(o.get(r),{stm:m,index:f})});let x=p,g="";try{const r=await b(p);r.length<p.length&&(x=r,g=" /Filter /FlateDecode")}catch{}e.set(m,{offset:t.length}),t.ascii(`${m} 0 obj
<< /Type /ObjStm /N ${u.length} /First ${i.length}${g} /Length ${x.length} >>
stream
`),t.raw(x),t.ascii(`
endstream
endobj
`),await I()}}async function B(t,n,o,e,s){const c=s.next;s.next+=1;const l=t.length;n.set(c,{offset:l});const u=c+1,i=new Uint8Array(u*7);i[0]=0,i[5]=255,i[6]=255;for(const[g,r]of n){const f=g*7;f+7>i.length||("offset"in r?(i[f]=1,i[f+1]=r.offset>>>24&255,i[f+2]=r.offset>>>16&255,i[f+3]=r.offset>>>8&255,i[f+4]=r.offset&255):(i[f]=2,i[f+1]=r.stm>>>24&255,i[f+2]=r.stm>>>16&255,i[f+3]=r.stm>>>8&255,i[f+4]=r.stm&255,i[f+5]=r.index>>>8&255,i[f+6]=r.index&255))}let d=i,a="";try{const g=await b(i);g.length<i.length&&(d=g,a=" /Filter /FlateDecode")}catch{}const p=o.get(N(e.trailer.get("Root"))),m=o.get(N(e.trailer.get("Info")));let x=`<< /Type /XRef /Size ${u} /W [1 4 2] /Root ${p} 0 R`;m!==void 0&&(x+=` /Info ${m} 0 R`),x+=`${a} /Length ${d.length} >>`,t.ascii(`${c} 0 obj
${x}
stream
`),t.raw(d),t.ascii(`
endstream
endobj
`),t.ascii(`startxref
${l}
%%EOF
`)}function N(t){return t instanceof y?t.num:-1}export{U as reachable,q as stripMetadata,G as writeDocument};
