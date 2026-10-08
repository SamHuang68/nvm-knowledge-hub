/**
 * chiplet-ucie-nvm-simulator.js — Next-Gen Chiplet Packaging UCIe Interconnect & NVM Latency / Thermal Topology Simulator
 *
 * First-Principles Mathematical Modeling:
 * 1. Die-to-Die Interconnect Latency & Round-Trip Timing:
 *    T_{\text{read}} = \tau_{\text{array}} + 2 \cdot (\tau_{\text{adapter}} + \tau_{\text{PHY}} + \tau_{\text{flight}}) + \tau_{\text{controller}}
 * 2. Interconnect Dynamic Energy Efficiency:
 *    E_{\text{bit}} = \frac{1}{2} \cdot C_{\text{load}} \cdot V_{\text{dd}}^2 + E_{\text{PHY\_leak}}
 * 3. Package Thermal Resistance & Stacking Temperature Rise:
 *    \Delta T_j = P_{\text{total}} \cdot \theta_{ja} = P_{\text{compute}} \cdot \theta_{\text{die}} + P_{\text{NVM}} \cdot \theta_{\text{stack}}
 * 4. Arrhenius High-Temperature Retention Penalty:
 *    AF = \exp\left[\frac{E_a}{k_B} \left(\frac{1}{T_{\text{ambient}} + 273.15} - \frac{1}{(T_{\text{ambient}} + \Delta T_j) + 273.15}\right)\right]
 * 5. Murphy Silicon Defect Yield & Partitioning Advantage:
 *    Y_{\text{mono}} = \left(\frac{1 - e^{-A_{\text{total}} D_0}}{A_{\text{total}} D_0}\right)^2
 *    Y_{\text{chiplet}} = \prod_{k} Y_k \cdot Y_{\text{assembly}}
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: UCIe Specification 1.1/2.0, JEDEC JESD238, IEEE EPS Advanced Packaging
 */

/**
 * Packaging topology presets and physical parameters.
 */
export const CHIPLET_TOPOLOGY_PRESETS = Object.freeze({
  monolithic_envm: {
    id: "monolithic_envm",
    nameZh: "單晶片單體整合 (Monolithic on-die eNVM)",
    nameEn: "Monolithic SoC with on-die eNVM",
    d2dLatencyNs: 0.3,          // Pure on-chip metal routing
    interconnectEnergyPjBit: 0.05,
    maxBandwidthGbpsPerLane: 32.0,
    bumpPitchUm: 0.0,           // No external bumps
    thermalResistanceCperW: 0.65,
    packageCostMultiplier: 1.0, // Baseline single die
    packagingCategory: "Monolithic",
  },
  chiplet_ucie_standard: {
    id: "chiplet_ucie_standard",
    nameZh: "2.5D 標準有機基板 (UCIe-S Standard Package)",
    nameEn: "2.5D UCIe Standard Package (Substrate)",
    d2dLatencyNs: 10.5,         // D2D Adapter + Standard PHY + substrate trace
    interconnectEnergyPjBit: 1.45,
    maxBandwidthGbpsPerLane: 16.0,
    bumpPitchUm: 110.0,         // Organic C4 / BGA
    thermalResistanceCperW: 0.85,
    packageCostMultiplier: 1.15,
    packagingCategory: "2.5D Standard",
  },
  chiplet_ucie_advanced: {
    id: "chiplet_ucie_advanced",
    nameZh: "2.5D 先進矽中介層 (UCIe-A / CoWoS / EMIB)",
    nameEn: "2.5D UCIe Advanced Package (Silicon Interposer)",
    d2dLatencyNs: 3.2,          // Micro-bump + High-density bridge
    interconnectEnergyPjBit: 0.35,
    maxBandwidthGbpsPerLane: 32.0,
    bumpPitchUm: 35.0,          // Micro-bump
    thermalResistanceCperW: 1.05,
    packageCostMultiplier: 1.40,
    packagingCategory: "2.5D Advanced",
  },
  stacked_3d_hybrid: {
    id: "stacked_3d_hybrid",
    nameZh: "3D 垂直混合鍵合 (TSMC SoIC / Cu-Cu Hybrid)",
    nameEn: "3D Direct Hybrid Bonding (Cu-Cu / SoIC)",
    d2dLatencyNs: 0.8,          // Direct vertical TSV / Cu-Cu via
    interconnectEnergyPjBit: 0.12,
    maxBandwidthGbpsPerLane: 48.0,
    bumpPitchUm: 4.5,           // Sub-micron to fine Cu-Cu pitch
    thermalResistanceCperW: 1.55, // Higher thermal stack barrier
    packageCostMultiplier: 1.65,
    packagingCategory: "3D Stacked",
  },
});

