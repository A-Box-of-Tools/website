/**
 * workers/shared/address.js - what counts as one network when spending a budget.
 * Three separately deployed Workers bundle it, so its cases live with none of them.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ipv6Network, requestNetwork } from '../../workers/shared/address.js';

const request = (headers) => new Request('https://worker.example/', { headers });
const key = (address, fallback) => requestNetwork(request(address === null ? {} : { 'CF-Connecting-IP': address }), fallback);

test('every address in an IPv6 /64 spends the same budget', () => {
  const same = key('2606:4700:4700:ab::1111');
  assert.equal(same, '2606:4700:4700:ab::/64');
  for (const address of ['2606:4700:4700:ab::1', '2606:4700:4700:AB:9876:5432:abcd:ef01',
    '2606:4700:4700:00ab:0000:0000:0000:2222']) assert.equal(key(address), same, address);
  assert.notEqual(key('2606:4700:4700:ac::1111'), same);
  assert.equal(key('2606:4700::1'), '2606:4700:0:0::/64');
});

test('IPv4 keeps its whole address, unchanged', () => {
  for (const address of ['203.0.113.7', '192.0.2.1', '8.8.8.8']) assert.equal(key(address), address);
  assert.notEqual(key('8.8.8.8'), key('8.8.8.9'));
});

test('an embedded IPv4 form is not merged with every other one by its zero prefix', () => {
  assert.notEqual(key('::ffff:192.0.2.1'), key('::ffff:192.0.2.2'));
  assert.notEqual(key('::1'), key('::2'));
});

test('pseudo IPv4 counts the real address it stands in for, and only its marker unlocks that', () => {
  const pseudo = (marker, real) => requestNetwork(request({ 'CF-Connecting-IP': marker, 'CF-Connecting-IPv6': real }));
  assert.equal(pseudo('240.12.34.56', '2606:4700:4700:ab::1'), '2606:4700:4700:ab::/64');
  assert.equal(pseudo('255.1.2.3', '2606:4700:4700:ab::2'), '2606:4700:4700:ab::/64');
  assert.equal(pseudo('192.0.2.1', '2606:4700:4700:ab::1'), '192.0.2.1', 'an ordinary source cannot choose whose budget to spend');
  assert.equal(pseudo('240.12.34.56', 'not an address'), '240.12.34.56', 'something is still counted');
});

test('a rate limit always gets a key, whatever arrives', () => {
  assert.equal(key(null), '');
  assert.equal(key(null, 'unknown'), 'unknown');
  assert.equal(key('', 'local'), 'local');
  assert.equal(key('not-an-ip'), 'not-an-ip');
  assert.equal(key('1:2:3'), '1:2:3');
  assert.equal(key('2606:4700::1%eth0'), '2606:4700::1%eth0');
});

test('masking expands the compressed form rather than dividing one network by device', () => {
  assert.equal(ipv6Network('2001:db8::'), '2001:db8:0:0::/64');
  assert.equal(ipv6Network('2001:db8:1:2:3:4:5:6'), '2001:db8:1:2::/64');
  assert.equal(ipv6Network('2001:db8:1:2::'), '2001:db8:1:2::/64');
});
