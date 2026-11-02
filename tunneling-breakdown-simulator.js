/**
 * @fileoverview Quantum Tunneling and Dielectric Breakdown Dynamic Simulator.
 * Provides interactive first-principles calculations and canvas rendering for
 * Direct Tunneling, Fowler-Nordheim (FN) Tunneling, and Percolation Breakdown.
 * Complies with Google JavaScript Style Guide and Hub accessibility standards.
 */

'use strict';

import { formatScientificFromLog, NEUTRAL, MATERIAL, CARRIER, CHART } from './visual-tokens.js';

/**
 * Physical constants for Si-SiO2 dielectric interface.
 */
export const SIM_CONSTANTS = Object.freeze({
  BARRIER_HEIGHT_EV: 3.15, // Si-SiO2 conduction band offset (eV)
  B_FN_MV_PER_CM: 250.0,   // FN slope factor (MV/cm) with image-force correction
  A_FN: 1.54e-6,           // Pre-exponential constant A_FN (A/V^2)
  CRITICAL_RETENTION_MV: 4.0,
  CRITICAL_FN_MV: 10.0,
  CRITICAL_BREAKDOWN_MV: 13.0,
});

/**
 * Pure calculation function for Quantum Tunneling and Dielectric Breakdown metrics.
 * @param {Object} params Input parameters {tox, vox}.
 * @return {Object} Evaluated metrics.
 */
export function calculateTunnelingBreakdownMetrics(params = {}) {
  const safeParams = params && typeof params === 'object' ? params : {};
  const tox = Number.isFinite(Number(safeParams.tox)) ? Math.max(0.1, Number(safeParams.tox)) : 2.2;
  const vox = Number.isFinite(Number(safeParams.vox)) ? Math.max(0, Number(safeParams.vox)) : 3.5;

  const eox = vox / (tox * 0.1); // MV/cm

  let logJ = -18;
  let mechanism = 'retention';

  if (vox <= 0.05) {
    logJ = -18;
    mechanism = 'retention';
  } else if (vox < SIM_CONSTANTS.BARRIER_HEIGHT_EV) {
    // 教學模型：梯形能障的廣義 FN 式（WKB 指數項），與下方 FN 分支共用 A_FN、B_FN、Φ_B：
    //   J = A_FN · Eox² · exp(−B_FN · [1 − (1 − Vox/Φ_B)^{3/2}] / Eox)
    // Vox → Φ_B 時括號項 → 1，數值與一階導數皆接續經典 FN，不再於 Φ_B 跳階。
    // 省略梯形能障前置因子修正與反向電流，低偏壓絕對值只作量級示意，未對量測校準。
    // Teaching model: generalized FN expression for a trapezoidal barrier (WKB exponent),
    // reducing continuously to classic FN at Vox = Φ_B; not calibrated to measured data.
    mechanism = 'direct';
    const eoxVcm = eox * 1e6;
    const bfnVcm = SIM_CONSTANTS.B_FN_MV_PER_CM * 1e6;
    const trapezoid = 1 - Math.pow(1 - vox / SIM_CONSTANTS.BARRIER_HEIGHT_EV, 1.5);
    const jDirect = SIM_CONSTANTS.A_FN * Math.pow(eoxVcm, 2) * Math.exp(-bfnVcm * trapezoid / eoxVcm);
    logJ = Math.min(6, Math.max(-18, Math.log10(Math.max(jDirect, 1e-18))));
  } else {
    mechanism = 'fn';
    const eoxVcm = eox * 1e6;
    const bfnVcm = SIM_CONSTANTS.B_FN_MV_PER_CM * 1e6;
    const jFN = SIM_CONSTANTS.A_FN * Math.pow(eoxVcm, 2) * Math.exp(-bfnVcm / eoxVcm);
    logJ = Math.min(6, Math.max(-18, Math.log10(Math.max(jFN, 1e-18))));
  }

  let state = 'safe';
  if (eox >= SIM_CONSTANTS.CRITICAL_BREAKDOWN_MV) {
    state = 'breakdown';
  } else if (eox >= SIM_CONSTANTS.CRITICAL_FN_MV) {
    state = 'injection';
  } else if (eox >= SIM_CONSTANTS.CRITICAL_RETENTION_MV) {
    state = 'stress';
  }

  return {
    tox,
    vox,
    eox,
    logJ,
    mechanism,
    state
  };
}

