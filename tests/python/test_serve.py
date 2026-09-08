"""
The local server's file, checked for the one way it has actually broken.

`serve.ps1` is how the site is looked at on this machine, and it is also what
the QA suite starts when it is run without a BASE_URL. Nothing in CI runs it:
the build and both unit suites are Python and Node, and the browser suite in
the qa repository is pointed at a deployed address. So a mistake in it is
invisible to every check this repository has, and is found by a person trying
to serve the site.

That is not hypothetical. #364 added `.md` to the MIME table without noticing
the entry already there, and a duplicate key in a PowerShell hash literal is
not a warning - the parser refuses the file outright, with
`DuplicateKeyInHashLiteral`, before a line of it runs. `serve.ps1` could not
start at all for six merges, and the QA suite could not be run locally either,
because its webServer is this script.

The honest check would be to parse the file, and it is not available here:
that needs PowerShell, and CI is Linux. This is the portable proxy for the one
failure that has happened - the table is read with a regular expression and
its keys are counted. A test that only knows about yesterday's bug is worth
having when the bug cost six days and the alternative is nothing.
"""

import re
import unittest
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SERVE = ROOT / 'serve.ps1'

#: The `$mimeTypes = @{ ... }` literal, and nothing else in the file.
TABLE = re.compile(r'\$mimeTypes\s*=\s*@\{(.*?)\n\}', re.DOTALL)

#: One `'.ext' = 'type'` line inside it. Comments do not match, so the
#: explanatory ones between the entries are skipped rather than parsed.
ENTRY = re.compile(r"^\s*'(\.[A-Za-z0-9]+)'\s*=", re.MULTILINE)


class TheMimeTable(unittest.TestCase):
    def setUp(self):
        body = TABLE.search(SERVE.read_text(encoding='utf-8'))
        self.assertIsNotNone(
            body, 'serve.ps1 has no $mimeTypes = @{ ... } table to check')
        self.keys = ENTRY.findall(body.group(1))

    def test_it_was_found_at_all(self):
        # A regular expression that silently matched nothing would make every
        # other test here pass while checking no extensions whatsoever.
        self.assertGreater(len(self.keys), 10)
        self.assertIn('.html', self.keys)

    def test_no_extension_is_listed_twice(self):
        repeated = sorted(ext for ext, n in Counter(self.keys).items() if n > 1)
        self.assertEqual(
            repeated, [],
            'PowerShell refuses to parse a hash literal with a repeated key, so '
            'serve.ps1 would not start at all: ' + ', '.join(repeated))
