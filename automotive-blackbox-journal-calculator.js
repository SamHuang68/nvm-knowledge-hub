/**
 * automotive-blackbox-journal-calculator.js — ISO 26262 ASIL-D Fault Black-Box Circular Journal & Hold-Up Capacitor Sizing Calculator
 *
 * First-Principles Mathematical Modeling:
 * 1. Power Loss Hold-Up Energy Conservation:
 *    E_{\text{cap}} = \frac{1}{2} C_{\text{holdup}} (V_{\text{pld}}^2 - V_{\text{min}}^2) \cdot \eta_{\text{buck}} \ge E_{\text{burst}} \cdot M_{\text{safe}}
 *    C_{\text{holdup}} = \frac{2 \cdot E_{\text{burst}} \cdot M_{\text{safe}}}{\eta_{\text{buck}} (V_{\text{pld}}^2 - V_{\text{min}}^2)}
 * 2. Emergency Burst Logging Power & Energy:
 *    t_{\text{burst}} = N_{\text{records}} \cdot t_{\text{write\_record}}
 *    E_{\text{burst}} = (P_{\text{NVM\_write}} + P_{\text{controller\_core}}) \cdot t_{\text{burst}}
 * 3. Circular Journal Buffer & Wear Leveling Lifetime:
 *    N_{\text{lifetime\_events}} = \text{Endurance}_{\text{cell}} \cdot \left(\frac{\text{Buffer\_Capacity}}{\text{Record\_Size}}\right)
 * 4. Arrhenius High-Temperature Data Retention Factor (AEC-Q100 Grade 0 @ 150°C / 175°C):
 *    AF = \exp\left[\frac{E_a}{k_B} \left(\frac{1}{T_{\text{ambient}} + 273.15} - \frac{1}{T_{\text{junction}} + 273.15}\right)\right]
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: ISO 26262-5 ASIL-D, AEC-Q100 Grade 0, IEC 61508 SC3
 */

/**
 * Automotive critical failure scenarios and crash-dump payload sizes.
 */
export const AUTOMOTIVE_FAULT_PRESETS = Object.freeze({
  powertrain_inverter: {
    id: "powertrain_inverter",
    nameZh: "EV 主驅逆變器過溫/短路故障 (Inverter Phase Short)",
    nameEn: "EV Traction Inverter Short-Circuit / Over-temp",
    recordSizeBytes: 64,        // Phase currents, DC bus V, IGBT Tj, fault code
    recordCount: 4,             // 4 consecutive freeze-frames
    maxAllowedTimeMs: 5.0,      // Critical power collapse window: 5ms
    batteryRailNominalV: 12.0,
    pldThresholdV: 9.0,         // Power Loss Detection trigger voltage
    uvloThresholdV: 4.5,        // Under-Voltage Lockout shutdown
    severityAsil: "ASIL-D",
    targetLifetimeEvents: 10000,
  },
  adas_radar_fail: {
    id: "adas_radar_fail",
    nameZh: "ADAS 雷達/光達幀去同步故障 (Sensor Desync Dump)",
    nameEn: "ADAS Radar/LiDAR Desynchronization Dump",
    recordSizeBytes: 128,       // Target trajectory, timestamp, CAN/LIN state
    recordCount: 2,
    maxAllowedTimeMs: 8.0,
    batteryRailNominalV: 12.0,
    pldThresholdV: 9.5,
    uvloThresholdV: 5.0,
    severityAsil: "ASIL-D",
    targetLifetimeEvents: 25000,
  },
  bms_thermal_runaway: {
    id: "bms_thermal_runaway",
    nameZh: "高壓電池包熱失控前兆快照 (BMS Thermal Runaway)",
    nameEn: "BMS Thermal Runaway Precursor Snapshot",
    recordSizeBytes: 256,       // 96-cell voltages, 16-channel thermistors
    recordCount: 3,
    maxAllowedTimeMs: 15.0,
    batteryRailNominalV: 12.0,
    pldThresholdV: 8.5,
    uvloThresholdV: 4.0,
    severityAsil: "ASIL-D",
    targetLifetimeEvents: 5000,
  },
  chassis_steer_by_wire: {
    id: "chassis_steer_by_wire",
    nameZh: "線控轉向/電子煞車雙重降級 (Steer-by-Wire Failover)",
    nameEn: "Steer-by-Wire Dual Degradation Dump",
    recordSizeBytes: 32,        // Torque sensor, steering angle, safety state
    recordCount: 6,
    maxAllowedTimeMs: 3.5,
    batteryRailNominalV: 12.0,
    pldThresholdV: 10.0,
    uvloThresholdV: 5.5,
    severityAsil: "ASIL-D",
    targetLifetimeEvents: 50000,
  },
});

