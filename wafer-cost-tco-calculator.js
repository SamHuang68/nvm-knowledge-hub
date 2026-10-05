/**
 * wafer-cost-tco-calculator.js — Advanced & Mature Foundry eNVM Wafer Mask-Adder, Murphy Yield & TCO Economics Calculator
 *
 * First-Principles Semiconductor Cost & Yield Economics Equations:
 * 1. Wafer Fabrication Cost Identity with eNVM Mask Adders:
 *    C_{wafer\_fab} = C_{base} \cdot [1 + (\alpha_{mask} / 100) \cdot \Delta N_{mask}]
 *    C_{wafer\_total} = C_{wafer\_fab} + \frac{C_{mask\_set\_nre}}{V_{annual\_wafers}}
 * 2. Gross Dies Per Wafer (GDPW) for 300mm (or 200mm) Wafers with Edge Die Exclusion:
 *    GDPW = \frac{\pi \cdot (d_{wafer} / 2)^2}{A_{die}} - \frac{\pi \cdot d_{wafer}}{\sqrt{2 \cdot A_{die}}}
 * 3. Murphy Semiconductor Defect Yield Model (Industry Benchmark):
 *    D_{eff} = D_0 + \Delta D_{envm}  (defects / cm^2)
 *    Y_{murphy} = \left[ \frac{1 - \exp(-A_{die\_cm2} \cdot D_{eff})}{A_{die\_cm2} \cdot D_{eff}} \right]^2
 *    Y_{poisson} = \exp(-A_{die\_cm2} \cdot D_{eff})
 * 4. Net Good Dies and Good Die Net Cost:
 *    N_{good} = \lfloor GDPW \cdot Y_{murphy} \rfloor
 *    C_{die\_net} = \frac{C_{wafer\_total}}{N_{good}} + C_{test\_per\_die}
 * 5. Lifecycle Total Cost of Ownership (TCO):
 *    TCO_{annual} = V_{annual\_wafers} \cdot C_{wafer\_total}
 *    \Delta TCO_{savings} = TCO_{other} - TCO_{antifuse\_0mask}
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: SemiAnalysis Foundry Economics, TSMC / UMC Mask Adder Whitepapers, IEEE Transactions on Semiconductor Manufacturing
 */

/**
 * Foundry process baseline presets.
 */
export const FOUNDRY_PROCESS_PRESETS = Object.freeze({
  "55nm_mature": {
    id: "55nm_mature",
    nameZh: "55nm / 40nm 成熟製程 (TSMC/UMC 300mm 基準)",
    nameEn: "55nm / 40nm Mature Node (TSMC/UMC 300mm Baseline)",
    waferDiameterMm: 300,
    baseWaferCostUsd: 1850,
    baseMaskLayers: 32,
    baseMaskSetNreUsd: 350000,
    baseDefectDensityD0: 0.08, // defects per cm^2
    alphaMaskPercent: 2.3, // ~2.3% per mask layer
  },
  "28nm_hpc": {
    id: "28nm_hpc",
    nameZh: "28nm HPC+ / 22ULL 平面邏輯 (TSMC/GF 300mm 基準)",
    nameEn: "28nm HPC+ / 22ULL Planar Logic (TSMC/GF 300mm Baseline)",
    waferDiameterMm: 300,
    baseWaferCostUsd: 3200,
    baseMaskLayers: 42,
    baseMaskSetNreUsd: 1200000,
    baseDefectDensityD0: 0.06,
    alphaMaskPercent: 2.1,
  },
  "16nm_finfet": {
    id: "16nm_finfet",
    nameZh: "16FFC / 12FFC+ FinFET 邏輯 (TSMC 300mm 基準)",
    nameEn: "16FFC / 12FFC+ FinFET Logic (TSMC 300mm Baseline)",
    waferDiameterMm: 300,
    baseWaferCostUsd: 4800,
    baseMaskLayers: 55,
    baseMaskSetNreUsd: 2500000,
    baseDefectDensityD0: 0.05,
    alphaMaskPercent: 1.8,
  },
  "5nm_advanced": {
    id: "5nm_advanced",
    nameZh: "5nm / 4nm EUV 先進 FinFET (TSMC N5/N4P 300mm 基準)",
    nameEn: "5nm / 4nm EUV Advanced FinFET (TSMC N5/N4P 300mm Baseline)",
    waferDiameterMm: 300,
    baseWaferCostUsd: 16500,
    baseMaskLayers: 78,
    baseMaskSetNreUsd: 8500000,
    baseDefectDensityD0: 0.04,
    alphaMaskPercent: 1.5,
  },
});

/**
 * eNVM technology cost profiles and defect adders.
 */
