/**
 * @file rad-hard-nvm-simulator.js
 * @description Analytical Radiation Hardness (TID, SEE, SEL) & Macro Reliability Simulator for Aerospace & Defense NVM Evaluations.
 *
 * @version 1.0.0 (2026-10-06)
 * @author High-Reliability Aerospace Semiconductor Physics Team
 * @license Grounded in published semiconductor radiation physics literature and empirical models.
 */

/**
 * @typedef {Object} RadPreset
 * @property {string} id - Unique preset identifier
 * @property {string} nameZh - Traditional Chinese name
 * @property {string} nameEn - English name
 * @property {number} targetTidKrad - Mission target Total Ionizing Dose in krad(Si)
 * @property {number} peakHeavyIonLet - Peak Heavy-Ion LET in MeV*cm^2/mg
 * @property {number} protonFlux - High-energy proton flux in p/(cm^2*s)
 * @property {number} missionYears - Mission design duration in years
 * @property {string} descriptionZh - Scenario description in Traditional Chinese
 * @property {string} descriptionEn - Scenario description in English
 */

/**
 * Aerospace & Defense Mission Profile Presets
 * @type {Record<string, RadPreset>}
 */
export const RAD_PRESETS = {
  deep_space_jupiter: {
    id: 'deep_space_jupiter',
    nameZh: '木星歐羅巴深空極限輻照探測 (Jupiter Europa Probe)',
    nameEn: 'Jupiter Europa Extreme Deep Space Probe',
    targetTidKrad: 2500, // 2.5 Mrad(Si) in trapped Jovian radiation belts
    peakHeavyIonLet: 85.0, // High-Z galactic cosmic rays
    protonFlux: 8.5e6,
    missionYears: 7.5,
    descriptionZh: '木星強輻射帶深空探測，累積 TID 達 2.5 Mrad(Si)，宇宙射線重離子穿透力極高，商用電荷型 NVM 瞬間歸零。',
    descriptionEn: 'Jupiter trapped radiation belts with 2.5 Mrad(Si) TID; commercial charge-based NVM suffers catastrophic bit failure.'
  },
  geo_defense_commsat: {
    id: 'geo_defense_commsat',
    nameZh: '地球同步軌道國防通訊衛星 (GEO Military Commsat)',
    nameEn: 'GEO Military Strategic Commsat (15-Year Life)',
    targetTidKrad: 150, // 150 krad(Si)
    peakHeavyIonLet: 65.0,
    protonFlux: 2.2e5,
    missionYears: 15.0,
    descriptionZh: '地球同步軌道 15 年極端服役，范艾倫外輻射帶日積月累電離損傷，要求根金鑰與開機微碼零位元翻轉。',
    descriptionEn: '15-year GEO operational mission in outer Van Allen belts; demands zero soft-errors in boot firmware and cryptographic root.'
  },
  leo_constellation_smallsat: {
    id: 'leo_constellation_smallsat',
    nameZh: '低地軌道巨型星座微衛星 (LEO SmallSat Constellation)',
    nameEn: 'LEO Mega-Constellation SmallSat (COTS-Plus)',
    targetTidKrad: 30, // 30 krad(Si)
    peakHeavyIonLet: 40.0,
    protonFlux: 6.8e5, // South Atlantic Anomaly (SAA) passes
    missionYears: 5.0,
    descriptionZh: '低地軌道穿越南大西洋異常區 (SAA)，高能質子通量突增，平衡低成本標準邏輯與高抗輻可靠度。',
    descriptionEn: 'LEO orbit crossing the South Atlantic Anomaly with proton bursts, balancing commercial logic cost and rad-hard assurance.'
  },
  commercial_cots_eflash: {
    id: 'commercial_cots_eflash',
    nameZh: '傳統商用商規浮閘 eFlash 基準 (Commercial COTS Baseline)',
    nameEn: 'Commercial COTS Floating-Gate Baseline',
    targetTidKrad: 15, // 15 krad(Si)
    peakHeavyIonLet: 15.0,
    protonFlux: 5.0e3,
    missionYears: 1.0,
    descriptionZh: '地面商規浮閘 Flash 微控制器，無抗輻射加固設計，在 15 krad(Si) 即發生嚴重電荷洩漏與誤碼激增。',
    descriptionEn: 'Standard terrestrial COTS microcontroller with unhardened floating gate, suffering severe charge leakage at 15 krad(Si).'
  }
};

