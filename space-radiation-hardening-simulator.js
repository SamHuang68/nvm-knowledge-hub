/**
 * space-radiation-hardening-simulator.js — Deep Space & Extreme Orbit Radiation Hardening (TID / SEU / SEL) Simulator
 *
 * First-Principles Radiation Effects & Space Reliability Physics:
 * 1. Total Ionizing Dose (TID) Oxide Hole Trapping & Threshold Shift:
 *    \Delta V_{th}(TID) = A_{tid} \cdot \left(\frac{TID}{100\,\text{krad(Si)}}\right)^{\alpha_{tid}}
 *    Floating-Gate eFlash: Rapid tunneling oxide leakage via radiation-induced leakage current (RILC).
 *    AntiFuse Filament: Zero charge dependence; \Delta R_{filament} < 0.1\% up to > 1 Mrad(Si).
 * 2. Heavy-Ion Single Event Upset (SEU) Weibull Cross-Section:
 *    \sigma(LET) = \sigma_0 \cdot \left[1 - \exp\left(-\left(\frac{LET - LET_{th}}{W}\right)^s\right)\right] \quad (LET > LET_{th})
 * 3. Orbit Mission Reliability & Cumulative Weibull Survival:
 *    R_{mission}(t) = \exp\left(-\left(\frac{TID_{accum}(t)}{TID_{char}}\right)^{\beta_{tid}}\right) \cdot \exp(-\lambda_{seu} \cdot t)
 * 4. Single Event Latchup (SEL) Immunity:
 *    Linear Energy Transfer threshold for latchup triggering (LET_{sel} > 75\,\text{MeV}\cdot\text{cm}^2/\text{mg}).
 *
 * Author: NVM Knowledge Hub Editorial Board
 * Standards: NASA GSFC-HDBK-0005, ESA ECSS-E-ST-10-12C, JEDEC JESD57, IEEE Transactions on Nuclear Science (TNS)
 */

/**
 * Aerospace and deep space orbit mission presets.
 */
export const SPACE_MISSION_PRESETS = Object.freeze({
  leo_polar_orbit: {
    id: "leo_polar_orbit",
    nameZh: "近地極軌道 LEO (800 km / 傾角 98° / 太陽同步)",
    nameEn: "LEO Polar Orbit (800 km / 98° Inclination / Sun-Sync)",
    orbitType: "Low Earth Orbit (LEO)",
    nominalTidKrad: 25.0,
    missionYears: 5.0,
    peakLetMev: 28.0,
    heavyIonFluxFactor: 1.2,
    selScreeningReqMev: 60.0,
  },
  geo_telecom_sat: {
    id: "geo_telecom_sat",
    nameZh: "地球同步軌道 GEO (35,786 km / 靜止通訊衛星 15 年)",
    nameEn: "GEO Telecom Sat (35,786 km / Geostationary 15-Year)",
    orbitType: "Geostationary Earth Orbit (GEO)",
    nominalTidKrad: 100.0,
    missionYears: 15.0,
    peakLetMev: 45.0,
    heavyIonFluxFactor: 3.5,
    selScreeningReqMev: 75.0,
  },
  lunar_deep_space_artemis: {
    id: "lunar_deep_space_artemis",
    nameZh: "阿提米絲月球深空 Gateway / 月表探測 (無地磁屏蔽 10 年)",
    nameEn: "Artemis Lunar Deep Space Gateway / Surface (Unshielded 10-Yr)",
    orbitType: "Cislunar / Lunar Surface Deep Space",
    nominalTidKrad: 150.0,
    missionYears: 10.0,
    peakLetMev: 65.0,
    heavyIonFluxFactor: 6.8,
    selScreeningReqMev: 75.0,
  },
  jupiter_europa_clipper: {
    id: "jupiter_europa_clipper",
    nameZh: "木星歐羅巴木衛二強輻射帶 Europa Clipper (1 Mrad 極限深空)",
    nameEn: "Jupiter Europa Radiation Belt (1 Mrad Extreme Jovian)",
    orbitType: "Jovian Magnetosphere Extreme Radiation",
    nominalTidKrad: 1000.0,
    missionYears: 3.5,
    peakLetMev: 85.0,
    heavyIonFluxFactor: 24.0,
    selScreeningReqMev: 85.0,
  },
});