export const ENVM_COST_PROFILES = Object.freeze({
  antifuse_logic: {
    id: "antifuse_logic",
    nameZh: "純邏輯 AntiFuse OTP (0 額外光罩 / 零熱預算 / 零良率折損)",
    nameEn: "Pure Logic AntiFuse OTP (0-Mask / Zero Thermal Budget / Zero Yield Penalty)",
    maskAdders: 0,
    maskNreMultiplier: 0.0,
    defectAdderD0: 0.0, // Zero additional defect density
    testCostPerDieUsd: 0.015,
    thermalBudgetPenalty: "Zero (Standard logic gate dielectric)",
    scalingLimit: "Sub-2nm GAA Nanosheet / 3D Stackable",
  },
  eflash_split_gate: {
    id: "eflash_split_gate",
    nameZh: "Split-Gate 嵌入式閃存 eFlash (8~11 道光罩 / 高溫退火良率折損 / 28nm 極限)",
    nameEn: "Split-Gate Embedded Flash (8-11 Masks / Thermal Anneal Degradation / 28nm Limit)",
    maskAdders: 10,
    maskNreMultiplier: 0.28,
    defectAdderD0: 0.035, // High thermal budget (>1000°C) degrades wafer yield
    testCostPerDieUsd: 0.085,
    thermalBudgetPenalty: "Severe (>1000°C anneal limits logic Vt and reliability)",
    scalingLimit: "28nm Planar (Cannot scale to FinFET / GAA)",
  },
  beol_emram: {
    id: "beol_emram",
    nameZh: "BEOL 嵌入式 STT-MRAM (4~5 道光罩 / 磁性穿隧層 M4-M5 / 高溫敏感)",
    nameEn: "BEOL Embedded STT-MRAM (4-5 Masks / MTJ Stack M4-M5 / High-Temp Sensitivity)",
    maskAdders: 4,
    maskNreMultiplier: 0.15,
    defectAdderD0: 0.018, // Magnetic tunnel junction etch defects
    testCostPerDieUsd: 0.060,
    thermalBudgetPenalty: "Moderate (BEOL integration <400°C, MTJ PMA degrade >260°C)",
    scalingLimit: "16nm / 12nm FinFET & 22FDX",
  },
  beol_reram: {
    id: "beol_reram",
    nameZh: "BEOL 阻變式 ReRAM / OxRAM (2~3 道光罩 / 金屬氧化物微絲 / Forming 良率波動)",
    nameEn: "BEOL Resistive ReRAM / OxRAM (2-3 Masks / Oxide Filament / Forming Yield Variance)",
    maskAdders: 2,
    maskNreMultiplier: 0.08,
    defectAdderD0: 0.022, // Filament electroforming yield variability
    testCostPerDieUsd: 0.045,
    thermalBudgetPenalty: "Low (BEOL integration <400°C, oxygen vacancy diffusion)",
    scalingLimit: "22nm / 16nm FinFET",
  },
});

/**
 * Calculates wafer cost, silicon yield, and lifecycle TCO economics based on first principles.
 *
 * @param {Object} inputs
 * @param {string} [inputs.processId='28nm_hpc']
 * @param {string} [inputs.envmId='antifuse_logic']
 * @param {number} [inputs.dieAreaMm2=25.0]
 * @param {number} [inputs.annualWaferVolume=30000]
 * @param {number} [inputs.customMaskAdders]
 * @param {number} [inputs.customMaskSetNreUsd]
 * @returns {Object} Comprehensive calculation results
 */
