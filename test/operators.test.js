const csv = require('csv-parse/sync');
const fs = require('node:fs');
const path = require('node:path');

describe('Operators', () => {
  const OPERATORS_STRING = fs.readFileSync(path.join(__dirname, '..', 'data', 'operators.csv'), {encoding: 'utf-8'});
  const OPERATORS = csv.parse(OPERATORS_STRING, {columns: true});

  it('checks the ASN is not duplicated', () => {
    const seen = new Set();

    const HAS_DUPLICATES = OPERATORS.some((currentObject) => {
      return seen.size === seen.add(currentObject.asn).size;
    });

    expect(HAS_DUPLICATES).toBe(false);
  });

  it('checks the rows are sorted by rank', () => {
    const RANKS = OPERATORS.map((currentObject) => currentObject.rank);
    const SORTED_RANKS = [...RANKS].sort((a, b) => a - b);

    expect(RANKS).toEqual(SORTED_RANKS);
  });
});
