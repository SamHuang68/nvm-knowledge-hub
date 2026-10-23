/**
 * @fileoverview IP Architect ATE Test Cost & Wafer Probe Time Calculator.
 * Models wafer-level circuit probe (CP) and final test (FT) economics across NVM technologies,
 * comparing programming time, parallel gang sites, and multi-million die tester overhead.
 * @module ip-architect-ate-test-cost-calculator
 */

'use strict';

/**
 * Technology write mechanism & test profiles.
 * @typedef {Object} TechTestProfile
 * @property {string} name - Technology name.
 * @property {number} singleBitWriteUs - Nominal write pulse time per bit in microseconds.
 * @property {number} verifyLoopMultiplier - Number of program-verify retry loops required.
 * @property {boolean} supportsGang - Whether multi-site parallel gang programming is supported.
 * @property {boolean} requiresHighVoltageVpp - Whether external VPP probe card pad accelerates test time.
 */

/**
 * Registry of technology testing profiles.
 * @type {Record<string, TechTestProfile>}
 */
export const TECH_TEST_PROFILES = Object.freeze({
  antifuse: Object.freeze({
    name: 'Logic AntiFuse OTP',
    singleBitWriteUs: 20, // Single breakdown pulse ~20-50us
    verifyLoopMultiplier: 1.0, // Non-reversible, single pulse + read verify
    supportsGang: true,
    requiresHighVoltageVpp: false
  }),
  efuse: Object.freeze({
    name: 'Foundry eFuse',
    singleBitWriteUs: 15,
    verifyLoopMultiplier: 1.0,
    supportsGang: false, // High current (15mA/bit) limits parallel blast
    requiresHighVoltageVpp: false
  }),
  fgotp: Object.freeze({
    name: 'Logic FG-OTP',
    singleBitWriteUs: 100,
    verifyLoopMultiplier: 3.5, // Iterative injection + verify loops
    supportsGang: true,
    requiresHighVoltageVpp: true
  }),
  ldmtp: Object.freeze({
    name: 'Logic LD-MTP',
    singleBitWriteUs: 500, // FN tunneling write ~ms
    verifyLoopMultiplier: 4.0,
    supportsGang: true,
    requiresHighVoltageVpp: false
  }),
  sst: Object.freeze({
    name: 'Split-Gate eFlash (SST)',
    singleBitWriteUs: 10, // Sector erase + byte program
    verifyLoopMultiplier: 2.5,
    supportsGang: true,
    requiresHighVoltageVpp: true
  }),
  mram: Object.freeze({
    name: 'Embedded STT-MRAM',
    singleBitWriteUs: 0.03, // ~30ns write
    verifyLoopMultiplier: 1.0,
    supportsGang: true,
    requiresHighVoltageVpp: false
  })
});

/**
 * Calculates ATE test time and cost per die and for mass production volume.
 *
 * @param {Object} [params={}] - Parameters for calculation.
 * @param {string} [params.tech='antifuse'] - Technology key.
 * @param {number} [params.bitsToProgram=4096] - Number of bits programmed during CP (e.g. 4Kb key).
 * @param {number} [params.gangSites=4] - Parallel testing sites (1, 2, 4, 8, 16).
 * @param {number} [params.testerHourlyRate=150] - ATE tester machine cost per hour in USD.
 * @param {number} [params.volumeMillions=10] - Production volume in millions of units.
 * @returns {Object} Test time and financial impact metrics.
 */
export function calculateAteTestCost(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};
  const techKey = typeof safeParams.tech === 'string' && TECH_TEST_PROFILES[safeParams.tech]
    ? safeParams.tech
    : 'antifuse';

  let bits = Number(safeParams.bitsToProgram);
  if (!Number.isFinite(bits) || bits <= 0) bits = 4096;
  bits = Math.min(Math.max(bits, 32), 1048576); // 32 bits to 1Mb

  let sites = Number(safeParams.gangSites);
  if (!Number.isFinite(sites) || sites <= 0) sites = 4;
  sites = Math.min(Math.max(sites, 1), 32);

  let hourlyRate = Number(safeParams.testerHourlyRate);
  if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) hourlyRate = 150;
  hourlyRate = Math.min(Math.max(hourlyRate, 30), 800); // $30 to $800/hr

  let volumeM = Number(safeParams.volumeMillions);
  if (!Number.isFinite(volumeM) || volumeM <= 0) volumeM = 10;
  volumeM = Math.min(Math.max(volumeM, 0.1), 500); // 100K to 500M units

  const profile = TECH_TEST_PROFILES[techKey];
  const effectiveSites = profile.supportsGang ? sites : 1;

  // Single die test time (seconds)
  const totalWriteUs = bits * profile.singleBitWriteUs * profile.verifyLoopMultiplier;
  const rawTestSec = totalWriteUs / 1e6;
  const effectiveTestSec = rawTestSec / effectiveSites;

  // Add 15ms base contact/setup overhead
  const finalTestSec = effectiveTestSec + 0.015;

  // Cost per second = hourlyRate / 3600
  const costPerSec = hourlyRate / 3600;
  const testCostPerDieUsd = finalTestSec * costPerSec;

  // Mass production total volume cost
  const totalUnits = volumeM * 1e6;
  const totalVolumeCostUsd = totalUnits * testCostPerDieUsd;

  // Comparison benchmark against Single-site FG-OTP
  const benchmarkProfile = TECH_TEST_PROFILES.fgotp;
  const benchmarkTestSec = (bits * benchmarkProfile.singleBitWriteUs * benchmarkProfile.verifyLoopMultiplier) / 1e6 / effectiveSites + 0.015;
  const benchmarkTotalCostUsd = totalUnits * (benchmarkTestSec * costPerSec);
  const costSavingsUsd = Math.max(0, benchmarkTotalCostUsd - totalVolumeCostUsd);

  return {
    tech: techKey,
    techName: profile.name,
    bitsToProgram: bits,
    gangSites: effectiveSites,
    testerHourlyRate: hourlyRate,
    volumeMillions: volumeM,
    testTimeSecPerDie: Number(finalTestSec.toFixed(4)),
    testCostPerDieUsd: Number(testCostPerDieUsd.toFixed(5)),
    totalVolumeCostUsd: Math.round(totalVolumeCostUsd),
    benchmarkCostUsd: Math.round(benchmarkTotalCostUsd),
    costSavingsUsd: Math.round(costSavingsUsd),
    supportsGang: profile.supportsGang
  };
}