export function calculateWaferCostTco(inputs = {}) {
  const processId = inputs.processId || "28nm_hpc";
  const envmId = inputs.envmId || "antifuse_logic";
  const dieAreaMm2 = Math.max(1.0, Math.min(200.0, Number(inputs.dieAreaMm2) || 25.0));
  const annualWaferVolume = Math.max(500, Math.min(500000, Number(inputs.annualWaferVolume) || 30000));

  const process = FOUNDRY_PROCESS_PRESETS[processId] || FOUNDRY_PROCESS_PRESETS["28nm_hpc"];
  const envm = ENVM_COST_PROFILES[envmId] || ENVM_COST_PROFILES["antifuse_logic"];

  const maskAdders = Number.isFinite(inputs.customMaskAdders) ? inputs.customMaskAdders : envm.maskAdders;
  const totalMaskLayers = process.baseMaskLayers + maskAdders;

  // 1. Wafer Fabrication Cost
  const maskAdderRatio = (process.alphaMaskPercent / 100.0) * maskAdders;
  const waferFabCostUsd = process.baseWaferCostUsd * (1.0 + maskAdderRatio);

  // 2. Mask Set NRE Amortization
  const baseMaskNre = Number.isFinite(inputs.customMaskSetNreUsd) ? inputs.customMaskSetNreUsd : process.baseMaskSetNreUsd;
  const totalMaskNreUsd = baseMaskNre * (1.0 + envm.maskNreMultiplier);
  const maskAmortizationPerWaferUsd = totalMaskNreUsd / annualWaferVolume;

  const totalWaferCostUsd = waferFabCostUsd + maskAmortizationPerWaferUsd;

  // 3. Gross Dies Per Wafer (GDPW) - 300mm wafer with edge die exclusion
  const waferRadiusMm = process.waferDiameterMm / 2.0;
  const waferAreaMm2 = Math.PI * Math.pow(waferRadiusMm, 2);
  const edgeExclusionPenalty = (Math.PI * process.waferDiameterMm) / Math.sqrt(2.0 * dieAreaMm2);
  const gdpw = Math.max(1, Math.floor(waferAreaMm2 / dieAreaMm2 - edgeExclusionPenalty));

  // 4. Yield Models (Murphy Benchmark & Poisson Comparison)
  const dieAreaCm2 = dieAreaMm2 / 100.0;
  const effectiveD0 = process.baseDefectDensityD0 + envm.defectAdderD0;
  const adProduct = dieAreaCm2 * effectiveD0;

  // Murphy yield formula: Y = ((1 - exp(-A*D)) / (A*D))^2
  let murphyYield = 1.0;
  if (adProduct > 0.0001) {
    murphyYield = Math.pow((1.0 - Math.exp(-adProduct)) / adProduct, 2);
  }
  murphyYield = Math.min(0.999, Math.max(0.01, murphyYield));

  // Poisson baseline formula: Y = exp(-A*D)
  const poissonYield = Math.min(0.999, Math.max(0.01, Math.exp(-adProduct)));

  // 5. Net Good Dies and Good Die Net Cost
  const netGoodDies = Math.max(1, Math.floor(gdpw * murphyYield));
  const siliconCostPerDieUsd = totalWaferCostUsd / netGoodDies;
  const totalDieCostUsd = siliconCostPerDieUsd + envm.testCostPerDieUsd;

  // 6. Annual TCO Economics
  const annualTotalTcoUsd = annualWaferVolume * totalWaferCostUsd;
  const annualTotalGoodChips = annualWaferVolume * netGoodDies;

  // 7. Baseline Comparison against Pure Logic AntiFuse (0-Mask)
  const antifuseProfile = ENVM_COST_PROFILES["antifuse_logic"];
  const afWaferFabCost = process.baseWaferCostUsd;
  const afMaskAmort = process.baseMaskSetNreUsd / annualWaferVolume;
  const afTotalWaferCost = afWaferFabCost + afMaskAmort;
  const afEffectiveD0 = process.baseDefectDensityD0;
  const afAdProduct = dieAreaCm2 * afEffectiveD0;
  let afMurphyYield = 1.0;
  if (afAdProduct > 0.0001) {
    afMurphyYield = Math.pow((1.0 - Math.exp(-afAdProduct)) / afAdProduct, 2);
  }
  const afNetGoodDies = Math.max(1, Math.floor(gdpw * afMurphyYield));
  const afTotalDieCost = (afTotalWaferCost / afNetGoodDies) + antifuseProfile.testCostPerDieUsd;
  const afAnnualTcoUsd = annualWaferVolume * afTotalWaferCost;

  const tcoDeltaUsd = annualTotalTcoUsd - afAnnualTcoUsd;
  const tcoPremiumPercent = afAnnualTcoUsd > 0 ? ((annualTotalTcoUsd - afAnnualTcoUsd) / afAnnualTcoUsd) * 100.0 : 0.0;
  const dieCostPremiumPercent = afTotalDieCost > 0 ? ((totalDieCostUsd - afTotalDieCost) / afTotalDieCost) * 100.0 : 0.0;

  return {
    processId,
    envmId,
    dieAreaMm2,
    annualWaferVolume,
    process,
    envm,
    maskAdders,
    totalMaskLayers,
    waferFabCostUsd,
    maskAmortizationPerWaferUsd,
    totalMaskNreUsd,
    totalWaferCostUsd,
    gdpw,
    effectiveD0,
    murphyYield,
    poissonYield,
    netGoodDies,
    siliconCostPerDieUsd,
    totalDieCostUsd,
    annualTotalTcoUsd,
    annualTotalGoodChips,
    afTotalDieCost,
    afAnnualTcoUsd,
    tcoDeltaUsd,
    tcoPremiumPercent,
    dieCostPremiumPercent,
  };
}

/**
 * Draws high-precision 2D Canvas visualizations for wafer TCO and yield economics.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} results
 * @param {'tco_volume'|'yield_die_cost'} mode
 * @param {boolean} isZh
 */
