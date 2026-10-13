/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export function rc4(key,data){
const s=new Uint8Array(256);
for(let i=0;i<256;i+=1)s[i]=i;
for(let i=0,j=0;i<256;i+=1){
j=(j+s[i]+key[i%key.length])&0xff;
const swap=s[i];
s[i]=s[j];
s[j]=swap;
}
const out=new Uint8Array(data.length);
let i=0;
let j=0;
for(let at=0;at<data.length;at+=1){
i=(i+1)&0xff;
j=(j+s[i])&0xff;
const swap=s[i];
s[i]=s[j];
s[j]=swap;
out[at]=data[at]^s[(s[i]+s[j])&0xff];
}
return out;
}
