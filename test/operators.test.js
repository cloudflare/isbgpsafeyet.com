const fs = require('fs')
const parse = require('csv-parse/lib/sync');
const path = require('path');

describe('Operators', function() {
  test('Has duplicate ASN returns false', () => {
    const OPERATORS_STRING = fs.readFileSync(path.join(__dirname, '..', 'data', 'operators.csv'), {encoding: 'utf-8'});
    const OPERATORS = parse(OPERATORS_STRING, {columns: true});

    let seen = new Set();

    const HAS_DUPLICATES = OPERATORS.some(function(currentObject) {
      return seen.size === seen.add(currentObject.asn).size;
    });

    expect(HAS_DUPLICATES).toBe(false);
  })
})
