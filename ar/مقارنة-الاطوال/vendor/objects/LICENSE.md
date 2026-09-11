# The drawings behind the objects

Every preset under *Or add something for scale* — a door, a fridge, a sofa —
is drawn rather than blocked out as a rectangle, and none of those drawings
were made here. Each file below is the artist's file as it was published, so
anybody can diff this folder against the original and get nothing back.

| File | Used for | Drawn by | Where | Licence |
|---|---|---|---|---|
| `door.svg` | Interior door, Front door | Phosphor Icons | [source](https://github.com/phosphor-icons/core/blob/main/assets/fill/door-fill.svg) | [MIT](LICENSE-phosphor-MIT.txt) |
| `window.svg` | Window | Quincy Morgan, after Temaki | [source](https://commons.wikimedia.org/wiki/File:Window_Pinhead_icon.svg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `garage-door.svg` | Garage door | Material Symbols, Google | [source](https://github.com/google/material-design-icons/tree/master/symbols/web/garage_door) | [Apache-2.0](LICENSE-material-symbols-Apache-2.0.txt) |
| `chalkboard.svg` | Whiteboard or blackboard | Phosphor Icons | [source](https://github.com/phosphor-icons/core/blob/main/assets/fill/chalkboard-simple-fill.svg) | [MIT](LICENSE-phosphor-MIT.txt) |
| `desk.svg` | Office desk | Phosphor Icons | [source](https://github.com/phosphor-icons/core/blob/main/assets/fill/desk-fill.svg) | [MIT](LICENSE-phosphor-MIT.txt) |
| `lockers.svg` | Filing cabinet | Phosphor Icons | [source](https://github.com/phosphor-icons/core/blob/main/assets/fill/lockers-fill.svg) | [MIT](LICENSE-phosphor-MIT.txt) |
| `projector-screen.svg` | Projector screen | Phosphor Icons | [source](https://github.com/phosphor-icons/core/blob/main/assets/fill/projector-screen-fill.svg) | [MIT](LICENSE-phosphor-MIT.txt) |
| `vending-machine.svg` | Vending machine | Quincy Morgan | [source](https://commons.wikimedia.org/wiki/File:Vending_machine_Pinhead_icon.svg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `wheelie-bin.svg` | Wheelie bin | Quincy Morgan, after OpenGemeenten | [source](https://commons.wikimedia.org/wiki/File:Wheelie_bin_Pinhead_icon.svg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `fridge.svg` | Fridge-freezer | Material Symbols, Google | [source](https://github.com/google/material-design-icons/tree/master/symbols/web/kitchen) | [Apache-2.0](LICENSE-material-symbols-Apache-2.0.txt) |
| `table.svg` | Dining table | Phosphor Icons | [source](https://github.com/phosphor-icons/core/blob/main/assets/fill/table-fill.svg) | [MIT](LICENSE-phosphor-MIT.txt) |
| `chair.svg` | Dining chair | Phosphor Icons | [source](https://github.com/phosphor-icons/core/blob/main/assets/fill/chair-fill.svg) | [MIT](LICENSE-phosphor-MIT.txt) |
| `couch.svg` | Sofa | Phosphor Icons | [source](https://github.com/phosphor-icons/core/blob/main/assets/fill/couch-fill.svg) | [MIT](LICENSE-phosphor-MIT.txt) |
| `piano.svg` | Upright piano | Material Symbols, Google | [source](https://github.com/google/material-design-icons/tree/master/symbols/web/piano) | [Apache-2.0](LICENSE-material-symbols-Apache-2.0.txt) |
| `guitar.svg` | Acoustic guitar | papapishu | [source](https://commons.wikimedia.org/wiki/File:Guitar_5.svg) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) |
| `wine-bottle.svg` | Wine bottle | US Centers for Disease Control and Prevention | [source](https://commons.wikimedia.org/wiki/File:Wine_bottle_icon.svg) | Public domain |

## What each licence asks for, and why these ones were allowed

The four *people* in the folder above are public domain, and
[`../LICENSE.md`](../LICENSE.md) argues at length why they had to be. The short
version is that a chart is downloaded and passed on, so a licence that attaches
a condition to the picture attaches it to the visitor.

That argument rules out CC BY, which asks for attribution on any reproduction
of the work — the visitor's own chart included. It does not rule out MIT or
Apache-2.0. Both ask that their notice travel with **the icon set**, which is
what the two files beside this one are, and neither says anything about a
drawing somebody makes using it. So the notices live here, in the repository,
and nothing rides along into a downloaded PNG.

Nothing in this folder is CC BY, CC BY-SA, or any other licence with a
share-alike or attribution condition. That is a rule, not a coincidence: it is
what keeps the page's promise about the chart you download true.

## What the tool actually ships

Not these files. A chart is one self-contained SVG, so the shapes have to be
inside it, and [`../../src/objects.js`](../../src/objects.js) carries them —
along with each file's digest and the bounding box the drawing was measured at.

The path data there was not copied by hand. Every file here was read by the
tool's own [`../../src/import-svg.js`](../../src/import-svg.js), the same
whitelist an uploaded SVG goes through, which rebuilds a drawing out of nothing
but shapes and geometry. So none of these files' own fills, classes,
identifiers or metadata reached the chart, and the artwork this tool ships went
through exactly the door a stranger's file does.

## The objects with no drawing

Three presets are still plain rectangles: the basketball hoop, the shipping
container and the kitchen counter. Nothing free and correctly proportioned
turned up for any of them, and a wrong drawing is worse than an honest
rectangle on a chart whose whole job is scale.
