import test from 'node:test';
import assert from 'node:assert/strict';
import { rendezvousEndpoint } from '../../shared/js/peer-endpoint.js';

const PROD = 'wss://rendezvous.abox.tools';
const DEV = 'wss://rendezvous-dev.abox.tools';

test('local builds and this project HTTPS previews use the separate development service', () => {
  for (const href of ['http://localhost:8123/share-tab/', 'http://127.0.0.1:8123/share-text/',
    'https://localhost/remote-camera/', 'https://abox-preview.pages.dev/walkie-talkie/',
    'https://pr-123.abox-preview.pages.dev/voice-oncall/', 'https://PR-123.ABOX-PREVIEW.PAGES.DEV/share-tab/']) {
    assert.equal(rendezvousEndpoint(href), DEV, href);
  }
});

test('production, other sites and preview lookalikes cannot choose a development service', () => {
  for (const href of ['https://abox.tools/share-tab/', 'https://other.pages.dev/share-tab/',
    'http://pr-123.abox-preview.pages.dev/share-tab/', 'https://abox-preview.pages.dev.example.test/',
    'https://evilabox-preview.pages.dev/', 'https://localhost.example.test/', 'http://127.0.0.1.example.test/',
    'https://abox.tools/?rendezvous=wss://rendezvous-dev.abox.tools',
    'https://abox.tools/#https://pr-123.abox-preview.pages.dev/']) {
    assert.equal(rendezvousEndpoint(href), PROD, href);
  }
});

test('unknown or malformed page addresses default to production without a query override', () => {
  for (const href of ['', 'not a URL', '/share-tab/', 'https://', null, {}, 42]) assert.equal(rendezvousEndpoint(href), PROD);
  assert.equal(rendezvousEndpoint(), PROD);
  assert.equal(rendezvousEndpoint('http://localhost/?rendezvous=wss://rendezvous.abox.tools'), DEV);
});
