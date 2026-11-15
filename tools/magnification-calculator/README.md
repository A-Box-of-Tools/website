# Magnification Calculator

The numbers printed on a telescope, a pair of binoculars, a microscope or a magnifying
glass, turned into the view they give. A magnification is a ratio, and a ratio says
nothing about what limits it, so the page never shows that number alone: beside it are
the width of the lens that sets the detail, the width of the beam that sets the
brightness, and three pictures drawn to one scale.

## One blur, four instruments

`src/optics.js` is the arithmetic and nothing else. Four functions take an
instrument's printed numbers and return the same kinds of answer, and one idea joins
them. A lens blurs a point into a disc, and what the eye is shown is that disc
magnified. By Rayleigh's criterion in green light the disc is about 2.3 arcminutes wide
through an exit pupil of 1 mm, in a telescope and in a microscope alike, and it grows
as the exit pupil shrinks. A keen eye separates one arcminute. So three exit pupils
mark the regimes:

| exit pupil | what it means | telescope | microscope |
|---|---|---|---|
| above 2.3 mm | the eye limits detail, and more power would show more | below D ÷ 2.3 | below 217 × NA |
| 2.3 to 1 mm | everything the lens resolves is large enough for a keen eye | to D | to 500 × NA |
| 1 to 0.5 mm | the same detail, larger and softer | to 2 × D | to 1000 × NA |
| under 0.5 mm | only the blur grows | past 2 × D | past 1000 × NA |

The last three columns are the published rules of thumb, twice the aperture in
millimetres for a telescope and 500 to 1000 times the numerical aperture for a
microscope, which is the check on the idea rather than a second set of rules. It is
also why the verdict and the picture cannot disagree: both are read off the same
magnified blur. An earlier draft paired Dawes' double-star figure with a one-arcminute
eye, and the picture stopped gaining detail at half the magnification the verdict
called useful.

Binoculars and magnifiers are not judged on that scale, because it is not what limits
them. Binoculars are limited by the light their exit pupil passes and by the hand that
holds them, and a single lens by how close it has to be held and how little it shows at
once. Their dials are coloured from those instead.

Four more rules are there because leaving them out would mislead somebody. A beam wider
than the eye's pupil is a smaller telescope, so light gathered is counted from the
aperture actually in use. An eyepiece cannot show a wider circle than its barrel passes,
so a 40 mm eyepiece in a 1.25 inch barrel is capped at 27 mm of field stop. Above about
300× the air is the limit, and the verdict says so. A microscope eyepiece with no
field number engraved is given 180 mm over its magnification and never more than
20 mm, since the tube it slides into is 23 mm across. And a magnifier's power is
counted both ways that boxes count it, 250 mm over the focal length and one more than
that. Left alone, the page takes the way that goes with the label: one more for a lens
marked in diopters, because that is how lamp and reading magnifiers are sold, and a
+3 diopter lens counted the other way is a lens that shrinks.

## What there is to look at

`src/subjects.js` holds every subject in its own unit: the sky in arcseconds, a bird in
metres at a stated range, a specimen in millimetres at the reading distance of 250 mm.
One number turns each into arcminutes for the bare eye, and a magnification multiplies
that. The figures for the Moon, Jupiter and Saturn are NASA's fact sheets', the seas
are the IAU's list, and the Pleiades are eleven stars from the catalogue laid on the
plane that touches the sky at their middle, so the distance between two on the picture
is their distance in the sky.

A picture is dimmed by the square of the exit pupil over the eye's pupil, but only once
that has spent the light the subject has to spare. The full Moon is taken as 2,500
candelas per square metre and a view as dull below 2, so the Moon at a fiftieth of its
naked-eye brightness is still drawn full, which is how it looks. The planets follow from
their albedo and distance from the Sun, which puts Saturn at a twentieth of the Moon's
surface brightness and makes it the first to dull. Stars are points and are not dimmed;
those fainter than the light gathered can show are left out.

Each subject records the smallest thing drawn of it, and a test holds that below what
the best instrument on the page resolves. Without it a drawing could run out of detail
while the verdict still said there was more to see.

## Three pictures, one scale

`src/view.js` draws one picture: a subject, at so many pixels to the arcminute, softened
by a blur and dimmed by a brightness. The page calls it three times.

- **The whole view** is the circle the eyepiece shows, in a frame 72 degrees across, so
  an ordinary eyepiece nearly fills it and a wider one is a wider circle rather than a
  smaller Moon. A subject's share of the circle is its share of the view.
- **The close look** is the middle of that at two arcminutes to a pixel, about what a
  good eye separates on a screen held where it is read. It exists because the blur that
  makes magnification empty is a tenth of a percent of the field at the limit, far
  under a pixel of the whole view. Without it the page could only assert the softness.
- **The eye alone** is the close look at one times. The difference between the last two
  pictures is the magnification, which is what the word means.

The first plan had the eye alone as a second circle holding a patch M times wider, and
a microscope's pictures worked out from its field of view. Both were wrong in the same
way: they were scaled to the picture rather than to the angle, so a 25× eyepiece on a
40× objective drew the same view as a 10× one while the verdict changed from useful to
empty beside it.

The blur is made by drawing the scene small and scaling it back up in steps of two,
because Safari's canvas has no `filter`. Nothing below a third of the blur is drawn,
and nothing is removed for being merely soft: Cassini's division is narrower than a
small telescope's limit and still shows in one as a faint line, and it does here.

The scenes are `src/scene-sky.js`, `scene-land.js`, `scene-slide.js` and
`scene-near.js`. Each is handed a scale and draws what there is at that scale, so the
Moon is a point of light under one pixel and craters half a kilometre wide when it
fills the picture many times over. Detail that goes on past the edge of the picture,
craters and cells and feather barbs, is laid on grids and only the cells in view are
visited; `src/kit.js` holds that walk and the scatter that puts the same crater in the
same place at every magnification. The smallest craters are gathered and filled as one
shape, which is what keeps a dial dragged across the Moon at a few milliseconds a
frame. No picture carries a label. Words on a canvas cannot be translated or wrapped
the way markup can, and the one place letters are drawn they are the subject: the
printed page under the magnifier, whose lines come from the markup so each language's
page is printed in that language.

## The page

Everything a visitor typed is in a form control, and every choice between a few things
is a radio button, including the instrument and the subject. That is what lets the
frame's language switch carry the whole state across, and it sets three rules that
`src/main.js` keeps. One function reads every control fresh and nothing is taken from
the event that prompted it, because a switch fires one event per control it puts back.
A group of radio buttons may have nothing chosen for a moment, so the last choice is
remembered. And no control's handler writes to another control, with one exception made
under somebody's hand: the dial moves in magnification and rewrites the eyepiece, or the
printed power. The dial itself is never carried; it only follows the boxes.

A quantity that can be printed three ways, a binocular's field of view or a magnifier's
strength, is one box and a menu saying what the number is. The menu reinterprets the
number and never converts it, since a conversion would run again on every restore.
Boxes that may be left empty take a typical value and show it as their placeholder.

Help text belongs to its own control and carries `data-for`, because the build folds
every note in a card behind the card's heading and four instruments' notes would
otherwise arrive there together.

Nothing is written to storage or to the address bar, and there is no network feature.
The reference links in the assumptions are optional reading that the calculator never
requests.