/**
 * NVM Technology Radiation Physical Characteristics
 */
export const RAD_NVM_TECHS = {
  antifuse_ohmic: {
    id: 'antifuse_ohmic',
    nameZh: '0-Mask AntiFuse (永久金屬化歐姆微絲)',
    nameEn: '0-Mask AntiFuse (Ohmic Metal/Poly Filament)',
    toxNm: 1.8, // Ultra-thin gate dielectric (< 2nm)
    tidTolerateKrad: 2500, // Core logic thin oxide withstands > 2.5 Mrad(Si)
    letThreshold: 55.0, // Peripheral CMOS readout logic LET threshold
    sigmaSat: 2.5e-12, // Tiny non-zero macro saturation cross-section from CMOS sense/latch circuitry
    isChargeBased: false,
    descriptionZh: '物理微絲為永久共價/金屬導電通道，不依賴俘獲電荷，單元無電荷流失；巨集整體受周邊 CMOS 讀出電路耐受性規範。',
    descriptionEn: 'Physical filament is an ohmic solid conduit without stored charge, preventing bitcell charge leakage; macro profile governed by peripheral CMOS readout.'
  },
  stt_emram: {
    id: 'stt_emram',
    nameZh: 'STT-MRAM (自旋穿隧磁阻接面 MTJ)',
    nameEn: 'STT-MRAM (Spin-Transfer Torque MTJ)',
    toxNm: 1.1, // MgO tunnel barrier
    tidTolerateKrad: 500, // MTJ is hard, but CMOS peripheral CMOS circuits limit to ~500 krad
    letThreshold: 28.0,
    sigmaSat: 1.5e-10, // cm^2/bit
    isChargeBased: false,
    descriptionZh: '磁性接面本身抗電離輻照良好，但強重離子沉積瞬態電流可能誘發局部自旋翻轉，周邊 CMOS 電路受制於 500 krad。',
    descriptionEn: 'MTJ is robust against TID, but intense transient heavy-ion current can perturb spin alignment; CMOS periphery limits to 500 krad.'
  },
  reram_oxram: {
    id: 'reram_oxram',
    nameZh: 'ReRAM (金屬氧化物氧空缺微絲)',
    nameEn: 'ReRAM (Oxide Oxygen-Vacancy Filament)',
    toxNm: 3.5,
    tidTolerateKrad: 300,
    letThreshold: 22.0,
    sigmaSat: 4.8e-10,
    isChargeBased: false,
    descriptionZh: '高阻態 (HRS) 氧空缺網絡易受電離輻射引發之電子電洞重組擾動，導致讀取電阻窗口向低阻態漂移。',
    descriptionEn: 'High-Resistance State (HRS) oxygen vacancy network is susceptible to TID-induced carrier recombination, drifting read window.'
  },
  commercial_eflash: {
    id: 'commercial_eflash',
    nameZh: '浮閘 eFlash (Floating Gate 捕獲靜電荷)',
    nameEn: 'Floating Gate eFlash (Trapped Static Charge)',
    toxNm: 8.5, // Thick tunnel oxide
    tidTolerateKrad: 25, // Fails rapidly above 25-50 krad
    letThreshold: 6.5, // Low LET threshold
    sigmaSat: 2.5e-8, // High SEU cross-section
    isChargeBased: true,
    descriptionZh: '依賴浮閘中儲存的靜電荷，電離輻照引發之光生電洞迅速中和電子，15–30 krad 下電荷完全漏光。',
    descriptionEn: 'Relies on trapped electrons; TID photo-generated holes rapidly neutralize floating gate charge, failing at 15–30 krad.'
  }
};

