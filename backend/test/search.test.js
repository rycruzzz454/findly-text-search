import test from 'node:test';
import assert from 'node:assert/strict';
import { searchText } from '../src/search.js';

test('finds multiple occurrences without regard to case by default', () => {
  const result = searchText('Hello hello HELLO', 'hello');
  assert.deepEqual(result.hits.map(hit => hit.start), [0, 6, 12]);
  assert.equal(result.totalHits, 3);
});
test('supports case-sensitive search', () => {
  assert.deepEqual(searchText('Hello hello', 'Hello', { caseSensitive: true }).hits.map(x => x.start), [0]);
});
test('treats regex-like search terms literally', () => {
  assert.equal(searchText('a.b and axb and a.b', 'a.b').totalHits, 2);
});
test('finds multi-word queries and skips overlapping matches', () => {
  assert.deepEqual(searchText('aaaa', 'aa').hits.map(x => x.start), [0, 2]);
});
test('returns 1-based line and column positions for multiline input', () => {
  const hits = searchText('one\r\ntwo\nthree two', 'two').hits;
  assert.deepEqual(hits.map(({ line, column }) => [line, column]), [[2, 1], [3, 7]]);
});
test('handles empty terms and no matches', () => {
  assert.equal(searchText('abc', '').totalHits, 0);
  assert.equal(searchText('abc', 'xyz').totalHits, 0);
});
test('rejects values that are not strings', () => {
  assert.throws(() => searchText(12, 'a'), TypeError);
});
