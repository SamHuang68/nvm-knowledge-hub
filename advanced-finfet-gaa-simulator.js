import { syncMetricCopy } from './模型數值複製.js';

/**
 * advanced-finfet-gaa-simulator.js — Advanced Node FinFET / GAA AntiFuse Scalability & Quantum Tunneling Simulator
 *
 * 教學近似：以固定幾何、角隅場強係數與簡化穿隧公式產生比較圖。
 * 未求解三維 Poisson／TCAD；預設參數與面積比例未以具名製程實測校準。
 *
 * Mathematical Foundations:
 * 1. Corner Field Crowding Factor: kappa_corner ~ 1 + alpha * (t_phys / r_c)^gamma
 * 2. Effective Oxide Field: E_eff = kappa_corner * (V_ox / t_phys)
 * 3. WKB Direct Tunneling Density: J_DT ~ A * (V_ox / t_phys)^2 * exp(-B * t_phys * sqrt(Phi_B - V_ox / 2))
 * 4. Breakdown Voltage Scaling: V_bd ~ V_bd_base * (t_EOT / t_EOT_base)^m / kappa_corner
 * 5. Dickson Charge Pump Stages: N_stages = ceil((V_prog - V_dd) / (V_dd - V_drop))
 * 6. Pump Macro Footprint Reduction: Area_reduction_% = 1 - (Area_node / Area_28nm_base)
 *
 * Author: NVM Knowledge Hub Editorial Board
 * 製程架構來源只用於區分 FinFET 與 N2 類 GAA，不為本模型數值背書。
 */

'use strict';

export const FOUNDRY_ADVANCED_NODES = Object.freeze({
  tsmc_n3_gaa: {
    id: 'tsmc_n3_gaa',
    nameEn: 'GAA NanoSheet Teaching Preset (N2-Class Architecture)',
    nameZh: 'GAA 奈米片教學預設（N2 類架構）',
    archType: 'gaa',
    eotNm: 1.15,
    tphysNm: 2.1,
    dielectricK: 22.0, // High-k HfO2
    rcCornerNm: 1.2, // NanoSheet edge corner radius
    cornerEnhanceFactor: 1.22, // 22% corner field enhancement
    vddNominal: 0.70, // Core Vdd (V)
    vbdBase: 3.95, // Breakdown voltage (V)
    vreadNominal: 0.60,
    barrierHeightEv: 2.1, // HfO2 conduction band offset
    pumpStages: 2,
    footprintRel: 0.28, // 72% area reduction vs 28nm
    descriptionEn: 'Illustrative wrap-around geometry with an assumed corner factor of 1.22. Parameters do not establish foundry OTP availability or peripheral voltage safety.',
    descriptionZh: '全環繞幾何示意，角隅係數假設為 1.22；參數不能證明晶圓廠 OTP 可用性或周邊電壓安全。',
  },
  tsmc_n5_finfet: {
    id: 'tsmc_n5_finfet',
    nameEn: 'N5 / N4P-Class FinFET Teaching Preset',
    nameZh: 'N5／N4P 類 FinFET 教學預設',
    archType: 'finfet',
    eotNm: 1.50,
    tphysNm: 2.6,
    dielectricK: 20.5,
    rcCornerNm: 1.8,
    cornerEnhanceFactor: 1.28, // 28% fin top corner enhancement
    vddNominal: 0.75,
    vbdBase: 4.85,
    vreadNominal: 0.70,
    barrierHeightEv: 2.2,
    pumpStages: 3,
    footprintRel: 0.42, // 58% area reduction vs 28nm
    descriptionEn: 'Tri-gate geometry illustration with an assumed corner factor of 1.28; electrical values are not foundry macro specifications.',
    descriptionZh: '三閘極鰭片幾何示意，角隅係數假設為 1.28；電性數值不是晶圓廠巨集規格。',
  },
  foundry_16ffc: {
    id: 'foundry_16ffc',
    nameEn: '16nm / 12nm-Class FinFET Teaching Preset',
    nameZh: '16nm／12nm 類 FinFET 教學預設',
    archType: 'finfet',
    eotNm: 2.0,
    tphysNm: 3.2,
    dielectricK: 18.0,
    rcCornerNm: 2.5,
    cornerEnhanceFactor: 1.20,
    vddNominal: 0.85,
    vbdBase: 5.80,
    vreadNominal: 0.80,
    barrierHeightEv: 2.4,
    pumpStages: 4,
    footprintRel: 0.65, // 35% area reduction vs 28nm
    descriptionEn: 'FinFET geometry illustration with an assumed corner factor of 1.20; temperature scaling does not model retention or read-disturb qualification.',
    descriptionZh: 'FinFET 幾何示意，角隅係數假設為 1.20；溫度倍率不包含保持或讀取擾動資格模型。',
  },
  planar_28hpc: {
    id: 'planar_28hpc',
    nameEn: '28nm Planar HKMG Teaching Preset (Baseline)',
    nameZh: '28nm 平面 HKMG 教學預設（基準）',
    archType: 'planar',
    eotNm: 2.6,
    tphysNm: 3.8,
    dielectricK: 16.0,
    rcCornerNm: 999.0, // Planar flat
    cornerEnhanceFactor: 1.00, // 0% enhancement
    vddNominal: 0.90,
    vbdBase: 7.20,
    vreadNominal: 0.85,
    barrierHeightEv: 2.6,
    pumpStages: 5,
    footprintRel: 1.00, // 100% baseline
    descriptionEn: 'Planar geometry illustration with a corner factor of 1.00 and an assumed footprint ratio of 1.00 for comparison.',
    descriptionZh: '平面幾何示意，角隅係數為 1.00，假設面積比例 1.00 作為比較基準。',
  },
});

