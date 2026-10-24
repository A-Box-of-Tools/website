"""Discovery must describe real instructions and identify their exact bytes.

These cases do not build the site. A small template exercises the same loader
and emitter as a full build, including YAML quoting, UTF-8 and LF on Windows.
"""

import copy
import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from buildlib import agents
from buildlib.site import ConfigError
from buildlib.template import Loader


TEMPLATE = '''---
name: {{ agent_frontmatter.name }}
description: {{ agent_frontmatter.description }}
---

# Café browser tools

Use {{ site.domain }} in the browser you control.
'''


class Discovery(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.templates = self.root / 'templates'
        self.templates.mkdir()
        (self.templates / 'agent-skill.md').write_bytes(TEMPLATE.encode('utf-8'))
        self.out = self.root / 'site'
        self.out.mkdir()
        self.site = {
            'domain': 'https://example.test/',
            'agents': {
                'name': 'browser-tools',
                'display_name': 'Browser tools',
                'description': 'Choose local browser tools: "café files" # privately 🧰.',
                'representative_queries': [
                    'Find a tool to process my file locally.',
                    'Help me use a browser tool.',
                ],
            },
        }

    def build(self):
        return agents.build_discovery(self.out, Loader(self.templates), self.site)

    def document(self, path):
        return json.loads((self.out / path).read_bytes())

    def test_discovery_routes_identify_the_skill_the_build_writes(self):
        written = self.build()
        self.assertEqual(set(written), {
            '.well-known/agent-skills/browser-tools/SKILL.md',
            '.well-known/ard.json',
            '.well-known/ai-catalog.json',
            '.well-known/agent-skills/index.json',
        })
        self.assertTrue(all((self.out / path).is_file() for path in written))
        ard = self.document('.well-known/ard.json')['entries']
        catalog = self.document('.well-known/ai-catalog.json')
        index = self.document('.well-known/agent-skills/index.json')
        self.assertEqual(catalog, {'specVersion': '1.0', 'entries': ard})
        self.assertEqual(len(ard), 1)
        self.assertEqual(len(index['skills']), 1)
        entry, skill = ard[0], index['skills'][0]
        self.assertEqual(entry['identifier'],
                         'urn:air:example.test:skill:browser-tools')
        self.assertEqual(entry['type'], 'application/agent-skills+md')
        self.assertEqual(skill['type'], 'skill-md')
        self.assertEqual(entry['url'], skill['url'])
        self.assertEqual(skill['url'],
                         'https://example.test/.well-known/agent-skills/browser-tools/SKILL.md')
        self.assertNotIn('data', entry)
        self.assertNotIn('specVersion', self.document('.well-known/ard.json'))
        self.assertEqual(entry['representativeQueries'],
                         self.site['agents']['representative_queries'])
        self.assertEqual(index['$schema'],
                         'https://schemas.agentskills.io/discovery/0.2.0/schema.json')

    def test_the_digest_covers_the_emitted_utf8_including_its_final_newline(self):
        self.build()
        raw = (self.out / '.well-known/agent-skills/browser-tools/SKILL.md').read_bytes()
        index = self.document('.well-known/agent-skills/index.json')['skills'][0]
        self.assertIn('Café'.encode('utf-8'), raw)
        self.assertTrue(raw.endswith(b'\n'))
        self.assertNotIn(b'\r', raw)
        self.assertEqual(index['digest'], 'sha256:' + hashlib.sha256(raw).hexdigest())

    def test_frontmatter_metadata_survives_yaml_punctuation(self):
        self.build()
        raw = (self.out / '.well-known/agent-skills/browser-tools/SKILL.md').read_text(
            encoding='utf-8')
        fields = dict(line.split(': ', 1) for line in raw.splitlines()[1:3])
        for field in ('name', 'description'):
            self.assertEqual(json.loads(fields[field]), self.site['agents'][field])
        self.assertEqual(self.document('.well-known/ard.json')['entries'][0]['description'],
                         self.site['agents']['description'])

    def test_publisher_identity_follows_the_resource_domain_without_claiming_attestation(self):
        from urllib.parse import urlsplit
        for domain in ('https://example.test/', 'https://other.example.test'):
            with self.subTest(domain=domain):
                self.site['domain'] = domain
                self.build()
                entry = self.document('.well-known/ard.json')['entries'][0]
                identity = entry['trustManifest']
                publisher = entry['identifier'].split(':')[2]
                self.assertEqual(urlsplit(identity['identity']).hostname, publisher)
                self.assertEqual(urlsplit(identity['identity']).scheme, 'https')
                self.assertEqual(identity['identityType'], 'https')
                self.assertNotIn('signature', identity)
                self.assertNotIn('attestations', identity)
                self.assertNotIn('trustSchema', identity)

    def test_changing_instructions_changes_the_digest_and_rebuilds_are_stable(self):
        paths = self.build()
        first = {path: (self.out / path).read_bytes() for path in paths}
        self.build()
        self.assertEqual(first, {path: (self.out / path).read_bytes() for path in paths})
        old_digest = self.document('.well-known/agent-skills/index.json')['skills'][0]['digest']
        (self.templates / 'agent-skill.md').write_bytes(
            (TEMPLATE + '\nRead the tool limitations first.\n').encode('utf-8'))
        self.build()
        new_digest = self.document('.well-known/agent-skills/index.json')['skills'][0]['digest']
        self.assertNotEqual(old_digest, new_digest)

    def test_crlf_templates_still_publish_lf_and_a_matching_digest(self):
        (self.templates / 'agent-skill.md').write_bytes(
            TEMPLATE.replace('\n', '\r\n').encode('utf-8'))
        self.build()
        raw = (self.out / '.well-known/agent-skills/browser-tools/SKILL.md').read_bytes()
        self.assertNotIn(b'\r', raw)
        self.assertEqual(self.document('.well-known/agent-skills/index.json')['skills'][0]['digest'],
                         'sha256:' + hashlib.sha256(raw).hexdigest())

    def test_invalid_metadata_stops_before_publishing_discovery(self):
        cases = [
            ('name', '../elsewhere'),
            ('name', 'tool--name'),
            ('name', 'Tool'),
            ('name', 'a' * 65),
            ('description', 'First line\nsecond line'),
            ('description', 'a' * 1025),
            ('description', ' '),
            ('representative_queries', ['Only one query.']),
        ]
        original = copy.deepcopy(self.site)
        for key, value in cases:
            with self.subTest(key=key, value=value):
                self.site = copy.deepcopy(original)
                self.site['agents'][key] = value
                with self.assertRaisesRegex(ConfigError, 'config/site.toml'):
                    self.build()
                self.assertEqual(list(self.out.iterdir()), [])

    def test_discovery_requires_a_public_https_origin(self):
        for domain in ('http://example.test/', 'https://example.test/subsite/',
                       'https://user@example.test/', 'https://bad_host.test/'):
            with self.subTest(domain=domain):
                self.site['domain'] = domain
                with self.assertRaisesRegex(ConfigError, 'HTTPS site origin'):
                    self.build()
                self.assertEqual(list(self.out.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
