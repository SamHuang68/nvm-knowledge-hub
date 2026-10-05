/**
 * mcu-vector-patch-simulator.js — Vector Patch CAM ROM Replacement & Hot-Patching Latency / Energy Workbench
 *
 * First-Principles Mathematical Modeling:
 * 1. CAM Parallel Matchline Power & Energy:
 *    E_{\text{cam\_match}} = N_{\text{entries}} \cdot C_{\text{matchline}} \cdot V_{\text{dd}}^2
 *    P_{\text{cam}} = E_{\text{cam\_match}} \cdot f_{\text{clk}}
 * 2. Patch Interception Timing & Pipeline Penalty:
 *    t_{\text{cycle}} = \frac{1}{f_{\text{clk}}}
 *    t_{\text{penalty}} = \text{WaitStates}_{\text{backend}} \cdot t_{\text{cycle}} + t_{\text{mux\_delay}}
 * 3. Dynamic Energy Per Instruction (pJ/instruction):
 *    E_{\text{normal\_rom}} = E_{\text{rom\_read}} + E_{\text{core\_dyn}}
 *    E_{\text{patched\_otp}} = E_{\text{cam\_match}} + E_{\text{backend\_read}} + E_{\text{core\_dyn}} \cdot (1 + \text{WaitStates})
 * 4. Mask Adder & Die Cost Savings vs Full Embedded Flash:
 *    \text{Cost}_{\text{hybrid}} = \text{Area}_{\text{ROM+OTP+CAM}} \cdot C_{\text{base}}
 *    \text{Cost}_{\text{eflash}} = \text{Area}_{\text{eFlash}} \cdot C_{\text{base}} \cdot (1 + \alpha_{\text{mask}} \cdot \Delta N_{\text{masks}})
 *    \text{SavingsPct} = \frac{\text{Cost}_{\text{eflash}} - \text{Cost}_{\text{hybrid}}}{\text{Cost}_{\text{eflash}}} \times 100\%
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: Arm Cortex-M FPB (Flash Patch and Breakpoint), RISC-V Zicbo, TSMC 22ULL / 40LP ULP IoT Benchmarks
 */

/**
 * Common IoT Edge MCU workload presets.
 */
export const MCU_PATCH_WORKLOAD_PRESETS = Object.freeze({
  ble_beacon_ulp: {
    id: "ble_beacon_ulp",
    nameZh: "超低功耗藍牙 Beacon (0.6V 近臨界電壓 / 8 補丁槽)",
    nameEn: "Ultra-Low-Power BLE Beacon (0.6V NTV / 8 CAM Slots)",
    romSizeKb: 64,
    otpSizeKb: 4,
    defaultCamEntries: 8,
    defaultClockMhz: 16.0,
    defaultSupplyVdd: 0.6,
    cveVulnerabilityRate: 0.05, // low patch frequency
    applicationDomain: "Energy Harvesting / Wearables",
  },
  smart_meter_zigbee: {
    id: "smart_meter_zigbee",
    nameZh: "智慧電表 AMI 節點 (1.2V 核心 / 16 補丁槽)",
    nameEn: "Smart Utility Meter AMI (1.2V / 16 CAM Slots)",
    romSizeKb: 128,
    otpSizeKb: 8,
    defaultCamEntries: 16,
    defaultClockMhz: 48.0,
    defaultSupplyVdd: 1.2,
    cveVulnerabilityRate: 0.12,
    applicationDomain: "Industrial Smart Grid (10-Yr Field Life)",
  },
  matter_gateway_iot: {
    id: "matter_gateway_iot",
    nameZh: "工業級 Matter / Thread 網關 (1.8V / 32 補丁槽)",
    nameEn: "Industrial Matter / Thread Gateway (1.8V / 32 CAM Slots)",
    romSizeKb: 256,
    otpSizeKb: 16,
    defaultCamEntries: 32,
    defaultClockMhz: 80.0,
    defaultSupplyVdd: 1.8,
    cveVulnerabilityRate: 0.25,
    applicationDomain: "Smart Home & Automation",
  },
  automotive_body_mcu: {
    id: "automotive_body_mcu",
    nameZh: "車載車身與照明微控制器 (3.3V 寬壓 / 64 補丁槽)",
    nameEn: "Automotive Body & Lighting MCU (3.3V / 64 CAM Slots)",
    romSizeKb: 512,
    otpSizeKb: 32,
    defaultCamEntries: 64,
    defaultClockMhz: 120.0,
    defaultSupplyVdd: 3.3,
    cveVulnerabilityRate: 0.40,
    applicationDomain: "AEC-Q100 Grade 1 Body Domain",
  },
});

