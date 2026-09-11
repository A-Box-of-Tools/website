/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SIZES=[
{px:16,why:'why.16'},
{px:20,why:'why.20'},
{px:24,why:'why.24'},
{px:32,why:'why.32'},
{px:40,why:'why.40'},
{px:48,why:'why.48'},
{px:64,why:'why.64'},
{px:96,why:'why.96'},
{px:128,why:'why.128'},
{px:256,why:'why.256'},
];
export const WHY=new Map(SIZES.map(({px,why})=>[px,why]));
export const PRESETS=[
{id:'website',label:'preset.website.label',note:'preset.website.note',sizes:[16,32,48],storage:'auto'},
{id:'app',label:'preset.app.label',note:'preset.app.note',sizes:[16,32,48,256],storage:'auto'},
{
id:'app-hidpi',
label:'preset.app-hidpi.label',
note:'preset.app-hidpi.note',
sizes:[16,20,24,32,40,48,64,96,128,256],
storage:'auto',
},
{id:'legacy',label:'preset.legacy.label',note:'preset.legacy.note',sizes:[16,32,48],storage:'bmp'},
{id:'custom',label:'preset.custom.label',note:'preset.custom.note',sizes:[16,32,48],storage:'auto'},
];
export const presetById=(id)=>PRESETS.find((preset)=>preset.id===id)??PRESETS[0];
export function storageFor(px,storage){
if(storage==='png'||storage==='bmp')return storage;
return px>64?'png':'bmp';
}
export const dibBytes=(px)=>40+px*px*4+(((px+31)>>5)*4)*px;