/**
 * Storage role requirements and traffic profiles.
 */
export const NVM_STORAGE_ROLES = Object.freeze({
  secure_boot_rot: {
    id: "secure_boot_rot",
    nameZh: "安全開機與硬體信任根 (Root-of-Trust)",
    nameEn: "Secure Boot & Hardware Root-of-Trust",
    capacityKb: 512,
    readBlockBytes: 64,         // Key payload fetch
    targetArrayLatencyNs: 12.0, // AntiFuse / PUF native sense
    accessPattern: "Random Burst (Boot-time)",
    criticality: "High Security",
    acceptableLatencyBudgetNs: 25.0,
  },
  firmware_xip: {
    id: "firmware_xip",
    nameZh: "韌體程式碼就地執行 (XiP Flash/MRAM)",
    nameEn: "Firmware eXecute-in-Place (XiP)",
    capacityKb: 131072,         // 16 MB
    readBlockBytes: 32,         // Cache line fetch
    targetArrayLatencyNs: 35.0, // High-speed NOR / MRAM
    accessPattern: "Continuous Random Read",
    criticality: "Execution Speed",
    acceptableLatencyBudgetNs: 50.0,
  },
  cache_repair_hbm: {
    id: "cache_repair_hbm",
    nameZh: "HBM3e / LLC 晶粒修復對照表 (JEDEC hPPR)",
    nameEn: "HBM3e / LLC Die Repair Map (JEDEC hPPR)",
    capacityKb: 4096,           // 4 Mb
    readBlockBytes: 128,        // Remap table burst
    targetArrayLatencyNs: 15.0, // Dense OTP fusebox
    accessPattern: "POST Stage Bring-up",
    criticality: "Yield Guarantee",
    acceptableLatencyBudgetNs: 40.0,
  },
  ai_weight_table: {
    id: "ai_weight_table",
    nameZh: "邊緣 AI 權重與特徵偏置暫存表",
    nameEn: "Edge AI Weight & Bias State Table",
    capacityKb: 65536,          // 8 MB
    readBlockBytes: 256,        // Vector block
    targetArrayLatencyNs: 20.0, // STT-MRAM / ReRAM
    accessPattern: "Streaming Layer-by-Layer",
    criticality: "Throughput / Bandwidth",
    acceptableLatencyBudgetNs: 35.0,
  },
});

/**
 * Calculates first-principles latency, energy, thermal rise, and cost tradeoffs for chiplet UCIe NVM integration.
 *
 * @param {Object} options
 * @param {string} options.topologyKey - Key in CHIPLET_TOPOLOGY_PRESETS
 * @param {string} options.roleKey - Key in NVM_STORAGE_ROLES
 * @param {number} options.computePowerWatts - SoC / Compute die power in Watts (5..250 W)
 * @param {number} options.ambientTempC - Ambient / Chassis operating temperature in °C (-40..105 °C)
 * @param {number} options.busWidthLanes - Number of UCIe / D2D lanes (4, 8, 16, 32, 64)
 * @returns {Object} Quantitative calculation metrics
 */
