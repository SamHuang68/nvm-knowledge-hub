import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT, MODEL_VERSION, estimate } from '../sram-repair-model.js';
import { MAX_FILE_BYTES, ScenarioError, createSnapshot, createScenarioFile, parseScenarioFile, validateScenarioFile, validateInputs } from '../sram-scenarios.js';

const source = { releaseId: 'NVM-WEB-' + 'a'.repeat(12), canonicalCommit: 'a'.repeat(40) };
const snapshot = patch => createSnapshot({ ...structuredClone(DEFAULT), ...patch }, source, '2026-10-03T10:00:00.000Z');
const file = () => createScenarioFile({ A: snapshot(), B: snapshot({ unit: 'Gib', mode: 'reduction', compression: '99', otp: { overhead: '12.5', reserve: '10', block: '1024' } }) }, '2026-10-03T10:01:00.000Z');
const rejects = (value, code) => assert.throws(() => validateScenarioFile(value), error => error instanceof ScenarioError && error.code === code);

test('portable scenario round trip retains every exact input and independently recalculates A/B', () => {
  const original = file(), copy = parseScenarioFile(JSON.stringify(original));
  assert.deepEqual(copy, original);
  assert.equal(copy.modelVersion, MODEL_VERSION);
  assert.equal(estimate(copy.scenarios.A.inputs).payload, 160000n);
  assert.equal(estimate(copy.scenarios.B.inputs).payload, 171799n);
  assert.notEqual(estimate(copy.scenarios.B.inputs).otp.allocated, estimate(copy.scenarios.B.inputs).efuse.allocated);
  assert.equal(Object.hasOwn(copy.scenarios.A, 'results'), false);
  original.scenarios.A.inputs.capacity = '200';
  assert.equal(copy.scenarios.A.inputs.capacity, '16', 'validated data owns its input objects');
});
test('all compression definitions and supported capacity units survive scenario restoration', () => {
  for (const [mode, compression] of [['ratio', '100'], ['retained', '1'], ['reduction', '99']]) {
    for (const unit of ['Mb', 'Gb', 'Tb', 'Mib', 'Gib', 'Tib']) {
      const saved = snapshot({ unit, mode, compression, repair: ' 1 / 1000 ' });
      const restored = parseScenarioFile(JSON.stringify(createScenarioFile({ A: saved, B: null })));
      assert.deepEqual(estimate(restored.scenarios.A.inputs), estimate(saved.inputs));
      assert.equal(restored.scenarios.A.inputs.repair, ' 1 / 1000 ');
    }
  }
});
test('unknown format, schema and model are rejected without attempting migration', () => {
  for (const [field, value, code] of [['format', 'some-other-tool', 'format'], ['schemaVersion', 2, 'schema'], ['schemaVersion', '1', 'schema'], ['modelVersion', 'future-model', 'model']]) {
    const valueFile = file(); valueFile[field] = value; rejects(valueFile, code);
  }
});
test('rejects missing, additional, inherited and prototype-shaped fields', () => {
  const missing = file(); delete missing.scenarios.B.inputs.efuse.reserve; rejects(missing, 'structure');
  const unexpected = file(); unexpected.scenarios.A.results = { payload: '1' }; rejects(unexpected, 'structure');
  const injected = JSON.parse(JSON.stringify(file()).replace('"scenarios":{', '"scenarios":{"__proto__":{"polluted":true},'));
  rejects(injected, 'structure'); assert.equal({}.polluted, undefined);
  const inherited = Object.create(file()); assert.throws(() => validateScenarioFile(inherited), ScenarioError);
});
test('malformed, oversized, executable strings, unsupported units and out-of-range values fail closed', () => {
  assert.throws(() => parseScenarioFile('{'), error => error.code === 'json');
  assert.throws(() => parseScenarioFile(' '.repeat(MAX_FILE_BYTES + 1)), error => error.code === 'size');
  assert.throws(() => parseScenarioFile('中'.repeat(22000)), error => error.code === 'size', 'limit measures UTF-8 bytes');
  for (const patch of [{ capacity: 16 }, { capacity: '<img src=x onerror=alert(1)>' }, { capacity: '1'.repeat(81) }, { capacity: '1e999999999' }, { unit: 'constructor' }, { repair: '1/0' }, { mode: 'prototype' }, { otp: { overhead: '0', reserve: '0', block: '0.5' } }]) {
    assert.throws(() => validateInputs({ ...structuredClone(DEFAULT), ...patch }), ScenarioError);
  }
});
test('source metadata is bounded, consistent and optional; it never becomes an arbitrary URL', () => {
  assert.equal(createSnapshot(DEFAULT).source, null);
  for (const corrupt of [{ releaseId: 'javascript:alert(1)', canonicalCommit: 'a'.repeat(40) }, { releaseId: source.releaseId, canonicalCommit: 'b'.repeat(40) }, { ...source, url: 'https://untrusted.invalid/' }]) {
    assert.throws(() => createSnapshot(DEFAULT, corrupt), ScenarioError);
  }
});
test('bad dates and empty workbooks cannot silently replace saved scenarios', () => {
  for (const date of ['<script>', '2026-02-31T10:00:00.000Z', '2026-10-03', 1791021600]) {
    const valueFile = file(); valueFile.exportedAt = date; rejects(valueFile, 'structure');
  }
  const empty = file(); empty.scenarios = { A: null, B: null }; rejects(empty, 'empty');
});
