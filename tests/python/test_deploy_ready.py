"""The receipt covers a bundle; transient HTTP failure never becomes readiness."""
import hashlib
import importlib.util
import io
from pathlib import Path
import time
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError

spec = importlib.util.spec_from_file_location('wait_for_deploy',
    Path(__file__).resolve().parents[2] / 'scripts' / 'wait_for_deploy.py')
deploy = importlib.util.module_from_spec(spec)
spec.loader.exec_module(deploy)

PAGE = b'<html data-offline-version="0123456789">page</html>'
OLD_PAGE = b'<html data-offline-version="9876543210">old</html>'
WORKER = b'worker bytes'
ENTRY = {'version': '0123456789', 'worker_sha256': hashlib.sha256(WORKER).hexdigest()}
URL = 'https://api.github.com/repos/A-Box-of-Tools/website/commits/dist'


def refused(code, headers=None, body=b''):
    return HTTPError(URL, code, 'refused', headers or {}, io.BytesIO(body))


class DeploymentReadiness(unittest.TestCase):
    def test_fresh_html_and_an_old_worker_are_not_ready(self):
        self.assertIsNotNone(deploy.scope_readiness(ENTRY, PAGE, b'old worker'))

    def test_http_success_for_old_or_legacy_html_is_not_ready(self):
        for page in [OLD_PAGE, b'<html>legacy</html>']:
            self.assertIsNotNone(deploy.scope_readiness(ENTRY, page, WORKER))

    def test_matching_generation_and_worker_are_ready_despite_email_rewriting(self):
        live = PAGE.replace(b'page', b'page<script src="/cdn-cgi/email-decode.js"></script>')
        self.assertIsNone(deploy.scope_readiness(ENTRY, live, WORKER))

    def test_a_tool_only_deploy_cannot_hide_behind_an_unchanged_hub(self):
        scopes = deploy.manifest_scopes({'format': 1, 'scopes': {'/': ENTRY, '/base64/': ENTRY}})
        def fetch(url):
            if url == 'https://abox.tools/base64/':
                return OLD_PAGE
            return WORKER if 'sw.js?' in url else PAGE
        results = dict(deploy.verify_scope(scope, entry, fetch) for scope, entry in scopes.items())
        self.assertIsNone(results['/'])
        self.assertIsNotNone(results['/base64/'])

    def test_missing_or_unsafe_receipt_entries_are_refused(self):
        for data in [{}, {'format': 1, 'scopes': {}},
                     {'format': 1, 'scopes': {'/': ENTRY, '//elsewhere/': ENTRY}},
                     {'format': 1, 'scopes': {'/': {'version': 'wrong'}}}]:
            with self.assertRaises(ValueError):
                deploy.manifest_scopes(data)

    def test_a_stale_page_does_not_fetch_its_worker_needlessly(self):
        calls = []
        def fetch(url):
            calls.append(url)
            return OLD_PAGE
        self.assertIsNotNone(deploy.verify_scope('/base64/', ENTRY, fetch)[1])
        self.assertEqual(calls, ['https://abox.tools/base64/'])


class BoundedFetch(unittest.TestCase):
    def test_transport_and_server_errors_retry_before_returning_real_bytes(self):
        for error in [URLError('connection reset'), refused(503)]:
            with self.subTest(error=error), patch.object(deploy, 'urlopen', side_effect=[error, io.BytesIO(b'ok')]) as opened, \
                    patch.object(deploy.time, 'sleep') as sleep:
                self.assertEqual(deploy.get(URL, deadline=time.monotonic() + 30), b'ok')
                self.assertEqual(opened.call_count, 2)
                sleep.assert_called_once_with(1)

    def test_retry_after_and_rate_limit_reset_are_honoured(self):
        cases = [(refused(429, {'Retry-After': '5'}), 5),
                 (refused(429, {'Retry-After': 'Thu, 01 Jan 1970 00:01:45 GMT'}), 5),
                 (refused(403, {'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '107'}), 7),
                 (refused(403, body=b'{"message":"You have exceeded a secondary rate limit"}'), 60)]
        for error, delay in cases:
            with self.subTest(code=error.code), patch.object(deploy, 'urlopen', side_effect=[error, io.BytesIO(b'ok')]), \
                    patch.object(deploy.time, 'time', return_value=100), patch.object(deploy.time, 'sleep') as sleep:
                self.assertEqual(deploy.get(URL, deadline=time.monotonic() + 90), b'ok')
                sleep.assert_called_once_with(delay)

    def test_permission_and_missing_resource_errors_fail_clearly_without_retry(self):
        for code in [401, 403, 404]:
            with self.subTest(code=code), patch.object(deploy, 'urlopen', side_effect=refused(code)) as opened, \
                    patch.object(deploy.time, 'sleep') as sleep:
                with self.assertRaisesRegex(deploy.FetchFailure, f'HTTP {code}.*not retryable'):
                    deploy.get(URL, deadline=time.monotonic() + 30)
                self.assertEqual(opened.call_count, 1)
                sleep.assert_not_called()

    def test_a_retry_cannot_sleep_beyond_the_shared_deployment_deadline(self):
        with patch.object(deploy, 'urlopen', side_effect=refused(429, {'Retry-After': '3600'})), \
                patch.object(deploy.time, 'sleep') as sleep:
            with self.assertRaisesRegex(deploy.FetchFailure, 'retry budget exhausted'):
                deploy.get(URL, deadline=time.monotonic() + 30)
            sleep.assert_not_called()

    def test_repeated_transport_failures_have_a_finite_attempt_count(self):
        with patch.object(deploy, 'urlopen', side_effect=URLError('reset')) as opened, \
                patch.object(deploy.time, 'sleep'):
            with self.assertRaisesRegex(deploy.FetchFailure, 'retry budget exhausted'):
                deploy.get(URL, deadline=time.monotonic() + 90)
            self.assertEqual(opened.call_count, 5)
