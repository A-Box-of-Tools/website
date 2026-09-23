/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const LEVELS=['L','M','Q','H'];
export const RECOVERY={L:7,M:15,Q:25,H:30};
export const LEVEL_BITS={L:1,M:0,Q:3,H:2};
const EC_PER_BLOCK={
L:[0,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,
28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,
30,30,30],
M:[0,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,
26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,
28,28,28],
Q:[0,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,
26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,
30,30,30],
H:[0,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,
26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,
30,30,30],
};
const BLOCKS={
L:[0,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,
10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
M:[0,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,
17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],
Q:[0,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,
23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,
68],
H:[0,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,
25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,
81],
};
export function sizeOf(version){
return version*4+17;
}
export function rawDataModules(version){
let modules=(16*version+128)*version+64;
if(version>=2){
const count=alignmentCount(version);
modules-=(25*count-10)*count-55;
if(version>=7)modules-=36;
}
return modules;
}
export function totalCodewords(version){
return Math.floor(rawDataModules(version)/8);
}
export function remainderBits(version){
return rawDataModules(version)%8;
}
function alignmentCount(version){
return Math.floor(version/7)+2;
}
export function alignmentPositions(version){
if(version===1)return[];
const count=alignmentCount(version);
const step=version===32
?26
:Math.ceil((version*4+4)/(count*2-2)/2)*2;
const positions=[6];
for(let pos=sizeOf(version)-7;positions.length<count;pos-=step){
positions.splice(1,0,pos);
}
return positions;
}
export function blockLayout(version,level){
const ecPerBlock=EC_PER_BLOCK[level][version];
const blocks=BLOCKS[level][version];
const dataCodewords=totalCodewords(version)-ecPerBlock*blocks;
const shortLength=Math.floor(dataCodewords/blocks);
const longBlocks=dataCodewords%blocks;
return{
blocks,
ecPerBlock,
dataCodewords,
shortLength,
longBlocks,
};
}
export function dataCapacity(version,level){
return blockLayout(version,level).dataCodewords;
}
export function countBits(mode,version){
const group=version<=9?0:version<=26?1:2;
return{numeric:[10,12,14],alphanumeric:[9,11,13],byte:[8,16,16]}[mode][group];
}
