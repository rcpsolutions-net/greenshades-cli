// Static API endpoint coverage check.
//
// Cross-checks every apiClient call in commands/ + lib/ against the endpoint
// reference file (api_endpoints.json) via the hand-maintained mapping in
// test/endpoints.map.json. Deterministic — no network access, safe to run
// anywhere. Beta API: endpoints may 404 live; this test only verifies that
// code and reference stay in sync with each other.
//
// Fails when:
//   - a reference endpoint has no mapping entry (or vice versa) — drift
//   - a mapped call is missing from the code — regression
//   - a code call maps to no reference entry and isn't allowlisted in extraCalls
//   - a new dynamic (non-literal) apiClient call site appears outside dynamicPassthrough
//
// Never fails on: beta-unverified entries (method/param divergences to confirm
// live) or missing endpoints (tracked gaps, e.g. employee settlements).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const repo = (p) => join(root, p);
const loadJson = (p) => JSON.parse(readFileSync(repo(p), 'utf8'));

const reference = loadJson('api_endpoints.json');
const map = loadJson('test/endpoints.map.json');

function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|js)$/.test(e.name) && !e.name.endsWith('.d.ts')) out.push(p);
  }
  return out;
}

const sourceFiles = [...walk(repo('commands')), ...walk(repo('lib')), repo('index.js')];

// Extract literal apiClient calls as "METHOD /path" with ${...} -> *.
const calls = new Map(); // key -> Set(relative files)
const dynamicSites = []; // "file:line" for non-literal first args
for (const f of sourceFiles) {
  const src = readFileSync(f, 'utf8');
  const rel = f.slice(root.length + 1);
  const total = (src.match(/apiClient\.(get|post|put|delete|patch)\(/g) || []).length;
  const re = /apiClient\.(get|post|put|delete|patch)\(\s*(['"`])([\s\S]*?)\2/g;
  let m, matched = 0;
  while ((m = re.exec(src))) {
    matched++;
    let raw = m[3].trim().replace(/\?.*$/, '');
    if (!raw.startsWith('/')) raw = '/' + raw;
    const key = `${m[1].toUpperCase()} ${raw.replace(/\$\{[^}]*\}/g, '*')}`;
    if (!calls.has(key)) calls.set(key, new Set());
    calls.get(key).add(rel);
  }
  if (matched < total) {
    src.split('\n').forEach((ln, i) => {
      if (/apiClient\.(get|post|put|delete|patch)\(\s*[^'"`\s]/.test(ln)) {
        dynamicSites.push(`${rel}:${i + 1}`);
      }
    });
  }
}

const callKeys = new Set(calls.keys());
const mappedCalls = new Set(map.endpoints.map((e) => e.call).filter(Boolean));

test('reference file and mapping table cover the same endpoint set', () => {
  const refNames = new Set(reference.map((e) => e.name));
  assert.equal(refNames.size, reference.length, 'api_endpoints.json contains duplicate endpoint names');
  const mapNames = new Set(map.endpoints.map((e) => e.name));
  assert.equal(mapNames.size, map.endpoints.length, 'endpoints.map.json contains duplicate endpoint names');

  const missingFromMap = [...refNames].filter((n) => !mapNames.has(n));
  const missingFromRef = [...mapNames].filter((n) => !refNames.has(n));
  assert.deepEqual(
    missingFromMap, [],
    `reference endpoints without a mapping entry (add one to test/endpoints.map.json): ${missingFromMap.join(' | ')}`
  );
  assert.deepEqual(
    missingFromRef, [],
    `mapping entries not in reference file (stale? remove or update api_endpoints.json): ${missingFromRef.join(' | ')}`
  );
});

test('every mapped endpoint has the expected call in code', () => {
  const failures = [];
  for (const e of map.endpoints) {
    if (e.status === 'missing') {
      assert.equal(e.call, null, `status "missing" must have call=null: ${e.name}`);
      continue;
    }
    if (!callKeys.has(e.call)) {
      failures.push(`${e.name}: expected ${e.call} (status: ${e.status})`);
    }
  }
  assert.deepEqual(
    failures, [],
    `mapped calls no longer present in code (regression):\n  ${failures.join('\n  ')}`
  );
});

test('every code call maps to a reference endpoint or is allowlisted', () => {
  const extra = new Set(map.extraCalls.map((e) => e.call));
  for (const ec of map.extraCalls) {
    assert.ok(callKeys.has(ec.call), `extraCall no longer present in code (stale entry): ${ec.call}`);
  }
  const unmapped = [...callKeys].filter((k) => !mappedCalls.has(k) && !extra.has(k));
  assert.deepEqual(
    unmapped, [],
    `code calls with no reference entry (typo? or add to extraCalls):\n  ${unmapped.join('\n  ')}`
  );
});

test('all dynamic call sites are allowlisted', () => {
  const allowed = new Set(map.dynamicPassthrough.map((d) => d.file));
  const unexpected = dynamicSites.filter((s) => !allowed.has(s.slice(0, s.lastIndexOf(':'))));
  assert.deepEqual(
    unexpected, [],
    `new non-literal apiClient call sites (add file to dynamicPassthrough with a note, or use a literal path):\n  ${unexpected.join('\n  ')}`
  );
});

test('coverage summary', () => {
  const counts = { implemented: 0, 'beta-unverified': 0, missing: 0 };
  for (const e of map.endpoints) counts[e.status]++;
  const beta = map.endpoints.filter((e) => e.status === 'beta-unverified');
  const missing = map.endpoints.filter((e) => e.status === 'missing');

  console.log(`\nendpoint coverage: ${reference.length} reference — ${counts.implemented} implemented, ${counts['beta-unverified']} beta-unverified, ${counts.missing} missing`);
  console.log(`code calls: ${callKeys.size} distinct (${mappedCalls.size} mapped + ${map.extraCalls.length} extra/beta)`);
  if (beta.length) console.log(`  beta-unverified:\n    ${beta.map((e) => `${e.call} — ${e.name}`).join('\n    ')}`);
  if (missing.length) console.log(`  not implemented:\n    ${missing.map((e) => `(${e.name})`).join('\n    ')}`);
  assert.ok(counts.implemented + counts['beta-unverified'] + counts.missing === reference.length);
});
