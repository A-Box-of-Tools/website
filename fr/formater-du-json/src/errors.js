/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check (names mangled by esbuild) */
class l extends Error{constructor(t,r,n){const{line:s,column:e}=i(n,r);super(`${t} (line ${s}, column ${e})`),this.name="ParseError",this.index=r,this.line=s,this.column=e,this.reason=t}}function i(o,t){const n=o.slice(0,Math.max(0,Math.min(t,o.length))).split(`
`);return{line:n.length,column:n[n.length-1].length+1}}export{l as ParseError,i as positionOf};
