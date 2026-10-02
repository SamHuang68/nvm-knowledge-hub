import assert from 'node:assert/strict';
import test from 'node:test';
import { ECC_POSITIONS, inspectErrorMask, accelerationFactor } from '../automotive-model.js';

test('72 positions are unique and data/parity labels match the shortened code', () => {
  assert.equal(new Set(ECC_POSITIONS).size, 72);
  assert.deepEqual(ECC_POSITIONS.slice(0, 5), [3, 5, 6, 7, 9]);
  assert.deepEqual(ECC_POSITIONS.slice(64), [1, 2, 4, 8, 16, 32, 64, 0]);
});
test('all 72 single errors, including each parity bit, locate the injected bit', () => {
  for (let i = 0; i < 72; i++) {
    const result = inspectErrorMask([i]);
    assert.equal(result.decoder, 'correctable', `single ${i}`);
    assert.equal(result.correctionIndex, i);
    assert.equal(result.parity, 1);
  }
});
test('all 2556 distinct double errors are detected without correction', () => {
  let cases = 0;
  for (let i = 0; i < 72; i++) for (let j = i + 1; j < 72; j++) {
    const result = inspectErrorMask([i, j]);
    assert.equal(result.decoder, 'uncorrectable', `double ${i},${j}`);
    assert.equal(result.correctionIndex, null);
    assert.notEqual(result.syndrome, 0);
    assert.equal(result.parity, 0);
    cases++;
  }
  assert.equal(cases, 2556);
});
test('known three/four-bit counterexamples disclose miscorrection and missed detection', () => {
  const triple = inspectErrorMask([0, 1, 2]); // positions 3 xor 5 xor 6 = 0
  assert.equal(triple.decoder, 'correctable');
  assert.equal(triple.correctionIndex, 71); // would wrongly "correct" unflipped overall parity
  assert.equal(triple.withinGuarantee, false);
  const four = inspectErrorMask([0, 1, 2, 71]);
  assert.equal(four.decoder, 'no-error-detected');
  assert.equal(four.withinGuarantee, false);
  assert.equal(inspectErrorMask([]).withinGuarantee, true);
  assert.throws(() => inspectErrorMask([72]), RangeError);
  assert.throws(() => inspectErrorMask([0.5]), RangeError);
});
test('Arrhenius reference temperature is unity, hotter accelerates and reverse is reciprocal', () => {
  assert.equal(accelerationFactor(55), 1);
  assert.ok(accelerationFactor(175) > accelerationFactor(125));
  assert.ok(accelerationFactor(25) < 1);
  const a = accelerationFactor(125, { activationEV: 0.5, referenceC: 25 });
  const b = accelerationFactor(25, { activationEV: 0.5, referenceC: 125 });
  assert.ok(Math.abs(a * b - 1) < 1e-12);
  assert.ok(Math.abs(a - 133) < 1); // NIST's rounded worked example
  assert.ok(Math.abs(accelerationFactor(125, { activationEV: 1, referenceC: 25 }) - 17597) / 17597 < 0.002);
  assert.throws(() => accelerationFactor(NaN), RangeError);
  assert.throws(() => accelerationFactor(-273.15), RangeError);
});
