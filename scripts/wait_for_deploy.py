#!/usr/bin/env python3
"""Wait for every rebuilt app to agree with one immutable dist commit.

Cloudflare rewrites email links in HTML. Compare the generated page marker and
exact worker digest from the pinned receipt, rather than whole HTML bytes or
an HTTP 200 from a previous deployment. This code runs only in deployment CI.
"""

import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
from email.utils import parsedate_to_datetime
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import time
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


ORIGIN = 'https://abox.tools/'


class FetchFailure(RuntimeError):
    """A refused request, or a transient request that exhausted its budget."""


def worker_version(page):
    found = re.search(rb'data-offline-version="([0-9a-f]{10})"', page)
    if not found:
        raise ValueError('The page has no offline generation.')
    return found.group(1).decode('ascii')


def retry_delay(error, attempt, now):
    """None means a fatal HTTP refusal; other results are minimum waits."""
    if not isinstance(error, HTTPError):
        return min(2 ** attempt, 20)
    limited = error.code == 403 and (
        error.headers.get('X-RateLimit-Remaining') == '0'
        or error.headers.get('Retry-After') is not None
        or b'rate limit' in error.read(4096).lower())
    if not (error.code == 429 or 500 <= error.code <= 599 or limited):
        return None
    delays = [60 if limited and not error.headers.get('Retry-After')
              and error.headers.get('X-RateLimit-Remaining') != '0'
              else min(2 ** attempt, 20)]
    after = error.headers.get('Retry-After')
    if after:
        try:
            delays.append(float(after))
        except ValueError:
            try:
                delays.append(parsedate_to_datetime(after).timestamp() - now)
            except (TypeError, ValueError, OverflowError):
                pass
    if error.headers.get('X-RateLimit-Remaining') == '0':
        try:
            delays.append(float(error.headers.get('X-RateLimit-Reset', '0')) - now)
        except ValueError:
            pass
    return max(delays)