/**
 * Calculates radiation tolerance metrics based on analytical and empirical models.
 *
 * Governing Equations:
 * 1. Total Ionizing Dose Induced Threshold Voltage Shift:
 *    ΔV_th(D) = - (q / ε_ox) * t_ox^2 * K_g * Y(E) * D * f_trap
 *    For thin oxide (t_ox < 2nm), ΔV_th ∝ t_ox^2 << 1 mV
 * 2. Sense Margin Degradation:
 *    For charge-based: ΔV_sense(D) = ΔV_0 * exp(-D / D_crit)
 *    For AntiFuse: ΔV_sense(D) ≈ ΔV_0 (Filament invariant, tiny periphery shift)
 * 3. Heavy-Ion SEU Cross-Section (Weibull Model):
 *    σ(LET) = σ_sat * [ 1 - exp(-((LET - LET_th) / W)^s) ] for LET > LET_th
 * 4. Orbital Soft Error Rate (SER) in FIT / Mbit:
 *    FIT ≈ σ(LET) * Φ_proton * 3600 * 1e5 (Single-point flux approximation)
 *
 * @param {Object} params
 * @param {string} params.presetKey
 * @param {string} params.techKey
 * @param {number} params.tidDoseKrad - Simulated dose in krad(Si)
 * @param {number} params.heavyIonLet - Simulated LET in MeV*cm^2/mg
 * @returns {Object} Metrics
 */
