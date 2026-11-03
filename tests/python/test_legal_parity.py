"""
The legal pages cover the same subjects in every language that is built.

WHY THESE THREE, AND WHY A TEST

A translated tool that lags behind English is a page with an old sentence on
it. A translated Privacy page that lags behind English is a false statement:
it tells a reader everything this site sends and to whom, and a data flow that
reached only the English page is one the reader was told does not exist. That
is not hypothetical. `feedback.abox.tools` went live disclosed in English alone,
and the two voice tools had shipped the same way two weeks before it, on a page
whose translations went on saying "all five paired tools" while describing
three. scripts/check_locales.py reported both and exits 0, because reading it is
a chore and a chore can wait. So on these pages the same comparison is a failure,
and the change that adds a disclosure has to add it everywhere in one pull
request.

Terms and Contact are held to it for the same reason. They are what a reader
agrees to and how they reach a person, and Contact is where the feedback form
is offered.

WHAT IT CAN AND CANNOT SEE

Counting sections and headings and comparing links says that a translation has
the same subjects and points at the same services. It cannot say that a sentence
inside one of them still says what the English says: a retention period changed
in place is invisible here, and still has to be carried across by whoever changes
it. Paragraphs are not counted, because a Chinese paragraph that takes three
short sentences where the English takes one long one, or two paragraphs where
the English took one, is the house style at work rather than drift.

A language with no file for a page shows the English body, which cannot disagree
with itself, so a missing file is left to the build's own accounting.

The comparison itself lives in scripts/check_locales.py, which is what a
translator runs. There is one definition of "the same", and this is the part of
it that stops the build.
"""
import importlib.util
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[2]

spec = importlib.util.spec_from_file_location(
    'check_locales', ROOT / 'scripts' / 'check_locales.py')
check_locales = importlib.util.module_from_spec(spec)
spec.loader.exec_module(check_locales)


def parsed(body):
    """check_locales' reading of a body held in a string rather than a file."""
    reader = check_locales.Segments()
    reader.feed(body)
    reader.flush()
    return reader


class EveryTranslationCoversWhatEnglishCovers(unittest.TestCase):

    def test_the_legal_pages_agree_with_english(self):
        locales = sorted(p for p in (ROOT / 'locales').iterdir() if (p / 'locale.toml').is_file())
        self.assertTrue(locales, 'no locales found, so this test would prove nothing')
        for folder in locales:
            slugs = check_locales.locale_slugs(folder)
            for page in check_locales.LEGAL_PAGES:
                body = folder / 'pages' / f'{page}.html'
                if not body.is_file():
                    continue
                with self.subTest(language=folder.name, page=page):
                    found = check_locales.legal_differences(
                        check_locales.parse_html(ROOT / 'pages' / page / 'body.html'),
                        check_locales.parse_html(body),
                        page, slugs)
                    self.assertEqual(
                        found, [],
                        f'{body.relative_to(ROOT).as_posix()} does not cover what '
                        f'pages/{page}/body.html covers. Translate what changed there in '
                        'this language, in the same pull request, so that nothing this '
                        'site discloses reaches English alone.')


class TheComparisonCanFail(unittest.TestCase):
    """Checked rather than assumed: a guard that cannot fire looks exactly like
    one that has found nothing."""

    ENGLISH = """
      <section><h2>Your files</h2><p>Local.</p></section>
      <section><h2>Feedback</h2>
        <p><a href="https://feedback.abox.tools/">Send it</a>.</p>
        <h3>Trim</h3><p><a href="../trim-video/">Trim</a>.</p>
      </section>"""
    SLUGS = {'privacy': 'datenschutz', 'trim-video': 'video-schneiden'}

    def differences(self, translated):
        return check_locales.legal_differences(
            parsed(self.ENGLISH), parsed(translated), 'privacy', self.SLUGS)

    def test_a_faithful_translation_at_renamed_addresses_is_clean(self):
        self.assertEqual(self.differences("""
          <section><h2>Ihre Dateien</h2><p>Lokal.</p></section>
          <section><h2>Feedback</h2>
            <p><a href="https://feedback.abox.tools/">Senden</a>.</p>
            <h3>Schneiden</h3><p><a href="../video-schneiden/">Schneiden</a>.</p>
          </section>"""), [])

    def test_a_section_english_gained_is_named(self):
        found = self.differences("""
          <section><h2>Ihre Dateien</h2><p>Lokal.</p></section>
          <h3>Schneiden</h3><p><a href="../video-schneiden/">Schneiden</a>.</p>""")
        self.assertIn('section:2->1', found)
        self.assertIn('h2:2->1', found)
        self.assertIn("links missing=['https://feedback.abox.tools/']", found)

    def test_a_subsection_english_gained_is_named(self):
        found = self.differences("""
          <section><h2>Ihre Dateien</h2><p>Lokal.</p></section>
          <section><h2>Feedback</h2>
            <p><a href="https://feedback.abox.tools/">Senden</a>.</p>
          </section>""")
        self.assertIn('h3:1->0', found)
        self.assertIn("links missing=['trim-video']", found)

    def test_a_link_to_the_wrong_place_is_named_both_ways(self):
        found = self.differences("""
          <section><h2>Ihre Dateien</h2><p>Lokal.</p></section>
          <section><h2>Feedback</h2>
            <p><a href="https://example.com/">Senden</a>.</p>
            <h3>Schneiden</h3><p><a href="../video-schneiden/">Schneiden</a>.</p>
          </section>""")
        self.assertIn("links missing=['https://feedback.abox.tools/']", found)
        self.assertIn("links extra=['https://example.com/']", found)


if __name__ == '__main__':
    unittest.main()
