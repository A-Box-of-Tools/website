/* Built from https://github.com/A-Box-of-Tools/website by build.py. Verify with: python build.py --check */
export const PACK_IMAGES=[
{
name:'favicon-16x16.png',
px:16,
why:'the tab, for browsers that prefer a PNG to the .ico',
},
{
name:'favicon-32x32.png',
px:32,
why:'the bookmark bar and a pinned Windows shortcut',
},
{
name:'apple-touch-icon.png',
px:180,
opaque:true,
why:'iOS home screen. Drawn opaque: iOS turns transparency into black',
},
{
name:'android-chrome-192x192.png',
px:192,
why:'Android home screen, and the install prompt',
},
{
name:'android-chrome-512x512.png',
px:512,
why:'the splash screen a web app shows while it starts',
},
{
name:'android-chrome-maskable-512x512.png',
px:512,
opaque:true,
inset:0.1,
why:'the same icon inside the safe area an adaptive launcher crops to',
},
{
name:'mstile-150x150.png',
px:150,
why:'a tile pinned to the Windows Start menu',
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
export function headSnippet(){
return`<!-- Icons. favicon.ico goes at the site root; browsers ask for it by
     that address without being told, so it needs no <link> of its own. -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="theme-color" content="#ffffff">
`
;
}
export function readme(icoName,sizes,hasIco){
const lines=PACK_IMAGES.map((image)=>`  ${image.name}  -  ${image.why}`);
const ico=hasIco
?`  ${icoName}  -  the classic favicon, holding ${sizes.join(', ')} pixel versions\n`
:'';
return`Website icon set
================

Made in the browser at abox.tools/image-to-ico/ - nothing was uploaded to
make it, and nothing about these files was sent anywhere.

Upload every file except this one and head.html to the root of your site, so
that they answer at /favicon.ico, /apple-touch-icon.png and so on. The paths in
site.webmanifest, browserconfig.xml and head.html all assume that. If they go
in a subfolder instead, edit those three files to match.

${ico}${lines.join('\n')}
  site.webmanifest  -  read by Android and by any install-to-home-screen prompt
  browserconfig.xml  -  read by a tile pinned to the Windows Start menu
  head.html  -  the markup to paste into your <head>; not a file to upload

Set the name in site.webmanifest to your site's name before you upload it, and
the two colours in it to whatever suits the icon.
${hasIco ? '' : `
Note: no favicon.ico is in here, because the .ico output was switched off. A
site really does want one - it is the address browsers ask for by themselves.
`}`
;
}
