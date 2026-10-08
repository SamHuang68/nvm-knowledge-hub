/**
 * @file cryo-cmos-quantum-nvm-simulator.js
 * @description First-Principles Physics & Cryogenic Microarchitecture Simulator for Cryo-CMOS Quantum Computing
 *              Interfaces at 4-Kelvin & 77-Kelvin, Varshni Bandgap Expansion, Carrier Freeze-out Dynamics,
 *              Steep Subthreshold Swing, Dilution Refrigerator Thermal Cooling Budgets, and AntiFuse Filament Stability.
 *
 * @version 1.0.0 (2026-10-07)
 * @author Cryogenic Semiconductor & Quantum Computing Hardware Architecture Team
 * @license Grounded in IEEE IEDM, Nature Electronics Cryo-CMOS & Superconducting Qubit interface benchmarking.
 */

/**
 * @typedef {Object} CryoSystemPreset
 * @property {string} id - Preset identifier
 * @property {string} nameZh - Traditional Chinese name
 * @property {string} nameEn - English name
 * @property {number} targetTempK - Operating temperature in Kelvin (K)
 * @property {number} coolingPowerMw - Available cooling power budget at this stage (mW)
 * @property {number} maxReadoutPowerUw - Maximum allowed on-die eNVM readout power (uW)
 * @property {string} descriptionZh - Architecture description in Traditional Chinese
 * @property {string} descriptionEn - Architecture description in English
 */

/**
 * @typedef {Object} CryoNvmTech
 * @property {string} id - Technology identifier
 * @property {string} nameZh - Traditional Chinese name
 * @property {string} nameEn - English name
 * @property {number} baseResistanceOhm - Room temperature resistance / ON state (Ohm)
 * @property {number} freezeOutSensitivity - Freeze-out susceptibility factor (0.0 to 1.0)
 * @property {number} readCurrentUa - Read current at 300K (uA)
 * @property {number} writeVoltageV - Write programming voltage required (V)
 * @property {boolean} isOhmic - Whether transport is metallic Ohmic (freeze-out immune)
 * @property {string} notesZh - Traditional Chinese engineering notes
 * @property {string} notesEn - English engineering notes
 */

/**
 * Cryogenic Quantum System Presets
 * @type {Record<string, CryoSystemPreset>}
 */
export const CRYO_SYSTEM_PRESETS = {
  cryo_dilution_fridge_4k: {
    id: 'cryo_dilution_fridge_4k',
    nameZh: '稀釋冷凍機 4-Kelvin 超導量子位元控制晶粒 (4K Transmon Qubit Controller)',
    nameEn: '4-Kelvin Dilution Refrigerator Transmon Qubit Controller (4K Stage)',
    targetTempK: 4.2,
    coolingPowerMw: 50.0, // Typically 10~100 mW cooling budget at 4K stage
    maxReadoutPowerUw: 5.0, // Strict < 5 uW dissipation to prevent warming the mixing chamber
    descriptionZh: '安裝於稀釋冷凍機 4K 冷盤，整合低噪微波 DAC/ADC 偏置與量子晶片修復金鑰，需極致抑制熱耗散。',
    descriptionEn: 'Mounted on 4K cold plate of dilution fridge, hosting microwave DAC/ADC bias and key storage with strict sub-5uW thermal limits.'
  },
  liquid_nitrogen_77k_hpc: {
    id: 'liquid_nitrogen_77k_hpc',
    nameZh: '77-Kelvin 液氮冷卻超導互連 HPC (77K Liquid Nitrogen Accelerator)',
    nameEn: '77-Kelvin Liquid Nitrogen Cooled Superconducting HPC Accelerator',
    targetTempK: 77.0,
    coolingPowerMw: 5000.0, // 5W+ cooling capacity in liquid nitrogen
    maxReadoutPowerUw: 250.0,
    descriptionZh: '液態氮槽冷卻高性能資料中心節點，銅互連電阻劇降 6x，載子遷移率提高 4x，聚焦超高頻寬。',
    descriptionEn: 'Liquid nitrogen immersion HPC node; wire resistance drops 6x, electron mobility rises 4x for ultra-high bandwidth.'
  },
  sub_kelvin_100mk_readout: {
    id: 'sub_kelvin_100mk_readout',
    nameZh: '100-mK 極低溫混合微波讀出介面 (Sub-Kelvin Parametric Readout)',
    nameEn: '100-mK Sub-Kelvin Parametric Microwave Readout Interface',
    targetTempK: 0.1, // 100 mK
    coolingPowerMw: 0.02, // Only ~20 uW at 100 mK
    maxReadoutPowerUw: 0.01, // 10 nW limit
    descriptionZh: '緊鄰超導量子晶片之混合腔體，極端熱脆弱性，任何非揮發性記憶體讀出必須處於 nW 級超導或高阻區。',
    descriptionEn: 'Adjacent to superconducting quantum processor; extreme thermal vulnerability requires sub-10nW memory readout.'
  },
  room_temp_300k_baseline: {
    id: 'room_temp_300k_baseline',
    nameZh: '300-Kelvin 常溫對照基準 (Standard 300K Baseline)',
    nameEn: '300-Kelvin Standard Room Temperature Baseline',
    targetTempK: 300.0,
    coolingPowerMw: 100000.0,
    maxReadoutPowerUw: 5000.0,
    descriptionZh: '常規室溫半導體基準環境，熱擾動劇烈，載子 100% 電離，亞閾值擺幅受熱限制於 60 mV/dec。',
    descriptionEn: 'Standard 300K semiconductor operating environment with 100% carrier ionization and thermal 60 mV/dec SS limit.'
  }
};