/**
 * Rad-hard memory technology profiles.
 */
export const RAD_HARD_TECH_PROFILES = Object.freeze({
  antifuse_rad_hard: {
    id: "antifuse_rad_hard",
    nameZh: "AntiFuse 物理重構微絲 (無電荷儲存 / 天然無 SEU / SEL 免疫)",
    nameEn: "AntiFuse Rad-Hard Filament (Charge-Free / Zero SEU / SEL Immune)",
    technologyClass: "Dielectric Hard-Breakdown Ohmic Filament",
    tidToleranceKrad: 1200.0, // Withstands >1.2 Mrad(Si)
    tidAlpha: 0.05,           // Minimal parameter shift
    letThresholdMev: 100.0,   // Heavy ions cannot disrupt a metallic filament
    weibullSigma0Cm2: 1e-12,  // Virtually 0
    weibullW: 30.0,
    weibullS: 2.0,
    selImmunityMev: 120.0,    // Full latchup immunity
    retentionLossTidPct: 0.1,
  },
  rad_hard_stt_mram: {
    id: "rad_hard_stt_mram",
    nameZh: "航太硬化 STT-MRAM (自旋穿隧金屬接面 / 高 TID / 低 SEU)",
    nameEn: "Aerospace Rad-Hard STT-MRAM (Spintronic MTJ / High TID)",
    technologyClass: "Perpendicular Spin-Transfer Torque MTJ",
    tidToleranceKrad: 500.0,
    tidAlpha: 0.45,
    letThresholdMev: 38.0,
    weibullSigma0Cm2: 4.5e-8,
    weibullW: 24.0,
    weibullS: 1.8,
    selImmunityMev: 80.0,
    retentionLossTidPct: 2.5,
  },
  sonos_charge_trap: {
    id: "sonos_charge_trap",
    nameZh: "氮化矽電荷陷阱 SONOS (局域缺陷陷阱 / 中等 TID 容限)",
    nameEn: "Silicon-Oxide-Nitride SONOS (Charge Trap / Moderate TID)",
    technologyClass: "Si3N4 Charge-Trapping Dielectric",
    tidToleranceKrad: 200.0,
    tidAlpha: 1.25,
    letThresholdMev: 14.0,
    weibullSigma0Cm2: 2.2e-6,
    weibullW: 18.0,
    weibullS: 1.5,
    selImmunityMev: 65.0,
    retentionLossTidPct: 18.0,
  },
  legacy_fg_eflash: {
    id: "legacy_fg_eflash",
    nameZh: "傳統浮閘 eFlash (氧化層微穿隧漏電 / 嚴重 TID 漂移 / 高 SEU)",
    nameEn: "Legacy Floating-Gate eFlash (RILC Leakage / Severe TID / High SEU)",
    technologyClass: "Polysilicon Floating-Gate Tunnel Oxide",
    tidToleranceKrad: 40.0,
    tidAlpha: 2.10,
    letThresholdMev: 3.8,
    weibullSigma0Cm2: 8.5e-5,
    weibullW: 12.0,
    weibullS: 1.3,
    selImmunityMev: 45.0,
    retentionLossTidPct: 65.0,
  },
});

/**
 * Calculates radiation tolerance and space mission survival metrics.
 *
 * @param {Object} params
 * @param {string} params.missionKey
 * @param {string} params.techKey
 * @param {number} [params.customTidKrad]
 * @param {number} [params.customLetMev]
 * @returns {Object} Calculated metrics
 */
