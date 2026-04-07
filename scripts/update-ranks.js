#!/usr/bin/env node

/**
 * Fetches the current AS Rank for every ASN in data/operators.csv from the
 * CAIDA AS Rank API and writes the updated ranks back to the file, re-sorted
 * ascending by rank.
 *
 * Usage:
 *   node scripts/update-ranks.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const OPERATORS_PATH = path.join(__dirname, '..', 'data', 'operators.csv');
const API_BASE = 'https://api.asrank.caida.org/v2/restful';
const DELAY_MS = 100;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']));
  });
  return { headers, rows };
}

function toCSV(headers, rows) {
  const header = headers.join(',');
  const body = rows.map(row => headers.map(h => row[h] ?? '').join(','));
  return [header, ...body].join('\n') + '\n';
}

async function fetchRank(asn) {
  const url = `${API_BASE}/asns/${asn}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ASN ${asn}`);
  }
  const json = await res.json();
  const rank = json?.data?.asn?.rank ?? null;
  return rank;
}

async function main() {
  const text = fs.readFileSync(OPERATORS_PATH, 'utf-8');
  const { headers, rows } = parseCSV(text);

  if (!headers.includes('rank') || !headers.includes('asn')) {
    console.error('Expected columns "asn" and "rank" in operators.csv');
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const { asn, rank: currentRank } = row;

    process.stdout.write(`[${i + 1}/${rows.length}] ASN ${asn} (current rank: ${currentRank}) … `);

    try {
      await sleep(DELAY_MS);
      const newRank = await fetchRank(asn);

      if (newRank === null) {
        console.log(`no rank returned, keeping ${currentRank}`);
        skipped++;
      } else if (String(newRank) !== String(currentRank)) {
        console.log(`${currentRank} → ${newRank}`);
        row.rank = String(newRank);
        updated++;
      } else {
        console.log(`unchanged (${currentRank})`);
      }
    } catch (err) {
      console.log(`error (${err.message}), keeping ${currentRank}`);
      skipped++;
    }
  }

  // Re-sort ascending by rank
  rows.sort((a, b) => +a.rank - +b.rank);

  fs.writeFileSync(OPERATORS_PATH, toCSV(headers, rows), 'utf-8');

  console.log(`\nDone. ${updated} rank(s) updated, ${skipped} skipped.`);
  console.log('Review the diff with: git diff data/operators.csv');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
