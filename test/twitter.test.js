const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
  });
}

describe('Twitter', function() {
  test('File is sorted ascendingly by ASN column', () => {
    const OPERATORS_STRING = fs.readFileSync(path.join(__dirname, '..', 'data', 'twitter.csv'), {encoding: 'utf-8'});
    const OPERATORS = parseCSV(OPERATORS_STRING);

    // Check if the rank column is sorted in ascending order
    for (let i = 1; i < OPERATORS.length; i++) {
      const currentRank = parseInt(OPERATORS[i].asn, 10);
      const previousRank = parseInt(OPERATORS[i - 1].asn, 10);
      
      expect(currentRank).toBeGreaterThanOrEqual(previousRank);
    }
  })
})
