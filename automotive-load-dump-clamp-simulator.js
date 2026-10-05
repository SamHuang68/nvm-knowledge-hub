/**
 * automotive-load-dump-clamp-simulator.js — ISO 16750-2 Load Dump Transient & High-Temp Charge Pump Clamping Safety Simulator
 *
 * First-Principles Mathematical Modeling:
 * 1. ISO 16750-2 / ISO 7637-2 Automotive Load Dump Pulse 5a / 5b:
 *    V_{\text{surge}}(t) = V_{\text{nominal}} + (V_s - V_{\text{nominal}}) \cdot \exp\left(-\frac{t}{t_d}\right)
 * 2. Transient Clamping Current & Dynamic Dissipated Power:
 *    I_{\text{clamp}}(t) = \max\left(0, \frac{V_{\text{surge}}(t) - V_{\text{clamp}}}{R_{\text{source}} + R_{\text{on\_clamp}}}\right)
 *    P_{\text{dissipated}}(t) = V_{\text{clamped}}(t) \cdot I_{\text{clamp}}(t)
 * 3. High Junction Temperature (AEC-Q100 Grade 0: 150°C~175°C) Thermal Drift:
 *    V_{\text{clamp}}(T_j) = V_{\text{clamp0}} \cdot [1 + \alpha_T \cdot (T_j - 25\,\text{°C})]
 *    I_{\text{leak}}(T_j) = I_0 \cdot \exp\left(-\frac{E_a}{k_B} \cdot \left(\frac{1}{T_j} - \frac{1}{T_0}\right)\right)
 * 4. Internal Charge Pump VPP Steer & Dielectric Breakdown Margin:
 *    V_{\text{stress}} = V_{\text{target}} + \kappa_{\text{feedthrough}} \cdot (V_{\text{clamped}} - V_{\text{nominal}})
 *    \text{Margin}_{\text{breakdown}} = \frac{V_{\text{bd}} - V_{\text{stress}}}{V_{\text{bd}}} \times 100\%
 *    \Delta V_{\text{ripple}} = \frac{I_{\text{load}} + I_{\text{leak}}(T_j)}{f_{\text{pump}} \cdot C_{\text{fly}}}
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: ISO 16750-2 (Road vehicles electrical loads), ISO 7637-2 (Electrical transients), AEC-Q100 Grade 0 (-40°C to +175°C)
 */

/**
 * Automotive power rail load dump transient pulse presets.
 */
export const LOAD_DUMP_PRESETS = Object.freeze({
  iso16750_pulse5a_unsuppressed: {
    id: "iso16750_pulse5a_unsuppressed",
    nameZh: "ISO 16750-2 脈衝 5a (未抑制負載突降, 87V / 400ms)",
    nameEn: "ISO 16750-2 Pulse 5a (Unsuppressed Load Dump, 87V / 400ms)",
    nominalV: 13.5,
    peakSurgeV: 87.0,
    durationMs: 400.0,
    sourceResistanceOhm: 1.0,     // Ri in ISO standard
    standardReference: "ISO 16750-2:2012 / 12V System Test A",
    energyClass: "Severe (High Thermal Energy)",
  },
  iso16750_pulse5b_suppressed: {
    id: "iso16750_pulse5b_suppressed",
    nameZh: "ISO 16750-2 脈衝 5b (發電機集中抑制, 35V / 200ms)",
    nameEn: "ISO 16750-2 Pulse 5b (Centrally Suppressed, 35V / 200ms)",
    nominalV: 13.5,
    peakSurgeV: 35.0,
    durationMs: 200.0,
    sourceResistanceOhm: 0.5,
    standardReference: "ISO 16750-2:2012 / 12V System Test B",
    energyClass: "Moderate (Avalanche Diode Clamped)",
  },
  mhev_48v_pulse: {
    id: "mhev_48v_pulse",
    nameZh: "48V 輕油電 (MHEV) 主驅逆變器突波 (70V / 100ms)",
    nameEn: "48V MHEV Powertrain Inverter Surge (70V / 100ms)",
    nominalV: 48.0,
    peakSurgeV: 70.0,
    durationMs: 100.0,
    sourceResistanceOhm: 0.8,
    standardReference: "VDA 320 / ISO 21780 Mild-Hybrid",
    energyClass: "High-Voltage 48V Domain",
  },
  inductive_kick_pulse2a: {
    id: "inductive_kick_pulse2a",
    nameZh: "ISO 7637-2 脈衝 2a (線束電感反衝, +55V / 0.05ms)",
    nameEn: "ISO 7637-2 Pulse 2a (Inductive Wiring Kick, +55V / 0.05ms)",
    nominalV: 13.5,
    peakSurgeV: 55.0,
    durationMs: 0.05,             // 50 microseconds
    sourceResistanceOhm: 10.0,
    standardReference: "ISO 7637-2:2011 Inductive Spike",
    energyClass: "Fast Fast-Rise Transient",
  },
});