export function calculateChipletUcieNvm({
  topologyKey = "chiplet_ucie_advanced",
  roleKey = "secure_boot_rot",
  computePowerWatts = 45,
  ambientTempC = 70,
  busWidthLanes = 16,
} = {}) {
  const top = CHIPLET_TOPOLOGY_PRESETS[topologyKey] || CHIPLET_TOPOLOGY_PRESETS.chiplet_ucie_advanced;
  const role = NVM_STORAGE_ROLES[roleKey] || NVM_STORAGE_ROLES.secure_boot_rot;

  const P_compute = Math.max(1.0, Math.min(300.0, Number(computePowerWatts) || 45.0));
  const T_amb = Math.max(-40.0, Math.min(125.0, Number(ambientTempC) || 70.0));
  const lanes = [4, 8, 16, 32, 64].includes(Number(busWidthLanes)) ? Number(busWidthLanes) : 16;

  // 1. Latency Decomposition (First Word Access):
  // T_read = tau_array + 2 * tau_d2d + tau_controller
  const tauArray = role.targetArrayLatencyNs;
  const tauD2dOneWay = top.d2dLatencyNs;
  const tauRoundTripD2d = 2.0 * tauD2dOneWay;
  const tauController = 3.5; // Protocol parsing & arbitration overhead
  const totalReadLatencyNs = tauArray + tauRoundTripD2d + tauController;

  // 2. Bandwidth & Energy:
  // Bandwidth (GB/s) = (Lanes * Gbps_per_lane) / 8
  const totalBandwidthGbps = lanes * top.maxBandwidthGbpsPerLane;
  const totalBandwidthGBps = totalBandwidthGbps / 8.0;

  // Read transfer energy for one block:
  const blockBits = role.readBlockBytes * 8;
  const interconnectEnergyPj = blockBits * top.interconnectEnergyPjBit;

  // 3. Thermal Analysis & Temperature Rise:
  // NVM die average operational power:
  const pNvmWatts = 0.45; // ~450 mW during active burst
  const pTotalPackageWatts = P_compute + pNvmWatts;
  const deltaTj = pTotalPackageWatts * (top.thermalResistanceCperW * 0.12); // Scaled junction delta
  const nvmJunctionTempC = T_amb + deltaTj;

  // Arrhenius retention degradation acceleration factor (Ea = 1.1 eV, reference 85°C):
  const kB = 8.617333262e-5; // eV/K
  const Ea = 1.1; // Typical oxide trap activation energy
  const T_ref_K = 85.0 + 273.15;
  const T_actual_K = Math.max(200.0, nvmJunctionTempC + 273.15);
  const arrheniusAF = Math.exp(Math.max(-50, Math.min(50, (Ea / kB) * (1.0 / T_ref_K - 1.0 / T_actual_K))));
  const nominalRetentionYears = 10.0;
  const effectiveRetentionYears = Math.max(0.1, nominalRetentionYears / Math.max(0.01, arrheniusAF));

  // 4. Silicon Defect Yield & Partitioning Advantage (Murphy's Model):
  // Let total area A_total = 400 mm^2 (compute 350 mm^2, NVM 50 mm^2), D_0 = 0.08 / cm^2
  const D0 = 0.0008; // defects per mm^2
  const A_mono = 400.0;
  const yMono = Math.pow((1.0 - Math.exp(-A_mono * D0)) / (A_mono * D0), 2);

  // If partitioned into Compute Die (350 mm^2) + NVM Chiplet (50 mm^2 on older node):
  const yCompute = Math.pow((1.0 - Math.exp(-350.0 * D0)) / (350.0 * D0), 2);
  const yNvmChiplet = Math.pow((1.0 - Math.exp(-50.0 * (D0 * 0.6))) / (50.0 * (D0 * 0.6)), 2); // Older mature node
  const yAssembly = top.id === "monolithic_envm" ? 1.0 : (top.id === "stacked_3d_hybrid" ? 0.94 : 0.97);
  const yChipletCombined = yCompute * yNvmChiplet * yAssembly;

  const yieldGainPercent = ((yChipletCombined - yMono) / yMono) * 100.0;

  // 5. Verdict & Quality Gate Evaluation:
  const isLatencyCompliant = totalReadLatencyNs <= role.acceptableLatencyBudgetNs;
  const isThermalSafe = nvmJunctionTempC <= 125.0;

  return {
    topologyKey: top.id,
    topologyNameZh: top.nameZh,
    topologyNameEn: top.nameEn,
    packagingCategory: top.packagingCategory,
    roleKey: role.id,
    roleNameZh: role.nameZh,
    roleNameEn: role.nameEn,
    tauArrayNs: Number(tauArray.toFixed(1)),
    tauRoundTripD2dNs: Number(tauRoundTripD2d.toFixed(1)),
    tauControllerNs: Number(tauController.toFixed(1)),
    totalReadLatencyNs: Number(totalReadLatencyNs.toFixed(1)),
    acceptableLatencyBudgetNs: role.acceptableLatencyBudgetNs,
    interconnectEnergyPjBit: top.interconnectEnergyPjBit,
    interconnectEnergyPj: Number(interconnectEnergyPj.toFixed(1)),
    totalBandwidthGBps: Number(totalBandwidthGBps.toFixed(1)),
    busWidthLanes: lanes,
    deltaTj: Number(deltaTj.toFixed(1)),
    nvmJunctionTempC: Number(nvmJunctionTempC.toFixed(1)),
    effectiveRetentionYears: Number(effectiveRetentionYears.toFixed(1)),
    monolithicYieldPercent: Number((yMono * 100).toFixed(1)),
    chipletYieldPercent: Number((yChipletCombined * 100).toFixed(1)),
    yieldGainPercent: Number(yieldGainPercent.toFixed(1)),
    isLatencyCompliant,
    isThermalSafe,
  };
}

