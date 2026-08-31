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
import unittest
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
