"""
The accessibility floor, enforced over every language at once.

WHY THIS IS A TEST AND NOT A REVIEW

Most of what accessibility asks for here was already true - real <label>s, live
regions, keyboard-driven croppers - because it was built that way. What kept
going wrong was the remainder: a canvas added for a preview with nothing to
tell a screen reader it exists, a range slider whose only caption is a number,
a file input hidden behind a button and named by neither. None of those breaks
a build, none is visible to a sighted reviewer, and each one was found by
reading every body.html in turn - once. This file is that reading, kept.

It reads the SOURCE tree, not a build, for the same reason test_duplicates.py
does: a translated body is a whole file under locales/<lang>/tools/, free to
drift from the English one it was copied from, and a fix applied only to
English is exactly the kind of silent divergence a test exists to catch. So
every rule here runs over the English body and every translation of it.

WHAT THE RULES ARE

  - every tool body opens with <main id="main">: the skip link in
    templates/tool.html points at it, and a target that only exists in some
    languages is a link that only works in some languages;
  - every form control a visitor can reach has a name: a <label for=>, a
    wrapping <label>, or an aria-label/aria-labelledby of its own. Buttons say
    their purpose in their text or an aria-label - except ones born [hidden],
    whose text arrives with the data that unhides them;
  - a <canvas> is either described (role/aria-label/aria-labelledby) or
    declared decoration (aria-hidden): an undecorated canvas is a hole in the
    page that a screen reader walks past without a word;
  - a <video> without native controls says what it is, the same way;
  - <img> carries alt, every aria-labelledby lands on an id in the same file,
    and the skip link's style exists in both stylesheets that are supposed to
    carry every page-wide rule twice.

Regex rather than an HTML parser, deliberately: these files carry template
syntax that no parser accepts, and the patterns matched are the repository's
own idiom, not arbitrary HTML.
"""

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

CONTROL = re.compile(r'<(input|select|textarea)\b[^>]*>')
LABEL_FOR = re.compile(r'<label[^>]*\bfor\s*=\s*"([^"]+)"')
COMMENT = re.compile(r'<!--.*?-->', re.S)


def bodies():
    """Every tool body in every language, as (name, text) pairs."""
    for path in sorted(ROOT.glob('tools/*/body.html')):
        yield f'tools/{path.parent.name}', path.read_text(encoding='utf-8')
    for path in sorted(ROOT.glob('locales/*/tools/*.html')):
        name = f'{path.parents[1].name}/{path.stem}'
        yield name, path.read_text(encoding='utf-8')


def attr(tag, name):
    match = re.search(rf'\b{name}\s*=\s*"([^"]*)"', tag)
    return match.group(1) if match else None


def has_attr(tag, name):
    return re.search(rf'\b{name}\b', tag) is not None