/**
 * Patch storage backend memory profiles.
 */
export const PATCH_STORAGE_BACKENDS = Object.freeze({
  antifuse_direct: {
    id: "antifuse_direct",
    nameZh: "純邏輯 AntiFuse OTP (陣列直接讀取 Direct Read)",
    nameEn: "Pure-Logic AntiFuse OTP (Direct Array Read)",
    readAccessTimeNs: 18.0,
    readEnergyPjPerByte: 1.8,
    waitStatesAt80Mhz: 1,
    standbyLeakageNa: 0.05,
    requiresShadowRam: false,
    zeroMaskAdder: true,
  },
  shadow_sram: {
    id: "shadow_sram",
    nameZh: "開機影子 SRAM (Boot-Time OTP 載入 / 零等待週期)",
    nameEn: "Boot-Time Shadow SRAM (0 Wait-State XIP)",
    readAccessTimeNs: 3.0,
    readEnergyPjPerByte: 3.2,
    waitStatesAt80Mhz: 0,
    standbyLeakageNa: 85.0,    // SRAM cell leakage
    requiresShadowRam: true,
    zeroMaskAdder: true,
  },
  logic_mtp: {
    id: "logic_mtp",
    nameZh: "邏輯相容 0-Mask MTP (多次線上可覆寫)",
    nameEn: "Logic 0-Mask MTP (Multi-Time Field Reprogrammable)",
    readAccessTimeNs: 24.0,
    readEnergyPjPerByte: 4.5,
    waitStatesAt80Mhz: 2,
    standbyLeakageNa: 0.12,
    requiresShadowRam: false,
    zeroMaskAdder: true,
  },
  ext_spi_nor: {
    id: "ext_spi_nor",
    nameZh: "晶片外 Quad-SPI NOR Flash (高延遲 / 腳位開銷)",
    nameEn: "External Quad-SPI NOR Flash (High Latency / IO Energy)",
    readAccessTimeNs: 140.0,
    readEnergyPjPerByte: 45.0,
    waitStatesAt80Mhz: 11,
    standbyLeakageNa: 1500.0,
    requiresShadowRam: false,
    zeroMaskAdder: true,
  },
});

/**
 * Calculates Vector Patch CAM power, latency, and economic silicon savings.
 *
 * @param {Object} options
 * @param {string} [options.workloadKey="ble_beacon_ulp"]
 * @param {string} [options.backendKey="antifuse_direct"]
 * @param {number} [options.camEntries=16] - 8, 16, 32, 64 entries
 * @param {number} [options.clockMhz=48.0] - 1 to 160 MHz
 * @param {number} [options.supplyVdd=1.2] - 0.5V to 3.3V
 * @returns {Object} Comprehensive calculation metrics
 */
