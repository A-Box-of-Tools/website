"""
Everything a step explains, folded behind that step's heading.

WHAT MOVES

Three kinds of prose, all of them explanation rather than state:

  * `<p class="card-lede">` - the paragraph a card opens with, saying what the
    step is for;
  * `<span class="check-note">` - the small print under a checkbox, saying what
    turning it on costs;
  * the `field-summary` or `field-note` that closes an options fieldset - the
    policy the settings above it add up to.

They are gathered into one `<details>` whose summary is the card's own heading,
with a small mark beside it. Closed, a card is the controls it operates;
opened, it is everything it used to say.

What does NOT move is anything that reports rather than explains. The line
under the target field - "This image is over 200 KB, so it will be compressed
until it is not" - answers a question the reader asked by typing a number, and
a status hidden behind a fold is a status nobody reads.

WHY THE BUILD DOES THIS AND NOT THE MARKUP

A tool's body.html exists once in English and once in each of the fourteen
other languages - five hundred files - and the change is the same in all of
them: no word moves, only the wrapper around it. Written by hand it would be
five hundred chances to get one wrong, and the next tool would arrive
unfolded. Written here it is one rule, it reaches every language on the next
build, and a tool author goes on writing the same paragraph they always wrote.

THE ACCESSIBILITY PART, WHICH IS NOT A SIDE EFFECT

A `check-note` sits inside its `<label>`, so it is part of the checkbox's
accessible name: the control announced itself as "May make the picture smaller
if it has to Only used once quality alone would have to drop past the point
where compression starts to show. Below that..." - eighty words where a name
should be a phrase. Lifting the note out of the label leaves the checkbox named
by its own words. The note keeps its `<strong>` beside it inside the fold, so
which control it belongs to is still on the page.
"""

import re

# One card. Sections do not nest inside a card in any tool here, and if one
# ever does this stops at the first close rather than silently swallowing the
# rest of the page - a card that folds too little is a bug somebody sees.
CARD = re.compile(r'(?P<open><section[^>]*class="[^"]*\bcard\b[^"]*"[^>]*>)'
                  r'(?P<inner>(?:(?!</section>).)*)'
                  r'(?P<close></section>)', re.S)

# The heading a card opens with. The tempered close tag matters: `.*?` alone
# backtracks past its own card to find a heading that does have a paragraph
# under it, and folds four screens of markup into one summary.
HEADING = re.compile(r'(?P<indent>[ \t]*)(?P<tag><h2[^>]*>(?:(?!</h2>).)*</h2>)')

LEDE = re.compile(r'[ \t]*<p class="card-lede">(?:(?!</p>).)*</p>\n?', re.S)

# The small print under a checkbox, and the label it belongs to. Both are
# captured so the fold can say which control the note is about.
CHECK_NOTE = re.compile(
    r'(?P<strong><strong>(?:(?!</strong>).)*</strong>)\s*'
    r'(?P<note><span class="check-note">(?:(?!</span>).)*</span>)', re.S)

# The explanation a settings fieldset closes with.
CLOSING_NOTE = re.compile(
    r'[ \t]*(?P<note><p class="field-(?:summary|note)"[^>]*>'
    r'(?:(?!</p>).)*</p>)\n?(?P<tail>\s*</fieldset>)', re.S)


def fold_ledes(html):
    """Fold each card's explanation behind its heading.

    Named for the paragraph it started with, and now doing the rest of the same
    job. The heading goes inside the `<summary>`, which is what keeps the fold
    honest for a screen reader: the control that opens the note is named by the
    step it belongs to, so it is announced as "Say how big it may be" rather
    than as an unlabelled button. `<summary>` may hold one heading element, and
    that is exactly what this puts in it.
    """
    return CARD.sub(_fold_card, html)


def _fold_card(card):
    inner = card.group('inner')
    heading = HEADING.search(inner)
    if not heading:
        return card.group(0)

    notes = []

    def take_lede(match):
        notes.append(match.group(0).strip())
        return ''

    def take_check_note(match):
        # The label keeps its <strong>; the fold gets a copy of it, so the note
        # arrives with the name of the setting it is about.
        notes.append(f'<p class="fold-note">{match.group("strong")} '
                     f'{match.group("note")}</p>')
        return match.group('strong')

    def take_closing_note(match):
        notes.append(match.group('note'))
        return match.group('tail')

    body = LEDE.sub(take_lede, inner)
    body = CHECK_NOTE.sub(take_check_note, body)
    body = CLOSING_NOTE.sub(take_closing_note, body)
    if not notes:
        return card.group(0)

    indent = heading.group('indent')
    fold = (f'{indent}<details class="card-note">\n'
            f'{indent}  <summary>{heading.group("tag")}</summary>\n'
            + ''.join(f'{indent}  {note}\n' for note in notes)
            + f'{indent}</details>')
    # The heading is matched again in the rewritten body rather than reused
    # from the first search: the passes above have moved everything after it.
    body = HEADING.sub(lambda again: fold, body, count=1)
    return card.group('open') + body + card.group('close')
