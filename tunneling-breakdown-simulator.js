/**
 * @fileoverview Quantum Tunneling and Dielectric Breakdown Dynamic Simulator.
 * Provides interactive first-principles calculations and canvas rendering for
 * Direct Tunneling, Fowler-Nordheim (FN) Tunneling, and Percolation Breakdown.
 * Complies with Google JavaScript Style Guide and Hub accessibility standards.
 */

'use strict';

/**
 * Physical constants for Si-SiO2 dielectric interface.
 */
const SIM_CONSTANTS = {
  BARRIER_HEIGHT_EV: 3.15, // Si-SiO2 conduction band offset (eV)
  B_FN_MV_PER_CM: 250.0,   // FN slope factor (MV/cm) with image-force correction
  A_FN: 1.54e-6,           // Pre-exponential constant A_FN (A/V^2)
  CRITICAL_RETENTION_MV: 4.0,
  CRITICAL_FN_MV: 10.0,
  CRITICAL_BREAKDOWN_MV: 13.0,
};

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

    this.bindEvents();
    this.initCanvasResolution();
    this.update();
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
        this.presetButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    window.addEventListener('resize', () => {
      this.initCanvasResolution();
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

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      this.tox = targetTox;
      this.vox = targetVox;
      if (this.toxSlider) this.toxSlider.value = this.tox;
      if (this.voxSlider) this.voxSlider.value = this.vox;
      this.update();
      return;
    }

    const startTox = this.tox;
    const startVox = this.vox;
    const startTime = performance.now();

    const step = (now) => {
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
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;
  }

  /**
   * Calculates electric field Eox in MV/cm.
   * @param {number} vox Volts.
   * @param {number} tox Nanometers.
   * @return {number} Eox in MV/cm.
   */
  calculateEox(vox, tox) {
    // E = V / (t_ox * 1e-7 cm) => V / (t_ox * 10^-7) * 1e-6 = V / (t_ox * 0.1) MV/cm
    return vox / (tox * 0.1);
  }

  /**
   * Computes log10 of current density J (A/cm^2).
   * Incorporates Direct Tunneling (V < Phi_B) and Fowler-Nordheim (V >= Phi_B).
   * @param {number} v Voltage in Volts.
   * @param {number} t Oxide thickness in nm.
   * @return {number} log10(J).
   */
  calculateLogJ(v, t) {
    if (v <= 0.05) return -18; // Thermal noise floor
    const eox = this.calculateEox(v, t); // MV/cm
    const phiB = SIM_CONSTANTS.BARRIER_HEIGHT_EV;

    if (v < phiB) {
      // Direct Tunneling regime (trapezoidal barrier, Simmons/WKB approx)
      // J_DT ~ exp(-alpha * t_ox * sqrt(Phi_B - V/2))
      const alpha = 1.025; // Constant for Si-SiO2
      const barrierEff = Math.max(0.1, phiB - v * 0.5);
      const exponent = -alpha * (t * 10) * Math.sqrt(barrierEff);
      const jDirect = 1e3 * Math.pow(v / t, 2) * Math.exp(exponent);
      const val = Math.log10(Math.max(jDirect, 1e-18));
      return Math.min(6, Math.max(-18, val));
    } else {
      // Fowler-Nordheim Tunneling regime (triangular barrier)
      // J_FN = A_FN * E_ox^2 * exp(-B_FN / E_ox)
      const eoxVcm = eox * 1e6;
      const bfnVcm = SIM_CONSTANTS.B_FN_MV_PER_CM * 1e6;
      const jFN = SIM_CONSTANTS.A_FN * Math.pow(eoxVcm, 2) * Math.exp(-bfnVcm / eoxVcm);
      const val = Math.log10(Math.max(jFN, 1e-18));
      return Math.min(6, Math.max(-18, val));
    }
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

    const eox = this.calculateEox(this.vox, this.tox);
    const logJ = this.calculateLogJ(this.vox, this.tox);

    if (this.eoxDisplay) {
      this.eoxDisplay.textContent = `${eox.toFixed(2)} MV/cm`;
    }

    if (this.currentDisplay) {
      if (logJ <= -14) {
        this.currentDisplay.textContent = '< 10⁻¹⁴ A/cm²';
      } else {
        this.currentDisplay.textContent = `10^(${logJ.toFixed(1)}) A/cm²`;
      }
    }

    const isZh = this.isZh();
    let mechText = '';
    let mechDesc = '';
    let alertClass = '';
    let verdictIcon = '';
    let verdictMsg = '';

    const phiB = SIM_CONSTANTS.BARRIER_HEIGHT_EV;
    if (this.vox < phiB) {
      mechText = isZh ? '直接穿隧 (Direct Tunneling)' : 'Direct Tunneling';
      mechDesc = isZh ? '梯形能障 · 載子貫穿全厚度' : 'Trapezoidal Barrier · Full-depth Wave Penetration';
    } else {
      mechText = isZh ? 'FN 穿隧 (Fowler–Nordheim)' : 'Fowler–Nordheim Tunneling';
      mechDesc = isZh ? '三角形能障 · 載子穿入傳導帶' : 'Triangular Barrier · Field Emission into Oxide Conduction Band';
    }

    if (this.mechanismDisplay) {
      this.mechanismDisplay.textContent = mechText;
    }

    // Determine breakdown / reliability verdict
    if (eox < SIM_CONSTANTS.CRITICAL_RETENTION_MV) {
      alertClass = 'retention';
      verdictIcon = '🛡️';
      verdictMsg = isZh
        ? '【安全留存區】電場微弱，穿隧漏電在雜訊底限之下。電荷於浮閘或電荷陷阱中可保證 > 10 年高溫留存。'
        : '[Safe Retention] Oxide field is subdued; leakage remains suppressed below noise floor. >10-year retention guaranteed.';
    } else if (eox < SIM_CONSTANTS.CRITICAL_FN_MV) {
      alertClass = 'tunneling';
      verdictIcon = '⚡';
      verdictMsg = isZh
        ? '【受控穿隧寫入區】高電場誘發足量 FN 穿隧電子流，適用於 EEPROM、MTP 與 eFlash 之編程／抹除電荷傳輸。'
        : '[Controlled Tunneling] Moderate FN field induces carrier injection suitable for EEPROM, MTP and eFlash program/erase.';
    } else if (eox < SIM_CONSTANTS.CRITICAL_BREAKDOWN_MV) {
      alertClass = 'soft-breakdown';
      verdictIcon = '⚠️';
      verdictMsg = isZh
        ? '【前兆滲透缺陷區 (Soft Breakdown)】氧化層中性陷阱密度累積達滲透臨界，引發應力誘發漏電 (SILC) 與隨機電報雜訊。'
        : '[Soft Breakdown Warning] Neutral trap density approaches percolation threshold, causing SILC and Random Telegraph Noise.';
    } else {
      alertClass = 'hard-breakdown';
      verdictIcon = '💥';
      verdictMsg = isZh
        ? '【介電層硬擊穿熔接 (AntiFuse Filamentation)】局部熱失控破壞晶格，矽原子再結晶熔合成永久導電微絲，完成不可逆硬編程！'
        : '[Dielectric Hard Breakdown] Thermal runaway recrystallizes silicon conductive filament, completing permanent AntiFuse write!';
    }

    if (this.verdictBanner) {
      this.verdictBanner.className = `verdict-banner verdict-${alertClass}`;
      this.verdictBanner.innerHTML = `<span class="verdict-icon">${verdictIcon}</span><span>${verdictMsg}</span>`;
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

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Draw background region shading
    const vBreakdown = SIM_CONSTANTS.CRITICAL_BREAKDOWN_MV * (this.tox * 0.1);
    const xBreakdown = toX(Math.min(vMax, vBreakdown));

    if (xBreakdown < padL + plotW) {
      const grad = ctx.createLinearGradient(xBreakdown, 0, padL + plotW, 0);
      grad.addColorStop(0, 'rgba(239, 68, 68, 0.05)');
      grad.addColorStop(1, 'rgba(239, 68, 68, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(xBreakdown, padT, padL + plotW - xBreakdown, plotH);
    }

    // Grid lines & labels
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    // Horizontal grid (log J)
    ctx.fillStyle = '#94a3b8';
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
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xPhi, padT);
      ctx.lineTo(xPhi, padT + plotH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Φ_B = 3.15V (Direct → FN)', xPhi + 4, padT + 8);
    }

    // Plot J-V curve for current tox
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
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
    radGrad.addColorStop(0, 'rgba(239, 68, 68, 0.9)');
    radGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
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
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Operating point label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = curX > w - 120 ? 'right' : 'left';
    ctx.textBaseline = curY < padT + 40 ? 'bottom' : 'top';
    const offsetX = curX > w - 120 ? -10 : 10;
    const offsetY = curY < padT + 40 ? -8 : 8;
    ctx.fillText(`(${this.vox.toFixed(1)}V, 10^${curLogJ.toFixed(1)})`, curX + offsetX, curY + offsetY);

    // Axis titles
    ctx.fillStyle = '#cbd5e1';
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
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TunnelingSimulator();
  });
} else {
  new TunnelingSimulator();
}
