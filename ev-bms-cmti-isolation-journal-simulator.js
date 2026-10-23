/**
 * @fileoverview 800V EV Battery Management System (BMS) CMTI Isolation & Crash Journal Simulator.
 * Models Common-Mode Transient Immunity (CMTI >150 kV/us), galvanic isolation displacement currents,
 * emergency thermal runaway snapshot latency, and ISO 26262 ASIL-D non-volatile event logging.
 * @module ev-bms-cmti-isolation-journal-simulator
 */

'use strict';

/**
 * Technology automotive BMS profiles.
 * @type {Record<string, {name: string, pgmCurrentMa: number, writeLatencyMs: number, cmtiToleranceKvUs: number, asilDQualified: boolean}>}
 */
export const TECH_BMS_PROFILES = Object.freeze({
  antifuse: Object.freeze({
    name: 'Logic AntiFuse OTP',
    pgmCurrentMa: 3.5,
    writeLatencyMs: 0.035, // 35us per 32-bit word fast breakdown
    cmtiToleranceKvUs: 200,
    asilDQualified: true
  }),
  ldmtp: Object.freeze({
    name: 'Logic LD-MTP',
    pgmCurrentMa: 0.05, // FN tunneling low current
    writeLatencyMs: 2.5,
    cmtiToleranceKvUs: 120,
    asilDQualified: true
  }),
  sst: Object.freeze({
    name: 'Split-Gate eFlash',
    pgmCurrentMa: 8.0, // High pump current
    writeLatencyMs: 4.0, // Erase + program cycle
    cmtiToleranceKvUs: 80,
    asilDQualified: false // Sector erase interruption risk during crash
  }),
  mram: Object.freeze({
    name: 'Embedded STT-MRAM',
    pgmCurrentMa: 0.8,
    writeLatencyMs: 0.005, // Ultra-fast write
    cmtiToleranceKvUs: 150,
    asilDQualified: true
  })
});

/**
 * Calculates 800V EV BMS telemetry logging and CMTI noise immunity.
 *
 * @param {Object} [params={}] - Simulation parameters.
 * @param {string} [params.tech='antifuse'] - Technology key.
 * @param {number} [params.packVoltageVolts=800] - Battery pack voltage (400, 800, or 1000).
 * @param {number} [params.sicDvDtKvUs=150] - Inverter SiC dV/dt slew rate in kV/us (50 to 250).
 * @param {number} [params.snapshotBytes=128] - Crash event freeze-frame log size in Bytes (32 to 512).
 * @returns {Object} Calculated CMTI displacement current, freeze-frame latency, and ASIL-D verdict.
 */
