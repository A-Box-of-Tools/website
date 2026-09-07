# Business Profile Preview

[← all tools](../) · [the page](https://abox.tools/business-profile-preview/)

A form of the fields a Google Business Profile has, drawn as the three places a
profile is seen — the desktop knowledge panel, the place card on a phone, and
one entry of the local search pack — and downloadable as a PNG, an SVG or a
JSON file of the fields themselves. There is no file in that the visitor did not
choose, no account, and no network step of any kind.

It is the second tool here whose input is typed rather than dropped, after the
QR generator, and the first whose subject is a page on somebody else's site.
That second thing is the whole reason it is interesting to build and the reason
most of the decisions below were decisions at all.

## Why it is built the way it is

### The import goes the wrong way round, and that is the point

The obvious version of "preview my existing profile" fetches the listing. This
one cannot: `connect-src` on every page here names Google's ad and measurement
origins and nothing else, so there is no address this page could fetch a listing
from — and the ability to fetch is the ability to send. A tool that could go and
get your profile is a tool that could post your address somewhere, and the whole
site is built on that not being possible.

So the import runs the other way. You open your listing, select it, copy it, and
paste the text in; `src/parse-listing.js` runs a set of recognisers over the
lines and fills in what it is confident about. The recognisers are ordinary and
in a deliberate order — a rating looks like `4.5 (1,284)`, a phone number is
seven digits and little else, a website is a host with no `@` in it, an address
has a comma and a digit — and the name and the category are decided last, out of
whatever nothing else claimed.

**It reports what it took.** `parseListing` returns a profile *and* a list of
the field names it filled, and the page prints that list back: "Read the name,
the category, the rating and the address." A heuristic that announces its
guesses is a five-second correction; the same heuristic silently applied is a
mock-up somebody signs off with the wrong category on it.

**A half-read week is refused outright.** Opening hours are the one field where
partial success is worse than failure: six days recognised and one missed looks
deliberate on the card, and Sunday is exactly the day nobody checks. So
`readHours` returns the week or it returns `null`, and `null` leaves the form's
existing hours alone.

The other door is `src/saved.js`, which reads two shapes: the JSON this page
writes, and a Business Profile API `Location` — `title`, `storefrontAddress`,
`phoneNumbers.primaryPhone`, `categories.primaryCategory.displayName`,
`regularHours.periods`. Anybody who can export their profile at all has the
second shape rather than the first, and reading it costs about sixty lines.

The two importers disagree about a missing day, and the disagreement is correct.
A *paste* is a rendering, so a day that is not in it means nobody copied it; an
*export* is a record, so a day with no period in it means the place is shut.

### Three surfaces, not one preview

The same profile is cut to three different lengths, and which half survives the
cut is the thing worth previewing. A name that reads well in the knowledge
panel is an ellipsis in a local pack entry; a description that carries the
business in the panel does not appear in the search result at all. Somebody
filling the fields in is filling them in for all three at once, so all three are
here rather than one "preview" that is whichever surface got built first.

They share every piece — the rating row, the status line, the detail rows, the
action buttons, the attribute pills — and differ only in width and in what they
have room for. `src/surfaces.js` walks a cursor down each card and every block
reports how far it moved it, which is what stops an empty field leaving a hole.

### The stars are a fraction, and an unrated profile has none

A 4.6 is drawn as four stars and three fifths of a fifth: the grey row is drawn,
the gold row is drawn over it, and the gold one is clipped to `rating / 5` of the
row's width. That is what the number beside it says and what a reader compares
it against.

A profile with no rating and no review count shows **no stars at all**, and a
line saying there are no reviews yet. That is what Google shows, and it is also
the honest thing: five empty stars is what one star looks like at a glance, and
this page exists so that nothing about somebody's own listing surprises them.

### The status line is the only arithmetic on the page

`statusLine` in `src/profile.js` answers "is this place open at this moment",
which is the one part of a listing that changes without anybody touching it.
Three things about it are worth knowing:

- **The week is stored Sunday-first** because `Date.getDay()` counts that way,
  and anything else puts a modulo in every comparison. The form shows it
  Monday-first, which is what the Business Profile dashboard does; that
  reordering is one array in `main.js`.
- **A window may end before it starts.** `22:00`–`02:00` is a real entry and it
  means the place is open at one in the morning the *following* day, so the
  check looks at yesterday's window as well as today's. Every window is
  converted to minutes from the start of the day being asked about — a Friday
  night is `1320..1560` on Friday and `-120..120` on Saturday — which turns the
  whole thing into one number line with no special case at the call site.
- **`now` is passed in**, so a test can ask what a Tuesday teatime looks like
  without waiting for one.

There is no time zone field, because a listing does not have one either: Google
shows a visitor the status in the business's local time, and the closest this
page can get without asking anybody anything is the reader's own clock. The page
says so under the week rather than leaving it to be discovered.

### One renderer, and no words in it

What is on screen, what the SVG download holds and what the PNG download holds
are the same string of markup — the PNG is that SVG painted onto a canvas, in
`src/raster.js`. The same argument as the height chart next door: two renderers
eventually ship a picture that disagrees with the one somebody approved.

The markup has no external reference in it. No font file, no stylesheet, no
linked image — which is what lets the rasterisation happen with the network
unplugged, and what keeps the canvas untainted so `toBlob` gives the bytes back.
A cover photo reads like an exception and is not one: its `href` is a `data:`
URI this page's own canvas produced a moment earlier, and `normalise` in
`profile.js` refuses any `href` that is not one of the two shapes `photo.js`
produces. That check exists because a *saved profile* is a file that can be
emailed round an office, and it is exactly the route by which an `https://` href
would otherwise arrive inside a downloadable SVG.

**The markup has to satisfy two parsers, and only one of them forgives.** The
preview is parsed by the HTML parser, which forgives almost anything; the same
string handed to the browser as an image is parsed as XML, which forgives
nothing. So a mistake in an attribute is a preview that looks perfect and a
download button that refuses with nothing to say why. That is not hypothetical:
the font stack was written `Roboto, "Segoe UI", …` and went into a
`font-family="…"` attribute, the page drew it beautifully, and the PNG would not
render. `tests/js/business-profile-surfaces.test.js` now parses every surface in
every state with `shared/js/parse-xml.js`, which is the strict reading the
browser gives it.

**No sentence in the drawing is written in JavaScript.** "Google reviews",
"Directions", "Closes 9 PM", the day names — all of them are phrases in
`body.html`, looked up once in `main.js` and handed to `view.js`, which turns a
profile into a view object with every string already in the reader's language.
`surfaces.js` and `profile.js` never see a word. That is the site's standing
rule (see the top of `shared/js/phrases.js`) and it matters more here than
usual, because half the drawing *is* text.

### The icons in the picture are this file's own

`shared/icons/` is Lucide, kept byte for byte against upstream so the folder can
be diffed — those are the site's marks and they belong to the page *around* the
picture. The eight small paths inside the mock-up are drawn in `render.js` at
the weight the drawing needs, with no promise to match anything upstream,
because they are part of an imitation of somebody else's interface rather than
part of this site's own.

### The photograph is redrawn, not embedded

`src/photo.js` decodes the file, draws it onto a canvas bounded at 1200 on its
longest side, and encodes that as a JPEG data URI. Three things fall out of it:
the size is bounded (the card draws it at 428 across, and base64 costs a third
on top of whatever it is given), the metadata is gone because a canvas has none,
and the format is this page's whatever was opened — which is what makes the
`href` check above possible.

JPEG rather than PNG specifically because the thing being embedded is a
photograph and it is being embedded into a string that is rebuilt on every
keystroke. The same cover photo is about 300 KB of JPEG and four megabytes of
PNG.

### The mock-up keeps its own colours in dark mode

A knowledge panel is white at midnight too. The drawing carries Google's ink
values rather than the site's custom properties, and `styles.css` paints a light
chequerboard under it, so the preview does not follow the reader's theme. A
mock-up that changed colour with the page would be a mock-up of nothing.

## Files

| File | What it is |
|---|---|
| `src/profile.js` | what a profile is, how it is normalised, and whether the place is open right now |
| `src/view.js` | a profile plus the page's words, as the finished strings the drawing needs |
| `src/render.js` | the SVG parts: escaping, wrapping, stars, the eight marks, a picture in a hole |
| `src/surfaces.js` | the three cards, every coordinate written out |
| `src/parse-listing.js` | the recognisers a pasted listing is read with, and what it refuses |
| `src/saved.js` | the JSON this page writes, and the Business Profile export it also reads |
| `src/photo.js` | the bound a cover photo is redrawn to, and the only href the picture may carry |
| `src/raster.js` | the SVG blob and the canvas rasterisation |
| `src/main.js` | the form, the week rows, the surface switcher and the downloads |

## What it does not do

- **No lookup.** Argued above and on the page. It is the single most-asked-for
  thing here and the single thing that cannot be built without giving up what
  the site is for.
- **Nothing is remembered between visits.** No account, no cookie, nothing in
  this browser's storage. A profile worth keeping is one you download, which is
  said on the page rather than discovered.
- **No posts, no products, no Q&A, no review list.** Those are sections of a
  real profile and each is a different card; the three surfaces here are the
  ones a search actually shows a stranger.
- **One cover photo, not the mosaic.** A real knowledge panel opens with a
  collage of several pictures. Drawing that from one uploaded photo would mean
  showing the same picture three times cropped three ways, which is a lie about
  what the profile contains; asking for three would be two more file pickers
  for a difference nobody is deciding anything by. One photo, at the size the
  card gives it.
- **No claim to be a screenshot.** The type on the real thing is Google Sans,
  which is not on the reader's machine, and the layout moves with every release.
  The page says this in the FAQ and again under the preview, because a drawing
  this recognisable is easy to mistake for a screenshot of something that
  already exists.
- **No affiliation with Google.** Said outright in the first FAQ answer. The
  trademark is used to name what is being previewed and for nothing else.
