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


if __name__ == "__main__":
    unittest.main()
