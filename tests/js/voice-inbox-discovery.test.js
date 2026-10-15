import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanShares } from '../../shared/js/peer-discovery.js';

const code = 'a'.repeat(64);

test('walkie discovery keeps only a bounded channel name and listener capability', () => {
  const valid = { code, local: true, name: 'Classroom', listenKey: 'B'.repeat(43) };
  assert.deepEqual(cleanShares([
    { ...valid, name: '', key: 'private' }, { ...valid, listenKey: 'short' },
    { ...valid, name: 'x'.repeat(81) }, { ...valid, name: '\u0000' },
    { ...valid, local: false }, { ...valid, code: 'room' },
    { ...valid, key: 'private', lease: 'private', locked: false }, valid,
  ], 'walkie-talkie'), [valid]);
});

test('voice inbox discovery preserves only bounded verified room metadata', () => {
  assert.deepEqual(cleanShares([{ code, local: true, name: '  Classroom  ', locked: true,
    passwordProof: 'private', key: 'private' }], 'voice-oncall'), [
    { code, local: true, name: 'Classroom', locked: true },
  ]);
});

test('voice inbox discovery rejects incomplete metadata rather than guessing a password policy', () => {
  const valid = { code, local: true, name: 'Classroom', locked: false };
  assert.deepEqual(cleanShares([
    { ...valid, code: 'short-code' }, { ...valid, locked: undefined },
    { ...valid, name: '' }, { ...valid, name: 'x'.repeat(81) },
    { ...valid, name: '\u0000' }, { ...valid, local: false }, valid, valid,
  ], 'voice-oncall'), [valid]);
});

test('the existing text and camera discovery contract does not acquire voice metadata', () => {
  const entry = { code: 'room-name', local: true, name: 'Ignored', locked: true };
  assert.deepEqual(cleanShares([entry]), [{ code: 'room-name', local: true }]);
  assert.deepEqual(cleanShares([entry], 'remote-camera'), [{ code: 'room-name', local: true }]);
});
