# Third-party notices

This site has no dependencies and no build step for its JavaScript. What is in
`shared/` and each tool's `src/` is byte for byte what the browser runs, and
almost all of it is written here.

The exception is one icon, listed below. Its licence requires that the notice
travel with the copy, which is what this file is for.

---

## Lucide — the music glyph in the site mark

The music tile in the site mark uses the geometry of Lucide's `music` icon.
It appears in four files, because the mark is drawn four times: in
[`shared/logo.svg`](shared/logo.svg), which is also the favicon and so bakes in
its own colours; in
[`templates/partials/site-mark.html`](templates/partials/site-mark.html), which
is inlined into every page so the mark survives with no network at all; and in
[`shared/logo-ink.svg`](shared/logo-ink.svg) and
[`shared/logo-ink-graphite.svg`](shared/logo-ink-graphite.svg), the
single-colour versions. The last two are generated from the first by
[`scripts/emit_ink.py`](scripts/emit_ink.py) and are not edited by hand.

The path data is Lucide's, unchanged:

```
M9 18V5l12-2v13          the stem and the beam
circle cx=6  cy=18 r=3   the two note heads
circle cx=18 cy=16 r=3
```

Two things about it are not Lucide's, and both are deliberate. The stroke
weight is raised, because Lucide draws at `stroke-width: 2` on a 24 grid and
the mark renders that tile at about ten units of a 64 grid — a faithful 2 lands
at a fifth of a pixel in the 22px header and at nothing at all in the 16px
favicon. And the note heads are filled rather than stroked, so the glyph
carries the same weight as the filled play triangle beside it.

Lucide is ISC licensed. `music` is one of the icons Lucide derives from
Feather, so it is additionally under Feather's MIT licence. Both notices
follow.

### ISC License — Lucide

```
Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

### MIT License — Feather

```
Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

The other three glyphs in the mark — the play triangle, the picture, and the
document rules — are drawn here and are covered by this repository's own
[LICENSE](LICENSE), as is everything else in it.
