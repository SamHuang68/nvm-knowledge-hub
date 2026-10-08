import { syncMetricCopy } from './模型數值複製.js';

/**
 * normally-off-energy-harvesting-simulator.js — Normally-Off Computing & Energy Harvesting ULP MCU Simulator
 *
 * First-Principles Electrical & Energy Harvesting Physics:
 * 1. Ambient Micro-Energy Harvesting Harvester Source Equation:
 *    P_{harvest} = \eta_{trans} \cdot P_{ambient} \cdot A_{source}
 * 2. Storage Reservoir Capacitor Energy Balance:
 *    E_{stored} = \frac{1}{2} C_{store} \cdot (V_{charge}^2 - V_{cutoff}^2)
 *    t_{charge} \approx \frac{C_{store} \cdot \Delta V}{I_{harvest}}
 * 3. Cold-Boot Inrush & Charge-Pump Collapse Risk:
 *    If I_{inrush} > I_{harvest}, reservoir voltage collapses causing brownout reboot loops.
 *    AntiFuse OTP: Native 0.75V-0.9V core read, zero charge-pump warmup (t_{warmup} = 0).
 *    eFlash: Mandates V_{dd} >= 1.6V, 20-50us charge-pump stabilization (I_{peak} > 5mA).
 * 4. Normally-Off Intermittent Computing State Save/Restore Overhead:
 *    E_{cycle} = E_{save} + E_{restore} + P_{active} \cdot t_{active} + P_{sleep} \cdot t_{sleep}
 *    Zero-Leakage Non-Volatile State Retention enables complete power-gating during dark periods.
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: EEMBC ULPmark-CoreProfile, IEEE Transactions on Circuits and Systems, IoT Energy Harvesting Specs
 */

/**
 * Energy Harvesting Ambient Source Presets.
 */
export const HARVESTING_SOURCE_PRESETS = Object.freeze({
  indoor_solar_100lux: {
    id: "indoor_solar_100lux",
    nameZh: "室內弱光太陽能 (100 lux / 25 µW 有效採集功率)",
    nameEn: "Indoor Solar Photovoltaic (100 lux / 25 µW Average Power)",
    sourceType: "Amorphous Silicon Photovoltaic Cell",
    nominalPowerUw: 25.0,
    openCircuitVoltageV: 2.2,
    dutyCycleCapabilityPct: 0.5,
  },
  piezo_vibration_industrial: {
    id: "piezo_vibration_industrial",
    nameZh: "工業振動壓電採集 (20 Hz / 0.5g / 65 µW 脈衝功率)",
    nameEn: "Industrial Piezo Vibration (20 Hz / 0.5g / 65 µW Power)",
    sourceType: "PZT Cantilever Piezoelectric Harvester",
    nominalPowerUw: 65.0,
    openCircuitVoltageV: 3.6,
    dutyCycleCapabilityPct: 1.8,
  },
  rf_ambient_sub1g: {
    id: "rf_ambient_sub1g",
    nameZh: "環境微弱 RF 射頻採集 (Sub-1GHz / 10 µW 極微功率)",
    nameEn: "Ambient RF Electromagnetic (Sub-1GHz / 10 µW Ultra-Weak)",
    sourceType: "Rectenna Array Sub-GHz RF Harvester",
    nominalPowerUw: 10.0,
    openCircuitVoltageV: 1.4,
    dutyCycleCapabilityPct: 0.15,
  },
  thermoelectric_teg_human: {
    id: "thermoelectric_teg_human",
    nameZh: "人體皮膚溫差發電 TEG (ΔT = 3°C / 40 µW 持續微功率)",
    nameEn: "Human Skin Thermoelectric TEG (ΔT = 3°C / 40 µW Continuous)",
    sourceType: "Bismuth Telluride (Bi2Te3) Thermopile",
    nominalPowerUw: 40.0,
    openCircuitVoltageV: 1.8,
    dutyCycleCapabilityPct: 1.0,
  },
});

/**
 * MCU Non-Volatile State Retention Technology Profiles.
 */