export function calculateMcuVectorPatch({
  workloadKey = "ble_beacon_ulp",
  backendKey = "antifuse_direct",
  camEntries = 16,
  clockMhz = 48.0,
  supplyVdd = 1.2,
} = {}) {
  const workload = MCU_PATCH_WORKLOAD_PRESETS[workloadKey] || MCU_PATCH_WORKLOAD_PRESETS.ble_beacon_ulp;
  const backend = PATCH_STORAGE_BACKENDS[backendKey] || PATCH_STORAGE_BACKENDS.antifuse_direct;

  const nCam = Math.max(4, Math.min(128, Number(camEntries) || 16));
  const fMhz = Math.max(1.0, Math.min(200.0, Number(clockMhz) || 48.0));
  const vdd = Math.max(0.5, Math.min(3.6, Number(supplyVdd) || 1.2));

  const tCycleNs = 1000.0 / fMhz;

  // 1. CAM Matchline Power & Energy:
  // Each entry has ~32 bits (address comparator). Matchline cap C_ml ~ 25 fF.
  const cMatchlineFarads = 25e-15;
  const eCamMatchJoules = nCam * cMatchlineFarads * Math.pow(vdd, 2);
  const eCamMatchPj = eCamMatchJoules * 1e12;
  const pCamDynamicUw = (eCamMatchJoules * (fMhz * 1e6)) * 1e6; // in microWatts

  // 2. Patch Interception Timing & Latency Penalty:
  // Wait states required by backend access time:
  const requiredWaitStates = Math.max(0, Math.ceil((backend.readAccessTimeNs - 0.2 * tCycleNs) / tCycleNs));
  const patchLatencyCycles = 1 + requiredWaitStates; // 1 cycle CAM mux + wait states
  const patchLatencyNs = patchLatencyCycles * tCycleNs;

  // 3. Instruction Execution Energy (pJ/instruction):
  // Baseline Mask ROM fetch: ~0.8 pJ/instr @ 1.2V
  const baseRomPj = 0.8 * Math.pow(vdd / 1.2, 2);
  const coreBasePj = 3.5 * Math.pow(vdd / 1.2, 2);
  const normalRomInstrPj = baseRomPj + coreBasePj;

  // Intercepted patch instruction energy:
  const patchBackendPj = (backend.readEnergyPjPerByte * 4.0) * Math.pow(vdd / 1.2, 2); // 32-bit (4-byte) instruction
  const patchedInstrPj = eCamMatchPj + patchBackendPj + (coreBasePj * (1 + requiredWaitStates * 0.35));

  // 4. Silicon Area & Wafer Economics vs Full Embedded Flash:
  // Area models at 40nm/28nm equivalent:
  // Mask ROM: 0.22 um2/bit
  // AntiFuse OTP: 0.35 um2/bit
  // CAM Cell (10T): 2.4 um2/bit (32 bits per entry + match control)
  // eFlash Cell: 1.2 um2/bit + 8~10 masks (+25% wafer cost)
  const totalRomBits = workload.romSizeKb * 1024 * 8;
  const totalOtpBits = workload.otpSizeKb * 1024 * 8;
  const camBits = nCam * 32;

  const areaRomMm2 = (totalRomBits * 0.22e-6);
  const areaOtpMm2 = (totalOtpBits * 0.35e-6);
  const areaCamMm2 = (camBits * 2.4e-6) * 1.5; // with row decoders
  const totalHybridAreaMm2 = areaRomMm2 + areaOtpMm2 + areaCamMm2;

  // Full eFlash equivalent (requires entire ROM + patch space to be eFlash):
  const totalFlashBits = (workload.romSizeKb + workload.otpSizeKb) * 1024 * 8;
  const totalFlashAreaMm2 = (totalFlashBits * 1.2e-6) * 1.4; // with charge pump peripheral

  // Wafer cost with masks:
  // Hybrid logic: 0 extra masks (Relative Cost = 1.0)
  // eFlash: +9 masks (Relative Cost = 1.28)
  const costHybridRel = totalHybridAreaMm2 * 1.0;
  const costFlashRel = totalFlashAreaMm2 * 1.28;
  const waferCostSavingsPercent = Math.max(10.0, Math.min(85.0, ((costFlashRel - costHybridRel) / costFlashRel) * 100.0));

  // 5. Residual Security Lifespan (Estimated CVE patches supported):
  const estimatedPatchesPerYear = Math.max(1, Math.round(workload.cveVulnerabilityRate * 10));
  const remainingYearsCapacity = Number((nCam / estimatedPatchesPerYear).toFixed(1));

  return {
    workloadKey: workload.id,
    workloadNameZh: workload.nameZh,
    workloadNameEn: workload.nameEn,
    backendKey: backend.id,
    backendNameZh: backend.nameZh,
    backendNameEn: backend.nameEn,
    camEntries: nCam,
    clockMhz: fMhz,
    supplyVdd: vdd,
    pCamDynamicUw: Number(pCamDynamicUw.toFixed(1)),
    patchLatencyCycles,
    patchLatencyNs: Number(patchLatencyNs.toFixed(1)),
    normalRomInstrPj: Number(normalRomInstrPj.toFixed(2)),
    patchedInstrPj: Number(patchedInstrPj.toFixed(2)),
    totalHybridAreaMm2: Number(totalHybridAreaMm2.toFixed(3)),
    waferCostSavingsPercent: Number(waferCostSavingsPercent.toFixed(1)),
    remainingYearsCapacity,
    isNearThreshold: vdd <= 0.7,
    isZeroWaitState: requiredWaitStates === 0,
  };
}