/**
 * 以科學記號顯示 log10(J)：兩位有效數字的係數與上標指數，例如 1.8 → 6.3×10¹、−8.7 → 2.0×10⁻⁹。
 * 格式由全站共用的 visual-tokens.js 提供，其他模擬器沿用同一個函式。
 * @param {number} logJ log10 of current density.
 * @return {string} Mantissa × power of ten, without unit.
 */
export const formatCurrentDensity = formatScientificFromLog;

/**
 * 能帶圖與剖面用的能障幾何，和電流公式共用同一組 Φ_B、tox、Vox 與機制分界：
 * Si 側能障高 Φ_B，閘極側降為 Φ_B − Vox。Vox < Φ_B 為梯形能障，電子須穿過整個 tox；
 * Vox ≥ Φ_B 為三角形能障，古典轉折點在 x = Φ_B / Eox，之後進入氧化層傳導帶。
 * 兩式在 Vox = Φ_B 相接；未計入影像力降低與 Si 能帶彎曲，只作教學示意。
 * @param {Object} params Input parameters {tox, vox}.
 * @return {Object} {tox, vox, eox, phiB, gateEdgeEv, shape, tunnelNm, mechanism}.
 */
export function tunnelingBarrierGeometry(params = {}) {
  const { tox, vox, eox, mechanism } = calculateTunnelingBreakdownMetrics(params);
  const phiB = SIM_CONSTANTS.BARRIER_HEIGHT_EV;
  const shape = vox < phiB ? 'trapezoid' : 'triangle';
  // Eox 以 MV/cm 表示；× 0.1 換成 V/nm。
  const tunnelNm = shape === 'trapezoid' ? tox : Math.min(tox, phiB / (eox * 0.1));
  return { tox, vox, eox, phiB, gateEdgeEv: phiB - vox, shape, tunnelNm, mechanism };
}

/**
 * Controller for the Quantum Tunneling Simulator.
 */