export function calculateSpaceRadiationHardening({
  missionKey = "geo_telecom_sat",
  techKey = "antifuse_rad_hard",
  customTidKrad,
  customLetMev,
}) {
  const mission = SPACE_MISSION_PRESETS[missionKey] || SPACE_MISSION_PRESETS.geo_telecom_sat;
  const tech = RAD_HARD_TECH_PROFILES[techKey] || RAD_HARD_TECH_PROFILES.antifuse_rad_hard;

  const tidKrad = customTidKrad !== undefined ? customTidKrad : mission.nominalTidKrad;
  const letMev = customLetMev !== undefined ? customLetMev : mission.peakLetMev;

  // 1. TID Threshold Voltage & Retention Degradation
  const tidRatio = tidKrad / Math.max(tech.tidToleranceKrad, 1.0);
  const deltaVthShiftVolts = (0.05 + 1.8 * Math.pow(tidKrad / 100.0, tech.tidAlpha)) * (tech.id === "antifuse_rad_hard" ? 0.002 : 1.0);

  // 2. Heavy-Ion Weibull Cross Section \sigma(LET) [cm^2/bit]
  let crossSectionCm2 = 0;
  if (letMev > tech.letThresholdMev) {
    const diff = (letMev - tech.letThresholdMev) / tech.weibullW;
    crossSectionCm2 = tech.weibullSigma0Cm2 * (1.0 - Math.exp(-Math.pow(diff, tech.weibullS)));
  } else {
    crossSectionCm2 = 1e-15; // Below threshold
  }

  // 3. Single Event Upset (SEU) Rate per megabit-day (SER)
  // Formula: SER = crossSection * orbitFlux * factor
  const seuRatePerMbDay = crossSectionCm2 * (1e6) * mission.heavyIonFluxFactor * 1.5e3;

  // 4. Cumulative 10-Year Mission Survival Probability R(t)
  // TID survival modeled via Weibull CDF: S_tid = exp(-(tid / tid_tol)^beta)
  const betaTid = 3.5;
  const sTid = Math.exp(-Math.pow(tidKrad / tech.tidToleranceKrad, betaTid));

  // SEU upset-free bit probability over mission
  const missionDays = mission.missionYears * 365.25;
  const totalBitFlipsPerMb = seuRatePerMbDay * missionDays;
  const sSeu = Math.exp(-Math.min(25.0, totalBitFlipsPerMb / 100.0));

  const totalMissionSurvivalPct = Math.max(0.01, Math.min(99.99, sTid * sSeu * 100.0));

  // 5. SEL (Single Event Latchup) Latchup Risk
  const isSelImmune = tech.selImmunityMev >= mission.selScreeningReqMev;

  // 6. Aerospace Hardening Grade Classification
  let radGradeZh = "";
  let radGradeEn = "";
  let isRadHardPassed = false;

  if (tech.id === "antifuse_rad_hard") {
    radGradeZh = "航太特級 (Class S / Space Extreme · 深空與木星探測首選)";
    radGradeEn = "Class S / Space Extreme (NASA / ESA Deep Space Qualified)";
    isRadHardPassed = true;
  } else if (tech.id === "rad_hard_stt_mram") {
    if (tidKrad <= 500.0) {
      radGradeZh = "宇航戰術級 (Class B+ / GEO & LEO · 具備自旋防護)";
      radGradeEn = "Class B+ / GEO & LEO (Aerospace Rad-Hard Verified)";
      isRadHardPassed = true;
    } else {
      radGradeZh = "降額使用 (Exceeds TID Margin · 需厚度鎢防護罩)";
      radGradeEn = "Derated (Exceeds TID Margin · Heavy Shielding Required)";
      isRadHardPassed = false;
    }
  } else if (tech.id === "sonos_charge_trap") {
    if (tidKrad <= 150.0) {
      radGradeZh = "低軌商業航太級 (NewSpace LEO Constellation · 需強 ECC)";
      radGradeEn = "NewSpace LEO Constellation (Commercial Space / Strong ECC)";
      isRadHardPassed = true;
    } else {
      radGradeZh = "高風險超標 (Radiation Dose Too High · 電荷洩漏嚴重)";
      radGradeEn = "High Risk Exceeded (Severe Charge Leakage)";
      isRadHardPassed = false;
    }
  } else {
    // Legacy eFlash
    radGradeZh = "航太不建議 (Ground / Industrial Only · 嚴禁深空航行任務)";
    radGradeEn = "Terrestrial Only (Unfit for Deep Space / Severe RILC Failure)";
    isRadHardPassed = false;
  }

  return {
    missionKey,
    techKey,
    tidKrad: Number(tidKrad.toFixed(1)),
    letMev: Number(letMev.toFixed(1)),
    deltaVthShiftVolts: Number(deltaVthShiftVolts.toFixed(3)),
    crossSectionFormatted: crossSectionCm2 <= 1e-14 ? "< 10⁻¹⁴" : crossSectionCm2.toExponential(2),
    seuRatePerMbDay: Number(seuRatePerMbDay.toExponential(2)),
    totalMissionSurvivalPct: Number(totalMissionSurvivalPct.toFixed(2)),
    isSelImmune,
    radGradeZh,
    radGradeEn,
    isRadHardPassed,
    missionNameZh: mission.nameZh,
    missionNameEn: mission.nameEn,
    techNameZh: tech.nameZh,
    techNameEn: tech.nameEn,
    missionYears: mission.missionYears,
  };
}

