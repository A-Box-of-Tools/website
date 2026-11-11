# Number Explorer

Type any number and watch it grow: a stack of books, a pour of water, a sky of stars, a pile of sand, a very long count.

> See how big a number really is. Watch it grow as a stack of books, a pour of water, a sky of stars, a pile of sand and the time it takes to count, beside landmarks from Mount Everest to the Milky Way. Free and offline.

This is an interactive browser tool at https://abox.tools/number-explorer/. Files are processed on the device running that browser. Any deliberate sharing or optional network feature is described on the page. What follows is its written explanation; open the address to use it.

## Your numbers and comparisons are **processed in your browser**. No processing upload.

A comparison is a count, a chosen reference and some arithmetic, all in this page. There is no AI service to ask and no input to upload. Books, water, stars, sand and counting time are kept separate, and their assumptions are written beside the result rather than hidden behind the picture.

- ✓ Works offline
- ✗ No AI or API cost
- ✓ Clear assumptions
- ✓ Save the picture
- ✓ Open source

## How to picture a large number

1. **Type a number or drag the dial.** Try a billion, 1.5b or 3 trillion. Whole numbers from zero to 1 nonillion are accepted. The dial moves through powers of ten, and the picture follows as you drag.
2. **Choose books, water, stars, sand or time.** Each pictures the same number in a different way and says what one of them is. In books, each one can also be a word or an AI text token, which turns the count into a length of writing.
3. **Watch it grow, and compare.** The camera pulls back as the number climbs. Press × 10 or Grow from 1 to see it again, and read the landmarks beside your number to see how many times bigger each one is. Guess whether ten times more will reach the next one.
4. **Check the assumptions, then keep the picture.** Change the book thickness, drop size, grain diameter or counting rate, and read where each landmark's figure comes from. Save the picture as a PNG with its assumptions written beneath it.

## The longer version

[How to make a big number feel familiar](https://abox.tools/guides/understand-big-numbers/): Make a huge number understandable with books, water, stars, sand and counting time. Choose familiar landmarks, keep the assumptions in view and watch the number grow.

## Also in the box

- [JSON Formatter](https://abox.tools/json-formatter/): JSON, XML, HTML, CSS and YAML, formatted or converted. Nothing is pasted into anyone else's server.
- [YAML to JSON Converter](https://abox.tools/yaml-to-json/): Both directions, and it says what each one costs. Nothing is pasted into anyone else's server.
- [XML Formatter](https://abox.tools/xml-formatter/): XML laid out to read or squeezed to ship, and converted to JSON both ways. Nothing is pasted into anyone else's server.
- [Text Diff](https://abox.tools/text-diff/): Two texts in, every difference marked, line by line and word by word. Nothing is pasted into anyone else's server.

## Questions

### Does this need an AI model?

No. The browser places your number among a small catalogue of landmarks and calculates the results itself. There is no API key, model download or ongoing AI charge.

### How tall is a stack of a billion books?

With books 3 cm thick, about 30,000 km: more than twice the width of the Earth, and about 8% of the way to the Moon. It would take about 13 billion books to reach the Moon. You can change the thickness in the assumptions.

### How much water is a billion drops?

With drops of 0.05 mL, the size a dropper gives, 50,000 liters: about 250 bathtubs of 200 liters, or 2% of an Olympic pool. A dripping tap's larger drop of about 0.25 mL makes it five times as much.

### How many stars is a billion?

About 1% of the Milky Way, taking ESA's round figure of 100 billion stars, and the true number may be several times that. It is also about 110,000 times the 9,100 or so stars bright enough to see without a telescope across the whole sky.

### How much sand is a billion grains?

With the chosen model of spherical grains 0.5 mm across and a container holding 60% grains and 40% air, about 109 liters: roughly eleven 10-liter buckets. Real grains vary, so this is an estimate under those assumptions.

### How many books is a million tokens?

For English text, the rough estimate of 0.75 words per token gives about 750,000 words. With the default example of 75,000 words per book, that is ten books, a stack about 30 cm high. Language, tokenization and book length change the answer. It is a writing equivalent, not evidence of books actually read or generated.

### What mountain is used?

A deliberately defined example: a cone 1,000 meters tall with a base radius of 1,000 meters. Its volume is one third of pi times radius squared times height. A real mountain needs its own geometry; height alone cannot tell you its volume.

### Can it compare with all the sand on Earth?

This version does not invent an exact global grain count. Such an estimate first needs a scope, such as beaches or deserts, and assumptions about area, depth and grain size. Use the defined containers and landmarks for comparisons whose assumptions can be inspected.

### Are the pictures drawn to physical scale?

The book stack and its landmarks share one true ruler, except that the stack is drawn wider than real once it would otherwise vanish, and the timeline is true in the same way. Water and sand are not on one ruler: the containers are illustrations, and the colored area is the true share of the named container. Stars are one to a dot until there are too many to draw, and after that the caption says how many each dot stands for.

### Can I turn the animation off?

Yes. Pause motion stops everything moving and leaves the finished picture on screen. If your device is set to reduce motion, the page shows the finished picture from the start.

### Does the tool work offline?

Yes. After the page is loaded, all calculations, comparisons, drawings and saved pictures work without a connection. No input is uploaded for processing.

## How the privacy claim is verifiable

- **The calculator runs in this browser.** The tool's processing code calculates results and draws pictures locally. It sends no input or result to a service. Content-Security-Policy restricts connection destinations but does not inspect payloads; compare the source with the Network tab, or use the calculator while disconnected.
- **There is no model or live lookup.** Landmarks and formulas ship with this page. Comparisons are selected by arithmetic over that catalogue. Source links open only when you choose to read them.
- **Your entries stay in the page.** The calculator writes no inputs to storage or to the address bar. Reloading resets the exploration. A saved picture is a file you deliberately keep on your device.
- **The site's other scripts have their own boundaries.** The frame may load advertising and measurement scripts. The calculator does not send them your inputs or results. The live network panel reports the page's connections.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/scale.js` for the count parser, the models and the landmark ladders, `src/containers.js` for what a colored area measures, `src/stage.js` and the `src/scene-*.js` files for the pictures, and `src/main.js` for how the page is wired together.
