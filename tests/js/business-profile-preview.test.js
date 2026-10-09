import test from 'node:test';
import assert from 'node:assert/strict';
import { localDateValue, previewDate } from '../../tools/business-profile-preview/src/preview-time.js';
import { empty, statusLine } from '../../tools/business-profile-preview/src/profile.js';

test('chosen local time preserves calendar components, including years below 100', () => {
  for (const value of ['2026-01-06T10:15', '2024-02-29T23:59', '0099-07-12T12:00']) {
    const date = previewDate(value);
    assert.ok(date);
    assert.equal(localDateValue(date), value);
    assert.equal(date.getSeconds(), 0);
    assert.equal(date.getMilliseconds(), 0);
  }
});

test('invalid or incomplete chosen dates never roll into another preview', () => {
  for (const value of ['', '2026-01-06', '2026-01-06T10:', '2026-02-29T10:00',
    '2024-02-30T10:00', '2026-13-01T10:00', '2026-00-01T10:00',
    '2026-01-00T10:00', '2026-01-32T10:00', '2026-01-06T24:00',
    '2026-01-06T10:60', '0000-01-01T10:00', '2026-01-06T10:00Z']) {
    assert.equal(previewDate(value), null, value);
  }
});

test('local wall-time preview refuses a spring-forward gap without using UTC', () => {
  const previous = process.env.TZ;
  process.env.TZ = 'America/Toronto';
  try {
    assert.equal(previewDate('2026-03-08T02:30'), null);
    assert.equal(localDateValue(previewDate('2026-03-08T01:30')), '2026-03-08T01:30');
    assert.equal(localDateValue(previewDate('2026-03-08T03:30')), '2026-03-08T03:30');
    assert.equal(localDateValue(previewDate('2026-11-01T01:30')), '2026-11-01T01:30');
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('chosen local time selects the weekly opening day and overnight carry', () => {
  const profile = empty();
  profile.hours = profile.hours.map(() => ({ closed: true, open: '09:00', close: '17:00' }));
  profile.hours[2] = { closed: false, open: '22:00', close: '02:00' };
  const before = structuredClone(profile);
  assert.deepEqual(statusLine(profile, previewDate('2026-01-06T23:00')), { key: 'status.open', at: '02:00' });
  assert.deepEqual(statusLine(profile, previewDate('2026-01-07T01:00')), { key: 'status.open', at: '02:00' });
  assert.deepEqual(statusLine(profile, previewDate('2026-01-07T02:00')), { key: 'status.closeduntil', at: '22:00', day: 2 });
  assert.deepEqual(profile, before);
});
