/**
 * iot-energy-tradeoff-calculator.js — Ultra-Low-Power IoT MCU Energy Budget & Battery Lifetime Explorer
 *
 * First-principles electrical modeling of Active, Deep-Sleep, and Wake-up transient energy
 * across emerging eNVM architectures (MRAM, AntiFuse, eFlash, and SRAM retention).
 *
 * Mathematical Foundations:
 * 1. Cycle Energy: E_cycle = P_active * t_active + P_sleep * t_sleep + E_wake
 * 2. Average Current: I_avg = (E_cycle / T_period) / V_batt
 * 3. Battery Lifetime: T_life (Years) = Battery_Capacity_mAh / (I_avg * 8760 h/yr) * (1 - self_discharge)
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: IEEE TCAD, IoT Device Energy Benchmarks (EEMBC CoreMark / ULPMark)
 */

'use strict';

export const IOT_MCU_PROFILES = Object.freeze({
  sram_retention: {
    id: 'sram_retention',
    nameEn: 'Continuous SRAM Retention (Baseline CMOS)',
    nameZh: '全時 SRAM 資料留存 (傳統 CMOS 基準)',
    activeCurrentMA: 3.2,
    sleepCurrentNA: 480.0, // 480 nA SRAM leakage
    wakeTimeUs: 2.0,
    wakeEnergyUJ: 0.02,
    supplyV: 1.2,
    descriptionEn: 'Fast wake-up but persistent 480 nA leakage drains coin cells during long standby.',
    descriptionZh: '喚醒速度快，但 480 nA 全時靜態漏電在長待機情境下持續消耗電池容量。',
  },
  monolithic_eflash: {
    id: 'monolithic_eflash',
    nameEn: 'Monolithic Floating-Gate eFlash (40nm/28nm)',
    nameZh: '單晶片浮閘 eFlash (40nm/28nm)',
    activeCurrentMA: 4.8,
    sleepCurrentNA: 120.0,
    wakeTimeUs: 15.0, // Charge pump ramp-up latency
    wakeEnergyUJ: 0.18, // Charge pump stabilization energy penalty
    supplyV: 1.2,
    descriptionEn: 'High-voltage charge pumps create significant 15 µs ramp-up delay and energy overhead upon every wake.',
    descriptionZh: '高壓電荷泵在每次喚醒時帶來顯著的 15 µs 建立延遲與預充電能量損耗。',
  },
  embedded_mram: {
    id: 'embedded_mram',
    nameEn: 'Embedded STT-MRAM (22ULL / 16FFC)',
    nameZh: '嵌入式 STT-MRAM (22ULL / 16FFC)',
    activeCurrentMA: 3.5,
    sleepCurrentNA: 8.0, // True zero-leakage NVM, AON domain only
    wakeTimeUs: 0.05, // Instant-on
    wakeEnergyUJ: 0.005,
    supplyV: 1.1,
    descriptionEn: 'Zero NVM standby leakage and 50 ns instant wake-up maximizes battery life in duty cycles <0.1%.',
    descriptionZh: '非揮發陣列零靜態漏電、50 ns 瞬間啟動，在工作週期 <0.1% 的極低功耗應用中電池壽命極大化。',
  },
  tiered_antifuse: {
    id: 'tiered_antifuse',
    nameEn: 'Tiered 0-Mask AntiFuse + 0.5V NTV SRAM',
    nameZh: '階層式 0 光罩 AntiFuse + 0.5V 近閾值 SRAM',
    activeCurrentMA: 1.8, // 0.5V near-threshold operation
    sleepCurrentNA: 5.0, // Sub-10 nA AON sleep
    wakeTimeUs: 0.2, // Fast patch reload from AntiFuse
    wakeEnergyUJ: 0.008,
    supplyV: 0.9,
    descriptionEn: '0.5V near-threshold compute combined with sub-10 nA AON sleep enables 15–20 year maintenance-free deployment.',
    descriptionZh: '0.5V 近閾值運算結合 <10 nA AON 極低休眠漏電，實現 15~20 年免更換電池的極限續航。',
  },
});