export const MCU_MEMORY_POWER_PROFILES = Object.freeze({
  antifuse_normally_off: {
    id: "antifuse_normally_off",
    nameZh: "AntiFuse 零待機漏電狀態保留 (冷啟動 0.75V / 零預熱 / 15ns 喚醒)",
    nameEn: "AntiFuse Zero-Standby Retention (0.75V Boot / 0 Warmup / 15ns Wakeup)",
    storageType: "Logic Non-Volatile State Latch + AntiFuse ROM",
    coldBootThresholdV: 0.75,
    chargePumpInrushMa: 0.05, // Native logic read, no high voltage charge pump
    stateRestoreEnergyPj: 18.0,
    stateSaveEnergyPj: 45.0,
    sleepStandbyLeakageNa: 0.05,
    brownoutRiskLevel: "Low (Instant-On, Immune to Pump Collapse)",
  },
  eflash_charge_pump: {
    id: "eflash_charge_pump",
    nameZh: "傳統 eFlash 保持待機 (冷啟動 1.6V / 電荷泵 35µs 暖機 / 8mA 突波)",
    nameEn: "Conventional eFlash (1.6V Boot / 35µs Pump Warmup / 8mA Inrush)",
    storageType: "Embedded Flash Macro",
    coldBootThresholdV: 1.60,
    chargePumpInrushMa: 8.50, // Massive inrush current on pump start
    stateRestoreEnergyPj: 320.0,
    stateSaveEnergyPj: 850.0,
    sleepStandbyLeakageNa: 180.0,
    brownoutRiskLevel: "High (High Inrush Collapses Micro-Capacitor)",
  },
  sram_dvs_sleep: {
    id: "sram_dvs_sleep",
    nameZh: "SRAM 降壓保留模式 (0.6V 保持電壓 / 需持續供電 / 冷啟動狀態遺失)",
    nameEn: "SRAM DVS Retention (0.6V Keep-Alive / Volatile / Power-Hungry)",
    storageType: "Volatile 6T SRAM with Voltage Scaling",
    coldBootThresholdV: 0.90,
    chargePumpInrushMa: 0.20,
    stateRestoreEnergyPj: 8.0,
    stateSaveEnergyPj: 8.0,
    sleepStandbyLeakageNa: 45.0,
    brownoutRiskLevel: "Medium (Total State Loss if Voltage Dips < 0.5V)",
  },
  fram_ferroelectric: {
    id: "fram_ferroelectric",
    nameZh: "鐵電 FeRAM 混合節點 (非揮發 / 冷啟動 1.2V / 待機 15nA 漏電)",
    nameEn: "FeRAM Ferroelectric (Non-Volatile / 1.2V Boot / 15nA Standby)",
    storageType: "Ferroelectric Capacitor Bitcell",
    coldBootThresholdV: 1.20,
    chargePumpInrushMa: 0.85,
    stateRestoreEnergyPj: 48.0,
    stateSaveEnergyPj: 95.0,
    sleepStandbyLeakageNa: 15.0,
    brownoutRiskLevel: "Low-Medium (Fast Access, Polarization Wear)",
  },
});

/**
 * Calculates Normally-Off energy harvesting feasibility and power budget.
 *
 * @param {Object} params
 * @param {string} params.sourceKey
 * @param {string} params.memoryKey
 * @param {number} [params.customCapacitorUf]
 * @param {number} [params.customDutyCyclePct]
 * @returns {Object} Calculated metrics
 */
