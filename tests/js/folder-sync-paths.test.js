import test from 'node:test';
import assert from 'node:assert/strict';
import { portableName, leftOut, validPath, foldPath, joinPath, MAX_DEPTH, MAX_PATH } from '../../tools/folder-sync/src/paths.js';

const acute = String.fromCharCode(0x301);
const composedE = String.fromCharCode(0xe9);
const japanese = String.fromCharCode(0x65e5, 0x672c, 0x8a9e);

test('a synced name is one that Windows, macOS and Linux can all store', () => {
  for (const name of ['report.md', `Caf${composedE}.txt`, '2026-11-19 notes', '.gitignore', 'a'.repeat(255), `${japanese}.txt`,
    'console.log', 'com10', 'nullable', 'aux-cable.txt']) {
    assert.equal(portableName(name), true, name);
  }
  for (const name of ['', '.', '..', 'a/b', 'a\\b', 'what?.txt', 'a:b', 'pipe|name', 'star*', 'quote"d', 'less<', 'more>',
    'trailing.', 'trailing ', 'tab\there', 'line\nbreak', 'NUL', 'nul.txt', 'CON.tar.gz', 'com1', 'LPT9.log', 'Aux', 'a'.repeat(256)]) {
    assert.equal(portableName(name), false, JSON.stringify(name));
  }
  assert.equal(portableName(null), false);
  assert.equal(portableName(7), false);
});

test('operating-system litter and half-written copies are left out with a reason', () => {
  assert.equal(leftOut('Thumbs.db'), 'system');
  assert.equal(leftOut('.DS_Store'), 'system');
  assert.equal(leftOut('desktop.ini'), 'system');
  assert.equal(leftOut('._holiday.jpg'), 'system');
  assert.equal(leftOut('$RECYCLE.BIN', true), 'system');
  assert.equal(leftOut('System Volume Information', true), 'system');
  assert.equal(leftOut('report.docx.crswap'), 'temporary');
  assert.equal(leftOut('~$report.docx'), 'temporary');
  assert.equal(leftOut('.~lock.report.odt#'), 'temporary');
  assert.equal(leftOut('notes:2026.txt'), 'name');
  assert.equal(leftOut('ends-with-dot.', true), 'name');
  assert.equal(leftOut('report.docx'), null);
  assert.equal(leftOut(`Cafe${acute}.txt`), null);
  // The lists are per kind: a folder named like a thumbnail cache is still a folder.
  assert.equal(leftOut('Thumbs.db', true), null);
  assert.equal(leftOut('$RECYCLE.BIN'), null);
});

test('a path is relative, composed, portable in every part and bounded', () => {
  assert.equal(validPath('docs/report.md'), true);
  assert.equal(validPath(`Caf${composedE}/menu.txt`), true);
  // The decomposed spelling a Mac can hand over is refused on the wire: the
  // sending side composes names before listing them.
  assert.equal(validPath(`Cafe${acute}/menu.txt`), false);
  for (const path of ['', '/absolute.txt', 'trailing/', 'a//b', '../escape.txt', 'a/../b', './here.txt', 'C:\\x.txt', 'a/NUL',
    'a/b:c', 'x'.repeat(MAX_PATH + 1), null, 12]) {
    assert.equal(validPath(path), false, String(path));
  }
  assert.equal(validPath(Array(MAX_DEPTH).fill('d').join('/')), true);
  assert.equal(validPath(Array(MAX_DEPTH + 1).fill('d').join('/')), false);
  assert.equal(joinPath('', 'a.txt'), 'a.txt');
  assert.equal(joinPath('docs', 'a.txt'), 'docs/a.txt');
  assert.equal(foldPath('Docs/README.md'), foldPath('docs/readme.md'));
  assert.notEqual(foldPath('a.txt'), foldPath('b.txt'));
});