/**
 * Draws the high-DPI Canvas visualization for the Chiplet UCIe NVM workbench.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} results - Result object from calculateChipletUcieNvm
 * @param {string} mode - 'package_view' or 'latency_breakdown'
 * @param {boolean} isZh - Language flag
 */
export function drawChipletUcieCanvas(canvas, results, mode = "package_view", isZh = true) {
  if (!canvas || !results) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = Math.max(300, rect.width || 420);
  const height = Math.max(160, rect.height || 190);

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, "#081018");
  bgGrad.addColorStop(1, "#03070b");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  const padLeft = 36;
  const padRight = 24;
  const padTop = 26;
  const padBottom = 26;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  if (mode === "package_view") {
    // Mode 1: Cross-Sectional Die & Interconnect Topology Diagram
    const centerY = padTop + plotH * 0.55;

    // 1. Draw Package Substrate (Bottom layer)
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(padLeft, centerY + 30, plotW, 18);
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1;
    ctx.strokeRect(padLeft, centerY + 30, plotW, 18);

    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(isZh ? "有機封裝基板 (Package Substrate)" : "Organic Package Substrate", padLeft + 10, centerY + 43);

    // 2. Draw Compute Die vs NVM Die
    if (results.topologyKey === "monolithic_envm") {
      // Single Large Monolithic Die
      ctx.fillStyle = "#0284c7";
      ctx.fillRect(padLeft + 20, centerY - 25, plotW - 40, 45);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(padLeft + 20, centerY - 25, plotW - 40, 45);

      // Embedded NVM Macro partition inside
      ctx.fillStyle = "#059669";
      ctx.fillRect(padLeft + plotW - 120, centerY - 20, 85, 35);
      ctx.strokeStyle = "#34d399";
      ctx.strokeRect(padLeft + plotW - 120, centerY - 20, 85, 35);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 10.5px 'IBM Plex Mono', monospace";
      ctx.fillText(isZh ? "單體 SoC 運算核心" : "Monolithic SoC Core", padLeft + 35, centerY + 3);
      ctx.font = "600 9px 'IBM Plex Mono', monospace";
      ctx.fillText(isZh ? "內嵌 eNVM" : "Embedded eNVM", padLeft + plotW - 112, centerY);

    } else if (results.topologyKey === "stacked_3d_hybrid") {
      // 3D Stacking: Compute Die stacked directly on NVM Base Die
      // Bottom: NVM Base Die
      ctx.fillStyle = "#047857";
      ctx.fillRect(padLeft + 40, centerY + 5, plotW - 80, 20);
      ctx.strokeStyle = "#10b981";
      ctx.strokeRect(padLeft + 40, centerY + 5, plotW - 80, 20);

      // Top: Compute Die
      ctx.fillStyle = "#0369a1";
      ctx.fillRect(padLeft + 40, centerY - 25, plotW - 80, 26);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(padLeft + 40, centerY - 25, plotW - 80, 26);

      // Cu-Cu Hybrid Bonding Interface
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 2]);
      ctx.beginPath();
      ctx.moveTo(padLeft + 42, centerY + 3);
      ctx.lineTo(padLeft + plotW - 42, centerY + 3);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#ffffff";
      ctx.font = "700 9.5px 'IBM Plex Mono', monospace";
      ctx.fillText(isZh ? "上層運算邏輯晶粒 (Compute Die)" : "Top Compute Die", padLeft + 55, centerY - 9);
      ctx.fillText(isZh ? "底層 NVM 基底晶粒 (Base Die)" : "Bottom NVM Base Die", padLeft + 55, centerY + 19);

    } else {
      // 2.5D UCIe Standard or Advanced Interposer
      const isAdv = results.topologyKey === "chiplet_ucie_advanced";
      const interposerY = centerY + 12;

      if (isAdv) {
        // Silicon Interposer Layer
        ctx.fillStyle = "#334155";
        ctx.fillRect(padLeft + 15, interposerY, plotW - 30, 14);
        ctx.strokeStyle = "#64748b";
        ctx.strokeRect(padLeft + 15, interposerY, plotW - 30, 14);
        ctx.fillStyle = "#cbd5e1";
        ctx.font = "500 8.5px 'IBM Plex Mono', monospace";
        ctx.fillText(isZh ? "高密度矽中介層 (Silicon Interposer / EMIB)" : "Silicon Interposer / EMIB Bridge", padLeft + 25, interposerY + 10);
      }

      // Compute Chiplet
      ctx.fillStyle = "#0369a1";
      ctx.fillRect(padLeft + 20, centerY - 25, (plotW - 60) * 0.65, 32);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(padLeft + 20, centerY - 25, (plotW - 60) * 0.65, 32);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 10px 'IBM Plex Mono', monospace";
      ctx.fillText(isZh ? "運算小晶片 (SoC Core)" : "Compute Chiplet", padLeft + 35, centerY - 5);

      // NVM Chiplet
      const nvmX = padLeft + 20 + (plotW - 60) * 0.65 + 18;
      ctx.fillStyle = "#047857";
      ctx.fillRect(nvmX, centerY - 25, (plotW - 60) * 0.35, 32);
      ctx.strokeStyle = "#10b981";
      ctx.strokeRect(nvmX, centerY - 25, (plotW - 60) * 0.35, 32);
      ctx.fillStyle = "#ffffff";
      ctx.font = "700 9.5px 'IBM Plex Mono', monospace";
      ctx.fillText(isZh ? "NVM 晶粒" : "NVM Die", nvmX + 8, centerY - 5);

      // UCIe Interconnect Arrows
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padLeft + 20 + (plotW - 60) * 0.65 + 2, centerY - 9);
      ctx.lineTo(nvmX - 2, centerY - 9);
      ctx.stroke();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "600 8.5px 'IBM Plex Mono', monospace";
      ctx.fillText(isAdv ? "UCIe-A" : "UCIe-S", padLeft + 20 + (plotW - 60) * 0.65 + 1, centerY - 14);
    }

  } else {
    // Mode 2: Latency Decomposition Stacked Bar
    const barY = padTop + plotH * 0.35;
    const barHeight = 28;
    const totalNs = results.totalReadLatencyNs;

    const wArray = (results.tauArrayNs / totalNs) * plotW;
    const wD2d = (results.tauRoundTripD2dNs / totalNs) * plotW;
    const wCtrl = (results.tauControllerNs / totalNs) * plotW;

    // Array segment (Green)
    ctx.fillStyle = "#059669";
    ctx.fillRect(padLeft, barY, wArray, barHeight);

    // D2D Round-trip segment (Cyan/Blue)
    ctx.fillStyle = "#0284c7";
    ctx.fillRect(padLeft + wArray, barY, wD2d, barHeight);

    // Controller segment (Amber)
    ctx.fillStyle = "#d97706";
    ctx.fillRect(padLeft + wArray + wD2d, barY, wCtrl, barHeight);

    // Budget line marker
    const budgetX = padLeft + Math.min(plotW, (results.acceptableLatencyBudgetNs / totalNs) * plotW);
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(budgetX, barY - 10);
    ctx.lineTo(budgetX, barY + barHeight + 10);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#ef4444";
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillText(`${isZh ? "延遲門檻" : "Budget"}: ${results.acceptableLatencyBudgetNs}ns`, budgetX - 30, barY - 14);

    // Legend
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#34d399";
    ctx.fillText(`● ${isZh ? "記憶體陣列" : "Array"}: ${results.tauArrayNs}ns`, padLeft, barY + barHeight + 24);

    ctx.fillStyle = "#38bdf8";
    ctx.fillText(`● ${isZh ? "UCIe 往返" : "UCIe RTT"}: ${results.tauRoundTripD2dNs}ns`, padLeft + 120, barY + barHeight + 24);

    ctx.fillStyle = "#fbbf24";
    ctx.fillText(`● ${isZh ? "協定控制" : "Controller"}: ${results.tauControllerNs}ns`, padLeft + 240, barY + barHeight + 24);
  }

  // Canvas Title
  ctx.font = "700 10.5px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "#f1f5f9";
  ctx.fillText(
    mode === "package_view"
      ? (isZh ? `封裝微觀拓撲: ${results.topologyNameZh}` : `Micro-Topology: ${results.topologyNameEn}`)
      : (isZh ? `首字讀取延遲分解 (總計: ${results.totalReadLatencyNs} ns)` : `Latency Breakdown (Total: ${results.totalReadLatencyNs} ns)`),
    padLeft,
    padTop - 10
  );

  ctx.restore();
}