/**
 * Draws the Space Radiation Hardening simulation canvas (High-DPI responsive).
 *
 * @param {HTMLCanvasElement} canvas
 * @param {Object} metrics
 * @param {"tid_survival"|"weibull_cross_section"} mode
 */
export function drawSpaceRadiationCanvas(canvas, metrics, mode = "tid_survival") {
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

  ctx.save();
  ctx.scale(dpr, dpr);

  const w = width;
  const h = height;

  // Background
  ctx.fillStyle = "#060d17";
  ctx.fillRect(0, 0, w, h);

  // Subtle grid
  ctx.strokeStyle = "rgba(30, 41, 59, 0.7)";
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

  if (mode === "tid_survival") {
    // Mode A: Total Ionizing Dose (0 to 1000 krad) vs Survival Probability (%)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("Survival (%)", 6, plotY0 + 6);
    ctx.fillText("0 krad", plotX0, plotY1 + 16);
    ctx.fillText("500 krad", plotX0 + plotW * 0.5 - 20, plotY1 + 16);
    ctx.fillText("1000 krad (1 Mrad)", plotX1 - 95, plotY1 + 16);

    ctx.fillText("100%", plotX0 - 32, plotY0 + 4);
    ctx.fillText("50%", plotX0 - 26, plotY0 + plotH * 0.5 + 4);
    ctx.fillText("0%", plotX0 - 20, plotY1 + 4);

    const maxTid = 1000.0;

    const drawTidCurve = (techKey, color, label, isCurrent) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      if (!isCurrent) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);

      const steps = 50;
      for (let i = 0; i <= steps; i++) {
        const tid = (i / steps) * maxTid;
        const sim = calculateSpaceRadiationHardening({
          missionKey: metrics.missionKey,
          techKey,
          customTidKrad: tid,
          customLetMev: metrics.letMev,
        });
        const px = plotX0 + (tid / maxTid) * plotW;
        const py = plotY1 - (sim.totalMissionSurvivalPct / 100.0) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawTidCurve("legacy_fg_eflash", "#ef4444", "Legacy eFlash", metrics.techKey === "legacy_fg_eflash");
    drawTidCurve("sonos_charge_trap", "#f59e0b", "SONOS Trap", metrics.techKey === "sonos_charge_trap");
    drawTidCurve("rad_hard_stt_mram", "#a855f7", "Rad-Hard MRAM", metrics.techKey === "rad_hard_stt_mram");
    drawTidCurve("antifuse_rad_hard", "#10b981", "AntiFuse Filament", metrics.techKey === "antifuse_rad_hard");

    // Current Operating Point Marker
    const currTid = Math.min(maxTid, metrics.tidKrad);
    const currSurv = metrics.totalMissionSurvivalPct;
    const markerX = plotX0 + (currTid / maxTid) * plotW;
    const markerY = plotY1 - (currSurv / 100.0) * plotH;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`TID: ${currTid} krad | Surv: ${currSurv}%`, Math.min(markerX + 8, plotX1 - 140), Math.max(markerY - 8, plotY0 + 12));

  } else {
    // Mode B: Heavy-Ion LET (0 to 80 MeV*cm2/mg) vs Weibull SEU Cross-Section (cm2/bit log scale)
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(plotX0, plotY0);
    ctx.lineTo(plotX0, plotY1);
    ctx.lineTo(plotX1, plotY1);
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "10px 'IBM Plex Mono', monospace";
    ctx.fillText("Log σ (cm²)", 4, plotY0 + 6);
    ctx.fillText("0", plotX0, plotY1 + 16);
    ctx.fillText("40 MeV·cm²/mg", plotX0 + plotW * 0.5 - 35, plotY1 + 16);
    ctx.fillText("80 MeV", plotX1 - 40, plotY1 + 16);

    ctx.fillText("10⁻⁴", plotX0 - 32, plotY0 + 4);
    ctx.fillText("10⁻⁹", plotX0 - 32, plotY0 + plotH * 0.5 + 4);
    ctx.fillText("10⁻¹⁴", plotX0 - 36, plotY1 + 4);

    const maxLet = 80.0;
    // Log scale from -14 to -4 (10 decades)
    const logMin = -14.0;
    const logMax = -4.0;

    const drawWeibullCurve = (techKey, color, label, isCurrent) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = isCurrent ? 3 : 1.5;
      if (!isCurrent) ctx.setLineDash([4, 3]);
      else ctx.setLineDash([]);

      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const letVal = (i / steps) * maxLet;
        const sim = calculateSpaceRadiationHardening({
          missionKey: metrics.missionKey,
          techKey,
          customTidKrad: metrics.tidKrad,
          customLetMev: letVal,
        });
        let cross = 1e-14;
        if (sim.crossSectionFormatted !== "< 10⁻¹⁴") {
          cross = parseFloat(sim.crossSectionFormatted);
        }
        const logCross = Math.max(logMin, Math.min(logMax, Math.log10(Math.max(1e-15, cross))));
        const px = plotX0 + (letVal / maxLet) * plotW;
        const py = plotY1 - ((logCross - logMin) / (logMax - logMin)) * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    drawWeibullCurve("legacy_fg_eflash", "#ef4444", "Legacy eFlash", metrics.techKey === "legacy_fg_eflash");
    drawWeibullCurve("sonos_charge_trap", "#f59e0b", "SONOS Trap", metrics.techKey === "sonos_charge_trap");
    drawWeibullCurve("rad_hard_stt_mram", "#a855f7", "Rad-Hard MRAM", metrics.techKey === "rad_hard_stt_mram");
    drawWeibullCurve("antifuse_rad_hard", "#10b981", "AntiFuse Filament", metrics.techKey === "antifuse_rad_hard");

    // Current LET Operating Point Marker
    const currLet = Math.min(maxLet, metrics.letMev);
    let crossVal = 1e-14;
    if (metrics.crossSectionFormatted !== "< 10⁻¹⁴") {
      crossVal = parseFloat(metrics.crossSectionFormatted);
    }
    const logCurr = Math.max(logMin, Math.min(logMax, Math.log10(Math.max(1e-15, crossVal))));
    const markerX = plotX0 + (currLet / maxLet) * plotW;
    const markerY = plotY1 - ((logCurr - logMin) / (logMax - logMin)) * plotH;

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(markerX, markerY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#10b981";
    ctx.font = "bold 10px 'IBM Plex Mono', monospace";
    ctx.fillText(`LET: ${currLet} | σ: ${metrics.crossSectionFormatted}`, Math.min(markerX + 8, plotX1 - 150), Math.max(markerY - 8, plotY0 + 12));
  }

  ctx.restore();
}