export const BATTERY_PRESETS = Object.freeze({
  cr2032: { id: 'cr2032', name: 'CR2032 Coin Cell (220 mAh, 3.0V)', capacityMAh: 220, voltageV: 3.0, selfDischargePerYr: 0.01 },
  cr2450: { id: 'cr2450', name: 'CR2450 Coin Cell (600 mAh, 3.0V)', capacityMAh: 600, voltageV: 3.0, selfDischargePerYr: 0.01 },
  lipo45: { id: 'lipo45', name: 'Rechargeable LiPo (45 mAh, 3.7V)', capacityMAh: 45, voltageV: 3.7, selfDischargePerYr: 0.05 },
  supercap: { id: 'supercap', name: 'Solar Supercapacitor (1.5 mAh, 3.3V)', capacityMAh: 1.5, voltageV: 3.3, selfDischargePerYr: 0.15 },
});

/**
 * Calculates cycle energy, average current, and battery lifetime.
 * @param {Object} options Simulation parameters.
 * @return {Object} Computed energy breakdown and battery lifetime.
 */
export function calculateIotEnergyBudget(options = {}) {
  const profile = IOT_MCU_PROFILES[options.profileId] || IOT_MCU_PROFILES.tiered_antifuse;
  const battery = BATTERY_PRESETS[options.batteryId] || BATTERY_PRESETS.cr2032;
  const wakeIntervalSec = Math.max(0.1, parseFloat(options.wakeIntervalSec) || 10.0);
  const activeDurationMs = Math.max(0.1, parseFloat(options.activeDurationMs) || 5.0);

  const tActiveSec = activeDurationMs / 1000;
  const tSleepSec = Math.max(0, wakeIntervalSec - tActiveSec);
  const dutyCyclePct = (tActiveSec / wakeIntervalSec) * 100;

  // 1. Energy Components per Cycle (Microjoules, µJ)
  // Active energy: V_core * I_active * t_active
  const eActiveUJ = profile.supplyV * (profile.activeCurrentMA * 1e-3) * tActiveSec * 1e6;

  // Sleep energy: V_core * I_sleep * t_sleep
  const eSleepUJ = profile.supplyV * (profile.sleepCurrentNA * 1e-9) * tSleepSec * 1e6;

  // Wake-up energy
  const eWakeUJ = profile.wakeEnergyUJ;

  const eTotalCycleUJ = eActiveUJ + eSleepUJ + eWakeUJ;

  // 2. Average Power & Current from Battery
  // Assuming buck/LDO converter efficiency of 88%
  const converterEff = 0.88;
  const pAvgUW = (eTotalCycleUJ / wakeIntervalSec) / converterEff;
  const iAvgUA = pAvgUW / battery.voltageV;

  // 3. Expected Battery Lifetime
  // Effective capacity factoring in annual self-discharge
  const avgCurrentMA = iAvgUA * 1e-3;
  let batteryLifeYears = 0;
  if (avgCurrentMA > 0) {
    const rawHours = battery.capacityMAh / avgCurrentMA;
    const rawYears = rawHours / 8760;
    // Discount by self-discharge rate
    batteryLifeYears = rawYears / (1 + rawYears * battery.selfDischargePerYr);
  }

  // 4. Energy Breakdown Percentages
  const pctActive = parseFloat(((eActiveUJ / eTotalCycleUJ) * 100).toFixed(1));
  const pctSleep = parseFloat(((eSleepUJ / eTotalCycleUJ) * 100).toFixed(1));
  const pctWake = parseFloat(((eWakeUJ / eTotalCycleUJ) * 100).toFixed(1));

  return {
    dutyCyclePct: parseFloat(dutyCyclePct.toFixed(3)),
    iAvgUA: parseFloat(iAvgUA.toFixed(2)),
    batteryLifeYears: parseFloat(batteryLifeYears.toFixed(1)),
    energyUJ: {
      active: parseFloat(eActiveUJ.toFixed(2)),
      sleep: parseFloat(eSleepUJ.toFixed(2)),
      wake: parseFloat(eWakeUJ.toFixed(4)),
      total: parseFloat(eTotalCycleUJ.toFixed(2)),
    },
    percentages: {
      active: pctActive,
      sleep: pctSleep,
      wake: pctWake,
    },
    profile,
    battery,
  };
}

/**
 * Initializes the IoT Energy Tradeoff Calculator interactive UI.
 * @param {string} rootSelector The DOM container selector.
 */