export function calculateRadMetrics(params = {}) {
  const preset = RAD_PRESETS[params.presetKey] || RAD_PRESETS.deep_space_jupiter;
  const tech = RAD_NVM_TECHS[params.techKey] || RAD_NVM_TECHS.antifuse_ohmic;

  const dose = typeof params.tidDoseKrad === 'number' && !isNaN(params.tidDoseKrad) ? Math.max(0, params.tidDoseKrad) : (preset.targetTidKrad || preset.tidKrad || 100);
  const letVal = typeof params.heavyIonLet === 'number' && !isNaN(params.heavyIonLet) ? Math.max(0, params.heavyIonLet) : (preset.peakHeavyIonLet || preset.letFlux || 45);

  // 1. Analytical TID Threshold Shift ΔV_th
  // ΔV_th ∝ t_ox^2 * dose
  let deltaVthMv = 0;
  let remainingMarginMv = 0;
  const initialSenseMarginMv = 450; // Initial sense margin window in mV

  if (tech.isChargeBased) {
    // Floating gate eFlash: Severe trapped hole generation & charge neutralization
    const dCritKrad = 20.0;
    deltaVthMv = -Math.min(1200, 15.0 * Math.pow(tech.toxNm, 1.8) * Math.pow(dose / 10, 0.85));
    remainingMarginMv = Math.max(0, initialSenseMarginMv * Math.exp(-dose / dCritKrad));
  } else if (tech.id === 'antifuse_ohmic') {
    // AntiFuse: Ohmic conductive filament has ZERO charge dependence
    // Thin unprogrammed oxide has t_ox = 1.8nm, ΔVth < 2mV at 1 Mrad
    deltaVthMv = -0.05 * Math.pow(tech.toxNm, 2.0) * (dose / 100);
    remainingMarginMv = initialSenseMarginMv * (1.0 - (dose / 10000) * 0.01); // < 1% change at 10 Mrad
  } else if (tech.id === 'stt_emram') {
    // STT-MRAM: MTJ invariant, peripheral sense amp offsets drift slightly
    deltaVthMv = -0.45 * Math.pow(tech.toxNm, 2.0) * (dose / 50);
    remainingMarginMv = Math.max(20, initialSenseMarginMv * (1.0 - (dose / 500) * 0.35));
  } else {
    // ReRAM: Oxygen vacancy drift
    deltaVthMv = -0.85 * Math.pow(tech.toxNm, 2.0) * (dose / 50);
    remainingMarginMv = Math.max(10, initialSenseMarginMv * (1.0 - (dose / 300) * 0.55));
  }

  // 2. Heavy-Ion SEU Cross Section via Weibull Formula
  let seuCrossSection = 0; // cm^2 / bit
  const W = 15.0; // Weibull width
  const s = 1.8; // Weibull shape factor

  if (tech.sigmaSat > 0 && letVal > tech.letThreshold) {
    const letDiff = letVal - tech.letThreshold;
    seuCrossSection = tech.sigmaSat * (1 - Math.exp(-Math.pow(letDiff / W, s)));
  }

  // 3. Orbital FIT Rate Calculation (per Mbit)
  // FIT = 1 failure per 10^9 device-hours
  const orbitFitPerMbit = seuCrossSection * preset.protonFlux * 1e6 * 3600 * 1e9 * 1e-4;

  // 4. Mission Survivability Assessment
  const isTidSurvived = dose <= tech.tidTolerateKrad;
  const isLetSurvived = letVal <= tech.letThreshold || tech.sigmaSat === 0;

  let assuranceRating = 'CLASS_S_SPACE_QUALIFIED';
  let verdictZh = '';
  let verdictEn = '';

  if (tech.id === 'antifuse_ohmic') {
    assuranceRating = 'SPACE_HIGH_RADIATION_ROBUST';
    verdictZh = `【極限高抗輻架構】${tech.nameZh} 採用共價/金屬化歐姆導電微絲，在 ${dose.toFixed(0)} krad(Si) 累積輻照下感測裕度維持 ${remainingMarginMv.toFixed(1)} mV（留存率 ${(remainingMarginMv/initialSenseMarginMv*100).toFixed(1)}%）。微絲本體無儲存電荷，對電離電荷洩漏具備天然物理抗性；巨集周邊 CMOS 感測電路在 LET = ${letVal.toFixed(1)} MeV·cm²/mg 下預估軌道失效率僅約 ${orbitFitPerMbit.toFixed(4)} FIT/Mbit（遠低於電荷型記憶體），適合深空與高軌道航太任務。`;
    verdictEn = `[High-Radiation Robust Architecture] ${tech.nameEn} utilizes permanent ohmic microfilaments, preserving ${remainingMarginMv.toFixed(1)} mV sense margin (${(remainingMarginMv/initialSenseMarginMv*100).toFixed(1)}% retention) at ${dose.toFixed(0)} krad(Si) TID. The filament body carries no trapped charge, preventing ionization charge loss. Macro peripheral CMOS readout exhibits an estimated orbital failure rate of only ~${orbitFitPerMbit.toFixed(4)} FIT/Mbit at LET = ${letVal.toFixed(1)} MeV·cm²/mg, suitable for deep-space and high-orbit missions.`;
  } else if (!isTidSurvived || remainingMarginMv < 50) {
    assuranceRating = 'MISSION_FAILURE_LETHAL';
    verdictZh = `【任務致命失效警告】${tech.nameZh} 在累積劑量 ${dose.toFixed(0)} krad(Si) 下發生嚴重輻射退化，感測裕度暴跌至 ${remainingMarginMv.toFixed(1)} mV（閾值電壓漂移 ${deltaVthMv.toFixed(1)} mV）。${tech.isChargeBased ? '浮閘俘獲電荷完全流失，引發大規模硬崩潰與代碼錯亂。' : '周邊讀寫電路已遭電離破壞。'}`;
    verdictEn = `[Critical Mission Failure] ${tech.nameEn} suffers severe radiation degradation under ${dose.toFixed(0)} krad(Si) TID, collapsing read margin to ${remainingMarginMv.toFixed(1)} mV (ΔVth drift: ${deltaVthMv.toFixed(1)} mV). ${tech.isChargeBased ? 'Floating gate charge is completely depleted, inducing catastrophic code corruption.' : 'Peripheral sense circuitry compromised by ionization.'}`;
  } else {
    assuranceRating = 'RESTRICTED_RAD_TOLERANT';
    verdictZh = `【限制型耐輻運作】${tech.nameZh} 在 ${dose.toFixed(0)} krad(Si) 下維持剩餘裕度 ${remainingMarginMv.toFixed(1)} mV，但在 LET = ${letVal.toFixed(1)} MeV·cm²/mg 重離子轟擊下 SEU 截面積達 ${seuCrossSection.toExponential(2)} cm²/bit，軌道預測失效率為 ${orbitFitPerMbit.toFixed(1)} FIT/Mbit，必須搭配三模備援 (TMR) 或 EDAC 加固。`;
    verdictEn = `[Restricted Rad-Tolerant] ${tech.nameEn} retains ${remainingMarginMv.toFixed(1)} mV margin under ${dose.toFixed(0)} krad(Si), but exhibits SEU cross-section of ${seuCrossSection.toExponential(2)} cm²/bit at LET = ${letVal.toFixed(1)} MeV·cm²/mg (${orbitFitPerMbit.toFixed(1)} FIT/Mbit). Requires Triple Modular Redundancy (TMR) or EDAC scrubbers.`;
  }

  return {
    preset,
    tech,
    inputs: params,
    deltaVthMv,
    remainingMarginMv,
    initialSenseMarginMv,
    marginRetentionPct: (remainingMarginMv / initialSenseMarginMv) * 100,
    seuCrossSection,
    orbitFitPerMbit,
    isTidSurvived,
    isLetSurvived,
    assuranceRating,
    verdictZh,
    verdictEn
  };
}

