/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function decodeSvgText(buffer){
const bytes=buffer instanceof Uint8Array?buffer:new Uint8Array(buffer);
if(bytes[0]===0xff&&bytes[1]===0xfe)return decodeWith(bytes.subarray(2),'utf-16le');
if(bytes[0]===0xfe&&bytes[1]===0xff)return decodeWith(bytes.subarray(2),'utf-16be');
if(bytes[0]===0xef&&bytes[1]===0xbb&&bytes[2]===0xbf){
return decodeWith(bytes.subarray(3),'utf-8');
}
if(bytes[0]===0x3c&&bytes[1]===0x00)return decodeWith(bytes,'utf-16le');
if(bytes[0]===0x00&&bytes[1]===0x3c)return decodeWith(bytes,'utf-16be');
const head=decodeWith(bytes.subarray(0,200),'latin1');
const declared=/<\?xml[^>]*encoding\s*=\s*["']([\w-]+)["']/i.exec(head)?.[1];
if(declared&&!/^utf-?8$/i.test(declared)){
try{
return new TextDecoder(declared).decode(bytes);
}catch{
}
}
return decodeWith(bytes,'utf-8');
}
const decodeWith=(bytes,label)=>new TextDecoder(label).decode(bytes);
