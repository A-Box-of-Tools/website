"""Discovery identifies exact instructions and a separate public MCP catalogue.

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
            'domain': 'https://example.com/',
            'agents': {
                'name': 'browser-tools',
                'display_name': 'Browser tools',
                'description': 'Choose local browser tools: "café files" # privately 🧰.',
                'representative_queries': [
                    'Find a tool to process my file locally.',
                    'Help me use a browser tool.',
                ],
                'mcp': {
                    'server_card': 'https://mcp.example.com/mcp/server-card',
                    'display_name': 'Public tool catalogue',
                    'description': 'Find public browser tools; send public keywords, never files.',
                    'representative_queries': [
                        'Find a PNG conversion tool.',
                        'Browse public tool links.',
                    ],
                },
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
        self.assertEqual(len(ard), 2)
        self.assertEqual(len(index['skills']), 1)
        entry, skill = ard[0], index['skills'][0]
        self.assertEqual(entry['identifier'],
                         'urn:air:example.com:skill:browser-tools')
        self.assertEqual(entry['type'], 'application/agent-skills+md')
        self.assertEqual(skill['type'], 'skill-md')
        self.assertEqual(entry['url'], skill['url'])
        self.assertEqual(skill['url'],
                         'https://example.com/.well-known/agent-skills/browser-tools/SKILL.md')
        self.assertNotIn('data', entry)
        self.assertNotIn('specVersion', self.document('.well-known/ard.json'))
        self.assertEqual(entry['representativeQueries'],
                         self.site['agents']['representative_queries'])
        self.assertEqual(index['$schema'],
                         'https://schemas.agentskills.io/discovery/0.2.0/schema.json')
        mcp = ard[1]
        self.assertEqual(mcp['identifier'], 'urn:air:mcp.example.com:mcp:catalogue')
        self.assertEqual(mcp['type'], 'application/mcp-server-card+json')
        self.assertEqual(mcp['url'], 'https://mcp.example.com/mcp/server-card')
        for key, config_key in [('displayName', 'display_name'),
                                ('description', 'description'),
                                ('representativeQueries', 'representative_queries')]:
            self.assertEqual(mcp[key], self.site['agents']['mcp'][config_key])
        self.assertNotIn(mcp['url'], [value['url'] for value in index['skills']])
        self.assertNotIn('data', mcp)

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
        for domain in ('https://example.com/', 'https://other.example.com'):
            with self.subTest(domain=domain):
                self.site['domain'] = domain
                hostname = urlsplit(domain).hostname
                self.site['agents']['mcp']['server_card'] = f'https://mcp.{hostname}/mcp/server-card'
                self.build()
                for entry in self.document('.well-known/ard.json')['entries']:
                    identity = entry['trustManifest']
                    publisher = entry['identifier'].split(':')[2]
                    self.assertEqual(urlsplit(identity['identity']).hostname, publisher)
                    self.assertEqual(urlsplit(identity['identity']).scheme, 'https')
                    self.assertEqual(identity['identityType'], 'https')
                    self.assertNotIn('signature', identity)
                    self.assertNotIn('attestations', identity)
                    self.assertNotIn('trustSchema', identity)

    def test_catalogue_metadata_does_not_change_the_instruction_digest(self):
        self.build()
        old_index = self.document('.well-known/agent-skills/index.json')
        self.site['agents']['mcp']['description'] = 'Updated public catalogue description; no file inputs.'
        self.build()
        self.assertEqual(self.document('.well-known/agent-skills/index.json'), old_index)
        ard = self.document('.well-known/ard.json')['entries']
        self.assertEqual(self.document('.well-known/ai-catalog.json')['entries'], ard)
        self.assertEqual(ard[1]['description'], self.site['agents']['mcp']['description'])

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

    def test_mcp_card_requires_the_canonical_production_subdomain_and_path(self):
        for url in (None, 'http://mcp.example.com/mcp/server-card',
                    'https://mcp-dev.example.com/mcp/server-card',
                    'https://mcp.example.com.attacker.example/mcp/server-card',
                    'https://user@mcp.example.com/mcp/server-card',
                    'https://mcp.example.com:443/mcp/server-card',
                    'https://mcp.example.com/mcp',
                    'https://mcp.example.com/mcp/server-card/',
                    'https://mcp.example.com/mcp/../mcp/server-card',
                    'https://mcp.example.com/mcp/server-card?version=1',
                    'https://mcp.example.com/mcp/server-card#view',
                    'https://mcp.example.com/mcp/server-card\n',
                    'https://127.0.0.1/mcp/server-card'):
            with self.subTest(url=url):
                self.site['agents']['mcp']['server_card'] = url
                with self.assertRaisesRegex(ConfigError, 'agents.mcp.server_card'):
                    self.build()
                self.assertEqual(list(self.out.iterdir()), [])

    def test_mcp_discovery_rejects_nonpublic_or_noncanonical_site_hosts(self):
        for domain in ('https://127.0.0.1/', 'https://example.local/',
                       'https://example.test/', 'https://example.com:443/',
                       'https://EXAMPLE.com/', 'https://example..com/'):
            with self.subTest(domain=domain):
                self.site['domain'] = domain
                with self.assertRaisesRegex(ConfigError, 'canonical public HTTPS site domain'):
                    self.build()
                self.assertEqual(list(self.out.iterdir()), [])

    def test_invalid_mcp_metadata_stops_before_publishing_discovery(self):
        original = copy.deepcopy(self.site)
        for key, value in [('display_name', ''), ('description', 'a' * 1025),
                           ('description', 'First line\nsecond line'),
                           ('representative_queries', ['Only one query.'])]:
            with self.subTest(key=key):
                self.site = copy.deepcopy(original)
                self.site['agents']['mcp'][key] = value
                with self.assertRaisesRegex(ConfigError, 'agents.mcp'):
                    self.build()
                self.assertEqual(list(self.out.iterdir()), [])


if __name__ == '__main__':
    unittest.main()