/**
 * High-voltage clamping and charge-pump protection circuit topologies.
 */
export const CLAMP_PROTECTION_TOPOLOGIES = Object.freeze({
  active_fet_surge_stopper: {
    id: "active_fet_surge_stopper",
    nameZh: "主動式 MOSFET 電子保險絲 (Active Surge Stopper, <50ns 響應)",
    nameEn: "Active MOSFET Surge Stopper (<50ns Response)",
    clampVoltageNominal: 18.0,    // Clamps output strictly to 18V (or 54V for 48V)
    dynamicResistanceOhm: 0.025,
    responseDelayNs: 35,
    tempCoeffAlpha: 0.0006,       // Minimal thermal coefficient
    dielectricVbd: 14.5,          // Internal pumped breakdown rating
    powerHandlingLimitWatts: 2500,
    isGrade0Approved: true,
  },
  external_tvs_sm8s: {
    id: "external_tvs_sm8s",
    nameZh: "外置車規級 TVS 二極體 (SM8S36A, 6600W 封裝)",
    nameEn: "External Automotive TVS Diode (SM8S36A 6600W)",
    clampVoltageNominal: 36.0,
    dynamicResistanceOhm: 0.12,
    responseDelayNs: 5,           // Very fast avalanche
    tempCoeffAlpha: 0.0011,       // Positive temp drift ~0.11%/K
    dielectricVbd: 14.5,
    powerHandlingLimitWatts: 6600,
    isGrade0Approved: true,
  },
  internal_zener_cap: {
    id: "internal_zener_cap",
    nameZh: "晶片內建齊納箝位 + 去耦電容 (On-Die Zener, 緊湊低成本)",
    nameEn: "On-Die Internal Zener Clamp + Decoupling Cap",
    clampVoltageNominal: 28.0,
    dynamicResistanceOhm: 0.85,   // High on-die silicon resistance
    responseDelayNs: 15,
    tempCoeffAlpha: 0.0018,
    dielectricVbd: 12.0,          // Lower breakdown ceiling
    powerHandlingLimitWatts: 180, // Thermal limit on bare die
    isGrade0Approved: false,      // Risk of thermal runaway at 175°C
  },
  hybrid_multistage: {
    id: "hybrid_multistage",
    nameZh: "雙級混合拓撲 (外置 TVS 粗保護 + 晶片內主動 LDO 箝位)",
    nameEn: "Dual-Stage Hybrid (External TVS + On-Die LDO Active Clamp)",
    clampVoltageNominal: 16.5,
    dynamicResistanceOhm: 0.015,
    responseDelayNs: 10,
    tempCoeffAlpha: 0.0004,
    dielectricVbd: 16.0,
    powerHandlingLimitWatts: 8000,
    isGrade0Approved: true,       // Gold standard for AEC-Q100 Grade 0
  },
});

/**
 * Calculates automotive load dump clamping voltage, peak dissipated power, and charge pump breakdown margin.
 *
 * @param {Object} options
 * @param {string} [options.pulseKey="iso16750_pulse5a_unsuppressed"]
 * @param {string} [options.topologyKey="active_fet_surge_stopper"]
 * @param {number} [options.temperatureC=175] - Junction temperature Tj (-40°C to +175°C)
 * @param {number} [options.clampLimitV=18.0] - Target clamping threshold (14V to 65V)
 * @returns {Object} Comprehensive load dump calculations
 */
