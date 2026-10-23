/**
 * @fileoverview IP Architect Master Selection Matrix & Quantitative Workbench Controller.
 * Manages view filtering, accessibility keyboard navigation, and the three interactive
 * calculators (Macro Overhead, ATE Test Time/Cost, and Arrhenius AEC-Q100 Extrapolator).
 * @module ip-architect-master-matrix
 */

'use strict';

import { calculateMacroOverhead } from './ip-architect-macro-overhead-calculator.js';
import { calculateAteTestCost } from './ip-architect-ate-test-cost-calculator.js';
import { calculateArrheniusRetention } from './ip-architect-arrhenius-auto-extrapolator.js';

/**
 * Mapping of filter views to their constituent technology identifiers.
 * @type {Record<string, readonly string[]>}
 */
const VIEW_TECH_MAP = Object.freeze({
  all: Object.freeze([
    'efuse', 'maskrom', 'antifuse', 'fgotp', 'ldmtp', 'hdmtp',
    'sst', 'sonos', 'mram', 'reram', 'feram'
  ]),
  zeromask: Object.freeze([
    'efuse', 'maskrom', 'antifuse', 'fgotp', 'ldmtp', 'hdmtp'
  ]),
  embedded_flash: Object.freeze([
    'sst', 'sonos', 'mram', 'reram', 'feram'
  ]),
  security_focus: Object.freeze([
    'antifuse', 'efuse', 'maskrom', 'fgotp', 'mram'
  ]),
  auto_focus: Object.freeze([
    'antifuse', 'sst', 'mram', 'sonos', 'feram'
  ])
});

/**
 * Capacity steps mapping for slider (index to Kb).
 * @type {readonly number[]}
 */
const CAPACITY_STEPS_KB = Object.freeze([
  1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
]);

/**
 * Class representing the IP Master Matrix & Workbench Controller.
 */
export class IpMasterMatrixController {
  /**
   * Initializes the controller by locating DOM elements and binding events.
   * @param {string} rootSelector - The selector for the root section element.
   */
  constructor(rootSelector = '#sec-ip-comparison-master') {
    /** @type {HTMLElement|null} */
    this.root = document.querySelector(rootSelector);
    if (!this.root) {
      return;
    }

    /** @type {HTMLTableElement|null} */
    this.table = this.root.querySelector('#ipMasterTable');
    /** @type {NodeListOf<HTMLButtonElement>} */
    this.filterButtons = this.root.querySelectorAll('.ip-filter-pill');
    /** @type {string} */
    this.currentView = 'all';

    this.init();
    this.initWorkbenchCalculators();
  }

  /**
   * Sets up event listeners and initial accessibility state.
   * @returns {void}
   */
  init() {
    if (!this.table || this.filterButtons.length === 0) {
      return;
    }

    this.bindFilterEvents();
    this.bindKeyboardNavigation();
    this.bindTableHeaderInteraction();
  }

