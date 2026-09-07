"""
buildlib/cards.py - the fold that puts a step's explanation behind its heading.

WHY THIS FILE EXISTS NOW

It did not, and the rule it guards is one where being wrong is invisible. A
paragraph that should fold and does not is half a screen of prose above the
controls, which is what `field-summary` was doing in four tools; a paragraph
that folds and should NOT is a status the tool writes into, hidden behind a
disclosure nobody opens. Neither fails a build, and neither is legible in a
diff of five hundred generated pages.

So the two halves of that rule are asserted here, on made-up markup where the
answer is obvious, and then on every real body.html at once - which is the part
that would have caught the gap in the first place.
"""

import re
import tomllib
import unittest
from html.parser import HTMLParser
from pathlib import Path

from buildlib import cards

ROOT = Path(__file__).resolve().parents[2]
TOOLS = ROOT / 'tools'

FOLD = re.compile(r'<details class="card-note">.*?</details>', re.S)
SUMMARY = re.compile(r'<p class="field-summary"([^>]*)>((?:(?!</p>).)*)</p>', re.S)
TAGS = re.compile(r'<[^>]+>')


def card(inner):
    return f'<section class="card">\n  <h2>A step</h2>\n{inner}\n</section>'


def folded(html):
    """The text inside the fold, and the markup left outside it."""
    match = FOLD.search(html)
    return (match.group(0) if match else ''), FOLD.sub('', html)


class Summaries(unittest.TestCase):
    def test_a_summary_folds_wherever_it_sits(self):
        # The case that was missed: `field-summary` names what the paragraph
        # is, and a tool author who did not happen to close a fieldset with it
        # still wrote a summary.
        html = cards.fold_ledes(card(
            '  <p class="field-summary">What these add up to.</p>\n'
            '  <div class="option-row"><label for="x">A control</label>'
            '<input id="x"></div>'))
        inside, outside = folded(html)
        self.assertIn('What these add up to.', inside)
        self.assertNotIn('What these add up to.', outside)
        self.assertIn('A control', outside, 'the control itself must stay put')

    def test_an_empty_summary_is_left_alone(self):
        # It is empty because the tool fills it as things change, and a status
        # behind a fold is a status nobody reads.
        html = cards.fold_ledes(card(
            '  <p class="field-summary" id="download-note" role="status"></p>'))
        self.assertNotIn('<details', html, 'nothing to fold, so no fold')
        self.assertIn('id="download-note"', html)

    def test_a_summary_closing_a_fieldset_folds_once(self):
        html = cards.fold_ledes(card(
            '  <fieldset>\n'
            '    <p class="field-summary">The policy above.</p>\n'
            '  </fieldset>'))
        inside, outside = folded(html)
        self.assertEqual(1, inside.count('The policy above.'),
                         'the fieldset rule and the general one both claimed it')
        self.assertIn('</fieldset>', outside, 'the fieldset must still close')

    def test_the_notes_keep_the_order_they_were_read_in(self):
        html = cards.fold_ledes(card(
            '  <p class="card-lede">First.</p>\n'
            '  <p class="field-summary">Second.</p>\n'
            '  <p class="card-lede">Third.</p>'))
        inside, _ = folded(html)
        self.assertLess(inside.index('First.'), inside.index('Second.'))
        self.assertLess(inside.index('Second.'), inside.index('Third.'))

    def test_the_heading_names_the_fold(self):
        # What keeps the disclosure honest for a screen reader: the control
        # that opens it is announced as the step it belongs to.
        html = cards.fold_ledes(card('  <p class="field-summary">Words.</p>'))
        self.assertIn('<summary><h2>A step</h2></summary>', html)


class EveryTool(unittest.TestCase):
    def test_no_tool_leaves_a_written_summary_on_the_page(self):
        """The check that would have found the gap: run the real bodies.

        A `field-summary` with words in it is explanation by definition, so
        after the fold there should be none of them left outside one. The empty
        ones are the tools' own status lines and must all still be there.
        """
        loose, lost = [], []
        for body in sorted(TOOLS.glob('*/body.html')):
            html = cards.fold_ledes(body.read_text(encoding='utf-8'))
            _, outside = folded(html)
            for match in SUMMARY.finditer(outside):
                if TAGS.sub('', match.group(2)).strip():
                    loose.append(f'{body.parent.name}: {match.group(1).strip()}')
            for match in SUMMARY.finditer(body.read_text(encoding='utf-8')):
                if TAGS.sub('', match.group(2)).strip():
                    continue
                if match.group(0) not in outside:
                    lost.append(f'{body.parent.name}: {match.group(1).strip()}')

        self.assertEqual([], loose, '\nstill on the page:\n' + '\n'.join(loose))
        self.assertEqual([], lost, '\nfolded but is a status:\n' + '\n'.join(lost))


# The tags HTML never closes, which a parser counting depth has to know about
# or it spends the rest of the document one level too deep.
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
        'meta', 'param', 'source', 'track', 'wbr'}


class CardChildren(HTMLParser):
    """What each card holds directly, and which card holds the drop zone."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.depth = None
        self.children = []
        self.cards = []

    def handle_starttag(self, tag, attrs):
        classes = dict(attrs).get('class', '').split()
        if self.depth is None:
            if tag == 'section' and 'card' in classes:
                self.depth = 0
                self.children = []
            return
        if self.depth == 0:
            self.children.append((tag, tuple(classes)))
        if tag not in VOID:
            self.depth += 1

    def handle_endtag(self, tag):
        if self.depth is None or tag in VOID:
            return
        if self.depth == 0:
            self.cards.append(self.children)
            self.depth = None
        else:
            self.depth -= 1

    def handle_data(self, data):
        if self.depth is not None and 'partials/file-picker.html' in data:
            self.picker = len(self.cards)

    picker = None


class TheExampleButtonsRow(unittest.TestCase):
    """This fold and shared/js/file-picker.js have to agree about the heading.

    `liftToHeading` moves the "Try an example" button up onto the step's own
    heading row, and it finds that row as a direct child of the card holding
    the drop zone: an `<h2>`, or - once this file has been over it - the
    `<details>` the `<h2>` now sits inside. For as long as it knew only the
    first shape, the five tools whose first card opens with a lede kept their
    button down under the drop zone while the other twenty-seven had it up on
    the heading, and nothing anywhere failed: the button was simply somewhere
    else on a sixth of the site.

    So the two shapes are asserted together, on every tool that has the button.
    A third shape arriving here - a heading wrapped in something new - is a
    change to that file as well as to this one.
    """

    def test_every_example_tool_offers_a_heading_to_lift_the_button_onto(self):
        missing = []
        for toml in sorted(TOOLS.glob('*/tool.toml')):
            config = tomllib.loads(toml.read_text(encoding='utf-8'))
            if not config.get('picker', {}).get('example'):
                continue

            parser = CardChildren()
            parser.feed(cards.fold_ledes(
                (toml.parent / 'body.html').read_text(encoding='utf-8')))
            children = parser.cards[parser.picker] if parser.picker is not None else []

            if not any(tag == 'h2' or (tag == 'details' and 'card-note' in classes)
                       for tag, classes in children):
                missing.append(f'{toml.parent.name}: {children}')

        self.assertEqual([], missing,
                         '\nthe button has nowhere to go but under the drop zone:\n'
                         + '\n'.join(missing))
