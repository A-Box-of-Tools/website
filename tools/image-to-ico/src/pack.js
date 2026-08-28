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

import { listOf } from './files.js';

/** How wide a line of generated plain text is allowed to get. */
const WIDTH = 78;

/**
 * The PNGs in the pack, in the order they are drawn.
 *
 * `why` is a phrase key, not a sentence: it is shown on the page and written
 * into the README in the zip, and this file is copied byte for byte into every
 * language. See sizes.js, which holds its reasons the same way.
 *
 * @type {{name: string, px: number, opaque?: boolean, inset?: number, why: string}[]}
 */
export const PACK_IMAGES = [
  {
    name: 'favicon-16x16.png',
    px: 16,
    why: 'pack.favicon16',
  },
  {
    name: 'favicon-32x32.png',
    px: 32,
    why: 'pack.favicon32',
  },
  {
    name: 'apple-touch-icon.png',
    px: 180,
    opaque: true,
    why: 'pack.apple',
  },
  {
    name: 'android-chrome-192x192.png',
    px: 192,
    why: 'pack.android192',
  },
  {
    name: 'android-chrome-512x512.png',
    px: 512,
    why: 'pack.android512',
  },
  {
    name: 'android-chrome-maskable-512x512.png',
    px: 512,
    opaque: true,
    inset: 0.1,
    why: 'pack.maskable',
  },
  {
    name: 'mstile-150x150.png',
    px: 150,
    why: 'pack.mstile',
  },
];

/**
 * The web app manifest.
 *
 * Deliberately minimal. `name` and `short_name` are the site's, not this
 * tool's, and are left as placeholders rather than guessed at from a filename -
 * a manifest that quietly names somebody's app "logo-final-v2" is worse than
 * one that says where to type the name. The placeholder is a phrase, because
 * it is an instruction to the reader and the reader may not read English.
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
export function headSnippet(t) {
  // The comment is wrapped here rather than typed with its breaks in it: it is
  // a sentence now, and a translated sentence is not the length this one was.
  // Continuation lines sit under the text, the way a comment reads.
  const comment = wrap(t('head.comment'), WIDTH - 5).split('\n').join('\n     ');

  return `<!-- ${comment} -->
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
export function readme(icoName, sizes, hasIco, t) {
  // A hanging indent, because a reason is a sentence and a translated one is
  // not the length the English was. The continuation lines sit under the
  // description rather than under the filename, so the column still reads as a
  // column.
  const line = (name, why) => {
    const head = `  ${name}  -  `;
    const indent = ' '.repeat(head.length);
    return head + wrap(why, WIDTH - head.length).split('\n').join(`\n${indent}`);
  };
  const lines = PACK_IMAGES.map((image) => line(image.name, t(image.why)));
  const ico = hasIco
    ? `${line(icoName, t('readme.ico', { sizes: listOf(sizes, t) }))}\n`
    : '';

  const title = t('readme.title');

  return `${title}
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
`}`;
}

/**
 * How wide a string is in a fixed-width font, which is not how long it is.
 *
 * A CJK character occupies two columns. Counting them as one puts thirteen
 * equals signs under a title that is twenty-six columns wide, which is a
 * ragged line in exactly the file that is meant to look tidy. The ranges are
 * the East Asian Wide and Fullwidth blocks, which is enough for the eleven
 * languages this site ships and does not need a table.
 */
function columns(text) {
  return [...text].reduce((n, ch) => n + (/[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹯＀-｠￠-￦]/.test(ch) ? 2 : 1), 0);
}

/**
 * Break a sentence into lines a plain-text file can hold.
 *
 * The paragraphs used to be typed with the line breaks already in them, which
 * only works while the words are English and never change. A translation is a
 * different length, so the breaking is done here, at the spaces - and a
 * language that does not put spaces between its words simply comes back as one
 * long line, which a text editor wraps, rather than as one broken in the wrong
 * places.
 */
function wrap(text, width = WIDTH) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && line.length + 1 + word.length > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}