/**
 * Cryogenic eNVM Technology Profiles
 * @type {Record<string, CryoNvmTech>}
 */
export const CRYO_NVM_TECHS = {
  antifuse_ohmic_filament: {
    id: 'antifuse_ohmic_filament',
    nameZh: '0-Mask AntiFuse 歐姆金屬微絲 (微絲無能隙凍結 / 周邊仍受影響)',
    nameEn: '0-Mask AntiFuse Ohmic Metallic Filament (Filament Unfrozen / CMOS Affected)',
    baseResistanceOhm: 350.0,
    freezeOutSensitivity: 0.12, // Substrate/access transistor carrier freeze-out
    readCurrentUa: 1.2,
    writeVoltageV: 5.5,
    isOhmic: true,
    notesZh: '金屬矽化物微絲為簡併歐姆導電，微絲本體無雜質凍結；然而位元胞存取電晶體與周邊 CMOS 電路在 4.2K 下仍面臨雜質凍結與閾值漂移。',
    notesEn: 'Silicide filament core is degenerate metallic without freeze-out; access transistors and peripheral CMOS still face carrier freeze-out and Vth shift at 4.2K.'
  },
  stt_mram_spintronic: {
    id: 'stt_mram_spintronic',
    nameZh: '自旋穿隧 STT-MRAM (Spin-Transfer Torque Magnetic Tunnel Junction)',
    nameEn: 'Spintronic STT-MRAM (TMR Enhanced, Higher Switching Current)',
    baseResistanceOhm: 2500.0,
    freezeOutSensitivity: 0.18,
    readCurrentUa: 4.5,
    writeVoltageV: 1.8,
    isOhmic: false,
    notesZh: '磁阻 TMR 隨溫度降低自 150% 上升至 220%，熱穩定性激增；但臨界翻轉電流 Ic 於 4K 時攀升 2.5 倍。',
    notesEn: 'TMR ratio increases up to 220% at 4K with extreme thermal stability; however, critical switching current Ic increases by 2.5x.'
  },
  floating_gate_charge_trap: {
    id: 'floating_gate_charge_trap',
    nameZh: '傳統浮閘 / 電荷捕捉 (Floating Gate / Charge Trap eFlash)',
    nameEn: 'Conventional Floating Gate / Charge Trap (Severe Freeze-Out)',
    baseResistanceOhm: 15000.0,
    freezeOutSensitivity: 0.85, // Severe carrier freeze-out in peripheral charge pump and bitcells
    readCurrentUa: 12.0,
    writeVoltageV: 11.5,
    isOhmic: false,
    notesZh: '周邊高壓電荷泵於 4K 時因二極體能階與載子凍結效率受限，穿隧氧化層在高電場下需注意介電質應力。',
    notesEn: 'High-voltage charge pumps suffer efficiency degradation at 4K; tunneling oxide requires careful thermal and electrical budget control.'
  },
  reram_oxide_filament: {
    id: 'reram_oxide_filament',
    nameZh: '阻變記憶體 (Oxide ReRAM / Valence Change Mechanism)',
    nameEn: 'Oxide ReRAM (Valence Change, High Forming Barrier at 4K)',
    baseResistanceOhm: 5000.0,
    freezeOutSensitivity: 0.40,
    readCurrentUa: 8.0,
    writeVoltageV: 3.2,
    isOhmic: false,
    notesZh: '氧空缺離子遷移活化能受熱阻滯，4K 下需要較高電壓方能完成 Forming/SET，但一旦形成微絲讀取相對穩定。',
    notesEn: 'Oxygen vacancy migration is thermally suppressed at 4K, requiring substantially higher forming/set voltages.'
  }
};