/**
 * Calculates FinFET/GAA scalability, field crowding, and charge pump savings.
 *
 * @param {Object} params
 * @param {string} params.nodeId - 'tsmc_n3_gaa' | 'tsmc_n5_finfet' | 'foundry_16ffc' | 'planar_28hpc'
 * @param {number} params.appliedVolt - Applied programming / sensing voltage (0.4 to 8.5 V)
 * @param {number} params.tempC - Operating junction temperature (25 to 175 °C)
 * @returns {Object} Analytical scaling metrics, leakage, charge pump footprint, and verdict
 */
export function calculateAdvancedFinfetGaa(params = {}) {
  const nodeId = params.nodeId && FOUNDRY_ADVANCED_NODES[params.nodeId] ? params.nodeId : 'tsmc_n3_gaa';
  const node = FOUNDRY_ADVANCED_NODES[nodeId];
  const appliedVolt = Math.max(0.4, Math.min(8.5, Number(params.appliedVolt) || node.vddNominal));
  const tempC = Math.max(25, Math.min(175, Number(params.tempC) || 125));

  // 1. Physical 1D field vs 3D Corner Enhanced Field
  // E_1d = V / (t_phys * 1e-7 cm) / 1e6 = V / (t_phys * 0.1) MV/cm
  const e1dMvCm = appliedVolt / (node.tphysNm * 0.1);
  const eCornerMvCm = e1dMvCm * node.cornerEnhanceFactor;

  // 2. Breakdown Voltage scaling (incorporating corner enhancement):
  // At the corner, breakdown occurs when local field reaches critical percolation field ~16-18 MV/cm
  const ecritPercolation = 16.5; // MV/cm
  const vbdPredicted = Math.min(8.5, Number(((ecritPercolation * node.tphysNm * 0.1) / node.cornerEnhanceFactor).toFixed(2)));

  // 3. WKB Direct Tunneling Leakage Current Density J_DT (A/cm^2)
  // J_DT = A_0 * E^2 * exp(-alpha * t_phys * sqrt(Phi_B - V/2))
  const phiB = node.barrierHeightEv;
  const effectiveBarrier = Math.max(0.2, phiB - (appliedVolt / 2));
  const alphaWkb = 0.85; // 原教學係數，尚未提供具名介電層校準資料。
  const exponent = -alphaWkb * node.tphysNm * Math.sqrt(effectiveBarrier);
  const jdtBase = 1e4 * Math.pow(e1dMvCm, 2) * Math.exp(exponent);
  const jdtAcm2 = Math.max(1e-12, Math.min(1e4, jdtBase));

  // Temperature acceleration on leakage (thermionic emission component ~ exp(-q Phi / kT))
  const tempK = tempC + 273.15;
  const tempFactor = Math.exp((tempK - 300) / 75);
  const jdtTotalAcm2 = jdtAcm2 * tempFactor;

  // 4. Charge Pump Scaling & Silicon Macro Footprint Reduction
  // Assuming diode threshold drop V_drop ~ 0.25V
  const vdrop = 0.25;
  const effectiveVdd = node.vddNominal;
  const vprogTarget = vbdPredicted * 1.15; // 假設增加 15% 驅動，不保證編程時間或良率。
  const stagesCalc = Math.max(1, Math.ceil((vprogTarget - effectiveVdd) / (effectiveVdd - vdrop)));

  // Footprint relative to 28nm Planar baseline (28nm baseline = 100%)
  // 面積比為預設輸入，與試算的級數獨立；未計算實際電容或佈局面積。
  const areaRatio = node.footprintRel;
  const areaSavingsPct = Number(((1 - areaRatio) * 100).toFixed(1));

  // 5. Engineering Verdict Formulation
  let verdictStatus = 'gaa_optimal';
  let verdictEn = '';
  let verdictZh = '';

  if (node.archType === 'gaa') {
    verdictStatus = 'gaa_optimal';
    verdictEn = `[GAA Teaching Estimate] The fixed corner coefficient gives ${vbdPredicted}V breakdown and an estimated ${stagesCalc}-stage pump. The assumed footprint ratio ${areaRatio} gives ${areaSavingsPct}% reduction independently of the stage calculation. This uncalibrated model does not establish process compatibility, peripheral voltage safety or qualification.`;
    verdictZh = `【GAA 教學試算】固定角隅係數下，硬擊穿試算為 ${vbdPredicted}V、電荷泵為 ${stagesCalc} 級。面積比例假設 ${areaRatio} 對應 ${areaSavingsPct}% 縮減，與級數計算獨立。此未校準模型不能保證製程相容、周邊電壓安全或資格驗證通過。`;
  } else if (node.archType === 'finfet') {
    verdictStatus = 'finfet_mature';
    verdictEn = `[FinFET Teaching Estimate] The assumed ${((node.cornerEnhanceFactor - 1) * 100).toFixed(0)}% field enhancement gives ${vbdPredicted}V breakdown and an estimated ${stagesCalc}-stage pump. The assumed footprint ratio ${areaRatio} gives ${areaSavingsPct}% reduction. These uncalibrated coefficients do not establish automotive qualification, retention or read-disturb performance.`;
    verdictZh = `【FinFET 教學試算】場強增強假設 ${((node.cornerEnhanceFactor - 1) * 100).toFixed(0)}% 下，硬擊穿試算為 ${vbdPredicted}V、電荷泵為 ${stagesCalc} 級。面積比例假設 ${areaRatio} 對應 ${areaSavingsPct}% 縮減。未校準係數不能保證車規資格、保持或讀取擾動表現。`;
  } else {
    verdictStatus = 'planar_legacy';
    verdictEn = `[Planar Teaching Estimate] A corner factor of 1.00 gives ${vbdPredicted}V breakdown and an estimated ${stagesCalc}-stage pump, with an assumed 100% footprint baseline. This uncalibrated comparison does not establish a process scaling limit or qualification.`;
    verdictZh = `【平面教學試算】角隅係數 1.00 下，硬擊穿試算為 ${vbdPredicted}V、電荷泵為 ${stagesCalc} 級，面積基準假設為 100%。此未校準比較不能保證資格通過，也不能推導製程微縮截止點。`;
  }

  return {
    inputs: { nodeId: node.id, appliedVolt, tempC },
    metrics: {
      archType: node.archType,
      eotNm: node.eotNm,
      tphysNm: node.tphysNm,
      dielectricK: node.dielectricK,
      rcCornerNm: node.rcCornerNm,
      cornerEnhanceFactor: node.cornerEnhanceFactor,
      e1dMvCm,
      eCornerMvCm,
      vbdPredicted,
      vprogTarget,
      jdtTotalAcm2,
      stagesCalc,
      areaRatio,
      areaSavingsPct,
      vddNominal: node.vddNominal,
    },
    verdict: {
      status: verdictStatus,
      en: verdictEn,
      zh: verdictZh,
    },
  };
}