export function calculateAutomotiveLoadDumpClamp({
  pulseKey = "iso16750_pulse5a_unsuppressed",
  topologyKey = "active_fet_surge_stopper",
  temperatureC = 175,
  clampLimitV = 18.0,
} = {}) {
  const pulse = LOAD_DUMP_PRESETS[pulseKey] || LOAD_DUMP_PRESETS.iso16750_pulse5a_unsuppressed;
  const topology = CLAMP_PROTECTION_TOPOLOGIES[topologyKey] || CLAMP_PROTECTION_TOPOLOGIES.active_fet_surge_stopper;

  const tj = Math.max(-40, Math.min(200, Number(temperatureC) || 175));
  const is48v = pulse.nominalV > 30.0;

  // Clamping voltage adjusted for 48V domain and thermal drift:
  let baseClampV = Number(clampLimitV) || (is48v ? 56.0 : 18.0);
  if (is48v && baseClampV < 50.0) baseClampV = 56.0;

  const tempDelta = Math.max(-65, tj - 25);
  const effectiveClampV = baseClampV * (1.0 + topology.tempCoeffAlpha * tempDelta);

  // Peak Clamping Current:
  // I_clamp_peak = (V_surge_peak - V_clamp_eff) / (R_source + R_dyn)
  const totalR = pulse.sourceResistanceOhm + topology.dynamicResistanceOhm;
  const peakClampedV = Math.min(pulse.peakSurgeV, effectiveClampV + (pulse.peakSurgeV - effectiveClampV) * (topology.dynamicResistanceOhm / totalR));
  const peakClampCurrentA = Math.max(0, (pulse.peakSurgeV - effectiveClampV) / totalR);

  // Peak Dissipated Power (Watts):
  const peakDissipatedWatts = Number((peakClampedV * peakClampCurrentA).toFixed(1));

  // High Temperature Arrhenius Leakage Multiplier:
  // Ea = 0.85 eV for silicon reverse junction
  const kEv = 8.617333262e-5;
  const tKelvin = tj + 273.15;
  const tRefKelvin = 298.15;
  const leakageRatio = Math.exp((0.85 / kEv) * (1.0 / tRefKelvin - 1.0 / tKelvin));
  const baseLeakageUa = 0.05;
  const highTempLeakageMa = Number((baseLeakageUa * leakageRatio / 1000.0).toFixed(2));

  // Charge Pump Stress & Dielectric Breakdown Margin:
  // Target VPP for eFlash/AntiFuse = 8.5V (or 12.0V for high-voltage OTP)
  const vTargetVpp = 8.5;
  const couplingFactor = 0.12; // 12% power-supply rejection feedthrough
  const vPumpStressPeak = vTargetVpp + couplingFactor * Math.max(0, peakClampedV - pulse.nominalV);
  const dielectricMarginPct = Math.max(0, Number((((topology.dielectricVbd - vPumpStressPeak) / topology.dielectricVbd) * 100.0).toFixed(1)));

  // Charge Pump Output Voltage Ripple (mV):
  // Delta V = (I_load + I_leak) / (f_pump * C_fly)
  // f_pump = 20 MHz, C_fly = 250 pF
  const fPumpHz = 20e6;
  const cFlyFarads = 250e-12;
  const iLoadTotalA = 5e-3 + (highTempLeakageMa * 1e-3);
  const pumpRippleMv = Math.min(1200, Math.round((iLoadTotalA / (fPumpHz * cFlyFarads)) * 1000.0));

  // Compliance Rating:
  let complianceRating = "PASS (AEC-Q100 Grade 0 Compliant)";
  let isCompliant = true;
  if (dielectricMarginPct < 15.0 || peakDissipatedWatts > topology.powerHandlingLimitWatts || pumpRippleMv > 350) {
    complianceRating = "FAIL (Thermal / Overvoltage Exceeded)";
    isCompliant = false;
  } else if (dielectricMarginPct < 25.0 || !topology.isGrade0Approved) {
    complianceRating = "MARGINAL (Grade 1 / Warning)";
    isCompliant = false;
  }

  return {
    pulseKey: pulse.id,
    pulseNameZh: pulse.nameZh,
    pulseNameEn: pulse.nameEn,
    topologyKey: topology.id,
    topologyNameZh: topology.nameZh,
    topologyNameEn: topology.nameEn,
    tj,
    peakSurgeV: pulse.peakSurgeV,
    peakClampedV: Number(peakClampedV.toFixed(1)),
    peakClampCurrentA: Number(peakClampCurrentA.toFixed(1)),
    peakDissipatedWatts,
    highTempLeakageMa,
    vPumpStressPeak: Number(vPumpStressPeak.toFixed(2)),
    dielectricMarginPct,
    pumpRippleMv,
    complianceRating,
    isCompliant,
    powerLimitWatts: topology.powerHandlingLimitWatts,
  };
}

