const csv = require('csv-parse/sync');
const fs = require('node:fs');
const path = require('node:path');

describe('Twitter', () => {
  const TWITTER_STRING = fs.readFileSync(path.join(__dirname, '..', 'data', 'twitter.csv'), {encoding: 'utf-8'});
  const TWITTER = csv.parse(TWITTER_STRING, {columns: true});

  it('checks the rows are sorted by asn', () => {
    const ASNS = TWITTER.map((currentObject) => currentObject.asn);
    const SORTED_ASNS = [...ASNS].sort((a, b) => a - b);

    expect(ASNS).toEqual(SORTED_ASNS);
  });
});