export function drawWaferCostTcoCanvas(canvas, results, mode = "tco_volume", isZh = true) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width || 760;
  const height = rect.height || 360;

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, width, height);

  // Background
  const isDark = document.documentElement.getAttribute("data-theme") !== "light";
  ctx.fillStyle = isDark ? "#0b1220" : "#f8fafc";
  ctx.fillRect(0, 0, width, height);

  const padLeft = 70;
  const padRight = 30;
  const padTop = 40;
  const padBottom = 50;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  // Grid & Axes
  ctx.strokeStyle = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = padTop + (plotH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(padLeft + plotW, y);
    ctx.stroke();
  }

  // Draw chart title
  ctx.fillStyle = isDark ? "#cbd5e1" : "#334155";
  ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "left";
  const titleText = mode === "tco_volume"
    ? (isZh ? "年晶圓產量 vs 累計總擁有成本 (TCO, 百萬美元 $M)" : "Annual Wafer Volume vs Cumulative TCO ($M USD)")
    : (isZh ? "晶粒面積 vs 每個良品晶片成本 ($ USD / Good Die)" : "Die Area vs Net Good Die Cost ($ USD / Die)");
  ctx.fillText(titleText, padLeft, 24);

  if (mode === "tco_volume") {
    // Volume Sweep: 2,000 to 100,000 wafers
    const minVol = 2000;
    const maxVol = 100000;
    const volSteps = 30;

    const envmList = [
      { id: "antifuse_logic", color: "#10b981", labelZh: "純邏輯 AntiFuse (0 光罩)", labelEn: "AntiFuse (0-Mask)" },
      { id: "beol_reram", color: "#06b6d4", labelZh: "BEOL ReRAM (2 光罩)", labelEn: "ReRAM (2-Mask)" },
      { id: "beol_emram", color: "#f59e0b", labelZh: "BEOL eMRAM (4 光罩)", labelEn: "eMRAM (4-Mask)" },
      { id: "eflash_split_gate", color: "#ef4444", labelZh: "Split-Gate eFlash (10 光罩)", labelEn: "eFlash (10-Mask)" },
    ];

    // Compute max TCO for scaling
    let maxTcoMillions = 10;
    envmList.forEach((tech) => {
      const res = calculateWaferCostTco({
        processId: results.processId,
        envmId: tech.id,
        dieAreaMm2: results.dieAreaMm2,
        annualWaferVolume: maxVol,
      });
      const tcoM = res.annualTotalTcoUsd / 1e6;
      if (tcoM > maxTcoMillions) maxTcoMillions = tcoM;
    });
    maxTcoMillions = Math.ceil(maxTcoMillions * 1.15);

    // Y Axis Labels
    ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const val = (maxTcoMillions * (5 - i)) / 5;
      const y = padTop + (plotH / 5) * i;
      ctx.fillText(`$${val.toFixed(0)}M`, padLeft - 8, y + 4);
    }

    // X Axis Labels
    ctx.textAlign = "center";
    for (let i = 0; i <= 5; i++) {
      const vol = minVol + ((maxVol - minVol) * i) / 5;
      const x = padLeft + (plotW / 5) * i;
      ctx.fillText(`${(vol / 1000).toFixed(0)}k`, x, height - padBottom + 18);
    }
    ctx.fillText(isZh ? "年晶圓投片量 (Wafers / Year)" : "Annual Wafer Volume (Wafers / Year)", padLeft + plotW / 2, height - 12);

    // Plot each technology
    envmList.forEach((tech) => {
      ctx.strokeStyle = tech.color;
      ctx.lineWidth = tech.id === results.envmId ? 3.0 : 1.5;
      ctx.beginPath();

      for (let s = 0; s <= volSteps; s++) {
        const vol = minVol + ((maxVol - minVol) * s) / volSteps;
        const res = calculateWaferCostTco({
          processId: results.processId,
          envmId: tech.id,
          dieAreaMm2: results.dieAreaMm2,
          annualWaferVolume: vol,
        });
        const tcoM = res.annualTotalTcoUsd / 1e6;
        const x = padLeft + ((vol - minVol) / (maxVol - minVol)) * plotW;
        const y = padTop + plotH - (tcoM / maxTcoMillions) * plotH;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Current Operating Point Marker
    const curX = padLeft + ((results.annualWaferVolume - minVol) / (maxVol - minVol)) * plotW;
    const curTcoM = results.annualTotalTcoUsd / 1e6;
    const curY = padTop + plotH - (curTcoM / maxTcoMillions) * plotH;

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Tooltip Callout
    ctx.fillStyle = isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(curX - 60, curY - 38, 120, 26);
    ctx.fillRect(curX - 60, curY - 38, 120, 26);
    ctx.fillStyle = isDark ? "#f1f5f9" : "#0f172a";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${(results.annualWaferVolume / 1000).toFixed(1)}k → $${curTcoM.toFixed(1)}M`, curX, curY - 21);

    // Legend
    let legX = padLeft + 15;
    const legY = height - padBottom - 15;
    envmList.forEach((tech) => {
      ctx.fillStyle = tech.color;
      ctx.fillRect(legX, legY - 8, 10, 10);
      ctx.fillStyle = isDark ? "#cbd5e1" : "#475569";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(isZh ? tech.labelZh : tech.labelEn, legX + 14, legY);
      legX += (isZh ? 140 : 120);
    });
  } else {
    // Mode: yield_die_cost (Die Area Sweep: 2 to 60 mm^2)
    const minArea = 2.0;
    const maxArea = 60.0;
    const areaSteps = 30;

    const envmList = [
      { id: "antifuse_logic", color: "#10b981", labelZh: "純邏輯 AntiFuse (D0 零增加)", labelEn: "AntiFuse (Zero Defect Adder)" },
      { id: "beol_reram", color: "#06b6d4", labelZh: "BEOL ReRAM (+0.022 D0)", labelEn: "ReRAM (+0.022 D0)" },
      { id: "beol_emram", color: "#f59e0b", labelZh: "BEOL eMRAM (+0.018 D0)", labelEn: "eMRAM (+0.018 D0)" },
      { id: "eflash_split_gate", color: "#ef4444", labelZh: "Split-Gate eFlash (+0.035 D0)", labelEn: "eFlash (+0.035 D0)" },
    ];

    let maxDieCost = 15;
    envmList.forEach((tech) => {
      const res = calculateWaferCostTco({
        processId: results.processId,
        envmId: tech.id,
        dieAreaMm2: maxArea,
        annualWaferVolume: results.annualWaferVolume,
      });
      if (res.totalDieCostUsd > maxDieCost) maxDieCost = res.totalDieCostUsd;
    });
    maxDieCost = Math.ceil(maxDieCost * 1.15);

    // Y Axis
    ctx.fillStyle = isDark ? "#94a3b8" : "#64748b";
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= 5; i++) {
      const val = (maxDieCost * (5 - i)) / 5;
      const y = padTop + (plotH / 5) * i;
      ctx.fillText(`$${val.toFixed(2)}`, padLeft - 8, y + 4);
    }

    // X Axis
    ctx.textAlign = "center";
    for (let i = 0; i <= 5; i++) {
      const area = minArea + ((maxArea - minArea) * i) / 5;
      const x = padLeft + (plotW / 5) * i;
      ctx.fillText(`${area.toFixed(0)} mm²`, x, height - padBottom + 18);
    }
    ctx.fillText(isZh ? "晶粒面積 Die Area (mm²)" : "Die Area (mm²)", padLeft + plotW / 2, height - 12);

    // Curves
    envmList.forEach((tech) => {
      ctx.strokeStyle = tech.color;
      ctx.lineWidth = tech.id === results.envmId ? 3.0 : 1.5;
      ctx.beginPath();

      for (let s = 0; s <= areaSteps; s++) {
        const area = minArea + ((maxArea - minArea) * s) / areaSteps;
        const res = calculateWaferCostTco({
          processId: results.processId,
          envmId: tech.id,
          dieAreaMm2: area,
          annualWaferVolume: results.annualWaferVolume,
        });
        const cost = res.totalDieCostUsd;
        const x = padLeft + ((area - minArea) / (maxArea - minArea)) * plotW;
        const y = padTop + plotH - (cost / maxDieCost) * plotH;

        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    // Current Operating Point
    const curX = padLeft + ((results.dieAreaMm2 - minArea) / (maxArea - minArea)) * plotW;
    const curCost = results.totalDieCostUsd;
    const curY = padTop + plotH - (curCost / maxDieCost) * plotH;

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(curX, curY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Callout
    ctx.fillStyle = isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(curX - 55, curY - 38, 110, 26);
    ctx.fillRect(curX - 55, curY - 38, 110, 26);
    ctx.fillStyle = isDark ? "#f1f5f9" : "#0f172a";
    ctx.font = "bold 11px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${results.dieAreaMm2.toFixed(1)}mm² → $${curCost.toFixed(2)}`, curX, curY - 21);

    // Legend
    let legX = padLeft + 15;
    const legY = height - padBottom - 15;
    envmList.forEach((tech) => {
      ctx.fillStyle = tech.color;
      ctx.fillRect(legX, legY - 8, 10, 10);
      ctx.fillStyle = isDark ? "#cbd5e1" : "#475569";
      ctx.font = "10px system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(isZh ? tech.labelZh : tech.labelEn, legX + 14, legY);
      legX += (isZh ? 140 : 120);
    });
  }

  ctx.restore();
}

