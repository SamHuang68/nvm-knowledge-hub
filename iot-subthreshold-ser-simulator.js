/**
 * @fileoverview IoT MCU Subthreshold Voltage (0.4V-0.8V) Sense Margin & Soft Error Rate (SER) Simulator.
 * Models Pelgrom mismatch, subthreshold read current drop, critical charge Qcrit,
 * and alpha-particle / neutron soft error susceptibility across NVM technologies.
 * @module iot-subthreshold-ser-simulator
 */

'use strict';

/**
 * Technology soft error susceptibility profiles.
 * @type {Record<string, {name: string, isChargeBased: boolean, typicalNodeCapFf: number, alphaImmunity: boolean}>}
 */
export const TECH_SER_PROFILES = Object.freeze({
  antifuse: Object.freeze({
    name: 'Logic AntiFuse OTP',
    isChargeBased: false,
    typicalNodeCapFf: 0.5,
    alphaImmunity: true
  }),
  efuse: Object.freeze({
    name: 'Foundry eFuse',
    isChargeBased: false,
    typicalNodeCapFf: 0.8,
    alphaImmunity: true
  }),
  fgotp: Object.freeze({
    name: 'Logic FG-OTP',
    isChargeBased: true,
    typicalNodeCapFf: 1.2,
    alphaImmunity: false
  }),
  ldmtp: Object.freeze({
    name: 'Logic LD-MTP',
    isChargeBased: true,
    typicalNodeCapFf: 1.5,
    alphaImmunity: false
  }),
  sst: Object.freeze({
    name: 'Split-Gate eFlash',
    isChargeBased: true,
    typicalNodeCapFf: 2.0,
    alphaImmunity: false
  }),
  mram: Object.freeze({
    name: 'Embedded STT-MRAM',
    isChargeBased: false,
    typicalNodeCapFf: 0.4,
    alphaImmunity: true
  })
});

/**
 * Calculates subthreshold read margin and alpha-particle soft error rate.
 *
 * @param {Object} [params={}] - Simulation parameters.
 * @param {string} [params.tech='antifuse'] - Technology key.
 * @param {number} [params.vddVolts=0.5] - Operating VDD supply voltage (0.4 to 1.2 Volts).
 * @param {number} [params.tempC=25] - Operating temperature in Celsius (-40 to 125).
 * @returns {Object} Calculated sense margin, critical charge, and SER in FIT/Mbit.
 */