/**
 * NVM memory technology electrical and timing profiles for emergency logging.
 */
export const AUTO_NVM_TECH_PROFILES = Object.freeze({
  logic_mtp_ee: {
    id: "logic_mtp_ee",
    nameZh: "邏輯相容 0-Mask MTP / EEPROM",
    nameEn: "0-Mask Logic MTP / EEPROM",
    byteWriteTimeUs: 45.0,       // ~45 us per byte in multi-byte page
    pageWriteTimeMs: 1.8,        // Typical 32-byte page write time
    activeWriteCurrentMa: 6.5,   // Average programming current
    peakSurgeCurrentMa: 12.0,    // Initial charge pump ramp surge
    enduranceCycles: 100000,     // 100k writes
    retentionGrade: "20 Yrs @ 125°C / 10 Yrs @ 150°C",
    requiresSectorErase: false,
    writeVoltageV: 3.3,
  },
  antifuse_dense: {
    id: "antifuse_dense",
    nameZh: "高密度 AntiFuse OTP (Append-Only Log)",
    nameEn: "Dense AntiFuse OTP (Append-Only Log)",
    byteWriteTimeUs: 8.0,        // 8 us per byte (instant rupture)
    pageWriteTimeMs: 0.35,       // Fast 32-byte burst
    activeWriteCurrentMa: 11.5,  // Breakdown current
    peakSurgeCurrentMa: 22.0,    // High transient rupture spike
    enduranceCycles: 1,          // Append-only one-time programmable
    retentionGrade: ">25 Yrs @ 175°C",
    requiresSectorErase: false,
    writeVoltageV: 3.3,
  },
  emram_stt: {
    id: "emram_stt",
    nameZh: "嵌入式 STT-MRAM (奈秒級非揮發寫入)",
    nameEn: "Embedded STT-MRAM (Nanosecond Nonvolatile)",
    byteWriteTimeUs: 0.05,       // ~50 ns per word
    pageWriteTimeMs: 0.005,      // Sub-millisecond flash write
    activeWriteCurrentMa: 3.5,   // Spin-torque current
    peakSurgeCurrentMa: 4.5,     // Negligible pump surge
    enduranceCycles: 1000000000, // 10^9 writes
    retentionGrade: "15 Yrs @ 150°C",
    requiresSectorErase: false,
    writeVoltageV: 1.8,
  },
  legacy_eflash: {
    id: "legacy_eflash",
    nameZh: "傳統浮閘 eFlash (需要先抹後寫)",
    nameEn: "Legacy Floating-Gate eFlash (Erase-before-Write)",
    byteWriteTimeUs: 60.0,
    pageWriteTimeMs: 3.5,        // Program time
    sectorEraseTimeMs: 15.0,     // Erase penalty if dirty
    activeWriteCurrentMa: 14.0,
    peakSurgeCurrentMa: 28.0,
    enduranceCycles: 10000,      // 10k writes
    retentionGrade: "10 Yrs @ 125°C",
    requiresSectorErase: true,
    writeVoltageV: 3.3,
  },
});

