# Number Explorer

A whole count becomes familiar through three separate questions: the volume
of that many sand grains, the English writing equivalent of text tokens, or
the time taken to count every item. Keeping those meanings separate prevents
a token count from silently acquiring a physical volume.

`src/scale.js` parses counts exactly as BigInt through 10^30, including grouped
digits, decimal suffixes and scientific notation that resolve to whole counts.
Approximate physical calculations use Number only after the exact count has
been validated. `tests/js/number-explorer.test.js` covers the input boundary,
geometry, reference conversions and inverse estimates; CI runs those checks.

The sand model uses spherical grains, a selected diameter of 0.25, 0.5 or 1 mm,
and a chosen 60% solid packing fraction. Volume is count times sphere volume
divided by packing fraction. The equivalent cube edge is the cube root of
bulk volume. A billion default grains occupy about 109 liters. Container
capacities are chosen examples rather than universal sizes. The mountain is
an ideal cone 1 km tall with a 1 km radius; height alone would not define its
volume. No exact global sand estimate is claimed.

English writing uses 0.75 words per token and an editable reference book length
of 75,000 words by default. It is an estimate of writing length, not a record
of books read or generated. Counting assumes a selected continuous rate of
1, 10 or 100 items per second and a 365.25-day year. The page and guide link
the OpenAI token explanation and the USGS grain-size classification; the
calculator never requests them.

`src/main.js` chooses the volume reference whose ratio is nearest ten, offers
follow-up questions, and maintains explicit wording for imagined mappings.
The reverse mountain question writes an approximate whole grain count back
into the input. `src/scene.js` draws original SVG pictograms in bounded groups
of at most 24. A group label explains the count represented by each drawing;
a marked final picture shows a fraction without implying that picture area
or height is a physical volume scale. All visitor-facing words live in markup.

The SVG download keeps the visible result, model assumptions and reference
capacity together. All processing is local, with no network calls, API keys,
model downloads, input storage or input-bearing URLs.
