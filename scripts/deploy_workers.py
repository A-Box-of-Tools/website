"""
Deploy the production Workers that a release changes, or say which it would.

    python scripts/deploy_workers.py plan   [--site-dir _plain] [--version 2.2.0] [--only NAME]
    python scripts/deploy_workers.py deploy [--site-dir _plain] [--version 2.2.0] [--only NAME]

A push to `main` runs `deploy` before the pages are published, and the pull
request from `dev` to `main` runs `plan`, so a release cannot reach visitors
without the Workers its pages were tested against. Both need the site built
into `--site-dir` first, because the catalogue Worker carries that build, and
the pinned Wrangler installed with `npm ci` in `workers/catalogue-mcp`.

WHY THIS EXISTS

The three Workers under `workers/` used to be deployed by hand, and nothing
tied that to a release. Pull request previews and the release's own QA run
talk to `rendezvous-dev`, which is deployed while a change is being tried, so
a release could pass every check against Worker code that production did not
have. 2.1.0 went out on 11 November that way: production's rendezvous stayed
on its 21 October deploy for twelve days more, and the feedback and catalogue
Workers were a release behind as well. Visitors found it in Share Text, whose
local shares stopped being listed. Nothing failed, because nothing compared
what production ran with what the release expected.

WHAT "CHANGED" MEANS

A Worker's identity is a SHA-256 over what `wrangler deploy --dry-run` writes
for its production configuration, together with that configuration as parsed.
Two things in the output are left out: the README, which carries the time it
was written, and the source maps, which are not uploaded. The configuration is
compared as parsed, so a comment in `wrangler.toml` is not a deploy, and only
the production section counts, so `env.dev` is not one either.

A deploy writes the first twelve digits of that identity into the
deployment's message, and the next release reads them back. A deployment whose
message names no identity - one made by hand, without this script - counts as
different. An unknown therefore costs one redeploy and never skips one.

The catalogue Worker differs on every release. Its bundle holds the tool
catalogue from the site build and the commit it was built from, which is how
the MCP server keeps listing the tools that are live.

WHY BEFORE THE PAGES

A Worker change is written to accept the pages already published. A page that
needs something new from a Worker, such as a tool on the rendezvous allowlist,
is broken from the moment it is published until the Worker follows. So a
failed deploy stops the release before anything is published, and a rerun skips
every Worker that already went out.

Deploying rendezvous restarts its Durable Objects. Open shares reconnect in
about five seconds, and discovery lists recover within thirty. A release that
leaves rendezvous's identity alone does not touch it.

THE CREDENTIAL

In CI this is the repository's `CLOUDFLARE_API_TOKEN`, the same token that
uploads the Pages previews. It therefore needs Workers permissions as well,
which docs/deploying.md lists. On a person's machine Wrangler's own login is
used, and
`deploy` refuses a checkout whose Worker sources have uncommitted changes: the
message would name a commit that is not what was uploaded.
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import tomllib
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# The catalogue service pins Wrangler with a lockfile, and the feedback
# Worker's instructions already used that copy, so every Worker is bundled and
# deployed by one Wrangler version whose output does not drift between runs.
WRANGLER = ROOT / 'workers' / 'catalogue-mcp' / 'node_modules' / 'wrangler' / 'bin' / 'wrangler.js'

IDENTITY = re.compile(r'\bworker ([0-9a-f]{12})\b')


@dataclass(frozen=True)
class Worker:
    name: str
    folder: str
    config: str
    # '' selects the top level of a file that also defines other environments;
    # None passes no --env at all, for a file that defines only one.
    environment: str | None = None
    # Built from the site before it is bundled.
    catalogue: bool = False


WORKERS = (
    Worker('rendezvous', 'workers/rendezvous', 'wrangler.toml', environment=''),
    Worker('abox-feedback', 'workers/feedback', 'wrangler.toml'),
    Worker('catalogue-mcp', 'workers/catalogue-mcp', 'wrangler.production.toml', catalogue=True),
)


def production_config(text, environment):
    config = tomllib.loads(text)
    if environment:
        return config['env'][environment]
    config.pop('env', None)
    return config


def identity(bundle, config_text, environment=None):
    """Twelve hex digits naming what a deploy of this bundle would upload."""
    digest = hashlib.sha256()
    config = production_config(config_text, environment)
    digest.update(json.dumps(config, sort_keys=True, separators=(',', ':'), default=str).encode())
    for path in sorted(p for p in Path(bundle).rglob('*') if p.is_file()):
        relative = path.relative_to(bundle).as_posix()
        if relative == 'README.md' or relative.endswith('.map'):
            continue
        digest.update(b'\0' + relative.encode() + b'\0')
        digest.update(path.read_bytes())
    return digest.hexdigest()[:12]


def message(worker_identity, revision, version=None):
    words = [f'website {version}'] if version else []
    words += [f'at {revision[:10]}', f'worker {worker_identity}']
    return ' '.join(words)


def deployed_identity(listing):
    """The identity the latest deployment names, or None, and its message."""
    start = listing.find('[')
    if start < 0:
        raise ValueError('Wrangler listed no deployments')
    deployments = json.loads(listing[start:])
    if not deployments:
        return None, ''
    latest = max(deployments, key=lambda deployment: deployment.get('created_on', ''))
    text = (latest.get('annotations') or {}).get('workers/message') or ''
    match = IDENTITY.search(text)
    return (match.group(1) if match else None), text


def wrangler_options(worker):
    options = ['--config', worker.config]
    if worker.environment is not None:
        options.append(f'--env={worker.environment}')
    return options


def run(command, cwd, capture=False):
    result = subprocess.run([str(part) for part in command], cwd=cwd, text=True,
                            encoding='utf-8', errors='replace', capture_output=capture)
    if result.returncode != 0:
        detail = ''
        if capture:
            lines = (result.stderr.strip() or result.stdout.strip()).splitlines()
            detail = '\n' + '\n'.join(lines[-8:])
        raise SystemExit(f'{" ".join(str(part) for part in command[:4])} ... failed in {cwd}{detail}')
    return result.stdout


def bundle(worker, out, site_dir, revision, version):
    folder = ROOT / worker.folder
    if worker.catalogue:
        prepare = [sys.executable, 'prepare.py', '--site-dir', site_dir]
        if version:
            prepare += ['--revision', revision, '--tag', version, '--clean-source']
        run(prepare, folder, capture=True)
        run(['node', 'scripts/build.mjs'], folder, capture=True)
    run(['node', WRANGLER, 'deploy', '--dry-run', '--outdir', out, *wrangler_options(worker)],
        folder, capture=True)


def production_identity(worker):
    try:
        listing = run(['node', WRANGLER, 'deployments', 'list', '--name', worker.name, '--json',
                       *wrangler_options(worker)], ROOT / worker.folder, capture=True)
    except SystemExit as failure:
        # The first thing a Pages-only token is refused, so say what it lacks
        # rather than leave the reader with Wrangler's error code alone.
        raise SystemExit(f'{failure}\nCould not read the deployments of {worker.name}. If that is an '
                         'authentication error, the token lacks Workers Scripts permission on the '
                         'account: see docs/deploying.md, "The Workers".') from None
    return deployed_identity(listing)


def uncommitted(paths):
    return subprocess.run(['git', 'status', '--porcelain', '--untracked-files=no', '--', *paths],
                          cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()


def report(lines):
    for line in lines:
        print(line)
    summary = os.environ.get('GITHUB_STEP_SUMMARY')
    if summary:
        with open(summary, 'a', encoding='utf-8') as handle:
            handle.write('### Workers\n\n' + ''.join(f'- {line}\n' for line in lines) + '\n')


def main(argv=None):
    parser = argparse.ArgumentParser(description='Deploy the production Workers a release changes.')
    parser.add_argument('command', choices=('plan', 'deploy'))
    parser.add_argument('--site-dir', type=Path, default=ROOT / '_plain',
                        help='a readable build of this checkout, for the catalogue Worker')
    parser.add_argument('--version', help='the release being deployed, for the catalogue and the message')
    parser.add_argument('--only', action='append', choices=[worker.name for worker in WORKERS],
                        help='consider only this Worker; may be repeated')
    args = parser.parse_args(argv)
    selected = [worker for worker in WORKERS if not args.only or worker.name in args.only]

    if os.environ.get('GITHUB_ACTIONS') == 'true' and not os.environ.get('CLOUDFLARE_API_TOKEN'):
        raise SystemExit('No CLOUDFLARE_API_TOKEN secret, so this release could not deploy its '
                         'Workers. docs/deploying.md, "The Workers", says what the token needs.')
    if not WRANGLER.exists():
        raise SystemExit('The pinned Wrangler is missing: run `npm ci` in workers/catalogue-mcp.')
    site_dir = args.site_dir.resolve()
    if any(worker.catalogue for worker in selected) and not (site_dir / 'index.html').exists():
        raise SystemExit(f'{site_dir} holds no site: build it first with '
                         '`python build.py --out _plain --clean --no-minify`.')
    if args.command == 'deploy':
        changes = uncommitted(['workers', 'shared'])
        if changes:
            raise SystemExit('The Worker sources have uncommitted changes, and a deployment message '
                             'names a commit:\n' + changes)

    revision = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, capture_output=True,
                              text=True, check=True).stdout.strip()
    lines = []
    for worker in selected:
        with tempfile.TemporaryDirectory() as out:
            bundle(worker, out, site_dir, revision, args.version)
            config_text = (ROOT / worker.folder / worker.config).read_text(encoding='utf-8')
            ours = identity(Path(out), config_text, worker.environment)
        theirs, text = production_identity(worker)
        if theirs == ours:
            lines.append(f'`{worker.name}` unchanged: production runs worker {ours}.')
            continue
        was = (f'production runs worker {theirs}' if theirs
               else f'production\'s deployment names no worker identity ("{text}")')
        if args.command == 'plan':
            lines.append(f'`{worker.name}` deploys worker {ours}; {was}.')
            continue
        run(['node', WRANGLER, 'deploy', '--message', message(ours, revision, args.version),
             *wrangler_options(worker)], ROOT / worker.folder)
        now, _ = production_identity(worker)
        if now != ours:
            raise SystemExit(f'{worker.name} was deployed, but production now names worker {now}, not {ours}.')
        lines.append(f'`{worker.name}` deployed worker {ours}; {was}.')
    report(lines)


if __name__ == '__main__':
    main()