/**
 * First-Principles Physical Metrics Calculator for Cryogenic CMOS & Quantum Interface eNVM
 *
 * @param {Object} params
 * @param {string} params.presetKey - Key from CRYO_SYSTEM_PRESETS
 * @param {string} params.techKey - Key from CRYO_NVM_TECHS
 * @param {number} [params.customTempK] - Optional override temperature (0.01 to 350 K)
 * @param {number} [params.readBiasMv=400] - Array readout bias voltage in mV
 * @returns {Object} Physical calculation results
 */
export function calculateCryoNvmMetrics(params = {}) {
  const preset = CRYO_SYSTEM_PRESETS[params.presetKey] || CRYO_SYSTEM_PRESETS.cryo_dilution_fridge_4k;
  const tech = CRYO_NVM_TECHS[params.techKey] || CRYO_NVM_TECHS.antifuse_ohmic_filament;
  const tempK = params.customTempK !== undefined ? Math.max(0.05, Math.min(350.0, params.customTempK)) : preset.targetTempK;
  const vBiasMv = params.readBiasMv !== undefined ? Math.max(50, Math.min(1200, params.readBiasMv)) : 400.0;

  // 1. First-Principles Bandgap Expansion (Varshni Equation for Silicon):
  // Eg(T) = Eg(0) - (alpha * T^2) / (T + beta)
  // For Silicon: Eg(0) = 1.170 eV, alpha = 4.73e-4 eV/K, beta = 636 K
  const egZero = 1.170; // eV at 0 Kelvin
  const alpha = 4.73e-4;
  const beta = 636.0;
  const bandgapEv = egZero - (alpha * Math.pow(tempK, 2)) / (tempK + beta);

  // 2. Carrier Freeze-Out Dynamics in Silicon Substrate / Peripheral Access Transistors:
  // Ionization ratio: n / Nd ~ 1 / (1 + 2 * exp((Ed - Ef) / kT))
  // Approximated freeze-out: at 300K -> 100%, at 77K -> ~80%, at 4K -> < 1% for standard dopants (45 meV phosphorus/boron)
  // Metallic silicide filaments avoid internal freeze-out, but access gates still experience substrate freeze-out.
  const thermalEnergyEv = (8.617e-5) * tempK; // kT in eV
  const ionizationFactor = Math.min(1.0, Math.exp(-0.045 / Math.max(0.001, thermalEnergyEv * 2.0)));
  const baseRetention = tech.isOhmic ? 0.88 : (1.0 - tech.freezeOutSensitivity);
  let carrierIonizationPct = Math.max(0.2, (ionizationFactor * baseRetention + baseRetention * 0.12) * 100.0);
  if (tempK > 200) carrierIonizationPct = 100.0;

  // 3. Subthreshold Swing (SS) Steepening:
  // SS = ln(10) * (kT / q) * (1 + Cd / Cox)
  // Standard room temp (300K) SS ~ 65 - 75 mV/dec.
  // At cryogenic temps, SS drops linearly with T until interface state saturation (apparent limit ~ 5 - 12 mV/dec around 4K)
  const idealityFactor = 1.15; // (1 + Cd/Cox)
  const theoreticalSs = Math.LN10 * (8.617e-5 * tempK) * idealityFactor * 1000.0; // mV/dec
  // Real cryogenic MOSFETs exhibit a saturation floor due to localized band-tail states & trap tunneling
  const ssSaturationFloor = 7.5; // mV/dec physical floor in advanced GAA/FinFET nodes
  const effectiveSsMvPerDec = Math.max(ssSaturationFloor, theoreticalSs);

  // 4. Memory Cell Readout Power Dissipation (nW):
  // P_read = V_bias^2 / R_eff
  // When carriers freeze out, effective resistance skyrockets in non-ohmic devices
  const freezeMultiplier = tech.isOhmic ? (1.0 + (100.0 - carrierIonizationPct) * 0.005) : (100.0 / Math.max(1.0, carrierIonizationPct));
  const effectiveROhm = tech.baseResistanceOhm * (tech.isOhmic ? (0.85 + 0.15 * (tempK / 300.0)) : freezeMultiplier);
  const vBiasV = vBiasMv / 1000.0;
  const readPowerWatts = Math.pow(vBiasV, 2) / effectiveROhm;
  const readPowerNw = readPowerWatts * 1e9;
  const readPowerUw = readPowerWatts * 1e6;

  // 5. Cryogenic Refrigerator Cooling Budget & Qubit Thermal Coherence Margin:
  // Heat dissipation margin = 100% - (P_read_uW / maxReadoutPowerUw * 100%)
  const coolingBudgetConsumedPct = (readPowerUw / Math.max(0.001, preset.maxReadoutPowerUw)) * 100.0;
  const coherenceMarginPct = Math.max(0.0, Math.min(100.0, 100.0 - coolingBudgetConsumedPct));

  // 6. Architectural Grading
  let ratingZh = '極致超導相容 (OPTIMAL CRYOGENIC)';
  let ratingEn = 'OPTIMAL CRYOGENIC';
  let gradeColor = '#059669';

  if (coherenceMarginPct < 50.0 || effectiveSsMvPerDec > 40.0) {
    ratingZh = '熱耗受限 (THERMAL STRAINED)';
    ratingEn = 'THERMAL STRAINED';
    gradeColor = '#f59e0b';
  }
  if (coherenceMarginPct < 15.0 || carrierIonizationPct < 5.0) {
    ratingZh = '凍結不相容 (FREEZE-OUT VIOLATION)';
    ratingEn = 'FREEZE-OUT VIOLATION';
    gradeColor = '#dc2626';
  }

  const verdictZh = `在 ${preset.nameZh} (${tempK} K) 極端低溫下，矽能隙擴展至 ${bandgapEv.toFixed(3)} eV，亞閾值擺幅陡降至 ${effectiveSsMvPerDec.toFixed(1)} mV/dec。採用 ${tech.nameZh} 時，通道與介質有效導電保留率為 ${carrierIonizationPct.toFixed(1)}%，單元讀出功耗約 ${readPowerNw.toFixed(1)} nW。相較低溫冷卻極限預算，熱相干裕度為 ${coherenceMarginPct.toFixed(1)}%。${tech.isOhmic ? '歐姆金屬微絲本體無能隙凍結效應，但外圍存取電晶體仍需考量低溫閾值漂移；適合低功耗校準參數鎖定。' : '非歐姆接面在低溫下受載子凍結與能階阻礙影響，需注意讀出電壓拉高引發之微波熱噪訊與電荷泵開銷。'}`;

  const verdictEn = `Under ${preset.nameEn} (${tempK} K), silicon bandgap widens to ${bandgapEv.toFixed(3)} eV and subthreshold swing sharpens to ${effectiveSsMvPerDec.toFixed(1)} mV/dec. Using ${tech.nameEn}, effective channel/media conduction retention is ${carrierIonizationPct.toFixed(1)}% with cell readout power of ${readPowerNw.toFixed(1)} nW. Thermal coherence margin is ${coherenceMarginPct.toFixed(1)}%. ${tech.isOhmic ? 'Ohmic metallic filaments avoid internal bandgap freeze-out, though peripheral access gates still experience cryogenic Vth shifts; suitable for low-power calibration locking.' : 'Non-ohmic transport suffers from freeze-out and activation barriers, requiring caution against microwave thermal noise and charge pump overhead.'}`;

  return {
    preset,
    tech,
    tempK,
    vBiasMv,
    bandgapEv,
    carrierIonizationPct,
    effectiveSsMvPerDec,
    effectiveROhm,
    readPowerNw,
    readPowerUw,
    coherenceMarginPct,
    coolingBudgetConsumedPct,
    ratingZh,
    ratingEn,
    gradeColor,
    verdictZh,
    verdictEn
  };
}