export function calculateSubthresholdSer(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};

  const techKey = typeof safeParams.tech === 'string' && TECH_SER_PROFILES[safeParams.tech]
    ? safeParams.tech
    : 'antifuse';
  const profile = TECH_SER_PROFILES[techKey];

  let vdd = Number(safeParams.vddVolts);
  if (!Number.isFinite(vdd)) vdd = 0.5;
  vdd = Math.min(Math.max(vdd, 0.4), 1.2);

  let temp = Number(safeParams.tempC);
  if (!Number.isFinite(temp)) temp = 25;
  temp = Math.min(Math.max(temp, -40), 125);

  // 1. Subthreshold Read Current (nA)
  // At nominal 1.2V, read current is ~15-25 uA (15000 nA)
  // In subthreshold (<0.7V), current decays exponentially with slope ~75 mV/dec
  const vthNominal = 0.45;
  let ireadNa = 15000;
  if (vdd < 0.7) {
    const subDecades = (0.7 - vdd) / 0.085;
    ireadNa = Math.max(0.5, 15000 / Math.pow(10, subDecades));
  } else {
    ireadNa = 15000 * Math.pow(vdd / 1.2, 1.8);
  }

  // 2. Differential Sense Margin (mV)
  // Sense margin Delta_V = I_read * R_load - V_offset
  // Pelgrom offset V_os ~ 15-25 mV for small differential pairs
  const offsetMv = 18;
  const rawMarginMv = Math.min(vdd * 1000 * 0.4, (ireadNa / 1000) * 12);
  const netSenseMarginMv = Math.max(2.0, rawMarginMv - offsetMv);

  // 3. Critical Charge Qcrit = Cnode * VDD in femtoCoulombs (fC)
  const qcritFc = Number((profile.typicalNodeCapFf * vdd).toFixed(2));

  // 4. Soft Error Rate (FIT/Mbit, 1 FIT = 1 failure per 10^9 hours)
  // Alpha particle flux from packaging ~ 0.001 alpha/(cm^2*hr)
  let serFitPerMbit = 0;
  if (profile.alphaImmunity) {
    // Non-charge based (AntiFuse filament / eFuse / MRAM) immune to electron-hole pairs
    serFitPerMbit = 0.05; // background noise only
  } else {
    // Exponential susceptibility: SER ~ K * exp(-Qcrit / Qs), Qs ~ 1.5 fC
    const qsFc = 1.5;
    serFitPerMbit = Math.max(1.0, 850 * Math.exp(-qcritFc / qsFc));
  }

  // 5. IoT MCU Architectural Recommendation
  let recommendationZh = '';
  let recommendationEn = '';

  if (profile.alphaImmunity) {
    recommendationZh = '零軟錯誤免疫：無電荷儲存節點，次閾值下抗 Alpha 粒子與中子翻轉率達 99.9% 以上，極致適用於長期部署之物聯網感測節點。';
    recommendationEn = 'Soft Error Immune: Zero floating storage node; >99.9% alpha/neutron immunity under subthreshold, ideal for edge IoT sensors.';
  } else {
    recommendationZh = '需加強 ECC 保護：低壓下 Qcrit 減半使 SER 攀升，必須啟用 SECDED (單錯糾正雙錯檢測) 演算法以防資料損壞。';
    recommendationEn = 'Requires ECC: Reduced Qcrit under subthreshold elevates SER; mandates SECDED ECC algorithms to prevent bit corruption.';
  }

  return {
    tech: techKey,
    techName: profile.name,
    vddVolts: vdd,
    tempC: temp,
    ireadNa: Number(ireadNa.toFixed(1)),
    netSenseMarginMv: Number(netSenseMarginMv.toFixed(1)),
    qcritFc,
    serFitPerMbit: Number(serFitPerMbit.toFixed(2)),
    alphaImmunity: profile.alphaImmunity,
    recommendationZh,
    recommendationEn
  };
}

/**
 * Attaches UI event listeners for the IoT subthreshold simulator.
 */
export function initIotSubthresholdUi() {
  const root = document.getElementById('iot-subthreshold-ser-root');
  if (!root) return;

  const techSelect = /** @type {HTMLSelectElement|null} */ (root.querySelector('#iot-tech-select'));
  const vddInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#iot-vdd-input'));
  const tempInput = /** @type {HTMLInputElement|null} */ (root.querySelector('#iot-temp-input'));

  const ireadOut = root.querySelector('#iot-iread-out');
  const marginOut = root.querySelector('#iot-margin-out');
  const qcritOut = root.querySelector('#iot-qcrit-out');
  const serOut = root.querySelector('#iot-ser-out');
  const verdictOut = root.querySelector('#iot-verdict-out');

  const update = () => {
    const res = calculateSubthresholdSer({
      tech: techSelect ? techSelect.value : 'antifuse',
      vddVolts: vddInput ? parseFloat(vddInput.value) : 0.5,
      tempC: tempInput ? parseFloat(tempInput.value) : 25
    });

    if (ireadOut) ireadOut.textContent = `${res.ireadNa} nA`;
    if (marginOut) marginOut.textContent = `${res.netSenseMarginMv} mV`;
    if (qcritOut) qcritOut.textContent = `${res.qcritFc} fC`;
    if (serOut) {
      serOut.textContent = `${res.serFitPerMbit} FIT/Mb`;
      serOut.className = res.serFitPerMbit < 5 ? 'res-val text-green' : 'res-val text-amber';
    }
    if (verdictOut) {
      verdictOut.innerHTML = `<span data-lang="zh">${res.recommendationZh}</span><span data-lang="en">${res.recommendationEn}</span>`;
    }
  };

  if (techSelect) techSelect.addEventListener('change', update);
  if (vddInput) vddInput.addEventListener('input', update);
  if (tempInput) tempInput.addEventListener('input', update);
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIotSubthresholdUi);
  } else {
    initIotSubthresholdUi();
  }
}