export function calculateNormallyOffEnergy({
  sourceKey = "indoor_solar_100lux",
  memoryKey = "antifuse_normally_off",
  customCapacitorUf,
  customDutyCyclePct,
} = {}) {
  const source = HARVESTING_SOURCE_PRESETS[sourceKey] || HARVESTING_SOURCE_PRESETS.indoor_solar_100lux;
  const memory = MCU_MEMORY_POWER_PROFILES[memoryKey] || MCU_MEMORY_POWER_PROFILES.antifuse_normally_off;

  const capUf = customCapacitorUf !== undefined ? customCapacitorUf : 47.0; // 47 uF ceramic capacitor
  const dutyPct = customDutyCyclePct !== undefined ? customDutyCyclePct : 0.5; // 0.5% duty cycle

  const pSourceUw = source.nominalPowerUw;
  const vOperating = 1.2; // 1.2V target active rail
  const vCutoff = memory.coldBootThresholdV;

  // 1. Usable Stored Energy in Reservoir Capacitor: 0.5 * C * (V_op^2 - V_cut^2)
  const capFarads = capUf * 1e-6;
  const deltaVSquared = Math.max(0, Math.pow(vOperating, 2) - Math.pow(vCutoff, 2));
  const usableEnergyUj = (0.5 * capFarads * deltaVSquared) * 1e6; // in microjoules (uJ)

  // 2. Charging Time from Cutoff to Operating Voltage:
  // t_charge = E_usable / P_harvest
  const chargeTimeSec = usableEnergyUj / Math.max(pSourceUw, 0.1);

  // 3. Active Power & Sleep Power
  // Active MCU core + read power: ~250 uW
  const pActiveUw = 250.0;
  const pSleepUw = (memory.sleepStandbyLeakageNa * 1e-9 * vOperating) * 1e6; // in uW

  // State Transition Energy per Wakeup Cycle (Save + Restore)
  const stateEnergyUj = (memory.stateSaveEnergyPj + memory.stateRestoreEnergyPj) * 1e-6;

  // Average System Power: P_avg = D * P_active + (1 - D) * P_sleep + f_wake * E_state
  // Assuming 1 cycle every 5 seconds at baseline duty cycle
  const fWakeHz = (dutyPct / 100.0) / 0.025; // 25ms active burst per activation
  const pStateOverheadUw = fWakeHz * stateEnergyUj;
  const averagePowerUw = (dutyPct / 100.0) * pActiveUw + (1.0 - dutyPct / 100.0) * pSleepUw + pStateOverheadUw;

  // 4. Energy Balance Ratio (Harvested Power / Average Power)
  const energyBalanceRatio = pSourceUw / Math.max(averagePowerUw, 0.01);
  const isSelfSustaining = energyBalanceRatio >= 1.0;

  // 5. Inrush Brownout Risk Check
  // Maximum current the capacitor can supply before dropping below V_cutoff in 10us
  const maxSafeInrushMa = (capFarads * (vOperating - vCutoff) / 10e-6) * 1e3;
  const isInrushSafe = memory.chargePumpInrushMa <= maxSafeInrushMa;

  // Operational Verdict
  let statusZh = "";
  let statusEn = "";
  if (isSelfSustaining && isInrushSafe) {
    statusZh = "能量完全自給自足 (Autonomous · 零電池永久運作)";
    statusEn = "Self-Sustaining Autonomous (Zero Battery Lifetime)";
  } else if (!isInrushSafe) {
    statusZh = "開機崩潰風險 (Inrush Brownout · 電荷泵突波拉垮電源)";
    statusEn = "Brownout Crash Risk (Charge Pump Inrush Exceeds Storage)";
  } else {
    statusZh = "電量赤字 (Energy Deficit · 需降低占空比或擴充電容)";
    statusEn = "Energy Deficit (Duty Cycle Too High for Harvester)";
  }

  return {
    sourceKey,
    memoryKey,
    capUf,
    dutyPct,
    pSourceUw: Number(pSourceUw.toFixed(1)),
    usableEnergyUj: Number(usableEnergyUj.toFixed(2)),
    chargeTimeSec: Number(chargeTimeSec.toFixed(2)),
    averagePowerUw: Number(averagePowerUw.toFixed(2)),
    energyBalanceRatio: Number(energyBalanceRatio.toFixed(2)),
    isSelfSustaining,
    isInrushSafe,
    statusZh,
    statusEn,
    sourceNameZh: source.nameZh,
    sourceNameEn: source.nameEn,
    memoryNameZh: memory.nameZh,
    memoryNameEn: memory.nameEn,
  };
}