/**
 * Draws the 3D electrostatic geometry comparison (Planar vs FinFET vs GAA NanoSheet)
 * with field intensity heatmaps on an HTML5 canvas.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} simData - Return value of calculateAdvancedFinfetGaa
 * @param {string} lang - 'zh' | 'en'
 */
export function drawFinfetGaaCanvas(canvas, simData, lang = 'zh') {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.getBoundingClientRect().width || 600;
  const stacked = width < 760;
  const arch = simData.metrics.archType;
  const wrapText = (text, maxWidth, font) => {
    ctx.font = font;
    const lines = []; let line = '';
    for (const character of text) {
      if (line && ctx.measureText(line + character).width > maxWidth) { lines.push(line); line = ''; }
      line += character;
    }
    if (line) lines.push(line);
    return lines;
  };
  const title = lang === 'zh'
    ? '幾何與電場示意 · 教學預設'
    : 'Illustrative Geometry & Field · Teaching Preset';
  const titleLines = wrapText(title, width - 24, '700 12px "IBM Plex Mono", monospace');
  const diagramLabels = arch === 'planar'
    ? [lang === 'zh' ? '矽基板 (Si Channel)' : 'Si Substrate', 'SiO2 / High-k (1D)', lang === 'zh' ? '金屬閘極 (Metal Gate)' : 'Metal Gate']
    : arch === 'finfet'
      ? [lang === 'zh' ? `假設角隅增強 (+${((simData.metrics.cornerEnhanceFactor-1)*100).toFixed(0)}%)` : `Assumed Corner Field (+${((simData.metrics.cornerEnhanceFactor-1)*100).toFixed(0)}%)`, lang === 'zh' ? '3 閘極鰭片' : 'Tri-Gate Fin']
      : [lang === 'zh' ? '3 層全環繞奈米片' : '3-Stack GAA NanoSheet'];
  const diagramScale = Math.min(1, (width - 24) / 240);
  const diagramTop = 24 + titleLines.length * 16;
  const captionLines = stacked ? diagramLabels.flatMap(text => wrapText(text, width - 24, '10px "IBM Plex Mono", monospace')) : [];
  const metricX = stacked ? 12 : 335;
  const metricWidth = width - metricX - 12;
  const metrics = [
    {text:lang === 'zh' ? `硬擊穿試算 Vbd: ${simData.metrics.vbdPredicted} V (假設參考 7.2V)` : `Illustrative Breakdown Vbd: ${simData.metrics.vbdPredicted} V (Assumed Reference 7.2V)`, fraction:Math.min(1.0, simData.metrics.vbdPredicted / 8.0), color:'#0284c7'},
    {text:lang === 'zh' ? `幾何角隅場強因子 κ: ${simData.metrics.cornerEnhanceFactor.toFixed(2)}× (${((simData.metrics.cornerEnhanceFactor - 1) * 100).toFixed(0)}% 增強)` : `Corner Field Crowding κ: ${simData.metrics.cornerEnhanceFactor.toFixed(2)}x (+${((simData.metrics.cornerEnhanceFactor - 1) * 100).toFixed(0)}%)`, fraction:Math.max(0.05, Math.min(1.0, (simData.metrics.cornerEnhanceFactor - 1.0) / 0.4)), color:'#ea580c'},
    {text:lang === 'zh' ? `假設電荷泵面積縮減: ${simData.metrics.areaSavingsPct}% (${simData.metrics.stagesCalc} 級試算；假設基準 5 級)` : `Assumed Pump Footprint Reduction: ${simData.metrics.areaSavingsPct}% (${simData.metrics.stagesCalc} estimated stages; assumed base 5)`, fraction:simData.metrics.areaSavingsPct / 100, color:'#10b981'},
    {text:lang === 'zh' ? `待機直接穿隧漏電 J_DT: ${simData.metrics.jdtTotalAcm2.toExponential(2)} A/cm² (@ ${simData.inputs.tempC}°C)` : `Standby Direct Tunneling J_DT: ${simData.metrics.jdtTotalAcm2.toExponential(2)} A/cm² (@ ${simData.inputs.tempC}°C)`}
  ].map(metric => ({...metric, lines:wrapText(metric.text, metricWidth, '600 11px "IBM Plex Mono", monospace')}));
  const metricTop = stacked ? diagramTop + 180 * diagramScale + captionLines.length * 14 + 24 : diagramTop + 10;
  const height = Math.ceil(Math.max(260, diagramTop + 180 * diagramScale + 16, metricTop + metrics.reduce((total, metric) => total + metric.lines.length * 15 + (metric.fraction === undefined ? 12 : 28), 0)));
  // 窄螢幕保留可辨識圖形，文字及全部數據改為上下排列並依實際字寬換行。
  canvas.style.height = height + 'px';
  if (canvas.parentElement) canvas.parentElement.style.height = height + 'px';
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  ctx.resetTransform?.(); ctx.scale(dpr, dpr);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#0f172a'; ctx.font = '700 12px "IBM Plex Mono", monospace'; ctx.textAlign = 'left';
  titleLines.forEach((line, index) => ctx.fillText(line, 12, 20 + index * 16));
  ctx.save();
  ctx.translate(stacked ? (width - 240 * diagramScale) / 2 : 60, diagramTop);
  ctx.scale(diagramScale, diagramScale);
  const startX = 0, startY = 0, drawW = 240, drawH = 180;
  const drawDiagramText = (...args) => { if (!stacked) ctx.fillText(...args); };
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.strokeRect(startX, startY, drawW, drawH);

  if (arch === 'planar') {
    // 1D Planar CMOS: Substrate, Oxide layer, Gate
    ctx.fillStyle = '#e2e8f0'; // Si substrate
    ctx.fillRect(startX + 10, startY + 100, drawW - 20, 70);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "IBM Plex Mono", monospace';
    drawDiagramText(lang === 'zh' ? '矽基板 (Si Channel)' : 'Si Substrate', startX + 20, startY + 140);

    // Oxide layer
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(startX + 10, startY + 75, drawW - 20, 25);
    ctx.fillStyle = '#0369a1';
    drawDiagramText('SiO2 / High-k (1D)', startX + 20, startY + 92);

    // Gate
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(startX + 10, startY + 15, drawW - 20, 60);
    ctx.fillStyle = '#334155';
    drawDiagramText(lang === 'zh' ? '金屬閘極 (Metal Gate)' : 'Metal Gate', startX + 20, startY + 50);
  } else if (arch === 'finfet') {
    // 3D FinFET: Vertical Fin wrapped on 3 sides
    // Substrate
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(startX + 10, startY + 130, drawW - 20, 40);

    // Vertical Fin (Si)
    ctx.fillStyle = '#94a3b8';
    const finX = startX + 100;
    const finW = 40;
    const finH = 90;
    ctx.fillRect(finX, startY + 40, finW, finH);

    // Gate Wrapping 3 sides
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillRect(finX - 12, startY + 28, finW + 24, finH + 12);

    // Red Hotspots at Fin Corners
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(finX, startY + 40, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(finX + finW, startY + 40, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b91c1c';
    ctx.font = '10px "IBM Plex Mono", monospace';
    drawDiagramText(lang === 'zh' ? `假設角隅增強 (+${((simData.metrics.cornerEnhanceFactor-1)*100).toFixed(0)}%)` : `Assumed Corner (+${((simData.metrics.cornerEnhanceFactor-1)*100).toFixed(0)}%)`, finX - 45, startY + 20);
    drawDiagramText(lang === 'zh' ? '3 閘極鰭片' : 'Tri-Gate Fin', finX - 8, startY + 90);
  } else {
    // GAA NanoSheet: 3 Stacked Horizontal Sheets with wrap-around gate
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(startX + 10, startY + 140, drawW - 20, 30);

    // 3 NanoSheets
    const nsX = startX + 60;
    const nsW = 120;
    const nsH = 18;
    const sheetsY = [startY + 25, startY + 65, startY + 105];

    sheetsY.forEach((sy, idx) => {
      // Gate surrounding
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.fillRect(nsX - 8, sy - 6, nsW + 16, nsH + 12);

      // NanoSheet Channel
      ctx.fillStyle = '#64748b';
      ctx.fillRect(nsX, sy, nsW, nsH);

      // 4 Corners hotspots
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(nsX, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nsX + nsW, sy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nsX, sy + nsH, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nsX + nsW, sy + nsH, 5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#0f172a';
    ctx.font = '10px "IBM Plex Mono", monospace';
    drawDiagramText(lang === 'zh' ? '3 層全環繞奈米片' : '3-Stack GAA NanoSheet', nsX + 10, startY + 160);
  }

  ctx.restore();
  ctx.font = '10px "IBM Plex Mono", monospace'; ctx.fillStyle = '#334155';
  captionLines.forEach((line, index) => ctx.fillText(line, 12, diagramTop + 180 * diagramScale + 14 + index * 14));
  let metricY = metricTop;
  metrics.forEach(metric => {
    ctx.fillStyle = '#334155'; ctx.font = '600 11px "IBM Plex Mono", monospace';
    metric.lines.forEach(line => { ctx.fillText(line, metricX, metricY); metricY += 15; });
    if (metric.fraction !== undefined) {
      ctx.fillStyle = '#e2e8f0'; ctx.fillRect(metricX, metricY, metricWidth, 12);
      ctx.fillStyle = metric.color; ctx.fillRect(metricX, metricY, metricWidth * metric.fraction, 12);
      metricY += 28;
    } else metricY += 12;
  });
}

/**
 * Initializes the FinFET & GAA NanoSheet Scalability Simulator interactive workbench.
 *
 * @param {string} rootId - DOM container ID (default: 'finfet-gaa-simulator-root')
 */
export function initAdvancedFinfetGaaSimulator(rootId = 'finfet-gaa-simulator-root') {
  const root = document.getElementById(rootId);
  if (!root) return;

  const nodeSelect = root.querySelector('#finfet-node-select');
  const voltSlider = root.querySelector('#finfet-volt-slider');
  const voltVal = root.querySelector('#finfet-volt-val');
  const tempSlider = root.querySelector('#finfet-temp-slider');
  const tempVal = root.querySelector('#finfet-temp-val');

  // KPI elements
  const e1dEl = root.querySelector('#finfet-e1d-val');
  const eCornerEl = root.querySelector('#finfet-ecorner-val');
  const vbdEl = root.querySelector('#finfet-vbd-val');
  const pumpStagesEl = root.querySelector('#finfet-pump-stages-val');
  const areaSavingsEl = root.querySelector('#finfet-area-savings-val');
  const jdtEl = root.querySelector('#finfet-jdt-val');

  const canvas = root.querySelector('#finfet-canvas');
  const verdictBanner = root.querySelector('#finfet-verdict-banner');

  function getLang() {
    return document.documentElement.lang === 'en' ? 'en' : 'zh';
  }

  function update() {
    const lang = getLang();
    if (nodeSelect) [...nodeSelect.options].forEach(option => {
      const preset = FOUNDRY_ADVANCED_NODES[option.value];
      if (preset) option.textContent = lang === 'en' ? preset.nameEn : preset.nameZh;
    });
    const params = {
      nodeId: nodeSelect?.value || 'tsmc_n3_gaa',
      appliedVolt: parseFloat(voltSlider?.value || '0.70'),
      tempC: parseFloat(tempSlider?.value || '125'),
    };

    if (voltVal) voltVal.textContent = `${params.appliedVolt.toFixed(2)} V`;
    if (tempVal) tempVal.textContent = `${params.tempC} °C`;

    const res = calculateAdvancedFinfetGaa(params);

    if (e1dEl) e1dEl.textContent = `${res.metrics.e1dMvCm.toFixed(2)} MV/cm`;
    if (eCornerEl) eCornerEl.textContent = `${res.metrics.eCornerMvCm.toFixed(2)} MV/cm`;
    if (vbdEl) vbdEl.textContent = `${res.metrics.vbdPredicted.toFixed(2)} V`;
    if (pumpStagesEl) {
      pumpStagesEl.textContent = lang === 'en' ? `${res.metrics.stagesCalc} Stages` : `${res.metrics.stagesCalc} 級泵`;
    }
    if (areaSavingsEl) areaSavingsEl.textContent = `-${res.metrics.areaSavingsPct} %`;
    if (jdtEl) jdtEl.textContent = `${res.metrics.jdtTotalAcm2.toExponential(2)} A/cm²`;

    if (verdictBanner) {
      verdictBanner.className = 'finfet-verdict-banner ' + res.verdict.status;
      const textSpan = verdictBanner.querySelector('.finfet-verdict-text');
      if (textSpan) {
        textSpan.innerHTML = `<span data-lang="zh">${res.verdict.zh}</span><span data-lang="en">${res.verdict.en}</span>`;
      }
    }

    if (canvas) {
      drawFinfetGaaCanvas(canvas, res, lang);
    }

    // 複製狀態獨立呈現，不改動模型數值。
    syncMetricCopy([e1dEl, eCornerEl, vbdEl, pumpStagesEl, areaSavingsEl, jdtEl]);
    const exportControl = root.querySelector('#finfet-gaa-export-csv-btn');
    if (exportControl) {
      const isZh = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
      exportControl.textContent = isZh ? '📥 匯出 FinFET/GAA 電壓與溫度掃描 CSV' : '📥 Export FinFET/GAA Voltage and Temperature Sweep CSV';
      exportControl.setAttribute('aria-label', isZh ? '保留目前教學預設，匯出 FinFET 與 GAA 電壓與溫度掃描 CSV' : 'Export the voltage and temperature sweep for the selected FinFET or GAA teaching preset as CSV');
    }
  }

  // Export CSV Action for Advanced FinFET & GAA
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

  const presetContainer = nodeSelect?.parentNode;
  if (presetContainer && !presetContainer.querySelector('#finfet-gaa-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'finfet-gaa-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'max-width: 100%; min-height: 44px; white-space: normal; line-height: 1.5; margin-top: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.6); color: #38bdf8; cursor: pointer;';
    const isZhLang = (window.HubLanguage?.get() || document.documentElement.lang || 'en').startsWith('zh');
    exportBtn.textContent = isZhLang ? '📥 匯出 FinFET/GAA 電壓與溫度掃描 CSV' : '📥 Export FinFET/GAA Voltage and Temperature Sweep CSV';
    exportBtn.setAttribute('aria-label', isZhLang ? '保留目前教學預設，匯出 FinFET 與 GAA 電壓與溫度掃描 CSV' : 'Export the voltage and temperature sweep for the selected FinFET or GAA teaching preset as CSV');
    exportBtn.addEventListener('click', () => {
      const nId = nodeSelect ? nodeSelect.value : 'tsmc_n3_gaa';
      let csv = 'AppliedVolt_V,Temp_C,E1D_MVcm,ECorner_MVcm,VbdPredicted_V,PumpStages,AreaSavings_Pct,JdtTotal_Acm2\n';
      const testVolts = [0.50, 0.65, 0.70, 0.85, 1.00, 1.20];
      const testTemps = [25, 85, 125, 150, 175];
      for (const v of testVolts) {
        for (const t of testTemps) {
          const res = calculateAdvancedFinfetGaa({
            nodeId: nId,
            appliedVolt: v,
            tempC: t,
          });
          csv += `${v.toFixed(2)},${t},${res.metrics.e1dMvCm.toFixed(2)},${res.metrics.eCornerMvCm.toFixed(2)},${res.metrics.vbdPredicted.toFixed(2)},${res.metrics.stagesCalc},${res.metrics.areaSavingsPct},${res.metrics.jdtTotalAcm2.toExponential(4)}\n`;
        }
      }
      const preset = FOUNDRY_ADVANCED_NODES[nId] || FOUNDRY_ADVANCED_NODES.tsmc_n3_gaa;
      downloadCsv(`FinFET_GAA_電壓與溫度掃描_${preset.nameZh}.csv`, csv);
    });
    presetContainer.appendChild(exportBtn);
  }

  if (nodeSelect) {
    nodeSelect.addEventListener('change', () => {
      const node = FOUNDRY_ADVANCED_NODES[nodeSelect.value];
      if (node && voltSlider) {
        voltSlider.value = node.vddNominal;
      }
      update();
    });
  }

  [voltSlider, tempSlider].forEach((slider) => {
    if (slider) {
      slider.addEventListener('input', update);
      slider.addEventListener('change', update);
    }
  });

  const observer = new MutationObserver(() => update());
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  window.addEventListener('resize', () => {
    if (canvas) update();
  });
  window.addEventListener('hub:language-change', () => update());
  window.addEventListener('languagechange', () => update());
  update();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initAdvancedFinfetGaaSimulator());
  } else {
    initAdvancedFinfetGaaSimulator();
  }
}