/**
 * Initializes the interactive Wafer Cost & TCO Calculator component.
 *
 * @param {string} containerId - DOM root container ID
 */
export function initWaferCostTcoCalculator(containerId = "wafer-tco-calculator-root") {
  const container = document.getElementById(containerId);
  if (!container) return;

  let currentProcessId = "28nm_hpc";
  let currentEnvmId = "antifuse_logic";
  let currentDieArea = 25.0;
  let currentAnnualVolume = 30000;
  let currentChartMode = "tco_volume";

  function getLang() {
    return document.documentElement.getAttribute("data-lang") === "zh" || document.documentElement.lang === "zh-TW";
  }

  function renderSkeleton() {
    const isZh = getLang();
    container.innerHTML = `
      <div class="cost-tco-workbench bg-slate-900/60 border border-slate-700/60 rounded-xl p-5 md:p-6 shadow-2xl backdrop-blur-md">
        <div class="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-slate-700/60 gap-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span class="text-xs font-mono uppercase tracking-wider text-amber-400">
                ${isZh ? "第一性原理晶圓光罩附加與 TCO 經濟學模型" : "First-Principles Wafer Mask-Adder & TCO Economics Model"}
              </span>
            </div>
            <h3 class="text-lg md:text-xl font-bold text-white tracking-tight">
              ${isZh ? "晶圓光罩附加成本、Murphy 矽良率損失與百萬晶圓量產 TCO 經濟學試算器" : "eNVM Wafer Mask Adder, Murphy Yield Loss & Mass-Production TCO Economics Calculator"}
            </h3>
          </div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              ${isZh ? "300mm 晶圓量產標準" : "300mm Wafer Fab Standard"}
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          <!-- Controls Column -->
          <div class="lg:col-span-4 space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1" for="tco-process-select">
                ${isZh ? "晶圓代工製程節點基準" : "Foundry Process Node Baseline"}
              </label>
              <select id="tco-process-select" class="w-full bg-slate-800 text-slate-100 text-sm rounded-lg border border-slate-700 px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                <option value="55nm_mature">${isZh ? "55nm/40nm 成熟製程 ($1,850/wafer, 32 masks)" : "55nm/40nm Mature Node ($1,850/wafer, 32 masks)"}</option>
                <option value="28nm_hpc" selected>${isZh ? "28nm HPC+ 平面邏輯 ($3,200/wafer, 42 masks)" : "28nm HPC+ Planar Logic ($3,200/wafer, 42 masks)"}</option>
                <option value="16nm_finfet">${isZh ? "16nm/12nm FinFET 邏輯 ($4,800/wafer, 55 masks)" : "16nm/12nm FinFET Logic ($4,800/wafer, 55 masks)"}</option>
                <option value="5nm_advanced">${isZh ? "5nm/4nm EUV 先進 FinFET ($16,500/wafer, 78 masks)" : "5nm/4nm EUV Advanced FinFET ($16,500/wafer, 78 masks)"}</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1" for="tco-envm-select">
                ${isZh ? "eNVM 記憶體技術架構" : "eNVM Memory Architecture"}
              </label>
              <select id="tco-envm-select" class="w-full bg-slate-800 text-slate-100 text-sm rounded-lg border border-slate-700 px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none">
                <option value="antifuse_logic" selected>${isZh ? "純邏輯 AntiFuse (0 光罩 / 零良率懲罰)" : "Pure Logic AntiFuse (0-Mask / 0-Penalty)"}</option>
                <option value="beol_reram">${isZh ? "BEOL 阻變式 ReRAM (2 光罩 / 微絲 Forming 良率)" : "BEOL ReRAM (2-Mask / Oxide Filament)"}</option>
                <option value="beol_emram">${isZh ? "BEOL 嵌入式 STT-MRAM (4 光罩 / MTJ 堆疊)" : "BEOL STT-MRAM (4-Mask / MTJ Stack)"}</option>
                <option value="eflash_split_gate">${isZh ? "Split-Gate eFlash (10 光罩 / 高溫退火良率折損)" : "Split-Gate eFlash (10-Mask / Thermal Anneal)"}</option>
              </select>
            </div>

            <div class="p-3.5 bg-slate-800/70 border border-slate-700/50 rounded-lg">
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-slate-300 font-semibold">${isZh ? "單晶片總面積 (Die Area)" : "Die Area (mm²)"}</span>
                <span id="tco-area-val" class="font-mono text-amber-400 font-bold">25.0 mm²</span>
              </div>
              <input id="tco-area-slider" type="range" min="2" max="60" step="0.5" value="25.0" class="w-full accent-amber-500 cursor-pointer">
              <div class="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>2 mm² (IoT MCU)</span>
                <span>25 mm² (SoC)</span>
                <span>60 mm² (Edge AI)</span>
              </div>
            </div>

            <div class="p-3.5 bg-slate-800/70 border border-slate-700/50 rounded-lg">
              <div class="flex justify-between text-xs mb-1.5">
                <span class="text-slate-300 font-semibold">${isZh ? "年度晶圓投片總量 (Wafer Volume)" : "Annual Wafer Volume"}</span>
                <span id="tco-volume-val" class="font-mono text-emerald-400 font-bold">30,000 Wafers</span>
              </div>
              <input id="tco-volume-slider" type="range" min="1000" max="80000" step="1000" value="30000" class="w-full accent-emerald-500 cursor-pointer">
              <div class="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1,000 (Niche)</span>
                <span>30,000 (High Volume)</span>
                <span>80,000 (Mega Fab)</span>
              </div>
            </div>
          </div>

          <!-- Canvas & Chart Column -->
          <div class="lg:col-span-8 flex flex-col justify-between">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <button id="tco-chart-mode-vol" class="px-3 py-1 rounded text-xs font-semibold bg-amber-500 text-slate-900 border border-amber-400">
                  ${isZh ? "年產量 vs 累計 TCO 曲線" : "Volume vs TCO Curve"}
                </button>
                <button id="tco-chart-mode-yield" class="px-3 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200">
                  ${isZh ? "晶粒面積 vs 良品成本曲線" : "Die Area vs Good Die Cost"}
                </button>
              </div>
              <span id="tco-badge-savings" class="text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                0-Mask Reference
              </span>
            </div>

            <div class="relative w-full aspect-[2/1] bg-slate-950/70 rounded-lg border border-slate-800 p-2 overflow-hidden shadow-inner">
              <canvas id="tco-canvas" class="w-full h-full block"></canvas>
            </div>
          </div>
        </div>

        <!-- Metrics Output Ribbon -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-800">
          <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
            <div class="text-[11px] text-slate-400 font-medium">${isZh ? "光罩附加數" : "Mask Adders"}</div>
            <div id="m-mask-layers" class="text-lg font-bold font-mono text-white mt-0.5">+0 Masks</div>
            <div id="m-total-masks" class="text-[10px] text-slate-500 font-mono">42 Total</div>
          </div>

          <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
            <div class="text-[11px] text-slate-400 font-medium">${isZh ? "單片總晶圓成本" : "Total Wafer Cost"}</div>
            <div id="m-wafer-cost" class="text-lg font-bold font-mono text-amber-400 mt-0.5">$3,240</div>
            <div id="m-nre-amort" class="text-[10px] text-slate-500 font-mono">+$40 NRE/Wafer</div>
          </div>

          <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
            <div class="text-[11px] text-slate-400 font-medium">${isZh ? "毛晶粒數 GDPW" : "Gross Dies (GDPW)"}</div>
            <div id="m-gdpw" class="text-lg font-bold font-mono text-white mt-0.5">2,580</div>
            <div class="text-[10px] text-slate-500 font-mono">${isZh ? "300mm 晶圓幾何" : "300mm Geometry"}</div>
          </div>

          <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
            <div class="text-[11px] text-slate-400 font-medium">${isZh ? "Murphy 矽良率" : "Murphy Yield"}</div>
            <div id="m-yield" class="text-lg font-bold font-mono text-emerald-400 mt-0.5">92.4%</div>
            <div id="m-good-dies" class="text-[10px] text-slate-500 font-mono">2,383 Good Dies</div>
          </div>

          <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
            <div class="text-[11px] text-slate-400 font-medium">${isZh ? "良品晶片成本" : "Cost / Good Die"}</div>
            <div id="m-die-cost" class="text-lg font-bold font-mono text-sky-400 mt-0.5">$1.37 / Die</div>
            <div id="m-die-cost-sub" class="text-[10px] text-slate-500 font-mono">Silicon + Test</div>
          </div>

          <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/40">
            <div class="text-[11px] text-slate-400 font-medium">${isZh ? "年度總擁有成本" : "Annual TCO"}</div>
            <div id="m-annual-tco" class="text-lg font-bold font-mono text-rose-400 mt-0.5">$97.2M</div>
            <div id="m-tco-delta" class="text-[10px] text-slate-400 font-mono">Baseline (0-Mask)</div>
          </div>
        </div>

        <!-- Analytical Engineering Summary Footer -->
        <div id="tco-analytical-summary" class="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400 leading-relaxed font-mono">
          <!-- Dynamically populated -->
        </div>
      </div>
    `;
  }

  function update() {
    const isZh = getLang();
    const results = calculateWaferCostTco({
      processId: currentProcessId,
      envmId: currentEnvmId,
      dieAreaMm2: currentDieArea,
      annualWaferVolume: currentAnnualVolume,
    });

    // Update Slider text badges
    const areaValEl = document.getElementById("tco-area-val");
    if (areaValEl) areaValEl.textContent = `${currentDieArea.toFixed(1)} mm²`;

    const volValEl = document.getElementById("tco-volume-val");
    if (volValEl) volValEl.textContent = `${currentAnnualVolume.toLocaleString()} Wafers`;

    // Update metric ribbon
    const maskLayersEl = document.getElementById("m-mask-layers");
    if (maskLayersEl) maskLayersEl.textContent = `+${results.maskAdders} Masks`;

    const totalMasksEl = document.getElementById("m-total-masks");
    if (totalMasksEl) totalMasksEl.textContent = `${results.totalMaskLayers} ${isZh ? "道總光罩數" : "Total Layers"}`;

    const waferCostEl = document.getElementById("m-wafer-cost");
    if (waferCostEl) waferCostEl.textContent = `$${Math.round(results.totalWaferCostUsd).toLocaleString()}`;

    const nreAmortEl = document.getElementById("m-nre-amort");
    if (nreAmortEl) nreAmortEl.textContent = `+$${Math.round(results.maskAmortizationPerWaferUsd)} ${isZh ? "光罩攤提/片" : "NRE Amort/Wfr"}`;

    const gdpwEl = document.getElementById("m-gdpw");
    if (gdpwEl) gdpwEl.textContent = `${results.gdpw.toLocaleString()}`;

    const yieldEl = document.getElementById("m-yield");
    if (yieldEl) yieldEl.textContent = `${(results.murphyYield * 100).toFixed(1)}%`;

    const goodDiesEl = document.getElementById("m-good-dies");
    if (goodDiesEl) goodDiesEl.textContent = `${results.netGoodDies.toLocaleString()} ${isZh ? "顆良品晶粒" : "Good Dies"}`;

    const dieCostEl = document.getElementById("m-die-cost");
    if (dieCostEl) dieCostEl.textContent = `$${results.totalDieCostUsd.toFixed(2)} / Die`;

    const dieCostSubEl = document.getElementById("m-die-cost-sub");
    if (dieCostSubEl) {
      if (results.envmId === "antifuse_logic") {
        dieCostSubEl.textContent = isZh ? "0 光罩純邏輯基準" : "0-Mask Logic Baseline";
      } else {
        dieCostSubEl.textContent = `+${results.dieCostPremiumPercent.toFixed(1)}% ${isZh ? "成本溢價" : "Cost Premium"}`;
      }
    }

    const annualTcoEl = document.getElementById("m-annual-tco");
    if (annualTcoEl) annualTcoEl.textContent = `$${(results.annualTotalTcoUsd / 1e6).toFixed(1)}M`;

    const tcoDeltaEl = document.getElementById("m-tco-delta");
    if (tcoDeltaEl) {
      if (results.envmId === "antifuse_logic") {
        tcoDeltaEl.textContent = isZh ? "0 光罩基準 (Zero Adder)" : "0-Mask Baseline";
        tcoDeltaEl.className = "text-[10px] text-emerald-400 font-mono";
      } else {
        tcoDeltaEl.textContent = `+${results.tcoPremiumPercent.toFixed(1)}% (+$${(results.tcoDeltaUsd / 1e6).toFixed(1)}M)`;
        tcoDeltaEl.className = "text-[10px] text-rose-400 font-mono";
      }
    }

    const badgeSavings = document.getElementById("tco-badge-savings");
    if (badgeSavings) {
      if (results.envmId === "antifuse_logic") {
        badgeSavings.textContent = isZh ? "純邏輯 AntiFuse 最佳成本基準" : "Pure Logic AntiFuse Cost Benchmark";
        badgeSavings.className = "text-xs font-mono px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      } else {
        badgeSavings.textContent = isZh
          ? `相較 AntiFuse 年溢價: +$${(results.tcoDeltaUsd / 1e6).toFixed(1)}M USD`
          : `TCO Premium vs AntiFuse: +$${(results.tcoDeltaUsd / 1e6).toFixed(1)}M USD`;
        badgeSavings.className = "text-xs font-mono px-2.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20";
      }
    }

    // Dynamic Summary Note
    const summaryEl = document.getElementById("tco-analytical-summary");
    if (summaryEl) {
      if (results.envmId === "antifuse_logic") {
        summaryEl.innerHTML = isZh
          ? `<span class="text-emerald-400 font-bold">【晶圓經濟學結論】</span> 純邏輯 AntiFuse 在 ${results.process.nameZh} 下完全無需額外光罩（0-Mask Adder），熱預算為零，良率完全等同於純數位邏輯標準（Murphy 良率 ${(results.murphyYield * 100).toFixed(1)}%）。年投片 ${results.annualWaferVolume.toLocaleString()} 片時，良品晶粒成本僅為 $${results.totalDieCostUsd.toFixed(2)}，具備壓倒性的經濟與良率優勢。`
          : `<span class="text-emerald-400 font-bold">[Foundry Economics Conclusion]</span> Pure Logic AntiFuse in ${results.process.nameEn} requires 0 additional masks and zero thermal budget penalty. Yield matches pure logic (Murphy yield ${(results.murphyYield * 100).toFixed(1)}%). At ${results.annualWaferVolume.toLocaleString()} wafers/yr, net good die cost is only $${results.totalDieCostUsd.toFixed(2)}, delivering overwhelming TCO advantages.`;
      } else {
        summaryEl.innerHTML = isZh
          ? `<span class="text-amber-400 font-bold">【光罩附加與良率折損評估】</span> ${results.envm.nameZh} 增加 ${results.maskAdders} 道光罩，造成晶圓製造成本增加 ${(results.maskAdders * results.process.alphaMaskPercent).toFixed(1)}%，額外缺陷密度使 Murphy 良率降至 ${(results.murphyYield * 100).toFixed(1)}%。在年投片 ${results.annualWaferVolume.toLocaleString()} 片下，每年產生 <span class="text-rose-400 font-bold">+$${(results.tcoDeltaUsd / 1e6).toFixed(2)}M USD (+${results.tcoPremiumPercent.toFixed(1)}%)</span> 的 TCO 額外支出。`
          : `<span class="text-amber-400 font-bold">[Mask Adder & Yield Degradation Assessment]</span> ${results.envm.nameEn} adds ${results.maskAdders} masks (+${(results.maskAdders * results.process.alphaMaskPercent).toFixed(1)}% wafer cost) with added defect density lowering Murphy yield to ${(results.murphyYield * 100).toFixed(1)}%. At ${results.annualWaferVolume.toLocaleString()} wafers/yr, this incurs <span class="text-rose-400 font-bold">+$${(results.tcoDeltaUsd / 1e6).toFixed(2)}M USD (+${results.tcoPremiumPercent.toFixed(1)}%)</span> in excess annual TCO.`;
      }
    }

    // Draw Canvas
    const canvas = document.getElementById("tco-canvas");
    if (canvas) {
      drawWaferCostTcoCanvas(canvas, results, currentChartMode, isZh);
    }
  }

  renderSkeleton();
  update();

  // Event Listeners
  const processSel = document.getElementById("tco-process-select");
  if (processSel) {
    processSel.addEventListener("change", (e) => {
      currentProcessId = e.target.value;
      update();
    });
  }

  const envmSel = document.getElementById("tco-envm-select");
  if (envmSel) {
    envmSel.addEventListener("change", (e) => {
      currentEnvmId = e.target.value;
      update();
    });
  }

  const areaSlider = document.getElementById("tco-area-slider");
  if (areaSlider) {
    areaSlider.addEventListener("input", (e) => {
      currentDieArea = parseFloat(e.target.value);
      update();
    });
  }

  const volumeSlider = document.getElementById("tco-volume-slider");
  if (volumeSlider) {
    volumeSlider.addEventListener("input", (e) => {
      currentAnnualVolume = parseInt(e.target.value, 10);
      update();
    });
  }

  const modeVolBtn = document.getElementById("tco-chart-mode-vol");
  const modeYieldBtn = document.getElementById("tco-chart-mode-yield");

  if (modeVolBtn && modeYieldBtn) {
    modeVolBtn.addEventListener("click", () => {
      currentChartMode = "tco_volume";
      modeVolBtn.className = "px-3 py-1 rounded text-xs font-semibold bg-amber-500 text-slate-900 border border-amber-400";
      modeYieldBtn.className = "px-3 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200";
      update();
    });

    modeYieldBtn.addEventListener("click", () => {
      currentChartMode = "yield_die_cost";
      modeYieldBtn.className = "px-3 py-1 rounded text-xs font-semibold bg-amber-500 text-slate-900 border border-amber-400";
      modeVolBtn.className = "px-3 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700 hover:text-slate-200";
      update();
    });
  }

  // Observe language or theme changes
  const observer = new MutationObserver(() => {
    update();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-lang", "data-theme", "lang"],
  });

  window.addEventListener("resize", () => {
    update();
  });
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initWaferCostTcoCalculator());
  } else {
    initWaferCostTcoCalculator();
  }
}
