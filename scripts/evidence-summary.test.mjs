import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { countEvidence, syncEvidenceSummary } from './sync-evidence-summary.mjs';

const ledger = fs.readFileSync(new URL('../memory-evidence.html', import.meta.url), 'utf8');

test('published summary and initial result count match the canonical ledger cards', () => {
  const result = syncEvidenceSummary(ledger);
  assert.equal(result.html, ledger);
  assert.equal(result.counts.total, Object.entries(result.counts).filter(([key]) => key !== 'total').reduce((sum, [, count]) => sum + count, 0));
});

test('adding or removing a record updates the relevant category, total and initial result count', () => {
  const original = countEvidence(ledger);
  const added = `${ledger}\n<article class="source-card" id="evidence-TEST" data-type="case"></article>`;
  const result = syncEvidenceSummary(added);
  assert.equal(result.counts.total, original.total + 1);
  assert.equal(result.counts.case, original.case + 1);
  assert.equal(result.counts.vendor, original.vendor);
  assert.notEqual(result.html, added);
  assert.match(result.html, new RegExp(`id="evidenceCount"[^>]*>${original.total + 1}</b>`));
  assert.equal(syncEvidenceSummary(result.html).html, result.html);
  const removed = result.html.replace(/\n<article class="source-card" id="evidence-TEST" data-type="case"><\/article>/u, '');
  assert.equal(syncEvidenceSummary(removed).html, ledger);
});

test('invalid records and missing summary markers fail closed', () => {
  assert.throws(() => countEvidence(`${ledger}<article class="source-card" id="evidence-V16" data-type="vendor"></article>`), /duplicate/u);
  assert.throws(() => countEvidence(`${ledger}<article class="source-card" id="evidence-TEST" data-type="unknown"></article>`), /Unknown/u);
  assert.throws(() => syncEvidenceSummary(ledger.replace('data-evidence-count="case"', 'data-wrong-count="case"')), /Missing evidence summary/u);
});