/**
 * Canvas Visualization for Cryogenic CMOS & Quantum NVM
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {'temperature_sweep_ss' | 'cryo_power_decoherence'} [mode='temperature_sweep_ss']
 */
export function drawCryoCanvas(canvas, metrics, mode = 'temperature_sweep_ss') {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const width = canvas.clientWidth || 420;
  const height = canvas.clientHeight || 180;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, height);

  const padX = 45;
  const padY = 25;
  const plotW = width - 65;
  const plotH = height - 55;

  if (mode === 'temperature_sweep_ss') {
    // Mode 1: Temperature Sweep 4K -> 300K vs Subthreshold Swing (SS)
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 10.5px "IBM Plex Mono", monospace';
    ctx.fillText('SUBTHRESHOLD SWING (SS) & BANDGAP VS TEMP (4K - 300K)', padX, 16);

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '500 8.5px "IBM Plex Mono", monospace';
    ctx.fillText('80 mV/dec', padX - 42, padY + 6);
    ctx.fillText('40', padX - 22, padY + plotH * 0.5);
    ctx.fillText('8', padX - 16, padY + plotH - 4);
    ctx.fillText('4K', padX, padY + plotH + 14);
    ctx.fillText('77K', padX + plotW * 0.25, padY + plotH + 14);
    ctx.fillText('300K', padX + plotW - 25, padY + plotH + 14);

    // Curve: SS vs Temperature
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const maxT = 300.0;
    const maxSs = 80.0;
    for (let i = 0; i <= 60; i++) {
      const t = 1.0 + (i / 60) * maxT;
      const sim = calculateCryoNvmMetrics({
        presetKey: metrics.preset.id,
        techKey: metrics.tech.id,
        customTempK: t,
        readBiasMv: metrics.vBiasMv
      });

      const x = padX + (t / maxT) * plotW;
      const y = padY + plotH - (sim.effectiveSsMvPerDec / maxSs) * plotH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Operating point
    const curX = padX + (metrics.tempK / maxT) * plotW;
    const curY = padY + plotH - (metrics.effectiveSsMvPerDec / maxSs) * plotH;

    ctx.fillStyle = metrics.gradeColor;
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 9.5px "IBM Plex Mono", monospace';
    ctx.fillText(`@${metrics.tempK}K: SS=${metrics.effectiveSsMvPerDec.toFixed(1)} mV/dec`, Math.min(width - 150, curX + 8), Math.max(padY + 15, curY - 6));

  } else {
    // Mode 2: Readout Power vs Cooling Budget & Coherence Margin
    ctx.fillStyle = '#10b981';
    ctx.font = '600 10.5px "IBM Plex Mono", monospace';
    ctx.fillText('READOUT POWER VS QUBIT COHERENCE MARGIN', padX, 16);

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padX, padY);
    ctx.lineTo(padX, padY + plotH);
    ctx.lineTo(padX + plotW, padY + plotH);
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '500 8.5px "IBM Plex Mono", monospace';
    ctx.fillText('100% Margin', padX - 44, padY + 6);
    ctx.fillText('50%', padX - 24, padY + plotH * 0.5);
    ctx.fillText('0%', padX - 18, padY + plotH);
    ctx.fillText('0.1 nW', padX, padY + plotH + 14);
    ctx.fillText('1 uW', padX + plotW * 0.5, padY + plotH + 14);
    ctx.fillText('10 uW', padX + plotW - 25, padY + plotH + 14);

    // Curve: Power Sweep vs Coherence
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.beginPath();

    for (let i = 0; i <= 50; i++) {
      const vSweep = 50.0 + (i / 50.0) * 1150.0;
      const sim = calculateCryoNvmMetrics({
        presetKey: metrics.preset.id,
        techKey: metrics.tech.id,
        customTempK: metrics.tempK,
        readBiasMv: vSweep
      });

      const maxUw = Math.max(1.0, metrics.preset.maxReadoutPowerUw * 2.0);
      const x = padX + (Math.min(maxUw, sim.readPowerUw) / maxUw) * plotW;
      const y = padY + plotH - (sim.coherenceMarginPct / 100.0) * plotH;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Operating point
    const maxUw = Math.max(1.0, metrics.preset.maxReadoutPowerUw * 2.0);
    const curX = padX + (Math.min(maxUw, metrics.readPowerUw) / maxUw) * plotW;
    const curY = padY + plotH - (metrics.coherenceMarginPct / 100.0) * plotH;

    ctx.fillStyle = metrics.gradeColor;
    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 9.5px "IBM Plex Mono", monospace';
    ctx.fillText(`P=${metrics.readPowerNw.toFixed(1)} nW (Margin: ${metrics.coherenceMarginPct.toFixed(1)}%)`, Math.min(width - 165, curX + 8), Math.max(padY + 15, curY - 6));
  }
}

