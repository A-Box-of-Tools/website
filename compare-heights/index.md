# Height Comparison — a side-by-side chart you can download

Type the heights, take the picture. Nothing is sent to draw it.

> Compare heights side by side. Add a man, a woman, a boy, a girl and objects — a door, a window, a whiteboard, a vending machine — in centimetres or feet and inches, and download the chart as a PNG or an SVG. It is drawn in your browser.

This page is an interactive tool that runs entirely in your browser, at https://abox.tools/compare-heights/ — nothing you give it is uploaded. What follows is everything the page says about the tool in words; to use it, open the address.

## Your names, heights and the chart they make are **never uploaded**. There is no server.

A height chart is arithmetic and a drawing: there is no file to send and no service to ask — and the one file this page will take, a picture of your own to put on the ruler, is read here and goes nowhere. The man, the woman, the boy and the girl are public-domain artwork that ships with this page, and the boy and the girl are drawings of actual children rather than adults made small — which is what stops a family chart looking wrong in a way nobody can name. Every step of it happens in a few hundred lines of JavaScript in this page that you can read. There is no network feature of any kind, which matters here because what you type is a list of people and how tall each of them is.

- ✗ No upload
- ✗ No account
- ✗ No watermark
- ✓ Works offline
- ✓ Open source

## How to make a height comparison chart

1. **Add everybody first, then worry about how it looks.** A row is a figure, a name, a height and a colour. The name is optional — a chart of two unnamed silhouettes with their heights over them is often exactly what somebody wants — and the arrows on each row move it left or right if the order matters.
2. **Type the height however you write it.** `173`, `1.73 m`, `5'8"`, `68 in` and `5 ft 8` are all read correctly. The line under the box shows what was understood, in both systems, so a misread is visible before it is drawn rather than after it is printed. A bare number is centimetres on a metric chart and inches on an imperial one, and a bare number under three is metres — nobody is 1.73 cm tall.
3. **Pick the figure that matches the person.** A child is about six head-heights tall and an adult seven and a half, so a child drawn as a shrunken adult looks wrong in a way that is hard to name and easy to see. The boy and the girl are drawings of actual children rather than adults made small, which is most of what makes a family chart look like a family. Every row also arrives with a height already in it, so adding somebody draws somebody — type straight over it.
4. **Put something familiar on the chart.** A number is abstract and a doorway is not. Adding one object of a size everybody knows — a door, a window, a classroom whiteboard, a vending machine — is what turns a chart that states two heights into one that shows them. The menu holds twenty of them, grouped, and every one becomes an ordinary row you can type your own numbers over. Objects take a width as well as a height, so a door is 203 by 81 rather than a stripe.
5. **Or put your own drawing on it.** **Add your own picture** takes a file from your machine and puts it on the ruler at whatever height you give it — the thing to reach for when the chart is about a product, a vehicle or a building rather than a person. An SVG is drawn in the row's own colour like every other figure; a photograph or a PNG goes on as itself. Either keeps its own proportions, and either is read here rather than sent anywhere.
6. **Set the ruler to the units your reader thinks in.** Switching between centimetres and feet rewrites what is in the boxes rather than reinterpreting it, so the chart itself does not move — only the notation does. If the chart is for two audiences, the height written above each figure is in the chart's unit and the line under each box has both.
7. **Take the PNG for pasting, the SVG for printing.** The PNG is a picture at the pixel height you set, which is what a chat window, a document or a slide wants. The SVG is the chart as instructions, so it prints sharp at any size and can still be recoloured afterwards by anything that opens vectors.

## The longer version

