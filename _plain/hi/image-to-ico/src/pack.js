/**
 * The rest of a website's icon set, and the two text files that point at it.
 *
 * An .ico is still the right answer for `/favicon.ico`, and it is the only
 * answer for the Windows half of the job. It is not, on its own, a modern
 * website icon set: iOS asks for a 180px PNG by a name of its own, Android and
 * every install-to-home-screen prompt read a web app manifest, and Windows
 * pinned tiles read an XML file. None of those will look at an .ico.
 *
 * So the pack is offered beside it: the same picture, at the sizes those three
 * platforms publish, plus the manifest, the browserconfig, and the block of
 * HTML that ties them together. Everything below is drawn by the same canvas
 * code as the icon itself and written by the same ZIP writer, on the same
 * machine. Nothing here is fetched or generated anywhere else.
 *
 * TWO PLACES WHERE THE PLATFORM'S RULE IS NOT THE OBVIOUS ONE
 *
 *   - The Apple touch icon is drawn opaque, on purpose. iOS composites it onto
 *     its own tile with no idea what is behind it, and transparency there comes
 *     out black. Every other file in the pack keeps its alpha.
 *   - The maskable icon is drawn small, on purpose. An Android launcher crops
 *     an adaptive icon to whatever shape it likes and only the middle 80% is
 *     guaranteed to survive, so a logo drawn edge to edge loses its corners.
 *
 * @see https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
 * @see https://www.w3.org/TR/appmanifest/
 */

/**
 * The PNGs in the pack, in the order they are drawn.
 *
 * @type {{name: string, px: number, opaque?: boolean, inset?: number, why: string}[]}
 */
export const PACK_IMAGES = [
  {
    name: 'favicon-16x16.png',
    px: 16,
    why: 'the tab, for browsers that prefer a PNG to the .ico',
  },
  {
    name: 'favicon-32x32.png',
    px: 32,
    why: 'the bookmark bar and a pinned Windows shortcut',
  },
  {
    name: 'apple-touch-icon.png',
    px: 180,
    opaque: true,
    why: 'iOS home screen. Drawn opaque: iOS turns transparency into black',
  },
  {
    name: 'android-chrome-192x192.png',
    px: 192,
    why: 'Android home screen, and the install prompt',
  },
  {
    name: 'android-chrome-512x512.png',
    px: 512,
    why: 'the splash screen a web app shows while it starts',
  },
  {
    name: 'android-chrome-maskable-512x512.png',
    px: 512,
    opaque: true,
    inset: 0.1,
    why: 'the same icon inside the safe area an adaptive launcher crops to',
  },
  {
    name: 'mstile-150x150.png',
    px: 150,
    why: 'a tile pinned to the Windows Start menu',
  },
];

/**
 * The web app manifest.
 *
 * Deliberately minimal. `name` and `short_name` are the site's, not this
 * tool's, and are left as placeholders rather than guessed at from a filename -
 * a manifest that quietly names somebody's app "logo-final-v2" is worse than
 * one that says where to type the name.
 *
 * @param {{name: string, background: string, theme: string}} site
 * @returns {string}
 */
export function manifest({ name, background, theme }) {
  return `${JSON.stringify({
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
  }, null, 2)}\n`;
}

/**
 * browserconfig.xml, which is what a pinned tile in the Windows Start menu
 * reads. Nothing else looks at it, and leaving it out costs a site nothing
 * except that tile - it is in the pack because it is four lines and because
 * the mstile PNG beside it would otherwise be an orphan.
 */
export function browserConfig(tile) {
  return `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/mstile-150x150.png"/>
      <TileColor>${tile}</TileColor>
    </tile>
  </msapplication>
</browserconfig>
`;
}

/**
 * The block to paste into <head>, and the only part of this that is easy to get
 * wrong twice.
 *
 * `/favicon.ico` carries no <link> of its own. Every browser asks for that
 * address whether or not the page mentions it, and naming it as well is how a
 * site ends up serving the file twice. It is listed in the comment instead, so
 * that whoever pastes this knows the file still has to be uploaded.
 */
export function headSnippet() {
  return `<!-- Icons. favicon.ico goes at the site root; browsers ask for it by
     that address without being told, so it needs no <link> of its own. -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="theme-color" content="#ffffff">
`;
}

/**
 * A short note in the zip saying what each file is for and where it goes.
 *
 * A folder of eight icons with no explanation is how half of them end up
 * unused. This is generated from the same table the images are drawn from, so
 * it cannot describe a file the pack does not contain.
 */
export function readme(icoName, sizes, hasIco) {
  const lines = PACK_IMAGES.map((image) => `  ${image.name}  -  ${image.why}`);
  const ico = hasIco
    ? `  ${icoName}  -  the classic favicon, holding ${sizes.join(', ')} pixel versions\n`
    : '';

  return `Website icon set
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
`}`;
}