/**
 * Interactive Workbench Initializer for Cryogenic CMOS & Quantum NVM Simulator
 */
export function initCryoNvmSimulator() {
  const root = document.getElementById('cryo-cmos-simulator-root');
  if (!root) return;

  const presetSelect = document.getElementById('cryo-preset-select');
  const techSelect = document.getElementById('cryo-tech-select');
  const tempSlider = document.getElementById('cryo-temp-slider');
  const biasSlider = document.getElementById('cryo-bias-slider');

  const tempVal = document.getElementById('cryo-temp-val');
  const biasVal = document.getElementById('cryo-bias-val');

  const outSs = document.getElementById('cryo-out-ss');
  const outEg = document.getElementById('cryo-out-eg');
  const outFreeze = document.getElementById('cryo-out-freeze');
  const outReadPower = document.getElementById('cryo-out-readpower');
  const outCoherence = document.getElementById('cryo-out-coherence');
  const outRating = document.getElementById('cryo-out-rating');
  const outVerdict = document.getElementById('cryo-out-verdict');

  const canvas = document.getElementById('cryo-nvm-canvas');
  const btnModeSs = document.getElementById('cryo-mode-ss');
  const btnModePower = document.getElementById('cryo-mode-power');

  let activeMode = 'temperature_sweep_ss';

  function update() {
    const config = {
      presetKey: presetSelect ? presetSelect.value : 'cryo_dilution_fridge_4k',
      techKey: techSelect ? techSelect.value : 'antifuse_ohmic_filament',
      customTempK: tempSlider ? parseFloat(tempSlider.value) : 4.2,
      readBiasMv: biasSlider ? parseFloat(biasSlider.value) : 400.0
    };

    if (tempVal && tempSlider) tempVal.textContent = parseFloat(tempSlider.value).toFixed(1) + ' K';
    if (biasVal && biasSlider) biasVal.textContent = parseFloat(biasSlider.value).toFixed(0) + ' mV';

    const metrics = calculateCryoNvmMetrics(config);

    if (outSs) outSs.textContent = metrics.effectiveSsMvPerDec.toFixed(1) + ' mV/dec';
    if (outEg) outEg.textContent = metrics.bandgapEv.toFixed(3) + ' eV';
    if (outFreeze) {
      outFreeze.textContent = metrics.carrierIonizationPct.toFixed(1) + '%';
      outFreeze.style.color = metrics.carrierIonizationPct > 50 ? '#059669' : (metrics.carrierIonizationPct > 10 ? '#f59e0b' : '#dc2626');
    }
    if (outReadPower) outReadPower.textContent = metrics.readPowerNw < 1000 ? metrics.readPowerNw.toFixed(1) + ' nW' : (metrics.readPowerUw.toFixed(2) + ' µW');
    if (outCoherence) {
      outCoherence.textContent = metrics.coherenceMarginPct.toFixed(1) + '%';
      outCoherence.style.color = metrics.coherenceMarginPct > 70 ? '#059669' : (metrics.coherenceMarginPct > 30 ? '#f59e0b' : '#dc2626');
    }
    if (outRating) {
      outRating.innerHTML = `<span data-lang="zh">${metrics.ratingZh}</span><span data-lang="en">${metrics.ratingEn}</span>`;
      outRating.style.color = metrics.gradeColor;
    }

    if (outVerdict) {
      outVerdict.innerHTML = `
        <span data-lang="zh">${metrics.verdictZh}</span>
        <span data-lang="en">${metrics.verdictEn}</span>
      `;
    }

    if (canvas) {
      drawCryoCanvas(canvas, metrics, activeMode);
    }

    // Click-to-copy ergonomics on KPI elements
    const isZhLang = (window.HubLanguage?.get() || document.documentElement.dataset.language || document.documentElement.lang || 'zh').startsWith('zh');
    [outSs, outEg, outFreeze, outReadPower, outCoherence].forEach((el) => {
      if (el && !el.dataset.copyAttached) {
        el.dataset.copyAttached = 'true';
        el.style.cursor = 'pointer';
        el.setAttribute('title', isZhLang ? '點擊複製數值' : 'Click to copy');
        el.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(el.textContent.trim());
            const orig = el.textContent;
            el.textContent = isZhLang ? '已複製！' : 'Copied!';
            setTimeout(() => { el.textContent = orig; }, 1200);
          } catch (_) {}
        });
      }
    });
  }

  // Export CSV Action for Cryo-CMOS Quantum NVM
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

  const presetContainer = presetSelect?.parentNode;
  if (presetContainer && !presetContainer.querySelector('#cryo-export-csv-btn')) {
    const exportBtn = document.createElement('button');
    exportBtn.id = 'cryo-export-csv-btn';
    exportBtn.type = 'button';
    exportBtn.style.cssText = 'margin-top: 6px; padding: 4px 10px; font-size: 11px; font-weight: 600; border-radius: 4px; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(15, 23, 42, 0.6); color: #38bdf8; cursor: pointer;';
    const isZhLang = (window.HubLanguage?.get() || document.documentElement.dataset.language || document.documentElement.lang || 'zh').startsWith('zh');
    exportBtn.textContent = isZhLang ? '📥 匯出 Cryo-CMOS 低溫特性 CSV' : '📥 Export Cryo-CMOS CSV';
    exportBtn.setAttribute('aria-label', isZhLang ? '匯出極低溫量子介面載子凍結與讀出功耗分析資料集為 CSV 檔案' : 'Export cryogenic quantum interface carrier freeze-out and readout power dataset as CSV file');
    exportBtn.addEventListener('click', () => {
      const pId = presetSelect ? presetSelect.value : 'cryo_dilution_fridge_4k';
      const tId = techSelect ? techSelect.value : 'antifuse_ohmic_filament';
      const vBias = biasSlider ? parseFloat(biasSlider.value) : 0.8;
      let csv = 'Temp_K,Bandgap_eV,CarrierIonizationPct,EffectiveSS_mVdec,EffectiveRes_Ohm,ReadPower_uW,CoherenceMarginPct\n';
      const testTempsK = [0.1, 1.0, 4.2, 10, 20, 50, 77, 100, 150, 200, 300];
      for (const tK of testTempsK) {
        const m = calculateCryoNvmMetrics({
          presetId: pId,
          techId: tId,
          operatingTempK: tK,
          readBiasV: vBias
        });
        csv += `${tK},${m.bandgapEv.toFixed(4)},${m.carrierIonizationPct.toFixed(2)},${m.effectiveSsMvPerDec.toFixed(2)},${m.effectiveResistanceOhm.toFixed(1)},${m.readPowerUw.toFixed(4)},${m.coherenceMarginPct.toFixed(1)}\n`;
      }
      downloadCsv(`cryo_cmos_${pId}_${tId}.csv`, csv);
    });
    presetContainer.appendChild(exportBtn);
  }

  if (presetSelect) presetSelect.addEventListener('change', () => {
    const selectedPreset = CRYO_SYSTEM_PRESETS[presetSelect.value];
    if (selectedPreset && tempSlider) {
      tempSlider.value = selectedPreset.targetTempK;
    }
    update();
  });
  if (techSelect) techSelect.addEventListener('change', update);
  if (tempSlider) tempSlider.addEventListener('input', update);
  if (biasSlider) biasSlider.addEventListener('input', update);

  if (btnModeSs) {
    btnModeSs.addEventListener('click', () => {
      activeMode = 'temperature_sweep_ss';
      btnModeSs.classList.add('active');
      btnModeSs.setAttribute('aria-pressed', 'true');
      btnModeSs.style.background = '#0284c7';
      btnModeSs.style.color = '#ffffff';

      if (btnModePower) {
        btnModePower.classList.remove('active');
        btnModePower.setAttribute('aria-pressed', 'false');
        btnModePower.style.background = '#1e293b';
        btnModePower.style.color = '#94a3b8';
      }
      update();
    });
  }

  if (btnModePower) {
    btnModePower.addEventListener('click', () => {
      activeMode = 'cryo_power_decoherence';
      btnModePower.classList.add('active');
      btnModePower.setAttribute('aria-pressed', 'true');
      btnModePower.style.background = '#0284c7';
      btnModePower.style.color = '#ffffff';

      if (btnModeSs) {
        btnModeSs.classList.remove('active');
        btnModeSs.setAttribute('aria-pressed', 'false');
        btnModeSs.style.background = '#1e293b';
        btnModeSs.style.color = '#94a3b8';
      }
      update();
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', () => {
      if (canvas) update();
    });
    window.addEventListener('hub:language-change', () => {
      if (canvas) update();
    });
    window.addEventListener('languagechange', () => {
      if (canvas) update();
    });
  }

  update();
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCryoNvmSimulator);
  } else {
    initCryoNvmSimulator();
  }
}