export function initIotEnergyCalculator(rootSelector = '#iot-energy-calculator-root') {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const T = (en, zh) => (window.HubLanguage?.get() === 'zh' ? zh : en);

  const profileSelect = root.querySelector('#iot-profile-select');
  const batterySelect = root.querySelector('#iot-battery-select');
  const intervalSlider = root.querySelector('#iot-interval-slider');
  const intervalVal = root.querySelector('#iot-interval-val');
  const durationSlider = root.querySelector('#iot-duration-slider');
  const durationVal = root.querySelector('#iot-duration-val');

  const lifeDisplay = root.querySelector('#iot-life-display');
  const currentDisplay = root.querySelector('#iot-current-display');
  const dutyDisplay = root.querySelector('#iot-duty-display');
  const barActive = root.querySelector('#iot-bar-active');
  const barSleep = root.querySelector('#iot-bar-sleep');
  const barWake = root.querySelector('#iot-bar-wake');
  const verdictBanner = root.querySelector('#iot-energy-verdict');

  function update() {
    const wakeIntervalSec = parseFloat(intervalSlider?.value || 10.0);
    const activeDurationMs = parseFloat(durationSlider?.value || 5.0);

    if (intervalVal) intervalVal.textContent = `${wakeIntervalSec} s`;
    if (durationVal) durationVal.textContent = `${activeDurationMs} ms`;

    const res = calculateIotEnergyBudget({
      profileId: profileSelect?.value || 'tiered_antifuse',
      batteryId: batterySelect?.value || 'cr2032',
      wakeIntervalSec,
      activeDurationMs,
    });

    if (lifeDisplay) {
      lifeDisplay.textContent = res.batteryLifeYears >= 20 ? '> 20 Yrs' : `${res.batteryLifeYears} Yrs`;
      lifeDisplay.style.color = res.batteryLifeYears >= 10 ? '#059669' : res.batteryLifeYears >= 3 ? '#0284c7' : '#d97706';
    }

    if (currentDisplay) currentDisplay.textContent = `${res.iAvgUA} µA`;
    if (dutyDisplay) dutyDisplay.textContent = `${res.dutyCyclePct}%`;

    // Stacked Energy Bar
    if (barActive) {
      barActive.style.width = `${res.percentages.active}%`;
      barActive.title = T(`Active Compute: ${res.percentages.active}%`, `運算耗能: ${res.percentages.active}%`);
    }
    if (barSleep) {
      barSleep.style.width = `${res.percentages.sleep}%`;
      barSleep.title = T(`Standby Leakage: ${res.percentages.sleep}%`, `待機漏電: ${res.percentages.sleep}%`);
    }
    if (barWake) {
      barWake.style.width = `${res.percentages.wake}%`;
      barWake.title = T(`Wake-up Overhead: ${res.percentages.wake}%`, `喚醒開銷: ${res.percentages.wake}%`);
    }

    // Architect Verdict
    if (verdictBanner) {
      if (res.percentages.sleep > 50) {
        verdictBanner.innerHTML = T(
          `<strong>Architectural Finding:</strong> Standby leakage dominates <strong>${res.percentages.sleep}%</strong> of total battery consumption! Switching from continuous SRAM retention (480 nA) to <em>zero-leakage AntiFuse OTP or STT-MRAM (<10 nA)</em> extends battery life by <strong>${Math.round(480 / res.profile.sleepCurrentNA)}×</strong>.`,
          `<strong>架構師能耗發現：</strong> 待機漏電佔整體電池消耗高達 <strong>${res.percentages.sleep}%</strong>！若將全時通電的 SRAM 留存 (480 nA) 替換為 <em>零待機漏電之 AntiFuse OTP 或 STT-MRAM (<10 nA)</em>，電池使用壽命可延長近 <strong>${Math.round(480 / res.profile.sleepCurrentNA)} 倍</strong>。`
        );
      } else {
        verdictBanner.innerHTML = T(
          `<strong>Architectural Finding:</strong> Active compute dominates <strong>${res.percentages.active}%</strong> of battery energy. The device operates at ${res.dutyCyclePct}% duty cycle, yielding an expected lifespan of <strong>${res.batteryLifeYears} years</strong> on a ${res.battery.name}.`,
          `<strong>架構師能耗發現：</strong> 運算階段佔電池能耗 <strong>${res.percentages.active}%</strong>。裝置在 ${res.dutyCyclePct}% 工作週期下運作，搭配 ${res.battery.name} 預估可達 <strong>${res.batteryLifeYears} 年</strong> 續航力。`
        );
      }
    }
  }

  [profileSelect, batterySelect, intervalSlider, durationSlider].forEach((el) => el?.addEventListener('input', update));
  window.addEventListener('hub:language-change', update);
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initIotEnergyCalculator());
  } else {
    initIotEnergyCalculator();
  }
}
