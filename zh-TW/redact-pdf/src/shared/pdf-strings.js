/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function decodeText(bytes){
if(bytes.length>=2&&bytes[0]===0xfe&&bytes[1]===0xff){
let text='';
for(let at=2;at+1<bytes.length;at+=2){
text+=String.fromCharCode((bytes[at]<<8)|bytes[at+1]);
}
return text;
}
let text='';
for(const byte of bytes)text+=String.fromCharCode(byte);
return text;
}
export function encodeText(text){
const out=new Uint8Array(2+text.length*2);
out[0]=0xfe;
out[1]=0xff;
for(let at=0;at<text.length;at+=1){
const code=text.charCodeAt(at);
out[2+at*2]=(code>>8)&0xff;
out[3+at*2]=code&0xff;
}
return out;
}