/**
 * Draws the Normally-Off Energy Harvesting Canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {"voltage_trace"|"power_duty_curve"} mode
 */
export function drawNormallyOffCanvas(canvas, metrics, mode = "voltage_trace") {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(rect.width, 320);
  const height = Math.max(rect.height, 180);

  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.scale(dpr, dpr);

  const w = width;
  const h = height;

  ctx.fillStyle = "#0c121e";
  ctx.fillRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = "rgba(51, 65, 85, 0.4)";
  ctx.lineWidth = 1;
  const gridX = 40;
  const gridY = 30;
  for (let x = gridX; x < w; x += gridX) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = gridY; y < h; y += gridY) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const plotX0 = 55;
  const plotX1 = w - 25;
  const plotY0 = 24;
  const plotY1 = h - 30;
  const plotW = plotX1 - plotX0;
  const plotH = plotY1 - plotY0;

  if (mode === "voltage_trace") {
    // Mode A: Capacitor Voltage Trace Profile (Sawtooth Charge/Discharge)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("V_cap (V)", 6, plotY0 + 6);
    ctx.fillText("0s", plotX0, plotY1 + 16);
    ctx.fillText("2.5s", plotX0 + plotW * 0.5 - 10, plotY1 + 16);
    ctx.fillText("5.0s", plotX1 - 25, plotY1 + 16);

    ctx.fillText("1.5V", plotX0 - 28, plotY0 + 4);
    ctx.fillText("0.75V", plotX0 - 32, plotY0 + plotH * 0.5 + 4);
    ctx.fillText("0.0V", plotX0 - 28, plotY1 + 4);

    const maxV = 1.5;

    // Draw Cutoff Voltage Threshold Line
    const vCut = metrics.memoryKey === "antifuse_normally_off" ? 0.75 : (metrics.memoryKey === "eflash_charge_pump" ? 1.6 : 0.9);
    const cutY = plotY1 - (Math.min(maxV, vCut) / maxV) * plotH;
    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotX0, cutY);
    ctx.lineTo(plotX1, cutY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ef4444";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillText(`V_cut = ${vCut}V`, plotX1 - 70, cutY - 4);

    // Draw Voltage Sawtooth Waveform
    ctx.beginPath();
    ctx.strokeStyle = metrics.isSelfSustaining && metrics.isInrushSafe ? "#10b981" : "#f59e0b";
    ctx.lineWidth = 2.5;

    const periods = 3;
    const periodWidth = plotW / periods;

    for (let p = 0; p < periods; p++) {
      const startX = plotX0 + p * periodWidth;
      const chargeEndX = startX + periodWidth * 0.85;
      const dischargeEndX = startX + periodWidth;

      const yStart = cutY;
      const yPeak = plotY0 + (plotH * 0.2); // 1.2V target

      if (p === 0) ctx.moveTo(startX, yStart);
      // Charging ramp
      ctx.lineTo(chargeEndX, yPeak);

      // Active Burst Discharge
      if (!metrics.isInrushSafe && metrics.memoryKey === "eflash_charge_pump") {
        // Severe inrush collapses below cutoff
        ctx.lineTo(chargeEndX + periodWidth * 0.05, plotY1);
        ctx.lineTo(dischargeEndX, plotY1);
      } else {
        ctx.lineTo(dischargeEndX, yStart);
      }
    }
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Cap: ${metrics.capUf} µF | Harvester: ${metrics.pSourceUw} µW`, plotX0 + 10, plotY0 + 12);

  } else {
    // Mode B: Duty Cycle (0.01% to 5%) vs Average Power (uW)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("Power (µW)", 6, plotY0 + 6);
    ctx.fillText("0.01%", plotX0, plotY1 + 16);
    ctx.fillText("2.5%", plotX0 + plotW * 0.5 - 10, plotY1 + 16);
    ctx.fillText("5.0%", plotX1 - 25, plotY1 + 16);

    const maxPower = 50.0;
    ctx.fillText(`${maxPower}`, plotX0 - 24, plotY0 + 4);
    ctx.fillText(`${maxPower / 2}`, plotX0 - 24, plotY0 + plotH * 0.5 + 4);
    ctx.fillText("0", plotX0 - 16, plotY1 + 4);

    // Draw Harvester Power Generation Rail (Horizontal line)
    const harvestY = plotY1 - (Math.min(maxPower, metrics.pSourceUw) / maxPower) * plotH;
    ctx.strokeStyle = "#38bdf8";
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(plotX0, harvestY);
    ctx.lineTo(plotX1, harvestY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillText(`Harvester In: ${metrics.pSourceUw} µW`, plotX1 - 110, harvestY - 4);

    // Draw Consumption Curves
    const drawPowerCurve = (memoryKey, color, label, isCurrent) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      if (!isCurrent) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);

      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const duty = (i / steps) * 5.0; // 0 to 5%
        const sim = calculateNormallyOffEnergy({
          sourceKey: metrics.sourceKey,
          memoryKey,
          customCapacitorUf: metrics.capUf,
          customDutyCyclePct: duty,
        });
        const clampedP = Math.min(maxPower, sim.averagePowerUw);
        const px = plotX0 + (duty / 5.0) * plotW;
        const py = plotY1 - (clampedP / maxPower) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawPowerCurve("eflash_charge_pump", "#ef4444", "eFlash", metrics.memoryKey === "eflash_charge_pump");
    drawPowerCurve("sram_dvs_sleep", "#f59e0b", "SRAM DVS", metrics.memoryKey === "sram_dvs_sleep");
    drawPowerCurve("antifuse_normally_off", "#10b981", "AntiFuse", metrics.memoryKey === "antifuse_normally_off");

    // Current Operating Marker
    const currDuty = Math.min(5.0, metrics.dutyPct);
    const currP = Math.min(maxPower, metrics.averagePowerUw);
    const markerX = plotX0 + (currDuty / 5.0) * plotW;
    const markerY = plotY1 - (currP / maxPower) * plotH;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Duty: ${currDuty}% | P_avg: ${currP} µW`, Math.min(markerX + 8, plotX1 - 150), Math.max(markerY - 8, plotY0 + 12));
  }

  ctx.restore();
}