[How to make a height comparison chart](https://abox.tools/guides/make-a-height-comparison-chart/): Turn a list of heights into a side-by-side picture: how to write the heights, which figure to pick for a child, why one familiar object does more than a third person, and how to get the chart out as a PNG or an SVG.

## Also in the box

- [Business Profile Preview](https://abox.tools/business-profile-preview/): Type it, and it becomes the card Google would draw. Nothing is sent to draw it.
- [Image Compressor](https://abox.tools/compress-image/): Name the size. It works out the rest.
- [Image Resizer](https://abox.tools/resize-image/): Say the size. Draw the box. Pick the format.
- [HEIC to JPG](https://abox.tools/heic-to-jpg/): The photos an iPhone makes, in a format everything opens.

## Questions

### Is anything I type sent anywhere?

No. The chart is drawn by JavaScript in this page, on your own machine, and this tool has no network feature of any kind — it never fetches anything and never sends anything. The page's `Content-Security-Policy` names every address it may contact, none of which belongs to this site. That is worth saying plainly here because the input is a list of people's names and how tall each of them is, which is more personal than most of what this site handles.

### Can I download the chart?

Yes, as a PNG or as an SVG, with no watermark and no account. The PNG is drawn at whatever pixel height you set and is the one to paste into a document, a slide or a chat. The SVG is the chart as instructions rather than pixels: it prints sharp at any size and can be opened and recoloured later in any vector editor. Both are made from the same markup that is on screen, so neither can disagree with the preview.

### How do I write the height — centimetres or feet?

Either, in any row, whichever way you normally write it. `173`, `173 cm`, `1.73 m`, `5'8"`, `5 ft 8 in` and `68 in` are all understood, and the line under the box shows what was read in both systems. A bare number is centimetres when the chart is metric and inches when it is imperial; a bare number under three is taken as metres, because 1.73 cm is not a height anybody types.

### Why do the children not look like small adults?

Because a child is not one. Body proportions change with age: a two-year-old is roughly four and a half head-heights tall, an eight-year-old six, an adult seven and a half — so the head is nearly a quarter of a small child and an eighth of a grown-up. The boy and the girl here are drawings of actual children rather than one silhouette scaled down, which is why a family chart looks like a family instead of like four adults at different sizes.

### Where do the figures come from?

All four are artwork by other people, all of it in the public domain: the man by pitr, the woman by Madeleine Price Ball, the girl by OpenClipart-Vectors, and the boy by Ryan Kissinger for the NIH BioArt library. Every file ships with this page in `vendor/` as it was published, so you can check them against the originals. Public domain asks for nothing, which is the point: the artwork ends up inside a picture you download, and a licence needing attribution would attach that requirement to your chart.

### Can I put my own picture on the chart?

Yes — **Add your own picture** takes a drawing or a photograph and puts it on the ruler at whatever height you type: a logo, a floor plan, a piece of machinery, a car, or a photo of the thing itself. Its proportions are its own, so there is no width to fill in. \
\
An **SVG** is drawn as one solid colour, the one that row is set to, because that is what the rest of the chart is — so a drawing made of thin outlines rather than filled shapes comes out as a blob, and this is the wrong tool for it. Only the *shapes* are kept: the file is rebuilt from scratch out of paths and rectangles and circles, and anything that could reach the network — a linked image, a stylesheet, a font, a script — is left behind. \
\
A **photo or a PNG** goes on as itself and keeps its own colours, so the row's colour only names it. It is redrawn here before it goes on, which bounds how much it adds to the chart and leaves the file's metadata behind. Transparency is kept, so a cut-out stands on the ruler cleanly — and a photo brings its background with it, which is worth cropping off first. \
\
Neither file goes anywhere. That matters twice over, because the chart you download is a file you might send to somebody else.

### Why is there no toddler or baby?

Because nobody has drawn one and put it in the public domain. Wikimedia Commons has exactly one usable free child — the girl — and the NIH BioArt library the boy; below school age the search comes back empty, and every coherent free set of people is a restroom pictogram the same shape at every age, which is the mistake this whole tool is built to avoid. There was a toddler built by this page's own code for a while, and it was the only figure on the chart nobody had drawn: it looked it, standing next to four that somebody had. For anybody smaller than the boy or the girl, set one of them to the real height — the ruler is what carries the comparison, and it will be right.

### How many people can I put on one chart?

Twelve. That is not a technical limit — the drawing would happily do thirty — but past a dozen the columns get narrower than the names written over them and the picture stops being readable. If you need more, turning the names off gives you back the width, or two charts will say it better than one.

### Can I put an object on the chart?

Yes — and most of them arrive drawn. The menu holds twenty to start from, in four groups: doors and windows, school and office (a whiteboard, a desk, a filing cabinet, a projector screen), things around town (a vending machine, a wheelie bin, a basketball hoop, a 20 ft shipping container) and things around the house. Seventeen of them come with a picture — a door with a handle, a fridge with its freezer above it, a sofa you can see is a sofa — and the picture is fitted to the height and width in the row, so the numbers still decide the size and your own numbers typed over them still hold. The other three are plain rectangles, because no free drawing of them turned out to be both right and correctly proportioned, and a wrong drawing is worse than an honest block on a chart about scale. \
\
Some of these sizes are genuine standards and some are typical, which the page says out loud. One familiar object does more for a chart than any number of extra people: it is what turns a comparison into a sense of scale.

### Is there a figure for a dog or a cat?

No, and it is a deliberate gap rather than an oversight. Both were built — in profile, standing with the head level with the shoulder, so that the top of the drawing would be the height written beside it, which is where every breed standard measures an animal. They did not come out well enough to ship: a quadruped seen from the side standing next to four people seen from the front reads as a mistake even when the drawing is good. A rectangle at the animal's shoulder height is honest in the meantime.

### Can I share the chart with a link?

Not from here, and that is deliberate. Tools that offer it do it by putting the whole list into the address, which means every name and every height ends up in whatever the link travels through — a chat server's logs, a mail scanner, somebody's browser history, a link preview fetcher. Download the picture and send that instead: it says the same thing and carries no list with it.

### Is it free, and can I use the chart commercially?

It is free, there is no account and no watermark, and you can put the result in a report, a presentation, a listing or a product. The site carries advertising, which is what pays for it. Nothing about a chart you make here is owned by us, and nothing is kept.

### Why is the ruler in tens and not in ones?

Because the spacing is chosen from how many lines the picture can carry rather than from a fixed number. A chart of two adults gets a line every ten centimetres; put a basketball hoop on it and the lines move to twenty-five, because ninety lines on one picture is a grey wash rather than a ruler. In feet and inches the ladder is one, three, six and twelve inches, so the lines land on whole inches instead of near them.

### Can I put the chart on a dark slide?

Yes. Set the background to the colour it will sit on and the ruler and the writing switch between dark and light to suit it — worked out from the colour's luminance rather than from a guess. Then tick "no background at all" if you want the picture itself transparent: the colour you chose still decides the ink, so a transparent chart headed for a navy slide comes out legible on it.

### Does it work offline?

Yes. Load the page once, then disconnect from the internet and it keeps working. That is also the simplest way to prove nothing is being uploaded: a tool that sent your list away to have a chart drawn would stop the moment you unplugged.

## How the privacy claim is verifiable

- **A list of people is not a small thing to hand over.** Most height charts want an account, and the ones that do not still have a server that sees every name and number you type. What you are typing here is who is in your family and how tall each of them is, often with a child's age implied by the figure beside the name. None of it is sent anywhere, because there is nowhere here for it to go.
- **Nothing here fetches anything.** There is no `fetch`, no `XMLHttpRequest` and no `sendBeacon` anywhere in `src/`. The Content-Security-Policy names every address this page may contact, and not one of them belongs to this site.
- **Nothing is remembered between visits, either.** The chart lives in the page and nowhere else. Close the tab and the list is gone: there is no account holding it, no cookie carrying it, and nothing written into this browser's storage — which is also why a chart you want to keep is a chart you download.
- **The link does not carry the chart.** Several tools like this one put the whole list into the address bar so it can be shared, which turns every name and height into something logged by whatever the link passes through — a chat server, a mail scanner, somebody's browser history. The address of this page never changes as you type.
- **The PNG is made from the SVG that is on screen.** The download is not a second rendering that might disagree with the preview. The same markup is handed to the browser and painted onto a canvas, which is also why it can be done with the network unplugged: there is no font to fetch and no image to load inside it.
- **A picture you add is read here, and never sent.** The file never leaves this page — it is read with the browser's own `FileReader` and parsed into an inert document that runs nothing. What is drawn is not that file: `src/import-svg.js` builds a NEW drawing out of a whitelist of shapes and geometry, so a script, a stylesheet, a font, a linked image or a reference to another document is left behind rather than carried through. That matters twice over, because the chart you download is a file you send to other people: anything that survived would be their browser calling a stranger's server, days later, from something this page wrote. A photograph or a PNG is not a program and has nothing to rebuild: the browser's own decoder reads it, and it is redrawn onto a canvas here before it goes on the chart. That redrawing is what leaves the file's metadata behind — the camera, the place, the profile, whatever was in it — because none of that survives a canvas. What ends up in the chart is a picture this page encoded, written in as data rather than as an address, so the chart still points at nothing.
- **The artwork is here, not fetched.** All four figures are public-domain artwork, and they are served from this origin with the rest of the page — no icon font, no CDN, no sprite sheet pulled off somebody else's server as you type. It is also why the chart still draws with the network unplugged.
- **What Google loads, and what it is not given.** The ad and measurement scripts come from Google, and the donate button from Buy Me a Coffee. None of them is handed a name or a height. Every line that turns your list into a picture is served from this origin and listed in the repository.
- **It works offline.** Disconnect from the network and the tool is unchanged, because there was never a network step in it. That is the simplest proof of all.

**Check it yourself.** None of the above has to be taken on trust. This page is generated from the templates and config in the repository by a build script you can read and run yourself, and the result is committed to the `dist` branch — so you can diff what is served against what a build of the sources produces: https://github.com/A-Box-of-Tools/website

The files worth reading first are `config/site.toml` for the Content-Security-Policy, `src/traced.js` and `vendor/` for the four figures and where their artwork came from, `src/figures.js` for the list the menu is built out of, `src/units.js` for how a typed height becomes a number and how the ruler is labelled, `src/chart.js` for the layout, `src/save.js` for the two downloads — which are the SVG on screen, and that same SVG painted onto a canvas — and `src/import-svg.js` for the whitelist an uploaded SVG is rebuilt from, which is the one file here where being wrong would matter.
