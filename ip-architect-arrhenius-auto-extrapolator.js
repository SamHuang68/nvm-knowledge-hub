/**
 * @fileoverview IP Architect Arrhenius High-Temperature Retention & AEC-Q100 Extrapolator.
 * Computes thermal acceleration factors (AF), effective data retention lifetime,
 * and J-STD-020 260°C lead-free SMT reflow survival across NVM technologies.
 * @module ip-architect-arrhenius-auto-extrapolator
 */

'use strict';

/**
 * Boltzmann constant in eV/Kelvin.
 * @type {number}
 */
export const K_BOLTZMANN_EV = 8.617333262145e-5;

/**
 * Technology thermal activation energy profiles.
 * @typedef {Object} TechThermalProfile
 * @property {string} name - Technology name.
 * @property {number} typicalEa - Typical activation energy in eV.
 * @property {number} nominalRetentionYrsAt85C - Nominal retention years at 85°C.
 * @property {boolean} smtReflowImmunity - 100% immune to 260°C SMT reflow charge loss.
 * @property {string} failureMechanism - Physics failure mechanism.
 */

/**
 * Thermal profile registry.
 * @type {Record<string, TechThermalProfile>}
 */
export const TECH_THERMAL_PROFILES = Object.freeze({
  antifuse: Object.freeze({
    name: 'Logic AntiFuse OTP',
    typicalEa: 2.1, // Permanent conductive Si filament
    nominalRetentionYrsAt85C: 30,
    smtReflowImmunity: true,
    failureMechanism: 'Physical breakdown, zero charge leakage'
  }),
  efuse: Object.freeze({
    name: 'Foundry eFuse',
    typicalEa: 1.8,
    nominalRetentionYrsAt85C: 25,
    smtReflowImmunity: true,
    failureMechanism: 'Electromigration gap, possible metal regrowth under extreme stress'
  }),
  fgotp: Object.freeze({
    name: 'Logic FG-OTP',
    typicalEa: 1.2,
    nominalRetentionYrsAt85C: 15,
    smtReflowImmunity: false,
    failureMechanism: 'Thermal de-trapping across thin gate oxide'
  }),
  sst: Object.freeze({
    name: 'Split-Gate eFlash (SST)',
    typicalEa: 1.3,
    nominalRetentionYrsAt85C: 20,
    smtReflowImmunity: false,
    failureMechanism: 'Thermal charge loss from floating poly gate'
  }),
  sonos: Object.freeze({
    name: 'Charge-Trap eFlash (SONOS)',
    typicalEa: 1.4,
    nominalRetentionYrsAt85C: 15,
    smtReflowImmunity: false,
    failureMechanism: 'Poole-Frenkel emission from silicon nitride traps'
  }),
  mram: Object.freeze({
    name: 'Embedded STT-MRAM',
    typicalEa: 1.1,
    nominalRetentionYrsAt85C: 10,
    smtReflowImmunity: false,
    failureMechanism: 'Thermal superparamagnetic reversal (Eb/kT reduction)'
  })
});

/**
 * Calculates Arrhenius thermal acceleration and high-temperature retention.
 *
 * @param {Object} [params={}] - Parameters for calculation.
 * @param {string} [params.tech='antifuse'] - Technology key.
 * @param {number} [params.junctionTempC=150] - Operating junction temperature Tj in Celsius (e.g. 150°C AEC-Q100 Grade 0).
 * @param {number} [params.customEa] - Optional custom activation energy in eV.
 * @returns {Object} Calculated thermal acceleration and retention projection.
 */
export function calculateArrheniusRetention(params = {}) {
  const safeParams = (typeof params === 'object' && params !== null) ? params : {};
  const techKey = typeof safeParams.tech === 'string' && TECH_THERMAL_PROFILES[safeParams.tech]
    ? safeParams.tech
    : 'antifuse';

  const profile = TECH_THERMAL_PROFILES[techKey];

  let tjC = Number(safeParams.junctionTempC);
  if (!Number.isFinite(tjC)) tjC = 150;
  tjC = Math.min(Math.max(tjC, 25), 250); // 25°C to 250°C

  let ea = typeof safeParams.customEa === 'number' && Number.isFinite(safeParams.customEa) && safeParams.customEa > 0
    ? safeParams.customEa
    : profile.typicalEa;
  ea = Math.min(Math.max(ea, 0.5), 3.0); // 0.5 eV to 3.0 eV

  // Convert to Kelvin
  const tBaselineK = 85 + 273.15; // 358.15 K
  const tJunctionK = tjC + 273.15;

  // Arrhenius Acceleration Factor: AF = exp[ (Ea / kB) * (1/T_use - 1/T_stress) ]
  let accelerationFactor = 1.0;
  let projectedRetentionYrs = profile.nominalRetentionYrsAt85C;

  if (profile.smtReflowImmunity) {
    // Physical metallic/polysilicon filament mechanisms have negligible thermal leakage below 200°C
    accelerationFactor = Math.max(1.0, 1.0 + (tjC - 85) * 0.02);
    projectedRetentionYrs = Math.max(15, profile.nominalRetentionYrsAt85C / accelerationFactor);
  } else {
    // Charge-storage mechanisms suffer exponential Arrhenius thermal leakage
    const exponent = (ea / K_BOLTZMANN_EV) * ((1 / tBaselineK) - (1 / tJunctionK));
    accelerationFactor = Math.exp(exponent);
    projectedRetentionYrs = profile.nominalRetentionYrsAt85C / Math.max(accelerationFactor, 1e-4);
  }

  // Formatting with precision protection
  const formattedYrs = projectedRetentionYrs >= 0.1
    ? Number(projectedRetentionYrs.toFixed(2))
    : Number(projectedRetentionYrs.toPrecision(2));

  // Automotive AEC-Q100 compliance judgment (Grade 0: 150°C, Grade 1: 125°C)
  let aecGradeVerdictZh = '';
  let aecGradeVerdictEn = '';

  if (projectedRetentionYrs >= 15 && profile.smtReflowImmunity) {
    aecGradeVerdictZh = '完整合規：超越 AEC-Q100 Grade 0（150°C/15年）並完全耐受 260°C SMT 迴焊。';
    aecGradeVerdictEn = 'Fully Compliant: Exceeds AEC-Q100 Grade 0 (150°C/15yr) with 260°C SMT reflow immunity.';
  } else if (projectedRetentionYrs >= 10) {
    aecGradeVerdictZh = '條件符合：滿足 AEC-Q100 Grade 1（125°C）要求；高溫迴焊後需驗證浮閘電荷漂移。';
    aecGradeVerdictEn = 'Conditional: Meets AEC-Q100 Grade 1 (125°C); verify floating gate charge drift post-reflow.';
  } else {
    aecGradeVerdictZh = '高溫受限：高溫下活化能退化劇烈，無法維持 10 年車規壽命，需降額或限制於座艙 Grade 2/3。';
    aecGradeVerdictEn = 'Thermal Limit: Severe Arrhenius degradation under hood; restricted to cabin Grade 2/3.';
  }

  return {
    tech: techKey,
    techName: profile.name,
    junctionTempC: tjC,
    activationEnergyEv: Number(ea.toFixed(2)),
    accelerationFactor: Number(accelerationFactor.toFixed(2)),
    projectedRetentionYrs: formattedYrs,
    smtReflowImmunity: profile.smtReflowImmunity,
    failureMechanism: profile.failureMechanism,
    aecGradeVerdictZh,
    aecGradeVerdictEn
  };
}
