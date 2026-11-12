# Number Explorer

One whole number, pictured five ways: a stack of books, a pour of water, a sky of
stars, a pile of sand and the time it takes to count. The worlds are kept separate
because they answer different questions, and keeping them apart stops a token count
from silently acquiring a physical volume. Each says what one counted thing is.

`src/scale.js` is the arithmetic and nothing else. It parses counts exactly as
BigInt through 10^30, including grouped digits, named powers up to a nonillion,
decimal suffixes and scientific notation that resolve to whole counts. Approximate
physical calculations use Number only after the exact count has been validated.

A count is read against the page's language, because the same characters are a
different number in another one. "1.000" is a thousand in German and one in English,
and "1 Billion" is 10^12 in German where "1 billion" is 10^9 in English. The marks come
from `Intl`, which is where the page's own numbers get theirs, and the words come from
the `count.words` phrase, a list of `word=power of ten` that each language writes for
itself: a new language needs no change here, and only needs its list checked against
the numbers `Intl` prints for it, which the tests do. Words multiply, so "mil millones"
and 万亿 need no entries of their own. A word its language could mean two ways stays off
the list and is refused rather than guessed: 兆 in Chinese, where it is a million as
often as a trillion, and the "bilião" of European Portuguese on a Brazilian page. Han
numerals are read only ahead of the words, so 三亿 works and 三千五百万 is refused rather
than multiplied through into a wrong answer. A language switch carries the box as plain
digits, the one spelling every language reads alike, and leaves the dial behind so its
two significant digits cannot replace an exact count.

The page writes a big number as a word and never as a power of ten, in the box as well
as beside it, because somebody who needs a picture to feel a quintillion will not get it
from 10¹⁸. Scientific notation is still read when somebody types it, just not written.
`Intl` has words up to about a trillion, and the `count.names` phrase has the rest: the
one spelling of each that is fit to print, singular first where a language has two
forms, and every one of them on that language's `count.words` list so the box can read
back what it wrote. The names are not one list translated. German 10¹² is "Billion" and
English 10⁹ is "billion", Spanish names only every sixth power, so 10¹⁵ is "1000
billones", and Chinese composes 亿亿 and 万亿亿 from the words its readers know rather
than reach for 京 and 垓, which few of them could use.

The module also holds the landmark ladders, `placeOnLadder`, which finds what a value
has passed and what it is climbing toward, and `dialCount`, which lands the dial on two
significant digits, because one exact count per position would make most positions
unreadable. `tests/js/number-explorer.test.js` covers all of it; CI runs those checks.

## The worlds

**Books** stack at a chosen 3 cm each, flat, 15 cm wide. Everything is on one true
ruler: the camera keeps the top of the stack in view and everything else is drawn at
its real size for that zoom, so the Eiffel Tower, the Moon and the Milky Way shrink
past on their own. The one exception is the stack's width, drawn wider than real once
it would otherwise vanish, and the caption says so. A word or an AI text token is a
share of a book, at an editable 75,000 words per book and 0.75 words per token, which
is a writing equivalent and not a record of books read or generated. The two library
landmarks are counts of books, so their place on the ruler moves with thickness.

**Water and sand** pour into one named container after another. Water is a chosen
0.05 mL drop or a larger 0.25 mL tap drip. Sand is a spherical grain of 0.25, 0.5 or
1 mm with a 60% packing fraction, so volume is count times sphere volume divided by
packing fraction, and a billion default grains occupy about 109 liters. `containers.js`
holds each shape's inside as a polygon, and `levelForShare` finds the height that
leaves the right share of its area below: that is the page's whole claim about these
pictures, because height alone would overstate a tapering shape, and a pyramid a tenth
full is not filled a tenth of the way up. The containers are illustrations and are not
on one ruler. The mountain is an ideal cone 1 km tall with a 1 km radius, since height
alone would not define its volume. No exact global sand estimate is claimed.

**Stars** are one to a dot up to the roughly 9,100 bright enough to see without a
telescope. Past that a dot stands for a stated number of stars, in a shape you could
really find them in: Omega Centauri, the Milky Way, then Milky Ways, then the observable
universe. What is lit is the share the number reaches, from the middle outward, and
what is still dark stays on screen as a ghost, because how much of a galaxy is still
unlit is most of what a number that size has to say. Star counts are rough by nature,
so these are published round figures: ESA's 100 billion for the Milky Way and the middle
of its rough 10^22 to 10^24 for the universe.

**Time** is a true timeline at a chosen 1, 10 or 100 items per second, continuously,
with a 365.25-day year. The chip along the bottom keeps a real tally from the moment
the picture opened, because watching the first few seconds tick is what makes the far
end land.

## The stage

`stage.js` is one clock and one number. A scene is told where the number currently is,
in powers of ten, and draws that; it never knows whether the number is resting, being
dragged or halfway through a journey, so all five worlds move the same way. It eases
in log space, since a linear tween across thirty orders of magnitude would spend all
its time at the top.

Reduced motion is honoured from the operating system and from the Pause motion button:
the number jumps to its value, nothing ambient moves and the loop stops. The loop also
stops whenever the canvas is off screen, asking for one frame only when something has
changed so it is never blank when scrolled back to. The dot-heavy scenes draw once into
fixed layers and rescale those, and the lit layer is only added to as the number climbs,
so a drag across the whole range stays cheap at sixteen thousand dots.

Scenes get every word they draw from `main.js`, which reads them from `#phrases`. `say.js`
leaves units to `Intl`, so kilometers and years are already right in every language this
page is built in, and the phrases hold only what `Intl` has no word for.

A landmark's name is written once, in the form it has standing alone, and is dropped into
sentences it cannot be declined for. So where a language would need a case or a contracted
article in front of it, "von die Sterne" or "de el Sol", the sentence is written around a
colon or an "as" and the name stands in its own form. The same goes for a count, where
"mil millones de libros" and "100 libros" want different words after the blank.

A translated name can be far longer than the English one, and a phone's stage is under
300 pixels wide, so nothing here may assume a length. `wrapLines` breaks Chinese and Japanese
between characters and anything else at spaces and hyphens, a chip shrinks and then takes a
second line, and `write` and `chip` slide along to stay on the stage when given its width.

Nor may two labels share a place, at any count. On a stage that narrow there is no column they
can be kept apart by, so the stage settles it in order of what each one is for. The readout comes
first, then the chips, which is why `chipBox` says where a chip will go before anything is painted,
and on a narrow stage the height chip stands on the far side of the stack from the landmarks' names.
A landmark's name comes down clear of what is over it, as long as it stays beside its icon, and
otherwise goes without. A tick on the ruler goes without its number first of all. Nothing here is
kept apart by a position that happens to work in English.

The saved picture repaints the current scene off screen and writes the readback, result,
caption and model assumptions beneath it, so they travel together. All processing is
local, with no network calls, API keys, model downloads, input storage or input-bearing
URLs. The reference links in the assumptions panel are optional reading; the calculator
never requests them.
