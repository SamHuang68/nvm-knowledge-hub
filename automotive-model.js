// Teaching model: shortened extended Hamming (72, 64), even parity.
// Positions 1..71 contain seven Hamming parity bits; position 0 is overall parity.
// See TI BQ75614-Q1, "OTP Error Detection and Correction". This is not a device emulator.
const parityPositions = [1, 2, 4, 8, 16, 32, 64];
export const ECC_POSITIONS = Object.freeze([
  ...Array.from({ length: 71 }, (_, i) => i + 1).filter(n => !parityPositions.includes(n)),
  ...parityPositions, 0,
]);

export function inspectErrorMask(indices) {
  const flipped = new Set(indices);
  for (const index of flipped) {
    if (!Number.isInteger(index) || index < 0 || index >= 72) throw new RangeError('Bit index must be 0..71');
  }
  const syndrome = [...flipped].reduce((value, index) => value ^ ECC_POSITIONS[index], 0);
  const parity = flipped.size % 2;
  // Decoder observes parity checks, not the simulator's known injection count.
  let decoder = 'uncorrectable';
  let correctionIndex = null;
  if (syndrome === 0 && parity === 0) decoder = 'no-error-detected';
  else if (parity === 1 && syndrome <= 71) {
    decoder = 'correctable';
    correctionIndex = ECC_POSITIONS.indexOf(syndrome);
  }
  return { syndrome, parity, decoder, correctionIndex, injected: flipped.size, withinGuarantee: flipped.size <= 2 };
}

export const THERMAL_ASSUMPTIONS = Object.freeze({ activationEV: 0.84, referenceC: 55 });
export function accelerationFactor(temperatureC, { activationEV, referenceC } = THERMAL_ASSUMPTIONS) {
  if (![temperatureC, activationEV, referenceC].every(Number.isFinite) || temperatureC <= -273.15 || referenceC <= -273.15 || activationEV < 0) {
    throw new RangeError('Finite temperatures above absolute zero and non-negative activation energy required');
  }
  // NIST Engineering Statistics Handbook 8.1.5.1; no lifetime/retention calibration implied.
  return Math.exp(activationEV / 8.61733e-5 * (1 / (referenceC + 273.15) - 1 / (temperatureC + 273.15)));
}