/**
 * Draws the high-DPI Canvas visualization for the Vector Patch CAM Simulator.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} results - Calculation output from calculateMcuVectorPatch
 * @param {string} mode - 'address_map' or 'pipeline_timing'
 * @param {boolean} isZh - Language flag
 */
export function drawVectorPatchCanvas(canvas, results, mode = "address_map", isZh = true) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth || 420;
  const displayHeight = canvas.clientHeight || 180;

  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, displayWidth, displayHeight);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, displayWidth, displayHeight);
  bgGrad.addColorStop(0, "#08101a");
  bgGrad.addColorStop(1, "#03070d");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, displayWidth, displayHeight);

  const plotLeft = 25;
  const plotRight = displayWidth - 20;
  const plotTop = 20;
  const plotBottom = displayHeight - 20;

  if (mode === "address_map") {
    // ----------------------------------------------------
    // Mode A: Address Space Interception Memory Map
    // ----------------------------------------------------
    const colWidth = 100;
    const colHeight = displayHeight - 55;

    // 1. CPU Bus Column (Left):
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.4;
    ctx.fillStyle = "rgba(56, 189, 248, 0.08)";
    ctx.fillRect(plotLeft, plotTop + 10, colWidth, colHeight);
    ctx.strokeRect(plotLeft, plotTop + 10, colWidth, colHeight);

    ctx.fillStyle = "#38bdf8";
    ctx.font = "700 9.5px 'IBM Plex Mono', monospace";
    ctx.fillText("CPU FETCH BUS", plotLeft + 10, plotTop + 24);
    ctx.font = "500 8.5px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("PC: 0x0800_1240", plotLeft + 10, plotTop + 40);

    // 2. Hardware CAM Comparator (Center):
    const camX = plotLeft + colWidth + 40;
    const camW = 120;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 1.4;
    ctx.fillStyle = "rgba(251, 191, 36, 0.08)";
    ctx.fillRect(camX, plotTop + 10, camW, colHeight);
    ctx.strokeRect(camX, plotTop + 10, camW, colHeight);

    ctx.fillStyle = "#fbbf24";
    ctx.font = "700 9.5px 'IBM Plex Mono', monospace";
    ctx.fillText(`CAM (${results.camEntries} SLOTS)`, camX + 10, plotTop + 24);

    // Draw active slot match indicators:
    for (let s = 0; s < Math.min(6, results.camEntries); s++) {
      const slotY = plotTop + 36 + s * 14;
      const isHit = s === 1;
      ctx.fillStyle = isHit ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.04)";
      ctx.strokeStyle = isHit ? "#10b981" : "rgba(148, 163, 184, 0.2)";
      ctx.fillRect(camX + 8, slotY, camW - 16, 11);
      ctx.strokeRect(camX + 8, slotY, camW - 16, 11);

      ctx.fillStyle = isHit ? "#10b981" : "#64748b";
      ctx.font = "600 8px 'IBM Plex Mono', monospace";
      ctx.fillText(isHit ? "SLOT #1: MATCH [HIT]" : `SLOT #${s}: 0x0800_${(0x1000 + s * 0x80).toString(16)}`, camX + 12, slotY + 8);
    }

    // Interconnect Arrow CPU -> CAM
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(plotLeft + colWidth, plotTop + 40);
    ctx.lineTo(camX, plotTop + 40);
    ctx.stroke();

    // 3. Redirection Target (Right):
    const targetX = camX + camW + 40;
    const targetW = displayWidth - targetX - 15;
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1.4;
    ctx.fillStyle = "rgba(16, 185, 129, 0.08)";
    ctx.fillRect(targetX, plotTop + 10, targetW, colHeight);
    ctx.strokeRect(targetX, plotTop + 10, targetW, colHeight);

    ctx.fillStyle = "#10b981";
    ctx.font = "700 9.5px 'IBM Plex Mono', monospace";
    ctx.fillText("PATCH BACKEND", targetX + 10, plotTop + 24);
    ctx.font = "500 8px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(results.backendNameEn.slice(0, 18), targetX + 10, plotTop + 38);
    ctx.fillText(`Wait: ${results.patchLatencyCycles - 1} cycles`, targetX + 10, plotTop + 50);

    // Branch Redirect Wire (Green arrow):
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(camX + camW, plotTop + 56);
    ctx.lineTo(targetX, plotTop + 56);
    ctx.stroke();

    // Draw bottom status summary text:
    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#e2e8f0";
    const statusText = isZh
      ? `▶ CAM 查找功率: ${results.pCamDynamicUw} μW · 重新導向延遲: ${results.patchLatencyNs} ns (${results.patchLatencyCycles} 週期) · 晶圓成本節省: ${results.waferCostSavingsPercent}%`
      : `▶ CAM Power: ${results.pCamDynamicUw} μW · Redirect Latency: ${results.patchLatencyNs} ns (${results.patchLatencyCycles} cyc) · Wafer Cost Saving: ${results.waferCostSavingsPercent}%`;
    ctx.fillText(statusText, plotLeft, displayHeight - 8);

  } else {
    // ----------------------------------------------------
    // Mode B: Pipeline Clock Cycle & Latency Breakdown
    // ----------------------------------------------------
    const cycW = (plotRight - plotLeft - 70) / Math.max(4, results.patchLatencyCycles + 2);
    const stages = [
      { name: "CYCLE 1: FETCH", sub: "PC -> Bus", color: "#38bdf8" },
      { name: "CYCLE 1: CAM MATCH", sub: "Parallel SNOOP", color: "#fbbf24" },
    ];

    for (let w = 0; w < results.patchLatencyCycles - 1; w++) {
      stages.push({ name: `WAIT STATE #${w + 1}`, sub: "Backend Memory Read", color: "#f59e0b" });
    }
    stages.push({ name: "PATCH EXECUTE", sub: "CPU ALUs Execute", color: "#10b981" });

    stages.forEach((st, idx) => {
      const x = plotLeft + idx * (cycW + 8);
      const y = plotTop + 25;
      const h = displayHeight - 75;

      ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
      ctx.strokeStyle = st.color;
      ctx.lineWidth = 1.4;
      ctx.fillRect(x, y, cycW, h);
      ctx.strokeRect(x, y, cycW, h);

      ctx.fillStyle = st.color;
      ctx.font = "700 8.5px 'IBM Plex Mono', monospace";
      ctx.fillText(st.name, x + 6, y + 16);
      ctx.fillStyle = "#94a3b8";
      ctx.font = "500 7.5px 'IBM Plex Mono', monospace";
      ctx.fillText(st.sub, x + 6, y + 30);
    });

    ctx.font = "600 9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#e2e8f0";
    const pipeText = isZh
      ? `時脈週期: ${(1000 / results.clockMhz).toFixed(1)} ns (@ ${results.clockMhz} MHz) · 常規指令: ${results.normalRomInstrPj} pJ · 補丁指令: ${results.patchedInstrPj} pJ`
      : `Clock Period: ${(1000 / results.clockMhz).toFixed(1)} ns (@ ${results.clockMhz} MHz) · Normal: ${results.normalRomInstrPj} pJ · Patched: ${results.patchedInstrPj} pJ`;
    ctx.fillText(pipeText, plotLeft, displayHeight - 8);
  }

  ctx.restore();
}