class TunnelingSimulator {
  /**
   * Initializes simulator bindings and canvas context.
   * @param {string} rootSelector Container selector.
   */
  constructor(rootSelector = '#tunneling-simulator-root') {
    this.root = document.querySelector(rootSelector);
    if (!this.root) return;

    this.canvas = this.root.querySelector('#tunneling-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    // 能帶與剖面（第二張畫布）：和曲線同一組滑桿與模型。
    this.bandCanvas = this.root.querySelector('#tunneling-band-canvas');
    this.bandCtx = this.bandCanvas?.getContext('2d') || null;

    // Controls
    this.toxSlider = this.root.querySelector('#sim-tox-slider');
    this.voxSlider = this.root.querySelector('#sim-vox-slider');
    this.toxValBadge = this.root.querySelector('#sim-tox-val');
    this.voxValBadge = this.root.querySelector('#sim-vox-val');

    // Status elements
    this.eoxDisplay = this.root.querySelector('#sim-eox-val');
    this.mechanismDisplay = this.root.querySelector('#sim-mech-val');
    this.currentDisplay = this.root.querySelector('#sim-current-val');
    this.verdictBanner = this.root.querySelector('#sim-verdict-banner');

    // Preset buttons
    this.presetButtons = this.root.querySelectorAll('.tunneling-preset-btn');

    // State parameters
    this.tox = parseFloat(this.toxSlider?.value || 2.2); // nm
    this.vox = parseFloat(this.voxSlider?.value || 3.5); // V
    this.motionPreference = window.matchMedia?.('(prefers-reduced-motion: reduce)');

    this.bindEvents();
    this.bindAnimationLifecycle();
    this.initCanvasResolution();
    this.update();
  }

  // 轉場只在畫布可見時執行；離開畫面或偏好改變時保留正確的靜態終值。
  canAnimate() {
    const rect = this.canvas.getBoundingClientRect();
    return !document.hidden && !this.motionPreference?.matches && rect.width > 0 && rect.height > 0 &&
      rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth;
  }

  settleAnimation() {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.animFrameId = null;
    const target = this.animationTarget;
    this.animationTarget = null;
    if (!target) return;
    this.tox = target.tox;
    this.vox = target.vox;
    if (this.toxSlider) this.toxSlider.value = this.tox;
    if (this.voxSlider) this.voxSlider.value = this.vox;
    this.update();
  }

  bindAnimationLifecycle() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.settleAnimation();
    });
    this.motionPreference?.addEventListener('change', () => {
      if (this.motionPreference.matches) this.settleAnimation();
    });
    if (typeof IntersectionObserver !== 'undefined') {
      this.viewportObserver = new IntersectionObserver(() => {
        if (!this.canAnimate()) this.settleAnimation();
      });
      this.viewportObserver.observe(this.canvas);
    }
  }

  /**
   * Binds UI events for sliders, presets, and window resize.
   */
  bindEvents() {
    this.toxSlider?.addEventListener('input', (e) => {
      this.tox = parseFloat(e.target.value);
      this.clearActivePreset();
      this.update();
    });

    this.voxSlider?.addEventListener('input', (e) => {
      this.vox = parseFloat(e.target.value);
      this.clearActivePreset();
      this.update();
    });

    this.presetButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        this.applyPreset(preset);
        this.presetButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      });
    });

    window.addEventListener('resize', () => {
      this.initCanvasResolution();
      this.render();
    });

    window.addEventListener('hub:language-change', () => {
      this.updateLabels();
      this.render();
    });

    // Language change observer
    const observer = new MutationObserver(() => {
      this.updateLabels();
      this.render();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'data-site-lang'],
    });
  }

  /**
   * Clears preset button active highlights on manual user interaction.
   */
  clearActivePreset() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.animationTarget = null;
    this.presetButtons.forEach((b) => b.classList.remove('active'));
  }

  /**
   * Smoothly interpolates simulator parameters to target values.
   * Complies with Arc in-place motion and reduced-motion preferences.
   * @param {number} targetTox Target oxide thickness in nm.
   * @param {number} targetVox Target oxide voltage in V.
   * @param {number} duration Animation duration in ms.
   */
  animateTo(targetTox, targetVox, duration = 280) {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.animationTarget = {tox:targetTox, vox:targetVox};
    if (!this.canAnimate()) {
      this.settleAnimation();
      return;
    }

    const startTox = this.tox;
    const startVox = this.vox;
    const startTime = performance.now();

    const step = (now) => {
      if (!this.canAnimate()) {
        this.settleAnimation();
        return;
      }
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic: 1 - (1 - t)^3
      const ease = 1 - Math.pow(1 - progress, 3);

      this.tox = startTox + (targetTox - startTox) * ease;
      this.vox = startVox + (targetVox - startVox) * ease;

      if (this.toxSlider) this.toxSlider.value = this.tox;
      if (this.voxSlider) this.voxSlider.value = this.vox;
      this.update();

      if (progress < 1) {
        this.animFrameId = requestAnimationFrame(step);
      } else {
        this.animFrameId = null;
        this.animationTarget = null;
      }
    };

    this.animFrameId = requestAnimationFrame(step);
  }

  /**
   * Sets preset parameter scenarios with smooth in-place transition.
   * @param {string} preset Identifier.
   */
  applyPreset(preset) {
    let targetTox = 2.0;
    let targetVox = 4.2;

    if (preset === 'retention') {
      targetTox = 3.5;
      targetVox = 1.2;
    } else if (preset === 'injection') {
      targetTox = 2.0;
      targetVox = 4.2;
    } else if (preset === 'breakdown') {
      targetTox = 1.8;
      targetVox = 7.5;
    }

    this.animateTo(targetTox, targetVox);
  }

  /**
   * Adjusts canvas backing store for high-DPI displays.
   */
  initCanvasResolution() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || this.canvas.clientWidth || 480;
    const h = rect.height || this.canvas.clientHeight || 260;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    this.canvas.width = Math.round(w * dpr);
    this.canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.width = w;
    this.height = h;
    if (this.bandCtx) {
      const box = this.bandCanvas.getBoundingClientRect();
      this.bandWidth = box.width || this.bandCanvas.clientWidth || 480;
      this.bandHeight = box.height || this.bandCanvas.clientHeight || 300;
      this.bandCanvas.width = Math.round(this.bandWidth * dpr);
      this.bandCanvas.height = Math.round(this.bandHeight * dpr);
      this.bandCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  /**
   * Calculates electric field Eox in MV/cm.
   * @param {number} vox Volts.
   * @param {number} tox Nanometers.
   * @return {number} Eox in MV/cm.
   */
  calculateEox(vox, tox) {
    return calculateTunnelingBreakdownMetrics({ vox, tox }).eox;
  }

  /**
   * Computes log10 of current density J (A/cm^2).
   * Trapezoidal-barrier generalized FN (V < Phi_B), joining classic FN (V >= Phi_B) continuously.
   * @param {number} v Voltage in Volts.
   * @param {number} t Oxide thickness in nm.
   * @return {number} log10(J).
   */
  calculateLogJ(v, t) {
    return calculateTunnelingBreakdownMetrics({ vox: v, tox: t }).logJ;
  }

  /**
   * Checks whether the current page language is Traditional Chinese.
   * @return {boolean}
   */
  isZh() {
    return document.documentElement.lang.startsWith('zh') ||
           document.documentElement.getAttribute('data-site-lang') === 'zh';
  }

  /**
   * Updates state calculations and text readouts.
   */
  update() {
    if (this.toxValBadge) this.toxValBadge.textContent = `${this.tox.toFixed(1)} nm`;
    if (this.voxValBadge) this.voxValBadge.textContent = `${this.vox.toFixed(1)} V`;

    // 讀值、機制、分區及曲線皆使用同一個既有純函式。
    const { eox, logJ, mechanism, state } = calculateTunnelingBreakdownMetrics({ vox: this.vox, tox: this.tox });

    if (this.eoxDisplay) {
      this.eoxDisplay.textContent = `${eox.toFixed(2)} MV/cm`;
    }

    if (this.currentDisplay) {
      if (logJ <= -14) {
        this.currentDisplay.textContent = '< 10⁻¹⁴ A/cm²';
      } else {
        this.currentDisplay.textContent = `${formatCurrentDensity(logJ)} A/cm²`;
      }
    }

    const isZh = this.isZh();
    let mechText = '';
    let mechDesc = '';
    let alertClass = '';
    let verdictIcon = '';
    let verdictMsg = '';

    if (mechanism === 'retention') {
      mechText = isZh ? '低偏壓電流下限' : 'Low-Bias Current Floor';
      mechDesc = isZh ? '教學模型的低偏壓下限' : 'Low-bias floor of the illustrative model';
    } else if (mechanism === 'direct') {
      mechText = isZh ? '直接穿隧 (Direct Tunneling)' : 'Direct Tunneling';
      mechDesc = isZh ? '梯形能障 · 載子貫穿全厚度' : 'Trapezoidal Barrier · Full-depth Wave Penetration';
    } else {
      mechText = isZh ? 'FN 穿隧 (Fowler–Nordheim)' : 'Fowler–Nordheim Tunneling';
      mechDesc = isZh ? '三角形能障 · 載子穿入傳導帶' : 'Triangular Barrier · Field Emission into Oxide Conduction Band';
    }

    if (this.mechanismDisplay) {
      this.mechanismDisplay.textContent = mechText;
    }

    // 保留公開分區代碼與既有 CSS 映射；門檻僅作教學示意。
    if (state === 'safe') {
      alertClass = 'retention';
      verdictIcon = '🛡️';
      verdictMsg = isZh
        ? '【低電場教學區】電流由簡化穿隧公式估算；此模型未計算溫度、時間與老化，不能據此保證 10 年或高溫留存。請核對具名元件的保持條件與測試證據。'
        : '[Low-Field Model Region] Current uses simplified tunneling equations. Temperature, time and aging are not modeled; this does not establish 10-year or high-temperature retention. Check named-device retention conditions and test evidence.';
    } else if (state === 'stress') {
      alertClass = 'tunneling';
      verdictIcon = '⚡';
      verdictMsg = isZh
        ? '【穿隧應力教學區】本分區依電場門檻示意應力；直接或 FN 穿隧機制另依偏壓判定。EEPROM、MTP 與 eFlash 的實際寫入／抹除條件須核對具名製程與脈衝規格。'
        : '[Tunneling-Stress Model Region] Field thresholds indicate model stress; bias separately determines direct or FN transport. Actual EEPROM, MTP and eFlash program/erase conditions require named-process and pulse specifications.';
    } else if (state === 'injection') {
      alertClass = 'soft-breakdown';
      verdictIcon = '⚠️';
      verdictMsg = isZh
        ? '【軟擊穿風險教學區】此門檻用於介紹軟擊穿、應力誘發漏電 (SILC) 與隨機電報雜訊；模型未計算缺陷累積，實際是否發生須依氧化層、應力時間與量測判定。'
        : '[Soft-Breakdown Risk Model Region] This threshold introduces soft breakdown, SILC and random telegraph noise. Defect accumulation is not modeled; actual behavior requires oxide, stress-duration and measurement evidence.';
    } else {
      alertClass = 'hard-breakdown';
      verdictIcon = '💥';
      verdictMsg = isZh
        ? '【硬擊穿風險教學區】電場達到模型示意門檻；此模型未計算熱失控、導電微絲材料或永久寫入結果，不能據此判定 AntiFuse 已成功寫入。'
        : '[Hard-Breakdown Risk Model Region] The field reaches an illustrative threshold. Thermal runaway, filament material and permanent programming are not modeled; this does not establish successful AntiFuse programming.';
    }

    if (this.verdictBanner) {
      this.verdictBanner.className = `verdict-banner verdict-${alertClass}`;
      this.verdictBanner.innerHTML = `<span class="verdict-icon">${verdictIcon}</span><span>${verdictMsg}</span>`;
    }

    if (this.bandCanvas) {
      const g = tunnelingBarrierGeometry({ vox: this.vox, tox: this.tox });
      const width = g.tunnelNm.toFixed(1);
      this.bandCanvas.setAttribute('aria-label', isZh
        ? `能帶與剖面：${g.shape === 'trapezoid' ? `梯形能障，電子穿過整個 ${width} nm 氧化層` : `三角形能障，電子穿過 ${width} nm 後進入氧化層傳導帶`}；Φ_B 3.15 eV，qV_ox ${g.vox.toFixed(1)} eV。`
        : `Band diagram and cross-section: ${g.shape === 'trapezoid' ? `trapezoidal barrier; electrons cross the full ${width} nm oxide` : `triangular barrier; electrons cross ${width} nm, then enter the oxide conduction band`}; Φ_B 3.15 eV, qV_ox ${g.vox.toFixed(1)} eV.`);
    }

    this.render();
  }

  /**
   * Updates localized labels if needed.
   */
  updateLabels() {
    this.update();
  }

  /**
   * Renders the interactive canvas plot.
   */
  render() {
    if (!this.ctx || !this.width || !this.height) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Margins
    const padL = 60;
    const padR = 30;
    const padT = 30;
    const padB = 45;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;

    // Coordinate mapping
    const vMin = 0.0;
    const vMax = 10.0;
    const logJMin = -16.0;
    const logJMax = 4.0;

    const toX = (v) => padL + ((v - vMin) / (vMax - vMin)) * plotW;
    const toY = (logJ) => padT + ((logJMax - logJ) / (logJMax - logJMin)) * plotH;

    // Clear background - Surgical Light Mode
    ctx.clearRect(0, 0, w, h);
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(1, '#f1f5f9');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    // Draw background region shading
    const vBreakdown = SIM_CONSTANTS.CRITICAL_BREAKDOWN_MV * (this.tox * 0.1);
    const xBreakdown = toX(Math.min(vMax, vBreakdown));

    if (xBreakdown < padL + plotW) {
      const grad = ctx.createLinearGradient(xBreakdown, 0, padL + plotW, 0);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.05)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0.20)');
      ctx.fillStyle = grad;
      ctx.fillRect(xBreakdown, padT, padL + plotW - xBreakdown, plotH);
    }

    // Grid lines & labels
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Horizontal grid (log J)
    ctx.fillStyle = '#475569';
    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let logJ = logJMin; logJ <= logJMax; logJ += 4) {
      const y = toY(logJ);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillText(`${logJ}`, padL - 8, y);
    }

    // Vertical grid (Voltage)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let v = 0; v <= vMax; v += 2) {
      const x = toX(v);
      ctx.beginPath();
      ctx.moveTo(x, padT);
      ctx.lineTo(x, padT + plotH);
      ctx.stroke();
      ctx.fillText(`${v}V`, x, padT + plotH + 8);
    }

    ctx.setLineDash([]); // Reset dash

    // Crossover transition line (Phi_B = 3.15V)
    const phiB = SIM_CONSTANTS.BARRIER_HEIGHT_EV;
    if (phiB >= vMin && phiB <= vMax) {
      const xPhi = toX(phiB);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xPhi, padT);
      ctx.lineTo(xPhi, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#0284c7';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Φ_B = 3.15V (Direct → FN)', xPhi + 4, padT + 8);
    }

    // Plot J-V curve for current tox
    ctx.beginPath();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;

    const steps = 150;
    for (let i = 0; i <= steps; i++) {
      const v = vMin + (i / steps) * (vMax - vMin);
      const logJ = this.calculateLogJ(v, this.tox);
      const x = toX(v);
      const y = toY(logJ);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Plot operating point
    const curX = toX(this.vox);
    const curLogJ = this.calculateLogJ(this.vox, this.tox);
    const curY = toY(curLogJ);

    // Glow effect
    const radGrad = ctx.createRadialGradient(curX, curY, 2, curX, curY, 14);
    radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
    radGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
    radGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = radGrad;
    ctx.beginPath();
    ctx.arc(curX, curY, 14, 0, Math.PI * 2);
    ctx.fill();

    // Solid center dot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(curX, curY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Operating point label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = curX > w - 120 ? 'right' : 'left';
    ctx.textBaseline = curY < padT + 40 ? 'bottom' : 'top';
    const offsetX = curX > w - 120 ? -10 : 10;
    const offsetY = curY < padT + 40 ? -8 : 8;
    ctx.fillText(`(${this.vox.toFixed(1)}V, ${formatCurrentDensity(curLogJ)})`, curX + offsetX, curY + offsetY);

    // Axis titles
    ctx.fillStyle = '#475569';
    ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      this.isZh() ? '跨氧化層偏壓 Vox (V)' : 'Oxide Voltage Vox (V)',
      padL + plotW / 2,
      h - 8
    );

    ctx.save();
    ctx.translate(16, padT + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(
      this.isZh() ? '穿隧電流密度 log₁₀(J) [A/cm²]' : 'Current Density log₁₀(J) [A/cm²]',
      0,
      0
    );
    ctx.restore();
    this.renderBand();
  }

  /**
   * 能帶圖（上）與剖面（下）共用同一條 x 軸：Si｜SiO₂（寬度與 tox 成正比）｜閘極。
   * 能量軸固定（Si 傳導帶為 0 eV），滑桿改變時只看到能障傾斜與厚度變化。
   */
  renderBand() {
    const ctx = this.bandCtx;
    if (!ctx || !this.bandWidth || !this.bandHeight) return;
    const w = this.bandWidth;
    const h = this.bandHeight;
    const zh = this.isZh();
    const g = tunnelingBarrierGeometry({ vox: this.vox, tox: this.tox });
    // 窄版（手機）只留形狀、Φ_B、qV_ox 與剖面標示；完整說明在 aria-label 與下方註記。
    const compact = w < 480;
    const label = (text, x, y, color = CHART.text, align = 'left', weight = '600') => {
      ctx.fillStyle = color;
      ctx.font = `${weight} ${compact ? 11 : 12}px "Plus Jakarta Sans", "Microsoft JhengHei", sans-serif`;
      ctx.textAlign = align;
      ctx.fillText(text, x, y);
    };

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = CHART.background;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = CHART.frame;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    // x 版位：滑桿上限 6 nm 的氧化層佔繪圖寬度 46%。
    const padX = 16;
    const plotW = w - padX * 2;
    const oxL = padX + plotW * 0.27;
    const oxW = plotW * 0.46 * (g.tox / 6);
    const oxR = oxL + oxW;
    const right = padX + plotW;
    const xAtNm = (nm) => oxL + oxW * (nm / g.tox);

    // 剖面條在下，能帶圖在上。
    const stripH = Math.max(24, h * 0.12);
    const stripY = h - stripH - 26;
    const bandTop = compact ? 36 : 46;
    const bandBottom = stripY - 26;
    const eMax = g.phiB + 0.6;
    const eMin = -10.5;
    const toY = (e) => bandTop + ((eMax - e) / (eMax - eMin)) * (bandBottom - bandTop);
    const y0 = toY(0);
    const yPhi = toY(g.phiB);
    const yEdge = toY(g.gateEdgeEv);
    const yGate = toY(-g.vox);

    // 標題列：能障形狀與穿隧距離（同一個模型輸出）。
    const width = g.tunnelNm.toFixed(1);
    const title = compact
      ? (g.shape === 'trapezoid' ? (zh ? '梯形能障：直接穿隧' : 'Trapezoid: direct tunneling') : (zh ? '三角形能障：FN 穿隧' : 'Triangle: FN tunneling'))
      : g.shape === 'trapezoid'
        ? (zh ? `梯形能障：電子直接穿過整個 ${width} nm` : `Trapezoidal barrier: electrons cross the full ${width} nm`)
        : (zh ? `三角形能障：穿過 ${width} nm 後進入氧化層傳導帶（FN）` : `Triangular barrier: ${width} nm, then the oxide conduction band (FN)`);
    label(title, padX, compact ? 20 : 22, CHART.text, 'left', '700');

    // 區域底色。
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = MATERIAL.silicon;
    ctx.fillRect(padX, bandTop, oxL - padX, bandBottom - bandTop);
    ctx.fillStyle = MATERIAL.oxide;
    ctx.fillRect(oxL, bandTop, oxW, bandBottom - bandTop);
    ctx.fillStyle = MATERIAL.metal;
    ctx.fillRect(oxR, bandTop, right - oxR, bandBottom - bandTop);
    ctx.globalAlpha = 1;

    // 穿隧區：電子能量 0 eV 與能障之間、電子必須穿過的禁區。
    const turnX = xAtNm(g.tunnelNm);
    const turnY = g.shape === 'trapezoid' ? toY(g.phiB - g.vox) : y0;
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = CARRIER.electron;
    ctx.beginPath();
    ctx.moveTo(oxL, y0);
    ctx.lineTo(oxL, yPhi);
    ctx.lineTo(turnX, turnY);
    ctx.lineTo(turnX, y0);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // 能帶：Si 傳導帶 → 能障 Φ_B → 傾斜 qV_ox → 閘極費米能階。
    ctx.strokeStyle = NEUTRAL.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padX, y0);
    ctx.lineTo(oxL, y0);
    ctx.lineTo(oxL, yPhi);
    ctx.lineTo(oxR, yEdge);
    ctx.lineTo(oxR, yGate);
    ctx.lineTo(right, yGate);
    ctx.stroke();

    // 0 eV 參考虛線延伸到閘極側，標出 qV_ox。
    ctx.strokeStyle = CHART.axis;
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(oxL, y0);
    ctx.lineTo(right, y0);
    ctx.stroke();
    ctx.setLineDash([]);
    const dimX = right - 14;
    ctx.strokeStyle = CARRIER.field;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dimX, y0);
    ctx.lineTo(dimX, yGate);
    ctx.stroke();
    // 窄版的能量軸較短，qV_ox 改標在 0 eV 線上方，避免壓到閘極能階線。
    label(compact ? `qV_ox ${g.vox.toFixed(1)}` : `qV_ox ${g.vox.toFixed(1)} eV`, dimX - 6, compact ? y0 - 6 : Math.max(y0 + 16, (y0 + yGate) / 2), CARRIER.field, 'right');
    label(compact ? 'Φ_B' : `Φ_B ${g.phiB.toFixed(2)} eV`, oxL - 6, yPhi + 4, NEUTRAL.ink, 'right');
    if (!compact) {
      label(zh ? 'Si 傳導帶' : 'Si E_C', padX + 4, y0 - 8, NEUTRAL.muted);
      // 閘極 E_F 標在閘極區左側、能階線下方，避開右側的 qV_ox 標示。
      label(zh ? '閘極 E_F' : 'Gate E_F', oxR + 8, yGate + 16, NEUTRAL.muted, 'left');
    }

    // 電子路徑：穿隧段實線；FN 之後沿氧化層傳導帶漂移到閘極（虛線）。
    ctx.strokeStyle = CARRIER.electron;
    ctx.fillStyle = CARRIER.electron;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(oxL - 22, y0);
    ctx.lineTo(turnX, y0);
    ctx.stroke();
    if (g.shape === 'triangle') {
      // 進入氧化層傳導帶後沿能障斜線漂移，在閘極界面離開氧化層。
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(turnX, y0 - 4);
      ctx.lineTo(oxR, yEdge - 4);
      ctx.lineTo(oxR + 18, yEdge - 4);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.beginPath();
    ctx.arc(oxL - 26, y0, 5, 0, Math.PI * 2);
    ctx.fill();

    // 剖面條：同一條 x 軸。
    const strip = (x, width, color, text) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, stripY, width, stripH);
      ctx.strokeStyle = NEUTRAL.ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, stripY + 0.5, width - 1, stripH - 1);
      if (text && width > 34) label(text, x + width / 2, stripY + stripH / 2 + 4, NEUTRAL.ink, 'center');
    };
    strip(padX, oxL - padX, MATERIAL.silicon, 'Si');
    strip(oxL, oxW, MATERIAL.oxide, 'SiO₂');
    strip(oxR, right - oxR, MATERIAL.metal, zh ? '閘極' : 'Gate');
    // 穿隧距離標在剖面條下方，與上方禁區同寬。
    ctx.strokeStyle = CARRIER.electron;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(oxL, stripY + stripH + 6);
    ctx.lineTo(turnX, stripY + stripH + 6);
    ctx.stroke();
    label(zh ? `t_ox ${g.tox.toFixed(1)} nm · 穿隧 ${width} nm` : `t_ox ${g.tox.toFixed(1)} nm · tunnel ${width} nm`, oxL, stripY + stripH + 20, CARRIER.electron, 'left');
  }
}

// Auto-initialize when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new TunnelingSimulator();
    });
  } else {
    new TunnelingSimulator();
  }
}