/**
 * Initializes the Normally-Off Energy Harvesting Simulator UI.
 *
 * @param {HTMLElement} [container]
 */
export function initNormallyOffSimulator(container) {
  const root = container || document.getElementById("normally-off-simulator-root");
  if (!root) return;

  const sourceSelect = root.querySelector("#norm-source-select");
  const memorySelect = root.querySelector("#norm-memory-select");
  const capSlider = root.querySelector("#norm-cap-slider");
  const capVal = root.querySelector("#norm-cap-val");
  const dutySlider = root.querySelector("#norm-duty-slider");
  const dutyVal = root.querySelector("#norm-duty-val");

  const outPowerIn = root.querySelector("#norm-out-powerin");
  const outEnergyStored = root.querySelector("#norm-out-energystored");
  const outChargeTime = root.querySelector("#norm-out-chargetime");
  const outAvgPower = root.querySelector("#norm-out-avgpower");
  const outRatio = root.querySelector("#norm-out-ratio");
  const outStatus = root.querySelector("#norm-out-status");
  const outVerdict = root.querySelector("#norm-out-verdict");

  const canvas = root.querySelector("#norm-canvas");
  const btnVoltage = root.querySelector("#norm-mode-voltage");
  const btnPower = root.querySelector("#norm-mode-power");

  let currentMode = "voltage_trace";

  // Populate Selects if empty
  if (sourceSelect && sourceSelect.options.length === 0) {
    Object.values(HARVESTING_SOURCE_PRESETS).forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s.id;
      opt.textContent = `${s.nameEn}`;
      sourceSelect.appendChild(opt);
    });
    sourceSelect.value = "indoor_solar_100lux";
  }

  if (memorySelect && memorySelect.options.length === 0) {
    Object.values(MCU_MEMORY_POWER_PROFILES).forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.nameEn}`;
      memorySelect.appendChild(opt);
    });
    memorySelect.value = "antifuse_normally_off";
  }

  function update() {
    const sourceKey = sourceSelect ? sourceSelect.value : "indoor_solar_100lux";
    const memoryKey = memorySelect ? memorySelect.value : "antifuse_normally_off";
    const capUf = capSlider ? Number(capSlider.value) : 47;
    const dutyPct = dutySlider ? Number(dutySlider.value) : 0.5;

    if (capVal) capVal.textContent = `${capUf} µF`;
    if (dutyVal) dutyVal.textContent = `${dutyPct.toFixed(2)}%`;

    const m = calculateNormallyOffEnergy({
      sourceKey,
      memoryKey,
      customCapacitorUf: capUf,
      customDutyCyclePct: dutyPct,
    });

    if (outPowerIn) outPowerIn.textContent = `${m.pSourceUw} µW`;
    if (outEnergyStored) outEnergyStored.textContent = `${m.usableEnergyUj} µJ`;
    if (outChargeTime) outChargeTime.textContent = `${m.chargeTimeSec} s`;
    if (outAvgPower) outAvgPower.textContent = `${m.averagePowerUw} µW`;
    if (outRatio) {
      outRatio.textContent = `${m.energyBalanceRatio}x`;
      outRatio.style.color = m.isSelfSustaining ? "#059669" : "#dc2626";
    }
    if (outStatus) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outStatus.textContent = isZh ? m.statusZh : m.statusEn;
      outStatus.style.color = (m.isSelfSustaining && m.isInrushSafe) ? "#059669" : "#dc2626";
    }

    if (canvas) {
      drawNormallyOffCanvas(canvas, m, currentMode);
    }

    // 複製狀態獨立呈現，不改動模型數值。
    syncMetricCopy([outPowerIn, outEnergyStored, outChargeTime, outAvgPower, outRatio, outStatus]);
    const exportControl = root.querySelector('#normally-off-export-csv-btn');
    if (exportControl) {
      const isZhLang = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
      exportControl.textContent = isZhLang ? '📥 匯出常時關閉能量平衡 CSV' : '📥 Export Energy Balance CSV';
      exportControl.setAttribute('aria-label', isZhLang ? '匯出常時關閉能量採集與微功耗平衡資料集為 CSV 檔案' : 'Export normally-off energy harvesting and power balance dataset as CSV file');
    }

    if (outVerdict) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outVerdict.innerHTML = isZh
        ? `<strong>常時關閉能量採集判定：</strong> 在 <code>${m.sourceNameZh}</code> (${m.pSourceUw} µW) 搭配 <code>${m.capUf} µF</code> 電容與 <code>${m.dutyPct}%</code> 占空比下，<code>${m.memoryNameZh}</code> 的系統平均功耗為 <strong>${m.averagePowerUw} µW</strong>，能量平衡比為 <strong>${m.energyBalanceRatio}x</strong>。運行狀態：<strong style="color:${(m.isSelfSustaining && m.isInrushSafe) ? '#059669' : '#dc2626'};">${m.statusZh}</strong>。本模擬係依據一階能量守恆與冷啟動電容充放電模型推算，實際 IoT 裝置須依據具體電源管理 IC (PMIC) 與待機漏電實測校驗。`
        : `<strong>Normally-Off Energy Harvesting Verdict:</strong> Powered by <code>${m.sourceNameEn}</code> (${m.pSourceUw} µW) with a <code>${m.capUf} µF</code> reservoir at <code>${m.dutyPct}%</code> duty cycle, the <code>${m.memoryNameEn}</code> architecture consumes an average of <strong>${m.averagePowerUw} µW</strong> (Energy Balance: <strong>${m.energyBalanceRatio}x</strong>). Operational status: <strong style="color:${(m.isSelfSustaining && m.isInrushSafe) ? '#059669' : '#dc2626'};">${m.statusEn}</strong>. Illustrative first-order energy balance model; validate against PMIC bench tests and cold-boot inrush measurements.`;
    }
  }

  // Export CSV Action for Normally-Off Energy Harvesting
  function downloadCsv(filename, csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const presetContainer = sourceSelect?.parentNode;
  if (presetContainer && !presetContainer.querySelector('#normally-off-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'normally-off-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-top: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.4); background: rgba(15, 23, 42, 0.6); color: #34d399; cursor: pointer;';
    const isZhLang = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
    exportBtn.textContent = isZhLang ? '📥 匯出常時關閉能量平衡 CSV' : '📥 Export Energy Balance CSV';
    exportBtn.setAttribute('aria-label', isZhLang ? '匯出常時關閉能量採集與微功耗平衡資料集為 CSV 檔案' : 'Export normally-off energy harvesting and power balance dataset as CSV file');
    exportBtn.addEventListener('click', () => {
      const sKey = sourceSelect ? sourceSelect.value : 'indoor_solar_100lux';
      const mKey = memorySelect ? memorySelect.value : 'antifuse_normally_off';
      let csv = 'Capacitor_uF,DutyCycle_Pct,HarvestedPower_uW,AveragePower_uW,UsableEnergy_uJ,ChargeTime_s,EnergyBalanceRatio\n';
      const capVals = [10, 22, 47, 100, 220];
      const dutyVals = [0.1, 0.5, 1.0, 2.0, 5.0];
      for (const cap of capVals) {
        for (const duty of dutyVals) {
          const res = calculateNormallyOffEnergy({
            sourceKey: sKey,
            memoryKey: mKey,
            customCapacitorUf: cap,
            customDutyCyclePct: duty,
          });
          csv += `${cap},${duty},${res.pSourceUw},${res.averagePowerUw},${res.usableEnergyUj},${res.chargeTimeSec},${res.energyBalanceRatio}\n`;
        }
      }
      downloadCsv(`normally_off_energy_${sKey}_${mKey}.csv`, csv);
    });
    presetContainer.appendChild(exportBtn);
  }

  if (sourceSelect) sourceSelect.addEventListener("change", update);
  if (memorySelect) memorySelect.addEventListener("change", update);
  if (capSlider) capSlider.addEventListener("input", update);
  if (dutySlider) dutySlider.addEventListener("input", update);

  if (btnVoltage) {
    btnVoltage.addEventListener("click", () => {
      currentMode = "voltage_trace";
      btnVoltage.classList.add("active");
      btnVoltage.setAttribute("aria-pressed", "true");
      btnVoltage.style.background = "#0284c7";
      btnVoltage.style.color = "#ffffff";
      btnVoltage.style.borderColor = "#38bdf8";
      if (btnPower) {
        btnPower.classList.remove("active");
        btnPower.setAttribute("aria-pressed", "false");
        btnPower.style.background = "#1e293b";
        btnPower.style.color = "#94a3b8";
        btnPower.style.borderColor = "#475569";
      }
      update();
    });
  }

  if (btnPower) {
    btnPower.addEventListener("click", () => {
      currentMode = "power_duty_curve";
      btnPower.classList.add("active");
      btnPower.setAttribute("aria-pressed", "true");
      btnPower.style.background = "#0284c7";
      btnPower.style.color = "#ffffff";
      btnPower.style.borderColor = "#38bdf8";
      if (btnVoltage) {
        btnVoltage.classList.remove("active");
        btnVoltage.setAttribute("aria-pressed", "false");
        btnVoltage.style.background = "#1e293b";
        btnVoltage.style.color = "#94a3b8";
        btnVoltage.style.borderColor = "#475569";
      }
      update();
    });
  }

  window.addEventListener("resize", () => {
    if (canvas) update();
  });
  window.addEventListener('hub:language-change', () => update());
  window.addEventListener('languagechange', () => update());
  update();
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initNormallyOffSimulator());
  } else {
    initNormallyOffSimulator();
  }
}
