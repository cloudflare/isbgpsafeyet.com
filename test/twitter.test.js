const fs = require('fs');
const csv = require('csv-parse/sync');
const path = require('path');

describe('Twitter', function() {
  test('File is sorted ascendingly by ASN column', () => {
    const OPERATORS_STRING = fs.readFileSync(path.join(__dirname, '..', 'data', 'twitter.csv'), {encoding: 'utf-8'});
    const OPERATORS = csv.parse(OPERATORS_STRING, {columns: true});

    // Check if the rank column is sorted in ascending order
    for (let i = 1; i < OPERATORS.length; i++) {
      const currentRank = parseInt(OPERATORS[i].asn, 10);
      const previousRank = parseInt(OPERATORS[i - 1].asn, 10);
      
      expect(currentRank).toBeGreaterThanOrEqual(previousRank);
    }
  })
})