/**
 * Initializes the Space Radiation Hardening Simulator UI.
 *
 * @param {HTMLElement} [container]
 */
export function initSpaceRadiationSimulator(container) {
  const root = container || document.getElementById("space-radiation-simulator-root");
  if (!root) return;

  const missionSelect = root.querySelector("#space-rad-mission-select");
  const techSelect = root.querySelector("#space-rad-tech-select");
  const tidSlider = root.querySelector("#space-rad-tid-slider");
  const tidVal = root.querySelector("#space-rad-tid-val");
  const letSlider = root.querySelector("#space-rad-let-slider");
  const letVal = root.querySelector("#space-rad-let-val");

  const outVth = root.querySelector("#space-rad-out-vth");
  const outCross = root.querySelector("#space-rad-out-cross");
  const outSer = root.querySelector("#space-rad-out-ser");
  const outSurv = root.querySelector("#space-rad-out-surv");
  const outSel = root.querySelector("#space-rad-out-sel");
  const outRating = root.querySelector("#space-rad-out-rating");
  const outVerdict = root.querySelector("#space-rad-out-verdict");

  const canvas = root.querySelector("#space-rad-canvas");
  const btnTid = root.querySelector("#space-rad-mode-tid");
  const btnWeibull = root.querySelector("#space-rad-mode-weibull");

  let currentMode = "tid_survival";

  // Populate Mission Options if empty
  if (missionSelect && missionSelect.options.length === 0) {
    Object.values(SPACE_MISSION_PRESETS).forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.nameEn}`;
      missionSelect.appendChild(opt);
    });
    missionSelect.value = "geo_telecom_sat";
  }

  // Populate Tech Options if empty
  if (techSelect && techSelect.options.length === 0) {
    Object.values(RAD_HARD_TECH_PROFILES).forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.nameEn}`;
      techSelect.appendChild(opt);
    });
    techSelect.value = "antifuse_rad_hard";
  }

  function syncMissionToSliders() {
    const mKey = missionSelect ? missionSelect.value : "geo_telecom_sat";
    const m = SPACE_MISSION_PRESETS[mKey] || SPACE_MISSION_PRESETS.geo_telecom_sat;
    if (tidSlider) {
      tidSlider.value = String(m.nominalTidKrad);
    }
    if (letSlider) {
      letSlider.value = String(m.peakLetMev);
    }
  }

  function update() {
    const missionKey = missionSelect ? missionSelect.value : "geo_telecom_sat";
    const techKey = techSelect ? techSelect.value : "antifuse_rad_hard";
    const tidKrad = tidSlider ? Number(tidSlider.value) : 100.0;
    const letMev = letSlider ? Number(letSlider.value) : 45.0;

    if (tidVal) tidVal.textContent = `${tidKrad.toFixed(0)} krad(Si)`;
    if (letVal) letVal.textContent = `${letMev.toFixed(0)} MeV·cm²/mg`;

    const m = calculateSpaceRadiationHardening({
      missionKey,
      techKey,
      customTidKrad: tidKrad,
      customLetMev: letMev,
    });

    if (outVth) outVth.textContent = `Δ${m.deltaVthShiftVolts} V`;
    if (outCross) outCross.textContent = `${m.crossSectionFormatted} cm²`;
    if (outSer) outSer.textContent = `${m.seuRatePerMbDay} /Mb-day`;
    if (outSurv) {
      outSurv.textContent = `${m.totalMissionSurvivalPct}%`;
      outSurv.style.color = m.isRadHardPassed ? "#059669" : "#dc2626";
    }
    if (outSel) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outSel.textContent = m.isSelImmune
        ? (isZh ? "免疫 (SEL Immune)" : "Immune (SEL Safe)")
        : (isZh ? "有觸發風險 (SEL Risk)" : "Risk (Latchup Hazard)");
      outSel.style.color = m.isSelImmune ? "#059669" : "#dc2626";
    }
    if (outRating) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outRating.textContent = isZh ? m.radGradeZh : m.radGradeEn;
      outRating.style.color = m.isRadHardPassed ? "#059669" : "#dc2626";
    }

    if (canvas) {
      drawSpaceRadiationCanvas(canvas, m, currentMode);
    }

    if (outVerdict) {
      const isZh = document.documentElement.lang.startsWith("zh") || document.querySelector("[data-lang='zh'].active") !== null;
      outVerdict.innerHTML = isZh
        ? `<strong>深空輻射物理防護判定：</strong> 在軌道任務 <code>${m.missionNameZh}</code> (${m.missionYears} 年) 暴露於 <code>${m.tidKrad} krad</code> 累積劑量與 <code>${m.letMev} MeV·cm²/mg</code> 重離子峰值下，<code>${m.techNameZh}</code> 的氧化層漂移電壓為 <strong>Δ${m.deltaVthShiftVolts} V</strong>，重離子 SEU 翻轉截面積為 <strong>${m.crossSectionFormatted} cm²/bit</strong>。預估 10 年任務綜合存活率為 <strong>${m.totalMissionSurvivalPct}%</strong>。航太硬化評級：<strong style="color:${m.isRadHardPassed ? '#059669' : '#dc2626'};">${m.radGradeZh}</strong>。AntiFuse 歐姆微絲不依賴電荷陷阱保持位元，天然無重離子放電翻轉機制，是高可靠度航太關鍵載荷的最佳選擇。`
        : `<strong>Space Radiation Hardening Verdict:</strong> Over <code>${m.missionYears} years</code> in <code>${m.missionNameEn}</code> with <code>${m.tidKrad} krad(Si)</code> TID and <code>${m.letMev} MeV·cm²/mg</code> peak heavy-ion LET, the <code>${m.techNameEn}</code> cell incurs an oxide shift of <strong>Δ${m.deltaVthShiftVolts} V</strong> with an SEU cross-section of <strong>${m.crossSectionFormatted} cm²/bit</strong>. Projected 10-year mission survival probability reaches <strong>${m.totalMissionSurvivalPct}%</strong>. Aerospace grade: <strong style="color:${m.isRadHardPassed ? '#059669' : '#dc2626'};">${m.radGradeEn}</strong>. AntiFuse metallic filaments store state without trapped charges, providing intrinsic SEU immunity and total dose resilience for critical space payloads.`;
    }
  }

  if (missionSelect) {
    missionSelect.addEventListener("change", () => {
      syncMissionToSliders();
      update();
    });
  }

  if (techSelect) techSelect.addEventListener("change", update);
  if (tidSlider) tidSlider.addEventListener("input", update);
  if (letSlider) letSlider.addEventListener("input", update);

  if (btnTid) {
    btnTid.addEventListener("click", () => {
      currentMode = "tid_survival";
      btnTid.classList.add("active");
      btnTid.setAttribute("aria-pressed", "true");
      btnTid.style.background = "#0284c7";
      btnTid.style.color = "#ffffff";
      btnTid.style.borderColor = "#38bdf8";
      if (btnWeibull) {
        btnWeibull.classList.remove("active");
        btnWeibull.setAttribute("aria-pressed", "false");
        btnWeibull.style.background = "#1e293b";
        btnWeibull.style.color = "#94a3b8";
        btnWeibull.style.borderColor = "#475569";
      }
      update();
    });
  }

  if (btnWeibull) {
    btnWeibull.addEventListener("click", () => {
      currentMode = "weibull_cross_section";
      btnWeibull.classList.add("active");
      btnWeibull.setAttribute("aria-pressed", "true");
      btnWeibull.style.background = "#0284c7";
      btnWeibull.style.color = "#ffffff";
      btnWeibull.style.borderColor = "#38bdf8";
      if (btnTid) {
        btnTid.classList.remove("active");
        btnTid.setAttribute("aria-pressed", "false");
        btnTid.style.background = "#1e293b";
        btnTid.style.color = "#94a3b8";
        btnTid.style.borderColor = "#475569";
      }
      update();
    });
  }

  window.addEventListener("resize", () => {
    if (canvas) update();
  });

  syncMissionToSliders();
  update();
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => initSpaceRadiationSimulator());
  } else {
    initSpaceRadiationSimulator();
  }
}