/**
 * Renders dual-mode Canvas visualization for automotive load dump clamping.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics - Output from calculateAutomotiveLoadDumpClamp
 * @param {string} [mode="transient"] - "transient" (Voltage waveform) or "chargepump" (Charge pump stages & ripple)
 */
export function drawLoadDumpClampCanvas(canvas, metrics, mode = "transient") {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const rect = canvas.getBoundingClientRect();
  const width = (canvas.width = (rect.width || 420) * (window.devicePixelRatio || 1));
  const height = (canvas.height = 180 * (window.devicePixelRatio || 1));
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  const w = width / (window.devicePixelRatio || 1);
  const h = height / (window.devicePixelRatio || 1);

  // Background
  ctx.fillStyle = "#080d16";
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = "rgba(148, 163, 184, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 40; x < w - 20; x += 50) {
    ctx.moveTo(x, 20);
    ctx.lineTo(x, h - 30);
  }
  for (let y = 30; y < h - 25; y += 30) {
    ctx.moveTo(40, y);
    ctx.lineTo(w - 20, y);
  }
  ctx.stroke();

  if (mode === "transient") {
    // Mode 1: Load Dump Voltage Waveform (Unsuppressed Surge vs Clamped Output)
    const plotX0 = 45;
    const plotX1 = w - 25;
    const plotY0 = h - 35;
    const plotYTop = 25;

    const maxScaleV = Math.max(100, metrics.peakSurgeV * 1.15);

    // 1. Unsuppressed surge curve (Red dashed)
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    const points = 80;
    for (let i = 0; i <= points; i++) {
      const tNorm = i / points; // 0 to 1
      // Exponential decay: V(t) = V_nom + (V_peak - V_nom) * exp(-4 * tNorm)
      const vT = 13.5 + (metrics.peakSurgeV - 13.5) * Math.exp(-3.5 * tNorm);
      const px = plotX0 + tNorm * (plotX1 - plotX0);
      const py = plotY0 - (vT / maxScaleV) * (plotY0 - plotYTop);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. Clamped voltage curve (Green / Blue solid)
    ctx.strokeStyle = metrics.isCompliant ? "#10b981" : "#f59e0b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const tNorm = i / points;
      const vSurge = 13.5 + (metrics.peakSurgeV - 13.5) * Math.exp(-3.5 * tNorm);
      const vClamp = Math.min(metrics.peakClampedV, vSurge);
      const px = plotX0 + tNorm * (plotX1 - plotX0);
      const py = plotY0 - (vClamp / maxScaleV) * (plotY0 - plotYTop);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillText("0ms", plotX0, h - 20);
    ctx.fillText("100ms", plotX0 + 0.25 * (plotX1 - plotX0) - 10, h - 20);
    ctx.fillText("200ms", plotX0 + 0.50 * (plotX1 - plotX0) - 10, h - 20);
    ctx.fillText("400ms", plotX1 - 25, h - 20);

    ctx.fillText(`${maxScaleV.toFixed(0)}V`, 10, plotYTop + 8);
    ctx.fillText("0V", 20, plotY0);

    // Callout badge
    ctx.fillStyle = "#38bdf8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText(`Clamped: ${metrics.peakClampedV}V | Peak Current: ${metrics.peakClampCurrentA}A`, plotX0, 18);
  } else {
    // Mode 2: Charge Pump Stages, Voltage Ripple & Breakdown Ceiling
    const plotX0 = 45;
    const plotX1 = w - 25;
    const plotY0 = h - 35;
    const plotYTop = 25;

    // Draw breakdown ceiling limit line
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plotX0, plotYTop + 10);
    ctx.lineTo(plotX1, plotYTop + 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ef4444";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillText("Oxide Breakdown Limit (Vbd = 14.5V)", plotX0 + 5, plotYTop + 8);

    // Charge pump multi-stage ramp waveform
    ctx.strokeStyle = metrics.isCompliant ? "#0284c7" : "#f59e0b";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    const stages = 5;
    const stageWidth = (plotX1 - plotX0) / stages;
    let currV = 3.3; // Vin
    ctx.moveTo(plotX0, plotY0 - (currV / 16.0) * (plotY0 - plotYTop));

    for (let s = 1; s <= stages; s++) {
      const sx0 = plotX0 + (s - 1) * stageWidth;
      const sx1 = plotX0 + s * stageWidth;
      currV += 1.8; // each Dickson stage adds ~1.8V
      const sy = plotY0 - (currV / 16.0) * (plotY0 - plotYTop);
      ctx.lineTo(sx0 + 5, sy);
      // Add ripple oscillation on stage
      for (let k = 0; k < 4; k++) {
        const rx = sx0 + 5 + (k / 4) * (stageWidth - 5);
        const ry = sy + (k % 2 === 0 ? -1 : 1) * (metrics.pumpRippleMv / 100);
        ctx.lineTo(rx, ry);
      }
      ctx.lineTo(sx1, sy);
    }
    ctx.stroke();

    // Callout
    ctx.fillStyle = "#10b981";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText(`VPP Target: 8.5V | Transient Stress: ${metrics.vPumpStressPeak}V | Margin: ${metrics.dielectricMarginPct}%`, plotX0, h - 14);
  }
}

