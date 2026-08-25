/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export class ParseError extends Error{
constructor(message,index,text){
const{line,column}=positionOf(text,index);
super(`${message} (line ${line}, column ${column})`);
this.name='ParseError';
this.index=index;
this.line=line;
this.column=column;
this.reason=message;
}
}
export function positionOf(text,index){
const upTo=text.slice(0,Math.max(0,Math.min(index,text.length)));
const lines=upTo.split('\n');
return{line:lines.length,column:lines[lines.length-1].length+1};
}