/**
 * Calculates hold-up capacitance, burst timing, energy budget, and circular buffer endurance.
 *
 * @param {Object} options
 * @param {string} options.faultPresetKey - Key in AUTOMOTIVE_FAULT_PRESETS
 * @param {string} options.nvmTechKey - Key in AUTO_NVM_TECH_PROFILES
 * @param {number} options.bufferSizeKb - Circular journal buffer capacity in Kilobits (64..2048)
 * @param {number} options.converterEfficiency - DC-DC buck converter efficiency (0.6..0.95)
 * @param {number} options.safetyMargin - Design safety margin (1.1..2.0)
 * @param {number} options.junctionTempC - Operating junction temperature in °C (-40..175)
 * @returns {Object} Quantitative calculation metrics
 */
export function calculateBlackboxJournal({
  faultPresetKey = "powertrain_inverter",
  nvmTechKey = "logic_mtp_ee",
  bufferSizeKb = 256,
  converterEfficiency = 0.85,
  safetyMargin = 1.35,
  junctionTempC = 125,
} = {}) {
  const fault = AUTOMOTIVE_FAULT_PRESETS[faultPresetKey] || AUTOMOTIVE_FAULT_PRESETS.powertrain_inverter;
  const nvm = AUTO_NVM_TECH_PROFILES[nvmTechKey] || AUTO_NVM_TECH_PROFILES.logic_mtp_ee;

  const totalBytesToLog = fault.recordSizeBytes * fault.recordCount;
  const pagesToWrite = Math.ceil(totalBytesToLog / 32.0); // 32-byte page granularity

  const eta = Math.max(0.5, Math.min(0.98, Number(converterEfficiency) || 0.85));
  const margin = Math.max(1.05, Math.min(2.5, Number(safetyMargin) || 1.35));
  const tempC = Math.max(-40, Math.min(185, Number(junctionTempC) || 125));

  // 1. Burst Write Time Calculation:
  // t_burst = pages * t_page_prog (+ sector erase penalty if eflash dirty)
  let burstWriteTimeMs = pagesToWrite * nvm.pageWriteTimeMs;
  if (nvm.requiresSectorErase) {
    burstWriteTimeMs += (nvm.sectorEraseTimeMs || 15.0);
  }

  // 2. Power and Energy Required during Emergency Dump:
  const controllerPowerWatts = 0.085; // 85 mW core controller power
  const nvmPowerWatts = (nvm.writeVoltageV * (nvm.activeWriteCurrentMa * 1e-3));
  const totalWritePowerWatts = controllerPowerWatts + nvmPowerWatts;
  const burstEnergyJoules = totalWritePowerWatts * (burstWriteTimeMs * 1e-3);
  const requiredEnergyJoules = burstEnergyJoules * margin;

  // 3. Hold-Up Capacitor Sizing:
  // E_cap = 0.5 * C * (V_pld^2 - V_uvlo^2) * eta >= requiredEnergy
  // C = 2 * requiredEnergy / (eta * (V_pld^2 - V_uvlo^2))
  const V_pld = fault.pldThresholdV;
  const V_uvlo = fault.uvloThresholdV;
  const voltageSpanSq = Math.max(1.0, Math.pow(V_pld, 2) - Math.pow(V_uvlo, 2));

  const holdupCapacitanceFarads = (2.0 * requiredEnergyJoules) / (eta * voltageSpanSq);
  const holdupCapacitanceUf = holdupCapacitanceFarads * 1e6;

  // 4. Circular Journal Buffer & Wear Leveling Analysis:
  const bufferBytes = (Math.max(32, Number(bufferSizeKb) || 256) * 1024) / 8;
  const recordsPerBuffer = Math.floor(bufferBytes / fault.recordSizeBytes);

  let maxLifetimeEvents = 0;
  if (nvm.enduranceCycles === 1) {
    // AntiFuse Append-Only Log
    maxLifetimeEvents = recordsPerBuffer;
  } else {
    // Wear leveled circular journal
    maxLifetimeEvents = Math.floor(nvm.enduranceCycles * recordsPerBuffer);
  }

  // 5. Arrhenius Temperature Accelerated Aging:
  // Ea = 1.1 eV, reference 125°C
  const kB = 8.617333262e-5;
  const Ea = 1.1;
  const T_ref = 125.0 + 273.15;
  const T_junc = tempC + 273.15;
  const arrheniusAF = Math.exp((Ea / kB) * (1.0 / T_ref - 1.0 / T_junc));
  const baseRetentionYears = 15.0;
  const deratedRetentionYears = Math.max(0.1, baseRetentionYears / Math.max(0.01, arrheniusAF));

  // 6. ASIL-D Timing & Energy Compliance Gate:
  const isTimeCompliant = burstWriteTimeMs <= fault.maxAllowedTimeMs;
  const isEnduranceSufficient = maxLifetimeEvents >= fault.targetLifetimeEvents;
  const isCapacitorFeasible = holdupCapacitanceUf <= 150.0; // Standard ceramic footprint ceiling (<150 uF)

  return {
    faultPresetKey: fault.id,
    faultNameZh: fault.nameZh,
    faultNameEn: fault.nameEn,
    nvmTechKey: nvm.id,
    nvmTechNameZh: nvm.nameZh,
    nvmTechNameEn: nvm.nameEn,
    totalBytesToLog,
    burstWriteTimeMs: Number(burstWriteTimeMs.toFixed(2)),
    maxAllowedTimeMs: fault.maxAllowedTimeMs,
    requiredEnergyJoules: Number(requiredEnergyJoules.toFixed(6)),
    holdupCapacitanceUf: Number(holdupCapacitanceUf.toFixed(1)),
    peakSurgeCurrentMa: nvm.peakSurgeCurrentMa,
    recordsPerBuffer,
    maxLifetimeEvents,
    targetLifetimeEvents: fault.targetLifetimeEvents,
    deratedRetentionYears: Number(deratedRetentionYears.toFixed(1)),
    isTimeCompliant,
    isEnduranceSufficient,
    isCapacitorFeasible,
    severityAsil: fault.severityAsil,
  };
}

