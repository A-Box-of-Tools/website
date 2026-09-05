/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
import{listOf}from'./files.js?v=a69b115f80';
const WIDTH=78;
export const PACK_IMAGES=[
{
name:'favicon-16x16.png',
px:16,
why:'pack.favicon16',
},
{
name:'favicon-32x32.png',
px:32,
why:'pack.favicon32',
},
{
name:'apple-touch-icon.png',
px:180,
opaque:true,
why:'pack.apple',
},
{
name:'android-chrome-192x192.png',
px:192,
why:'pack.android192',
},
{
name:'android-chrome-512x512.png',
px:512,
why:'pack.android512',
},
{
name:'android-chrome-maskable-512x512.png',
px:512,
opaque:true,
inset:0.1,
why:'pack.maskable',
},
{
name:'mstile-150x150.png',
px:150,
why:'pack.mstile',
},
];
export function manifest({name,background,theme}){
return`${JSON.stringify({
    name,
    short_name: name,
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/android-chrome-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    theme_color: theme,
    background_color: background,
    display: 'standalone',
  }, null, 2)}\n`
;
}
export function browserConfig(tile){
return`<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>${tile}</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`
;
}
export function headSnippet(t){
const comment=wrap(t('head.comment'),WIDTH-5).split('\n').join('\n     ');
return`<!-- ${comment} -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="theme-color" content="#ffffff">
`
;
}
export function readme(icoName,sizes,hasIco,t){
const line=(name,why)=>{
const head=`  ${name}  -  `;
const indent=' '.repeat(head.length);
return head+wrap(why,WIDTH-head.length).split('\n').join(`\n${indent}`);
};
const lines=PACK_IMAGES.map((image)=>line(image.name,t(image.why)));
const ico=hasIco
?`${line(icoName, t('readme.ico', { sizes: listOf(sizes, t) }))}\n`
:'';
const title=t('readme.title');
return`${title}
${'='.repeat(columns(title))}

${wrap(t('readme.made'))}

${wrap(t('readme.upload'))}

${ico}${lines.join('\n')}
${line('site.webmanifest', t('readme.manifest'))}
${line('browserconfig.xml', t('readme.browserconfig'))}
${line('head.html', t('readme.head'))}

${wrap(t('readme.setname'))}
${hasIco ? '' : `
${wrap(t('readme.noico'))}
`}`
;
}
function columns(text){
return[...text].reduce((n,ch)=>n+(/[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/.test(ch)?2:1),0);
}
function wrap(text,width=WIDTH){
const lines=[];
let line='';
for(const word of text.split(' ')){
if(line&&line.length+1+word.length>width){
lines.push(line);
line=word;
}else{
line=line?`${line} ${word}`:word;
}
}
if(line)lines.push(line);
return lines.join('\n');
}
