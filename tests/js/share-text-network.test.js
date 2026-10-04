/**
 * A local connection must not inherit a relay or accept one hidden in SDP.
 * These are the boundaries a copied share link and an untrusted peer cross.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  allowedCandidate, isLocalLink, localDescription, makeShareUrl, rtcConfig,
} from '../../tools/share-text/src/network.js';

const host = 'candidate:1 1 udp 2122260223 192.168.1.7 50000 typ host generation 0';
const relay = 'candidate:2 1 udp 1677734911 203.0.113.7 50001 typ relay raddr 192.168.1.7 rport 50000';
const mapped = 'candidate:3 1 udp 1686052607 203.0.113.8 50002 typ srflx raddr 192.168.1.7 rport 50000';

test('a local attempt has no STUN or TURN even when an old relay was supplied', () => {
  const turn = { urls: 'turn:relay.example', username: 'reader', credential: 'secret' };
  assert.deepEqual(rtcConfig(true), { iceServers: [] });
  assert.deepEqual(rtcConfig(true, turn), { iceServers: [] });
  assert.deepEqual(rtcConfig(false, turn).iceServers, [
    { urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }, turn,
  ]);
  assert.equal(rtcConfig(false).iceServers.length, 1);
  const first = rtcConfig(false);
  first.iceServers[0].urls.push('turn:unwanted.example');
  assert.equal(rtcConfig(false).iceServers[0].urls.length, 2);
});

test('copied links carry the connection choice without losing other parameters', () => {
  const base = 'https://abox.tools/share-text/?theme=dark&local=0&lang=de#old';
  assert.equal(makeShareUrl(base, 'brave-otter-42', true),
    'https://abox.tools/share-text/?theme=dark&local=1&lang=de#brave-otter-42');
  assert.equal(makeShareUrl(base, 'brave-otter-42', false),
    'https://abox.tools/share-text/?theme=dark&lang=de#brave-otter-42');
  assert.equal(makeShareUrl('http://localhost:8123/de/share-text/?local=1&local=0', 'room', true),
    'http://localhost:8123/de/share-text/?local=1#room');
});

test('only one exact local=1 parameter opts a link into the local choice', () => {
  assert.equal(isLocalLink('https://abox.tools/share-text/?local=1#room'), true);
  for (const query of ['', '?local=0', '?local=true', '?local=01', '?local=1%20', '?local=1&local=0', '?Local=1']) {
    assert.equal(isLocalLink(`https://abox.tools/share-text/${query}#room`), false, query);
  }
  assert.equal(isLocalLink('not a URL'), false);
});

test('host candidates accept IPv4, IPv6, mDNS and TCP without relying on a type property', () => {
  const candidates = [
    host,
    'candidate:4 1 udp 2122260223 2001:db8::7 50000 typ host generation 0',
    'candidate:5 1 udp 2122260223 10a3580e-98c5-43d8-a596-39328bdba901.local 50000 typ host generation 0',
    'candidate:6 1 tcp 1518280447 192.168.1.7 9 typ host tcptype active generation 0',
  ];
  for (const candidate of candidates) assert.equal(allowedCandidate({ candidate, type: 'relay' }, true), true);
  assert.equal(allowedCandidate({ candidate: relay, type: 'host' }, true), false);
  assert.equal(allowedCandidate({ candidate: mapped, type: 'host' }, true), false);
  assert.equal(allowedCandidate({ candidate: mapped.replace('srflx', 'prflx') }, true), false);
  assert.equal(allowedCandidate(null, true), true);
  assert.equal(allowedCandidate({ candidate: '' }, true), true);
  assert.equal(allowedCandidate({ candidate: relay }, false), true);
});

test('a malformed candidate cannot pass the local filter', () => {
  const candidates = [
    {}, { type: 'host' }, { candidate: null },
    { candidate: 'host' },
    { candidate: host.replace(' 1 udp ', ' x udp ') },
    { candidate: host.replace(' 50000 typ ', ' 70000 typ ') },
    { candidate: host.replace(' udp ', ' sctp ') },
    { candidate: host.replace('2122260223', '4294967296') },
    { candidate: `${host} typ relay` },
    { candidate: `${host} orphan` },
    { candidate: `${host}\r\n${relay}` },
  ];
  for (const candidate of candidates) assert.equal(allowedCandidate(candidate, true), false);
});

test('a remote description cannot smuggle mapped or relayed candidates past trickle filtering', () => {
  const before = ['v=0', 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
    `a=${host}`, `a=${mapped}`, `a=${relay}`, 'a=end-of-candidates', ''].join('\r\n');
  const after = ['v=0', 'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
    `a=${host}`, 'a=end-of-candidates', ''].join('\r\n');
  const description = { type: 'offer', sdp: before };
  assert.deepEqual(localDescription(description), { type: 'offer', sdp: after });
  assert.equal(description.sdp, before);
  assert.equal(localDescription(before), after);
});

test('host SDP keeps ordinary extensions and drops redundant related addresses', () => {
  const candidate = `${host} raddr 203.0.113.7 rport 50001 network-id 1 network-cost 10`;
  assert.equal(localDescription(`v=0\na=${candidate}\na=candidate:malformed\na=end-of-candidates\n`),
    `v=0\na=${host} network-id 1 network-cost 10\na=end-of-candidates\n`);
  assert.equal(localDescription(`a=${relay}`), '');
});