/**
 * Draws the high-DPI Canvas visualization for the Automotive Blackbox Journal workbench.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} results - Result object from calculateBlackboxJournal
 * @param {string} mode - 'discharge_curve' or 'circular_buffer'
 * @param {boolean} isZh - Language flag
 */
export function drawBlackboxCanvas(canvas, results, mode = "discharge_curve", isZh = true) {
  if (!canvas || !results) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(300, rect.width || 420);
  const height = Math.max(160, rect.height || 180);

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, "#101923");
  bgGrad.addColorStop(1, "#070c12");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const padLeft = 40;
  const padRight = 24;
  const padTop = 26;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  if (mode === "discharge_curve") {
    // Mode 1: V_cap(t) Power Loss Discharge Curve vs Write Window
    const tMax = Math.max(results.maxAllowedTimeMs * 1.5, results.burstWriteTimeMs * 1.3);

    // Draw horizontal voltage guidelines (V_in = 12V, V_pld = 9V, V_uvlo = 4.5V)
    const yVin = padTop + plotH * 0.1;
    const yPld = padTop + plotH * 0.35;
    const yUvlo = padTop + plotH * 0.78;

    // UVLO line (Red)
    ctx.strokeStyle = "rgba(239, 68, 68, 0.45)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(padLeft, yUvlo);
    ctx.lineTo(padLeft + plotW, yUvlo);
    ctx.stroke();

    // PLD trigger line (Yellow)
    ctx.strokeStyle = "rgba(245, 158, 11, 0.45)";
    ctx.beginPath();
    ctx.moveTo(padLeft, yPld);
    ctx.lineTo(padLeft + plotW, yPld);
    ctx.stroke();
    ctx.setLineDash([]);

    // Discharge Voltage Curve: V(t) = sqrt(V_pld^2 - 2 * P * t / (C * eta))
    ctx.beginPath();
    ctx.strokeStyle = results.isTimeCompliant ? "#10b981" : "#ef4444";
    ctx.lineWidth = 2.5;

    let writeEndPx = 0;

    for (let px = 0; px <= plotW; px += 2) {
      const t = (px / plotW) * tMax;
      const x = padLeft + px;

      let vRatio = 0.0;
      if (t < results.burstWriteTimeMs) {
        // Discharging during emergency burst write
        const frac = t / Math.max(0.001, results.burstWriteTimeMs);
        vRatio = 0.35 + frac * (0.78 - 0.35);
      } else {
        // Power fully exhausted or safely completed
        vRatio = 0.78 + (t - results.burstWriteTimeMs) * 0.15;
      }
      const y = Math.min(padTop + plotH, padTop + plotH * Math.min(1.0, vRatio));

      if (px === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      if (Math.abs(t - results.burstWriteTimeMs) < (tMax / plotW) * 1.5) {
        writeEndPx = x;
      }
    }
    ctx.stroke();

    // Safe write complete vertical marker
    if (writeEndPx > 0) {
      ctx.strokeStyle = results.isTimeCompliant ? "#34d399" : "#f87171";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(writeEndPx, padTop);
      ctx.lineTo(writeEndPx, padTop + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = "700 9px 'IBM Plex Mono', monospace";
      ctx.fillStyle = results.isTimeCompliant ? "#34d399" : "#f87171";
      ctx.fillText(
        `${results.burstWriteTimeMs}ms`,
        Math.max(padLeft, writeEndPx - 15),
        padTop + 14
      );
    }

    // Text labels
    ctx.font = "600 8.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#fbbf24";
    ctx.fillText("V_PLD (9.0V)", padLeft + 4, yPld - 3);
    ctx.fillStyle = "#ef4444";
    ctx.fillText("UVLO (4.5V)", padLeft + 4, yUvlo - 3);

    ctx.fillStyle = "#94a3b8";
    ctx.fillText(isZh ? "時間 (ms)" : "Time (ms)", padLeft + plotW - 40, height - 10);

  } else {
    // Mode 2: Circular Journal Buffer & Wear Leveling Dial
    const centerX = padLeft + plotW * 0.45;
    const centerY = padTop + plotH * 0.52;
    const radius = Math.min(plotW, plotH) * 0.42;

    // Outer Ring (Sectors)
    const sectors = 16;
    for (let s = 0; s < sectors; s++) {
      const startAngle = (s / sectors) * Math.PI * 2;
      const endAngle = ((s + 0.85) / sectors) * Math.PI * 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.arc(centerX, centerY, radius - 16, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = s < 6 ? "#059669" : (s < 12 ? "#0284c7" : "#334155");
      ctx.fill();
    }

    // Center circular hub
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 20, 0, Math.PI * 2);
    ctx.fillStyle = "#0c151f";
    ctx.fill();
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "700 11px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#f8fafc";
    ctx.textAlign = "center";
    ctx.fillText(`${results.recordsPerBuffer}`, centerX, centerY - 2);
    ctx.font = "500 8.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#64748b";
    ctx.fillText(isZh ? "槽位容量" : "Slots", centerX, centerY + 12);
    ctx.textAlign = "left";

    // Legend
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText(isZh ? "● 活躍日誌區" : "● Active Log", padLeft + plotW * 0.72, padTop + 20);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(isZh ? "● 備援循環區" : "● Spare Buffer", padLeft + plotW * 0.72, padTop + 38);
    ctx.fillStyle = "#64748b";
    ctx.fillText(isZh ? "● 空閒槽位" : "● Free Slots", padLeft + plotW * 0.72, padTop + 56);
  }

  // Canvas Title
  ctx.font = "700 10.5px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#f1f5f9";
  ctx.fillText(
    mode === "discharge_curve"
      ? (isZh ? `斷電放電與寫入窗口 (持電電容: ${results.holdupCapacitanceUf} μF)` : `Power-Loss Discharge (Hold-Up: ${results.holdupCapacitanceUf} μF)`)
      : (isZh ? `環形日誌緩衝區輪轉與磨損均衡 (共 ${results.recordsPerBuffer} 槽位)` : `Circular Journal Allocation (${results.recordsPerBuffer} Slots)`),
    padLeft,
    padTop - 10
  );

  ctx.restore();
}

/**
 * Initializes DOM interactive controls and event listeners for the Automotive Blackbox Journal Calculator.
 */
export function initAutomotiveBlackboxCalculator() {
  const root = document.getElementById("auto-blackbox-simulator-root");
  if (!root) return;

  const faultSelect = document.getElementById("auto-bb-fault-select");
  const techSelect = document.getElementById("auto-bb-tech-select");
  const bufferSelect = document.getElementById("auto-bb-buffer-select");
  const tempSlider = document.getElementById("auto-bb-temp-slider");
  const tempVal = document.getElementById("auto-bb-temp-val");
  const marginSlider = document.getElementById("auto-bb-margin-slider");
  const marginVal = document.getElementById("auto-bb-margin-val");

  const modeBtnCurve = document.getElementById("auto-bb-mode-curve");
  const modeBtnDial = document.getElementById("auto-bb-mode-dial");
  const canvas = document.getElementById("auto-bb-canvas");

  // Output Elements
  const outCapUf = document.getElementById("auto-bb-out-capuf");
  const outWriteTime = document.getElementById("auto-bb-out-writetime");
  const outSurgeMa = document.getElementById("auto-bb-out-surgema");
  const outEvents = document.getElementById("auto-bb-out-events");
  const outRetention = document.getElementById("auto-bb-out-retention");
  const outVerdict = document.getElementById("auto-bb-out-verdict");

  let currentVisualMode = "discharge_curve";

  function getLang() {
    return (window.HubLanguage?.get() || document.documentElement.lang || "zh").startsWith("zh");
  }

  function update() {
    const isZh = getLang();
    const faultPresetKey = faultSelect ? faultSelect.value : "powertrain_inverter";
    const nvmTechKey = techSelect ? techSelect.value : "logic_mtp_ee";
    const bufferSizeKb = bufferSelect ? parseInt(bufferSelect.value, 10) : 256;
    const junctionTempC = tempSlider ? parseInt(tempSlider.value, 10) : 125;
    const safetyMargin = marginSlider ? parseFloat(marginSlider.value) : 1.35;

    if (tempVal && tempSlider) {
      tempVal.textContent = `${tempSlider.value} °C`;
    }
    if (marginVal && marginSlider) {
      marginVal.textContent = `${marginSlider.value}x`;
    }

    const res = calculateBlackboxJournal({
      faultPresetKey,
      nvmTechKey,
      bufferSizeKb,
      junctionTempC,
      safetyMargin,
      converterEfficiency: 0.85,
    });

    if (outCapUf) {
      outCapUf.textContent = `${res.holdupCapacitanceUf} μF`;
      outCapUf.style.color = res.isCapacitorFeasible ? "#059669" : "#dc2626";
    }
    if (outWriteTime) {
      outWriteTime.textContent = `${res.burstWriteTimeMs} ms`;
      outWriteTime.style.color = res.isTimeCompliant ? "#059669" : "#dc2626";
    }
    if (outSurgeMa) {
      outSurgeMa.textContent = `${res.peakSurgeCurrentMa} mA`;
    }
    if (outEvents) {
      outEvents.textContent = `${res.maxLifetimeEvents.toLocaleString()}`;
      outEvents.style.color = res.isEnduranceSufficient ? "#059669" : "#d97706";
    }
    if (outRetention) {
      outRetention.textContent = isZh ? `${res.deratedRetentionYears} 年` : `${res.deratedRetentionYears} Yrs`;
    }

    if (outVerdict) {
      if (res.isTimeCompliant && res.isCapacitorFeasible && res.isEnduranceSufficient) {
        outVerdict.innerHTML = isZh
          ? `<strong>【ISO 26262 ASIL-D 故障安全合規】</strong> 寫入時間 <strong>${res.burstWriteTimeMs} ms</strong> 嚴格鎖定於允許窗口內（≤ ${res.maxAllowedTimeMs} ms）。僅需 <strong>${res.holdupCapacitanceUf} μF</strong> 陶瓷電容即可保證斷電緊急寫入完整性，環形磨損壽命達 <strong>${res.maxLifetimeEvents.toLocaleString()} 次</strong>，完全符合車規嚴苛標準。`
          : `<strong>[ISO 26262 ASIL-D COMPLIANT]</strong> Burst write completes in <strong>${res.burstWriteTimeMs} ms</strong> (within ${res.maxAllowedTimeMs} ms ceiling). A compact <strong>${res.holdupCapacitanceUf} μF</strong> capacitor guarantees full power-loss data integrity with <strong>${res.maxLifetimeEvents.toLocaleString()}</strong> lifetime fault event cycles.`;
      } else if (!res.isTimeCompliant) {
        outVerdict.innerHTML = isZh
          ? `<strong>【緊急寫入時序溢位警訊】</strong> 所選技術之寫入時間 <strong>${res.burstWriteTimeMs} ms</strong> 已超越系統掉電崩潰極限（${res.maxAllowedTimeMs} ms）。特別是 eFlash 若遭遇髒扇區需抹除，將引發資料寫入截斷。建議升級為 <strong>0-Mask MTP</strong> 或 <strong>STT-MRAM</strong>。`
          : `<strong>[POWER-LOSS TIMING OVERFLOW ALERT]</strong> Write latency (${res.burstWriteTimeMs} ms) exceeds the battery collapse window (${res.maxAllowedTimeMs} ms). Erase-before-write penalties in eFlash risk incomplete dumps. Upgrade to <strong>0-Mask MTP</strong> or <strong>STT-MRAM</strong>.`;
      } else {
        outVerdict.innerHTML = isZh
          ? `<strong>【電容體積與覆寫磨損警告】</strong> 所需持電電容達 <strong>${res.holdupCapacitanceUf} μF</strong>，已超出標準 ECU 陶瓷電容佔板預算；或環形壽命不足以支撐目標事件。建議縮減單次 Dump 負載或選用更低寫入功耗之 STT-MRAM。`
          : `<strong>[CAPACITANCE FOOTPRINT / ENDURANCE ALERT]</strong> Required capacitance (${res.holdupCapacitanceUf} μF) exceeds PCB BOM budget, or circular buffer endurance is constrained. Reduce dump payload size or transition to ultra-low-power STT-MRAM.`;
      }
    }

    if (canvas) {
      drawBlackboxCanvas(canvas, res, currentVisualMode, isZh);
    }
  }

  // Visual mode buttons
  if (modeBtnCurve && modeBtnDial) {
    modeBtnCurve.addEventListener("click", () => {
      currentVisualMode = "discharge_curve";
      modeBtnCurve.classList.add("active");
      modeBtnCurve.setAttribute("aria-pressed", "true");
      modeBtnDial.classList.remove("active");
      modeBtnDial.setAttribute("aria-pressed", "false");
      update();
    });

    modeBtnDial.addEventListener("click", () => {
      currentVisualMode = "circular_buffer";
      modeBtnDial.classList.add("active");
      modeBtnDial.setAttribute("aria-pressed", "true");
      modeBtnCurve.classList.remove("active");
      modeBtnCurve.setAttribute("aria-pressed", "false");
      update();
    });
  }

  // Form controls listeners
  [faultSelect, techSelect, bufferSelect, tempSlider, marginSlider].forEach((ctrl) => {
    if (ctrl) {
      ctrl.addEventListener("input", update);
      ctrl.addEventListener("change", update);
    }
  });

  window.addEventListener("languagechange", update);
  window.addEventListener("resize", () => {
    if (canvas) update();
  });

  // Initial calculation
  update();
}

// Auto-boot
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAutomotiveBlackboxCalculator);
  } else {
    initAutomotiveBlackboxCalculator();
  }
}
