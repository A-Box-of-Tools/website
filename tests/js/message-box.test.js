/**
 * shared/js/message-box.js - a line that is either saying something or hidden.
 *
 * Four lines of code, sixty-odd copies before this file; the test is here so
 * that the one copy cannot quietly become a fifth variant. The element is a
 * plain object, because `textContent` and `hidden` are all the module touches.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { messageBox } from '../../shared/js/message-box.js';

const line = () => ({ textContent: '', hidden: true });

test('showing puts the message in the element and unhides it', () => {
  const element = line();
  const box = messageBox(element);
  box.show('That is not a PDF.');
  assert.equal(element.textContent, 'That is not a PDF.');
  assert.equal(element.hidden, false);
});

test('clearing empties the element and hides it', () => {
  const element = line();
  const box = messageBox(element);
  box.show('That is not a PDF.');
  box.clear();
  assert.equal(element.textContent, '');
  assert.equal(element.hidden, true);
});

test('the pair can be pulled apart under the names a tool already uses', () => {
  const element = line();
  const { show: showError, clear: clearError } = messageBox(element);
  showError('no');
  assert.equal(element.hidden, false);
  clearError();
  assert.equal(element.hidden, true);
});

test('onShow runs after the message is on the page, and not on clear', () => {
  const element = line();
  const seen = [];
  const box = messageBox(element, { onShow: () => seen.push(element.textContent) });
  box.show('first');
  box.clear();
  box.show('second');
  assert.deepEqual(seen, ['first', 'second']);
});