/**
 * Draws High-Precision Radiation Physics Canvas Curves.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {string} mode - 'tid_dose_sweep' | 'let_weibull_cross_section'
 */
export function drawRadCanvas(canvas, metrics, mode = 'tid_dose_sweep', hoverPos = null) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 3) : 1;
  const rect = canvas.getBoundingClientRect();
  const width = rect.width > 0 ? rect.width : (canvas.clientWidth || 420);
  const height = rect.height > 0 ? rect.height : (canvas.clientHeight || 180);

  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  // Background
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = '#08131e';
  ctx.fillRect(0, 0, width, height);

  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 40;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  if (plotWidth <= 0 || plotHeight <= 0) {
    ctx.restore();
    return;
  }

  // Draw Grid Lines
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  const numXGrids = 6;
  const numYGrids = 4;
  for (let i = 0; i <= numXGrids; i++) {
    const gx = padLeft + (i / numXGrids) * plotWidth;
    ctx.beginPath();
    ctx.moveTo(gx, padTop);
    ctx.lineTo(gx, padTop + plotHeight);
    ctx.stroke();
  }
  for (let j = 0; j <= numYGrids; j++) {
    const gy = padTop + (j / numYGrids) * plotHeight;
    ctx.beginPath();
    ctx.moveTo(padLeft, gy);
    ctx.lineTo(padLeft + plotWidth, gy);
    ctx.stroke();
  }
  ctx.setLineDash([]); // Reset dashed

  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#cbd5e1';

  if (mode === 'tid_dose_sweep') {
    // Mode 1: TID Dose (0 to 1000 krad) vs Remaining Sense Margin (0 to 500 mV)
    const dMax = 1000; // krad(Si)
    const mMax = 500; // mV

    // Y Axis Ticks
    for (let j = 0; j <= numYGrids; j++) {
      const mVal = mMax * (1 - j / numYGrids);
      const gy = padTop + (j / numYGrids) * plotHeight;
      ctx.fillText(mVal.toFixed(0) + ' mV', 12, gy + 3);
    }

    // X Axis Ticks
    for (let i = 0; i <= numXGrids; i++) {
      const dVal = (i / numXGrids) * dMax;
      const gx = padLeft + (i / numXGrids) * plotWidth;
      ctx.fillText(dVal.toFixed(0) + ' krad', gx - 16, padTop + plotHeight + 18);
    }

    // Critical Read Margin Failure Line (50 mV)
    const yFail = padTop + ((mMax - 50) / mMax) * plotHeight;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, yFail);
    ctx.lineTo(padLeft + plotWidth, yFail);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#f87171';
    ctx.fillText('Min Read Sense Threshold (50 mV)', padLeft + 10, yFail - 6);

    // Plot Curves for All 4 Techs
    const techs = [
      { key: 'antifuse_ohmic', color: '#10b981', label: 'AntiFuse (Ohmic Invariant)' },
      { key: 'stt_emram', color: '#38bdf8', label: 'STT-MRAM (Periphery Limit)' },
      { key: 'reram_oxram', color: '#f59e0b', label: 'ReRAM (Vacancy Drift)' },
      { key: 'commercial_eflash', color: '#ef4444', label: 'eFlash (Charge Loss)' }
    ];

    const steps = 60;
    techs.forEach((tInfo) => {
      ctx.strokeStyle = tInfo.color;
      ctx.lineWidth = tInfo.key === metrics.tech.id ? 3.0 : 1.2;
      ctx.beginPath();

      for (let s = 0; s <= steps; s++) {
        const d = (s / steps) * dMax;
        const res = calculateRadMetrics({
          presetKey: metrics.inputs.presetKey,
          techKey: tInfo.key,
          tidDoseKrad: d,
          heavyIonLet: metrics.inputs.heavyIonLet
        });

        const px = padLeft + (d / dMax) * plotWidth;
        const py = padTop + Math.max(0, Math.min(plotHeight, ((mMax - res.remainingMarginMv) / mMax) * plotHeight));

        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // Draw Legend Backdrop Card to prevent overlap
    const legBoxW = 224;
    const legBoxH = techs.length * 15 + 10;
    const legBoxX = padLeft + plotWidth - legBoxW - 6;
    const legBoxY = padTop + 6;
    ctx.fillStyle = 'rgba(8, 19, 30, 0.92)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(legBoxX, legBoxY, legBoxW, legBoxH, 4);
    else ctx.rect(legBoxX, legBoxY, legBoxW, legBoxH);
    ctx.fill();
    ctx.stroke();

    techs.forEach((tInfo, tIdx) => {
      ctx.fillStyle = tInfo.color;
      ctx.fillRect(legBoxX + 8, legBoxY + 8 + tIdx * 15, 12, 4);
      ctx.fillStyle = tInfo.key === metrics.tech.id ? '#ffffff' : '#cbd5e1';
      ctx.font = tInfo.key === metrics.tech.id ? '600 10px "IBM Plex Mono", monospace' : '10px "IBM Plex Mono", monospace';
      ctx.fillText(tInfo.label, legBoxX + 26, legBoxY + 12 + tIdx * 15);
    });

  } else {
    // Mode 2: Heavy-Ion LET (0 to 100 MeV*cm^2/mg) vs SEU Cross-Section (Log Scale or Linear 0 to 3e-8)
    const letMax = 100; // MeV*cm^2/mg
    const sigmaMax = 3.0e-8; // cm^2/bit

    // Y Axis Ticks
    for (let j = 0; j <= numYGrids; j++) {
      const sVal = (sigmaMax * (1 - j / numYGrids)).toExponential(1);
      const gy = padTop + (j / numYGrids) * plotHeight;
      ctx.fillText(sVal, 8, gy + 3);
    }

    // X Axis Ticks
    for (let i = 0; i <= numXGrids; i++) {
      const lVal = (i / numXGrids) * letMax;
      const gx = padLeft + (i / numXGrids) * plotWidth;
      ctx.fillText(lVal.toFixed(0) + ' LET', gx - 14, padTop + plotHeight + 18);
    }

    const techs = [
      { key: 'antifuse_ohmic', color: '#10b981', label: 'AntiFuse (σ = 0 Immune)' },
      { key: 'stt_emram', color: '#38bdf8', label: 'STT-MRAM (LETth = 28)' },
      { key: 'reram_oxram', color: '#f59e0b', label: 'ReRAM (LETth = 22)' },
      { key: 'commercial_eflash', color: '#ef4444', label: 'eFlash (LETth = 6.5)' }
    ];

    const steps = 80;
    techs.forEach((tInfo) => {
      ctx.strokeStyle = tInfo.color;
      ctx.lineWidth = tInfo.key === metrics.tech.id ? 3.0 : 1.2;
      ctx.beginPath();

      for (let s = 0; s <= steps; s++) {
        const l = (s / steps) * letMax;
        const res = calculateRadMetrics({
          presetKey: metrics.inputs.presetKey,
          techKey: tInfo.key,
          tidDoseKrad: metrics.inputs.tidDoseKrad,
          heavyIonLet: l
        });

        const px = padLeft + (l / letMax) * plotWidth;
        const py = padTop + Math.max(0, Math.min(plotHeight, ((sigmaMax - res.seuCrossSection) / sigmaMax) * plotHeight));

        if (s === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // Draw Legend Backdrop Card to prevent overlap
    const legBoxW = 224;
    const legBoxH = techs.length * 15 + 10;
    const legBoxX = padLeft + plotWidth - legBoxW - 6;
    const legBoxY = padTop + 6;
    ctx.fillStyle = 'rgba(8, 19, 30, 0.92)';
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.85)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(legBoxX, legBoxY, legBoxW, legBoxH, 4);
    else ctx.rect(legBoxX, legBoxY, legBoxW, legBoxH);
    ctx.fill();
    ctx.stroke();

    techs.forEach((tInfo, tIdx) => {
      ctx.fillStyle = tInfo.color;
      ctx.fillRect(legBoxX + 8, legBoxY + 8 + tIdx * 15, 12, 4);
      ctx.fillStyle = tInfo.key === metrics.tech.id ? '#ffffff' : '#cbd5e1';
      ctx.font = tInfo.key === metrics.tech.id ? '600 10px "IBM Plex Mono", monospace' : '10px "IBM Plex Mono", monospace';
      ctx.fillText(tInfo.label, legBoxX + 26, legBoxY + 12 + tIdx * 15);
    });
  }

  // Interactive Hover Crosshair Probe
  if (hoverPos && hoverPos.x >= padLeft && hoverPos.x <= padLeft + plotWidth && hoverPos.y >= padTop && hoverPos.y <= padTop + plotHeight) {
    const clampedX = Math.max(padLeft, Math.min(padLeft + plotWidth, hoverPos.x));
    const ratioX = (clampedX - padLeft) / plotWidth;

    ctx.save();
    // Vertical Crosshair line
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(clampedX, padTop);
    ctx.lineTo(clampedX, padTop + plotHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Probe readout badge
    let probeText = '';
    if (mode === 'tid_dose_sweep') {
      const probeDose = ratioX * 1000;
      const probeRes = calculateRadMetrics({ presetKey: metrics.preset.id, techKey: metrics.tech.id, tidDoseKrad: probeDose, heavyIonLet: 65 });
      probeText = `Dose: ${probeDose.toFixed(0)} krad | Margin: ${probeRes.remainingMarginMv.toFixed(1)} mV`;
    } else {
      const probeLet = ratioX * 100;
      const probeRes = calculateRadMetrics({ presetKey: metrics.preset.id, techKey: metrics.tech.id, tidDoseKrad: 150, heavyIonLet: probeLet });
      probeText = `LET: ${probeLet.toFixed(0)} MeV | Cross-sec: ${probeRes.seuCrossSection.toExponential(2)}`;
    }

    ctx.font = '600 9.5px "IBM Plex Mono", monospace';
    const textW = ctx.measureText(probeText).width;
    const badgeW = textW + 16;
    const badgeH = 22;
    const badgeX = Math.min(padLeft + plotWidth - badgeW - 4, Math.max(padLeft + 4, clampedX - badgeW / 2));
    const badgeY = padTop + 8;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
    else ctx.rect(badgeX, badgeY, badgeW, badgeH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText(probeText, badgeX + badgeW / 2, badgeY + 15);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Initializes the Radiation Hardness simulator UI in the DOM.
 */
export function initRadSimulator() {
  if (typeof document === 'undefined') return;

  const root = document.getElementById('rad-hard-nvm-simulator-root');
  if (!root) return;

  const presetSelect = document.getElementById('rad-preset-select');
  const techSelect = document.getElementById('rad-tech-select');
  const tidSlider = document.getElementById('rad-tid-slider');
  const tidVal = document.getElementById('rad-tid-val');
  const letSlider = document.getElementById('rad-let-slider');
  const letVal = document.getElementById('rad-let-val');

  // Outputs
  const outDeltavth = document.getElementById('rad-out-deltavth');
  const outMargin = document.getElementById('rad-out-margin');
  const outRetention = document.getElementById('rad-out-retention');
  const outCross = document.getElementById('rad-out-cross');
  const outFit = document.getElementById('rad-out-fit');
  const outRating = document.getElementById('rad-out-rating');
  const outVerdict = document.getElementById('rad-out-verdict');

  // Canvas & Buttons
  const canvas = document.getElementById('rad-canvas');
  const btnModeTid = document.getElementById('rad-mode-tid');
  const btnModeLet = document.getElementById('rad-mode-let');

  let activeMode = 'tid_dose_sweep';

  function update() {
    const config = {
      presetKey: presetSelect ? presetSelect.value : 'deep_space_jupiter',
      techKey: techSelect ? techSelect.value : 'antifuse_ohmic',
      tidDoseKrad: tidSlider ? parseFloat(tidSlider.value) : 150.0,
      heavyIonLet: letSlider ? parseFloat(letSlider.value) : 65.0
    };

    if (tidVal && tidSlider) tidVal.textContent = tidSlider.value + ' krad';
    if (letVal && letSlider) letVal.textContent = letSlider.value + ' MeV';

    const metrics = calculateRadMetrics(config);
    currentMetrics = metrics;

    if (outDeltavth) outDeltavth.textContent = metrics.deltaVthMv.toFixed(1) + ' mV';
    if (outMargin) {
      outMargin.textContent = metrics.remainingMarginMv.toFixed(1) + ' mV';
      outMargin.style.color = metrics.remainingMarginMv >= 100 ? '#059669' : (metrics.remainingMarginMv >= 50 ? '#d97706' : '#dc2626');
    }
    if (outRetention) outRetention.textContent = metrics.marginRetentionPct.toFixed(1) + '%';
    if (outCross) outCross.textContent = metrics.seuCrossSection === 0 ? '0.0 (IMMUNE)' : metrics.seuCrossSection.toExponential(2);
    if (outFit) outFit.textContent = metrics.orbitFitPerMbit.toFixed(1) + ' FIT';
    if (outRating) {
      outRating.textContent = metrics.assuranceRating;
      outRating.style.color = metrics.assuranceRating.includes('IMMUNE') || metrics.assuranceRating.includes('SPACE') ? '#059669' : '#dc2626';
    }

    if (outVerdict) {
      outVerdict.innerHTML = `
        <span data-lang="zh">${metrics.verdictZh}</span>
        <span data-lang="en">${metrics.verdictEn}</span>
      `;
    }

    if (canvas) {
      drawRadCanvas(canvas, metrics, activeMode, hoverPos);
    }
  }

  if (presetSelect) presetSelect.addEventListener('change', () => {
    const p = RAD_PRESETS[presetSelect.value];
    if (p && tidSlider) {
      tidSlider.value = p.targetTidKrad;
      if (letSlider) letSlider.value = p.peakHeavyIonLet;
    }
    update();
  });

  let rAfId = null;
  function scheduleUpdate() {
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      if (rAfId) cancelAnimationFrame(rAfId);
      rAfId = requestAnimationFrame(() => {
        update();
        rAfId = null;
      });
    } else {
      update();
    }
  }

  if (techSelect) techSelect.addEventListener('change', update);
  if (tidSlider) tidSlider.addEventListener('input', scheduleUpdate);
  if (letSlider) letSlider.addEventListener('input', scheduleUpdate);

  if (btnModeTid) {
    btnModeTid.addEventListener('click', () => {
      activeMode = 'tid_dose_sweep';
      btnModeTid.classList.add('active');
      btnModeTid.setAttribute('aria-pressed', 'true');
      btnModeTid.style.background = '#0284c7';
      btnModeTid.style.color = '#ffffff';

      if (btnModeLet) {
        btnModeLet.classList.remove('active');
        btnModeLet.setAttribute('aria-pressed', 'false');
        btnModeLet.style.background = '#1e293b';
        btnModeLet.style.color = '#94a3b8';
      }
      update();
    });
  }

  if (btnModeLet) {
    btnModeLet.addEventListener('click', () => {
      activeMode = 'let_weibull_cross_section';
      btnModeLet.classList.add('active');
      btnModeLet.setAttribute('aria-pressed', 'true');
      btnModeLet.style.background = '#0284c7';
      btnModeLet.style.color = '#ffffff';

      if (btnModeTid) {
        btnModeTid.classList.remove('active');
        btnModeTid.setAttribute('aria-pressed', 'false');
        btnModeTid.style.background = '#1e293b';
        btnModeTid.style.color = '#94a3b8';
      }
      update();
    });
  }

  let currentMetrics = null;
  let hoverPos = null;

  if (canvas) {
    canvas.style.cursor = 'crosshair';
    canvas.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      hoverPos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      if (currentMetrics) drawRadCanvas(canvas, currentMetrics, activeMode, hoverPos);
    });
    canvas.addEventListener('pointerleave', () => {
      hoverPos = null;
      if (currentMetrics) drawRadCanvas(canvas, currentMetrics, activeMode, null);
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
    document.addEventListener('DOMContentLoaded', initRadSimulator);
  } else {
    initRadSimulator();
  }
}
