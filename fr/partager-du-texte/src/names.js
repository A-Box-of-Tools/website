/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
const ADJECTIVES=[
'bold','brave','bright','calm','clever','eager','gentle','glad',
'golden','happy','keen','kind','lively','lucky','mellow','merry',
'noble','proud','quick','quiet','sunny','swift','warm','witty',
];
const NOUNS=[
'acorn','badger','comet','falcon','fern','harbor','heron','lagoon',
'lantern','maple','meadow','otter','owl','pebble','pine','quartz',
'reef','robin','sparrow','tulip','walnut','willow','wren','yarrow',
];
const pick=(list)=>list[Math.floor(Math.random()*list.length)];
export function makeCode(){
return`${pick(ADJECTIVES)}-${pick(NOUNS)}-${10 + Math.floor(Math.random() * 90)}`;
}
export{normalize,CODE_PATTERN}from'./shared/room-names.js?v=059f65cfd1';
export function formatSize(n,units){
if(n<1024)return`${n} ${units.b}`;
if(n<1048576)return`${(n / 1024).toFixed(1)} ${units.kb}`;
return`${(n / 1048576).toFixed(1)} ${units.mb}`;
}
