/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const SIZES=[
{px:16,why:'browser tab, address bar, and the small icon in Explorer'},
{px:20,why:'Windows list views at 125%'},
{px:24,why:'the Windows taskbar at 150%'},
{px:32,why:'the desktop, the taskbar, and a browser bookmark bar'},
{px:40,why:'the desktop at 125%'},
{px:48,why:'Explorer’s medium icons, and what Google reads a favicon at'},
{px:64,why:'Explorer at 200%, and the Alt-Tab switcher'},
{px:96,why:'Explorer’s large icons'},
{px:128,why:'the old jumbo size, still read by installers'},
{px:256,why:'Explorer’s extra-large icons and the Start menu; the largest an .ico holds'},
];
export const WHY=new Map(SIZES.map(({px,why})=>[px,why]));
export const PRESETS=[
{
id:'website',
label:'Website favicon',
note:'The classic favicon.ico that goes at the root of a site. Three sizes is '
+'the whole convention: 16 for the tab, 32 for a bookmark and a Windows '
+'shortcut, 48 because that is the size Google reads a site icon at.',
sizes:[16,32,48],
storage:'auto',
},
{
id:'app',
label:'Windows application icon',
note:'What an .exe or a shortcut wants, and what Visual Studio’s own '
+'app.ico contains: the three shell sizes plus the 256 that the Start '
+'menu and Explorer’s extra-large view draw from.',
sizes:[16,32,48,256],
storage:'auto',
},
{
id:'app-hidpi',
label:'Windows application, every scale',
note:'The same icon with the in-between sizes Windows asks for at 125%, '
+'150% and 200% display scaling. Bigger file, and the only version that '
+'is not quietly resampled on a high-DPI laptop.',
sizes:[16,20,24,32,40,48,64,96,128,256],
storage:'auto',
},
{
id:'legacy',
label:'Maximum compatibility',
note:'Three sizes, every one of them stored the pre-Vista way, for '
+'installers, embedded devices and old shell tooling that reads an .ico '
+'itself and does not know what a PNG inside one is.',
sizes:[16,32,48],
storage:'bmp',
},
{
id:'custom',
label:'Choose the sizes yourself',
note:'Every size this format can hold. Ticking all of them is rarely the '
+'right answer: each one is a whole picture, and nothing reads a size '
+'nothing asked for.',
sizes:[16,32,48],
storage:'auto',
},
];
export const presetById=(id)=>PRESETS.find((preset)=>preset.id===id)??PRESETS[0];
export function storageFor(px,storage){
if(storage==='png'||storage==='bmp')return storage;
return px>64?'png':'bmp';
}
export const dibBytes=(px)=>40+px*px*4+(((px+31)>>5)*4)*px;
