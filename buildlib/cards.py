"""
Everything a step explains, folded behind that step's heading.

WHAT MOVES

Three kinds of prose, all of them explanation rather than state:

  * `<p class="card-lede">` - the paragraph a card opens with, saying what the
    step is for;
  * `<span class="check-note">` - the small print under a checkbox, saying what
    turning it on costs;
  * `<p class="field-note">` - what one control does, wherever it sits;
  * `<p class="field-summary">` - what a group of them adds up to, likewise.

They are gathered into one `<details>` whose summary is the card's own heading,
with a small mark beside it. Closed, a card is the controls it operates;
opened, it is everything it used to say.

A summary used to fold only if it closed a `<fieldset>`, which is a fact about
where somebody typed it and not about what it says. Four tools had summaries
sitting open on the page because of that, compare-heights three of them in a
row - half a screen of prose between a menu and the chart it fills in.

WHAT DOES NOT MOVE

Anything that reports rather than explains. The line under the target field -
"This image is over 200 KB, so it will be compressed until it is not" - answers
a question the reader asked by typing a number, and a status hidden behind a
fold is a status nobody reads.

Those are told apart by being EMPTY in the markup: a paragraph the tool writes
into has nothing in it until it does. Every rule here checks that, and the
fieldset one did not, so five tools were folding away a status their own
JavaScript fills in. `tests/python/test_cards.py` now asserts both halves -
that no written summary is left on a page, and that no empty one is folded.

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
# re.S, because a heading is allowed to wrap. Without it `.` stops at the end
# of the line and a two-line <h2> is simply not found - which does not fail, it
# quietly leaves that card unfolded. trim-video and trim-audio were both in that
# state and looked like cards that had nothing to fold.
HEADING = re.compile(r'(?P<indent>[ \t]*)(?P<tag><h2[^>]*>(?:(?!</h2>).)*</h2>)',
                     re.S)

# `[^>]*` and not `>` on the class: a lede often carries an id as well, because
# the tool writes to it - password-generator's says which of the two things the
# tab strip is currently making. Matching only the bare tag quietly skipped
# seven of them across five tools, which is the sort of thing a regex over
# markup does when it is written against one example.
LEDE = re.compile(r'[ \t]*<p class="card-lede"[^>]*>(?:(?!</p>).)*</p>\n?', re.S)

# A note under one field. Only the ones with words in them: an empty one is
# filled by the tool as the setting changes - "this speed makes it 3x longer" -
# and that is feedback about what you just did, not documentation. Feedback
# belongs beside the control it is about, where it can be seen without being
# asked for.
FIELD_NOTE = re.compile(
    r'[ \t]*(?P<open><p class="field-note"[^>]*>)(?P<body>(?:(?!</p>).)*)</p>\n?',
    re.S)

# The paragraph above a stage - a video, a waveform, a page to put corners on -
# saying how to drive it. Eight tools have one, and it is the same kind of thing
# as a lede: instructions for a control, not a report about what it is doing.
STAGE_HINT = re.compile(
    r'[ \t]*<p class="stage-hint"[^>]*>(?:(?!</p>).)*</p>\n?', re.S)

# The label of the field a note belongs to, found by looking back from it.
LABEL = re.compile(r'<label[^>]*>(?P<text>(?:(?!</label>).)*)</label>', re.S)

TAGS = re.compile(r'<[^>]+>')

# The small print under a checkbox, and the label it belongs to. Both are
# captured so the fold can say which control the note is about.
CHECK_NOTE = re.compile(
    r'(?P<strong><strong>(?:(?!</strong>).)*</strong>)\s*'
    r'(?P<note><span class="check-note">(?:(?!</span>).)*</span>)', re.S)

# What a whole group of controls adds up to, wherever the tool happened to put
# it. `field-summary` names the paragraph rather than its position, and until
# this existed only the ones that closed a fieldset were folded - so four tools
# had summaries sitting open on the page for no reason but where they were
# written. compare-heights had three of them under one menu, half a screen of
# prose above the chart.
#
# The empty ones are skipped for the reason every empty note is: the tool writes
# into them - qr-barcode's symbology and encoded notes, the download note three
# tools share - and a status behind a fold is a status nobody reads.
SUMMARY = re.compile(
    r'[ \t]*<p class="field-summary"[^>]*>(?P<body>(?:(?!</p>).)*)</p>\n?', re.S)

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


def _named(inner, match):
    """A field's note, with the name of the field in front of it.

    "These ones: !#$%&()*+,-./:;<=>?@[]^_{|}~" is a sentence about the symbol
    set, and away from the menu it sits under it is a sentence about nothing.
    The nearest label before it is that menu's, so the note takes it along -
    the same trick the checkbox notes use, where the name was already bold and
    right there.
    """
    label = None
    for found in LABEL.finditer(inner, 0, match.start()):
        label = found
    # The name is taken as plain text, because a label may hold the checkbox it
    # names and copying that would put a second element with the same id in the
    # page. The note keeps its markup exactly: several of them contain a <code>
    # the tool writes into - password-generator prints the symbol set into one -
    # and a note stripped to text would break the tool rather than tidy it.
    name = TAGS.sub('', label.group('text')).strip() if label else ''
    if not name:
        return match.group(0).strip()
    # The opening tag is kept exactly as it was, id and all: four of these are
    # written to by their tool - edit-audio's depth-note, json-formatter's
    # language-note, reverse-video's audio-note, timelapse-video's size-note -
    # and a rebuilt <p> without the id is a tool that has lost its handle.
    return (f'{match.group("open")}<strong>{name}</strong> '
            f'{match.group("body").strip()}</p>')


def _fold_card(card):
    inner = card.group('inner')
    heading = HEADING.search(inner)
    if not heading:
        return card.group(0)

    # Every note is found on the ORIGINAL text first, so that the fold can be
    # assembled in the order a reader would have met the notes on the page.
    # Doing it as three substitutions in a row put every checkbox's small print
    # after every lede regardless of where they sat.
    found = []

    for match in LEDE.finditer(inner):
        found.append((match.start(), match.end(), match.group(0).strip(), ''))

    for match in CHECK_NOTE.finditer(inner):
        # The label keeps its <strong>; the fold gets a copy of it, so the note
        # arrives with the name of the setting it is about.
        found.append((match.start(), match.end(),
                      f'<p class="fold-note">{match.group("strong")} '
                      f'{match.group("note")}</p>',
                      match.group('strong')))

    for match in STAGE_HINT.finditer(inner):
        found.append((match.start(), match.end(), match.group(0).strip(), ''))

    for match in CLOSING_NOTE.finditer(inner):
        # Empty for the same reason an empty field-note is: the tool writes
        # into it. This rule did not use to check, so five tools were folding
        # away a status line their own JavaScript fills in - compress-image and
        # heic-to-jpg's format note, document-scanner's and redact-image's
        # strength note, qr-barcode's size note. They report; they stay.
        if not TAGS.sub('', match.group('note')).strip():
            continue
        found.append((match.start(), match.end(),
                      match.group('note'), match.group('tail')))

    # After CLOSING_NOTE, so that a summary which does close a fieldset is
    # already claimed and is not folded twice.
    for match in SUMMARY.finditer(inner):
        if not TAGS.sub('', match.group('body')).strip():
            continue
        if any(start <= match.start() < end for start, end, _, _ in found):
            continue
        found.append((match.start(), match.end(), match.group(0).strip(), ''))

    for match in FIELD_NOTE.finditer(inner):
        if not TAGS.sub('', match.group('body')).strip():
            continue
        if any(start <= match.start() < end for start, end, _, _ in found):
            continue
        found.append((match.start(), match.end(),
                      _named(inner, match), ''))

    if not found:
        return card.group(0)

    found.sort()
    notes = [note for _, _, note, _ in found]

    # Cut from the bottom up, so an offset taken from the original text is
    # still the right offset when its turn comes.
    body = inner
    for start, end, _, keep in sorted(found, reverse=True):
        body = body[:start] + keep + body[end:]

    indent = heading.group('indent')
    fold = (f'{indent}<details class="card-note">\n'
            f'{indent}  <summary>{heading.group("tag")}</summary>\n'
            + ''.join(f'{indent}  {note}\n' for note in notes)
            + f'{indent}</details>')
    # The heading is matched again in the rewritten body rather than reused
    # from the first search: the passes above have moved everything after it.
    body = HEADING.sub(lambda again: fold, body, count=1)
    return card.group('open') + body + card.group('close')