export function calculateEvBmsLogging(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};

  const techKey = typeof safeParams.tech === 'string' && TECH_BMS_PROFILES[safeParams.tech]
    ? safeParams.tech
    : 'antifuse';
  const profile = TECH_BMS_PROFILES[techKey];

  let packV = Number(safeParams.packVoltageVolts);
  if (!Number.isFinite(packV)) packV = 800;
  packV = Math.min(Math.max(packV, 300), 1200);

  let dvdt = Number(safeParams.sicDvDtKvUs);
  if (!Number.isFinite(dvdt)) dvdt = 150;
  dvdt = Math.min(Math.max(dvdt, 50), 250);

  let snapshotSize = Number(safeParams.snapshotBytes);
  if (!Number.isFinite(snapshotSize)) snapshotSize = 128;
  snapshotSize = Math.min(Math.max(snapshotSize, 32), 512);

  // 1. Galvanic Isolation Barrier Displacement Current (mA)
  // I_disp = C_iso * (dV/dt), with typical C_iso ~ 1.5 pF across digital isolator
  const cIsoPf = 1.5;
  const dispCurrentMa = Number(((cIsoPf * 1e-12) * (dvdt * 1e9) * 1e3).toFixed(2));

  // 2. CMTI Noise Margin Ratio (Tolerance / SlewRate)
  const cmtiMarginRatio = Number((profile.cmtiToleranceKvUs / dvdt).toFixed(2));
  const isCmtiSafe = cmtiMarginRatio >= 1.0;

  // 3. Emergency Thermal Runaway Crash Snapshot Latency (ms)
  // t_freeze = (snapshotBytes / 4) * writeLatencyMs (assuming 32-bit word write)
  const wordsToWrite = Math.ceil(snapshotSize / 4);
  const rawLatencyMs = (wordsToWrite * profile.writeLatencyMs);
  const emergencyFreezeLatencyMs = Number(rawLatencyMs.toFixed(3));

  // 4. ISO 26262 ASIL-D Compliance Verdict
  let asilVerdictZh = '';
  let asilVerdictEn = '';

  if (isCmtiSafe && emergencyFreezeLatencyMs <= 2.0 && profile.asilDQualified) {
    asilVerdictZh = 'ASIL-D 滿分適配：在 800V SiC 高頻開關下具備充裕 CMTI 裕度，且於 2ms 斷電緩衝期內完成全電芯黑盒子快照寫入。';
    asilVerdictEn = 'ASIL-D Fully Compliant: Robust CMTI margin under 800V SiC transients; completes full freeze-frame write within 2ms crash buffer.';
  } else if (!isCmtiSafe) {
    asilVerdictZh = 'CMTI 噪聲溢出：高頻瞬態位移電流可能干擾寫入電荷幫浦，需額外差分隔離濾波器以防位元損壞。';
    asilVerdictEn = 'CMTI Margin Exhausted: High displacement current risks disturbing write pump; requires galvanic differential filtering.';
  } else {
    asilVerdictZh = '快照延遲過長：抹除+寫入延遲超過緊急掉電保溫窗（>2ms），高壓斷開時存在日誌不完整風險。';
    asilVerdictEn = 'Latency Overrun: Erase+write exceeds crash power-hold window (>2ms); risks incomplete diagnostic freeze-frame.';
  }

  return {
    tech: techKey,
    techName: profile.name,
    packVoltageVolts: packV,
    sicDvDtKvUs: dvdt,
    snapshotBytes: snapshotSize,
    dispCurrentMa,
    cmtiMarginRatio,
    isCmtiSafe,
    emergencyFreezeLatencyMs,
    asilDQualified: profile.asilDQualified,
    asilVerdictZh,
    asilVerdictEn
  };
}

/**
 * Attaches UI event listeners for the EV BMS simulator in automotive-nvm.html.
 */
export function initEvBmsSimulatorUi() {
  const root = document.getElementById('ev-bms-cmti-simulator-root');
  if (!root) return;

  const techSelect = /** @type {HTMLSelectElement|null} */ (root.querySelector('#bms-tech-select'));
  const packSelect = /** @type {HTMLSelectElement|null} */ (root.querySelector('#bms-pack-select'));
  const dvdtInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#bms-dvdt-input'));
  const snapSelect = /** @type {HTMLSelectElement|null} */ (root.querySelector('#bms-snap-select'));

  const dispOut = root.querySelector('#bms-disp-out');
  const cmtiOut = root.querySelector('#bms-cmti-out');
  const latencyOut = root.querySelector('#bms-latency-out');
  const verdictOut = root.querySelector('#bms-verdict-out');

  const update = () => {
    const res = calculateEvBmsLogging({
      tech: techSelect ? techSelect.value : 'antifuse',
      packVoltageVolts: packSelect ? parseInt(packSelect.value, 10) : 800,
      sicDvDtKvUs: dvdtInput ? parseFloat(dvdtInput.value) : 150,
      snapshotBytes: snapSelect ? parseInt(snapSelect.value, 10) : 128
    });

    if (dispOut) dispOut.textContent = `${res.dispCurrentMa} mA`;
    if (cmtiOut) {
      cmtiOut.textContent = `${res.cmtiMarginRatio}× Margin`;
      cmtiOut.className = res.isCmtiSafe ? 'res-val text-green' : 'res-val text-amber';
    }
    if (latencyOut) {
      latencyOut.textContent = `${res.emergencyFreezeLatencyMs} ms`;
      latencyOut.className = res.emergencyFreezeLatencyMs <= 2.0 ? 'res-val text-green' : 'res-val text-amber';
    }
    if (verdictOut) {
      verdictOut.innerHTML = `<span data-lang="zh">${res.asilVerdictZh}</span><span data-lang="en">${res.asilVerdictEn}</span>`;
    }
  };

  [techSelect, packSelect, snapSelect].forEach(el => { if (el) el.addEventListener('change', update); });
  if (dvdtInput) dvdtInput.addEventListener('input', update);
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEvBmsSimulatorUi);
  } else {
    initEvBmsSimulatorUi();
  }
}