def get(url, token=None, *, deadline):
    headers = {'User-Agent': 'abox-deployment-check', 'Cache-Control': 'no-cache'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
        headers['Accept'] = 'application/vnd.github+json'
    for attempt in range(5):
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            raise FetchFailure(f'Deployment deadline reached before {url}')
        try:
            with urlopen(Request(url, headers=headers), timeout=min(20, remaining)) as response:
                return response.read()
        except (HTTPError, URLError, OSError) as error:
            delay = retry_delay(error, attempt, time.time())
            if isinstance(error, HTTPError):
                error.close()
            status = f'HTTP {error.code}' if isinstance(error, HTTPError) else type(error).__name__
            if delay is None:
                raise FetchFailure(f'{status} from {url}; this refusal is not retryable.') from error
            if attempt == 4 or delay >= deadline - time.monotonic():
                raise FetchFailure(f'{status} from {url}; retry budget exhausted (next wait {delay:.0f}s).') from error
            print(f'Retrying {url} after {status}; waiting {delay:.0f}s.', flush=True)
            time.sleep(delay)


def manifest_scopes(data):
    scopes = data.get('scopes')
    if data.get('format') != 1 or not isinstance(scopes, dict) or '/' not in scopes:
        raise ValueError('The dist offline receipt is missing or unsupported.')
    for scope, entry in scopes.items():
        if (not re.fullmatch(r'/(?:[A-Za-z0-9_-]+/)*', scope)
                or not isinstance(entry, dict)
                or not re.fullmatch(r'[0-9a-f]{10}', entry.get('version', ''))
                or not re.fullmatch(r'[0-9a-f]{64}', entry.get('worker_sha256', ''))):
            raise ValueError(f'Invalid offline receipt entry: {scope}')
    return scopes


def scope_readiness(entry, page, worker):
    try:
        if worker_version(page) != entry['version']:
            return 'HTML belongs to a different generation'
    except ValueError:
        return 'HTML has no offline generation'
    if hashlib.sha256(worker).hexdigest() != entry['worker_sha256']:
        return 'versioned worker bytes differ from dist'
    return None


def verify_scope(scope, entry, fetch):
    try:
        page = fetch(ORIGIN + scope.lstrip('/'))
        # Do not fetch an entire worker when its page already proves staleness.
        if worker_version(page) != entry['version']:
            return scope, 'HTML belongs to a different generation'
        worker = fetch(f'{ORIGIN}{scope.lstrip("/")}sw.js?v={entry["version"]}')
        return scope, scope_readiness(entry, page, worker)
    except (FetchFailure, ValueError) as error:
        return scope, str(error)


def output(values):
    path = Path(os.environ['GITHUB_OUTPUT'])
    with path.open('ab') as stream:
        stream.write(''.join(f'{key}={value}\n' for key, value in values.items()).encode('utf-8'))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repository', required=True)
    parser.add_argument('--dist')
    parser.add_argument('--receipt', action='store_true')
    parser.add_argument('--source', default='')
    parser.add_argument('--deadline', type=float)
    args = parser.parse_args()
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', args.repository):
        parser.error('Invalid repository name.')
    if (not args.receipt and not re.fullmatch(r'[0-9a-f]{40}', args.dist or '')):
        parser.error('The dist revision must be a full commit SHA.')
    if args.source and not re.fullmatch(r'[0-9a-f]{40}', args.source):
        parser.error('The source revision must be a full commit SHA.')
    end = args.deadline if args.deadline is not None else time.time() + 600
    deadline = time.monotonic() + max(0, end - time.time())
    token = os.environ.get('GH_TOKEN')
    api = f'https://api.github.com/repos/{args.repository}'

    def github(path):
        return json.loads(get(api + path, token, deadline=deadline))

    if args.receipt:
        dist = github('/commits/dist')
        match = re.match(r'Build ([0-9a-f]{7,40}):', dist['commit']['message'])
        if not match:
            raise ValueError('The dist commit does not identify its source revision.')
        source = github(f'/commits/{match[1]}')['sha']
        if args.source and source != args.source:
            output({'deployed': 'false'})
            print('This build did not publish the current dist revision; QA is not dispatched.')
        else:
            output({'deployed': 'true', 'dist': dist['sha'], 'source': source, 'deadline': end})
            print(f'Checking dist {dist["sha"]} from source {source}.')
        return 0

    data = github(f'/contents/offline-generations.json?ref={args.dist}')
    if data.get('encoding') != 'base64':
        raise ValueError('GitHub did not return the offline receipt as base64.')
    scopes = manifest_scopes(json.loads(base64.b64decode(data['content'])))
    pending = dict(scopes)
    while time.monotonic() < deadline:
        # A newer release cannot silently turn this into a test of other bytes.
        if github('/commits/dist')['sha'] != args.dist:
            raise RuntimeError('Another deployment superseded the dist revision being checked.')
        pages = github('/pages/builds/latest')
        if pages.get('status') == 'built' and pages.get('commit') == args.dist:
            with ThreadPoolExecutor(max_workers=8) as pool:
                checks = list(pool.map(lambda pair: verify_scope(*pair,
                    lambda url: get(url, deadline=deadline)), list(pending.items())))
            for scope, reason in checks:
                if reason is None:
                    pending.pop(scope)
            failures = [(scope, reason) for scope, reason in checks if reason is not None]
            print(f'{len(scopes) - len(pending)}/{len(scopes)} app generations verified.', flush=True)
            for scope, reason in failures[:8]:
                print(f'  {scope}: {reason}', flush=True)
            if len(failures) > 8:
                print(f'  ... and {len(failures) - 8} more outstanding scopes.', flush=True)
            if not pending:
                if github('/commits/dist')['sha'] != args.dist:
                    raise RuntimeError('Another deployment superseded the verified dist revision.')
                print(f'Pages and all {len(scopes)} rebuilt apps match dist {args.dist}.')
                return 0
        else:
            print(f'Waiting for Pages to complete dist {args.dist}.', flush=True)
        remaining = deadline - time.monotonic()
        if remaining > 0:
            time.sleep(min(10, remaining))
    raise RuntimeError(f'Deployment deadline reached with {len(pending)} unverified scopes: '
                       + ', '.join(sorted(pending)[:8]))


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (FetchFailure, ValueError, RuntimeError) as error:
        print(f'::error::{error}', file=sys.stderr)
        raise SystemExit(1)
