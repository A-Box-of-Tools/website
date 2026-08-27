"""
buildlib/deployed.py - comparing a build with the branch that is served.

Only `blob_id` is unit-testable without a deploy to compare against, and it is
the part that has to be exactly right: it computes the id Git would give a
file, in-process, because asking `git hash-object` once per file is a process
per file over ten thousand files. An id that disagreed with Git would make
`--check` compare nothing and say everything matched.
"""

import hashlib
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from buildlib import deployed


class BlobId(unittest.TestCase):
    """The id Git would give a file, computed without shelling out per file."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.dir = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def test_it_matches_the_documented_rule(self):
        path = self.dir / 'a.txt'
        path.write_bytes(b'hello\n')
        expected = hashlib.sha1(b'blob 6\x00hello\n').hexdigest()
        self.assertEqual(deployed.blob_id(path), expected)

    def test_an_empty_file_is_the_well_known_empty_blob(self):
        path = self.dir / 'empty'
        path.write_bytes(b'')
        self.assertEqual(deployed.blob_id(path),
                         'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391')

    def test_it_agrees_with_git_itself(self):
        path = self.dir / 'a.bin'
        path.write_bytes(bytes(range(256)) + b'\r\n mixed \n endings \r\n')
        found = subprocess.run(['git', 'hash-object', str(path)],
                               capture_output=True, text=True, check=True)
        self.assertEqual(deployed.blob_id(path), found.stdout.strip())


class GitOutputDecoding(unittest.TestCase):
    """Git's output is read as UTF-8, whatever the machine's locale is.

    `text=True` decodes with the locale encoding. This site has 1,512 paths
    that are not ASCII - the translated slugs, in Arabic, Japanese and Chinese
    - so on a Windows install whose locale is not UTF-8 (cp936 is a common
    one) the reader thread died mid-decode and `stdout` arrived as None. What
    reached the person running --check was `AttributeError: 'NoneType' object
    has no attribute 'split'`, which names neither git nor an encoding. That
    is the one command this whole site asks people to run.

    These assert the MECHANISM and not the symptom, deliberately. CI runs on a
    UTF-8 machine, where the broken version works perfectly and a test that
    only checked the result would have passed either way.
    """

    ARABIC = 'ar/' + 'قارئ-رموز' + '/index.html'

    def run_compare(self, stdout):
        """compare() against a canned `git ls-tree`, capturing how it was
        called. The build directory is empty, so every committed path comes
        back as a difference - which is what makes the parsed names visible.
        """
        result = subprocess.CompletedProcess(args=[], returncode=0, stdout=stdout)
        with tempfile.TemporaryDirectory() as tmp:
            with mock.patch.object(deployed.subprocess, 'run',
                                   return_value=result) as run:
                differences = deployed.compare(Path(tmp), 'dist')
        return run.call_args, differences

    def test_git_is_asked_for_utf8_and_never_the_locale(self):
        call, _ = self.run_compare('')
        self.assertEqual(call.kwargs.get('encoding'), 'utf-8')
        self.assertNotIn(
            'text', call.kwargs,
            'text=True decodes with the machine locale, which is the bug this '
            'guards. Ask for encoding="utf-8" so every machine reads git alike.')

    def test_a_path_that_is_not_ascii_survives_being_read(self):
        # One entry in the -z format: "<mode> <type> <id>\t<path>\0". The path
        # is the Arabic slug for the QR reader, which is the shape of the 1,512
        # that cp936 could not decode.
        entry = '100644 blob ' + '0' * 40 + '\t' + self.ARABIC + '\0'
        _, differences = self.run_compare(entry)
        self.assertEqual(differences, [self.ARABIC])


if __name__ == "__main__":
    unittest.main()
