"""
Which Workers a release deploys, and that it deploys them before the pages.

scripts/deploy_workers.py exists because 2.1.0 shipped pages tested against
`rendezvous-dev` while production's rendezvous stayed on a deploy from twelve
days earlier, and Share Text's local shares went unlisted. What is tested here
is the part that decides: what counts as a Worker having changed, how the
answer is written into a deployment and read back, and where the workflow
calls it. Wrangler and Cloudflare are not reached; the script's own `plan`
against the real account is what the release pull request runs.
"""

import importlib.util
import json
import sys
import tempfile
import tomllib
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def load_script():
    """scripts/deploy_workers.py, imported by path - it is not in a package."""
    spec = importlib.util.spec_from_file_location(
        'deploy_workers', ROOT / 'scripts' / 'deploy_workers.py')
    module = importlib.util.module_from_spec(spec)
    # A dataclass looks its module up while it is being defined.
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


workers = load_script()

CONFIG = '''# a comment
name = "rendezvous"
main = "worker.js"

[vars]
LIMIT = "10"

[env.dev]
name = "rendezvous-dev"
'''


def bundle_with(files):
    folder = Path(tempfile.mkdtemp())
    for name, data in files.items():
        path = folder / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
    return folder


class TheIdentity(unittest.TestCase):
    def test_it_changes_with_the_code_that_is_uploaded(self):
        one = workers.identity(bundle_with({'worker.js': b'a'}), CONFIG, '')
        two = workers.identity(bundle_with({'worker.js': b'b'}), CONFIG, '')
        self.assertRegex(one, r'^[0-9a-f]{12}$')
        self.assertNotEqual(one, two)

    def test_it_ignores_what_a_dry_run_writes_but_nobody_uploads(self):
        # The README carries the time it was written and a map names the
        # output folder; either would make every release a deploy.
        plain = workers.identity(bundle_with({'worker.js': b'a'}), CONFIG, '')
        noisy = workers.identity(bundle_with({
            'worker.js': b'a', 'README.md': b'generated at 12:00', 'worker.js.map': b'{"sources":["/tmp/x"]}',
        }), CONFIG, '')
        self.assertEqual(plain, noisy)

    def test_a_module_beside_the_entry_counts(self):
        alone = workers.identity(bundle_with({'worker.js': b'a'}), CONFIG, '')
        beside = workers.identity(bundle_with({'worker.js': b'a', 'form.html': b'<form>'}), CONFIG, '')
        self.assertNotEqual(alone, beside)

    def test_comments_and_other_environments_are_not_a_deploy(self):
        bundle = bundle_with({'worker.js': b'a'})
        quieter = CONFIG.replace('# a comment\n', '').replace('rendezvous-dev', 'elsewhere')
        self.assertEqual(workers.identity(bundle, CONFIG, ''), workers.identity(bundle, quieter, ''))

    def test_a_production_setting_is(self):
        bundle = bundle_with({'worker.js': b'a'})
        changed = CONFIG.replace('LIMIT = "10"', 'LIMIT = "12"')
        self.assertNotEqual(workers.identity(bundle, CONFIG, ''), workers.identity(bundle, changed, ''))


class TheRecord(unittest.TestCase):
    def listing(self, *deployments):
        return json.dumps([{'created_on': when, 'annotations': {'workers/message': text}}
                           for when, text in deployments])

    def test_a_deploy_message_reads_back_as_its_identity(self):
        text = workers.message('0123456789ab', '4565b92a06d61ea2e15d5dab3777ccee8fcf164f', '2.2.0')
        self.assertEqual(text, 'website 2.2.0 at 4565b92a06 worker 0123456789ab')
        found, _ = workers.deployed_identity(self.listing(('2026-11-23T17:00:00Z', text)))
        self.assertEqual(found, '0123456789ab')

    def test_the_latest_deployment_is_the_one_read(self):
        listing = self.listing(('2026-11-23T17:00:00Z', 'at 1 worker bbbbbbbbbbbb'),
                               ('2026-10-21T18:40:41Z', 'at 0 worker aaaaaaaaaaaa'))
        self.assertEqual(workers.deployed_identity(listing)[0], 'bbbbbbbbbbbb')

    def test_a_hand_deploy_names_nothing_and_so_is_deployed_again(self):
        listing = 'a warning Wrangler printed first\n' + self.listing(
            ('2026-11-23T16:54:46Z', 'website main 4565b92a06 (2.1.0)'))
        found, text = workers.deployed_identity(listing)
        self.assertIsNone(found)
        self.assertEqual(text, 'website main 4565b92a06 (2.1.0)')


class TheWorkers(unittest.TestCase):
    def test_each_entry_names_the_worker_its_configuration_deploys(self):
        # A name that drifted from its file would read one Worker's
        # deployments and deploy another.
        for worker in workers.WORKERS:
            with self.subTest(worker.name):
                text = (ROOT / worker.folder / worker.config).read_text(encoding='utf-8')
                config = workers.production_config(text, worker.environment)
                self.assertEqual(config['name'], worker.name)
                self.assertTrue((ROOT / worker.folder / config['main']).exists())

    def test_every_production_worker_is_listed(self):
        listed = {(worker.folder, worker.config) for worker in workers.WORKERS}
        for config in sorted(ROOT.glob('workers/*/wrangler*.toml')):
            folder = config.parent.relative_to(ROOT).as_posix()
            data = tomllib.loads(config.read_text(encoding='utf-8'))
            if data['name'].endswith('-dev'):
                continue
            with self.subTest(str(config.relative_to(ROOT))):
                self.assertIn((folder, config.name), listed)


class TheWorkflow(unittest.TestCase):
    """Read as text, as test_version.py reads it: there is no YAML parser here."""

    @classmethod
    def setUpClass(cls):
        cls.text = (ROOT / '.github' / 'workflows' / 'build.yml').read_text(encoding='utf-8')

    def step(self, name):
        start = self.text.index(f'- name: {name}')
        return self.text[start:].partition('\n      - ')[0]

    def test_the_workers_go_out_before_the_pages(self):
        deploy = self.text.index('python scripts/deploy_workers.py deploy')
        self.assertLess(deploy, self.text.index('- name: Publish to the dist branch'))
        self.assertLess(self.text.index('- name: Build (readable)'), deploy)

    def test_only_a_push_to_main_deploys_and_with_the_release_version(self):
        step = self.step('Deploy the Workers this release changes')
        self.assertIn("if: env.DEPLOYS == 'true'", step)
        self.assertIn('VERSION: ${{ steps.release.outputs.version }}', step)

    def test_the_workers_token_is_not_the_preview_token(self):
        for name in ('Deploy the Workers this release changes', 'Which Workers this release deploys'):
            with self.subTest(name):
                step = self.step(name)
                self.assertIn('CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_WORKERS_TOKEN }}', step)
        self.assertEqual(self.text.count('secrets.CLOUDFLARE_WORKERS_TOKEN'), 2)

    def test_the_release_pull_request_plans(self):
        job = self.text.partition('\n  workers:\n')[2]
        self.assertTrue(job, 'build.yml has no workers job')
        self.assertIn("if: github.event_name == 'pull_request' && github.base_ref == 'main'", job)
        self.assertIn('python scripts/deploy_workers.py plan', job)


if __name__ == '__main__':
    unittest.main()
