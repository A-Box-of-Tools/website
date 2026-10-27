import test from 'node:test';
import assert from 'node:assert/strict';
import { tablePair } from '../../tools/text-diff/src/table-pipeline.js';

test('CSV pipeline preserves ordered source bytes including BOM and quoted CRLF', async () => {
  const texts = ['\uFEFFid,note\r\n001,"first\r\nsecond"\r\n', 'ref;team\n001;North\n'];
  const files = tablePair(...texts);
  assert.deepEqual(files.map(file => file.name), ['table-a.csv', 'table-b.csv']);
  for (const [index, text] of texts.entries()) {
    assert.deepEqual(new Uint8Array(await files[index].arrayBuffer()), new TextEncoder().encode(text));
  }
});

test('identical, edited, swapped and headerless CSV sources can continue to Stitch', async () => {
  const a = 'id,name\n1,Ada', b = 'id,name\n2,Lin';
  assert.equal(tablePair(a, a).length, 2);
  assert.equal(await tablePair(b, a)[0].text(), b);
  assert.equal(await tablePair(a + '\n3,Sam', b)[0].text(), a + '\n3,Sam');
  assert.equal(tablePair('1\n2,Lin', '2,North\n3,West').length, 2);
});

test('CSV pipeline declines prose, incomplete pairs, malformed quotes and receiver limits', () => {
  const valid = 'id,name\n1,Ada';
  for (const text of ['', 'some prose\nmore prose', 'id,name\n1,"unfinished',
    Array(5001).fill('1,Ada').join('\n'), 'id,name\n1,' + '字'.repeat(800000)]) {
    assert.equal(tablePair(valid, text), null);
  }
});

test('CSV pipeline accepts the full receiver bound with a recognized heading row', () => {
  const source = 'ID,Name\n' + Array(5000).fill('001,Ada').join('\n');
  assert.equal(tablePair(source, source).length, 2);
});