/**
 * Initializes the Automotive Load Dump Clamping simulator UI.
 *
 * @param {HTMLElement} [container]
 */
export function initAutomotiveLoadDumpSimulator(container) {
  const root = container || document.getElementById("auto-load-dump-simulator-root");
  if (!root) return;

  const pulseSelect = root.querySelector("#auto-ld-pulse-select");
  const topologySelect = root.querySelector("#auto-ld-topology-select");
  const tempSlider = root.querySelector("#auto-ld-temp-slider");
  const tempVal = root.querySelector("#auto-ld-temp-val");
  const clampSlider = root.querySelector("#auto-ld-clamp-slider");
  const clampVal = root.querySelector("#auto-ld-clamp-val");

  const outClampedV = root.querySelector("#auto-ld-out-clampedv");
  const outPower = root.querySelector("#auto-ld-out-power");
  const outRipple = root.querySelector("#auto-ld-out-ripple");
  const outMargin = root.querySelector("#auto-ld-out-margin");
  const outRating = root.querySelector("#auto-ld-out-rating");
  const outVerdict = root.querySelector("#auto-ld-out-verdict");

  const canvas = root.querySelector("#auto-ld-canvas");
  const btnTrans = root.querySelector("#auto-ld-mode-trans");
  const btnPump = root.querySelector("#auto-ld-mode-pump");

  let currentMode = "transient";

  // Populate Select Options if empty
  if (pulseSelect && pulseSelect.options.length === 0) {
    Object.values(LOAD_DUMP_PRESETS).forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.nameEn}`;
      pulseSelect.appendChild(opt);
    });
    pulseSelect.value = "iso16750_pulse5a_unsuppressed";
  }

  if (topologySelect && topologySelect.options.length === 0) {
    Object.values(CLAMP_PROTECTION_TOPOLOGIES).forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.nameEn}`;
      topologySelect.appendChild(opt);
    });
    topologySelect.value = "active_fet_surge_stopper";
  }

  function update() {
    const pulseKey = pulseSelect ? pulseSelect.value : "iso16750_pulse5a_unsuppressed";
    const topologyKey = topologySelect ? topologySelect.value : "active_fet_surge_stopper";
    const temp = tempSlider ? Number(tempSlider.value) : 175;
    const clampV = clampSlider ? Number(clampSlider.value) : 18.0;

    if (tempVal) tempVal.textContent = `${temp} °C`;
    if (clampVal) clampVal.textContent = `${clampV} V`;

    const m = calculateAutomotiveLoadDumpClamp({
      pulseKey,
      topologyKey,
      temperatureC: temp,
      clampLimitV: clampV,
    });

    if (outClampedV) outClampedV.textContent = `${m.peakClampedV} V`;
    if (outPower) {
      if (m.peakDissipatedWatts >= 1000) {
        outPower.textContent = `${(m.peakDissipatedWatts / 1000).toFixed(2)} kW`;
      } else {
        outPower.textContent = `${m.peakDissipatedWatts} W`;
      }
    }
    if (outRipple) outRipple.textContent = `${m.pumpRippleMv} mV`;
    if (outMargin) {
      outMargin.textContent = `${m.dielectricMarginPct}%`;
      outMargin.style.color = m.dielectricMarginPct >= 20.0 ? "#059669" : "#dc2626";
    }
    if (outRating) {
      outRating.textContent = m.complianceRating;
      outRating.style.color = m.isCompliant ? "#059669" : "#b45309";
    }

    if (canvas) {
      drawLoadDumpClampCanvas(canvas, m, currentMode);
    }

    if (outVerdict) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outVerdict.innerHTML = isZh
        ? `<strong>車規負載突降防護判定：</strong> 於 <code>Tj = ${m.tj}°C (AEC-Q100 Grade 0)</code> 極限結溫下，面對 <code>${m.pulseNameZh}</code> (峰值 ${m.peakSurgeV}V)，採用 <code>${m.topologyNameZh}</code> 成功將晶片輸入箝位至 <strong>${m.peakClampedV} V</strong>，瞬態吸收峰值功耗為 <strong>${outPower ? outPower.textContent : ''}</strong>。晶片內電荷泵介電質擊穿安全裕度為 <strong>${m.dielectricMarginPct}%</strong> (瞬態峰值電壓 ${m.vPumpStressPeak}V)，升壓輸出漣波 <strong>${m.pumpRippleMv} mV</strong>。評級：<strong style="color: ${m.isCompliant ? '#059669' : '#b45309'}">${m.complianceRating}</strong>。`
        : `<strong>Automotive Clamping Verdict:</strong> At extreme junction temperature <code>Tj = ${m.tj}°C (AEC-Q100 Grade 0)</code> exposed to <code>${m.pulseNameEn}</code> (${m.peakSurgeV}V peak), the <code>${m.topologyNameEn}</code> clamps die voltage to <strong>${m.peakClampedV} V</strong>, dissipating <strong>${outPower ? outPower.textContent : ''}</strong> peak surge power. Charge pump dielectric breakdown margin is <strong>${m.dielectricMarginPct}%</strong> (peak stress ${m.vPumpStressPeak}V), with output ripple <strong>${m.pumpRippleMv} mV</strong>. Overall Status: <strong style="color: ${m.isCompliant ? '#059669' : '#b45309'}">${m.complianceRating}</strong>.`;
    }
  }

  if (pulseSelect) pulseSelect.addEventListener("change", update);
  if (topologySelect) topologySelect.addEventListener("change", update);
  if (tempSlider) tempSlider.addEventListener("input", update);
  if (clampSlider) clampSlider.addEventListener("input", update);

  if (btnTrans) {
    btnTrans.addEventListener("click", () => {
      currentMode = "transient";
      btnTrans.classList.add("active");
      btnTrans.setAttribute("aria-pressed", "true");
      btnTrans.style.background = "#059669";
      btnTrans.style.color = "#ffffff";
      btnTrans.style.borderColor = "#10b981";
      if (btnPump) {
        btnPump.classList.remove("active");
        btnPump.setAttribute("aria-pressed", "false");
        btnPump.style.background = "#1e293b";
        btnPump.style.color = "#94a3b8";
        btnPump.style.borderColor = "#475569";
      }
      update();
    });
  }

  if (btnPump) {
    btnPump.addEventListener("click", () => {
      currentMode = "chargepump";
      btnPump.classList.add("active");
      btnPump.setAttribute("aria-pressed", "true");
      btnPump.style.background = "#059669";
      btnPump.style.color = "#ffffff";
      btnPump.style.borderColor = "#10b981";
      if (btnTrans) {
        btnTrans.classList.remove("active");
        btnTrans.setAttribute("aria-pressed", "false");
        btnTrans.style.background = "#1e293b";
        btnTrans.style.color = "#94a3b8";
        btnTrans.style.borderColor = "#475569";
      }
      update();
    });
  }

  window.addEventListener("resize", () => {
    if (canvas) update();
  });

  update();
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initAutomotiveLoadDumpSimulator());
  } else {
    initAutomotiveLoadDumpSimulator();
  }
}
