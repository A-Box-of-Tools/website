/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const RANGE=0x1_0000_0000;
export function randomInt(bound){
if(!Number.isInteger(bound)||bound<1||bound>RANGE){
throw new RangeError(`randomInt needs a whole bound in 1..2^32, not ${bound}`);
}
if(bound===1)return 0;
const limit=RANGE-(RANGE%bound);
const word=new Uint32Array(1);
for(;;){
crypto.getRandomValues(word);
if(word[0]<limit)return word[0]%bound;
}
}
export function pick(list){
return list[randomInt(list.length)];
}