class BodyRules(unittest.TestCase):
    def check(self, rule):
        """Run one rule over every body and report every failure at once."""
        wrong = []
        for name, text in bodies():
            wrong += [f'{name}: {found}' for found in rule(COMMENT.sub('', text))]
        self.assertEqual([], wrong, '\n' + '\n'.join(wrong))

    def test_main_carries_the_skip_target(self):
        def rule(text):
            if text.count('<main id="main">') != 1 or re.search(r'<main[ >](?!id="main">)', text):
                yield 'does not open with exactly one <main id="main">'
        self.check(rule)

    def test_every_control_has_a_name(self):
        def rule(text):
            named = set(LABEL_FOR.findall(text))
            for match in CONTROL.finditer(text):
                tag = match.group(0)
                if (attr(tag, 'type') or '').lower() in ('hidden', 'button', 'submit'):
                    continue
                if attr(tag, 'id') in named:
                    continue
                if attr(tag, 'aria-label') or attr(tag, 'aria-labelledby'):
                    continue
                before = text[:match.start()]
                if before.count('<label') > before.count('</label'):
                    continue
                yield f'unnamed control: {tag[:70]}'
        self.check(rule)

    def test_every_visible_button_has_a_name(self):
        def rule(text):
            for match in re.finditer(r'<button\b[^>]*>(.*?)</button>', text, re.S):
                tag = re.match(r'<button\b[^>]*>', match.group(0)).group(0)
                words = re.sub(r'<[^>]+>|\{\{.*?\}\}|&[a-z]+;|&#\d+;', 'x', match.group(1))
                if words.strip() or attr(tag, 'aria-label') or attr(tag, 'aria-labelledby'):
                    continue
                # Born hidden: its text arrives with the data that unhides it.
                if has_attr(tag, 'hidden'):
                    continue
                yield f'unnamed button: {match.group(0)[:70]}'
        self.check(rule)

    def test_canvases_are_described_or_declared_decoration(self):
        def rule(text):
            for match in re.finditer(r'<canvas\b[^>]*>', text):
                tag = match.group(0)
                if not (attr(tag, 'role') or attr(tag, 'aria-label')
                        or attr(tag, 'aria-labelledby') or has_attr(tag, 'aria-hidden')):
                    yield f'undescribed canvas: {tag[:70]}'
        self.check(rule)

    def test_videos_without_controls_say_what_they_are(self):
        def rule(text):
            for match in re.finditer(r'<(video|audio)\b[^>]*>', text):
                tag = match.group(0)
                if not (has_attr(tag, 'controls') or attr(tag, 'aria-label')
                        or attr(tag, 'aria-labelledby') or has_attr(tag, 'aria-hidden')):
                    yield f'silent {match.group(1)}: {tag[:70]}'
        self.check(rule)

    def test_images_carry_alt(self):
        def rule(text):
            for match in re.finditer(r'<img\b[^>]*>', text):
                if not has_attr(match.group(0), 'alt'):
                    yield f'img without alt: {match.group(0)[:70]}'
        self.check(rule)

    def test_labelledby_lands_on_an_id(self):
        def rule(text):
            ids = set(re.findall(r'\bid\s*=\s*"([^"]+)"', text))
            for match in re.finditer(r'\baria-labelledby\s*=\s*"([^"]+)"', text):
                for target in match.group(1).split():
                    if target not in ids:
                        yield f'aria-labelledby="{target}" names no id in this file'
        self.check(rule)


class FrameRules(unittest.TestCase):
    """The half of the floor that lives in the templates and the stylesheets."""

    PAGE_TEMPLATES = ['tool.html', 'hub.html', 'page.html', 'guides.html',
                      'roadmap.html', '404.html']

    def test_every_page_template_starts_with_the_skip_link(self):
        for name in self.PAGE_TEMPLATES:
            text = (ROOT / 'templates' / name).read_text(encoding='utf-8')
            self.assertIn('<a class="skip-link" href="#main">', text,
                          f'templates/{name} has no skip link')
            # Nothing focusable may come before it, or it is not a skip.
            body = text.split('<body>', 1)[1]
            first = re.search(r'<(a|button|input|select|textarea|summary)\b', body)
            self.assertIn('skip-link', body[first.start():first.end() + 60],
                          f'templates/{name}: the skip link is not the first '
                          'focusable thing on the page')

    def test_templates_that_own_their_main_give_it_the_id(self):
        for name in self.PAGE_TEMPLATES:
            if name == 'tool.html':  # its <main> lives in each tool's body.html
                continue
            text = (ROOT / 'templates' / name).read_text(encoding='utf-8')
            self.assertIn('<main id="main"', text,
                          f'templates/{name}: <main> lacks the id the skip link targets')

    def test_the_skip_link_is_styled_in_both_sheets(self):
        for sheet in ('shared/site.css', 'shared/css/tool-frame.css'):
            text = (ROOT / sheet).read_text(encoding='utf-8')
            self.assertIn('.skip-link', text, f'{sheet}: no .skip-link rule')
            self.assertIn('.skip-link:focus', text,
                          f'{sheet}: a skip link that never becomes visible')


if __name__ == '__main__':
    unittest.main()