/**
 * Initializes DOM interactive controls and event listeners for the Chiplet UCIe NVM Simulator.
 */
export function initChipletUcieNvmSimulator() {
  const root = document.getElementById("chiplet-ucie-simulator-root");
  if (!root) return;

  const topSelect = document.getElementById("chiplet-top-select");
  const roleSelect = document.getElementById("chiplet-role-select");
  const lanesSelect = document.getElementById("chiplet-lanes-select");
  const powerSlider = document.getElementById("chiplet-power-slider");
  const powerVal = document.getElementById("chiplet-power-val");
  const tempSlider = document.getElementById("chiplet-temp-slider");
  const tempVal = document.getElementById("chiplet-temp-val");

  const modeBtnPkg = document.getElementById("chiplet-mode-pkg");
  const modeBtnLat = document.getElementById("chiplet-mode-lat");
  const canvas = document.getElementById("chiplet-canvas");

  // Output Elements
  const outLatency = document.getElementById("chiplet-out-latency");
  const outEnergy = document.getElementById("chiplet-out-energy");
  const outBandwidth = document.getElementById("chiplet-out-bandwidth");
  const outTempRise = document.getElementById("chiplet-out-temprise");
  const outYield = document.getElementById("chiplet-out-yield");
  const outVerdict = document.getElementById("chiplet-out-verdict");

  let currentVisualMode = "package_view";

  function getLang() {
    return (window.HubLanguage?.get() || document.documentElement.lang || "zh").startsWith("zh");
  }

  function update() {
    const isZh = getLang();
    const topologyKey = topSelect ? topSelect.value : "chiplet_ucie_advanced";
    const roleKey = roleSelect ? roleSelect.value : "secure_boot_rot";
    const busWidthLanes = lanesSelect ? parseInt(lanesSelect.value, 10) : 16;
    const computePowerWatts = powerSlider ? parseInt(powerSlider.value, 10) : 45;
    const ambientTempC = tempSlider ? parseInt(tempSlider.value, 10) : 70;

    if (powerVal && powerSlider) {
      powerVal.textContent = `${powerSlider.value} W`;
    }
    if (tempVal && tempSlider) {
      tempVal.textContent = `${tempSlider.value} °C`;
    }

    const res = calculateChipletUcieNvm({
      topologyKey,
      roleKey,
      computePowerWatts,
      ambientTempC,
      busWidthLanes,
    });

    if (outLatency) {
      outLatency.textContent = `${res.totalReadLatencyNs} ns`;
      outLatency.style.color = res.isLatencyCompliant ? "#059669" : "#dc2626";
    }
    if (outEnergy) {
      outEnergy.textContent = `${res.interconnectEnergyPjBit} pJ/bit`;
    }
    if (outBandwidth) {
      outBandwidth.textContent = `${res.totalBandwidthGBps} GB/s`;
    }
    if (outTempRise) {
      outTempRise.textContent = `+${res.deltaTj} °C (${res.nvmJunctionTempC}°C)`;
      outTempRise.style.color = res.isThermalSafe ? "#475569" : "#dc2626";
    }
    if (outYield) {
      outYield.textContent = `${res.chipletYieldPercent}% (${res.yieldGainPercent >= 0 ? "+" : ""}${res.yieldGainPercent}%)`;
      outYield.style.color = res.yieldGainPercent >= 0 ? "#059669" : "#d97706";
    }

    if (outVerdict) {
      if (res.isLatencyCompliant && res.isThermalSafe) {
        outVerdict.innerHTML = isZh
          ? `<strong>【架構相容】</strong> 所選拓撲 <strong>${res.topologyNameZh}</strong> 完全符合 <strong>${res.roleNameZh}</strong> 之嚴苛時序預算（實測 ${res.totalReadLatencyNs} ns ≤ 門檻 ${res.acceptableLatencyBudgetNs} ns）。接面溫度 ${res.nvmJunctionTempC}°C 確保資料留存可達 <strong>${res.effectiveRetentionYears} 年</strong>，矽分割良率優勢顯著。`
          : `<strong>[ARCHITECTURAL COMPLIANCE]</strong> Selected topology <strong>${res.topologyNameEn}</strong> fully satisfies the timing budget for <strong>${res.roleNameEn}</strong> (measured ${res.totalReadLatencyNs} ns ≤ budget ${res.acceptableLatencyBudgetNs} ns). Junction temperature ${res.nvmJunctionTempC}°C preserves <strong>${res.effectiveRetentionYears} years</strong> retention with strong yield recovery.`;
      } else if (!res.isLatencyCompliant) {
        outVerdict.innerHTML = isZh
          ? `<strong>【延遲溢位警告】</strong> 首字存取延遲達 <strong>${res.totalReadLatencyNs} ns</strong>，已超越應用上限（${res.acceptableLatencyBudgetNs} ns）。原因在於標準封裝 D2D 協定往返延遲過高（${res.tauRoundTripD2dNs} ns）。建議升級至 <strong>2.5D UCIe-A 先進中介層</strong> 或 <strong>3D 混合鍵合</strong> 架構。`
          : `<strong>[LATENCY BUDGET EXCEEDED]</strong> First-word read latency hits <strong>${res.totalReadLatencyNs} ns</strong>, exceeding target budget (${res.acceptableLatencyBudgetNs} ns) due to standard substrate protocol turnaround (${res.tauRoundTripD2dNs} ns). Upgrade to <strong>2.5D UCIe-A Advanced</strong> or <strong>3D Hybrid Bonding</strong>.`;
      } else {
        outVerdict.innerHTML = isZh
          ? `<strong>【熱堆疊高溫警訊】</strong> 運算晶粒高功耗引發垂直熱阻溫升（接面達 <strong>${res.nvmJunctionTempC}°C</strong>），導致 Arrhenius 高溫留存折損至僅 <strong>${res.effectiveRetentionYears} 年</strong>。建議增設散熱均熱片或將 NVM 移至外緣散熱較佳區塊。`
          : `<strong>[THERMAL STACK ALERT]</strong> High compute dissipation drives NVM junction temperature to <strong>${res.nvmJunctionTempC}°C</strong>, degrading Arrhenius retention to <strong>${res.effectiveRetentionYears} years</strong>. Add dedicated thermal spreaders or relocate NVM to peripheral cooler zones.`;
      }
    }

    // Click-to-copy ergonomics on KPI elements
    [outLatency, outEnergy, outBandwidth, outTempRise, outYield].forEach((el) => {
      if (el && !el.dataset.copyAttached) {
        el.dataset.copyAttached = 'true';
        el.style.cursor = 'pointer';
        el.setAttribute('title', isZh ? '點擊複製數值' : 'Click to copy');
        el.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(el.textContent.trim());
            const orig = el.textContent;
            el.textContent = isZh ? '已複製！' : 'Copied!';
            setTimeout(() => { el.textContent = orig; }, 1200);
          } catch (_) {}
        });
      }
    });

    if (canvas) {
      drawChipletUcieCanvas(canvas, res, currentVisualMode, isZh);
    }
  }

  // Mode toggles
  if (modeBtnPkg && modeBtnLat) {
    modeBtnPkg.addEventListener("click", () => {
      currentVisualMode = "package_view";
      modeBtnPkg.classList.add("active");
      modeBtnPkg.setAttribute("aria-pressed", "true");
      modeBtnLat.classList.remove("active");
      modeBtnLat.setAttribute("aria-pressed", "false");
      update();
    });

    modeBtnLat.addEventListener("click", () => {
      currentVisualMode = "latency_breakdown";
      modeBtnLat.classList.add("active");
      modeBtnLat.setAttribute("aria-pressed", "true");
      modeBtnPkg.classList.remove("active");
      modeBtnPkg.setAttribute("aria-pressed", "false");
      update();
    });
  }

  // Form controls listeners
  [topSelect, roleSelect, lanesSelect, powerSlider, tempSlider].forEach((ctrl) => {
    if (ctrl) {
      ctrl.addEventListener("input", update);
      ctrl.addEventListener("change", update);
    }
  });

  // Export CSV Action for Chiplet UCIe
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

  const modeContainer = modeBtnLat?.parentNode;
  if (modeContainer && !modeContainer.querySelector('#chiplet-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'chiplet-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-left: auto; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.6); color: #38bdf8; cursor: pointer;';
    const isZh = getLang();
    exportBtn.textContent = isZh ? '📥 匯出 UCIe 數據 CSV' : '📥 Export UCIe CSV';
    exportBtn.addEventListener('click', () => {
      const topologyKey = topSelect ? topSelect.value : 'chiplet_ucie_advanced';
      const roleKey = roleSelect ? roleSelect.value : 'secure_boot_rot';
      let csv = 'ComputePower_W,ReadLatency_ns,InterconnectEnergy_pJ_bit,Bandwidth_GBps,JunctionTemp_C,Yield_Percent\n';
      for (let p = 10; p <= 120; p += 5) {
        const r = calculateChipletUcieNvm({
          topologyKey,
          roleKey,
          computePowerWatts: p,
          ambientTempC: tempSlider ? parseInt(tempSlider.value, 10) : 70,
          busWidthLanes: lanesSelect ? parseInt(lanesSelect.value, 10) : 16,
        });
        csv += `${p},${r.totalReadLatencyNs},${r.interconnectEnergyPjBit},${r.totalBandwidthGBps},${r.nvmJunctionTempC},${r.chipletYieldPercent}\n`;
      }
      downloadCsv(`chiplet_ucie_${topologyKey}_${roleKey}.csv`, csv);
    });
    modeContainer.appendChild(exportBtn);
  }

  // Language & theme mutation observer
  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang', 'data-theme'] });

  if (typeof ResizeObserver !== 'undefined' && canvas) {
    const ro = new ResizeObserver(() => update());
    ro.observe(canvas);
  }

  window.addEventListener('languagechange', update);
  window.addEventListener('hub:language-change', update);
  window.addEventListener('resize', () => {
    if (canvas) update();
  });

  // Initial calculation
  update();
}

// Auto-init on DOMContentLoaded
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChipletUcieNvmSimulator);
  } else {
    initChipletUcieNvmSimulator();
  }
}
