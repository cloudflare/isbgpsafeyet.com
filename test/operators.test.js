const fs = require('fs');
const csv = require('csv-parse/sync');
const path = require('path');

describe('Operators', function() {
  test('Has duplicate ASN returns false', () => {
    const OPERATORS_STRING = fs.readFileSync(path.join(__dirname, '..', 'data', 'operators.csv'), {encoding: 'utf-8'});
    const OPERATORS = csv.parse(OPERATORS_STRING, {columns: true});

    let seen = new Set();

    const HAS_DUPLICATES = OPERATORS.some(function(currentObject) {
      return seen.size === seen.add(currentObject.asn).size;
    });

    expect(HAS_DUPLICATES).toBe(false);
  })

  test('File is sorted ascendingly by AS Rank column', () => {
    const OPERATORS_STRING = fs.readFileSync(path.join(__dirname, '..', 'data', 'operators.csv'), {encoding: 'utf-8'});
    const OPERATORS = csv.parse(OPERATORS_STRING, {columns: true});

    // Check if the rank column is sorted in ascending order
    for (let i = 1; i < OPERATORS.length; i++) {
      const currentRank = parseInt(OPERATORS[i].rank, 10);
      const previousRank = parseInt(OPERATORS[i - 1].rank, 10);
      
      expect(currentRank).toBeGreaterThanOrEqual(previousRank);
    }
  })
})
