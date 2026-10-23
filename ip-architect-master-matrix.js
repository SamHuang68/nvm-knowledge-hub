/**
 * @fileoverview IP Architect Master Selection Matrix Interactive Controller.
 * Manages view filtering, accessibility keyboard navigation, and responsive table interactions
 * for the comprehensive NVM IP criteria matrix in Section 01C.
 * @module ip-architect-master-matrix
 */

'use strict';

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
 * Class representing the IP Master Matrix Controller.
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
   * Binds keyboard navigation (ArrowLeft, ArrowRight, Home, End) to the radio buttons.
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
