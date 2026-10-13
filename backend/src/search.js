/** Find literal, non-overlapping occurrences and report zero-based UTF-16 indices. */
export function searchText(input, query, options = {}) {
  if (typeof input !== 'string' || typeof query !== 'string') {
    throw new TypeError('Input and query must both be strings.');
  }
  if (!query.length) return { totalHits: 0, hits: [], truncated: false };

  const caseSensitive = options.caseSensitive === true;
  const haystack = caseSensitive ? input : input.toLocaleLowerCase('en');
  const needle = caseSensitive ? query : query.toLocaleLowerCase('en');
  const maxHits = 10000;
  const hits = [];
  let offset = 0;
  let truncated = false;
  while (offset <= input.length - query.length) {
    const start = haystack.indexOf(needle, offset);
    if (start === -1) break;
    if (hits.length >= maxHits) { truncated = true; break; }
    const position = getLineColumn(input, start);
    hits.push({ start, end: start + query.length, line: position.line, column: position.column,
      text: input.slice(start, start + query.length) });
    offset = start + query.length;
  }
  return { totalHits: hits.length, hits, truncated };
}

function getLineColumn(input, index) {
  const before = input.slice(0, index);
  const breaks = /\r\n|\r|\n/g;
  let lastEnd = 0;
  let line = 1;
  for (const match of before.matchAll(breaks)) { line++; lastEnd = match.index + match[0].length; }
  return { line, column: index - lastEnd + 1 };
}