/**
 * Initializes DOM bindings for the Vector Patch CAM Simulator.
 */
export function initMcuVectorPatchSimulator() {
  const root = document.getElementById("mcu-vector-patch-simulator-root");
  if (!root) return;

  const workloadSelect = document.getElementById("patch-workload-select");
  const backendSelect = document.getElementById("patch-backend-select");
  const camSelect = document.getElementById("patch-cam-select");
  const clockSlider = document.getElementById("patch-clock-slider");
  const clockVal = document.getElementById("patch-clock-val");
  const voltSlider = document.getElementById("patch-volt-slider");
  const voltVal = document.getElementById("patch-volt-val");

  // Output KPI cards
  const outCampower = document.getElementById("patch-out-campower");
  const outLatency = document.getElementById("patch-out-latency");
  const outEnergy = document.getElementById("patch-out-energy");
  const outSavings = document.getElementById("patch-out-savings");
  const outLifespan = document.getElementById("patch-out-lifespan");
  const outVerdict = document.getElementById("patch-out-verdict");

  // Mode buttons & Canvas
  const modeBtnMap = document.getElementById("patch-mode-map");
  const modeBtnPipe = document.getElementById("patch-mode-pipe");
  const canvas = document.getElementById("patch-canvas");

  let currentVisualMode = "address_map";

  function getLang() {
    return (window.HubLanguage?.get() || document.documentElement.lang || "zh").startsWith("zh");
  }

  function update() {
    const isZh = getLang();
    const workloadKey = workloadSelect ? workloadSelect.value : "ble_beacon_ulp";
    const backendKey = backendSelect ? backendSelect.value : "antifuse_direct";
    const camEntries = camSelect ? parseInt(camSelect.value, 10) : 16;
    const clockMhz = clockSlider ? parseFloat(clockSlider.value) : 48.0;
    const supplyVdd = voltSlider ? parseFloat(voltSlider.value) : 1.2;

    if (clockVal && clockSlider) {
      clockVal.textContent = `${clockSlider.value} MHz`;
    }
    if (voltVal && voltSlider) {
      voltVal.textContent = `${voltSlider.value} V`;
    }

    const res = calculateMcuVectorPatch({
      workloadKey,
      backendKey,
      camEntries,
      clockMhz,
      supplyVdd,
    });

    if (outCampower) {
      outCampower.textContent = `${res.pCamDynamicUw} μW`;
      outCampower.style.color = res.pCamDynamicUw < 15.0 ? "#059669" : res.pCamDynamicUw < 60.0 ? "#0284c7" : "#d97706";
    }
    if (outLatency) {
      outLatency.textContent = isZh
        ? `${res.patchLatencyCycles} 週期 (${res.patchLatencyNs} ns)`
        : `${res.patchLatencyCycles} cyc (${res.patchLatencyNs} ns)`;
      outLatency.style.color = res.isZeroWaitState ? "#059669" : "#0284c7";
    }
    if (outEnergy) {
      outEnergy.textContent = `${res.patchedInstrPj} pJ`;
    }
    if (outSavings) {
      outSavings.textContent = `${res.waferCostSavingsPercent}%`;
      outSavings.style.color = "#059669";
    }
    if (outLifespan) {
      outLifespan.textContent = isZh ? `${res.remainingYearsCapacity} 年` : `${res.remainingYearsCapacity} Yrs`;
    }

    if (outVerdict) {
      if (res.isZeroWaitState && res.isNearThreshold) {
        outVerdict.innerHTML = isZh
          ? `<strong>【近臨界電壓極致超低功耗 (NTV 0.6V)】</strong> CAM 平行比對僅消耗 <strong>${res.pCamDynamicUw} μW</strong>，並達成<strong>零等待週期 (0 Wait-State)</strong> 瞬時重新導向。相較於全晶片 eFlash，節省 <strong>${res.waferCostSavingsPercent}% 晶圓製造成本</strong> 且無需額外光罩。`
          : `<strong>[NTV 0.6V NEAR-THRESHOLD OPTIMAL]</strong> CAM parallel snoop consumes only <strong>${res.pCamDynamicUw} μW</strong> with <strong>0 Wait-State</strong> instant redirection. Saves <strong>${res.waferCostSavingsPercent}% wafer cost</strong> over full eFlash with 0 mask adders.`;
      } else if (res.patchLatencyCycles <= 2) {
        outVerdict.innerHTML = isZh
          ? `<strong>【高效能平衡型修補架構】</strong> AntiFuse OTP 直接讀取僅需 <strong>${res.patchLatencyCycles} 週期</strong>（延遲 ${res.patchLatencyNs} ns），指令能耗維持在 <strong>${res.patchedInstrPj} pJ</strong>。CAM 槽位裕度足以支援 <strong>${res.remainingYearsCapacity} 年</strong> 現場安全韌體熱修復。`
          : `<strong>[BALANCED SECURE HOT-PATCHING]</strong> AntiFuse OTP direct fetch completes in <strong>${res.patchLatencyCycles} cycles</strong> (${res.patchLatencyNs} ns), drawing <strong>${res.patchedInstrPj} pJ/instr</strong>. Supports <strong>${res.remainingYearsCapacity} years</strong> of field firmware updates.`;
      } else {
        outVerdict.innerHTML = isZh
          ? `<strong>【匯流排等待週期警訊】</strong> 所選後端儲存（如晶片外 SPI Flash）需高達 <strong>${res.patchLatencyCycles} 個等待週期</strong>（延遲 ${res.patchLatencyNs} ns），將造成 CPU 管線停頓並增加能耗（${res.patchedInstrPj} pJ）。建議改採<strong>片上 AntiFuse OTP 或影子 SRAM</strong>。`
          : `<strong>[BUS WAIT-STATE PENALTY ALERT]</strong> Selected backend requires <strong>${res.patchLatencyCycles} wait states</strong> (${res.patchLatencyNs} ns), stalling the CPU pipeline and inflating instruction energy (${res.patchedInstrPj} pJ). Upgrade to <strong>on-chip AntiFuse or Shadow SRAM</strong>.`;
      }
    }

    if (canvas) {
      drawVectorPatchCanvas(canvas, res, currentVisualMode, isZh);
    }
  }

  // Populate Selects if empty
  if (workloadSelect && workloadSelect.options.length === 0) {
    Object.values(MCU_PATCH_WORKLOAD_PRESETS).forEach((w) => {
      const opt = document.createElement("option");
      opt.value = w.id;
      opt.textContent = getLang() ? w.nameZh : w.nameEn;
      opt.setAttribute("data-opt-zh", w.nameZh);
      opt.setAttribute("data-opt-en", w.nameEn);
      workloadSelect.appendChild(opt);
    });
  }

  if (backendSelect && backendSelect.options.length === 0) {
    Object.values(PATCH_STORAGE_BACKENDS).forEach((b) => {
      const opt = document.createElement("option");
      opt.value = b.id;
      opt.textContent = getLang() ? b.nameZh : b.nameEn;
      opt.setAttribute("data-opt-zh", b.nameZh);
      opt.setAttribute("data-opt-en", b.nameEn);
      backendSelect.appendChild(opt);
    });
  }

  workloadSelect?.addEventListener("change", () => {
    const w = MCU_PATCH_WORKLOAD_PRESETS[workloadSelect.value];
    if (w) {
      if (camSelect) camSelect.value = String(w.defaultCamEntries);
      if (clockSlider) clockSlider.value = String(w.defaultClockMhz);
      if (voltSlider) voltSlider.value = String(w.defaultSupplyVdd);
    }
    update();
  });

  backendSelect?.addEventListener("change", update);
  camSelect?.addEventListener("change", update);
  clockSlider?.addEventListener("input", update);
  voltSlider?.addEventListener("input", update);

  if (modeBtnMap && modeBtnPipe) {
    modeBtnMap.addEventListener("click", () => {
      currentVisualMode = "address_map";
      modeBtnMap.classList.add("active");
      modeBtnMap.setAttribute("aria-pressed", "true");
      modeBtnMap.style.background = "#059669";
      modeBtnMap.style.borderColor = "#10b981";
      modeBtnMap.style.color = "#ffffff";

      modeBtnPipe.classList.remove("active");
      modeBtnPipe.setAttribute("aria-pressed", "false");
      modeBtnPipe.style.background = "#1e293b";
      modeBtnPipe.style.borderColor = "#475569";
      modeBtnPipe.style.color = "#94a3b8";
      update();
    });

    modeBtnPipe.addEventListener("click", () => {
      currentVisualMode = "pipeline_timing";
      modeBtnPipe.classList.add("active");
      modeBtnPipe.setAttribute("aria-pressed", "true");
      modeBtnPipe.style.background = "#059669";
      modeBtnPipe.style.borderColor = "#10b981";
      modeBtnPipe.style.color = "#ffffff";

      modeBtnMap.classList.remove("active");
      modeBtnMap.setAttribute("aria-pressed", "false");
      modeBtnMap.style.background = "#1e293b";
      modeBtnMap.style.borderColor = "#475569";
      modeBtnMap.style.color = "#94a3b8";
      update();
    });
  }

  window.addEventListener("hub:language-change", () => {
    const isZh = getLang();
    if (workloadSelect) {
      Array.from(workloadSelect.options).forEach((opt) => {
        opt.textContent = isZh ? opt.getAttribute("data-opt-zh") : opt.getAttribute("data-opt-en");
      });
    }
    if (backendSelect) {
      Array.from(backendSelect.options).forEach((opt) => {
        opt.textContent = isZh ? opt.getAttribute("data-opt-zh") : opt.getAttribute("data-opt-en");
      });
    }
    update();
  });

  window.addEventListener("resize", () => {
    update();
  });

  update();
}

// Auto-boot on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMcuVectorPatchSimulator);
  } else {
    initMcuVectorPatchSimulator();
  }
}
