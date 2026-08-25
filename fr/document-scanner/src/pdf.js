/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check (names mangled by esbuild) */
const a=72,l=2.834645669291339;function u(s){return Number.isFinite(s)&&s.toFixed(4).replace(/\.?0+$/,"")||"0"}function o(s){const t=new Uint8Array(s.length);for(let n=0;n<s.length;n+=1)t[n]=s.charCodeAt(n)&255;return t}function x(s){let t="FEFF";for(const n of c(s))t+=n.toString(16).padStart(4,"0").toUpperCase();return`<${t}>`}function*c(s){for(let t=0;t<s.length;t+=1)yield s.charCodeAt(t)}class g{constructor(){this.chunks=[],this.length=0,this.offsets=[],this.raw(o(`%PDF-1.7
`)),this.raw(new Uint8Array([37,226,227,207,211,10]))}raw(t){this.chunks.push(t),this.length+=t.length}ascii(t){this.raw(o(t))}reserve(){return this.offsets.push(0),this.offsets.length}object(t,n){this.offsets[t-1]=this.length,this.ascii(`${t} 0 obj
${n}
endobj
`)}stream(t,n,e){this.offsets[t-1]=this.length,this.ascii(`${t} 0 obj
<<${n} /Length ${e.length}>>
stream
`),this.raw(e),this.ascii(`
endstream
endobj
`)}finish({root:t,info:n}){const e=this.length,i=this.offsets.length+1;let r=`xref
0 ${i}
0000000000 65535 f\r
`;for(const f of this.offsets)r+=`${String(f).padStart(10,"0")} 00000 n\r
`;this.ascii(r);const h=n?`<< /Size ${i} /Root ${t} 0 R /Info ${n} 0 R >>`:`<< /Size ${i} /Root ${t} 0 R >>`;return this.ascii(`trailer
${h}
startxref
${e}
%%EOF
`),new Blob(this.chunks,{type:"application/pdf"})}}export{a as PT_PER_INCH,l as PT_PER_MM,g as PdfWriter,u as num,x as textString};