  /**
   * Binds click handlers to the filter buttons.
   * @returns {void}
   */
  bindFilterEvents() {
    this.filterButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = /** @type {HTMLButtonElement} */ (e.currentTarget);
        const viewId = target.getAttribute('data-ip-view');
        if (viewId && viewId !== this.currentView) {
          this.setView(viewId);
        }
      });
    });
  }

  /**
   * Binds keyboard navigation to radio filter buttons.
   * @returns {void}
   */
  bindKeyboardNavigation() {
    const buttons = Array.from(this.filterButtons);

    buttons.forEach((btn, index) => {
      btn.addEventListener('keydown', (e) => {
        let newIndex = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          newIndex = (index + 1) % buttons.length;
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          newIndex = (index - 1 + buttons.length) % buttons.length;
        } else if (e.key === 'Home') {
          e.preventDefault();
          newIndex = 0;
        } else if (e.key === 'End') {
          e.preventDefault();
          newIndex = buttons.length - 1;
        }

        if (newIndex >= 0) {
          const targetBtn = buttons[newIndex];
          targetBtn.focus();
          const viewId = targetBtn.getAttribute('data-ip-view');
          if (viewId) {
            this.setView(viewId);
          }
        }
      });
    });
  }

  /**
   * Binds table header clicks to populate calculators.
   * @returns {void}
   */
  bindTableHeaderInteraction() {
    if (!this.table) return;
    const techHeaders = this.table.querySelectorAll('th[data-tech-id]');
    techHeaders.forEach((th) => {
      th.style.cursor = 'pointer';
      th.title = '點擊在下方工作台試算此技術 (Click to load in Workbench)';
      th.addEventListener('click', () => {
        const techId = th.getAttribute('data-tech-id');
        if (techId) {
          this.syncTechToCalculators(techId);
        }
      });
    });

    // Also bind specific dimension cells to jump directly to corresponding calculator
    const dimRows = this.table.querySelectorAll('tr[data-dim-id]');
    dimRows.forEach((tr) => {
      const dimId = tr.getAttribute('data-dim-id');
      const cells = tr.querySelectorAll('td[data-tech-id]');
      cells.forEach((td) => {
        const techId = td.getAttribute('data-tech-id');
        td.style.cursor = 'pointer';
        td.addEventListener('click', () => {
          if (techId) {
            this.syncTechToCalculators(techId);
            this.scrollToCalculatorForDimension(dimId);
          }
        });
      });
    });
  }

  /**
   * Scrolls smoothly to the most relevant calculator for a given dimension.
   * @param {string|null} dimId - Dimension identifier.
   * @returns {void}
   */
  scrollToCalculatorForDimension(dimId) {
    let targetCardId = 'calcMacroCard';
    if (dimId === 'dim_write_test_cost') {
      targetCardId = 'calcAteCard';
    } else if (dimId === 'dim_retention_temp' || dimId === 'dim_smt_reflow') {
      targetCardId = 'calcArrheniusCard';
    } else if (dimId === 'dim_macro_density' || dimId === 'dim_mask_wafer') {
      targetCardId = 'calcMacroCard';
    }
    const targetCard = document.getElementById(targetCardId);
    if (targetCard) {
      targetCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      targetCard.style.outline = '2px solid #006f70';
      setTimeout(() => {
        targetCard.style.outline = 'none';
      }, 1500);
    }
  }

  /**
   * Syncs a selected technology across all three workbench calculators.
   * @param {string} techId - Technology identifier.
   * @returns {void}
   */
  syncTechToCalculators(techId) {
    const macroSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('macroTechSelect'));
    const ateSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('ateTechSelect'));
    const arrheniusSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('arrheniusTechSelect'));

    if (macroSelect && Array.from(macroSelect.options).some(o => o.value === techId)) {
      macroSelect.value = techId;
      macroSelect.dispatchEvent(new Event('change'));
    }
    if (ateSelect && Array.from(ateSelect.options).some(o => o.value === techId)) {
      ateSelect.value = techId;
      ateSelect.dispatchEvent(new Event('change'));
    }
    if (arrheniusSelect && Array.from(arrheniusSelect.options).some(o => o.value === techId)) {
      arrheniusSelect.value = techId;
      arrheniusSelect.dispatchEvent(new Event('change'));
    }
  }

  /**
   * Activates a specific technology view and filters table columns.
   * @param {string} viewId - The identifier of the view to activate.
   * @returns {void}
   */
  setView(viewId) {
    if (!VIEW_TECH_MAP[viewId]) {
      viewId = 'all';
    }

    this.currentView = viewId;
    const allowedTechs = new Set(VIEW_TECH_MAP[viewId]);

    // Update button states
    this.filterButtons.forEach((btn) => {
      const btnView = btn.getAttribute('data-ip-view');
      const isActive = btnView === viewId;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
      btn.tabIndex = isActive ? 0 : -1;
    });

    if (!this.table) {
      return;
    }

    // Filter headers
    const thElements = this.table.querySelectorAll('th[data-tech-id]');
    thElements.forEach((th) => {
      const techId = th.getAttribute('data-tech-id');
      const isVisible = techId ? allowedTechs.has(techId) : true;
      th.classList.toggle('is-col-hidden', !isVisible);
    });

    // Filter body cells
    const tdElements = this.table.querySelectorAll('td[data-tech-id]');
    tdElements.forEach((td) => {
      const techId = td.getAttribute('data-tech-id');
      const isVisible = techId ? allowedTechs.has(techId) : true;
      td.classList.toggle('is-col-hidden', !isVisible);
    });
  }

  /**
   * Initializes the three quantitative workbench calculators.
   * @returns {void}
   */
  initWorkbenchCalculators() {
    this.initMacroCalculator();
    this.initAteCalculator();
    this.initArrheniusCalculator();
  }

  /**
   * Calculator 1: Macro Overhead & Dilution
   * @returns {void}
   */
  initMacroCalculator() {
    const techSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('macroTechSelect'));
    const nodeSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('macroNodeSelect'));
    const capRange = /** @type {HTMLInputElement|null} */ (document.getElementById('macroCapRange'));
    const capDisplay = document.getElementById('macroCapDisplay');

    if (!techSelect || !nodeSelect || !capRange) return;

    const update = () => {
      const rangeIdx = Math.min(Math.max(parseInt(capRange.value, 10), 0), CAPACITY_STEPS_KB.length - 1);
      const capacityKb = CAPACITY_STEPS_KB[rangeIdx] || 64;

      if (capDisplay) {
        capDisplay.textContent = capacityKb >= 1024
          ? `${capacityKb / 1024} Mb`
          : `${capacityKb} Kb`;
      }

      const res = calculateMacroOverhead({
        tech: techSelect.value,
        node: nodeSelect.value,
        capacityKb
      });

      const totalAreaEl = document.getElementById('resMacroTotalArea');
      const dilutionEl = document.getElementById('resMacroDilution');
      const verdictEl = document.getElementById('resMacroVerdict');

      if (totalAreaEl) totalAreaEl.textContent = `${res.macroAreaMm2} mm²`;
      if (dilutionEl) {
        dilutionEl.textContent = `${res.dilutionPercent}%`;
        dilutionEl.className = res.dilutionPercent > 60 ? 'res-val text-amber' : 'res-val text-green';
      }
      if (verdictEl) {
        verdictEl.innerHTML = `<span data-lang="zh">${res.crossoverVerdictZh}</span><span data-lang="en">${res.crossoverVerdictEn}</span>`;
      }
    };

    techSelect.addEventListener('change', update);
    nodeSelect.addEventListener('change', update);
    capRange.addEventListener('input', update);
    update();
  }

  /**
   * Calculator 2: ATE Wafer Test Cost
   * @returns {void}
   */
  initAteCalculator() {
    const techSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('ateTechSelect'));
    const bitsInput = /** @type {HTMLInputElement|null} */ (document.getElementById('ateBitsInput'));
    const sitesSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('ateSitesSelect'));

    if (!techSelect || !bitsInput || !sitesSelect) return;

    const update = () => {
      const bits = parseInt(bitsInput.value, 10) || 4096;
      const sites = parseInt(sitesSelect.value, 10) || 4;

      const res = calculateAteTestCost({
        tech: techSelect.value,
        bitsToProgram: bits,
        gangSites: sites,
        testerHourlyRate: 150,
        volumeMillions: 10
      });

      const timeEl = document.getElementById('resAteTimePerDie');
      const costEl = document.getElementById('resAteVolumeCost');
      const verdictEl = document.getElementById('resAteVerdict');

      if (timeEl) timeEl.textContent = `${res.testTimeSecPerDie} s`;
      if (costEl) costEl.textContent = `$${res.totalVolumeCostUsd.toLocaleString()} USD`;
      if (verdictEl) {
        const savingsFormatted = `$${res.costSavingsUsd.toLocaleString()} USD`;
        verdictEl.innerHTML = `<span data-lang="zh">量產結算：1000 萬顆出貨總測試費為 $${res.totalVolumeCostUsd.toLocaleString()} USD；相較於單站浮閘技術，單脈衝並行燒錄節省了逾 ${savingsFormatted} 的 ATE 測試成本。</span>` +
          `<span data-lang="en">Production Summary: 10M units total test cost is $${res.totalVolumeCostUsd.toLocaleString()} USD; single-pulse gang programming saves over ${savingsFormatted} versus iterative floating gates.</span>`;
      }
    };

    techSelect.addEventListener('change', update);
    bitsInput.addEventListener('input', update);
    sitesSelect.addEventListener('change', update);
    update();
  }

  /**
   * Calculator 3: Arrhenius High-Temp Retention Extrapolator
   * @returns {void}
   */
  initArrheniusCalculator() {
    const techSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('arrheniusTechSelect'));
    const tempSelect = /** @type {HTMLSelectElement|null} */ (document.getElementById('arrheniusTempSelect'));

    if (!techSelect || !tempSelect) return;

    const update = () => {
      const tempC = parseInt(tempSelect.value, 10) || 150;

      const res = calculateArrheniusRetention({
        tech: techSelect.value,
        junctionTempC: tempC
      });

      const afEl = document.getElementById('resArrheniusAf');
      const yrsEl = document.getElementById('resArrheniusYrs');
      const verdictEl = document.getElementById('resArrheniusVerdict');

      if (afEl) afEl.textContent = `${res.accelerationFactor.toExponential(2)}`;
      if (yrsEl) {
        const yrsText = res.projectedRetentionYrs > 30 ? '> 30.0 Years' : `${res.projectedRetentionYrs} Years`;
        yrsEl.textContent = yrsText;
        yrsEl.className = res.projectedRetentionYrs >= 10 ? 'res-val text-green' : 'res-val text-amber';
      }
      if (verdictEl) {
        verdictEl.innerHTML = `<span data-lang="zh">${res.aecGradeVerdictZh}</span><span data-lang="en">${res.aecGradeVerdictEn}</span>`;
      }
    };

    techSelect.addEventListener('change', update);
    tempSelect.addEventListener('change', update);
    update();
  }
}

// Auto-instantiate when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new IpMasterMatrixController();
    });
  } else {
    new IpMasterMatrixController();
  }
}
